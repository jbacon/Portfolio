#!/bin/bash -ex
set -x;
DIR="$(cd "$(dirname "$0")" && pwd)"

NPM_RUN_SCRIPT='startDev'
if [ "${ENVIRONMENT}" = "production" ]; then 
	NPM_RUN_SCRIPT='startProd'
fi

# Stop/Remove Existing Node
docker stop node
docker rm node

docker run \
--name node \
--interactive \
--tty \
--detach \
--volume ${DIR}/:/app/ \
--expose 3000 \
$(if [ "${ENVIRONMENT}" = "production" ]; then
	echo '--env CONFIG_FILE=./configs-prod.json '
else
	echo '--publish 9229:9229 --env CONFIG_FILE=./configs-dev.json '
fi) \
--env HTTP_PROXY=${HTTP_PROXY} \
--env HTTPS_PROXY=${HTTPS_PROXY} \
--env http_proxy=${http_proxy} \
--env https_proxy=${https_proxy} \
--env NO_PROXY=${NO_PROXY} \
--env no_proxy=${no_proxy} \
node:7.10.0-alpine \
/bin/sh -c \
"
apk update;
apk add git;
cd /app/;
npm install;
npm run ${NPM_RUN_SCRIPT};
"