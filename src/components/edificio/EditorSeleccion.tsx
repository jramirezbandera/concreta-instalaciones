import { useState, type JSX, type ReactNode } from "react";
import {
  cotasGrupo,
  formatoCota,
  grupoTocaTerreno,
  nombreGrupo,
} from "../../lib/edificio/derivar";
import {
  anadirTipo,
  anadirZona,
  buscarZona,
  editarTipo,
  eliminarGrupo,
  eliminarTipo,
  eliminarZona,
  puedeEliminarGrupo,
  separarGrupo,
  setAltura,
  setContador,
  setCubierta,
  setRepeticiones,
  setSuperficie,
  setUnidades,
  setUso,
} from "../../lib/edificio/editar";
import { deduccionesTipo, deduccionesZona, dondeEstaTipo, loUsanZona } from "../../lib/edificio/deducciones";
import type { Edificio, OrigenDocumento, TipoCubierta, UnidadTipo, UsoZona } from "../../lib/edificio/tipos";
import { ORDEN_USOS, USOS, type LoUsa } from "../../lib/edificio/usos";
import { BotonSec, CampoNumero, Fila, ParKV, PasoAPaso, Sub } from "./controles";
import { ETIQUETA_CUBIERTA, type Seleccion } from "./presentacion";

// =============================================================================
// Editor de lo seleccionado en la sección (feature-12, columna izquierda de la
// maqueta v4): un grupo de plantas, una zona, un tipo de lo que se repite o la
// cubierta. Cada cambio produce un edificio nuevo con las operaciones puras de
// `lib/edificio/editar` y sube por `onCambiar` (el provider lo persiste).
// =============================================================================

interface Props {
  edificio: Edificio;
  seleccion: Seleccion;
  onCambiar: (e: Edificio) => void;
  onSeleccionar: (s: Seleccion) => void;
}

const SELECT =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent h-[34px] rounded border px-2 text-[13px] focus:outline-none";

function Tarjeta(props: { k: string; titulo: string; children: ReactNode }): JSX.Element {
  return (
    <div className="border-border-main bg-bg-primary m-3.5 rounded border pb-1">
      <div className="text-text-disabled px-3.5 pt-3 text-[10px] font-semibold tracking-[0.09em] uppercase">
        {props.k}
      </div>
      <h2 className="text-text-primary px-3.5 pt-[3px] pb-3 text-[15px] leading-snug font-semibold">
        {props.titulo}
      </h2>
      {props.children}
    </div>
  );
}

function Acciones({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="border-border-sub flex flex-wrap gap-1.5 border-t px-3.5 py-3">{children}</div>
  );
}

const COLOR_TRATO: Record<LoUsa["trato"], string> = {
  si: "text-text-primary",
  otra: "text-accent",
  no: "text-text-disabled",
};

function LoUsan({ filas }: { filas: LoUsa[] }): JSX.Element {
  return (
    <ul>
      {filas.map((f) => (
        <li
          key={f.codigo + f.texto}
          className="border-border-sub grid grid-cols-[46px_minmax(0,1fr)] gap-2.5 border-t px-3.5 py-[7px] text-[12.5px] leading-[1.4]"
        >
          <b className="text-text-secondary pt-px font-mono text-[11px] font-semibold">{f.codigo}</b>
          <span className={COLOR_TRATO[f.trato]}>{f.texto}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * De dónde sale lo seleccionado cuando vino del cuadro de superficies
 * (feature-13): el documento, sus páginas y, desplegables, las filas que lo forman.
 */
function Procedencia({ origen }: { origen: OrigenDocumento }): JSX.Element {
  const paginas =
    origen.paginas.length === 0
      ? ""
      : `, ${origen.paginas.length === 1 ? "pág." : "págs."} ${origen.paginas.join(", ")}`;
  return (
    <>
      <Sub>De dónde sale</Sub>
      <div className="px-3.5 pb-3 text-[12px] leading-snug">
        <p className="text-text-secondary">
          Del cuadro «<span className="text-text-primary break-all">{origen.documento}</span>»{paginas}. Leído con
          IA y revisado por el proyectista.
        </p>
        {origen.filas.length > 0 && (
          <details className="mt-1.5">
            <summary className="text-accent hover:text-accent-hover cursor-pointer">
              {origen.filas.length === 1 ? "La fila del cuadro" : `Las ${origen.filas.length} filas del cuadro`}
            </summary>
            <ul className="text-text-secondary mt-1 flex flex-col gap-0.5 font-mono text-[11px]">
              {origen.filas.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </>
  );
}

/** Botón que pide una segunda pulsación antes de una acción que borra. */
function BotonConfirmar(props: { texto: string; confirmar: string; onConfirmado: () => void }): JSX.Element {
  const [armado, setArmado] = useState(false);
  return (
    <BotonSec
      peligro
      onBlur={() => setArmado(false)}
      onClick={() => {
        if (armado) props.onConfirmado();
        else setArmado(true);
      }}
    >
      {armado ? props.confirmar : props.texto}
    </BotonSec>
  );
}

// -----------------------------------------------------------------------------

export function EditorSeleccion(props: Props): JSX.Element {
  const { seleccion } = props;
  switch (seleccion.tipo) {
    case "grupo":
      return <EditorGrupo {...props} grupoId={seleccion.id} />;
    case "zona":
      return <EditorZona {...props} zonaId={seleccion.id} />;
    case "unidad":
      return <EditorUnidad {...props} tipoId={seleccion.id} />;
    case "cubierta":
      return <EditorCubierta {...props} />;
  }
}

function EditorGrupo(props: Props & { grupoId: string }): JSX.Element | null {
  const { edificio: e, grupoId, onCambiar, onSeleccionar } = props;
  const g = e.grupos.find((x) => x.id === grupoId);
  if (!g) return null;
  const n = Math.max(1, g.repeticiones);
  const nombre = nombreGrupo(g);
  const cotas = cotasGrupo(e, g.id);
  return (
    <Tarjeta k={n > 1 ? "Plantas iguales" : "Planta"} titulo={nombre.largo}>
      <Fila etiqueta="Plantas iguales" htmlFor="ed-rep">
        <PasoAPaso
          id="ed-rep"
          nombre="Plantas iguales"
          value={n}
          min={1}
          max={30}
          onChange={(v) => onCambiar(setRepeticiones(e, g.id, v))}
        />
      </Fila>
      <Fila etiqueta="Altura de cada planta" htmlFor="ed-alt">
        <PasoAPaso
          id="ed-alt"
          nombre="Altura de cada planta"
          value={g.altura_m}
          min={2}
          max={10}
          paso={0.1}
          decimales={2}
          unidad="m"
          onChange={(v) => onCambiar(setAltura(e, g.id, v))}
        />
      </Fila>
      {cotas && (
        <ParKV
          k="Cota del suelo"
          v={n > 1 ? `${formatoCota(cotas.baja)} a ${formatoCota(cotas.alta)}` : formatoCota(cotas.baja)}
        />
      )}
      <ParKV k="Toca el terreno" v={grupoTocaTerreno(e, g.id) ? "sí" : "no"} />
      <Sub>Zonas de {n > 1 ? "estas plantas" : "esta planta"}</Sub>
      <ul>
        {g.zonas.map((z) => (
          <li key={z.id}>
            <button
              type="button"
              onClick={() => onSeleccionar({ tipo: "zona", id: z.id })}
              className="border-border-sub hover:bg-bg-surface text-text-primary flex w-full justify-between gap-2.5 border-t px-3.5 py-2 text-left text-[12.5px]"
            >
              <span>{USOS[z.uso].etiqueta}</span>
              <em className="text-text-secondary font-mono text-[11.5px] not-italic">
                {Math.round(z.superficieUtil_m2)} m²
              </em>
            </button>
          </li>
        ))}
      </ul>
      <Acciones>
        <BotonSec
          onClick={() => {
            const r = anadirZona(e, g.id);
            onCambiar(r.edificio);
            onSeleccionar({ tipo: "zona", id: r.zonaId });
          }}
        >
          + Añadir zona
        </BotonSec>
        {n > 1 && (
          <BotonSec onClick={() => onCambiar(separarGrupo(e, g.id))}>Separar en plantas sueltas</BotonSec>
        )}
        {puedeEliminarGrupo(e, g.id) && (
          <BotonConfirmar
            texto={n > 1 ? "Eliminar plantas" : "Eliminar planta"}
            confirmar="¿Eliminar? Pulsa otra vez"
            onConfirmado={() => {
              onCambiar(eliminarGrupo(e, g.id));
              onSeleccionar({ tipo: "cubierta" });
            }}
          />
        )}
      </Acciones>
    </Tarjeta>
  );
}

function EditorZona(props: Props & { zonaId: string }): JSX.Element | null {
  const { edificio: e, zonaId, onCambiar, onSeleccionar } = props;
  const hallada = buscarZona(e, zonaId);
  if (!hallada) return null;
  const { grupo, zona } = hallada;
  const def = USOS[zona.uso];
  const n = Math.max(1, grupo.repeticiones);
  const claseUnidad = def.unidades;
  const tipos = claseUnidad ? e.unidades.filter((u) => u.clase === claseUnidad) : [];
  const contador = def.contador;

  return (
    <Tarjeta k={`Zona · ${nombreGrupo(grupo).largo}`} titulo={def.etiqueta}>
      <Fila etiqueta="Uso" htmlFor="ed-uso" columna>
        <select
          id="ed-uso"
          value={zona.uso}
          onChange={(ev) => onCambiar(setUso(e, zona.id, ev.target.value as UsoZona))}
          className={SELECT}
        >
          {ORDEN_USOS.map((u) => (
            <option key={u} value={u}>
              {USOS[u].etiqueta}
            </option>
          ))}
        </select>
      </Fila>

      {claseUnidad && (
        <Sub>{claseUnidad === "vivienda" ? "Viviendas" : "Núcleos de aseos"} en {n > 1 ? "cada planta" : "la planta"}</Sub>
      )}
      {claseUnidad &&
        tipos.map((t) => {
          const cantidad = zona.unidades?.find((u) => u.tipoId === t.id)?.cantidad ?? 0;
          const nombre =
            t.clase === "vivienda" ? `Tipo ${t.nombre} · T${t.dormitorios}` : `Núcleo ${t.nombre}`;
          return (
            <Fila key={t.id} htmlFor={`ed-u-${t.id}`} etiqueta={nombre}>
              <PasoAPaso
                id={`ed-u-${t.id}`}
                nombre={nombre}
                value={cantidad}
                min={0}
                max={40}
                onChange={(v) => onCambiar(setUnidades(e, zona.id, t.id, v))}
              />
            </Fila>
          );
        })}
      {claseUnidad && (
        <div className="px-3.5 pt-1 pb-2">
          <button
            type="button"
            onClick={() => {
              const r = anadirTipo(e, claseUnidad);
              onCambiar(setUnidades(r.edificio, zona.id, r.tipoId, 1));
              onSeleccionar({ tipo: "unidad", id: r.tipoId });
            }}
            className="text-accent hover:text-accent-hover text-[12px]"
          >
            {claseUnidad === "vivienda" ? "+ Nuevo tipo de vivienda" : "+ Nuevo núcleo de aseos"}
          </button>
        </div>
      )}

      {contador && (
        <Fila etiqueta={contador.etiqueta} htmlFor="ed-cnt">
          <PasoAPaso
            id="ed-cnt"
            nombre={contador.etiqueta}
            value={zona[contador.campo] ?? 0}
            min={contador.min}
            max={contador.max}
            onChange={(v) => onCambiar(setContador(e, zona.id, contador.campo, v))}
          />
        </Fila>
      )}

      <Fila
        htmlFor="ed-sup"
        etiqueta={n > 1 ? "Superficie útil de la zona, en cada planta" : "Superficie útil de la zona"}
      >
        <CampoNumero
          id="ed-sup"
          value={zona.superficieUtil_m2}
          unidad="m²"
          onChange={(v) => onCambiar(setSuperficie(e, zona.id, v))}
        />
      </Fila>

      <Sub>Lo que se deduce</Sub>
      {deduccionesZona(e, zona.id).map((d) => (
        <ParKV key={d.etiqueta} k={d.etiqueta} v={d.valor} title={d.cita} />
      ))}

      <Sub>Lo usan</Sub>
      <LoUsan filas={loUsanZona(e, zona.id)} />

      {zona.origen && <Procedencia origen={zona.origen} />}

      {grupo.zonas.length > 1 && (
        <Acciones>
          <BotonConfirmar
            texto="Eliminar zona"
            confirmar="¿Eliminar? Pulsa otra vez"
            onConfirmado={() => {
              onCambiar(eliminarZona(e, zona.id));
              onSeleccionar({ tipo: "grupo", id: grupo.id });
            }}
          />
        </Acciones>
      )}
    </Tarjeta>
  );
}

function tituloTipo(t: UnidadTipo): string {
  return t.clase === "vivienda" ? `Tipo ${t.nombre} · T${t.dormitorios}` : `Núcleo ${t.nombre} · aseos de planta`;
}

function EditorUnidad(props: Props & { tipoId: string }): JSX.Element | null {
  const { edificio: e, tipoId, onCambiar, onSeleccionar } = props;
  const t = e.unidades.find((u) => u.id === tipoId);
  if (!t) return null;
  const donde = dondeEstaTipo(e, t);
  const paso = (etiqueta: string, campo: string, valor: number, min: number, max: number) => (
    <Fila key={campo} etiqueta={etiqueta} htmlFor={`ed-t-${campo}`}>
      <PasoAPaso
        id={`ed-t-${campo}`}
        nombre={etiqueta}
        value={valor}
        min={min}
        max={max}
        onChange={(v) => onCambiar(editarTipo(e, t.id, { [campo]: v }))}
      />
    </Fila>
  );
  return (
    <Tarjeta k={t.clase === "vivienda" ? "Vivienda tipo" : "Núcleo de aseos"} titulo={tituloTipo(t)}>
      <Fila etiqueta="Nombre" htmlFor="ed-t-nombre">
        <input
          key={t.nombre}
          id="ed-t-nombre"
          type="text"
          defaultValue={t.nombre}
          maxLength={12}
          onBlur={(ev) => {
            const v = ev.currentTarget.value.trim();
            if (v !== "" && v !== t.nombre) onCambiar(editarTipo(e, t.id, { nombre: v }));
            else ev.currentTarget.value = t.nombre;
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") ev.currentTarget.blur();
          }}
          className="border-border-main bg-bg-primary text-text-primary focus:border-accent h-8 w-[120px] rounded border px-2 text-right font-mono text-[13px] focus:outline-none"
        />
      </Fila>
      {t.clase === "vivienda"
        ? [
            paso("Dormitorios", "dormitorios", t.dormitorios, 0, 8),
            paso("Baños", "banos", t.banos, 1, 5),
            paso("Aseos", "aseos", t.aseos, 0, 4),
          ]
        : [paso("Inodoros", "inodoros", t.inodoros, 1, 20), paso("Lavabos", "lavabos", t.lavabos, 1, 20)]}
      <Fila etiqueta="Superficie útil" htmlFor="ed-t-sup">
        <CampoNumero
          id="ed-t-sup"
          value={t.superficieUtil_m2}
          unidad="m²"
          onChange={(v) => onCambiar(editarTipo(e, t.id, { superficieUtil_m2: v }))}
        />
      </Fila>
      {t.clase === "vivienda" && (
        <p className="text-text-disabled px-3.5 pb-1 text-[11px] leading-snug">
          La cocina y el salón van siempre, uno por vivienda.
        </p>
      )}

      <Sub>Lo que se deduce</Sub>
      {deduccionesTipo(t).map((d) => (
        <ParKV key={d.etiqueta} k={d.etiqueta} v={d.valor} title={d.cita} />
      ))}

      <Sub>Dónde está</Sub>
      <ParKV k={donde.donde} v={donde.cuantas} />

      {t.origen && <Procedencia origen={t.origen} />}

      <Acciones>
        <BotonConfirmar
          texto="Eliminar tipo"
          confirmar={donde.donde === "sin usar" ? "¿Eliminar? Pulsa otra vez" : "Se quita de sus zonas. ¿Seguro?"}
          onConfirmado={() => {
            onCambiar(eliminarTipo(e, t.id));
            onSeleccionar({ tipo: "cubierta" });
          }}
        />
      </Acciones>
    </Tarjeta>
  );
}

const CUBIERTAS: TipoCubierta[] = ["plana_no_transitable", "plana_transitable", "inclinada"];

function EditorCubierta(props: Props): JSX.Element {
  const { edificio: e, onCambiar } = props;
  return (
    <Tarjeta k="Cubierta" titulo={ETIQUETA_CUBIERTA[e.cubierta.tipo]}>
      <Fila etiqueta="Tipo" htmlFor="ed-cub" columna>
        <select
          id="ed-cub"
          value={e.cubierta.tipo}
          onChange={(ev) => onCambiar(setCubierta(e, { tipo: ev.target.value as TipoCubierta }))}
          className={SELECT}
        >
          {CUBIERTAS.map((c) => (
            <option key={c} value={c}>
              {ETIQUETA_CUBIERTA[c]}
            </option>
          ))}
        </select>
      </Fila>
      <Fila etiqueta="Superficie en planta" htmlFor="ed-cub-sup">
        <CampoNumero
          id="ed-cub-sup"
          value={e.cubierta.superficie_m2}
          unidad="m²"
          onChange={(v) => onCambiar(setCubierta(e, { superficie_m2: v }))}
        />
      </Fila>
      <Sub>Lo usan</Sub>
      <LoUsan
        filas={[
          { codigo: "HS5", texto: "recogida de pluviales", trato: "si" },
          { codigo: "HE1", texto: "cerramiento de cubierta", trato: "si" },
          { codigo: "HS3", texto: "salida de los conductos de extracción", trato: "si" },
          { codigo: "HS1", texto: "impermeabilización", trato: "si" },
          ...(e.cubierta.tipo === "plana_transitable"
            ? [{ codigo: "SUA", texto: "barandillas y desniveles", trato: "si" as const }]
            : []),
        ]}
      />
    </Tarjeta>
  );
}
