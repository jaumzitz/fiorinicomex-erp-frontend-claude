import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Columns3, Plus, Search } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { ProcessoDrawer } from '@/components/ProcessoDrawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { clientes } from '@/data/mock-data'
import { getCliente } from '@/lib/domain-queries'
import { formatarData } from '@/lib/date'
import { useProcessos } from '@/store/ProcessosContext'
import {
  MODAL_LABELS,
  PI_STATUSES,
  PI_STATUS_LABELS,
  type Modal,
  type ProcessoImportacao,
} from '@/types/domain'

const CHAVE_COLUNAS = 'fiorini-comex:colunas-processos'

type ColunaId =
  | 'cliente'
  | 'estagio'
  | 'modal'
  | 'exportador'
  | 'referenciaCliente'
  | 'previsaoEmbarque'
  | 'previsaoChegada'
  | 'atualizadoEm'

const COLUNAS_DISPONIVEIS: { id: ColunaId; label: string }[] = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'estagio', label: 'Estágio' },
  { id: 'modal', label: 'Modal' },
  { id: 'exportador', label: 'Exportador' },
  { id: 'referenciaCliente', label: 'Referência cliente' },
  { id: 'previsaoEmbarque', label: 'Previsão de embarque' },
  { id: 'previsaoChegada', label: 'Previsão de chegada' },
  { id: 'atualizadoEm', label: 'Atualizado em' },
]

interface ColunaEstado {
  id: ColunaId
  visivel: boolean
}

function colunasIniciais(): ColunaEstado[] {
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

function celulaColuna(p: ProcessoImportacao, id: ColunaId) {
  switch (id) {
    case 'cliente':
      return getCliente(p.clienteId)?.nome ?? '—'
    case 'estagio':
      return <StatusBadge status={p.status} />
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

export default function ProcessosImportacao() {
  const { processos, criarProcesso } = useProcessos()
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [clienteFiltro, setClienteFiltro] = useState<string>('todos')
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null)
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [novoAberto, setNovoAberto] = useState(false)
  const [novoClienteId, setNovoClienteId] = useState('')
  const [novoModal, setNovoModal] = useState<Modal | ''>('')
  const [colunasAberto, setColunasAberto] = useState(false)
  const [colunas, setColunas] = useState<ColunaEstado[]>(colunasIniciais)

  useEffect(() => {
    localStorage.setItem(CHAVE_COLUNAS, JSON.stringify(colunas))
  }, [colunas])

  const colunasVisiveis = colunas.filter((c) => c.visivel)

  function alternarColuna(id: ColunaId) {
    setColunas((atual) => atual.map((c) => (c.id === id ? { ...c, visivel: !c.visivel } : c)))
  }

  function moverColuna(id: ColunaId, direcao: -1 | 1) {
    setColunas((atual) => {
      const index = atual.findIndex((c) => c.id === id)
      const novoIndex = index + direcao
      if (novoIndex < 0 || novoIndex >= atual.length) return atual
      const copia = [...atual]
      ;[copia[index], copia[novoIndex]] = [copia[novoIndex], copia[index]]
      return copia
    })
  }

  const selecionado = processos.find((p) => p.id === selecionadoId) ?? null

  const clientesUnicos = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of processos) {
      const cliente = getCliente(p.clienteId)
      if (cliente) map.set(cliente.id, cliente.nome)
    }
    return [...map.entries()]
  }, [processos])

  const processosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return processos.filter((p) => {
      const cliente = getCliente(p.clienteId)
      const combinaTermo =
        termo === '' ||
        p.numero.toLowerCase().includes(termo) ||
        cliente?.nome.toLowerCase().includes(termo)
      const combinaStatus = statusFiltro === 'todos' || p.status === statusFiltro
      const combinaCliente = clienteFiltro === 'todos' || p.clienteId === clienteFiltro
      return combinaTermo && combinaStatus && combinaCliente
    })
  }, [processos, busca, statusFiltro, clienteFiltro])

  function abrirProcesso(id: string) {
    setSelecionadoId(id)
    setDrawerAberto(true)
  }

  function criar() {
    if (!novoClienteId || !novoModal) return
    const novo = criarProcesso({ clienteId: novoClienteId, modal: novoModal })
    setNovoAberto(false)
    setNovoClienteId('')
    setNovoModal('')
    abrirProcesso(novo.id)
  }

  return (
    <div>
      <PageHeader
        title="Processos de Importação"
        description={`${processosFiltrados.length} de ${processos.length} processos`}
        actions={
          <Button size="sm" onClick={() => setNovoAberto(true)}>
            <Plus className="size-4" />
            Novo Processo
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 px-8 py-4">
        <div className="relative w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nº do PI ou cliente"
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Estágio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estágios</SelectItem>
            {PI_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {PI_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={clienteFiltro} onValueChange={setClienteFiltro}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os clientes</SelectItem>
            {clientesUnicos.map(([id, nome]) => (
              <SelectItem key={id} value={id}>
                {nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" variant="outline" className="ml-auto" onClick={() => setColunasAberto(true)}>
          <Columns3 className="size-4" />
          Colunas
        </Button>
      </div>

      <div className="px-8 pb-8">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº PI</TableHead>
                {colunasVisiveis.map((c) => (
                  <TableHead key={c.id}>
                    {COLUNAS_DISPONIVEIS.find((d) => d.id === c.id)?.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {processosFiltrados.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => abrirProcesso(p.id)}
                >
                  <TableCell className="font-medium">{p.numero}</TableCell>
                  {colunasVisiveis.map((c) => (
                    <TableCell
                      key={c.id}
                      className={c.id === 'atualizadoEm' ? 'text-muted-foreground' : undefined}
                    >
                      {celulaColuna(p, c.id)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {processosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={1 + colunasVisiveis.length}
                    className="text-muted-foreground py-10 text-center"
                  >
                    Nenhum processo encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={colunasAberto} onOpenChange={setColunasAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Colunas da tabela</DialogTitle>
            <DialogDescription>
              Escolha quais colunas exibir e a ordem entre elas. "Nº PI" é fixa.
            </DialogDescription>
          </DialogHeader>
          <ul className="flex flex-col gap-0.5">
            {colunas.map((c, i) => {
              const def = COLUNAS_DISPONIVEIS.find((d) => d.id === c.id)!
              return (
                <li
                  key={c.id}
                  className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1.5"
                >
                  <Checkbox
                    checked={c.visivel}
                    onCheckedChange={() => alternarColuna(c.id)}
                  />
                  <span className="flex-1 text-sm">{def.label}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6"
                    disabled={i === 0}
                    onClick={() => moverColuna(c.id, -1)}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6"
                    disabled={i === colunas.length - 1}
                    onClick={() => moverColuna(c.id, 1)}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                </li>
              )
            })}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={novoAberto} onOpenChange={setNovoAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Processo de Importação</DialogTitle>
            <DialogDescription>
              O número do PI é gerado automaticamente. Os demais dados podem ser
              preenchidos em seguida, no drawer do processo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novo-cliente">Cliente</Label>
              <Select value={novoClienteId} onValueChange={setNovoClienteId}>
                <SelectTrigger id="novo-cliente" className="w-full">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novo-modal">Modal</Label>
              <Select
                value={novoModal}
                onValueChange={(v) => setNovoModal(v as Modal)}
              >
                <SelectTrigger id="novo-modal" className="w-full">
                  <SelectValue placeholder="Selecione o modal" />
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={criar} disabled={!novoClienteId || !novoModal}>
              Criar processo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProcessoDrawer
        processo={selecionado}
        open={drawerAberto}
        onOpenChange={setDrawerAberto}
      />
    </div>
  )
}
