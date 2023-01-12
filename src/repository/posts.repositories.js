import connection from '../database.js';

export function countNewPosts(userId, timestamp) {
  return connection.query(
    `SELECT COALESCE(COUNT(posts.id), 0) as count
    FROM posts
    JOIN users ON users.id = posts."userId"
    JOIN follows ON follows.following = users.id
    WHERE follows.follower = $1
      AND EXTRACT(EPOCH FROM (posts."createdAt" - $2)) > 0.1`,
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
      AND EXTRACT(EPOCH FROM (posts."createdAt" - $2)) > 0.1`,
    [hashtag, timestamp]
  );
}

export const timeline = (usersIds) => {
  return connection.query(
    `SELECT users.username, users."pictureUrl", 
      posts.*, 
      metadatas.image, metadatas.title, metadatas.description
    FROM posts
    JOIN users ON posts."userId" = users.id
    JOIN metadatas ON posts.id = metadatas."postId"
    WHERE users.id = ANY($1)
    ORDER BY posts."createdAt" DESC LIMIT 11`,
    [usersIds]
  );
};

export function loadPosts(usersIds, timestamp) {
  return connection.query(
    `SELECT users.username, users."pictureUrl", 
      posts.*,
      metadatas.image, metadatas.title, metadatas.description 
    FROM posts
    JOIN users ON posts."userId" = users.id
    JOIN metadatas ON posts.id = metadatas."postId"
    WHERE users.id = ANY($1) AND posts."createdAt" < $2
    ORDER BY posts."createdAt" DESC LIMIT 11;`,
    [usersIds, timestamp]
  );
}

function checkForMorePosts(timestamp, usersIds) {
  return connection.query(
    `SELECT id FROM posts WHERE "createdAt" < $1 AND posts."userId" = ANY($2);`,
    [timestamp, usersIds]
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

function checkForMoreHashtagPosts(hashtag, timestamp) {
  return connection.query(
    `SELECT posts.id FROM posts
    JOIN "postHashtags" ON posts.id = "postHashtags"."postId"
    JOIN hashtags ON hashtags.id = "postHashtags"."hashtagId"
    WHERE hashtags.name = $1 AND posts."createdAt" < $2;`,
    [hashtag, timestamp]
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
