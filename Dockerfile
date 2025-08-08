FROM node:22

COPY . /src

WORKDIR /src
RUN yarn install && yarn vite build


FROM nginx:alpine

ENV PROFILE=devel
ENV APP_HOME=/app
ENV TZ=Europe/Rome

COPY --from=0 /src/dist /var/www 
COPY ./resources/nginx.conf /etc/nginx/conf.d/default.conf 

EXPOSE 80

