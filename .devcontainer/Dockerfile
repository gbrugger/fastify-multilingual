# The devcontainer-typescript-node image runs on Alpine and produces errors on Apple Silicon as of Node 22.17
ARG BASE_IMAGE=ubuntu-24.04

FROM mcr.microsoft.com/devcontainers/base:${BASE_IMAGE}

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG NVM_VERSION=v0.40.3
ARG NODE_VERSION=v22.17.0

USER root
ENV NVM_DIR=/usr/local/nvm
ENV DEBIAN_FRONTEND=noninteractive

RUN mkdir -p "${NVM_DIR}" \
    && wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash \
    && . "${NVM_DIR}"/nvm.sh && . "${NVM_DIR}"/bash_completion \
    && nvm install --default ${NODE_VERSION} \
    && chown -R vscode:vscode ${NVM_DIR} \
    && echo 'export NVM_DIR="/usr/local/nvm"' >> /home/vscode/.bashrc \
    && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm'  >> /home/vscode/.bashrc \
    && echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion'  >> /home/vscode/.bashrc

ENV NODE_PATH=$NVM_DIR/versions/node/$NODE_VERSION/bin
ENV PATH=$NODE_PATH:$PATH