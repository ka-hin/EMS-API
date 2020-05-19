'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var DepartmentSchema = new Schema({
  department_name: {
    type: String,
    required: true
  },
  department_head:{
    type: Schema.Types.ObjectId,
    ref: 'employee',
    required: false
  },
  level:{
    type: String,
    require: false
  },
  activated:{
    type: Boolean,
    require: true
  }
}, 
{
  versionKey: false
});

module.exports = mongoose.model('department', DepartmentSchema, 'departments');