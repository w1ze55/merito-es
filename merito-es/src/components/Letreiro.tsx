import { useId } from 'react'
import { limparRegistro, useChamadas, type Chamada } from '../api/registro'
import { horaMinuto } from '../lib/formato'
import { Icone } from './Icone'

// O letreiro de LED do totem: mostra a última chamada à API e abre o registro completo.

function situacao(chamada: Chamada) {
  if (chamada.status === null) return 'falha'
  if (chamada.status >= 400) return 'erro'
  return 'ok'
}

function Status({ chamada }: { chamada: Chamada }) {
  return <span className="letreiro__status">{chamada.status ?? 'sem resposta'}</span>
}

export function Letreiro() {
  const chamadas = useChamadas()
  const painelId = useId()
  // Depois de uma escrita, a tela relê as listas; essas leituras não tiram a escrita do letreiro.
  const ultima =
    chamadas.find((chamada) => {
      if (chamada.metodo !== 'GET') return true
      const escrita = chamadas.find((outra) => outra.metodo !== 'GET' && outra.em <= chamada.em)
      return !escrita || chamada.em.getTime() - escrita.em.getTime() > 2000
    }) ?? chamadas[0]

  return (
    <>
      <button type="button" className="letreiro" popoverTarget={painelId}>
        {ultima ? (
          <span key={ultima.id} className="letreiro__linha passo" data-situacao={situacao(ultima)}>
            <span className="letreiro__chamada">
              <span className="letreiro__metodo">{ultima.metodo}</span> {ultima.caminho}
            </span>
            <span className="letreiro__meta">
              <Status chamada={ultima} /> · {ultima.ms} ms · {horaMinuto(ultima.em)}
            </span>
          </span>
        ) : (
          <span className="letreiro__linha letreiro__linha--apagada">
            <span className="letreiro__chamada">Aguardando chamadas à API</span>
            <span className="letreiro__meta">GET · POST · PUT · DELETE</span>
          </span>
        )}
        <span className="letreiro__abrir">
          <Icone nome="registro" tamanho={16} />
          {chamadas.length}
          <span className="visualmente-oculto"> chamadas. Abrir o registro</span>
        </span>
      </button>

      <div id={painelId} popover="auto" className="registro" aria-label="Registro de chamadas à API">
        <div className="registro__topo">
          <h2 className="registro__titulo">Chamadas à API</h2>
          <span className="registro__nota">Cada requisição feita por esta tela, da mais recente para a mais antiga.</span>
          <button type="button" className="registro__acao" onClick={limparRegistro} disabled={chamadas.length === 0}>
            Limpar
          </button>
          <button type="button" className="registro__acao registro__acao--icone" popoverTarget={painelId} popoverTargetAction="hide" aria-label="Fechar">
            <Icone nome="fechar" tamanho={18} />
          </button>
        </div>
        {chamadas.length === 0 ? (
          <p className="registro__vazio">Nenhuma chamada ainda. Navegue pelas telas ou cadastre algo para ver as requisições aqui.</p>
        ) : (
          <ol className="registro__lista">
            {chamadas.map((chamada) => (
              <li key={chamada.id} className="registro__item" data-situacao={situacao(chamada)}>
                <span className="registro__hora">{horaMinuto(chamada.em)}</span>
                <span className="registro__metodo">{chamada.metodo}</span>
                <span className="registro__caminho">{chamada.caminho}</span>
                <Status chamada={chamada} />
                <span className="registro__ms">{chamada.ms} ms</span>
                {(chamada.titulo || chamada.detalhe) && (
                  <span className="registro__problema">
                    {chamada.titulo && <strong>{chamada.titulo}</strong>}
                    {chamada.erros && chamada.erros.length > 0 ? (
                      <ul>
                        {chamada.erros.map((erro) => (
                          <li key={erro}>{erro}</li>
                        ))}
                      </ul>
                    ) : (
                      chamada.detalhe && <span> {chamada.detalhe}</span>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  )
}
