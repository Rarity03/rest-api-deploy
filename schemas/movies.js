const z = require('zod');

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title must be provided'
    }),
    genre: z.array(
        z.enum(['Crime','Action', 'Comedy', 'Drama', 'Horror', 'Sci-fi', 'Thriller']),{
            invalid_type_error: 'Movie genre must be an array of strings',
            required_error: 'Movie genre must be provided',
            invalid_enum_error: 'Movie genre must be one of Action, Comedy, Drama, Horror, Sci-fi, Thriller'
        }
    ),
    year: z.number().int().min(1900).max(2025),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).optional(),
    poster: z.string().url({
        message: 'Movie poster must be a valid URL'
    })
})

function validateMovie (object) {
    return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}