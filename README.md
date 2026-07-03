# Garage — Projeto completo

Projeto com dois módulos:

```
garage-service/             → backend (Java 17 + Spring Boot 3)
garage-frontend-angular/    → frontend (Angular 18)
```

Veja o `README.md` dentro de cada pasta para detalhes completos. Resumo rápido abaixo.

---

## O que mudou nesta versão

1. **Carros de exemplo removidos.** O `data.sql` do backend agora só popula países e
   marcas (necessários para os dropdowns); a garagem começa **vazia**. Países e marcas
   continuam pré-cadastrados, como antes.

2. **Login obrigatório**, com um único usuário:

   ```
   usuário: admin
   senha:   user1234
   ```

   - Toda a API (`/api/v1/**`) exige um token **JWT**, exceto `POST /api/v1/auth/login`.
   - O token expira em **5 minutos**.
   - O front-end Angular **renova o token automaticamente em segundo plano** um pouco
     antes de cada expiração (a cada ~5 minutos), então a sessão fica ativa enquanto a
     aba estiver aberta, sem precisar logar de novo.
   - Existe uma tela de login (`/login`) no front-end; sem um token válido, qualquer
     outra rota redireciona para lá.

3. **Revisão geral de código**: alguns ajustes pequenos de segurança/qualidade no
   backend (erros 500 não vazam mais detalhes internos ao cliente, por exemplo) — ver a
   seção "Revisão" abaixo para a lista completa.

---

## Como rodar

### 1. Backend

```bash
cd garage-service
mvn spring-boot:run
```

Sobe em `http://localhost:8080`. Tenta PostgreSQL na porta 1883 primeiro; se não
encontrar, cai automaticamente para H2 em memória (ver README do backend).

### 2. Frontend

```bash
cd garage-frontend-angular
npm install
npm start
```

Sobe em `http://localhost:4200`. Abra no navegador — você verá a tela de login.

### 3. Login

Use `admin` / `user1234`. A garagem abre vazia; adicione carros pelo botão **+ New car**.

---

## Revisão de código feita nesta passada

Durante a implementação do login, o backend foi revisado e os seguintes pontos foram
corrigidos/ajustados (nenhum bug grave foi encontrado; eram principalmente refinamentos):

- **`GlobalExceptionHandler.handleGeneric`**: antes, qualquer erro 500 inesperado
  expunha `ex.getMessage()` (podendo incluir stack trace, SQL, nomes de classes
  internas) diretamente na resposta JSON ao cliente. Agora a exceção real é só logada
  no servidor; o cliente recebe uma mensagem genérica.
- **CORS + Spring Security**: o `CorsConfig` original só registrava CORS no Spring MVC
  (`WebMvcConfigurer`), o que não é suficiente quando o Spring Security está ativo — o
  filtro de segurança intercepta a requisição antes do MVC. Foi extraído um
  `CorsConfigurationSource` único, reaproveitado tanto pelo MVC quanto pela
  `SecurityFilterChain`, para que o comportamento de CORS continue idêntico ao de
  antes (incluindo o preflight `OPTIONS`) agora que a API exige autenticação.
- Adicionado tratamento explícito para `AccessDeniedException` (403) no handler global,
  que antes cairia no handler genérico de 500.
- Pacote `security` novo, isolado (`JwtService`, `JwtAuthenticationFilter`,
  `JwtAuthenticationEntryPoint`), sem misturar autenticação com as entidades/serviços
  de domínio (Country/Brand/Car) — nada nesses módulos foi alterado.

Não foram encontrados bugs funcionais no código original de Country/Brand/Car; a
estrutura (DTOs, mappers, services, exception handling) já estava consistente.

---

## Observação sobre o ambiente de build

Este ambiente não teve acesso ao repositório Maven Central para compilar o backend
(rede restrita a um conjunto fixo de domínios). O código foi revisado linha a linha e
todas as assinaturas de API (Spring Security 6.3, jjwt 0.12.6) foram confirmadas
manualmente, mas **recomendo rodar `mvn clean install` localmente** antes do primeiro
`spring-boot:run`, só para garantir que tudo resolve sem surpresas no seu ambiente.

O frontend, por outro lado, **foi de fato instalado (`npm install`) e buildado
(`ng build --configuration production`) neste ambiente**, sem erros — TypeScript,
templates e bindings do Angular foram validados de ponta a ponta.
