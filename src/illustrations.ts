// Vignettes SVG originales, une par rayon. Aucune photo, aucune ressource externe.
// Trait en currentColor, accent en ambre, esprit "projection holographique".

function enveloppe(contenu: string, etiquette: string): string {
  return `
<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${etiquette}">
  <rect x="1" y="1" width="94" height="94" rx="6" fill="none" stroke="var(--ambre, #ffc94a)" stroke-opacity="0.35"/>
  <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    ${contenu}
  </g>
  <line x1="6" y1="${18 + (Math.imul(etiquette.length, 7) % 50)}" x2="90" y2="${18 + (Math.imul(etiquette.length, 7) % 50)}"
        stroke="var(--ambre, #ffc94a)" stroke-opacity="0.18" stroke-width="1"/>
</svg>`.trim();
}

function ouvrage(): string {
  return enveloppe(
    `<path d="M20 24 h28 a6 6 0 0 1 6 6 v38 h-34 a6 6 0 0 1 -6 -6 z"/>
     <path d="M54 24 h22 v44 h-22 a6 6 0 0 1 -6 -6 v-32 a6 6 0 0 1 6 -6 z"/>
     <line x1="54" y1="24" x2="54" y2="68"/>
     <line x1="26" y1="36" x2="42" y2="36"/>
     <line x1="26" y1="44" x2="42" y2="44"/>`,
    'Ouvrage relie'
  );
}

function armement(): string {
  return enveloppe(
    `<path d="M22 74 L64 32 a5 5 0 0 1 7 7 L29 81 a5 5 0 0 1 -7 -7 z"/>
     <circle cx="70" cy="26" r="7"/>
     <line x1="20" y1="70" x2="14" y2="76"/>
     <line x1="26" y1="76" x2="20" y2="82"/>`,
    'Lame et cristal'
  );
}

function relique(): string {
  return enveloppe(
    `<circle cx="48" cy="42" r="20"/>
     <path d="M48 62 l-9 22 l9 -6 l9 6 z"/>
     <path d="M40 36 l8 10 l16 -14"/>`,
    'Medaillon relique'
  );
}

function maquette(): string {
  return enveloppe(
    `<path d="M18 50 L40 24 h16 L78 50 l-16 8 h-28 z"/>
     <line x1="40" y1="24" x2="48" y2="50"/>
     <line x1="56" y1="24" x2="48" y2="50"/>
     <line x1="18" y1="50" x2="48" y2="62"/>
     <line x1="78" y1="50" x2="48" y2="62"/>`,
    'Maquette de vaisseau'
  );
}

const GENERATEURS: Record<string, () => string> = {
  ouvrages: ouvrage,
  armement,
  reliques: relique,
  modeles: maquette,
};

// Vignette generee a partir du rayon du produit. Repli generique si le rayon est inconnu.
export function illustrationRayon(rayon: string): string {
  const generer = GENERATEURS[rayon];
  if (generer) {
    return generer();
  }
  return enveloppe(`<rect x="30" y="30" width="36" height="36" rx="4"/>`, 'Produit du comptoir');
}
