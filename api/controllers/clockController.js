var mongoose = require('mongoose');
var Period = mongoose.model('period');
var Timesheet = mongoose.model('timesheet');
var Employee = mongoose.model('employee');
var TimesheetApproval = mongoose.model('timesheet_approval');
var LastClockIn = mongoose.model('last_clock_in');
var Holiday = mongoose.model('holiday');

async function createPeriods(year,res){

    await Period.findOne({"year":year}, function(err, period){
        if(err){
            res.status(500);
            res.send('There is a problem with the record');
        }

        if(!period){
            for(var i = 0; i<12;i++){
                let d = new Date(year, i + 1, 0,+8);
                let date = ("0" + d.getDate()).slice(-2);
                let month = ("0" + (d.getMonth() + 1)).slice(-2);
        
                const periodObj = {
                    "period_number" : i.toString(),
                    "date_start" : "01-"+month,
                    "date_end" : date+'-'+month,
                    "year" : year.toString()
                }
                
                const new_period = new Period(periodObj);
                new_period.save(function(err){
                    if(err){
                        res.status(500);
                        res.send('There is a problem with the record');
                    }
                });
            }
        }
    });
};

async function createTimesheet(domainID, periodNumber, year) {

    // Check if there is a plotted timesheet for specified user and period.
    const timesheet = await Timesheet.findOne({"domain_id" : domainID, "period_number": periodNumber, "year": year});

    // If no timesheet, generate a timesheet in DB.
    if (!timesheet) {

        const period = await Period.findOne({"period_number": periodNumber, "year": year});

        if(period) {

            const startDate = Number(period.date_start.substr(0, 2));
            const endDate = Number(period.date_end.substr(0, 2));

            const new_timesheet = [];

            for(var i = startDate; i <= endDate ; i++){
                let dateIn = ("0"+ i).slice(-2)+"-"+("0"+(Number(periodNumber)+1)).slice(-2);
                let d = new Date(Number(year), Number(periodNumber), i,+8);
                let day = null;

                if(d.getDay() === 0 || d.getDay() === 6){
                    day = "Weekend";
                }

                const holiday = await Holiday.findOne({date: dateIn, year: year});
                if(holiday != null){
                    day = holiday.holiday_name;
                }

                const timesheetObj = {
                    "domain_id":domainID,
                    "date_in":dateIn,
                    "time_in":"0000",
                    "time_out":"0000",
                    "date_out":null,
                    "period_number": periodNumber,
                    "year": year,
                    "ot":0,
                    "ut":0,
                    "late":0,
                    "remarks":day,
                    "edit_status":null
                };

                new_timesheet.push(new Timesheet(timesheetObj));
            }

            return new_timesheet;
        }
    }

    return [];
};

async function createTimesheetApproval(period,year,domainID){
    const employee = await Employee.findOne({domain_id: domainID})
        .populate({path: "department", populate: {path:"department_head", select:"domain_id"}});

    let ApprovalStatus = "Pending";
    if(domainID===employee.department.department_head.domain_id){
        ApprovalStatus = "Approved";
    }
    const timesheetapproval = await TimesheetApproval.findOne({employee_id: domainID, period_number: period, year: year});

    if(!timesheetapproval){
        const timesheetApprovalObj = {
            "period_number":period,
            "year":year,
            "approval_status":ApprovalStatus,
            "date_submitted":null,
            "employee_id": domainID,
            "manager_id": employee.department.department_head.domain_id
        }
        const new_timesheetApproval = new TimesheetApproval(timesheetApprovalObj);
        new_timesheetApproval.save();
    }
}

async function clockIn(domainID, dateIn, timeIn, year){
    return await Timesheet.findOneAndUpdate({"domain_id": domainID, "date_in": dateIn, "year":year},{"time_in":timeIn},{new:true});
}

async function calcLateHrs(domainID, dateIn, timeIn, year){
    const employee = await Employee.findOne({domain_id:domainID})
        .populate("schedule","-_id");

    const startTime = employee.schedule.start_time;
    const lateHrs = ((Number(timeIn.substr(0,2))*60 + Number(timeIn.substr(2,2))) - (Number(startTime.substr(0,2))*60 + Number(startTime.substr(2,2))))/60;
    if(lateHrs > 0){
        return await Timesheet.findOneAndUpdate({"domain_id": domainID, "date_in": dateIn, "year":year},{"late":lateHrs},{new:true});
    }else{
        return await Timesheet.findOneAndUpdate({"domain_id": domainID, "date_in": dateIn, "year":year},{"late":0},{new:true});
    }
}

exports.clockIn = async function(req,res){
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nd = new Date(utc + (3600000*8));
    const date = ("0" + nd.getDate()).slice(-2);
    const month = ("0" + (nd.getMonth() + 1)).slice(-2);
    const hours = ("0" + nd.getHours()).slice(-2);
    const minutes = ("0" + nd.getMinutes()).slice(-2);

    const body = req.body;
    const domainID = body.domain_id;
    const dateIn = date+"-"+month;
    const timeIn = hours+minutes;
    const year = nd.getFullYear().toString();
    const period = (Number(dateIn.substr(3,2))-1).toString();

    //to check for last clock in
    const lastclockin = await LastClockIn.findOne({domain_id: domainID});
    if(lastclockin === null){
        const lastClockInObj = {
            "domain_id" : domainID,
            "date_in" : dateIn,
            "year" : year
        };

        const new_lastclockin = new LastClockIn(lastClockInObj);
        new_lastclockin.save(function(err){
            if(err){
                res.status(500);
                res.send('There is a problem with the record');
            }
        });
    }else{
        if(lastclockin.date_in === null && lastclockin.year === null){
            await LastClockIn.findOneAndUpdate({domain_id: domainID}, {date_in: dateIn, year: year}, {new:true})
                .catch(function(){
                    res.status(500);
                    res.send('There is a problem with the record');
                });
        }else{
            res.json({status:"Please clock out before clocking in!"});
            return;
        }
    }

    const resolvePeriod = await createPeriods(year,res);
    await createTimesheet(domainID,period,year).then( async (doc) => {

        if(doc.length) {
            doc.map( doc => {
                if(doc.date_in === dateIn) {
                    doc.time_in = timeIn;
                }
    
                return doc;
            });

            await Timesheet.insertMany(doc);
            await createTimesheetApproval(period, year, domainID);
        } else {
            await clockIn(domainID,dateIn, timeIn, year);
        }
        await calcLateHrs(domainID, dateIn, timeIn, year);
        
        const clockedInTimesheet = await Timesheet.find({"domain_id": domainID, "period_number": period, "year":year});
        res.json(clockedInTimesheet);
    });  
};

async function calcOTnUT(domainID, dateIn, dateOut, timeOut, year){
    const employee = await Employee.findOne({domain_id:domainID})
        .populate("schedule","-_id");

    const startTime = employee.schedule.start_time;
    const endTime = employee.schedule.end_time;
    const workingHours = (Number(endTime.substr(0,2))*60 + Number(endTime.substr(2,2))) - (Number(startTime.substr(0,2))*60 + Number(startTime.substr(2,2)));
    
    const timesheet = await Timesheet.findOne({"domain_id": domainID, "date_in": dateIn, "year":year});
    const timeIn = timesheet.time_in;
    
    const d1 = new Date(Number(year), (Number(dateIn.substr(3,2))-1), Number(dateIn.substr(0,2)),(Number(timeIn.substr(0,2)))+8, Number(timeIn.substr(2,2)));
    const d2 = new Date(Number(year), (Number(dateOut.substr(3,2))-1), Number(dateOut.substr(0,2)),(Number(timeOut.substr(0,2)))+8, Number(timeOut.substr(2,2)));

    const workedHours = Math.abs(d2 - d1) / (60*1000);
    
    const diffHrs = (workedHours - workingHours) / 60;
    
    if(diffHrs > 0){
        return await Timesheet.findOneAndUpdate({"domain_id": domainID, "date_in": dateIn, "year":year}, {"ot": diffHrs, "ut":0}, {new:true});
    }else{
        return await Timesheet.findOneAndUpdate({"domain_id": domainID, "date_in": dateIn, "year":year}, {"ot": 0, "ut": diffHrs*-1}, {new:true});
    }
}

async function clockOut(domainID, dateIn, dateOut, timeOut, year){
    let updatedDateOut = null;
    if(dateIn !== dateOut){
        updatedDateOut = dateOut;
    }
    return await Timesheet.findOneAndUpdate({"domain_id": domainID, "date_in": dateIn, "year":year},{"time_out":timeOut, "date_out": updatedDateOut},{new:true});
}

exports.clockOut = async function(req, res){
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nd = new Date(utc + (3600000*8));
    const date = ("0" + nd.getDate()).slice(-2);
    const month = ("0" + (nd.getMonth() + 1)).slice(-2);
    const hours = ("0" + nd.getHours()).slice(-2);
    const minutes = ("0" + nd.getMinutes()).slice(-2);

    const body = req.body;
    const domainID = body.domain_id;
    let dateIn;
    const dateOut = date+"-"+month;
    const timeOut =  hours+minutes;
    let year;

    const lastclockin = await LastClockIn.findOne({domain_id: domainID});
    if(lastclockin){
        if(lastclockin.date_in != null && lastclockin.year != null){
            dateIn = lastclockin.date_in;
            year = lastclockin.year;
            await LastClockIn.findOneAndUpdate({domain_id: domainID}, {date_in: null, year: null}, {new:true})
                .catch(function(){
                    res.status(500);
                    res.send('There is a problem with the record');
                });
        }else{
            res.json({status:"Please clock in before clocking out!"});
            return;
        }
    }else{
        res.json({status:"Please clock in before clocking out!"});
        return;
    }

    const period = (Number(dateIn.substr(3,2))-1).toString();

    await clockOut(domainID, dateIn, dateOut, timeOut, year);
    await calcOTnUT(domainID, dateIn, dateOut, timeOut, year);
    const clockedOutTimesheet = await Timesheet.find({"domain_id": domainID, "period_number": period, "year":year});

    res.json(clockedOutTimesheet);
};

exports.checkClockInStatus = async function(req, res){
    const domainID = req.params.domainID;

    await LastClockIn.findOne({domain_id: domainID})
        .then(function(lastclockin){
            if(lastclockin===null){
                res.json({last_clock_in:false});
            }else{
                if(lastclockin.date_in != null && lastclockin.year != null){
                    res.json({last_clock_in:true})
                }else if(lastclockin.date_in === null && lastclockin.year === null){
                    res.json({last_clock_in:false});
                }
            }
        }).catch(function(){
            res.status(500);
            res.send("There is a problem with the record");
        })
};

exports.calcLateHrs = calcLateHrs;
exports.calcOTnUT = calcOTnUT;

