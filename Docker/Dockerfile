FROM ubuntu:22.04 AS base
SHELL ["/bin/bash", "-c"]
RUN apt-get update && apt-get install -y --no-install-recommends\
    dumb-init\
    ca-certificates\
    curl&&\
    apt-get clean &&\
    rm -rf /var/lib/apt/lists/* &&\
    curl -fsSL https://raw.githubusercontent.com/tj/n/v9.2.3/bin/n | bash -s lts &&\
    npm i -g npm &&\
    npm cache clean --force

FROM base AS builder
RUN mkdir -p /pjserver-sys
WORKDIR /pjserver-sys
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build
RUN cp ./package.json ./dist/
RUN cp ./package-lock.json ./dist/
WORKDIR /pjserver-sys/dist
RUN npm ci --omit=dev
RUN rm package.json package-lock.json

FROM base AS runner
COPY --chown=node:node --from=builder /pjserver-sys/dist /pjserver-sys
WORKDIR /pjserver-sys
RUN groupadd -g 1000 node && \
    useradd -s /bin/bash -u 1000 -g 1000 node &&\
    mkdir -p /pjserver-sys/logs &&\
    chown node:node -R /pjserver-sys/logs
ENV NODE_ENV=production
USER node
CMD [ "dumb-init", "node", "./master.js" ]