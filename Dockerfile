FROM node:16

RUN mkdir -p /var/app
WORKDIR /var/app
COPY ./package.json ./package-lock.json ./

RUN npm install
COPY . ./
RUN npm run web:build

FROM nginx
ENV DOCKERIZE_VERSION v0.6.1

RUN case `uname -m` in aarch*|armv8*) darch=armhf;; i?86) darch=386;; x86_64) darch=amd64;; *) darch=error;; esac && \
    apt update && \
    apt install --no-install-recommends -y python3-pip python3-setuptools python3-yaml wget && \
    apt-get update && apt-get install -y wget && \
    wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-${darch}-$DOCKERIZE_VERSION.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize-linux-${darch}-$DOCKERIZE_VERSION.tar.gz && \
    rm dockerize-linux-${darch}-$DOCKERIZE_VERSION.tar.gz && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ARG HTTP_PORT=8080

WORKDIR /usr/share/nginx/html
COPY --from=0 /var/app/dist/apps/web-mzima-client ./
COPY docker/ /opt/docker/
RUN cp /opt/docker/nginx.default.conf /etc/nginx/conf.d/default.conf && \
    sed -i 's/$HTTP_PORT/'$HTTP_PORT'/' /etc/nginx/conf.d/default.conf && \
    mkdir /var/lib/nginx && \
    chgrp -R 0 . /var/lib/nginx /run && \
    chmod -R g+rwX . /var/lib/nginx /run && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

ENV HTTP_PORT=$HTTP_PORT
EXPOSE $HTTP_PORT

ENTRYPOINT [ "/bin/sh", "/opt/docker/nginx.run.sh" ]
CMD [ "/usr/sbin/nginx", "-g", "daemon off;" ]
