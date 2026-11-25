#!/bin/sh

set -e

echo "[INICIALIZAÇÃO] Aguardando banco de dados..."
sleep 15

echo "[INICIALIZAÇÃO] Verificando migrations..."

./node_modules/.bin/sequelize-cli db:migrate --env production || {
  echo "[AVISO] Falha ao executar migrations. Verifique a saída acima."
}

echo "[INICIALIZAÇÃO] Iniciando servidor..."
exec node dist/server.js

