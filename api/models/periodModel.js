'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PeriodSchema = new Schema({
  period_id: {
    type: String
  },
  date_start: {
    type: String
  },
  date_end:{
      type: String
  },
  year: {
      type: String
  }
});

module.exports = mongoose.model('period', PeriodSchema, 'periods');