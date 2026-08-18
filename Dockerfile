# Builder stage
FROM node:22-slim@sha256:2f3571619daafc6b53232ebf2fcc0817c1e64795e92de317c1684a915d13f1a5 AS builder

# Set environment variables
ENV HUSKY=0

# Use Debian's architecture-appropriate, repository-verified tini package.
RUN apt-get update \
    && apt-get install --no-install-recommends --yes tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy package files and pnpm lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Enable Corepack and install dependencies using pnpm
RUN corepack enable && pnpm install --frozen-lockfile --ignore-scripts

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build:prod
# Add this line to prune devDependencies
RUN pnpm prune --prod --ignore-scripts

# Uncomment the following line to compile the application into a single binary using nexe script
# RUN pnpm run package


# Runner stage
FROM gcr.io/distroless/nodejs22-debian12:nonroot@sha256:581893ba58980f0b4c7444d7a16b89f4e966cd89a89f3e0c6f26c482e312f008 AS runner

# Dockerで実行していることを示す環境変数を設定
ENV IS_DOCKER=1

# Copy tini from the builder stage
COPY --from=builder /usr/bin/tini /tini
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
