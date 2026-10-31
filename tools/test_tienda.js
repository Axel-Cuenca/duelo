/* Pruebas de los puntos, la recompensa diaria y la Tienda (js/duelo/shop.js). */
'use strict';
module.exports = function (T) {
  const { ok, eq, section } = T;
  section('Puntos, recompensa diaria y Tienda');
  const attrs = {};
  global.window = global.window || global;
  global.document = { documentElement: { setAttribute: (k, v) => { attrs[k] = v; } } };
  delete require.cache[require.resolve('../js/duelo/shop.js')];
  require('../js/duelo/shop.js');
  const S = global.window.Duelo.Shop;
  let store = { decks: [], pts: {} }, saves = 0;
  S.init(() => store, () => { saves++; });
  eq(S.coins(), 0, 'se empieza con 0 puntos');
  ok(S.owns('hc_cian') && !S.owns('hc_oro'), 'lo gratis ya es tuyo; lo demás no');
  // diaria
  let d = S.dailyInfo(); ok(d && d.day === 1 && d.amount === S.DAILY[0], 'primer día de racha');
  S.claimDaily(); eq(S.coins(), S.DAILY[0], 'cobra la recompensa del día 1');
  ok(S.dailyInfo() === null, 'no se puede cobrar dos veces el mismo día');
  // racha: ayer cobró el día 3 -> hoy es el 4; si falló un día, vuelve al 1
  const p = S.pts(), ayer = new Date(Date.now() - 86400000), hace2 = new Date(Date.now() - 2 * 86400000);
  const f = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  p.day = f(ayer); p.streak = 3; eq(S.dailyInfo().day, 4, 'racha seguida: día 4');
  p.day = f(hace2); eq(S.dailyInfo().day, 1, 'si te saltas un día la racha vuelve a empezar');
  p.day = f(ayer); p.streak = 7; eq(S.dailyInfo().day, 1, 'tras el día 7 se vuelve a empezar el ciclo');
  // partidas
  p.coins = 0; p.aiDay = ''; p.aiGot = 0;
  eq(S.reward(true, true), S.PLAY_ONLINE + S.WIN_ONLINE, 'online ganada');
  eq(S.reward(true, false), S.PLAY_ONLINE, 'online perdida');
  let tot = 0; for (let i = 0; i < 20; i++) tot += S.reward(false, true);
  eq(tot, S.AI_DAILY_CAP, 'contra la computadora hay un tope diario');
  // la Tienda ya no vende nada de lo que salía en las cajas (31/10/2026): sólo quedan lo gratis de serie y las skins del Cofre
  ok(S.ITEMS.every(i => i.free || i.cat === 'si' || i.cat === 'sk'), 'el catálogo sólo tiene lo gratis y las skins');
  ok(S.BOXES.length === 0, 'las cajas de rarezas se quitaron: sólo queda el Cofre de skins (test_cofre.js)');
  eq(S.offers().length, 0, 'sin cosméticos de pago no hay ofertas del día');
  p.coins = 500; ok(!S.buy('hc_oro').ok && S.coins() === 500, 'lo que salía en las cajas ya no se compra ni se descuenta nada');
  ok(!S.equip('hc_oro'), 'no se puede equipar lo que ya no existe');
  // datos manipulados
  store.pts = { coins: -50, owned: ['nada', 'hc_oro'], eq: { hc: 'hc_violeta' } };
  eq(S.coins(), 0, 'puntos negativos se corrigen a 0'); ok(!S.owns('nada') && !S.owns('hc_oro'), 'ids inventados o retirados se descartan');
  eq(S.equipped('hc').id, 'hc_cian', 'un equipado que ya no existe vuelve al de serie');
};
