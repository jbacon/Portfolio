#!/bin/bash -ex
set -x 
DIR="$(cd "$(dirname "$0")" && pwd)"
bash ${DIR}/MongoDB/docker-run.sh
bash ${DIR}/ExpressApi/docker-run.sh
bash ${DIR}/Nginx/docker-run.sh