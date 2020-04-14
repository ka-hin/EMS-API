'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TimesheetSchema = new Schema({
  domain_id: {
      type: Schema.Types.ObjectId,
      ref: 'employee',
      required: true
  },
  date_in: {
      type: String,
      required: true
  },
  time_in: {
      type: String,
      required: false
  },
  time_out: {
      type: String,
      required: false
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
 }
  
}, 
{
  versionKey: false
});

module.exports = mongoose.model('timesheet', TimesheetSchema, 'timesheets');