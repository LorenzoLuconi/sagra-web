# Stage 1: Build stage
FROM node:22-alpine AS build

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file delle dipendenze per sfruttare la cache di Docker
COPY package.json yarn.lock ./

# Installa le dipendenze (include le devDependencies per la build)
RUN yarn install --frozen-lockfile

# Copia il resto del codice sorgente
COPY . .

# Esegue la build dell'applicazione
RUN yarn vite build

# Stage 2: Runtime stage
FROM nginx:stable-alpine

# Metadati e Variabili d'ambiente (conservate dal file originale)
ENV PROFILE=devel
ENV APP_HOME=/app
ENV TZ=Europe/Rome

# Copia gli artifact della build dallo stage precedente alla directory di nginx
COPY --from=build /app/dist /var/www

# Copia la configurazione personalizzata di nginx
# (Assumendo che resources/nginx.conf esista e sia configurato correttamente)
COPY ./resources/nginx.conf /etc/nginx/conf.d/default.conf

# Espone la porta 80
EXPOSE 80

# Avvia nginx (già definito nell'immagine base nginx:alpine)
CMD ["nginx", "-g", "daemon off;"]

