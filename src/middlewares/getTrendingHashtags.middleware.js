import connection from '../database.js';

export default async function getTrendingHashtags(req, res, next) {
  try {
    const hashtags = await connection.query(`
      SELECT hashtags.name FROM "postHashtags"
      JOIN hashtags ON hashtags.id = "postHashtags"."hashtagId"
      GROUP BY hashtags.name ORDER BY COUNT(*) DESC LIMIT 10;
    `);
    res.locals.trendingHashtags = hashtags.rows;
    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}
