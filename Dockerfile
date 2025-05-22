# Builder stage
FROM node:22-slim AS builder

ENV TINI_VERSION=v0.19.0

WORKDIR /builder

# Enable corepack
RUN corepack enable

# Download tini binary
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

# Copy package files and pnpm lockfile
COPY package.json pnpm-lock.yaml ./

# Install all dependencies including dev
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build the project
RUN pnpm run build

# Runner stage
FROM gcr.io/distroless/nodejs22-debian12 AS runner

WORKDIR /app

# Copy tini from builder
COPY --from=builder /tini /tini

# Copy built dist directory from builder and extract contents directly into /app
COPY --from=builder /builder/dist/. /app/

# Copy package.json for runtime and vulnerability scanning
COPY --from=builder /builder/package.json /app/package.json
COPY --from=builder /builder/pnpm-lock.yaml /app/pnpm-lock.yaml

# Use non-root user
USER nonroot

# Use tini as init process and run app
ENTRYPOINT ["/tini", "--"]
CMD ["/nodejs/bin/node", "master.js"]
