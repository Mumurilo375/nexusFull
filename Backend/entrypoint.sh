#!/bin/sh

set -e

echo "========================================="
echo "Aguardando banco de dados estar pronto..."
echo "========================================="
sleep 15

echo ""
echo "========================================="
echo "Executando migrations do Sequelize..."
echo "========================================="

npx sequelize-cli db:migrate --env production || {
  echo "⚠️  Aviso: Migrations falharam ou já foram executadas"
}

echo ""
echo "========================================="
echo "Iniciando servidor..."
echo "========================================="
npm start

