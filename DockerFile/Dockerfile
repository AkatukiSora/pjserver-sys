FROM ubuntu:22.04 as builder
SHELL [ "/bin/bash", "-c" ]
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl\
    git\
    ca-certificates
RUN curl -fsSL https://raw.githubusercontent.com/tj/n/master/bin/n | bash -s lts
RUN npm i -g npm
WORKDIR /root
RUN git clone https://github.com/AkatukiSora/pjserver-sys.git
WORKDIR /root/pjserver-sys
RUN git checkout master
RUN npm install
RUN npm run build
RUN cp ./package.json ./dist/
RUN cp ./package-lock.json ./dist/
WORKDIR /root/pjserver-sys/dist
RUN npm install --production
RUN rm package.json
RUN rm package-lock.json
COPY env ./.env

FROM ubuntu:22.04 as runner
SHELL [ "/bin/bash", "-c" ]
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl\
    ca-certificates &&\
    apt-get clean
RUN curl -fsSL https://raw.githubusercontent.com/tj/n/master/bin/n | bash -s lts
WORKDIR /root
COPY --from=builder /root/pjserver-sys/dist ./
ENV NODE_ENV=production
#CMD [ "node", "./master.js" ]
CMD [ "bash" ]