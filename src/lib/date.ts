export function hoje() {
  return new Date().toISOString().slice(0, 10)
}

/** Converte uma data ISO (YYYY-MM-DD) para exibição no formato dd/mm/yyyy. */
export function formatarData(iso?: string): string {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  if (!ano || !mes || !dia) return iso
  return `${dia}/${mes}/${ano}`
}
