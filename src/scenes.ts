// Scenes originales de l'univers du Comptoir.
//
// Dessins traces a la main, aucune photo, aucune ressource externe, aucune
// reference a une oeuvre existante. Tout est inline : la page reste identique
// hors ligne et nette a n'importe quelle resolution de videoprojecteur.
//
// Chaque fonction renvoie une chaine SVG prete a inserer.

const AMBRE = 'var(--ambre, #ffc94a)';

/* ------------------------------------------------------------------ *
 *  GRANDES SCENES                                                     *
 * ------------------------------------------------------------------ */

/**
 * Bandeau d'accueil : l'avant-poste vu depuis les dunes, les deux soleils
 * derriere les domes, un cargo en approche.
 */
export function avantPoste(): string {
  return `
<svg class="scene scene--avant-poste" viewBox="0 0 900 420" role="img"
     aria-label="L'avant-poste de Tessara au coucher des deux soleils"
     xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ap-ciel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#070b16"/>
      <stop offset="60%"  stop-color="#1d1729"/>
      <stop offset="100%" stop-color="#4a3128"/>
    </linearGradient>
    <radialGradient id="ap-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffc94a" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#ff7a3c" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="900" height="420" fill="url(#ap-ciel)" rx="10"/>
  <circle cx="620" cy="300" r="230" fill="url(#ap-halo)"/>
  <circle cx="620" cy="300" r="52" fill="#ffc06a" opacity="0.9"/>
  <circle cx="742" cy="282" r="24" fill="#ffe0a8" opacity="0.8"/>

  <!-- dunes -->
  <path d="M0 312 C 160 288, 330 322, 470 306 C 640 288, 780 326, 900 310 L900 420 L0 420 Z"
        fill="#241c33"/>
  <path d="M0 312 C 160 288, 330 322, 470 306 C 640 288, 780 326, 900 310"
        fill="none" stroke="${AMBRE}" stroke-width="1.1" opacity="0.32"/>

  <!-- domes de l'avant-poste -->
  <g fill="#0b0814">
    <path d="M150 310 h120 v-38 a60 30 0 0 0 -120 0 Z"/>
    <path d="M286 312 h74 v-24 a37 17 0 0 0 -74 0 Z"/>
    <path d="M96 314 h48 v-16 a24 11 0 0 0 -48 0 Z"/>
    <rect x="208" y="212" width="3" height="62"/>
  </g>

  <!-- fanal du comptoir, allume -->
  <circle cx="209" cy="208" r="4.5" fill="${AMBRE}"/>
  <circle cx="209" cy="208" r="13" fill="${AMBRE}" opacity="0.18"/>

  <!-- cargo en approche, silhouette lointaine -->
  <g transform="translate(430 104) scale(0.62)" opacity="0.75">
    <g fill="#0b0814" stroke="${AMBRE}" stroke-width="2.6"
       stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="0" cy="0" rx="46" ry="24"/>
      <path d="M-58 -8 L-46 -18 L-46 18 L-58 8 Z"/>
      <path d="M46 -13 L72 -13 L72 13 L46 13"/>
      <circle cx="16" cy="-3" r="9"/>
      <path d="M-28 0 h14" opacity="0.6"/>
    </g>
  </g>

  <path d="M0 372 C 220 352, 460 384, 700 368 L900 376 L900 420 L0 420 Z"
        fill="#07050e"/>
</svg>`.trim();
}

/**
 * Bandeau de la zone de conseil : un droide de service devant une console
 * d'archives. Sert a illustrer l'assistant.
 */
export function borneConseil(): string {
  return `
<svg class="scene scene--borne" viewBox="0 0 420 260" role="img"
     aria-label="Un droide de service devant la console d'archives du comptoir"
     xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bc-lueur" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffc94a" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#ffc94a" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <circle cx="290" cy="120" r="120" fill="url(#bc-lueur)"/>

  <!-- console d'archives -->
  <g fill="none" stroke="currentColor" stroke-width="2.2"
     stroke-linecap="round" stroke-linejoin="round" opacity="0.8">
    <path d="M250 200 h130 v-88 h-130 Z"/>
    <path d="M262 132 h60 M262 148 h96 M262 164 h74 M262 180 h48"
          stroke="${AMBRE}" opacity="0.62"/>
    <path d="M238 200 h158" stroke-width="3"/>
  </g>

  <!-- droide de service : dome, corps, deux jambes -->
  <g fill="none" stroke="currentColor" stroke-width="2.6"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M96 118 a36 36 0 0 1 72 0"/>
    <path d="M96 118 h72 v66 a14 14 0 0 1 -14 14 h-44 a14 14 0 0 1 -14 -14 Z"/>
    <circle cx="132" cy="104" r="9" stroke="${AMBRE}"/>
    <circle cx="132" cy="104" r="3.4" fill="${AMBRE}" stroke="none"/>
    <path d="M110 136 h16 v14 h-16 Z" stroke="${AMBRE}" opacity="0.75"/>
    <path d="M140 136 h18 M140 148 h12 M110 162 h48" opacity="0.5"/>
    <path d="M110 198 v22 h-12 M154 198 v22 h12"/>
    <path d="M132 198 v26"/>
  </g>

  <!-- faisceau de projection entre le droide et la console -->
  <path d="M170 140 L246 126" stroke="${AMBRE}" stroke-width="1.4"
        opacity="0.4" stroke-dasharray="4 5"/>
</svg>`.trim();
}

/* ------------------------------------------------------------------ *
 *  VIGNETTES PRODUIT                                                  *
 * ------------------------------------------------------------------ */

/** Lame d'energie, garde vers le bas. Rayon armement. */
export function lameEnergie(): string {
  return `
<svg class="vignette" viewBox="0 0 64 64" aria-hidden="true" focusable="false"
     fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="28" y="40" width="8" height="17" rx="2"/>
  <path d="M26 40 h12"/>
  <path d="M32 38 V12" stroke="${AMBRE}" stroke-width="3.4" opacity="0.95"/>
  <path d="M32 38 V12" stroke="${AMBRE}" stroke-width="8" opacity="0.16"/>
  <circle cx="32" cy="45" r="1.6" stroke="${AMBRE}"/>
  <path d="M29 51 h6"/>
</svg>`.trim();
}

/** Cristal focalisateur, taille brute. */
export function cristal(): string {
  return `
<svg class="vignette" viewBox="0 0 64 64" aria-hidden="true" focusable="false"
     fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M32 8 L46 26 L38 54 L26 54 L18 26 Z"/>
  <path d="M18 26 h28" opacity="0.6"/>
  <path d="M32 8 V54" opacity="0.4"/>
  <path d="M26 54 L32 34 L38 54" stroke="${AMBRE}" opacity="0.85"/>
</svg>`.trim();
}

/** Ouvrage relie, vu de trois quarts. */
export function ouvrage(): string {
  return `
<svg class="vignette" viewBox="0 0 64 64" aria-hidden="true" focusable="false"
     fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M12 14 h18 a4 4 0 0 1 4 4 v32 a4 4 0 0 0 -4 -4 H12 Z"/>
  <path d="M52 14 H34 a4 4 0 0 0 -4 4 v32 a4 4 0 0 1 4 -4 h18 Z"/>
  <path d="M32 18 V50" stroke="${AMBRE}" opacity="0.8"/>
  <path d="M17 24 h9 M17 31 h9 M38 24 h9 M38 31 h9" opacity="0.45"/>
</svg>`.trim();
}

/** Medaillon de l'Ordre : anneau, etoile a six branches, cordon. */
export function medaillon(): string {
  return `
<svg class="vignette" viewBox="0 0 64 64" aria-hidden="true" focusable="false"
     fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M24 10 L32 22 L40 10" opacity="0.6"/>
  <circle cx="32" cy="38" r="17"/>
  <circle cx="32" cy="38" r="11" opacity="0.45"/>
  <path d="M32 27 L35 35 L43 38 L35 41 L32 49 L29 41 L21 38 L29 35 Z"
        stroke="${AMBRE}" opacity="0.9"/>
</svg>`.trim();
}

/** Chasseur leger, ailes en position d'attaque, vu de face. */
export function chasseur(): string {
  return `
<svg class="vignette" viewBox="0 0 64 64" aria-hidden="true" focusable="false"
     fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M32 8 L38 30 L38 46 L26 46 L26 30 Z"/>
  <path d="M26 32 L10 46 L10 52 L26 44"/>
  <path d="M38 32 L54 46 L54 52 L38 44"/>
  <path d="M10 46 V38 M54 46 V38" opacity="0.5"/>
  <circle cx="32" cy="24" r="3.4" stroke="${AMBRE}"/>
  <path d="M28 50 h8" stroke="${AMBRE}" opacity="0.8"/>
</svg>`.trim();
}

/** Cargo de transport, coque ronde et passerelle laterale. */
export function cargo(): string {
  return `
<svg class="vignette" viewBox="0 0 64 64" aria-hidden="true" focusable="false"
     fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round"
     xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="30" cy="34" rx="22" ry="13"/>
  <path d="M8 30 L14 24 L14 44 L8 38 Z"/>
  <path d="M52 27 h8 v14 h-8"/>
  <circle cx="38" cy="30" r="5" stroke="${AMBRE}"/>
  <path d="M18 34 h10" opacity="0.5"/>
  <path d="M56 34 h4" stroke="${AMBRE}" opacity="0.8"/>
</svg>`.trim();
}

/** Casque de soldat : visiere en T, joues marquees, grille de respiration. */
export function casque(): string {
  return `
<svg class="vignette" viewBox="0 0 64 64" aria-hidden="true" focusable="false"
     fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M32 7 a21 21 0 0 1 21 21 v8 a15 15 0 0 1 -5 11 l-6 6 h-20 l-6 -6
           a15 15 0 0 1 -5 -11 V28 A21 21 0 0 1 32 7 Z"/>
  <path d="M21 24 h22 v7 h-8 v13 h-6 V31 h-8 Z" stroke="${AMBRE}"
        stroke-width="1.9" opacity="0.95"/>
  <path d="M16 27 c 0 7, 1 11, 4 14" opacity="0.55"/>
  <path d="M48 27 c 0 7, -1 11, -4 14" opacity="0.55"/>
  <path d="M27 48 h10 M28 52 h8" opacity="0.7"/>
  <path d="M32 7 v6" opacity="0.45"/>
</svg>`.trim();
}

/** Droide de service, dome et corps cylindrique. */
export function droide(): string {
  return `
<svg class="vignette" viewBox="0 0 64 64" aria-hidden="true" focusable="false"
     fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M16 24 a16 16 0 0 1 32 0"/>
  <path d="M16 24 h32 v22 a6 6 0 0 1 -6 6 H22 a6 6 0 0 1 -6 -6 Z"/>
  <circle cx="32" cy="17" r="4" stroke="${AMBRE}"/>
  <path d="M22 32 h8 v7 h-8 Z" stroke="${AMBRE}" opacity="0.8"/>
  <path d="M36 32 h8 M36 39 h5" opacity="0.5"/>
  <path d="M22 52 v5 M42 52 v5"/>
</svg>`.trim();
}

/** Rapace du desert, ailes deployees. */
export function rapace(): string {
  return `
<svg class="vignette" viewBox="0 0 64 64" aria-hidden="true" focusable="false"
     fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M32 30 L28 44 L36 44 Z"/>
  <path d="M28 32 C 18 22, 10 24, 4 34 C 12 32, 20 34, 28 38"/>
  <path d="M36 32 C 46 22, 54 24, 60 34 C 52 32, 44 34, 36 38"/>
  <circle cx="32" cy="26" r="3.2" stroke="${AMBRE}"/>
  <path d="M32 48 v6" opacity="0.5"/>
</svg>`.trim();
}

/* ------------------------------------------------------------------ *
 *  SELECTION                                                          *
 * ------------------------------------------------------------------ */

/** Vignette par defaut d'un rayon. */
export function vignetteRayon(rayon: string): string {
  switch (rayon) {
    case 'armement':
      return lameEnergie();
    case 'reliques':
      return medaillon();
    case 'modeles':
      return chasseur();
    case 'ouvrages':
    default:
      return ouvrage();
  }
}

/**
 * Vignette d'un produit precis, avec repli sur celle du rayon.
 * Les cas particuliers evitent d'avoir quatre fois le meme dessin dans
 * la grille.
 */
export function vignetteProduit(reference: string, rayon: string): string {
  switch (reference) {
    case 'ARM-CR-5':
      return cristal();
    case 'ARM-BL-220':
    case 'REL-MA-7':
      return casque();
    case 'MOD-RE-6':
    case 'LIV-JO-9':
      return cargo();
    case 'MOD-CA-3':
    case 'LIV-AT-7':
      return rapace();
    case 'LIV-CA-2':
      return droide();
    default:
      return vignetteRayon(rayon);
  }
}
