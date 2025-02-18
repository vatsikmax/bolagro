#!/bin/sh
PACKAGE=$1
SNAPSHOT=$2

GIT_COMMIT="$(git rev-parse HEAD)"

if [ "$SNAPSHOT" = "snapshot" ]
then
   VERSION="${GIT_COMMIT}-${SNAPSHOT}"
else
    VERSION=v$(jq '.version' ${PACKAGE}/package.json | tr -d '"')
fi

(cd apps/${PACKAGE} && jq ". + {\"commit\": \"${GIT_COMMIT}\"}" package.json > package.json.tmp && mv package.json.tmp package.json)

PACKAGE_NAME=$(jq '.name' ${PACKAGE}/package.json | tr -d '"')

docker build --pull . \
    -f ${PACKAGE}/Dockerfile \
    -t "ghcr.io/vatsikmax/${PACKAGE_NAME}:${VERSION}" \
    --build-arg "SHA1=${GIT_COMMIT}"; \

docker push ghcr.io/vatsikmax/$(basename $(pwd)):${VERSION} || exit 1;