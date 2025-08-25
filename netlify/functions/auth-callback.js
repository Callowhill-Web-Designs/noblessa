const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  // Handle GET request (Auth0 redirect)
  if (event.httpMethod === 'GET') {
    const urlParams = new URLSearchParams(event.rawQuery);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      return {
        statusCode: 302,
        headers: {
          Location: '/login/?error=auth_failed',
        },
      };
    }

    if (!code) {
      return {
        statusCode: 302,
        headers: {
          Location: '/login/?error=no_code',
        },
      };
    }

    try {
      // Exchange authorization code for tokens
      const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          code: code,
          redirect_uri: `${process.env.URL || 'http://localhost:8080'}/.netlify/functions/auth-callback`,
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokens.error_description || 'Failed to exchange code for tokens');
      }

      // Get user info
      const userResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      const user = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      // Create a session token
      const sessionToken = jwt.sign(
        { 
          sub: user.sub,
          email: user.email,
          name: user.name,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
        },
        process.env.AUTH0_CLIENT_SECRET
      );

      return {
        statusCode: 302,
        headers: {
          'Set-Cookie': `auth-token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}; Path=/`,
          'Location': '/partner-resources/',
        },
      };
    } catch (error) {
      console.error('Auth callback error:', error);
      return {
        statusCode: 302,
        headers: {
          Location: '/login/?error=auth_failed',
        },
      };
    }
  }

  // Handle POST request (for manual token exchange if needed)
  if (event.httpMethod === 'POST') {
    const { code, state } = JSON.parse(event.body);

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Authorization code is required' }),
      };
    }

    try {
      // Exchange authorization code for tokens
      const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          code: code,
          redirect_uri: `${process.env.URL || 'http://localhost:8080'}/.netlify/functions/auth-callback`,
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokens.error_description || 'Failed to exchange code for tokens');
      }

      // Get user info
      const userResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      const user = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      // Create a session token
      const sessionToken = jwt.sign(
        { 
          sub: user.sub,
          email: user.email,
          name: user.name,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
        },
        process.env.AUTH0_CLIENT_SECRET
      );

      return {
        statusCode: 200,
        headers: {
          'Set-Cookie': `auth-token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}; Path=/`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          user: {
            email: user.email,
            name: user.name,
          },
        }),
      };
    } catch (error) {
      console.error('Auth callback error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Authentication failed' }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
