# React + D3 Web App

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

The Node Backend can be started in two ways:

Option 1: run locally

- Using the terminal, set the `./src/server` folder as the current directory.
- Run the `yarn start` command to launch the application.

Option 2: run with Docker launch config in VSCode

- Run the `React D3 API: Docker Launch Server` launch config in VSCode. It will start the application in a Docker container. Make sure to modify the tasks.json file to set the environment variables in the `docker-run-server: debug` task.

The PORT environment variable can be set in order to overwrite the default port used by the backend server (port 9000).

### React Frontend

The React Frontend requires two environment variables:

- APPLICATION_ID: GitHub application id
- SERVER_URL: URL for the Node Backend

> Make sure these environment variables are set before building the application.
> DotEnv can be used to set the environment variables when starting the application in development mode (`yarn start dev`)

The client application can be started in two ways:

Option 1: run locally

- Using the terminal, set the `./src/client` folder as the current directory.
- Run the `yarn start dev` command to launch the application in development mode.

Option 2: run with Docker launch config in VSCode

- Run the `React D3 Client: Docker Launch Server` launch config in VSCode. Make sure to modify the tasks.json file to set the environment variables in the `docker-run-client: debug` task.
- Run the `React D3 Client: Docker Launch Browser` launch config in VSCode. It will launch Chrome and load the React Frontend, the application will run in development mode.

Option 3: run production mode

- Using the terminal, set the `./src/client` folder as the current directory.
- Run the `yarn start pro` command to launch the application in production mode (with Express as the server).

### Node Backend and React Frontend

Both applications can be started with Docker Compose and a debugger can be attached with VSCode.

- Use the `docker-compose.debug.yml` file to launch **both** applications. It is necessary to modify the Compose file to set the environment variables for each of the applications.
- Run the `React D3 Client: Docker Launch Browser` launch config in VSCode. It will attach VSCode to the client application started with Docker Compose. The React Frontend will run in development mode.
- Run the `React D3 API: Docker Attach to Server` launch config in VSCode. It will attach VSCode to the API Backend started with Docker Compose.

### Node Backend and React Frontend (in production mode)

In order to simulate a production environment, the `docker-compose.yml` can be used to launch **both** the React Frontend and the Node Backend. The Compose file needs to be modified to set the environment variables and arguments for the containers.

The React Frontend will run as a static application hosted by an NGINX proxy in production mode.
