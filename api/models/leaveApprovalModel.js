'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var LeaveApprovalSchema = new Schema({
  date: {
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

module.exports = mongoose.model('leave_approval', LeaveApprovalSchema, 'leave_approvals');