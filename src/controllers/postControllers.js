import urlMetadata from 'url-metadata';
import connection from '../database.js';
import {
  checkRepost,
  countNewHashtagPosts,
  countNewPosts,
  countPostReposts,
  creatRepost,
  getHashtagPostsQuery,
  loadHashtagPosts,
  loadPosts,
  timeline,
} from '../repository/posts.repositories.js';

import {
  dislike,
  getFollowing,
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
    const metadata = await urlMetadata(body.link);

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

    await connection.query(
      'INSERT INTO metadatas ("postId", image, title, description) VALUES ($1, $2, $3, $4);',
      [postId.rows[0].id, metadata.image, metadata.title, metadata.description]
    );

    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    if (error.errno || error.Error) {
      return res.sendStatus(400);
    }
    return res.sendStatus(500);
  }
}

export async function getTimelinePosts(req, res) {
  const { user, userId, sessionId, trendingHashtags } = res.locals;

  try {
    const { rows: following } = await getFollowing(userId);
    following.forEach((user, i) => (following[i] = user.following));

    let hasMore = false;
    let posts = [];
    if (following.length) {
      const { rowCount, rows } = await timeline(following);
      posts = rows.slice(0, 10);

      if (rowCount > 10) hasMore = true;
    }

    return res
      .send({
        following,
        posts,
        user,
        sessionId,
        hashtags: trendingHashtags,
        hasMore,
      })
      .status(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function loadMorePosts(req, res) {
  const { timestamp } = req.params;
  const { userId } = res.locals;

  try {
    const { rows: following } = await getFollowing(userId);
    following.forEach((user, i) => (following[i] = user.following));

    let hasMore = false;
    let posts = [];
    if (following.length) {
      const { rowCount, rows } = await loadPosts(following, timestamp);
      posts = rows.slice(0, 10);
      if (rowCount > 10) hasMore = true;
    }

    return res.send({ following, posts, hasMore }).status(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getHashtagPosts(req, res) {
  const { hashtag } = req.params;
  const { user, sessionId, trendingHashtags } = res.locals;
  try {
    const { rowCount, rows: posts } = await getHashtagPostsQuery(hashtag);

    return res
      .send({
        posts: posts.slice(0, 10),
        user,
        sessionId,
        hashtags: trendingHashtags,
        hasMore: rowCount > 10,
      })
      .status(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function loadMoreHashtagPosts(req, res) {
  const { hashtag, timestamp } = req.params;
  try {
    const { rowCount, rows: posts } = await loadHashtagPosts(
      hashtag,
      timestamp
    );

    return res
      .send({
        posts: posts.slice(0, 10),
        hasMore: rowCount > 10,
      })
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

    await connection.query(`DELETE FROM "postLikes" WHERE "postId" = $1`,
      [id])
    
    await connection.query(`DELETE FROM metadatas WHERE "postId" = $1`,
      [id])

    await connection.query(`DELETE FROM reposts WHERE "postId" = $1`,
      [id])

    await connection.query(`DELETE FROM "postHashtags" WHERE "postId" = $1`, 
    [id])

    await connection.query(`DELETE FROM comments WHERE "postId" = $1`, [id]);
    
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
        users,
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

export async function getNewPosts(req, res) {
  const { timestamp } = req.params;
  const { userId } = res.locals;
  try {
    const {
      rows: [{ count }],
    } = await countNewPosts(userId, timestamp);

    return res.send({ number: parseFloat(count) });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getNewHashtagPosts(req, res) {
  const { hashtag, timestamp } = req.params;
  try {
    const {
      rows: [{ count }],
    } = await countNewHashtagPosts(hashtag, timestamp);

    return res.send({ number: parseFloat(count) });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function publishComment(req, res) {
  const body = req.body;
  const { id } = req.params;
  const idUser = res.locals.userId;
  console.log(id);

  try {
    const idPostExist = await connection.query(
      `SELECT * FROM posts WHERE id = $1`,
      [id]
    );
    if (idPostExist.rows.length === 0) {
      return res.sendStatus(401);
    }

    const idUserExist = await connection.query(
      `SELECT * FROM users WHERE id = $1`,
      [idUser]
    );
    if (idUserExist.rows.length === 0) {
      return res.status(401).send('Usuário inexistente');
    }

    await connection.query(
      `
      INSERT INTO comments ("postId", "userId", txt, "createdAt") 
      VALUES ($1, $2, $3, NOW())`,
      [id, idUser, body.comment]
    );

    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getAllComments(req, res) {
  const { id } = req.params;
  try {
    const {
      rows: [{ count }],
    } = await connection.query(
      `SELECT COUNT(COALESCE(id, 0))
      FROM comments 
      WHERE "postId" = ($1)`,
      [id]
    );
    return res.status(200).send(count);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getComments(req, res) {
  const { id } = req.params;
  const userId = res.locals.userId;

  try {
    const comments = await connection.query(
      `
      SELECT users.username, users."pictureUrl", 
      comments.*, 
      posts."userId" AS "quemPostou" 
      FROM users 
      LEFT JOIN comments 
      ON users.id = comments."userId" 
      LEFT JOIN posts 
      ON comments."postId" = posts.id 
      WHERE posts.id = $1;
      `,
      [id]
    );

    const usersFollowging = await connection.query(
      `
      SELECT follows.following 
      FROM follows 
      WHERE follows.follower = $1;
      `,
      [userId]
    );

    const userIsFollowing = usersFollowging.rows.map((u) => u.following);
    const commentsUpadte = [];
    for (let i = 0; i < comments.rows.length; i++) {
      commentsUpadte.push({
        createdAt: comments.rows[i].createdAt,
        id: comments.rows[i].id,
        userId: comments.rows[i].userId,
        username: comments.rows[i].username,
        pictureUrl: comments.rows[i].pictureUrl,
        txt: comments.rows[i].txt,
        postId: comments.rows[i].postId,
        quemPostou: comments.rows[i].quemPostou,
        following: userIsFollowing.includes(comments.rows[i].userId)
          ? true
          : false,
      });
    }

    console.log(usersFollowging.rows);
    return res.status(200).send(commentsUpadte);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function postRepost(req, res) {
  const { id } = req.params;
  const { userId } = res.locals;
  try {
    const repost = await checkRepost(id, userId);
    if (repost.rowCount) return res.sendStatus(404);
    await creatRepost(id, userId);
    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getRepostsNumber(req, res) {
  const { id } = req.params;
  try {
    const number = await countPostReposts(id);
    return res.send({ number: number.rows[0].number });
  } catch (error) {
    return res.sendStatus(500);
  }
}
