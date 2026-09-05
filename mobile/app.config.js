const path = require("node:path");
const dotenv = require("dotenv");

// O mobile não mantém um .env próprio. O Expo inicia a partir de mobile/,
// então carregamos explicitamente o arquivo compartilhado da raiz.
dotenv.config({
  path: path.resolve(__dirname, "..", ".env"),
  override: false,
});

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    // O backend local usa HTTP durante o desenvolvimento. Builds de produção
    // continuam exigindo HTTPS no cliente da API.
    usesCleartextTraffic: process.env.NODE_ENV !== "production",
  },
});
