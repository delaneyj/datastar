TAG?=1.23.1-alpine
CONTAINER?=$(shell basename $(CURDIR))-dev
DEV_PORT?=8080
VITE_PORT?=5173
IMAGE_INFO=$(shell docker image inspect $(CONTAINER):$(TAG))
IMAGE_NAME=${CONTAINER}:${TAG}
DOCKER_RUN=docker container run --rm -it -v "${CURDIR}":/app

.PHONY: build clean dev image-build image-check npm ssh

# Perform a dist build via npm run build
build: image-check
	${DOCKER_RUN} --name ${CONTAINER}-$@ ${IMAGE_NAME} build
# Remove node_modules/ & pnpm-lock.yaml
clean:
	rm -rf .pnpm-store/
	rm -rf packages/library/node_modules/
	rm -f packages/library/pnpm-lock.yaml
# Run the development server via npm run dev
dev: --image-check
	${DOCKER_RUN} --name ${CONTAINER}-$@ -e DEV_PORT="${DEV_PORT}" -p ${DEV_PORT}:${DEV_PORT} -e VITE_PORT="${VITE_PORT}" -p ${VITE_PORT}:${VITE_PORT} ${IMAGE_NAME} -c 'task -w hot'
# Build the Docker image & run npm install
image-build:
	docker build -f Dockerfile-dev . -t ${IMAGE_NAME} --build-arg TAG=${TAG} --no-cache
	${DOCKER_RUN} --name ${CONTAINER}-$@ ${IMAGE_NAME} -c 'git lfs fetch --all && git lfs pull && git lfs checkout'
	${DOCKER_RUN} --name ${CONTAINER}-$@ ${IMAGE_NAME} -c 'task tools'
	${DOCKER_RUN} --name ${CONTAINER}-$@ ${IMAGE_NAME} -c 'task library'
	${DOCKER_RUN} --name ${CONTAINER}-$@ ${IMAGE_NAME} -c 'task build-backend'
# Run the passed in task command
task: --image-check
	${DOCKER_RUN} --name ${CONTAINER}-$@ ${IMAGE_NAME} -c 'task $(filter-out $@,$(MAKECMDGOALS)) $(MAKEFLAGS)'
# Open a shell inside of the container
ssh: --image-check
	${DOCKER_RUN} --name ${CONTAINER}-$@ --entrypoint=/bin/sh ${IMAGE_NAME}
# Ensure the image has been created
--image-check:
ifeq ($(IMAGE_INFO), [])
--image-check: image-build
endif
%:
	@:
# ref: https://stackoverflow.com/questions/6273608/how-to-pass-argument-to-makefile-from-command-line