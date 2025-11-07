FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY demo.html ./demo.html
COPY example.html ./example.html
COPY widget-standalone.html ./widget-standalone.html
COPY widget-loader.js ./widget-loader.js

EXPOSE 80

