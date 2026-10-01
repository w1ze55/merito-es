import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Icone } from '../components/Icone'

export function ErroDeRota() {
  const erro = useRouteError()
  const naoEncontrada = isRouteErrorResponse(erro) && erro.status === 404

  return (
    <div className="tela">
      <section className="folha fora-do-ar" role="alert">
        <div className="fora-do-ar__icone">
          <Icone nome="alerta" tamanho={28} />
        </div>
        <div className="fora-do-ar__texto">
          <h1 className="tela__titulo">{naoEncontrada ? 'Página não encontrada' : 'Algo deu errado nesta tela'}</h1>
          <p>
            {naoEncontrada
              ? 'O endereço não corresponde a nenhuma tela do sistema.'
              : 'Um erro inesperado interrompeu a tela. Os dados no banco não foram afetados.'}
          </p>
          <Link to="/" className="botao botao--primario">
            Voltar para a visão geral
          </Link>
        </div>
      </section>
    </div>
  )
}
