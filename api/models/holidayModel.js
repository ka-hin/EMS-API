'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HolidaySchema = new Schema({
    holiday_name: {
        type: String,
        required: true
    },
    holiday_type: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    year: {
      type: String,
      required: true
    }
    
  }, 
  {
    versionKey: false
  });
  
  module.exports = mongoose.model('holiday', HolidaySchema, 'holidays');