import connection from "../database.js";

export async function postTimelinePosts(req, res){
    const bodyPost = req.bodyPost;
    const idProvisorio = 10;
    const hashtagsProvisórias = "#hashtag";
    // const userId = req.locals.userId

    console.log(bodyPost);
   

    try{
        const userInformations = await connection.query(`SELECT * FROM users WHERE id = $1`,
        [idProvisorio]);
        if(userInformations.rows.length ===0){
            return res.sendStatus(401);
        }

        const postId = await connection.query(`
        INSERT INTO posts ("userId", txt, link, "createdAt") 
        VALUES ($1, $2, $3, NOW())
        RETURNING id`,
        [idProvisorio, bodyPost.texto, bodyPost.link]);
        console.log(postId.rows[0].id)

        //Inserir dados na tabela hashtags
        // const hashtagId = await connection.query(`INSERT INTO hashtags (name, "createdAt")
        // VALUES ($1, NOW())
        // RETURNING id`, 
        // [hashtagsProvisórias])

        //Inserir dados na tabela postHashtag
        // await connection.query(`INSERT INTO postHashtags ("postId", "hashtagId") 
        // VALUES ($1, $2)`, 
        // [postId.rows[0].id, hashtagId.rows[0].id]);

        return res.sendStatus(201)

    } catch(error){
        console.log(error);
        return res.ssendStatus(500);
    }
}

export async function getTimelinePosts(req, res){
    try{
        const posts = await connection.query(`SELECT * FROM posts ORDER BY id LIMIT 20`);

        return res.send(posts.rows).status(200);
    } catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
}