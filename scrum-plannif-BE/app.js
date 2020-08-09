var express = require('express');
var path = require('path');
var logger = require('morgan');

var planifsRouter = require('./routes/planifs');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/planifs', planifsRouter);

module.exports = app;
