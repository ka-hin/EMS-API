'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TimesheetSchema = new Schema({
  domain_id: {
      type: String,
      required: true
  },
  date_in: {
      type: String,
      required: true
  },
  time_in: {
      type: String,
      required: true
  },
  time_out: {
      type: String,
      required: true
  },
  date_out: {
    type: String,
    required: false
  },
  period_number: {
      type: String,
      required: true
  },
  year: {
    type: String,
    required: true
  },
  ot: {
    type: Number,
    required: true
  },
  ut: {
    type: Number,
    required: true
  },
  late: {
    type: Number,
    required: true
  },
  remarks: {
    type: String,
    required: false
  },
  edit_status: {
    type: String,
    required: false
  }
  
}, 
{
  versionKey: false
});

module.exports = mongoose.model('timesheet', TimesheetSchema, 'timesheets');