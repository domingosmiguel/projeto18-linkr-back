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
      `SELECT users.id AS "userId", users.username, users."pictureUrl", posts.* FROM posts
      JOIN users ON posts."userId" = users.id 
      ORDER BY posts.id DESC LIMIT 20`
    );

    return res
      .send({ posts: posts.rows, user, sessionId, hashtags: trendingHashtags })
      .status(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getHashtagPosts(req, res) {
  const { hashtag } = req.params;
  const { user, sessionId, trendingHashtags } = res.locals;
  try {
    const posts = await connection.query(
      `
    SELECT users.username, users."pictureUrl", posts.txt, posts.link, posts."userId" FROM posts 
    JOIN "postHashtags" ON "postHashtags"."postId" = posts.id
    JOIN hashtags ON "postHashtags"."hashtagId" = hashtags.id
    JOIN users ON posts."userId" = users.id
    WHERE hashtags.name = $1
    ORDER BY posts.id DESC LIMIT 20;
    `,
      [hashtag]
    );
    return res
      .send({ posts: posts.rows, user, sessionId, hashtags: trendingHashtags })
      .status(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function deletePost(req, res) {
  const { id } = req.params;
  const { userId } = res.locals;
  console.log(userId);

  try {
    const post = await connection.query(`SELECT * FROM posts WHERE id = $1`, [
      id,
    ]);
    if (post.rows.length === 0) {
      return res.sendStatus(401);
    }

    if (post.rows[0].userId !== userId) {
      return res.sendStatus(401);
    }

    const existHashtag = await connection.query(
      `SELECT * FROM "postHashtags" WHERE "postId" = $1`,
      [id]
    );
    if (existHashtag.rows.length > 0) {
      await connection.query(`DELETE FROM "postHashtags" WHERE "postId" = $1`, [
        id,
      ]);
    }

    await connection.query(`DELETE FROM posts WHERE id = $1`, [id]);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function updatePost(req, res){
  const {id} = req.params;
  const body = req.body;
  let hashtags;
  if (req.body.hashtags.length) {
    hashtags = req.body.hashtags.map((elem) =>
      elem.slice(1).replace(/[^a-zA-Z0-9]/g, '')
    )
  }

  try{
    const hashtagsPostId = await connection.query(`SELECT * FROM  "postHashtags" WHERE "postId" = $1`,
    [id]);
    if(hashtagsPostId.rows.length>0){
      await connection.query(`DELETE FROM "postHashtags" WHERE "postId" = $1`, [id])
    }

    await connection.query(`UPDATE posts SET txt=$1 WHERE id = $2;`,
    [body.texto, id])

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
            [id, hashtagFound.rows[0].id]
          );
        } else {
          const hashtagCreated = await connection.query(
            'INSERT INTO hashtags (name) VALUES ($1) RETURNING id;',
            [hashtags[elem]]
          );
          await connection.query(
            'INSERT INTO "postHashtags" ("postId", "hashtagId") values ($1, $2);',
            [id, hashtagCreated.rows[0].id]
          );
        }
      }
    }

    return res.sendStatus(201);
  } catch (err){
    console.log(err)
    return res.sendStatus(500);
  }
}
