export const PI_STATUSES = [
  'aberto',
  'contratacao_frete',
  'em_transito',
  'desembaraco',
  'carregamento',
  'encerramento',
] as const

export type PiStatus = (typeof PI_STATUSES)[number]

export const PI_STATUS_LABELS: Record<PiStatus, string> = {
  aberto: 'Aberto',
  contratacao_frete: 'Contratação de Frete',
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

export type TipoCarga = 'FCL' | 'LCL'

export const TIPO_CARGA_LABELS: Record<TipoCarga, string> = {
  FCL: 'FCL — Container fechado',
  LCL: 'LCL — Carga consolidada',
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

export interface ContatoEmpresa {
  id: string
  nome: string
  telefone?: string
  email?: string
}

export interface EmpresaCadastrada {
  id: string
  nomeFantasia: string
  razaoSocial: string
  cnpj: string
  site?: string
  telefone?: string
  email?: string
  contatos: ContatoEmpresa[]
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
  visivelNoPortal: boolean
  /** URL local (object URL) do arquivo, quando disponível nesta sessão. */
  url?: string
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
}

export interface Empresa {
  nome: string
  razaoSocial: string
  cnpj: string
  responsavel: string
  endereco: string
  email: string
  telefone: string
  dadosBancarios: DadosBancarios
  logoHorizontalUrl?: string
  iconeUrl?: string
}

export interface ProcessoImportacao {
  id: string
  numero: string
  clienteId: string
  status: PiStatus
  modal: Modal
  fornecedoresCotadosIds?: string[]
  fornecedorFreteId?: string
  exportador?: string
  referenciaCliente?: string
  licencaImportacao?: boolean
  tipoCarga?: TipoCarga
  origem?: string
  portoDestino?: string
  previsaoEmbarque?: string
  previsaoChegada?: string
  hblHawb?: string
  conhecimentoEmbarque?: string
  dataLiberacaoMapa?: string
  dataChegada?: string
  dataPresencaCarga?: string
  numerario?: Numerario
  numerarioEnviadoEm?: string
  numerarioPagoEm?: string
  numeroDi?: string
  dataCi?: string
  dataSiscargo?: string
  dataIcms?: string
  dataEncerramento?: string
  produtos: string[]
  criadoEm: string
  atualizadoEm: string
  comentarios: Comentario[]
  anexos: Anexo[]
}
