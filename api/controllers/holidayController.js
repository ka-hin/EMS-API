var mongoose = require('mongoose');
var Holiday = mongoose.model('holiday');
var Timesheet = mongoose.model('timesheet');

exports.saveHoliday = async function(req, res){
    const holidayObj = req.body;
    
    const new_holiday = new Holiday(holidayObj);
    await new_holiday.save(function(err){
        if(err){
            res.status(500);
            res.send('There is a problem with the record');
        }
    });
    res.send();
};