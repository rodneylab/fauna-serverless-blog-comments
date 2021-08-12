import axios from 'axios';
import faunadb from 'faunadb';

const FAUNA_COMMENTS_INDEX = 'get-comments';

function groupCommentsBySlug(comments) {
  return comments.reduce((accumulator, object) => {
    const key = object.slug;
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(object);
    return accumulator;
  }, {});
}

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

const getComments = async ({ showSpam }) => {
  try {
    const client = new faunadb.Client({
      secret: process.env.FAUNA_SECRET,
      domain: 'db.us.fauna.com',
      scheme: 'https',
    });
    const q = faunadb.query;
    const results = await client.query(
      q.Paginate(q.Match(q.Index(FAUNA_COMMENTS_INDEX), showSpam, undefined)),
    );
    const comments = results.data.map(([ref, date, name, slug, text]) => ({
      commentId: ref.id,
      date,
      name,
      slug,
      text,
    }));
    return { successful: true, comments: groupCommentsBySlug(comments) };
  } catch (error) {
    return { successful: false, message: error.message };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
  } else {
    const { token: secret, showSpam } = req.body;
    const { successful: validCredentials } = await checkCredentials(secret);
    if (!validCredentials) {
      res.status(400).send('Unauthorized.');
    } else {
      const { comments, message, successful } = await getComments({ showSpam });
      if (!successful) {
        res.status(400).send(`Error retreiving comments${message ? `: ${message}` : '.'}`);
      } else {
        res.status(200).send(JSON.stringify({ comments }));
      }
    }
  }
}
