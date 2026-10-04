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
import { SelectorMunicipio } from "../components/proyecto/SelectorMunicipio";
import { PROVINCIAS, altitudCapitalDe, limiteTramoCercano } from "../data/zonasClimaticasHE";
import { derivarContexto } from "../lib/proyecto/derivar";
import { CASOS_EDIFICIO, edificioDeCaso, type CasoEdificio } from "../lib/edificio/casos";
import { ProyectoContext } from "../lib/proyecto/ProyectoContext";
import { crearProyecto, setProyectoActivo } from "../lib/proyecto/storage";
import type { DatosGenerales, Intervencion, ZonaRadon } from "../lib/proyecto/tipos";
import { intensidadDe } from "../modules/hs5/pluviales";
import { ISOYETAS, type Isoyeta, type ZonaPluviometrica } from "../modules/hs5/tablas";

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

/** "" = sin seleccionar (opción placeholder) + las 52 provincias del Anejo B. */
const PROVINCIA_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— Selecciona —" },
  ...PROVINCIAS.map((prov) => ({ value: prov, label: prov })),
];

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

  function set<K extends keyof DatosGenerales>(k: K, v: DatosGenerales[K]): void {
    setDg((prev) => ({ ...prev, [k]: v }));
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

  const errores = useMemo(() => validar(dg, nombre), [dg, nombre]);

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
      <form
        onSubmit={onSubmit}
        noValidate
        className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:gap-8"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-text-primary mb-1 text-lg font-semibold">
            {modo === "crear" ? "Nuevo proyecto" : "Datos de la obra"}
          </h1>
          <p className="text-text-disabled mb-4 text-[12px] leading-snug">
            Emplazamiento, intervención y suministro: se rellenan una vez y de ellos se deriva el
            contexto que heredan todas las justificaciones. El edificio se describe en su propia
            pantalla.
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
                        onChange={() => setCaso(c.key)}
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
            <Field id="dg-intervencion" label="Tipo de intervención">
              <SelectInput<Intervencion>
                id="dg-intervencion"
                value={dg.intervencion}
                options={INTERVENCION_OPTIONS}
                onChange={(v) => set("intervencion", v)}
              />
            </Field>
            <CheckRow
              id="dg-piscina"
              label="Piscina"
              help="Márcalo si hay piscina, sea de uso colectivo o privada de una unifamiliar. El ámbito de SUA6 se limita a las colectivas y deja fuera las de vivienda unifamiliar: esa distinción la hace el motor, y en unifamiliar redacta el «no aplica» por ese motivo. Sin marcar, el anejo afirmaría que no hay piscina."
              refText="DB-SUA 6, ámbito de aplicación"
              checked={dg.tienePiscina}
              onChange={(v) => set("tienePiscina", v)}
            />
          </CollapsibleSection>

          <CollapsibleSection label="Emplazamiento normativo" refNorma="DB-HS6 y DB-HS5, apéndices B">
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
            <Field
              id="dg-zona-pluviometrica"
              label="Zona pluviométrica"
              sub="(opcional)"
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
