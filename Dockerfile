FROM node:20 as build
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
ARG NODE_ENV=production
RUN yarn build

FROM nginx:stable-alpine
EXPOSE 5000
ENV PORT=5000
ENV FALLBACK_PORT=4444
ENV BACKEND_URL=http://localhost:4444
ENV CSP=
COPY installation/docker.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/static /usr/share/nginx/html
