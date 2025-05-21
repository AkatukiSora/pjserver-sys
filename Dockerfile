# Builder stage
FROM node:22-slim AS builder

ENV TINI_VERSION=v0.19.0

# .yarn/cacheが別の場所に生成されてしまうため無効化
ENV YARN_ENABLE_GLOBAL_CACHE=false

WORKDIR /builder

# Enable corepack and prepare yarn 4.x
RUN corepack enable && corepack prepare yarn@4.0.0 --activate

# Download tini binary
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

# Copy package files and yarn config for pnp
COPY package.json yarn.lock .yarnrc.yml ./

# Install all dependencies including dev
RUN yarn install --immutable

# Copy all source files
COPY . .

# Build the project
RUN yarn run build

# Runner stage
FROM gcr.io/distroless/nodejs22-debian12 AS runner

WORKDIR /app

# Copy tini from builder
COPY --from=builder /tini /tini

# Copy built dist directory from builder and extract contents directly into /app
COPY --from=builder /builder/dist/. /app/

# Copy necessary Yarn files for runtime and vulnerability scanning
COPY --from=builder /builder/.pnp.cjs /app/.pnp.cjs
COPY --from=builder /builder/.pnp.loader.mjs /app/.pnp.loader.mjs
COPY --from=builder /builder/package.json /app/package.json
COPY --from=builder /builder/.yarn/cache /app/.yarn/cache
COPY --from=builder /builder/yarn.lock /app/yarn.lock
COPY --from=builder /builder/.yarnrc.yml /app/.yarnrc.yml

# Use non-root user
USER nonroot

# Use tini as init process and run app with pnp loader
ENTRYPOINT ["/tini", "--"]
CMD ["/nodejs/bin/node", "--require", "/app/.pnp.loader.mjs", "master.js"]
