var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var Timesheet = mongoose.model('timesheet');
var TimesheetApproval = mongoose.model('timesheet_approval');
var Employee = mongoose.model('employee');
var clockController = require('./clockController');

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

exports.sendEmail = async function(req,res){
    const body = req.body;

    const domainID = body.domain_id;
    const period = body.period;
    const year = body.year;
    const type = body.type;
    const timesheetapproval = await TimesheetApproval.findOne({"employee_id": domainID, "period_number": period, "year":year});

    if(timesheetapproval){
        let sendTo, subject, htmlContent;
        const obj = {
            manager: await Employee.findOne({"domain_id": timesheetapproval.manager_id}),
            employee: await Employee.findOne({"domain_id": domainID}),

            approvalLink: `http://localhost:4200/timesheet-approval/${domainID}/${period}/${year}`,
            rejectLink: `http://localhost:4200/timesheet-reject/${domainID}/${period}/${year}`
        };

        const msg = {
            approvalSubject: `Timesheet Approval for ${(Number(period)+1).toString()}/${year}, for ${obj["employee"].name}`,
            rejectSubject: `Timesheet Rejected for ${(Number(period)+1).toString()}/${year}, for ${obj["employee"].name}`,

            approvalHTML: `<p>Dear ${obj["manager"].name}, </p><br/>
                            <p>Your employee, ${obj["employee"].name}, has completed his/her work for ${(Number(period)+1).toString()}/${year} and his/her needs to be approved.</p>
                            <p>Kindly click on this totally safe link to be redirected to the official Hong Leong Bank Employee Management website to approve his/her timesheet. </p>
                            <p><a href=\"${obj["approvalLink"]}\">Click Here</a> </p>
                            Thank you and have a nice day.`,
            rejectHTML: `<p>Dear ${obj["employee"].name}, </p><br/>
                            <p>Your Department Head, ${obj["manager"].name}, has rejected your Timesheet for ${(Number(period)+1).toString()}/${year} due to some mistakes in it.</p>
                            <p>Kindly click on this totally safe link to be redirected to the official Hong Leong Bank Employee Management website to make corrections to your timesheet. </p>
                            <p><a href=\"${obj["rejectLink"]}\">Click Here</a> </p>
                            Thank you and have a nice day.`
        };

        if(type == "Approval"){
            sendTo = "manager";
            subject = "approvalSubject";
            htmlContent = "approvalHTML";
        }else if(type == "Reject"){
            sendTo = "employee";
            subject = "rejectSubject";
            htmlContent = "rejectHTML";
        }else{
            res.json({type:"Not Found!"});
            return;
        }

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'consultationbookingsystem@gmail.com',
              pass: 'consultation123!'
            }
        });

        var mailOptions = {
            from: 'consultationbookingsystem@gmail.com',
            to: obj[sendTo].email,
            subject: msg[subject],
            html: msg[htmlContent]
        };

        transporter.sendMail(mailOptions, async function(error, info){
            if (error) {
                res.send(error);
            } else {
                if(type==="Approval"){
                    const d = new Date();
                    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
                    const nd = new Date(utc + (3600000*8));
                    const date = ("0" + nd.getDate()).slice(-2);
                    const month = ("0" + (nd.getMonth() + 1)).slice(-2);

                    await TimesheetApproval.findOneAndUpdate({"employee_id": domainID, "period_number": period, "year":year},{date_submitted: date+"-"+month},{new:true});
                }                
                res.json('Email sent: ' + info.response);
            }
          });
    }else{
        res.status(500);
        res.send("There is a problem with the record!");
    }
};

exports.updateTimesheetStatus = async function(req, res){
    var domainID = req.params.domainID;
    var period = req.params.period;
    var year = req.params.year;
    var update = req.body;

    await TimesheetApproval.findOneAndUpdate({"employee_id": domainID, "period_number": period, "year":year}, update, {new:true})
        .then(function(timesheetapproval){
            res.json(timesheetapproval);
        }).catch(function(){
            res.status(500);
            res.send("There is a problem with the record");
        })
};

exports.approvalStatus = async function(req, res){
    const domainID = req.params.domainID;

    const timesheetapproval = await TimesheetApproval.find({"manager_id":domainID, "employee_id":{$ne:domainID}}).lean();

    for(let i = 0; i < timesheetapproval.length; i++){
        const employee = await Employee.findOne({"domain_id":timesheetapproval[i].employee_id}, "-_id");
        
        timesheetapproval[i].employee = employee;
    }
    res.send(timesheetapproval);
};

exports.setEditableTimesheet = async function(req, res){
    const changes = req.body;
    let update = [];

    for(let i = 0; i < changes.length; i++){
        await Timesheet.findOneAndUpdate({"domain_id": changes[i].domain_id, "date_in":changes[i].date_in, "year": changes[i].year},{"edit_status":"Editable"},{new:true})
            .then(function(timesheet){
                update.push(timesheet);
            }).catch(function(){
                res.status(500);
                res.send("There is a problem with the record");
            });
    }
    res.json(update);
};

exports.editTimesheet = async function(req, res){
    const changes = req.body;
    let update = [];

    for(let i = 0; i < changes.length; i++){
        changes[i].edit_status = "Edited";

        await Timesheet.findOneAndUpdate({"domain_id": changes[i].domain_id, "date_in":changes[i].date_in, "year": changes[i].year, "edit_status":"Editable"},changes[i],{new:true})
            .then(function(timesheet){
                update.push(timesheet);
            }).catch(function(){
                res.status(500);
                res.send("There is a problem with the record");
            });

        if(update[i]!=null){
            if(changes[i].time_in){
                await clockController.calcLateHrs(changes[i].domain_id, changes[i].date_in, changes[i].time_in, changes[i].year);
            }
            let dateOut = update[i].date_out;
            if(dateOut==null){
                dateOut = changes[i].date_in;
            }
            const finalchange = await clockController.calcOTnUT(changes[i].domain_id, changes[i].date_in, dateOut, update[i].time_out, changes[i].year);

            update[i] = finalchange;
        }
    }
    res.json(update);
};