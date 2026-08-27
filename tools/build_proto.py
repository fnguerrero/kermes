#!/usr/bin/env python3
"""Empaqueta el prototipo caminable en un solo archivo.

Es para probar la sensación de caminar la feria, no el juego terminado.

Uso:  py -3 tools/build_proto.py
"""
import io
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(BASE, 'dist', 'prototipo.html')

SCRIPTS = ['js/luna.js', 'js/dibujo.js', 'js/bel.js', 'js/cielo.js',
           'js/mundo.js', 'js/atracciones.js', 'js/secuencias.js', 'js/sentido.js']


def read(rel):
    with io.open(os.path.join(BASE, rel), encoding='utf-8') as f:
        return f.read()


def strip_cjs(src):
    src = re.sub(
        r"\n?if \(typeof module !== 'undefined' && module\.exports\) \{[^}]*\}\n?",
        '\n', src)
    src = re.sub(
        r"\(typeof (\w+) !== 'undefined'\) \? \1 : require\([^)]*\)", r"\1", src)
    return src


def main():
    html = read('test/caminar.html')

    # Los <script src> se reemplazan por el código inline.
    juntos = '\n\n'.join('/* ===== %s ===== */\n%s' % (s, strip_cjs(read(s)).strip())
                         for s in SCRIPTS)
    html = re.sub(r'\n<script src="\.\./js/[^"]+"></script>', '', html)
    html = html.replace('<script>\nconst cv',
                        '<script>\n' + juntos + '\n\n// ===== prototipo =====\nconst cv')

    # Sin servidor de capturas, el helper de desarrollo no va.
    html = html.replace("  return fetch('/_captura/' + nombre + '.png', {method:'POST', body: c2.toDataURL()}).then(r=>r.text());",
                        "  return c2.toDataURL();")
    html = html.replace('<title>Kermés — prototipo caminable</title>',
                        '<title>Kermés — prototipo</title>')

    # Guard rail: al editar caminar.html con parches automáticos ya pasó que un
    # corte se llevara puesto un bloque vecino y el juego quedara en negro.
    # Estas son las declaraciones sin las cuales el bucle no arranca.
    imprescindibles = [
        'let tocando', 'function entrada(', 'function cuadro(',
        'const bel', 'const m ', 'const cielo',
        'requestAnimationFrame(cuadro)', 'Secuencias.iniciar', 'function armarMontania', 'Sentido.crear', 'Sentido.escalaTiempo',
    ]
    # Ya pasó que el prompt prometiera "E para subirte" y E no hiciera nada en
    # ocho de las nueve paradas. Todas menos la montaña rusa (que tiene su
    # secuencia) necesitan una observación.
    conMirar = html.count('mirar:')
    if conMirar < 8:
        raise SystemExit('solo %d paradas responden a E; faltan observaciones' % conMirar)

    faltan = [x for x in imprescindibles if x not in html]
    if faltan:
        raise SystemExit('FALTAN en el paquete: ' + ', '.join(faltan))

    if not os.path.isdir(os.path.dirname(SALIDA)):
        os.makedirs(os.path.dirname(SALIDA))
    with io.open(SALIDA, 'w', encoding='utf-8') as f:
        f.write(html)
    print('prototipo.html  %7.1f KB' % (len(html.encode('utf-8')) / 1024.0))
    if 'script src="../js' in html:
        print('OJO: quedaron scripts externos sin inlinear')


if __name__ == '__main__':
    main()
