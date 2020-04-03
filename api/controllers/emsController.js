var mongoose = require('mongoose');
var Employee = mongoose.model('employee');
var Department = mongoose.model('department');
var Schedule = mongoose.model('schedule');
var Timesheet = mongoose.model('timesheet');
var Period = mongoose.model('period');

exports.getProfileDetails = async function(req,res){
    const ProfileID = req.params.id;
    await Employee.findOne({domain_id:ProfileID},"-_id")
        .populate("schedule","-_id")
        .populate("department","-_id")
        .then(function(employee){
            res.json(employee);
        }).catch(function(err){
            res.json(err);
        });
};

exports.getAllEmployees = async function(req, res){
    const domainID = req.params.domainID;

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

        if(employee.role === "Manager"){
            Employee.find({department_id:employee.department_id, domain_id:{$ne:domainID},activated: true},'-_id -password',function(err,employee){
                if(err){
                    res.send(err);
                }
                res.send(employee);
            });
        }
        
    });
};

exports.updateEmployee = async function(req, res){
    const selectedEmpID = req.params.selectedEmpID;
    const update = req.body;
    let changes = await Employee.findOneAndUpdate({domain_id: selectedEmpID}, update,{new:true});
    res.send(changes);
};

exports.addEmployee = async function(req, res){
    var new_employee = new Employee(req.body);

    await new_employee.save(function(err, employee){
        if(err){
            res.send(err);
        }
        res.json(employee);
    });
};