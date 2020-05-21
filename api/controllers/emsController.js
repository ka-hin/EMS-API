var mongoose = require('mongoose');
var Employee = mongoose.model('employee');
var Department = mongoose.model('department');
var Schedule = mongoose.model('schedule');
var TimesheetApproval = mongoose.model('timesheet_approval');
var md5 = require('md5');
var nodemailer = require('nodemailer');

exports.getProfileDetails = async function(req,res){
    const ProfileID = req.params.id;
    await Employee.findOne({domain_id:ProfileID},"-_id")
        .populate("schedule")
        .populate({path: "department", populate: {path:"department_head", select:"domain_id name"}})
        .then(function(employee){
            res.json(employee);
        }).catch(function(){
            res.status(500);
            res.send('There is a problem with the record');
        });
};

exports.getAllEmployees = async function(req, res){
    const domainID = req.params.domainID;

    await Employee.findOne({domain_id:domainID}, function(err, employee){
        if(err){
            res.status(500);
            res.send('There is a problem with the record');
        }

        if(employee.role === "Admin"){
            Employee.find({domain_id:{$ne:domainID}}, "-password")
            .populate("schedule","-_id schedule_name")
            .populate("department","-_id department_name")
            .then(function(employee){
                res.json(employee);
            }).catch(function(){
                res.status(500);
                res.send('There is a problem with the record');
            });
        }

        if(employee.role === "Manager"){
            Employee.find({department:employee.department, domain_id:{$ne:domainID},activated: true},'-password')
            .populate("schedule","-_id schedule_name")
            .populate("department","-_id department_name")
            .lean()
            .then(async function(employee){
                for(let i = 0; i < employee.length; i ++){
                    const timesheetapproval = await TimesheetApproval.find({employee_id: employee[i].domain_id}, "-_id -manager_id -employee_id");
                    employee[i].timesheet_approval = timesheetapproval;
                }

                res.json(employee);
            }).catch(function(){
                res.status(500);
                res.send('There is a problem with the record');
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
    }).catch(function(){
        res.status(500);
        res.send('There is a problem with the record');
    });
};

exports.addEmployee = async function(req, res){
    emp_Obj = req.body;
    var pwd = emp_Obj.name.split(" ");
    pwd = pwd[pwd.length - 1];

    let date_ob = new Date();

    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    
    pwd = pwd + date + month + year;

    emp_Obj["password"] = md5(pwd);
    emp_Obj["activated"] = true;

    var new_employee = new Employee(emp_Obj);

    await new_employee.save(function(err, employee){
        if(err){
            res.status(500);
            res.send('There is a problem with the record');
        }
        res.json(employee);
    });
};

exports.changePassword = async function(req, res){
    const domainID = req.body.domain_id;
    const password = req.body.password;
    const newpass = req.body.newpass;
    const connewpass = req.body.connewpass;

    const oldpass = await Employee.findOne({domain_id: domainID}, "password");
    if(oldpass.password!= md5(password)){
        res.json({error:"Incorrect Old Password!"});
        return;
    }

    if(newpass.length<8 || newpass.length>20){
        res.json({error:"New password must be between 8 to 20 characters"});
        return;
    }

    if(newpass!= connewpass){
        res.json({error:"New password must be the same as confirm new password!"});
        return;
    }

    if(md5(newpass) === oldpass.password){
        res.json({error:"New password cannot be the same as old password!"});
        return;
    }

    await Employee.findOneAndUpdate({domain_id: domainID},{password:md5(newpass)},{new:true})
        .then(function(employee){
            const d = new Date();
            const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            const nd = new Date(utc + (3600000*8));
            const date = ("0" + nd.getDate()).slice(-2)+'-'+("0" + (nd.getMonth() + 1)).slice(-2)+'-'+nd.getFullYear();

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'consultationbookingsystem@gmail.com',
                  pass: 'consultation123!'
                }
            });
    
            var mailOptions = {
                from: 'consultationbookingsystem@gmail.com',
                to: employee.email,
                subject: "Successfully Changed Password",
                html: `<p>Dear ${employee.name}, </p><br/>
                <p>You have succesfully changed your password on ${date} for the HLB Employee Management System.</p>
                Thank you and have a nice day.`
            };

            transporter.sendMail(mailOptions, async function(error, info){
                if (error) {
                    res.send(error);
                } else {           
                    res.json({success:"Password changed successfully"});
                }
              });
        }).catch(function(){
            res.status(500);
            res.send("There is a problem with the record");
        });
};

exports.getAllDepartments = async function(req, res){
    await Department.find({}).populate('department_head', 'name').then(function(department){
        res.json(department);
    }).catch(function(){
        res.status(500);
        res.send('There is a problem with the record');
    });
};

exports.getAllSchedules = async function(req, res){
    await Schedule.find({}).then(function(schedule){
        res.json(schedule);
    }).catch(function(){
        res.status(500);
        res.send('There is a problem with the record');
    });
};