# React + D3 Web App

[![build](https://github.com/rolspace/react-d3-webapp/actions/workflows/ci.yml/badge.svg)](https://github.com/rolspace/react-d3-webapp/actions/workflows/ci.yml) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=rolspace_react-d3-webapp&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=rolspace_react-d3-webapp) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=rolspace_react-d3-webapp&metric=coverage)](https://sonarcloud.io/summary/new_code?id=rolspace_react-d3-webapp)

A long time ago I started a personal project to become more familiar with Node, React, and other tools part of the modern JavaScript ecosystem.

I started this project, abandoned it, started it again, abandoned it again, and finally, started it one last time, up to this point.

Initially, this project was supposed to connect with the Instagram API in order to generate a series of graphs to present user data. After the last Instagram API update, that was not a possibility anymore.

Later, I decided that the best thing to do was to connect to the GitHub GraphQL API to attempt something similar.

As it stands, this web application allows you to sign in with a GitHub account to query some basic data from a public repository.

**Graph #1** shows how many commits in a repo have added (or deleted) a range of lines.

**Graph #2** shows how many commits in a repo have changed a range of files.

Additional graphs are work-in-progress.

## How to run

The workspace contains two applications:

- the Node API
- the React Frontend client

Install the dependencies for both applications by running `yarn --immutable`.

### Node API

Ideally, the Node API should be started first. It requires three environment variables:

- APPLICATION_ID: GitHub application id
- APPLICATION_SECRET: GitHub application secret
- CLIENT_URL: URL for the React Frontend

> Make sure these environment variables are set before starting the application.
> DotEnv can be used to set the environment variables when NODE_ENV !== 'production'.
> Production mode will not allow environment variables from DotEnv.

The Node Backend can be started in four ways:

**Option 1**: start from the terminal

- Using the terminal, set the `./src/api` folder as the current directory.
- Run the `yarn start` command to launch the application. Make sure to create the `.env` file to set the required environment variables.

**Option 2**: start the local launch config in VSCode

- Run the `Local API: launch` launch config in VSCode. It will start the application. Make sure to create the `.env` file to set the required environment variables.

**Option 3**: start the Docker launch config in VSCode

- Run the `Docker API: launch` launch config in VSCode. It will start the application in a Docker container. Make sure to create the `.env` file to set the required environment variables.

**Option 4**: use the Docker Compose file

- If you have the Docker extension for VSCode, just right click on the `docker-compose.yml` file at the root of the workspace and select *Compose Up*.  Make sure to create the `.env` file to set the required environment variables.

> There is a `docker-compose.debug.yml` file that can be used for debugging.

The PORT environment variable can be set in order to overwrite the default port used by the backend server (port 9000).

### React Frontend client

The React Frontend client requires two environment variables:

- APPLICATION_ID: GitHub application ID
- API_URL: URL for the Node API

> Make sure these environment variables are set before building the application.
> DotEnv can be used to set the environment variables when starting the application in development mode (`yarn start dev`)

The client application can be started locally in two ways:

**Option 1**: start from the terminal

- Using the terminal, set the `./src/client` folder as the current directory.
- Run the `yarn start dev` command to launch the application in development mode. Make sure to create the `.env` file to set the required environment variables.

**Option 2**: start from the Local client launch config in VSCode

- Run the `Local client: launch` config in VSCode. Make sure to modify the `.env` file to set the required environment variables.
