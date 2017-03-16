# flash2
Merge of frontend and backend code into single container that is ok for developers to deploy on their local PC

Badges
=================

[ ![Codeship Status for starlightgroup/flash2](https://app.codeship.com/projects/5ec6e150-e305-0134-1b72-664f30205a5b/status?branch=master)](https://app.codeship.com/projects/205942)
[![bitHound Overall Score](https://www.bithound.io/projects/badges/9e423400-03cc-11e7-8b82-1d4d2e7ee639/score.svg)](https://www.bithound.io/github/starlightgroup/flash2)
[![bitHound Dev Dependencies](https://www.bithound.io/projects/badges/9e423400-03cc-11e7-8b82-1d4d2e7ee639/devDependencies.svg)](https://www.bithound.io/github/starlightgroup/flash2/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/projects/badges/9e423400-03cc-11e7-8b82-1d4d2e7ee639/code.svg)](https://www.bithound.io/github/starlightgroup/flash2)
[![Code Climate](https://codeclimate.com/repos/58be6b3139404c025a0024b8/badges/1865a39a9ceafd4895ba/gpa.svg)](https://codeclimate.com/repos/58be6b3139404c025a0024b8/feed)
[![Test Coverage](https://codeclimate.com/repos/58be6b3139404c025a0024b8/badges/1865a39a9ceafd4895ba/coverage.svg)](https://codeclimate.com/repos/58be6b3139404c025a0024b8/coverage)
[![Issue Count](https://codeclimate.com/repos/58be6b3139404c025a0024b8/badges/1865a39a9ceafd4895ba/issue_count.svg)](https://codeclimate.com/repos/58be6b3139404c025a0024b8/feed)

To feed our sin of pride,

Requirements
=================

1. Linux (sorry, i have 0 skills with other OSes and cannot assist further)
2. Nodejs of >=7.5.0
3. Redis server running with stack settings (localhost:6379 without password)

Or

1. `docker` + `docker-compose`


How to start
=================

With nodejs (>=7.5.0) and redis on local machine:

1. npm install
2. npm run-script frontend
3. npm start
4. Open `http://localhost:8000`


With `docker` and `docker-compose` installed

1. Edit `/etc/hosts` to add `flash2.local` as alias for localhost.

```bash

    [root@ivory vodolaz095]# cat /etc/hosts
    127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4 flash2.local
    ::1         localhost localhost.localdomain localhost6 localhost6.localdomain6 flash2.local

```

2. docker-compose up --build
3. Open `http://flash2.local`

How to build frontend code
==================

Source codes are in `frontend` directory.
Run `npm run-script gulp` to process them and save output in `public` directory.

TODO - livereload?


How to run tests
==================

1. npm run-script eslint (works for backend code mainly)
2. npm test (unit tests for backend code, supertest and mocha)


### E2E tests with protractor

#### Install & Setup(See http://www.protractortest.org/)
1. npm install -g protractor
2. webdriver-manager update

#### Run tests
1. webdriver-manager start
2. npm run protractor

How to contribute to this repo
==================

See [CONTRIBUTING.md](https://github.com/starlightgroup/flash2/blob/master/CONTRIBUTING.md)

How to use redis server, if you cannot install it locally
==================

In case, you cannot install redis server, you can use this one:

```bash

    $ REDIS_URL=redis://redistogo:759a4a957ceda6ad36d8c42f41dec81c@koi.redistogo.com:10968/
    $ npm start

```

Note that it is Free Tier Redis server on [RedisToGo](https://elements.heroku.com/addons/redistogo).
It has 5 connections limit. It has 5 MB memory limit. But it works ok, if you cannot install redis for your
local development.


How to run unit tests using docker-compose
===================

```bash

    # docker-compose -f docker-compose.testing.yaml up --build

```

It have to provide result like this ![test result](https://vvv.msk0.ru/s/gDOOFgX2z.png)