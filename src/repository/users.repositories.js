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
    `SELECT users."pictureUrl", users.username
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
    WHERE users.id = ($1)`,
    [id]
  );
};

export const likesCount = (postId) => {
  return connection.query(
    `SELECT COUNT(id) AS count FROM postlikes WHERE "postId" = ($1)`,
    [postId]
  );
};

export const usersLikes = (postId, userId) => {
  return connection.query(
    `SELECT users.username AS name 
    FROM users 
    JOIN postlikes ON postlikes."userId" = users.id
    WHERE postlikes."postId" = ($1)
      AND NOT "userId" = ($2)
    ORDER BY postlikes."postId" 
    LIMIT 2`,
    [postId, userId]
  );
};

export const userLiked = (postId, userId) => {
  return connection.query(
    `SELECT COUNT(id) AS liked 
    FROM postlikes 
    WHERE "postId" = ($1) 
      AND "userId" = ($2)`,
    [postId, userId]
  );
};

export const newLike = (postId, userId) => {
  return connection.query(
    `INSERT INTO postlikes ("postId", "userId")
    VALUES ($1, $2)`,
    [postId, userId]
  );
};

export const dislike = (postId, userId) => {
  return connection.query(
    `DELETE FROM postlikes 
    WHERE "postId" = ($1)
      AND "userId" = ($2)`,
    [postId, userId]
  );
};
