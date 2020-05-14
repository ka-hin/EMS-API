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

exports.viewAllHoliday = async function(req,res){
    const holiday = await Holiday.find()
        .lean()
        .then(function(holiday){
            holiday.forEach(element => {
                element["sort_date"] = new Date(element.year, Number(element.date.substr(3,2))-1, element.date.substr(0,2), +8);
            });

            holiday.sort(function(a, b) {
                let keyA = new Date(a.sort_date),
                    keyB = new Date(b.sort_date);
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            });
            res.json(holiday);
        }).catch(function(){
            res.status(500);
            res.send("There is a problem with the record");
        });
};