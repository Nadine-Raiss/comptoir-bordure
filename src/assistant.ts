import type { Catalogue, Produit } from './types';

export interface ReponseAssistant {
  texte: string;
  produits: Produit[];
}

// Point de branchement : peut etre remplace par un appel a un agent distant
// sans toucher a l'interface, tant que cette forme est respectee.
export interface SourceAssistant {
  repondre(question: string): Promise<ReponseAssistant>;
}

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formaterListe(produits: Produit[], catalogue: Catalogue): string {
  const symbole = catalogue.boutique.symbole;
  return produits
    .map((p) => `${p.titre} (${p.reference}) — ${p.prix.toLocaleString('fr-FR')} ${symbole}`)
    .join(' · ');
}

// Implementation locale : interroge catalogue.json, ne repond qu'avec des produits reels.
export class CatalogueSourceAssistant implements SourceAssistant {
  constructor(private readonly catalogue: Catalogue) {}

  async repondre(question: string): Promise<ReponseAssistant> {
    const q = normaliser(question);
    const produits = this.catalogue.produits;

    // Rupture de stock
    if (/rupture|epuise|plus de stock/.test(q)) {
      const enRupture = produits.filter((p) => p.stock === 0);
      if (enRupture.length === 0) {
        return { texte: 'Rien n\'est en rupture au comptoir en ce moment.', produits: [] };
      }
      return {
        texte: `En rupture actuellement : ${formaterListe(enRupture, this.catalogue)}.`,
        produits: enRupture,
      };
    }

    // Budget maximum ("moins de X credits")
    const budget = q.match(/moins de (\d+)/);
    if (budget) {
      const plafond = Number(budget[1]);
      const trouves = produits
        .filter((p) => p.prix <= plafond && p.stock > 0)
        .sort((a, b) => b.note - a.note)
        .slice(0, 4);
      if (trouves.length === 0) {
        return {
          texte: `Je ne trouve rien de disponible a moins de ${plafond} credits. Voulez-vous que j'elargisse le budget ?`,
          produits: [],
        };
      }
      return {
        texte: `A moins de ${plafond} credits, je recommande : ${formaterListe(trouves, this.catalogue)}.`,
        produits: trouves,
      };
    }

    // Recherche par rayon
    const rayonTrouve = this.catalogue.rayons.find(
      (r) => q.includes(normaliser(r.nom)) || q.includes(normaliser(r.id))
    );
    if (rayonTrouve) {
      const trouves = produits.filter((p) => p.rayon === rayonTrouve.id).slice(0, 5);
      return {
        texte: `Au rayon ${rayonTrouve.nom} : ${formaterListe(trouves, this.catalogue)}.`,
        produits: trouves,
      };
    }

    // Recherche libre par mots du titre, auteur ou etiquette
    const mots = q.split(/\s+/).filter((m) => m.length > 2);
    const correspondances = produits.filter((p) => {
      const champ = normaliser(
        [p.titre, p.auteur ?? '', ...p.etiquettes].join(' ')
      );
      return mots.some((m) => champ.includes(m));
    });

    if (correspondances.length > 0) {
      const meilleurs = correspondances.slice(0, 4);
      return {
        texte: `Voici ce que j'ai trouve : ${formaterListe(meilleurs, this.catalogue)}.`,
        produits: meilleurs,
      };
    }

    return {
      texte:
        "Je ne trouve rien de precis pour cette recherche dans l'inventaire. Essayez un rayon (ouvrages, armement, reliques, maquettes), un budget, ou un mot du titre.",
      produits: [],
    };
  }
}
