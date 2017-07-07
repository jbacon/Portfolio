docker run \
--name mongod \
--interactive \
--tty \
--detach \
--expose 27017 \
--volume ${PWD}/mongod.conf:/etc/mongod.conf \
--volume ${PWD}/data/db:/data/db \
--env HTTP_PROXY=${HTTP_PROXY} \
--env HTTPS_PROXY=${HTTPS_PROXY} \
--env http_proxy=${http_proxy} \
--env https_proxy=${https_proxy} \
--env NO_PROXY=${NO_PROXY} \
--env no_proxy=${no_proxy} \
mongo:3.5.6 \
mongod