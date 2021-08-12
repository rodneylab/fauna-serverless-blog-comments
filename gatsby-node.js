const faunadb = require('faunadb');
const { createNodeHelpers } = require('gatsby-node-helpers');

const { FAUNA_SECRET } = process.env;
const FAUNA_COMMENTS_INDEX = 'get-comments';

const getComments = async ({ secret, reporter }) => {
  try {
    const q = faunadb.query;
    const client = new faunadb.Client({
      secret,
      domain: 'db.us.fauna.com',
    });
    const results = await client.query(
      q.Paginate(q.Match(q.Index(FAUNA_COMMENTS_INDEX), false, undefined)),
    );
    return results.data.map(([ref, date, name, slug, text]) => ({
      commentId: ref.id,
      date,
      name,
      slug,
      text,
    }));
  } catch (error) {
    reporter.warn('Error setting up fauna fetch.  ', error.message);
  }
  return [];
};

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest, reporter }) => {
  const { createNode, createTypes } = actions;

  const commentsNodeHelpers = createNodeHelpers({
    typePrefix: 'Comment',
    createNodeId,
    createContentDigest,
  });
  const CommentEntryNode = commentsNodeHelpers.createNodeFactory('Entry');

  const commentsTypeDefs = `
    type CommentEntry implements Node {
      id: String
      commentId: String
      date: Date @dateformat
      name: String
      parentCommentId: String
      text: String
      slug: String
      verified: Boolean
    }
  `;
  createTypes(commentsTypeDefs);

  const comments = await getComments({
    secret: FAUNA_SECRET,
    reporter,
  });
  if (comments !== null) {
    comments.forEach(async (element) => {
      const { commentId } = element;
      const stringCommentId = commentId.toString();
      const node = CommentEntryNode({
        ...element,
        commentId: stringCommentId,
        id: stringCommentId,
      });
      createNode(node);
    });
  }
};
