'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var EmployeeSchema = new Schema({
  domain_id: {
    type: String
  },
  name: {
    type: String
  },
  password:{
      type: String
  },
  gender: {
    type: String,
    enum : ["Male", "Female"]
  },
  address: {
    type: String
  },
  ic:{
    type: String
  },
  schedule_id:{
      type: String
  },
  department_id:{
      type: String
  },
  role:{
      type: String,
      enum: ["Admin", "Manager", "Staff"]
  },
  activated:{
      type:Boolean
  }
});

module.exports = mongoose.model('employee', EmployeeSchema, 'employees');