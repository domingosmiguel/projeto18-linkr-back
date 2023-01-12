import connection from '../database.js';

export function countNewPosts(id, userId) {
  return connection.query(
    `
    SELECT COUNT(*) AS number FROM posts
    JOIN users ON users.id = posts."userId"
    JOIN follows ON follows.following = users.id
    WHERE posts.id > $1 AND follows.follower = $2;`,
    [id, userId]
  );
}
export function loadPosts(usersIds, id) {
  return connection.query(
    `SELECT users.username, 
      users."pictureUrl", 
      posts.*, 
      metadatas.image, 
      metadatas.title, 
      metadatas.description 
    FROM posts
    JOIN users ON posts."userId" = users.id
    JOIN metadatas ON posts.id = metadatas."postId"
    WHERE users.id = ANY($1) AND posts.id < $2
    ORDER BY posts.id DESC LIMIT 10;`,
    [usersIds, id]
  );
}
export function checkForMorePosts(id, usersIds) {
  return connection.query(
    `
  SELECT * FROM posts WHERE id < $1 AND posts."userId" = ANY($2);
  `,
    [id, usersIds]
  );
}
