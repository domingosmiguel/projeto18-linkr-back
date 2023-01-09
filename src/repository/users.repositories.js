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

export const getTimelineData = (id) => {
  return connection.query(
    `SELECT users.id AS "userId",
      users."pictureUrl",
      users.username,
      ARRAY_AGG(JSON_BUILD_OBJECT(
        'id', posts.id,
        'userId', posts."userId",
        'txt', posts.txt,
        'link', posts.link
      )) AS posts
    FROM users
    JOIN posts ON users.id = posts."userId"
    WHERE users.id = ($1)
    GROUP BY users.id`,
    [id]
  );
};
