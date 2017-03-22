var ObjectID = require('mongodb').ObjectID;
var db = require('../models/mongodb');
var mysqldb = require('./mysqldb');


exports.all = function (cb){
    db.get().collection('bash').find().toArray(function(err, docs){
        cb(err, docs);
    })
}

exports.count = function(cb){
    db.get().collection('bash').find().count(function(err, doc){
        cb(err,doc);
    })
}

exports.findById = function(id, cb){
    db.get().collection('bash').findOne({ _id: id }, function(err, doc){
        cb(err, doc);
    })
}

exports.startParser = function(bashPost, cb){
    db.get().collection('bash').insert(bashPost, function(err, result){
        cb(err, result);
    })
}

exports.create = function(bashPost, cb){
    db.get().collection('bash').insert(bashPost, function(err, result){
        cb(err, result);
    })
}

exports.createInMysql = function(bashPost, cb){
        mysqldb.connection.query('INSERT INTO `bash` SET ?', bashPost, function (error, results, fields) {
          cb(error, results);
        });
}

exports.end = function(cb){
    mysqldb.connection.end(function(error, results){
        cb(error,results);
    });
}

exports.update = function(id, newData, cb){
    db.get().collection('bash').updateOne({ _id: id}, newData, function(err, result){
        cb(err, result);
    })
}

exports.delete = function(id, cb){
    db.get().collection('bash').deleteOne(
        { _id: id },
        function(err, result) {
            cb(err, result);
        })
}