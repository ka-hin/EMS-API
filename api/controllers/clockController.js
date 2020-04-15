var mongoose = require('mongoose');
var Period = mongoose.model('period');
var Timesheet = mongoose.model('timesheet');

async function createPeriods(year,res){

    await Period.findOne({"year":year},function(err, period){
        if(err){
            res.status(500);
            res.send('There is a problem with the record');
        }

        if(!period){
            for(var i = 0; i<12;i++){
                var d = new Date(year, i + 1, 0,+8);
                let date = ("0" + d.getDate()).slice(-2);
                let month = ("0" + (d.getMonth() + 1)).slice(-2);
        
                var periodObj = {
                    "period_number" : i.toString(),
                    "date_start" : "01-"+month,
                    "date_end" : date+'-'+month,
                    "year" : year.toString()
                }
                
                var new_period = new Period(periodObj);
                new_period.save(function(err,period){
                    if(err){
                        res.status(500);
                        res.send('There is a problem with the record');
                    }
                    console.log(period);
                });
            }
        }
    });
};

async function createTimesheet(domainID, periodNumber, year,res){

    await Timesheet.findOne({"domain_id" : domainID, "period_number": periodNumber, "year": year}, function(err, timesheet){
        if(err){
            res.status(500);
            res.send('There is a problem with the record');
        }

        if(!timesheet){
            Period.findOne({"period_number": periodNumber, "year": year},function(err,period){
                if(err){
                    res.status(500);
                    res.send('There is a problem with the record!');
                }

                if(period){
                    var start = Number(period.date_start.substr(0,2));
                    var end = Number(period.date_end.substr(0,2));

                    for(var i = start; i<= end ; i++){
                        var dateIn = ("0"+ i).slice(-2)+"-"+("0"+(Number(periodNumber)+1)).slice(-2);
                        var d = new Date(Number(year), Number(periodNumber), i,+8);
                        var day = null;
                        if(d.getDay() === 0 || d.getDay() === 6){
                            day = "Weekend";
                        }
                        var timesheetObj = {
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
                            "remarks":day
                        }
                        var new_timesheet = new Timesheet(timesheetObj);
                        new_timesheet.save(function(err, timesheet){
                            if(err){
                                res.status(500);
                                res.send('There is a problem with the record');
                            }
                            console.log(timesheet);
                        });
                    }
                }
            });   
        }
    });
};

async function clockIn(domainID, dateIn, timeIn, year, res){
    Timesheet.findOneAndUpdate({"domain_id": domainID, "date_in": dateIn, "year":year},{"time_in":timeIn},{new:true})
        .then(function(changes){
            res.send(changes);
        }).catch(function(err){
            res.status(500);
            res.send(err);
        });
}

exports.clockIn = async function(req,res){
    var domainID = req.params.domainID;
    var dateIn = req.params.dateIn;
    var timeIn = req.params.timeIn;
    var year = req.params.year;
    var period = (Number(dateIn.substr(3,2))-1).toString();

    await createPeriods(year,res)
        .then(function(){
            createTimesheet(domainID,period,year,res);
        })
        .then(function(){
            clockIn(domainID,dateIn, timeIn, year, res);
        })
        .catch(function(err){
            console.log(err)
        });;
    
    
};