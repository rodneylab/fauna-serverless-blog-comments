import { AkismetClient } from 'akismet-api';
import axios from 'axios';
import faunadb from 'faunadb';

const TRIGGER_REBUILD_ON_NEW_COMMENT = false;

const createComment = async ({ name, parentCommentId, text, markedSpam, slug }) => {
  try {
    const client = new faunadb.Client({
      secret: process.env.FAUNA_SECRET,
      domain: 'db.us.fauna.com',
      scheme: 'https',
    });
    const q = faunadb.query;
    const response = await client.query(
      q.Create(q.Collection(process.env.FAUNA_COLLECTION), {
        data: {
          date: new Date().toISOString(),
          markedSpam,
          name,
          parentCommentId,
          slug,
          text,
        },
      }),
    );
    return { successful: true, message: response };
  } catch (error) {
    return { successful: false, message: error };
  }
};

const spamCheck = async ({ email, ip, name, text, userAgent }) => {
  const client = new AkismetClient({
    key: process.env.AKISMET_API_KEY,
    blog: process.env.SITE_URL,
  });
  return client.checkSpam({
    user_ip: ip,
    useragent: userAgent,
    content: text,
    email,
    name,
  });
};

const triggerRebuild = async () => {
  if (!process.env.GATSBY_CLOUD_SITE_ID) {
    return { successful: false, message: 'Gatsby Cloud Site ID is not defined.' };
  }
  try {
    const response = await axios({
      url: `https://webhook.gatsbyjs.com/hooks/data_source/publish/${process.env.GATSBY_CLOUD_SITE_ID}`,
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
    const { email, ip, name, parentCommentId, slug, text } = req.body;
    // const ip = req.headers['client-ip'];
    const userAgent = req.headers['user-agent'];
    let markedSpam;
    let akismetError;
console.log('ip: ', ip);
    try {
      markedSpam = await spamCheck({
        email,
        name,
        ip,
        text,
        userAgent,
      });
    } catch (error) {
      akismetError = error.message;
    }
    if (akismetError) {
      res.status(400).send(akismetError);
    } else {
      const createCommentResult = await createComment({
        name,
        parentCommentId,
        text,
        markedSpam,
        slug,
      });
      if (!createCommentResult.successful) {
        res.status(400).send(createCommentResult.message);
      } else {
        if (TRIGGER_REBUILD_ON_NEW_COMMENT && !markedSpam) {
          await triggerRebuild();
        }
        res.status(200).send('All is well that ends well.');
      }
    }
  }
}
