'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LastClockInSchema = new Schema({
    domain_id: {
        type: String,
        required: true
    },
    date_in: {
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
  
  module.exports = mongoose.model('last_clock_in', LastClockInSchema, 'last_clock_ins');