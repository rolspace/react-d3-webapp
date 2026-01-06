# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo workspace with two main applications:
- **API** (`src/api/`): Node.js Express API that serves as a middleman to GitHub GraphQL API
- **Client** (`src/client/`): React frontend application with D3.js data visualizations

Uses Yarn workspaces for dependency management with workspace pattern `src/*`.

## Development Commands

### Root-level commands:
- `yarn --immutable` - Install dependencies for both applications
- `yarn format` - Format all files with Prettier
- `yarn test` - Run tests across both workspaces using Vitest

### API (`src/api/`):
- `yarn start` - Start the API server (requires environment variables)
- `yarn lint` - Run ESLint
- `yarn format` - Format files with Prettier
- `yarn test` - Run tests with Vitest
- `yarn test-coverage` - Run tests with coverage report

### Client (`src/client/`):
- `yarn start` - Start development server with webpack
- `yarn build` - Build production bundle
- `yarn lint` - Run ESLint
- `yarn format` - Format files with Prettier
- `yarn test` - Run tests with Vitest
- `yarn test-coverage` - Run tests with coverage report

## Architecture

### API Layer
- Express.js server with middleware for session management, logging, and error handling
- Routes: OAuth flow (`/login`, `/auth/github/callback`) and repository data (`/api/repo/:owner/:repo`)
- GraphQL queries to GitHub API stored in `lib/queries.ts`
- Winston logger for structured logging
- MSW for API mocking in tests

### Client Layer
- React application using Redux Toolkit for state management
- Material-UI for component library and styling
- D3.js for data visualizations (bar charts showing commit metrics)
- React Router for navigation
- Features organized by domain: `user/` (authentication) and `repo/` (repository data)
- Webpack for bundling with separate development and production configurations

### Key Data Flow
1. User authenticates with GitHub OAuth
2. Client sends repository requests to API
3. API fetches data from GitHub GraphQL API
4. Client renders D3 visualizations from repository commit data

## Environment Configuration

### API Environment Variables:
- `APPLICATION_ID` - GitHub application ID
- `APPLICATION_SECRET` - GitHub application secret
- `CLIENT_URL` - Frontend URL for CORS
- `PORT` - API server port (default: 9000)

### Client Environment Variables:
- `APPLICATION_ID` - GitHub application ID
- `API_URL` - Backend API URL

Use `.env` files in respective directories for local development.

## Testing Framework

Uses Vitest for testing across both applications:
- Root `vitest.config.mjs` orchestrates both workspace test suites
- Each workspace has its own Vitest configuration
- Uses JSDOM environment for client-side testing
- Coverage reports generated in respective `/coverage` directories

## Docker Support

- `docker-compose.yml` - Production Docker setup
- `docker-compose.debug.yml` - Debug configuration
- API has dedicated Dockerfile in `src/api/`
- VSCode launch configurations available for Docker debugging

## VSCode Integration

Launch configurations available:
- "Local Client: launch" - Start client in development mode
- "Local API: launch" - Start API server locally
- "Docker API: launch" - Start API in Docker container for debugging