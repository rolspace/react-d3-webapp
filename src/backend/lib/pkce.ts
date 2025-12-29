import crypto from 'crypto'

/**
 * PKCE (Proof Key for Code Exchange) utility functions for OAuth 2.0
 * Implements RFC 7636 specification
 */

interface PKCEChallenge {
  codeVerifier: string
  codeChallenge: string
  codeChallengeMethod: 'S256'
}

/**
 * Generates a cryptographically secure random code verifier
 * The verifier is a base64url-encoded string of 32 random bytes
 * Length: 43 characters (meets RFC 7636 requirement of 43-128 characters)
 *
 * @returns A random code verifier string
 */
function generateCodeVerifier(): string {
  return base64UrlEncode(crypto.randomBytes(96))
}

/**
 * Creates a code challenge from a code verifier using SHA-256
 * challenge = BASE64URL(SHA256(verifier))
 *
 * @param codeVerifier - The code verifier string
 * @returns The code challenge string
 */
function createCodeChallenge(codeVerifier: string): string {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()
  return base64UrlEncode(hash)
}

/**
 * Generates a complete PKCE challenge pair with verifier and challenge
 * This is the main function to use when initiating PKCE flow
 *
 * @returns Object containing codeVerifier, codeChallenge, and codeChallengeMethod
 */
export function generatePKCEChallenge(): PKCEChallenge {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = createCodeChallenge(codeVerifier)

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  }
}

/**
 * Base64 URL encoding (without padding)
 * Converts Buffer to base64url format as per RFC 7636
 *
 * @param buffer - Buffer to encode
 * @returns Base64url-encoded string
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * In-memory store for code verifiers mapped to state parameters
 * In production, use Redis or a database for distributed systems
 */
const verifierStore = new Map<string, string>()

/**
 * Stores a code verifier with an associated state parameter
 * The state should be a unique identifier for the OAuth session
 *
 * @param state - Unique state parameter for the OAuth flow
 * @param codeVerifier - The code verifier to store
 */
export function storeCodeVerifier(state: string, codeVerifier: string): void {
  verifierStore.set(state, codeVerifier)
}

/**
 * Retrieves and removes a code verifier using the state parameter
 * This should be called during the OAuth callback to get the verifier
 *
 * @param state - The state parameter from the OAuth callback
 * @returns The code verifier if found, undefined otherwise
 */
export function extractCodeVerifier(state: string): string | undefined {
  const verifier = verifierStore.get(state)
  if (verifier) {
    verifierStore.delete(state) // Remove after retrieval for security
  }
  return verifier
}

/**
 * Clears all stored code verifiers
 * Useful for testing or cleanup operations
 */
export function clearCodeVerifiers(): void {
  verifierStore.clear()
}
