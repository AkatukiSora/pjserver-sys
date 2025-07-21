## build runner
FROM node:lts-alpine AS build-runner

# Set temp directory
WORKDIR /builder/app

# Move package.json
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Move source files
COPY src ./src
COPY tsconfig.json   .

# Build project
RUN npm run build

## production runner
FROM node:lts-alpine AS prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /builder/app/package.json /app/package.json

# Install dependencies
RUN corepack enable pnpm && pnpm install --prod

# Move build files
COPY --from=build-runner /builder/app/build /app/build

# Start bot
CMD [ "pnpm", "run", "start" ]
