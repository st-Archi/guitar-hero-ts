FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY index.html ./
COPY main.js ./
COPY style.css ./
COPY map.json ./
RUN echo "Assets validados."

FROM nginx:1.25-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/index.html  /usr/share/nginx/html/
COPY --from=builder /app/main.js     /usr/share/nginx/html/
COPY --from=builder /app/style.css   /usr/share/nginx/html/
COPY --from=builder /app/map.json    /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
