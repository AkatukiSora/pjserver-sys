FROM ubuntu:22.04 as base
SHELL [ "/bin/bash", "-c" ]
RUN apt-get update && apt-get install -y  --no-cache --no-install-recommends \
    curl\
    ca-certificates
RUN curl -fsSL https://raw.githubusercontent.com/tj/n/master/bin/n | bash -s lts &&\
    npm i -g npm

FROM base as builder
RUN apt-get update && apt-get install -y --no-install-recommends\
    git
WORKDIR /root
RUN git clone https://github.com/AkatukiSora/pjserver-sys.git
WORKDIR /root/pjserver-sys
RUN git checkout master
RUN npm ci
RUN npm run build
RUN cp ./package.json ./dist/
RUN cp ./package-lock.json ./dist/
WORKDIR /root/pjserver-sys/dist
RUN npm ci --production
RUN rm package.json
RUN rm package-lock.json
COPY env ./.env

FROM base as runner
WORKDIR /root
COPY --from=builder /root/pjserver-sys/dist ./
ENV NODE_ENV=production
CMD [ "node", "./master.js" ]