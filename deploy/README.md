# deploy

### Install Jet

- jet is used for encryption for Codeship

### Get AES key from Codeship

- From Codeship, go to "Project Settings"
- Go to "Settings"
- Copy and paste AES key.
    + NOTE: The AES key should be something similar to:
        * `hkWHvKhRqE/52nisBKdORSQs7IfmTrreh2YwEFKig28=`
- Create `./deploy/codeship.aes`
- All `jet encrypt` or `jet decrypt` must be executed from the same path `codeship.aes` is located.


### To freshly build the docker, assign the tag, and push to Google Cloud Container registry

```
PROJECT_NAME="flash2-staging"
IMAGE_NAME="flash2_staging"

# build docker using Dockerfile
docker build -t gcr.io/${PROJECT_NAME}/${IMAGE_NAME}

# push to the Google Container registry
gcloud docker -- push gcr.io/${PROJECT_NAME}/${PROJECT_NAME}
```