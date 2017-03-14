#!/usr/bin/env bash

# this script allows us to run unit tests using
# docker-compose -f docker-compose.testing.yaml up --build
# do not use outside of docker container

cd /src/app/
echo "testing frontend"
./node_modules/.bin/gulp test

echo "testing backend"
npm test

echo "all test pass!"
exit 0