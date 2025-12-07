# Sistema de Rotação de API Keys

O sistema agora suporta **rotação automática de múltiplas API keys** para aumentar a capacidade de requisições!

## 📊 Benefícios

- **Escalabilidade**: Cada key adicional = mais capacidade
- **Distribuição automática**: Requests são distribuídos entre todas as keys
- **Fallback inteligente**: Se uma key atingir limite, usa a próxima automaticamente
- **Estatísticas**: Tracking de uso por key

## 🔑 Como Configurar

### Para Hugging Face (Texto e Imagens)

Adicione múltiplas keys no seu `.env.local`:

```env
# Key principal
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx

# Segunda key padrão (já configurada no código)
HUGGINGFACE_API_KEY_2=hf_your_second_key_here

# Keys adicionais (opcional)
HUGGINGFACE_API_KEY_3=hf_yyyyyyyyyyyyy
HUGGINGFACE_API_KEY_4=hf_zzzzzzzzzzzzz
```

**Capacidade:**
- 1 key = 1.000 requests/dia
- 3 keys = 3.000 requests/dia
- 5 keys = 5.000 requests/dia
- etc.

### Para Stable Horde (Imagens)

```env
# Key principal
STABLE_HORDE_API_KEY=lqICemPDKR3ocs7teOaq1g

# Keys adicionais (opcional)
STABLE_HORDE_API_KEY_2=outra_key_aqui
STABLE_HORDE_API_KEY_3=mais_uma_key_aqui
```

**Nota:** Stable Horde não tem limite rígido, mas a rotação ajuda com rate limiting.

## 🚀 Como Funciona

1. **Rotação Round-Robin**: As keys são usadas em sequência
2. **Verificação de Limites**: Sistema verifica se key está disponível antes de usar
3. **Auto-Reset Diário**: Contadores resetam automaticamente a cada 24h
4. **Fallback Automático**: Se uma key falhar, tenta a próxima

## 📈 Exemplo de Uso

### Antes (1 key):
```
Requests/dia: 1.000
Rate limit: Frequente
Escalabilidade: Limitada
```

### Depois (3 keys):
```
Requests/dia: 3.000
Rate limit: Raro
Escalabilidade: 3x melhor!
```

## 🔍 Monitoramento

O sistema loga automaticamente:
- Qual key está sendo usada
- Estatísticas de uso (total/capacidade)
- Quando uma key atinge limite
- Rotação para próxima key

**Exemplo de log:**
```
Hugging Face: 3 API key(s) configurada(s) = 3000 requests/dia disponíveis
Using Hugging Face API key: hf_abc123... (rotation enabled)
Hugging Face request successful. Stats: 245/3000 requests used today
```

## 💡 Dicas

1. **Distribua as contas**: Use contas diferentes do Hugging Face para evitar detecção
2. **Monitore o uso**: Acompanhe os logs para ver qual key está sendo mais usada
3. **Adicione keys gradualmente**: Comece com 2-3 keys e adicione mais conforme necessário

## ⚠️ Importante

- As keys devem ser de **contas diferentes** do Hugging Face
- Não compartilhe as keys - mantenha-as seguras no `.env.local`
- O sistema funciona automaticamente - não precisa configurar nada além das variáveis de ambiente
