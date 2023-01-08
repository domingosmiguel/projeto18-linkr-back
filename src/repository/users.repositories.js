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
    'SELECT id, username, "pictureUrl" FROM users WHERE id = $1',
    [userId]
  );
};

export function deleteSession(sessionId) {
  return connection.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
}
