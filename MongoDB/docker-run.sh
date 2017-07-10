#!/bin/bash -ex
set -x 
# Find path relative to this script file
DIR="$(cd "$(dirname "$0")" && pwd)"

# Generate Mongod Configurations
cat <<-EOF | tee ${DIR}/mongod.conf
processManagement:
   fork: true
net:
   bindIp: 127.0.0.1
   port: 27017
storage:
   dbPath: /data/db
   journal:
      enabled: true
systemLog:
   destination: file
   path: "/var/log/mongodb/mongod.log"
   logAppend: true
storage:
   journal:
      enabled: true
net:
   bindIp: 127.0.0.1,10.8.0.10,192.168.4.24
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1
EOF
# Stop/Remove Existing Mongod
docker stop mongod
docker rm mongod

# Start New MongoD
docker run \
--name mongod \
--interactive \
--tty \
--detach \
--expose 27017 \
--volume ${DIR}/mongod.conf:/etc/mongod.conf \
--volume ${DIR}/data/db:/data/db \
--env HTTP_PROXY=${HTTP_PROXY} \
--env HTTPS_PROXY=${HTTPS_PROXY} \
--env http_proxy=${http_proxy} \
--env https_proxy=${https_proxy} \
--env NO_PROXY=${NO_PROXY} \
--env no_proxy=${no_proxy} \
mongo:3.5.6 \
mongod

MONGOD_CONTAINER_IP=$(docker inspect mongod --format '{{ .NetworkSettings.IPAddress }}')

# Generate Setup Script
cat <<-EOF | tee ${DIR}/mongo-setup.js
connection = new Mongo('mongodb://${MONGOD_CONTAINER_IP}:27017')
db = connection.getDB('admin')
db.dropUser('admin');
db.createUser(
  {
    user: "admin",
    pwd: "${MONGO_USER_ADMIN_PASSWORD}",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)
db = connection.getDB('portfolio')
db.accounts.createIndex({ email: 1 }, { unique: true })
db = connection.getDB('users')
db.dropUser('portfolio');
db.createUser(
  {
    user: "portfolio",
    pwd: "${MONGO_USER_PORTFOLIO_PASSWORD}",
    roles: [ { role: "readWrite", db: "portfolio" } ]
  }
)
EOF

# Stop Existing Mongo Setup Shells
docker stop mongo
docker rm mongo

# Wait until MongoDB ready
sleep 5
# Start New Mongo Setup Shell
docker run \
--name mongo \
--interactive \
--tty \
--rm \
--volume ${DIR}/mongo-setup.js:/mongo-setup.js \
--env HTTP_PROXY=${HTTP_PROXY} \
--env HTTPS_PROXY=${HTTPS_PROXY} \
--env http_proxy=${http_proxy} \
--env https_proxy=${https_proxy} \
--env NO_PROXY=${NO_PROXY} \
--env no_proxy=${no_proxy} \
mongo:3.5.6 \
mongo \
--nodb \
/mongo-setup.js

# Remove Setup Script
rm -f ${DIR}/mongo-setup.js