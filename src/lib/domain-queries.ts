import { clientes } from '@/data/mock-data'
import { PI_STATUSES, type PiStatus, type ProcessoImportacao } from '@/types/domain'

export function getCliente(clienteId: string) {
  return clientes.find((c) => c.id === clienteId)
}

export function countByStatus(processos: ProcessoImportacao[]): Record<PiStatus, number> {
  const counts = Object.fromEntries(PI_STATUSES.map((s) => [s, 0])) as Record<
    PiStatus,
    number
  >
  for (const p of processos) counts[p.status]++
  return counts
}

export function countByCliente(processos: ProcessoImportacao[]) {
  const counts = new Map<string, number>()
  for (const p of processos) {
    counts.set(p.clienteId, (counts.get(p.clienteId) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([clienteId, total]) => ({ cliente: getCliente(clienteId), total }))
    .sort((a, b) => b.total - a.total)
}

export function proximosEmbarques(processos: ProcessoImportacao[], limit = 5): ProcessoImportacao[] {
  return processos
    .filter((p) => p.previsaoEmbarque && p.status !== 'encerramento')
    .sort((a, b) => a.previsaoEmbarque!.localeCompare(b.previsaoEmbarque!))
    .slice(0, limit)
}

export function proximasChegadas(processos: ProcessoImportacao[], limit = 5): ProcessoImportacao[] {
  return processos
    .filter((p) => p.previsaoChegada && !p.dataChegada && p.status !== 'encerramento')
    .sort((a, b) => a.previsaoChegada!.localeCompare(b.previsaoChegada!))
    .slice(0, limit)
}

export function numerariosPendentes(processos: ProcessoImportacao[]): ProcessoImportacao[] {
  return processos.filter((p) => p.numerarioEnviadoEm && !p.numerarioPagoEm)
}

export function processosAtivos(processos: ProcessoImportacao[]): ProcessoImportacao[] {
  return processos.filter((p) => p.status !== 'encerramento')
}
