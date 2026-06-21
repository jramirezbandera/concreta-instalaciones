import { DiagramSvg, Seg, Arrow, Tag, type SvgMode } from "../../lib/svg/primitives";
import { fmt } from "../../lib/units/format";
import type { SmokeResult } from "./calc";

interface SmokeSVGProps {
  result: SmokeResult;
  mode: SvgMode;
  width: number;
  height: number;
}

// Diagrama de ejemplo: un local con su extracción de cocción. El elemento
// crítico (la extracción) se resalta en MULTICANAL (color + grosor + trazo
// discontinuo + etiqueta) cuando no cumple — nunca solo por color (WCAG 1.4.1).
const VB: [number, number, number, number] = [0, 0, 120, 90];

export function SmokeSVG({ result, mode, width, height }: SmokeSVGProps) {
  const critical = !result.cumple;
  const kind = critical ? "critical" : "flow";

  return (
    <DiagramSvg
      viewBox={VB}
      width={width}
      height={height}
      mode={mode}
      title="Esquema de extracción de cocción"
      desc={`Local con extracción de cocción. Caudal propuesto ${fmt(
        result.caudalPropuesto_l_s,
        "l/s",
      )}, requerido ${fmt(result.caudalRequerido_l_s, "l/s")}. ${
        result.cumple ? "Cumple." : "No cumple."
      }`}
    >
      {/* Local (rectángulo) */}
      <Seg x1={15} y1={20} x2={75} y2={20} mode={mode} />
      <Seg x1={75} y1={20} x2={75} y2={70} mode={mode} />
      <Seg x1={75} y1={70} x2={15} y2={70} mode={mode} />
      <Seg x1={15} y1={70} x2={15} y2={20} mode={mode} />
      <Tag x={45} y={45} mode={mode}>
        Cocina
      </Tag>

      {/* Conducto de extracción (elemento crítico cuando no cumple) */}
      <Arrow x1={75} y1={32} x2={110} y2={32} mode={mode} kind={kind} />
      <Tag x={92} y={27} mode={mode} critical={critical}>
        {`Extracción ${fmt(result.caudalPropuesto_l_s, "l/s")}`}
      </Tag>
      <Tag x={92} y={40} mode={mode} size={3.4}>
        {`mín. ${fmt(result.caudalRequerido_l_s, "l/s")}`}
      </Tag>
    </DiagramSvg>
  );
}
