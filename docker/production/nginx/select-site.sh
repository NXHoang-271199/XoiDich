#!/bin/sh
# Runs inside the nginx container at startup (official image runs /docker-entrypoint.d/*.sh).
# HTTPS when certificates are present, plain HTTP otherwise — no config edit needed.
if [ -f /etc/nginx/certs/fullchain.pem ] && [ -f /etc/nginx/certs/privkey.pem ]; then
  cp /etc/nginx/sites/https.conf /etc/nginx/conf.d/default.conf
  echo "select-site: HTTPS"
else
  cp /etc/nginx/sites/http.conf /etc/nginx/conf.d/default.conf
  echo "select-site: HTTP (no certificate in docker/production/nginx/certs)"
fi
