exports.handler = async (event, _, callback) => {
  // const ip = event.headers['client-ip'];
  const ip = event.headers['x-forwarded-for'];
  callback(null, {
    statusCode: 200,
    body: ip,
  });
};
