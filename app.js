const express = require('express')
const hbs = require('express-handlebars')
const cors = require('cors')
const logger = require('morgan')
const error = require('http-errors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')

const indexRouter = require('./routes/index')
const adminRouter = require('./routes/admin')
const movieRouter = require('./routes/movie')
const ticketRouter = require('./routes/ticket')

const app = express()

app.engine('handlebars', hbs.engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

/* Setting up the middleware for the express app. */
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors())
app.use(logger('dev'))
app.use(cookieParser('cookie'))
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

app.use((req, res, next) => {
    res.locals.flash = req.session.flash
    delete req.session.flash
    next()
})

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/admin', adminRouter)
app.use('/movie', movieRouter)
app.use('/ticket', ticketRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;

    // render the error page
    res.status(err.status || 500);

    //re direct trang dang nhap
    res.render('error', { layout: false });
});

module.exports = app