import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { EmpresasTable } from '@/components/empresas/EmpresasTable'
import { EmpresasCards } from '@/components/empresas/EmpresasCards'
import { EmpresaDrawer } from '@/components/empresas/EmpresaDrawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useEmpresasCadastradas } from '@/store/EmpresasCadastradasContext'

export default function EmpresasCadastro() {
  const { empresas, criarEmpresa } = useEmpresasCadastradas()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [busca, setBusca] = useState('')
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null)
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [novoAberto, setNovoAberto] = useState(false)
  const [novoNomeFantasia, setNovoNomeFantasia] = useState('')
  const [novoRazaoSocial, setNovoRazaoSocial] = useState('')
  const [novoCnpj, setNovoCnpj] = useState('')

  const selecionado = empresas.find((e) => e.id === selecionadoId) ?? null

  const empresasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return empresas
    return empresas.filter(
      (e) =>
        e.nomeFantasia.toLowerCase().includes(termo) ||
        e.razaoSocial.toLowerCase().includes(termo) ||
        e.cnpj.includes(termo),
    )
  }, [empresas, busca])

  function abrirEmpresa(id: string) {
    setSelecionadoId(id)
    setDrawerAberto(true)
  }

  function criar() {
    if (!novoNomeFantasia.trim() || !novoRazaoSocial.trim() || !novoCnpj.trim()) return
    const nova = criarEmpresa({
      nomeFantasia: novoNomeFantasia.trim(),
      razaoSocial: novoRazaoSocial.trim(),
      cnpj: novoCnpj.trim(),
    })
    setNovoAberto(false)
    setNovoNomeFantasia('')
    setNovoRazaoSocial('')
    setNovoCnpj('')
    abrirEmpresa(nova.id)
  }

  return (
    <div>
      <PageHeader
        title="Cadastro de Empresas"
        description={`${empresasFiltradas.length} de ${empresas.length} empresas`}
        actions={
          <Button size="sm" onClick={() => setNovoAberto(true)}>
            <Plus className="size-4" />
            Nova Empresa
          </Button>
        }
      />

      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-8">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome, razão social ou CNPJ"
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-8">
        {isDesktop ? (
          <EmpresasTable empresas={empresasFiltradas} onSelecionar={abrirEmpresa} />
        ) : (
          <EmpresasCards empresas={empresasFiltradas} onSelecionar={abrirEmpresa} />
        )}
      </div>

      <Dialog open={novoAberto} onOpenChange={setNovoAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
            <DialogDescription>
              Preencha os dados essenciais. Site, telefone, e-mail e contatos podem ser
              adicionados em seguida, no drawer da empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novo-nome-fantasia">Nome fantasia</Label>
              <Input
                id="novo-nome-fantasia"
                value={novoNomeFantasia}
                onChange={(e) => setNovoNomeFantasia(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novo-razao-social">Razão social</Label>
              <Input
                id="novo-razao-social"
                value={novoRazaoSocial}
                onChange={(e) => setNovoRazaoSocial(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novo-cnpj">CNPJ</Label>
              <Input
                id="novo-cnpj"
                placeholder="00.000.000/0001-00"
                value={novoCnpj}
                onChange={(e) => setNovoCnpj(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={criar}
              disabled={!novoNomeFantasia.trim() || !novoRazaoSocial.trim() || !novoCnpj.trim()}
            >
              Criar empresa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EmpresaDrawer empresa={selecionado} open={drawerAberto} onOpenChange={setDrawerAberto} />
    </div>
  )
}
