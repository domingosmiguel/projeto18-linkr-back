import connection from '../database.js';

export const createUser = (email, username, hashPassword, pictureUrl) => {
  return connection.query(
    'INSERT INTO users (username, email, password, "pictureUrl") VALUES ($1, $2, $3, $4)',
    [username, email, hashPassword, pictureUrl]
  );
};

export const findUserEmail = (email) => {
  return connection.query('SELECT * FROM users WHERE email = $1;', [email]);
};

export const selectUser = (email) => {
  return connection.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [
    email,
  ]);
};

export const insertSession = (userId) => {
  return connection.query(
    `INSERT INTO sessions ("userId", "createdAt") 
    VALUES ($1, NOW())
    RETURNING id`,
    [userId]
  );
};

export const getUserById = (userId) => {
  return connection.query(
    'SELECT id, username, "pictureUrl" FROM users WHERE id = $1 LIMIT 1',
    [userId]
  );
};

export function deleteSession(sessionId) {
  return connection.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
}

export const getSessionById = (id) => {
  return connection.query('SELECT * FROM sessions WHERE id = $1', [id]);
};

export const getUserByInputSearch = (string) => {
  const search = `%${string}%`;
  return connection.query(
    'SELECT id, username, "pictureUrl" FROM users WHERE username ILIKE $1',
    [search]
  );
};

export const getTlUser = (id) => {
  return connection.query(
    `SELECT users.id, users."pictureUrl", users.username
    FROM users
    WHERE users.id = ($1)`,
    [id]
  );
};

export const getTlPosts = (id) => {
  return connection.query(
    `SELECT posts.id, posts."userId", posts.txt, posts.link
    FROM users
    JOIN posts ON users.id = posts."userId"
    WHERE users.id = ($1)
    ORDER BY posts.id DESC`,
    [id]
  );
};

export const likesCount = (postId) => {
  return connection.query(
    `SELECT COUNT(id) AS count FROM "postLikes" WHERE "postId" = ($1)`,
    [postId]
  );
};

export const usersLikes = (postId, userId) => {
  return connection.query(
    `SELECT users.username AS name 
    FROM users 
    JOIN "postLikes" ON "postLikes"."userId" = users.id
    WHERE "postLikes"."postId" = ($1)
      AND NOT "userId" = ($2)
    ORDER BY "postLikes"."postId" 
    LIMIT 2`,
    [postId, userId]
  );
};

export const userLiked = (postId, userId) => {
  return connection.query(
    `SELECT COUNT(id) AS liked 
    FROM "postLikes" 
    WHERE "postId" = ($1) 
      AND "userId" = ($2)`,
    [postId, userId]
  );
};

export const newLike = (postId, userId) => {
  return connection.query(
    `INSERT INTO "postLikes" ("postId", "userId")
    VALUES ($1, $2)`,
    [postId, userId]
  );
};

export const dislike = (postId, userId) => {
  return connection.query(
    `DELETE FROM "postLikes" 
    WHERE "postId" = ($1)
      AND "userId" = ($2)`,
    [postId, userId]
  );
};

export const checkFollow = (id, userId) => {
  return connection.query(
    `SELECT COUNT(id) AS "isFollower"
    FROM follows
    WHERE following = ($1)
      AND follower = ($2)`,
    [id, userId]
  );
};

export const newFollower = (id, userId) => {
  return connection.query(
    `INSERT INTO follows (following, follower)
    VALUES ($1, $2)
    ON CONFLICT (following, follower) DO NOTHING`,
    [id, userId]
  );
};

export const rmFollower = (id, userId) => {
  return connection.query(
    `DELETE FROM follows
    WHERE following = ($1)
      AND follower = ($2)`,
    [id, userId]
  );
};
