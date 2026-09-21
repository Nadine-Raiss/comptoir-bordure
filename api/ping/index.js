// Sonde de diagnostic : repond sans appeler Foundry.
// Permet de distinguer "la fonction ne demarre pas" de "l appel Foundry echoue".
module.exports = async function (context) {
  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      ok: true,
      node: process.version,
      cle_presente: Boolean(process.env.FOUNDRY_KEY),
      endpoint_present: Boolean(process.env.FOUNDRY_ENDPOINT),
      fetch_disponible: typeof fetch === 'function',
    },
  };
};
