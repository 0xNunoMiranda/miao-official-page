# MIAO Tools - Database Schema

## Estrutura do Banco de Dados

### Sistema Unificado de Transações

**IMPORTANTE:** Todas as transações do ecossistema (Shop, MIAO Tools, MIAO Games) passam pelo **MIAO Treasure Chest** (baú do tesouro) e são rastreadas na tabela `miao_treasury_transactions` com:
- **category**: shop, tools, games
- **reason**: Motivo específico (nome do produto, feature, jogo)
- **reason_details**: JSON com detalhes completos
- **source_type** e **source_id**: Link para a origem específica

Cada carteira dentro do MIAO Tools tem acesso a todas as transações do ecossistema através das queries unificadas.

### Tabelas Principais

#### 1. `miao_users` - Usuários Base
- **PK**: `wallet_address` (VARCHAR 44) - Endereço da carteira Solana
- Armazena: nível, gems, hierarquia, streak, referências
- Sistema de referência integrado

#### 2. `miao_gem_transactions` - Histórico de Gems
- Todas as transações de gems (ganhos e gastos internos)
- **IMPORTANTE:** Gems NÃO são transacionáveis entre usuários
- São apenas pontos internos de gamificação
- Tipos: earn, spend, bonus, referral, quest, meme_creation, etc.

#### 2b. `miao_token_transactions` - Transações $MIAO
- Transações reais de $MIAO tokens na Solana
- Para compras de features/tools premium
- Verificação blockchain

#### 2c. `miao_features` - Features/Tools Premium
- Configuração de features disponíveis
- Preços: gems, $MIAO, ou ambos
- Categorias: meme_studio, quests, profile, tools, premium

#### 2d. `miao_user_features` - Features Ativas dos Usuários
- Features compradas pelos usuários
- **category**: 'tools' (sempre)
- **reason**: Nome da feature/tool
- **treasury_transaction_id**: Link para transação treasury (se pagamento $MIAO)
- Suporta expiração e renovação

#### 3. `miao_memes` - Meme Studio
- Todas as imagens geradas
- Prompt, URLs, textos, estatísticas de engajamento

#### 4. `miao_quests` - Configuração de Quests
- Quests disponíveis no sistema
- Tipos: daily, weekly, one_time, recurring
- **Quests Prontas**: Ver `database/quests-initial-data.sql` para lista completa
- **Sistema de Verificação**: Automática (meme creation, shares, likes) e Manual (Twitter/Discord)
- **Documentação**: Ver `database/quests-system.md` e `database/quests-verification-guide.md`

#### 5. `miao_user_quests` - Progresso de Quests
- Progresso individual de cada usuário
- Suporta reset diário/semanal

#### 6. `miao_activities` - Log de Atividades
- Histórico completo de ações dos usuários
- Para dashboard e analytics

#### 7. `miao_feed` - Feed da Comunidade
- Memes publicados no feed
- Sistema de destaque (featured)

#### 8. `miao_interactions` - Interações
- Likes, shares, reports
- Evita duplicatas com UNIQUE constraint

#### 9. `miao_levels` - Configuração de Níveis
- Níveis e gems necessárias

#### 10. `miao_hierarchies` - Configuração de Hierarquias
- Hierarquias do exército Miao
- Requisitos: nível mínimo + gems totais
- Benefícios por hierarquia (JSON)

#### 11. `miao_polls` - Polls (Votações)
- Polls da comunidade
- Recompensas em gems por responder

#### 12. `miao_poll_responses` - Respostas de Polls
- Respostas dos usuários
- Gems recebidas

#### 13. `miao_resources` - Recursos (Incluindo Itens de Jogo)
- Recursos disponíveis para compra com **gems OU SOL**
- **Pagamento Híbrido**: `payment_options` (gems_only, sol_only, both)
- **Itens de Jogo**: Categoria 'game' com suporte a pagamento SOL (principal) e gems (preço alto)
- Categorias: meme_studio, quests, profile, tools, boost, cosmetic, **game**
- **Documentação**: Ver `database/game-items-system.md`

#### 14. `miao_user_resources` - Recursos Ativos
- Recursos comprados pelos usuários
- **Pagamento Rastreado**: `payment_method` (gems ou sol)
- **Transações**: `gem_transaction_id` (gems) ou `treasury_transaction_id` (SOL)
- Expiração e usos restantes

#### 15. `miao_games` - Jogos
- Jogos disponíveis
- Custo de entrada e recompensas (pode ser grátis)

#### 16. `miao_user_game_progress` - Progresso Persistente de Jogos
- **Progresso geral** do usuário em cada jogo
- Melhor pontuação, nível atual, moedas, vidas
- **progress_data**: JSON com dados específicos (níveis desbloqueados, conquistas, inventário)
- **UNIQUE**: Uma entrada por usuário/jogo (progresso persistente)
- **Gratuito ou Pago**: Progresso é salvo mesmo quando o jogo é grátis
- **Documentação**: Ver `database/game-progress-system.md`

#### 17. `miao_user_games` - Histórico de Jogadas (Sessões)
- **Cada sessão de jogo** individual
- Pontuação da jogada, nível alcançado, tempo jogado
- **session_data**: JSON com dados específicos da sessão
- Gems ganhas/gastas, SOL ganho/gasto
- **category**: 'games' (sempre)
- **treasury_transaction_id**: Link para transação treasury (se pagamento SOL/MIAO)

#### 17. `miao_shop_products` - Produtos da Shop
- Catálogo de produtos
- Preços: SOL (principal) e Gems (opcional, muito alto)
- Stock, categorias, imagens

#### 18. `miao_shop_orders` - Encomendas
- Encomendas completas
- Estados: pending → payment_received → processing → shipped → delivered
- Endereços de envio e faturação
- Tracking numbers
- **treasury_transaction_id**: Link para transação treasury

#### 19. `miao_shop_order_items` - Itens da Encomenda
- Produtos comprados
- Snapshot de preços no momento da compra

#### 20. `miao_shop_sol_transactions` - Transações $SOL
- Transações Solana para pagamentos
- **category**: 'shop' (sempre)
- **reason**: Nome do produto comprado
- **product_id**: Referência ao produto
- Verificação blockchain

#### 21. `miao_shop_order_history` - Histórico de Encomendas
- Todas as mudanças de status
- Para dashboard administrativa

#### 22. `miao_shop_settings` - Configurações da Shop
- Configurações (wallet SOL, multiplicador gems, etc.)

#### 23. `miao_treasury_wallets` - Treasure Chests (Baús do Tesouro)
- **MIAO Treasure Chest**: Baú do tesouro principal onde todas as transações passam
- Outros baús: burn, liquidity, operations, etc.
- Saldos SOL e MIAO rastreados

#### 24. `miao_fund_distribution_rules` - Regras de Distribuição
- Regras configuráveis de distribuição de fundos
- Triggers por tipo de evento

#### 25. `miao_fund_distributions` - Splits de Fundos
- Como dividir cada montante (percentuais ou fixos)
- Destinos e ações (burn, transfer, swap, etc.)

#### 26. `miao_treasury_transactions` - Transações Unificadas do Ecossistema
- **Sistema Unificado**: Todas as transações de Shop, Tools e Games
- **Categorização**: `category` (shop, tools, games) + `reason` (motivo específico)
- **Rastreabilidade**: Cada transação tem `source_type` e `source_id` para link direto
- **Detalhes JSON**: `reason_details` com informações completas (produto, feature, jogo)
- Transações entre carteiras, swaps, conversões, queimas
- Verificação blockchain
- **Acesso por Carteira**: Cada carteira pode ver todas as transações do ecossistema

#### 27. `miao_distribution_executions` - Execuções de Distribuição
- Histórico de cada distribuição
- Resumo em JSON

#### 28. `miao_distribution_execution_details` - Detalhes de Execução
- Cada parcela da distribuição
- Valores calculados vs. reais
- Rastreamento completo

#### 29. `miao_meme_comments` - Comentários em Memes
- Sistema de comentários com threads
- Moderação comunitária
- Recompensas automáticas

#### 30. `miao_meme_reactions` - Reações Customizadas
- Reações além de like (love, laugh, wow, etc.)
- Recompensas automáticas

#### 31. `miao_user_follows` - Follow/Unfollow
- Sistema de seguir criadores
- Notificações configuráveis

#### 32. `miao_notifications` - Notificações
- Notificações de todas as interações
- Sistema completo de notificações

#### 33. `miao_meme_collaborations` - Colaborações
- Criar memes em equipe
- Dividir recompensas proporcionalmente

#### 34. `miao_collaborator_badges` - Badges de Colaborador
- Badges por conquistas de colaboração
- Sistema de badges escalável

#### 35. `miao_events` - Calendário de Eventos
- Eventos da comunidade
- Deadlines de quests
- Eventos recorrentes

#### 36. `miao_user_reminders` - Lembretes
- Lembretes personalizados
- Integração com calendário

#### 37. `miao_governance_proposals` - Propostas
- Propostas da comunidade
- Votação on-chain
- Implementação automática

#### 38. `miao_governance_votes` - Votos
- Votos on-chain rastreados
- Transparência total

#### 39. `miao_ai_conversations` - AI Assistant
- Conversas com AI
- Cache inteligente para economizar tokens

#### 40. `miao_ai_cache` - Cache de AI
- Cache de respostas
- Economiza tokens GPT

#### 41. `miao_interaction_rewards` - Recompensas de Interações
- **Configuração centralizada** de recompensas
- **XP e Gems sempre presentes** em todas as interações
- Cooldowns e limites diários configuráveis

#### 42. `miao_telegram_config` - Configuração do Telegram
- Configuração do bot e chat
- Tipos de interações habilitadas
- Formato das mensagens

#### 43. `miao_telegram_messages` - Mensagens Enviadas ao Telegram
- Histórico de todas as mensagens enviadas
- Status e retry automático
- **Todas as interações sociais são enviadas ao Telegram**

## Características

✅ **Modular**: Cada tool tem sua própria estrutura
✅ **Escalável**: Fácil adicionar novas tools/tabelas
✅ **Rastreável**: Histórico completo de transações e atividades
✅ **Gamificação**: Sistema completo de níveis, hierarquias e recompensas
✅ **Referência**: Sistema de referral integrado
✅ **Performance**: Índices otimizados para queries frequentes
⚠️ **Gems Internas**: Pontos de gamificação não transacionáveis entre usuários
💰 **Treasure Chest**: Sistema completo de baús do tesouro (Treasure Chests) e distribuição rastreável
🔄 **Automação**: Transações automáticas e conversões MIAO ↔ SOL
🤝 **Social**: Sistema completo de comentários, reações, follow/unfollow, colaborações
📅 **Calendário**: Eventos da comunidade e lembretes personalizados
🗳️ **Governance**: Propostas e votação on-chain
🤖 **AI Assistant**: Chatbot com cache inteligente para economizar tokens
🎁 **Recompensas Automáticas**: **XP e Gems sempre presentes** em todas as interações
📱 **Telegram Integration**: **Todas as interações sociais são enviadas ao Telegram** com conteúdo e comentários

## Próximos Passos

1. Criar API endpoints para cada tabela
2. Implementar lógica de níveis/hierarquias
3. Sistema de verificação de quests
4. Upload e armazenamento de imagens (IPFS/Arweave)

