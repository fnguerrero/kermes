/* Contenido de la noche: la tirada de apertura, lo que pasa en cada atracción,
   los encuentros y los finales.

   La variación no está en el mapa sino en la tirada: tres cartas deciden qué
   vino a buscar Bel, qué la está esperando y cómo puede cerrarse. Los mismos
   lugares dan noches distintas. */
var Guion = (function () {
  'use strict';

  var A = (typeof Arcanos !== 'undefined') ? Arcanos : require('./arcanos.js');

  /* ==================== la tirada de apertura ==================== */

  var POSICIONES = [
    { clave: 'busca',  titulo: 'Lo que vino a buscar' },
    { clave: 'espera', titulo: 'Lo que la está esperando' },
    { clave: 'cierre', titulo: 'Cómo puede cerrarse' }
  ];

  /* Qué significa cada arcano en cada posición. Si un arcano no está acá,
     se usa su lectura general, así nunca falta texto. */
  var LECTURAS = {
    busca: {
      loco: 'Nada en concreto. Salió a caminar y la feria estaba abierta.',
      mago: 'Algo que sabe hacer y hace mucho que no hace.',
      sacerdotisa: 'Una respuesta que ya tiene y no se anima a leer.',
      emperatriz: 'Ganas. Las ganas de antes.',
      emperador: 'Un límite propio, uno que pueda sostener.',
      sumo: 'Permiso. De alguien, de cualquiera.',
      enamorados: 'Decidirse de una vez por una de las dos cosas.',
      carro: 'Empuje para arrancar algo que tiene parado.',
      justicia: 'Que algo se ponga en su lugar.',
      ermitano: 'Un rato sola donde nadie le pregunte nada.',
      rueda: 'Que cambie algo. Cualquier cosa, pero que cambie.',
      fuerza: 'Aguante para lo que viene.',
      colgado: 'Mirar todo de otra manera.',
      muerte: 'Terminar algo que viene arrastrando.',
      templanza: 'Bajar un cambio sin sentir que abandona.',
      diablo: 'Cortar con algo que le gusta y le hace mal.',
      torre: 'Que se caiga de una vez lo que se está cayendo.',
      estrella: 'Una razón para seguir.',
      luna: 'Entender un sueño que se le repite.',
      sol: 'Verse clara, aunque sea un rato.',
      juicio: 'Que la llamen. Que alguien la nombre.',
      mundo: 'Cerrar una vuelta que dejó abierta.'
    },
    espera: {
      loco: 'Algo sin plan, que hace lo que se le ocurre.',
      mago: 'Algo que la conoce mejor de lo que debería.',
      sacerdotisa: 'Algo que sabe callarse y esperar.',
      emperatriz: 'Algo que la quiere cuidar demasiado.',
      emperador: 'Algo que da órdenes.',
      sumo: 'Algo que le va a explicar cómo se hacen las cosas.',
      enamorados: 'Algo que le va a pedir que elija.',
      carro: 'Algo que viene rápido y de frente.',
      justicia: 'Algo que le viene a cobrar.',
      ermitano: 'Algo que se esconde y la deja buscar.',
      rueda: 'Algo que cambia de forma cada vez que lo mira.',
      fuerza: 'Algo que no se puede vencer, solo calmar.',
      colgado: 'Algo que está al revés y no se mueve.',
      muerte: 'Algo que quiere que termine.',
      templanza: 'Algo que la va a convencer de a poco.',
      diablo: 'Algo que le va a ofrecer un trato.',
      torre: 'Algo que va a hacer ruido y romper.',
      estrella: 'Algo que le va a dar esperanza falsa.',
      luna: 'Algo que no se ve entero nunca.',
      sol: 'Algo que se muestra de frente y encandila.',
      juicio: 'Algo que la llama por su nombre.',
      mundo: 'Algo que la quiere adentro para siempre.'
    },
    cierre: {
      loco: 'Yéndose sin explicar nada.',
      mago: 'Usando lo que trajo puesto.',
      sacerdotisa: 'Callándose lo que vio.',
      emperatriz: 'Cuidando algo que encontró acá.',
      emperador: 'Poniendo un límite y no moviéndolo.',
      sumo: 'Repitiendo un gesto viejo.',
      enamorados: 'Eligiendo, y perdiendo lo otro.',
      carro: 'Saliendo de una, sin mirar atrás.',
      justicia: 'Pagando exactamente lo que debe.',
      ermitano: 'Sola, con su propia luz.',
      rueda: 'Como salga. No depende de ella.',
      fuerza: 'Sin levantar la voz.',
      colgado: 'Quedándose quieta hasta que pase.',
      muerte: 'Dejando algo acá adentro.',
      templanza: 'Sin apurarse.',
      diablo: 'Aceptando un precio.',
      torre: 'Rompiendo lo que haga falta.',
      estrella: 'Confiando, aunque no tenga motivo.',
      luna: 'Sin saber del todo qué pasó.',
      sol: 'A la vista de todos.',
      juicio: 'Diciendo un nombre en voz alta.',
      mundo: 'Entera.'
    }
  };

  function lectura(posicion, clave) {
    var l = LECTURAS[posicion] && LECTURAS[posicion][clave];
    return l || A.get(clave).lectura;
  }

  /* ==================== apertura ==================== */

  function prologo(nombre, luna) {
    return [
      'Bel volvía caminando y agarró para el lado del baldío, que es más largo ' +
      'pero está más tranquilo.',
      'El baldío hace veinte años que es un baldío.',
      'Esta noche hay una feria.',
      'No una feria armándose ni una feria levantando: una feria abierta, ' +
      'encendida, con la vuelta al mundo girando y la música saliendo de algún ' +
      'lado, a esta hora, en un terreno donde no entra un camión hace dos décadas.',
      'Y no hay nadie.',
      'La boletería está iluminada. Adentro no hay nadie tampoco, pero sobre el ' +
      'mostrador hay tres cartas boca abajo y un vuelto contado, en monedas, ' +
      'apilado para alguien que todavía no llegó.',
      '<em>' + luna.fase.charAt(0).toUpperCase() + luna.fase.slice(1) +
      ' en ' + luna.signoNombre + '.</em> Bel lo sabe sin mirar el cielo, porque ' +
      'hace años que lo sabe siempre.',
      'Da vuelta la primera carta.'
    ];
  }

  function tiradaTexto(cartas) {
    return [
      'Tres cartas sobre el mostrador de una boletería vacía.',
      'Bel las lee como leería cualquier tirada: sin adornarla, sin suavizarla, ' +
      'sin sacarle el filo.',
      'Y esta le habla de esta noche.'
    ];
  }

  function entrada(nombre) {
    return [
      'El molinete gira solo una vez, como si alguien acabara de pasar.',
      'Adentro el aire está unos grados más caliente que afuera, y huele a ' +
      'azúcar quemada y a lona mojada.',
      'La feria se abre en abanico: la vuelta al mundo a la izquierda, las carpas ' +
      'a la derecha, y en el fondo, apagada, la única que no tiene luces prendidas.',
      'Bel puede ir a donde quiera. Nadie le va a decir que no.'
    ];
  }

  /* ==================== las atracciones ==================== */

  /* Cada atracción trae:
       llegada   párrafos al entrar
       acciones  lo que se puede hacer; cada una se hace una sola vez
     Cada acción tiene: texto del botón, resultado, y qué provoca.
       da: 'carta'      suma una carta a la mano
       tension: n       cuánto acerca a la presencia
       marca: 'clave'   deja una marca que el final va a leer */
  var ATRACCIONES = {

    rueda: {
      llegada: [
        'La vuelta al mundo gira despacio y no para nunca. Las cabinas suben ' +
        'vacías, llegan arriba, bajan vacías.',
        'No hay motor. Bel se fija bien: no hay motor, no hay cable, no hay caja ' +
        'de mando. La rueda gira porque sí, como giran las cosas que ya empezaron.',
        'Una cabina se soltó en algún momento y quedó tirada al costado, con la ' +
        'puerta abierta hacia arriba, como una boca.'
      ],
      acciones: [
        { texto: 'Subir a una cabina',
          resultado: [
            'Bel se sube en movimiento, que es como se sube siempre.',
            'Desde arriba la feria es chiquita y se ve entera, y por un momento ' +
            'entiende el mapa de todo: dónde está cada cosa, cuánto le falta.',
            'También ve algo caminando entre las carpas. Va despacio y no mira ' +
            'para arriba.'
          ],
          da: 'carta', tension: .25, marca: 'vio_el_mapa' },
        { texto: 'Mirar la cabina caída',
          resultado: [
            'Adentro hay un abrigo doblado. Prolijo, como lo dobla alguien que ' +
            'piensa volver.',
            'Bel lo levanta y abajo hay una carta.',
            'La cabina no está oxidada ni rota. Está desabrochada.'
          ],
          da: 'carta', tension: .1 },
        { texto: 'Buscar el motor',
          resultado: [
            'Rodea la estructura entera. En el lugar donde tendría que estar el ' +
            'motor hay un hueco limpio, con el piso de cemento marcado por donde ' +
            'estuvo apoyado, hace mucho.',
            'La rueda sigue girando arriba de su cabeza.',
            'Bel se queda mirando eso más tiempo del que le conviene.'
          ],
          tension: .3, marca: 'sabe_que_no_hay_motor' }
      ]
    },

    torre: {
      llegada: [
        'La caída libre es lo más alto del predio y está torcida.',
        'No mucho. Lo justo para que se note si uno la mira derecho: la torre ' +
        'está inclinada como un diente flojo, y arriba de todo el carro cuelga a ' +
        'mitad de camino, quieto, con los cinturones colgando.',
        'Las balizas rojas siguen andando. Suben, llegan arriba, vuelven a empezar.'
      ],
      acciones: [
        { texto: 'Subir por la escalera de servicio',
          resultado: [
            'Sube. Los escalones aguantan, que es lo raro.',
            'A la altura del carro se para. Los cinturones están todos abrochados: ' +
            'no colgando abiertos, abrochados, cada uno cerrado sobre su asiento ' +
            'vacío.',
            'Bel no los toca. Baja despacio, sin darse vuelta.'
          ],
          tension: .35, da: 'carta', marca: 'subio_la_torre' },
        { texto: 'Leer el cartel de seguridad',
          resultado: [
            'Está en la base, esmaltado, con la letra de los ochenta.',
            '<em>Prohibido el ascenso a menores de 12 años. Prohibido el ascenso ' +
            'a personas con problemas cardíacos. Prohibido bajar antes de subir.</em>',
            'Bel lee la última línea tres veces.'
          ],
          tension: .2 },
        { texto: 'Empujar la torre',
          resultado: [
            'Apoya las dos manos en la viga y empuja, más por curiosidad que por ' +
            'otra cosa.',
            'La torre entera se mueve. Un centímetro, quizá dos, y vuelve.',
            'Pesa lo que pesa una torre. Y se movió.'
          ],
          tension: .4, marca: 'movio_la_torre' }
      ]
    },

    espejos: {
      llegada: [
        'El laberinto de espejos tiene la fachada entera de vidrio y las luces de ' +
        'la marquesina moradas, casi todas sanas.',
        'Bel se ve nueve veces mientras camina por el frente. Nueve Bel caminando ' +
        'en fila, un poco más gordas, un poco más flacas, un poco más altas.',
        'Se para. Las nueve se paran.',
        'Casi todas.'
      ],
      acciones: [
        { texto: 'Contar los reflejos',
          resultado: [
            'Uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve.',
            'Nueve paneles. Diez reflejos.',
            'Bel cuenta otra vez, más despacio, señalando con el dedo. Nueve ' +
            'paneles. Diez.',
            'El de más no está en ningún panel. Está entre dos.'
          ],
          tension: .45, da: 'carta', marca: 'conto_los_reflejos' },
        { texto: 'Entrar al laberinto',
          resultado: [
            'Adentro se pierde en cuatro pasos, como se pierde todo el mundo.',
            'Pero en una vuelta se encuentra de frente con ella misma haciendo ' +
            'algo que ella no está haciendo: el reflejo está guardando una carta ' +
            'en el bolsillo.',
            'Bel se toca el bolsillo. Está la carta.'
          ],
          da: 'carta', tension: .3 },
        { texto: 'Tocar el vidrio',
          resultado: [
            'Apoya la palma. El vidrio está tibio, que es lo que un vidrio no está ' +
            'nunca a esta hora.',
            'Del otro lado, el reflejo apoya la palma medio segundo después.',
            'Medio segundo.'
          ],
          tension: .35 }
      ]
    },

    chocadores: {
      llegada: [
        'La pista de autitos está encendida y tiene la malla del techo entera.',
        'Hay cuatro autitos parados, cada uno en la posición en que lo dejaron: ' +
        'de costado, contra la baranda, dado vuelta contra otro.',
        'Y hay uno andando.',
        'Da vueltas despacio, solo, con el pantógrafo chispeando en la malla. ' +
        'Bel se queda mirándolo dar tres vueltas completas. No lo maneja nadie.'
      ],
      acciones: [
        { texto: 'Subirse a uno de los parados',
          resultado: [
            'Se sienta. El asiento está tibio.',
            'El volante se mueve solo un poco a la izquierda, como corrigiendo, y ' +
            'después se queda quieto.',
            'Debajo del asiento, encajada, hay una carta que alguien perdió y ' +
            'nadie buscó.'
          ],
          da: 'carta', tension: .2 },
        { texto: 'Pararse en el camino del que anda',
          resultado: [
            'Bel se planta en el medio de la pista y espera.',
            'El autito viene. No acelera ni frena: viene a la misma velocidad de ' +
            'siempre, sin apuro.',
            'A un metro dobla, la rodea, y sigue.',
            'La rodeó. Un autito de chocadores la esquivó.'
          ],
          tension: .5, marca: 'la_esquivo' },
        { texto: 'Cortar la corriente',
          resultado: [
            'La llave está en un tablero al costado, con la palanca hacia arriba.',
            'La baja. Las luces de la pista se apagan todas juntas y el zumbido ' +
            'se corta.',
            'El autito sigue andando.',
            'Bel vuelve a subir la palanca, porque prefiere verlo.'
          ],
          tension: .55, da: 'carta', marca: 'corto_la_corriente' }
      ]
    },

    hamacas: {
      llegada: [
        'Las sillas voladoras están quietas y colgadas, las diez, en círculo.',
        'Es la atracción que da más pena de todas cuando está apagada: diez ' +
        'asientos de chapa colgando de cadenas, esperando chicos que hoy tienen ' +
        'cuarenta años.',
        'Una se está moviendo.',
        'No las diez. Una. Va y viene con la calma exacta de alguien que se acaba ' +
        'de sentar y todavía no arrancó.'
      ],
      acciones: [
        { texto: 'Sentarse en la de al lado',
          resultado: [
            'Bel se sienta y se agarra de las cadenas. La chapa está helada.',
            'Se hamaca un poco, con los pies.',
            'Al rato las dos sillas se están moviendo al mismo tiempo, y Bel se da ' +
            'cuenta de que no arrancaron juntas: se acompasaron.'
          ],
          da: 'carta', tension: .3, marca: 'se_hamaco' },
        { texto: 'Frenar la silla que se mueve',
          resultado: [
            'La agarra con las dos manos. Pesa más de lo que tendría que pesar una ' +
            'silla vacía.',
            'La frena. Se queda quieta.',
            'Cuando Bel la suelta, arranca otra vez, desde el mismo lugar del ' +
            'recorrido donde estaba.'
          ],
          tension: .45 },
        { texto: 'Mirar el mástil',
          resultado: [
            'En el mástil central, a la altura de la cara, hay nombres rayados con ' +
            'llave. Decenas. De todos los años.',
            'Bel los lee de arriba abajo sin buscar nada.',
            'Y encuentra el suyo, arriba de todo, en la letra que tenía a los ocho ' +
            'años.'
          ],
          tension: .5, da: 'carta', marca: 'encontro_su_nombre' }
      ]
    },

    calesita: {
      llegada: [
        'La calesita está andando y tiene la música más fuerte de toda la feria.',
        'Es la única atracción que está entera: los caballos pintados, los espejos ' +
        'del centro limpios, las lamparitas del techo todas sanas, ni una quemada.',
        'Gira a la velocidad de siempre, la de los chicos chiquitos.',
        'Y tiene la sortija colgando.'
      ],
      acciones: [
        { texto: 'Sacar la sortija',
          resultado: [
            'Bel espera el momento, estira el brazo y la saca en la primera.',
            'No es una sortija de metal. Es una carta, enrollada, atada con un hilo.',
            'La calesita no la felicita ni le da otra vuelta gratis. Sigue girando ' +
            'igual, como si eso ya estuviera arreglado de antes.'
          ],
          da: 'carta', tension: .15, marca: 'saco_la_sortija' },
        { texto: 'Subirse a un caballo',
          resultado: [
            'Elige el de afuera, el que sube y baja, que es el que elegía siempre.',
            'Da una vuelta entera mirando la feria pasar.',
            'En la segunda vuelta, en el mismo lugar del recorrido, hay alguien ' +
            'parado que en la primera vuelta no estaba.',
            'En la tercera ya no está.'
          ],
          tension: .45 },
        { texto: 'Mirarse en los espejos del centro',
          resultado: [
            'Los espejos del centro de la calesita están limpios y son buenos.',
            'Bel se ve girar, y detrás de ella ve girar la feria entera, y detrás ' +
            'de la feria ve el baldío de siempre, vacío, con los yuyos altos y el ' +
            'paredón del fondo.',
            'Los dos al mismo tiempo. La feria y el baldío, en el mismo espejo.'
          ],
          tension: .55, da: 'carta', marca: 'vio_el_baldio' }
      ]
    },

    tiro: {
      llegada: [
        'El puesto de tiro tiene las tres hileras de patos andando y las luces del ' +
        'alero todas prendidas.',
        'Los premios cuelgan del techo: peluches de hace treinta años, decolorados ' +
        'del lado que da al sol.',
        'Hay dos rifles sobre el mostrador, apoyados con el caño hacia adentro.',
        'Y hay un banquito del lado del que atiende, corrido, como si el tipo se ' +
        'hubiera parado hace un segundo.'
      ],
      acciones: [
        { texto: 'Agarrar un rifle y tirar',
          resultado: [
            'Bel apoya el codo como le enseñaron y le da a cuatro de cinco.',
            'Los patos caen y se levantan solos, que es lo que hacen los patos.',
            'El quinto no cae. Le da, lo escucha pegar, y el pato sigue andando.',
            'Le da tres veces más. El pato sigue.'
          ],
          da: 'carta', tension: .35, marca: 'el_pato_que_no_cae' },
        { texto: 'Mirar los premios',
          resultado: [
            'Los descuelga uno por uno. Están todos gastados del mismo lado.',
            'En el cuarto, cosida en la costura de atrás, hay una carta doblada en ' +
            'cuatro.',
            'Alguien la guardó ahí para que la encontrara alguien.'
          ],
          da: 'carta', tension: .1 },
        { texto: 'Sentarse del lado del que atiende',
          resultado: [
            'Pasa por abajo del mostrador y se sienta en el banquito.',
            'Desde acá se ve toda la feria de frente. Es el mejor lugar del predio ' +
            'y el único donde uno está de espaldas a la pared.',
            'El que atendía sabía elegir.',
            'Sobre la repisa, a la altura de la mano, hay un mate frío y una carta ' +
            'apoyada boca abajo, como quien deja algo separado.'
          ],
          da: 'carta', tension: .3, marca: 'se_sento_atras' }
      ]
    }
  };

  /* ==================== los encuentros ==================== */

  /* La presencia aparece cuando la tensión pasa el umbral. No hace daño: ocupa.
     Se resuelve jugando una carta, y lo que pasa depende del tono de esa carta. */
  var APARICIONES = [
    [
      'La música de la calesita se corta en la mitad de un compás, como cuando se ' +
      'corta la luz.',
      'Y en el silencio se escucha bien claro que hay alguien caminando sobre el ' +
      'pedregullo, sin apuro.'
    ],
    [
      'Todas las luces de la feria bajan un tono a la vez, y vuelven.',
      'Como cuando arranca un motor grande en algún lado. Bel se da vuelta despacio.'
    ],
    [
      'Un segundo antes olía a azúcar quemada. Ahora huele a agua estancada, a cosa ' +
      'que estuvo mucho tiempo tapada.',
      'Está más cerca que la última vez.'
    ]
  ];

  var DESCRIPCION_PRESENCIA = [
    'Tiene forma de persona parada, y eso es todo lo que tiene: donde debería ' +
    'terminar, sigue un poco más, como una mancha de humedad.',
    'Y espera. Es lo único que hace bien.'
  ];

  /* Cómo responde según el tono de la carta jugada. */
  var RESPUESTAS = {
    luz: [
      'Bel juega la carta boca arriba, con el brazo estirado, como se muestra una ' +
      'carta en una mesa.',
      'Lo que está enfrente se corre. No retrocede: se corre, como se corre alguien ' +
      'a quien le dijeron algo que no esperaba.',
      'Y le deja el camino.'
    ],
    sombra: [
      'Bel juega la carta y algo se rompe. No sabe qué, pero lo escucha.',
      'Lo que está enfrente se abre al medio y la deja pasar.',
      'Del otro lado, Bel se toca la cara y tiene la mano mojada, y no está lloviendo.'
    ],
    ambos: [
      'Bel juega la carta y lo que está enfrente la mira, si es que mira.',
      'Se queda pensando algo, si es que piensa.',
      'Después da un paso al costado, exactamente uno, el mínimo necesario, y la ' +
      'deja pasar sin dejar de estar ahí.'
    ],
    sincarta: [
      'Bel busca en el bolsillo y no tiene nada.',
      'Ninguna carta, ningún gesto, nada que mostrar.',
      'Así que hace lo único que le queda: le pasa por al lado, caminando derecho, ' +
      'sin correr y sin mirarlo.',
      'Funciona. Pero mientras pasa, algo le saca algo, y Bel no se da cuenta de ' +
      'qué hasta mucho después.'
    ]
  };

  /* ==================== el cierre ==================== */

  var VIDENTE_LLEGADA = [
    'La última carpa es la única sin luces afuera.',
    'Adentro hay una vela y hay una mujer sentada, y Bel entiende dos cosas al ' +
    'mismo tiempo: que es la primera persona que ve en toda la noche, y que no ' +
    'le va a poder ver la cara por más que se acerque.',
    '—Sentate —dice la mujer—. Ya diste toda la vuelta.',
    'Sobre la mesa hay tres cartas boca abajo. Las mismas tres de la boletería.',
    '—Estas las diste vuelta vos cuando entraste —dice—. Ahora las damos vuelta ' +
    'de nuevo, a ver si dicen lo mismo.'
  ];

  /* ==================== finales ==================== */

  /* El final sale de cuántos hilos se resolvieron y del arcano de cierre.
     No se pierde nunca: se cierra mejor o peor. */
  function final(estado) {
    var hilos = estado.hilosResueltos;
    var cierre = A.get(estado.tirada.cierre.clave);
    var comun = [];

    if (hilos >= 3) {
      comun = [
        'La mujer da vuelta las tres y las tres dicen lo mismo que decían.',
        '—Bueno —dice—. Eso no pasa casi nunca.',
        'Junta las cartas, las empareja contra la mesa y se las da a Bel.',
        '—Llevátelas. Acá ya no hacen nada.'
      ];
    } else if (hilos === 2) {
      comun = [
        'La mujer da vuelta las tres. Dos dicen lo mismo. La tercera cambió.',
        '—Pasa —dice, sin darle importancia—. Una de tres se mueve casi siempre.',
        'Empareja las cartas contra la mesa y le da dos.',
        '—La otra se queda. Volvés a buscarla cuando puedas.'
      ];
    } else if (hilos === 1) {
      comun = [
        'La mujer da vuelta las tres y se queda callada un rato largo.',
        '—Una sola aguantó —dice al final—. No es poco, ojo. Una sola aguantó ' +
        'toda la noche.',
        'Le da una carta. Las otras dos las guarda en el mazo.'
      ];
    } else {
      comun = [
        'La mujer da vuelta las tres y ninguna es la que era.',
        '—Ah —dice—. Bueno.',
        'No parece enojada ni decepcionada. Parece alguien que ya vio esto muchas ' +
        'veces.',
        '—Diste toda la vuelta igual. Eso no te lo saca nadie.'
      ];
    }

    var cerrar = [
      '—Antes de irte —dice la mujer, cuando Bel ya está en la puerta de la carpa—. ' +
      'Vos sabés que esto no estaba, ¿no?',
      '—Sé.',
      '—Bueno. Entonces está bien.'
    ];

    var salida = [
      'Bel sale de la carpa y camina hasta el molinete sin darse vuelta.',
      'Del otro lado el baldío es el baldío: los yuyos altos, el paredón del ' +
      'fondo, la bolsa de nylon enganchada en el alambre de siempre.',
      'Se da vuelta.',
      'Yuyos. Paredón. La bolsa.',
      '···',
      'En el bolsillo del abrigo tiene ' + (
        hilos >= 3 ? 'tres cartas' :
        hilos === 2 ? 'dos cartas' :
        hilos === 1 ? 'una carta' : 'una moneda de un peso que ya no se usa'
      ) + '.',
      hilos >= 1
        ? 'Las cartas son de verdad. Están gastadas en los bordes y tienen olor a ' +
          'lona. Bel las mira bajo el farol de la esquina, una por una, y después ' +
          'las guarda bien y sigue caminando para su casa.'
        : 'La moneda es de verdad. Bel la hace girar sobre la palma, la mira ' +
          'quedarse quieta, y la guarda.',
      'Al otro día abre los cuadernos.'
    ];

    return {
      titulo: hilos >= 3 ? 'Las tres aguantaron'
        : hilos === 2 ? 'Dos de tres'
        : hilos === 1 ? 'Una sola'
        : 'Ninguna era la que era',
      hilos: hilos,
      parrafos: comun.concat(cerrar).concat(salida),
      cierre: cierre
    };
  }

  return {
    POSICIONES: POSICIONES,
    ATRACCIONES: ATRACCIONES,
    APARICIONES: APARICIONES,
    DESCRIPCION_PRESENCIA: DESCRIPCION_PRESENCIA,
    RESPUESTAS: RESPUESTAS,
    VIDENTE_LLEGADA: VIDENTE_LLEGADA,
    lectura: lectura,
    prologo: prologo,
    tiradaTexto: tiradaTexto,
    entrada: entrada,
    final: final
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Guion; }
