FROM nginx:latest

# removes the default nginx site
RUN rm /etc/nginx/conf.d/default.conf

# copies the nginx config file
COPY nginx.conf /etc/nginx/conf.d

RUN cat /etc/nginx/conf.d/nginx.conf

# copies the uwsgi_params
COPY uwsgi_params /etc/nginx/uwsgi_params