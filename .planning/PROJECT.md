# Bolão da Copa do Mundo EloGroup

## What This Is

Uma aplicação web funcional de Bolão da Copa do Mundo construída com o auxílio de IA para o "AI World Cup Challenge". O aplicativo permite que usuários se cadastrem, visualizem os jogos, façam seus palpites, e acompanhem o ranking de participantes atualizado dinamicamente.

## Core Value

Proporcionar uma experiência de bolão intuitiva, com registro de palpites consistente e um fluxo visualmente claro para engajar os participantes na Copa do Mundo.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Produto Funcional completo e intuitivo.
- [ ] Cadastro e login de usuários.
- [ ] Visualização dos jogos da Copa.
- [ ] Registro de palpites (até dia 13/jun, 15h).
- [ ] Ranking dinâmico dos participantes.
- [ ] Atualização automática de pontuação (4 primeiros jogos não pontuam).
- [ ] Deploy público funcional em ambiente web.
- [ ] Banco de dados estruturado para armazenar usuários, palpites e pontuação.
- [ ] Consumo de API real para obtenção dos resultados dos jogos.
- [ ] Armazenamento estruturado do código (ex: GitHub).
- [ ] Estrutura organizada de front-end e back-end.

### Out of Scope

- [ ] Monetização ou apostas reais — o escopo é puramente gamificação interna / desafio de IA.
- [ ] Chats ou fóruns sociais avançados na plataforma — foco no core do Bolão (ranking e palpites) para garantir entrega até dia 10/jun.

## Context

- **Desafio**: Construção de uma solução end-to-end (Frontend, Backend, DB, API externa, Autenticação, Hospedagem) utilizando ferramentas de IA.
- **Público Alvo**: Avaliadores do desafio e público em geral participante do Bolão.
- **Regras do Bolão**: Os 4 primeiros jogos (dias 11 e 12/jun) não irão pontuar para o Bolão. O cadastro de palpites expira no dia 13/jun às 15h.

## Constraints

- **Timeline**: Entrega final da ferramenta até o dia 10/jun às 23h59.
- **Tech Stack**: Precisa ter separação clara de front-end e back-end, banco de dados, deploy público funcional e integração com API real de resultados.
- **Use of AI**: Uso de IA é um critério mandatório e será avaliado pela capacidade de acelerar desenvolvimento e aumentar qualidade (Arquitetura, UX e Solução).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stack de Tecnologia | Utilizaremos **Vite** para o Frontend, **Node.js** para o Backend, e **Supabase** para Banco de Dados e Autenticação. | ✓ Good |

---
*Last updated: 2026-06-08 after initialization*
