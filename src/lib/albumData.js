// ============================================================
// DATOS COMPLETOS DEL ÁLBUM 3 REYES MUNDIAL
// ============================================================

// Grupos del torneo con sus equipos
export const GROUPS = {
  A: ['Estados Unidos', 'México', 'Canadá', '? Clasificado A4'],
  B: ['Argentina', 'Chile', '? Clasificado B3', '? Clasificado B4'],
  C: ['Francia', 'Marruecos', 'Croacia', 'Túnez'],
  D: ['España', 'Portugal', 'Brasil', 'Ecuador'],
  E: ['Alemania', 'Países Bajos', 'Senegal', 'Japón'],
  F: ['Bélgica', 'Dinamarca', 'Uruguay', 'Camerún'],
  G: ['Inglaterra', 'Polonia', 'Irán', 'Gales'],
  H: ['Colombia', 'Perú', 'Venezuela', 'Bolivia'],
  I: ['Italia', 'Australia', 'Costa Rica', 'Jamaica'],
  J: ['Nigeria', 'Ghana', 'Argelia', 'Sudáfrica'],
  K: ['Arabia Saudita', 'Corea del Sur', 'Indonesia', 'Tailandia'],
  L: ['Curazao', 'Uzbekistán', 'Kazajistán', 'Georgia'],
}

// Stickers especiales de repechaje (Serie Letras)
export const REPECHAJE = {
  A: 'Clasificado Repechaje A',
  B: 'Clasificado Repechaje B',
  C: 'Clasificado Repechaje C',
  D: 'Clasificado Repechaje D',
  E: 'Clasificado Repechaje E',
  F: 'Clasificado Repechaje F',
}

// Escudos troquelados Serie T (T-1 a T-48)
export const TROQUELADOS = Array.from({ length: 48 }, (_, i) => ({
  id: `T-${i + 1}`,
  section: 'troquelados',
  label: `Escudo Troquelado T-${i + 1}`,
  special: true,
}))

// ============================================================
// SECCIÓN A: LOS ÚLTIMOS CAMPEONES (números 1-22 aprox)
// ============================================================
export const ULTIMOS_CAMPEONES = [
  { id: 1, section: 'campeones', label: 'Argentina 1978', pais: 'Argentina' },
  { id: 2, section: 'campeones', label: 'Argentina 1978 — Plantel', pais: 'Argentina' },
  { id: 3, section: 'campeones', label: 'Italia 1982', pais: 'Italia' },
  { id: 4, section: 'campeones', label: 'Italia 1982 — Plantel', pais: 'Italia' },
  { id: 5, section: 'campeones', label: 'Argentina 1986', pais: 'Argentina' },
  { id: 6, section: 'campeones', label: 'Argentina 1986 — Plantel', pais: 'Argentina' },
  { id: 7, section: 'campeones', label: 'Alemania 1990', pais: 'Alemania' },
  { id: 8, section: 'campeones', label: 'Alemania 1990 — Plantel', pais: 'Alemania' },
  { id: 9, section: 'campeones', label: 'Brasil 1994', pais: 'Brasil' },
  { id: 10, section: 'campeones', label: 'Brasil 1994 — Plantel', pais: 'Brasil' },
  { id: 11, section: 'campeones', label: 'Francia 1998', pais: 'Francia' },
  { id: 12, section: 'campeones', label: 'Francia 1998 — Plantel', pais: 'Francia' },
  { id: 13, section: 'campeones', label: 'Brasil 2002', pais: 'Brasil' },
  { id: 14, section: 'campeones', label: 'Brasil 2002 — Plantel', pais: 'Brasil' },
  { id: 15, section: 'campeones', label: 'Italia 2006', pais: 'Italia' },
  { id: 16, section: 'campeones', label: 'Italia 2006 — Plantel', pais: 'Italia' },
  { id: 17, section: 'campeones', label: 'España 2010', pais: 'España' },
  { id: 18, section: 'campeones', label: 'España 2010 — Plantel', pais: 'España' },
  { id: 19, section: 'campeones', label: 'Alemania 2014', pais: 'Alemania' },
  { id: 20, section: 'campeones', label: 'Alemania 2014 — Plantel', pais: 'Alemania' },
  { id: 21, section: 'campeones', label: 'Francia 2018', pais: 'Francia' },
  { id: 22, section: 'campeones', label: 'Francia 2018 — Plantel', pais: 'Francia' },
  { id: 23, section: 'campeones', label: 'Argentina 2022', pais: 'Argentina' },
  { id: 24, section: 'campeones', label: 'Argentina 2022 — Plantel', pais: 'Argentina' },
]

// ============================================================
// SECCIÓN B: PRIMERA VEZ EN EL MUNDIAL (debut 48 equipos)
// ============================================================
export const PRIMERA_VEZ = [
  { id: 25, section: 'debutantes', label: 'Curazao — Clasificación', pais: 'Curazao' },
  { id: 26, section: 'debutantes', label: 'Curazao — Celebración', pais: 'Curazao' },
  { id: 27, section: 'debutantes', label: 'Uzbekistán — Clasificación', pais: 'Uzbekistán' },
  { id: 28, section: 'debutantes', label: 'Uzbekistán — Celebración', pais: 'Uzbekistán' },
  { id: 29, section: 'debutantes', label: 'Kazajistán — Clasificación', pais: 'Kazajistán' },
  { id: 30, section: 'debutantes', label: 'Georgia — Clasificación', pais: 'Georgia' },
  { id: 31, section: 'debutantes', label: 'Indonesia — Clasificación', pais: 'Indonesia' },
  { id: 32, section: 'debutantes', label: 'Jamaica — Clasificación', pais: 'Jamaica' },
]

// ============================================================
// SECCIÓN C+D: PLANTILLAS Y MVPs (grupos A-L, stickers 33-584)
// Cada selección tiene: escudo, foto grupal, 16 jugadores, 2 MVP
// Total por equipo: ~20 stickers
// ============================================================

// Función generadora de stickers por equipo
function generarEquipo(pais, grupo, startId, mvps = []) {
  const stickers = []
  let id = startId

  // Escudo del equipo
  stickers.push({
    id: id++, section: 'grupos', tipo: 'escudo',
    pais, grupo, label: `${pais} — Escudo`
  })
  // Foto grupal
  stickers.push({
    id: id++, section: 'grupos', tipo: 'foto_grupal',
    pais, grupo, label: `${pais} — Foto grupal`
  })
  // Cuerpo técnico (2 stickers)
  stickers.push({ id: id++, section: 'grupos', tipo: 'cuerpo_tecnico', pais, grupo, label: `${pais} — Director Técnico` })
  stickers.push({ id: id++, section: 'grupos', tipo: 'cuerpo_tecnico', pais, grupo, label: `${pais} — Cuerpo técnico` })

  // 14 jugadores regulares
  for (let j = 1; j <= 14; j++) {
    stickers.push({
      id: id++, section: 'grupos', tipo: 'jugador',
      pais, grupo, label: `${pais} — Jugador ${j}`,
      posicion: j <= 3 ? 'portero' : j <= 7 ? 'defensa' : j <= 11 ? 'mediocampista' : 'delantero'
    })
  }

  // 2 MVPs (stickers especiales resaltados)
  mvps.forEach((nombre, idx) => {
    stickers.push({
      id: id++, section: 'mvp', tipo: 'mvp',
      pais, grupo, label: `MVP — ${nombre || `${pais} Estrella ${idx + 1}`}`,
      special: true, isMVP: true
    })
  })

  return { stickers, nextId: id }
}

// Generar todos los equipos en orden de grupo
const equiposMVP = {
  // Grupo A
  'Estados Unidos': ['Pulisic', 'Turner'],
  'México': ['Lozano', 'Jiménez'],
  'Canadá': ['Davies', 'David'],

  // Grupo B
  'Argentina': ['Messi', 'Di María'],
  'Chile': ['Alexis', 'Vidal'],

  // Grupo C
  'Francia': ['Mbappé', 'Griezmann'],
  'Marruecos': ['Hakimi', 'En-Nesyri'],
  'Croacia': ['Modrić', 'Gvardiol'],
  'Túnez': ['Khazri', 'Msakni'],

  // Grupo D
  'España': ['Pedri', 'Yamal'],
  'Portugal': ['Ronaldo', 'Félix'],
  'Brasil': ['Vinicius', 'Rodrygo'],
  'Ecuador': ['Valencia', 'Plata'],

  // Grupo E
  'Alemania': ['Musiala', 'Kimmich'],
  'Países Bajos': ['Van Dijk', 'Gakpo'],
  'Senegal': ['Diallo', 'Sarr'],
  'Japón': ['Kubo', 'Mitoma'],

  // Grupo F
  'Bélgica': ['De Bruyne', 'Lukaku'],
  'Dinamarca': ['Eriksen', 'Hojlund'],
  'Uruguay': ['Valverde', 'Núñez'],
  'Camerún': ['Choupo-Moting', 'Aboubakar'],

  // Grupo G
  'Inglaterra': ['Bellingham', 'Saka'],
  'Polonia': ['Lewandowski', 'Szymanski'],
  'Irán': ['Taremi', 'Jahanbakhsh'],
  'Gales': ['Bale', 'Ramsey'],

  // Grupo H
  'Colombia': ['James', 'Díaz'],
  'Perú': ['Guerrero', 'Cueva'],
  'Venezuela': ['Rondón', 'Machís'],
  'Bolivia': ['Moreno', 'Justiniano'],

  // Grupo I
  'Italia': ['Barella', 'Immobile'],
  'Australia': ['Hrustic', 'Leckie'],
  'Costa Rica': ['Navas', 'Campbell'],
  'Jamaica': ['Bailey', 'Antonio'],

  // Grupo J
  'Nigeria': ['Osimhen', 'Lookman'],
  'Ghana': ['Kudus', 'Ayew'],
  'Argelia': ['Mahrez', 'Brahimi'],
  'Sudáfrica': ['Tau', 'Zwane'],

  // Grupo K
  'Arabia Saudita': ['Al-Dawsari', 'Al-Bulayhi'],
  'Corea del Sur': ['Son', 'Lee Kang-in'],
  'Indonesia': ['Elkan', 'Saddil'],
  'Tailandia': ['Theerathon', 'Chanathip'],

  // Grupo L
  'Curazao': ['Clasie', 'Martinus'],
  'Uzbekistán': ['Shomurodov', 'Khamdamov'],
  'Kazajistán': ['Zaynutdinov', 'Bystrov'],
  'Georgia': ['Kvaratskhelia', 'Lochoshvili'],
}

// Generar todos los stickers del 33 al 584
let currentId = 33
const GRUPOS_ORDER = [
  ['Estados Unidos', 'A'], ['México', 'A'], ['Canadá', 'A'],
  ['Argentina', 'B'], ['Chile', 'B'],
  ['Francia', 'C'], ['Marruecos', 'C'], ['Croacia', 'C'], ['Túnez', 'C'],
  ['España', 'D'], ['Portugal', 'D'], ['Brasil', 'D'], ['Ecuador', 'D'],
  ['Alemania', 'E'], ['Países Bajos', 'E'], ['Senegal', 'E'], ['Japón', 'E'],
  ['Bélgica', 'F'], ['Dinamarca', 'F'], ['Uruguay', 'F'], ['Camerún', 'F'],
  ['Inglaterra', 'G'], ['Polonia', 'G'], ['Irán', 'G'], ['Gales', 'G'],
  ['Colombia', 'H'], ['Perú', 'H'], ['Venezuela', 'H'], ['Bolivia', 'H'],
  ['Italia', 'I'], ['Australia', 'I'], ['Costa Rica', 'I'], ['Jamaica', 'I'],
  ['Nigeria', 'J'], ['Ghana', 'J'], ['Argelia', 'J'], ['Sudáfrica', 'J'],
  ['Arabia Saudita', 'K'], ['Corea del Sur', 'K'], ['Indonesia', 'K'], ['Tailandia', 'K'],
  ['Curazao', 'L'], ['Uzbekistán', 'L'], ['Kazajistán', 'L'], ['Georgia', 'L'],
]

export const STICKERS_GRUPOS = []
GRUPOS_ORDER.forEach(([pais, grupo]) => {
  const mvps = equiposMVP[pais] || []
  const result = generarEquipo(pais, grupo, currentId, mvps)
  STICKERS_GRUPOS.push(...result.stickers)
  currentId = result.nextId
})

// ============================================================
// ÍNDICE COMPLETO DEL ÁLBUM
// ============================================================
export const ALL_STICKERS = [
  ...ULTIMOS_CAMPEONES,
  ...PRIMERA_VEZ,
  ...STICKERS_GRUPOS,
  ...TROQUELADOS,
  ...Object.entries(REPECHAJE).map(([key, label]) => ({
    id: key, section: 'repechaje', label, special: true
  })),
]

// Total stickers numéricos + troquelados + repechaje
export const TOTAL_STICKERS = ALL_STICKERS.length

// Helpers para filtrar
export const getStickersBySection = (section) =>
  ALL_STICKERS.filter(s => s.section === section)

export const getStickersByCountry = (pais) =>
  ALL_STICKERS.filter(s => s.pais === pais)

export const getStickersByGroup = (grupo) =>
  ALL_STICKERS.filter(s => s.grupo === grupo)

export const getMVPs = () =>
  ALL_STICKERS.filter(s => s.isMVP)
