const nlp = require('compromise');

const sinonimos = {
  filtro: ['filtro', 'cartucho', 'malla', 'elemento filtrante', 'rejilla', 'depurador'],
  limpiar: ['limpiar', 'lavar', 'asear', 'desinfectar', 'quitar polvo', 'mantener limpio', 'limpieza'],
  sensor: ['sensor', 'medidor', 'detector', 'monitor', 'medidor de aire', 'captador'],
  motor: ['motor', 'ventilador', 'brushless', 'rotor', 'generador', 'turbina', 'a2212'],
  partícula: ['partícula', 'polvo', 'micropartícula', 'contaminante', 'materia suspendida', 'pm'],
  aire: ['aire', 'atmósfera', 'oxígeno', 'ambiente', 'ventilación'],
  purificador: ['purificador', 'depurador', 'limpiador de aire', 'filtro de aire', 'AirGuard', 'equipo'],
  conectar: ['conectar', 'enlazar', 'emparejar', 'vincular', 'configurar wifi', 'red'],
  problema: ['problema', 'error', 'falla', 'fallo', 'inconveniente', 'bug', 'ruido', 'alerta'],
  ruido: ['ruido', 'zumbido', 'vibración', 'sonido fuerte', 'molestia sonora'],
  cambiar: ['cambiar', 'reemplazar', 'sustituir', 'poner nuevo', 'modificar'],
  calidad: ['calidad', 'estado', 'nivel', 'pureza', 'condición'],
  datos: ['datos', 'información', 'registro', 'lectura', 'mediciones', 'historial'],
  gases: ['gases', 'vapores', 'compuestos', 'vocs', 'humos', 'contaminantes químicos'],
  encender: ['encender', 'activar', 'prender', 'iniciar', 'comenzar'],
  apagar: ['apagar', 'detener', 'desactivar', 'finalizar'],
  app: ['app', 'aplicación', 'programa', 'control desde celular', 'móvil'],
  salud: ['salud', 'bienestar', 'enfermedades', 'asma', 'alergias', 'prevención'],
  niños: ['niños', 'bebés', 'peques', 'chicos', 'menores'],
  hogar: ['hogar', 'casa', 'interior', 'departamento', 'cuarto', 'habitación'],
  ayuda: ['ayuda', 'asistencia', 'soporte', 'me puedes ayudar', 'tengo una duda', 'necesito saber'],
  causas: ['causas', 'motivos', 'razones', 'factores', 'genera', 'provoca', 'fuentes', 'por qué','causa'],
  casa: ['casa', 'hogar', 'vivienda', 'cuarto', 'habitación', 'interior', 'departamento']
};


function expandirConSinonimos(palabras) {
  let expandidas = [];

  palabras.forEach(palabra => {
    if (sinonimos[palabra]) {
      expandidas = expandidas.concat(sinonimos[palabra]);
    } else {
      expandidas.push(palabra);
    }
  });

  // Quitar duplicados
  return [...new Set(expandidas)];
}

// Ejemplo función que usas en tu pipeline para buscar
function buscarRespuesta(mensaje, baseDatos) {
  const palabrasClave = extraerPalabrasClave(mensaje);
  const palabrasExpandidas = expandirConSinonimos(palabrasClave);

  let mejorCoincidencia = null;
  let puntuacionMasAlta = 0;

   for (const item of baseDatos) {
    const titulo = item.titulo.toLowerCase();
    const contenido = item.contenido.toLowerCase();
    const tags = (item.tags || []).map(t => t.toLowerCase()).join(' ');

    let puntuacion = 0;

    palabrasExpandidas.forEach(palabra => {
      if (titulo.includes(palabra)) puntuacion += 3;       // Más relevante
      if (tags.includes(palabra)) puntuacion += 2;          // Bastante relevante
      if (contenido.includes(palabra)) puntuacion += 1;     // Relevante pero menos
    });

    if (puntuacion > puntuacionMasAlta) {
      puntuacionMasAlta = puntuacion;
      mejorCoincidencia = item;
    }
  }

  // Si no pasa el umbral mínimo, dar mensaje alternativo
  if (puntuacionMasAlta >= 3) {
    return mejorCoincidencia;
  } else {
    return {
      titulo: "No encontré información precisa",
      contenido: "Intenta hacer tu pregunta con un poco más de detalle, por ejemplo: '¿cómo limpiar el filtro del purificador?'",
    };
  }
}


function normalizarPalabra(palabra) {
  let limpio = palabra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  limpio = limpio.toLowerCase();
  // Quitar todo lo que no sea letra, número o espacio
  limpio = limpio.replace(/[^a-z0-9áéíóúñü\s]/gi, '');
  return limpio;
}

function extraerPalabrasClave(mensaje) {
  // Limpiar el mensaje completo primero (para que no haya palabras pegadas)
  let mensajeLimpio = normalizarPalabra(mensaje);

  // Ahora, separar en palabras por espacio
  let palabras = mensajeLimpio.split(/\s+/);

  // Filtrar stopwords y palabras cortas
  const stopwords = ['como', 'que', 'es', 'puedo', 'hacer', 'hay', 'una', 'un', 'el', 'la', 'los', 'las', 'para', 'de', 'mi', 'si', 'en', 'con', 'por', 'al', 'del', 'y', 'o', 'se', 'a'];

  palabras = palabras.filter(p => p.length > 2 && !stopwords.includes(p));

  // Quitar duplicados
  palabras = [...new Set(palabras)];

  return palabras;
}

module.exports = { extraerPalabrasClave,
  expandirConSinonimos,
  buscarRespuesta, };
