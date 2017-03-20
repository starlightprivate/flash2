#!/bin/bash
set -e

export CLUSTER_NAME="flash2-staging"
export IMAGE_NAME="gcr.io/flash2-staging"
export APPLICATION_NAME=redis
export REDIS_DISK_SIZE=50

# authenticate to google cloud
codeship_google authenticate

# set compute zone
gcloud config set compute/zone us-central1-b

# set kubernetes cluster	
gcloud container clusters get-credentials "${CLUSTER_NAME}"

# install envsubst
apt-get install gettext-base -y

# update kubernetes Deployment file
envsubst < deploy/kubernetes/redis_volume.yml.template > deploy/kubernetes/redis_volume.yml
envsubst < deploy/kubernetes/redis_deployment.yml.template > deploy/kubernetes/redis_deployment.yml

cat deploy/kubernetes/redis_volume.yml
envsubst < deploy/kubernetes/redis_deployment.yml.template > deploy/kubernetes/redis_deployment.yml

# deploy
deployment_flag=$(GOOGLE_APPLICATION_CREDENTIALS=/keyconfig.json kubectl get deployment -l app=${APPLICATION_NAME})

if [[ -z "$deployment_flag" ]]; then
  echo "Create new deployment and service for ${APPLICATION_NAME}"
  GOOGLE_APPLICATION_CREDENTIALS=/keyconfig.json kubectl create -f deploy/kubernetes/redis_volume.yml
  GOOGLE_APPLICATION_CREDENTIALS=/keyconfig.json kubectl create -f deploy/kubernetes/redis_deployment.yml
  GOOGLE_APPLICATION_CREDENTIALS=/keyconfig.json kubectl expose ${APPLICATION_NAME} --name=redis --port=6379 --type="NodePort"
else
  echo "redis is already deployed. no rolling updates for redis today :("
fi
