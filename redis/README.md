Redis database docker container
=====================


More secure redis database config files used for local deploy by developers.

Project works with redis database on stack settings (listening on all interfaces on 6379 port without asking for password).
But it is better to use this redis config - it has lua scripting disabled, and password set.

Also we have dockerfile for it, alongside with `docker-compose` init file.

DISCLAIMER
========================
DEVOPS TEAM, PLEASE!

DO NOT USE THIS REDIS CONFIG ON PRODUCTION!

IT IS ONLY FOR LOCAL DEPLOY FOR DEVELOPERS!

