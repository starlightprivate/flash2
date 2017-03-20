#!/bin/bash
# Use this script to upload to Google Container Registry

set -e

GOOGLE_CONTAINER_NAME=gcr.io/flash2-staging/flashlight_app_staging
KUBERNETES_APP_NAME=flash2-staging
DEFAULT_ZONE=us-central1-a

codeship_google authenticate

echo "Setting default timezone $DEFAULT_ZONE"
gcloud config set compute/zone $DEFAULT_ZONE

echo "Starting Cluster on GCE for $KUBERNETES_APP_NAME"
gcloud container clusters create $KUBERNETES_APP_NAME \
    --num-nodes 1 \
    --machine-type g1-small

echo "Deploying image on GCE"
kubectl run $KUBERNETES_APP_NAME --image=$GOOGLE_CONTAINER_NAME --port=8080

echo "Exposing a port on GCE"
kubectl expose rc $KUBERNETES_APP_NAME --create-external-load-balancer=true

echo "Waiting for services to boot"

echo "Listing services on GCE"
kubectl get services $KUBERNETES_APP_NAME

echo "Removing service $KUBERNETES_APP_NAME"
kubectl delete services $KUBERNETES_APP_NAME

echo "Waiting After Remove"

echo "Stopping port forwarding for $KUBERNETES_APP_NAME"
kubectl stop rc $KUBERNETES_APP_NAME

echo "Stopping Container Cluster for $KUBERNETES_APP_NAME"
gcloud container clusters delete $KUBERNETES_APP_NAME -q
