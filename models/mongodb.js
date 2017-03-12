// Подключение монго клиента базы данных
var MongoClient = require('mongodb').MongoClient;

// в этой переменной будут храниться все данные необходимые для работы с бвзой данных
var state = {
  // ссылка на нашу базу данных
  db: null  
};

//метод который будем использовать как db.conntct
// позволяет при вызове неделать новый конект, а возвращать уже существующий конект
exports.connect = function(url, done) {
    
    // проверяем наличие соединения
    if(state.db){
        return done();
    }
    
    //Соединение с базой данных
    MongoClient.connect(url, function(err, db) {
        if(err){
            return done(err);
        }
        state.db = db;
        done();
    })
}

// при вызове метода get мы получим в ответ ссылку на соединение с базой данных
exports.get = function() {
    return state.db;
}