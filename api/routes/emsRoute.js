module.exports = function(app){
  var ems = require('../controllers/emsController');
  var auth = require('../controllers/authController');
  var clock = require('../controllers/clockController');
  var timesheet = require('../controllers/timesheetController');

  app.route('/login/:id/:pass')
    .get(auth.getLoginDetails);

  app.route('/profile/:id')
    .get(ems.getProfileDetails);

  app.route('/employee/allEmployees/:domainID')
    .get(ems.getAllEmployees);

  app.route('/employee/updateEmployee/:selectedEmpID')
    .patch(ems.updateEmployee);

  app.route('/employee/checkduplicate/:key')
    .get(ems.checkDuplicate);

  app.route('/employee/addEmployee')
    .post(ems.addEmployee);

  app.route('/department/alldepartments')
    .get(ems.getAllDepartments);

  app.route('/schedule/allschedules')
    .get(ems.getAllSchedules);

  //Clock In/Out

  app.route('/clock/clockIn/:domainID/:dateIn/:timeIn/:year')
    .get(clock.clockIn);

  app.route('/clock/clockOut/:domainID/:dateIn/:dateOut/:timeOut/:year')
    .get(clock.clockOut);

  //Timesheet

  app.route('/timesheet/viewTimesheet/:domainID/:month/:year')
    .get(timesheet.viewTimesheet);

  app.route('/timesheet/availableTimesheet/:domainID')
    .get(timesheet.availableTimesheet);

  app.route('/timesheet/approvalEmail/:domainID/:period/:year')
    .get(timesheet.approvalEmail);

  app.route('/timesheet/approveTimesheet/:domainID/:period/:year')
    .patch(timesheet.approveTimesheet);
};