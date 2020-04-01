var mongoose = require('mongoose');
var Employee = mongoose.model('employee');
var Department = mongoose.model('department');
var Schedule = mongoose.model('schedule');
var Timesheet = mongoose.model('timesheet');
var Period = mongoose.model('period');

exports.getProfileDetails = async function(req,res){
    const ProfileID = req.params.id;
    var scheduleID;
    var departmentID;
    var profile;
    
    await Employee.findOne({domain_id:ProfileID},'-_id', function(err,employee){
        if(err)
            res.send(err);
        scheduleID = employee.schedule_id;
        departmentID = employee.department_id;
        profile = employee;
        Schedule.findOne({schedule_id : scheduleID},'-_id', function(err,schedule){
            if(err)
                res.send(err);
            profile.schedule_id = schedule;
            Department.findOne({department_id: departmentID},'-_id', function(err, department){
                if(err)
                    res.send(err);
                profile.department_id = department;
                res.send(profile);
            });
        });
    });
};

exports.getAllEmployees = async function(req, res){
    const domainID = req.params.id;

    await Employee.findOne({domain_id:domainID}, function(err, employee){
        if(err){
            res.send(err);
        }

        if(employee.role === "Admin"){
            Employee.find({domain_id:{$ne:domainID}}, "-_id domain_id name role department_id activated",function(err,employee){
                if(err){
                    res.send(err);
                }
                res.send(employee);
            });
        }

        
        
    });
};