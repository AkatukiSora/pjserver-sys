# Builder stage
FROM node:22-slim@sha256:2f3571619daafc6b53232ebf2fcc0817c1e64795e92de317c1684a915d13f1a5 AS builder


# Add Tini
ENV TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini

WORKDIR /build

# Copy package files and pnpm lockfile
COPY package.json pnpm-lock.yaml ./

# Enable Corepack and install dependencies using pnpm
RUN corepack enable && pnpm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build
# Add this line to prune devDependencies
RUN pnpm prune --prod

# Uncomment the following line to compile the application into a single binary using nexe script
# RUN pnpm run package


# Runner stage
FROM gcr.io/distroless/nodejs22-debian12:nonroot@sha256:581893ba58980f0b4c7444d7a16b89f4e966cd89a89f3e0c6f26c482e312f008 AS runner

# Dockerで実行していることを示す環境変数を設定
ENV IS_DOCKER=1

# Copy tini from the builder stage
COPY --from=builder --chmod=+x /tini /tini
ENTRYPOINT [ "/tini", "--" ]
WORKDIR /app

# Copy node_modules, built application code, and resources from the builder stage
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist/ .

# Uncomment the following lines to use the compiled single binary
# COPY --from=builder /app/pjserver /app/pjserver
# ENTRYPOINT ["/app/pjserver"]

# Set the entrypoint to run the Node.js application
CMD ["/nodejs/bin/node", "master.js"]
