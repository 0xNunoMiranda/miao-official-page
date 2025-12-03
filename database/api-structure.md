# MIAO Tools - API Structure

## Sistema Unificado de Transações

Todas as transações do ecossistema (Shop, MIAO Tools, MIAO Games) são rastreadas na tabela `miao_treasury_transactions` com categorias e motivos específicos. Cada carteira tem acesso a todas as transações do ecossistema.

## Endpoints Sugeridos

### Autenticação/Usuário
```
GET    /api/user/:walletAddress          - Obter dados do usuário
POST   /api/user                         - Criar/atualizar usuário
GET    /api/user/:walletAddress/stats    - Estatísticas do usuário
```

### Gems (Pontos Internos - NÃO Transacionáveis)
```
GET    /api/user/:walletAddress/gems           - Gems atuais
GET    /api/user/:walletAddress/gems/history   - Histórico de transações
POST   /api/user/:walletAddress/gems/add      - Adicionar gems (sistema interno apenas)
POST   /api/user/:walletAddress/gems/spend    - Gastar gems em features internas
```
**NOTA:** Gems são pontos de gamificação internos. Não há endpoints de transferência entre usuários.

### Meme Studio
```
GET    /api/memes/:walletAddress              - Listar memes do usuário
POST   /api/memes                             - Criar novo meme
GET    /api/memes/:id                         - Detalhes do meme
POST   /api/memes/:id/publish                 - Publicar no feed
GET    /api/feed                              - Feed da comunidade
POST   /api/memes/:id/like                    - Curtir meme
POST   /api/memes/:id/share                   - Compartilhar meme
```

### Quests
```
GET    /api/quests                            - Listar quests disponíveis
GET    /api/user/:walletAddress/quests        - Progresso do usuário
POST   /api/user/:walletAddress/quests/:id/claim - Reclamar recompensa
POST   /api/user/:walletAddress/quests/:id/verify - Verificar conclusão
```

### Atividades
```
GET    /api/user/:walletAddress/activities    - Atividades recentes
POST   /api/activities                       - Registrar atividade
```

### Níveis e Hierarquias
```
GET    /api/levels                            - Configuração de níveis
GET    /api/hierarchies                       - Configuração de hierarquias
POST   /api/user/:walletAddress/check-level-up - Verificar e atualizar nível
```

### Referências
```
GET    /api/user/:walletAddress/referrals     - Lista de referidos
POST   /api/user/:walletAddress/referral-code - Gerar código de referência
GET    /api/referral/:code                    - Validar código
```

### Transações do Ecossistema (Unificado)
```
GET    /api/transactions                      - Todas as transações do ecossistema
GET    /api/transactions/category/:category    - Por categoria (shop, tools, games)
GET    /api/transactions/source/:type/:id      - Por origem específica (shop_order/123, tool_purchase/5, game_entry/2)
GET    /api/transactions/wallet/:walletId      - Por carteira treasury
GET    /api/transactions/summary               - Resumo do ecossistema (por categoria)
GET    /api/user/:walletAddress/transactions   - Transações do usuário (todas as categorias)
```

### Shop
```
GET    /api/shop/products                     - Catálogo de produtos
GET    /api/shop/products/:id                 - Detalhes do produto
POST   /api/shop/orders                       - Criar encomenda
GET    /api/shop/orders/:id                   - Detalhes da encomenda
GET    /api/shop/orders                       - Listar encomendas (com filtros)
GET    /api/shop/transactions                 - Transações da shop (link com treasury)
```

### Tools (Features Premium)
```
GET    /api/tools/features                   - Listar features disponíveis
GET    /api/tools/features/:id               - Detalhes da feature
POST   /api/tools/features/:id/purchase     - Comprar feature (gems ou $MIAO)
GET    /api/user/:walletAddress/tools        - Features ativas do usuário
GET    /api/tools/transactions               - Transações de tools (link com treasury)
```

### Games
```
GET    /api/games                            - Listar jogos disponíveis
GET    /api/games/:id                        - Detalhes do jogo
POST   /api/games/:id/start                  - Iniciar jogo (buscar/criar progresso)
POST   /api/games/:id/progress                - Salvar progresso durante o jogo
POST   /api/games/:id/finish                  - Finalizar sessão de jogo
GET    /api/user/:walletAddress/games/:gameId/progress - Obter progresso do usuário
GET    /api/user/:walletAddress/games         - Listar progresso em todos os jogos
GET    /api/games/:id/leaderboard            - Leaderboard do jogo
GET    /api/games/:id/stats                   - Estatísticas gerais do jogo
GET    /api/games/transactions                - Transações de games (link com treasury)
```

### Recursos e Itens de Jogo
```
GET    /api/resources                        - Listar recursos disponíveis
GET    /api/resources/category/:category     - Recursos por categoria (game, meme_studio, etc.)
GET    /api/resources/:id                    - Detalhes do recurso
POST   /api/resources/:id/purchase          - Comprar recurso (gems ou SOL)
GET    /api/user/:walletAddress/resources    - Recursos comprados pelo usuário
GET    /api/user/:walletAddress/resources/active - Recursos ativos do usuário
GET    /api/user/:walletAddress/resources/:resourceKey/check - Verificar se tem recurso ativo
POST   /api/user/:walletAddress/resources/:resourceId/use - Usar recurso consumível
```

### Social & Comunidade
```
GET    /api/memes/:memeId/comments           - Listar comentários de um meme
POST   /api/memes/:memeId/comments          - Comentar em meme
POST   /api/comments/:commentId/reply       - Responder comentário (thread)
POST   /api/comments/:commentId/like        - Curtir comentário
DELETE /api/comments/:commentId             - Deletar comentário

GET    /api/memes/:memeId/reactions         - Listar reações de um meme
POST   /api/memes/:memeId/reactions         - Reagir a meme
DELETE /api/memes/:memeId/reactions/:type    - Remover reação

POST   /api/user/:walletAddress/follow       - Seguir usuário
DELETE /api/user/:walletAddress/follow       - Deixar de seguir
GET    /api/user/:walletAddress/followers    - Listar seguidores
GET    /api/user/:walletAddress/following    - Listar seguindo

GET    /api/feed                             - Feed personalizado
GET    /api/feed/trending                    - Feed trending
GET    /api/feed/following                   - Feed de seguidos
POST   /api/feed/preferences                 - Atualizar preferências do feed

GET    /api/user/:walletAddress/notifications - Listar notificações
POST   /api/notifications/:id/read           - Marcar como lida
POST   /api/notifications/read-all           - Marcar todas como lidas

POST   /api/memes/:memeId/collaborate        - Colaborar em meme
GET    /api/user/:walletAddress/collaborations - Histórico de colaborações
GET    /api/user/:walletAddress/badges        - Badges do usuário

GET    /api/events                           - Listar eventos
GET    /api/events/:id                       - Detalhes do evento
POST   /api/user/:walletAddress/reminders    - Criar lembrete
GET    /api/user/:walletAddress/reminders    - Listar lembretes

GET    /api/governance/proposals             - Listar propostas
POST   /api/governance/proposals             - Criar proposta
GET    /api/governance/proposals/:id         - Detalhes da proposta
POST   /api/governance/proposals/:id/vote    - Votar em proposta
GET    /api/governance/proposals/:id/votes   - Listar votos

POST   /api/ai/chat                          - Chat com AI Assistant
GET    /api/ai/trends                        - Análises de tendências
GET    /api/ai/suggestions                   - Sugestões de memes

POST   /api/content/:type/:id/report         - Reportar conteúdo
GET    /api/moderation/reports               - Listar reports (moderadores)
POST   /api/moderation/actions               - Ação de moderação
```

### Telegram Integration
```
POST   /api/telegram/send-social-interaction - Enviar interação social ao Telegram
GET    /api/telegram/messages                - Listar mensagens enviadas
GET    /api/telegram/config                  - Obter configuração
POST   /api/telegram/config                  - Atualizar configuração
```
**NOTA:** Todas as interações sociais (comentários, reações, follows, etc.) são automaticamente enviadas ao Telegram mostrando o conteúdo e comentários.

