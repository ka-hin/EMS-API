'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var NotificationSchema = new Schema({
  domain_id: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  year:{
      type: String,
      required: true
  },
  time:{
      type: String,
      required: true
  },
  content: {
      type: String,
      required: true
  },
  link: {
      type: String,
      required: true
  },
  seen: {
      type: Boolean,
      required: true
  }
}, 
{
  versionKey: false
});

module.exports = mongoose.model('notification', NotificationSchema, 'notifications');