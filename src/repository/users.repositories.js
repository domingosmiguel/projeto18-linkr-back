import connection from '../database.js';

export const createUser = ({ email, username, hashPassword, pictureUrl }) => {
  return connection.query(
    'INSERT INTO users (username, email, password, "pictureUrl") VALUES ($1, $2, $3, $4)',
    [username, email, hashPassword, pictureUrl]
  );
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
    ON CONFLICT ("userId") DO UPDATE 
    SET "createdAt" = excluded."createdAt"
    RETURNING id`,
    [userId]
  );
};
