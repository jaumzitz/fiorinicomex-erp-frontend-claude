import { Plus, Users, X } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { EditableField } from '@/components/EditableField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useEmpresasCadastradas } from '@/store/EmpresasCadastradasContext'
import type { EmpresaCadastrada } from '@/types/domain'

export function EmpresaDrawer({
  empresa,
  open,
  onOpenChange,
}: {
  empresa: EmpresaCadastrada | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { atualizarEmpresa, adicionarContato, atualizarContato, removerContato } =
    useEmpresasCadastradas()

  if (!empresa) return null

  function patch(campo: keyof EmpresaCadastrada, valor: string) {
    atualizarEmpresa(empresa!.id, { [campo]: valor })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-lg">{empresa.nomeFantasia || 'Nova empresa'}</SheetTitle>
          <SheetDescription>{empresa.razaoSocial}</SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-5">
          <EditableField
            label="Nome fantasia"
            value={empresa.nomeFantasia}
            onChange={(v) => patch('nomeFantasia', v)}
          />
          <EditableField
            label="Razão social"
            value={empresa.razaoSocial}
            onChange={(v) => patch('razaoSocial', v)}
          />
          <EditableField label="CNPJ" value={empresa.cnpj} onChange={(v) => patch('cnpj', v)} />
          <EditableField
            label="Site"
            type="url"
            value={empresa.site ?? ''}
            onChange={(v) => patch('site', v)}
          />
          <EditableField
            label="Telefone"
            type="tel"
            value={empresa.telefone ?? ''}
            onChange={(v) => patch('telefone', v)}
          />
          <EditableField
            label="E-mail"
            type="email"
            value={empresa.email ?? ''}
            onChange={(v) => patch('email', v)}
          />
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="size-4" />
              Contatos
              <Badge variant="secondary">{empresa.contatos.length}</Badge>
            </div>
            <Button size="sm" variant="outline" onClick={() => adicionarContato(empresa.id)}>
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>

          {empresa.contatos.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum contato cadastrado.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {empresa.contatos.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center"
                >
                  <Input
                    placeholder="Nome"
                    value={c.nome}
                    onChange={(e) =>
                      atualizarContato(empresa.id, c.id, { nome: e.target.value })
                    }
                    className="h-8 flex-1"
                  />
                  <Input
                    placeholder="Telefone"
                    value={c.telefone ?? ''}
                    onChange={(e) =>
                      atualizarContato(empresa.id, c.id, { telefone: e.target.value })
                    }
                    className="h-8 flex-1"
                  />
                  <Input
                    placeholder="E-mail"
                    value={c.email ?? ''}
                    onChange={(e) =>
                      atualizarContato(empresa.id, c.id, { email: e.target.value })
                    }
                    className="h-8 flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                    onClick={() => removerContato(empresa.id, c.id)}
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
