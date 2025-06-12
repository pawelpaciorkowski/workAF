FROM nginx
COPY ./deployment/production/nginx/default.conf /etc/nginx/conf.d/
COPY ./alabflow/build/ /usr/share/nginx/html

COPY .tmp/alabflow.alab.com.pl.crt /etc/nginx/ssl/alabflow.alab.com.pl.crt
COPY .tmp/alabflow.alab.com.pl.key /etc/nginx/ssl/alabflow.alab.com.pl.key
RUN chmod 400 /etc/nginx/ssl/alabflow.alab.com.pl.key

RUN rm -rf ./.tmp/