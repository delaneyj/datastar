TAG?=1.23.1-alpine
CONTAINER?=$(shell basename $(CURDIR))-dev
DEV_PORT?=8080
IMAGE_INFO=$(shell docker image inspect $(CONTAINER):$(TAG))
IMAGE_NAME=${CONTAINER}:${TAG}
DOCKER_RUN=docker container run --rm -it -v "${CURDIR}":/app

.PHONY: build clean dev image-build image-check npm ssh

# Perform a dist build via npm run build
build: image-check
	${DOCKER_RUN} --name ${CONTAINER}-$@ ${IMAGE_NAME} build
# Remove node_modules/ & package-lock.json
clean:
	rm -rf node_modules/
	rm -f package-lock.json
# Run the development server via npm run dev
dev: --image-check
	${DOCKER_RUN} --name ${CONTAINER}-$@ -e DEV_PORT="${DEV_PORT}" -p ${DEV_PORT}:${DEV_PORT} ${IMAGE_NAME} -c 'task -w hot'
# Build the Docker image & run npm install
image-build:
	docker build -f Dockerfile-dev . -t ${IMAGE_NAME} --build-arg TAG=${TAG} --no-cache
	${DOCKER_RUN} --name ${CONTAINER}-$@ ${IMAGE_NAME} -c 'git lfs checkout'
	${DOCKER_RUN} --name ${CONTAINER}-$@ ${IMAGE_NAME} -c 'task tools'
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
