#!/usr/bin/env bash

cd /src/app/
echo "testing frontend"
./node_modules/.bin/gulp test

echo "testing backend"
npm test

