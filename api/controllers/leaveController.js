var mongoose = require('mongoose');
var Employee = mongoose.model('employee');
var LeaveApproval = mongoose.model('leave_approval');
var Holiday = mongoose.model('holiday');
var Timesheet = mongoose.model('timesheet');
var nodemailer = require('nodemailer');

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

exports.calcMinLeaveDate = async function(req,res){
    const domainID = req.params.domainID;
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    let minLeaveDate = new Date(utc + (3600000*8));
    
    let counter = 30;
    const currdate = ("0" + minLeaveDate.getDate()).slice(-2) + ("0" + (minLeaveDate.getMonth() + 1)).slice(-2) + minLeaveDate.getFullYear();

    let weekday = new Array(7);
    weekday["Sunday"] = 0;
    weekday["Monday"] = 1;
    weekday["Tuesday"] = 2;
    weekday["Wednesday"] = 3;
    weekday["Thursday"] = 4;
    weekday["Friday"] = 5;
    weekday["Saturday"] = 6;

    const employee = await Employee.findOne({domain_id:domainID},"-_id").populate("schedule","-_id");
    const holiday = await Holiday.find({holiday_type:"Non-Working"});
    
    if(employee){
        while(counter>0){
            let isWorkingDay = false;
            minLeaveDate = minLeaveDate.addDays(1);

            for(let i = 0; i < employee.schedule.days_of_work.length;i++){
                if(minLeaveDate.getDay() === weekday[employee.schedule.days_of_work[i]]){
                    isWorkingDay = true;
                }
            }

            for(let i = 0; i < holiday.length;i++){
                let day = Number(holiday[i].date.substr(0,2));
                let month = Number(holiday[i].date.substr(3,2))-1;
                let year = Number(holiday[i].year);

                if(minLeaveDate.getDate()===day && minLeaveDate.getMonth()===month && minLeaveDate.getFullYear()===year){
                    isWorkingDay = false;
                }
            }
            
            if(isWorkingDay === true){
                counter--;
            }
        }
        res.json(("0" + minLeaveDate.getDate()).slice(-2) +'-'+ ("0" + (minLeaveDate.getMonth() + 1)).slice(-2) +'-'+ minLeaveDate.getFullYear());
    }else{
        res.send("Employee not found");
    }
    
};

exports.applyLeave = async function(req, res){
    const leaveObjArr = req.body;
    let saved = [];

    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nd = new Date(utc + (3600000*8));
    const dateSubmitted = nd.getFullYear()+("0" + (nd.getMonth() + 1)).slice(-2)+("0" + nd.getDate()).slice(-2)+("0" + nd.getHours()).slice(-2)+("0" + nd.getMinutes()).slice(-2)+("0" + nd.getSeconds()).slice(-2);

    for(let i = 0 ; i < leaveObjArr.length; i++){
        const domainID = leaveObjArr[i].domain_id;
        const leaveType = leaveObjArr[i].leave_type;
        const date = leaveObjArr[i].date;
        const year = leaveObjArr[i].year;

        const employee = await Employee.findOne({domain_id: domainID})
            .populate({path: "department", populate: {path:"department_head", select:"domain_id"}});

        let ApprovalStatus = "Pending";
        if(domainID===employee.department.department_head.domain_id){
            ApprovalStatus = "Approved";
        }

        const leaveapproval = await LeaveApproval.findOne({employee_id: domainID, date: date, year: year});
        if(!leaveapproval){
            const leaveApprovalObj = {
                "leave_type" : leaveType,
                "date": date,
                "year": year,
                "approval_status": ApprovalStatus,
                "employee_id": domainID,
                "manager_id":employee.department.department_head.domain_id,
                "date_submitted": dateSubmitted
            };
            const new_leaveApproval = new LeaveApproval(leaveApprovalObj);
            await new_leaveApproval.save()
                .then(function(newleaveapproval){
                    saved.push(newleaveapproval);
                }).catch(function(){
                    res.status(500);
                    res.send("There is a problem with the record");
                })
        }
    }
    res.json(saved);
};

exports.sendEmail = async function(req, res){
    const body = req.body;

    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nd = new Date(utc + (3600000*8));
    const dateSubmitted = ("0" + nd.getDate()).slice(-2)+'-'+("0" + (nd.getMonth() + 1)).slice(-2);

    const domainID = body.domain_id;
    const date = body.date;
    const year = body.year;
    const type = body.type;
    const leaveapproval = await LeaveApproval.findOne({"employee_id": domainID, "date": date, "year":year});

    if(leaveapproval){
        let sendTo, subject, htmlContent;
        const obj = {
            manager: await Employee.findOne({"domain_id": leaveapproval.manager_id}),
            employee: await Employee.findOne({"domain_id": domainID}),

            approvalLink: `http://localhost:4200/leave-approval/${domainID}/${dateSubmitted}/${year}`
        };

        const msg = {
            approvalSubject: `Leave Approval for ${date}-${year}, for ${obj["employee"].name}`,
            rejectSubject: `Leave Rejected for ${date}-${year}, for ${obj["employee"].name}`,
            approvedSubject: `Leave Approved for ${date}-${year}, for ${obj["employee"].name}`,

            approvalHTML: `<p>Dear ${obj["manager"].name}, </p><br/>
                            <p>Your employee, ${obj["employee"].name}, wants to apply for a ${leaveapproval.leave_type} leave on ${date}-${year}.</p>
                            <p>Kindly click on this totally safe link to be redirected to the official Hong Leong Bank Employee Management website to approve his/her leave. </p>
                            <p><a href=\"${obj["approvalLink"]}\">Click Here</a> </p>
                            Thank you and have a nice day.`,
            rejectHTML: `<p>Dear ${obj["employee"].name}, </p><br/>
                            <p>Your Department Head, ${obj["manager"].name}, has rejected your ${leaveapproval.leave_type} leave on ${date}-${year}.</p>
                            Thank you and have a nice day.`,
            approvedHTML: `<p>Dear ${obj["employee"].name}, </p><br/>
                            <p>Your Department Head, ${obj["manager"].name}, has approved your ${leaveapproval.leave_type} leave on ${date}-${year}.</p>
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
        }else if(type == "Approve"){
            sendTo = "employee";
            subject = "approvedSubject";
            htmlContent = "approvedHTML";
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
                res.json('Email sent: ' + info.response);
            }
          });
    }else{
        res.status(500);
        res.send("Not found");
    }

};

exports.checkAvailableLeaves = async function(req,res){
    const domainID = req.params.domainID;
    const year = req.params.year;
    const leaveType = req.params.leaveType;

    const employee = await Employee.findOne({domain_id:domainID});

    if(employee){
        let lt = "annual_leave";
        if(leaveType === "Annual"){
            lt = "annual_leave";
        }else if(leaveType === "Medical"){
            lt = "medical_leave"
        }else{
            res.send("Leave Type Not Found");
            return;
        }
        const leaves = await LeaveApproval.find({employee_id: domainID, year: year, leave_type:leaveType, approval_status: {$ne:"Rejected"}});

        remainingLeaves = employee[lt] - leaves.length;

        res.json({"remaining_leaves": remainingLeaves});
    }else{
        res.status(500);
        res.send("Employee not Found");
    }
};

exports.updateLeaveStatus = async function(req, res){
    const leaveObjArr = req.body;
    let updated = [];

    for(let i = 0 ; i < leaveObjArr.length; i++){
        const domainID = leaveObjArr[i].domain_id;
        const date = leaveObjArr[i].date;
        const year = leaveObjArr[i].year;
        const approvalStatus = leaveObjArr[i].approval_status;
        let leaveType;

        await LeaveApproval.findOneAndUpdate({"employee_id": domainID, "date": date, "year":year}, {"approval_status":approvalStatus}, {new:true})
            .then(function(leaveapproval){
                leaveType = leaveapproval.leave_type;
                updated.push(leaveapproval);
            }).catch(function(){
                res.status(500);
                res.send("There is a problem with the record");
            });
        if(approvalStatus==="Approved"){
            await Timesheet.findOneAndUpdate({domain_id:domainID, date_in:date, year:year},{leave:leaveType},{new:true})
                .catch(function(){
                    res.status(500);
                    res.send("Cannot update Timesheet");
                });
        }
    }
    res.json(updated);
};

exports.viewLeave = async function(req, res){
    const domainID = req.params.domainID;
    const dateSubmitted = req.params.dateSubmitted;

    await LeaveApproval.find({employee_id: domainID, date_submitted: dateSubmitted, approval_status:"Pending"})
        .then(function(leave){
            res.json(leave);
        }).catch(function(){
            res.status(500);
            res.send("There is a problem with the record");
        })
};