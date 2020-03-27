var mongoose = require('mongoose');
var Employee = mongoose.model('employee');
var Department = mongoose.model('department');
var Schedule = mongoose.model('schedule');
var Timesheet = mongoose.model('timesheet');
var Period = mongoose.model('period');

exports.getLoginDetails = async function(req,res){
    const LoginID = req.params.id

    await Employee.findOne({domain_id : LoginID}, 'domain_id password role activated' , function(err, employee){
        if(err)
            res.send(err);
        res.json(employee);
    });

};