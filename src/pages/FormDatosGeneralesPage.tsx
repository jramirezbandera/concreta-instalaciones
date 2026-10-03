// =============================================================================
// FormDatosGeneralesPage — feature-6 T3.6: formulario de DATOS GENERALES del
// expediente (UX-RECONCEPT §2.3), en dos modos:
//
//   - `crear`:  standalone (SIN ProyectoProvider). Parte de defaults, exige
//               nombre, y al enviar crea el proyecto (crearProyecto), lo fija
//               como activo (setProyectoActivo) y navega a `/p/${id}`.
//   - `editar`: DENTRO del provider. Inicializa de `proyecto.datosGenerales`,
//               y al guardar llama `actualizarDatosGenerales(dg, nowIso)` y
//               navega a `..` (el dashboard del proyecto).
//
// El panel lateral de DERIVADOS recalcula en vivo `derivarContexto` al cambiar
// provincia/altitud/plantas, mostrando cada valor con su PROCEDENCIA (la
// trazabilidad empieza aquí, no en la ficha). Validación inline en español con
// resumen de errores; el submit se deshabilita mientras haya alguno.
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
import { SelectorMunicipio } from "../components/proyecto/SelectorMunicipio";
import { EditorAlturasPlantas } from "../components/proyecto/EditorAlturasPlantas";
import { PROVINCIAS, altitudCapitalDe, limiteTramoCercano } from "../data/zonasClimaticasHE";
import { derivarContexto, reconciliarAlturas } from "../lib/proyecto/derivar";
import { ProyectoContext } from "../lib/proyecto/ProyectoContext";
import { crearProyecto, setProyectoActivo } from "../lib/proyecto/storage";
import type {
  DatosGenerales,
  Intervencion,
  TipoCubierta,
  Uso,
  ZonaRadon,
} from "../lib/proyecto/tipos";

// -----------------------------------------------------------------------------
// Opciones de los selects (a nivel de módulo: identidad estable entre renders).
// Etiquetas legibles en español; los values son los unions de tipos.ts.
// -----------------------------------------------------------------------------

const USO_OPTIONS: { value: Uso; label: string }[] = [
  { value: "vivienda_unifamiliar", label: "Vivienda unifamiliar" },
  { value: "vivienda_colectiva", label: "Vivienda colectiva" },
];

const INTERVENCION_OPTIONS: { value: Intervencion; label: string }[] = [
  { value: "obra_nueva", label: "Obra nueva" },
  { value: "reforma", label: "Reforma" },
  { value: "ampliacion", label: "Ampliación" },
  { value: "cambio_uso", label: "Cambio de uso" },
];

const CUBIERTA_OPTIONS: { value: TipoCubierta; label: string }[] = [
  { value: "plana_transitable", label: "Plana transitable" },
  { value: "plana_no_transitable", label: "Plana no transitable" },
  { value: "inclinada", label: "Inclinada" },
];

const ZONA_RADON_OPTIONS: { value: ZonaRadon; label: string }[] = [
  { value: "I", label: "Zona I" },
  { value: "II", label: "Zona II" },
  { value: "sin_exigencia", label: "Sin exigencia" },
];

/** "" = sin seleccionar (opción placeholder) + las 52 provincias del Anejo B. */
const PROVINCIA_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— Selecciona —" },
  ...PROVINCIAS.map((prov) => ({ value: prov, label: prov })),
];

/** Defaults del modo crear (mismos placeholders razonables que la migración legacy). */
function datosGeneralesIniciales(): DatosGenerales {
  return {
    municipio: "",
    provincia: "",
    altitud_m: 0,
    uso: "vivienda_colectiva",
    intervencion: "obra_nueva",
    plantasSobreRasante: 1,
    plantasBajoRasante: 0,
    tipoCubierta: "plana_no_transitable",
    numViviendas: 1,
    tieneGaraje: false,
    tieneTrasteros: false,
    tienePiscina: false,
    tieneLocalPB: false,
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
    !Number.isInteger(dg.plantasSobreRasante) ||
    dg.plantasSobreRasante < 1 ||
    dg.plantasSobreRasante > 30
  ) {
    errores.push("Las plantas sobre rasante deben estar entre 1 y 30.");
  }
  if (
    !Number.isInteger(dg.plantasBajoRasante) ||
    dg.plantasBajoRasante < 0 ||
    dg.plantasBajoRasante > 5
  ) {
    errores.push("Las plantas bajo rasante deben estar entre 0 y 5.");
  }
  if (!Number.isInteger(dg.numViviendas) || dg.numViviendas < 1) {
    errores.push("El número de viviendas debe ser al menos 1.");
  }
  // Alturas por planta (feature-10): solo se juzgan las que CUENTAN (dentro de
  // los contadores actuales — las recortadas por vista no molestan al guardar).
  if (dg.alturasPlantas_m !== undefined) {
    const enJuego = [
      ...dg.alturasPlantas_m.sobre.slice(0, Math.max(0, dg.plantasSobreRasante)),
      ...dg.alturasPlantas_m.bajo.slice(0, Math.max(0, dg.plantasBajoRasante)),
    ];
    if (enJuego.some((h) => !Number.isFinite(h))) {
      errores.push("Faltan alturas de planta por rellenar.");
    } else if (enJuego.some((h) => h < 2 || h > 10)) {
      errores.push("Las alturas de planta deben estar entre 2 y 10 m.");
    }
  }
  if (
    dg.presionAcometida_kPa !== undefined &&
    (!Number.isFinite(dg.presionAcometida_kPa) ||
      dg.presionAcometida_kPa < 100 ||
      dg.presionAcometida_kPa > 1200)
  ) {
    errores.push("La presión de acometida, si se informa, debe estar entre 100 y 1200 kPa.");
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

  function set<K extends keyof DatosGenerales>(k: K, v: DatosGenerales[K]): void {
    setDg((prev) => ({ ...prev, [k]: v }));
  }

  function onPresionChange(txt: string): void {
    setPresionTxt(txt);
    const n = Number(txt);
    set("presionAcometida_kPa", txt.trim() === "" || !Number.isFinite(n) ? undefined : n);
  }

  const errores = useMemo(() => validar(dg, nombre), [dg, nombre]);

  // ¿La altitud roza un límite de tramo del Anejo B? (feature-9) Es el aviso que
  // de verdad protege: la zona climática salta de golpe en cotas concretas.
  const limiteCercano = useMemo(
    () => limiteTramoCercano(dg.provincia, dg.altitud_m),
    [dg.provincia, dg.altitud_m],
  );

  // Derivados en vivo: se recalculan al cambiar provincia / altitud / plantas
  // / alturas por planta (feature-10).
  const derivados = useMemo(
    () =>
      derivarContexto({
        provincia: dg.provincia,
        altitud_m: dg.altitud_m,
        plantasSobreRasante: dg.plantasSobreRasante,
        alturasPlantas_m: dg.alturasPlantas_m,
      }),
    [dg.provincia, dg.altitud_m, dg.plantasSobreRasante, dg.alturasPlantas_m],
  );

  function onSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (errores.length > 0) return;
    // Alturas por planta: se persisten con las longitudes casadas con los
    // contadores (mientras se edita se toleran desfases para no perder valores
    // al bajar y volver a subir el nº de plantas; al JSON van limpias).
    const dgFinal: DatosGenerales =
      dg.alturasPlantas_m === undefined
        ? dg
        : {
            ...dg,
            alturasPlantas_m: reconciliarAlturas(
              dg.alturasPlantas_m,
              dg.plantasSobreRasante,
              dg.plantasBajoRasante,
            ),
          };
    const nowIso = new Date().toISOString();
    if (modo === "crear") {
      const p = crearProyecto(nombre.trim(), dgFinal, nowIso);
      setProyectoActivo(p.id);
      void navigate(`/p/${p.id}`);
    } else {
      // ctx no es null aquí (guard de arriba); el narrow no sobrevive al closure.
      const nombreLimpio = nombre.trim();
      if (nombreLimpio !== ctx!.proyecto.nombre) ctx!.renombrarProyecto(nombreLimpio, nowIso);
      ctx!.actualizarDatosGenerales(dgFinal, nowIso);
      void navigate("..");
    }
  }

  return (
    <div className="bg-bg-primary h-full min-h-0 overflow-y-auto">
      <form
        onSubmit={onSubmit}
        noValidate
        className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:gap-8"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-text-primary mb-1 text-lg font-semibold">
            {modo === "crear" ? "Nuevo proyecto" : "Datos generales"}
          </h1>
          <p className="text-text-disabled mb-4 text-[12px] leading-snug">
            Los datos generales del expediente se rellenan una vez y de ellos se deriva el contexto
            que heredan todas las justificaciones.
          </p>

          <CollapsibleSection label="Identificación">
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
              help="Se elige del listado oficial (INE) de la provincia. El código INE es lo que permite cruzar el municipio con las tablas que clasifican por municipio; escrito a mano no serviría."
            >
              <SelectorMunicipio
                provincia={dg.provincia}
                municipio={dg.municipio}
                onChange={(c) => {
                  setDg((prev) => ({
                    ...prev,
                    municipio: c.municipio,
                    municipioIne: c.municipioIne,
                  }));
                  // Solo hay altitud verificada para las capitales de provincia
                  // (`altitudCapital_m` del Anejo B). Y aun esa se OFRECE, no se
                  // escribe: el DB-HE pide la cota del emplazamiento.
                  const cap = altitudCapitalDe(dg.provincia);
                  setSugerencia(
                    cap !== null && clave(c.municipio) === clave(cap.capital)
                      ? { municipio: cap.capital, altitud_m: cap.altitud_m }
                      : null,
                  );
                }}
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
              <p className="text-text-secondary -mt-1 text-[11px] leading-snug">
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
              <p role="note" className="text-state-warn -mt-1 text-[11px] leading-snug">
                Ojo: {dg.altitud_m} m está muy cerca del límite de tramo de{" "}
                <span className="font-mono">{limiteCercano.limite_m} m</span> del Anejo B
                (por debajo {limiteCercano.zonaDebajo}, por encima {limiteCercano.zonaEncima}).
                Confirma la cota real del emplazamiento: unos metros cambian la zona
                climática y con ella la transmitancia límite exigida.
              </p>
            )}
          </CollapsibleSection>

          <CollapsibleSection label="Uso e intervención" refNorma="CTE Parte I art. 2">
            <Field id="dg-uso" label="Uso del edificio">
              <SelectInput<Uso>
                id="dg-uso"
                value={dg.uso}
                options={USO_OPTIONS}
                onChange={(v) => set("uso", v)}
              />
            </Field>
            <p className="text-text-disabled mb-1 text-[11px] leading-snug">
              Otros usos: fuera del alcance de Concreta.
            </p>
            <Field id="dg-intervencion" label="Tipo de intervención">
              <SelectInput<Intervencion>
                id="dg-intervencion"
                value={dg.intervencion}
                options={INTERVENCION_OPTIONS}
                onChange={(v) => set("intervencion", v)}
              />
            </Field>
          </CollapsibleSection>

          <CollapsibleSection label="Geometría">
            <Field
              id="dg-plantas-sobre"
              label="Plantas sobre rasante"
              help="De aquí se deriva la altura de evacuación, que discrimina exigencias de SI/SUA: 3 m/planta estimados, salvo que definas las alturas reales más abajo."
              warning={avisoDe(errores, "sobre rasante")}
            >
              <NumberInput
                id="dg-plantas-sobre"
                value={dg.plantasSobreRasante}
                min={1}
                max={30}
                onChange={(v) => set("plantasSobreRasante", v)}
              />
            </Field>
            <Field
              id="dg-plantas-bajo"
              label="Plantas bajo rasante"
              warning={avisoDe(errores, "bajo rasante")}
            >
              <NumberInput
                id="dg-plantas-bajo"
                value={dg.plantasBajoRasante}
                min={0}
                max={5}
                onChange={(v) => set("plantasBajoRasante", v)}
              />
            </Field>
            <EditorAlturasPlantas
              plantasSobre={dg.plantasSobreRasante}
              plantasBajo={dg.plantasBajoRasante}
              alturas={dg.alturasPlantas_m}
              onChange={(v) => set("alturasPlantas_m", v)}
              warning={avisoDe(errores, "alturas")}
            />
            <Field
              id="dg-cubierta"
              label="Tipo de cubierta"
              help="Geometría gruesa de la cubierta — discrimina exigencias de HS1/HS5/SUA."
            >
              <SelectInput<TipoCubierta>
                id="dg-cubierta"
                value={dg.tipoCubierta}
                options={CUBIERTA_OPTIONS}
                onChange={(v) => set("tipoCubierta", v)}
              />
            </Field>
          </CollapsibleSection>

          <CollapsibleSection label="Programa">
            <Field
              id="dg-viviendas"
              label="Número de viviendas"
              warning={avisoDe(errores, "viviendas")}
            >
              <NumberInput
                id="dg-viviendas"
                value={dg.numViviendas}
                min={1}
                onChange={(v) => set("numViviendas", v)}
              />
            </Field>
            <CheckRow
              id="dg-garaje"
              label="Garaje"
              help="Márcalo si hay garaje o zona de aparcamiento, AUNQUE sea privado de una unifamiliar. Describes el edificio, no la aplicabilidad: en unifamiliar SUA7 sigue saliendo «no aplica», pero por su ámbito real y no por «no hay garaje» — y ese párrafo se imprime tal cual en el anejo. Pendiente: la ventilación del garaje (HS3) todavía no se dimensiona aquí."
              refText="DB-SUA 7 ámbito · DB-HS3 Tabla 2.2"
              checked={dg.tieneGaraje}
              onChange={(v) => set("tieneGaraje", v)}
            />
            <CheckRow
              id="dg-trasteros"
              label="Trasteros"
              help="Márcalo si hay trastero como LOCAL independiente: en sótano, anexo al garaje o en zona común. Un armario o un cuarto dentro de la vivienda no cuenta — ese aire ya lo cubre la ventilación general de la vivienda. Pendiente: hoy solo consta en los datos del expediente; la ventilación de trasteros (0,7 l/s por m² útil) todavía no se dimensiona aquí."
              refText="DB-HS3 Tabla 2.2"
              checked={dg.tieneTrasteros}
              onChange={(v) => set("tieneTrasteros", v)}
            />
            <CheckRow
              id="dg-piscina"
              label="Piscina"
              help="Márcalo si hay piscina, sea de uso colectivo o privada de una unifamiliar. El ámbito de SUA6 se limita a las colectivas y deja fuera las de vivienda unifamiliar: esa distinción la hace el motor, y en unifamiliar redacta el «no aplica» por ese motivo. Sin marcar, el anejo afirmaría que no hay piscina."
              refText="DB-SUA 6, ámbito de aplicación"
              checked={dg.tienePiscina}
              onChange={(v) => set("tienePiscina", v)}
            />
            <CheckRow
              id="dg-local-pb"
              label="Local en planta baja"
              help="Márcalo si el edificio incluye un local comercial o de otro uso en planta baja, aunque se entregue en bruto. El edificio pasa a ser de uso mixto: las redes de HS4/HS5 dejan de ser solo de viviendas y cambian la compartimentación (SI) y las exigencias de ruido (HR). Pendiente: hoy solo consta en los datos del expediente; ninguna justificación lo consume todavía."
              checked={dg.tieneLocalPB}
              onChange={(v) => set("tieneLocalPB", v)}
            />
          </CollapsibleSection>

          <CollapsibleSection label="Emplazamiento normativo" refNorma="DB-HS6 Apéndice B">
            <Field
              id="dg-zona-radon"
              label="Zona de radón"
              help="Zona de radón del municipio. Es una ENTRADA MANUAL: la consulta el proyectista en el Apéndice B del DB-HS6 (no se embebe el listado de municipios)."
              refText="DB-HS6 Apéndice B"
            >
              <SelectInput<ZonaRadon>
                id="dg-zona-radon"
                value={dg.zonaRadon}
                options={ZONA_RADON_OPTIONS}
                onChange={(v) => set("zonaRadon", v)}
              />
            </Field>
            <p className="text-text-disabled mb-1 text-[11px] leading-snug">
              Apéndice B del DB-HS6 — consúltalo para tu municipio.
            </p>
          </CollapsibleSection>

          <CollapsibleSection label="Suministro" defaultOpen={false}>
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
          </CollapsibleSection>

          {/* Resumen de errores + submit */}
          <div className="border-border-sub mt-4 border-t pt-4">
            {errores.length > 0 && (
              <div role="alert" className="mb-3">
                <p className="text-state-warn text-[12px] font-semibold">
                  Revisa el formulario antes de continuar:
                </p>
                <ul className="text-state-warn mt-1 list-disc pl-5 text-[12px] leading-snug">
                  {errores.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="submit"
              disabled={errores.length > 0}
              className="bg-accent hover:bg-accent-hover focus-visible:ring-accent/40 w-full cursor-pointer rounded px-4 py-2 text-[13px] font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {modo === "crear" ? "Crear proyecto" : "Guardar cambios"}
            </button>
          </div>
        </div>

        {/* Panel de derivados en vivo */}
        <aside
          aria-label="Contexto derivado"
          className="border-border-main bg-bg-surface w-full shrink-0 rounded border px-4 py-3 lg:sticky lg:top-6 lg:w-64"
        >
          <h2 className="text-text-disabled border-border-sub mb-1 border-b pb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
            Contexto derivado
          </h2>
          {derivados === null ? (
            <p className="text-state-warn py-2 text-[12px] leading-snug">
              Selecciona una provincia válida para derivar la zona climática y la zona térmica.
            </p>
          ) : (
            <>
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
            </>
          )}
        </aside>
      </form>
    </div>
  );
}
