FROM ubuntu:22.04 as base
SHELL [ "/bin/bash", "-c" ]
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl\
    ca-certificates\
    dumb-init &&\
    apt-get clean &&\
    rm -rf /var/lib/apt/lists/* &&\
    curl -fsSL https://raw.githubusercontent.com/tj/n/master/bin/n | bash -s lts &&\
    npm i -g npm &&\
    npm cache clean --force
FROM base as builder
RUN apt-get update && apt-get install -y --no-install-recommends\
    git
RUN git clone https://github.com/AkatukiSora/pjserver-sys.git
WORKDIR /pjserver-sys
RUN git checkout master
RUN npm ci
RUN npm run build
RUN cp ./package.json ./dist/
RUN cp ./package-lock.json ./dist/
WORKDIR /pjserver-sys/dist
RUN npm ci --production
RUN rm package.json
RUN rm package-lock.json

FROM base as runner
RUN groupadd -g 1000 node && \
    useradd -s /bin/bash -u 1000 -g 1000 node
COPY --chown=node:node --from=builder /pjserver-sys/dist /pjserver-sys
WORKDIR /pjserver-sys
ENV NODE_ENV=production
USER node
CMD [ "dumb-init", "node", "./master.js" ]