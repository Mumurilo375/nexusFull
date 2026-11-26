#!/bin/sh

set -e

echo '[INICIALIZAÇÃO] Aguardando estabilização do banco de dados (15 segundos)...'
sleep 15

echo "[INICIALIZAÇÃO] Verificando migrations..."

if ./node_modules/.bin/sequelize-cli db:migrate --env production; then
  echo "[INICIALIZAÇÃO] Verificação de migrations concluída."
else
  echo "[AVISO] Falha ao executar migrations. Verifique a saída acima."
fi

echo "[INICIALIZAÇÃO] Iniciando servidor..."
exec node dist/server.js

