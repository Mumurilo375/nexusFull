# Nexus Mobile

Frontend mobile do Nexus Full, separado do frontend web e preparado para rodar com Expo Go (SDK 54).

## Rodar no celular

1. Instale o Expo Go no Android ou iOS e mantenha o celular na mesma rede da máquina.
2. No `.env` da raiz, configure o IP local da máquina:

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_API_URL=http://10.10.21.60:3001
   # REACT_NATIVE_PACKAGER_HOSTNAME=10.10.21.60
   ```

3. Suba todos os serviços pela raiz:

   ```bash
   docker compose up --build
   ```

4. Leia o QR code com o Expo Go.

`localhost` no celular aponta para o próprio aparelho. Por isso, use o IP da máquina em `EXPO_PUBLIC_API_URL` e `REACT_NATIVE_PACKAGER_HOSTNAME`. Em produção, utilize HTTPS e não coloque segredos em variáveis `EXPO_PUBLIC_*`, pois elas ficam disponíveis no aplicativo.

Rotas do Expo Router ficam em `app/`; integrações com a API ficam em `services/`.
