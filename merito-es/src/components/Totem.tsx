import type { CSSProperties } from 'react'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router'
import { useCadastro } from '../api/useCadastro'
import { temDadosDeExemplo } from '../demo/dadosDeExemplo'
import { useDestaque } from '../lib/destaque'
import { inteiro, precoPorLitro } from '../lib/formato'
import { Icone, type NomeIcone } from './Icone'
import { Letreiro } from './Letreiro'
import { Preco } from './Preco'

type Servico = { para: string; rotulo: string; icone: NomeIcone; contagem?: number }

// O totem de preços do posto: coroa, uma placa por combustível, painel de serviços (navegação) e letreiro.
export function Totem() {
  const { tipos, bombas, abastecimentos, tintaDe, carregando, semConexao } = useCadastro()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const [combustivelSalvo] = useDestaque('combustivel')
  const combustivelEmEdicao = pathname === '/combustiveis' ? Number(params.get('editar')) || combustivelSalvo : null
  const exemplo = abastecimentos.length > 0 && temDadosDeExemplo()

  const servicos: Servico[] = [
    { para: '/', rotulo: 'Visão geral', icone: 'visao' },
    { para: '/abastecimentos', rotulo: 'Abastecimentos', icone: 'abastecimento', contagem: abastecimentos.length },
    { para: '/bombas', rotulo: 'Bombas', icone: 'bomba', contagem: bombas.length },
    { para: '/combustiveis', rotulo: 'Combustíveis', icone: 'combustivel', contagem: tipos.length },
  ]

  return (
    <aside className="totem">
      <div className="totem__coroa">
        <Link to="/" className="coroa" aria-label="Posto · Abastecimentos, visão geral">
          <span className="coroa__marca">Posto</span>
          <span className="coroa__linha">Abastecimentos</span>
        </Link>
        {exemplo && <span className="totem__etiqueta">Dados de exemplo · preços fictícios</span>}
      </div>

      <section className="totem__placas" aria-label="Preço por litro" data-compacto={tipos.length > 5 || undefined}>
        {semConexao ? (
          <span className="placa placa--vazia">
            <span className="placa__faixa">Sem conexão</span>
            <span className="placa__convite">Preços indisponíveis</span>
          </span>
        ) : carregando && tipos.length === 0 ? (
          <>
            <span className="placa placa--carregando" aria-hidden="true" />
            <span className="placa placa--carregando" aria-hidden="true" />
          </>
        ) : tipos.length === 0 ? (
          <Link to="/combustiveis" className="placa placa--vazia">
            <span className="placa__faixa">Sem combustíveis</span>
            <span className="placa__convite">
              Cadastrar o primeiro <Icone nome="seta" tamanho={16} />
            </span>
          </Link>
        ) : (
          tipos.map((tipo) => {
            const tinta = tintaDe(tipo.id)
            return (
              <Link
                key={tipo.id}
                to={`/combustiveis?editar=${tipo.id}`}
                className="placa"
                data-ativa={combustivelEmEdicao === tipo.id || undefined}
                style={{ '--tinta': tinta.fundo, '--tinta-texto': tinta.texto } as CSSProperties}
                aria-label={`${tipo.nome}, ${precoPorLitro(tipo.precoPorLitro)} por litro. Editar combustível`}
              >
                <span className="placa__faixa">{tipo.nome}</span>
                <span key={tipo.precoPorLitro} className="placa__valor passo">
                  <Preco valor={tipo.precoPorLitro} porLitro />
                </span>
              </Link>
            )
          })
        )}
      </section>

      <nav className="totem__servicos" aria-label="Telas">
        {servicos.map((servico) => (
          <NavLink key={servico.para} to={servico.para} end className="servico">
            <Icone nome={servico.icone} tamanho={22} />
            <span className="servico__rotulo">{servico.rotulo}</span>
            {servico.contagem !== undefined && (
              <span className="servico__contagem">{semConexao ? <span aria-label="sem dados">—</span> : inteiro(servico.contagem)}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="totem__letreiro">
        <Letreiro />
        <a className="totem__swagger" href="/swagger-ui/index.html" target="_blank" rel="noreferrer">
          <Icone nome="externo" tamanho={16} />
          Documentação da API
          <span className="visualmente-oculto"> (Swagger, abre em nova aba)</span>
        </a>
      </div>
    </aside>
  )
}
