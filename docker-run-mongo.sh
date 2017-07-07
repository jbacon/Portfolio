docker run \
--name mongo \
--interactive \
--tty \
--rm \
--volume ${PWD}/mongod-setup.js:/mongod-setup.js \
--env HTTP_PROXY=${HTTP_PROXY} \
--env HTTPS_PROXY=${HTTPS_PROXY} \
--env http_proxy=${http_proxy} \
--env https_proxy=${https_proxy} \
--env NO_PROXY=${NO_PROXY} \
--env no_proxy=${no_proxy} \
mongo:3.5.6 \
mongo \
172.17.0.2:27017 \
/mongod-setup.js