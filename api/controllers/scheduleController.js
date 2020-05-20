var mongoose = require('mongoose');
var Schedule = mongoose.model('schedule');

exports.createSchedule = async function(req, res){
    let scheduleObj = req.body;

    scheduleObj["activated"] = true;

    const new_schedule = new Schedule(scheduleObj);
    await new_schedule.save(function(err, schedule){
        if(err){
            res.status(500);
            res.send('There is a problem with the record');
        }
        res.json(schedule);
    });
};