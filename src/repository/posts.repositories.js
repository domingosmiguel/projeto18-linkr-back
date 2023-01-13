import connection from '../database.js';

export function countNewPosts(userId, timestamp) {
  return connection.query(
    `(
      SELECT COALESCE(COUNT(posts.id), 0) as count
      FROM posts
      JOIN users ON users.id = posts."userId"
      JOIN follows ON follows.following = users.id
      WHERE follows.follower = $1
      AND EXTRACT(EPOCH FROM (posts."createdAt" - $2)) > 0.001
    )
    UNION ALL
    (
      SELECT COALESCE(COUNT(posts.id), 0) as count
      FROM posts
      JOIN users ON users.id = posts."userId"
      JOIN follows ON follows.following = users.id
      JOIN reposts ON reposts."postId" = posts.id
      WHERE follows.follower = $1 AND reposts."userId" = follows.following
      AND EXTRACT(EPOCH FROM (posts."createdAt" - $2)) > 0.001
    );`,
    [userId, timestamp]
  );
}

export function countNewHashtagPosts(hashtag, timestamp) {
  return connection.query(
    `SELECT COALESCE(COUNT(posts.id), 0) as count
    FROM posts 
    JOIN "postHashtags" ON "postHashtags"."postId" = posts.id 
    JOIN hashtags ON hashtags.id = "postHashtags"."hashtagId" 
    WHERE hashtags.name = $1
    AND EXTRACT(EPOCH FROM (posts."createdAt" - $2)) > 0.001;`,
    [hashtag, timestamp]
  );
}

export const timeline = (usersIds) => {
  return connection.query(
    `(
      SELECT authors.username, authors."pictureUrl", 
        posts.id, posts."userId", posts.txt, posts.link, posts."createdAt" AS "createdAt", 
        metadatas.image, metadatas.title, metadatas.description,
        FALSE AS repost, 
        'none' AS "reposterName"
      FROM posts
      JOIN users AS authors ON posts."userId" = authors.id
      JOIN metadatas ON posts.id = metadatas."postId"
      WHERE authors.id = ANY($1)
    )
    UNION ALL
    (
      SELECT authors.username, authors."pictureUrl",
        posts.id, posts."userId", posts.txt, posts.link, reposts."createdAt" AS "createdAt",
        metadatas.image, metadatas.title, metadatas.description,
        TRUE AS repost,
        reposter.username AS "reposterName"
      FROM posts
      JOIN users AS authors ON posts."userId" = authors.id
      JOIN metadatas ON posts.id = metadatas."postId"
      JOIN reposts ON reposts."postId" = posts.id
      JOIN users AS reposter ON reposter.id = reposts."userId"
      WHERE reposter.id = ANY($1)
    )
    ORDER BY "createdAt" DESC LIMIT 11;`,
    [usersIds]
  );
};

export function loadPosts(usersIds, timestamp) {
  return connection.query(
    `(
      SELECT authors.username, authors."pictureUrl", 
        posts.id, posts."userId", posts.txt, posts.link, posts."createdAt" AS "createdAt", 
        metadatas.image, metadatas.title, metadatas.description,
        FALSE AS repost, 
        'none' AS "reposterName"
      FROM posts
      JOIN users AS authors ON posts."userId" = authors.id
      JOIN metadatas ON posts.id = metadatas."postId"
      WHERE authors.id = ANY($1) AND posts."createdAt" < $2
    )
    UNION ALL
    (
      SELECT authors.username, authors."pictureUrl",
        posts.id, posts."userId", posts.txt, posts.link, reposts."createdAt" AS "createdAt",
        metadatas.image, metadatas.title, metadatas.description,
        TRUE AS repost,
        reposter.username AS "reposterName"
      FROM posts
      JOIN users AS authors ON posts."userId" = authors.id
      JOIN metadatas ON posts.id = metadatas."postId"
      JOIN reposts ON reposts."postId" = posts.id
      JOIN users AS reposter ON reposter.id = reposts."userId"
      WHERE reposter.id = ANY($1) AND reposts."createdAt" < $2
    )
    ORDER BY "createdAt" DESC LIMIT 11;`,
    [usersIds, timestamp]
  );
}

export function getHashtagPostsQuery(hashtag) {
  return connection.query(
    `SELECT users.username, users."pictureUrl",
      posts.*,
      metadatas.image, metadatas.title, metadatas.description
    FROM posts 
    JOIN "postHashtags" ON "postHashtags"."postId" = posts.id
    JOIN hashtags ON "postHashtags"."hashtagId" = hashtags.id
    JOIN users ON posts."userId" = users.id
    JOIN metadatas ON posts.id = metadatas."postId"
    WHERE hashtags.name = $1
    ORDER BY posts."createdAt" DESC LIMIT 11;`,
    [hashtag]
  );
}

export function loadHashtagPosts(hashtag, timestamp) {
  return connection.query(
    `SELECT users.username, users."pictureUrl",
      posts.*,
      metadatas.image, metadatas.title, metadatas.description
    FROM posts 
    JOIN "postHashtags" ON "postHashtags"."postId" = posts.id
    JOIN hashtags ON "postHashtags"."hashtagId" = hashtags.id
    JOIN users ON posts."userId" = users.id
    JOIN metadatas ON posts.id = metadatas."postId"
    WHERE hashtags.name = $1 AND posts."createdAt" < $2
    ORDER BY posts."createdAt" DESC LIMIT 11;`,
    [hashtag, timestamp]
  );
}

export function creatRepost(id, userId) {
  return connection.query(
    `INSERT INTO reposts ("postId", "userId") VALUES ($1, $2);`,
    [id, userId]
  );
}
