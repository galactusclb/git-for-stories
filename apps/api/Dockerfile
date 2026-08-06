FROM node:lts-alpine

RUN npm install -g pnpm

WORKDIR /app

ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV DATABASE_URL=${DATABASE_URL}

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install

COPY . .

RUN pnpm run generate
RUN pnpm run build

EXPOSE 4000

CMD ["pnpm", "run", "dev"]
