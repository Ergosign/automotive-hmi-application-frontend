FROM nginx:1.16.0-alpine
COPY /web/.webpack /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]