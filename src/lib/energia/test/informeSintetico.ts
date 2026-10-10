// =============================================================================
// Un informe «Verificación de requisitos de CTE-HE0 y HE1» de CE3X SINTÉTICO
// (datos inventados), con la forma que da pdf.js en modo «líneas» para un
// informe real: celdas separadas por « | », los subíndices partidos en otra
// línea y la tabla del límite de HE0 en dos renglones. Todo cumple; la portada
// dice «CTE 2013», como en el informe real que sirvió de modelo.
// =============================================================================

import { leerVerificacion, type VerificacionEnergetica } from "../verificacion";

export const PAGINAS = [
  `Verificación de requisitos de CTE-HE0 y HE1
Edificio de nueva construcción o ampliación de edificio existente
Nombre del edificio | EDIFICIO DE PRUEBA
Municipio | Granada | Código Postal | 18001
Zona climática | C3 | Año construcción | 2026
Normativa | vigente | (construcción | /
CTE 2013
rehabilitación)
Procedimiento de cálculo utilizado y versión: | CEXv2.3
Fecha: 3/5/2026
Fecha: 3/5/2026 | Página 1 de 18`,
  `Verificación de requisitos de CTE-HE0 y HE1
1.1. CONSUMO DE ENERGÍA PRIMARIA NO RENOVABLE
C , | = 60.2 kWh/m2año
ep nren,lim
C , | = 48.1 kWh/m2año
ep nren
Cumple`,
  `Verificación de requisitos de CTE-HE0 y HE1
2.k. Consumo de energía primaria no renovable (Cep,nren) del edificio y el valor límite aplicable (Cep,nren, lim)
Consumo energía primaria no renovable [C(ep,nren)] | 48.07
Valor límite del consumo energía primaria no renovable
[C( | )] | 60.21
ep,nren, lim
2.l. Consumo de energía primaria total (Cep,tot) del edificio y el valor límite aplicable (Cep,tot, lim)
Consumo energía primaria total [C(ep,tot)] | 95.40
Valor límite del consumo energía primaria total [C(ep,tot,lim)] | 167.00
2.m. Número de horas fuera de consigna y el valor límite aplicable`,
  `Verificación de requisitos de CTE-HE0 y HE1
ANEXO II
1.1 Transmitancia de la envolvente térmica
Cerramientos opacos
U(W/m2K) | U | (W/m2K) | Cumple
límite
FACHADA PRINCIPAL | 0.41 | 0.49 | Sí
MEDIANERA | 0.0 | 0.7 | Sí
CUBIERTA | 0.33 | 0.4 | Sí
Huecos
U(W/m2K) | U | (W/m2K) | Cumple
límite
V1 | 1.6 | 2.1 | Sí
PUERTA | 2.2 | 5.7 | Sí`,
  `Verificación de requisitos de CTE-HE0 y HE1
1.2 Coeficiente global de transmisión de calor
Compacidad [m] | 1.20
K = 0.52 W/m²K
K lim = 0.66 W/m²K
Cumple`,
  `Verificación de requisitos de CTE-HE0 y HE1
1.3 Control solar
qsol;jul: 2.4 kWh/m²mes
qsol;jul lim 4.0 kWh/m²mes
Cumple`,
  `Verificación de requisitos de CTE-HE0 y HE1
1.4 Permeabilidad al aire
Huecos
3 | 2 | Permeabilidad
Permeabilidad(m /hm ) | 3 | 2 | Cumple
límite(m /hm )
V1 | 9.0 | 9.0 | Sí
PUERTA | 9.0 | 9.0 | Sí`,
  `Verificación de requisitos de CTE-HE0 y HE1
1.6 Limitación de condensaciones intersticiales
Nombre | Capas | Cumple
FACHADA PRINCIPAL | Fachada ladrillo con | Cumple
aislamiento por el interior
CUBIERTA | Cubierta plana invertida | Cumple
2. JUSTIFICACIÓN DEL CUMPLIMIENTO DE LA EXIGENCIA
Zona climática según el DB HE1 | C3`,
].map((texto) => ({ texto }));

/** El informe ya leído. */
export function verificacionDePrueba(paginas = PAGINAS, archivo = "informe.pdf"): VerificacionEnergetica {
  const r = leerVerificacion(paginas, archivo);
  if (!r.ok) throw new Error(r.error);
  return r.verificacion;
}
