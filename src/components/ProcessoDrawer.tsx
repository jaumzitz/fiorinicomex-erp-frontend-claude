import { useRef, useState } from 'react'
import {
  Paperclip,
  MessageSquare,
  FileText,
  Plus,
  Eye,
  Download,
  Boxes,
  X,
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
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { fornecedoresFrete } from '@/data/mock-data'
import { useProcessos } from '@/store/ProcessosContext'
import {
  MODAL_LABELS,
  PI_STATUSES,
  PI_STATUS_LABELS,
  type Anexo,
  type Modal,
  type PiStatus,
  type ProcessoImportacao,
} from '@/types/domain'

function EditableField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'date'
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-muted-foreground text-xs font-normal">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8"
      />
    </div>
  )
}

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
  const [novoComentario, setNovoComentario] = useState('')
  const [comentarioVisivel, setComentarioVisivel] = useState(true)
  const [novoProduto, setNovoProduto] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!processo) return null

  const cliente = getCliente(processo.clienteId)
  const cotados = processo.fornecedoresCotadosIds ?? []

  function patch(campo: keyof ProcessoImportacao, valor: string) {
    atualizarProcesso(processo!.id, { [campo]: valor || undefined })
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
    setComentarioVisivel(true)
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
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle className="text-lg">{processo.numero}</SheetTitle>
            <Select
              value={processo.status}
              onValueChange={(v) => alterarStatus(processo.id, v as PiStatus)}
            >
              <SelectTrigger size="sm" className="h-7 w-fit border-none px-2 shadow-none">
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
          <SheetDescription>{cliente?.nome}</SheetDescription>
          {processo.numerario && (
            <Button
              size="sm"
              variant="outline"
              className="mt-1 w-fit"
              onClick={() => setNumerarioAberto(true)}
            >
              <FileText className="size-4" />
              Ver Numerário
            </Button>
          )}
        </SheetHeader>

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

        <Separator />

        <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-5">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground text-xs font-normal">Cliente</Label>
            <span className="text-sm">{cliente?.nome}</span>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground text-xs font-normal">CNPJ</Label>
            <span className="text-sm">{cliente?.cnpj}</span>
          </div>
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
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <EditableField
            label="Porto de destino"
            value={processo.portoDestino ?? ''}
            onChange={(v) => patch('portoDestino', v)}
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
          <EditableField
            label="Data de chegada"
            type="date"
            value={processo.dataChegada ?? ''}
            onChange={(v) => patch('dataChegada', v)}
          />
          <EditableField
            label="Numerário enviado em"
            type="date"
            value={processo.numerarioEnviadoEm ?? ''}
            onChange={(v) => patch('numerarioEnviadoEm', v)}
          />
          <EditableField
            label="Numerário pago em"
            type="date"
            value={processo.numerarioPagoEm ?? ''}
            onChange={(v) => patch('numerarioPagoEm', v)}
          />
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-5 py-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Boxes className="size-4" />
            Produtos
            <Badge variant="secondary">{processo.produtos.length}</Badge>
          </div>
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
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-5 py-5">
          <span className="text-sm font-medium">Frete internacional</span>
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
                    {f.nome}
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
                        {f?.nome}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Paperclip className="size-4" />
              Anexos
              <Badge variant="secondary">{processo.anexos.length}</Badge>
            </div>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Plus className="size-4" />
              Adicionar
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={selecionarArquivos}
            />
          </div>
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
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-5 py-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="size-4" />
            Comentários
            <Badge variant="secondary">{processo.comentarios.length}</Badge>
          </div>

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
        </div>
      </SheetContent>
    </Sheet>
  )
}
