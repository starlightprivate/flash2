#!/usr/bin/env bash


ANATOLIJ_DIR="/home/vodolaz095/projects/starlightgroup/flash2_anatolij/app/"
GCR_DIR="/home/vodolaz095/projects/starlightgroup/flash2_gcr/app/"

diff -r "$ANATOLIJ_DIR"frontend/html "$GCR_DIR"frontend/html

diff -r "$ANATOLIJ_DIR"frontend/scripts "$GCR_DIR"frontend/scripts

diff -r "$ANATOLIJ_DIR"frontend/styles "$GCR_DIR"frontend/styles

diff -r "$ANATOLIJ_DIR"api "$GCR_DIR"api

diff -r "$ANATOLIJ_DIR"config "$GCR_DIR"config

diff -r "$ANATOLIJ_DIR"frontend "$GCR_DIR"frontend

#diff -r "$ANATOLIJ_DIR"node_modules/ "$GCR_DIR"node_modules/

ls "$ANATOLIJ_DIR"node_modules/ --format=single-column > /tmp/anatolij.node_modules_list.txt

ls "$GCR_DIR"node_modules/ --format=single-column > /tmp/gcr.node_modules_list.txt

diff /tmp/anatolij.node_modules_list.txt /tmp/gcr.node_modules_list.txt

