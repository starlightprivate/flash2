#!/bin/bash

# Authenticate with the Google Services
codeship_google authenticate

# Set the default zone to use
gcloud config set compute/zone us-central1-a

# Starting an Instance in Google Compute Engine
gcloud compute instances create testmachine

# Stopping an Instance in Google Compute Engine
gcloud compute instances delete testmachine -q
