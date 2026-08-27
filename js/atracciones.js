/* Las atracciones dibujadas dentro del mundo.
   Cada una recibe la x de pantalla (ya restada la cámara) y la línea del piso,
   así se dibujan siempre a la misma escala y el recorrido se siente continuo. */
var Atracciones = (function () {
  'use strict';

  var D = (typeof Dib !== 'undefined') ? Dib : require('./dibujo.js');

  var HIERRO = '#171325';
  var HIERRO_LUZ = '#2a2340';
  var LONA_A = '#3a2536';
  var LONA_B = '#513349';

  /* --- entrada: molinete y cartel --- */
  function entrada(cx, x, piso, H, t) {
    var an = H * .42, al = H * .46;
    cx.save();
    // Columnas.
    cx.fillStyle = HIERRO;
    cx.fillRect(x - an / 2, piso - al, an * .07, al);
    cx.fillRect(x + an / 2 - an * .07, piso - al, an * .07, al);
    // Arco.
    cx.beginPath();
    cx.moveTo(x - an / 2, piso - al);
    cx.quadraticCurveTo(x, piso - al * 1.42, x + an / 2, piso - al);
    cx.lineTo(x + an / 2, piso - al * .90);
    cx.quadraticCurveTo(x, piso - al * 1.28, x - an / 2, piso - al * .90);
    cx.closePath(); cx.fill();
    // Bombitas del arco.
    for (var i = 0; i <= 15; i++) {
      var u = i / 15, iu = 1 - u;
      var bx = iu * iu * (x - an / 2) + 2 * iu * u * x + u * u * (x + an / 2);
      var by = iu * iu * (piso - al) + 2 * iu * u * (piso - al * 1.35) + u * u * (piso - al);
      if (i === 6 && Math.sin(t * 7) < 0) continue;
      D.bombita(bx, by, 2.4, '255,206,140', .55 + .45 * Math.sin(t * 2.4 + i * .7));
    }
    // Rótulo.
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    // Letras de neón sobre el arco: entran dentro del ancho del portal, con
    // el espaciado justo. Antes se desbordaban por los dos lados.
    var cuerpo = Math.min(al * .115, an * .155);
    cx.font = '600 ' + Math.round(cuerpo) + "px 'Cormorant Garamond',serif";
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.shadowColor = 'rgba(255,168,64,.9)'; cx.shadowBlur = 20;
    cx.fillStyle = 'rgba(255,208,132,.95)';
    cx.fillText('KERMÉS', x, piso - al * 1.13);
    cx.restore();
    // Molinete.
    cx.strokeStyle = HIERRO_LUZ; cx.lineWidth = 5;
    cx.beginPath();
    cx.moveTo(x + an * .18, piso); cx.lineTo(x + an * .18, piso - H * .085);
    cx.stroke();
    var giro = Math.sin(t * .3) * .25;
    for (var b = 0; b < 3; b++) {
      var a = giro + b * 2.094;
      cx.beginPath();
      cx.moveTo(x + an * .18, piso - H * .075);
      cx.lineTo(x + an * .18 + Math.cos(a) * H * .052, piso - H * .075 + Math.sin(a) * H * .014);
      cx.stroke();
    }
    cx.restore();
  }

  /* --- puesto de tiro --- */
  function tiro(cx, x, piso, H, t) {
    var an = H * .46, al = H * .42;
    var x0 = x - an / 2, x1 = x + an / 2, techo = piso - al, most = piso - al * .32;
    cx.save();
    cx.fillStyle = HIERRO;
    cx.fillRect(x0, techo, an, al);
    var g = cx.createLinearGradient(0, techo + al * .10, 0, most);
    g.addColorStop(0, 'rgba(255,186,96,.34)');
    g.addColorStop(1, 'rgba(150,60,60,.12)');
    cx.fillStyle = g;
    cx.fillRect(x0 + an * .06, techo + al * .10, an * .88, most - techo - al * .10);
    // Patos en dos hileras.
    for (var f = 0; f < 2; f++) {
      var yf = techo + al * .22 + f * al * .20;
      var dir = f === 0 ? 1 : -1;
      cx.save();
      cx.beginPath(); cx.rect(x0 + an * .07, techo + al * .10, an * .86, most - techo - al * .12); cx.clip();
      var paso = an * .26;
      for (var i = -1; i < 5; i++) {
        var px = x0 + an * .07 + i * paso + ((t * 26 * dir) % paso + paso) % paso;
        cx.save(); cx.translate(px, yf);
        if (dir < 0) cx.scale(-1, 1);
        cx.fillStyle = '#0b0810';
        cx.beginPath(); cx.ellipse(0, 0, an * .052, an * .028, 0, 0, 6.2832); cx.fill();
        cx.beginPath(); cx.ellipse(an * .032, -an * .034, an * .020, an * .022, 0, 0, 6.2832); cx.fill();
        cx.beginPath();
        cx.moveTo(an * .050, -an * .038); cx.lineTo(an * .076, -an * .030);
        cx.lineTo(an * .050, -an * .024); cx.closePath(); cx.fill();
        cx.restore();
      }
      cx.restore();
    }
    // Mostrador y alero.
    cx.fillStyle = '#120e1a';
    cx.fillRect(x0, most, an, al * .09);
    cx.fillStyle = HIERRO;
    cx.fillRect(x0 - an * .05, techo - al * .05, an * 1.10, al * .055);
    for (var k = 0; k <= 9; k++)
      D.bombita(x0 - an * .05 + an * 1.10 * k / 9, techo - al * .06, 2.3, '255,200,130',
        .5 + .5 * Math.sin(t * 2.6 + k * .8));
    D.resplandor(x, techo + al * .3, an * .8, '255,170,90', .10);
    cx.restore();
    D.cartel(x, techo - al * .22, 'TIRO AL BLANCO',
      { ancho: H * .30, color: '#7a4030', tinta: '#ffe2bc' });
  }

  /* --- calesita --- */
  function calesita(cx, x, piso, H, t) {
    var an = H * .62, al = H * .46;
    cx.save();
    cx.fillStyle = '#0c0912';
    cx.beginPath(); cx.ellipse(x, piso, an * .5, an * .085, 0, 0, 6.2832); cx.fill();
    var giro = t * .34;
    var N = 8, piezas = [];
    for (var i = 0; i < N; i++) piezas.push({ a: giro + i * 6.2832 / N });
    piezas.sort(function (p, q) { return Math.sin(p.a) - Math.sin(q.a); });
    piezas.forEach(function (p) {
      var px = x + Math.cos(p.a) * an * .40;
      var py = piso + Math.sin(p.a) * an * .072;
      var sube = Math.sin(t * 2.2 + p.a * 2) * al * .05;
      cx.strokeStyle = '#1d1729'; cx.lineWidth = Math.max(1.5, an * .008);
      cx.beginPath(); cx.moveTo(px, py); cx.lineTo(px, py - al * .68); cx.stroke();
      var cy = py - al * .30 + sube, cw = an * .072, ch = al * .10;
      cx.fillStyle = '#100c19';
      cx.beginPath(); cx.ellipse(px, cy, cw, ch * .55, 0, 0, 6.2832); cx.fill();
      cx.beginPath();
      cx.moveTo(px + cw * .55, cy - ch * .2);
      cx.lineTo(px + cw * 1.05, cy - ch * .95);
      cx.lineTo(px + cw * .70, cy - ch * 1.0);
      cx.lineTo(px + cw * .28, cy - ch * .35);
      cx.closePath(); cx.fill();
      cx.strokeStyle = '#100c19'; cx.lineWidth = Math.max(1.2, an * .007);
      [-.5, -.15, .2, .55].forEach(function (o) {
        cx.beginPath();
        cx.moveTo(px + cw * o, cy + ch * .35);
        cx.lineTo(px + cw * o + cw * .12, cy + ch * .95);
        cx.stroke();
      });
    });
    // Techo cónico.
    for (var j = 0; j < 12; j++) {
      var a0 = j / 12 * 6.2832, a1 = (j + 1) / 12 * 6.2832;
      cx.fillStyle = (j % 2 === 0) ? LONA_B : LONA_A;
      cx.beginPath();
      cx.moveTo(x, piso - al * 1.06);
      cx.lineTo(x + Math.cos(a0) * an * .52, piso - al * .72 + Math.sin(a0) * an * .09);
      cx.lineTo(x + Math.cos(a1) * an * .52, piso - al * .72 + Math.sin(a1) * an * .09);
      cx.closePath(); cx.fill();
    }
    for (var b = 0; b < 16; b++) {
      var ab = b / 16 * 6.2832;
      if (Math.sin(ab) < -.5) continue;
      D.bombita(x + Math.cos(ab) * an * .52, piso - al * .72 + Math.sin(ab) * an * .09,
        2.1, '255,204,140', .5 + .5 * Math.sin(t * 3 + b));
    }
    D.resplandor(x, piso - al * .45, an * .75, '255,190,110', .11);
    cx.restore();
    D.carteliPie(x - an * .62, piso, 'CALESITA',
      { ancho: H * .17, color: '#8a5a2e', tinta: '#ffe8c0' });
  }

  /* --- montaña rusa: la estructura de madera y el circuito --- */
  function montania(cx, x, piso, H, t) {
    var an = H * 2.10, al = H * .66;
    cx.save();
    // Perfil del circuito: subida larga, caída, dos lomas.
    var pts = perfilMontania(x, piso, an, al);
    // Columnas de sostén.
    cx.strokeStyle = HIERRO; cx.lineWidth = 4;
    for (var i = 0; i < pts.length; i += 3) {
      cx.beginPath();
      cx.moveTo(pts[i].x, pts[i].y);
      cx.lineTo(pts[i].x, piso);
      cx.stroke();
      // Cruces de arriostre.
      if (i + 3 < pts.length) {
        cx.beginPath();
        cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[i + 3].x, piso);
        cx.moveTo(pts[i + 3].x, pts[i + 3].y); cx.lineTo(pts[i].x, piso);
        cx.stroke();
      }
    }
    // Vía.
    cx.strokeStyle = '#241c30'; cx.lineWidth = 7;
    cx.beginPath();
    cx.moveTo(pts[0].x, pts[0].y);
    for (var k = 1; k < pts.length; k++) cx.lineTo(pts[k].x, pts[k].y);
    cx.stroke();
    cx.strokeStyle = '#3a2f4a'; cx.lineWidth = 2.5;
    cx.beginPath();
    cx.moveTo(pts[0].x, pts[0].y - 6);
    for (var k2 = 1; k2 < pts.length; k2++) cx.lineTo(pts[k2].x, pts[k2].y - 6);
    cx.stroke();
    // Luces sobre la estructura.
    for (var b = 0; b < pts.length; b += 4) {
      if (Math.sin(t * 2 + b) < -.6) continue;
      D.bombita(pts[b].x, pts[b].y - 10, 2, '255,186,120', .5 + .5 * Math.sin(t * 2.6 + b));
    }
    cx.restore();
    // Cartel colgado del armazón, a la altura de la subida.
    D.cartel(x - an * .30, piso - al * 1.02, 'LA RUSA',
      { ancho: H * .30, color: '#7d4a2c', tinta: '#ffe0b4', colorLuz: '255,180,110' });
  }

  /* Perfil del circuito, compartido por el dibujo y por la secuencia.
     Subida larga, caída, y tres lomas cada vez más bajas: es el recorrido
     clásico y da un ritmo que se siente bien sin retocar nada a mano. */
  function perfilMontania(x, piso, an, al) {
    var x0 = x - an * .48;
    var pts = [];
    var N = 90;
    for (var i = 0; i <= N; i++) {
      var u = i / N;
      var px = x0 + an * u;
      var h;
      if (u < .020) {
        h = al * .035;                                          // estación
      } else if (u < .300) {
        var a0 = (u - .020) / .280;
        h = al * (.035 + a0 * .965);                            // la cadena
      } else if (u < .400) {
        var v = (u - .300) / .100;
        h = al * (1 - v * v * .93);                             // la caída
      } else if (u < .560) {
        var w = (u - .400) / .160;
        h = al * (.07 + Math.sin(w * Math.PI) * .46);           // loma grande
      } else if (u < .700) {
        var z = (u - .560) / .140;
        h = al * (.07 + Math.sin(z * Math.PI) * .30);           // loma media
      } else if (u < .830) {
        var y2 = (u - .700) / .130;
        h = al * (.06 + Math.sin(y2 * Math.PI) * .17);          // loma chica
      } else {
        h = al * .045;                                          // llegada
      }
      pts.push({ x: px, y: piso - h - al * .03, u: u });
    }
    return pts;
  }

  /* --- autitos chocadores --- */
  function chocadores(cx, x, piso, H, t) {
    var an = H * .78, al = H * .50;
    var x0 = x - an / 2, x1 = x + an / 2;
    cx.save();

    // Techo del galpón, a dos aguas, y su estructura.
    cx.fillStyle = HIERRO;
    cx.beginPath();
    cx.moveTo(x0 - an * .04, piso - al);
    cx.lineTo(x, piso - al * 1.20);
    cx.lineTo(x1 + an * .04, piso - al);
    cx.lineTo(x1 + an * .04, piso - al * .93);
    cx.lineTo(x, piso - al * 1.12);
    cx.lineTo(x0 - an * .04, piso - al * .93);
    cx.closePath(); cx.fill();

    // Columnas.
    cx.fillStyle = HIERRO;
    [-1, 1].forEach(function (l) {
      cx.fillRect(x + l * an / 2 - an * .012, piso - al, an * .024, al);
    });

    // El fondo del galpón, iluminado en verde: es lo que lo hace visible de lejos.
    var g = cx.createLinearGradient(0, piso - al * .92, 0, piso - al * .10);
    g.addColorStop(0, 'rgba(70,150,110,.20)');
    g.addColorStop(1, 'rgba(40,110,80,.06)');
    cx.fillStyle = g;
    cx.fillRect(x0, piso - al * .92, an, al * .82);

    // Malla del techo.
    cx.strokeStyle = 'rgba(40,70,55,.75)'; cx.lineWidth = 1.2;
    for (var i = 0; i <= 14; i++) {
      var px = x0 + an * i / 14;
      cx.beginPath(); cx.moveTo(px, piso - al * .93); cx.lineTo(px, piso - al * .62); cx.stroke();
    }
    for (var j = 0; j < 3; j++) {
      var jy = piso - al * (.93 - j * .105);
      cx.beginPath(); cx.moveTo(x0, jy); cx.lineTo(x1, jy); cx.stroke();
    }

    // Pista: piso pulido con reflejo.
    var pg = cx.createLinearGradient(0, piso - al * .30, 0, piso);
    pg.addColorStop(0, '#16241c');
    pg.addColorStop(1, '#0a1210');
    cx.fillStyle = pg;
    cx.fillRect(x0, piso - al * .30, an, al * .30);
    // Baranda con tubos de neón.
    cx.fillStyle = '#0d1712';
    cx.fillRect(x0, piso - al * .34, an, al * .05);
    cx.restore();
    for (var n = 0; n <= 12; n++)
      D.bombita(x0 + an * n / 12, piso - al * .335, 2.4, '150,240,190',
        .5 + .45 * Math.sin(t * 2 + n));

    // Cartel colgado del frente del galpón.
    D.cartel(x, piso - al * 1.16, 'CHOCADORES',
      { ancho: H * .34, color: '#3f5a44', tinta: '#d8f5e4', colorLuz: '150,240,190' });

    // Cuatro autitos: tres parados y uno dando vueltas.
    autito(cx, x - an * .30, piso - al * .16, an * .075, .28, false, t);
    autito(cx, x + an * .10, piso - al * .09, an * .085, -.5, false, t);
    autito(cx, x + an * .33, piso - al * .20, an * .070, 1.9, false, t);
    var u = (t * .16) % 1;
    autito(cx, x - an * .34 + an * .68 * u, piso - al * .22 + Math.sin(u * 6.28) * al * .07,
      an * .080, Math.sin(u * 6.28) * .45, true, t);

    D.resplandor(x, piso - al * .45, an * .55, '90,200,145', .12);
  }

  function autito(cx, x, y, an, giro, vivo, t) {
    cx.save();
    cx.translate(x, y); cx.rotate(giro);
    cx.fillStyle = 'rgba(0,0,0,.4)';
    cx.beginPath(); cx.ellipse(0, an * .3, an * 1.05, an * .3, 0, 0, 6.2832); cx.fill();
    cx.fillStyle = vivo ? '#2a1524' : '#0e0c14';
    cx.beginPath(); cx.ellipse(0, an * .1, an, an * .42, 0, 0, 6.2832); cx.fill();
    cx.fillStyle = vivo ? '#1a1018' : '#09080e';
    cx.beginPath(); cx.ellipse(0, -an * .05, an * .8, an * .34, 0, 0, 6.2832); cx.fill();
    cx.fillStyle = '#05050a';
    cx.beginPath();
    cx.moveTo(-an * .34, -an * .1); cx.lineTo(-an * .3, -an * .68);
    cx.lineTo(an * .16, -an * .68); cx.lineTo(an * .2, -an * .1);
    cx.closePath(); cx.fill();
    cx.restore();
    if (vivo) {
      if (Math.sin(t * 8.5) > .74) D.bombita(x, y - an * 2.2, 2.6, '190,255,215', 1);
      D.resplandor(x, y, an * 3, '110,210,160', .09);
    }
  }

  /* --- laberinto de espejos --- */
  function espejos(cx, x, piso, H, t) {
    var an = H * .56, al = H * .46;
    var x0 = x - an / 2;
    cx.save();
    var n = 7, pa = an / n;
    for (var i = 0; i < n; i++) {
      var px = x0 + i * pa;
      var brillo = .05 + .12 * (0.5 + 0.5 * Math.sin(t * .7 + i * 1.4));
      var g = cx.createLinearGradient(px, piso - al, px + pa, piso);
      g.addColorStop(0, 'rgba(160,168,215,' + brillo + ')');
      g.addColorStop(.5, 'rgba(42,38,68,.6)');
      g.addColorStop(1, 'rgba(126,134,185,' + (brillo * .6) + ')');
      cx.fillStyle = g;
      cx.fillRect(px + 2, piso - al, pa - 4, al);
      cx.strokeStyle = HIERRO; cx.lineWidth = 3;
      cx.strokeRect(px + 2, piso - al, pa - 4, al);
    }
    // Marquesina.
    cx.fillStyle = HIERRO;
    cx.beginPath();
    cx.moveTo(x0 - an * .05, piso - al);
    cx.lineTo(x, piso - al * 1.22);
    cx.lineTo(x0 + an + an * .05, piso - al);
    cx.closePath(); cx.fill();
    for (var b = 0; b <= 10; b++) {
      var u = b / 10;
      var bx = x0 - an * .05 + (an + an * .1) * u;
      var by = piso - al - al * .22 * (1 - Math.abs(u - .5) * 2);
      D.bombita(bx, by, 2, '176,158,235', .5 + .5 * Math.sin(t * 2 + b));
    }
    cx.restore();
    D.cartel(x, piso - al * 1.30, 'ESPEJOS',
      { ancho: H * .24, color: '#4a3f6e', tinta: '#ddd6ff', colorLuz: '176,158,235' });
  }

  /* --- martillo de fuerza --- */
  function martillo(cx, x, piso, H, t) {
    var al = H * .62, an = H * .13;
    cx.save();
    // Riel con marcas y números.
    cx.fillStyle = HIERRO;
    cx.fillRect(x - an * .16, piso - al, an * .32, al);
    cx.fillStyle = HIERRO_LUZ;
    cx.fillRect(x - an * .07, piso - al, an * .14, al);
    cx.strokeStyle = '#41345a'; cx.lineWidth = 2.5;
    for (var i = 1; i < 12; i++) {
      var y = piso - al * i / 12;
      cx.beginPath();
      cx.moveTo(x - an * .30, y); cx.lineTo(x - an * .16, y);
      cx.stroke();
      if (i % 3 === 0)
        D.bombita(x + an * .26, y, 2, '255,150,110', .45 + .4 * Math.sin(t * 2.4 + i));
    }
    // Campana arriba.
    cx.fillStyle = '#7d6330';
    cx.beginPath();
    cx.moveTo(x - an * .40, piso - al);
    cx.quadraticCurveTo(x, piso - al - an * .58, x + an * .40, piso - al);
    cx.closePath(); cx.fill();
    cx.fillStyle = '#a88544';
    cx.beginPath();
    cx.ellipse(x, piso - al, an * .40, an * .07, 0, 0, 6.2832);
    cx.fill();
    D.resplandor(x, piso - al - an * .25, an * 2.2, '255,196,110', .16);

    // Base y maza apoyada.
    cx.fillStyle = '#1b1526';
    cx.fillRect(x - an * .62, piso - an * .30, an * 1.24, an * .30);
    cx.fillStyle = '#2a2138';
    cx.fillRect(x - an * .62, piso - an * .34, an * 1.24, an * .07);
    cx.strokeStyle = '#3a2f4a'; cx.lineWidth = an * .10;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(x + an * .52, piso - an * .08);
    cx.lineTo(x + an * .90, piso - an * .82);
    cx.stroke();
    cx.fillStyle = '#332a44';
    cx.save();
    cx.translate(x + an * .93, piso - an * .90);
    cx.rotate(-.45);
    cx.fillRect(-an * .16, -an * .13, an * .32, an * .26);
    cx.restore();

    cx.restore();
    D.cartel(x, piso - al - an * 1.10, 'PROBÁ TU FUERZA',
      { ancho: H * .28, alto: H * .075, color: '#6e4630', tinta: '#ffd9a8', cuerpo: H * .030 });
  }

  /* --- vuelta al mundo --- */
  function rueda(cx, x, piso, H, t) {
    var R = H * .40;
    var cy = piso - R * 1.18;
    cx.save();
    cx.strokeStyle = HIERRO; cx.lineWidth = Math.max(2, R * .028);
    cx.beginPath(); cx.arc(x, cy, R, 0, 6.2832); cx.stroke();
    cx.beginPath(); cx.arc(x, cy, R * .92, 0, 6.2832); cx.stroke();
    var giro = t * .10, N = 16;
    for (var i = 0; i < N; i++) {
      var a = giro + i * 6.2832 / N;
      var px = x + Math.cos(a) * R, py = cy + Math.sin(a) * R;
      cx.strokeStyle = HIERRO; cx.lineWidth = Math.max(1.2, R * .014);
      cx.beginPath(); cx.moveTo(x, cy); cx.lineTo(px, py); cx.stroke();
      var cb = R * .07;
      cx.fillStyle = HIERRO; cx.fillRect(px - cb / 2, py, cb, cb * 1.3);
      if (Math.sin(t * 1.5 + i * 1.7) > -.55)
        D.bombita(px, py, Math.max(1.3, R * .014), '255,198,120', .5 + .5 * Math.sin(t * 2.6 + i));
    }
    cx.strokeStyle = HIERRO; cx.lineWidth = Math.max(2.5, R * .045);
    cx.beginPath();
    cx.moveTo(x - R * .44, piso); cx.lineTo(x, cy);
    cx.lineTo(x + R * .44, piso); cx.stroke();
    cx.beginPath();
    cx.moveTo(x - R * .28, cy + R * .82); cx.lineTo(x + R * .28, cy + R * .82); cx.stroke();
    cx.restore();
    D.carteliPie(x - R * .95, piso, 'VUELTA AL MUNDO',
      { ancho: H * .20, alto: H * .052, color: '#6b4a55', tinta: '#ffdcc8', cuerpo: H * .022 });
  }

  /* --- carpa del fondo --- */
  function carpa(cx, x, piso, H, t) {
    var an = H * .46, al = H * .42;
    cx.save();
    var cima = piso - al * 1.24, hombro = piso - al * .42;
    for (var i = 0; i < 9; i++) {
      var u0 = i / 9, u1 = (i + 1) / 9;
      cx.fillStyle = (i % 2 === 0) ? LONA_A : LONA_B;
      cx.beginPath();
      cx.moveTo(x, cima);
      cx.lineTo(x - an / 2 + an * u0, hombro + Math.pow(Math.abs(u0 - .5) * 2, 2) * al * .14);
      cx.lineTo(x - an / 2 + an * u1, hombro + Math.pow(Math.abs(u1 - .5) * 2, 2) * al * .14);
      cx.closePath(); cx.fill();
    }
    cx.fillStyle = LONA_A;
    cx.fillRect(x - an / 2, hombro + al * .14, an, piso - hombro - al * .14);
    // Boca iluminada: es la única luz de esta punta de la feria.
    var g = cx.createLinearGradient(x, hombro, x, piso);
    g.addColorStop(0, 'rgba(255,176,86,.5)');
    g.addColorStop(1, 'rgba(170,60,60,.12)');
    cx.fillStyle = g;
    cx.beginPath();
    cx.moveTo(x - an * .15, piso); cx.lineTo(x - an * .12, hombro + al * .06);
    cx.quadraticCurveTo(x, hombro - al * .02, x + an * .12, hombro + al * .06);
    cx.lineTo(x + an * .15, piso); cx.closePath(); cx.fill();
    D.resplandor(x, piso - al * .2, an * .7, '255,170,90', .12);
    // Banderín.
    cx.strokeStyle = HIERRO; cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(x, cima); cx.lineTo(x, cima - al * .16); cx.stroke();
    cx.fillStyle = '#a8323f';
    var on = Math.sin(t * 2.2) * 3;
    cx.beginPath();
    cx.moveTo(x, cima - al * .16); cx.lineTo(x + 14 + on, cima - al * .11);
    cx.lineTo(x, cima - al * .06); cx.closePath(); cx.fill();
    cx.restore();
  }

  var DIBUJOS = {
    entrada: entrada, tiro: tiro, calesita: calesita, montania: montania,
    chocadores: chocadores, espejos: espejos, martillo: martillo,
    rueda: rueda, carpa: carpa
  };

  function dibujar(clave, cx, x, piso, H, t) {
    var f = DIBUJOS[clave];
    if (f) f(cx, x, piso, H, t);
  }

  return { dibujar: dibujar, DIBUJOS: DIBUJOS, perfilMontania: perfilMontania };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Atracciones; }
