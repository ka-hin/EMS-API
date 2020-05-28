var mongoose = require('mongoose');
var Employee = mongoose.model('employee');
var Timesheet = mongoose.model('timesheet');
var Holiday = mongoose.model('holiday');

async function LateReport(domainID){
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nd = new Date(utc + (3600000*8));
    const period = nd.getMonth()-1;
    
    const employee = await Employee.findOne({domain_id:domainID},"-_id").populate("schedule","-_id");
    const holiday = await Holiday.find({holiday_type:"Non-Working"});

    let weekday = new Array(7);
    weekday["Sunday"] = 0;
    weekday["Monday"] = 1;
    weekday["Tuesday"] = 2;
    weekday["Wednesday"] = 3;
    weekday["Thursday"] = 4;
    weekday["Friday"] = 5;
    weekday["Saturday"] = 6;

    return await Timesheet.find({domain_id: domainID, period_number: period})
        .then(function(timesheet){
            let lateCount = 0;
            let workDays = 0;

            for(let i = 0; i < timesheet.length; i++){
                let isWorkingDay = false;

                const selectedDate = new Date(timesheet[i].year, timesheet[i].period_number, Number(timesheet[i].date_in.substr(0,2)),+8);
                
                for(let j = 0; j < employee.schedule.days_of_work.length;j++){
                    if(selectedDate.getDay() === weekday[employee.schedule.days_of_work[j]]){
                        isWorkingDay = true;
                    }
                }

                for(let x = 0; x < holiday.length;x++){
                    let day = Number(holiday[x].date.substr(0,2));
                    let month = Number(holiday[x].date.substr(3,2))-1;
                    let year = Number(holiday[x].year);
    
                    if(selectedDate.getDate()===day && selectedDate.getMonth()===month && selectedDate.getFullYear()===year){
                        isWorkingDay = false;
                    }
                }

                if(timesheet[i].leave!=null){
                    isWorkingDay = false;
                }
                
                if(isWorkingDay === true){
                    if(timesheet[i].late!=0){
                        lateCount+=1;
                    }
                    workDays+=1;
                }
            }

            const latePercentage = Number((lateCount/workDays*100).toFixed(2));
            return[{name:"Late",y:latePercentage},{name:"On-Time", y: Number((100-latePercentage).toFixed(2))}];
        }).catch(function(err){
            return "There is a problem with the record."
        })
}

exports.empLateReport = async function(req, res){
    const domainID = req.params.domainID;
    res.json(await LateReport(domainID));
};

exports.deptLateReport = async function(req, res){
    const ManagerID = req.params.ManagerID;
    let report = [];
    
    const department = await Employee.findOne({domain_id:ManagerID, role:"Manager"}, "-_id department");
    if(department){
        const employee = await Employee.find({department:department.department, domain_id:{$ne:ManagerID}});

        for(let i = 0; i < employee.length; i++){
            const reportObj = {
                "domain_id":employee[i].domain_id,
                "name":employee[i].name,
                "report": await LateReport(employee[i].domain_id)
            };
            report.push(reportObj);
        }

        res.json(report);
    }else{
        res.send("Employee does not have permission to view");
    }
};

exports.OverallLateReport = async function(req, res){
    const ManagerID = req.params.ManagerID;
    
    const department = await Employee.findOne({domain_id:ManagerID, role:"Manager"}, "-_id department");
    if(department){
        const employee = await Employee.find({department:department.department, domain_id:{$ne:ManagerID}});
        
        let averageLate = 0;

        for(let i = 0; i < employee.length; i++){
            const report = await LateReport(employee[i].domain_id);

            averageLate = averageLate + report[0].y;
        }
        averageLate = Number((averageLate/employee.length).toFixed(2));

        res.json([{name:"Late",y:averageLate},{name:"On-Time", y: Number((100-averageLate).toFixed(2))}]);
    }else{
        res.send("Employee does not have permission to view");
    }
};