import donnees from '../catalogue.json';
import type { Catalogue, ReponseAssistant, SourceAssistant } from './types';

const catalogue = donnees as Catalogue;

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
 *  Source 2 — Expert Galaxy : l'agent Foundry, via le proxy serveur   *
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
