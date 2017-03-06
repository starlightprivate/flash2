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

- `master` - code is working, ok to deploy locally for development or on dev server.
Locally code runs with environment variable of `NODE_ENV` set to `development` or non existant.
On dev server the `NODE_ENV` have to be `staging`.

- `staging` - code is working and mainly tested - ok to deploy on staging server.
The`NODE_ENV` have to be `staging`.


- `production` - code for production.  The`NODE_ENV` have to be `production`.



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

 
- Kenji (Github - [KenKimura88](http://github.com/KenKimura88/)) - security expert, javascript developer. Uses MacOS.

Full Stack Developer( knows front end and back end programming and architecture ).
Back End(Node, Python, bit of ROR, Laravel)
Front End(Angular, React, Vue)
Can be reached by ken.kimura1988@outlook.com, slackchat - [@kenji](https://starlightads.slack.com/messages/@kenji/)

- Sachin (Github - [asharma-ror](http://github.com/asharma-ror/) - nodejs and ROR developer. Uses Ubuntu.

