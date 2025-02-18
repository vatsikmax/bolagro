FROM node:22 AS base

RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ".yarn" ./.yarn
COPY "./backend/package.json" .
COPY "./backend/tsconfig.json" .
COPY "./backend/src/" ./src/
COPY "./backend/medusa-config.ts" .

RUN jq '.compilerOptions.outDir = "./"' tsconfig.json > tmp.json && mv tmp.json tsconfig.json
RUN yarn install

USER root 
RUN chown -R node:node /app/

# USER change the USER who run commands
# node user has no privilege, so it runs the Application
USER node

EXPOSE 8080

CMD ["sh", "-c", "yarn build && yarn migrate && yarn user:add && yarn seed && yarn start"]