import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { ProcessoDrawer } from '@/components/ProcessoDrawer'
import { Input } from '@/components/ui/input'
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
import { processos } from '@/data/mock-data'
import { getCliente } from '@/lib/domain-queries'
import { MODAL_LABELS, PI_STATUSES, PI_STATUS_LABELS, type ProcessoImportacao } from '@/types/domain'

export default function ProcessosImportacao() {
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [clienteFiltro, setClienteFiltro] = useState<string>('todos')
  const [selecionado, setSelecionado] = useState<ProcessoImportacao | null>(null)
  const [drawerAberto, setDrawerAberto] = useState(false)

  const clientesUnicos = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of processos) {
      const cliente = getCliente(p.clienteId)
      if (cliente) map.set(cliente.id, cliente.nome)
    }
    return [...map.entries()]
  }, [])

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
  }, [busca, statusFiltro, clienteFiltro])

  function abrirProcesso(p: ProcessoImportacao) {
    setSelecionado(p)
    setDrawerAberto(true)
  }

  return (
    <div>
      <PageHeader
        title="Processos de Importação"
        description={`${processosFiltrados.length} de ${processos.length} processos`}
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
      </div>

      <div className="px-8 pb-8">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº PI</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead>Modal</TableHead>
                <TableHead>Previsão de embarque</TableHead>
                <TableHead>Previsão de chegada</TableHead>
                <TableHead>Atualizado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processosFiltrados.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => abrirProcesso(p)}
                >
                  <TableCell className="font-medium">{p.numero}</TableCell>
                  <TableCell>{getCliente(p.clienteId)?.nome}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>{MODAL_LABELS[p.modal]}</TableCell>
                  <TableCell>{p.previsaoEmbarque ?? '—'}</TableCell>
                  <TableCell>{p.previsaoChegada ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.atualizadoEm}
                  </TableCell>
                </TableRow>
              ))}
              {processosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
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

      <ProcessoDrawer
        processo={selecionado}
        open={drawerAberto}
        onOpenChange={setDrawerAberto}
      />
    </div>
  )
}
