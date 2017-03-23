#!/bin/bash
set -e

export CLUSTER_NAME="flash2-staging"
export APPLICATION_NAME="nginx"
export IMAGE_NAME="gcr.io/flash2-staging"

# authenticate to google cloud
codeship_google authenticate

# set compute zone
gcloud config set compute/zone us-central1-b

# set kubernetes cluster
gcloud container clusters get-credentials "${CLUSTER_NAME}"

# install envsubst
apt-get install gettext-base -y

# export env
export NGINX_REPLICAS=3

# update kubernetes Deployment file
envsubst < deploy/kubernetes/nginx_deployment.yml.template > deploy/kubernetes/nginx_deployment.yml

cat deploy/kubernetes/nginx_deployment.yml

# deploy
deployment_flag=$(GOOGLE_APPLICATION_CREDENTIALS=/keyconfig.json kubectl get deployment -l app=${APPLICATION_NAME})

if [[ -z "$deployment_flag" ]]; then
  echo "Create new deployment and service for ${APPLICATION_NAME}"
  GOOGLE_APPLICATION_CREDENTIALS=/keyconfig.json kubectl create -f deploy/kubernetes/nginx_deployment.yml
  GOOGLE_APPLICATION_CREDENTIALS=/keyconfig.json kubectl expose deployment ${APPLICATION_NAME} --name=${APPLICATION_NAME} --port=80,443 --type="LoadBalancer"
else
  echo "Rolling update for ${APPLICATION_NAME}"
  GOOGLE_APPLICATION_CREDENTIALS=/keyconfig.json kubectl apply -f deploy/kubernetes/nginx_deployment.yml
fi
