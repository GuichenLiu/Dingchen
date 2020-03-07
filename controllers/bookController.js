var Book = require('../models/book')
var mongoose = require('mongoose')

module.exports = function(app) {
    app.get('/books', function(req, res) {
        Book.find({}, function(err, data) {
            if (err) {
                console.log("find book error: " + err);
            } else {
                res.render('books', { title: "图书管理", books: data });
            }
        })
    })
}