docker run \
--name node \
--interactive \
--tty \
--detach \
--volume ${PWD}/ApiServer/:/app/ \
--expose 3000 \
--env HTTP_PROXY=${HTTP_PROXY} \
--env HTTPS_PROXY=${HTTPS_PROXY} \
--env http_proxy=${http_proxy} \
--env https_proxy=${https_proxy} \
--env NO_PROXY=${NO_PROXY} \
--env no_proxy=${no_proxy} \
node:7.10.0-alpine \
/bin/sh -c \
'
apk update;
apk add git;
cd /app/;
npm install;
npm run startProd;
'