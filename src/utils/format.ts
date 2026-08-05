/** "Productive_Formation" -> "Productive Formation" */
export function humanizeColumn(column: string): string {
  return column.replace(/_/g, " ").trim();
}
