FROM node:18 as build
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
ARG NODE_ENV=production
RUN yarn build

FROM nginx:stable-alpine
COPY installation/docker.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/static /usr/share/nginx/html
