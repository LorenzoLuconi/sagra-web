FROM nginx:stable-alpine

ENV TZ=Europe/Rome

COPY ./dist /var/www
COPY ./resources/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./resources/docker-entrypoint.d/10-generate-configuration.sh /docker-entrypoint.d/10-generate-configuration.sh
RUN chmod +x /docker-entrypoint.d/10-generate-configuration.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
