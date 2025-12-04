# 🔧 Correção: Conexão Phantom em Localhost

## Problema
A Phantom wallet pode não conectar corretamente em `localhost` devido a:
1. Verificação de `window.solana` vs `window.phantom.solana`
2. Falta de opção `onlyIfTrusted: false` para forçar popup
3. Problemas de detecção da wallet instalada

## Solução Implementada

### 1. Detecção Melhorada
O código agora verifica **ambas** as localizações:
- `window.solana.isPhantom` (mais comum)
- `window.phantom.solana.isPhantom` (fallback)

### 2. Forçar Popup em Localhost
A conexão agora usa `onlyIfTrusted: false` para garantir que o popup apareça mesmo em localhost:

```typescript
await phantomProvider.connect({ onlyIfTrusted: false })
```

### 3. Arquivos Atualizados
- ✅ `lib/wallet-service.ts` - Função de conexão corrigida
- ✅ `lib/wallet-auth-service.ts` - Detecção de wallet atualizada
- ✅ `lib/use-wallet-auth.tsx` - Listeners de eventos corrigidos

## Como Testar

1. **Certifique-se que a Phantom está instalada:**
   - Abra a extensão Phantom no navegador
   - Verifique se está ativa

2. **Limpe o cache do navegador:**
   - Pressione `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
   - Limpe cache e cookies

3. **Recarregue a página:**
   - Pressione `Ctrl+F5` (hard refresh)

4. **Tente conectar:**
   - Clique no botão de conectar wallet
   - O popup da Phantom deve aparecer
   - Aprove a conexão

## Troubleshooting

### O popup não aparece
- Verifique se a Phantom está instalada e ativa
- Tente desconectar e reconectar a Phantom
- Reinicie o navegador

### Erro "Phantom wallet not found"
- Verifique se a extensão Phantom está instalada
- Tente em outro navegador (Chrome, Firefox, Edge)
- Verifique se não há bloqueadores de extensões ativos

### A conexão falha silenciosamente
- Abra o Console do navegador (F12)
- Verifique se há erros no console
- Tente usar `npm run dev` em vez de `npm run start`

### Ainda não funciona
1. Verifique se está usando HTTPS ou localhost (não IP)
2. Tente usar `127.0.0.1:3000` em vez de `localhost:3000`
3. Verifique as permissões da extensão Phantom

## Notas Técnicas

- A Phantom expõe `window.solana` quando instalada
- `onlyIfTrusted: false` força o popup mesmo em localhost
- O código agora suporta ambas as APIs (legacy e nova)

