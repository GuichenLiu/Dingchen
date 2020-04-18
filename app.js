var express = require('express');
var indexController = require('./controllers/indexController');
var bookController = require('./controllers/bookController');
var orderController = require('./controllers/orderController');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var flash = require('connect-flash');
var session = require('express-session');

var app = express();

//Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//Connect flash
app.use(flash());

//Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//Bodyparser
app.use(express.urlencoded({ extended: false }));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
indexController(app);
bookController(app);
orderController(app);
mongoose.connect(
    "mongodb+srv://admin:admin@dingchencluster-ojqug.mongodb.net/test?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

// app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.use(function(req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});


app.listen(9999);

console.log('Server running at http://localhost:9999');