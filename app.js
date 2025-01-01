const express = require('express');
const movies = require('./movies.json');
const app = express();
const crypto = require('node:crypto');
const { validateMovie, validatePartialMovie } = require('./schemas/movies');
app.disable('x-powered-by');

const PORT = process.env.PORT ?? 1234;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hola Mundo!');
});


//metodos normales: GET, POST, HEAD
//metodos complejos: PUT, PATCH, DELETE
//CORS PRE-FLIGHT
//OPTIONS -> peticion previa
const ACCEPTED_ORIGINS = [
    'http://localhost:3000',
    'https://movies.com',
    'http://localhost:1234',
    'http://localhost:8080'
]

//Todos los recuersos que sean Movies se identifica con /movies
app.get('/movies', (req, res) => {
    const origin = req.header('origin')
    //Cuando la peticion es del mismo ORIGIN
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
    }
    const {genre} = req.query
    if(genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    //path-to-regexp
    const {id} = req.params
    const movie = movies.find(movie => movie.id === id)
    if(movie){
        res.json(movie)
    }else{
        res.status(404).json({message: 'Movie not found'})
    }
})

app.post('/movies', (req, res) => {
    
    const result = validateMovie(req.body)

    if(result.error) {
        return res.status(400).json(
            {error: JSON.parse(result.error.message)}
        )
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data,
    }

    //Esto no seria REST porque guardamos el estado de la aplicación en memoria
    movies.push(newMovie)

    res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
    
    if(result.error){
        return res.status(400).json(
            {error: JSON.parse(result.error.message)}
        )
    }

    const {id} = req.params 
    const movieIndex = movies.findIndex(movie => movie.id === id)
    
    if(movieIndex === -1){
        return res.status(404).json({message: 'Movie not found'})
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }
    
    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
    
})

app.delete('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    //Cuando la peticion es del mismo ORIGIN
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
    }
    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex === -1){
        return res.status(404).json({message: 'Movie not found'})
    }

    movies.splice(movieIndex, 1)

    return res.json({message: 'Movie deleted'})
})

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
    }
    res.send(200)
})

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`);
})
