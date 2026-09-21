// Formes des donnees du catalogue. Reflete catalogue.json a l'identique.

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
