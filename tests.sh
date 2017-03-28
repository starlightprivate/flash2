#!/usr/bin/env bash

# this script allows us to run unit tests using
# docker-compose -f docker-compose.testing.yaml up --build
# do not use outside of docker container

set -e

cd /src/app/
echo "testing frontend"
./node_modules/.bin/gulp test

echo "testing backend"
npm test

echo "sending coverate report"
# b208580aee4ed59ef2d5b8112fbc836edf531dc2cb9569028a83556e7f25e176
CODECLIMATE_REPO_TOKEN=b208580aee4ed59ef2d5b8112fbc836edf531dc2cb9569028a83556e7f25e176 ./node_modules/.bin/codeclimate-test-reporter < coverage/lcov.info

echo "all test pass!"
exit 0