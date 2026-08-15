import { getCliente } from '@/lib/domain-queries'
import { formatarData } from '@/lib/date'
import { MODAL_LABELS, type ProcessoImportacao } from '@/types/domain'

export const CHAVE_COLUNAS = 'fiorini-comex:colunas-processos'

export type ColunaId =
  | 'cliente'
  | 'estagio'
  | 'modal'
  | 'exportador'
  | 'referenciaCliente'
  | 'previsaoEmbarque'
  | 'previsaoChegada'
  | 'atualizadoEm'

export const COLUNAS_DISPONIVEIS: { id: ColunaId; label: string }[] = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'estagio', label: 'Estágio' },
  { id: 'modal', label: 'Modal' },
  { id: 'exportador', label: 'Exportador' },
  { id: 'referenciaCliente', label: 'Referência cliente' },
  { id: 'previsaoEmbarque', label: 'Previsão de embarque' },
  { id: 'previsaoChegada', label: 'Previsão de chegada' },
  { id: 'atualizadoEm', label: 'Atualizado em' },
]

export interface ColunaEstado {
  id: ColunaId
  visivel: boolean
}

export function colunasIniciais(): ColunaEstado[] {
  const padrao = COLUNAS_DISPONIVEIS.map((c) => ({ id: c.id, visivel: true }))
  try {
    const salvo = localStorage.getItem(CHAVE_COLUNAS)
    if (!salvo) return padrao
    const salvas: ColunaEstado[] = JSON.parse(salvo)
    const idsValidos = new Set(COLUNAS_DISPONIVEIS.map((c) => c.id))
    const existentes = salvas.filter((c) => idsValidos.has(c.id))
    const idsExistentes = new Set(existentes.map((c) => c.id))
    const faltantes = padrao.filter((c) => !idsExistentes.has(c.id))
    return [...existentes, ...faltantes]
  } catch {
    return padrao
  }
}

export function celulaColuna(p: ProcessoImportacao, id: ColunaId): string {
  switch (id) {
    case 'cliente':
      return getCliente(p.clienteId)?.nomeFantasia ?? '—'
    case 'estagio':
      return ''
    case 'modal':
      return MODAL_LABELS[p.modal]
    case 'exportador':
      return p.exportador ?? '—'
    case 'referenciaCliente':
      return p.referenciaCliente ?? '—'
    case 'previsaoEmbarque':
      return formatarData(p.previsaoEmbarque) || '—'
    case 'previsaoChegada':
      return formatarData(p.previsaoChegada) || '—'
    case 'atualizadoEm':
      return formatarData(p.atualizadoEm)
  }
}
