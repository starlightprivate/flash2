#!/usr/bin/env bash

# this script allows us to run unit tests using
# docker-compose -f docker-compose.testing.yaml up --build
# do not use outside of docker container

echo "testing on browser phantomjs"
export TEST_BROWSER=phantomjs && protractor protractor.config.js

echo "all test finished!"
exit 0