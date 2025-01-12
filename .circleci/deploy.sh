#!/bin/bash -e

MODULE=$1
TAG=$2

DOCKER_USER=DOCKER_USER_${MODULE//-/_}
DOCKER_PASS=DOCKER_PASS_${MODULE//-/_}
DOCKERHUB_REPO=mozilla/${MODULE}

if [ "${CIRCLE_BRANCH}" == "main" ]; then
  DOCKER_TAG="latest"
fi

if [[ "${CIRCLE_BRANCH}" == feature* ]] || [[ "${CIRCLE_BRANCH}" == dockerpush* ]]; then
  DOCKER_TAG="${CIRCLE_BRANCH}"
fi

if [ -n "${CIRCLE_TAG}" ]; then
  DOCKER_TAG="$CIRCLE_TAG"
fi

if [ "$MODULE_SUFFIX" = "" ]; then
  MODULE_QUALIFIED="$MODULE"
else
  MODULE_QUALIFIED="${MODULE}-${MODULE_SUFFIX}"
fi

if [ -n "${DOCKER_TAG}" ] && [ -n "${!DOCKER_PASS}" ] && [ -n "${!DOCKER_USER}" ]; then

  echo "${!DOCKER_PASS}" | docker login -u "${!DOCKER_USER}" --password-stdin

  # see if tag was pushed, not all packages create docker images
  if docker manifest inspect $DOCKERHUB_REPO:$TAG > /dev/null ; then
    echo "##################################################"
    echo "pulling ${DOCKERHUB_REPO}:${TAG}"
    echo "pushing to ${DOCKERHUB_REPO}:${DOCKER_TAG}"
    echo "##################################################"
    echo ""

    docker pull "${DOCKERHUB_REPO}:${TAG}"
    docker tag "${DOCKERHUB_REPO}:${TAG}" "${DOCKERHUB_REPO}:${DOCKER_TAG}"
    docker push "${DOCKERHUB_REPO}:${DOCKER_TAG}"
    docker rmi "${DOCKERHUB_REPO}:${TAG}"
  else
    echo "--------------------------------------------------"
    echo "skipping $MODULE ($DOCKERHUB_REPO:$TAG not found)"
    echo "--------------------------------------------------"
    echo ""
    exit 0
  fi
fi
