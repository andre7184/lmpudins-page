FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server ./server
RUN mkdir -p /data/uploads && chown -R node:node /data
EXPOSE 3000
USER node
CMD ["node","server/index.js"]
