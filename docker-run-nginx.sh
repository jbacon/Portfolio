docker run \
--name nginx \
--interactive \
--tty \
--detach \
--volume ${PWD}/nginx.conf:/etc/nginx/conf.d/default.conf \
--volume /etc/letsencrypt/archive/portfolioapi.joshbacon.name/:/etc/letsencrypt/archive/portfolioapi.joshbacon.name/ \
--publish 80:80 \
--publish 443:443 \
--env HTTP_PROXY=${HTTP_PROXY} \
--env HTTPS_PROXY=${HTTPS_PROXY} \
--env http_proxy=${http_proxy} \
--env https_proxy=${https_proxy} \
--env NO_PROXY=${NO_PROXY} \
--env no_proxy=${no_proxy} \
nginx:1.12.0-alpine