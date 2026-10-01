import { useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { bombas as recursoBombas } from '../api/recursos'
import type { BombaCombustivel, TipoCombustivel } from '../api/types'
import { useCadastro } from '../api/useCadastro'
import { AvisoDeErro, Campo, Opcoes } from '../components/Campos'
import { ApiForaDoAr, FaltaCadastro } from '../components/Estados'
import { Icone } from '../components/Icone'
import { AcoesDaLinha, LinhaDeFalha, LinhasCarregando } from '../components/Linhas'
import { falhaDe, type FalhaNaLinha } from '../lib/falhaNaLinha'
import { Combustivel, Preco } from '../components/Preco'
import { Folha, Numero, Tela } from '../components/Tela'
import { errosDeCampo } from '../lib/errosDeCampo'
import { inteiro, litros } from '../lib/formato'
import type { Tinta } from '../lib/tinta'
import { useDestaque } from '../lib/destaque'
import { useEdicao } from '../lib/useEdicao'

const CAMPOS = ['nome', 'tipoCombustivelId']

function FormBomba({
  registro,
  tipos,
  tintaDe,
  aoSalvar,
  aoCancelar,
}: {
  registro: BombaCombustivel | null
  tipos: TipoCombustivel[]
  tintaDe: (id: number) => Tinta
  aoSalvar: (salva: BombaCombustivel) => void
  aoCancelar: () => void
}) {
  const salvar = recursoBombas.useSalvar()
  const [nome, setNome] = useState(registro?.nome ?? '')
  const [tipoId, setTipoId] = useState<number | null>(registro?.tipoCombustivel.id ?? (tipos.length === 1 ? tipos[0].id : null))
  const nomeRef = useRef<HTMLInputElement>(null)
  const erros = errosDeCampo(salvar.error, CAMPOS)

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    salvar.mutate(
      { id: registro?.id ?? null, dados: { nome, tipoCombustivelId: tipoId } },
      {
        onSuccess: (salva) => {
          if (!registro) {
            setNome('')
            nomeRef.current?.focus()
          }
          aoSalvar(salva)
        },
      },
    )
  }

  return (
    <form className="formulario formulario--bomba" onSubmit={enviar} noValidate>
      <Campo rotulo="Nome" erro={erros.campos.nome}>
        {(props) => <input {...props} ref={nomeRef} className="entrada" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} autoComplete="off" placeholder="Ex.: Bomba 07" autoFocus={registro !== null} />}
      </Campo>

      <Opcoes legenda="Combustível" erro={erros.campos.tipoCombustivelId}>
        {tipos.map((tipo) => {
          const tinta = tintaDe(tipo.id)
          return (
            <label key={tipo.id} className="opcao opcao--combustivel" style={{ '--tinta': tinta.fundo, '--tinta-texto': tinta.texto } as CSSProperties}>
              <input type="radio" name="tipoCombustivelId" value={tipo.id} checked={tipoId === tipo.id} onChange={() => setTipoId(tipo.id)} />
              <span className="opcao__faixa">{tipo.nome}</span>
              <span className="opcao__preco">
                <Preco valor={tipo.precoPorLitro} porLitro />
              </span>
            </label>
          )
        })}
      </Opcoes>

      <div className="formulario__acoes">
        <button type="submit" className="botao botao--primario" disabled={salvar.isPending} aria-busy={salvar.isPending || undefined}>
          {salvar.isPending ? 'Salvando…' : registro ? 'Salvar alterações' : 'Cadastrar bomba'}
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

export function Bombas() {
  const { tipos, bombas, abastecimentos, abastecimentosPorBomba, tintaDe, carregando, apiForaDoAr, semConexao, recarregar } = useCadastro()
  const { idEmEdicao, editar, sairDaEdicao } = useEdicao()
  const excluir = recursoBombas.useExcluir()
  const [destaque, setDestaque] = useDestaque('bomba')
  const [falha, setFalha] = useState<FalhaNaLinha | null>(null)

  const emEdicao = bombas.find((bomba) => bomba.id === idEmEdicao) ?? null
  const ativo = idEmEdicao ?? destaque

  const litrosPorBomba = new Map<number, number>()
  for (const item of abastecimentos) litrosPorBomba.set(item.bomba.id, (litrosPorBomba.get(item.bomba.id) ?? 0) + item.litros)

  function aoExcluir(bomba: BombaCombustivel) {
    setFalha(null)
    setDestaque(null)
    excluir.mutate(bomba.id, {
      onSuccess: () => idEmEdicao === bomba.id && sairDaEdicao(),
      onError: (erro) => setFalha(falhaDe(bomba.id, erro)),
    })
  }


  if (semConexao) {
    return (
      <Tela titulo="Bombas">
        <ApiForaDoAr aoTentar={recarregar} />
      </Tela>
    )
  }
  return (
    <Tela titulo="Bombas" resumo={bombas.length > 0 && `${inteiro(bombas.length)} ${bombas.length === 1 ? 'bomba' : 'bombas'} na pista`}>
      {apiForaDoAr && <ApiForaDoAr aoTentar={recarregar} />}

      <Folha
        id="form-bomba"
        emEdicao={emEdicao !== null}
        titulo={
          emEdicao ? (
            <>
              Editando <Numero id={emEdicao.id} ativo /> {emEdicao.nome}
            </>
          ) : (
            'Nova bomba'
          )
        }
      >
        {!carregando && tipos.length === 0 ? (
          <FaltaCadastro texto="Toda bomba abastece um combustível, e ainda não há nenhum cadastrado." para="/combustiveis" acao="Cadastrar combustível" />
        ) : (
          <FormBomba key={`${emEdicao?.id ?? 'novo'}-${tipos.length}`} registro={emEdicao} tipos={tipos} tintaDe={tintaDe} aoSalvar={(salva) => {
            setFalha(null)
            setDestaque(salva.id)
            if (emEdicao) sairDaEdicao()
          }} aoCancelar={sairDaEdicao} />
        )}
      </Folha>

      <Folha id="lista-bombas" titulo="Na pista">
        <div className="tabela-rolagem">
          <table className="tabela tabela--bombas">
            <thead>
              <tr>
                <th scope="col" className="col-numero">Nº</th>
                <th scope="col">Bomba</th>
                <th scope="col">Combustível</th>
                <th scope="col" className="col-valor">Preço por litro</th>
                <th scope="col" className="col-valor">Abastecimentos</th>
                <th scope="col" className="col-valor">Litros</th>
                <th scope="col" className="col-acoes"><span className="visualmente-oculto">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {carregando && bombas.length === 0 && <LinhasCarregando colunas={7} linhas={4} />}
              {!carregando && bombas.length === 0 && (
                <tr className="linha-vazia">
                  <td colSpan={7}>Nenhuma bomba cadastrada.</td>
                </tr>
              )}
              {bombas.map((bomba) => {
                const n = abastecimentosPorBomba.get(bomba.id) ?? 0
                return [
                  <tr key={bomba.id} data-ativo={ativo === bomba.id || undefined}>
                    <td className="col-numero"><Numero id={bomba.id} ativo={ativo === bomba.id} /></td>
                    <td className="col-forte">{bomba.nome}</td>
                    <td><Combustivel nome={bomba.tipoCombustivel.nome} tinta={tintaDe(bomba.tipoCombustivel.id)} /></td>
                    <td className="col-valor"><Preco valor={bomba.tipoCombustivel.precoPorLitro} /></td>
                    <td className="col-valor" data-rotulo="Abastecimentos">{n === 0 ? <span className="apagado">nenhum</span> : inteiro(n)}</td>
                    <td className="col-valor">{n === 0 ? <span className="apagado">{litros(0)}</span> : litros(litrosPorBomba.get(bomba.id) ?? 0)}</td>
                    <td className="col-acoes">
                      <AcoesDaLinha
                        descricao={bomba.nome}
                        emEdicao={idEmEdicao === bomba.id}
                        excluindo={excluir.isPending && excluir.variables === bomba.id}
                        aoEditar={() => {
                          setFalha(null)
                          editar(bomba.id)
                        }}
                        aoExcluir={() => aoExcluir(bomba)}
                      />
                    </td>
                  </tr>,
                  falha?.id === bomba.id && <LinhaDeFalha key={`falha-${bomba.id}`} falha={falha} colunas={7} aoFechar={() => setFalha(null)} />,
                ]
              })}
            </tbody>
          </table>
        </div>
        {bombas.length > 0 && (
          <p className="folha__rodape">
            <Icone nome="alerta" tamanho={16} />
            Uma bomba com abastecimentos registrados não pode ser excluída; a API recusa com 409.
          </p>
        )}
      </Folha>
    </Tela>
  )
}
