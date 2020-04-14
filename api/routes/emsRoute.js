module.exports = function(app){
  var ems = require('../controllers/emsController');
  var auth = require('../controllers/authController');
  var clock = require('../controllers/clockController');

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

  app.route('/clock/createPeriods/:year')
    .post(clock.createPeriods);
};