# Guia: Build Local e Upload para cPanel

Como o servidor cPanel tem limitações de memória que impedem o build do Next.js, a solução é fazer o build localmente e fazer upload apenas da pasta `.next`.

## Passo 1: Build Local

No seu computador local, execute:

```bash
npm install
npm run build
```

Isso criará a pasta `.next` com todos os arquivos compilados.

## Passo 2: Fazer Upload da Pasta `.next`

### Opção A: Via File Manager do cPanel

1. Acesse o **File Manager** no cPanel
2. Navegue até o diretório do seu repositório: `/home/miaotoke/repositories/miao-official-page`
3. Faça upload da pasta `.next` completa (pode usar ZIP e extrair no servidor)

### Opção B: Via FTP/SFTP

1. Conecte-se ao servidor via FTP/SFTP
2. Navegue até o diretório do repositório
3. Faça upload da pasta `.next` completa

### Opção C: Via Git (não recomendado)

⚠️ **ATENÇÃO**: A pasta `.next` está no `.gitignore` por padrão. Se quiser fazer commit dela:

1. Remova `.next` do `.gitignore` temporariamente
2. Faça commit e push da pasta `.next`
3. **IMPORTANTE**: Adicione `.next` de volta ao `.gitignore` depois

## Passo 3: Verificar Build

Após fazer upload, verifique se o arquivo existe:

```bash
# No servidor, via SSH ou Terminal do cPanel
ls -la /home/miaotoke/repositories/miao-official-page/.next/BUILD_ID
```

Se o arquivo existir, o servidor deve funcionar corretamente.

## Passo 4: Reiniciar Aplicação

No cPanel:
1. Vá em **Node.js Selector**
2. Clique em **Restart App**

## Estrutura Esperada no Servidor

```
/home/miaotoke/repositories/miao-official-page/
├── .next/              ✅ (fazer upload desta pasta)
│   ├── BUILD_ID        ✅ (deve existir)
│   ├── static/         ✅
│   └── ...
├── node_modules/       ✅ (já existe após npm install)
├── public/             ✅
├── app/                ✅
├── components/         ✅
├── server.js           ✅
├── package.json        ✅
└── ...
```

## Quando Fazer Build Local

Faça build local sempre que:
- Fizer mudanças no código
- Adicionar novas dependências
- Modificar `next.config.mjs`
- Atualizar componentes React

## Dicas

1. **Mantenha versões sincronizadas**: Use a mesma versão do Node.js local e no servidor
2. **Teste localmente primeiro**: Sempre teste o build local antes de fazer upload
3. **Backup**: Faça backup da pasta `.next` antiga antes de substituir
4. **Tamanho**: A pasta `.next` pode ser grande (50-200MB), use compressão ZIP para upload

## Alternativa: Usar Serviço de CI/CD

Para automatizar isso, você pode usar:
- **GitHub Actions**: Build automático e deploy via FTP
- **Vercel**: Deploy automático do Next.js
- **Netlify**: Deploy automático

Esses serviços têm mais recursos e podem fazer o build automaticamente.

