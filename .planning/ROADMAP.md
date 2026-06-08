# Roadmap: Bolão da Copa do Mundo EloGroup

## Overview

O projeto será desenvolvido em 4 fases rápidas para atingir a entrega final exigida até o dia 10 de junho. Focaremos em estabilizar a base e a autenticação, integrar os jogos da Copa, construir a mecânica central de palpites e finalizar com ranking, polimento da interface (UX) e deploy.

## Phases

- [ ] **Phase 1: Setup Base e Autenticação** - Inicialização de repo, DB, arquitetura e sistema de login/cadastro de usuários.
- [ ] **Phase 2: Integração de Jogos da Copa** - Conexão com API real de esportes, listagem visual dos jogos.
- [ ] **Phase 3: Motor do Bolão** - Lógica e UI para registro de palpites e regra de cálculos baseados em resultados reais.
- [ ] **Phase 4: Ranking e Lançamento** - Lógica do ranking contínuo, deploy web e revisão de UX intuitiva.

## Phase Details

### Phase 1: Setup Base e Autenticação
**Goal**: Infraestrutura pronta com usuários capazes de criar conta e logar.
**Depends on**: Nothing
**Requirements**: [AUTH-01, AUTH-02, AUTH-03, TECH-02, TECH-03, TECH-04]
**Success Criteria**:
  1. Repositório configurado e estruturado.
  2. Banco de dados conectado.
  3. Usuário consegue se cadastrar e efetuar login com persistência de sessão.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Infraestrutura Base (Vite, Node, Supabase SDK)
- [ ] 01-02: Autenticação de Usuários (Telas e Contexto)

### Phase 2: Integração de Jogos da Copa
**Goal**: Aplicação consome API real e exibe os jogos corretamente.
**Depends on**: Phase 1
**Requirements**: [CORE-01, CORE-02]
**Success Criteria**:
  1. Requisições na API de futebol estão funcionando e formatadas.
  2. A interface exibe a listagem dos jogos com escudos de times e datas de forma intuitiva.
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Motor do Bolão
**Goal**: Usuários podem salvar e alterar seus palpites antes do tempo limite; sistema entende as regras de pontuação.
**Depends on**: Phase 2
**Requirements**: [BOL-01, BOL-02, BOL-03, BOL-04]
**Success Criteria**:
  1. Usuário logado acessa um formulário de palpite e salva no DB com sucesso.
  2. Bloqueio lógico após 13/jun 15h está implementado.
  3. A estrutura de cálculo de pontuação desconsidera dias 11 e 12/jun.
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Ranking e Lançamento
**Goal**: Sistema de ranking ao vivo, polimento visual, UX revisada e projeto acessível via URL pública.
**Depends on**: Phase 3
**Requirements**: [RANK-01, RANK-02, TECH-01]
**Success Criteria**:
  1. A tela de Ranking mostra os líderes corretamente calculados.
  2. Interface possui uma estética moderna e responsiva (design de alta qualidade e intuitivo).
  3. Acessível via Vercel ou semelhante sem erros em produção.
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Setup Base e Autenticação | 0/2 | Not started | - |
| 2. Integração de Jogos da Copa | 0/1 | Not started | - |
| 3. Motor do Bolão | 0/1 | Not started | - |
| 4. Ranking e Lançamento | 0/1 | Not started | - |
