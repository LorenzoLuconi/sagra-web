FROM node:24-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive

COPY . .
RUN yarn build

FROM nginx:stable-alpine AS runtime

ENV TZ=Europe/Rome

COPY --from=build /app/dist /var/www
COPY ./resources/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
