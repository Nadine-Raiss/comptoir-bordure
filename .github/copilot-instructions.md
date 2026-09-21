# Instructions Copilot — Comptoir de la Bordure

> Fichier lu automatiquement par GitHub Copilot à **chaque** demande, dans le chat
> comme en mode agent.

## Le projet

Boutique en ligne du **Comptoir de la Bordure**, une enseigne fictive de space
opera qui vend des **livres** et des **produits dérivés** aux équipages des
mondes éloignés.

Objectif : parcourir le catalogue, filtrer, consulter une fiche produit, et
**converser avec un assistant** qui connaît le catalogue. Tout le reste est
secondaire.

## Ton et contenu

- Tout le contenu visible est en **français**, vouvoiement de rigueur.
- Ton : **sobre et commerçant**, jamais criard. C'est un comptoir de métier, pas
  une promo. Phrases courtes, aucun superlatif creux.
- Univers : space opera **générique et original**. On invente nos titres, nos
  auteurs, nos références.
- **Interdit** : reprendre des noms, vaisseaux, personnages, emblèmes ou
  répliques d'une œuvre existante. Aucune marque déposée, aucune citation.
- Interdits de style : émojis dans l'interface, anglicismes (« shop », « best of »),
  faux compte à rebours, fausse urgence.

## Stack technique

- **HTML5 + CSS + TypeScript vanilla**, build avec **Vite**. Pas de framework front.
- Pas de dépendance runtime sans justification explicite.
- Les données viennent de `catalogue.json` — ne jamais coder en dur un produit,
  un prix, un stock ou un rayon dans le HTML.
- Typage strict : `strict: true` dans `tsconfig.json`, **pas de `any`**.
- Chaque nouvelle page HTML doit être ajoutée aux `input` de `vite.config.ts`,
  sinon elle ne sera pas construite.

## Illustrations — règle stricte

La boutique n'utilise **aucune photo, aucune image bitmap, aucune ressource
externe**. Toutes les illustrations sont des **SVG originaux écrits à la main**
dans `src/illustrations.ts`.

Trois raisons, sans exception :

1. **Propriété intellectuelle** : on ne reproduit aucun design existant.
2. **Qualité de projection** : le SVG reste net sur n'importe quel écran.
3. **Fonctionnement hors ligne** : tout est inliné. Une seule image externe
   casserait la démonstration.

Chaque produit doit avoir une **vignette SVG générée** à partir de son rayon
(ouvrage, équipement, insigne, maquette) — pas une photo.

Conventions de dessin :

- `currentColor` pour le trait principal, `var(--ambre, #ffc94a)` pour l'accent
- `fill="none"`, `stroke-linecap="round"`, `stroke-linejoin="round"`
- `role="img"` + `aria-label` en français si l'illustration porte du sens ;
  `aria-hidden="true"` + `focusable="false"` si elle est décorative

## L'assistant — comment il doit être construit

- Zone de conversation **ancrée dans la page**, pas une bulle flottante.
- Le composant vit dans `src/assistant.ts`. Il expose une fonction
  `repondre(question: string): Promise<ReponseAssistant>`.
- **L'implémentation locale interroge `catalogue.json`** : recherche par titre,
  rayon, prix, stock, étiquette. Elle doit répondre avec des **produits réels du
  catalogue**, jamais inventés.
- Cette fonction est le **point de branchement** : elle doit pouvoir être
  remplacée par un appel à un agent distant sans toucher à l'interface.
  Isole l'accès aux données derrière une interface nommée `SourceAssistant`.
- L'assistant **cite toujours les références** des produits qu'il recommande.
- S'il ne trouve rien, il le dit et propose une recherche voisine.
  **Il n'invente jamais un produit.**
- Les réponses s'affichent progressivement, dans un conteneur `role="log"`
  avec `aria-live="polite"`.

## Conventions de code

- Noms de fichiers en `kebab-case`, fonctions en `camelCase`.
- Les identifiants du domaine restent en **français** (`produit`, `rayon`,
  `panier`, `reference`, `stock`).
- CSS : variables dans `:root`, pas de valeur magique répétée.
- Palette : nuit `#070b16`, surface `#111a2e`, texte `#eef2f8`, accent ambre
  `#ffc94a`, alerte `#e0533d`.
- Les prix s'affichent avec le séparateur de milliers français et le suffixe
  `cr` (ex. `1 240 cr`).

## Accessibilité — non négociable

- Contraste **AA minimum** sur tous les textes.
- Tout est navigable **au clavier**, focus visible.
- Icônes décoratives en `aria-hidden="true"`.
- Un seul `<h1>` par page, hiérarchie de titres continue.
- Les résultats de filtre et les réponses de l'assistant sont annoncés via
  `role="status"` ou `role="log"` et `aria-live="polite"`.
- Le champ de saisie de l'assistant a un `<label>` visible.

## Ce que Copilot doit faire systématiquement

1. Lire `catalogue.json` **avant** de générer quoi que ce soit qui affiche des données.
2. Proposer une version **responsive mobile-first**.
3. Signaler visuellement les produits **en rupture** (`stock: 0`) et **en stock bas**
   (moins de 10) — sans jamais permettre de commander un produit en rupture.
4. Commenter uniquement quand le « pourquoi » n'est pas évident.
5. Quand une donnée manque, **demander** plutôt qu'inventer.
