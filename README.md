# flash2
Merge of frontend and backend code into single container that is ok for developers to deploy on their local PC



[![Codeship status](https://codeship.com/projects/205942/status?branch=master)](https://codeship.com/projects/205942/status?branch=master)


Frontend
===================
State of [f98451a6f](https://github.com/starlightgroup/flashlightsforever/commit/f98451a6ffbf929566b595ad129e1eb37b329182) commit - tip of dev branch


Backend
==================
State of [d4779c935](https://github.com/starlightgroup/node-api/commit/d4779c9352b94a78648ad0ea304d666bc6830636) commit - tip of dev branch


Requirements
=================

1. Linux (sorry, i have 0 skills with other OSes and cannot assist further)
2. Nodejs of >=7.5.0
3. Redis server running with stack settings (localhost:6379 without password)

Or

1. `docker` + `docker-compose`


How to start
=================


1. npm install
2. npm run-script frontend
3. npm start
4. Open `http://localhost:8000`


Or

1. docker-compose up --build
2. Open `http://localhost:8000`

How to build frontend code
==================

Source codes are in `frontend` directory.
Run `npm run-script gulp` to process them and save output in `public` directory.

TODO - livereload?


How to run tests
==================

1. npm run-script eslint (works for backend code mainly)
2. npm test (unit tests for backend code, supertest and mocha)

