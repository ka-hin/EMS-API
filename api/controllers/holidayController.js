var mongoose = require('mongoose');
var Holiday = mongoose.model('holiday');
var Timesheet = mongoose.model('timesheet');

exports.saveHoliday = async function(req, res){
    const holidayObjArr = req.body;
    let saved = [];
    
    for(let i = 0 ; i < holidayObjArr.length; i++){
        const check_duplicate = await Holiday.findOne({date: holidayObjArr[i].date, year: holidayObjArr[i].year});

        if(check_duplicate){
            saved.push(null);
        }else{
            const new_holiday = new Holiday(holidayObjArr[i]);
            await new_holiday.save()
                .then(function(holiday){
                    saved.push(holiday);
                }).catch(function(){
                    res.status(500);
                    res.send('There is a problem with the record');
                });
        }
        
    }
    await updateTimesheetHoliday(saved);
    res.send(saved);
};

async function updateTimesheetHoliday(updates){
    for(let i = 0 ; i < updates.length; i++){
        if(updates[i] != null){
            const timesheet = await Timesheet.find({date_in: updates[i].date, year: updates[i].year});

            for(let j = 0; j < timesheet.length; j++){
                await Timesheet.findOneAndUpdate({domain_id: timesheet[j].domain_id, date_in:timesheet[j].date_in, year: timesheet[j].year},{remarks: /*updates[i].holiday_name*/null},{new:true});
            } 
        }
    }
}