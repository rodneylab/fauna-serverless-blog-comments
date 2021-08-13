import axios from 'axios';

async function checkCredentials(secret) {
  try {
    const authorizationToken = Buffer.from(`${secret}:`, 'utf-8').toString('base64');
    const response = await axios({
      url: 'https://db.us.fauna.com/tokens/self',
      method: 'GET',
      headers: {
        Authorization: `Basic ${authorizationToken}`,
      },
    });
    return { successful: true, message: response };
  } catch (error) {
    return { successful: false, message: error.message };
  }
}

const triggerRebuild = async () => {
  if (!process.env.NETLIFY_BUILD_HOOK_ID) {
    return { successful: false, message: 'Netlify build hook ID is not defined.' };
  }
  try {
    const response = await axios({
      url: `https://api.netlify.com/build_hooks/${process.env.NETLIFY_BUILD_HOOK_ID}`,
      method: 'POST',
    });
    return { successful: true, message: response };
  } catch (error) {
    let message;
    if (error.response) {
      message = `Server responded with non 2xx code: ${error.response.data}`;
    } else if (error.request) {
      message = `No response received: ${error.request}`;
    } else {
      message = `Error setting up response: ${error.message}`;
    }
    return { successful: false, message };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
  } else {
    const { token: secret } = req.body;
    const { successful: validCredentials } = await checkCredentials(secret);
    if (!validCredentials) {
      res.status(400).send('Unauthorized.');
    } else {
      await triggerRebuild();
      res.status(200).send('Triggered rebuild.');
    }
  }
}
