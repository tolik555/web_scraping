//1.Устанавливаем nvm(нод весия менеджер) с репозитория на гите
// 2. nvm install node Установит последнюю актуальную версию нода в свою папку
//   и активирует ее для работы с ней
//   2.1 nvm list - покажет все установленные версии нода.
//   2.2 nvm use 7.2.0 выбрать конкретную версию для работы
// 3. npm init - соберет новый проэкт
// 4. npm install express --save - установит фреймворк expres
//      подключаем зависимости
// 5. создаем файл серверра server.js


var express = require('express'); // подключение фреймворка express
var bodyParser = require('body-parser');//подключение библиотеки получения пост
var tress = require('tress');// Простая в использовании асинхронная очередь заданий
var needle = require('needle');// Самый маленький и самый красивый клиент HTTP
var cheerio = require('cheerio');//jQuery для node.js

var db = require('./models/mongodb');
var bashController = require('./controllers/controller');

var app = express(); // создание экземпляра приложения

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', 'views'); // указываем на папку с шаблонами для ejs
app.engine('html', require('ejs').renderFile);  // подключаем ejs
app.set('view engine', 'ejs');

// подсчет цитат в базе mongo
app.get('/ololo', bashController.count);

// вывод на главную пагинации с цитатами
app.get('/', bashController.indexPage_Pagination);

//распарсить bash
app.get('/start_parser_mongodb', bashController.startParser_mongodb);
app.get('/start_parser_mysql', bashController.startParser_mysql);

// получение всех исполнителеей из базы
app.get('/posts', bashController.all);

// получение информации из базы  по id
app.get('/post/:id', bashController.findById);

// Встка в базу данных с автоматическим получение id
app.post('/posts', bashController.create);

// Изменение данных в базе по id
app.put('/posts/:id', bashController.update);

// удаление из базы по id
app.delete('/posts/:id', bashController.delete);

// подключение к базе данных монго и запуск сервера, прослушивания портов
db.connect('mongodb://localhost:27017/bash', function(err){
    if(err){
        return console.log(err);
    }
    
//при запуске server.js выдаст сообщение и начнет прослушку порта 3000
var server = app.listen(3000, function(){
        console.log('Listening on port %d', server.address().port);
    });
})