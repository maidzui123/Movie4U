const express = require('express')
const router_admin = express.Router()
const  adminControllers = require('../controllers/AdminController')
const ticketControllers = require('../controllers/TicketController')
const middleware = require('../middlewares')

router_admin.get('/', middleware.authForAdminAndRedirect, (req, res) => {
    res.render('dashboard_admin', {
        layout: 'mainLayout_admin',
        script: '/js/dashboard_admin.js',
        most_popular: [
            {src: '/images/Movie/aladdin.jpg', name: 'Aladindin', duration: '120 min'},
            {src: '/images/Movie/avenger-endgame.jpg', name: 'Avenger Endgame', duration: '120 min'},
            {src: '/images/Movie/captain-marvel.jpg', name: 'Captain Marvel', duration: '120 min'},
        ],
    })
})
router_admin.get('/MovieTheatres', middleware.authForAdminAndRedirect, (req, res) => {
    res.render('movieTheatres_admin', {
        layout: 'mainLayout_admin',
        script: '/js/movietheatres_admin.js',
    })
})
router_admin.get('/Movies',(req, res) => {
    res.render('movies_admin', {
        layout: 'mainLayout_admin',
        script: '/js/movies_admin.js',
    })
})
router_admin.get('/ShowTiming',middleware.authForAdminAndRedirect, (req, res) => {
    res.render('showTiming_admin', {
        layout: 'mainLayout_admin',
        script: '/js/showTiming_admin.js',
    })
})
router_admin.get('/Combo',middleware.authForAdminAndRedirect, (req, res) => {
    res.render('combo_admin', {
        layout: 'mainLayout_admin',
        script: '/js/combo_admin.js',
    })
})
router_admin.get('/Users',middleware.authForAdminAndRedirect, (req, res) => {
    res.render('users_admin', {
        layout: 'mainLayout_admin',
        script: '/js/users_admin.js',
    })
})
router_admin.get('/Booking',middleware.authForAdminAndRedirect, (req, res) => {
    res.render('booking_admin', {
        layout: 'mainLayout_admin',
        script: '/js/booking_admin.js',
    })
})

router_admin.get('/getAllUser', middleware.authForAdmin, adminControllers.getAllUser)
router_admin.get('/getRevenue', middleware.authForAdmin, adminControllers.getRevenue)

router_admin.get('/getAllTheatres', middleware.authForAdmin, adminControllers.getAllTheatres)
router_admin.get('/getTheatreById', middleware.authForAdmin, adminControllers.getTheatreById)
router_admin.post('/addTheatre', middleware.authForAdmin, adminControllers.addTheatre)
router_admin.post('/updateTheatre', middleware.authForAdmin, adminControllers.updateTheatre)
router_admin.delete('/deleteTheatre', middleware.authForAdmin, adminControllers.deleteTheatre)

router_admin.get('/getAllTicket', middleware.authForAdmin, ticketControllers.getAllTicket)

router_admin.get('/getAllSchedule', middleware.authForAdmin, adminControllers.getAllSchedule)
router_admin.post('/addSchedule', middleware.authForAdmin, adminControllers.addScheduleMovie)

router_admin.get('/getFoodComboById', middleware.authForAdmin, adminControllers.getFoodComboById)
router_admin.post('/addFoodCombo', middleware.authForAdmin, adminControllers.addFoodCombo)
router_admin.post('/updateFoodCombo', middleware.authForAdmin, adminControllers.updateFoodCombo)
router_admin.delete('/deleteFoodCombo', middleware.authForAdmin, adminControllers.deleteFoodCombo)

router_admin.get('/getAllMovie', middleware.authForAdmin, adminControllers.getAllMovie)
router_admin.post('/addMovie', middleware.authForAdmin, adminControllers.addMovie)
router_admin.post('/updateMovie', middleware.authForAdmin, adminControllers.updateMovie)
router_admin.delete('/deleteMovie', middleware.authForAdmin, adminControllers.deleteMovie)

module.exports = router_admin