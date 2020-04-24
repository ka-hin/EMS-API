var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var Timesheet = mongoose.model('timesheet');
var TimesheetApproval = mongoose.model('timesheet_approval');
var Employee = mongoose.model('employee');

exports.viewTimesheet = async function(req, res){
    const domainID = req.params.domainID;
    const period = (Number(req.params.month)-1).toString();
    const year = req.params.year;

    await Timesheet.find({"domain_id": domainID, "period_number": period, "year":year})
        .sort("date_in")
        .then(function(timesheet){
            res.json(timesheet);
        }).catch(function(){
            res.status(500);
            res.send("There is a problem with the record");
        });
};

exports.availableTimesheet = async function(req, res){
    const domainID = req.params.domainID;
    
    await TimesheetApproval.find({"employee_id": domainID}, "-_id -employee_id -manager_id")
        .then(function(availableTimesheet){
            res.json(availableTimesheet); 
        }).catch(function(){
            res.status(500);
            res.send("There is a problem with the record");
        });
     
};

exports.approvalEmail = async function(req,res){
    const body = req.body;

    const domainID = body.domain_id;
    const period = body.period;
    const year = body.year;

    const timesheetapproval = await TimesheetApproval.findOne({"employee_id": domainID, "period_number": period, "year":year});

    if(timesheetapproval){
        const manager = await Employee.findOne({"domain_id": timesheetapproval.manager_id});

        const employee = await Employee.findOne({"domain_id": domainID});

        const approvalLink = `http://localhost:4200/timesheet-approval/${domainID}/${period}/${year}`;

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'consultationbookingsystem@gmail.com',
              pass: 'consultation123!'
            }
        });

        var mailOptions = {
            from: 'consultationbookingsystem@gmail.com',
            to: manager.email,
            subject: `Timesheet Approval for ${(Number(period)+1).toString()}/${year}, for ${employee.name}`,
            html: `<p>Dear ${manager.name}, </p><br/>
                    <p>Your employee, ${employee.name}, has completed his/her work for the month and his/her needs to be approved.</p>
                    <p>Kindly click on this totally safe link to be redirected to the official Hong Leong Bank Employee Management website to approve his/her timesheet. </p>
                    <p><a href=\"${approvalLink}\">Click Here</a> </p>
                    Thank you and have a nice day.`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              res.send(error);
            } else {
              res.json('Email sent: ' + info.response);
            }
          });
    }
};

exports.approveTimesheet = async function(req, res){
    var domainID = req.params.domainID;
    var period = req.params.period;
    var year = req.params.year;
    var approve = req.body;

    await TimesheetApproval.findOneAndUpdate({"employee_id": domainID, "period_number": period, "year":year}, approve, {new:true})
        .then(function(timesheetapproval){
            res.json(timesheetapproval);
        }).catch(function(){
            res.status(500);
            res.send("There is a problem with the record");
        })
};