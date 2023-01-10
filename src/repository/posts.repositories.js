import connection from '../database.js';

export function countNewPosts(id) {
  return connection.query(
    `SELECT COUNT(*) as number FROM posts WHERE posts.id > $1;`,
    [id]
  );
}
