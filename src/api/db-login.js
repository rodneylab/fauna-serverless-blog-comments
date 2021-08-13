import faunadb from 'faunadb';

const dbLogin = async ({ email, password }) => {
  try {
    const client = new faunadb.Client({
      secret: process.env.FAUNA_SECRET,
      domain: 'db.us.fauna.com',
      scheme: 'https',
    });
    const q = faunadb.query;
    const response = await client.query(
      q.Login(q.Match(q.Index('users_by_email'), email), { password }),
    );
    const { secret } = response;
    return { successful: true, secret };
  } catch (error) {
    return { successful: false, message: error.message };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
  } else {
    const { email, password } = req.body;
    const dbloginResult = await dbLogin({ email, password });
    if (!dbloginResult.successful) {
      res.status(400).send('Error logging in.');
    } else {
      res.status(200).json(dbloginResult);
    }
  }
}
