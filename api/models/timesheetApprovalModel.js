'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TimesheetApprovalSchema = new Schema({
  period_number: {
    type: String,
    required: true
  },
  year: {
      type: String,
      required: true
  },
  approval_status: {
      type: String,
      required: true,
      default: "Pending"
  },
  date_submitted:{
      type: String,
      required:false
  },
  employee_id: {
      type: String,
      required: true
  },
  manager_id: {
      type: String,
      required: true
  }
}, 
{
  versionKey: false
});

module.exports = mongoose.model('timesheet_approval', TimesheetApprovalSchema, 'timesheet_approvals');