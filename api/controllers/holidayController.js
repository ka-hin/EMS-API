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
    
    res.send(saved);
};