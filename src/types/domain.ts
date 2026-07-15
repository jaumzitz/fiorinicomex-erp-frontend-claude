export const PI_STATUSES = [
  'contratacao_frete',
  'aberto',
  'em_transito',
  'desembaraco',
  'carregamento',
  'encerramento',
] as const

export type PiStatus = (typeof PI_STATUSES)[number]

export const PI_STATUS_LABELS: Record<PiStatus, string> = {
  contratacao_frete: 'Contratação de Frete',
  aberto: 'Aberto',
  em_transito: 'Em Trânsito',
  desembaraco: 'Desembaraço',
  carregamento: 'Carregamento',
  encerramento: 'Encerramento',
}

export type Modal = 'maritimo' | 'rodoviario' | 'aereo' | 'ferroviario'

export const MODAL_LABELS: Record<Modal, string> = {
  maritimo: 'Marítimo',
  rodoviario: 'Rodoviário',
  aereo: 'Aéreo',
  ferroviario: 'Ferroviário',
}

export interface Cliente {
  id: string
  nome: string
  cnpj: string
  email: string
  telefone?: string
}

export interface Fornecedor {
  id: string
  nome: string
  contato?: string
  email?: string
  telefone?: string
}

export interface Comentario {
  id: string
  autor: string
  texto: string
  criadoEm: string
  visivelNoPortal: boolean
  estagio?: PiStatus
}

export interface Anexo {
  id: string
  nomeArquivo: string
  tamanhoBytes: number
  enviadoEm: string
}

export interface ItemTributo {
  descricao: string
  valor: number
}

export interface DadosBancarios {
  banco: string
  agencia: string
  conta: string
  pix: string
}

export interface Numerario {
  produto: string
  invoice: string
  exportador: string
  cotacaoMoeda: number
  tributos: ItemTributo[]
  dadosBancarios: DadosBancarios
}

export interface ProcessoImportacao {
  id: string
  numero: string
  clienteId: string
  status: PiStatus
  modal: Modal
  fornecedoresCotadosIds?: string[]
  fornecedorFreteId?: string
  portoDestino?: string
  previsaoEmbarque?: string
  previsaoChegada?: string
  dataChegada?: string
  numerario?: Numerario
  numerarioEnviadoEm?: string
  numerarioPagoEm?: string
  criadoEm: string
  atualizadoEm: string
  comentarios: Comentario[]
  anexos: Anexo[]
}
