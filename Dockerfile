# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps

WORKDIR /app

ENV CI=1

COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build

WORKDIR /app

COPY eslint.config.cjs jest.config.cjs nest-cli.json tsconfig.json tsconfig.prisma.json tsconfig.spec.json ./
COPY prisma ./prisma
COPY src ./src
COPY test ./test

RUN npx prisma generate \
    && npm run lint \
    && npm run typecheck \
    && npm run test:ci \
    && npm run test:e2e \
    && npm run build \
    && npm run build:seed

FROM node:22-alpine AS prod-deps

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
    && npx prisma generate \
    && npm cache clean --force

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=256

COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=prod-deps /app/prisma ./prisma
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/dist-prisma ./dist-prisma

EXPOSE 3000

USER node

CMD ["npm", "run", "docker:start"]
