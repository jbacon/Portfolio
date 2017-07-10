#!/bin/bash -ex
docker stop node && docker rm node
docker stop nginx && docker rm nginx
docker stop nginx-site && docker rm nginx-site
docker stop mongod && docker rm mongod
docker stop mongo && docker rm mongo