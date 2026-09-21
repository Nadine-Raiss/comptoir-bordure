import donnees from '../catalogue.json';
import type { Catalogue, Produit } from './types';
import { horizonBordure } from './horizon';
import { avantPoste, borneConseil, vignetteProduit } from './scenes';
import { choisirSource, formaterPrix, repondre, sourceCourante } from './assistant';

const catalogue = donnees as Catalogue;
const SEUIL_STOCK_BAS = 10;

const el = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

/* ------------------------------------------------------------------ *
 *  Decor                                                              *
 * ------------------------------------------------------------------ */

el('fond').innerHTML = horizonBordure();
el('heros-scene').innerHTML = avantPoste();
el('conseil-scene').innerHTML = borneConseil();

/* ------------------------------------------------------------------ *
 *  Textes issus du catalogue                                          *
 * ------------------------------------------------------------------ */

const { boutique, rayons, assistant } = catalogue;

el('enseigne').textContent = boutique.nom;
el('baseline').textContent = boutique.baseline;
el('bases').textContent = `Expedie vers ${boutique.bases_desservies.join(' · ')}`;
el('heros-accroche').textContent = boutique.enseigne;
el('heros-livraison').textContent =
  `Livraison offerte des ${formaterPrix(boutique.livraison_gratuite_des)} vers les quatre bases.`;
el('conseil-intro').textContent =
  `${assistant.nom}, ${assistant.role.toLowerCase()}, consulte l'inventaire en direct. ` +
  `Basculez sur Expert Galaxy pour les questions d'histoire et de lieux.`;
el('pied-nom').textContent = boutique.nom;
el('pied-bases').textContent = boutique.bases_desservies.join(' · ');

/* ------------------------------------------------------------------ *
 *  Catalogue : filtres et grille                                      *
 * ------------------------------------------------------------------ */

let rayonActif = 'tout';
let seulementDispo = false;

const zoneRayons = el('filtres-rayons');
const boutons: Array<[string, string]> = [
  ['tout', 'Tout le comptoir'],
  ...rayons.map((rayon) => [rayon.id, rayon.nom] as [string, string]),
];

zoneRayons.innerHTML = boutons
  .map(
    ([id, nom], index) =>
      `<button type="button" class="pilule${index === 0 ? ' pilule--active' : ''}"
               data-rayon="${id}" aria-pressed="${index === 0}">${nom}</button>`,
  )
  .join('');

zoneRayons.addEventListener('click', (evenement) => {
  const cible = (evenement.target as HTMLElement).closest<HTMLButtonElement>('[data-rayon]');
  if (!cible) return;

  rayonActif = cible.dataset.rayon ?? 'tout';
  zoneRayons.querySelectorAll<HTMLButtonElement>('.pilule').forEach((bouton) => {
    const actif = bouton === cible;
    bouton.classList.toggle('pilule--active', actif);
    bouton.setAttribute('aria-pressed', String(actif));
  });
  dessinerGrille();
});

el<HTMLInputElement>('filtre-dispo').addEventListener('change', (evenement) => {
  seulementDispo = (evenement.target as HTMLInputElement).checked;
  dessinerGrille();
});

function etatStock(produit: Produit): { classe: string; libelle: string } {
  if (produit.stock === 0) return { classe: 'rupture', libelle: 'Rupture au comptoir' };
  if (produit.stock < SEUIL_STOCK_BAS) {
    return { classe: 'bas', libelle: `Dernieres pieces — ${produit.stock}` };
  }
  return { classe: 'ok', libelle: 'Disponible' };
}

function carte(produit: Produit): string {
  const stock = etatStock(produit);
  const rayon = rayons.find((r) => r.id === produit.rayon)?.nom ?? produit.rayon;

  return `
    <article class="fiche fiche--${stock.classe}">
      <div class="fiche__visuel">${vignetteProduit(produit.reference, produit.rayon)}</div>
      <p class="fiche__reference">${produit.reference}</p>
      <h3 class="fiche__titre">${produit.titre}</h3>
      <p class="fiche__meta">${rayon}${produit.auteur ? ` · ${produit.auteur}` : ''}</p>
      <p class="fiche__resume">${produit.resume}</p>
      <p class="fiche__format">${produit.format}</p>
      <p class="fiche__note">
        <span aria-hidden="true">★</span> ${produit.note.toFixed(1)}
        <span class="fiche__avis">${produit.avis} avis</span>
      </p>
      <div class="fiche__bas">
        <span class="fiche__prix">${formaterPrix(produit.prix)}</span>
        <span class="jauge jauge--${stock.classe}">${stock.libelle}</span>
      </div>
      <button type="button" class="fiche__action" ${produit.stock === 0 ? 'disabled' : ''}>
        ${produit.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
      </button>
    </article>`;
}

function dessinerGrille(): void {
  const visibles = catalogue.produits.filter((produit) => {
    if (rayonActif !== 'tout' && produit.rayon !== rayonActif) return false;
    if (seulementDispo && produit.stock === 0) return false;
    return true;
  });

  el('grille').innerHTML = visibles.map(carte).join('');
  el('compteur').textContent =
    visibles.length === catalogue.produits.length
      ? `${visibles.length} references au comptoir`
      : `${visibles.length} reference${visibles.length > 1 ? 's' : ''} affichee${visibles.length > 1 ? 's' : ''}`;
}

dessinerGrille();

/* ------------------------------------------------------------------ *
 *  La borne de conseil                                                *
 * ------------------------------------------------------------------ */

const journal = el('journal');
const champ = el<HTMLInputElement>('question');
const boutonEnvoyer = el<HTMLButtonElement>('envoyer');

function majAide(): void {
  el('borne-aide').textContent = sourceCourante().aide;
}
majAide();

function ajouterMessage(
  texte: string,
  auteur: string,
  options: { progressif?: boolean; note?: string } = {},
): Promise<void> {
  const bloc = document.createElement('div');
  bloc.className = `message message--${auteur === 'Vous' ? 'vous' : 'borne'}`;

  const entete = document.createElement('p');
  entete.className = 'message__auteur';
  entete.textContent = options.note ? `${auteur} · ${options.note}` : auteur;

  const corps = document.createElement('p');
  corps.className = 'message__texte';

  bloc.append(entete, corps);
  journal.append(bloc);
  journal.scrollTop = journal.scrollHeight;

  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!options.progressif || reduit) {
    corps.textContent = texte;
    journal.scrollTop = journal.scrollHeight;
    return Promise.resolve();
  }

  return new Promise((resoudre) => {
    let index = 0;
    const pas = Math.max(1, Math.round(texte.length / 220));
    const minuteur = window.setInterval(() => {
      index += pas;
      corps.textContent = texte.slice(0, index);
      journal.scrollTop = journal.scrollHeight;
      if (index >= texte.length) {
        window.clearInterval(minuteur);
        corps.textContent = texte;
        resoudre();
      }
    }, 14);
  });
}

void ajouterMessage(assistant.accueil, assistant.nom);

el('suggestions').innerHTML = assistant.suggestions
  .map((texte) => `<button type="button" class="suggestion">${texte}</button>`)
  .join('');

el('suggestions').addEventListener('click', (evenement) => {
  const cible = (evenement.target as HTMLElement).closest<HTMLButtonElement>('.suggestion');
  if (!cible) return;
  champ.value = cible.textContent?.trim() ?? '';
  void poser();
});

document.querySelectorAll<HTMLButtonElement>('[data-source]').forEach((bouton) => {
  bouton.addEventListener('click', () => {
    document.querySelectorAll<HTMLButtonElement>('[data-source]').forEach((autre) => {
      const actif = autre === bouton;
      autre.classList.toggle('source--active', actif);
      autre.setAttribute('aria-checked', String(actif));
    });
    const source = choisirSource(bouton.dataset.source ?? 'comptoir');
    majAide();
    void ajouterMessage(`Vous parlez maintenant a : ${source.nom}.`, 'Comptoir');
  });
});

let enCours = false;

async function poser(): Promise<void> {
  const question = champ.value.trim();
  if (!question || enCours) return;

  enCours = true;
  boutonEnvoyer.disabled = true;
  champ.value = '';

  await ajouterMessage(question, 'Vous');

  const source = sourceCourante();
  const attente = document.createElement('p');
  attente.className = 'attente-reponse';
  attente.textContent =
    source.nom === 'Expert Galaxy'
      ? "L'archiviste consulte les archives…"
      : 'Consultation de l\'inventaire…';
  journal.append(attente);
  journal.scrollTop = journal.scrollHeight;

  try {
    const reponse = await repondre(question);
    attente.remove();
    const note = reponse.version ? `version ${reponse.version}` : undefined;
    await ajouterMessage(reponse.texte, source.nom, { progressif: true, note });
  } catch {
    attente.remove();
    await ajouterMessage(
      'La borne ne repond pas pour le moment. Reposez la question.',
      source.nom,
    );
  } finally {
    enCours = false;
    boutonEnvoyer.disabled = false;
    champ.focus();
  }
}

el<HTMLFormElement>('saisie').addEventListener('submit', (evenement) => {
  evenement.preventDefault();
  void poser();
});
