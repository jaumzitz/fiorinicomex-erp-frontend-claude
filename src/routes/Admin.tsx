import { useRef, useState } from 'react'
import { Plus, Upload } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEmpresaConfig } from '@/store/EmpresaConfigContext'
import { useTributosCatalogo } from '@/store/TributosCatalogoContext'
import type { EmpresaConfig } from '@/types/domain'

const FILTROS_TRIBUTO = [
  { id: 'todos', label: 'Todos' },
  { id: 'ativos', label: 'Ativos' },
  { id: 'inativos', label: 'Inativos' },
] as const

type FiltroTributo = (typeof FILTROS_TRIBUTO)[number]['id']

function Campo({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function CampoImagem({
  label,
  descricao,
  url,
  onSelecionar,
}: {
  label: string
  descricao: string
  url?: string
  onSelecionar: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <p className="text-muted-foreground text-xs">{descricao}</p>
      <div className="flex items-center gap-3">
        <div className="bg-muted flex h-16 w-32 items-center justify-center overflow-hidden rounded-md border">
          {url ? (
            <img src={url} alt={label} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-muted-foreground text-xs">Sem imagem</span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="size-4" />
          Enviar
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onSelecionar(file)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}

export default function Admin() {
  const { empresa, atualizarEmpresa } = useEmpresaConfig()
  const { tributosCatalogo, adicionarTributoCatalogo, alternarAtivoTributoCatalogo } =
    useTributosCatalogo()
  const [novoTributo, setNovoTributo] = useState('')
  const [filtroTributo, setFiltroTributo] = useState<FiltroTributo>('todos')

  const tributosFiltrados = tributosCatalogo.filter((t) => {
    if (filtroTributo === 'ativos') return t.ativo
    if (filtroTributo === 'inativos') return !t.ativo
    return true
  })

  function adicionarTributoAtual() {
    const valor = novoTributo.trim()
    if (!valor) return
    adicionarTributoCatalogo(valor)
    setNovoTributo('')
  }

  function campo(chave: keyof EmpresaConfig) {
    return (valor: string) => atualizarEmpresa({ [chave]: valor })
  }

  function campoBancario(chave: keyof EmpresaConfig['dadosBancarios']) {
    return (valor: string) =>
      atualizarEmpresa({ dadosBancarios: { ...empresa.dadosBancarios, [chave]: valor } })
  }

  return (
    <div>
      <PageHeader
        title="Administração"
        description="Dados da empresa, identidade e usuários"
      />

      <div className="flex flex-col gap-6 px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo id="nome-empresa" label="Nome" value={empresa.nome} onChange={campo('nome')} />
              <Campo
                id="cnpj-empresa"
                label="CNPJ"
                value={empresa.cnpj}
                placeholder="00.000.000/0001-00"
                onChange={campo('cnpj')}
              />
              <Campo
                id="responsavel-empresa"
                label="Responsável"
                value={empresa.responsavel}
                onChange={campo('responsavel')}
              />
              <Campo
                id="telefone-empresa"
                label="Telefone"
                value={empresa.telefone}
                onChange={campo('telefone')}
              />
              <div className="sm:col-span-2">
                <Campo
                  id="endereco-empresa"
                  label="Endereço"
                  value={empresa.endereco}
                  onChange={campo('endereco')}
                />
              </div>
              <div className="sm:col-span-2">
                <Campo id="email-empresa" label="E-mail" value={empresa.email} onChange={campo('email')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados para pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Campo
                  id="razao-social"
                  label="Razão social"
                  value={empresa.razaoSocial}
                  onChange={campo('razaoSocial')}
                />
              </div>
              <Campo
                id="banco"
                label="Banco"
                value={empresa.dadosBancarios.banco}
                onChange={campoBancario('banco')}
              />
              <Campo
                id="agencia"
                label="Agência"
                value={empresa.dadosBancarios.agencia}
                onChange={campoBancario('agencia')}
              />
              <Campo
                id="conta"
                label="Conta corrente"
                value={empresa.dadosBancarios.conta}
                onChange={campoBancario('conta')}
              />
              <Campo
                id="pix"
                label="PIX"
                value={empresa.dadosBancarios.pix}
                onChange={campoBancario('pix')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-lg flex-col gap-5">
              <CampoImagem
                label="Logo horizontal"
                descricao="Usado no cabeçalho do Numerário e em outros documentos gerados."
                url={empresa.logoHorizontalUrl}
                onSelecionar={(file) =>
                  atualizarEmpresa({ logoHorizontalUrl: URL.createObjectURL(file) })
                }
              />
              <CampoImagem
                label="Ícone"
                descricao="Usado no menu lateral e como favicon do sistema."
                url={empresa.iconeUrl}
                onSelecionar={(file) => atualizarEmpresa({ iconeUrl: URL.createObjectURL(file) })}
              />
              <p className="text-muted-foreground text-xs">
                Upload local por enquanto — o armazenamento real das imagens entra
                quando o back-end (Supabase Storage) for integrado.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tributos e despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-lg flex-col gap-4">
              <p className="text-muted-foreground text-xs">
                Itens disponíveis para seleção ao cadastrar tributos e despesas no
                numerário dos processos. Itens inativos deixam de aparecer para
                seleção, mas não são excluídos.
              </p>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Novo tributo ou despesa..."
                  value={novoTributo}
                  onChange={(e) => setNovoTributo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      adicionarTributoAtual()
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={adicionarTributoAtual}
                  disabled={!novoTributo.trim()}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <Select value={filtroTributo} onValueChange={(v) => setFiltroTributo(v as FiltroTributo)}>
                <SelectTrigger size="sm" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTROS_TRIBUTO.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {tributosFiltrados.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum item encontrado.</p>
              ) : (
                <ul className="flex flex-col divide-y rounded-md border">
                  {tributosFiltrados.map((t) => (
                    <li
                      key={t.nome}
                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span className={t.ativo ? '' : 'text-muted-foreground line-through'}>
                        {t.nome}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant={t.ativo ? 'default' : 'outline'} className="text-xs">
                          {t.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alternarAtivoTributoCatalogo(t.nome)}
                        >
                          {t.ativo ? 'Inativar' : 'Ativar'}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Operação de um único usuário administrativo — gestão de múltiplos
              usuários fica para quando fizer sentido para a operação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
