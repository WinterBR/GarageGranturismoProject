# Garage Service

Microsserviço backend em **Java 17 + Spring Boot 3** para gerenciar uma garagem de carros,
inspirado na tela de garagem do **Gran Turismo 4**.

Gerencia três entidades principais:

- **Country** — país de origem de uma marca
- **Brand** — marca/fabricante (sempre ligada a um país)
- **Car** — carro (sempre ligado a uma marca, com o país derivado automaticamente da marca)

Cada carro guarda specs técnicas completas: cor (hex), ano, cavalos, tração (drivetrain),
torque, RPM máximo, motor (nome + layout: V8, V16, W16, etc.), peso e dimensões
(altura, comprimento, largura).

As 67 marcas enviadas (a partir dos logos fornecidos) já vêm **pré-cadastradas** no banco,
cada uma associada ao seu país correto. A garagem em si começa **vazia**: nenhum carro de
exemplo é inserido — os carros são cadastrados pelo usuário autenticado através do app.

Toda a API (exceto o login) exige autenticação via **JWT**, com um único usuário
administrador. Veja a seção [Autenticação](#autenticação) abaixo.

---

## Stack

- Java 17
- Spring Boot 3.3.4
- Spring Security + JWT (jjwt)
- Spring Data JPA / Hibernate
- PostgreSQL (driver) + H2 (fallback em memória)
- springdoc-openapi (Swagger UI)
- Lombok
- Spring Boot Actuator
- Maven

---

## Fallback automático PostgreSQL → H2

O serviço **sempre sobe**, mesmo sem PostgreSQL disponível:

1. Na inicialização, `DataSourceFallbackConfig` tenta abrir uma conexão JDBC real
   com o PostgreSQL configurado (porta **1883** por padrão).
2. Se a conexão falhar (banco fora do ar, porta errada, rede inacessível, credenciais
   inválidas, timeout, etc.), o serviço **automaticamente cai para um banco H2 em memória**,
   registra um aviso no log, e continua a inicialização normalmente.
3. Quando em modo fallback, os dados **não persistem** entre reinicializações — é só para
   desenvolvimento/demonstração. Assim que o PostgreSQL ficar disponível e a aplicação for
   reiniciada, ele volta a usar o PostgreSQL automaticamente.

Essa lógica está isolada em:
`src/main/java/com/granturismo/garage/config/DataSourceFallbackConfig.java`

---

## Configuração de conexão (PostgreSQL na porta 1883)

Por padrão (`application.yml`), a aplicação tenta:

```
jdbc:postgresql://localhost:1883/garage_db
user: garage_user
password: garage_pass
```

Você pode sobrescrever via variáveis de ambiente, sem editar código:

| Variável            | Padrão       |
|---------------------|--------------|
| `POSTGRES_HOST`     | `localhost`  |
| `POSTGRES_PORT`     | `1883`       |
| `POSTGRES_DB`       | `garage_db`  |
| `POSTGRES_USER`     | `garage_user`|
| `POSTGRES_PASSWORD` | `garage_pass`|

### Subindo um PostgreSQL local na porta 1883 com Docker

Já incluí um `docker-compose.yml` pronto:

```bash
docker compose up -d
```

Isso inicia um PostgreSQL 16 expondo a porta `1883` no host (mapeada para a porta interna
5432 do container), batendo exatamente com a configuração padrão da aplicação.

Para testar o fallback, basta **não rodar o docker-compose** (ou pará-lo) e iniciar a
aplicação normalmente — ela vai detectar que o Postgres está inacessível e usar H2.

---

## Como rodar

Pré-requisito: Java 17+ e Maven instalados (ou use sua IDE — IntelliJ/Eclipse/VS Code
com extensão Java — para rodar `GarageServiceApplication` diretamente).

```bash
mvn spring-boot:run
```

ou, para gerar o jar e executar:

```bash
mvn clean package
java -jar target/garage-service.jar
```

A aplicação inicia em `http://localhost:8080`.

---

## Swagger / OpenAPI

Com a aplicação rodando, acesse:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

Todos os endpoints estão documentados e testáveis diretamente pela interface do Swagger.

---

## Health check

- http://localhost:8080/actuator/health

Útil para orquestradores (Docker/Kubernetes) verificarem se o microsserviço está saudável.

---

## Console do H2 (apenas quando em modo fallback)

- http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:garage_fallback_db`
- User: `sa` / Password: *(vazio)*

---

## Autenticação

A API inteira (todas as rotas `/api/v1/**`, incluindo os `GET`s) exige um token **JWT**,
com a única exceção de `POST /api/v1/auth/login`. Existe um único usuário, configurado em
`application.yml` (`app.security.admin.*`):

```
username: admin
password: user1234
```

A senha **não** fica em texto puro em nenhum lugar do código: o que é armazenado é o seu
hash BCrypt (`app.security.admin.password-hash`).

### Login

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "user1234"
}
```

Resposta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresInMs": 300000,
  "username": "admin"
}
```

Use o token em todas as outras chamadas:

```
GET /api/v1/cars
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Expiração e renovação (a cada 5 minutos)

Cada token expira em **5 minutos** (`app.security.jwt.expiration-ms`). Para renovar, chame
`/refresh` com o token *ainda válido* (refresh não funciona com um token já expirado —
nesse caso é necessário logar novamente):

```
POST /api/v1/auth/refresh
Authorization: Bearer <token ainda válido>
```

Retorna um novo `TokenResponse`, com um novo token e os mesmos 5 minutos de validade.
O frontend Angular já faz isso automaticamente em segundo plano (ver README do frontend).

### Variáveis de ambiente

Para trocar o segredo de assinatura do JWT em produção (recomendado), defina:

```
GARAGE_JWT_SECRET=<uma string base64 de pelo menos 32 bytes>
```

Se não for definida, um valor padrão (apenas para desenvolvimento) é usado.

---

## Principais endpoints

> Todas as rotas abaixo exigem o header `Authorization: Bearer <token>` (ver seção
> [Autenticação](#autenticação)), com exceção de `POST /api/v1/auth/login`.

### Auth
| Método | Endpoint                | Descrição                                    | Requer token? |
|--------|--------------------------|------------------------------------------------|----------------|
| POST   | `/api/v1/auth/login`    | Login (único usuário admin), retorna o JWT     | Não            |
| POST   | `/api/v1/auth/refresh`  | Troca um token ainda válido por um novo        | Sim            |

### Countries
| Método | Endpoint                     | Descrição              |
|--------|-------------------------------|-------------------------|
| GET    | `/api/v1/countries`           | Lista todos os países  |
| GET    | `/api/v1/countries/{id}`      | Busca país por id      |
| POST   | `/api/v1/countries`           | Cria um país           |
| PUT    | `/api/v1/countries/{id}`      | Atualiza um país       |
| DELETE | `/api/v1/countries/{id}`      | Remove um país         |

### Brands
| Método | Endpoint                              | Descrição                          |
|--------|-----------------------------------------|-------------------------------------|
| GET    | `/api/v1/brands`                        | Lista todas as marcas              |
| GET    | `/api/v1/brands/{id}`                   | Busca marca por id                 |
| GET    | `/api/v1/brands/by-country/{countryId}` | Lista marcas de um país            |
| GET    | `/api/v1/brands/{id}/logo`              | Retorna a imagem PNG do logo       |
| POST   | `/api/v1/brands`                        | Cria uma marca                     |
| PUT    | `/api/v1/brands/{id}`                   | Atualiza uma marca                 |
| DELETE | `/api/v1/brands/{id}`                   | Remove uma marca                   |

### Cars
| Método | Endpoint                              | Descrição                                       |
|--------|-----------------------------------------|--------------------------------------------------|
| GET    | `/api/v1/cars`                          | Lista carros, com filtros opcionais (ver abaixo) |
| GET    | `/api/v1/cars/{id}`                     | Busca carro por id                               |
| GET    | `/api/v1/cars/by-brand/{brandId}`       | Lista carros de uma marca                        |
| GET    | `/api/v1/cars/by-country/{countryId}`   | Lista carros de um país                          |
| POST   | `/api/v1/cars`                          | Adiciona um carro                                |
| PUT    | `/api/v1/cars/{id}`                     | Atualiza um carro                                |
| DELETE | `/api/v1/cars/{id}`                     | Remove um carro                                  |

Filtros opcionais em `GET /api/v1/cars` (combináveis):
`brandId`, `countryId`, `minYear`, `maxYear`, `minHp`, `maxHp`, `drivetrain`.

---

## Sobre o campo `drivetrain`

Segue a notação clássica de jogos de corrida:

| Valor      | Significado                              |
|------------|--------------------------------------------|
| `FF`       | Motor frontal, tração dianteira            |
| `FR`       | Motor frontal, tração traseira             |
| `FA`       | Motor frontal, tração integral             |
| `MR`       | Motor central, tração traseira             |
| `MF`       | Motor central, tração dianteira            |
| `MA`       | Motor central, tração integral             |
| `RR`       | Motor traseiro, tração traseira            |
| `RF`       | Motor traseiro, tração dianteira           |
| `FOUR_WD`  | 4WD — tração integral permanente           |
| `AWD`      | Tração integral sob demanda                |

> Nota: como identificadores Java não podem começar com número, o "4WD" é representado
> pela constante `FOUR_WD` nas requisições/respostas da API. O campo `drivetrainDescription`
> na resposta já traz a descrição amigável.

## Sobre o campo `engineLayout`

`I3`, `I4`, `I5`, `I6`, `FLAT4`, `FLAT6`, `V6`, `V8`, `V10`, `V12`, `V16`, `W8`, `W12`, `W16`,
`ROTARY`, `ELECTRIC`, `HYBRID`.

## Sobre o campo `colorHex`

Cor do carro como hex RGB (ex.: `#C40233`). **O front-end deve renderizar essa cor como um
retângulo colorido**, em vez de exibir o nome da cor — é exatamente para isso que o campo
foi modelado como hex e não como texto livre.

---

## Estrutura de pacotes

```
com.granturismo.garage
├── domain        → entidades JPA (Country, Brand, Car) e enums (Drivetrain, EngineLayout)
├── repository    → Spring Data JPA repositories
├── dto           → Request/Response records (entrada e saída da API)
├── mapper        → conversão entidade ↔ DTO
├── service       → regras de negócio (inclui AuthService)
├── controller    → endpoints REST (inclui AuthController)
├── security      → JwtService, filtro e entry point de autenticação JWT
├── config        → DataSource fallback, Swagger, CORS, Spring Security
└── exception     → exceções customizadas + handler global de erros
```

---

## Preparado para o front-end

- **CORS liberado** em `/api/**` (ajustar origens permitidas antes de produção), aplicado
  tanto no Spring MVC quanto na cadeia de filtros do Spring Security.
- Endpoint dedicado para servir os **logos das marcas** como imagem
  (`GET /api/v1/brands/{id}/logo`), prontos para `<img src="...">`.
- Resposta de `Car` já vem com **brand e country aninhados** (nomes, não apenas ids),
  então o front-end não precisa fazer requisições extras só para exibir a lista.
- Campo `colorHex` pensado especificamente para renderização de retângulo de cor no front.
- Filtros de busca já implementados (`/api/v1/cars?minHp=300&drivetrain=FR...`).

---

## Próximos passos sugeridos

- Paginação (`Pageable`) em `/api/v1/cars` se a lista crescer muito.
- Upload de logos customizados via endpoint, em vez de arquivos fixos no classpath.
- Testes unitários adicionais para `CarService`/`BrandService`.
- Se a garagem precisar de múltiplos usuários no futuro, trocar o usuário fixo por uma
  tabela `users` real (a estrutura de `AuthService`/`JwtService` já fica praticamente igual).
