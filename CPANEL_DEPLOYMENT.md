# Guia de Deploy no cPanel

## Problema: "No such application or it's broken"

Se você está recebendo este erro, significa que o cPanel está tentando usar Python em vez de Node.js.

## Solução Passo a Passo

### 1. Verificar Arquivo `.cpanel.yml`

O arquivo `.cpanel.yml` deve estar na **raiz do repositório** e ter este formato:

```yaml
---
deployment:
  tasks:
    - /bin/pwd
    - /bin/test -f package.json
    - /bin/rm -rf .next
    - /bin/npm install
    - /bin/npm run build
    - /bin/test -d .next
    - /bin/chmod -R 755 .next
    - /bin/chmod -R 755 public
```

**IMPORTANTE:**
- ✅ Arquivo deve se chamar `.cpanel.yml` (com ponto no início)
- ✅ Deve estar na raiz do repositório
- ✅ Deve estar commitado no Git
- ✅ Não pode ter mudanças não commitadas

### 2. No cPanel - Configurar Node.js

1. Acesse o cPanel
2. Procure por **"Node.js Selector"** ou **"Setup Node.js App"**
3. **Remova qualquer aplicação Python** deste diretório (se existir)
4. Crie uma nova aplicação Node.js:
   - **Node.js version**: 18.x ou 20.x
   - **Application root**: `/home/miaotoke/apps/miao-official-page`
   - **Application URL**: Seu domínio
   - **Application startup file**: Deixe vazio ou `server.js`
   - **Passenger log file**: `/home/miaotoke/apps/miao-official-page/logs/passenger.log`

### 3. Verificar Git Status

Antes de fazer deploy, certifique-se de que:

```bash
git status
```

Deve mostrar:
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

Se houver mudanças não commitadas, commite-as:

```bash
git add .
git commit -m "Your message"
git push origin main
```

### 4. Fazer Deploy no cPanel

1. No cPanel, vá em **"Git Version Control"**
2. Se já tem o repositório conectado, clique em **"Pull or Deploy"**
3. Se não tem, adicione o repositório:
   - **Repository URL**: `https://github.com/0xNunoMiranda/miao-official-page.git`
   - **Repository Branch**: `main`
   - **Deploy Directory**: `/home/miaotoke/apps/miao-official-page`

### 5. Verificar Deploy

Após o deploy, verifique:

1. **Logs do deploy** no cPanel
2. **Node.js App** está rodando
3. **Acesse o domínio** para testar

## Troubleshooting

### Erro: "No such application or it's broken"

**Causa**: cPanel está tentando usar Python

**Solução**:
1. No cPanel, vá em **"Python Selector"** ou **"Setup Python App"**
2. **Remova qualquer aplicação Python** do diretório `/home/miaotoke/apps/miao-official-page`
3. Configure apenas **Node.js App** no mesmo diretório

### Erro: "A valid .cpanel.yml file exists"

**Causa**: Arquivo não está commitado ou tem sintaxe inválida

**Solução**:
1. Verifique se `.cpanel.yml` está na raiz
2. Verifique se está commitado: `git ls-files | grep cpanel`
3. Verifique sintaxe YAML (sem tabs, apenas espaços)

### Erro: "No uncommitted changes exist"

**Causa**: Há mudanças não commitadas

**Solução**:
```bash
git add .
git commit -m "Fix deployment"
git push origin main
```

### Build Falha

**Causa**: Node.js não encontrado ou versão incorreta

**Solução**:
1. No cPanel Node.js Selector, selecione Node.js 18.x ou 20.x
2. Verifique se npm está disponível: `npm --version`
3. Verifique logs do deploy para erros específicos

## Estrutura Esperada

Após deploy bem-sucedido:

```
/home/miaotoke/apps/miao-official-page/
├── .cpanel.yml          ✅ (deve existir)
├── package.json         ✅ (deve existir)
├── .next/               ✅ (criado após build)
├── node_modules/        ✅ (criado após npm install)
├── app/                 ✅
├── components/          ✅
├── public/              ✅
└── ...
```

## Notas Importantes

- ✅ Este é um projeto **Node.js/Next.js**, não Python
- ✅ Use **Node.js Selector** no cPanel, não Python Selector
- ✅ Arquivo `.cpanel.yml` deve estar commitado no Git
- ✅ Não pode haver mudanças não commitadas
- ✅ Node.js versão: 18.x ou 20.x

