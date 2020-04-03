'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var DepartmentSchema = new Schema({
  department_name: {
    type: String
  },
  department_head:{
    type: String
  },
  level:{
    type: String
  }
});

module.exports = mongoose.model('department', DepartmentSchema, 'departments');