// DB-SUA, SUA 9 — Pantalla de la accesibilidad (feature-20). La pantalla es la
// común (`PantallaSi`); aquí van las decisiones que El edificio no describe: si
// la unifamiliar debe ser accesible, cómo se llega a la entrada, las viviendas
// accesibles, el ascensor (que se escribe en El edificio), su cabina, la anchura
// de los pasillos, la cubierta transitable y, en oficinas, la atención al
// público y el aseo de la oficina pequeña. Números de decisión FIJOS.

import type { JSX } from "react";
import { CampoNumero } from "../../components/edificio/controles";
import { Decision, DecisionValor, Paso } from "../../components/justificacion/Decision";
import { fmt } from "../../lib/units/format";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { cambiarAscensor } from "../sua/editar";
import { sua9 } from "./definicion";
import { HABITUALES_SUA9, type AccesoEntrada, type AseoPequeno, type DebeSerAccesible, type DecisionesSua9, type SiNo, type Sua9Estado, type UsoCubierta } from "./estado";
import type { DetalleSua9, JustificacionSua9 } from "./justificacion";
import { ASEO_CENTRO_PEQUENO, CABINA_CORREGIDA, ITINERARIO_ACCESIBLE, type PuertasCabina } from "./tablas";
import { m, textoCabinas, textoMotivos } from "./textos";

function DecisionesSua9({ setField, j, edificio, cambiarEdificio }: PropsDecisionesSi<Sua9Estado, JustificacionSua9>): JSX.Element {
  const d = j.decisiones;
  const h = HABITUALES_SUA9;
  const elegir = <K extends keyof DecisionesSua9>(k: K, v: DecisionesSua9[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Sua9Estado[K]);
  };
  const cabecera = <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>;

  if (j.unifamiliar) {
    return (
      <section aria-label="Decisiones" className="flex flex-col">
        {cabecera}
        <Decision<DebeSerAccesible>
          numero={1}
          pregunta="¿La vivienda debe ser accesible?"
          opciones={[
            { valor: "no", label: "No" },
            { valor: "silla", label: "Silla de ruedas" },
            { valor: "auditiva", label: "Auditiva" },
          ]}
          valor={d.unifamiliar}
          habitual={h.unifamiliar}
          onChange={(v) => elegir("unifamiliar", v)}
          texto={
            d.unifamiliar === "no"
              ? "Solo si lo exige la reglamentación aplicable (una promoción pública o protegida con reserva). Si no, SUA 9 no es exigible dentro de la vivienda ni en su parcela."
              : "La reglamentación aplicable lo exige: la vivienda cumple la definición de vivienda accesible del Anejo A."
          }
        />
      </section>
    );
  }

  const asc = j.elementos.find((e) => e.detalle.clase === "ascensor")?.detalle as Extract<DetalleSua9, { clase: "ascensor" }> | undefined;
  const cab = j.elementos.find((e) => e.detalle.clase === "cabina")?.detalle as Extract<DetalleSua9, { clase: "cabina" }> | undefined;
  const hay = j.ascensor?.hay ?? false;
  const exigido = j.ascensor?.exigido ?? false;
  const pequena = j.oficinas && j.utilOficinas_m2 <= ASEO_CENTRO_PEQUENO.datos.utilPrivadaMax_m2;
  const nPasillo = hay ? 5 : 4;
  const nCubierta = nPasillo + 1;
  const nAtencion = nCubierta + (j.cubiertaTransitable ? 1 : 0);
  const nAseo = nAtencion + (j.residencial && j.oficinas ? 1 : 0);
  const pasillo = j.pasillo;

  const atencion = (numero: number) => (
    <Decision<SiNo>
      numero={numero}
      pregunta="Atención al público"
      opciones={[
        { valor: "no", label: "No" },
        { valor: "si", label: "Con mostrador fijo" },
      ]}
      valor={d.atencionPublico}
      habitual={h.atencionPublico}
      onChange={(v) => elegir("atencionPublico", v)}
      texto={
        d.atencionPublico === "si"
          ? "El mostrador tiene un punto de atención accesible (o un punto de llamada) y la zona se señaliza como de uso público."
          : "Las oficinas son áreas de trabajo de uso privado."
      }
    />
  );

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      {cabecera}

      <Decision<AccesoEntrada>
        numero={1}
        pregunta="Entrada principal"
        opciones={[
          { valor: "a_nivel", label: "A cota" },
          { valor: "rampa", label: "Rampa" },
          { valor: "ascensor", label: "Ascensor" },
          { valor: "escalones", label: "Escalones" },
        ]}
        valor={d.entrada}
        habitual={h.entrada}
        onChange={(v) => elegir("entrada", v)}
        texto={
          d.entrada === "a_nivel"
            ? "En la planta baja, a la cota de la acera: itinerario accesible sin escalones desde la vía pública."
            : d.entrada === "rampa"
              ? "El desnivel con la acera se salva dentro de la parcela con una rampa accesible (SUA 1 ap. 4)."
              : d.entrada === "ascensor"
                ? "El desnivel con la acera se salva dentro de la parcela con un ascensor accesible."
                : "Con escalones no hay itinerario accesible: no cumple."
        }
      />

      {j.residencial ? (
        <DecisionValor
          numero={2}
          pregunta="Viviendas accesibles"
          marca={j.viviendas.sr + j.viviendas.auditiva === 0 ? { texto: "ninguna", aviso: true } : { texto: "indicadas" }}
          control={
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary w-[64px] text-[12px] leading-tight">Silla de ruedas</span>
                <Paso etiqueta="Viviendas accesibles para silla de ruedas" valor={j.viviendas.sr} unidad="viv." paso={1} min={0} max={j.viviendas.total} onChange={(v) => setField("viviendasSR", v)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary w-[64px] text-[12px] leading-tight">Auditiva</span>
                <Paso etiqueta="Viviendas accesibles para discapacidad auditiva" valor={j.viviendas.auditiva} unidad="viv." paso={1} min={0} max={j.viviendas.total} onChange={(v) => setField("viviendasAuditiva", v)} />
              </div>
            </div>
          }
          texto="El DB no da el número: lo fija la reglamentación aplicable (normativa autonómica; en vivienda protegida o pública, el RDL 1/2013). Deciden las plazas accesibles, la cabina y la grúa de la piscina."
        />
      ) : (
        atencion(2)
      )}

      <Decision<SiNo>
        numero={3}
        pregunta="Ascensor accesible"
        opciones={[
          { valor: "si", label: "Ascensor" },
          { valor: "no", label: j.residencial ? "Previsión" : "No" },
        ]}
        valor={hay ? "si" : "no"}
        habitual={exigido ? "si" : "no"}
        onChange={(v) => cambiarEdificio(cambiarAscensor(edificio, v === "si"))}
        texto={
          asc && exigido
            ? `Se exige: ${textoMotivos(asc)}.${hay ? "" : " Sin él no cumple."}`
            : j.residencial
              ? hay
                ? "No se exige; el edificio lo tiene igualmente."
                : `No se exige: se prevé dimensional y estructuralmente, con giro de Ø ${m(ITINERARIO_ACCESIBLE.datos.giro_m)} frente al hueco.`
              : "No se exige, ni su previsión."
        }
      />

      {hay && cab && (
        <Decision<PuertasCabina>
          numero={4}
          pregunta="Cabina del ascensor"
          opciones={[
            { valor: "una_o_enfrentadas", label: "Una o enfrentadas" },
            { valor: "en_angulo", label: "En ángulo" },
          ]}
          valor={d.puertasCabina}
          habitual={h.puertasCabina}
          esHabitual={d.puertasCabina === h.puertasCabina && !cab.indicada}
          onChange={(v) => elegir("puertasCabina", v)}
          extra={
            <div className="mt-2.5 flex items-center gap-1.5">
              <CampoNumero id="sua9-cabina-ancho" value={cab.ancho_m} unidad="m" decimales={2} onChange={(v) => setField("cabinaAncho_m", v > 0 ? v : null)} />
              <span className="text-text-disabled text-[12px]">×</span>
              <CampoNumero id="sua9-cabina-fondo" value={cab.fondo_m} unidad="m" decimales={2} onChange={(v) => setField("cabinaFondo_m", v > 0 ? v : null)} />
            </div>
          }
          texto={`Anchura × fondo. Mínimo ${textoCabinas(cab.minimo)} m (tabla corregida, ${CABINA_CORREGIDA.datos.norma}); el texto del DB, ${textoCabinas(cab.minimoDb)} m.`}
        />
      )}

      {pasillo && (
        <DecisionValor
          numero={nPasillo}
          pregunta="Pasillos del itinerario"
          marca={pasillo.valor_m === null ? { texto: "sin medir" } : { texto: "indicada" }}
          control={
            <CampoNumero id="sua9-pasillo" value={pasillo.valor_m ?? pasillo.minimo_m} unidad="m" decimales={2} onChange={(v) => setField("pasillo_m", v > 0 ? Math.round(v * 100) / 100 : null)} />
          }
          texto={`Anchura libre de paso: ≥ ${m(pasillo.minimo_m)}${j.residencial ? " en las zonas comunes de un edificio de viviendas" : ""}. Sin medirla, se prescribe la mínima; 0 la deja sin indicar.`}
        />
      )}

      {j.cubiertaTransitable && (
        <Decision<UsoCubierta>
          numero={nCubierta}
          pregunta="Cubierta transitable"
          opciones={[
            { valor: "nula", label: "Tendedero o instalaciones" },
            { valor: "comunitaria", label: "Zona comunitaria" },
          ]}
          valor={d.cubierta}
          habitual={h.cubierta}
          onChange={(v) => elegir("cubierta", v)}
          texto={
            d.cubierta === "nula"
              ? "Ocupación nula: no cuenta como planta a salvar y el ascensor no tiene que llegar a ella."
              : "Zona de estancia o piscina: cuenta como planta a salvar y el ascensor llega a ella."
          }
        />
      )}

      {j.residencial && j.oficinas && atencion(nAtencion)}

      {pequena && (
        <Decision<AseoPequeno>
          numero={nAseo}
          pregunta="Aseo de la oficina"
          opciones={[
            { valor: "accesible", label: "Accesible" },
            { valor: "excepcion", label: "Solo trabajadores" },
          ]}
          valor={d.aseoPequeno}
          habitual={h.aseoPequeno}
          onChange={(v) => elegir("aseoPequeno", v)}
          texto={
            d.aseoPequeno === "excepcion"
              ? `No más de ${ASEO_CENTRO_PEQUENO.datos.trabajadoresMax} trabajadores y aseo solo para ellos: no tiene que ser accesible (comentario del Ministerio, no reglamentario).`
              : `Hasta ${fmt(ASEO_CENTRO_PEQUENO.datos.utilPrivadaMax_m2, "m²", 0)} útiles: con no más de ${ASEO_CENTRO_PEQUENO.datos.trabajadoresMax} trabajadores y aseo exclusivo, el comentario del Ministerio admite que no sea accesible.`
          }
        />
      )}
    </section>
  );
}

export function Sua9Module(): JSX.Element {
  return <PantallaSi def={sua9} Decisiones={DecisionesSua9} />;
}
