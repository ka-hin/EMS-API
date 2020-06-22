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

exports.updateHoliday = async function(req, res){
    const holidayObjArr = req.body;
    let flag = true;

    flag = await checkHolidayMonth(holidayObjArr.date, holidayObjArr.year, res);
    if(flag===false){
        return;
    }

    await Holiday.findByIdAndUpdate(holidayObjArr._id, holidayObjArr,{new:true})
        .then(function(holiday){
            res.json(holiday);
        }).catch(function(){
            res.status(500);
            res.send("There is a problem with the record");
        });
};

async function checkHolidayMonth(date, year, res){
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nd = new Date(utc + (3600000*8));
    const ndmonth = nd.getMonth() + 1;
    const ndyear = nd.getFullYear();

    const month = Number(date.substr(3,2));

    if(ndyear > Number(year)){
        res.send("Date must be next month onwards")
        return false;
    }else if(ndyear === Number(year) ){
        if((month-ndmonth)<=0){
            res.send("Date must be next month onwards")
            return false;
        }
    }
}

exports.deleteHoliday = async function(req, res){
    const id = req.params.id;
    let flag = true;

    const holiday = await Holiday.findById(id);
    if(holiday===null){
        res.send("Holiday not found");
        return;
    }
    flag = await checkHolidayMonth(holiday.date, holiday.year, res);
    if(flag===false){
        return;
    }

    await Holiday.findByIdAndDelete(id).then(function(del){
        res.json(del);
    }).catch(function(){
        res.status(500);
        res.send("There is a problem with the record");
    });
};