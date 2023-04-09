# React + D3 Web App

[![build](https://github.com/rolspace/react-d3-webapp/actions/workflows/build.yml/badge.svg)](https://github.com/rolspace/react-d3-webapp/actions/workflows/build.yml)

A long time ago I started a personal project to become more familiar with Node, React, and other tools part of the modern JavaScript ecosystem.

I started this project, abandoned it, started it again, abandoned it again, and finally, started it one last time, up to this point.

Initially, this project was supposed to connect with the Instagram API in order to generate a series of graphs to present user data. After the last Instagram API update, that was not a possibility anymore.

Later, I decided that the best thing to do was to connect to the GitHub GraphQL API to attempt something similar.

As it stands, this web application allows you to sign in with a GitHub account to query some basic data from a public repository.

Graph #1 shows how many commits in a repo have added (or deleted) a range of lines.

Graph #2 shows how many commits in a repo have changed a range of files.

Additional graphs are work-in-progress.

## How to run

The project has two applications:

- the Node Backend
- the React Frontend

Install the dependencies for both applications with `yarn --immutable`.

### Node Backend

Ideally, the Node Backend should be started first. It requires three environment variables:

- APPLICATION_ID: GitHub application id
- APPLICATION_SECRET: GitHub application secret
- CLIENT_URL: URL for the React Frontend

> Make sure these environment variables are set before starting the application.
> DotEnv can be used to set the environment variables when NODE_ENV !== 'production'.
> Production mode will not allow environment variables from DotEnv.

The Node Backend can be started in three ways:

Option 1: start from the terminal

- Using the terminal, set the `./src/server` folder as the current directory.
- Run the `yarn start` command to launch the application.

Option 2: start from the local API launch config in VSCode

- Run the `Local API: launch` launch config in VSCode. It will start the application. Make sure to modify the `.env` file to set the environment variables.

Option 3: start from the Docker API launch config in VSCode

- Run the `Docker API: launch` launch config in VSCode. It will start the application in a Docker container. Make sure to modify the `tasks.json` file to set the environment variables in the `docker-run-server: debug` task.

The PORT environment variable can be set in order to overwrite the default port used by the backend server (port 9000).

### React Frontend

The React Frontend requires two environment variables:

- APPLICATION_ID: GitHub application id
- SERVER_URL: URL for the Node Backend

> Make sure these environment variables are set before building the application.
> DotEnv can be used to set the environment variables when starting the application in development mode (`yarn start dev`)

The client application can be started locally in two ways:

Option 1: start from the terminal

- Using the terminal, set the `./src/client` folder as the current directory.
- Run the `yarn start dev` command to launch the application in development mode.

Option 2: start from the Local client launch config in VSCode

- Run the `Local client: launch` config in VSCode. Make sure to modify the `.env` file to set the environment variables.
