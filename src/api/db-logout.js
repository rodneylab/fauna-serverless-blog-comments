import faunadb from 'faunadb';

const dbLogout = async ({ secret }) => {
  try {
    const client = new faunadb.Client({
      secret,
      domain: 'db.us.fauna.com',
      scheme: 'https',
    });
    const q = faunadb.query;
    await client.query(q.Logout(true));
    return { successful: true };
  } catch (error) {
    return { successful: false, message: error.message };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
  } else {
    const { token: secret } = req.body;
    const dblogoutResult = await dbLogout({ secret });
    if (!dblogoutResult.successful) {
      res.status(400).send('Error logging out.');
    } else {
      res.status(200).json(dblogoutResult);
    }
  }
}
