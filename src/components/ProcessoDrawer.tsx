import { useEffect, useRef, useState } from 'react'
import {
  FileText,
  Plus,
  Check,
  Container,
  Eye,
  Download,
  Boxes,
  Landmark,
  Route,
  Wallet,
  X,
  FoldVertical,
  UnfoldVertical,
  Construction,
  Trash2,
} from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { EditableField } from '@/components/EditableField'
import { ModalIcon } from '@/components/ModalIcon'
import { SecaoDrawer } from '@/components/SecaoDrawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/StatusBadge'
import { NumerarioPreview } from '@/components/NumerarioPreview'
import { getCliente } from '@/lib/domain-queries'
import { hoje, formatarData } from '@/lib/date'
import { cn } from '@/lib/utils'
import { empresas, TRIBUTOS_CATALOGO_PADRAO } from '@/data/mock-data'
import { useProcessos } from '@/store/ProcessosContext'
import { useTributosCatalogo } from '@/store/TributosCatalogoContext'
import {
  MODAL_LABELS,
  NUMERARIO_STATUS_LABELS,
  PI_STATUSES,
  PI_STATUS_LABELS,
  TIPO_CARGA_LABELS,
  type Anexo,
  type ItemTributo,
  type Modal,
  type Numerario,
  type NumerarioStatus,
  type PiStatus,
  type ProcessoImportacao,
  type TipoCarga,
} from '@/types/domain'

function AnexoRow({
  anexo,
  onRename,
  onToggleVisibilidade,
}: {
  anexo: Anexo
  onRename: (nome: string) => void
  onToggleVisibilidade: (visivel: boolean) => void
}) {
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(anexo.nomeArquivo)

  function confirmar() {
    const valor = nome.trim()
    if (valor) onRename(valor)
    else setNome(anexo.nomeArquivo)
    setEditando(false)
  }

  return (
    <li className="flex items-center gap-2 text-sm">
      {editando ? (
        <Input
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={confirmar}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirmar()
            if (e.key === 'Escape') {
              setNome(anexo.nomeArquivo)
              setEditando(false)
            }
          }}
          className="h-7 flex-1"
        />
      ) : (
        <button
          type="button"
          className="flex-1 truncate text-left hover:underline"
          onClick={() => setEditando(true)}
        >
          {anexo.nomeArquivo}
        </button>
      )}
      <span className="text-muted-foreground shrink-0 text-xs">
        {(anexo.tamanhoBytes / 1024).toFixed(0)} KB
      </span>
      {anexo.url && (
        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href={anexo.url}
            target="_blank"
            rel="noreferrer"
            title="Visualizar"
            className="text-muted-foreground hover:text-foreground"
          >
            <Eye className="size-4" />
          </a>
          <a
            href={anexo.url}
            download={anexo.nomeArquivo}
            title="Baixar"
            className="text-muted-foreground hover:text-foreground"
          >
            <Download className="size-4" />
          </a>
        </div>
      )}
      <button
        type="button"
        className="shrink-0"
        onClick={() => onToggleVisibilidade(!anexo.visivelNoPortal)}
      >
        <Badge
          variant={anexo.visivelNoPortal ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
        >
          {anexo.visivelNoPortal ? 'Visível no portal' : 'Oculto'}
        </Badge>
      </button>
    </li>
  )
}

function CampoMoeda({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  value: number
  onChange: (valor: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm">
        R$
      </span>
      <Input
        type="number"
        step="0.01"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        disabled={disabled}
        className="h-8 pl-9"
      />
    </div>
  )
}

function TributoDescricaoInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (valor: string) => void
  disabled?: boolean
}) {
  const { tributosCatalogo, adicionarTributoCatalogo } = useTributosCatalogo()
  const [aberto, setAberto] = useState(false)
  const [posicao, setPosicao] = useState<'baixo' | 'cima'>('baixo')
  const [rascunho, setRascunho] = useState(value)
  const [digitou, setDigitou] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setRascunho(value)
  }, [value])

  useEffect(() => {
    if (!aberto) return
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        confirmar(rascunho)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, rascunho])

  const nomesAtivos = tributosCatalogo.filter((t) => t.ativo).map((t) => t.nome)

  const opcoes = digitou
    ? nomesAtivos.filter((t) => t.toLowerCase().includes(rascunho.trim().toLowerCase()))
    : nomesAtivos

  const jaExiste = nomesAtivos.some((t) => t.toLowerCase() === rascunho.trim().toLowerCase())

  function confirmar(valorFinal: string) {
    const limpo = valorFinal.trim()
    onChange(limpo)
    if (limpo) adicionarTributoCatalogo(limpo)
    setAberto(false)
  }

  function abrir() {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const espacoAbaixo = window.innerHeight - rect.bottom
      const espacoAcima = rect.top
      setPosicao(espacoAbaixo < 220 && espacoAcima > espacoAbaixo ? 'cima' : 'baixo')
    }
    setAberto(true)
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <Input
        placeholder="Descrição"
        value={rascunho}
        disabled={disabled}
        onFocus={() => {
          setDigitou(false)
          abrir()
        }}
        onChange={(e) => {
          setRascunho(e.target.value)
          setDigitou(true)
          abrir()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            confirmar(rascunho)
          }
        }}
        className="h-8"
      />
      {aberto && (opcoes.length > 0 || (rascunho.trim() && !jaExiste)) && (
        <div
          className={cn(
            'bg-popover absolute left-0 z-20 max-h-48 w-full overflow-auto rounded-md border py-1 shadow-md',
            posicao === 'baixo' ? 'top-full mt-1' : 'bottom-full mb-1',
          )}
        >
          {opcoes.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => confirmar(op)}
              className="hover:bg-accent block w-full px-3 py-1.5 text-left text-sm"
            >
              {op}
            </button>
          ))}
          {rascunho.trim() && !jaExiste && (
            <button
              type="button"
              onClick={() => confirmar(rascunho)}
              className="hover:bg-accent text-muted-foreground block w-full px-3 py-1.5 text-left text-sm"
            >
              Adicionar "{rascunho.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const NUMERARIO_STATUS_DOT: Record<NumerarioStatus, string> = {
  nao_liberado: 'bg-muted-foreground',
  liberado: 'bg-blue-500',
  pago: 'bg-emerald-500',
  cancelado: 'bg-destructive',
}

const SECOES_PADRAO: Record<string, boolean> = {
  transporte: true,
  frete: false,
  produtos: false,
  desembaraco: false,
}

const ABAS_DRAWER = [
  { id: 'processo', label: 'Processo' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'di', label: 'Digitação de DI' },
  { id: 'anexos', label: 'Anexos' },
  { id: 'comentarios', label: 'Comentários' },
] as const

type AbaDrawer = (typeof ABAS_DRAWER)[number]['id']

export function ProcessoDrawer({
  processo,
  open,
  onOpenChange,
}: {
  processo: ProcessoImportacao | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const {
    atualizarProcesso,
    alterarStatus,
    adicionarComentario,
    atualizarComentario,
    adicionarAnexos,
    atualizarAnexo,
    alternarFornecedorCotado,
    definirFornecedorAceito,
    adicionarProduto,
    removerProduto,
  } = useProcessos()
  const [numerarioAberto, setNumerarioAberto] = useState(false)
  const [confirmarDesfazerAberto, setConfirmarDesfazerAberto] = useState(false)
  const [confirmarExcluirAberto, setConfirmarExcluirAberto] = useState(false)
  const [novoComentario, setNovoComentario] = useState('')
  const [comentarioVisivel, setComentarioVisivel] = useState(false)
  const [novoProduto, setNovoProduto] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [secoesAbertas, setSecoesAbertas] = useState<Record<string, boolean>>(SECOES_PADRAO)
  const [abaAtiva, setAbaAtiva] = useState<AbaDrawer>('processo')

  useEffect(() => {
    setSecoesAbertas(SECOES_PADRAO)
    setAbaAtiva('processo')
  }, [processo?.id])

  function alternarSecao(chave: string) {
    setSecoesAbertas((atual) => ({ ...atual, [chave]: !atual[chave] }))
  }

  function abrirSecao(chave: string) {
    setSecoesAbertas((atual) => ({ ...atual, [chave]: true }))
  }

  const todasAbertas = Object.values(secoesAbertas).every(Boolean)

  function alternarTodasSecoes() {
    const novoValor = !todasAbertas
    setSecoesAbertas(
      Object.fromEntries(Object.keys(SECOES_PADRAO).map((chave) => [chave, novoValor])),
    )
  }

  useEffect(() => {
    if (open && processo) {
      document.title = `${processo.numero} | ERP Fiorini Comex`
    }
    return () => {
      document.title = 'ERP Fiorini Comex'
    }
  }, [open, processo?.numero])

  if (!processo) return null

  const cliente = getCliente(processo.clienteId)
  const fornecedoresFrete = empresas.filter((e) => e.tiposRelacionamento.includes('fornecedor_frete'))
  const cotados = processo.fornecedoresCotadosIds ?? []
  const maritimo = processo.modal === 'maritimo'

  function patch(campo: keyof ProcessoImportacao, valor: string) {
    atualizarProcesso(processo!.id, { [campo]: valor || undefined })
  }

  const numerarioAtual: Numerario = processo.numerario ?? {
    invoice: '',
    cotacaoMoeda: 0,
    tributos: [],
    status: 'nao_liberado',
  }
  const totalTributos = numerarioAtual.tributos.reduce((soma, item) => soma + item.valor, 0)
  const numerarioBloqueado = numerarioAtual.status !== 'nao_liberado'

  function patchNumerario(campo: Partial<Numerario>) {
    atualizarProcesso(processo!.id, { numerario: { ...numerarioAtual, ...campo } })
  }

  function adicionarTributo() {
    patchNumerario({ tributos: [...numerarioAtual.tributos, { descricao: '', valor: 0 }] })
  }

  function atualizarTributo(index: number, campo: Partial<ItemTributo>) {
    patchNumerario({
      tributos: numerarioAtual.tributos.map((item, i) =>
        i === index ? { ...item, ...campo } : item,
      ),
    })
  }

  function removerTributo(index: number) {
    patchNumerario({ tributos: numerarioAtual.tributos.filter((_, i) => i !== index) })
  }

  function criarNumerario() {
    atualizarProcesso(processo!.id, {
      numerario: {
        invoice: '',
        cotacaoMoeda: 0,
        status: 'nao_liberado',
        tributos: TRIBUTOS_CATALOGO_PADRAO.map((t) => ({ descricao: t.nome, valor: 0 })),
      },
    })
  }

  function liberarNumerario() {
    patchNumerario({ status: 'liberado' })
  }

  function desfazerLiberacaoNumerario() {
    patchNumerario({ status: 'nao_liberado' })
  }

  function excluirNumerario() {
    atualizarProcesso(processo!.id, { numerario: undefined })
  }

  function enviarComentario() {
    if (!novoComentario.trim()) return
    adicionarComentario(processo!.id, {
      autor: 'Fiorini',
      texto: novoComentario.trim(),
      visivelNoPortal: comentarioVisivel,
      criadoEm: hoje(),
      estagio: processo!.status,
    })
    setNovoComentario('')
    setComentarioVisivel(false)
  }

  function selecionarArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = e.target.files
    if (!arquivos || arquivos.length === 0) return
    adicionarAnexos(
      processo!.id,
      Array.from(arquivos).map((f) => ({
        nomeArquivo: f.name,
        tamanhoBytes: f.size,
        enviadoEm: hoje(),
        visivelNoPortal: true,
        url: URL.createObjectURL(f),
      })),
    )
    e.target.value = ''
  }

  function adicionarProdutoAtual() {
    const valor = novoProduto.trim()
    if (!valor) return
    adicionarProduto(processo!.id, valor)
    setNovoProduto('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        <div className="bg-background sticky top-0 z-10 flex flex-col gap-0">
          <SheetHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <SheetTitle className="text-lg">{processo.numero}</SheetTitle>
                <SheetDescription>{cliente?.nomeFantasia}</SheetDescription>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {abaAtiva === 'processo' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    title={
                      todasAbertas ? 'Recolher todas as seções' : 'Expandir todas as seções'
                    }
                    onClick={alternarTodasSecoes}
                  >
                    {todasAbertas ? (
                      <FoldVertical className="size-4" />
                    ) : (
                      <UnfoldVertical className="size-4" />
                    )}
                  </Button>
                )}
                <Select
                  value={processo.status}
                  onValueChange={(v) => alterarStatus(processo.id, v as PiStatus)}
                >
                  <SelectTrigger
                    size="sm"
                    className="h-7 w-fit shrink-0 border-none px-2 shadow-none"
                  >
                    <StatusBadge status={processo.status} />
                  </SelectTrigger>
                  <SelectContent>
                    {PI_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {PI_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetHeader>

          <div className="flex items-center gap-1 border-b px-5">
            {ABAS_DRAWER.map((aba) => (
              <button
                key={aba.id}
                type="button"
                onClick={() => setAbaAtiva(aba.id)}
                className={cn(
                  '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  abaAtiva === aba.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {aba.label}
                {aba.id === 'anexos' && processo.anexos.length > 0 && (
                  <Badge variant="secondary">{processo.anexos.length}</Badge>
                )}
                {aba.id === 'comentarios' && processo.comentarios.length > 0 && (
                  <Badge variant="secondary">{processo.comentarios.length}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {processo.numerario && (
          <Dialog open={numerarioAberto} onOpenChange={setNumerarioAberto}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Numerário — {processo.numero}</DialogTitle>
                <DialogDescription>
                  Prévia do documento enviado ao cliente
                  {processo.numerarioEnviadoEm
                    ? ` em ${formatarData(processo.numerarioEnviadoEm)}`
                    : ''}
                  .
                </DialogDescription>
              </DialogHeader>
              <NumerarioPreview processo={processo} />
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={confirmarDesfazerAberto} onOpenChange={setConfirmarDesfazerAberto}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Desfazer liberação do numerário?</DialogTitle>
              <DialogDescription>
                O numerário voltará ao status "Em digitação" e os campos ficarão
                editáveis novamente. Essa ação não afeta os dados já preenchidos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmarDesfazerAberto(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  desfazerLiberacaoNumerario()
                  setConfirmarDesfazerAberto(false)
                }}
              >
                Desfazer liberação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmarExcluirAberto} onOpenChange={setConfirmarExcluirAberto}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Excluir numerário?</DialogTitle>
              <DialogDescription>
                Todos os dados preenchidos (invoice, cotação e tributos/despesas)
                serão perdidos. Essa ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmarExcluirAberto(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  excluirNumerario()
                  setConfirmarExcluirAberto(false)
                }}
              >
                Excluir numerário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {abaAtiva === 'processo' && (
        <>
        <Separator />

        {/* Informações primárias */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-5">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground text-xs font-normal">Cliente</Label>
            <span className="text-sm">{cliente?.nomeFantasia}</span>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground text-xs font-normal">CNPJ</Label>
            <span className="text-sm">{cliente?.cnpj}</span>
          </div>
          <EditableField
            label="Exportador"
            value={processo.exportador ?? ''}
            onChange={(v) => patch('exportador', v)}
          />
          <EditableField
            label="Referência cliente"
            value={processo.referenciaCliente ?? ''}
            onChange={(v) => patch('referenciaCliente', v)}
          />
        </div>

        <Separator />

        <SecaoDrawer
          icon={Route}
          titulo="Transporte"
          aberto={secoesAbertas.transporte}
          onToggle={() => alternarSecao('transporte')}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground text-xs font-normal">Modal</Label>
              <Select
                value={processo.modal}
                onValueChange={(v) => atualizarProcesso(processo.id, { modal: v as Modal })}
              >
                <SelectTrigger size="sm" className="h-8 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODAL_LABELS).map(([valor, label]) => (
                    <SelectItem key={valor} value={valor}>
                      <span className="inline-flex items-center gap-1.5">
                        <ModalIcon modal={valor as Modal} className="size-4" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground text-xs font-normal">
                LPCO
              </Label>
              <div className="flex h-8 items-center gap-2">
                <Switch
                  checked={!!processo.licencaImportacao}
                  onCheckedChange={(v) =>
                    atualizarProcesso(processo.id, { licencaImportacao: v })
                  }
                />
                <span className="text-sm">
                  {processo.licencaImportacao ? 'Necessária' : 'Não necessária'}
                </span>
              </div>
            </div>
            {maritimo && (
              <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs font-normal">
                  Tipo de carga
                </Label>
                <Select
                  value={processo.tipoCarga ?? ''}
                  onValueChange={(v) =>
                    atualizarProcesso(processo.id, { tipoCarga: v as TipoCarga })
                  }
                >
                  <SelectTrigger size="sm" className="h-8 w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_CARGA_LABELS).map(([valor, label]) => (
                      <SelectItem key={valor} value={valor}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {maritimo && (
              <div className="col-span-2">
                <EditableField
                  label="Navio"
                  value={processo.navio ?? ''}
                  onChange={(v) => patch('navio', v)}
                />
              </div>
            )}
            <EditableField
              label="Origem"
              value={processo.origem ?? ''}
              onChange={(v) => patch('origem', v)}
            />
            <EditableField
              label="Destino"
              value={processo.destino ?? ''}
              onChange={(v) => patch('destino', v)}
            />
            <EditableField
              label="Previsão de embarque"
              type="date"
              value={processo.previsaoEmbarque ?? ''}
              onChange={(v) => patch('previsaoEmbarque', v)}
            />
            <EditableField
              label="Previsão de chegada"
              type="date"
              value={processo.previsaoChegada ?? ''}
              onChange={(v) => patch('previsaoChegada', v)}
            />
            <div className={maritimo ? '' : 'col-span-2'}>
              <EditableField
                label="HBL / HAWB"
                value={processo.hblHawb ?? ''}
                onChange={(v) => patch('hblHawb', v)}
              />
            </div>
            {maritimo && (
              <EditableField
                label="CE Mercante"
                value={processo.conhecimentoEmbarque ?? ''}
                onChange={(v) => patch('conhecimentoEmbarque', v)}
              />
            )}
            <div className="col-span-2">
              <EditableField
                label="Liberação MAPA"
                type="date"
                value={processo.dataLiberacaoMapa ?? ''}
                onChange={(v) => patch('dataLiberacaoMapa', v)}
              />
            </div>
            <EditableField
              label="Data de chegada"
              type="date"
              value={processo.dataChegada ?? ''}
              onChange={(v) => patch('dataChegada', v)}
            />
            <EditableField
              label="Presença de carga"
              type="date"
              value={processo.dataPresencaCarga ?? ''}
              onChange={(v) => patch('dataPresencaCarga', v)}
            />
          </div>
        </SecaoDrawer>

        <Separator />

        <SecaoDrawer
          icon={Container}
          titulo="Frete internacional"
          badge={
            cotados.length > 0 && <Badge variant="secondary">{cotados.length}</Badge>
          }
          acoes={
            processo.status === 'contratacao_frete' && cotados.length === 0 ? (
              <Button size="sm" variant="outline" onClick={() => abrirSecao('frete')}>
                <Plus className="size-4" />
                Adicionar cotação
              </Button>
            ) : undefined
          }
          aberto={secoesAbertas.frete}
          onToggle={() => alternarSecao('frete')}
        >
          <p className="text-muted-foreground text-xs">
            Selecione os fornecedores com quem foi solicitada cotação para este
            processo.
          </p>
          <div className="flex flex-wrap gap-2">
            {fornecedoresFrete.map((f) => {
              const cotado = cotados.includes(f.id)
              const aceito = f.id === processo.fornecedorFreteId
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => alternarFornecedorCotado(processo.id, f.id)}
                >
                  <Badge
                    variant={aceito ? 'default' : cotado ? 'secondary' : 'outline'}
                    className="cursor-pointer"
                  >
                    {cotado && <Check />}
                    {f.nomeFantasia}
                    {aceito ? ' · Aceito' : ''}
                  </Badge>
                </button>
              )
            })}
          </div>
          {cotados.length > 0 && (
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground text-xs font-normal">
                Fornecedor aceito
              </Label>
              <Select
                value={processo.fornecedorFreteId ?? 'nenhum'}
                onValueChange={(v) =>
                  definirFornecedorAceito(processo.id, v === 'nenhum' ? undefined : v)
                }
              >
                <SelectTrigger size="sm" className="h-8 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum</SelectItem>
                  {cotados.map((id) => {
                    const f = fornecedoresFrete.find((f) => f.id === id)
                    return (
                      <SelectItem key={id} value={id}>
                        {f?.nomeFantasia}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </SecaoDrawer>

        <Separator />

        <SecaoDrawer
          icon={Boxes}
          titulo="Produtos"
          badge={<Badge variant="secondary">{processo.produtos.length}</Badge>}
          aberto={secoesAbertas.produtos}
          onToggle={() => alternarSecao('produtos')}
        >
          {processo.produtos.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {processo.produtos.map((produto) => (
                <li key={produto}>
                  <Badge variant="outline" className="gap-1.5 pr-1.5">
                    {produto}
                    <button
                      type="button"
                      onClick={() => removerProduto(processo.id, produto)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Adicionar produto..."
              value={novoProduto}
              onChange={(e) => setNovoProduto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  adicionarProdutoAtual()
                }
              }}
              className="h-8"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={adicionarProdutoAtual}
              disabled={!novoProduto.trim()}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </SecaoDrawer>

        <Separator />

        <SecaoDrawer
          icon={Landmark}
          titulo="Desembaraço"
          aberto={secoesAbertas.desembaraco}
          onToggle={() => alternarSecao('desembaraco')}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div className="col-span-2">
              <EditableField
                label="Nº DI"
                value={processo.numeroDi ?? ''}
                onChange={(v) => patch('numeroDi', v)}
              />
            </div>
            <EditableField
              label="Data do CI"
              type="date"
              value={processo.dataCi ?? ''}
              onChange={(v) => patch('dataCi', v)}
            />
            <EditableField
              label="Siscarga"
              type="date"
              value={processo.dataSiscargo ?? ''}
              onChange={(v) => patch('dataSiscargo', v)}
            />
            <EditableField
              label="Pagamento ICMS"
              type="date"
              value={processo.dataIcms ?? ''}
              onChange={(v) => patch('dataIcms', v)}
            />
            <EditableField
              label="Data de encerramento"
              type="date"
              value={processo.dataEncerramento ?? ''}
              onChange={(v) => patch('dataEncerramento', v)}
            />
          </div>
        </SecaoDrawer>
        <div className="h-10" />
        </>
        )}

        {abaAtiva === 'financeiro' && !processo.numerario && (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <Wallet className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-sm">
              Nenhum numerário cadastrado para este processo.
            </p>
            <Button size="sm" onClick={criarNumerario}>
              <Plus className="size-4" />
              Adicionar numerário
            </Button>
          </div>
        )}

        {abaAtiva === 'financeiro' && processo.numerario && (
          <>
          <div className="flex flex-col gap-4 px-5 py-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Numerário</span>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium">
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      NUMERARIO_STATUS_DOT[numerarioAtual.status],
                    )}
                  />
                  {NUMERARIO_STATUS_LABELS[numerarioAtual.status]}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!numerarioBloqueado && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="border-destructive text-destructive shadow-xs hover:bg-destructive/10 hover:text-destructive size-8"
                    onClick={() => setConfirmarExcluirAberto(true)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
                {numerarioBloqueado ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmarDesfazerAberto(true)}
                  >
                    Desfazer liberação
                  </Button>
                ) : (
                  <Button size="sm" onClick={liberarNumerario}>
                    Liberar numerário
                  </Button>
                )}
                {numerarioBloqueado && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNumerarioAberto(true)}
                  >
                    <FileText className="size-4" />
                    Ver Numerário
                  </Button>
                )}
              </div>
            </div>

            {numerarioBloqueado && (
              <p className="text-muted-foreground text-xs">
                Numerário liberado — os dados abaixo não podem mais ser alterados.
                Clique em "Desfazer liberação" para ajustar.
              </p>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <EditableField
                label="Data de emissão"
                type="date"
                value={processo.numerarioEnviadoEm ?? ''}
                onChange={(v) => patch('numerarioEnviadoEm', v)}
              />
              <EditableField
                label="Data de pagamento"
                type="date"
                value={processo.numerarioPagoEm ?? ''}
                onChange={(v) => patch('numerarioPagoEm', v)}
              />
            </div>

            <Separator />

            <fieldset disabled={numerarioBloqueado} className="contents">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <EditableField
                  label="Invoice"
                  value={numerarioAtual.invoice}
                  onChange={(v) => patchNumerario({ invoice: v })}
                />
                <div className="flex flex-col gap-1">
                  <Label className="text-muted-foreground text-xs font-normal">
                    Cotação moeda
                  </Label>
                  <CampoMoeda
                    value={numerarioAtual.cotacaoMoeda}
                    onChange={(v) => patchNumerario({ cotacaoMoeda: v })}
                    className="w-full"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground text-xs font-normal">
                  Tributos / Despesas
                </Label>
                <Button size="sm" variant="outline" onClick={adicionarTributo}>
                  <Plus className="size-4" />
                  Adicionar
                </Button>
              </div>

              {numerarioAtual.tributos.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum tributo ou despesa cadastrado.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {numerarioAtual.tributos.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <TributoDescricaoInput
                        value={item.descricao}
                        onChange={(v) => atualizarTributo(index, { descricao: v })}
                      />
                      <CampoMoeda
                        placeholder="Valor"
                        value={item.valor}
                        onChange={(v) => atualizarTributo(index, { valor: v })}
                        className="w-32 shrink-0"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0"
                        onClick={() => removerTributo(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>
            <div className="h-10" />
          </div>

          <div className="bg-background sticky bottom-0 z-10 flex items-center justify-between border-t px-5 py-3 text-sm font-medium">
            <span>Total</span>
            <span>
              {totalTributos.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>
          </>
        )}

        {abaAtiva === 'di' && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <Construction className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-sm">
              Digitação de DI em construção.
            </p>
          </div>
        )}

        {abaAtiva === 'anexos' && (
          <div className="flex flex-col gap-3 px-5 py-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs">
                {processo.anexos.length} anexo{processo.anexos.length === 1 ? '' : 's'}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="size-4" />
                Adicionar
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={selecionarArquivos}
            />
            {processo.anexos.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum anexo.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {processo.anexos.map((a) => (
                  <AnexoRow
                    key={a.id}
                    anexo={a}
                    onRename={(nome) => atualizarAnexo(processo.id, a.id, { nomeArquivo: nome })}
                    onToggleVisibilidade={(visivel) =>
                      atualizarAnexo(processo.id, a.id, { visivelNoPortal: visivel })
                    }
                  />
                ))}
              </ul>
            )}
            <p className="text-muted-foreground text-xs">
              Upload local por enquanto — o armazenamento real dos arquivos entra
              quando o back-end (Supabase Storage) for integrado.
            </p>
            <div className="h-10" />
          </div>
        )}

        {abaAtiva === 'comentarios' && (
          <div className="flex flex-col gap-3 px-5 py-5">
            {processo.comentarios.length > 0 && (
              <ul className="flex flex-col gap-3">
                {processo.comentarios.map((c) => (
                  <li key={c.id} className="flex flex-col gap-1 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.autor}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            atualizarComentario(processo.id, c.id, {
                              visivelNoPortal: !c.visivelNoPortal,
                            })
                          }
                        >
                          <Badge
                            variant={c.visivelNoPortal ? 'default' : 'outline'}
                            className="cursor-pointer text-xs"
                          >
                            {c.visivelNoPortal ? 'Visível no portal' : 'Oculto'}
                          </Badge>
                        </button>
                        <span className="text-muted-foreground text-xs">
                          {formatarData(c.criadoEm)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">{c.texto}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-2 rounded-md border p-3">
              <Textarea
                placeholder="Adicionar um comentário..."
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    enviarComentario()
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={comentarioVisivel}
                    onCheckedChange={(v) => setComentarioVisivel(v === true)}
                  />
                  Visível no portal do cliente
                </label>
                <Button size="sm" onClick={enviarComentario} disabled={!novoComentario.trim()}>
                  Adicionar
                </Button>
              </div>
            </div>
            <div className="h-10" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
