module.exports = function(app){
  var ems = require('../controllers/emsController');
  var auth = require('../controllers/authController');

  app.route('/login/:id/:pass')
    .get(auth.getLoginDetails);

  app.route('/profile/:id')
    .get(ems.getProfileDetails);

  app.route('/allemployees/:id')
    .get(ems.getAllEmployees);
};