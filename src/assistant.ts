import catalogue from '../catalogue.json';

export interface ProduitAssistant {
  reference: string;
  titre: string;
  rayon: string;
  prix: number;
  stock: number;
  etiquettes: string[];
}

export interface ReponseAssistant {
  texte: string;
  references: string[];
}

export interface SourceAssistant {
  chercher(question: string): Promise<ProduitAssistant[]>;
}

const normaliser = (texte: string): string => texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

class CatalogueLocal implements SourceAssistant {
  async chercher(question: string): Promise<ProduitAssistant[]> {
    const requete = normaliser(question);
    const plafond = requete.match(/(?:moins de|sous|maximum|max)\s*(?:de\s*)?(\d+)/)?.[1];
    const mots = requete.split(/\W+/).filter((mot) => mot.length > 3);

    return catalogue.produits
      .filter((produit) => {
        if (/rupture|indisponible/.test(requete)) return produit.stock === 0;
        if (/stock bas|rare|limitee?/.test(requete)) return produit.stock > 0 && produit.stock < 10;
        if (plafond && produit.prix >= Number(plafond)) return false;
        const contenu = normaliser([produit.titre, produit.rayon, produit.auteur ?? '', produit.format, produit.resume, ...produit.etiquettes].join(' '));
        return mots.length === 0 || mots.some((mot) => contenu.includes(mot));
      })
      .slice(0, 3);
  }
}

let source: SourceAssistant = new CatalogueLocal();

export function definirSourceAssistant(nouvelleSource: SourceAssistant): void {
  source = nouvelleSource;
}

export async function repondre(question: string): Promise<ReponseAssistant> {
  const resultats = await source.chercher(question);
  if (resultats.length === 0) {
    return {
      texte: "Je ne trouve pas de correspondance exacte dans l'inventaire. Essayez un rayon, un budget ou un usage plus large.",
      references: [],
    };
  }

  const disponibles = resultats.filter((produit) => produit.stock > 0);
  const choix = disponibles.length > 0 ? disponibles : resultats;
  const liste = choix.map((produit) => `${produit.titre} (${produit.prix.toLocaleString('fr-FR')} cr)`).join(', ');
  const precision = disponibles.length === 0
    ? " Ces références sont actuellement en rupture."
    : choix.some((produit) => produit.stock < 10) ? " Certaines pièces ont un stock limité." : '';

  return {
    texte: `Je vous conseille ${liste}.${precision}`,
    references: choix.map((produit) => produit.reference),
  };
}