FROM node:20-slim

WORKDIR /app
COPY package.json ./
COPY server.js ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
USER node
CMD ["node", "server.js"]
