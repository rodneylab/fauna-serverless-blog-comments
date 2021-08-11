exports.handler = async (event, _, callback) => {
  const ip = event.headers['client-ip'];
  callback(null, {
    statusCode: 200,
    body: ip,
  });
};
