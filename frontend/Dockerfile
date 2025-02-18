FROM node:22 AS builder

WORKDIR /app

COPY "./frontend/package.json" .
COPY ".yarn" ./.yarn
COPY "yarn.lock" .
RUN yarn install

USER root
RUN chown -R node:node /app/

USER node

COPY "./frontend/tsconfig.json" .
COPY "./frontend/check-env-variables.js" .
COPY "./frontend/postcss.config.js" .
COPY "./frontend/tailwind.config.js" .
COPY "./frontend/next.config.js" .
COPY "./frontend/next-sitemap.js" .
COPY "./frontend/src/" src/
COPY "./frontend/public/" public/

EXPOSE 8080

CMD ["sh", "-c", "export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$(curl -s $MEDUSA_BACKEND_URL/token) && yarn build && yarn start"]