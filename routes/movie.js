const express = require('express')
const router = express.Router()
const movieControllers = require('../controllers/MovieController')
const adminControllers = require('../controllers/AdminController')
router.get('/getAllMovies', movieControllers.getAllMovie)
router.get('/getMovieById', movieControllers.getMovieById)
router.get('/getMovieByName', movieControllers.getMovieByName)
router.get('/getAllPoster', movieControllers.getAllPoster)
router.get('/getAllTheatres', adminControllers.getAllTheatres)
module.exports = router
