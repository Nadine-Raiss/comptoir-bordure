// Proxy serveur vers l'agent Foundry "Expert-Galaxy".
//
// POURQUOI CE FICHIER EXISTE
// Une Static Web App ne sert que des fichiers statiques : tout ce qui part dans
// le navigateur est lisible avec F12, y compris une cle d'API. Une cle posee
// dans le JavaScript du site serait publique, quel que soit l'endroit d'ou on
// la charge.
//
// Cette fonction s'execute cote serveur, chez Azure. Le navigateur appelle
// /api/conseil ; c'est la fonction, et elle seule, qui detient la cle et parle
// a Foundry. La cle n'est jamais envoyee au client.
//
// Elle est lue depuis les parametres d'application de la Static Web App
// (chiffres au repos, invisibles dans le depot) et n'apparait dans aucun
// fichier versionne.

const ENDPOINT = process.env.FOUNDRY_ENDPOINT;
const CLE = process.env.FOUNDRY_KEY;
const VERSION_API = process.env.FOUNDRY_API_VERSION || 'v1';

const DELAI_MS = 60000;
const LONGUEUR_MAX_QUESTION = 500;

// CADRAGE — a ne pas retirer.
//
// L'agent Foundry porte ses propres instructions et l'outil de recherche web
// est actif : sans ce prefixe, une question comme "qui sont les Veilleurs ?"
// renvoie un resultat du monde reel, parfois hors sujet ou sensible.
// L'API refuse le champ "instructions" quand la cible est un agent
// (400 invalid_payload) : le cadre doit donc voyager dans la question.
const CADRE = [
  "[CADRE] Tu es l'archiviste d'un univers de space opera FICTIF : la Bordure,",
  'ses quatre bases (Aurore, Vigie, Cendre, Relais Tessara) et l\'Ordre des',
  'Veilleurs. Reponds uniquement dans cet univers fictif, en inventant de',
  'maniere coherente si tu ne sais pas. N\'utilise pas la recherche web. Ne parle',
  'jamais du monde reel, de politique, de personnes reelles ni d\'oeuvres',
  'existantes. Trois phrases maximum, en francais.',
  '',
  '[QUESTION] ',
].join(' ').replace(' [QUESTION] ', '\n\n[QUESTION] ');

function extraireTexte(charge) {
  const messages = (charge?.output ?? []).filter((bloc) => bloc.type === 'message');
  const morceaux = [];

  for (const message of messages) {
    for (const partie of message.content ?? []) {
      if (typeof partie.text === 'string') morceaux.push(partie.text);
    }
  }

  return morceaux.join('\n').trim();
}

module.exports = async function (context, req) {
  const repondre = (statut, corps) => {
    context.res = {
      status: statut,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: corps,
    };
  };

  if (!ENDPOINT || !CLE) {
    context.log.error('FOUNDRY_ENDPOINT ou FOUNDRY_KEY absent des parametres.');
    return repondre(503, {
      texte: "La borne de conseil n'est pas raccordee. Reessayez plus tard.",
      references: [],
    });
  }

  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';

  if (!question) {
    return repondre(400, { texte: 'Posez une question.', references: [] });
  }

  if (question.length > LONGUEUR_MAX_QUESTION) {
    return repondre(400, {
      texte: `Question trop longue (${LONGUEUR_MAX_QUESTION} caracteres maximum).`,
      references: [],
    });
  }

  const minuteur = new AbortController();
  const chrono = setTimeout(() => minuteur.abort(), DELAI_MS);

  try {
    const reponse = await fetch(`${ENDPOINT}?api-version=${VERSION_API}`, {
      method: 'POST',
      headers: {
        'api-key': CLE,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: CADRE + question }),
      signal: minuteur.signal,
    });

    if (!reponse.ok) {
      // On journalise le detail cote serveur, on ne le renvoie jamais au client :
      // un message d'erreur Azure peut trahir des identifiants de ressource.
      context.log.error(`Foundry a repondu ${reponse.status} : ${await reponse.text()}`);
      return repondre(502, {
        texte: "L'archiviste ne repond pas pour le moment. Reposez la question.",
        references: [],
      });
    }

    const charge = await reponse.json();
    const texte = extraireTexte(charge);

    // Quelle version de l'agent a repondu. L'endpoint route vers @latest :
    // si Philippe publie une nouvelle version, elle prend le relais toute
    // seule. On journalise pour pouvoir le constater le jour J.
    const version = charge?.agent_reference?.version ?? null;
    context.log.info(`Expert-Galaxy version ${version ?? 'inconnue'} a repondu.`);

    if (!texte) {
      return repondre(200, {
        texte: "Je n'ai rien trouve sur ce sujet dans mes archives.",
        references: [],
        version,
      });
    }

    return repondre(200, {
      texte,
      references: [],
      source: 'Expert-Galaxy',
      version,
    });
  } catch (erreur) {
    const expire = erreur.name === 'AbortError';
    context.log.error(`Appel Foundry en echec : ${erreur.message}`);
    return repondre(expire ? 504 : 502, {
      texte: expire
        ? "L'archiviste met trop de temps a repondre. Reposez la question."
        : "L'archiviste ne repond pas pour le moment. Reposez la question.",
      references: [],
    });
  } finally {
    clearTimeout(chrono);
  }
};
