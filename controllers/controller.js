var tress = require('../node_modules/tress/');// Простая в использовании асинхронная очередь заданий
var needle = require('../node_modules/needle/');// Самый маленький и самый красивый клиент HTTP
var cheerio = require('../node_modules/cheerio/');//jQuery для node.js
var log = require('../node_modules/cllc')();// подключение библиотеки индикации
var BashPost = require('../models/model');

var db = require('../models/mongodb');

var URL = 'http://bash.im/', //переменные нужные для парсера
    i=0,
    counter = 0;



//экспортируем из модели метод all и с его помощью выводим нформацию на экран
exports.all = function(req, res){
    BashPost.all(function(err,docs){
        if(err){
            return res.sendStatus(500);
        }
        res.send(docs);
    })
}

exports.indexPage_Pagination = function(req, res){
    db.get().collection('bash').find().count(function(err, doc){
        //set default variables
        var totalQuotes = doc,
            pageSize = 25,
            pageCount = Math.ceil(totalQuotes/25),
            currentPage = 1,
            quotes = [],
            quotesArrays = [],
            quotesListFunc,
            quotesList = [],
            from,
            to;
        
        //genreate list of quotes
        if (typeof req.query.page !== 'undefined') {
            currentPage = +req.query.page;
        }
        
        to = currentPage * pageSize;
        from = to - pageSize;

        db.get().collection('bash').find().skip(from).limit(to).toArray(function(err, docs){
            quotesList = docs;
            
            //render index.ejs view file
            res.render('index', {
                quotes: quotesList,
                pageSize: pageSize,
                totalQuotes: totalQuotes,
                pageCount: pageCount,
                currentPage: currentPage
            });
        });
    });
}

exports.count = function(req, res){
    BashPost.count(function(err, doc){
        if(err){
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    });
}

exports.findById = function(req, res){
    BashPost.findById(req.params.id, function(err, doc){
        if(err){
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    })
}

exports.startParser_mysql_info = function(req, res){
    var info = i;
    res.send(counter);
}

exports.startParser_mysql = function(req, response){
    
    //Строка сообщения о начале парсинга
    log('Начало парсинга Bash.im');
    //активируем строку индикации состояния
    log.start('Найдено страниц %s, Страниц в работе %s, Сделано записей в базе %s.');
    
    //получаем общее количество страниц
    needle.get(URL, function(err, res){
            if (err) {
                log.error('Ошибка в блоке получения количества страниц');
                throw err;
            }
            // здесь делаем парсинг страницы из res.body
                boddy = res.body.replace(new RegExp("<br>",'g'),"\r\n");
                var $ = cheerio.load(boddy);
                    i = $('input.page').attr('value').trim();
                    log.step(i);// выводим в индикацию общее количество страниц
        
                //вывод в parser_mysql.ejs
                response.render('parser_mysql', {
                    parser_url: URL,
                    totalPages: i
                });
    });
    
     // `tress` последовательно вызывает наш обработчик для каждой ссылки в очереди
    var q = tress(function(url, callback){
        
        //тут мы обрабатываем страницу с адресом url
        needle.get(url, function(err, res){
            if (err) {
                log.error('Ошибка в блоке needle');
                throw err;
            }
            // здесь делаем парсинг страницы из res.body
                boddy = res.body.replace(new RegExp("<br>",'g'),"\r\n");
                var $ = cheerio.load(boddy);
                    $('div.quote', '#body').each(function(){
                        var quote = $(this).html();
                        var $$ = cheerio.load(quote);
                        var bashPost = {
                                _id: $$('a.id').text().replace('#', "").replace('\r\n', "<br>").trim(),
                                date: $$('span.date').text().replace('\r\n', "<br>"),
                                href: $$('a.id').attr('href'),
                                text: $$('div.text').text().replace('\r\n', "<br>")
                        };

                        if(bashPost._id !== ""){
                            BashPost.createInMysql(bashPost, function(error, results){
                                log.step(0, 0, 1); // Увеличить третий счётчик на 1.
                                if(error){
                                    log.error('Ошибка записи в базу!');
                                    console.log(error);
                                }
                            })
                        }

                        //counter++;
                    });

                for(var g=0; g<5; g++){
                    if(i>=1){
                        q.push('http://bash.im/index/'+i--);
                        log.step(0, 1); // Увеличить второй счётчик на 1.
                    }
                }
            

            callback(); //вызываем callback в конце
        });
    }, 10); //запускаем 10 паралельных потоков

    // добавляем в очередь ссылку на первую страницу списка
    q.push(URL);
    
    // эта функция выполнится, когда в очереди закончатся ссылки
    q.drain = function(){
        BashPost.end(function(error, results){
            if(error){
                log.error('Ошибка остановки базы!');
                console.log(error);
            }
        });
    }
    
}

exports.startParser_mongodb = function(){

    // `tress` последовательно вызывает наш обработчик для каждой ссылки в очереди
    var q = tress(function(url, callback){

        //тут мы обрабатываем страницу с адресом url
        needle.get(url, function(err, res){
            if (err) throw err;
            // здесь делаем парсинг страницы из res.body
                boddy = res.body.replace(new RegExp("<br>",'g'),"\r\n");
                var $ = cheerio.load(boddy);
                    $('div.quote', '#body').each(function(){
                        var quote = $(this).html();

                        var $$ = cheerio.load(quote);
                        var bashPost = {
                                _id: $$('a.id').text().replace('#', "").replace('\r\n', "<br>").trim(),
                                date: $$('span.date').text().replace('\r\n', "<br>"),
                                href: $$('a.id').attr('href'),
                                text: $$('div.text').text().replace('\r\n', "<br>")
                        };

                        if(bashPost._id !== ""){
                            BashPost.create(bashPost, function(err, result){
                                if(err){
                                    console.log(err);
                                }
                            })
                        }

                        console.log(counter++);
                    });

                for(var g=0; g<5; g++){
                    if(i>=1){
                    q.push('http://bash.im/index/'+i--);
                    }
                }

            callback(); //вызываем callback в конце
        });
    }, 10); //запускаем 10 паралельных потоков

    // эта функция выполнится, когда в очереди закончатся ссылки
    q.drain = function(){
        console.log('finish!');
    }

    // добавляем в очередь ссылку на первую страницу списка
    q.push(URL);

}

exports.create = function(req, res){
    var bashPost = {
            _id: req.body._id,
            date: req.body.date,
            href: req.body.href,
            text: req.body.text
            };
    
    BashPost.create(bashPost, function(err, result){
        if(err){
            console.log(err);
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    })
}

exports.update = function (req, res){
    
    var bashPost = {date: req.body.date,href: req.body.href,text:req.body.text};
    
    BashPost.update(req.params.id, bashPost, function(err, result){
        if(err){
            console.log(err);
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    })
}

exports.delete = function(req, res){
    BashPost.delete(req.params.id, function(err, result){
        if (err){
                console.log(err);
                return res.sendStatus(500);
            }
            res.sendStatus(200);
    })
}