/* El mundo: la feria como un escenario continuo que Bel recorre caminando.
   Las coordenadas del mundo van en píxeles; la cámara traduce a pantalla.
   El suelo está siempre en la misma línea, así que solo hay una dimensión de
   movimiento y las atracciones se ubican por su x. */
var Mundo = (function () {
  'use strict';

  var D = (typeof Dib !== 'undefined') ? Dib : require('./dibujo.js');

  var ANCHO = 8200;          // largo total de la feria
  var SUELO = 0.83;          // altura del piso, en fracción de pantalla
  var VELOCIDAD = 205;       // px por segundo caminando

  /* Las paradas de la feria, de izquierda a derecha.
     radio: a qué distancia se puede interactuar. */
  /* accion: qué dice el prompt. mirar: lo que Bel observa al acercarse.
     Las que tienen secuencia propia la arrancan; el resto responde igual, con
     una observación. E nunca tiene que quedar sin hacer nada. */
  var PARADAS = [
    { clave: 'entrada', x: 240, radio: 150, titulo: 'La entrada', accion: 'mirar el molinete',
      mirar: 'El molinete gira para los dos lados. Los de feria giran para un lado solo, ' +
             'para que nadie entre sin pagar. Este deja pasar en las dos direcciones.' },
    { clave: 'tiro', x: 1080, radio: 170, titulo: 'El puesto de tiro', accion: 'mirar el mostrador',
      mirar: 'Los patos siguen dando la vuelta y las luces están todas sanas. ' +
             'Sobre el mostrador hay dos rifles apoyados, con el caño para adentro. ' +
             'Así los deja alguien que piensa volver.' },
    { clave: 'calesita', x: 2000, radio: 200, titulo: 'La calesita', accion: 'escuchar la música',
      mirar: 'Gira despacio, a la velocidad exacta de los chicos chiquitos. ' +
             'Esa velocidad no viene de fábrica: alguien la reguló así, a mano.' },
    { clave: 'montania', x: 3150, radio: 230, titulo: 'La montaña rusa', accion: 'subirte' },
    { clave: 'chocadores', x: 4300, radio: 200, titulo: 'Los autitos', accion: 'mirar la pista',
      mirar: 'Hay uno andando solo, dando vueltas. Bel busca el tablero y lo encuentra ' +
             'al costado, con la llave abajo. La pista está sin corriente.' },
    { clave: 'espejos', x: 5250, radio: 180, titulo: 'El laberinto de espejos', accion: 'contar los paneles',
      mirar: 'Se ve nueve veces caminando por el frente. Cuenta los paneles despacio, ' +
             'señalando con el dedo: son ocho.' },
    { clave: 'martillo', x: 6000, radio: 140, titulo: 'El martillo', accion: 'mirar la campana',
      mirar: 'La campana está gastada arriba, del lado de adentro. Para dejarla así ' +
             'hay que pegarle muchísimas veces. Y la maza está apoyada, no tirada.' },
    { clave: 'rueda', x: 6850, radio: 230, titulo: 'La vuelta al mundo', accion: 'buscar el motor',
      mirar: 'Rodea la estructura entera. Donde tendría que estar el motor hay un hueco ' +
             'limpio, con la marca en el cemento de cuando estuvo. La rueda sigue girando.' },
    { clave: 'carpa', x: 7800, radio: 170, titulo: 'La carpa del fondo', accion: 'asomarte',
      mirar: 'Es la única sin luces afuera. Abajo de la lona se ve una claridad quieta, ' +
             'de vela. Bel no entra todavía: sabe que a esa carpa se entra al final.' }
  ];

  function crear() {
    return {
      camara: 0,
      ancho: ANCHO,
      paradas: PARADAS,
      // Postes de luz repartidos, para que el camino tenga ritmo.
      postes: (function () {
        var p = [];
        for (var x = 480; x < ANCHO; x += 620) p.push({ x: x, semilla: x * .013 });
        return p;
      })(),
      // Cositas del piso: cajones, un tacho, papeles.
      trastos: (function () {
        var t = [], tipos = ['cajon', 'tacho', 'caballete', 'bolsa'];
        for (var i = 0; i < 26; i++) {
          var x = 380 + i * 300 + ((i * 137) % 190);
          t.push({ x: x, tipo: tipos[i % tipos.length], esc: .8 + ((i * 53) % 40) / 100 });
        }
        return t;
      })()
    };
  }

  /* La cámara sigue a Bel, pero no se sale del mundo y llega con retraso:
     un seguimiento rígido marea. */
  function seguirCamara(m, belX, W, dt) {
    var objetivo = belX - W * .40;
    var max = ANCHO - W;
    if (objetivo < 0) objetivo = 0;
    if (objetivo > max) objetivo = max;
    var k = 1 - Math.pow(0.0025, dt);       // suavizado independiente de los fps
    m.camara += (objetivo - m.camara) * k;
  }

  function paradaCerca(m, belX) {
    for (var i = 0; i < PARADAS.length; i++) {
      if (Math.abs(belX - PARADAS[i].x) < PARADAS[i].radio) return PARADAS[i];
    }
    return null;
  }

  /* --- fondo --- */

  // Tres capas de siluetas lejanas que se mueven a distinta velocidad.
  function fondo(cx, m, W, H, t, luna) {
    // Se pinta bien por fuera de la pantalla: durante las secuencias la cámara
    // sube, y un rectángulo del alto justo dejaba franjas negras.
    var g = cx.createLinearGradient(0, -H, 0, H);
    g.addColorStop(0, '#060811');
    g.addColorStop(.28, '#0a0e1a');
    g.addColorStop(.60, '#121a2e');
    g.addColorStop(.86, '#1d2340');
    g.addColorStop(1, '#0f1220');
    cx.fillStyle = g;
    cx.fillRect(-W, -H * 1.6, W * 3, H * 3.2);

    D.usar(cx, W, H, t, true);
    // Estrellas y luna quedan fijas: están lejísimos.
    cx.save();
    for (var i = 0; i < estrellas.length; i++) {
      var e = estrellas[i];
      cx.globalAlpha = .18 + .45 * (0.5 + 0.5 * Math.sin(t * e.v + e.f));
      cx.fillStyle = '#cfd6ee';
      cx.beginPath(); cx.arc(e.x * W, e.y * H * .62, e.r, 0, 6.2832); cx.fill();
    }
    cx.restore();
    D.luna(.82, .15, .026, luna.iluminacion, luna.creciente);

    // Capa 1: el paredón del baldío y los árboles del fondo.
    var c1 = m.camara * .18;
    cx.fillStyle = '#0d1120';
    var yPared = H * SUELO - H * .17;
    cx.fillRect(0, yPared, W, H * .17);
    for (var k = 0; k < 30; k++) {
      var ax = (k * 340 - c1) % (W + 680) - 340;
      cx.beginPath();
      cx.ellipse(ax, yPared - H * .012, 46, H * .052, 0, 0, 6.2832);
      cx.fill();
    }

    // Capa 2: siluetas de carpas y mástiles, a media distancia.
    var c2 = m.camara * .42;
    cx.fillStyle = '#111527';
    for (var j = 0; j < 22; j++) {
      var bx = (j * 430 - c2) % (W + 860) - 430;
      var alto = H * (.06 + ((j * 37) % 40) / 900);
      cx.beginPath();
      cx.moveTo(bx - 62, H * SUELO - H * .015);
      cx.quadraticCurveTo(bx, H * SUELO - H * .015 - alto * 1.5, bx + 62, H * SUELO - H * .015);
      cx.closePath(); cx.fill();
    }
  }

  var estrellas = [];
  function sembrar() {
    estrellas = [];
    for (var i = 0; i < 150; i++) {
      estrellas.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.1 + .3, f: Math.random() * 6.28,
        v: .4 + Math.random() * 1.0
      });
    }
  }

  /* --- suelo --- */

  function suelo(cx, m, W, H, t) {
    var y = H * SUELO;
    var g = cx.createLinearGradient(0, y - 4, 0, H);
    g.addColorStop(0, '#1e1a2a');
    g.addColorStop(.25, '#16121f');
    g.addColorStop(1, '#0a0810');
    cx.fillStyle = g;
    cx.fillRect(-W, y - 4, W * 3, H * 1.8);

    // Pedregullo: puntitos que se mueven con la cámara, para que se note el avance.
    cx.save();
    cx.fillStyle = 'rgba(150,140,165,.14)';
    var paso = 26;
    var off = -(m.camara % paso);
    for (var fila = 0; fila < 7; fila++) {
      var fy = y + 10 + fila * (H - y) * .12;
      var desfase = (fila % 2) * (paso / 2);
      for (var x = off - paso; x < W + paso; x += paso) {
        var r = 1 + ((Math.round(x + m.camara + fila * 71) * 13) % 5) * .28;
        cx.beginPath();
        cx.arc(x + desfase, fy, r, 0, 6.2832);
        cx.fill();
      }
    }
    cx.restore();
  }

  /* --- trastos del piso --- */

  function trastos(cx, m, W, H, t) {
    var y = H * SUELO;
    m.trastos.forEach(function (o) {
      var x = o.x - m.camara;
      if (x < -120 || x > W + 120) return;
      var s = o.esc;
      cx.save();
      cx.translate(x, y);
      cx.fillStyle = 'rgba(0,0,0,.4)';
      cx.beginPath(); cx.ellipse(0, 3, 26 * s, 6 * s, 0, 0, 6.2832); cx.fill();
      if (o.tipo === 'cajon') {
        cx.fillStyle = '#1c1520';
        cx.fillRect(-20 * s, -26 * s, 40 * s, 26 * s);
        cx.strokeStyle = '#2b2130'; cx.lineWidth = 2;
        cx.strokeRect(-20 * s, -26 * s, 40 * s, 26 * s);
        cx.beginPath();
        cx.moveTo(-20 * s, -13 * s); cx.lineTo(20 * s, -13 * s); cx.stroke();
      } else if (o.tipo === 'tacho') {
        cx.fillStyle = '#191420';
        cx.beginPath();
        cx.moveTo(-15 * s, 0); cx.lineTo(-12 * s, -34 * s);
        cx.lineTo(12 * s, -34 * s); cx.lineTo(15 * s, 0);
        cx.closePath(); cx.fill();
        cx.fillStyle = '#241d2c';
        cx.beginPath(); cx.ellipse(0, -34 * s, 12 * s, 4 * s, 0, 0, 6.2832); cx.fill();
      } else if (o.tipo === 'caballete') {
        cx.strokeStyle = '#1e1826'; cx.lineWidth = 3 * s;
        cx.beginPath();
        cx.moveTo(-18 * s, 0); cx.lineTo(-6 * s, -22 * s);
        cx.moveTo(18 * s, 0); cx.lineTo(6 * s, -22 * s);
        cx.moveTo(-14 * s, -22 * s); cx.lineTo(14 * s, -22 * s);
        cx.stroke();
      } else {
        cx.fillStyle = '#15111c';
        cx.beginPath();
        cx.ellipse(0, -7 * s, 17 * s, 8 * s, .2, 0, 6.2832); cx.fill();
      }
      cx.restore();
    });
  }

  /* --- postes de luz --- */

  function postes(cx, m, W, H, t) {
    var y = H * SUELO;
    m.postes.forEach(function (p) {
      var x = p.x - m.camara;
      if (x < -140 || x > W + 140) return;
      var al = H * .30;
      cx.save();
      cx.strokeStyle = '#0d0a14';
      cx.lineWidth = 5;
      cx.beginPath();
      cx.moveTo(x, y); cx.lineTo(x, y - al); cx.stroke();
      cx.beginPath();
      cx.moveTo(x, y - al);
      cx.quadraticCurveTo(x + al * .10, y - al * 1.07, x + al * .17, y - al * .99);
      cx.stroke();
      cx.restore();
      var late = .62 + .38 * Math.sin(t * 1.5 + p.semilla * 9);
      // Alguno falla, como en toda feria.
      if (Math.sin(t * 6 + p.semilla * 21) > -.94) {
        D.bombita(x + al * .17, y - al * .97, 3, '255,198,124', late);
        D.resplandor(x + al * .17, y - al * .97, al * .62, '255,178,96', .10 * late);
        // Charco de luz en el piso.
        cx.save();
        cx.globalCompositeOperation = 'lighter';
        var gg = cx.createRadialGradient(x + al * .17, y + 6, 0, x + al * .17, y + 6, al * .50);
        gg.addColorStop(0, 'rgba(255,180,96,' + (.16 * late) + ')');
        gg.addColorStop(1, 'rgba(255,180,96,0)');
        cx.fillStyle = gg;
        cx.beginPath();
        cx.ellipse(x + al * .17, y + 6, al * .50, al * .085, 0, 0, 6.2832);
        cx.fill();
        cx.restore();
      }
    });
  }

  /* Guirnaldas que cruzan de poste a poste. */
  function guirnaldas(cx, m, W, H, t) {
    var y = H * SUELO;
    var al = H * .30;
    for (var i = 0; i < m.postes.length - 1; i++) {
      var a = m.postes[i], b = m.postes[i + 1];
      var x1 = a.x - m.camara + al * .17, x2 = b.x - m.camara + al * .17;
      if (x2 < -60 || x1 > W + 60) continue;
      var y1 = y - al * .95, y2 = y - al * .95;
      cx.save();
      cx.strokeStyle = 'rgba(8,6,16,.85)';
      cx.lineWidth = 1.4;
      cx.beginPath();
      cx.moveTo(x1, y1);
      cx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + 54, x2, y2);
      cx.stroke();
      cx.restore();
      var N = 11;
      for (var k = 1; k < N; k++) {
        var u = k / N, iu = 1 - u;
        var bx = iu * iu * x1 + 2 * iu * u * ((x1 + x2) / 2) + u * u * x2;
        var by = iu * iu * y1 + 2 * iu * u * ((y1 + y2) / 2 + 54) + u * u * y2;
        if (Math.sin(t * 2 + k * 1.1 + i * 3) < -.82) continue;
        var col = (k % 3 === 0) ? '255,196,128' : (k % 3 === 1) ? '196,110,116' : '150,196,176';
        D.bombita(bx, by, 2, col, .5 + .5 * Math.sin(t * 2.6 + k + i));
      }
    }
  }

  return {
    ANCHO: ANCHO, SUELO: SUELO, VELOCIDAD: VELOCIDAD, PARADAS: PARADAS,
    crear: crear, sembrar: sembrar, seguirCamara: seguirCamara,
    paradaCerca: paradaCerca,
    fondo: fondo, suelo: suelo, trastos: trastos, postes: postes,
    guirnaldas: guirnaldas
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Mundo; }
