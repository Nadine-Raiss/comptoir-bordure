import catalogueJson from '../catalogue.json';
import type { Catalogue, Produit } from './types';
import { horizonBordure } from './horizon';
import { illustrationRayon } from './illustrations';
import { CatalogueSourceAssistant, type SourceAssistant } from './assistant';

const catalogue = catalogueJson as Catalogue;

const symbole = catalogue.boutique.symbole;

function formaterPrix(prix: number): string {
  return `${prix.toLocaleString('fr-FR')} ${symbole}`;
}

function etatStock(produit: Produit): { classe: string; texte: string } {
  if (produit.stock === 0) {
    return { classe: 'rupture', texte: 'Rupture de stock' };
  }
  if (produit.stock < 10) {
    return { classe: 'bas', texte: `Stock bas — ${produit.stock} restants` };
  }
  return { classe: 'disponible', texte: 'En stock' };
}

function carteProduit(produit: Produit): HTMLElement {
  const rayon = catalogue.rayons.find((r) => r.id === produit.rayon);
  const etat = etatStock(produit);
  const article = document.createElement('article');
  article.className = 'carte';
  article.dataset.reference = produit.reference;

  article.innerHTML = `
    <div class="carte__vignette">${illustrationRayon(produit.rayon)}</div>
    <div class="carte__corps">
      <p class="carte__rayon">${rayon?.nom ?? produit.rayon}</p>
      <h2 class="carte__titre">${produit.titre}</h2>
      ${produit.auteur ? `<p class="carte__auteur">${produit.auteur}</p>` : ''}
      <p class="carte__resume">${produit.resume}</p>
      <p class="carte__format">${produit.format}</p>
      <div class="carte__meta">
        <span class="carte__note" aria-label="Note ${produit.note} sur 5, ${produit.avis} avis">★ ${produit.note.toFixed(1)} <span class="carte__avis">(${produit.avis})</span></span>
        <span class="carte__etat carte__etat--${etat.classe}" role="status">${etat.texte}</span>
      </div>
      <div class="carte__pied">
        <span class="carte__prix">${formaterPrix(produit.prix)}</span>
        <button type="button" class="carte__bouton" ${produit.stock === 0 ? 'disabled' : ''}>
          ${produit.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
        </button>
      </div>
      <p class="carte__reference">Reference ${produit.reference}</p>
    </div>
  `;
  return article;
}

function creerFiltresRayons(): void {
  const conteneur = document.getElementById('filtres-rayons')!;
  const tous = document.createElement('button');
  tous.type = 'button';
  tous.className = 'filtre-rayon filtre-rayon--actif';
  tous.textContent = 'Tous les rayons';
  tous.dataset.rayon = 'tous';
  conteneur.appendChild(tous);

  for (const rayon of catalogue.rayons) {
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'filtre-rayon';
    bouton.textContent = rayon.nom;
    bouton.title = rayon.description;
    bouton.dataset.rayon = rayon.id;
    conteneur.appendChild(bouton);
  }

  conteneur.addEventListener('click', (evenement) => {
    const cible = evenement.target as HTMLElement;
    if (!cible.matches('.filtre-rayon')) {
      return;
    }
    conteneur.querySelectorAll('.filtre-rayon').forEach((b) => b.classList.remove('filtre-rayon--actif'));
    cible.classList.add('filtre-rayon--actif');
    rayonActif = cible.dataset.rayon ?? 'tous';
    actualiserGrille();
  });
}

let rayonActif = 'tous';

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function actualiserGrille(): void {
  const grille = document.getElementById('grille')!;
  const resultats = document.getElementById('resultats')!;
  const recherche = normaliser((document.getElementById('recherche') as HTMLInputElement).value.trim());
  const tri = (document.getElementById('tri') as HTMLSelectElement).value;

  let produits = catalogue.produits.filter((p) => rayonActif === 'tous' || p.rayon === rayonActif);

  if (recherche) {
    produits = produits.filter((p) => {
      const champ = normaliser([p.titre, p.auteur ?? '', ...p.etiquettes].join(' '));
      return champ.includes(recherche);
    });
  }

  produits = [...produits];
  if (tri === 'prix-asc') {
    produits.sort((a, b) => a.prix - b.prix);
  } else if (tri === 'prix-desc') {
    produits.sort((a, b) => b.prix - a.prix);
  } else if (tri === 'note') {
    produits.sort((a, b) => b.note - a.note);
  }

  grille.innerHTML = '';
  for (const produit of produits) {
    grille.appendChild(carteProduit(produit));
  }

  resultats.textContent =
    produits.length === 0
      ? 'Aucun produit ne correspond a cette recherche.'
      : `${produits.length} produit${produits.length > 1 ? 's' : ''} affiche${produits.length > 1 ? 's' : ''}.`;
}

function initFiltres(): void {
  creerFiltresRayons();
  document.getElementById('recherche')!.addEventListener('input', actualiserGrille);
  document.getElementById('tri')!.addEventListener('change', actualiserGrille);
  actualiserGrille();
}

function initPied(): void {
  document.getElementById('pied-bases')!.textContent =
    `Bases desservies : ${catalogue.boutique.bases_desservies.join(', ')}.`;
  document.getElementById('pied-livraison')!.textContent =
    `Livraison gratuite des ${formaterPrix(catalogue.boutique.livraison_gratuite_des)} d'achat.`;
}

function ajouterMessageJournal(auteur: string, texte: string, produits: Produit[] = []): void {
  const journal = document.getElementById('assistant-journal')!;
  const message = document.createElement('div');
  message.className = `assistant__message assistant__message--${auteur === 'vega' ? 'vega' : 'client'}`;
  const paragraphe = document.createElement('p');
  paragraphe.textContent = texte;
  message.appendChild(paragraphe);

  if (produits.length > 0) {
    const liste = document.createElement('ul');
    liste.className = 'assistant__references';
    for (const produit of produits) {
      const item = document.createElement('li');
      item.textContent = `${produit.titre} — ${formaterPrix(produit.prix)} (${produit.reference})`;
      liste.appendChild(item);
    }
    message.appendChild(liste);
  }

  journal.appendChild(message);
  journal.scrollTop = journal.scrollHeight;
}

function initAssistant(source: SourceAssistant): void {
  document.getElementById('assistant-titre')!.textContent = catalogue.assistant.nom;
  document.querySelector('.assistant__role')!.textContent = catalogue.assistant.role;

  ajouterMessageJournal('vega', catalogue.assistant.accueil);

  const suggestions = document.getElementById('assistant-suggestions')!;
  for (const suggestion of catalogue.assistant.suggestions) {
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'assistant__suggestion';
    bouton.textContent = suggestion;
    bouton.addEventListener('click', () => poserQuestion(source, suggestion));
    suggestions.appendChild(bouton);
  }

  const formulaire = document.getElementById('assistant-formulaire') as HTMLFormElement;
  const saisie = document.getElementById('assistant-saisie') as HTMLInputElement;
  formulaire.addEventListener('submit', (evenement) => {
    evenement.preventDefault();
    const question = saisie.value.trim();
    if (!question) {
      return;
    }
    saisie.value = '';
    poserQuestion(source, question);
  });
}

async function poserQuestion(source: SourceAssistant, question: string): Promise<void> {
  ajouterMessageJournal('client', question);
  const reponse = await source.repondre(question);
  ajouterMessageJournal('vega', reponse.texte, reponse.produits);
}

function initFond(): void {
  document.getElementById('fond')!.innerHTML = horizonBordure();
}

initFond();
initFiltres();
initPied();
initAssistant(new CatalogueSourceAssistant(catalogue));
