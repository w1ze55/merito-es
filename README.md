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
- [x] Perfil de produção sem Swing (o `MainFrame` não sobe com o perfil `prod`)
- [x] Interface web consumindo a API REST
- [x] Infraestrutura como código com Terraform
- [ ] Banco MySQL no RDS (o schema é criado pelas migrations do Flyway)
- [ ] API rodando em container na EC2
- [ ] Frontend hospedado no S3
- [ ] CloudFront com HTTPS (domínio próprio depois)
- [ ] Pipeline de CI/CD no GitHub Actions

---

## ⚙️ Configuração

A conexão com o banco é feita por variáveis de ambiente, então o mesmo código roda local ou na AWS:

| Variável | Local (padrão) | Homolog |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:4306/abastecimento` | Endpoint do RDS |
| `DB_USERNAME` | `merito` | Usuário do RDS |
| `DB_PASSWORD` | `merito` | Gerada pelo Terraform e lida do SSM Parameter Store |

No container, o perfil `prod` fica ativo e a JVM roda em modo headless, então só a API REST sobe.

---

## 🚀 Rodando localmente

Pré-requisitos: **Java 25** e **Docker**.

```bash
# sobe o MySQL na porta 4306
docker compose up -d

# sobe a aplicação (API + telas Swing)
cd backend
./mvnw spring-boot:run
```

O Flyway cria as tabelas na primeira execução.

Para usar só a API, sem abrir a janela Swing:

```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Djava.awt.headless=true"
```

### Interface web

Pré-requisito: **Node 20.19+**. Com a API rodando na porta 8080:

```bash
cd merito-es
npm install
npm run dev
```

A interface abre em `http://localhost:5173`. O Vite encaminha `/api` para `http://localhost:8080` (a API não tem CORS; em produção o CloudFront faz o mesmo roteamento). Com o banco vazio, o botão **Carregar dados de exemplo** cria combustíveis, bombas e abastecimentos fictícios pela própria API.

---

## ☁️ Infraestrutura (Terraform)

Toda a infra da AWS está em [`infra/`](infra/) e é criada com um `terraform apply`:

```
Navegador ─HTTPS─► CloudFront ─┬─ /* ──────────────► S3 (frontend, privado)
                               └─ /api/*, swagger ─► EC2 (container da API) ─► RDS MySQL (subnet privada)
```

| Arquivo | O que cria |
|---|---|
| `network.tf` | VPC própria, subnets públicas (EC2) e privadas (RDS), security groups |
| `database.tf` | RDS MySQL 8.4 (`db.t4g.micro`) e os parâmetros do banco no SSM |
| `ecr.tf` | Repositório das imagens da API |
| `ec2.tf` | EC2 com Docker, role com permissões mínimas e o script de deploy |
| `frontend.tf` | Bucket S3 privado, lido só pelo CloudFront |
| `cdn.tf` | Distribuição CloudFront, com rewrite das rotas do React para o `index.html` |
| `github.tf` | Usuário IAM do GitHub Actions, com acesso só aos recursos acima |

A EC2 só aceita conexões vindas do CloudFront e o RDS só aceita a EC2. A porta 22 fica fechada: a manutenção é por `aws ssm start-session`.

O banco é RDS MySQL, e não Aurora, porque a conta está no plano Free da AWS, que só libera o Aurora para PostgreSQL. Com o RDS, a homolog usa o MySQL 8.4 do ambiente local sem mudar nada no backend.

### Subindo o ambiente

Pré-requisitos: **Terraform 1.10+**, **AWS CLI**, **GitHub CLI** e **jq**.

```bash
brew tap hashicorp/tap && brew install hashicorp/tap/terraform
```

1. **Perfil exclusivo na AWS.** Um admin da conta cria o usuário IAM `merito-es-terraform` com `AdministratorAccess` e uma access key. Configure sempre com `--profile`, para não sobrescrever as credenciais padrão do CLI:

   ```bash
   aws configure --profile merito
   aws sts get-caller-identity --profile merito   # deve mostrar user/merito-es-terraform
   ```

   O Terraform usa o perfil `merito` fixo e recusa qualquer conta diferente de `account_id`.

2. **Bucket do state.** Só uma vez:

   ```bash
   CONTA=<ACCOUNT_ID>
   BUCKET=merito-es-homolog-tfstate-$CONTA
   aws s3api create-bucket --bucket $BUCKET --profile merito
   aws s3api put-bucket-versioning --bucket $BUCKET --versioning-configuration Status=Enabled --profile merito
   aws s3api put-public-access-block --bucket $BUCKET --profile merito \
     --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
   ```

3. **Criar a infra.**

   ```bash
   cd infra
   cp backend.hcl.example backend.hcl            # troque <ACCOUNT_ID>
   cp terraform.tfvars.example terraform.tfvars  # troque <ACCOUNT_ID>
   terraform init -backend-config=backend.hcl
   terraform plan    # revise: na primeira vez, só criações (+)
   terraform apply
   ```

4. **Ligar o GitHub Actions.** As variáveis do repositório saem do Terraform. A chave do usuário de deploy vai direto do CLI para o GitHub Secrets, sem aparecer no terminal:

   ```bash
   terraform output -json github_variables | jq -r 'to_entries[] | "\(.key) \(.value)"' \
     | while read k v; do gh variable set "$k" --body "$v"; done

   aws iam create-access-key --user-name "$(terraform output -raw github_deploy_user)" --profile merito \
     | jq -r '.AccessKey | "\(.AccessKeyId) \(.SecretAccessKey)"' \
     | { read id segredo; gh secret set AWS_ACCESS_KEY_ID --body "$id"; gh secret set AWS_SECRET_ACCESS_KEY --body "$segredo"; }
   ```

5. **Publicar.** Um push na `homolog`, ou *Run workflow* no Actions, publica a API e o frontend. O endereço sai em `terraform output site_url`, e o Swagger fica em `/swagger-ui/index.html`.

Se a EC2 for recriada (por exemplo, ao mudar o `user_data`), ela já sobe a última imagem do ECR. Nesse caso, rode de novo o primeiro comando do passo 4, porque o `EC2_INSTANCE_ID` muda.

### Custos e limpeza

Em `us-east-1`, fica em torno de **US$ 33 por mês**: a EC2 `t3.small` (cerca de 15), o RDS `db.t4g.micro` com 20 GB (cerca de 14) e o IP público (cerca de 3,6). S3, CloudFront e ECR custam centavos. Para economizar sem apagar nada, o RDS pode ser parado com `aws rds stop-db-instance`, mas a AWS religa sozinha depois de 7 dias.

Para apagar tudo, inclusive as chaves do usuário de deploy:

```bash
terraform destroy
```

O state do Terraform guarda a senha do banco, por isso o bucket do state é privado, versionado e criptografado.

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
- Interface **Java Swing** e **API REST** sobre a mesma camada de serviço
- Camadas organizadas: `controller`, `service`, `repository`, `model` e `dto`
- Persistência em **MySQL**, com schema versionado pelo **Flyway**
