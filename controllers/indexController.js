module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index', { title: "后台管理" });
    });

    app.get('/index', function(req, res) {
        res.render('index', { title: "后台管理" });
    });

    app.get('/success', function(req, res) {
        res.render('success', { title: "成功" });
    });
}