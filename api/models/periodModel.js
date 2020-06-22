'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PeriodSchema = new Schema({
  period_number: {
    type: String,
    required: true
  },
  date_start: {
    type: String,
    required: true
  },
  date_end:{
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

module.exports = mongoose.model('period', PeriodSchema, 'periods');