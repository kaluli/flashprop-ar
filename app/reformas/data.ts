// Generado automáticamente por parser-inmobiliario (reformas).
// No editar a mano: volver a exportar con el comando `reformas --app`.

export type ReformaField = { label: string; value: string }
export type ReformaItem = { rubro: string; precio: string }

export type Reforma = {
  num: number
  nombre: string
  fields: ReformaField[]
  descripcion: string
  totales: string[]
  items: ReformaItem[]
  page: number
}

export type ReformaEdition = {
  date: string
  issue: string
  models: Reforma[]
}

export const reformasData: ReformaEdition[] = [
  {
    "date": "2026-09-01",
    "issue": "e1302026090100000000001001",
    "models": [
      {
        "num": 9,
        "nombre": "Galpón",
        "fields": [
          {
            "label": "Costo por m2",
            "value": "$ 1.737.473"
          },
          {
            "label": "Variación mensual",
            "value": "+0,17 %"
          },
          {
            "label": "Superficie cubierta",
            "value": "289,04 m2"
          }
        ],
        "descripcion": "Se consideró un cerramiento perimetral de bloques de hormigón, entrepiso y techo parabólico.",
        "totales": [
          "502199.186"
        ],
        "items": [
          {
            "rubro": "Trabajos prelim",
            "precio": "45.415.701"
          },
          {
            "rubro": "Zócalos y solías",
            "precio": "2.654.299"
          },
          {
            "rubro": "Excavaciones",
            "precio": "37.957.592"
          },
          {
            "rubro": "Carpinteria",
            "precio": "12.881.355"
          },
          {
            "rubro": "Instal. sanitaria",
            "precio": "18.872.453"
          },
          {
            "rubro": "Mampostería",
            "precio": "59.028.136"
          },
          {
            "rubro": "Horm. armado",
            "precio": "47.883.093"
          },
          {
            "rubro": "Inst. de gas",
            "precio": "4.888.835"
          },
          {
            "rubro": "Est. y cub. met.",
            "precio": "44.358.518"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "16.169.305"
          },
          {
            "rubro": "Aislaciones",
            "precio": "10.058.960"
          },
          {
            "rubro": "Pinturas",
            "precio": "30.987.799"
          },
          {
            "rubro": "Revoques",
            "precio": "1.054.635"
          },
          {
            "rubro": "Cristales",
            "precio": "5.154.497"
          },
          {
            "rubro": "Placas de yeso",
            "precio": "11.712.265"
          },
          {
            "rubro": "Varios",
            "precio": "4.108.000"
          },
          {
            "rubro": "Ayuda de gremio",
            "precio": "13.631.754"
          },
          {
            "rubro": "Cielorrasos",
            "precio": "22.398.654"
          },
          {
            "rubro": "Contrapisos",
            "precio": "33.705.149"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "12.463.650"
          },
          {
            "rubro": "Carpetas",
            "precio": "1.584.854"
          },
          {
            "rubro": "Beneficio",
            "precio": "45.247.070"
          },
          {
            "rubro": "Revestimientos",
            "precio": "2.563.038"
          },
          {
            "rubro": "Pisos",
            "precio": "15.066.751"
          },
          {
            "rubro": "Escaleras",
            "precio": "2.352.825"
          }
        ],
        "page": 84
      },
      {
        "num": 10,
        "nombre": "Remodelación de baño y cocina",
        "fields": [
          {
            "label": "Reforma de baño",
            "value": "$ 24.553.191"
          },
          {
            "label": "Reforma de cocina",
            "value": "$25.724.839"
          }
        ],
        "descripcion": "Incluye el cambio de caños y desagües, pisos y artefactos, más inst. eléctrica, del baño y cocina del Modelo 1.",
        "totales": [
          "24.553.191",
          "25.724.839"
        ],
        "items": [
          {
            "rubro": "Trab. prel. y dem.",
            "precio": "6.708.565"
          },
          {
            "rubro": "Trab. prelim y dem.",
            "precio": "8.123.774"
          },
          {
            "rubro": "Albanilería",
            "precio": "2.278.409"
          },
          {
            "rubro": "Albañilería",
            "precio": "2.666.284"
          },
          {
            "rubro": "Yesería",
            "precio": "918.896"
          },
          {
            "rubro": "Marmolerías",
            "precio": "3.381.765"
          },
          {
            "rubro": "Pinturas",
            "precio": "768.417"
          },
          {
            "rubro": "Marmolerias",
            "precio": "575.544"
          },
          {
            "rubro": "Pinturas",
            "precio": "634.723"
          },
          {
            "rubro": "Inst. sanitaria",
            "precio": "2.864.310"
          },
          {
            "rubro": "Inst. sanitaria",
            "precio": "3.525.376"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "1.145.452"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "1.096.303"
          },
          {
            "rubro": "Art. y griferias",
            "precio": "1.491.294"
          },
          {
            "rubro": "Artef. y griferías",
            "precio": "2.386.593"
          },
          {
            "rubro": "Amoblamientos",
            "precio": "4.157.272"
          },
          {
            "rubro": "Amoblamientos",
            "precio": "870.209"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "591.447"
          },
          {
            "rubro": "Vidrios",
            "precio": "428.013"
          },
          {
            "rubro": "Beneficio",
            "precio": "2.337.910"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "1.108.775"
          },
          {
            "rubro": "Beneficio",
            "precio": "2.218.700"
          }
        ],
        "page": 84
      },
      {
        "num": 11,
        "nombre": "Reciclaje casa chorizo",
        "fields": [
          {
            "label": "Costo por m2",
            "value": "$ 2.831.639"
          },
          {
            "label": "Variación mensual",
            "value": "+0,0 %"
          },
          {
            "label": "Superficie cubierta",
            "value": "220 m2"
          }
        ],
        "descripcion": "Se cambió la ubicación del baño y la cocina originales. En una segunda etapa, se sumó una planta.",
        "totales": [
          "622.960.687"
        ],
        "items": [
          {
            "rubro": "Demoliciones",
            "precio": "232.114.389"
          },
          {
            "rubro": "Mesadas y mueb.",
            "precio": "5.065.957"
          },
          {
            "rubro": "Mampostería",
            "precio": "23.014.398"
          },
          {
            "rubro": "Limpieza de obra",
            "precio": "14.973.660"
          },
          {
            "rubro": "Carpinterías",
            "precio": "5.905.871"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "9.418.420"
          },
          {
            "rubro": "Estructuras",
            "precio": "53.336.594"
          },
          {
            "rubro": "Beneficio",
            "precio": "66.633.976"
          },
          {
            "rubro": "Revoques",
            "precio": "42.881.022"
          },
          {
            "rubro": "Carp. y contrap.",
            "precio": "3.627.785"
          },
          {
            "rubro": "Pisos y zócalos",
            "precio": "36.602.252"
          },
          {
            "rubro": "Revestimientos",
            "precio": "6.781.114"
          },
          {
            "rubro": "Cielorrasos",
            "precio": "9.648.124"
          },
          {
            "rubro": "Cubierta",
            "precio": "30.274.931"
          },
          {
            "rubro": "Instal. sanitaria",
            "precio": "25.512.648"
          },
          {
            "rubro": "Inst. de gas",
            "precio": "3.144.428"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "26.975.650"
          },
          {
            "rubro": "Pinturas",
            "precio": "27.049.468"
          }
        ],
        "page": 84
      },
      {
        "num": 12,
        "nombre": "Reforma de oficina",
        "fields": [
          {
            "label": "Costo por m2",
            "value": "$ 565.736"
          },
          {
            "label": "Variación mensual",
            "value": "+4,22%"
          },
          {
            "label": "Superficie cubierta",
            "value": "389,50 m2"
          }
        ],
        "descripcion": "Reciclaje de un semipiso de un edificio en torre de planta libre: recepción, áreas gerencial y operativa.",
        "totales": [
          "220.354.318"
        ],
        "items": [
          {
            "rubro": "Demoliciones",
            "precio": "8.175.667"
          },
          {
            "rubro": "Iluminación",
            "precio": "1.575.901"
          },
          {
            "rubro": "Tabiques acústicos",
            "precio": "31.987.348"
          },
          {
            "rubro": "Limpieza",
            "precio": "3.615.040"
          },
          {
            "rubro": "Tabiques de yeso",
            "precio": "442.226"
          },
          {
            "rubro": "Ayuda de gremios",
            "precio": "8.045.107"
          },
          {
            "rubro": "Cielorraso",
            "precio": "13.477.945"
          },
          {
            "rubro": "Beneficio",
            "precio": "36.725.720"
          },
          {
            "rubro": "Alfombra",
            "precio": "28.763.685"
          },
          {
            "rubro": "Piso flotante",
            "precio": "3.029.231"
          },
          {
            "rubro": "Piso cerámico",
            "precio": "2.023.255"
          },
          {
            "rubro": "Mármoles",
            "precio": "3.140.535"
          },
          {
            "rubro": "Revestimientos",
            "precio": "738.233"
          },
          {
            "rubro": "Carpinterías",
            "precio": "9.808.804"
          },
          {
            "rubro": "Pintura paredes",
            "precio": "15.765.487"
          },
          {
            "rubro": "Pintura cielorrasos",
            "precio": "4.204.787"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "48.835.346"
          }
        ],
        "page": 85
      }
    ]
  },
  {
    "date": "2026-08-04",
    "issue": "e1302026080400000000001001",
    "models": [
      {
        "num": 9,
        "nombre": "Galpón",
        "fields": [
          {
            "label": "Costo por m2",
            "value": "$ 1.734.501"
          },
          {
            "label": "Variación mensual",
            "value": "+1,0 %"
          },
          {
            "label": "Superficie cubierta",
            "value": "289,04 m2"
          }
        ],
        "descripcion": "Se consideró un cerramiento perimetral de bloques de hormigón, entrepiso y techo parabólico.",
        "totales": [
          "501.340.312"
        ],
        "items": [
          {
            "rubro": "Trabajos prelim",
            "precio": "45.415.701"
          },
          {
            "rubro": "Zócalos y solías",
            "precio": "2.654.299"
          },
          {
            "rubro": "Excavaciones",
            "precio": "37.769.919"
          },
          {
            "rubro": "Carpinteria",
            "precio": "12.881.355"
          },
          {
            "rubro": "Instal. sanitaria",
            "precio": "18.872.453"
          },
          {
            "rubro": "Mampostería",
            "precio": "59.028.136"
          },
          {
            "rubro": "Horm. armado",
            "precio": "47.879.023"
          },
          {
            "rubro": "Inst. de gas",
            "precio": "4.860.666"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "16.169.305"
          },
          {
            "rubro": "Est. y cub. met.",
            "precio": "44.358.518"
          },
          {
            "rubro": "Aislaciones",
            "precio": "9.422.957"
          },
          {
            "rubro": "Pinturas",
            "precio": "30.987.799"
          },
          {
            "rubro": "Revoques",
            "precio": "1.054.635"
          },
          {
            "rubro": "Cristales",
            "precio": "5.154.497"
          },
          {
            "rubro": "Placas de yeso",
            "precio": "11.712.265"
          },
          {
            "rubro": "Varios",
            "precio": "4.108.000"
          },
          {
            "rubro": "Ayuda de gremio",
            "precio": "13.628.794"
          },
          {
            "rubro": "Cielorrasos",
            "precio": "22.398.654"
          },
          {
            "rubro": "Contrapisos",
            "precio": "33.705.149"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "12.463.650"
          },
          {
            "rubro": "Carpetas",
            "precio": "1.584.854"
          },
          {
            "rubro": "Beneficio",
            "precio": "45.247.070"
          },
          {
            "rubro": "Revestimientos",
            "precio": "2.563.038"
          },
          {
            "rubro": "Pisos",
            "precio": "15.066.751"
          },
          {
            "rubro": "Escaleras",
            "precio": "2.352.825"
          }
        ],
        "page": 79
      },
      {
        "num": 10,
        "nombre": "Remodelación de baño y cocina",
        "fields": [
          {
            "label": "Reforma de baño",
            "value": "$24.699.756"
          },
          {
            "label": "Reforma de cocina",
            "value": "$ 25.717.026"
          }
        ],
        "descripcion": "Incluye el cambio de caños y desagües, pisos y artefactos, más inst. eléctrica, del baño y cocina del Modelo 1.",
        "totales": [
          "24.699.756",
          "25.717.026"
        ],
        "items": [
          {
            "rubro": "Trab. prel. y dem.",
            "precio": "6.708.565"
          },
          {
            "rubro": "Trab. prelim y dem.",
            "precio": "8.123.774"
          },
          {
            "rubro": "Albanilería",
            "precio": "2.278.409"
          },
          {
            "rubro": "Albañilería",
            "precio": "2.875.596"
          },
          {
            "rubro": "Marmolerías",
            "precio": "3.381.765"
          },
          {
            "rubro": "Yesería",
            "precio": "902.948"
          },
          {
            "rubro": "Marmolerías",
            "precio": "575.544"
          },
          {
            "rubro": "Pinturas",
            "precio": "766.724"
          },
          {
            "rubro": "Pinturas",
            "precio": "634.723"
          },
          {
            "rubro": "Inst. sanitaria",
            "precio": "2.858.189"
          },
          {
            "rubro": "Inst. sanitaria",
            "precio": "3.488.069"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "1.145.452"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "1.096.303"
          },
          {
            "rubro": "Art. y griferías",
            "precio": "1.491.294"
          },
          {
            "rubro": "Amoblamientos",
            "precio": "4.157.272"
          },
          {
            "rubro": "Artef. y griferías",
            "precio": "2.386.593"
          },
          {
            "rubro": "Amoblamientos",
            "precio": "867.328"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "591.447"
          },
          {
            "rubro": "Vidrios",
            "precio": "421.404"
          },
          {
            "rubro": "Beneficio",
            "precio": "2.337.910"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "1.108.775"
          },
          {
            "rubro": "Beneficio",
            "precio": "2.218.700"
          }
        ],
        "page": 79
      },
      {
        "num": 11,
        "nombre": "Reciclaje casa chorizo",
        "fields": [
          {
            "label": "Costo por m2",
            "value": "$ 2.831.639"
          },
          {
            "label": "Variación mensual",
            "value": "+95,9 %"
          },
          {
            "label": "Superficie cubierta",
            "value": "220 m2"
          }
        ],
        "descripcion": "Se cambió la ubicación del baño y la cocina originales. En una segunda etapa, se sumó una planta.",
        "totales": [
          "622.960.687"
        ],
        "items": [
          {
            "rubro": "Demoliciones",
            "precio": "232.114.389"
          },
          {
            "rubro": "Mesadas y mueb.",
            "precio": "5.065.957"
          },
          {
            "rubro": "Mampostería",
            "precio": "23.014.398"
          },
          {
            "rubro": "Limpieza de obra",
            "precio": "14.973.660"
          },
          {
            "rubro": "Carpinterías",
            "precio": "5.905.871"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "9.418.420"
          },
          {
            "rubro": "Estructuras",
            "precio": "53.336.594"
          },
          {
            "rubro": "Beneficio",
            "precio": "66.633.976"
          },
          {
            "rubro": "Revoques",
            "precio": "42.881.022"
          },
          {
            "rubro": "Carp. y contrap.",
            "precio": "3.627.785"
          },
          {
            "rubro": "Pisos y zócalos",
            "precio": "36.602.252"
          },
          {
            "rubro": "Revestimientos",
            "precio": "6.781.114"
          },
          {
            "rubro": "Cielorrasos",
            "precio": "9.648.124"
          },
          {
            "rubro": "Cubierta",
            "precio": "30.274.931"
          },
          {
            "rubro": "Instal. sanitaria",
            "precio": "25.512.648"
          },
          {
            "rubro": "Inst. de gas",
            "precio": "3.144.428"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "26.975.650"
          },
          {
            "rubro": "Pinturas",
            "precio": "27.049.468"
          }
        ],
        "page": 79
      },
      {
        "num": 12,
        "nombre": "Reforma de oficina",
        "fields": [
          {
            "label": "Costo por m2",
            "value": "$ 542.825"
          },
          {
            "label": "Variación mensual",
            "value": "+0,85 %"
          },
          {
            "label": "Superficie cubierta",
            "value": "389,50 m2"
          }
        ],
        "descripcion": "Reciclaje de un semipiso de un edificio en torre de planta libre: recepción, áreas gerencial y operativa.",
        "totales": [
          "211.430.386"
        ],
        "items": [
          {
            "rubro": "Demoliciones",
            "precio": "8.175.667"
          },
          {
            "rubro": "Iluminación",
            "precio": "1.549.981"
          },
          {
            "rubro": "Tabiques acústicos",
            "precio": "32.837.857"
          },
          {
            "rubro": "Limpieza",
            "precio": "3.615.040"
          },
          {
            "rubro": "Tabiques de yeso",
            "precio": "454.124"
          },
          {
            "rubro": "Ayuda de gremios",
            "precio": "8.045.107"
          },
          {
            "rubro": "Cielorraso",
            "precio": "13.406.144"
          },
          {
            "rubro": "Beneficio",
            "precio": "35.238.400"
          },
          {
            "rubro": "Alfombra",
            "precio": "21.577.743"
          },
          {
            "rubro": "Piso flotante",
            "precio": "3.029.231"
          },
          {
            "rubro": "Piso cerámico",
            "precio": "2.222.649"
          },
          {
            "rubro": "Mármoles",
            "precio": "2.191.809"
          },
          {
            "rubro": "Revestimientos",
            "precio": "895.029"
          },
          {
            "rubro": "Carpinterías",
            "precio": "9.808.804"
          },
          {
            "rubro": "Pintura paredes",
            "precio": "15.446.885"
          },
          {
            "rubro": "Pintura cielorrasos",
            "precio": "4.129.198"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "48.806.717"
          }
        ],
        "page": 80
      }
    ]
  },
  {
    "date": "2026-07-07",
    "issue": "e1302026070700000000001001",
    "models": [
      {
        "num": 9,
        "nombre": "Galpón",
        "fields": [
          {
            "label": "Costo por m2",
            "value": "$ 1.717.368"
          },
          {
            "label": "Variación mensual",
            "value": "+5,29%"
          },
          {
            "label": "Superficie cubierta",
            "value": "289,04 m2"
          }
        ],
        "descripcion": "Se consideró un cerramiento perimetral de bloques de hormigón, entrepiso y techo parabólico.",
        "totales": [
          "496.388.112"
        ],
        "items": [
          {
            "rubro": "Trabajos prelim",
            "precio": "46.018.393"
          },
          {
            "rubro": "Zócalos y solías",
            "precio": "2.653.447"
          },
          {
            "rubro": "Excavaciones",
            "precio": "37.769.919"
          },
          {
            "rubro": "Carpintería",
            "precio": "12.568.046"
          },
          {
            "rubro": "Instal. sanitaria",
            "precio": "18.628.276"
          },
          {
            "rubro": "Mampostería",
            "precio": "59.028.136"
          },
          {
            "rubro": "Horm. armado",
            "precio": "47.769.902"
          },
          {
            "rubro": "Inst. de gas",
            "precio": "4.782.482"
          },
          {
            "rubro": "Est. y cub. met.",
            "precio": "43.828.623"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "16.169.305"
          },
          {
            "rubro": "Aislaciones",
            "precio": "9.422.957"
          },
          {
            "rubro": "Pinturas",
            "precio": "30.987.799"
          },
          {
            "rubro": "Revoques",
            "precio": "1.054.635"
          },
          {
            "rubro": "Cristales",
            "precio": "5.047.087"
          },
          {
            "rubro": "Placas de yeso",
            "precio": "10.922.913"
          },
          {
            "rubro": "Varios",
            "precio": "4.108.000"
          },
          {
            "rubro": "Ayuda de gremio",
            "precio": "13.628.794"
          },
          {
            "rubro": "Cielorrasos",
            "precio": "21.707.019"
          },
          {
            "rubro": "Contrapisos",
            "precio": "33.564.434"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "10.963.650"
          },
          {
            "rubro": "Carpetas",
            "precio": "1.584.854"
          },
          {
            "rubro": "Beneficio",
            "precio": "45.126.190"
          },
          {
            "rubro": "Revestimientos",
            "precio": "2.086.409"
          },
          {
            "rubro": "Pisos",
            "precio": "14.621.135"
          },
          {
            "rubro": "Escaleras",
            "precio": "2.345.707"
          }
        ],
        "page": 82
      },
      {
        "num": 10,
        "nombre": "Remodelación de baño y cocina",
        "fields": [
          {
            "label": "Reforma de baño",
            "value": "$ 23.272.351"
          },
          {
            "label": "Reforma de cocina",
            "value": "$ 25.132.779"
          }
        ],
        "descripcion": "Incluye el cambio de caños y desagües, pisos y artefactos, más inst. eléctrica, del baño y cocina del Modelo 1. C",
        "totales": [
          "23.272.351",
          "25.132.779"
        ],
        "items": [
          {
            "rubro": "Trab. prel. y dem.",
            "precio": "6.708.565"
          },
          {
            "rubro": "Trab. prelim y dem.",
            "precio": "6.990.440"
          },
          {
            "rubro": "Albanilería",
            "precio": "2.129.680"
          },
          {
            "rubro": "L.bbu.200",
            "precio": "894.911"
          },
          {
            "rubro": "Yesería",
            "precio": "894.911"
          },
          {
            "rubro": "Marmolerías",
            "precio": "3.381.363"
          },
          {
            "rubro": "Marmolerías",
            "precio": "575.269"
          },
          {
            "rubro": "Pinturas",
            "precio": "765.013"
          },
          {
            "rubro": "Pinturas",
            "precio": "636.817"
          },
          {
            "rubro": "Inst. sanitaria",
            "precio": "2.786.939"
          },
          {
            "rubro": "Inst. sanitaria",
            "precio": "3.459.207"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "1.200.282"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "1.096.303"
          },
          {
            "rubro": "Art. y griferías",
            "precio": "1.263.461"
          },
          {
            "rubro": "Artef. y griferías",
            "precio": "2.386.593"
          },
          {
            "rubro": "Amoblamientos",
            "precio": "4.021.230"
          },
          {
            "rubro": "Amoblamientos",
            "precio": "846.290"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "591.447"
          },
          {
            "rubro": "Vidrios",
            "precio": "408.767"
          },
          {
            "rubro": "Beneficio",
            "precio": "2.284.800"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "1.108.775"
          },
          {
            "rubro": "Beneficio",
            "precio": "2.218.700"
          }
        ],
        "page": 82
      },
      {
        "num": 11,
        "nombre": "Reciclaje casa chorizo",
        "fields": [
          {
            "label": "Costo por m2",
            "value": "$ 2.952.738"
          },
          {
            "label": "Variación mensual",
            "value": "+3,75%"
          },
          {
            "label": "Superficie cubierta",
            "value": "220 m2"
          }
        ],
        "descripcion": "Se cambió la ubicación del baño y la cocina originales. En una segunda etapa, se sumó una planta.",
        "totales": [
          "649.602.458"
        ],
        "items": [
          {
            "rubro": "Demoliciones",
            "precio": "232.114.389"
          },
          {
            "rubro": "Mesadas y mueb.",
            "precio": "4.924.089"
          },
          {
            "rubro": "Mampostería",
            "precio": "23.014.398"
          },
          {
            "rubro": "Limpieza de obra",
            "precio": "14.973.660"
          },
          {
            "rubro": "Carpinterías",
            "precio": "5.848.808"
          },
          {
            "rubro": "Gastos de obra",
            "precio": "9.418.420"
          },
          {
            "rubro": "Estructuras",
            "precio": "51.978.385"
          },
          {
            "rubro": "Beneficio",
            "precio": "66.633.976"
          },
          {
            "rubro": "Revoques",
            "precio": "42.881.022"
          },
          {
            "rubro": "Carp. y contrap.",
            "precio": "3.627.785"
          },
          {
            "rubro": "Pisos y zócalos",
            "precio": "64.835.070"
          },
          {
            "rubro": "Revestimientos",
            "precio": "6.781.114"
          },
          {
            "rubro": "Cielorrasos",
            "precio": "9.648.124"
          },
          {
            "rubro": "Cubierta",
            "precio": "30.274.931"
          },
          {
            "rubro": "Instal. sanitaria",
            "precio": "25.512.648"
          },
          {
            "rubro": "Inst. de gas",
            "precio": "3.110.522"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "26.975.650"
          },
          {
            "rubro": "Pinturas",
            "precio": "27.049.468"
          }
        ],
        "page": 82
      },
      {
        "num": 12,
        "nombre": "Reforma de oficina",
        "fields": [
          {
            "label": "Costo por m2",
            "value": "$ 538.250"
          },
          {
            "label": "Variación mensual",
            "value": "+4,94%"
          },
          {
            "label": "Superficie cubierta",
            "value": "389,50 m2"
          }
        ],
        "descripcion": "Reciclaje de un semipiso de un edificio en torre de planta libre: recepción, áreas gerencial y operativa.",
        "totales": [
          "209.648.241"
        ],
        "items": [
          {
            "rubro": "Iluminación",
            "precio": "1.472.223"
          },
          {
            "rubro": "Demoliciones",
            "precio": "8.175.667"
          },
          {
            "rubro": "Tabiques acústicos",
            "precio": "32.390.069"
          },
          {
            "rubro": "Limpieza",
            "precio": "3.615.040"
          },
          {
            "rubro": "Tabiques de yeso",
            "precio": "412.205"
          },
          {
            "rubro": "Ayuda de gremios",
            "precio": "8.045.107"
          },
          {
            "rubro": "Cielorraso",
            "precio": "12.654.049"
          },
          {
            "rubro": "Beneficio",
            "precio": "34.941.380"
          },
          {
            "rubro": "Alfombra",
            "precio": "21.650.293"
          },
          {
            "rubro": "Piso flotante",
            "precio": "1.575.310"
          },
          {
            "rubro": "Piso cerámico",
            "precio": "2.003.958"
          },
          {
            "rubro": "Mármoles",
            "precio": "1.033.032"
          },
          {
            "rubro": "Revestimientos",
            "precio": "728.587"
          },
          {
            "rubro": "Carpinterías",
            "precio": "9.054.942"
          },
          {
            "rubro": "Pintura paredes",
            "precio": "15.867.274"
          },
          {
            "rubro": "Pintura cielorrasos",
            "precio": "4.226.805"
          },
          {
            "rubro": "Inst. eléctrica",
            "precio": "51.802.300"
          }
        ],
        "page": 83
      }
    ]
  }
]
