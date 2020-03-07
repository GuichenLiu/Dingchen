var express = require('express');
var indexController = require('./controllers/indexController');
var bookController = require('./controllers/bookController');
var mongoose = require('mongoose')

var app = express();

indexController(app);
bookController(app);
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