const { Handler } = require('@netlify/functions');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const authUrl = `https://${process.env.AUTH0_DOMAIN}/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.AUTH0_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.URL || 'http://localhost:8888')}/.netlify/functions/auth-callback` +
    `&scope=openid%20profile%20email` +
    `&state=${Math.random().toString(36).substring(7)}`;

  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
      'Cache-Control': 'no-store',
    },
  };
};
