import { Link } from 'react-router'
import { useCadastro } from '../api/useCadastro'
import { RESUMO_DADOS_DE_EXEMPLO } from '../demo/dadosDeExemplo'
import { useDadosDeExemplo } from '../demo/useDadosDeExemplo'
import { inteiro } from '../lib/formato'
import { Icone } from './Icone'

export function ApiForaDoAr({ aoTentar }: { aoTentar: () => void }) {
  return (
    <section className="folha fora-do-ar" role="alert" aria-labelledby="fora-do-ar-titulo">
      <div className="fora-do-ar__icone">
        <Icone nome="alerta" tamanho={28} />
      </div>
      <div className="fora-do-ar__texto">
        <h2 id="fora-do-ar-titulo">A API não está respondendo</h2>
        <p>
          Esta tela chama <code>/api</code>, que o Vite encaminha para o Spring Boot em <code>http://localhost:8080</code>. Suba o banco e a
          API e tente de novo:
        </p>
        <pre className="comandos">
          <code>
            {'docker compose up -d\n'}
            {'cd backend && ./mvnw spring-boot:run'}
          </code>
        </pre>
        <button type="button" className="botao botao--primario" onClick={aoTentar}>
          <Icone nome="recarregar" tamanho={18} />
          Tentar de novo
        </button>
      </div>
    </section>
  )
}

function contagem(n: number, nenhum: string, singular: string, plural: string) {
  return n === 0 ? nenhum : `${inteiro(n)} ${n === 1 ? singular : plural}`
}

// O banco vazio como ponto de partida: a cadeia combustível → bomba → abastecimento, com o próximo passo.
export function CadeiaDeCadastro() {
  const { tipos, bombas, abastecimentos } = useCadastro()
  const exemplo = useDadosDeExemplo()

  const etapas = [
    { para: '/combustiveis', titulo: 'Combustíveis', texto: 'Nome e preço por litro.', feito: tipos.length > 0, situacao: contagem(tipos.length, 'Nenhum cadastrado', 'cadastrado', 'cadastrados') },
    { para: '/bombas', titulo: 'Bombas', texto: 'Cada bomba abastece um combustível.', feito: bombas.length > 0, situacao: contagem(bombas.length, 'Nenhuma cadastrada', 'cadastrada', 'cadastradas') },
    { para: '/abastecimentos', titulo: 'Abastecimentos', texto: 'Bomba, data e litros; o total sai do preço.', feito: abastecimentos.length > 0, situacao: contagem(abastecimentos.length, 'Nenhum registrado', 'registrado', 'registrados') },
  ]
  const proxima = etapas.find((etapa) => !etapa.feito)

  return (
    <section className="folha cadeia" aria-labelledby="cadeia-titulo">
      <div className="cadeia__texto">
        <h2 id="cadeia-titulo">Ainda não há abastecimentos registrados</h2>
        <p>
          Os cadastros dependem uns dos outros: um abastecimento é feito em uma bomba, e cada bomba abastece um tipo de combustível. Comece
          pelo primeiro passo que falta, ou carregue um conjunto de exemplo.
        </p>
      </div>

      <ol className="cadeia__etapas">
        {etapas.map((etapa, i) => (
          <li key={etapa.para} className="etapa" data-feito={etapa.feito || undefined} data-proxima={etapa === proxima || undefined}>
            <span className="etapa__numero">{i + 1}</span>
            <span className="etapa__titulo">{etapa.titulo}</span>
            <span className="etapa__texto">{etapa.texto}</span>
            <span className="etapa__situacao">
              {etapa.feito && <Icone nome="ok" tamanho={16} />}
              {etapa.situacao}
            </span>
            {etapa === proxima && (
              <Link to={etapa.para} className="etapa__acao">
                Cadastrar <Icone nome="seta" tamanho={16} />
              </Link>
            )}
          </li>
        ))}
      </ol>

      <div className="cadeia__exemplo">
        <button type="button" className="botao botao--primario" onClick={exemplo.carregar} disabled={exemplo.carregando} aria-busy={exemplo.carregando || undefined}>
          {exemplo.carregando ? 'Carregando dados de exemplo…' : 'Carregar dados de exemplo'}
        </button>
        {exemplo.progresso ? (
          <div className="progresso" role="status">
            <span className="progresso__texto">
              {exemplo.progresso.etapa} · {exemplo.progresso.feito} de {exemplo.progresso.total}
            </span>
            <span className="progresso__trilho">
              <span className="progresso__barra" style={{ width: `${(exemplo.progresso.feito / exemplo.progresso.total) * 100}%` }} />
            </span>
          </div>
        ) : (
          <p className="cadeia__nota">
            Cria {RESUMO_DADOS_DE_EXEMPLO} pela própria API, reaproveitando nomes que já existem. Preços e volumes são fictícios.
          </p>
        )}
        {exemplo.erro && <p className="campo__erro">{exemplo.erro}</p>}
      </div>
    </section>
  )
}

// Aviso curto quando falta o cadastro de que esta tela depende.
export function FaltaCadastro({ texto, para, acao }: { texto: string; para: string; acao: string }) {
  return (
    <div className="aviso aviso--falta">
      <Icone nome="alerta" tamanho={18} />
      <p>{texto}</p>
      <Link to={para} className="aviso__acao">
        {acao} <Icone nome="seta" tamanho={16} />
      </Link>
    </div>
  )
}
