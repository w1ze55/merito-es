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
| Banco | MySQL no Docker local | Aurora MySQL (RDS) |
| Deploy | Manual | GitHub Actions (CI/CD) |

---

## 🧱 Stack

| Camada | Tecnologia | Papel |
|---|---|---|
| Banco de dados | **MySQL no RDS Aurora** | Banco gerenciado, com backups automáticos e alta disponibilidade |
| Backend | **Spring Boot + Docker** | API REST empacotada em imagem Docker |
| Servidor | **EC2** | Executa o container da API |
| Frontend | **S3** | Hospeda os arquivos estáticos da interface web |
| Domínio / CDN | **CloudFront** | Domínio próprio, HTTPS, cache e roteamento entre S3 e EC2 |
| CI/CD | **GitHub Actions** | Build, testes e deploy automáticos a cada push na `homolog` |

---

## 🔄 Pipeline CI/CD

A cada push na `homolog`:

1. **Build e testes** do backend com Maven
2. **Build da imagem Docker** da API
3. **Deploy na EC2**: o container é atualizado com a nova imagem
4. **Build do frontend** e upload para o **S3**
5. **Invalidação do cache** do CloudFront, para a versão nova entrar no ar na hora

Credenciais da AWS e do banco ficam no **GitHub Secrets**; nada sensível é versionado.

---

## 📌 Roadmap dos diferenciais

- [ ] `Dockerfile` multi-stage do backend
- [ ] Perfil de produção sem Swing (o `MainFrame` não deve subir no servidor)
- [ ] Interface web consumindo a API REST
- [ ] Banco MySQL no RDS Aurora (o schema é criado pelas migrations do Flyway)
- [ ] API rodando em container na EC2
- [ ] Frontend hospedado no S3
- [ ] CloudFront com domínio e HTTPS
- [ ] Pipeline de CI/CD no GitHub Actions

---

## ⚙️ Configuração

A conexão com o banco é feita por variáveis de ambiente, então o mesmo código roda local ou na AWS:

| Variável | Local (padrão) | Homolog |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:4306/abastecimento` | Endpoint do cluster Aurora |
| `DB_USERNAME` | `merito` | Usuário do Aurora |
| `DB_PASSWORD` | `merito` | Senha do Aurora (via GitHub Secrets) |

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
