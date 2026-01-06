# BFF (Backend for Frontend) Application

A TypeScript-based Backend for Frontend application with Express backend serving a React SPA, using HTTPS for secure local development.

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
- Hot Module Reloading in development

### Development Mode
- Backend runs on `https://localhost:3001` (API only)
- Frontend served via BrowserSync on `https://localhost:3000`
- Webpack Hot Module Reloading enabled
- API requests proxied from frontend to backend

### Production Mode
- Single HTTPS server serves both static files and APIs
- Optimized webpack bundle
- Compiled TypeScript backend

## Setup

### 1. Generate SSL Certificates

Before running the application, you need to generate self-signed SSL certificates for local HTTPS:

```bash
cd backend/certs
./generate-certs.sh
```

This creates:
- `cert.pem` - SSL certificate
- `key.pem` - Private key

**Important**: You may need to trust these certificates in your browser/system for local development.

### 2. Create Environment File

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

Default configuration:
```
PORT=3001
NODE_ENV=development
HTTPS_CERT_PATH=./backend/certs/cert.pem
HTTPS_KEY_PATH=./backend/certs/key.pem
API_URL=https://localhost:3001
```

### 3. Install Dependencies

From the root of the monorepo:

```bash
yarn install
```

Or from this directory:

```bash
yarn workspace react-d3-bff install
```

## Development

### Start Development Server

```bash
yarn dev
```

This starts:
- Backend HTTPS server on port 3001
- Frontend dev server on port 3000 with hot reload
- BrowserSync UI on port 3002

Access the application at: `https://localhost:3000`

### Run Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run with coverage
yarn test-coverage
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
- Frontend bundle in `public/dist/main.js`
- Compiled backend in `dist/backend/`

### Run Production Build

```bash
yarn start
```

Access the application at: `https://localhost:3001`

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
Get repository data from GitHub GraphQL API.

**Path Parameters:**
- `owner` - Repository owner username
- `repo` - Repository name

**Response:**
```json
{
  "owner": "username",
  "name": "repo-name",
  "description": "Repository description",
  "stars": 100,
  "commits": [...]
}
```

## Project Structure

```
src/bff/
├── backend/              # Backend application
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware
│   ├── lib/            # Config, logger, utilities
│   ├── certs/          # SSL certificates (gitignored)
│   └── server.ts       # Express app with HTTPS
├── frontend/            # Frontend application
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
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain backend/certs/cert.pem
```

### Trusting Certificates (Linux)

```bash
sudo cp backend/certs/cert.pem /usr/local/share/ca-certificates/bff-dev.crt
sudo update-ca-certificates
```

### Trusting Certificates (Windows)

Import `cert.pem` into the Trusted Root Certification Authorities store.

## Troubleshooting

### Certificate Not Found Error

If you see "SSL certificates not found", make sure you've run:

```bash
cd backend/certs && ./generate-certs.sh
```

### Port Already in Use

If ports 3000 or 3001 are in use, you can change them in `.env`:

```
PORT=3005  # Backend port
```

For frontend port, modify `run.ts` line with `port: 3000`.

### CORS Errors

The backend is configured to allow requests from `localhost:3000` and `localhost:3001`. If you change ports, update the CORS configuration in `backend/server.ts`.

## License

MIT
