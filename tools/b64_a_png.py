#!/usr/bin/env python3
"""Convierte un volcado base64 en PNG.

El navegador integrado de esta sesion no compone frames, asi que la unica forma
de mirar un render es sacarlo del canvas como base64 y pasarlo por aca.

Uso:  py -3 tools/b64_a_png.py entrada.txt salida.png
"""
import base64
import io
import sys

if len(sys.argv) < 3:
    print(__doc__)
    sys.exit(1)

datos = io.open(sys.argv[1], encoding='utf-8').read().strip()
if ',' in datos[:80]:
    datos = datos.split(',', 1)[1]
with open(sys.argv[2], 'wb') as f:
    f.write(base64.b64decode(datos))
print('%s escrito (%d bytes)' % (sys.argv[2], len(base64.b64decode(datos))))
