// =============================================================================
// Los módulos publicados, vistos desde La obra (feature-16 §A). PURO.
//
// Un adaptador por módulo: con qué valores por defecto arranca, cómo se
// justifica con El edificio y los datos de la obra (exactamente como lo llama
// su pantalla) y qué textos suyos necesita La obra: la frase, «Qué entra», los
// avisos, lo que no cumple y la memoria. La obra no redacta nada de los
// módulos: todo sale de sus capas de texto.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import { zonaClimaticaDe } from "../../data/zonasClimaticasHE";
import { estadosElementos } from "../cte/estados";
import type { DetalleElemento, MemoriaDoc } from "../cte/presentacion";
import type { Aviso, ElementoResultado } from "../cte/resultado";
import type { JustificacionKey, Proyecto, Veredicto } from "../proyecto/tipos";
import { hs1EstadoDefaults, type Hs1Estado } from "../../modules/hs1/estado";
import { justificarHs1, obraHs1De, type JustificacionHs1 } from "../../modules/hs1/justificacion";
import { filasQueEntraHs1 } from "../../modules/hs1/entra";
import { memoriaHs1 } from "../../modules/hs1/memoria";
import * as textosHs1 from "../../modules/hs1/textos";
import { hs3EstadoDefaults, type Hs3Estado } from "../../modules/hs3/estado";
import { justificarHs3, type JustificacionHs3 } from "../../modules/hs3/justificacion";
import { filasQueEntraHs3 } from "../../modules/hs3/entra";
import { memoriaHs3 } from "../../modules/hs3/memoria";
import * as textosHs3 from "../../modules/hs3/textos";
import { hs4EstadoDefaults, type Hs4Estado } from "../../modules/hs4/estado";
import { justificarHs4, type JustificacionHs4 } from "../../modules/hs4/justificacion";
import { filasQueEntraHs4 } from "../../modules/hs4/entra";
import { memoriaHs4 } from "../../modules/hs4/memoria";
import * as textosHs4 from "../../modules/hs4/textos";
import { hs5EstadoDefaults, type Hs5Estado } from "../../modules/hs5/estado";
import { justificarHs5, type JustificacionHs5 } from "../../modules/hs5/justificacion";
import { filasQueEntra as filasQueEntraHs5 } from "../../modules/hs5/entra";
import { memoriaHs5 } from "../../modules/hs5/memoria";
import * as textosHs5 from "../../modules/hs5/textos";
import { hs6EstadoDefaults, type Hs6Estado } from "../../modules/hs6/estado";
import { justificarHs6, type JustificacionHs6 } from "../../modules/hs6/justificacion";
import { filasQueEntraHs6 } from "../../modules/hs6/entra";
import { memoriaHs6 } from "../../modules/hs6/memoria";
import * as textosHs6 from "../../modules/hs6/textos";
import { he1EstadoDefaults, type He1Estado } from "../../modules/he1/estado";
import { justificarHe1, type JustificacionHe1 } from "../../modules/he1/justificacion";
import { filasQueEntraHe1 } from "../../modules/he1/entra";
import { memoriaHe1 } from "../../modules/he1/memoria";
import * as textosHe1 from "../../modules/he1/textos";
import type { DefinicionSi } from "../../modules/si/definicion";
import type { JustificacionSiBase } from "../../modules/si/tipos";
import { si1 } from "../../modules/si1/definicion";
import { si4 } from "../../modules/si4/definicion";
import { si2 } from "../../modules/si2/definicion";
import { si3 } from "../../modules/si3/definicion";
import { si5 } from "../../modules/si5/definicion";
import { si6 } from "../../modules/si6/definicion";
import { sua6 } from "../../modules/sua6/definicion";
import { sua7 } from "../../modules/sua7/definicion";
import { sua9 } from "../../modules/sua9/definicion";
import { sua1 } from "../../modules/sua1/definicion";
import { sua2 } from "../../modules/sua2/definicion";
import { sua3 } from "../../modules/sua3/definicion";
import { sua4 } from "../../modules/sua4/definicion";
import { sua8 } from "../../modules/sua8/definicion";

/** Un título y su explicación: un aviso o algo que no cumple, ya redactado. */
export interface TextoObra {
  titulo: string;
  detalle: string;
}

/** Lo que La obra lee de un módulo ya calculado. */
export interface ModuloCalculado {
  /** Veredicto del motor (`neutral` si no hay nada que justificar). */
  veredicto: Veredicto;
  elementos: readonly ElementoResultado[];
  avisos: readonly Aviso[];
  frase: string;
  /** Las partes del edificio que entran y cómo las trata (las filas de «Qué entra»). */
  queEntra: FilaQueEntra[];
  /** Las piezas de la fila de La obra, si el módulo las da (si no, salen de «Qué entra»). */
  piezas?: { texto: string; acento: boolean }[];
  textoAviso(a: Aviso): TextoObra;
  /**
   * Lo que no cumple de un elemento, redactado; `null` si el módulo no lo
   * enseña como incumplimiento (HS4 y HE1 solo enseñan los que tienen arreglo).
   */
  textoIncumplimiento(el: ElementoResultado): TextoObra | null;
  /** La memoria redactada (la de la pestaña Memoria del módulo). Se calcula al pedirla. */
  memoria(): MemoriaDoc;
}

export interface ModuloObra {
  key: JustificacionKey;
  defaults: Record<string, unknown>;
  /** Justifica con las entradas efectivas, El edificio y los datos de la obra. */
  calcular(estado: Record<string, unknown>, proyecto: Proyecto, revisados: readonly string[]): ModuloCalculado;
}

/** Lo que no cumple, con la franja del elemento, para los módulos sin texto propio. */
function incumplimientoDeFranja(f: DetalleElemento): TextoObra {
  const valor = f.unidad ? `${f.valor} ${f.unidad}` : f.valor;
  return { titulo: `${f.titulo}: ${valor} no cumple.`, detalle: f.manda };
}

function estadosDe(j: { elementos: readonly ElementoResultado[]; avisos: readonly Aviso[] }, revisados: readonly string[]) {
  return estadosElementos(j.elementos, j.avisos, revisados);
}

const hs1: ModuloObra = {
  key: "hs1",
  defaults: hs1EstadoDefaults as unknown as Record<string, unknown>,
  calcular(estado, p, revisados) {
    const j: JustificacionHs1 = justificarHs1(estado as unknown as Hs1Estado, p.edificio, obraHs1De(p.datosGenerales));
    return {
      veredicto: j.veredicto,
      elementos: j.elementos,
      avisos: j.avisos,
      frase: textosHs1.fraseHs1(j),
      queEntra: filasQueEntraHs1(j, estadosDe(j, revisados)),
      textoAviso: (a) => textosHs1.textoAviso(a),
      textoIncumplimiento: (el) => {
        const e = j.elementos.find((x) => x.id === el.id);
        return e ? textosHs1.textoIncumplimiento(e) : null;
      },
      memoria: () => memoriaHs1(j),
    };
  },
};

const hs3: ModuloObra = {
  key: "hs3",
  defaults: hs3EstadoDefaults as unknown as Record<string, unknown>,
  calcular(estado, p, revisados) {
    const j: JustificacionHs3 = justificarHs3(estado as unknown as Hs3Estado, p.edificio);
    return {
      veredicto: j.veredicto,
      elementos: j.elementos,
      avisos: j.avisos,
      frase: textosHs3.fraseHs3(j),
      queEntra: filasQueEntraHs3(j, p.edificio, estadosDe(j, revisados)),
      textoAviso: (a) => textosHs3.textoAviso(a),
      textoIncumplimiento: (el) => {
        const e = j.elementos.find((x) => x.id === el.id);
        return e ? incumplimientoDeFranja(textosHs3.franjaDe(e, j, "ko")) : null;
      },
      memoria: () => memoriaHs3(j),
    };
  },
};

const hs4: ModuloObra = {
  key: "hs4",
  defaults: hs4EstadoDefaults as unknown as Record<string, unknown>,
  calcular(estado, p, revisados) {
    const obra = { presionAcometida_kPa: p.datosGenerales.presionAcometida_kPa };
    const j: JustificacionHs4 = justificarHs4(estado as unknown as Hs4Estado, p.edificio, obra);
    return {
      veredicto: j.veredicto,
      elementos: j.elementos,
      avisos: j.avisos,
      frase: textosHs4.fraseHs4(j),
      queEntra: filasQueEntraHs4(j, estadosDe(j, revisados)),
      textoAviso: (a) => textosHs4.textoAviso(a, j),
      textoIncumplimiento: (el) => {
        const e = j.elementos.find((x) => x.id === el.id);
        if (!e) return null;
        // Los mismos que enseña la pantalla de HS4.
        const t = textosHs4.textoIncumplimiento(e, j);
        return t ? { titulo: t.titulo, detalle: t.detalle } : null;
      },
      memoria: () => memoriaHs4(j),
    };
  },
};

const hs5: ModuloObra = {
  key: "hs5",
  defaults: hs5EstadoDefaults as unknown as Record<string, unknown>,
  calcular(estado, p, revisados) {
    const dg = p.datosGenerales;
    const obra = { pluviometria: dg.pluviometria, cotaAlcantarillado_m: dg.cotaAlcantarillado_m };
    const j: JustificacionHs5 = justificarHs5(estado as unknown as Hs5Estado, p.edificio, obra);
    return {
      veredicto: j.veredicto,
      elementos: j.elementos,
      avisos: j.avisos,
      frase: textosHs5.fraseHs5(j),
      queEntra: filasQueEntraHs5(j, p.edificio, estadosDe(j, revisados)).filas,
      textoAviso: (a) => textosHs5.textoAviso(a),
      textoIncumplimiento: (el) => {
        const e = j.elementos.find((x) => x.id === el.id);
        return e ? incumplimientoDeFranja(textosHs5.franjaDe(e, j, "ko")) : null;
      },
      memoria: () => memoriaHs5(j),
    };
  },
};

const hs6: ModuloObra = {
  key: "hs6",
  defaults: hs6EstadoDefaults as unknown as Record<string, unknown>,
  calcular(estado, p, revisados) {
    const j: JustificacionHs6 = justificarHs6(estado as unknown as Hs6Estado, p.edificio);
    return {
      veredicto: j.veredicto,
      elementos: j.elementos,
      avisos: j.avisos,
      frase: textosHs6.fraseHs6(j),
      queEntra: filasQueEntraHs6(j, estadosDe(j, revisados)),
      textoAviso: (a) => textosHs6.textoAviso(a),
      textoIncumplimiento: (el) => {
        const e = j.elementos.find((x) => x.id === el.id);
        return e ? incumplimientoDeFranja(textosHs6.franjaDe(e, j, "ko")) : null;
      },
      memoria: () => memoriaHs6(j),
    };
  },
};

const he1: ModuloObra = {
  key: "he1",
  defaults: he1EstadoDefaults as unknown as Record<string, unknown>,
  calcular(estado, p, revisados) {
    const dg = p.datosGenerales;
    const obra = { provincia: dg.provincia, altitud_m: dg.altitud_m, municipio: dg.municipio };
    const j: JustificacionHe1 = justificarHe1(estado as unknown as He1Estado, p.edificio, obra);
    const zonaCompleta = zonaClimaticaDe(dg.provincia, dg.altitud_m)?.zona ?? null;
    return {
      veredicto: j.veredicto,
      elementos: j.elementos,
      avisos: j.avisos,
      frase: textosHe1.fraseHe1(j),
      queEntra: filasQueEntraHe1(j, zonaCompleta, estadosDe(j, revisados)),
      textoAviso: (a) => textosHe1.textoAviso(a, j),
      textoIncumplimiento: (el) => {
        const e = j.elementos.find((x) => x.id === el.id);
        if (!e) return null;
        // Los mismos que enseña la pantalla de HE1.
        const t = textosHe1.textoIncumplimiento(e, j);
        return t ? { titulo: t.titulo, detalle: t.detalle } : null;
      },
      memoria: () => memoriaHe1(j),
    };
  },
};

/**
 * Las secciones del DB-SI (feature-19) comparten la forma de su definición: un
 * adaptador común para las seis.
 */
function moduloSi<E extends Record<string, unknown>, J extends JustificacionSiBase>(def: DefinicionSi<E, J>): ModuloObra {
  return {
    key: def.key,
    defaults: def.defaults,
    calcular(estado, p, revisados) {
      const j = def.justificar(estado as E, p);
      return {
        veredicto: j.veredicto,
        elementos: j.elementos,
        avisos: j.avisos,
        frase: def.frase(j),
        queEntra: def.queEntra(j, estadosDe(j, revisados)),
        piezas: def.piezas(j),
        textoAviso: (a) => def.textoAviso(a),
        textoIncumplimiento: (el) => {
          const e = j.elementos.find((x) => x.id === el.id);
          return e ? def.textoIncumplimiento(e) : null;
        },
        memoria: () => def.memoria(j),
      };
    },
  };
}

/** Los módulos publicados, por clave. */
export const MODULOS_OBRA: Partial<Record<JustificacionKey, ModuloObra>> = {
  hs1,
  hs3,
  hs4,
  hs5,
  hs6,
  he1,
  si1: moduloSi(si1),
  si4: moduloSi(si4),
  si2: moduloSi(si2),
  si3: moduloSi(si3),
  si5: moduloSi(si5),
  si6: moduloSi(si6),
  sua6: moduloSi(sua6),
  sua7: moduloSi(sua7),
  sua9: moduloSi(sua9),
  sua1: moduloSi(sua1),
  sua2: moduloSi(sua2),
  sua3: moduloSi(sua3),
  sua4: moduloSi(sua4),
  sua8: moduloSi(sua8),
};
