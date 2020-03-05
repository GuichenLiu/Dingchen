var express = require('express');

var app = express();

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


app.listen(8888);

console.log('Server running at http://localhost:8888');