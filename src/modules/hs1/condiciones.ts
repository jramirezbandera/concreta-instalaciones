// =============================================================================
// DB-HS1 — Qué pide cada condición, en una frase (feature-17). Resumen fiel del
// texto del DB, con sus cifras literales (research/verificacion-hs1.md, bloques
// 3, 4, 5 y 7). Solo datos.
//
// Los códigos son PROPIOS de cada tabla: hay un diccionario por elemento. Las
// condiciones que el DB limita a un material («cuando el muro sea de fábrica»)
// llevan `siAplica`, y la memoria lo dice así.
// =============================================================================

export interface TextoCondicion {
  bloque: string;
  /** Qué es, en dos o tres palabras («Hormigón hidrófugo»). */
  corto: string;
  texto: string;
  /** El DB solo la pide en este caso. */
  siAplica?: string;
}

export const CONDICIONES_MURO: Record<string, TextoCondicion> = {
  C1: { bloque: "Constitución", corto: "Hormigón hidrófugo", siAplica: "si el muro es de hormigón in situ", texto: "Hormigón hidrófugo." },
  C2: { bloque: "Constitución", corto: "Hormigón fluido", siAplica: "si el muro se construye in situ", texto: "Hormigón de consistencia fluida." },
  C3: {
    bloque: "Constitución",
    corto: "Fábrica hidrofugada",
    siAplica: "si el muro es de fábrica",
    texto: "Bloques o ladrillos hidrofugados y mortero hidrófugo.",
  },
  I1: {
    bloque: "Impermeabilización",
    corto: "Lámina o líquido",
    texto:
      "Lámina impermeabilizante o productos líquidos (polímeros acrílicos, caucho acrílico, resinas sintéticas o poliéster); en muros pantalla construidos con excavación, lodos bentoníticos. Por el interior, la lámina es adherida; por el exterior, con capa antipunzonamiento en su cara exterior si es adherida o en las dos si no lo es (la exterior se suprime si hay lámina drenante). Los productos líquidos llevan capa protectora exterior, salvo lámina drenante en contacto directo.",
  },
  I2: {
    bloque: "Impermeabilización",
    corto: "Pintura impermeabilizante",
    texto: "Pintura impermeabilizante o lo establecido en I1; en muros pantalla construidos con excavación, lodos bentoníticos.",
  },
  I3: {
    bloque: "Impermeabilización",
    corto: "Revestimiento interior hidrófugo",
    siAplica: "si el muro es de fábrica",
    texto: "Revestimiento hidrófugo por la cara interior (mortero hidrófugo sin revestir, cartón-yeso sin yeso higroscópico u otro material no higroscópico).",
  },
  D1: {
    bloque: "Drenaje y evacuación",
    corto: "Capa drenante y filtrante",
    texto:
      "Capa drenante y capa filtrante entre el muro, o su impermeabilización, y el terreno: lámina drenante, grava, fábrica de bloques de arcilla porosos u otro material equivalente. Si es una lámina, su remate superior se protege de la lluvia y las escorrentías.",
  },
  D2: {
    bloque: "Drenaje y evacuación",
    corto: "Pozos drenantes",
    texto: "Un pozo drenante junto al muro cada 50 m como máximo, de diámetro interior ≥ 0,7 m, con capa filtrante y dos bombas de achique hacia el saneamiento o a un sistema de reutilización.",
  },
  D3: {
    bloque: "Drenaje y evacuación",
    corto: "Tubo drenante",
    texto:
      "Tubo drenante en el arranque del muro, conectado al saneamiento o a un sistema de reutilización; si la conexión queda por encima de la red de drenaje, al menos una cámara de bombeo con dos bombas de achique.",
  },
  D4: {
    bloque: "Drenaje y evacuación",
    corto: "Canaletas en la cámara",
    texto:
      "Canaletas de recogida del agua en la cámara del muro, conectadas al saneamiento o a un sistema de reutilización; si la conexión queda por encima de las canaletas, al menos una cámara de bombeo con dos bombas de achique.",
  },
  D5: {
    bloque: "Drenaje y evacuación",
    corto: "Evacuación de la lluvia",
    texto: "Red de evacuación del agua de lluvia en las partes de la cubierta y del terreno que puedan afectar al muro, conectada al saneamiento o a un sistema de reutilización.",
  },
  V1: {
    bloque: "Ventilación de la cámara",
    corto: "Cámara ventilada",
    texto:
      "Aberturas de ventilación en el arranque y la coronación de la hoja interior, repartidas al 50 % y al tresbolillo, con 10 < Ss/Ah < 30 y a no más de 5 m entre sí; el local al que abren se ventila con al menos 0,7 l/s por m² útil.",
  },
};

export const CONDICIONES_SUELO: Record<string, TextoCondicion> = {
  C1: {
    bloque: "Constitución",
    corto: "Hormigón hidrófugo",
    siAplica: "si el suelo se construye in situ",
    texto: "Hormigón hidrófugo de elevada compacidad.",
  },
  C2: {
    bloque: "Constitución",
    corto: "Retracción moderada",
    siAplica: "si el suelo se construye in situ",
    texto: "Hormigón de retracción moderada.",
  },
  C3: {
    bloque: "Constitución",
    corto: "Hidrofugación complementaria",
    texto: "Hidrofugación complementaria con un producto líquido colmatador de poros sobre la superficie terminada.",
  },
  I1: {
    bloque: "Impermeabilización",
    corto: "Lámina bajo el suelo",
    texto:
      "Lámina exterior sobre la capa base de regulación del terreno, con capa antipunzonamiento encima si es adherida o en las dos caras si no lo es; si el suelo es una placa, la lámina es doble.",
  },
  I2: {
    bloque: "Impermeabilización",
    corto: "Lámina bajo la cimentación",
    texto:
      "Lámina sobre el hormigón de limpieza en la base de la zapata (muro flexorresistente) o del muro (muro de gravedad), con sus capas antipunzonamiento y el encuentro con la lámina del suelo sellado.",
  },
  D1: {
    bloque: "Drenaje y evacuación",
    corto: "Capa drenante y filtrante",
    texto: "Capa drenante y capa filtrante sobre el terreno bajo el suelo; si la capa drenante es un encachado, lámina de polietileno encima.",
  },
  D2: {
    bloque: "Drenaje y evacuación",
    corto: "Drenes bajo el suelo",
    texto:
      "Tubos drenantes en el terreno bajo el suelo, conectados al saneamiento o a un sistema de reutilización; si la conexión queda por encima de la red de drenaje, al menos una cámara de bombeo con dos bombas de achique.",
  },
  D3: {
    bloque: "Drenaje y evacuación",
    corto: "Drenes en la base del muro",
    texto:
      "Tubos drenantes en la base del muro, con la misma conexión y el mismo bombeo; con muro pantalla, a 1 m por debajo del suelo y repartidos junto al muro.",
  },
  D4: {
    bloque: "Drenaje y evacuación",
    corto: "Pozos bajo el suelo",
    texto:
      "Un pozo drenante por cada 800 m² bajo el suelo, de diámetro interior ≥ 70 cm, con envolvente filtrante, dos bombas de achique, conexión de evacuación y dispositivo automático de achique permanente.",
  },
  P1: {
    bloque: "Tratamiento perimétrico",
    corto: "Acera o zanja perimetral",
    texto: "Tratamiento del terreno en el perímetro del muro para limitar el agua superficial: acera, zanja drenante u otro elemento equivalente.",
  },
  P2: { bloque: "Tratamiento perimétrico", corto: "Borde encastrado", texto: "El borde de la placa o de la solera, encastrado en el muro." },
  S1: {
    bloque: "Sellado de juntas",
    corto: "Láminas muro–suelo",
    texto: "Encuentros de las láminas del muro con las del suelo y con las de la base de las cimentaciones en contacto con el muro, sellados.",
  },
  S2: {
    bloque: "Sellado de juntas",
    corto: "Juntas del suelo",
    texto: "Todas las juntas del suelo, selladas con banda de PVC o con perfiles de caucho expansivo o de bentonita de sodio.",
  },
  S3: {
    bloque: "Sellado de juntas",
    corto: "Encuentro suelo–muro",
    texto: "Encuentros del suelo con el muro, sellados con banda de PVC o con perfiles de caucho expansivo o de bentonita de sodio (ap. 2.2.3.1).",
  },
  V1: {
    bloque: "Ventilación de la cámara",
    corto: "Cámara ventilada",
    texto:
      "El espacio entre el suelo elevado y el terreno, ventilado al exterior con aberturas repartidas al 50 % en dos paredes enfrentadas, al tresbolillo, con 10 < Ss/As < 30 y a no más de 5 m entre sí.",
  },
};

export const CONDICIONES_FACHADA: Record<string, TextoCondicion> = {
  R1: {
    bloque: "Revestimiento exterior",
    corto: "Revestimiento de resistencia media",
    texto:
      "Revestimiento exterior de resistencia media a la filtración: continuo de 10 a 15 mm, adherido, permeable al vapor y adaptado a los movimientos del soporte (sobre aislante exterior, compatible con él y armado con malla de fibra de vidrio o de poliéster), o discontinuo rígido pegado, de piezas de menos de 300 mm de lado, sobre un enfoscado de mortero.",
  },
  R2: {
    bloque: "Revestimiento exterior",
    corto: "Revestimiento de resistencia alta",
    texto: "Revestimiento exterior de resistencia alta: discontinuo rígido fijado mecánicamente, con las características de los de R1 salvo el tamaño de las piezas.",
  },
  R3: {
    bloque: "Revestimiento exterior",
    corto: "Revestimiento de resistencia muy alta",
    texto:
      "Revestimiento exterior de resistencia muy alta: continuo, estanco al agua de filtración y que no se fisura, o discontinuo fijado mecánicamente de escamas, lamas, placas o sistemas con aislamiento térmico.",
  },
  B1: {
    bloque: "Barrera contra el agua",
    corto: "Cámara o aislante interior",
    texto: "Barrera de resistencia media: cámara de aire sin ventilar, o aislante no hidrófilo en la cara interior de la hoja principal.",
  },
  B2: {
    bloque: "Barrera contra el agua",
    corto: "Cámara y aislante, o aislante exterior",
    texto:
      "Barrera de resistencia alta: cámara de aire sin ventilar y aislante no hidrófilo por el interior de la hoja principal, o aislante no hidrófilo por el exterior de la hoja principal.",
  },
  B3: {
    bloque: "Barrera contra el agua",
    corto: "Cámara ventilada",
    texto:
      "Barrera de resistencia muy alta: cámara de aire ventilada de 3 a 10 cm al exterior de un aislante no hidrófilo, con recogida y evacuación del agua y aberturas de al menos 120 cm² por cada 10 m² de paño, o revestimiento continuo intermedio estanco en la cara interior de la hoja principal.",
  },
  C1: {
    bloque: "Hoja principal",
    corto: "Hoja de espesor medio",
    texto: "Hoja principal de espesor medio: ½ pie de ladrillo cerámico, o 12 cm de bloque cerámico, de hormigón o de piedra natural.",
  },
  C2: {
    bloque: "Hoja principal",
    corto: "Hoja de espesor alto",
    texto: "Hoja principal de espesor alto: 1 pie de ladrillo cerámico, o 24 cm de bloque cerámico, de hormigón o de piedra natural.",
  },
  H1: {
    bloque: "Higroscopicidad",
    corto: "Baja higroscopicidad",
    texto: "Hoja principal de baja higroscopicidad: ladrillo de succión ≤ 4,5 kg/m²·min (UNE-EN 772-11) o piedra natural de absorción ≤ 2 % (UNE-EN 13755).",
  },
  J1: {
    bloque: "Juntas",
    corto: "Juntas de resistencia media",
    texto: "Juntas de mortero sin interrupción (en bloque de hormigón, salvo la interrupción en la parte intermedia de la hoja).",
  },
  J2: {
    bloque: "Juntas",
    corto: "Juntas de resistencia alta",
    texto:
      "Juntas de mortero con aditivo hidrófugo, sin interrupción, las horizontales llagueadas o en pico de flauta y, si el sistema lo permite, rejuntadas con un mortero más rico.",
  },
  N1: {
    bloque: "Revestimiento intermedio",
    corto: "Enfoscado interior",
    texto: "Enfoscado de mortero de al menos 10 mm en la cara interior de la hoja principal.",
  },
  N2: {
    bloque: "Revestimiento intermedio",
    corto: "Enfoscado hidrófugo interior",
    texto:
      "Enfoscado con aditivos hidrofugantes de al menos 15 mm en la cara interior de la hoja principal, o material adherido, continuo, sin juntas e impermeable del mismo espesor.",
  },
};

/** Los diccionarios por elemento. */
export const CONDICIONES = { muro: CONDICIONES_MURO, suelo: CONDICIONES_SUELO, fachada: CONDICIONES_FACHADA } as const;
export type ElementoCondiciones = keyof typeof CONDICIONES;

/** «I2+I3+D1+D5»; una casilla en blanco, «sin condiciones». */
export function codigos(c: readonly string[]): string {
  return c.length === 0 ? "sin condiciones" : c.join("+");
}
