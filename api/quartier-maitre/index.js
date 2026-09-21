// Proxy serveur vers le data agent Fabric "Quartier-Maitre", via MCP.
//
// POURQUOI UN JETON ET PAS UNE CLE
// Un data agent Fabric publie n'accepte PAS de cle d'API. Il exige une
// identite utilisateur deleguee (On-Behalf-Of) : l'agent ne voit que ce que
// la personne qui interroge a le droit de voir dans Fabric. C'est sa
// gouvernance, et c'est voulu.
//
// Consequence : ni principal de service, ni identite managee. Le jeton
// utilisateur est depose dans les parametres d'application de la Static Web
// App, cote serveur, et n'est jamais envoye au navigateur.
// Il vit environ une heure : rafraichir-jeton.ps1 le renouvelle.
//
// POURQUOI UN APPEL EN DEUX TEMPS
// Les fonctions managees d'une Static Web App coupent a 45 secondes. Le data
// agent met 60 a 120 secondes sur une question d'analyse : un appel synchrone
// ne peut pas aboutir.
//
// Le client demande donc la reponse en deux temps :
//   1. POST { question }  -> { statut: "en_cours", id }
//   2. POST { id }        -> { statut: "en_cours" } puis { statut: "pret", texte }
//
// Le travail continue dans le processus de la fonction entre les deux appels.
// C'est volontairement un cache en memoire : la demande dure deux minutes, pas
// deux jours, et cela evite d'ajouter une base de donnees a la demonstration.

const JETON = process.env.FABRIC_TOKEN;
const URL_MCP = process.env.FABRIC_MCP_URL;

const DELAI_MS = 180000;
const LONGUEUR_MAX_QUESTION = 500;
const RETENTION_MS = 600000;

/** id -> { statut, texte, creee } */
const demandes = new Map();

function purger() {
  const limite = Date.now() - RETENTION_MS;
  for (const [id, demande] of demandes) {
    if (demande.creee < limite) demandes.delete(id);
  }
}

function lireSse(brut) {
  if (!/^data:/m.test(brut)) return brut;
  return brut
    .split('\n')
    .filter((ligne) => ligne.startsWith('data:'))
    .map((ligne) => ligne.replace(/^data:\s*/, ''))
    .join('');
}

/** Un echange JSON-RPC avec le serveur MCP. */
async function appelMcp(methode, parametres, id, signal) {
  const corps = { jsonrpc: '2.0', method: methode };
  if (parametres) corps.params = parametres;
  if (id !== null && id !== undefined) corps.id = id;

  const reponse = await fetch(URL_MCP, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${JETON}`,
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(corps),
    signal,
  });

  if (!reponse.ok) {
    const detail = await reponse.text();
    const erreur = new Error(`MCP ${reponse.status} : ${detail.slice(0, 300)}`);
    erreur.statut = reponse.status;
    throw erreur;
  }

  const brut = await reponse.text();
  if (!brut.trim()) return null;

  try {
    return JSON.parse(lireSse(brut));
  } catch {
    // Les notifications repondent "Accepted" en texte brut.
    return null;
  }
}

function extraireTexte(resultat) {
  return (resultat?.result?.content ?? [])
    .map((bloc) => bloc.text)
    .filter((texte) => typeof texte === 'string')
    .join('\n')
    .trim();
}

/** Poignee de main MCP complete, puis appel de l'outil. */
async function interroger(question, journal) {
  const minuteur = new AbortController();
  const chrono = setTimeout(() => minuteur.abort(), DELAI_MS);

  try {
    const init = await appelMcp(
      'initialize',
      {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'comptoir-bordure', version: '1.0.0' },
      },
      1,
      minuteur.signal,
    );
    journal.info(`MCP : ${init?.result?.serverInfo?.name ?? 'serveur inconnu'}`);

    await appelMcp('notifications/initialized', null, null, minuteur.signal);

    const outils = await appelMcp('tools/list', {}, 2, minuteur.signal);
    const outil = outils?.result?.tools?.[0];
    if (!outil) throw new Error("Le serveur MCP n'expose aucun outil.");

    // L'argument attendu est decouvert dynamiquement : si l'agent est republie
    // sous un autre nom, l'appel continue de fonctionner.
    const nomArgument =
      Object.keys(outil.inputSchema?.properties ?? {})[0] ?? 'userQuestion';

    const appel = await appelMcp(
      'tools/call',
      { name: outil.name, arguments: { [nomArgument]: question } },
      3,
      minuteur.signal,
    );

    if (appel?.error) throw new Error(appel.error.message);

    return extraireTexte(appel) || "Le quartier-maitre n'a rien trouve sur ce sujet.";
  } finally {
    clearTimeout(chrono);
  }
}

module.exports = async function (context, req) {
  const repondre = (statut, corps) => {
    context.res = {
      status: statut,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: corps,
    };
  };

  if (!JETON || !URL_MCP) {
    context.log.error('FABRIC_TOKEN ou FABRIC_MCP_URL absent des parametres.');
    return repondre(503, {
      statut: 'erreur',
      texte: "Le quartier-maitre n'est pas raccorde. Lancez rafraichir-jeton.ps1.",
      references: [],
    });
  }

  purger();

  // --- deuxieme temps : le client vient chercher sa reponse ---------------
  const idDemande = typeof req.body?.id === 'string' ? req.body.id : '';
  if (idDemande) {
    const demande = demandes.get(idDemande);

    if (!demande) {
      return repondre(404, {
        statut: 'erreur',
        texte: 'Demande introuvable. Reposez la question.',
        references: [],
      });
    }

    if (demande.statut === 'en_cours') {
      return repondre(202, { statut: 'en_cours', id: idDemande });
    }

    demandes.delete(idDemande);

    if (demande.statut === 'echec') {
      return repondre(demande.jetonPerime ? 503 : 502, {
        statut: 'erreur',
        texte: demande.texte,
        references: [],
      });
    }

    return repondre(200, {
      statut: 'pret',
      texte: demande.texte,
      references: [],
      source: 'Quartier-Maitre',
    });
  }

  // --- premier temps : on lance le travail --------------------------------
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question) {
    return repondre(400, { statut: 'erreur', texte: 'Posez une question.', references: [] });
  }
  if (question.length > LONGUEUR_MAX_QUESTION) {
    return repondre(400, {
      statut: 'erreur',
      texte: `Question trop longue (${LONGUEUR_MAX_QUESTION} caracteres maximum).`,
      references: [],
    });
  }

  const id = `qm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const demande = { statut: 'en_cours', texte: '', creee: Date.now() };
  demandes.set(id, demande);

  // Volontairement sans await : la reponse HTTP part tout de suite, le travail
  // se poursuit dans le processus.
  interroger(question, context.log)
    .then((texte) => {
      demande.statut = 'pret';
      demande.texte = texte;
    })
    .catch((erreur) => {
      const expire = erreur.name === 'AbortError';
      const jetonPerime = erreur.statut === 401 || erreur.statut === 403;

      context.log.error(`Appel MCP en echec : ${erreur.message}`);

      demande.statut = 'echec';
      demande.jetonPerime = jetonPerime;
      demande.texte = jetonPerime
        ? "Le jeton d'acces a Fabric a expire. Relancez rafraichir-jeton.ps1."
        : expire
          ? 'Le quartier-maitre met trop de temps a repondre. Reposez la question.'
          : 'Le quartier-maitre ne repond pas pour le moment. Reposez la question.';
    });

  return repondre(202, { statut: 'en_cours', id });
};
