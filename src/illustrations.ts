export type RayonId = 'ouvrages' | 'armement' | 'reliques' | 'modeles';

const dessins: Record<RayonId, string> = {
  ouvrages: `
    <path d="M42 30c17-7 34-5 46 4v60c-12-9-29-11-46-4z"/>
    <path d="M88 34c12-9 29-11 46-4v60c-17-7-34-5-46 4z"/>
    <path d="M51 45c10-3 19-2 27 2M51 58c10-3 19-2 27 2M98 47c8-4 17-5 27-2M98 60c8-4 17-5 27-2"/>
    <circle cx="88" cy="111" r="5" fill="var(--ambre, #ffc94a)" stroke="none"/>`,
  armement: `
    <path d="M47 105 99 53M39 113l8-8 10 10-8 8zM96 56l12-12"/>
    <path d="M104 48 126 26" stroke="var(--ambre, #ffc94a)" stroke-width="7"/>
    <path d="m79 81 18 18M71 103l10 10M108 83l17 5-5 17-17-5z"/>
    <circle cx="114" cy="94" r="4" fill="var(--ambre, #ffc94a)" stroke="none"/>`,
  reliques: `
    <path d="M62 25c0 19 8 30 26 37 18-7 26-18 26-37"/>
    <circle cx="88" cy="88" r="29"/>
    <path d="m88 69 6 12 13 2-10 10 3 14-12-7-12 7 3-14-10-10 13-2z" stroke="var(--ambre, #ffc94a)"/>
    <path d="M62 25c10 7 42 7 52 0"/>
    <circle cx="88" cy="25" r="4" fill="var(--ambre, #ffc94a)" stroke="none"/>`,
  modeles: `
    <path d="M88 25 75 66 37 83l38 10 13 34 13-34 38-10-38-17z"/>
    <path d="m75 66 13 11 13-11M75 93l13-8 13 8"/>
    <path d="M51 112h74M59 120h58" opacity=".55"/>
    <circle cx="88" cy="83" r="4" fill="var(--ambre, #ffc94a)" stroke="none"/>`,
};

export function illustrationProduit(rayon: string, titre: string): string {
  const dessin = dessins[rayon as RayonId] ?? dessins.reliques;
  return `<svg class="produit__illustration" viewBox="0 0 176 148" role="img" aria-label="Illustration de ${echapper(titre)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${dessin}</svg>`;
}

function echapper(texte: string): string {
  return texte.replace(/[&<>"]/g, (caractere) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[caractere] ?? caractere);
}