import { useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { abastecimentos as recursoAbastecimentos } from '../api/recursos'
import type { Abastecimento, BombaCombustivel } from '../api/types'
import { useCadastro } from '../api/useCadastro'
import { AvisoDeErro, Campo, Opcoes } from '../components/Campos'
import { ApiForaDoAr, CadeiaDeCadastro, FaltaCadastro } from '../components/Estados'
import { Icone } from '../components/Icone'
import { AcoesDaLinha, LinhaDeFalha, LinhasCarregando } from '../components/Linhas'
import { falhaDe, type FalhaNaLinha } from '../lib/falhaNaLinha'
import { Combustivel, Preco } from '../components/Preco'
import { Folha, Numero, Tela } from '../components/Tela'
import { errosDeCampo } from '../lib/errosDeCampo'
import { dataHora, decimalParaCampo, inteiro, lerDecimal, litros, moeda, paraCampoDataHora, precoPorLitro } from '../lib/formato'
import type { Tinta } from '../lib/tinta'
import { useDestaque } from '../lib/destaque'
import { useEdicao } from '../lib/useEdicao'
import { calcularValorTotal } from '../lib/valorTotal'

const CAMPOS = ['bombaId', 'dataAbastecimento', 'litros']

function agoraNoCampo() {
  return paraCampoDataHora(new Date())
}

function FormAbastecimento({
  registro,
  bombas,
  tintaDe,
  aoSalvar,
  aoCancelar,
}: {
  registro: Abastecimento | null
  bombas: BombaCombustivel[]
  tintaDe: (id: number) => Tinta
  aoSalvar: (salvo: Abastecimento) => void
  aoCancelar: () => void
}) {
  const salvar = recursoAbastecimentos.useSalvar()
  const [bombaId, setBombaId] = useState<number | null>(registro?.bomba.id ?? (bombas.length === 1 ? bombas[0].id : null))
  const [quantidade, setQuantidade] = useState(registro ? decimalParaCampo(registro.litros) : '')
  const [data, setData] = useState(registro ? registro.dataAbastecimento.slice(0, 16) : agoraNoCampo())
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const litrosRef = useRef<HTMLInputElement>(null)

  const bomba = bombas.find((item) => item.id === bombaId) ?? null
  const litrosLidos = lerDecimal(quantidade)
  const previa = bomba && litrosLidos !== null && litrosLidos > 0 ? calcularValorTotal(bomba.tipoCombustivel.precoPorLitro, litrosLidos) : null
  const erros = errosDeCampo(salvar.error, CAMPOS)

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (Number.isNaN(litrosLidos)) {
      setErroLocal('Digite a quantidade em litros, como 32,418.')
      return
    }
    setErroLocal(null)
    salvar.mutate(
      { id: registro?.id ?? null, dados: { bombaId, dataAbastecimento: data || null, litros: litrosLidos } },
      {
        onSuccess: (salvo) => {
          // No registro rápido a bomba continua escolhida: o próximo carro costuma ir na mesma.
          if (!registro) {
            setQuantidade('')
            setData(agoraNoCampo())
            litrosRef.current?.focus()
          }
          aoSalvar(salvo)
        },
      },
    )
  }

  return (
    <form className="formulario formulario--abastecimento" onSubmit={enviar} noValidate>
      <Opcoes legenda="Bomba" erro={erros.campos.bombaId}>
        {bombas.map((item) => {
          const tinta = tintaDe(item.tipoCombustivel.id)
          return (
            <label key={item.id} className="opcao opcao--bomba" style={{ '--tinta': tinta.fundo, '--tinta-texto': tinta.texto } as CSSProperties}>
              <input type="radio" name="bombaId" value={item.id} checked={bombaId === item.id} onChange={() => setBombaId(item.id)} />
              <span className="opcao__faixa">{item.tipoCombustivel.nome}</span>
              <span className="opcao__nome">{item.nome}</span>
              <span className="opcao__preco">
                <Preco valor={item.tipoCombustivel.precoPorLitro} porLitro />
              </span>
            </label>
          )
        })}
      </Opcoes>

      <div className="formulario__linha">
        <Campo rotulo="Litros" erro={erroLocal ?? erros.campos.litros} className="campo--litros">
          {(props) => (
            <span className="entrada-unidade">
              <input {...props} ref={litrosRef} className="entrada entrada--numero entrada--grande" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} inputMode="decimal" autoComplete="off" placeholder="0,000" autoFocus={registro !== null} />
              <span className="entrada-unidade__sufixo" aria-hidden="true">
                L
              </span>
            </span>
          )}
        </Campo>
        <Campo rotulo="Data e hora" erro={erros.campos.dataAbastecimento} className="campo--data">
          {(props) => <input {...props} type="datetime-local" className="entrada" value={data} max={agoraNoCampo()} onChange={(e) => setData(e.target.value)} />}
        </Campo>

        <div className="total">
          <span
            className="placa placa--total"
            style={(bomba ? { '--tinta': tintaDe(bomba.tipoCombustivel.id).fundo, '--tinta-texto': tintaDe(bomba.tipoCombustivel.id).texto } : {}) as CSSProperties}
            aria-live="polite"
          >
            <span className="placa__faixa">
              Total
              {bomba && <span className="total__combustivel"> · {bomba.tipoCombustivel.nome}</span>}
            </span>
            <span className="placa__valor">{previa === null ? 'R$ —' : moeda(previa)}</span>
          </span>
          <span className="total__nota">{bomba ? 'Prévia; a API calcula ao salvar' : 'Escolha a bomba para ver o total'}</span>
        </div>

        <div className="formulario__acoes">
          <button type="submit" className="botao botao--primario botao--grande" disabled={salvar.isPending} aria-busy={salvar.isPending || undefined}>
            {salvar.isPending ? 'Salvando…' : registro ? 'Salvar alterações' : 'Registrar'}
          </button>
          {registro && (
            <button type="button" className="botao botao--secundario botao--grande" onClick={aoCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </div>
      <div className="formulario__avisos">
        <AvisoDeErro mensagens={erros.gerais} />
      </div>
    </form>
  )
}

const semAcento = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

function useFiltros() {
  const [params, setParams] = useSearchParams()
  const filtros = {
    busca: params.get('busca') ?? '',
    bomba: params.get('bomba') ?? '',
    combustivel: params.get('combustivel') ?? '',
    de: params.get('de') ?? '',
    ate: params.get('ate') ?? '',
  }
  function mudar(campo: keyof typeof filtros, valor: string) {
    setParams(
      (atuais) => {
        const novos = new URLSearchParams(atuais)
        if (valor) novos.set(campo, valor)
        else novos.delete(campo)
        return novos
      },
      { replace: true },
    )
  }
  function limpar() {
    setParams(
      (atuais) => {
        const novos = new URLSearchParams()
        const editar = atuais.get('editar')
        if (editar) novos.set('editar', editar)
        return novos
      },
      { replace: true },
    )
  }
  const ativos = Object.values(filtros).some(Boolean)
  return { filtros, mudar, limpar, ativos }
}

export function Abastecimentos() {
  const { tipos, bombas, abastecimentos, tintaDe, carregando, apiForaDoAr, semConexao, recarregar } = useCadastro()
  const { idEmEdicao, editar, sairDaEdicao } = useEdicao()
  const { filtros, mudar, limpar, ativos } = useFiltros()
  const excluir = recursoAbastecimentos.useExcluir()
  const [destaque, setDestaque] = useDestaque('abastecimento')
  const [falha, setFalha] = useState<FalhaNaLinha | null>(null)

  const emEdicao = abastecimentos.find((item) => item.id === idEmEdicao) ?? null
  const ativo = idEmEdicao ?? destaque

  const filtrados = useMemo(() => {
    const busca = semAcento(filtros.busca.trim())
    return abastecimentos.filter((item) => {
      if (filtros.bomba && String(item.bomba.id) !== filtros.bomba) return false
      if (filtros.combustivel && String(item.bomba.tipoCombustivel.id) !== filtros.combustivel) return false
      const dia = item.dataAbastecimento.slice(0, 10)
      if (filtros.de && dia < filtros.de) return false
      if (filtros.ate && dia > filtros.ate) return false
      if (busca) {
        const alvo = semAcento(`${item.id} ${item.bomba.nome} ${item.bomba.tipoCombustivel.nome} ${dataHora(item.dataAbastecimento)}`)
        if (!alvo.includes(busca)) return false
      }
      return true
    })
  }, [abastecimentos, filtros.busca, filtros.bomba, filtros.combustivel, filtros.de, filtros.ate])

  const somaLitros = filtrados.reduce((soma, item) => soma + item.litros, 0)
  const somaValor = filtrados.reduce((soma, item) => soma + item.valorTotal, 0)
  const vazio = !carregando && abastecimentos.length === 0

  function aoExcluir(item: Abastecimento) {
    setFalha(null)
    setDestaque(null)
    excluir.mutate(item.id, {
      onSuccess: () => idEmEdicao === item.id && sairDaEdicao(),
      onError: (erro) => setFalha(falhaDe(item.id, erro)),
    })
  }


  if (semConexao) {
    return (
      <Tela titulo="Abastecimentos">
        <ApiForaDoAr aoTentar={recarregar} />
      </Tela>
    )
  }
  return (
    <Tela
      titulo="Abastecimentos"
      resumo={abastecimentos.length > 0 && `${inteiro(abastecimentos.length)} ${abastecimentos.length === 1 ? 'registro' : 'registros'}`}
    >
      {apiForaDoAr && <ApiForaDoAr aoTentar={recarregar} />}

      <Folha
        id="form-abastecimento"
        emEdicao={emEdicao !== null}
        titulo={
          emEdicao ? (
            <>
              Editando <Numero id={emEdicao.id} ativo /> {emEdicao.bomba.nome}, {dataHora(emEdicao.dataAbastecimento)}
            </>
          ) : (
            'Registrar abastecimento'
          )
        }
      >
        {emEdicao && (
          <p className="folha__nota">
            Ao salvar, a API recalcula o valor total com o preço atual de {emEdicao.bomba.tipoCombustivel.nome}, {precoPorLitro(emEdicao.bomba.tipoCombustivel.precoPorLitro)} por
            litro. Hoje ele vale {moeda(emEdicao.valorTotal)}.
          </p>
        )}
        {!carregando && bombas.length === 0 ? (
          <FaltaCadastro
            texto={tipos.length === 0 ? 'Para registrar um abastecimento é preciso ter um combustível e uma bomba.' : 'Para registrar um abastecimento é preciso ter ao menos uma bomba.'}
            para={tipos.length === 0 ? '/combustiveis' : '/bombas'}
            acao={tipos.length === 0 ? 'Cadastrar combustível' : 'Cadastrar bomba'}
          />
        ) : (
          <FormAbastecimento
            key={`${emEdicao?.id ?? 'novo'}-${bombas.length}`}
            registro={emEdicao}
            bombas={bombas}
            tintaDe={tintaDe}
            aoSalvar={(salvo) => {
              setFalha(null)
              setDestaque(salvo.id)
              if (emEdicao) sairDaEdicao()
            }}
            aoCancelar={sairDaEdicao}
          />
        )}
      </Folha>

      {vazio && !apiForaDoAr ? (
        <CadeiaDeCadastro />
      ) : (
        <Folha
          id="historico"
          titulo="Histórico"
          extra={
            <p className="folha__soma" aria-live="polite">
              {ativos ? `${inteiro(filtrados.length)} de ${inteiro(abastecimentos.length)}` : `${inteiro(filtrados.length)} ${filtrados.length === 1 ? 'abastecimento' : 'abastecimentos'}`}
              <span> · {litros(somaLitros)} · {moeda(somaValor)}</span>
            </p>
          }
        >
          <div className="filtros" role="search" aria-label="Filtrar histórico">
            <Campo rotulo="Buscar" className="filtros__busca">
              {(props) => (
                <span className="entrada-icone">
                  <Icone nome="busca" tamanho={18} />
                  <input {...props} type="search" className="entrada" value={filtros.busca} onChange={(e) => mudar('busca', e.target.value)} placeholder="Nº, bomba ou combustível" />
                </span>
              )}
            </Campo>
            <Campo rotulo="Bomba">
              {(props) => (
                <select {...props} className="entrada" value={filtros.bomba} onChange={(e) => mudar('bomba', e.target.value)}>
                  <option value="">Todas</option>
                  {bombas.map((bomba) => (
                    <option key={bomba.id} value={bomba.id}>
                      {bomba.nome}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
            <Campo rotulo="Combustível">
              {(props) => (
                <select {...props} className="entrada" value={filtros.combustivel} onChange={(e) => mudar('combustivel', e.target.value)}>
                  <option value="">Todos</option>
                  {tipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
            <Campo rotulo="De">
              {(props) => <input {...props} type="date" className="entrada" value={filtros.de} max={filtros.ate || undefined} onChange={(e) => mudar('de', e.target.value)} />}
            </Campo>
            <Campo rotulo="Até">
              {(props) => <input {...props} type="date" className="entrada" value={filtros.ate} min={filtros.de || undefined} onChange={(e) => mudar('ate', e.target.value)} />}
            </Campo>
            <button type="button" className="botao botao--texto filtros__limpar" onClick={limpar} disabled={!ativos}>
              Limpar filtros
            </button>
          </div>

          <div className="tabela-rolagem">
            <table className="tabela tabela--abastecimentos">
              <thead>
                <tr>
                  <th scope="col" className="col-numero">Nº</th>
                  <th scope="col" className="col-data">Data</th>
                  <th scope="col">Bomba</th>
                  <th scope="col">Combustível</th>
                  <th scope="col" className="col-valor">Litros</th>
                  <th scope="col" className="col-valor">Valor total</th>
                  <th scope="col" className="col-acoes"><span className="visualmente-oculto">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {carregando && abastecimentos.length === 0 && <LinhasCarregando colunas={7} />}
                {!carregando && abastecimentos.length > 0 && filtrados.length === 0 && (
                  <tr className="linha-vazia">
                    <td colSpan={7}>
                      Nenhum abastecimento corresponde aos filtros.{' '}
                      <button type="button" className="botao botao--texto botao--pequeno" onClick={limpar}>
                        Limpar filtros
                      </button>
                    </td>
                  </tr>
                )}
                {filtrados.map((item) => [
                  <tr key={item.id} data-ativo={ativo === item.id || undefined}>
                    <td className="col-numero"><Numero id={item.id} ativo={ativo === item.id} /></td>
                    <td className="col-data">{dataHora(item.dataAbastecimento)}</td>
                    <td className="col-forte">{item.bomba.nome}</td>
                    <td><Combustivel nome={item.bomba.tipoCombustivel.nome} tinta={tintaDe(item.bomba.tipoCombustivel.id)} /></td>
                    <td className="col-valor">{litros(item.litros)}</td>
                    <td className="col-valor col-forte">{moeda(item.valorTotal)}</td>
                    <td className="col-acoes">
                      <AcoesDaLinha
                        descricao={`abastecimento Nº ${item.id}`}
                        emEdicao={idEmEdicao === item.id}
                        excluindo={excluir.isPending && excluir.variables === item.id}
                        aoEditar={() => {
                          setFalha(null)
                          editar(item.id)
                        }}
                        aoExcluir={() => aoExcluir(item)}
                      />
                    </td>
                  </tr>,
                  falha?.id === item.id && <LinhaDeFalha key={`falha-${item.id}`} falha={falha} colunas={7} aoFechar={() => setFalha(null)} />,
                ])}
              </tbody>
            </table>
          </div>
        </Folha>
      )}
    </Tela>
  )
}
