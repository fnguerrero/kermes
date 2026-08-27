#!/usr/bin/env python3
"""Genera el icono de Kermés: la vuelta al mundo encendida contra la noche.

A 16 px no entra casi nada, asi que se reduce a tres cosas: el aro, los rayos
y las bombitas amarillas. Es lo que hace que se lea como feria y no como reloj.

Uso:  py -3 tools/make_icon.py
"""
import math
import os

from PIL import Image, ImageDraw, ImageFilter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(BASE, 'kermes.ico')

FONDO = (9, 11, 18, 255)
HIERRO = (26, 22, 34, 255)
AMBAR = (255, 198, 116, 255)
AMBAR_FUERTE = (255, 228, 172, 255)


def dibujar(px):
    """Dibuja el icono a resolucion px, con 4x de supermuestreo."""
    S = 4
    n = px * S
    c = n / 2.0
    R = n * 0.335          # radio del aro
    N = 10                 # cabinas

    def caja(r):
        return [c - r, c - r, c + r, c + r]

    # Halo de las luces, en su propia capa para desenfocarlo.
    brillo = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    db = ImageDraw.Draw(brillo)
    for i in range(N):
        a = i * 2 * math.pi / N - math.pi / 2
        x, y = c + math.cos(a) * R, c + math.sin(a) * R
        r = n * 0.055
        db.ellipse([x - r, y - r, x + r, y + r], fill=AMBAR)
    brillo = brillo.filter(ImageFilter.GaussianBlur(n * 0.045))

    img = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Disco de noche.
    d.ellipse(caja(n * 0.47), fill=FONDO)

    # Base: dos patas y el eje.
    grosor = max(S, int(n * 0.030))
    d.line([c - R * 0.55, c + R * 1.30, c, c], fill=HIERRO, width=grosor)
    d.line([c + R * 0.55, c + R * 1.30, c, c], fill=HIERRO, width=grosor)

    # Rayos.
    for i in range(N):
        a = i * 2 * math.pi / N - math.pi / 2
        d.line([c, c, c + math.cos(a) * R, c + math.sin(a) * R],
               fill=HIERRO, width=max(S, int(n * 0.016)))

    # Aro.
    d.ellipse(caja(R), outline=HIERRO, width=max(S, int(n * 0.026)))

    # Bombitas.
    for i in range(N):
        a = i * 2 * math.pi / N - math.pi / 2
        x, y = c + math.cos(a) * R, c + math.sin(a) * R
        r = n * 0.030
        d.ellipse([x - r, y - r, x + r, y + r], fill=AMBAR_FUERTE)

    # Eje central.
    r = n * 0.045
    d.ellipse([c - r, c - r, c + r, c + r], fill=AMBAR)

    img = Image.alpha_composite(brillo, img)
    return img.resize((px, px), Image.LANCZOS)


def main():
    tamanos = [256, 128, 64, 48, 32, 24, 16]
    capas = [dibujar(t) for t in tamanos]
    capas[0].save(SALIDA, format='ICO',
                  sizes=[(t, t) for t in tamanos],
                  append_images=capas[1:])
    print('icono: %s (%d bytes)' % (SALIDA, os.path.getsize(SALIDA)))

    # Tira de tamanos reales, para juzgar la legibilidad.
    grande = dibujar(256)
    grande.save(os.path.join(BASE, 'tools', 'icono-preview.png'))
    anchos = [16, 24, 32, 48, 64]
    tira = Image.new('RGBA', (sum(anchos) + 12 * len(anchos), 64), (24, 22, 30, 255))
    x = 0
    for t in anchos:
        chico = grande.resize((t, t), Image.LANCZOS)
        tira.paste(chico, (x, (64 - t) // 2), chico)
        x += t + 12
    tira.resize((tira.width * 3, tira.height * 3), Image.NEAREST).save(
        os.path.join(BASE, 'tools', 'icono-tamanos.png'))


if __name__ == '__main__':
    main()
