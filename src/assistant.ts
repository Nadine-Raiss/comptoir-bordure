import donnees from '../catalogue.json';
import type { Catalogue, Produit, ReponseAssistant, SourceAssistant } from './types';

const catalogue = donnees as Catalogue;
const produits: Produit[] = catalogue.produits;

/* ------------------------------------------------------------------ *
 *  Outils de recherche                                                *
 * ------------------------------------------------------------------ */

const MOTS_VIDES = new Set([
  'a', 'au', 'aux', 'avec', 'dans', 'de', 'des', 'du', 'en', 'est', 'et', 'la',
  'le', 'les', 'moins', 'pour', 'que', 'quel', 'quelle', 'quels', 'quelles',
  'qui', 'quoi', 'sur', 'un', 'une', 'vous', 'conseillez', 'cherche', 'voudrais',
]);

function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function formaterPrix(prix: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(prix)} ${catalogue.boutique.symbole}`;
}

/* ------------------------------------------------------------------ *
 *  Source 1 — le Quartier-Maitre : data agent Fabric, via MCP         *
 * ------------------------------------------------------------------ */

class SourceQuartierMaitre implements SourceAssistant {
  readonly nom = 'Quartier-Maitre';
  readonly aide = 'Ventes, stocks et ruptures — data agent Fabric interroge en MCP';

  /** Le data agent met 60 a 120 s : on demande, puis on revient chercher. */
  async repondre(question: string): Promise<ReponseAssistant> {
    // Aucun jeton, aucune URL Fabric ici : le navigateur ne connait que ce
    // chemin relatif. La fonction managee detient l'identite deleguee.
    const lancement = await fetch('/api/quartier-maitre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const depart = (await lancement.json()) as {
      statut?: string;
      id?: string;
      texte?: string;
    };

    if (depart.statut !== 'en_cours' || !depart.id) {
      return {
        texte: depart.texte ?? "Le quartier-maitre n'a pas repondu.",
        references: [],
      };
    }

    const debut = Date.now();
    const limite = 180000;

    while (Date.now() - debut < limite) {
      await new Promise((attendre) => setTimeout(attendre, 3000));

      const suite = await fetch('/api/quartier-maitre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: depart.id }),
      });

      const charge = (await suite.json()) as {
        statut?: string;
        texte?: string;
        references?: string[];
      };

      if (charge.statut === 'en_cours') continue;

      return {
        texte: charge.texte ?? "Le quartier-maitre n'a pas repondu.",
        references: charge.references ?? [],
      };
    }

    return {
      texte: 'Le quartier-maitre met trop de temps a repondre. Reposez la question.',
      references: [],
    };
  }
}

/* ------------------------------------------------------------------ *
 *  Source 2 — le comptoir : recherche locale dans catalogue.json      *
 * ------------------------------------------------------------------ */

class SourceCatalogueLocale implements SourceAssistant {
  readonly nom = 'Comptoir';
  readonly aide = 'Prix, stock, rayons et ruptures — lu dans catalogue.json';

  async repondre(question: string): Promise<ReponseAssistant> {
    const demande = normaliser(question);

    const plafond = demande.match(/(?:moins de|maximum|max|sous)\s+(\d+)/)?.[1];
    const chercheRupture = /rupture|indisponible|epuise/.test(demande);
    const chercheStockBas = /stock bas|derniere|dernieres|presque/.test(demande);

    const mots = demande
      .split(/[^a-z0-9]+/)
      .filter((mot) => mot.length > 2 && !/^\d+$/.test(mot) && !MOTS_VIDES.has(mot));

    let resultats = produits.filter((produit) => {
      if (plafond && produit.prix >= Number(plafond)) return false;
      if (chercheRupture && produit.stock !== 0) return false;
      if (chercheStockBas && (produit.stock === 0 || produit.stock >= 10)) return false;

      // Quand le filtre porte deja sur un critere chiffre, on n'exige pas
      // en plus une correspondance textuelle.
      if (plafond || chercheRupture || chercheStockBas) {
        const restants = mots.filter(
          (mot) => !['credit', 'credits', 'stock', 'rupture', 'comptoir'].includes(mot),
        );
        if (restants.length === 0) return true;
      }

      const index = normaliser(
        [
          produit.titre,
          produit.rayon,
          produit.auteur ?? '',
          produit.resume,
          produit.format,
          ...produit.etiquettes,
        ].join(' '),
      );
      return mots.some((mot) => index.includes(mot));
    });

    resultats = resultats
      .sort(
        (a, b) =>
          Number(b.stock > 0) - Number(a.stock > 0) || b.note - a.note,
      )
      .slice(0, 3);

    if (resultats.length === 0) {
      return {
        texte:
          "Je ne trouve aucune reference correspondant a cette demande. Essayez un rayon, un budget ou un usage voisin.",
        references: [],
      };
    }

    const lignes = resultats.map((produit) => {
      const dispo =
        produit.stock === 0
          ? 'en rupture au comptoir'
          : produit.stock < 10
            ? `plus que ${produit.stock} en stock`
            : 'disponible';
      return `• ${produit.titre} (${produit.reference}) — ${formaterPrix(produit.prix)}, ${dispo}.`;
    });

    const entete =
      resultats.length === 1
        ? 'Voici la reference la plus proche :'
        : `Voici ${resultats.length} references :`;

    return {
      texte: `${entete}\n${lignes.join('\n')}`,
      references: resultats.map((produit) => produit.reference),
    };
  }
}

/* ------------------------------------------------------------------ *
 *  Source 3 — Expert Galaxy : l'agent Foundry, via le proxy serveur   *
 * ------------------------------------------------------------------ */

class SourceExpertGalaxy implements SourceAssistant {
  readonly nom = 'Expert Galaxy';
  readonly aide = "Histoire, lieux et factions — agent Foundry, cle cote serveur";

  async repondre(question: string): Promise<ReponseAssistant> {
    // Pas de cle, pas de jeton, pas d'URL Foundry : le navigateur ne connait
    // que ce chemin relatif. C'est la fonction managee qui detient le secret.
    const reponse = await fetch('/api/conseil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const charge = (await reponse.json()) as ReponseAssistant;

    return {
      texte: charge.texte ?? "L'archiviste n'a pas repondu.",
      references: charge.references ?? [],
      version: charge.version ?? null,
    };
  }
}

/* ------------------------------------------------------------------ *
 *  Selection de la source                                             *
 * ------------------------------------------------------------------ */

export const SOURCES: Record<string, SourceAssistant> = {
  quartier: new SourceQuartierMaitre(),
  comptoir: new SourceCatalogueLocale(),
  galaxy: new SourceExpertGalaxy(),
};

let sourceActive: SourceAssistant = SOURCES.quartier;

export function choisirSource(cle: string): SourceAssistant {
  sourceActive = SOURCES[cle] ?? SOURCES.quartier;
  return sourceActive;
}

export function sourceCourante(): SourceAssistant {
  return sourceActive;
}

export function repondre(question: string): Promise<ReponseAssistant> {
  return sourceActive.repondre(question);
}
