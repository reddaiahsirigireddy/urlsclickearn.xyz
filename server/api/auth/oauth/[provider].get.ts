import { defineEventHandler, sendRedirect } from 'h3'

// Dynamic provider redirect: /api/auth/oauth/{provider}
// Example: GET /api/auth/oauth/github  -> redirects to GitHub authorize URL

export default defineEventHandler(async (event) => {
  const provider = event.context.params?.provider?.toString()
  // Build origin: prefer explicit OAUTH_BASE_URL, otherwise use request Host + proto so the redirect_uri
  // matches the actual URL (including dynamic dev port like 3001).
  const forwardedProto = (event.node.req.headers['x-forwarded-proto'] as string) || (process.env.NODE_ENV === 'production' ? 'https' : undefined)
  const hostHeader = event.node.req.headers.host as string | undefined
  const origin = process.env.OAUTH_BASE_URL || (hostHeader ? `${forwardedProto || 'http'}://${hostHeader}` : `http://localhost:${process.env.PORT || 3000}`)

  if (!provider) {
    return { error: true, message: 'Provider not specified' }
  }

  if (provider === 'github') {
    const clientId = process.env.GITHUB_CLIENT_ID
    if (!clientId)
      return { error: true, message: 'GITHUB_CLIENT_ID not set' }
    const redirectUri = `${origin}/api/auth/oauth/callback?provider=github`
    const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`
    return sendRedirect(event, url)
  }

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId)
      return { error: true, message: 'GOOGLE_CLIENT_ID not set' }
    const redirectUri = `${origin}/api/auth/oauth/callback?provider=google`
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    })
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    return sendRedirect(event, url)
  }

  return { error: true, message: `Unsupported provider: ${provider}` }
})
