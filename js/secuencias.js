/* Secuencias: los momentos en que el juego toma el control.

   Mientras corre una secuencia, Bel deja de responder a las flechas y la cámara
   se despega de ella para seguir lo que importe. Cada secuencia es una lista de
   fases con su duración; el motor avanza sola y llama a pintar() con el
   progreso, así el dibujo no tiene que llevar la cuenta del tiempo. */
var Secuencias = (function () {
  'use strict';

  var A = (typeof Atracciones !== 'undefined') ? Atracciones : require('./atracciones.js');
  var B = (typeof Bel !== 'undefined') ? Bel : require('./bel.js');
  var D = (typeof Dib !== 'undefined') ? Dib : require('./dibujo.js');

  /* ============ motor ============ */

  function iniciar(clave, ctx) {
    var def = DEFS[clave];
    if (!def) return null;
    return {
      clave: clave,
      def: def,
      fase: 0,
      t: 0,
      total: 0,
      datos: def.arranque ? def.arranque(ctx) : {},
      terminada: false
    };
  }

  function avanzar(s, dt, ctx) {
    if (!s || s.terminada) return;
    s.t += dt;
    s.total += dt;
    var f = s.def.fases[s.fase];
    // Algunas fases no terminan por reloj sino cuando el carro llegó a destino.
    var cumplida = f.hasta ? f.hasta(s, ctx) : false;
    if (cumplida || s.t >= f.dur) {
      // Si terminó por condición, el reloj arranca de cero: restar la duración
      // completa dejaba un sobrante negativo que estiraba la fase siguiente.
      s.t = cumplida ? 0 : s.t - f.dur;
      s.fase++;
      if (s.fase >= s.def.fases.length) {
        s.terminada = true;
        s.fase = s.def.fases.length - 1;
        s.t = f.dur;
      }
    }
  }

  function faseActual(s) { return s.def.fases[s.fase]; }
  // Progreso dentro de la fase, de 0 a 1.
  function u(s) {
    var f = faseActual(s);
    return Math.max(0, Math.min(1, s.t / f.dur));
  }

  /* Suavizados. Los tramos que arrancan y frenan de golpe se sienten mecánicos. */
  function suave(x) { return x * x * (3 - 2 * x); }
  function entra(x) { return 1 - Math.pow(1 - x, 3); }
  function sale(x) { return x * x * x; }

  /* ============ la montaña rusa ============ */

  /* El carro recorre el perfil de la vía. En la subida lo lleva la cadena a
     velocidad constante; a partir de la cima manda la gravedad: cuanto más
     abajo está, más rápido va. Es la misma cuenta que hace una montaña rusa
     de verdad, y por eso el ritmo se siente bien sin ajustar nada a mano. */

  // No es la gravedad real: es la que hace que el recorrido dure lo que tiene
// que durar en pantalla. Con la de verdad, el circuito se termina en un segundo.
var GRAVEDAD = 130;

  function montaniaArranque(ctx) {
    return {
      // Posición sobre la vía, de 0 a 1.
      p: 0,
      v: 0,
      alturaCima: 0,
      // Para el clac-clac de la cadena.
      ultimoClac: 0,
      clacs: 0,
      grito: false
    };
  }

  /* Punto de la vía y su pendiente, en coordenadas de mundo. */
  function puntoVia(ctx, p) {
    var pts = ctx.via;
    var i = Math.max(0, Math.min(pts.length - 2, Math.floor(p * (pts.length - 1))));
    var f = p * (pts.length - 1) - i;
    var a = pts[i], b = pts[i + 1];
    return {
      x: a.x + (b.x - a.x) * f,
      y: a.y + (b.y - a.y) * f,
      ang: Math.atan2(b.y - a.y, b.x - a.x)
    };
  }

  /* Avance físico del carro sobre la vía. */
  function montaniaFisica(s, ctx, dt) {
    var d = s.datos;
    var fase = faseActual(s).nombre;
    var pts = ctx.via;
    var largo = ctx.largoVia;

    if (fase === 'cadena') {
      // La cadena sube a velocidad pareja, sin importar la pendiente.
      d.v = 105;
      d.p += (d.v * dt) / largo;
      if (d.p > ctx.pCima) d.p = ctx.pCima;
      // Un clac por cada tramo de cadena.
      d.ultimoClac += dt;
      if (d.ultimoClac > .17) { d.ultimoClac = 0; d.clacs++; if (ctx.alClac) ctx.alClac(); }

    } else if (fase === 'cima') {
      // Se descuelga y se deja caer.
      d.v = 26;
      d.p += (d.v * dt) / largo;

    } else if (fase === 'recorrido') {
      var punto = puntoVia(ctx, d.p);
      // Energía: la velocidad sale de cuánto bajó respecto de la cima.
      var caida = punto.y - ctx.yCima;          // y crece hacia abajo
      var v2 = 2 * GRAVEDAD * Math.max(0, caida) + 900;
      d.v = Math.sqrt(v2);
      // Rozamiento proporcional a lo ya recorrido: cada loma llega con menos.
      d.v *= (1 - .10 * (d.p - ctx.pCima) / (1 - ctx.pCima));
      d.p += (d.v * dt) / largo;
      if (d.p > 1) d.p = 1;
      if (!d.grito && d.v > 250) { d.grito = true; if (ctx.alGrito) ctx.alGrito(); }

    } else if (fase === 'frenar') {
      d.v *= Math.pow(.08, dt);
      d.p += (d.v * dt) / largo;
      if (d.p > 1) d.p = 1;
    }
  }

  /* Dónde tiene que mirar la cámara durante la secuencia. */
  function montaniaCamara(s, ctx) {
    var fase = faseActual(s).nombre;
    var d = s.datos;
    if (fase === 'acercarse' || fase === 'bajar') {
      return { x: ctx.xEstacion + 80, y: 0, zoom: 1 };
    }
    var punto = puntoVia(ctx, d.p);
    // En la caída la cámara se acerca un poco: da vértigo.
    var zoom = 1;
    if (fase === 'recorrido') zoom = 1 + Math.min(.16, d.v / 2100);
    if (fase === 'cima') zoom = 1.06;
    return { x: punto.x, y: punto.y, zoom: zoom };
  }

  /* Dibuja el carro con Bel adentro, inclinado según la vía.
     camaraX es el desplazamiento del mundo; piso es la línea del suelo en
     pantalla. El zoom lo aplica el motor por fuera con un transform. */
  function dibujarCarro(cx, ctx, s, camaraX, piso) {
    var d = s.datos;
    var fase = faseActual(s).nombre;
    var punto = puntoVia(ctx, d.p);
    var sx = punto.x - camaraX;
    var sy = piso + punto.y;
    var esc = 1;

    cx.save();
    cx.translate(sx, sy);
    cx.rotate(punto.ang);

    var an = 108, al = 62;

    // Sombra sobre la vía.
    cx.fillStyle = 'rgba(0,0,0,.4)';
    cx.beginPath();
    cx.ellipse(0, al * .44, an * .58, al * .12, 0, 0, 6.2832);
    cx.fill();

    // Respaldo y pared de atrás: van antes que Bel para que quede adentro.
    cx.fillStyle = '#241a36';
    cx.beginPath();
    cx.moveTo(-an * .50, al * .40);
    cx.lineTo(-an * .54, -al * .66);
    cx.quadraticCurveTo(-an * .50, -al * .84, -an * .38, -al * .82);
    cx.lineTo(-an * .30, al * .40);
    cx.closePath();
    cx.fill();

    // Bel sentada adentro.
    cx.save();
    cx.translate(-an * .10, al * .26);
    B.sentada(cx, 0, 0, .80, 1);
    cx.restore();

    // Casco delantero del vagón: tapa a Bel de la cintura para abajo.
    cx.fillStyle = '#3a2a55';
    cx.beginPath();
    cx.moveTo(-an * .52, al * .02);
    cx.lineTo(an * .40, al * .02);
    cx.quadraticCurveTo(an * .58, al * .12, an * .52, al * .30);
    cx.quadraticCurveTo(an * .46, al * .44, an * .28, al * .44);
    cx.lineTo(-an * .34, al * .44);
    cx.quadraticCurveTo(-an * .56, al * .40, -an * .52, al * .02);
    cx.closePath();
    cx.fill();

    // Franja de color y filo iluminado.
    cx.fillStyle = '#c23a48';
    cx.beginPath();
    cx.moveTo(-an * .50, al * .12);
    cx.lineTo(an * .44, al * .12);
    cx.lineTo(an * .42, al * .26);
    cx.lineTo(-an * .50, al * .26);
    cx.closePath();
    cx.fill();
    cx.strokeStyle = 'rgba(255,200,140,.30)';
    cx.lineWidth = 1.6;
    cx.beginPath();
    cx.moveTo(-an * .52, al * .02);
    cx.lineTo(an * .40, al * .02);
    cx.stroke();

    // Trompa en punta.
    cx.fillStyle = '#48356b';
    cx.beginPath();
    cx.moveTo(an * .38, al * .02);
    cx.quadraticCurveTo(an * .74, al * .14, an * .56, al * .34);
    cx.lineTo(an * .36, al * .40);
    cx.closePath();
    cx.fill();

    // Barra de seguridad, por delante del torso.
    cx.strokeStyle = '#5a4a78';
    cx.lineWidth = 5;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(-an * .34, -al * .18);
    cx.lineTo(an * .24, -al * .18);
    cx.stroke();
    cx.beginPath();
    cx.moveTo(-an * .34, -al * .18);
    cx.lineTo(-an * .40, al * .06);
    cx.stroke();

    // Ruedas.
    cx.fillStyle = '#12101c';
    [-an * .30, an * .24].forEach(function (rx) {
      cx.beginPath();
      cx.arc(rx, al * .46, 8, 0, 6.2832);
      cx.fill();
    });

    cx.restore();

    // Estela de velocidad en la caída.
    if (fase === 'recorrido' && d.v > 170) {
      var q = Math.min(1, (d.v - 170) / 240);
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      cx.strokeStyle = 'rgba(200,220,255,' + (.18 * q) + ')';
      cx.lineWidth = 1.6;
      for (var i = 0; i < 7; i++) {
        var off = (i - 3) * 12 * esc;
        var largo2 = (40 + i * 9) * q * esc;
        cx.beginPath();
        cx.moveTo(sx - Math.cos(punto.ang) * 30 * esc + off * Math.sin(punto.ang),
                  sy - Math.sin(punto.ang) * 30 * esc - off * Math.cos(punto.ang));
        cx.lineTo(sx - Math.cos(punto.ang) * (30 * esc + largo2) + off * Math.sin(punto.ang),
                  sy - Math.sin(punto.ang) * (30 * esc + largo2) - off * Math.cos(punto.ang));
        cx.stroke();
      }
      cx.restore();
    }
  }

  var DEFS = {
    montania: {
      arranque: montaniaArranque,
      fisica: montaniaFisica,
      camara: montaniaCamara,
      dibujar: dibujarCarro,
      fases: [
        { nombre: 'acercarse', dur: 1.8 },
        // La cuesta termina cuando llega arriba, no cuando se cumple un reloj.
        { nombre: 'cadena', dur: 14,
          hasta: function (s, ctx) { return s.datos.p >= ctx.pCima - .001; } },
        { nombre: 'cima', dur: 1.6 },
        { nombre: 'recorrido', dur: 16,
          hasta: function (s, ctx) { return s.datos.p >= .988; } },
        { nombre: 'frenar', dur: 2.0 },
        { nombre: 'bajar', dur: 1.8 }
      ],
      // Lo que se lee en pantalla en cada fase.
      rotulos: {
        acercarse: '',
        cadena: 'clac… clac… clac…',
        cima: '',
        recorrido: '',
        frenar: '',
        bajar: ''
      }
    }
  };

  return {
    iniciar: iniciar, avanzar: avanzar, faseActual: faseActual, u: u,
    puntoVia: puntoVia, DEFS: DEFS,
    suave: suave, entra: entra, sale: sale
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Secuencias; }
