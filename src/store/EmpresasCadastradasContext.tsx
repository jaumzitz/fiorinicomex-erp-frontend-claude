import { createContext, useContext, useState, type ReactNode } from 'react'

import { empresas as empresasIniciais } from '@/data/mock-data'
import type { ContatoEmpresa, Empresa, TipoRelacionamentoEmpresa } from '@/types/domain'

interface EmpresasCadastradasContextValue {
  empresas: Empresa[]
  criarEmpresa: (dados: {
    nomeFantasia: string
    razaoSocial: string
    tiposRelacionamento: TipoRelacionamentoEmpresa[]
    estrangeira: boolean
    cnpj?: string
  }) => Empresa
  atualizarEmpresa: (id: string, patch: Partial<Empresa>) => void
  alternarAtivoEmpresa: (id: string) => void
  adicionarContato: (empresaId: string) => void
  atualizarContato: (empresaId: string, contatoId: string, patch: Partial<ContatoEmpresa>) => void
  inativarContato: (empresaId: string, contatoId: string) => void
}

const EmpresasCadastradasContext = createContext<EmpresasCadastradasContextValue | null>(null)

export function EmpresasCadastradasProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>(empresasIniciais)

  function criarEmpresa(dados: {
    nomeFantasia: string
    razaoSocial: string
    tiposRelacionamento: TipoRelacionamentoEmpresa[]
    estrangeira: boolean
    cnpj?: string
  }) {
    const nova: Empresa = {
      id: crypto.randomUUID(),
      contatos: [],
      ativo: true,
      ...dados,
    }
    setEmpresas((atual) => [nova, ...atual])
    return nova
  }

  function atualizarEmpresa(id: string, patch: Partial<Empresa>) {
    setEmpresas((atual) => atual.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function alternarAtivoEmpresa(id: string) {
    setEmpresas((atual) => atual.map((e) => (e.id === id ? { ...e, ativo: !e.ativo } : e)))
  }

  function adicionarContato(empresaId: string) {
    setEmpresas((atual) =>
      atual.map((e) =>
        e.id === empresaId
          ? { ...e, contatos: [...e.contatos, { id: crypto.randomUUID(), nome: '', ativo: true }] }
          : e,
      ),
    )
  }

  function atualizarContato(empresaId: string, contatoId: string, patch: Partial<ContatoEmpresa>) {
    setEmpresas((atual) =>
      atual.map((e) =>
        e.id === empresaId
          ? {
              ...e,
              contatos: e.contatos.map((c) => (c.id === contatoId ? { ...c, ...patch } : c)),
            }
          : e,
      ),
    )
  }

  function inativarContato(empresaId: string, contatoId: string) {
    setEmpresas((atual) =>
      atual.map((e) =>
        e.id === empresaId
          ? {
              ...e,
              contatos: e.contatos.map((c) =>
                c.id === contatoId ? { ...c, ativo: false } : c,
              ),
            }
          : e,
      ),
    )
  }

  return (
    <EmpresasCadastradasContext.Provider
      value={{
        empresas,
        criarEmpresa,
        atualizarEmpresa,
        alternarAtivoEmpresa,
        adicionarContato,
        atualizarContato,
        inativarContato,
      }}
    >
      {children}
    </EmpresasCadastradasContext.Provider>
  )
}

export function useEmpresasCadastradas() {
  const ctx = useContext(EmpresasCadastradasContext)
  if (!ctx) {
    throw new Error('useEmpresasCadastradas deve ser usado dentro de EmpresasCadastradasProvider')
  }
  return ctx
}
