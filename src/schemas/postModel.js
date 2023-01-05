import joi from "joi";

export const postSchema = joi.object({
    texto: joi.string(),
    link: joi.string().uri().required()
})