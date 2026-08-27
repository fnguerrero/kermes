/* Las atracciones de la feria. Cada una es un Arcano Mayor y se dibuja entera
   con canvas. La función pinta(e) recibe el estado del juego para poder
   reaccionar: la presencia se acerca, las luces se apagan, la tensión sube. */
var Escenas = (function () {
  'use strict';

  var D = (typeof Dib !== 'undefined') ? Dib : require('./dibujo.js');

  var X = function (u) { return D.X(u); };
  var Y = function (v) { return D.Y(v); };
  var U = function (u) { return D.U(u); };

  /* Cielos: cada atracción tiene el suyo, así el recorrido no se vuelve monótono. */
  var CIELOS = {
    noche:   ['#070912', '#0c0f1f', '#171227', '#0a0810'],
    frio:    ['#05080f', '#091320', '#0f1a2a', '#070a10'],
    enfermo: ['#080d0b', '#0d1712', '#14201a', '#07100c'],
    rojo:    ['#0d0709', '#160a10', '#1e0d14', '#0b0509'],
    violeta: ['#0a0812', '#120f22', '#1b1430', '#0a0714']
  };

  function ctx() { return arguments; }

  /* --- helpers locales --- */

  // Estructura metálica de vigas cruzadas, para torres y armazones.
  function armazon(c, x, base, alto, ancho, tramos) {
    c.save();
    c.strokeStyle = '#0a0812';
    c.lineWidth = Math.max(2, ancho * .045);
    var paso = alto / tramos;
    for (var i = 0; i < tramos; i++) {
      var y0 = base - i * paso, y1 = base - (i + 1) * paso;
      var a0 = ancho * (1 - i / tramos * .42), a1 = ancho * (1 - (i + 1) / tramos * .42);
      c.beginPath();
      c.moveTo(x - a0 / 2, y0); c.lineTo(x - a1 / 2, y1);
      c.moveTo(x + a0 / 2, y0); c.lineTo(x + a1 / 2, y1);
      c.moveTo(x - a0 / 2, y0); c.lineTo(x + a1 / 2, y1);
      c.moveTo(x + a0 / 2, y0); c.lineTo(x - a1 / 2, y1);
      c.moveTo(x - a1 / 2, y1); c.lineTo(x + a1 / 2, y1);
      c.stroke();
    }
    c.restore();
  }

  /* ==================== 0 · LA ENTRADA · El Loco ==================== */

  function entrada(e) {
    var c = e.cx, hz = .70;
    D.cielo(CIELOS.noche);
    D.luna(.86, .16, .028, e.luna.iluminacion, e.luna.creciente);

    D.vueltaAlMundo(.13, .36, .080, e.t * .12);
    D.carpa(.40, hz, .075, .12, false);
    D.carpa(.86, hz, .100, .175, false);
    D.carpa(.97, hz, .078, .135, true);

    D.guirnalda(.02, .28, .26, .38, 28, 0);
    D.guirnalda(.30, .38, .58, .34, 30, 2.2);

    D.portal(.66, hz, .150, .27, 'KERMÉS');
    D.suelo(hz, [[.13, .10], [.66, .20], [.86, .11]]);
    D.niebla(.79, .075, 10, .045, '150,170,190');
    D.bel(.53, hz + .012, .195, true);
    D.niebla(.93, .055, 17, .04, '190,160,150');
  }

  /* ==================== X · LA VUELTA AL MUNDO ==================== */

  function rueda(e) {
    var c = e.cx, hz = .78;
    D.cielo(CIELOS.frio);
    D.luna(.14, .13, .026, e.luna.iluminacion, e.luna.creciente);

    // La rueda ocupa casi todo: se la ve desde abajo.
    D.vueltaAlMundo(.55, .40, .30, e.t * .09);

    // Una cabina se soltó y quedó en el piso.
    c.save();
    c.fillStyle = '#0a0812';
    var cx0 = X(.18), cy0 = Y(hz) - U(.012);
    c.translate(cx0, cy0); c.rotate(-.4);
    c.fillRect(-U(.028), -U(.030), U(.056), U(.062));
    c.restore();

    D.poste(.86, hz, .16);
    D.suelo(hz, [[.55, .22], [.86, .10]]);
    D.niebla(.84, .07, 8, .05, '150,180,200');
    D.bel(.30, hz + .01, .19, true);
    D.polvo(.10, '200,215,235');
  }

  /* ==================== XVI · LA TORRE ==================== */

  function torre(e) {
    var c = e.cx, hz = .82;
    D.cielo(CIELOS.rojo);

    var x = X(.52), base = Y(hz), alto = Y(hz) - Y(.08);
    armazon(c, x, base, alto, U(.15), 9);

    // El carro colgando a mitad de altura, oscilando apenas.
    var yc = Y(.34) + Math.sin(e.t * .8) * Y(.006);
    c.save();
    c.strokeStyle = '#0a0812'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x, Y(.10)); c.lineTo(x, yc); c.stroke();
    c.fillStyle = '#0c0912';
    c.fillRect(x - U(.048), yc, U(.096), U(.028));
    // Asientos vacíos.
    c.fillStyle = '#171220';
    for (var i = 0; i < 4; i++)
      c.fillRect(x - U(.040) + i * U(.021), yc + U(.004), U(.014), U(.018));
    c.restore();

    // Luces rojas de baliza, subiendo por la estructura.
    for (var j = 0; j < 7; j++) {
      var yb = Y(.12 + j * .085);
      var enc = Math.sin(e.t * 2.4 - j * .6) > .1;
      if (enc) D.bombita(x - U(.062) + (j % 2) * U(.124), yb, 2.2, '220,70,80', .8);
    }
    // Resplandor rojo detrás de la torre.
    D.resplandor(x, Y(.30), U(.42), '150,40,55', .10);

    D.carpa(.14, hz, .09, .13, false);
    D.suelo(hz, [[.52, .14]]);
    D.niebla(.86, .06, 12, .05, '190,150,160');
    D.bel(.80, hz + .012, .20, true);
    D.polvo(.12, '220,190,180');
  }

  /* ==================== XVIII · EL LABERINTO DE ESPEJOS ==================== */

  function espejos(e) {
    var c = e.cx, hz = .80;
    D.cielo(CIELOS.violeta);
    D.luna(.78, .14, .030, e.luna.iluminacion, e.luna.creciente);

    // Fachada: paneles de espejo que devuelven reflejos deformados.
    var x0 = X(.16), x1 = X(.84), base = Y(hz), alto = Y(hz) - Y(.26);
    var n = 9, an = (x1 - x0) / n;
    for (var i = 0; i < n; i++) {
      var px = x0 + i * an;
      var brillo = .04 + .10 * (0.5 + 0.5 * Math.sin(e.t * .7 + i * 1.4));
      var g = c.createLinearGradient(px, base - alto, px + an, base);
      g.addColorStop(0, 'rgba(150,160,210,' + brillo + ')');
      g.addColorStop(.5, 'rgba(40,36,66,.55)');
      g.addColorStop(1, 'rgba(120,130,180,' + (brillo * .6) + ')');
      c.fillStyle = g;
      c.fillRect(px + 2, base - alto, an - 4, alto);
      c.strokeStyle = '#0a0812'; c.lineWidth = 3;
      c.strokeRect(px + 2, base - alto, an - 4, alto);
    }

    // El reflejo de Bel, repetido y desfasado: uno de más.
    var reflejos = [3, 5, 6];
    reflejos.forEach(function (i, k) {
      var px = x0 + i * an + an / 2;
      var esc = .13 - k * .006;
      var demora = k * 0.55;
      c.save();
      c.globalAlpha = .5 - k * .12;
      D.bel(px / D.X(1), hz - .015, esc, false);
      c.restore();
      // El tercero se mueve cuando los otros ya se quedaron quietos.
      if (k === 2 && Math.sin(e.t * .5) > .3) {
        c.save(); c.globalAlpha = .3;
        D.bel((px + Math.sin(e.t * 2) * U(.02)) / D.X(1), hz - .015, esc, false);
        c.restore();
      }
    });

    // Marquesina con bombitas.
    c.save();
    c.fillStyle = '#0a0812';
    c.beginPath();
    c.moveTo(x0 - U(.02), base - alto);
    c.lineTo(X(.5), base - alto - Y(.07));
    c.lineTo(x1 + U(.02), base - alto);
    c.closePath(); c.fill();
    c.restore();
    for (var b = 0; b <= 12; b++) {
      var u = b / 12;
      var bx = x0 - U(.02) + (x1 - x0 + U(.04)) * u;
      var by = base - alto - Y(.07) * (1 - Math.abs(u - .5) * 2);
      D.bombita(bx, by, 2, '170,150,230', .5 + .5 * Math.sin(e.t * 2 + b));
    }

    D.suelo(hz, [[.5, .16]]);
    D.niebla(.85, .06, 9, .06, '160,150,210');
    D.polvo(.10, '190,180,230');
  }

  /* ==================== VII · LOS AUTITOS CHOCADORES ==================== */

  function chocadores(e) {
    var c = e.cx, hz = .86;
    D.cielo(CIELOS.enfermo);

    var yTecho = Y(.16), yFondo = Y(.50), yFrente = Y(hz);

    // Techo de malla en perspectiva, apenas insinuado.
    c.save();
    c.strokeStyle = 'rgba(16,26,20,.9)'; c.lineWidth = 1;
    for (var i = 0; i <= 12; i++) {
      var u = i / 12;
      c.beginPath();
      c.moveTo(X(.22 + u * .56), yTecho);
      c.lineTo(X(-.15 + u * 1.30), yFondo);
      c.stroke();
    }
    for (var j = 0; j <= 4; j++) {
      var v = j / 4;
      var yy = yTecho + (yFondo - yTecho) * v;
      var ext = .22 - v * .37;
      c.beginPath(); c.moveTo(X(ext), yy); c.lineTo(X(1 - ext), yy); c.stroke();
    }
    c.restore();

    // Pista en perspectiva.
    c.save();
    var g = c.createLinearGradient(0, yFondo, 0, yFrente);
    g.addColorStop(0, '#101a14'); g.addColorStop(.5, '#0b1310'); g.addColorStop(1, '#060b08');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(X(.20), yFondo); c.lineTo(X(.80), yFondo);
    c.lineTo(X(1.10), yFrente); c.lineTo(X(-.10), yFrente);
    c.closePath(); c.fill();
    // Baranda del fondo.
    c.fillStyle = '#070c09';
    c.fillRect(X(.18), yFondo - U(.030), X(.64) - X(.0), U(.030));
    c.restore();
    for (var n = 0; n <= 9; n++) {
      var nx = X(.20) + (X(.80) - X(.20)) * n / 9;
      D.bombita(nx, yFondo - U(.030), 2.1, '150,240,190', .45 + .4 * Math.sin(e.t * 2 + n));
    }
    D.resplandor(X(.5), yFondo, U(.55), '90,190,140', .07);

    /* Autito de tres cuartos: faldon, cuerpo, respaldo, volante y pantografo.
       El tamano sale de la profundidad, asi la pista tiene fondo. */
    function autito(u, prof, giro, vivo) {
      var yy = yFondo + (yFrente - yFondo) * prof;
      var esc = .55 + prof * .85;
      var xx = X(.5) + (X(u) - X(.5)) * (.55 + prof * .8);
      var an = U(.052) * esc;
      c.save();
      c.translate(xx, yy);
      c.rotate(giro);
      c.fillStyle = 'rgba(0,0,0,.45)';
      c.beginPath(); c.ellipse(0, an * .30, an * 1.05, an * .30, 0, 0, 6.2832); c.fill();
      c.fillStyle = vivo ? '#241320' : '#0c0b11';
      c.beginPath(); c.ellipse(0, an * .10, an, an * .42, 0, 0, 6.2832); c.fill();
      c.fillStyle = vivo ? '#160d16' : '#08080d';
      c.beginPath(); c.ellipse(0, -an * .05, an * .80, an * .34, 0, 0, 6.2832); c.fill();
      c.fillStyle = '#05050a';
      c.beginPath();
      c.moveTo(-an * .34, -an * .10);
      c.lineTo(-an * .30, -an * .68);
      c.lineTo(an * .16, -an * .68);
      c.lineTo(an * .20, -an * .10);
      c.closePath(); c.fill();
      c.strokeStyle = '#05050a'; c.lineWidth = Math.max(1.2, an * .07);
      c.beginPath(); c.ellipse(an * .42, -an * .26, an * .17, an * .07, -.5, 0, 6.2832); c.stroke();
      c.strokeStyle = '#0a1410'; c.lineWidth = Math.max(1.2, an * .06);
      c.beginPath();
      c.moveTo(-an * .10, -an * .60);
      c.lineTo(an * .10, (yTecho - yy) * .92);
      c.stroke();
      c.restore();
      if (vivo) {
        if (Math.sin(e.t * 8.5) > .74)
          D.bombita(xx + an * .10, yy + (yTecho - yy) * .92, 2.8 * esc, '190,255,215', 1);
        D.resplandor(xx, yy, an * 3.2, '110,210,160', .09);
      }
    }

    autito(.30, .12, .35, false);
    autito(.74, .22, -.6, false);
    autito(.20, .48, 1.1, false);
    autito(.86, .62, 2.4, false);
    // El unico que anda, y anda solo.
    autito(.5 + Math.sin(e.t * .32) * .30, .40 + Math.cos(e.t * .32) * .26,
           Math.sin(e.t * .32) * .5 + .2, true);

    D.niebla(.90, .045, 14, .045, '150,210,175');
    D.bel(.10, hz + .04, .21, true);
  }

  /* ==================== XII · LAS HAMACAS (sillas voladoras) ==================== */

  function hamacas(e) {
    var c = e.cx, hz = .82;
    D.cielo(CIELOS.frio);
    D.luna(.20, .12, .024, e.luna.iluminacion, e.luna.creciente);

    var cxp = X(.55), cyp = Y(.24), R = U(.20);
    // Mástil central.
    c.save();
    c.strokeStyle = '#0a0812'; c.lineWidth = Math.max(3, U(.012));
    c.beginPath(); c.moveTo(cxp, Y(hz)); c.lineTo(cxp, cyp); c.stroke();
    // Corona.
    c.beginPath(); c.ellipse(cxp, cyp, R, R * .22, 0, 0, 6.2832); c.stroke();
    c.restore();

    // Las sillas cuelgan quietas: nadie las está usando, pero una se mueve.
    var N = 10;
    var sillas = [];
    for (var i = 0; i < N; i++) {
      var a = i * 6.2832 / N + .3;
      sillas.push({ a: a, z: Math.sin(a) });
    }
    sillas.sort(function (p, q) { return p.z - q.z; });
    sillas.forEach(function (s, idx) {
      var sx = cxp + Math.cos(s.a) * R;
      var sy = cyp + Math.sin(s.a) * R * .22;
      var viva = (idx === sillas.length - 2);
      var balanceo = viva ? Math.sin(e.t * 1.1) * .16 : 0;
      var largo = Y(.30);
      var px = sx + Math.sin(balanceo) * largo;
      var py = sy + Math.cos(balanceo) * largo;
      c.save();
      c.strokeStyle = '#0a0812'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(sx - U(.012), sy); c.lineTo(px - U(.010), py);
      c.moveTo(sx + U(.012), sy); c.lineTo(px + U(.010), py);
      c.stroke();
      c.fillStyle = viva ? '#181120' : '#0b0812';
      c.fillRect(px - U(.018), py, U(.036), U(.026));
      c.fillRect(px - U(.018), py - U(.030), U(.006), U(.030));
      c.fillRect(px + U(.012), py - U(.030), U(.006), U(.030));
      c.restore();
      if (viva) D.resplandor(px, py, U(.11), '150,180,220', .07);
    });

    D.banderines(.02, .30, .30, .36, 22);
    D.poste(.90, hz, .17);
    D.suelo(hz, [[.55, .12], [.90, .10]]);
    D.niebla(.87, .055, 11, .05, '160,180,210');
    D.bel(.24, hz + .01, .185, true);
  }

  /* ==================== XIX · LA CALESITA ==================== */

  function calesita(e) {
    var c = e.cx, hz = .84;
    D.cielo(CIELOS.noche);

    D.calesita(.50, hz, .42, .30, e.t * .32);
    D.resplandor(X(.50), Y(hz - .13), U(.30), '255,190,110', .09);

    D.banderines(.03, .34, .30, .40, 24);
    D.banderines(.70, .40, .98, .33, 26);
    D.carpa(.87, hz, .085, .13, false);
    D.suelo(hz, [[.50, .24], [.87, .08]]);
    D.niebla(.88, .05, 9, .045, '210,190,170');
    D.bel(.16, hz + .01, .18, true);
    D.polvo(.11, '235,215,180');
  }

  /* ==================== I · EL PUESTO DE TIRO ==================== */

  function tiro(e) {
    var c = e.cx, hz = .82;
    D.cielo(CIELOS.noche);
    D.carpa(.08, hz, .09, .13, false);
    D.carpa(.93, hz, .085, .12, false);

    var x0 = X(.20), x1 = X(.80), base = Y(hz), techo = Y(.26);
    var mostrador = Y(.66);

    // Caja del puesto y fondo iluminado: los patos se recortan contra el.
    c.save();
    c.fillStyle = '#0a0812';
    c.fillRect(x0, techo, x1 - x0, base - techo);
    var g = c.createLinearGradient(0, techo + U(.03), 0, mostrador);
    g.addColorStop(0, 'rgba(255,186,96,.32)');
    g.addColorStop(.6, 'rgba(214,120,70,.17)');
    g.addColorStop(1, 'rgba(120,44,52,.10)');
    c.fillStyle = g;
    c.fillRect(x0 + U(.022), techo + U(.030), x1 - x0 - U(.044), mostrador - techo - U(.030));
    c.restore();

    // Tres hileras de patos en silueta, cada una a su ritmo y su sentido.
    for (var f = 0; f < 3; f++) {
      var yf = techo + U(.062) + f * U(.052);
      var dir = f % 2 === 0 ? 1 : -1;
      var paso = U(.115);
      c.save();
      c.beginPath();
      c.rect(x0 + U(.025), techo + U(.030), x1 - x0 - U(.05), mostrador - techo - U(.030));
      c.clip();
      for (var i = -1; i < 8; i++) {
        var d = (e.t * (7 + f * 4) * dir) % paso;
        var px = x0 + U(.025) + i * paso + d;
        var sube = Math.sin(e.t * 3 + i * 1.3 + f) * U(.004);
        c.save();
        c.translate(px, yf + sube);
        if (dir < 0) c.scale(-1, 1);
        c.fillStyle = '#0b0810';
        c.beginPath(); c.ellipse(0, 0, U(.026), U(.014), 0, 0, 6.2832); c.fill();
        c.beginPath();
        c.moveTo(-U(.022), -U(.004));
        c.lineTo(-U(.040), -U(.016));
        c.lineTo(-U(.020), U(.006));
        c.closePath(); c.fill();
        c.beginPath(); c.ellipse(U(.016), -U(.017), U(.010), U(.011), 0, 0, 6.2832); c.fill();
        c.fillRect(U(.008), -U(.020), U(.010), U(.016));
        c.beginPath();
        c.moveTo(U(.025), -U(.019));
        c.lineTo(U(.038), -U(.015));
        c.lineTo(U(.025), -U(.012));
        c.closePath(); c.fill();
        c.fillRect(-U(.001), U(.010), U(.002), U(.030));
        c.restore();
      }
      c.restore();
    }

    // Mostrador con dos rifles apoyados.
    c.save();
    c.fillStyle = '#0d0a14';
    c.fillRect(x0, mostrador, x1 - x0, U(.030));
    [.36, .60].forEach(function (u) {
      var rx = X(u);
      c.strokeStyle = '#1c1626'; c.lineWidth = Math.max(2, U(.007));
      c.beginPath();
      c.moveTo(rx - U(.05), mostrador - U(.004));
      c.lineTo(rx + U(.05), mostrador - U(.018));
      c.stroke();
      c.fillStyle = '#1c1626';
      c.beginPath();
      c.moveTo(rx - U(.05), mostrador - U(.004));
      c.lineTo(rx - U(.032), mostrador - U(.008));
      c.lineTo(rx - U(.036), mostrador + U(.010));
      c.closePath(); c.fill();
    });
    c.restore();

    // Peluches viejos colgando del alero; uno se balancea sin viento.
    for (var p = 0; p < 7; p++) {
      var px2 = x0 + U(.055) + p * U(.088);
      var osc = (p === 4) ? Math.sin(e.t * 1.4) * .14 : 0;
      c.save();
      c.translate(px2, techo + U(.012));
      c.rotate(osc);
      c.strokeStyle = '#0a0812'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, U(.024)); c.stroke();
      c.fillStyle = ['#2f1f28', '#232a38', '#332c24'][p % 3];
      c.beginPath(); c.arc(0, U(.048), U(.017), 0, 6.2832); c.fill();
      c.beginPath(); c.arc(0, U(.028), U(.011), 0, 6.2832); c.fill();
      c.beginPath(); c.arc(-U(.008), U(.020), U(.005), 0, 6.2832); c.fill();
      c.beginPath(); c.arc(U(.008), U(.020), U(.005), 0, 6.2832); c.fill();
      c.restore();
    }

    // Alero y bombitas del frente.
    c.save();
    c.fillStyle = '#0a0812';
    c.fillRect(x0 - U(.02), techo - U(.016), x1 - x0 + U(.04), U(.020));
    c.restore();
    for (var b = 0; b <= 11; b++)
      D.bombita(x0 - U(.02) + (x1 - x0 + U(.04)) * b / 11, techo - U(.020), 2.2,
        '255,200,130', .5 + .5 * Math.sin(e.t * 2.6 + b * .8));
    D.resplandor(X(.5), Y(.46), U(.42), '255,170,90', .09);

    D.suelo(hz, [[.5, .22]]);
    D.niebla(.88, .05, 10, .045, '210,190,170');
    D.bel(.50, hz + .05, .19, true);
  }

  /* ==================== II · LA CARPA DE LA VIDENTE ==================== */

  function vidente(e) {
    var c = e.cx;
    // Interior: no hay cielo, hay lona.
    var g = c.createRadialGradient(X(.5), Y(.42), 0, X(.5), Y(.42), D.X(.85));
    g.addColorStop(0, '#1d1420');
    g.addColorStop(.45, '#120c16');
    g.addColorStop(1, '#07050a');
    c.fillStyle = g; c.fillRect(0, 0, D.X(1), D.Y(1));

    // Gajos de la lona convergiendo arriba.
    c.save();
    c.strokeStyle = 'rgba(50,36,54,.55)'; c.lineWidth = 2;
    for (var i = 0; i <= 12; i++) {
      c.beginPath();
      c.moveTo(X(.5), Y(-.05));
      c.lineTo(X(i / 12), Y(.62));
      c.stroke();
    }
    c.restore();

    // Mesa redonda con mantel.
    var mx = X(.5), my = Y(.74);
    c.save();
    c.fillStyle = '#140d18';
    c.beginPath(); c.ellipse(mx, my, U(.26), U(.075), 0, 0, 6.2832); c.fill();
    c.fillStyle = '#0d0812';
    c.beginPath();
    c.moveTo(mx - U(.26), my);
    c.quadraticCurveTo(mx - U(.24), Y(.99), mx - U(.19), Y(1.02));
    c.lineTo(mx + U(.19), Y(1.02));
    c.quadraticCurveTo(mx + U(.24), Y(.99), mx + U(.26), my);
    c.closePath(); c.fill();
    c.restore();

    // Vela: es la única fuente de luz y late.
    var vx = X(.30), vy = Y(.70);
    var late = .85 + .15 * Math.sin(e.t * 7) + .06 * Math.sin(e.t * 17);
    c.save();
    c.fillStyle = '#241a1e';
    c.fillRect(vx - U(.008), vy - U(.045), U(.016), U(.045));
    c.restore();
    D.resplandor(vx, vy - U(.055), U(.34) * late, '255,170,80', .22);
    D.bombita(vx, vy - U(.052), 2.6 * late, '255,200,120', 1);

    // Tres cartas boca abajo sobre el mantel.
    [-1, 0, 1].forEach(function (k) {
      var cxp = mx + k * U(.072), cyp = my - U(.012);
      c.save();
      c.translate(cxp, cyp);
      c.rotate(k * .06 + Math.sin(e.t * .4 + k) * .012);
      c.fillStyle = '#1a1424';
      c.strokeStyle = '#4a3a2a'; c.lineWidth = 1.2;
      c.beginPath();
      if (c.roundRect) c.roundRect(-U(.028), -U(.042), U(.056), U(.084), 3);
      else c.rect(-U(.028), -U(.042), U(.056), U(.084));
      c.fill(); c.stroke();
      // Dorso: una estrella simple.
      c.strokeStyle = 'rgba(200,160,90,.35)'; c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, -U(.016)); c.lineTo(0, U(.016));
      c.moveTo(-U(.014), 0); c.lineTo(U(.014), 0);
      c.moveTo(-U(.010), -U(.011)); c.lineTo(U(.010), U(.011));
      c.moveTo(-U(.010), U(.011)); c.lineTo(U(.010), -U(.011));
      c.stroke();
      c.restore();
    });

    // La vidente: solo se le ven las manos sobre la mesa.
    c.save();
    c.fillStyle = '#08060c';
    c.beginPath();
    c.moveTo(X(.5) - U(.13), Y(.62));
    c.quadraticCurveTo(X(.5), Y(.44), X(.5) + U(.13), Y(.62));
    c.lineTo(X(.5) + U(.15), Y(.72));
    c.lineTo(X(.5) - U(.15), Y(.72));
    c.closePath(); c.fill();
    c.beginPath(); c.arc(X(.5), Y(.50), U(.045), 0, 6.2832); c.fill();
    c.restore();
    // Manos apenas iluminadas por la vela.
    c.save();
    c.fillStyle = 'rgba(190,150,120,.20)';
    c.beginPath(); c.ellipse(mx - U(.10), my - U(.02), U(.026), U(.014), .2, 0, 6.2832); c.fill();
    c.beginPath(); c.ellipse(mx + U(.10), my - U(.02), U(.026), U(.014), -.2, 0, 6.2832); c.fill();
    c.restore();

    D.polvo(.09, '220,190,150');
  }

  /* ==================== catálogo ==================== */

  var CATALOGO = {
    entrada:     { pinta: entrada,     arcano: 'loco',        titulo: 'La entrada',            sub: 'Arcano 0 · El Loco' },
    rueda:       { pinta: rueda,       arcano: 'rueda',       titulo: 'La vuelta al mundo',    sub: 'Arcano X · La Rueda de la Fortuna' },
    torre:       { pinta: torre,       arcano: 'torre',       titulo: 'La caída libre',        sub: 'Arcano XVI · La Torre' },
    espejos:     { pinta: espejos,     arcano: 'luna',        titulo: 'El laberinto de espejos', sub: 'Arcano XVIII · La Luna' },
    chocadores:  { pinta: chocadores,  arcano: 'carro',       titulo: 'Los autitos chocadores', sub: 'Arcano VII · El Carro' },
    hamacas:     { pinta: hamacas,     arcano: 'colgado',     titulo: 'Las sillas voladoras',  sub: 'Arcano XII · El Colgado' },
    calesita:    { pinta: calesita,    arcano: 'sol',         titulo: 'La calesita',           sub: 'Arcano XIX · El Sol' },
    tiro:        { pinta: tiro,        arcano: 'mago',        titulo: 'El puesto de tiro',     sub: 'Arcano I · El Mago' },
    vidente:     { pinta: vidente,     arcano: 'sacerdotisa', titulo: 'La carpa de la vidente', sub: 'Arcano II · La Sacerdotisa' }
  };

  // Las que se pueden recorrer libremente (la entrada y el cierre no cuentan).
  var RECORRIBLES = ['rueda', 'torre', 'espejos', 'chocadores', 'hamacas', 'calesita', 'tiro'];

  function get(clave) { return CATALOGO[clave]; }

  return { CATALOGO: CATALOGO, RECORRIBLES: RECORRIBLES, get: get, CIELOS: CIELOS };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Escenas; }
