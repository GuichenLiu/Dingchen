var Order = require('../models/order');
var mongoose = require('mongoose');
var formidable = require('formidable');
//引入node-xlsx解析excel模块
var node_xlsx = require('node-xlsx');
var path = require('path');
var fs = require('fs');
var session = require('express-session');
const officegen = require('officegen');

// Create an empty Word object:
let docx = officegen('docx')

// Create an empty Excel object:
let xlsx = officegen('xlsx')

// Officegen calling this function after finishing to generate the docx document:
docx.on('finalize', function(written) {
    console.log(
        'Finish to create a Microsoft Word document.'
    )
})

// Officegen calling this function to report errors:
docx.on('error', function(err) {
    console.log(err)
})

// Officegen calling this function after finishing to generate the xlsx document:
xlsx.on('finalize', function(written) {
    console.log(
        'Finish to create a Microsoft Excel document.'
    )
})

// Officegen calling this function to report errors:
xlsx.on('error', function(err) {
    console.log(err)
})

var generateCountExcel = function(result, count) {
    let sheet1 = xlsx.makeNewSheet()
    sheet1.name = '订单详情'

    sheet1.setCell('A1', '订单Id');
    sheet1.setCell('B1', '订单编号');
    sheet1.setCell('C1', '订单货品和数量');
    sheet1.setCell('D1', '支付时间');
    sheet1.setCell('E1', '收货人');
    sheet1.setCell('F1', '收货人地址');
    sheet1.setCell('G1', '收货人电话');
    sheet1.setCell('H1', '订单金额');
    sheet1.setCell('I1', '包裹类型（1:纸书包裹; 2:kindle包裹; 3:其他衍生品包裹; 4:莫比斯耳机包裹）（若同一订单涉及多个包裹可分多条数据一次导入）');
    sheet1.setCell('J1', '物流公司（以书城后台配置的物流公司为准，可新增但需后台配置）');
    sheet1.setCell('K1', '快递单号');

    for (var i = 0; i < result.length; i++) {
        sheet1.data[i + 1] = [];
        sheet1.data[i + 1][0] = result[i].订单Id;
        sheet1.data[i + 1][1] = result[i].订单编号;
        sheet1.data[i + 1][2] = result[i].订单货品和数量;
        var time = new Date(result[i].支付时间).getTime();
        var payTime = new Date(time + 8 * 60 * 60 * 1000);
        sheet1.data[i + 1][3] = payTime.toISOString();
        sheet1.data[i + 1][4] = result[i].收货人;
        sheet1.data[i + 1][5] = result[i].收货人地址;
        sheet1.data[i + 1][6] = result[i].收货人电话;
        sheet1.data[i + 1][7] = result[i].订单金额;
        sheet1.data[i + 1][8] = '纸书包裹';
        sheet1.data[i + 1][9] = '圆通速递';
        sheet1.data[i + 1][10] = result[i].快递单号[0];
    }

    let sheet2 = xlsx.makeNewSheet()
    sheet2.name = '统计数据'

    var name = [];
    var num = [];
    for (var property in count) {
        name.push(property);
        num.push(count[property]);
    }
    for (var i = 0; i < name.length; i++) {
        sheet2.data[i] = [];
        sheet2.data[i][0] = name[i];
        sheet2.data[i][1] = num[i];
    }
    // Let's generate the Excel document into a file:

    let out = fs.createWriteStream('统计.xlsx')

    out.on('error', function(err) {
        console.log(err)
    })

    // Async call to generate the output file:
    xlsx.generate(out)
}

var ExcelParse = function(newPath, company, errors) {
    console.log('开始解析图书excel');
    var obj = node_xlsx.parse(newPath);
    var excelObj = obj[0].data; //取得第一个excel表的数据
    // console.log("excelObj:" + excelObj);
    console.log("excelObj.length:" + excelObj.length);

    //定义order实体类数组
    var orderArray = new Array('订单Id', '订单编号', '订单货品和数量', '支付时间', '收货人', '收货人地址', '收货人电话', '订单金额', '快递单号', '_id', '公司', '状态');

    //循环遍历表每一行的数据
    for (var i = 1; i < excelObj.length; i++) {
        var rdata = excelObj[i];
        if (rdata.length == 0) {
            console.log('第' + i + '行数据为空行');
            errors.push({ msg: '第' + i + '行数据为空行,但不影响上传' })
            continue;
        } else {
            //将每一行的数据存进数据库中
            var names = rdata[2].split("|");
            for (var j = 0; j < names.length; j++) {
                var order = new Order();
                order.set(orderArray[0], rdata[0]);
                order.set(orderArray[1], rdata[1]);
                order.set(orderArray[2], names[j]);
                order.set(orderArray[3], new Date(rdata[3]));
                for (var k = 4; k < 8; k++) {
                    order.set(orderArray[k], rdata[k]);
                }
                order.set(orderArray[8], [rdata[8]]);
                order.set(orderArray[9], new mongoose.Types.ObjectId());
                order.set(orderArray[10], company);
                order.set(orderArray[11], "已发货");
                order.save(function(err) {
                    if (err) {
                        console.log("第" + i + "行订单第" + j + "个信息出现错误！");
                        errors.push({ msg: '第' + i + '行数据内容有误' });
                        console.log(err);
                    }
                });
            }
        }
    }
    return errors;
};

var findOne = function(queryStr, errors) {
    Order.find(queryStr, function(err, data) {
        if (err) {
            errors.push({ msg: '未找到数据,请重新输入' });
            console.log(err);
        } else {
            // Create a new paragraph:
            let pObj = docx.createP();

            for (var i = 0; i < data.length; i++) {
                pObj = docx.createP();
                pObj.addText('书名:');
                pObj.addText(data[i].订单货品和数量.split(",")[0]);
                pObj.addLineBreak();
                pObj.addText('订单Id:');
                pObj.addText(data[i].订单Id);
                pObj.addLineBreak();
                pObj.addText('订单编号:');
                pObj.addText(data[i].订单编号);
                pObj.addLineBreak();
                pObj.addText('快递单号:');
                pObj.addText(data[i].快递单号[0]);
                pObj.addLineBreak();
                pObj.addText('收货信息:');
                pObj.addText(data[i].收货人地址 + ', ' + data[i].收货人 + ', ' + data[i].收货人电话);
                pObj.addLineBreak();
                pObj.addText('订单日期:');
                pObj.addText(data[i].支付时间.toString());
                pObj.addLineBreak();
                pObj.addText('原因:');
                pObj.addLineBreak();
                pObj.addText('反馈:');
                pObj.addLineBreak();
            }


            // Let's generate the Word document into a file:

            let out = fs.createWriteStream('售后服务集.docx')

            out.on('error', function(err) {
                console.log(err)
            })

            // Async call to generate the output file:
            docx.generate(out)
        }
    })
    return errors;
}

module.exports = function(app) {
    app.get('/orders', function(req, res) {
        Order.find({}, function(err, data) {
            if (err) {
                console.log("find order error: " + err);
            } else {
                res.render('orders', { title: "订单管理", orders: data });
            }
        }).limit(10);
    });

    app.get('/upload', function(req, res) {
        res.render('upload', { title: "上传文件" });
    });

    app.get('/update', function(req, res) {
        res.render('update', { title: "更新文件" });
    });

    app.get('/test', function(req, res) {
        res.render('test', { title: "测试" });
    });

    app.get('/query', function(req, res) {
        let errors = [];
        if (!req.query.sdate || !req.query.edate || !req.query.company) {
            errors.push({ msg: '未填满所有项' });
        } else if (req.query.sdate && req.query.edate && req.query.company) {
            if ((req.query.sdate > req.query.edate)) {
                errors.push({ msg: '开始日期应在结束日期前' });
            } else {
                var stime = new Date(req.query.sdate).getTime();
                var startdate = new Date(stime + 1 - 8 * 3600 * 1000);
                var etime = new Date(req.query.edate).getTime();
                var enddate = new Date(etime + 24 * 3600 * 1000 - 1 - 8 * 3600 * 1000);
                var company = req.query.company;
                var querystr = { '公司': company, '支付时间': { $gte: startdate, $lte: enddate } };
                var result = [];
                var books = [];
                var count = {};
                console.log('开始查询');
                Order.find(querystr, function(err, data) {
                    console.log('共' + data.length + '行结果');
                    if (err) {
                        console.log('查找订单出错:' + err);
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            result.push(data[i]);
                            books.push(data[i].订单货品和数量);
                        }
                        for (var j = 0; j < books.length; j++) {
                            if (typeof(count[books[j]]) === "undefined") {
                                count[books[j]] = 1;
                            } else {
                                count[books[j]]++;
                            }
                        }
                        generateCountExcel(result, count);
                    }
                })
                req.flash('success_msg', '正在生成Excel，请稍后...');
            }
        }
        if (errors.length > 0) {
            res.render('query', { title: '查询', errors: errors });
        } else {
            res.render('query', { title: "查询" });
        }
    });

    app.post('/upload', function(req, res) {
        var errors = [];
        var form = new formidable.IncomingForm();
        form.encoding = 'utf-8';
        form.uploadDir = path.join(__dirname, "../public/upload");
        form.keepExtensions = true; //保留后缀
        form.maxFieldsSize = 200 * 1024 * 1024;
        form.parse(req, function(err, fields, files) {
            if (err) {
                console.log('源数据excel上传错误!');
                errors.push({ msg: '需要上传excel文件' });
                return;
            }

            var filename = files.report.name;
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
            if (filename.indexOf("顶辰") != -1) {
                console.log('上传顶辰数据中');
                errors = ExcelParse(newPath, "顶辰", errors);
            } else if (filename.indexOf("灵科") != -1) {
                console.log('上传灵科数据中');
                errors = ExcelParse(newPath, "灵科", errors);
            } else {
                errors.push({ msg: '文件名称需要包含灵科或顶辰' });
            }
            console.log('解析结束');
            if (errors.length != 0) {
                res.render('upload', { title: '上传文件', errors: errors });
            } else {
                req.flash('success_msg', '上传成功');
                res.redirect('upload');
            }
        })
    });

    app.get('/word', function(req, res) {
        let errors = [];
        let queryStr = "";
        if (!req.query.order && !req.query.name) {
            errors.push({ msg: '请填入至少一项' });
        } else if (req.query.order && !req.query.name) {
            queryStr = { "订单Id": req.query.order };
            errors = findOne(queryStr, errors);
        } else if (!req.query.order && !req.query.name) {
            queryStr = { "收货人": req.query.name };
            errors = findOne(queryStr, errors);
        } else if (req.query.name && req.query.order) {
            queryStr = { "订单Id": req.query.order, "收货人": req.query.name };
            errors = findOne(queryStr, errors);
        }
        if (errors.length != 0) {
            res.render('word', { title: "生成word", errors: errors });
        } else {
            req.flash('success_msg', '生成word中，请稍后...');
            res.redirect('word');
        }

    });
}