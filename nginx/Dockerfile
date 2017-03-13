FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf
COPY blockuseragents.rules /etc/nginx/blockuseragents.rules
COPY dhparam.pem /etc/nginx/
COPY ./ssl/* /etc/nginx/ssl/

EXPOSE 443 80