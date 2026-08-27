/* Motor de Kermés: estado, pantallas y el recorrido por la feria.
   El canvas dibuja la escena todo el tiempo por detrás; la interfaz va en HTML
   encima, así el texto se puede leer y seleccionar como corresponde. */
var Juego = (function () {
  'use strict';

  var VISITAS_PARA_CERRAR = 4;    // cuántas atracciones habilitan la carpa final
  var UMBRAL_ENCUENTRO = 1.0;     // tensión acumulada que hace aparecer la presencia
  var GUARDADO = 'kermes.partida.v1';

  var raiz = null, cv = null, cx = null;
  var W = 0, H = 0, dpr = 1, t = 0;
  var escenaActual = 'entrada';
  var estado = null;
  var sacudida = 0;

  /* ==================== utilidades ==================== */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function azar(a) { return a[Math.floor(Math.random() * a.length)]; }
  function mezclar(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }

  /* ==================== canvas ==================== */

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    Dib.usar(cx, W, H, t, true);
    Dib.sembrar();
    Dib.sembrarMotas(46);
  }

  function pintar() {
    t += 1 / 60;
    if (sacudida > 0) sacudida *= .90;

    cx.save();
    if (sacudida > .01) {
      cx.translate((Math.random() - .5) * sacudida * 26,
                   (Math.random() - .5) * sacudida * 26);
    }
    Dib.usar(cx, W, H, t, true);
    var esc = Escenas.get(escenaActual);
    if (esc) {
      try {
        esc.pinta({ cx: cx, t: t, luna: estado ? estado.luna : Luna.estado(), W: W, H: H });
      } catch (err) {
        cx.fillStyle = '#0a0810'; cx.fillRect(0, 0, W, H);
        if (!pintar.avisado) { console.error('escena', escenaActual, err); pintar.avisado = true; }
      }
    }
    // La presencia se dibuja encima cuando está cerca.
    if (estado && estado.tension > .45 && escenaActual !== 'vidente') {
      var q = Math.min(1, (estado.tension - .45) / .55);
      Dib.presencia(.88, .93, .30 * (.6 + q * .5), q * .85);
    }
    if (estado) Dib.vineta(Math.min(1, estado.tension * .8));
    cx.restore();
    requestAnimationFrame(pintar);
  }

  /* ==================== estado ==================== */

  function nuevaPartida(nombre) {
    var luna = Luna.estado();
    var claves = mezclar(Arcanos.claves());
    function sacar() {
      var c = claves.pop();
      return Arcanos.instancia(c, Math.random() < .3);
    }
    estado = {
      nombre: nombre || 'Bel',
      luna: luna,
      tirada: { busca: sacar(), espera: sacar(), cierre: sacar() },
      mazo: claves,
      mano: [],
      visitadas: {},
      hechas: {},
      marcas: {},
      tension: 0,
      encuentros: 0,
      encuentrosConCarta: 0,
      cartasGanadas: 0,
      hilosResueltos: 0,
      terminada: false
    };
    guardar();
  }

  function robar() {
    if (!estado.mazo.length) return null;
    var c = Arcanos.instancia(estado.mazo.pop(), Math.random() < .28);
    estado.mano.push(c);
    estado.cartasGanadas++;
    return c;
  }

  function contarVisitadas() { return Object.keys(estado.visitadas).length; }

  /* Los tres hilos de la tirada se resuelven así:
       busca  — juntó cartas suficientes como para volver con algo
       espera — enfrentó a la presencia con una carta cada vez
       cierre — recorrió la feria en serio antes de ir a la carpa */
  function calcularHilos() {
    var n = 0;
    if (estado.cartasGanadas >= 4) n++;
    if (estado.encuentros > 0 && estado.encuentrosConCarta === estado.encuentros) n++;
    if (contarVisitadas() >= VISITAS_PARA_CERRAR) n++;
    estado.hilosResueltos = n;
    return n;
  }

  function guardar() {
    try {
      localStorage.setItem(GUARDADO, JSON.stringify({
        nombre: estado.nombre,
        tirada: {
          busca: [estado.tirada.busca.clave, estado.tirada.busca.invertida],
          espera: [estado.tirada.espera.clave, estado.tirada.espera.invertida],
          cierre: [estado.tirada.cierre.clave, estado.tirada.cierre.invertida]
        },
        mazo: estado.mazo,
        mano: estado.mano.map(function (c) { return [c.clave, c.invertida]; }),
        visitadas: estado.visitadas, hechas: estado.hechas, marcas: estado.marcas,
        tension: estado.tension, encuentros: estado.encuentros,
        encuentrosConCarta: estado.encuentrosConCarta,
        cartasGanadas: estado.cartasGanadas, escena: escenaActual
      }));
    } catch (e) { /* sin almacenamiento se juega igual */ }
  }
  function leerGuardado() {
    try {
      var raw = localStorage.getItem(GUARDADO);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function borrarGuardado() {
    try { localStorage.removeItem(GUARDADO); } catch (e) { }
  }

  /* ==================== render base ==================== */

  function mostrar(nodo) {
    raiz.innerHTML = '';
    raiz.appendChild(nodo);
  }

  function marco() {
    var v = el('div', 'pantalla');
    return v;
  }

  function rotulo(titulo, sub) {
    var d = el('div', 'rotulo');
    if (sub) d.appendChild(el('p', 'arcano', sub));
    d.appendChild(el('h1', null, titulo));
    return d;
  }

  function panel() { return el('div', 'panel'); }

  function prosa(parrafos, cls) {
    var d = el('div', 'prosa ' + (cls || ''));
    parrafos.forEach(function (p, i) {
      var n = el('p', p === '···' ? 'sep' : null, p);
      n.style.animationDelay = (i * .10 + .1) + 's';
      d.appendChild(n);
    });
    return d;
  }

  function acciones() { return el('div', 'acciones'); }

  function boton(texto, fn, cls) {
    var b = el('button', 'bt ' + (cls || ''), texto);
    b.onclick = function () { Audio2.efecto('paso'); fn(); };
    return b;
  }

  /* --- barra superior: luna, cartas, estado --- */

  function barra() {
    var b = el('div', 'barra');
    var izq = el('div', 'barra-izq');
    izq.innerHTML = '<span class="luna-glifo">☾</span>' +
      '<span class="luna-txt">' + estado.luna.fase + ' · ' +
      estado.luna.signoGlifo + ' ' + estado.luna.signoNombre + '</span>';
    b.appendChild(izq);

    var der = el('div', 'barra-der');
    var vis = el('button', 'bt bt-chico', 'La tirada');
    vis.onclick = verTirada;
    der.appendChild(vis);
    var son = el('button', 'bt bt-chico', Audio2.estaEncendido() ? '♪ Sonando' : '♪ Música');
    son.onclick = function () {
      var on = Audio2.alternar();
      son.textContent = on ? '♪ Sonando' : '♪ Música';
      son.setAttribute('aria-pressed', on);
    };
    son.setAttribute('aria-pressed', Audio2.estaEncendido());
    der.appendChild(son);
    b.appendChild(der);
    return b;
  }

  /* --- cartas --- */

  function nodoCarta(carta, alClick, indice) {
    var d = el('div', 'carta' + (carta.invertida ? ' invertida' : ''));
    d.innerHTML =
      '<span class="num">' + carta.num + '</span>' +
      '<span class="glifo">' + carta.glifo + '</span>' +
      '<span class="nom">' + carta.nombre + '</span>';
    if (indice !== undefined) d.style.animationDelay = (.12 * indice) + 's';
    if (alClick) {
      d.classList.add('jugable');
      d.tabIndex = 0;
      var lanzar = function () {
        // La carta tarda en volar. Sin este cierre se pueden jugar varias
        // cartas seguidas antes de que se resuelva la primera.
        var m = d.parentNode;
        if (m && m.classList.contains('bloqueada')) return;
        if (m) m.classList.add('bloqueada');
        Audio2.efecto('carta');
        d.classList.add('jugada');
        setTimeout(function () { alClick(carta); }, 420);
      };
      d.onclick = lanzar;
      d.onkeydown = function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); lanzar(); }
      };
      var cara = Arcanos.cara(carta);
      d.title = carta.nombre + (carta.invertida ? ' invertida' : '') + ' — ' + cara.verbo;
    }
    return d;
  }

  function mano(alJugar) {
    var m = el('div', 'mano');
    if (!estado.mano.length) {
      m.appendChild(el('p', 'mano-vacia', 'No tenés ninguna carta encima.'));
      return m;
    }
    estado.mano.forEach(function (c, i) {
      m.appendChild(nodoCarta(c, alJugar, i));
    });
    return m;
  }

  /* ==================== pantallas ==================== */

  function portada() {
    escenaActual = 'entrada';
    var v = marco();
    var c = el('div', 'portada');
    c.innerHTML =
      '<p class="arcano">una noche en el baldío</p>' +
      '<h1 class="titulo">Kermés</h1>' +
      '<p class="bajada">Hay una feria donde no había nada,<br>' +
      'y está abierta.</p>';
    v.appendChild(c);

    var a = acciones();
    a.appendChild(boton('Entrar', function () {
      if (!Audio2.estaEncendido()) Audio2.alternar();
      nuevaPartida('Bel');
      pantallaPrologo();
    }, 'bt-primario'));

    var g = leerGuardado();
    if (g && g.escena) {
      a.appendChild(boton('Seguir la noche', function () { retomar(g); }));
    }
    a.appendChild(boton(Audio2.estaEncendido() ? '♪ Sonando' : '♪ Música', function () {
      var on = Audio2.alternar();
      a.querySelectorAll('.bt')[a.querySelectorAll('.bt').length - 1].textContent =
        on ? '♪ Sonando' : '♪ Música';
    }));
    v.appendChild(a);
    mostrar(v);
  }

  function retomar(g) {
    var luna = Luna.estado();
    estado = {
      nombre: g.nombre, luna: luna,
      tirada: {
        busca: Arcanos.instancia(g.tirada.busca[0], g.tirada.busca[1]),
        espera: Arcanos.instancia(g.tirada.espera[0], g.tirada.espera[1]),
        cierre: Arcanos.instancia(g.tirada.cierre[0], g.tirada.cierre[1])
      },
      mazo: g.mazo || [],
      mano: (g.mano || []).map(function (c) { return Arcanos.instancia(c[0], c[1]); }),
      visitadas: g.visitadas || {}, hechas: g.hechas || {}, marcas: g.marcas || {},
      tension: g.tension || 0, encuentros: g.encuentros || 0,
      encuentrosConCarta: g.encuentrosConCarta || 0,
      cartasGanadas: g.cartasGanadas || 0, hilosResueltos: 0, terminada: false
    };
    if (!Audio2.estaEncendido()) Audio2.alternar();
    pantallaMapa();
  }

  function pantallaPrologo() {
    escenaActual = 'entrada';
    var v = marco();
    v.appendChild(panelConProsa(Guion.prologo(estado.nombre, estado.luna),
      'La feria', null, 'Dar vuelta las cartas', pantallaTirada));
    mostrar(v);
  }

  // Panel de texto con un botón al pie. Se usa en casi todas las pantallas.
  function panelConProsa(parrafos, titulo, sub, textoBoton, alSeguir) {
    var p = panel();
    if (titulo) p.appendChild(rotulo(titulo, sub));
    p.appendChild(prosa(parrafos));
    var a = acciones();
    a.appendChild(boton(textoBoton, alSeguir, 'bt-primario'));
    p.appendChild(a);
    return p;
  }

  /* --- la tirada de apertura, con las cartas dándose vuelta --- */

  function pantallaTirada() {
    escenaActual = 'entrada';
    var v = marco();
    var p = panel();
    p.appendChild(rotulo('La tirada', 'tres cartas sobre el mostrador'));
    p.appendChild(prosa(Guion.tiradaTexto()));

    var fila = el('div', 'tirada');
    Guion.POSICIONES.forEach(function (pos, i) {
      var carta = estado.tirada[pos.clave];
      var caja = el('div', 'tirada-caja');
      var dorso = el('div', 'carta dorso');
      dorso.innerHTML = '<span class="dorso-marca">✳</span>';
      caja.appendChild(dorso);
      var tit = el('p', 'tirada-pos', pos.titulo);
      var txt = el('p', 'tirada-txt', '');
      caja.appendChild(tit); caja.appendChild(txt);
      fila.appendChild(caja);

      setTimeout(function () {
        Audio2.efecto('carta');
        dorso.classList.add('girando');
        setTimeout(function () {
          caja.replaceChild(nodoCarta(carta), dorso);
          txt.innerHTML = '<strong>' + carta.nombre +
            (carta.invertida ? ' invertida' : '') + '</strong><br>' +
            Guion.lectura(pos.clave, carta.clave);
          txt.classList.add('visible');
          if (i === 2) Audio2.efecto('revelacion');
        }, 340);
      }, 700 + i * 900);
    });
    p.appendChild(fila);

    var a = acciones();
    var b = boton('Pasar el molinete', pantallaEntrada, 'bt-primario');
    b.style.opacity = '0';
    b.style.transition = 'opacity .8s';
    a.appendChild(b);
    p.appendChild(a);
    setTimeout(function () { b.style.opacity = '1'; }, 3400);

    v.appendChild(p);
    mostrar(v);
  }

  function verTirada() {
    var ov = el('div', 'overlay');
    var caja = el('div', 'overlay-caja');
    caja.appendChild(rotulo('La tirada de esta noche', null));
    var fila = el('div', 'tirada');
    Guion.POSICIONES.forEach(function (pos) {
      var carta = estado.tirada[pos.clave];
      var c = el('div', 'tirada-caja');
      c.appendChild(nodoCarta(carta));
      c.appendChild(el('p', 'tirada-pos', pos.titulo));
      c.appendChild(el('p', 'tirada-txt visible',
        '<strong>' + carta.nombre + (carta.invertida ? ' invertida' : '') +
        '</strong><br>' + Guion.lectura(pos.clave, carta.clave)));
      fila.appendChild(c);
    });
    caja.appendChild(fila);
    var est = el('p', 'fino',
      'Cartas encima: ' + estado.mano.length + ' · ' +
      'atracciones recorridas: ' + contarVisitadas() + ' de 7');
    caja.appendChild(est);
    if (estado.mano.length) {
      caja.appendChild(el('p', 'fino', 'Lo que llevás:'));
      caja.appendChild(mano(null));
    }
    var a = acciones();
    a.appendChild(boton('Cerrar', function () { document.body.removeChild(ov); }, 'bt-primario'));
    caja.appendChild(a);
    ov.appendChild(caja);
    ov.onclick = function (ev) { if (ev.target === ov) document.body.removeChild(ov); };
    document.body.appendChild(ov);
  }

  function pantallaEntrada() {
    escenaActual = 'entrada';
    var v = marco();
    v.appendChild(barra());
    v.appendChild(panelConProsa(Guion.entrada(estado.nombre), 'La entrada',
      'Arcano 0 · El Loco', 'Mirar alrededor', pantallaMapa));
    mostrar(v);
  }

  /* --- el mapa: a dónde ir --- */

  function pantallaMapa() {
    escenaActual = 'entrada';
    guardar();
    var v = marco();
    v.appendChild(barra());
    var p = panel();

    var visitadas = contarVisitadas();
    var puedeCerrar = visitadas >= VISITAS_PARA_CERRAR;

    p.appendChild(rotulo('¿Para dónde?', 'la feria entera está abierta'));
    p.appendChild(prosa([
      visitadas === 0
        ? 'Los caminos de pedregullo salen de la entrada como los rayos de una rueda.'
        : 'Bel vuelve al centro del predio. Desde acá se ve todo.',
      puedeCerrar
        ? 'En el fondo, la carpa sin luces sigue ahí. Ahora se ve una claridad ' +
          'abajo de la lona, como de vela.'
        : 'En el fondo hay una carpa apagada. Todavía no le da la impresión de ' +
          'que sea el momento.'
    ]));

    var lista = el('div', 'destinos');
    Escenas.RECORRIBLES.forEach(function (clave) {
      var esc = Escenas.get(clave);
      var ya = !!estado.visitadas[clave];
      var b = el('button', 'destino' + (ya ? ' visitado' : ''));
      b.innerHTML =
        '<span class="destino-arcano">' + esc.sub + '</span>' +
        '<span class="destino-tit">' + esc.titulo + '</span>' +
        (ya ? '<span class="destino-ya">ya estuviste</span>' : '');
      b.onclick = function () { Audio2.efecto('paso'); irA(clave); };
      lista.appendChild(b);
    });
    p.appendChild(lista);

    var a = acciones();
    if (puedeCerrar) {
      a.appendChild(boton('Ir a la carpa del fondo', pantallaVidente, 'bt-primario'));
    } else {
      a.appendChild(el('p', 'fino',
        'Recorré al menos ' + VISITAS_PARA_CERRAR + ' atracciones antes de ir al fondo. ' +
        'Llevás ' + visitadas + '.'));
    }
    p.appendChild(a);
    v.appendChild(p);
    mostrar(v);
  }

  /* --- una atracción --- */

  function irA(clave) {
    escenaActual = clave;
    estado.visitadas[clave] = true;
    guardar();
    var esc = Escenas.get(clave);
    var contenido = Guion.ATRACCIONES[clave];
    var v = marco();
    v.appendChild(barra());
    v.appendChild(panelConProsa(contenido.llegada, esc.titulo, esc.sub,
      'Quedarse un rato', function () { pantallaAcciones(clave); }));
    mostrar(v);
  }

  function pantallaAcciones(clave) {
    escenaActual = clave;
    var esc = Escenas.get(clave);
    var contenido = Guion.ATRACCIONES[clave];
    var v = marco();
    v.appendChild(barra());
    var p = panel();
    p.appendChild(rotulo(esc.titulo, esc.sub));

    var disponibles = contenido.acciones.filter(function (ac, i) {
      return !estado.hechas[clave + ':' + i];
    });

    if (!disponibles.length) {
      p.appendChild(prosa(['Acá ya no le queda nada por hacer.']));
      var a0 = acciones();
      a0.appendChild(boton('Volver al centro', pantallaMapa, 'bt-primario'));
      p.appendChild(a0);
      v.appendChild(p); mostrar(v);
      return;
    }

    p.appendChild(prosa(['¿Qué hace?']));
    var lista = el('div', 'opciones');
    contenido.acciones.forEach(function (ac, i) {
      if (estado.hechas[clave + ':' + i]) return;
      var b = el('button', 'opcion', ac.texto);
      b.onclick = function () { Audio2.efecto('paso'); hacer(clave, i); };
      lista.appendChild(b);
    });
    p.appendChild(lista);

    var a = acciones();
    a.appendChild(boton('Volver al centro', pantallaMapa));
    p.appendChild(a);
    v.appendChild(p);
    mostrar(v);
  }

  function hacer(clave, i) {
    var contenido = Guion.ATRACCIONES[clave];
    var ac = contenido.acciones[i];
    estado.hechas[clave + ':' + i] = true;

    var ganada = null;
    if (ac.da === 'carta') ganada = robar();
    if (ac.tension) estado.tension += ac.tension;
    if (ac.marca) estado.marcas[ac.marca] = true;
    Audio2.setTension(Math.min(1, estado.tension / UMBRAL_ENCUENTRO));
    if (ac.tension >= .4) sacudida = .35;
    guardar();

    var esc = Escenas.get(clave);
    var v = marco();
    v.appendChild(barra());
    var p = panel();
    p.appendChild(rotulo(esc.titulo, esc.sub));
    p.appendChild(prosa(ac.resultado));

    if (ganada) {
      var g = el('div', 'ganada');
      g.appendChild(el('p', 'ganada-tit', 'Guardás una carta'));
      var m = el('div', 'mano');
      m.appendChild(nodoCarta(ganada, null, 0));
      g.appendChild(m);
      var cara = Arcanos.cara(ganada);
      g.appendChild(el('p', 'ganada-txt',
        '<strong>' + ganada.nombre + (ganada.invertida ? ' invertida' : '') +
        '</strong> — ' + cara.verbo.toLowerCase() + '. ' + ganada.arcano.lectura));
      p.appendChild(g);
      Audio2.efecto('revelacion');
    }

    var a = acciones();
    var siguiente = (estado.tension >= UMBRAL_ENCUENTRO)
      ? function () { pantallaEncuentro(clave); }
      : function () { pantallaAcciones(clave); };
    a.appendChild(boton('Seguir', siguiente, 'bt-primario'));
    p.appendChild(a);
    v.appendChild(p);
    mostrar(v);
  }

  /* --- el encuentro --- */

  function pantallaEncuentro(clave) {
    escenaActual = clave;
    estado.tension = UMBRAL_ENCUENTRO;
    Audio2.setTension(1);
    Audio2.efecto('aparicion');
    sacudida = .8;

    var v = marco();
    v.appendChild(barra());
    var p = panel('encuentro');
    p.classList.add('encuentro');
    p.appendChild(rotulo('Está acá', 'lo que te estaba esperando'));
    p.appendChild(prosa(azar(Guion.APARICIONES).concat(Guion.DESCRIPCION_PRESENCIA)));

    if (estado.mano.length) {
      p.appendChild(el('p', 'instruccion', 'Jugá una carta.'));
      var m = mano(function (carta) { resolverEncuentro(clave, carta); });
      p.appendChild(m);
      // La mano tiene que quedar a la vista sin que haya que buscarla.
      setTimeout(function () {
        m.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 900);
      var a = acciones();
      a.appendChild(boton('Pasarle por al lado sin nada', function () {
        resolverEncuentro(clave, null);
      }));
      p.appendChild(a);
    } else {
      p.appendChild(el('p', 'instruccion', 'No tenés ninguna carta encima.'));
      var a2 = acciones();
      a2.appendChild(boton('Pasarle por al lado', function () {
        resolverEncuentro(clave, null);
      }, 'bt-primario'));
      p.appendChild(a2);
    }
    v.appendChild(p);
    mostrar(v);
  }

  function resolverEncuentro(clave, carta) {
    estado.encuentros++;
    var parrafos;
    if (carta) {
      estado.encuentrosConCarta++;
      // La carta jugada se va de la mano: se gasta al usarla.
      var idx = estado.mano.indexOf(carta);
      if (idx >= 0) estado.mano.splice(idx, 1);
      var cara = Arcanos.cara(carta);
      parrafos = [cara.texto].concat(Guion.RESPUESTAS[carta.arcano.tono] || Guion.RESPUESTAS.ambos);
      Audio2.efecto('bien');
    } else {
      parrafos = Guion.RESPUESTAS.sincarta;
      // Sin carta se paga con una que ya tenías, si te queda alguna.
      if (estado.mano.length) estado.mano.pop();
      Audio2.efecto('mal');
    }
    estado.tension = .25;
    Audio2.setTension(.25);
    guardar();

    var esc = Escenas.get(clave);
    var v = marco();
    v.appendChild(barra());
    var p = panel();
    p.appendChild(rotulo(carta ? carta.nombre : 'De largo',
      carta ? (carta.invertida ? 'invertida' : 'al derecho') : 'sin nada en la mano'));
    p.appendChild(prosa(parrafos));
    var a = acciones();
    a.appendChild(boton('Seguir', function () { pantallaAcciones(clave); }, 'bt-primario'));
    p.appendChild(a);
    v.appendChild(p);
    mostrar(v);
  }

  /* --- la carpa del fondo --- */

  function pantallaVidente() {
    escenaActual = 'vidente';
    Audio2.setTension(.15);
    var v = marco();
    v.appendChild(barra());
    v.appendChild(panelConProsa(Guion.VIDENTE_LLEGADA, 'La carpa del fondo',
      'Arcano II · La Sacerdotisa', 'Dar vuelta las cartas', pantallaFinal));
    mostrar(v);
  }

  function pantallaFinal() {
    escenaActual = 'vidente';
    calcularHilos();
    estado.terminada = true;
    borrarGuardado();
    Audio2.efecto('revelacion');

    var f = Guion.final(estado);
    var v = marco();
    var p = panel();
    p.classList.add('final');
    p.appendChild(rotulo(f.titulo, 'hilos que aguantaron: ' + f.hilos + ' de 3'));
    p.appendChild(prosa(f.parrafos));

    var res = el('div', 'resumen');
    res.innerHTML =
      '<p class="fino">Recorriste <strong>' + contarVisitadas() + ' de 7</strong> atracciones · ' +
      'juntaste <strong>' + estado.cartasGanadas + '</strong> cartas · ' +
      'te cruzaste <strong>' + estado.encuentros + '</strong> ' +
      (estado.encuentros === 1 ? 'vez' : 'veces') + ' con eso.</p>' +
      '<p class="fino">La luna de esta noche: ' + Luna.texto(estado.luna) + '</p>';
    p.appendChild(res);

    var a = acciones();
    a.appendChild(boton('Otra noche', function () {
      nuevaPartida(estado.nombre);
      pantallaPrologo();
    }, 'bt-primario'));
    a.appendChild(boton('Volver al principio', portada));
    p.appendChild(a);
    v.appendChild(p);
    mostrar(v);
  }

  /* ==================== arranque ==================== */

  function init(montaje, lienzo) {
    raiz = montaje; cv = lienzo; cx = cv.getContext('2d');
    medir();
    window.addEventListener('resize', medir);
    requestAnimationFrame(pintar);
    portada();
  }

  return { init: init, _estado: function () { return estado; } };
})();
