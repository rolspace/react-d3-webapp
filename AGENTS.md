# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

### Backend Layer
- Express.js server with middleware for session management, logging, and error handling
- Routes: OAuth flow (`/login`, `/auth/github/callback`) and repository data (`/api/repo/:owner/:repo`)
- GraphQL queries to GitHub API stored in `lib/queries.ts`
- Winston logger for structured logging
- MSW for API mocking in tests
- HTTPS support with self-signed certificates in development

### Frontend Layer
- React 19 application using Zustand for state management
- Material-UI for component library and styling
- D3.js for data visualizations (bar charts showing commit metrics)
- React Router for navigation
- Features organized by domain: `user/` (authentication) and `repo/` (repository data)
- Webpack for bundling with separate development and production configurations

### Key Data Flow
1. User authenticates with GitHub OAuth
2. Frontend sends repository requests to backend API
3. Backend fetches data from GitHub GraphQL API
4. Frontend renders D3 visualizations from repository commit data

### Development & Production Mode
- **Development**: Single HTTPS server on port 3000 serves both frontend (with hot reload) and backend APIs
- **Production**: Compiled backend serves optimized frontend bundle and APIs from the same HTTPS server

## Environment Configuration

Environment variables are stored in `src/.env` for local development. See `.env.example` for template.

### Key Environment Variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `SESSION_SECRET` - Secret for session encryption
- `HTTPS_CERT_PATH` - Path to SSL certificate (./backend/certs/cert.pem)
- `HTTPS_KEY_PATH` - Path to SSL private key (./backend/certs/key.pem)
- `API_URL` - Backend API URL for frontend (https://localhost:3000)
- `GITHUB_CLIENT_ID` - GitHub OAuth application ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth application secret
- `REDIRECT_URI` - OAuth callback URL (https://localhost:3000/auth/github/callback)
- `GRAPHQL_TIMEOUT` - Timeout for GraphQL requests (default: 5000ms)

## Testing Framework

Uses Vitest for testing:
- Separate Vitest configurations for backend and frontend
- `src/vitest.config.backend.ts` - Backend test configuration
- `src/vitest.config.frontend.ts` - Frontend test configuration
- Uses JSDOM environment for frontend testing
- Coverage reports generated in `src/coverage/` directory
- Test files co-located with source files in `__tests__/` directories

## HTTPS Development Setup

The application requires HTTPS certificates for local development:
1. Generate certificates: `cd src/backend/certs && ./generate-certs.sh`
2. Trust the certificates in your system (see README.md for platform-specific instructions)
3. Certificates are gitignored and must be generated locally
