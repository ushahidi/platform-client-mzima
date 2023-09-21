#!/bin/bash

if [ "$1" = "noop" ]; then
  # do nothing operator
  sleep infinity
  exit 0;
fi

# patch in frontend configuration
if [ -z "$BACKEND_URL" ]; then
  if [ -z "$MULTISITE_DOMAIN" ]; then
    echo "ERROR! You must provide a BACKEND_URL or MULTISITE_DOMAIN variable pointing at an ushahidi API host"
    exit 1
  fi
fi

if [ -f /opt/docker/env.json.template ]; then
	echo "- Generating env.json from template:"
	dockerize -template /opt/docker/env.json.template:/usr/share/nginx/html/env.json /bin/true
	cat /usr/share/nginx/html/env.json

  echo "- Generating config.json for legacy mobile app:"

  jq_props1() {
    jq -Ms '.[] | {
      client_id: .oauth_client_id,
      client_secret: .oauth_client_secret,
      intercom_app_id: .intercom_appid,
      mapbox_api_key: .mapbox_api_key,
      raven_url: .sentry_dsn
    }' < /usr/share/nginx/html/env.json ;
  }

  jq_props2() {
    jq -Ms '.[] | { backend_domain: .backend_url?.domain? }' < /usr/share/nginx/html/env.json ;
  }

  jq_props3() {
    jq -Ms '.[] | { backend_url: .backend_url? }' < /usr/share/nginx/html/env.json ;
  }

  {
    if [ -n "$(jq_props2)" ]; then
      jq -Ms '.[0] * .[1]' <(jq_props1) <(jq_props2)
    else
      jq -Ms '.[0] * .[1]' <(jq_props1) <(jq_props3)
    fi ;
  } > /usr/share/nginx/html/config.json

fi



# if [ -f config.json.j2 ]; then
# 	echo "- Generating config.json from template:"
# 	python3 -c 'import os, json ; print(json.dumps(dict(os.environ)))' | \
# 		jinja -d - -f json config.json.j2 | \
# 		tee config.json
# fi

# execute the provided command
exec "$@"
