# Instructions Copilot — Comptoir de la Bordure

> Fichier lu automatiquement par GitHub Copilot à **chaque** demande, dans le chat
> comme en mode agent.

## ⛔ Règle prioritaire — l'identité visuelle

**La palette et l'ambiance ci-dessous priment sur toute autre consigne de style,
y compris celle d'une skill, d'un thème générique ou d'un guide d'artefact web.
Aucun thème clair. Aucune exception.**

| Rôle | Valeur |
|---|---|
| Fond | `#070b16` |
| Surface | `#111a2e` |
| Surface haute | `#1a2440` |
| Texte | `#eef2f8` |
| Texte doux | `#9aa7bd` |
| Accent | `#ffc94a` (ambre) |
| Alerte | `#e0533d` |
| Trait | `#24304d` |

**Ambiance :** nuit du désert sur un avant-poste à deux soleils. Ciel profond,
champ d'étoiles en fond, halo bas sur l'horizon. Lumière ambre de lampe de
comptoir. Les fiches produit se présentent comme des **projections
holographiques** : liseré ambre translucide, coins biseautés, discrète ligne de
balayage. Sobre et tendu, jamais clinquant, jamais lumineux.

**La scène de fond existe déjà.** `src/horizon.ts` exporte `horizonBordure()`,
qui renvoie un SVG original : deux soleils bas, dunes en couches, champ
d'étoiles. **Appelle-la et pose-la en fond de page**, derrière tout le contenu,
en `position: fixed`, `inset: 0`, `pointer-events: none`, `z-index: -1`.
Ne la redessine pas, ne la remplace pas par une image.

**Les illustrations existent aussi.** `src/scenes.ts` exporte :

| Fonction | Usage |
|---|---|
| `avantPoste()` | Grande scène pour le **bandeau d'accueil** — l'avant-poste sous les deux soleils |
| `borneConseil()` | Scène pour la **zone de conseil** — un droïde devant une console d'archives |
| `vignetteProduit(reference, rayon)` | **La vignette de chaque fiche produit** — appelle-la pour tous les produits |
| `lameEnergie()`, `cristal()`, `ouvrage()`, `medaillon()`, `chasseur()`, `cargo()`, `casque()`, `droide()`, `rapace()` | Vignettes individuelles si besoin |

**Utilise-les.** Ne redessine pas ces illustrations.

### Les photographies

`public/images/` contient **quatre photographies de la NASA, domaine public** :

| Fichier | Sujet | Où l'utiliser |
|---|---|---|
| `nebuleuse.jpg` | Nébuleuse de la Carène (James Webb) | **Fond de page**, très assombri |
| `panorama.jpg` | Panorama martien au sol | **Bandeau d'accueil** |
| `coucher.jpg` | Coucher de soleil sur Mars | Zone de conseil |
| `dunes.jpg` | Dunes vues d'orbite | En réserve |

**Règles pour les photographies :**

- Ce sont les **seules** images bitmap autorisées. N'ajoute jamais d'image
  externe, de CDN, ni de visuel issu d'une œuvre de fiction existante.
- Elles doivent être **teintées pour entrer dans la palette** : filtre CSS
  combinant `saturate`, `brightness`, `sepia` et `hue-rotate`, plus un voile
  dégradé. Une photo laissée brute jure avec le reste.
- Toujours un `alt` descriptif en français, et `loading="lazy"` sauf pour le
  bandeau d'accueil.
- Le crédit « Images : NASA / JPL-Caltech — domaine public » reste dans le pied
  de page.

Les variables CSS existent déjà dans `src/styles.css` sous `:root`. **Utilise-les,
ne les remplace pas.**

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

La boutique n'utilise **aucune ressource externe**. Les illustrations sont des
**SVG originaux écrits à la main** dans `src/scenes.ts`, et les seules images
bitmap autorisées sont les **photographies NASA du domaine public** déjà
présentes dans `public/images/`.

Trois raisons, sans exception :

1. **Propriété intellectuelle** : on ne reproduit aucun design existant et on
   n'utilise aucun visuel d'une œuvre de fiction protégée. Le site est publié
   sur une URL publique et présenté lors d'un événement filmé.
2. **Qualité de projection** : le SVG reste net sur n'importe quel écran.
3. **Fonctionnement hors ligne** : les SVG sont inlinés, les photos sont
   servies depuis le site lui-même. Aucun appel à un CDN.

Chaque produit doit avoir une **vignette SVG** issue de `vignetteProduit()`,
pas une photo.

Conventions de dessin :

- `currentColor` pour le trait principal, `var(--ambre, #ffc94a)` pour l'accent
- `fill="none"`, `stroke-linecap="round"`, `stroke-linejoin="round"`
- `role="img"` + `aria-label` en français si l'illustration porte du sens ;
  `aria-hidden="true"` + `focusable="false"` si elle est décorative

## L'assistant — comment il doit être construit

- Zone de conversation **ancrée dans la page**, pas une bulle flottante.
- Le composant vit dans `src/assistant.ts`. Il expose une fonction
  `repondre(question: string): Promise<ReponseAssistant>`.
- Isole l'accès aux données derrière une interface nommée `SourceAssistant`.

### Deux sources, une seule interface

**C'est le cœur de la démonstration.** L'assistant a deux implémentations de
`SourceAssistant`, et l'interface graphique ne sait pas laquelle répond :

| Source | Implémentation | Répond à |
|---|---|---|
| **Comptoir** | `SourceCatalogueLocale` | Les questions de **catalogue** : prix, stock, rayon, rupture. Lit `catalogue.json`. |
| **Expert Galaxy** | `SourceExpertGalaxy` | Les questions de **lore** : histoire, lieux, factions, culture de la galaxie. `POST /api/conseil`. |

Un **sélecteur visible** au-dessus de la zone de saisie permet de basculer de
l'une à l'autre. L'origine de chaque réponse est affichée à côté du message
(« Comptoir » ou « Expert Galaxy »).

`SourceExpertGalaxy` appelle :

```ts
await fetch('/api/conseil', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question }),
});
// -> { texte: string, references: string[], source?: string }
```

**Règles absolues pour `SourceExpertGalaxy` :**

- **Ne mets jamais de clé d'API, de jeton ou d'URL Foundry dans le front-end.**
  La fonction `api/conseil` détient la clé côté serveur ; le navigateur ne voit
  que `/api/conseil`. N'ajoute aucune variable d'environnement côté client.
- L'appel prend **10 à 30 secondes**. Affiche un état d'attente explicite
  (« L'archiviste consulte les archives… ») et **désactive le bouton d'envoi**
  pendant ce temps.
- Si la réponse n'est pas `ok`, affiche le champ `texte` renvoyé par l'API tel
  quel. N'invente pas de message d'erreur technique.

**Règles pour `SourceCatalogueLocale` :**

- Recherche par titre, rayon, prix, stock, étiquette dans `catalogue.json`.
- Répond avec des **produits réels du catalogue**, jamais inventés.
- Cite toujours les **références** des produits recommandés.
- S'il ne trouve rien, il le dit et propose une recherche voisine.

Les réponses s'affichent progressivement, dans un conteneur `role="log"`
avec `aria-live="polite"`.

## Conventions de code

- Noms de fichiers en `kebab-case`, fonctions en `camelCase`.
- Les identifiants du domaine restent en **français** (`produit`, `rayon`,
  `panier`, `reference`, `stock`).
- CSS : variables dans `:root`, pas de valeur magique répétée.
- La palette est celle de la **règle prioritaire** en tête de fichier. Ne la
  redéfinis jamais, n'introduis aucun fond clair.
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
