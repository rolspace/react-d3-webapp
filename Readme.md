# React + D3 Web App

A long time ago I started a personal project to become more familiar with Node, React, and other tools part of the modern JavaScript ecosystem.

I started this project, abandoned it, started it again, abandoned it again, and finally, started it one last time, up to this point.

Initially, this project was supposed to connect with the Instagram API in order to generate a series of graphs to present user data. After the last Instagram API update, that was not a possibility anymore. 

Later, I decided that the best thing to do was to connect to the GitHub GraphQL API to attempt something similar.

As most personal projects, this is still a work in progress.

## Application setup

The application consists of two parts, the client application and the backend application.

### Client setup

The client application only requires the environment variable BACKEND_URL, for webpack to inject the URL of the server into the build file. This URL will be used to make the service requests to the server, example: http://localhost:9000.

The PORT environment variable can be provided to overwrite the default port used by the client server (8000)

### Backend setup

The backend application requires three environment variables. CLIENT_URL is used to define the URL for incoming requests to the backend server, example: http://localhost:8000. GITHUB_USER defines the id of the user providing the personal access token for the GitHub GraphQL requests. GITHUB_TOKEN is the personal access token used to authenticate the GraphQL API requests.

The PORT environment variable can be provided to overwrite the default port used by the backend server (9000)

### How to run (development)

Install all dependencies running:

`npm install

from inside the /client and /backend folders separately.

In development mode, both applications can be started by going into the /client folder and running:

`npm run dev

*ESLint and Hot Module Reloading are already configured to run after any changes in the client application.*

### How to run (production)

[Work in Progress]

### How to run (containers)

[Work in Progress]