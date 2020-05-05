var mongoose = require('mongoose');
var Employee = mongoose.model('employee');
var LeaveApproval = mongoose.model('leave_approval');
var Holiday = mongoose.model('holiday');
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
    const body = req.body;

    const domainID = body.domain_id;
    const leaveType = body.leave_type;
    const date = body.date;
    const year = body.year;

    const employee = await Employee.findOne({domain_id: domainID})
        .populate({path: "department", populate: {path:"department_head", select:"domain_id"}});

    const leaveapproval = await LeaveApproval.findOne({employee_id: domainID, date: date, year: year});
    if(!leaveapproval){
        const leaveApprovalObj = {
            "leave_type" : leaveType,
            "date": date,
            "year": year,
            "approval_status": "Pending",
            "employee_id": domainID,
            "manager_id":employee.department.department_head.domain_id
        };
        const new_leaveApproval = new LeaveApproval(leaveApprovalObj);
        await new_leaveApproval.save()
            .then(function(newleaveapproval){
                res.json(newleaveapproval);
            }).catch(function(){
                res.status(500);
                res.send("There is a problem with the record");
            })
    }
};

exports.sendEmail = async function(req, res){
    const body = req.body;

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

            approvalLink: `http://localhost:4200/leave-approval/${domainID}/${date}/${year}`
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