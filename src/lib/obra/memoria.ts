// =============================================================================
// La memoria CTE del expediente (feature-16 §E). PURA.
//
// Junta, en el orden del registry, el texto que redacta cada módulo que aplica
// (el de su pestaña Memoria), los «no aplica» con su párrafo y su cita, y las
// externas con su referencia. Lo que no cumple NO se pega como si estuviera
// bien: en la pantalla se enseña con su aviso y en el Word, el PDF y el texto
// copiado sale como pendiente. Lo que la herramienta aún no redacta se lista
// al final.
//
// `bloquesMemoria` la pasa a una lista de bloques (títulos, párrafos y tablas)
// que comparten el Word y el PDF: el documento se decide una vez.
// =============================================================================

import type { MemoriaDoc } from "../cte/presentacion";
import { textoParrafo } from "../cte/memoria";
import type { JustificacionKey, Proyecto } from "../proyecto/tipos";
import { evaluarExpediente, type EvaluacionJustificacion } from "./evaluar";

export const TITULO_MEMORIA = "Memoria CTE de instalaciones";

interface ApartadoBase {
  key: JustificacionKey;
  codigo: string;
  /** «DB-HS 5 · Evacuación de aguas». */
  encabezado: string;
  /** Grupo del registry: «Salubridad (DB-HS)». */
  grupo: string;
}

export type ApartadoMemoria =
  | (ApartadoBase & { tipo: "redactado"; doc: MemoriaDoc; porRevisar: number })
  | (ApartadoBase & { tipo: "no_cumple"; doc: MemoriaDoc; motivos: string[] })
  | (ApartadoBase & { tipo: "no_aplica"; parrafo: string; cita?: string })
  | (ApartadoBase & { tipo: "externo"; destino: string; referencia?: string });

export interface MemoriaCte {
  titulo: string;
  proyecto: string;
  apartados: ApartadoMemoria[];
  /** Lo que la herramienta aún no redacta (o no tiene nada que redactar). */
  pendientes: { codigo: string; label: string }[];
}

function apartadoDe(ev: EvaluacionJustificacion, p: Proyecto): ApartadoMemoria | null {
  const e = ev.entrada;
  const base = { key: ev.key, codigo: e.codigo, grupo: e.grupo };
  switch (ev.estado) {
    case "cumple":
    case "revisar": {
      const doc = ev.calculado!.memoria();
      return { ...base, encabezado: `${doc.norma} · ${doc.titulo}`, tipo: "redactado", doc, porRevisar: ev.avisos.length };
    }
    case "no_cumple": {
      const doc = ev.calculado!.memoria();
      return {
        ...base,
        encabezado: `${doc.norma} · ${doc.titulo}`,
        tipo: "no_cumple",
        doc,
        motivos: ev.incumplimientos.map((i) => i.titulo),
      };
    }
    case "error":
      return {
        ...base,
        encabezado: `${e.db} · ${e.label}`,
        tipo: "no_cumple",
        doc: { titulo: e.label, norma: e.db, parrafos: [], fuente: "" },
        motivos: ev.incumplimientos.map((i) => i.titulo),
      };
    case "no_aplica":
      return {
        ...base,
        encabezado: `${e.db} · ${e.label}`,
        tipo: "no_aplica",
        parrafo: ev.nota ?? `${e.codigo} ${e.label}: no es de aplicación.`,
        ...(ev.cita !== undefined ? { cita: ev.cita } : {}),
      };
    case "externo": {
      const ref = p.justificaciones[ev.key]?.refExterna;
      return {
        ...base,
        encabezado: `${e.db} · ${e.label}`,
        tipo: "externo",
        destino: e.externo?.destino ?? "otra herramienta",
        ...(ref ? { referencia: ref } : {}),
      };
    }
    default:
      return null;
  }
}

/** La memoria del expediente, apartado a apartado. */
export function memoriaCte(p: Proyecto): MemoriaCte {
  const apartados: ApartadoMemoria[] = [];
  const pendientes: MemoriaCte["pendientes"] = [];
  for (const ev of evaluarExpediente(p).justificaciones) {
    const a = apartadoDe(ev, p);
    if (a) apartados.push(a);
    else pendientes.push({ codigo: ev.entrada.codigo, label: ev.entrada.label });
  }
  return { titulo: TITULO_MEMORIA, proyecto: p.nombre, apartados, pendientes };
}

// ── Bloques: lo que comparten el Word, el PDF y el texto copiado ────────────

export type BloqueMemoria =
  | { tipo: "titulo"; nivel: 1 | 2 | 3; texto: string }
  | { tipo: "parrafo"; texto: string }
  /** Línea de fuentes o cita: en pequeño. */
  | { tipo: "nota"; texto: string }
  /** Lo que falta: se resalta para que no pase desapercibido. */
  | { tipo: "pendiente"; texto: string }
  | { tipo: "tabla"; cabecera: string[]; filas: string[][] };

/** El párrafo de una externa: con qué se justifica y su documento. */
function textoExterno(a: Extract<ApartadoMemoria, { tipo: "externo" }>): string {
  return a.referencia
    ? `Se justifica con ${a.destino}. Documento de referencia: ${a.referencia}.`
    : `Se justifica con ${a.destino}. Pendiente de adjuntar el documento.`;
}

/**
 * La memoria como bloques. `fecha` va ya formateada (la capa pura no llama a
 * Date). Los apartados se agrupan por DB con un título de segundo nivel.
 */
export function bloquesMemoria(m: MemoriaCte, fecha: string): BloqueMemoria[] {
  const b: BloqueMemoria[] = [
    { tipo: "titulo", nivel: 1, texto: m.titulo },
    { tipo: "parrafo", texto: `${m.proyecto} · ${fecha}` },
  ];
  let grupo = "";
  for (const a of m.apartados) {
    if (a.grupo !== grupo) {
      grupo = a.grupo;
      b.push({ tipo: "titulo", nivel: 2, texto: grupo });
    }
    b.push({ tipo: "titulo", nivel: 3, texto: a.encabezado });
    switch (a.tipo) {
      case "redactado":
        for (const p of a.doc.parrafos) b.push({ tipo: "parrafo", texto: textoParrafo(p) });
        if (a.doc.tabla) b.push({ tipo: "tabla", cabecera: a.doc.tabla.cabecera, filas: a.doc.tabla.filas });
        if (a.doc.fuente) b.push({ tipo: "nota", texto: a.doc.fuente });
        break;
      case "no_cumple":
        b.push({ tipo: "pendiente", texto: "Pendiente: este apartado aún no cumple y no se incluye hasta que se resuelva." });
        for (const motivo of a.motivos) b.push({ tipo: "parrafo", texto: `– ${motivo}` });
        break;
      case "no_aplica":
        b.push({ tipo: "parrafo", texto: a.parrafo });
        if (a.cita) b.push({ tipo: "nota", texto: a.cita });
        break;
      case "externo":
        b.push({ tipo: "parrafo", texto: textoExterno(a) });
        break;
    }
  }
  if (m.pendientes.length > 0) {
    b.push({ tipo: "titulo", nivel: 2, texto: "Apartados pendientes" });
    b.push({
      tipo: "pendiente",
      texto: `Aún sin redactar: ${m.pendientes.map((x) => `${x.codigo} ${x.label}`).join("; ")}.`,
    });
  }
  return b;
}

/** La memoria entera en texto plano, para «Copiar todo». */
export function textoPlanoMemoriaCte(m: MemoriaCte, fecha: string): string {
  return bloquesMemoria(m, fecha)
    .map((bl) => {
      if (bl.tipo === "tabla") return [bl.cabecera, ...bl.filas].map((f) => f.join("\t")).join("\n");
      return bl.texto;
    })
    .join("\n\n");
}

/** «Viviendas y local · C/ Mayor 12» → «memoria-cte-viviendas-y-local-c-mayor-12.pdf». */
export function nombreArchivoMemoria(proyecto: string, ext: "pdf" | "docx"): string {
  const slug = proyecto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `memoria-cte-${slug || "proyecto"}.${ext}`;
}
