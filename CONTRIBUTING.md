How to push code to this repository.
======================
1. Verify you have sane local setup - `nodejs` of `7.5.0`, npm of `^4.1.2`, redis (`^3.0.6`) database with stack
settings listening on `localhost:6379` without PASSWORD. You can use `docker-compose up` to help you.
Anatolij works mainly with fedora linux and has ~0 skills with Windows and Macos, so he apologies if development
is more tricky on OSes other than linux.

2. Verify you have installed all nodejs modules and choosed proper code style for your IDE

3. Choose open backend related tickets on https://starlightgroup.atlassian.net

4. Make feature branch with name like `feature/SG-XX` or `hotfix/SG-XX` if it is related to ticket, or
with SANE name like `hotfix/stopThingsExploding` and so on

5. Verify that your code pass lint checks - `npm run-script lint`

6. Verify that your code pass unit tests - `npm test`

7. Push code to your feature branch and make pull request to `master` branch. I repeat, `master` branch.

8. Notify Anatolij to merge PR using slackchat.

9. DELETE your branch when it is merged pls!

Anatolij github id - @vodolaz095



Branch meaning
====================

- `development` - main branch, where everybody can push code.
Code is deployed on [http://dev.tacticalmastery.com/tacticalsales](http://dev.tacticalmastery.com/tacticalsales)
With `NODE_ENV` set to staging.

- `staging` - code is working and mainly tested. The code should be merged to this branch only from the 'master' branch.
This branch is automatically been deployed to our staging server https://stg.tacticalmastery.com/tacticalsales/
The`NODE_ENV` have to be `staging`.
Code is deployed on [http://stg.tacticalmastery.com/tacticalsales](http://stg.tacticalmastery.com/tacticalsales)

- `master` and `production` - code for production.  The`NODE_ENV` have to be `production`.
Code is deployed on [http://tacticalmastery.com/tacticalsales](http://tacticalmastery.com/tacticalsales)


Contributors
=====================

- Anatolij (Github - [vodolaz095](http://github.com/vodolaz095/)) - backend developer.
Uses Fedora Linux since 2002 year. Uses Docker. Can setup CI. Knows nodejs, redis.
Has little knowledge of frontend (jquery, angular1, gulp, bootstrap).
Wrote ~50% of nodejs backend code and all unit tests.
Has no skills of Windows, MacOS, and fancy recent browsers like Google Chrome, Safari and so on.
Lives by [Moscow](https://www.worldtimebuddy.com/?pl=1&lid=524901&h=524901) timezone.
Is prone to sins of rage and pride. On Sunday he goes to Church and is totally offline.
Can be reached by [anatolii@starlightgroup.io], slackchat - [@anatolij](https://starlightads.slack.com/messages/@anatolij/)
Has bachelor degree at mathematics, self educated programmer.

- Sachin (Github - [asharma-ror](http://github.com/asharma-ror/)) - nodejs and ROR developer. Uses Ubuntu.

- Alexis (Github - [sledderGIT](http://github.com/sledderGIT)) - nodejs and javascript developer. Speaks Russian.

- Vlad (Github - [solarvm](https://github.com/solarvm)) - devops

- Thomas (Github - [ThomasLee2014](http://github.com/ThomasLee2014)) - full stack developer
