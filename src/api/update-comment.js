import axios from 'axios';
import faunadb from 'faunadb';

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

const moveCommentToTrash = async ({ commentId }) => {
  try {
    const client = new faunadb.Client({
      secret: process.env.FAUNA_SECRET,
      domain: 'db.us.fauna.com',
      scheme: 'https',
    });
    const q = faunadb.query;
    await client.query(
      q.Update(q.Ref(q.Collection(process.env.FAUNA_COLLECTION), commentId), {
        data: {
          movedToTrash: true,
        },
      }),
    );
    return { successful: true };
  } catch (error) {
    return { successful: false, message: error.message };
  }
};

const setMarkedSpam = async ({ commentId, setMarkedSpamTo }) => {
  try {
    const client = new faunadb.Client({
      secret: process.env.FAUNA_SECRET,
      domain: 'db.us.fauna.com',
      scheme: 'https',
    });
    const q = faunadb.query;
    await client.query(
      q.Update(q.Ref(q.Collection(process.env.FAUNA_COLLECTION), commentId), {
        data: {
          markedSpam: setMarkedSpamTo,
        },
      }),
    );
    return { successful: true };
  } catch (error) {
    return { successful: false, message: error.message };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
  } else {
    const { commentId, token: secret, moveToTrash, setMarkedSpamTo } = req.body;
    const { successful: validCredentials } = await checkCredentials(secret);
    if (!validCredentials) {
      res.status(400).send('Unauthorized.');
    } else if (moveToTrash !== undefined) {
      const { message, successful } = await moveCommentToTrash({ commentId });
      if (!successful) {
        res.status(400).send(`Error retreiving comments${message ? `: ${message}` : '.'}`);
      } else {
        res.status(200).send('Moved to trash.');
      }
    } else if (setMarkedSpamTo !== undefined) {
      const { message, successful } = await setMarkedSpam({ commentId, setMarkedSpamTo });
      if (!successful) {
        res.status(400).send(`Error changing marked spam flag${message ? `: ${message}` : '.'}`);
      } else {
        res.status(200).send(`Marked ${setMarkedSpamTo ? '' : 'not'} spam.`);
      }
    }
  }
}
