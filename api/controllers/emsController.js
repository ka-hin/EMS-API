var mongoose = require('mongoose');
var Employee = mongoose.model('employee');
var Department = mongoose.model('department');
var Schedule = mongoose.model('schedule');

exports.getProfileDetails = async function(req,res){
    const ProfileID = req.params.id;
    await Employee.findOne({domain_id:ProfileID},"-_id")
        .populate("schedule","-_id")
        .populate({path: "department",select: "-_id", populate: {path:"department_head", select:"name"}})
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
            Employee.find({domain_id:{$ne:domainID}}, "-_id -password")
            .populate("schedule","-_id schedule_name")
            .populate("department","-_id department_name")
            .then(function(employee){
                res.json(employee);
            }).catch(function(err){
                res.json(err);
            });
        }

        if(employee.role === "Manager"){
            Employee.find({department:employee.department, domain_id:{$ne:domainID},activated: true},'-_id -password')
            .populate("schedule","-_id schedule_name")
            .populate("department","-_id department_name")
            .then(function(employee){
                res.json(employee);
            }).catch(function(err){
                res.json(err);
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

exports.checkDuplicate = async function(req, res){
    const dupKey = req.params.key;

    await Employee.findOne({$or:[{domain_id: dupKey},{email: dupKey},{ic: dupKey}]}, "-_id domain_id email ic")
    .then(function(employee){
        res.json(employee);
    }).catch(function(err){
        res.json(err);
    });
};

exports.addEmployee = async function(req, res){
    emp_Obj = req.body;
    emp_Obj["password"] = "6ad14ba9986e3615423dfca256d04e3f";
    emp_Obj["activated"] = true;

    var new_employee = new Employee(emp_Obj);

    await new_employee.save(function(err, employee){
        if(err){
            res.send(err);
        }
        res.json(employee);
    });
};

exports.getAllDepartments = async function(req, res){
    await Department.find({}).populate('department_head', 'name').then(function(department){
        res.json(department);
    }).catch(function(err){
        res.json(err);
    });
};

exports.getAllSchedules = async function(req, res){
    await Schedule.find({}).then(function(schedule){
        res.json(schedule);
    }).catch(function(err){
        res.json(err);
    });
};