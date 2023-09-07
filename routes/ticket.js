const express = require('express')
const router = express.Router()
const middleware = require('../middlewares')
const ticketControllers = require('../controllers/TicketController')

router.get('/getAllTickets',ticketControllers.getAllTicket)
router.get('/getMovieSchedule', ticketControllers.getMovieSchedule)
router.get('/getSeat', ticketControllers.getSeat)
router.post('/addTicket', middleware.authForUser, ticketControllers.addTicket)
router.get('/getTicketByAccountId', middleware.authForUser, ticketControllers.getTicketByAccountId)
router.get('/getFoodCombo', ticketControllers.getFoodCombo)

module.exports = router