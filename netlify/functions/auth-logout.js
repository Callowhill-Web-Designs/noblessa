exports.handler = async (event, context) => {
  return {
    statusCode: 302,
    headers: {
      'Set-Cookie': 'auth-token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
      'Location': '/',
    },
  };
};
