#!/usr/bin/env bash

set -o nounset \
    -o errexit \
    -o verbose \
    -o xtrace

npm run build # --production
 
echo "running.."
exec serve -s build
