#!/bin/bash

# 🎯 MIAO Tools - Database Setup Command
# Corrected Database Name: miaotoke_website

echo "=========================================="
echo "MIAO Tools - MySQL Database Setup"
echo "=========================================="
echo ""
echo "Database Name: miaotoke_website"
echo "Host: 62.193.192.12"
echo "User: miaotoke_miranda"
echo ""
echo "Executing SQL script..."
echo ""

# Execute the stored procedures script
mysql -h 62.193.192.12 -u miaotoke_miranda -p_Miranda69_! -D miaotoke_website < database/stored-procedures.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Database setup completed."
    echo ""
    echo "Verifying tables and procedures..."
    mysql -h 62.193.192.12 -u miaotoke_miranda -p_Miranda69_! -D miaotoke_website -e "SHOW TABLES;"
    echo ""
    echo "✅ All ready! You can now:"
    echo "   1. npm install"
    echo "   2. npm run dev"
    echo "   3. Start using MIAO Tools!"
else
    echo ""
    echo "❌ ERROR during setup!"
    echo "Please check:"
    echo "   • Credentials are correct"
    echo "   • Network connection to 62.193.192.12"
    echo "   • Database miaotoke_website exists"
fi

echo ""
echo "=========================================="
