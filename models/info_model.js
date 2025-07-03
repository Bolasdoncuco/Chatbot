// models/info_model.js
async function buscarInformacionPorPalabrasClave(palabrasClave, db) {
  const coleccion = db.collection('questions');

  if (!palabrasClave || palabrasClave.length === 0) return [];

  // 1. Preparamos regex para búsqueda exacta (case-insensitive)
  const regexPalabras = palabrasClave.map(palabra => 
    new RegExp(`\\b${palabra.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i')
  );

  // 2. Query optimizado para tu estructura de datos
  const pipeline = [
    {
      $match: {
        $or: [
          { tags: { $in: regexPalabras } },
          { titulo: { $in: regexPalabras } },
          { contenido: { $in: regexPalabras } }
        ]
      }
    },
    {
      $addFields: {
        // Puntaje basado en: tags (2pts), título (1.5pts), contenido (1pt)
        puntaje: {
          $add: [
            { $multiply: [
                { $size: {
                    $setIntersection: [
                      "$tags",
                      regexPalabras.map(r => r.source.replace(/\\b/g, ''))
                    ]
                  }
                },
                2
              ]
            },
            { $cond: [
                { $gt: [
                    { $size: {
                        $setIntersection: [
                          [{ $toString: "$titulo" }],
                          regexPalabras.map(r => r.source.replace(/\\b/g, ''))
                        ]
                      }
                    },
                    0
                  ]
                },
                1.5,
                0
              ]
            },
            { $cond: [
                { $regexMatch: { input: "$contenido", regex: regexPalabras.join('|'), options: "i" } },
                1,
                0
              ]
            }
          ]
        },
        // Campo adicional para matches exactos en tags
        matchesExactos: {
          $size: {
            $setIntersection: [
              "$tags",
              palabrasClave // Busca coincidencias exactas (sin regex)
            ]
          }
        }
      }
    },
    // Primero los que tienen matches exactos en tags, luego por puntaje
    { $sort: { matchesExactos: -1, puntaje: -1 } },
    { $limit: 3 },
    // Proyectamos solo los campos necesarios
    {
      $project: {
        _id: 1,
        titulo: 1,
        contenido: 1,
        tags: 1,
        relevancia: "$puntaje"
      }
    }
  ];

  console.log('🔍 Consulta MongoDB Pipeline:', JSON.stringify(pipeline, null, 2));
  const resultados = await coleccion.aggregate(pipeline).toArray();
  return resultados;
}

module.exports = { buscarInformacionPorPalabrasClave };