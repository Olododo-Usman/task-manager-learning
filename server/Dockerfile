FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --chown=node:node index.js ./

ENV NODE_ENV=production

USER node

EXPOSE 4100

CMD ["node", "index.js"]
