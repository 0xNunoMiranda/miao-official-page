#!/bin/bash

# Script para adicionar novo administrador ao MIAO Tools
# Usage: ./add-admin.sh <wallet> <username> <password> <email>

if [ "$#" -ne 4 ]; then
    echo "Usage: ./add-admin.sh <wallet_address> <username> <password> <email>"
    echo "Example: ./add-admin.sh 0x742d35Cc6634C0532925a3b844Bc9e7FA9946aF4 nunoAdmin myPass123 nuno@miao.com"
    exit 1
fi

WALLET=$1
USERNAME=$2
PASSWORD=$3
EMAIL=$4

# Configurações da BD
DB_HOST=${DB_HOST:-62.193.192.12}
DB_USER=${DB_USER:-miaotoke_miranda}
DB_PASS=${DB_PASS:-_Miranda69_!}
DB_NAME=${DB_NAME:-miaotoke_website}

echo "Adding new admin to MIAO Tools..."
echo "Wallet: $WALLET"
echo "Username: $USERNAME"
echo "Email: $EMAIL"
echo ""

# Executar SQL
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -D $DB_NAME <<EOF
CALL sp_admin_create(
  '$WALLET',
  '$USERNAME',
  SHA2('$PASSWORD', 256),
  '$EMAIL',
  1
);
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Admin created successfully!"
    echo ""
    echo "Login credentials:"
    echo "  Username: $USERNAME"
    echo "  Password: $PASSWORD"
    echo "  Wallet: $WALLET"
    echo ""
    echo "⚠️  Store these credentials securely!"
else
    echo ""
    echo "❌ Failed to create admin. Check database connection and credentials."
    exit 1
fi
