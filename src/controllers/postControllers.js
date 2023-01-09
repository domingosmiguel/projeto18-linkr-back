import connection from '../database.js';
import urlMetadata from 'url-metadata';
import urlExist from 'url-exist';

import {
  dislike,
  likesCount,
  newLike,
  userLiked,
  usersLikes,
} from '../repository/users.repositories.js';

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
    const urlExists = await urlExist(body.link);
    if (!urlExists) {
      return res.sendStatus(400);
    }
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

    const metadata = await urlMetadata(body.link);
    await connection.query(
      'INSERT INTO metadatas ("postId", image, title, description) VALUES ($1, $2, $3, $4);',
      [postId.rows[0].id, metadata.image, metadata.title, metadata.description]
    );

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
      `SELECT users.id AS "userId", users.username, users."pictureUrl", posts.*, metadatas.image, metadatas.title, metadatas.description FROM posts
      JOIN users ON posts."userId" = users.id
      JOIN metadatas ON posts.id = metadatas."postId"
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
    SELECT users.username, users."pictureUrl", posts.txt, posts.link, posts."userId", metadatas.image, metadatas.title, metadatas.description FROM posts 
    JOIN "postHashtags" ON "postHashtags"."postId" = posts.id
    JOIN hashtags ON "postHashtags"."hashtagId" = hashtags.id
    JOIN users ON posts."userId" = users.id
    JOIN metadatas ON posts.id = metadatas."postId"
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

export async function updatePost(req, res) {
  const { id } = req.params;
  const body = req.body;
  let hashtags;
  if (req.body.hashtags.length) {
    hashtags = req.body.hashtags.map((elem) =>
      elem.slice(1).replace(/[^a-zA-Z0-9]/g, '')
    );
  }

  try {
    const hashtagsPostId = await connection.query(
      `SELECT * FROM  "postHashtags" WHERE "postId" = $1`,
      [id]
    );
    if (hashtagsPostId.rows.length > 0) {
      await connection.query(`DELETE FROM "postHashtags" WHERE "postId" = $1`, [
        id,
      ]);
    }

    await connection.query(`UPDATE posts SET txt=$1 WHERE id = $2;`, [
      body.texto,
      id,
    ]);

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
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
}

export const postLikes = async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals;

  try {
    const {
      rows: [{ count }],
    } = await likesCount(postId);
    const { rows: users } = await usersLikes(postId, userId);
    const {
      rows: [{ liked }],
    } = await userLiked(postId, userId);

    users.forEach((user, i) => {
      users[i] = user.name;
    });

    return res
      .send({
        count: parseInt(count),
        users: users ? users : [],
        liked: parseInt(liked) ? true : false,
      })
      .status(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const likePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals;

  try {
    await newLike(postId, userId);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
export const dislikePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals;

  try {
    await dislike(postId, userId);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
