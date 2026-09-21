// Scenes originales de l'univers du Comptoir.
//
// Dessins traces a la main, aucune photo, aucune ressource externe, aucune
// reference a une oeuvre existante. Tout est inline : la page reste identique
// hors ligne et nette a n'importe quelle resolution de videoprojecteur.
//
// Chaque fonction renvoie une chaine SVG prete a inserer.

const AMBRE = 'var(--ambre, #ffc94a)';

/**
 * Bandeau d'accueil : l'avant-poste vu depuis les dunes, les deux soleils
 * derriere les domes. A poser en tete de page.
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

  <!-- vaisseau en approche, tres loin -->
  <g opacity="0.55" stroke="${AMBRE}" stroke-width="1.4" fill="none"
     stroke-linecap="round">
    <path d="M430 128 l30 0"/>
    <path d="M440 124 l14 4 -14 4"/>
  </g>

  <path d="M0 372 C 220 352, 460 384, 700 368 L900 376 L900 420 L0 420 Z"
        fill="#07050e"/>
</svg>`.trim();
}

/**
 * Lame d'energie, garde vers le bas. Sert de vignette au rayon armement.
 */
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

/**
 * Cristal focalisateur, taille brute.
 */
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

/**
 * Ouvrage relie, vu de trois quarts.
 */
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

/**
 * Medaillon de l'Ordre : anneau, etoile a six branches, cordon.
 */
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

/**
 * Chasseur leger, ailes en position d'attaque.
 */
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

/** Vignette d'un produit precis, avec repli sur celle du rayon. */
export function vignetteProduit(reference: string, rayon: string): string {
  if (reference === 'ARM-CR-5') return cristal();
  return vignetteRayon(rayon);
}
