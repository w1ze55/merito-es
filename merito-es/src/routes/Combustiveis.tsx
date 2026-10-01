import { useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { tiposCombustivel } from '../api/recursos'
import type { TipoCombustivel } from '../api/types'
import { useCadastro } from '../api/useCadastro'
import { AvisoDeErro, Campo } from '../components/Campos'
import { ApiForaDoAr } from '../components/Estados'
import { Icone } from '../components/Icone'
import { AcoesDaLinha, LinhaDeFalha, LinhasCarregando } from '../components/Linhas'
import { falhaDe, type FalhaNaLinha } from '../lib/falhaNaLinha'
import { Combustivel, Preco } from '../components/Preco'
import { Folha, Numero, Tela } from '../components/Tela'
import { errosDeCampo } from '../lib/errosDeCampo'
import { decimalParaCampo, inteiro, lerDecimal, precoPorLitro } from '../lib/formato'
import { mapaDeTintas } from '../lib/tinta'
import { useDestaque } from '../lib/destaque'
import { useEdicao } from '../lib/useEdicao'

const CAMPOS = ['nome', 'precoPorLitro']

function FormCombustivel({
  registro,
  tipos,
  aoSalvar,
  aoCancelar,
}: {
  registro: TipoCombustivel | null
  tipos: TipoCombustivel[]
  aoSalvar: (salvo: TipoCombustivel) => void
  aoCancelar: () => void
}) {
  const salvar = tiposCombustivel.useSalvar()
  const [nome, setNome] = useState(registro?.nome ?? '')
  const [preco, setPreco] = useState(registro ? decimalParaCampo(registro.precoPorLitro) : '')
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const nomeRef = useRef<HTMLInputElement>(null)

  const precoLido = lerDecimal(preco)
  const erros = errosDeCampo(salvar.error, CAMPOS)
  const erroPreco = erroLocal ?? erros.campos.precoPorLitro

  // A placa de prévia usa a tinta que o combustível vai ganhar com este nome.
  const idPrevia = registro?.id ?? Number.MAX_SAFE_INTEGER
  const tinta = mapaDeTintas([...tipos.filter((tipo) => tipo.id !== idPrevia), { id: idPrevia, nome, precoPorLitro: 0 }], false).get(idPrevia)!

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (Number.isNaN(precoLido)) {
      setErroLocal('Digite o preço em reais, como 6,299.')
      return
    }
    setErroLocal(null)
    salvar.mutate(
      { id: registro?.id ?? null, dados: { nome, precoPorLitro: precoLido } },
      {
        onSuccess: (salvo) => {
          if (!registro) {
            setNome('')
            setPreco('')
            nomeRef.current?.focus()
          }
          aoSalvar(salvo)
        },
      },
    )
  }

  return (
    <form className="formulario formulario--combustivel" onSubmit={enviar} noValidate>
      <Campo rotulo="Nome" erro={erros.campos.nome}>
        {(props) => <input {...props} ref={nomeRef} className="entrada" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} autoComplete="off" placeholder="Ex.: Gasolina comum" autoFocus={registro !== null} />}
      </Campo>
      <Campo rotulo="Preço por litro" erro={erroPreco} dica="Até 3 casas decimais, como na bomba.">
        {(props) => (
          <span className="entrada-moeda">
            <span className="entrada-moeda__prefixo" aria-hidden="true">
              R$
            </span>
            <input {...props} className="entrada entrada--numero" value={preco} onChange={(e) => setPreco(e.target.value)} inputMode="decimal" autoComplete="off" placeholder="0,000" />
          </span>
        )}
      </Campo>

      <div className="previa" aria-hidden="true">
        <span className="previa__rotulo">No totem</span>
        <span className="placa placa--previa" style={{ '--tinta': tinta.fundo, '--tinta-texto': tinta.texto } as CSSProperties}>
          <span className="placa__faixa">{nome.trim() || 'Nome do combustível'}</span>
          <span className="placa__valor">
            <Preco valor={precoLido !== null && !Number.isNaN(precoLido) ? precoLido : 0} porLitro />
          </span>
        </span>
      </div>

      <div className="formulario__acoes">
        <button type="submit" className="botao botao--primario" disabled={salvar.isPending} aria-busy={salvar.isPending || undefined}>
          {salvar.isPending ? 'Salvando…' : registro ? 'Salvar alterações' : 'Cadastrar combustível'}
        </button>
        {registro && (
          <button type="button" className="botao botao--secundario" onClick={aoCancelar}>
            Cancelar
          </button>
        )}
      </div>
      <div className="formulario__avisos">
        <AvisoDeErro mensagens={erros.gerais} />
      </div>
    </form>
  )
}

export function Combustiveis() {
  const { tipos, bombasPorTipo, tintaDe, carregando, apiForaDoAr, semConexao, recarregar } = useCadastro()
  const { idEmEdicao, editar, sairDaEdicao } = useEdicao()
  const excluir = tiposCombustivel.useExcluir()
  const [destaque, setDestaque] = useDestaque('combustivel')
  const [falha, setFalha] = useState<FalhaNaLinha | null>(null)

  const emEdicao = tipos.find((tipo) => tipo.id === idEmEdicao) ?? null
  const ativo = idEmEdicao ?? destaque

  function aoExcluir(tipo: TipoCombustivel) {
    setFalha(null)
    setDestaque(null)
    excluir.mutate(tipo.id, {
      onSuccess: () => idEmEdicao === tipo.id && sairDaEdicao(),
      onError: (erro) => setFalha(falhaDe(tipo.id, erro)),
    })
  }


  if (semConexao) {
    return (
      <Tela titulo="Combustíveis">
        <ApiForaDoAr aoTentar={recarregar} />
      </Tela>
    )
  }
  return (
    <Tela titulo="Combustíveis" resumo={tipos.length > 0 && `${inteiro(tipos.length)} ${tipos.length === 1 ? 'tipo cadastrado' : 'tipos cadastrados'}`}>
      {apiForaDoAr && <ApiForaDoAr aoTentar={recarregar} />}

      <Folha
        id="form-combustivel"
        emEdicao={emEdicao !== null}
        titulo={
          emEdicao ? (
            <>
              Editando <Numero id={emEdicao.id} ativo /> {emEdicao.nome}
            </>
          ) : (
            'Novo combustível'
          )
        }
      >
        {emEdicao && (
          <p className="folha__nota">
            Abastecimentos já registrados mantêm o valor total. O novo preço vale para os próximos e para os que forem editados.
          </p>
        )}
        <FormCombustivel
          key={emEdicao?.id ?? 'novo'}
          registro={emEdicao}
          tipos={tipos}
          aoSalvar={(salvo) => {
            setFalha(null)
            setDestaque(salvo.id)
            if (emEdicao) sairDaEdicao()
          }}
          aoCancelar={sairDaEdicao}
        />
      </Folha>

      <Folha id="lista-combustiveis" titulo="Cadastrados">
        <div className="tabela-rolagem">
          <table className="tabela tabela--combustiveis">
            <thead>
              <tr>
                <th scope="col" className="col-numero">Nº</th>
                <th scope="col">Combustível</th>
                <th scope="col" className="col-valor">Preço por litro</th>
                <th scope="col" className="col-valor">Bombas</th>
                <th scope="col" className="col-acoes"><span className="visualmente-oculto">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {carregando && tipos.length === 0 && <LinhasCarregando colunas={5} linhas={3} />}
              {!carregando && tipos.length === 0 && (
                <tr className="linha-vazia">
                  <td colSpan={5}>Nenhum combustível cadastrado. Use o formulário acima para cadastrar o primeiro.</td>
                </tr>
              )}
              {tipos.map((tipo) => {
                const nBombas = bombasPorTipo.get(tipo.id) ?? 0
                return [
                  <tr key={tipo.id} data-ativo={ativo === tipo.id || undefined}>
                    <td className="col-numero"><Numero id={tipo.id} ativo={ativo === tipo.id} /></td>
                    <td><Combustivel nome={tipo.nome} tinta={tintaDe(tipo.id)} /></td>
                    <td className="col-valor"><Preco valor={tipo.precoPorLitro} /></td>
                    <td className="col-valor" data-rotulo="Bombas">{nBombas === 0 ? <span className="apagado">nenhuma</span> : inteiro(nBombas)}</td>
                    <td className="col-acoes">
                      <AcoesDaLinha
                        descricao={`${tipo.nome} (${precoPorLitro(tipo.precoPorLitro)})`}
                        emEdicao={idEmEdicao === tipo.id}
                        excluindo={excluir.isPending && excluir.variables === tipo.id}
                        aoEditar={() => {
                          setFalha(null)
                          editar(tipo.id)
                        }}
                        aoExcluir={() => aoExcluir(tipo)}
                      />
                    </td>
                  </tr>,
                  falha?.id === tipo.id && <LinhaDeFalha key={`falha-${tipo.id}`} falha={falha} colunas={5} aoFechar={() => setFalha(null)} />,
                ]
              })}
            </tbody>
          </table>
        </div>
        {tipos.length > 0 && (
          <p className="folha__rodape">
            <Icone nome="alerta" tamanho={16} />
            Um combustível com bombas vinculadas não pode ser excluído; a API recusa com 409.
          </p>
        )}
      </Folha>
    </Tela>
  )
}
