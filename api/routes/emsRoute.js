module.exports = function(app){
  var ems = require('../controllers/emsController');
  var auth = require('../controllers/authController');

  app.route('/login/:id/:pass')
    .get(auth.getLoginDetails);

  app.route('/profile/:id')
    .get(ems.getProfileDetails);

  app.route('/allEmployees/:domainID')
    .get(ems.getAllEmployees);

  app.route('/updateEmployee/:selectedEmpID')
    .patch(ems.updateEmployee);

  app.route('/addEmployee')
    .post(ems.addEmployee);

  app.route('/alldepartments')
    .get(ems.getAllDepartments);

  app.route('/allschedules')
    .get(ems.getAllSchedules);
};