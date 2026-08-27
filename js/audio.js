/* Música y sonido, generados en vivo con Web Audio.
   No hay archivos: todo sale de osciladores, así el juego pesa lo que pesa el
   código. La música reacciona a la tensión de la escena: cuando algo se acerca,
   el vals se desafina más, se enlentece y aparece un pulso grave. */
var Audio2 = (function () {
  'use strict';

  var ac = null, maestro = null, reverb = null;
  var encendido = false, bucle = null, proximo = 0, paso = 0;
  var tension = 0, objetivoTension = 0;
  var listo = false;

  function crear() {
    if (ac) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    maestro = ac.createGain();
    maestro.gain.value = 0;

    // Reverb: ruido que decae. Da la sensación de descampado.
    reverb = ac.createConvolver();
    var len = Math.floor(ac.sampleRate * 2.4);
    var buf = ac.createBuffer(2, len, ac.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.7);
    }
    reverb.buffer = buf;

    var seco = ac.createGain(); seco.gain.value = .70;
    var mojado = ac.createGain(); mojado.gain.value = .48;
    maestro.connect(seco).connect(ac.destination);
    maestro.connect(reverb).connect(mojado).connect(ac.destination);

    // Drone grave permanente: dos sierras batiendo apenas.
    [55, 55.32, 82.4].forEach(function (f, i) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = i === 2 ? 'triangle' : 'sawtooth';
      o.frequency.value = f;
      g.gain.value = i === 2 ? .038 : .058;
      var lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 250; lp.Q.value = 1.1;
      o.connect(g).connect(lp).connect(maestro);
      o.start();
    });
    listo = true;
  }

  // Vals de calesita en menor. Los grados están en semitonos desde Do.
  var MELODIA = [
    0, 3, 7, 3, 10, 7, 3, 7,
    0, 3, 7, 10, 12, 10, 7, 3,
    -2, 2, 5, 2, 9, 5, 2, 5,
    0, 3, 7, 3, 8, 7, 3, 0
  ];

  function nota(semi, cuando, dur, vol) {
    if (!ac) return;
    // El desafine crece con la tensión: la calesita se va rompiendo.
    var desvio = (Math.sin(semi * 12.9898 + paso * .37) * .006) * (1 + tension * 3.5);
    var f = 261.63 * Math.pow(2, semi / 12) * (1 + desvio);
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    var bp = ac.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = f * 2.1; bp.Q.value = .8;
    g.gain.setValueAtTime(0, cuando);
    g.gain.linearRampToValueAtTime(vol, cuando + .012);
    g.gain.exponentialRampToValueAtTime(.0001, cuando + dur);
    o.connect(bp).connect(g).connect(maestro);
    o.start(cuando); o.stop(cuando + dur + .05);
  }

  function golpe(cuando, vol) {
    if (!ac) return;
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(96, cuando);
    o.frequency.exponentialRampToValueAtTime(42, cuando + .16);
    g.gain.setValueAtTime(vol, cuando);
    g.gain.exponentialRampToValueAtTime(.0001, cuando + .3);
    o.connect(g).connect(maestro);
    o.start(cuando); o.stop(cuando + .35);
  }

  function campana(cuando, alto) {
    if (!ac) return;
    var base = alto ? 1318 : 1046;
    [1, 2.76, 5.4].forEach(function (m, i) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = base * m;
      g.gain.setValueAtTime(0, cuando);
      g.gain.linearRampToValueAtTime(.045 / (i + 1), cuando + .008);
      g.gain.exponentialRampToValueAtTime(.0001, cuando + 3.2 / (i + 1));
      o.connect(g).connect(maestro);
      o.start(cuando); o.stop(cuando + 3.4);
    });
  }

  // Latido grave: aparece cuando la tensión sube.
  function latido(cuando, fuerza) {
    if (!ac) return;
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(58, cuando);
    o.frequency.exponentialRampToValueAtTime(31, cuando + .38);
    g.gain.setValueAtTime(0, cuando);
    g.gain.linearRampToValueAtTime(.20 * fuerza, cuando + .03);
    g.gain.exponentialRampToValueAtTime(.0001, cuando + .5);
    o.connect(g).connect(maestro);
    o.start(cuando); o.stop(cuando + .55);
  }

  function programar() {
    if (!ac || !encendido) return;
    // La tensión sube despacio: los cambios de música no deben ser bruscos.
    tension += (objetivoTension - tension) * .06;
    var PASO = .34 + tension * .10;              // se enlentece con la tensión
    var horizonte = ac.currentTime + .7;
    var guardia = 0;
    while (proximo < horizonte && guardia++ < 40) {
      var i = paso % MELODIA.length;
      if (paso % 3 === 0) golpe(proximo, .15 * (1 - tension * .5));
      nota(MELODIA[i] - 12, proximo, 1.1, .095 * (1 - tension * .35));
      if (paso % 3 !== 0) nota(MELODIA[i], proximo, .8, .05 * (1 - tension * .4));
      if (paso % 48 === 12) campana(proximo);
      if (tension > .35 && paso % 6 === 0) latido(proximo, tension);
      proximo += PASO;
      paso++;
    }
  }

  /* --- efectos puntuales --- */

  function efecto(tipo) {
    if (!ac || !encendido) return;
    var ahora = ac.currentTime;
    if (tipo === 'carta') {
      // Roce de cartón.
      var n = ruido(.09);
      var bp = ac.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = .7;
      var g = ac.createGain();
      g.gain.setValueAtTime(.10, ahora);
      g.gain.exponentialRampToValueAtTime(.0001, ahora + .12);
      n.connect(bp).connect(g).connect(maestro);
    } else if (tipo === 'paso') {
      var n2 = ruido(.14);
      var lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 700;
      var g2 = ac.createGain();
      g2.gain.setValueAtTime(.07, ahora);
      g2.gain.exponentialRampToValueAtTime(.0001, ahora + .16);
      n2.connect(lp).connect(g2).connect(maestro);
    } else if (tipo === 'aparicion') {
      // Golpe grave con la campana desafinada encima.
      latido(ahora, 1);
      campana(ahora + .05, false);
      var o = ac.createOscillator(), g3 = ac.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(120, ahora);
      o.frequency.exponentialRampToValueAtTime(34, ahora + 1.1);
      g3.gain.setValueAtTime(.10, ahora);
      g3.gain.exponentialRampToValueAtTime(.0001, ahora + 1.2);
      var lp3 = ac.createBiquadFilter();
      lp3.type = 'lowpass'; lp3.frequency.value = 400;
      o.connect(lp3).connect(g3).connect(maestro);
      o.start(ahora); o.stop(ahora + 1.3);
    } else if (tipo === 'bien') {
      [0, 4, 7].forEach(function (s, i) {
        nota(s + 12, ahora + i * .06, .9, .05);
      });
    } else if (tipo === 'mal') {
      [0, 1, 6].forEach(function (s, i) {
        nota(s, ahora + i * .05, 1.1, .045);
      });
    } else if (tipo === 'revelacion') {
      campana(ahora, true);
      campana(ahora + .35, false);
    }
  }

  function ruido(dur) {
    var len = Math.max(1, Math.floor(ac.sampleRate * dur));
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = ac.createBufferSource();
    src.buffer = buf; src.start();
    return src;
  }

  /* --- control --- */

  function alternar() {
    crear();
    if (!ac) return false;
    if (ac.state === 'suspended') ac.resume();
    encendido = !encendido;
    maestro.gain.cancelScheduledValues(ac.currentTime);
    maestro.gain.linearRampToValueAtTime(encendido ? .48 : 0,
      ac.currentTime + (encendido ? 1.6 : .5));
    if (encendido) {
      proximo = ac.currentTime + .1;
      if (!bucle) bucle = setInterval(programar, 140);
    }
    return encendido;
  }

  function estaEncendido() { return encendido; }
  // 0 tranquilo, 1 la presencia encima.
  function setTension(v) { objetivoTension = Math.max(0, Math.min(1, v)); }

  /* --- que no siga sonando con la pestaña de fondo ---
     El bucle vive en un setInterval y el AudioContext no se entera de que
     nadie está mirando: una pestaña olvidada seguía con la música puesta.
     Se suspende el contexto al ocultarse y se cierra al salir. */
  function dormir() {
    if (ac && ac.state === 'running') {
      try { ac.suspend(); } catch (e) { /* nada */ }
    }
  }

  function despertar() {
    if (ac && ac.state === 'suspended' && encendido) {
      try { ac.resume(); } catch (e) { /* nada */ }
    }
  }

  function apagar() {
    if (bucle) { clearInterval(bucle); bucle = null; }
    encendido = false;
    if (ac) {
      try { ac.close(); } catch (e) { /* nada */ }
      ac = null;
      maestro = null;
      listo = false;
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) dormir(); else despertar();
  });
  window.addEventListener('blur', dormir);
  window.addEventListener('focus', despertar);
  window.addEventListener('pagehide', apagar);
  window.addEventListener('beforeunload', apagar);

  return {
    alternar: alternar, estaEncendido: estaEncendido,
    setTension: setTension, efecto: efecto,
    dormir: dormir, despertar: despertar, apagar: apagar
  };
})();
