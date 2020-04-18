var Book = require('../models/book');
var mongoose = require('mongoose');
var formidable = require('formidable');
//引入node-xlsx解析excel模块
var node_xlsx = require('node-xlsx');
var path = require('path');
var fs = require('fs');
var session = require('express-session');

var ExcelParse = function(newPath, company) {
    console.log('开始解析图书excel');
    var obj = node_xlsx.parse(newPath);
    var excelObj = obj[0].data; //取得第一个excel表的数据
    // console.log("excelObj:" + excelObj);
    console.log("excelObj.length:" + excelObj.length);
    //统计订单数量
    var num = 0;

    //定义book实体类数组
    var bookArray = new Array('书名', '公司', '码洋', '菁韵价', '书卡价', '销售价', '_id');

    //循环遍历表每一行的数据
    for (var i = 1; i < excelObj.length; i++) {
        var rdata = excelObj[i];

        //将每一行的数据存进数据库中
        var book = new Book();
        for (var j = 0; j < rdata.length; j++) {
            book.set(bookArray[j], rdata[j]);
        }
        book.save(function(err) {
            num++;
            if (err) {
                console.log("第" + num + "个图书信息出现错误！");
                // console.log(err);
                res.flash('success_msg', '成功上传' + rdata.length + '本图书.');
            }
        });

    }
};

module.exports = function(app) {
    app.get('/books', function(req, res) {
        Book.find({}, function(err, data) {
            if (err) {
                console.log("find book error: " + err);
            } else {
                res.render('books', { title: "图书管理", books: data });
            }
        })
    });

    app.post('/books', function(req, res) {
        // let errors = [];
        if (req.body.createBook) {
            console.log("creating book...");
            var name = req.body.name;
            Book.find({ "书名": name }, function(err, data) {
                if (data != []) {
                    console.log(name + "already existed.");
                    req.flash('error_msg', '该书已存在.');
                    res.redirect('books');
                }
            });
            var company = req.body.company;
            var jyPrice = req.body.jPrice;
            var cardPrice = 0;
            if (req.body.cPrice) {
                cardPrice = req.body.cPrice;
            }
            var fixedPrice = req.body.fPrice;
            var sellPrice = req.body.sPrice;
            var book = new Book({
                "_id": new mongoose.Types.ObjectId(),
                "书名": name,
                "公司": company,
                "菁韵价": jyPrice,
                "书卡价": cardPrice,
                "码洋": fixedPrice,
                "销售价": sellPrice
            })
            book.save(function(err, post) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log(name + "was inserted to book db.");
                    req.flash('success_msg', '成功新建图书.');
                }
            })
            res.redirect('books');
        } else if (req.body.books) {
            var form = new formidable.IncomingForm();
            form.encoding = 'utf-8';
            form.uploadDir = path.join(__dirname, "../public/upload");
            form.keepExtensions = true; //保留后缀
            form.maxFieldsSize = 200 * 1024 * 1024;
            form.parse(req, function(err, fields, files) {
                if (err) {
                    console.log('图书excel上传错误!');
                    return;
                }

                var filename = files.uploadBooks.name;
                // 对文件名进行处理，以应对上传同名文件的情况
                var nameArray = filename.split('.');
                var type = nameArray[nameArray.length - 1];
                var name = '';
                for (var i = 0; i < nameArray.length - 1; i++) {
                    name = name + nameArray[i];
                }
                var date = new Date();
                var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes();
                var avatarName = name + time + '.' + type;
                var newPath = form.uploadDir + avatarName;
                fs.renameSync(files.report.path, newPath); //重命名
                console.log('重命名成功！');
                ExcelParse(newPath);
                console.log('解析结束');
                res.redirect('books');
            })
        }
    });
}