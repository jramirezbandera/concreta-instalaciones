/** «22 ago 2026»: la fecha corta es-ES de las fichas, el anejo y la memoria. */
export function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(d);
}
