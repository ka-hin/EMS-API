var cors = require("cors");

var corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Employee = require('./api/models/employeeModel'),
  Department = require('./api/models/departmentModel'),
  Schedule = require('./api/models/scheduleModel'),
  Timesheet = require('./api/models/timesheetModel'),
  Period = require('./api/models/periodModel'),
  bodyParser = require("body-parser");

mongoose.Promise=global.Promise;
mongoose.connect('mongodb+srv://freeuser:freeuser@cluster0-wvlrg.mongodb.net/EMS').catch(err => {
  console.log(err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());

var routes = require('./api/routes/emsRoute');
routes(app);

app.listen(port);

console.log('EMS RESTful API server started on: ' + port);