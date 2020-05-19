module.exports = function(app){
  var ems = require('../controllers/emsController');
  var auth = require('../controllers/authController');
  var clock = require('../controllers/clockController');
  var timesheet = require('../controllers/timesheetController');
  var holiday = require('../controllers/holidayController');
  var leave = require('../controllers/leaveController');
  var department = require('../controllers/deptController');

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

  app.route('/employee/changePassword')
    .patch(ems.changePassword);

  //Department
  app.route('/department/createDepartment')
    .post(department.createDepartment);

  app.route('/department/editDepartment')
    .patch(department.editDepartment);
    
  //Clock In/Out

  app.route('/clock/clockIn')
    .patch(clock.clockIn);

  app.route('/clock/clockOut')
    .patch(clock.clockOut);

  app.route('/clock/checkClockInStatus/:domainID')
    .get(clock.checkClockInStatus)
  //Timesheet

  app.route('/timesheet/viewTimesheet/:domainID/:month/:year')
    .get(timesheet.viewTimesheet);

  app.route('/timesheet/availableTimesheet/:domainID')
    .get(timesheet.availableTimesheet);

  app.route('/timesheet/sendEmail')
    .post(timesheet.sendEmail);

  app.route('/timesheet/updateTimesheetStatus/:domainID/:period/:year')
    .patch(timesheet.updateTimesheetStatus);

  app.route('/timesheet/approvalStatus/:domainID')
    .get(timesheet.approvalStatus);

  app.route('/timesheet/setEditableTimesheet')
    .patch(timesheet.setEditableTimesheet);

  app.route('/timesheet/editTimesheet')
    .patch(timesheet.editTimesheet);

  //Holiday
  app.route('/holiday/saveHoliday')
    .post(holiday.saveHoliday);

  app.route('/holiday/viewAllHoliday')
    .get(holiday.viewAllHoliday);

  app.route('/holiday/updateHoliday')
    .patch(holiday.updateHoliday);

  app.route('/holiday/deleteHoliday/:id')
    .delete(holiday.deleteHoliday);

  //Leave
  app.route('/leave/calcMinLeaveDate/:domainID')
    .get(leave.calcMinLeaveDate);

  app.route('/leave/applyLeave')
    .post(leave.applyLeave);

  app.route('/leave/sendEmail')
    .post(leave.sendEmail);

  app.route('/leave/checkAvailableLeaves/:domainID/:year/:leaveType')
    .get(leave.checkAvailableLeaves);

  app.route('/leave/updateLeaveStatus')
    .patch(leave.updateLeaveStatus);
  
  app.route('/leave/viewLeave/:domainID/:dateSubmitted')
    .get(leave.viewLeave);

  app.route('/leave/getApprovedOrPendingLeaveDates/:domainID')
    .get(leave.getApprovedOrPendingLeaveDates);
};