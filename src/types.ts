export interface Produit {
  reference: string;
  titre: string;
  rayon: string;
  auteur?: string;
  prix: number;
  stock: number;
  note: number;
  avis: number;
  format: string;
  resume: string;
  etiquettes: string[];
}

export interface Rayon {
  id: string;
  nom: string;
  description: string;
}

export interface Catalogue {
  boutique: {
    nom: string;
    baseline: string;
    enseigne: string;
    devise: string;
    symbole: string;
    livraison_gratuite_des: number;
    bases_desservies: string[];
  };
  rayons: Rayon[];
  produits: Produit[];
  assistant: {
    nom: string;
    role: string;
    accueil: string;
    suggestions: string[];
  };
}

export interface ReponseAssistant {
  texte: string;
  references: string[];
  /** Renseigne quand la reponse vient de l'agent Foundry. */
  version?: string | null;
}

/**
 * Point de branchement de l'assistant.
 *
 * L'interface graphique ne connait que ce contrat : elle ignore si la reponse
 * vient d'une recherche locale dans le catalogue ou d'un agent distant.
 * Changer de source, c'est changer une ligne.
 */
export interface SourceAssistant {
  readonly nom: string;
  readonly aide: string;
  repondre(question: string): Promise<ReponseAssistant>;
}
