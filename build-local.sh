#!/bin/bash
# Script para fazer build local e preparar para upload
# Execute: bash build-local.sh

echo "🔨 Fazendo build local do Next.js..."
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Limpar build anterior
echo "🧹 Limpando build anterior..."
rm -rf .next

# Fazer build
echo "🏗️  Compilando aplicação..."
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=4096" NEXT_TELEMETRY_DISABLED=1 npm run build

# Verificar se build foi bem-sucedido
if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
    echo ""
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "📦 Próximos passos:"
    echo "1. Comprima a pasta .next em um arquivo ZIP"
    echo "2. Faça upload via File Manager do cPanel para:"
    echo "   /home/miaotoke/repositories/miao-official-page/"
    echo "3. Extraia o ZIP no servidor"
    echo "4. Reinicie a aplicação no Node.js Selector"
    echo ""
    echo "📊 Tamanho da pasta .next:"
    du -sh .next
else
    echo ""
    echo "❌ Build falhou! Verifique os erros acima."
    exit 1
fi

