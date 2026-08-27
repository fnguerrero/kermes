# Kermés

Bel vuelve caminando por el baldío de siempre y esta noche hay una feria. Abierta,
encendida, sin nadie. En la boletería vacía hay tres cartas boca abajo.

Aventura ilustrada de una noche, con tarot como sistema de juego. 15-20 minutos
por partida.

## Cómo funciona

**La tirada decide la noche.** Tres cartas al empezar: qué vino a buscar Bel, qué
la está esperando y cómo puede cerrarse. Los lugares son siempre los mismos; la
noche no.

**Cada atracción es un Arcano Mayor.** La vuelta al mundo es La Rueda de la
Fortuna, la caída libre es La Torre, el laberinto de espejos es La Luna, las
sillas voladoras El Colgado, los autitos El Carro, la calesita El Sol, el puesto
de tiro El Mago, y la carpa del fondo La Sacerdotisa.

**Los encuentros se resuelven con cartas, no con preguntas.** Cuando la presencia
aparece, jugás una de las que juntaste. El efecto sale del significado del arcano
y de si salió al derecho o invertido.

**No se pierde.** Se cierra mejor o peor según cuántos de los tres hilos de la
tirada aguantaron.

## Lo que se calcula de verdad

La luna de esta noche: fase, signo y grado, con la serie ELP-2000 truncada y el
Sol por la fórmula de Meeus. Se verifica contra el motor completo de ViaCombusta,
que a su vez está verificado contra los ejemplos publicados de *Astronomical
Algorithms*. El error queda por debajo de medio minuto de arco.

Todo lo demás también es propio: los dibujos son canvas, la música son
osciladores. No hay imágenes ni archivos de audio.

## Estructura

```
index.html          entrada en desarrollo, carga los módulos sueltos
build.py            empaqueta todo en un solo archivo
css/style.css
js/luna.js          fase y signo lunar reales
js/arcanos.js       los 22 arcanos con su efecto al derecho y al revés
js/dibujo.js        primitivas de canvas compartidas
js/escenas.js       las nueve escenas de la feria
js/guion.js         la tirada, las atracciones, los encuentros y los finales
js/audio.js         vals de calesita generado en vivo, reactivo a la tensión
js/juego.js         motor: estado, pantallas, recorrido
test/               test de la luna y hoja de contactos de las escenas
dist/               index.html autocontenido + artifact.html
```

## Correr y empaquetar

```
node test/test-luna.js                  la luna contra el motor verificado
py -3 build.py                          genera dist/
py -3 tools/make_icon.py                genera el icono
powershell -ExecutionPolicy Bypass -File tools/crear-acceso-directo.ps1
```

`test/escenas.html` abre una hoja de contactos con las nueve escenas animadas,
para revisar la composición de todas juntas.
