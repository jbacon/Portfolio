docker run \
--name nginx \
--interactive \
--tty \
--detach \
--volume ${PWD}/ngnix.conf:/etc/nginx.conf \
--volume /etc/letsencrypt/live/portfolioapi.joshbacon.name/:/etc/letsencrypt/live/portfolioapi.joshbacon.name/ \
--publish 80:80 \
--publish 443:443 \
--env HTTP_PROXY=${HTTP_PROXY} \
--env HTTPS_PROXY=${HTTPS_PROXY} \
--env http_proxy=${http_proxy} \
--env https_proxy=${https_proxy} \
--env NO_PROXY=${NO_PROXY} \
--env no_proxy=${no_proxy} \
nginx:1.12.0-alpine