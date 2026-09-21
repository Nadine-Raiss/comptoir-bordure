// Scene de fond du comptoir : nuit du desert, deux soleils bas, dunes en couches.
//
// Dessin ORIGINAL, trace a la main. Aucune photo, aucune ressource externe,
// aucune reference a une oeuvre existante. Tout est inline : la page reste
// identique hors ligne et nette a n'importe quelle resolution.

interface Etoile {
  x: number;
  y: number;
  r: number;
  o: number;
}

// Generateur pseudo-aleatoire a graine fixe : le ciel est toujours le meme,
// donc le rendu ne saute pas d'un chargement a l'autre.
function semer(graine: number): () => number {
  let etat = graine >>> 0;
  return () => {
    etat = (Math.imul(etat, 1664525) + 1013904223) >>> 0;
    return etat / 4294967296;
  };
}

function champEtoiles(nombre: number, graine: number): Etoile[] {
  const tirage = semer(graine);
  const etoiles: Etoile[] = [];
  for (let i = 0; i < nombre; i += 1) {
    const y = tirage() * 560;
    etoiles.push({
      x: tirage() * 1600,
      y,
      r: 0.4 + tirage() * 1.1,
      // Le ciel se vide en approchant de l'horizon : la lueur des soleils noie
      // les etoiles basses.
      o: Math.max(0.05, (1 - y / 620) * (0.25 + tirage() * 0.6)),
    });
  }
  return etoiles;
}

function dessinerEtoiles(): string {
  return champEtoiles(190, 20260921)
    .map((e) => `<circle cx="${e.x.toFixed(1)}" cy="${e.y.toFixed(1)}" r="${e.r.toFixed(2)}" opacity="${e.o.toFixed(2)}"/>`)
    .join('');
}

/**
 * Renvoie la scene complete en SVG inline.
 * A poser en fond de page, derriere le contenu, en pointer-events: none.
 */
export function horizonBordure(): string {
  return `
<svg class="horizon" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"
     xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#04060d"/>
      <stop offset="45%"  stop-color="#070b16"/>
      <stop offset="78%"  stop-color="#1b1729"/>
      <stop offset="100%" stop-color="#3d2a28"/>
    </linearGradient>

    <radialGradient id="lueurGrande" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffc94a" stop-opacity="0.55"/>
      <stop offset="35%"  stop-color="#ff9d4a" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#ff7a3c" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="lueurPetite" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffe6b0" stop-opacity="0.42"/>
      <stop offset="45%"  stop-color="#ffb877" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#ff9d4a" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="duneLoin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#2a2033"/>
      <stop offset="100%" stop-color="#191428"/>
    </linearGradient>

    <linearGradient id="duneMilieu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#1a1526"/>
      <stop offset="100%" stop-color="#100d1c"/>
    </linearGradient>
  </defs>

  <!-- ciel -->
  <rect width="1600" height="900" fill="url(#ciel)"/>

  <!-- etoiles -->
  <g fill="#eef2f8">${dessinerEtoiles()}</g>

  <!-- halos : le grand soleil se couche, le petit le suit -->
  <circle cx="1060" cy="600" r="420" fill="url(#lueurGrande)"/>
  <circle cx="1268" cy="572" r="240" fill="url(#lueurPetite)"/>

  <!-- disques solaires, partiellement avales par l'horizon -->
  <circle cx="1060" cy="600" r="74" fill="#ffc06a" opacity="0.92"/>
  <circle cx="1268" cy="572" r="34" fill="#ffe0a8" opacity="0.82"/>

  <!-- dunes lointaines -->
  <path d="M0 612 C 190 574, 360 606, 520 590 C 700 572, 860 616, 1010 600
           C 1180 582, 1330 618, 1460 602 L1600 612 L1600 900 L0 900 Z"
        fill="url(#duneLoin)" opacity="0.9"/>

  <!-- ligne de crete, effleuree par la lumiere -->
  <path d="M0 612 C 190 574, 360 606, 520 590 C 700 572, 860 616, 1010 600
           C 1180 582, 1330 618, 1460 602 L1600 612"
        fill="none" stroke="#ffc94a" stroke-width="1.1" opacity="0.3"/>

  <!-- dunes intermediaires -->
  <path d="M0 704 C 230 664, 430 708, 650 686 C 880 662, 1090 710, 1310 690
           L1600 700 L1600 900 L0 900 Z"
        fill="url(#duneMilieu)"/>

  <!-- avant-poste : quelques masses basses et un mat -->
  <g opacity="0.78" fill="#0a0812">
    <path d="M232 686 h96 v-30 a48 22 0 0 0 -96 0 Z"/>
    <path d="M344 690 h58 v-19 a29 13 0 0 0 -58 0 Z"/>
    <rect x="292" y="606" width="2.4" height="52"/>
    <circle cx="293" cy="602" r="3.4"/>
  </g>
  <circle cx="293" cy="602" r="3.4" fill="#ffc94a" opacity="0.75"/>

  <!-- dune de premier plan -->
  <path d="M0 800 C 280 760, 540 806, 820 786 C 1100 764, 1360 808, 1600 792
           L1600 900 L0 900 Z"
        fill="#07050e"/>
</svg>`.trim();
}
