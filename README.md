# ⛽ Cadastro e Consulta de Abastecimentos · branch `homolog`

> 🔹 **Caro recrutador**, esta branch é um **diferencial**: um espaço para mostrar habilidades que vão além do que o desafio pede.
> A solução do desafio, com tudo o que foi solicitado, está na branch [`main`](https://github.com/w1ze55/merito-es/tree/main).

---

## 🛠 Objetivo

Levar o sistema do desktop para a web:

- **Interface web** para melhorar a UI/UX em relação às telas Java Swing.
- **Hospedagem na AWS** com práticas de DevOps: conteinerização, banco gerenciado, CDN e deploy automatizado.

| | `main` | `homolog` |
|---|---|---|
| Interface | Java Swing | Web (React, frontend estático) |
| API | REST local | REST hospedada na EC2 |
| Banco | MySQL no Docker local | MySQL no RDS |
| Infraestrutura | Docker Compose local | Terraform (infra como código) |
| Deploy | Manual | GitHub Actions (CI/CD) |

---

## 🧱 Stack

| Camada | Tecnologia | Papel |
|---|---|---|
| Banco de dados | **MySQL 8.4 no RDS** | Banco gerenciado, com backups automáticos, na mesma versão do ambiente local |
| Backend | **Spring Boot + Docker** | API REST empacotada em imagem Docker |
| Servidor | **EC2** | Executa o container da API |
| Frontend | **S3** | Hospeda os arquivos estáticos da interface web |
| Domínio / CDN | **CloudFront** | HTTPS, cache e roteamento entre S3 e EC2 |
| Infraestrutura | **Terraform** | Cria e versiona toda a infra da AWS (`infra/`) |
| CI/CD | **GitHub Actions** | Build, testes e deploy automáticos a cada push na `homolog` |

---

## 🔄 Pipeline CI/CD

A cada push na `homolog`:

1. **Build e testes** do backend com Maven (contra um MySQL de serviço)
2. **Build da imagem Docker** da API e push para o **ECR**
3. **Deploy na EC2** via SSM Run Command: o container é atualizado com a nova imagem, sem SSH
4. **Build do frontend** e upload para o **S3**
5. **Invalidação do cache** do CloudFront, para a versão nova entrar no ar na hora

As chaves do usuário IAM de deploy, que só pode publicar no ECR, no S3 e na EC2 deste projeto, ficam no **GitHub Secrets**. A senha do banco nem passa pelo GitHub: o Terraform gera a senha e a guarda no **SSM Parameter Store**, de onde só a EC2 lê. Nada sensível é versionado.

O workflow está em [`.github/workflows/homolog.yml`](.github/workflows/homolog.yml).

---

## 📌 Roadmap dos diferenciais

- [x] `Dockerfile` multi-stage do backend
- [x] Backend só com a API REST
- [x] Interface web consumindo a API REST
- [x] Infraestrutura como código com Terraform
- [x] Banco MySQL no RDS
- [x] API rodando em container na EC2
- [x] Frontend hospedado no S3
- [x] CloudFront com HTTPS
- [x] Pipeline de CI/CD no GitHub Actions

---

## ⚙️ Configuração

A conexão com o banco é feita por variáveis de ambiente, então o mesmo código roda local ou na AWS:

| Variável | Local (padrão) | Homolog |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:4306/abastecimento` | Endpoint do RDS |
| `DB_USERNAME` | `merito` | Usuário do RDS |
| `DB_PASSWORD` | `merito` | Gerada pelo Terraform e lida do SSM Parameter Store |

---

## 🚀 Rodando localmente

Pré-requisitos: **Java 25** e **Docker**.

```bash
# sobe o MySQL na porta 4306
docker compose up -d

# sobe a API REST na porta 8080
cd backend
./mvnw spring-boot:run
```

O Flyway cria as tabelas na primeira execução.

### Interface web

Pré-requisito: **Node 20.19+**. Com a API rodando na porta 8080:

```bash
cd merito-es
npm install
npm run dev
```

A interface abre em `http://localhost:5173`. O Vite encaminha `/api` para `http://localhost:8080` (a API não tem CORS; em produção o CloudFront faz o mesmo roteamento). Com o banco vazio, o botão **Carregar dados de exemplo** cria combustíveis, bombas e abastecimentos fictícios pela própria API.

---

## 🔗 Endpoints da API

| Recurso | Rota base |
|---|---|
| Tipos de combustível | `/api/tipos-combustivel` |
| Bombas de combustível | `/api/bombas` |
| Abastecimentos | `/api/abastecimentos` |

Cada recurso expõe:

| Método | Rota | Ação |
|---|---|---|
| `GET` | `/` | Lista todos |
| `GET` | `/{id}` | Busca por id |
| `POST` | `/` | Cadastra |
| `PUT` | `/{id}` | Altera |
| `DELETE` | `/{id}` | Remove |

---

## ✅ Base herdada da `main`

- CRUD de **tipos de combustível**, **bombas** (ligadas a um tipo de combustível) e **abastecimentos** (com bomba, data, litragem e valor)
- **API REST** sobre a camada de serviço. Na `homolog`, as telas Java Swing da `main` deram lugar à interface web
- Camadas organizadas: `controller`, `service`, `repository`, `model` e `dto`
- Persistência em **MySQL**, com schema versionado pelo **Flyway**
