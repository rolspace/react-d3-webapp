import { extractCodeVerifier, generatePKCEChallenge, storeCodeVerifier } from './pkce.js'

interface TokenData {
  access_token: string
}

export function initiateOAuthFlow() {
  const pkce = generatePKCEChallenge()

  // Generate a unique state parameter for CSRF protection
  const state = crypto.randomUUID()

  // Store the code verifier associated with this state
  storeCodeVerifier(state, pkce.codeVerifier)

  const authUrl = new URL('https://github.com/login/oauth/authorize')
  authUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID || '')
  authUrl.searchParams.set('redirect_uri', process.env.REDIRECT_URI || '')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', pkce.codeChallenge)
  authUrl.searchParams.set('code_challenge_method', pkce.codeChallengeMethod)

  return {
    redirectUrl: authUrl.toString(),
    state,
  }
}

export async function handleOAuthCallback(
  code: string,
  state: string,
): Promise<TokenData | null> {
  const codeVerifier = extractCodeVerifier(state)

  if (!codeVerifier) {
    throw new Error('Invalid state parameter or code verifier not found')
  }

  // Exchange the authorization code for an access token
  // Include the code_verifier in the token request
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      code_verifier: codeVerifier,
      redirect_uri: process.env.REDIRECT_URI,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange code for token')
  }

  const tokenData = await tokenResponse.json() as TokenData
  return tokenData
}
