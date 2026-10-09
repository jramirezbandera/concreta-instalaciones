// =============================================================================
// AsistenteAlcance — feature-27, paso 3 (UX-RECONCEPT §5). Las preguntas
// cerradas de una obra en un edificio existente, bajo «Tipo de intervención» en
// Los datos de la obra. Solo pregunta lo que El edificio no sabe: lo ampliado y
// lo que cambia de uso salen de la marca de cada zona. Debajo, la propuesta que
// sale de las respuestas. Lo no respondido se queda en lo más prudente.
// Verificación: research/verificacion-reformas.md, bloque E.
// =============================================================================

import { useMemo, type JSX } from "react";
import { Field, InputLabel, SelectInput } from "../ui/InputLabel";
import { justificacionRegistry } from "../../data/justificacionRegistry";
import { alcanceDeEdificio, tiposDeObra } from "../../lib/proyecto/alcance";
import { aplicabilidadBase, atributosDe } from "../../lib/proyecto/aplicabilidad";
import type { Edificio } from "../../lib/edificio/tipos";
import type { He4Estado } from "../../modules/he4/estado";
import type {
  Alcance,
  Aplicabilidad,
  DatosGenerales,
  ElementoEnvolvente,
  ElementoInterior,
  JustificacionKey,
  Proyecto,
  TipoObraExistente,
} from "../../lib/proyecto/tipos";

const TIPOS: { value: TipoObraExistente; label: string }[] = [
  { value: "reforma", label: "Reforma" },
  { value: "ampliacion", label: "Ampliación" },
  { value: "cambio_uso", label: "Cambio de uso" },
];

const ENVOLVENTE: { value: ElementoEnvolvente; label: string }[] = [
  { value: "fachadas", label: "Fachadas" },
  { value: "huecos", label: "Ventanas y huecos" },
  { value: "cubiertas", label: "Cubiertas" },
  { value: "terreno", label: "Suelos o muros contra el terreno" },
  { value: "medianerias", label: "Medianerías" },
  { value: "particiones", label: "Particiones interiores" },
];

const INTERIOR: { value: ElementoInterior; label: string }[] = [
  { value: "distribucion", label: "Distribución u ocupación" },
  { value: "evacuacion", label: "Puertas, pasillos o escaleras de evacuación" },
  { value: "compartimentacion", label: "Compartimentación o locales de riesgo" },
  { value: "revestimientos", label: "Revestimientos o falsos techos" },
  { value: "instalaciones_pci", label: "Instalaciones contra incendios o sus soportes" },
  { value: "suelos_escaleras", label: "Suelos, barandillas, escaleras o rampas" },
  { value: "vidrios_puertas", label: "Vidrios o puertas" },
  { value: "aseos", label: "Aseos" },
  { value: "alumbrado", label: "Alumbrado de zonas de circulación" },
  { value: "accesibilidad", label: "Itinerarios o elementos de accesibilidad" },
];

/** Sí / No / sin responder, en un select (como «— No indicada —» del resto del formulario). */
type Tri = "" | "si" | "no";
const SI_NO: { value: Tri; label: string }[] = [
  { value: "", label: "Sin responder" },
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
];
const tri = (v: boolean | undefined): Tri => (v === undefined ? "" : v ? "si" : "no");
const deTri = (v: Tri): boolean | undefined => (v === "" ? undefined : v === "si");

const GENERACION: { value: "" | NonNullable<Alcance["generacionTermica"]>; label: string }[] = [
  { value: "", label: "Sin responder" },
  { value: "no", label: "No" },
  { value: "general", label: "La general" },
  { value: "parcial", label: "Solo en parte" },
];

const APARATOS: { value: "" | NonNullable<Alcance["aparatos"]>; label: string }[] = [
  { value: "", label: "Sin responder" },
  { value: "no", label: "No se actúa" },
  { value: "sin_aumento", label: "No añade" },
  { value: "aumentan", label: "Más aparatos" },
  { value: "nueva", label: "Toda nueva" },
];

const ELECTRICA: { value: "" | NonNullable<Alcance["electrica"]>; label: string }[] = [
  { value: "", label: "Sin responder" },
  { value: "no", label: "No se actúa" },
  { value: "modifica", label: "Se modifica" },
  { value: "nueva", label: "Toda nueva" },
];

const CAMBIO_USO: { value: Tri; label: string }[] = [
  { value: "", label: "Sin responder" },
  { value: "si", label: "Todo el edificio" },
  { value: "no", label: "Una parte" },
];

const GRUPO: { valor: Aplicabilidad[]; etiqueta: string; clase: string }[] = [
  { valor: ["aplica"], etiqueta: "Aplican", clase: "text-text-primary" },
  { valor: ["aplica_reformado", "aplica_flexibilidad"], etiqueta: "A lo intervenido", clase: "text-accent" },
  { valor: ["externo"], etiqueta: "Fuera de la app", clase: "text-text-secondary" },
  { valor: ["no_aplica"], etiqueta: "No aplican", clase: "text-text-disabled" },
];

/**
 * Lista de casillas con «nada» (lista vacía) y sin responder (undefined): así se
 * distingue «no se toca nada» de «aún no lo he dicho».
 */
function Casillas<T extends string>(props: {
  id: string;
  legend: string;
  ninguno: string;
  opciones: { value: T; label: string }[];
  valor: T[] | undefined;
  onChange: (v: T[] | undefined) => void;
}): JSX.Element {
  const { id, legend, ninguno, opciones, valor, onChange } = props;
  const marcar = (v: T, on: boolean): void => {
    const actual = valor ?? [];
    const sig = on ? [...actual, v] : actual.filter((x) => x !== v);
    onChange(sig.length === 0 ? undefined : sig);
  };
  const cls = "flex cursor-pointer items-center gap-2 py-0.5 text-[12.5px] text-text-secondary";
  return (
    <fieldset className="mt-2.5">
      <legend className="text-text-secondary mb-1 text-[12px]">{legend}</legend>
      <label className={cls}>
        <input
          id={`${id}-ninguno`}
          type="checkbox"
          checked={valor !== undefined && valor.length === 0}
          onChange={(e) => onChange(e.target.checked ? [] : undefined)}
          className="accent-accent"
        />
        {ninguno}
      </label>
      <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
        {opciones.map((o) => (
          <label key={o.value} className={cls}>
            <input
              id={`${id}-${o.value}`}
              type="checkbox"
              checked={valor?.includes(o.value) ?? false}
              onChange={(e) => marcar(o.value, e.target.checked)}
              className="accent-accent"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Nota({ children }: { children: string }): JSX.Element {
  return <p className="text-text-disabled mt-1 mb-1 text-[11px] leading-snug">{children}</p>;
}

const m2 = (v: number): string => `${Math.round(v).toLocaleString("es-ES")} m²`;

export function AsistenteAlcance(props: {
  dg: DatosGenerales;
  edificio: Edificio;
  justificaciones?: Proyecto["justificaciones"];
  onChange: (alcance: Alcance) => void;
}): JSX.Element {
  const { dg, edificio, justificaciones, onChange } = props;
  const a: Alcance = dg.alcance ?? {};
  const tipos = tiposDeObra(dg);
  const set = <K extends keyof Alcance>(k: K, v: Alcance[K]): void => onChange({ ...a, [k]: v });

  const he4 = justificaciones?.he4?.inputs as Partial<He4Estado> | undefined;
  const ed = useMemo(() => alcanceDeEdificio(dg, edificio, he4), [dg, edificio, he4]);
  const propuesta = useMemo(
    () => (dg.alcance ? aplicabilidadBase(atributosDe(dg, edificio, he4, justificaciones)) : null),
    [dg, edificio, he4, justificaciones],
  );
  const tieneGaraje = edificio.grupos.some((g) => g.zonas.some((z) => z.uso === "garaje" || z.uso === "garaje_privado"));

  function marcarTipo(t: TipoObraExistente, on: boolean): void {
    const sig = on ? [...tipos, t] : tipos.filter((x) => x !== t);
    if (sig.length === 0) return;
    set("tipos", sig);
  }

  const mantenimiento = a.soloMantenimiento === true;
  const reforma = tipos.includes("reforma");
  const ampliacion = tipos.includes("ampliacion");
  const cambioUso = tipos.includes("cambio_uso");
  const toca = (lista: unknown[] | undefined): boolean => lista === undefined || lista.length > 0;

  return (
    <div className="border-border-sub mt-3 border-t pt-3" aria-label="Asistente de alcance">
      <h3 className="text-text-primary text-[13px] font-semibold">Alcance de la obra</h3>
      <Nota>
        Lo que se pregunta aquí decide qué justificaciones aplican, a qué parte y con qué párrafo. Lo que se amplía y lo
        que cambia de uso se marca en El edificio, zona a zona. Lo que no se responda se queda en lo más prudente.
      </Nota>

      <fieldset className="mt-2">
        <legend className="text-text-secondary mb-1 text-[12px]">Qué obra es (puede ser más de una)</legend>
        <div className="flex flex-wrap gap-x-4">
          {TIPOS.map((t) => (
            <label key={t.value} className="text-text-secondary flex cursor-pointer items-center gap-2 py-0.5 text-[12.5px]">
              <input
                id={`al-tipo-${t.value}`}
                type="checkbox"
                checked={tipos.includes(t.value)}
                disabled={mantenimiento || (tipos.length === 1 && tipos[0] === t.value)}
                onChange={(e) => marcarTipo(t.value, e.target.checked)}
                className="accent-accent"
              />
              {t.label}
            </label>
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <InputLabel
            htmlFor="al-mantenimiento"
            label="Solo mantenimiento o reparaciones puntuales"
            help="Trabajos periódicos para prevenir el deterioro o reparaciones puntuales, sin reforma, ampliación ni cambio de uso. No es una intervención: no se aplica el CTE."
            refText="CTE Parte I, Anejo III"
          />
          <input
            id="al-mantenimiento"
            type="checkbox"
            checked={mantenimiento}
            onChange={(e) => set("soloMantenimiento", e.target.checked || undefined)}
            className="accent-accent h-4 w-4 shrink-0 cursor-pointer"
          />
        </div>
      </fieldset>

      {!mantenimiento && (
        <>
          <Field
            id="al-integral"
            label="Rehabilitación integral"
            help="Se modifican sustancialmente y a la vez las particiones, los forjados y la envolvente. Ninguna norma la define: es la definición de la Guía de aplicación del DB-HR, que no es reglamentaria. Decide HR, HE 4 y HE 5."
            refText="DB-HR Introducción II d; DB-HE 4 y HE 5, ámbito"
          >
            <SelectInput<Tri> id="al-integral" value={tri(a.integral)} options={SI_NO} onChange={(v) => set("integral", deTri(v))} />
          </Field>

          {cambioUso && (
            <>
              <Field
                id="al-caracteristico"
                label="Qué cambia de uso"
                help="En un cambio del uso característico del edificio se cumplen todas las exigencias básicas; si es solo una parte, en los términos de cada DB."
                refText="CTE Parte I, art. 2 (cambio de uso)"
              >
                <SelectInput<Tri>
                  id="al-caracteristico"
                  value={tri(a.cambioUsoCaracteristico)}
                  options={CAMBIO_USO}
                  onChange={(v) => set("cambioUsoCaracteristico", deTri(v))}
                />
              </Field>
              <Nota>
                {ed.cambiosUso.length > 0
                  ? `Según El edificio cambian de uso ${m2(ed.utilCambioUso_m2)} útiles${ed.pasaAVivienda ? ", que pasan a vivienda" : ""}.`
                  : "Marca en El edificio las zonas que cambian de uso y el uso que tenían."}
              </Nota>
            </>
          )}

          {ampliacion && (
            <>
              <Nota>
                {ed.ampliada.util_m2 > 0
                  ? `Según El edificio se amplían ${m2(ed.ampliada.util_m2)} útiles (${m2(ed.ampliada.construida_m2)} construidos).`
                  : "Marca en El edificio las zonas nuevas de la ampliación."}
              </Nota>
              <Field
                id="al-mas10"
                label="Crece más del 10 %"
                help="La superficie o el volumen construido de la vivienda o las unidades de uso sobre las que se interviene, no del edificio entero. Decide el coeficiente K, HE 0 y HE 6."
                refText="DB-HE 0 ap. 1; DB-HE 1 tablas 3.1.1.b/c"
              >
                <SelectInput<Tri> id="al-mas10" value={tri(a.ampliacionMas10)} options={SI_NO} onChange={(v) => set("ampliacionMas10", deTri(v))} />
              </Field>
              <Field
                id="al-altura"
                label="Cambia la altura de evacuación"
                help="Si se añaden plantas o cambia la cota de la planta más alta. Decide SI 3 y SI 5."
                refText="DB-SI, Introducción III"
              >
                <SelectInput<Tri>
                  id="al-altura"
                  value={tri(a.ampliacionCambiaAltura)}
                  options={SI_NO}
                  onChange={(v) => set("ampliacionCambiaAltura", deTri(v))}
                />
              </Field>
            </>
          )}

          {(reforma || cambioUso) && (
            <Casillas
              id="al-env"
              legend="¿Qué se sustituye, añade o modifica de la envolvente?"
              ninguno="Nada de la envolvente ni de las particiones"
              opciones={ENVOLVENTE}
              valor={a.envolvente}
              onChange={(v) => set("envolvente", v)}
            />
          )}
          {(reforma || cambioUso) && toca(a.envolvente) && (
            <>
              <Field
                id="al-25"
                label="Más del 25 % de la envolvente"
                help="Se renueva más del 25 % de la superficie total de la envolvente térmica final del edificio: fachadas, cubiertas, medianerías y suelos y muros contra el terreno. Decide K, el control solar, HE 0 y HE 6."
                refText="DB-HE 1 tabla 3.1.1.b; DB-HE 0 ap. 1"
              >
                <SelectInput<Tri> id="al-25" value={tri(a.envolventeMas25)} options={SI_NO} onChange={(v) => set("envolventeMas25", deTri(v))} />
              </Field>
              <Field
                id="al-acondicionado"
                label="Algo pasa a acondicionado"
                help="Algún espacio pasa a estar acondicionado o algún elemento pasa a ser envolvente: un trastero que se incorpora a la vivienda, una terraza que se cierra."
                refText="DB-HE 1 ap. 3.1.1 pto 2 b"
              >
                <SelectInput<Tri>
                  id="al-acondicionado"
                  value={tri(a.pasaAcondicionado)}
                  options={SI_NO}
                  onChange={(v) => set("pasaAcondicionado", deTri(v))}
                />
              </Field>
            </>
          )}

          {reforma && (
            <Casillas
              id="al-int"
              legend="¿Qué se modifica en el interior?"
              ninguno="Nada de esto"
              opciones={INTERIOR}
              valor={a.interior}
              onChange={(v) => set("interior", v)}
            />
          )}

          <Field
            id="al-generacion"
            label="Generación térmica nueva"
            help="Se renueva el generador de calefacción o de ACS. Cambiar solo el quemador no cuenta; en una instalación individual, cambiarlo en algunas viviendas es «solo en parte»."
            refText="DB-HE 4 ap. 1 pto 1 b; DB-HE 0 ap. 1"
          >
            <SelectInput id="al-generacion" value={a.generacionTermica ?? ""} options={GENERACION} onChange={(v) => set("generacionTermica", v === "" ? undefined : v)} />
          </Field>
          <Field
            id="al-aparatos"
            label="Fontanería y saneamiento"
            help="Aparatos de agua. HS 4 y HS 5 solo entran si aumentan el número o la capacidad de los aparatos. Una instalación nueva completa se propone a lo intervenido."
            refText="DB-HS 4 y HS 5, ap. 1.1"
          >
            <SelectInput id="al-aparatos" value={a.aparatos ?? ""} options={APARATOS} onChange={(v) => set("aparatos", v === "" ? undefined : v)} />
          </Field>
          <Field id="al-pluviales" label="Cubiertas o pluviales" help="Se modifican cubiertas o la red de pluviales." refText="DB-HS 5, ap. 1.1">
            <SelectInput<Tri> id="al-pluviales" value={tri(a.pluviales)} options={SI_NO} onChange={(v) => set("pluviales", deTri(v))} />
          </Field>
          <Field id="al-electrica" label="Instalación eléctrica" refText="REBT, art. 2.2">
            <SelectInput id="al-electrica" value={a.electrica ?? ""} options={ELECTRICA} onChange={(v) => set("electrica", v === "" ? undefined : v)} />
          </Field>
          <Field
            id="al-estructura"
            label="Se toca la estructura"
            help="El proyecto debe decirlo. Si no, se entiende que la obra no implica riesgo de daño estructural y DB-SE no aplica."
            refText="CTE Parte I, art. 2.4"
          >
            <SelectInput<Tri> id="al-estructura" value={tri(a.estructura)} options={SI_NO} onChange={(v) => set("estructura", deTri(v))} />
          </Field>

          {tieneGaraje && (
            <>
              <Field id="al-aparcamiento" label="Obra en el aparcamiento" help="Se interviene en el aparcamiento o en sus vías de circulación." refText="DB-HE 6 ap. 1; DB-SUA 7">
                <SelectInput<Tri> id="al-aparcamiento" value={tri(a.aparcamiento)} options={SI_NO} onChange={(v) => set("aparcamiento", deTri(v))} />
              </Field>
              <Field
                id="al-electrica50"
                label="Más del 50 % de la potencia"
                help="La obra eléctrica afecta a más del 50 % de la potencia instalada del edificio (con el aparcamiento en el interior y derecho del promotor a actuar en él) o de la del aparcamiento."
                refText="DB-HE 6 ap. 1 pto 1 b"
              >
                <SelectInput<Tri> id="al-electrica50" value={tri(a.electrica50)} options={SI_NO} onChange={(v) => set("electrica50", deTri(v))} />
              </Field>
            </>
          )}

          <div className="mt-2 flex items-center justify-between gap-3">
            <InputLabel
              htmlFor="al-protegido"
              label="Edificio protegido oficialmente"
              help="Catalogado, BIC o en un entorno declarado. Habilita la flexibilidad y las exclusiones por protección; los elementos inalterables los fija la autoridad que dicta la protección."
              refText="CTE Parte I, art. 2.3"
            />
            <input
              id="al-protegido"
              type="checkbox"
              checked={a.protegido === true}
              onChange={(e) => set("protegido", e.target.checked || undefined)}
              className="accent-accent h-4 w-4 shrink-0 cursor-pointer"
            />
          </div>
        </>
      )}

      <Propuesta propuesta={propuesta} />
    </div>
  );
}

function Propuesta({ propuesta }: { propuesta: ReturnType<typeof aplicabilidadBase> | null }): JSX.Element {
  if (!propuesta) {
    return (
      <p className="text-text-secondary bg-bg-surface mt-3 rounded px-2.5 py-2 text-[12px] leading-snug">
        Sin responder nada, todas las justificaciones quedan con el alcance pendiente.
      </p>
    );
  }
  const entradas = justificacionRegistry.filter((j) => !j.dev);
  return (
    <section aria-label="Lo que se propone" className="bg-bg-surface mt-3 rounded px-2.5 py-2">
      <h4 className="text-text-primary mb-1 text-[12px] font-semibold">Lo que se propone</h4>
      {GRUPO.map((g) => {
        const codigos = entradas
          .filter((j) => g.valor.includes(propuesta[j.key as JustificacionKey].aplicabilidad))
          .map((j) => j.codigo);
        if (codigos.length === 0) return null;
        return (
          <p key={g.etiqueta} className="text-[12px] leading-relaxed">
            <span className={`${g.clase} font-medium`}>{`${g.etiqueta} (${codigos.length}): `}</span>
            <span className="text-text-secondary">{codigos.join(" · ")}</span>
          </p>
        );
      })}
      <p className="text-text-disabled mt-1 text-[11px] leading-snug">
        Es una propuesta con cita: en La obra se puede cambiar cualquiera, con nota.
      </p>
    </section>
  );
}
