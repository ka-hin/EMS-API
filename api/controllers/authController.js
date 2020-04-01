var mongoose = require('mongoose');
var Employee = mongoose.model('employee');
var md5 = require('md5');

exports.getLoginDetails = async function(req,res){
    const LoginID = req.params.id;
    const pwd = req.params.pass;

    await Employee.findOne({domain_id : LoginID, password : md5(pwd), activated: true }, 'role -_id' , function(err, employee){
        if(err){
            res.send(err);
        }
        res.json(employee);
    });

};