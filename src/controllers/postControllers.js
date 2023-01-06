import connection from '../database.js';

export async function postTimelinePosts(req, res) {
  const body = req.body;
  const userId = res.locals.userId;
  let hashtags;
  if (req.body.hashtags.length) {
    hashtags = req.body.hashtags.map((elem) =>
      elem.slice(1).replace(/[^a-zA-Z0-9]/g, '')
    );
  }
  try {
    const userInformations = await connection.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );
    if (userInformations.rows.length === 0) {
      return res.sendStatus(401);
    }

    const postId = await connection.query(
      `
        INSERT INTO posts ("userId", txt, link, "createdAt") 
        VALUES ($1, $2, $3, NOW())
        RETURNING id`,
      [userId, body.texto, body.link]
    );

    if (hashtags) {
      const hashtagsId = [];
      for (const elem in hashtags) {
        const hashtagFound = await connection.query(
          'SELECT * FROM hashtags WHERE name = $1',
          [hashtags[elem]]
        );
        if (hashtagFound.rowCount) {
          await connection.query(
            'INSERT INTO "postHashtags" ("postId", "hashtagId") values ($1, $2);',
            [postId.rows[0].id, hashtagFound.rows[0].id]
          );
        } else {
          const hashtagCreated = await connection.query(
            'INSERT INTO hashtags (name) VALUES ($1) RETURNING id;',
            [hashtags[elem]]
          );
          await connection.query(
            'INSERT INTO "postHashtags" ("postId", "hashtagId") values ($1, $2);',
            [postId.rows[0].id, hashtagCreated.rows[0].id]
          );
        }
      }
    }

    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getTimelinePosts(req, res) {
  const { user, sessionId, trendingHashtags } = res.locals;
  try {
    const posts = await connection.query(
      `SELECT * FROM posts ORDER BY id DESC LIMIT 20`
    );

    return res
      .send({ posts: posts.rows, user, sessionId, hashtags: trendingHashtags })
      .status(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}
