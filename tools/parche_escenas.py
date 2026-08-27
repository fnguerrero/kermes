#!/usr/bin/env python3
"""Reemplaza las dos escenas que no se leian: los chocadores y el puesto de tiro.

En la hoja de contactos la pista de chocadores quedaba vacia y los patos del
puesto eran manchas de color sin forma. Las dos se rehacen con volumen y con
siluetas recortadas contra la luz.

Uso:  py -3 tools/parche_escenas.py
"""
import io
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUTA = os.path.join(BASE, 'js', 'escenas.js')

CHOCADORES = r'''  function chocadores(e) {
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

'''

TIRO = r'''  function tiro(e) {
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

'''


def reemplazar(texto, desde, hasta, nuevo):
    a = texto.index(desde)
    b = texto.index(hasta)
    return texto[:a] + nuevo + texto[b:]


def main():
    s = io.open(RUTA, encoding='utf-8').read()
    s = reemplazar(s, '  function chocadores(e) {',
                   '  /* ==================== XII', CHOCADORES)
    s = reemplazar(s, '  function tiro(e) {',
                   '  /* ==================== II', TIRO)
    io.open(RUTA, 'w', encoding='utf-8').write(s)
    print('escenas.js: chocadores y tiro reemplazados (%d KB)'
          % (len(s.encode('utf-8')) / 1024))


if __name__ == '__main__':
    main()
