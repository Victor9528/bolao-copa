# Requirements: Bolão da Copa do Mundo EloGroup

**Defined:** 2026-06-08
**Core Value:** Proporcionar uma experiência de bolão intuitiva, com registro de palpites consistente e um fluxo visualmente claro para engajar os participantes na Copa do Mundo.

## v1 Requirements

Requisitos obrigatórios para o MVP (entrega até 10/jun).

### Autenticação (AUTH)

- [ ] **AUTH-01**: Usuário consegue realizar cadastro na plataforma.
- [ ] **AUTH-02**: Usuário consegue realizar login.
- [ ] **AUTH-03**: Sessão do usuário é mantida após login.

### Core - Jogos (CORE)

- [ ] **CORE-01**: Aplicação exibe lista dos jogos da Copa do Mundo.
- [ ] **CORE-02**: Aplicação consome de uma API real para obter o calendário e os resultados dos jogos.

### Core - Bolão (BOL)

- [ ] **BOL-01**: Usuário consegue registrar palpites de placares para os jogos.
- [ ] **BOL-02**: Bloqueio de registro de palpites após 13/jun às 15h.
- [ ] **BOL-03**: Sistema calcula a pontuação dos palpites de acordo com os resultados oficiais.
- [ ] **BOL-04**: Sistema desconsidera os 4 primeiros jogos (11 e 12/jun) na contagem do bolão.

### Ranking & Gamificação (RANK)

- [ ] **RANK-01**: Exibição de um ranking geral dos participantes.
- [ ] **RANK-02**: Ranking atualiza dinamicamente conforme os placares reais acontecem.

### Plataforma & Tech (TECH)

- [ ] **TECH-01**: Aplicação possui deploy público acessível pela web.
- [ ] **TECH-02**: Dados (usuários, palpites, pontuação) armazenados de forma estruturada em um banco de dados.
- [ ] **TECH-03**: Separação clara entre as responsabilidades do frontend e backend.
- [ ] **TECH-04**: Código hospedado em repositório estruturado.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Apostas reais / Monetização | Não faz parte das exigências, o foco é ser uma ferramenta de gamificação interna. |
| Fóruns / Chats no app | Adiciona complexidade alta e não é o core. O prazo até 10/jun é muito curto para escopo não-core. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| CORE-01 | Phase 2 | Pending |
| CORE-02 | Phase 2 | Pending |
| BOL-01 | Phase 3 | Pending |
| BOL-02 | Phase 3 | Pending |
| BOL-03 | Phase 3 | Pending |
| BOL-04 | Phase 3 | Pending |
| RANK-01 | Phase 4 | Pending |
| RANK-02 | Phase 4 | Pending |
| TECH-01 | Phase 4 | Pending |
| TECH-02 | Phase 1 | Pending |
| TECH-03 | Phase 1 | Pending |
| TECH-04 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-08*
*Last updated: 2026-06-08 after initial definition*
