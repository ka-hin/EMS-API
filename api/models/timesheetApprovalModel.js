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
  is_approved: {
      type: Boolean,
      required: true
  },
  employee_id: {
      type: Schema.Types.ObjectId,
      ref: "employee",
      required: true
  },
  manager_id: {
      type: Schema.Types.ObjectId,
      ref: "employee",
      required: true
  }
});

module.exports = mongoose.model('timesheet_approval', TimesheetApprovalSchema, 'timesheet_approvals');