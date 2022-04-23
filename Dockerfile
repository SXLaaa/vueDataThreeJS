FROM nginx
MAINTAINER shixiaolei
RUN rm /etc/nginx/conf.d/default.conf
ADD default.conf /etc/nginx/conf.d/
COPY dist/ /usr/local/var/www/vue-threejs