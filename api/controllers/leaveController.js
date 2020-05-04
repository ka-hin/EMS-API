var mongoose = require('mongoose');
var Employee = mongoose.model('employee');
var LeaveApproval = mongoose.model('leave_approval');
var Holiday = mongoose.model('holiday');

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