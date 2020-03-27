module.exports = function(app){
  var ems = require('../controllers/emsController');

  app.route('/login/:id/:pass')
    .get(ems.getLoginDetails);
};