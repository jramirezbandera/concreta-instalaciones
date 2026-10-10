// =============================================================================
// FormDatosGeneralesPage — feature-6 T3.6, feature-12: formulario de los DATOS
// DE LA OBRA (emplazamiento, intervención, suministro). Lo que describe el
// edificio (plantas, usos, viviendas…) se edita en El edificio. Dos modos:
//
//   - `crear`:  standalone (SIN ProyectoProvider). Parte de defaults, exige
//               nombre y un caso de partida para el edificio; al enviar crea
//               el proyecto, lo fija como activo y abre El edificio.
//   - `editar`: DENTRO del provider. Inicializa de `proyecto.datosGenerales`,
//               y al guardar llama `actualizarDatosGenerales(dg, nowIso)` y
//               navega a `..` (el dashboard del proyecto).
//
// El panel lateral de DERIVADOS recalcula en vivo `derivarContexto` al cambiar
// provincia/altitud, mostrando cada valor con su PROCEDENCIA (la trazabilidad
// empieza aquí, no en la ficha). Validación inline en español con resumen de
// errores; el submit se deshabilita mientras haya alguno.
//
// Reutiliza el lenguaje de formulario del repo (CollapsibleSection + Field /
// NumberInput / SelectInput de components/ui) — no inventa inputs propios.
// `Date` SOLO se usa en el handler de submit para inyectar `nowIso` (contrato
// del motor/persistencia: cero Date.now en render/cálculo).
// =============================================================================

import { useContext, useEffect, useMemo, useState, type FormEvent, type JSX } from "react";
import { useNavigate } from "react-router";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import { Field, InputLabel, NumberInput, SelectInput } from "../components/ui/InputLabel";
import { AsistenteAlcance } from "../components/proyecto/AsistenteAlcance";
import { obraDeCaso } from "../lib/proyecto/alcance";
import { SelectorMunicipio } from "../components/proyecto/SelectorMunicipio";
import { BotonMapa, EnlaceVisor } from "../components/proyecto/MapaNormativo";
import { Map as MapaIcon } from "lucide-react";
import { PROVINCIAS, altitudCapitalDe, limiteTramoCercano } from "../data/zonasClimaticasHE";
import { zonaRadonDeIne } from "../data/radonHS6";
import { derivarContexto } from "../lib/proyecto/derivar";
import { CASOS_EDIFICIO, edificioDeCaso, type CasoEdificio } from "../lib/edificio/casos";
import { ProyectoContext } from "../lib/proyecto/ProyectoContext";
import { crearProyecto, setProyectoActivo } from "../lib/proyecto/storage";
import type { DatosGenerales, Intervencion, ZonaRadon } from "../lib/proyecto/tipos";
import { intensidadDe } from "../modules/hs5/pluviales";
import { ISOYETAS, type Isoyeta, type ZonaPluviometrica } from "../modules/hs5/tablas";
import type { ClaseKs, NivelFreatico, TerrenoTipo, ZonaEolica, ZonaPluviometricaHs1 } from "../modules/hs1/tipos";
import { SUA8_NG } from "../modules/sua8/tablas";

// -----------------------------------------------------------------------------
// Opciones de los selects (a nivel de módulo: identidad estable entre renders).
// Etiquetas legibles en español; los values son los unions de tipos.ts.
// -----------------------------------------------------------------------------

const INTERVENCION_OPTIONS: { value: Intervencion; label: string }[] = [
  { value: "obra_nueva", label: "Obra nueva" },
  { value: "reforma", label: "Reforma" },
  { value: "ampliacion", label: "Ampliación" },
  { value: "cambio_uso", label: "Cambio de uso" },
];

const ZONA_RADON_OPTIONS: { value: ZonaRadon; label: string }[] = [
  { value: "I", label: "Zona I" },
  { value: "II", label: "Zona II" },
  { value: "sin_exigencia", label: "Sin exigencia" },
];

/** "" = no indicada (HS5 supone 100 mm/h y lo avisa). */
const ZONA_PLUVIOMETRICA_OPTIONS: { value: "" | ZonaPluviometrica; label: string }[] = [
  { value: "", label: "— No indicada —" },
  { value: "A", label: "Zona A" },
  { value: "B", label: "Zona B" },
];

const ISOYETA_OPTIONS: { value: string; label: string }[] = ISOYETAS.map((i) => ({
  value: String(i),
  label: `Isoyeta ${i}`,
}));

// HS 1 (feature-17). "" = no indicada: HS1 supone y lo avisa.
const ZONA_PLUV_HS1_OPTIONS: { value: "" | ZonaPluviometricaHs1; label: string }[] = [
  { value: "", label: "— No indicada —" },
  { value: "I", label: "Zona I" },
  { value: "II", label: "Zona II" },
  { value: "III", label: "Zona III" },
  { value: "IV", label: "Zona IV" },
  { value: "V", label: "Zona V" },
];

const ZONA_EOLICA_OPTIONS: { value: "" | ZonaEolica; label: string }[] = [
  { value: "", label: "— No indicada —" },
  { value: "A", label: "Zona A · 26 m/s" },
  { value: "B", label: "Zona B · 27 m/s" },
  { value: "C", label: "Zona C · 29 m/s" },
];

/** SUA 8 (feature-20): las cifras del mapa de la figura 1.1, sin 3,50 ni 4,50. */
const NG_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— No indicada —" },
  ...SUA8_NG.datos.map((v) => ({ value: String(v), label: `${v.toFixed(2).replace(".", ",")} impactos/año·km²` })),
];

/** Ld de los mapas de ruido, de 5 en 5 dBA: el límite superior de cada banda (HR, tabla 2.1). */
const LD_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— Sin datos (60 dBA) —" },
  ...[50, 55, 60, 65, 70, 75, 80].map((v) => ({ value: String(v), label: `${v} dBA` })),
];

const TERRENO_TIPO_OPTIONS: { value: "" | TerrenoTipo; label: string }[] = [
  { value: "", label: "— No indicado —" },
  { value: "I", label: "I · Costa (E0)" },
  { value: "II", label: "II · Rural llano (E0)" },
  { value: "III", label: "III · Rural (E0)" },
  { value: "IV", label: "IV · Urbano (E1)" },
  { value: "V", label: "V · Gran ciudad (E1)" },
];

const FREATICO_OPTIONS: { value: "" | NivelFreatico["tipo"]; label: string }[] = [
  { value: "", label: "— No indicado —" },
  { value: "no_detectado", label: "No se detecta" },
  { value: "profundidad", label: "A una profundidad" },
];

const KS_OPTIONS: { value: "" | ClaseKs; label: string }[] = [
  { value: "", label: "— No indicado —" },
  { value: "alto", label: "Ks ≥ 10⁻² cm/s" },
  { value: "medio", label: "10⁻⁵ < Ks < 10⁻² cm/s" },
  { value: "bajo", label: "Ks ≤ 10⁻⁵ cm/s" },
];

/** "" = sin seleccionar (opción placeholder) + las 52 provincias del Anejo B. */
const PROVINCIA_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— Selecciona —" },
  ...PROVINCIAS.map((prov) => ({ value: prov, label: prov })),
];

/** Visor oficial de los mapas estratégicos de ruido (MITECO / CEDEX). */
const SICA_URL = "https://sicaweb.cedex.es/";

/** Defaults del modo crear. */
function datosGeneralesIniciales(): DatosGenerales {
  return {
    municipio: "",
    provincia: "",
    altitud_m: 0,
    intervencion: "obra_nueva",
    tienePiscina: false,
    zonaRadon: "I",
  };
}

// -----------------------------------------------------------------------------
// Validación (pura): lista de errores en español. Vacía = formulario válido.
// -----------------------------------------------------------------------------

function validar(dg: DatosGenerales, nombre: string): string[] {
  const errores: string[] = [];
  if (nombre.trim() === "") {
    errores.push("El nombre del proyecto no puede estar vacío.");
  }
  if (dg.provincia === "" || !PROVINCIAS.includes(dg.provincia)) {
    errores.push("Selecciona una provincia (necesaria para derivar la zona climática).");
  }
  if (!Number.isFinite(dg.altitud_m) || dg.altitud_m < 0 || dg.altitud_m > 3500) {
    errores.push("La altitud debe estar entre 0 y 3500 m.");
  }
  if (
    dg.presionAcometida_kPa !== undefined &&
    (!Number.isFinite(dg.presionAcometida_kPa) ||
      dg.presionAcometida_kPa < 100 ||
      dg.presionAcometida_kPa > 1200)
  ) {
    errores.push("La presión de acometida, si se informa, debe estar entre 100 y 1200 kPa.");
  }
  if (
    dg.cotaAlcantarillado_m !== undefined &&
    (!Number.isFinite(dg.cotaAlcantarillado_m) || dg.cotaAlcantarillado_m < -20 || dg.cotaAlcantarillado_m > 5)
  ) {
    errores.push("La cota del alcantarillado, si se informa, debe estar entre −20 y +5 m.");
  }
  if (
    dg.nivelFreatico?.tipo === "profundidad" &&
    (!Number.isFinite(dg.nivelFreatico.profundidad_m) ||
      dg.nivelFreatico.profundidad_m < 0 ||
      dg.nivelFreatico.profundidad_m > 50)
  ) {
    errores.push("La profundidad del nivel freático debe estar entre 0 y 50 m bajo el terreno.");
  }
  if (
    dg.nivelFreatico?.tipo === "no_detectado" &&
    dg.nivelFreatico.reconocimiento_m !== undefined &&
    (!Number.isFinite(dg.nivelFreatico.reconocimiento_m) || dg.nivelFreatico.reconocimiento_m <= 0 || dg.nivelFreatico.reconocimiento_m > 100)
  ) {
    errores.push("La profundidad del reconocimiento, si se indica, debe estar entre 0 y 100 m.");
  }
  return errores;
}

/** Aviso inline para un Field: el primero de `errores` que contenga `clave`. */
function avisoDe(errores: string[], clave: string): string | undefined {
  return errores.find((e) => e.includes(clave));
}

// -----------------------------------------------------------------------------
// Fila de checkbox densa (mismo lenguaje que CheckRow de hs6/ui.tsx).
// -----------------------------------------------------------------------------

function CheckRow(props: {
  id: string;
  label: string;
  help?: string;
  /** Referencia normativa (2ª línea del tooltip), igual que en `Field`. */
  refText?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}): JSX.Element {
  const { id, label, help, refText, checked, onChange } = props;
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <InputLabel htmlFor={id} label={label} help={help} refText={refText} />
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent h-4 w-4 shrink-0 cursor-pointer"
      />
    </div>
  );
}

/** Clases compartidas de input de texto/número (mismo lenguaje que NumberInput). */
const INPUT_CLS =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent " +
  "focus:ring-accent/30 w-full rounded border px-2 py-1 text-[13px] " +
  "transition-colors focus:ring-1 focus:outline-none";

// -----------------------------------------------------------------------------
// Panel de derivados en vivo: zona climática + zona térmica + altura de
// evacuación, cada una con su procedencia en texto pequeño gris.
// -----------------------------------------------------------------------------

function FilaDerivado(props: { etiqueta: string; valor: string; procedencia: string }): JSX.Element {
  const { etiqueta, valor, procedencia } = props;
  return (
    <div className="py-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-text-secondary text-[13px]">{etiqueta}</span>
        <span className="text-text-primary text-[13px] font-semibold tabular-nums">{valor}</span>
      </div>
      <p className="text-text-disabled mt-0.5 text-[11px] leading-snug">{procedencia}</p>
    </div>
  );
}

/** De dónde sale la zona de radón, o aviso si no casa con el Apéndice B. */
function NotaRadon(props: {
  municipio: string;
  apendice: ZonaRadon | null;
  elegida: ZonaRadon;
  onUsar: (z: ZonaRadon) => void;
}): JSX.Element {
  const { municipio, apendice, elegida, onUsar } = props;
  if (apendice === null) {
    return (
      <p className="text-text-disabled mb-1 text-[11px] leading-snug">
        Elige el municipio y se toma del Apéndice B del DB-HS6.
      </p>
    );
  }
  const dice =
    apendice === "sin_exigencia"
      ? `${municipio} no figura en el listado: sin exigencia`
      : `${municipio} figura en zona ${apendice}`;
  if (apendice === elegida) {
    return (
      <p className="text-text-disabled mb-1 text-[11px] leading-snug">
        Del Apéndice B del DB-HS6: {dice}.
      </p>
    );
  }
  return (
    <p role="note" className="text-state-warn mb-1 text-[11px] leading-snug">
      No coincide con el Apéndice B del DB-HS6: {dice}.{" "}
      <button
        type="button"
        onClick={() => onUsar(apendice)}
        className="text-accent hover:text-accent-hover font-medium underline"
      >
        usar la del listado
      </button>
    </p>
  );
}

// -----------------------------------------------------------------------------
// Página
// -----------------------------------------------------------------------------

/** Normaliza para comparar nombres (sin acentos ni mayúsculas). */
function clave(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function FormDatosGeneralesPage({ modo }: { modo: "crear" | "editar" }): JSX.Element {
  const navigate = useNavigate();

  // useContext directo (no useProyecto): en modo `crear` la página vive FUERA
  // del provider y el hook lanzaría. En `editar` el contexto es obligatorio.
  const ctx = useContext(ProyectoContext);
  if (modo === "editar" && ctx === null) {
    throw new Error("FormDatosGeneralesPage en modo editar debe usarse dentro de <ProyectoProvider>.");
  }

  const [dg, setDg] = useState<DatosGenerales>(() =>
    modo === "editar" && ctx !== null ? ctx.proyecto.datosGenerales : datosGeneralesIniciales(),
  );
  const [nombre, setNombre] = useState<string>(() =>
    modo === "editar" && ctx !== null ? ctx.proyecto.nombre : "",
  );
  // Caso de partida del edificio (solo al crear): luego se edita en El edificio.
  const [caso, setCaso] = useState<CasoEdificio>("plurifamiliar");
  const edificio = useMemo(
    () => (modo === "editar" && ctx !== null ? ctx.proyecto.edificio : edificioDeCaso(caso)),
    [modo, ctx, caso],
  );
  // Borrador textual de la presión: "" = no informada (undefined en el modelo).
  // Un NumberInput no vale aquí: Number("") === 0 y perderíamos el estado "vacío".
  const [presionTxt, setPresionTxt] = useState<string>(() => {
    const p = modo === "editar" && ctx !== null ? ctx.proyecto.datosGenerales.presionAcometida_kPa : undefined;
    return p === undefined ? "" : String(p);
  });

  // Altitud SUGERIDA por el listado de municipios (feature-9), pendiente de que
  // el usuario la acepte. Nunca se aplica sola: la fuente es orientativa y un
  // error suyo puede cruzar un tramo del Anejo B y cambiar la zona climática.
  const [sugerencia, setSugerencia] = useState<{ municipio: string; altitud_m: number } | null>(
    null,
  );

  // Backspace con el foco FUERA de un campo editable: varios navegadores (y los
  // contenedores tipo webview/PWA) lo siguen interpretando como "atrás". En este
  // formulario eso cierra la edición y PIERDE lo escrito, porque los datos
  // generales no se persisten hasta pulsar Guardar. Se neutraliza mientras el
  // formulario está montado; dentro de input/textarea/select/contenteditable el
  // evento no se toca (ahí Backspace es borrar, y debe seguir siéndolo).
  useEffect(() => {
    function alPulsar(e: KeyboardEvent): void {
      if (e.key !== "Backspace") return;
      const t = e.target;
      const editable =
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement ||
        (t instanceof HTMLElement && t.isContentEditable);
      if (!editable) e.preventDefault();
    }
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, []);

  // El ejemplo de reforma trae también los datos de la obra (feature-27); al
  // volver a un caso de obra nueva, se deshacen.
  function elegirCaso(c: CasoEdificio): void {
    const antes = obraDeCaso(caso);
    const obra = obraDeCaso(c);
    setCaso(c);
    if (obra) setDg((prev) => ({ ...prev, ...obra }));
    else if (antes) setDg((prev) => ({ ...prev, intervencion: "obra_nueva", alcance: undefined }));
  }

  function set<K extends keyof DatosGenerales>(k: K, v: DatosGenerales[K]): void {
    setDg((prev) => ({ ...prev, [k]: v }));
  }

  function onMunicipio(c: { municipio: string; municipioIne?: string }): void {
    // La zona de radón SÍ se escribe sola: la fija el propio DB-HS6 por
    // municipio (Apéndice B), no una fuente orientativa como la altitud.
    const radon = zonaRadonDeIne(c.municipioIne);
    setDg((prev) => ({
      ...prev,
      municipio: c.municipio,
      municipioIne: c.municipioIne,
      ...(radon !== null ? { zonaRadon: radon } : {}),
    }));
    // Solo hay altitud verificada para las capitales de provincia
    // (`altitudCapital_m`, la de la tabla a-Anejo G). Y aun esa se OFRECE, no se
    // escribe: el DB-HE pide la cota del emplazamiento.
    const cap = altitudCapitalDe(dg.provincia);
    setSugerencia(
      cap !== null && clave(c.municipio) === clave(cap.capital)
        ? { municipio: cap.capital, altitud_m: cap.altitud_m }
        : null,
    );
  }

  // Borrador textual de la cota del alcantarillado (mismo motivo que la presión).
  const [cotaTxt, setCotaTxt] = useState<string>(() => {
    const c = modo === "editar" && ctx !== null ? ctx.proyecto.datosGenerales.cotaAlcantarillado_m : undefined;
    return c === undefined ? "" : String(c);
  });

  function onCotaChange(txt: string): void {
    setCotaTxt(txt);
    const n = Number(txt.replace(",", ".").replace("−", "-"));
    set("cotaAlcantarillado_m", txt.trim() === "" || !Number.isFinite(n) ? undefined : n);
  }

  // Borrador textual de la profundidad del freático (mismo motivo que la cota).
  const [freaticoTxt, setFreaticoTxt] = useState<string>(() => {
    const f = modo === "editar" && ctx !== null ? ctx.proyecto.datosGenerales.nivelFreatico : undefined;
    return f?.tipo === "profundidad" ? String(f.profundidad_m).replace(".", ",") : "";
  });

  // Borrador textual de la profundidad del reconocimiento (freático no detectado).
  const [reconocimientoTxt, setReconocimientoTxt] = useState<string>(() => {
    const f = modo === "editar" && ctx !== null ? ctx.proyecto.datosGenerales.nivelFreatico : undefined;
    return f?.tipo === "no_detectado" && f.reconocimiento_m !== undefined ? String(f.reconocimiento_m).replace(".", ",") : "";
  });

  function onReconocimiento(txt: string): void {
    setReconocimientoTxt(txt);
    const n = Number(txt.replace(",", "."));
    set("nivelFreatico", txt.trim() === "" ? { tipo: "no_detectado" } : { tipo: "no_detectado", reconocimiento_m: n });
  }

  function onFreaticoTipo(v: "" | NivelFreatico["tipo"]): void {
    if (v === "") set("nivelFreatico", undefined);
    else if (v === "no_detectado") {
      const n = Number(reconocimientoTxt.replace(",", "."));
      set("nivelFreatico", reconocimientoTxt.trim() === "" ? { tipo: "no_detectado" } : { tipo: "no_detectado", reconocimiento_m: n });
    }
    else {
      // Sin cifra escrita queda NaN: la validación pide la profundidad.
      const n = Number(freaticoTxt.replace(",", "."));
      set("nivelFreatico", { tipo: "profundidad", profundidad_m: freaticoTxt.trim() === "" ? Number.NaN : n });
    }
  }

  function onFreaticoProfundidad(txt: string): void {
    setFreaticoTxt(txt);
    const n = Number(txt.replace(",", "."));
    set("nivelFreatico", { tipo: "profundidad", profundidad_m: txt.trim() === "" ? Number.NaN : n });
  }

  function onZonaPluviometrica(v: "" | ZonaPluviometrica): void {
    set("pluviometria", v === "" ? undefined : { zona: v, isoyeta: dg.pluviometria?.isoyeta ?? 30 });
  }

  function onIsoyeta(v: string): void {
    if (!dg.pluviometria) return;
    set("pluviometria", { ...dg.pluviometria, isoyeta: Number(v) as Isoyeta });
  }

  function onPresionChange(txt: string): void {
    setPresionTxt(txt);
    const n = Number(txt);
    set("presionAcometida_kPa", txt.trim() === "" || !Number.isFinite(n) ? undefined : n);
  }

  // El tipo elegido entra en los tipos de obra del asistente si ya los había
  // marcado (feature-27): una obra puede ser reforma y ampliación a la vez.
  function onIntervencion(v: Intervencion): void {
    setDg((prev) => {
      const tipos = prev.alcance?.tipos;
      if (v === "obra_nueva" || !tipos || tipos.includes(v)) return { ...prev, intervencion: v };
      return { ...prev, intervencion: v, alcance: { ...prev.alcance, tipos: [v, ...tipos] } };
    });
  }

  const errores = useMemo(() => validar(dg, nombre), [dg, nombre]);

  // Zona de radón que da el Apéndice B del DB-HS6 para el municipio elegido
  // (null sin municipio del listado INE). Si el valor guardado no coincide, se avisa.
  const radonApendice = useMemo(() => zonaRadonDeIne(dg.municipioIne), [dg.municipioIne]);

  // ¿La altitud roza un límite de tramo del Anejo B? (feature-9) Es el aviso que
  // de verdad protege: la zona climática salta de golpe en cotas concretas.
  const limiteCercano = useMemo(
    () => limiteTramoCercano(dg.provincia, dg.altitud_m),
    [dg.provincia, dg.altitud_m],
  );

  // Derivados en vivo: se recalculan al cambiar provincia / altitud (y, al
  // crear, el caso de partida, que fija la altura de evacuación).
  const derivados = useMemo(
    () => derivarContexto({ provincia: dg.provincia, altitud_m: dg.altitud_m }, edificio),
    [dg.provincia, dg.altitud_m, edificio],
  );

  function onSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (errores.length > 0) return;
    const nowIso = new Date().toISOString();
    if (modo === "crear") {
      const p = crearProyecto(nombre.trim(), dg, edificio, nowIso);
      setProyectoActivo(p.id);
      void navigate(`/p/${p.id}/edificio`);
    } else {
      // ctx no es null aquí (guard de arriba); el narrow no sobrevive al closure.
      const nombreLimpio = nombre.trim();
      if (nombreLimpio !== ctx!.proyecto.nombre) ctx!.renombrarProyecto(nombreLimpio, nowIso);
      ctx!.actualizarDatosGenerales(dg, nowIso);
      void navigate("..");
    }
  }

  return (
    <div className="bg-bg-primary h-full min-h-0 overflow-y-auto">
      <form onSubmit={onSubmit} noValidate className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-6 lg:px-8">
        <header className="mb-4 max-w-3xl">
          <h1 className="text-text-primary mb-1 text-lg font-semibold">
            {modo === "crear" ? "Nuevo proyecto" : "Datos de la obra"}
          </h1>
          <p className="text-text-disabled text-[12px] leading-snug">
            Emplazamiento, intervención y suministro: se rellenan una vez y de ellos se deriva el
            contexto que heredan todas las justificaciones. El edificio se describe en su propia
            pantalla.
          </p>
        </header>

        {/* Dos columnas en escritorio: a la izquierda lo que identifica la obra
            (y el contexto que de ello se deriva); a la derecha las zonas que se
            leen en los mapas del CTE y el terreno. En móvil, una sola columna. */}
        <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
          <div className="min-w-0">
            <CollapsibleSection label="Identificación y emplazamiento" refNorma="DB-HE Anejo B">
              <div className="py-1">
                <InputLabel htmlFor="dg-nombre" label="Nombre del proyecto" />
                <input
                  id="dg-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="p. ej. 12 viviendas en c/ Mayor"
                  autoFocus={modo === "crear"}
                  className={`${INPUT_CLS} mt-1`}
                />
                {avisoDe(errores, "nombre") !== undefined && (
                  <p className="text-state-warn mt-0.5 text-[11px]">{avisoDe(errores, "nombre")}</p>
                )}
              </div>
              {/* La provincia va PRIMERO: filtra el listado de municipios. */}
              <Field
                id="dg-provincia"
                label="Provincia"
                ancho
                help="Provincia/ciudad autónoma del emplazamiento (Tabla a-Anejo B del DB-HE). Junto con la altitud determina la zona climática y la zona térmica HS3."
                refText="DB-HE Anejo B"
                warning={avisoDe(errores, "provincia")}
              >
                <SelectInput<string>
                  id="dg-provincia"
                  value={dg.provincia}
                  options={PROVINCIA_OPTIONS}
                  onChange={(v) => {
                    // Cambiar de provincia invalida el municipio elegido (y su
                    // código INE): pertenecen a la provincia anterior.
                    setDg((prev) => ({
                      ...prev,
                      provincia: v,
                      municipio: "",
                      municipioIne: undefined,
                    }));
                  }}
                />
              </Field>
              <Field
                id="dg-municipio"
                label="Municipio"
                ancho
                help="Se elige del listado oficial (INE) de la provincia. El código INE es lo que permite cruzar el municipio con las tablas que clasifican por municipio; escrito a mano no serviría."
              >
                <SelectorMunicipio
                  provincia={dg.provincia}
                  municipio={dg.municipio}
                  onChange={onMunicipio}
                />
              </Field>
              <Field
                id="dg-altitud"
                label="Altitud"
                unit="m"
                help="Altitud del EMPLAZAMIENTO sobre el nivel del mar. Corrige la zona climática de la capital por tramos (Tabla a-Anejo B). Al elegir municipio se propone la altitud de su núcleo: corrígela si tu parcela está a otra cota."
                refText="DB-HE Anejo B"
                warning={avisoDe(errores, "altitud")}
              >
                <NumberInput
                  id="dg-altitud"
                  value={dg.altitud_m}
                  min={0}
                  max={3500}
                  onChange={(v) => {
                    set("altitud_m", v);
                    setSugerencia(null); // el usuario toma el mando
                  }}
                />
              </Field>

              {/* Sugerencia de altitud: se OFRECE, no se aplica sola. */}
              {sugerencia !== null && sugerencia.altitud_m !== dg.altitud_m && (
                <p className="text-text-secondary text-[11px] leading-snug">
                  {sugerencia.municipio} figura a{" "}
                  <span className="text-text-primary font-mono">{sugerencia.altitud_m} m</span>{" "}
                  (altitud del núcleo, orientativa){" "}
                  <button
                    type="button"
                    onClick={() => {
                      set("altitud_m", sugerencia.altitud_m);
                      setSugerencia(null);
                    }}
                    className="text-accent hover:text-accent-hover font-medium underline"
                  >
                    usar este valor
                  </button>
                  . El DB-HE exige la altitud del emplazamiento: compruébala si tu parcela
                  está a otra cota.
                </p>
              )}

              {/* Aviso de borde de tramo: unos metros cambian la zona climática. */}
              {limiteCercano !== null && (
                <p role="note" className="text-state-warn text-[11px] leading-snug">
                  Ojo: {dg.altitud_m} m está muy cerca del límite de tramo de{" "}
                  <span className="font-mono">{limiteCercano.limite_m} m</span> del Anejo B
                  (por debajo {limiteCercano.zonaDebajo}, por encima {limiteCercano.zonaEncima}).
                  Confirma la cota real del emplazamiento: unos metros cambian la zona
                  climática y con ella la transmitancia límite exigida.
                </p>
              )}

              {/* Contexto derivado en vivo, junto a los datos de los que sale. */}
              <aside
                aria-label="Contexto derivado"
                className="border-border-main bg-bg-surface mt-3 mb-1 rounded border px-4 py-2.5"
              >
                <h2 className="text-text-disabled border-border-sub mb-1 border-b pb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
                  Contexto derivado
                </h2>
                {derivados === null ? (
                  <p className="text-text-secondary py-1.5 text-[12px] leading-snug">
                    Elige la provincia para derivar la zona climática y la zona térmica.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-3 lg:grid-cols-1">
                    <FilaDerivado
                      etiqueta="Zona climática"
                      valor={derivados.zonaClimatica.valor}
                      procedencia={derivados.zonaClimatica.procedencia}
                    />
                    <FilaDerivado
                      etiqueta="Zona térmica HS3"
                      valor={derivados.zonaTermicaHS3.valor}
                      procedencia={derivados.zonaTermicaHS3.procedencia}
                    />
                    <FilaDerivado
                      etiqueta="Altura de evacuación"
                      valor={`${derivados.alturaEvacuacion_m.valor} m`}
                      procedencia={derivados.alturaEvacuacion_m.procedencia}
                    />
                  </div>
                )}
              </aside>
            </CollapsibleSection>

            {modo === "crear" && (
              <CollapsibleSection label="El edificio">
                <fieldset className="py-1">
                  <legend className="text-text-secondary mb-1.5 text-[12px]">
                    Partir de un caso
                  </legend>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {CASOS_EDIFICIO.map((c) => (
                      <label
                        key={c.key}
                        className={[
                          "flex cursor-pointer items-center gap-2 rounded border px-2.5 py-2 text-[13px] transition-colors",
                          caso === c.key
                            ? "border-accent bg-tint-accent text-text-primary"
                            : "border-border-main text-text-secondary hover:border-text-disabled",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name="dg-caso"
                          value={c.key}
                          checked={caso === c.key}
                          onChange={() => elegirCaso(c.key)}
                          className="accent-accent"
                        />
                        {c.etiqueta}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className="text-text-disabled mb-1 text-[11px] leading-snug">
                  Al crear el proyecto se abre El edificio con este caso: plantas, zonas y
                  viviendas tipo se ajustan allí.
                </p>
              </CollapsibleSection>
            )}

            <CollapsibleSection label="Intervención" refNorma="CTE Parte I art. 2">
              <Field id="dg-intervencion" label="Tipo de intervención" ancho>
                <SelectInput<Intervencion>
                  id="dg-intervencion"
                  value={dg.intervencion}
                  options={INTERVENCION_OPTIONS}
                  onChange={onIntervencion}
                />
              </Field>
              {dg.intervencion !== "obra_nueva" && (
                <AsistenteAlcance
                  dg={dg}
                  edificio={edificio}
                  justificaciones={modo === "editar" ? ctx?.proyecto.justificaciones : undefined}
                  onChange={(alcance) => set("alcance", alcance)}
                />
              )}
              <CheckRow
                id="dg-piscina"
                label="Piscina"
                help="Márcalo si hay piscina, sea de uso colectivo o privada de una unifamiliar. El ámbito de SUA6 se limita a las colectivas y deja fuera las de vivienda unifamiliar: esa distinción la hace el motor, y en unifamiliar redacta el «no aplica» por ese motivo. Sin marcar, el anejo afirmaría que no hay piscina."
                refText="DB-SUA 6, ámbito de aplicación"
                checked={dg.tienePiscina}
                onChange={(v) => set("tienePiscina", v)}
              />
            </CollapsibleSection>

            <CollapsibleSection label="Suministro y saneamiento" defaultOpen={false}>
              <Field
                id="dg-presion"
                label="Presión de acometida"
                sub="(opcional)"
                unit="kPa"
                help="Dato de la compañía suministradora. Si se deja vacío, HS4 usa su valor propio."
                warning={avisoDe(errores, "presión")}
              >
                <input
                  id="dg-presion"
                  type="number"
                  inputMode="decimal"
                  min={100}
                  max={1200}
                  value={presionTxt}
                  onChange={(e) => onPresionChange(e.target.value)}
                  placeholder="—"
                  className={`${INPUT_CLS} text-right tabular-nums`}
                />
              </Field>
              <Field
                id="dg-cota-alcantarillado"
                label="Cota del alcantarillado"
                sub="(opcional)"
                unit="m"
                help="Cota de la red de alcantarillado en el punto de acometida, respecto a la rasante (negativa si está por debajo, p. ej. −1,20). Decide si un sótano evacua por bombeo. Si se deja vacía, HS5 supone que los sótanos quedan por debajo y lo avisa."
                warning={avisoDe(errores, "alcantarillado")}
              >
                <input
                  id="dg-cota-alcantarillado"
                  type="text"
                  inputMode="decimal"
                  value={cotaTxt}
                  onChange={(e) => onCotaChange(e.target.value)}
                  placeholder="—"
                  className={`${INPUT_CLS} text-right tabular-nums`}
                />
              </Field>
            </CollapsibleSection>
          </div>

          <div className="min-w-0">
            <CollapsibleSection label="Zonas del emplazamiento" refNorma="DB-HS6 · DB-HS5 · DB-HS1 · DB-SUA 8 · DB-HR">
              <p className="text-text-disabled mb-1 text-[11px] leading-snug">
                El radón sale del municipio. El resto el CTE solo lo da en mapas: pulsa{" "}
                <MapaIcon size={11} className="inline align-[-1px]" aria-label="el icono del mapa" /> para
                abrir el de cada campo.
              </p>
              <Field
                id="dg-zona-radon"
                label="Zona de radón"
                ancho
                help="Se toma sola al elegir el municipio, del listado del Apéndice B del DB-HS6 (zona I, zona II o, si el municipio no figura, sin exigencia). Puedes cambiarla, pero se avisará de que no coincide con el listado."
                refText="DB-HS6 Apéndice B"
              >
                <SelectInput<ZonaRadon>
                  id="dg-zona-radon"
                  value={dg.zonaRadon}
                  options={ZONA_RADON_OPTIONS}
                  onChange={(v) => set("zonaRadon", v)}
                />
              </Field>
              <NotaRadon
                municipio={dg.municipio}
                apendice={radonApendice}
                elegida={dg.zonaRadon}
                onUsar={(z) => set("zonaRadon", z)}
              />
              <Field
                id="dg-zona-pluviometrica"
                label="Zona pluviométrica"
                sub="(HS5)"
                ancho
                accion={<BotonMapa mapa="hs5-figB-1" />}
                help="Zona A o B del mapa de la Figura B.1 del DB-HS5. Es una ENTRADA MANUAL: el DB solo da el mapa. Sin ella, HS5 calcula los pluviales con 100 mm/h y lo avisa."
                refText="DB-HS5 Apéndice B, Figura B.1"
              >
                <SelectInput<"" | ZonaPluviometrica>
                  id="dg-zona-pluviometrica"
                  value={dg.pluviometria?.zona ?? ""}
                  options={ZONA_PLUVIOMETRICA_OPTIONS}
                  onChange={onZonaPluviometrica}
                />
              </Field>
              {dg.pluviometria && (
                <Field
                  id="dg-isoyeta"
                  label="Isoyeta"
                  ancho
                  accion={<BotonMapa mapa="hs5-figB-1" />}
                  help="La isoyeta del mapa de la Figura B.1 que pasa por el municipio."
                  refText="DB-HS5 Apéndice B, Tabla B.1"
                >
                  <SelectInput<string>
                    id="dg-isoyeta"
                    value={String(dg.pluviometria.isoyeta)}
                    options={ISOYETA_OPTIONS}
                    onChange={onIsoyeta}
                  />
                </Field>
              )}
              {dg.pluviometria && (
                <p className="text-text-disabled mb-1 text-[11px] leading-snug">
                  Intensidad pluviométrica: {intensidadDe(dg.pluviometria.zona, dg.pluviometria.isoyeta)} mm/h
                  (Tabla B.1).
                </p>
              )}
              <Field
                id="dg-zona-pluv-hs1"
                label="Zona pluviométrica"
                sub="(HS1)"
                ancho
                accion={<BotonMapa mapa="hs1-fig2-4" />}
                help="Zona I a V del mapa de la figura 2.4 del DB-HS1, por el índice pluviométrico anual. No es la zona A/B de HS5. ENTRADA MANUAL: el DB solo da el mapa. Sin ella, HS1 supone la zona más lluviosa y lo avisa."
                refText="DB-HS1 2.3.1, figura 2.4"
              >
                <SelectInput<"" | ZonaPluviometricaHs1>
                  id="dg-zona-pluv-hs1"
                  value={dg.zonaPluviometricaHs1 ?? ""}
                  options={ZONA_PLUV_HS1_OPTIONS}
                  onChange={(v) => set("zonaPluviometricaHs1", v === "" ? undefined : v)}
                />
              </Field>
              <Field
                id="dg-zona-eolica"
                label="Zona eólica"
                ancho
                accion={<BotonMapa mapa="hs1-fig2-5" />}
                help="Zona A, B o C del mapa de la figura 2.5 del DB-HS1 (velocidad básica del viento). ENTRADA MANUAL. Sin ella, HS1 supone la zona C y lo avisa."
                refText="DB-HS1 2.3.1, figura 2.5"
              >
                <SelectInput<"" | ZonaEolica>
                  id="dg-zona-eolica"
                  value={dg.zonaEolica ?? ""}
                  options={ZONA_EOLICA_OPTIONS}
                  onChange={(v) => set("zonaEolica", v === "" ? undefined : v)}
                />
              </Field>
              <Field
                id="dg-ng"
                label="Densidad de impactos Ng"
                sub="(SUA 8)"
                ancho
                accion={<BotonMapa mapa="sua8-fig1-1" />}
                help="Densidad de impactos sobre el terreno, leída en el mapa de la figura 1.1 del DB-SUA para el municipio de la obra. ENTRADA MANUAL: el mapa no da un valor por provincia; si el municipio cae sobre una línea o entre dos zonas, toma el mayor. Sin ella, SUA 8 supone 6,00 (el mayor del mapa) y lo avisa si cambia el resultado."
                refText="DB-SUA 8 ap. 1 pto 3, figura 1.1"
              >
                <SelectInput<string>
                  id="dg-ng"
                  value={dg.densidadImpactosNg === undefined ? "" : String(dg.densidadImpactosNg)}
                  options={NG_OPTIONS}
                  onChange={(v) => set("densidadImpactosNg", v === "" ? undefined : Number(v))}
                />
              </Field>
              <Field
                id="dg-ld"
                label="Índice de ruido día Ld"
                sub="(HR)"
                ancho
                accion={<EnlaceVisor href={SICA_URL} etiqueta="Abrir los mapas estratégicos de ruido (SICA, Ministerio para la Transición Ecológica)" />}
                help="Índice de ruido día de la zona, del mapa estratégico de ruido o de la administración competente. Si el mapa da una banda (65–70), toma su valor superior; si el edificio da a varias calles, el mayor. Sin datos oficiales, HR toma 60 dBA, el valor del DB para las áreas de predominio residencial, y lo avisa: en otras áreas acústicas hay que indicarlo."
                refText="DB-HR ap. 2.1.1 a) iv, tabla 2.1"
              >
                <SelectInput<string>
                  id="dg-ld"
                  value={dg.ldZona === undefined ? "" : String(dg.ldZona)}
                  options={LD_OPTIONS}
                  onChange={(v) => set("ldZona", v === "" ? undefined : Number(v))}
                />
              </Field>
              <CheckRow
                id="dg-aeronaves"
                label="Ruido dominante de aeronaves"
                help="Márcalo si el edificio está en la huella acústica de un aeropuerto según los mapas de ruido: el aislamiento exigido a las fachadas sube 4 dBA y no se puede restar nada por las fachadas a patio."
                refText="DB-HR ap. 2.1.1 a) iv"
                checked={dg.aeronaves === true}
                onChange={(v) => set("aeronaves", v ? true : undefined)}
              />
            </CollapsibleSection>

            <CollapsibleSection label="Terreno" refNorma="DB-HS1 · estudio geotécnico">
              <Field
                id="dg-terreno-tipo"
                label="Entorno del edificio"
                ancho
                help="Terreno tipo del DB-SE. I: borde del mar o de un lago con 5 km despejados de agua; II: rural llano sin obstáculos ni arbolado de importancia; III: rural accidentado o llano con obstáculos aislados; IV: zona urbana, industrial o forestal; V: centro de negocios de gran ciudad, con profusión de edificios en altura. Da la clase del entorno de HS1: E0 con I, II o III; E1 con IV o V. Sin él, HS1 supone E0 y lo avisa."
                refText="DB-HS1 2.3.1 b)"
              >
                <SelectInput<"" | TerrenoTipo>
                  id="dg-terreno-tipo"
                  value={dg.terrenoTipo ?? ""}
                  options={TERRENO_TIPO_OPTIONS}
                  onChange={(v) => set("terrenoTipo", v === "" ? undefined : v)}
                />
              </Field>
              <Field
                id="dg-freatico"
                label="Nivel freático"
                ancho
                help="Del estudio geotécnico: valor medio anual de la profundidad del nivel freático, medida desde la superficie del terreno. Decide la presencia de agua frente a la cara inferior del suelo en contacto con el terreno. Sin él, HS1 supone presencia alta y lo avisa."
                refText="DB-HS1 2.1.1 pto 2 y Apéndice A"
              >
                <SelectInput<"" | NivelFreatico["tipo"]>
                  id="dg-freatico"
                  value={dg.nivelFreatico?.tipo ?? ""}
                  options={FREATICO_OPTIONS}
                  onChange={onFreaticoTipo}
                />
              </Field>
              {dg.nivelFreatico?.tipo === "profundidad" && (
                <Field
                  id="dg-freatico-prof"
                  label="Profundidad bajo la rasante"
                  unit="m"
                  help="Profundidad media anual del nivel freático bajo la superficie del terreno, en positivo."
                  warning={avisoDe(errores, "freático")}
                >
                  <input
                    id="dg-freatico-prof"
                    type="text"
                    inputMode="decimal"
                    value={freaticoTxt}
                    onChange={(e) => onFreaticoProfundidad(e.target.value)}
                    placeholder="—"
                    className={`${INPUT_CLS} text-right tabular-nums`}
                  />
                </Field>
              )}
              {dg.nivelFreatico?.tipo === "no_detectado" && (
                <Field
                  id="dg-reconocimiento"
                  label="Reconocido hasta"
                  sub="(opcional)"
                  unit="m"
                  help="Hasta dónde llegó el reconocimiento del estudio geotécnico sin encontrar agua. «No se detecta» solo equivale a presencia baja si llegó más hondo que la cara inferior del suelo; si no se indica, HS1 lo avisa."
                  warning={avisoDe(errores, "reconocimiento")}
                >
                  <input
                    id="dg-reconocimiento"
                    type="text"
                    inputMode="decimal"
                    value={reconocimientoTxt}
                    onChange={(e) => onReconocimiento(e.target.value)}
                    placeholder="—"
                    className={`${INPUT_CLS} text-right tabular-nums`}
                  />
                </Field>
              )}
              <Field
                id="dg-ks"
                label="Permeabilidad del terreno"
                ancho
                help="Coeficiente de permeabilidad Ks del estudio geotécnico, por las columnas de la tabla 2.1 del DB-HS1."
                refText="DB-HS1 tablas 2.1 y 2.3"
              >
                <SelectInput<"" | ClaseKs>
                  id="dg-ks"
                  value={dg.permeabilidadTerreno ?? ""}
                  options={KS_OPTIONS}
                  onChange={(v) => set("permeabilidadTerreno", v === "" ? undefined : v)}
                />
              </Field>
            </CollapsibleSection>
          </div>
        </div>

        {/* Barra inferior fija: errores pendientes + enviar, siempre a mano. */}
        <div className="border-border-sub bg-bg-primary sticky bottom-0 z-10 mt-6 border-t py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {errores.length > 0 ? (
              <div role="alert" className="min-w-0">
                <p className="text-state-warn text-[12px] font-semibold">
                  Revisa el formulario antes de continuar:
                </p>
                <ul className="text-state-warn mt-0.5 list-disc pl-5 text-[12px] leading-snug">
                  {errores.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={errores.length > 0}
              className="bg-accent hover:bg-accent-hover focus-visible:ring-accent/40 w-full shrink-0 cursor-pointer rounded px-6 py-2 text-[13px] font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {modo === "crear" ? "Crear proyecto" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
