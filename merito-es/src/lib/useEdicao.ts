import { useSearchParams } from 'react-router'

// O registro em edição fica na URL (?editar=12): dá para recarregar, voltar e compartilhar o link.
export function useEdicao() {
  const [params, setParams] = useSearchParams()
  const valor = Number(params.get('editar'))
  const idEmEdicao = Number.isInteger(valor) && valor > 0 ? valor : null

  function mudar(id: number | null) {
    setParams(
      (atuais) => {
        const novos = new URLSearchParams(atuais)
        if (id === null) novos.delete('editar')
        else novos.set('editar', String(id))
        return novos
      },
      { replace: true },
    )
  }

  function editar(id: number) {
    mudar(id)
    // O formulário fica no topo da tela, como no Swing: leva o usuário até ele.
    window.scrollTo({ top: 0 })
  }

  return { idEmEdicao, editar, sairDaEdicao: () => mudar(null) }
}
