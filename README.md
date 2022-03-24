# React + D3 Web App

A long time ago I started a personal project to become more familiar with Node, React, and other tools part of the modern JavaScript ecosystem.

I started this project, abandoned it, started it again, abandoned it again, and finally, started it one last time, up to this point.

Initially, this project was supposed to connect with the Instagram API in order to generate a series of graphs to present user data. After the last Instagram API update, that was not a possibility anymore.

Later, I decided that the best thing to do was to connect to the GitHub GraphQL API to attempt something similar.

### How to run

The application has two parts, the client application and the API backend.

#### Client application

The client application requires two environment variables: 
- APPLICATION_ID: GitHub application id.
- SERVER_URL: domain for the API backend

The client application can be run in several ways:

Option 1: Locally
- Using the terminal, set the `/src/client` folder as the current directory and install the client application dependencies with the `npm install` command.
- Run the `npm run dev` command to launch the application in development mode.

Option 2: Use Docker launch config in VSCode
- Run the `Docker Launch Client Server` launch config in VSCode. It will build and start the dev server using webpack and Docker. It is necessary to modify the tasks.json file to provide the environment variables to the `docker-run-client: debug` task (in tasks.json).
- Run the `Docker Launch Client Browser` launch config in VSCode. It will launch Chrome and load the client application.

With this option a Run and Debug session in VSCode will be started.

Option 3: Use Docker Compose and attach with VSCode
- Use the `docker-compose.debug.yml` file to launch **both** the client application and the API backend. It is necessary to modify the Compose file to provide the environment variables.
- Run the `Docker Launch Client Browser` launch config in VSCode. It will attach VSCode to the client application started with Docker Compose.

#### API Backend

The API Backend requires four environment variables:
- APPLICATION_ID: GitHub application id
- APPLICATION_SECRET: GitHub application secret
- CLIENT_URL: domain for the client application
- GITHUB_USER: GitHub user to include in request header

The API Backend can be run in several ways:

Option 1: Locally
- Using the terminal, set the `/src/server` folder as the current directory and install the client application dependencies with the `npm install` command.
- Run the `npm run dev` command to launch the application in development mode.

Option 2: Use Docker launch config in VSCode
- Run the `Docker Launch API Server` launch config in VSCode. It will start the application in a Docker container. It is necessary to modify the tasks.json file to provide the environment variables to the `docker-run-server: debug` task (in tasks.json).

Option 3: Use Docker Compose and attach with VSCode
- Use the `docker-compose.debug.yml` file to launch **both** the client application and the API backend. It is necessary to modify the Compose file to provide the environment variables.
- Run the `Docker Attach to API` launch config in VSCode. It will attach VSCode to the API Backend started with Docker Compose.

The backend application requires three environment variables. CLIENT_URL is used to define the URL for incoming requests to the backend server, example: http://localhost:8000. GITHUB_USER defines the id of the user providing the personal access token for the GitHub GraphQL requests. GITHUB_TOKEN is the personal access token used to authenticate the GraphQL API requests.

The PORT environment variable can be provided to overwrite the default port used by the backend server (the default is port 9000)

### How to run (production)

In order to simulate a production environment, the `docker-compose.yml` can be used to launch **both** the client application and the API Backend. The Compose file needs to be modified to provide the environment variables and arguments for the containers.
