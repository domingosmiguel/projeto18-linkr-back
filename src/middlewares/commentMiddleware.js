import { commentSchema } from "../schemas/commentModel.js"

export async function commentMiddleware(req, res, next){
    const body = req.body;
    const {error} = commentSchema.validate(body, {abortEarly: false});
    if(error){
        const errors=error.details.map((detail)=>detail.message)
        return res.status(422).send(errors);
    }

    next();
}