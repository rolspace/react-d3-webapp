# React + D3 Web App

[![build](https://github.com/rolspace/react-d3-webapp/actions/workflows/ci.yml/badge.svg)](https://github.com/rolspace/react-d3-webapp/actions/workflows/ci.yml) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=rolspace_react-d3-webapp&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=rolspace_react-d3-webapp) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=rolspace_react-d3-webapp&metric=coverage)](https://sonarcloud.io/summary/new_code?id=rolspace_react-d3-webapp)

A React web application with an Express backend, which connects to the GitHub GraphQL API and uses D3.js to display data graphs.

## Features

- **Backend**: Express.js with TypeScript, HTTPS support, REST APIs
- **Frontend**: React 19 with TypeScript, Zustand state management
- **Bundling**: Webpack with hot module reloading in dev mode
- **Testing**: Vitest for both backend and frontend
- **Development**: HTTPS support with self-signed certificates

## Architecture

### Backend Stack
- Express 5.x with TypeScript
- Winston for structured logging
- CORS middleware for cross-origin requests
- HTTPS with self-signed certificates (development)

### Frontend Stack
- React 19 with TypeScript
- Zustand for state management
- Webpack 5 for bundling

### Development Mode
- The Backend and Frontend run on `https://localhost:3000`

### Production Mode
- Single HTTPS server serves both static files and APIs
- Optimized webpack bundle
- Compiled TypeScript backend

## Setup

### 1. Generate SSL Certificates

Before running the application, you need to generate self-signed SSL certificates for local HTTPS:

```bash
cd src/backend/certs
./generate-certs.sh
```

This creates:
- `cert.pem` - SSL certificate
- `key.pem` - Private key

**Important**: You may need to trust these certificates in your browser/system for local development.

### 2. Create Environment File

Copy the example environment file and configure as needed:

```bash
cp .env.example src/.env
```

**Important**: the .env file must be copied to the src folder.

Default configuration:
```
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret_here
GRAPHQL_TIMEOUT=5000
HTTPS_CERT_PATH=./backend/certs/cert.pem
HTTPS_KEY_PATH=./backend/certs/key.pem
API_URL=https://localhost:3000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
REDIRECT_URI=https://localhost:3000/auth/github/callback
```

See [.env.example](.env.example) for the complete configuration template.

### 3. Install Dependencies

From the project root:

```bash
yarn install
```

## Development

### Start Development Server

```bash
yarn dev
```

This starts:
- Backend HTTPS server on port 3000, the server provides the Frontend static files.

Access the application at: `https://localhost:3000`

### Run Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run with coverage
yarn test:coverage
```

### Lint Code

```bash
yarn lint
```

### Format Code

```bash
yarn format
```

## Production Build

Build both frontend and backend for production:

```bash
yarn build
```

This creates:
- Frontend bundle in `src/public/dist/main.js`
- Compiled backend in `src/dist/backend/`

### Run Production Build

```bash
yarn start
```

Access the application at: `https://localhost:3000`

## API Endpoints

### GET /login
Initiates GitHub OAuth flow with PKCE.

Redirects to GitHub authorization page and sets state cookie.

### GET /auth/github/callback
OAuth callback endpoint.

**Query Parameters:**
- `code` - Authorization code from GitHub
- `state` - State parameter for CSRF protection

Exchanges code for access token and stores in session, then redirects to `/home`.

### GET /api/repo/:owner/:repo
Get aggregated repository data from GitHub GraphQL API.

**Path Parameters:**
- `owner` - Repository owner username
- `repo` - Repository name

**Response:**
```json
{
  "additions": [
    {
      "min": 0,
      "max": 109,
      "count": 60,
      "label": "0-109"
    },
    {
      "min": 110,
      "max": 219,
      "count": 17,
      "label": "110-219"
    }
  ],
  "deletions": [
    {
      "min": 0,
      "max": 762,
      "count": 98,
      "label": "0-762"
    },
    {
      "min": 763,
      "max": 1526,
      "count": 0,
      "label": "763-1526"
    }
  ],
  "changedFiles": [
    {
      "min": 1,
      "max": 16,
      "count": 87,
      "label": "1-16"
    },
    {
      "min": 17,
      "max": 32,
      "count": 10,
      "label": "17-32"
    }
  ]
}
```

## Project Structure

```
src/
├── backend/            # Backend application
│   ├── certs/          # SSL certificates (gitignored)
│   ├── lib/            # Config, logger, utilities
│   ├── middleware/     # Express middleware
│   ├── routes/         # API route handlers
│   ├── types/          # TypeScript interfaces
│   └── server.ts       # Express app with HTTPS
├── frontend/           # Frontend application
│   ├── components/     # React components
│   ├── stores/         # Zustand stores
│   ├── services/       # API client functions
│   ├── types/          # TypeScript interfaces
│   └── main.tsx        # React entry point
├── webpack/            # Webpack configurations
├── public/             # Static assets
├── index.ts           # Backend entry point
└── run.ts             # Development server runner
```

## Testing

### Backend Tests
- Route handlers with mocked request/response
- Middleware functionality
- Error handling

### Frontend Tests
- Component rendering and interaction
- Store state management
- API service functions

Test files are co-located with source files in `__tests__` directories.

## HTTPS in Development

The application uses HTTPS in development to simulate production environment. Self-signed certificates are used for local development.

### Trusting Certificates (macOS)

```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain src/backend/certs/cert.pem
```

### Trusting Certificates (Linux)

```bash
sudo cp src/backend/certs/cert.pem /usr/local/share/ca-certificates/reactd3webapp-dev.crt
sudo update-ca-certificates
```

### Trusting Certificates (Windows)

Import `cert.pem` into the Trusted Root Certification Authorities store.

## Troubleshooting

### Certificate Not Found Error

If you see "SSL certificates not found", make sure you've run:

```bash
cd src/backend/certs && ./generate-certs.sh
```

### Port Already in Use

If port 3000 is in use, you can change it in `.env`:

```
PORT=3005
```

Update the corresponding `API_URL` and `REDIRECT_URI` values to match the new port.

### CORS Errors

The backend is configured to allow requests from `localhost:3000`. If you change the port, you may need to update the CORS configuration in [src/backend/server.ts](src/backend/server.ts).

## License

MIT
