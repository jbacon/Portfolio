#!/bin/bash -ex
set -x 
# Find path relative to this script file
DIR="$(cd "$(dirname "$0")" && pwd)"

NODE_CONTAINER_IP=$(docker inspect node --format '{{ .NetworkSettings.IPAddress }}')

if [ "${ENVIRONMENT}" = "production" ]; then
# Prod Configs (cloud)
cat <<-EOF | tee ${DIR}/nginx.conf
server {
    listen 80;
    server_name portfolioapi.joshbacon.name;
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl;
    server_name portfolioapi.joshbacon.name;
    location / {
        proxy_pass http://${NODE_CONTAINER_IP}:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    ssl_certificate /etc/letsencrypt/archive/portfolioapi.joshbacon.name/fullchain1.pem;
    ssl_certificate_key /etc/letsencrypt/archive/portfolioapi.joshbacon.name/privkey1.pem;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_ciphers AES256+EECDH:AES256+EDH:!aNULL;
}
EOF
else
# Dev Configs (local)
cat <<-EOF | tee ${DIR}/nginx.conf
server {
    listen 8080;
    server_name localhost;
    location / {
	    add_header 'Access-Control-Allow-Origin' "$http_origin";
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Mx-ReqToken,X-Requested-With';
        proxy_pass http://${NODE_CONTAINER_IP}:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
fi

docker stop nginx
docker rm nginx

# Start Nginx Reverse Proxy for NodeJS application
docker run \
--name nginx \
--interactive \
--tty \
--detach \
--volume ${DIR}/nginx.conf:/etc/nginx/conf.d/default.conf \
$(if [ "${ENVIRONMENT}" = "production" ]; then 
	echo ' --publish 443:443 --publish 80:80 --volume /etc/letsencrypt/archive/portfolioapi.joshbacon.name/:/etc/letsencrypt/archive/portfolioapi.joshbacon.name/ '
else
	echo ' --publish 8080:8080 '
fi
) \
--env HTTP_PROXY=${HTTP_PROXY} \
--env HTTPS_PROXY=${HTTPS_PROXY} \
--env http_proxy=${http_proxy} \
--env https_proxy=${https_proxy} \
--env NO_PROXY=${NO_PROXY} \
--env no_proxy=${no_proxy} \
nginx:1.12.0-alpine

if [ "${ENVIRONMENT}" != "production" ]; then
	cat <<-EOF | tee ${DIR}/nginx-site.conf
	server {
	    listen 8081;
	    server_name localhost;
	    location / {
		    alias /StaticSite/;
		    try_files \$uri /index.html;
		    gzip_static on;
		    expires max;
		    add_header Cache-Control public;
		  }
	}
	EOF
	docker stop nginx-site
	docker rm nginx-site
	# Start Nginx Static Site
	docker run \
	--name nginx-site \
	--interactive \
	--tty \
	--detach \
	--volume ${DIR}/nginx-site.conf:/etc/nginx/conf.d/default.conf \
	--volume ${DIR}/../StaticSite/:/StaticSite/ \
	--publish 8081:8081 \
	--env HTTP_PROXY=${HTTP_PROXY} \
	--env HTTPS_PROXY=${HTTPS_PROXY} \
	--env http_proxy=${http_proxy} \
	--env https_proxy=${https_proxy} \
	--env NO_PROXY=${NO_PROXY} \
	--env no_proxy=${no_proxy} \
	nginx:1.12.0-alpine
fi 

