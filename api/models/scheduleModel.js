'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ScheduleSchema = new Schema({
  schedule_name: {
    type: String
  },
  days_of_work: {
    type: [{
        type: String,
        enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    }]
  },
  start_time:{
      type: String
  },
  end_time: {
      type: String
  },
  activated:{
    type: Boolean,
    require: true
  }
}, 
{
  versionKey: false
});

module.exports = mongoose.model('schedule', ScheduleSchema, 'schedules');