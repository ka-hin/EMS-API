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

async function employeeDetails(eid){
    await Employee.findOne({domain_id:eid}, function(err,employee){
        if(err)
            console.log(err);
        console.log(employee);
    });
}

async function deptDetails(dept_id){
    await Department.findOne({department_id : dept_id}, function(err,department){
        if(err)
            console.log(err);
        return department;
    });
}