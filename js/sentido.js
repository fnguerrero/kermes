/* El sentido.

   Bel percibe cosas antes de que pasen. Al activarlo el tiempo casi se detiene,
   el oído se le agudiza y aparecen las señales: puntos donde hay algo que está
   por ocurrir o algo que no cierra.

   Es un recurso, no un modo: se gasta mientras está puesto y tarda en volver.
   Y hay señales que caducan — si no llegás a leerlas, pasa lo que iba a pasar.

   Reemplaza a la mirada anterior, que mostraba rastros bonitos pero inertes:
   se veían, no servían para nada. */
var Sentido = (function () {
  'use strict';

  var GASTO = .30;          // fracción de carga por segundo con el sentido puesto
  var RECARGA = .13;        // fracción por segundo cuando está guardado
  var LENTITUD = .16;       // a qué velocidad corre el mundo con el sentido puesto

  /* Las señales de cada atracción.
       tipo    'peligro' | 'presencia' | 'anomalia'
       x       posición relativa al centro de la parada
       y       altura sobre el piso (0 = suelo)
       aviso   lo que el sentido le grita antes de saber qué es
       info    lo que baja al leerla
       urgente si es true, caduca: hay que llegar antes de que se acabe la carga */
  var SENALES = {
    entrada: [{
      tipo: 'presencia', x: 120, y: -60,
      aviso: 'Alguien pasó por acá hace un rato',
      info: 'El molinete todavía está frenando. Alguien lo cruzó hace menos de un minuto, ' +
            'y lo cruzó para adentro. Bel es la segunda persona que entra esta noche.'
    }],
    tiro: [{
      tipo: 'peligro', x: -30, y: -95, urgente: true,
      aviso: 'Algo se va a caer',
      info: 'El rifle de la izquierda está apoyado en el borde y el mostrador tiene ' +
            'caída para afuera. En unos segundos se viene abajo. Bel lo corre antes.'
    }],
    calesita: [{
      tipo: 'anomalia', x: 40, y: -120,
      aviso: 'Esto no gira solo',
      info: 'La calesita no tiene el eje conectado al motor: el eje está cortado y ' +
            'las puntas ni se tocan. Gira igual, a la velocidad de siempre.'
    }],
    montania: [{
      tipo: 'peligro', x: -180, y: -260, urgente: true,
      aviso: 'La estructura está cediendo',
      info: 'La tercera columna de la subida tiene los bulones flojos y la madera ' +
            'partida en diagonal. Aguanta un viaje más. Bel lo sabe antes de subir, ' +
            'y sube igual.'
    }],
    chocadores: [{
      tipo: 'anomalia', x: 20, y: -140,
      aviso: 'Ese autito no debería andar',
      info: 'La llave general está baja y la malla del techo no tiene tensión. ' +
            'El autito que da vueltas no está tomando corriente de ningún lado.'
    }],
    espejos: [{
      tipo: 'presencia', x: 60, y: -150,
      aviso: 'Hay alguien del otro lado',
      info: 'En el panel del medio hay alguien parado, y no es un reflejo: cuando Bel ' +
            'se mueve, ese no se mueve. Espera a que ella se vaya para volver a caminar.'
    }],
    martillo: [{
      tipo: 'anomalia', x: 0, y: -300,
      aviso: 'Va a sonar',
      info: 'La campana está por sonar sin que nadie pegue. Bel cuenta hasta tres y ' +
            'suena. Después se queda callada, como si hubiera saludado.'
    }],
    rueda: [{
      tipo: 'peligro', x: 90, y: -220, urgente: true,
      aviso: 'Una cabina está por soltarse',
      info: 'La cabina que viene bajando tiene un solo perno y está trabajando torcida. ' +
            'Bel se corre del lugar donde va a caer. No cae: se endereza sola.'
    }],
    carpa: [{
      tipo: 'presencia', x: 0, y: -110,
      aviso: 'Adentro saben que estás acá',
      info: 'Hay alguien sentado adentro, quieto, con la cara hacia la puerta. ' +
            'No se movió desde que Bel entró a la feria. La está esperando desde antes.'
    }]
  };

  var COLORES = {
    peligro:   '255,120,110',
    presencia: '190,170,255',
    anomalia:  '150,230,210'
  };

  function crear() {
    return {
      activo: false,
      carga: 1,
      intensidad: 0,        // 0 mundo normal, 1 tiempo detenido
      leidas: {},
      perdidas: {},
      revelacion: null,     // la ficha que está en pantalla
      tRevelacion: 0,
      aviso: null,          // el texto corto del sentido
      tAviso: 0,
      pulso: 0              // onda que sale de Bel al activarlo
    };
  }

  /* Devuelve false si no había carga suficiente. */
  function activar(s) {
    if (s.activo) { s.activo = false; return false; }
    if (s.carga < .12) return false;
    s.activo = true;
    s.pulso = 1;
    return true;
  }

  function actualizar(s, dtReal) {
    if (s.activo) {
      s.carga -= GASTO * dtReal;
      if (s.carga <= 0) { s.carga = 0; s.activo = false; }
    } else if (!s.revelacion) {
      s.carga = Math.min(1, s.carga + RECARGA * dtReal);
    }
    var objetivo = s.activo ? 1 : 0;
    s.intensidad += (objetivo - s.intensidad) * (1 - Math.pow(0.0008, dtReal));
    if (s.pulso > 0) s.pulso = Math.max(0, s.pulso - dtReal * .9);
    if (s.tAviso > 0) { s.tAviso -= dtReal; if (s.tAviso <= 0) s.aviso = null; }
    if (s.tRevelacion > 0) {
      s.tRevelacion -= dtReal;
      if (s.tRevelacion <= 0) s.revelacion = null;
    }
  }

  /* Cuánto corre el mundo. Con el sentido puesto, casi nada. */
  function escalaTiempo(s) {
    return 1 - (1 - LENTITUD) * s.intensidad;
  }

  function senalCerca(s, parada, belX) {
    if (!s.activo || s.intensidad < .35) return null;
    var lista = SENALES[parada.clave];
    if (!lista) return null;
    for (var i = 0; i < lista.length; i++) {
      var sx = parada.x + lista[i].x;
      if (Math.abs(belX - sx) < 130) {
        lista[i]._x = sx; lista[i]._parada = parada.clave;
        return lista[i];
      }
    }
    return null;
  }

  /* La señal más cercana en cualquier parada, para el aviso general. */
  function avisar(s, paradas, belX) {
    if (!s.activo) return;
    for (var i = 0; i < paradas.length; i++) {
      var lista = SENALES[paradas[i].clave];
      if (!lista) continue;
      for (var j = 0; j < lista.length; j++) {
        var sx = paradas[i].x + lista[j].x;
        if (Math.abs(belX - sx) < 420 && !s.leidas[paradas[i].clave]) {
          if (s.aviso !== lista[j].aviso) { s.aviso = lista[j].aviso; s.tAviso = 3; }
          return;
        }
      }
    }
  }

  function leer(s, senal) {
    if (!senal || s.leidas[senal._parada]) return false;
    s.leidas[senal._parada] = true;
    s.revelacion = senal;
    s.tRevelacion = 7.5;
    s.activo = false;         // leerla consume el momento
    return true;
  }

  function contar(s) { return Object.keys(s.leidas).length; }
  function total() { return Object.keys(SENALES).length; }

  /* ---------- dibujo ---------- */

  /* Lo que pasa con la imagen cuando el tiempo se frena: el color se va,
     queda el contraste, y todo se pone un poco más frío. */
  function veloFondo(cx, s, W, H) {
    if (s.intensidad < .01) return;
    var q = s.intensidad;
    cx.save();
    cx.globalCompositeOperation = 'saturation';
    cx.fillStyle = 'hsl(0,' + Math.round(100 - 78 * q) + '%,50%)';
    cx.fillRect(-W, -H, W * 3, H * 3);
    cx.restore();
    cx.save();
    cx.fillStyle = 'rgba(10,16,34,' + (.30 * q) + ')';
    cx.fillRect(-W, -H, W * 3, H * 3);
    cx.restore();
  }

  /* La onda que sale de Bel al activarlo: es lo que hace que se sienta un
     sentido y no un filtro de color. */
  function onda(cx, s, belXPantalla, piso, H) {
    if (s.pulso <= 0) return;
    var q = s.pulso;
    var r = (1 - q) * H * 1.6;
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.strokeStyle = 'rgba(170,200,255,' + (.30 * q * q) + ')';
    cx.lineWidth = 2 + 6 * q;
    cx.beginPath();
    cx.arc(belXPantalla, piso - H * .18, r, 0, 6.2832);
    cx.stroke();
    cx.strokeStyle = 'rgba(140,180,255,' + (.16 * q) + ')';
    cx.lineWidth = 1.5;
    cx.beginPath();
    cx.arc(belXPantalla, piso - H * .18, r * .72, 0, 6.2832);
    cx.stroke();
    cx.restore();
  }

  /* Una señal: un punto que late, con anillos. Los urgentes laten más rápido
     y se ponen rojos a medida que se agota la carga. */
  function dibujarSenal(cx, sen, s, x, y, t, leida, cerca) {
    var q = s.intensidad;
    if (q < .05) return;
    var col = leida ? '150,160,190' : COLORES[sen.tipo];
    var urge = sen.urgente && !leida ? (1 - s.carga) : 0;
    var ritmo = 2.2 + urge * 5;
    var late = .55 + .45 * Math.sin(t * ritmo + x * .01);

    cx.save();
    cx.globalAlpha = q;
    cx.globalCompositeOperation = 'lighter';

    // Anillos que se cierran hacia el punto.
    for (var i = 0; i < 3; i++) {
      var f = ((t * .7 + i / 3) % 1);
      var rr = 46 * (1 - f) + 8;
      cx.strokeStyle = 'rgba(' + col + ',' + (.30 * (1 - f) * (leida ? .4 : 1)) + ')';
      cx.lineWidth = 1.6;
      cx.beginPath();
      cx.arc(x, y, rr, 0, 6.2832);
      cx.stroke();
    }

    // Halo y punto.
    var g = cx.createRadialGradient(x, y, 0, x, y, 34);
    g.addColorStop(0, 'rgba(' + col + ',' + (.50 * late) + ')');
    g.addColorStop(1, 'rgba(' + col + ',0)');
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(x, y, 34, 0, 6.2832); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,' + (.85 * late) + ')';
    cx.beginPath(); cx.arc(x, y, cerca ? 5 : 3.4, 0, 6.2832); cx.fill();

    // Marca de leída.
    if (leida) {
      cx.fillStyle = 'rgba(' + col + ',.7)';
      cx.font = "13px 'Cormorant Garamond',serif";
      cx.textAlign = 'center';
      cx.fillText('✦', x, y - 22);
    }
    cx.restore();
  }

  return {
    SENALES: SENALES, COLORES: COLORES,
    crear: crear, activar: activar, actualizar: actualizar,
    escalaTiempo: escalaTiempo, senalCerca: senalCerca, avisar: avisar,
    leer: leer, contar: contar, total: total,
    veloFondo: veloFondo, onda: onda, dibujarSenal: dibujarSenal
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Sentido; }
