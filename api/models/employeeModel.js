'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var EmployeeSchema = new Schema({
  domain_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password:{
      type: String,
      required: true
  },
  gender: {
    type: String,
    enum : ["Male", "Female"],
    required: true
  },
  address: {
    type: String,
    required: false
  },
  ic:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  schedule:{
      type: Schema.Types.ObjectId,
      ref: 'schedule',
      required: true
  },
  department:{
      type: Schema.Types.ObjectId,
      ref: 'department',
      required: true
  },
  role:{
      type: String,
      enum: ["Admin", "Manager", "Staff"]
  },
  activated:{
      type:Boolean,
      required: true
  },
  annual_leave:{
      type: Number,
      required: true 
  },
  medical_leave:{
      type: Number,
      required: true
  }
}, 
{
  versionKey: false
});

module.exports = mongoose.model('employee', EmployeeSchema, 'employees');