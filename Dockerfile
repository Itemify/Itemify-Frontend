# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:16-bullseye as build-stage
WORKDIR /app/
COPY package*.json /app/
RUN npm install
COPY . /app/

# Install and configure `serve`.
RUN npm install -g serve

CMD ["/bin/bash", "run.sh"]
