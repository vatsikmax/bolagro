#!/bin/bash

HOST=$1
TIMEOUT=$2
INTERVAL=$3

echo "Starting to ping $URL..."
echo

END_TIME=$((SECONDS + TIMEOUT))

while [ $SECONDS -lt $END_TIME ]; do
  RESPONSE=$(curl -s -v -o /dev/null -w "%{http_code}" $HOST/api/ping)
  if [[ $RESPONSE -eq 200 ]]; then
    echo "Server is up! Status: OK (200)"
    exit 0
  else
    echo "Server not ready... Wait for $INTERVAL seconds"
    echo
  fi
  sleep $INTERVAL
done

echo "Timeout reached. Server is not ready."
echo
exit 1