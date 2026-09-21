import catalogue from '../catalogue.json';
import { repondre } from './assistant';
import { horizonBordure } from './horizon';
import { illustrationProduit } from './illustrations';

type Produit = (typeof catalogue.produits)[number];

const etat = {
	rayon: 'tous',
	recherche: '',
	panier: 0,
};

const application = document.querySelector<HTMLElement>('#app');
if (!application) throw new Error("Le conteneur de l'application est introuvable.");

const formatPrix = (prix: number): string => `${prix.toLocaleString('fr-FR')} cr`;
const nomRayon = (identifiant: string): string => catalogue.rayons.find((rayon) => rayon.id === identifiant)?.nom ?? identifiant;

application.innerHTML = `
	<div class="scene" aria-hidden="true">${horizonBordure()}</div>
	<header class="entete">
		<a class="marque" href="#catalogue" aria-label="Comptoir de la Bordure, accueil">
			<span class="marque__sceau" aria-hidden="true">CB</span>
			<span><strong>${catalogue.boutique.nom}</strong><small>${catalogue.boutique.enseigne}</small></span>
		</a>
		<nav class="navigation" aria-label="Navigation principale">
			<a href="#catalogue">Catalogue</a>
			<a href="#vega">Conseil</a>
			<button class="panier" type="button" aria-label="Voir le panier">Panier <span id="compteur-panier">0</span></button>
		</nav>
	</header>

	<main>
		<section class="accroche" aria-labelledby="titre-principal">
			<div class="accroche__contenu">
				<p class="sur-titre">Approvisionnement des mondes éloignés</p>
				<h1 id="titre-principal">L’équipement juste.<br><em>Au bout de la route.</em></h1>
				<p class="accroche__texte">Ouvrages de bord, pièces de terrain et objets de mémoire. Chaque référence est contrôlée au comptoir de Tessara.</p>
				<a class="action-principale" href="#catalogue">Parcourir l’inventaire <span aria-hidden="true">↓</span></a>
			</div>
			<dl class="accroche__reperes">
				<div><dt>Références</dt><dd>${catalogue.produits.length}</dd></div>
				<div><dt>Bases desservies</dt><dd>${catalogue.boutique.bases_desservies.length}</dd></div>
				<div><dt>Franco de port</dt><dd>${formatPrix(catalogue.boutique.livraison_gratuite_des)}</dd></div>
			</dl>
		</section>

		<section class="comptoir" id="catalogue" aria-labelledby="titre-catalogue">
			<div class="catalogue">
				<div class="section-titre">
					<div><p class="sur-titre">Inventaire en direct</p><h2 id="titre-catalogue">Le catalogue</h2></div>
					<label class="recherche"><span>Rechercher</span><input id="recherche" type="search" placeholder="Titre, usage, référence…" autocomplete="off"></label>
				</div>
				<div class="filtres" role="group" aria-label="Filtrer par rayon">
					<button class="filtre est-actif" type="button" data-rayon="tous">Tout voir</button>
					${catalogue.rayons.map((rayon) => `<button class="filtre" type="button" data-rayon="${rayon.id}">${rayon.nom}</button>`).join('')}
				</div>
				<p class="resultats" id="resultats" role="status" aria-live="polite"></p>
				<div class="grille-produits" id="grille-produits"></div>
			</div>

			<aside class="assistant" id="vega" aria-labelledby="titre-assistant">
				<div class="assistant__entete">
					<span class="assistant__signal" aria-hidden="true"></span>
					<div><p class="sur-titre">Liaison active</p><h2 id="titre-assistant">${catalogue.assistant.nom}</h2><p>${catalogue.assistant.role}</p></div>
				</div>
				<div class="conversation" id="conversation" role="log" aria-live="polite" aria-relevant="additions">
					<div class="message message--assistant"><span>V</span><p>${catalogue.assistant.accueil}</p></div>
				</div>
				<div class="suggestions" aria-label="Questions suggérées">
					${catalogue.assistant.suggestions.slice(0, 3).map((suggestion) => `<button type="button" data-suggestion="${suggestion}">${suggestion}</button>`).join('')}
				</div>
				<form class="formulaire-assistant" id="formulaire-assistant">
					<label for="question">Votre demande</label>
					<div><input id="question" name="question" type="text" required placeholder="Ex. Un cadeau sous 100 cr"><button type="submit" aria-label="Envoyer la demande">Envoyer</button></div>
				</form>
			</aside>
		</section>
	</main>

	<footer><span>${catalogue.boutique.nom}</span><span>Relais Tessara · Inventaire synchronisé</span></footer>
`;

function carteProduit(produit: Produit): string {
	const rupture = produit.stock === 0;
	const stockBas = produit.stock > 0 && produit.stock < 10;
	const etatStock = rupture ? 'Rupture' : stockBas ? `${produit.stock} en stock` : 'Disponible';
	return `
		<article class="produit ${rupture ? 'produit--rupture' : ''}">
			<div class="produit__visuel">
				<span class="produit__reference">${produit.reference}</span>
				${illustrationProduit(produit.rayon, produit.titre)}
				<span class="produit__stock ${rupture ? 'est-rupture' : stockBas ? 'est-bas' : ''}">${etatStock}</span>
			</div>
			<div class="produit__corps">
				<p class="produit__rayon">${nomRayon(produit.rayon)}</p>
				<h3>${produit.titre}</h3>
				<p class="produit__format">${produit.format}</p>
				<div class="produit__bas"><strong>${formatPrix(produit.prix)}</strong><button type="button" data-ajouter="${produit.reference}" ${rupture ? 'disabled' : ''}>${rupture ? 'Indisponible' : 'Ajouter'}</button></div>
			</div>
		</article>`;
}

function afficherProduits(): void {
	const termes = etat.recherche.toLowerCase().trim();
	const produits = catalogue.produits.filter((produit) => {
		const correspondRayon = etat.rayon === 'tous' || produit.rayon === etat.rayon;
		const contenu = [produit.titre, produit.reference, produit.resume, produit.auteur ?? '', ...produit.etiquettes].join(' ').toLowerCase();
		return correspondRayon && contenu.includes(termes);
	});
	const grille = document.querySelector<HTMLElement>('#grille-produits');
	const resultats = document.querySelector<HTMLElement>('#resultats');
	if (!grille || !resultats) return;
	grille.innerHTML = produits.length ? produits.map(carteProduit).join('') : '<p class="aucun-resultat">Aucune référence ne correspond. Essayez un autre rayon.</p>';
	resultats.textContent = `${produits.length} référence${produits.length > 1 ? 's' : ''} affichée${produits.length > 1 ? 's' : ''}`;
}

document.querySelectorAll<HTMLButtonElement>('[data-rayon]').forEach((bouton) => bouton.addEventListener('click', () => {
	etat.rayon = bouton.dataset.rayon ?? 'tous';
	document.querySelectorAll('[data-rayon]').forEach((element) => element.classList.toggle('est-actif', element === bouton));
	afficherProduits();
}));

document.querySelector<HTMLInputElement>('#recherche')?.addEventListener('input', (evenement) => {
	etat.recherche = (evenement.currentTarget as HTMLInputElement).value;
	afficherProduits();
});

document.querySelector('#grille-produits')?.addEventListener('click', (evenement) => {
	const bouton = (evenement.target as HTMLElement).closest<HTMLButtonElement>('[data-ajouter]');
	if (!bouton) return;
	etat.panier += 1;
	const compteur = document.querySelector('#compteur-panier');
	if (compteur) compteur.textContent = String(etat.panier);
	bouton.textContent = 'Ajouté';
	window.setTimeout(() => { bouton.textContent = 'Ajouter'; }, 900);
});

async function envoyerQuestion(question: string): Promise<void> {
	const conversation = document.querySelector<HTMLElement>('#conversation');
	if (!conversation) return;
	conversation.insertAdjacentHTML('beforeend', `<div class="message message--client"><p>${echapper(question)}</p></div>`);
	const attente = document.createElement('div');
	attente.className = 'message message--assistant message--attente';
	attente.innerHTML = '<span>V</span><p>Consultation de l’inventaire…</p>';
	conversation.append(attente);
	conversation.scrollTop = conversation.scrollHeight;
	const reponse = await repondre(question);
	attente.remove();
	const message = document.createElement('div');
	message.className = 'message message--assistant';
	message.innerHTML = `<span>V</span><p></p>`;
	conversation.append(message);
	const texte = `${reponse.texte}${reponse.references.length ? ` Réf. ${reponse.references.join(' · ')}` : ''}`;
	const cible = message.querySelector('p');
	for (const mot of texte.split(' ')) {
		if (cible) cible.textContent += `${mot} `;
		await new Promise((resoudre) => window.setTimeout(resoudre, 22));
	}
	conversation.scrollTop = conversation.scrollHeight;
}

document.querySelector<HTMLFormElement>('#formulaire-assistant')?.addEventListener('submit', (evenement) => {
	evenement.preventDefault();
	const champ = document.querySelector<HTMLInputElement>('#question');
	if (!champ?.value.trim()) return;
	const question = champ.value.trim();
	champ.value = '';
	void envoyerQuestion(question);
});

document.querySelectorAll<HTMLButtonElement>('[data-suggestion]').forEach((bouton) => bouton.addEventListener('click', () => {
	void envoyerQuestion(bouton.dataset.suggestion ?? '');
}));

function echapper(texte: string): string {
	return texte.replace(/[&<>"']/g, (caractere) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[caractere] ?? caractere);
}

afficherProduits();
