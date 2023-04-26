## All these make targets (commands) are only useful for a Docker environment!

# Master command to build and start everything
start: build up

# Builds containers
build:
	[ ! -f ./.env.docker ] && cp -p -v docker/.env.dockerinit .env.docker || true
	docker-compose build

# Starts containers in the background
up:
	docker-compose up -d

# Enter container prompt
enter:
	docker-compose exec web /bin/bash

# Tails logs on the screen
logs:
	docker-compose logs -f

stop:
	docker-compose stop

down:
	docker-compose down
