# Build da landing page React/Vite e publicação como site estático via Nginx.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Variáveis VITE_* são incorporadas ao frontend durante o build.
ARG VITE_WHATSAPP_NUMBER=""
ENV VITE_WHATSAPP_NUMBER=${VITE_WHATSAPP_NUMBER}

RUN npm run build

FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
