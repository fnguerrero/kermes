/* La version compacta de la luna se compara contra el motor completo de
   ViaCombusta, que ya esta verificado contra los ejemplos de Meeus. */
var L = require('../js/luna.js');
var E = require('../../ViaCombusta/js/astro/ephemeris.js');

var fails = 0;
function check(etq, got, want, tolGrados){
  var d = got - want;
  while (d > 180) d -= 360; while (d < -180) d += 360;
  var ok = Math.abs(d) <= tolGrados;
  if (!ok) fails++;
  console.log((ok?'  OK  ':' FAIL ') + etq.padEnd(30) +
    got.toFixed(4) + '  vs  ' + want.toFixed(4) +
    '   dif ' + (Math.abs(d)*60).toFixed(2) + "'");
}

console.log('== Longitud de la Luna y del Sol contra el motor completo ==');
var fechas = [
  [1989,7,14,7.4],[1992,4,12,0],[2000,1,1,12],[2010,6,15,3],
  [2026,8,26,15],[2026,2,3,22],[2027,11,9,6]
];
fechas.forEach(function(f){
  var jd = L.julianDay(f[0],f[1],f[2],f[3]);
  var jde = jd + 70/86400;
  var ref = E.positions(jd, f[0], f[1]);
  var etq = f[0]+'-'+f[1]+'-'+f[2];
  // El motor completo devuelve longitud aparente (con nutacion, hasta 17");
  // la version compacta la omite, asi que la tolerancia lo contempla.
  check('Luna ' + etq, L.longitudLuna(jde), ref.moon.lon, 0.05);
  check('Sol  ' + etq, L.longitudSol(jde), ref.sun.lon, 0.02);
});

console.log('\n== Fase e iluminacion ==');
// La iluminacion calculada tiene que coincidir con la que sale de las dos
// longitudes del motor completo.
fechas.forEach(function(f){
  var d = new Date(Date.UTC(f[0], f[1]-1, f[2], Math.floor(f[3]), 0));
  var e = L.estado(d);
  var jd = L.julianDay(f[0],f[1],f[2],f[3]);
  var ref = E.positions(jd, f[0], f[1]);
  var elong = ((ref.moon.lon - ref.sun.lon) % 360 + 360) % 360;
  var ilum = (1 - Math.cos(elong*Math.PI/180))/2;
  var ok = Math.abs(e.iluminacion - ilum) < 0.005;
  if(!ok) fails++;
  console.log((ok?'  OK  ':' FAIL ') + (f[0]+'-'+f[1]+'-'+f[2]).padEnd(14) +
    e.fase.padEnd(18) + (e.iluminacion*100).toFixed(1) + '%  ' +
    e.signoGlifo + ' ' + e.signoNombre + '  dia lunar ' + e.diaLunar);
});

console.log('\n== Coherencia del ciclo: una lunacion entera ==');
// A lo largo de 30 dias tiene que haber nueva, llena y los dos cuartos.
var vistas = {};
for (var i=0;i<30;i++){
  var d = new Date(Date.UTC(2026,7,1+i,0,0));
  vistas[L.estado(d).fase] = true;
}
['luna nueva','cuarto creciente','luna llena','cuarto menguante'].forEach(function(f){
  var ok = !!vistas[f];
  if(!ok) fails++;
  console.log((ok?'  OK  ':' FAIL ') + 'aparece ' + f);
});

console.log('\n' + (fails===0
  ? 'TODO OK: la luna compacta coincide con el motor verificado.'
  : fails + ' PROBLEMAS.'));
process.exit(fails===0?0:1);
