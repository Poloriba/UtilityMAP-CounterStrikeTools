FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --quiet
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/utilitymap-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
