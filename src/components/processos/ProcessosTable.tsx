import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Columns3, GripVertical } from 'lucide-react'

import { StatusBadge } from '@/components/StatusBadge'
import { ModalIcon } from '@/components/ModalIcon'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { ProcessoImportacao } from '@/types/domain'
import {
  CHAVE_COLUNAS,
  COLUNAS_DISPONIVEIS,
  celulaColuna,
  colunasIniciais,
  type ColunaEstado,
  type ColunaId,
} from './colunas'

export function ProcessosTable({
  processos,
  onSelecionar,
}: {
  processos: ProcessoImportacao[]
  onSelecionar: (id: string) => void
}) {
  const [colunasAberto, setColunasAberto] = useState(false)
  const [colunas, setColunas] = useState<ColunaEstado[]>(colunasIniciais)
  const [buscaColuna, setBuscaColuna] = useState('')
  const [colunaArrastando, setColunaArrastando] = useState<ColunaId | null>(null)
  const [colunaSobre, setColunaSobre] = useState<ColunaId | null>(null)
  const [posicaoSobre, setPosicaoSobre] = useState<'antes' | 'depois' | null>(null)

  useEffect(() => {
    localStorage.setItem(CHAVE_COLUNAS, JSON.stringify(colunas))
  }, [colunas])

  const colunasVisiveis = colunas.filter((c) => c.visivel)
  const colunasFiltradas = buscaColuna.trim()
    ? colunas.filter((c) =>
        COLUNAS_DISPONIVEIS.find((d) => d.id === c.id)!
          .label.toLowerCase()
          .includes(buscaColuna.trim().toLowerCase()),
      )
    : colunas

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

  function reordenarColuna(idArrastado: ColunaId, idAlvo: ColunaId, posicao: 'antes' | 'depois') {
    if (idArrastado === idAlvo) return
    setColunas((atual) => {
      const colunaArrastada = atual.find((c) => c.id === idArrastado)
      if (!colunaArrastada) return atual
      const semArrastada = atual.filter((c) => c.id !== idArrastado)
      let indexAlvo = semArrastada.findIndex((c) => c.id === idAlvo)
      if (posicao === 'depois') indexAlvo += 1
      const copia = [...semArrastada]
      copia.splice(indexAlvo, 0, colunaArrastada)
      return copia
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setColunasAberto(true)}>
          <Columns3 className="size-4" />
          Colunas
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº PI</TableHead>
              {colunasVisiveis.map((c) => (
                <TableHead
                  key={c.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', c.id)
                    e.dataTransfer.effectAllowed = 'move'
                    setColunaArrastando(c.id)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    const rect = e.currentTarget.getBoundingClientRect()
                    const posicao = e.clientX - rect.left < rect.width / 2 ? 'antes' : 'depois'
                    setColunaSobre(c.id)
                    setPosicaoSobre(posicao)
                  }}
                  onDragLeave={() => {
                    setColunaSobre((atual) => (atual === c.id ? null : atual))
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const idArrastado = e.dataTransfer.getData('text/plain') as ColunaId
                    if (idArrastado && posicaoSobre) reordenarColuna(idArrastado, c.id, posicaoSobre)
                    setColunaArrastando(null)
                    setColunaSobre(null)
                    setPosicaoSobre(null)
                  }}
                  onDragEnd={() => {
                    setColunaArrastando(null)
                    setColunaSobre(null)
                    setPosicaoSobre(null)
                  }}
                  className={cn(
                    'relative cursor-grab select-none',
                    colunaArrastando === c.id && 'opacity-40',
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    <GripVertical className="text-muted-foreground/60 size-3.5" />
                    {COLUNAS_DISPONIVEIS.find((d) => d.id === c.id)?.label}
                  </span>
                  {colunaSobre === c.id && colunaArrastando !== c.id && (
                    <span
                      className={cn(
                        'bg-primary absolute inset-y-0 z-10 w-0.5 rounded-full',
                        posicaoSobre === 'antes' ? '-left-px' : '-right-px',
                      )}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processos.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => onSelecionar(p.id)}
              >
                <TableCell className="font-medium">{p.numero}</TableCell>
                {colunasVisiveis.map((c) => (
                  <TableCell
                    key={c.id}
                    className={c.id === 'atualizadoEm' ? 'text-muted-foreground' : undefined}
                  >
                    {c.id === 'estagio' && <StatusBadge status={p.status} />}
                    {c.id === 'modal' && (
                      <span className="inline-flex items-center gap-1.5">
                        <ModalIcon modal={p.modal} className="text-muted-foreground size-4" />
                        {celulaColuna(p, c.id)}
                      </span>
                    )}
                    {c.id !== 'estagio' && c.id !== 'modal' && celulaColuna(p, c.id)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {processos.length === 0 && (
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

      <Dialog open={colunasAberto} onOpenChange={setColunasAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Colunas da tabela</DialogTitle>
            <DialogDescription>
              Escolha quais colunas exibir e a ordem entre elas. "Nº PI" é fixa.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Buscar coluna..."
            value={buscaColuna}
            onChange={(e) => setBuscaColuna(e.target.value)}
            className="h-8"
          />
          <ul className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
            {colunasFiltradas.map((c) => {
              const def = COLUNAS_DISPONIVEIS.find((d) => d.id === c.id)!
              const i = colunas.findIndex((x) => x.id === c.id)
              return (
                <li
                  key={c.id}
                  className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1.5"
                >
                  <Checkbox checked={c.visivel} onCheckedChange={() => alternarColuna(c.id)} />
                  <span className="flex-1 text-sm">{def.label}</span>
                  {!buscaColuna.trim() && (
                    <>
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
                    </>
                  )}
                </li>
              )
            })}
            {buscaColuna.trim() && colunasFiltradas.length === 0 && (
              <li className="text-muted-foreground px-2 py-1.5 text-sm">
                Nenhuma coluna encontrada.
              </li>
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  )
}
