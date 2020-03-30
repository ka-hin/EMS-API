'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TimesheetSchema = new Schema({
  date_in: {
    type: String
  },
  date_out: {
      type: String
  },
  time_in: {
      type: String
  },
  time_out: {
      type: String
  },
  period_id: {
      type: String
  },
  domain_id: {
      type: String
  }
});

module.exports = mongoose.model('timesheet', TimesheetSchema, 'timesheets');