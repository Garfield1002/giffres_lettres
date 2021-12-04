#####################
#                   #
#       DJANGO      #
#                   #
#####################

FROM python:3.9-slim-buster AS builder
# using a Docker multi stage build
# I should use  ubuntu:20.04

# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN apt-get update && apt-get install -y \
    # required for uwsgi
    python3-dev \
    build-essential \
    # required for postgres
    libpq-dev \
    gcc \
    postgresql\
    # used in entrypoint
    netcat

# lint
RUN pip install --upgrade pip
RUN pip install flake8
COPY . .
RUN flake8 --ignore=E501,F401 .


# install python dependencies
COPY ./requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt

#####################
#                   #
#       FINAL       #
#                   #
#####################

FROM python:3.9-slim-buster

# create directory for the app user
RUN mkdir -p /home/app

# create the app user
RUN groupadd --system app && useradd --group app --system app_user

# create the appropriate directories
ENV HOME=/home/app
ENV APP_HOME=/home/app/web
RUN mkdir $APP_HOME
RUN mkdir $APP_HOME/static
WORKDIR $APP_HOME

RUN apt-get update && apt-get install -y \
    libpq-dev \
    netcat

COPY --from=builder /usr/src/app/wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --no-cache /wheels/*

# copy entrypoint.sh
COPY ./entrypoint.sh /home/app/web/entrypoint.sh

# copy project
COPY . $APP_HOME

# chown all the files to the app user
RUN chown -R app_user:app $APP_HOME

# change to the app user
USER app_user

# run entrypoint.sh
ENTRYPOINT ["/home/app/web/entrypoint.sh"]