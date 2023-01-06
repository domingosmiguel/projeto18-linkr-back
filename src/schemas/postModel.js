import joi from "joi";

export const postSchema = joi.object({
    texto: joi.string().min(0),
    link: joi.string().uri().required()
})