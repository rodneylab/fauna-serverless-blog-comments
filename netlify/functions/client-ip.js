exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const ip = event.headers['client-ip'];
  return { statusCode: 200, body: ip };
};
