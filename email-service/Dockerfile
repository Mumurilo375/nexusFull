FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
COPY assets ./assets
RUN npm run build && npm prune --omit=dev --ignore-scripts

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/assets ./assets
USER node
CMD ["node", "dist/server.js"]
