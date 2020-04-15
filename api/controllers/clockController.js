var mongoose = require('mongoose');
var Period = mongoose.model('period');
var Timesheet = mongoose.model('timesheet');

async function createPeriods(year,res){

    await Period.findOne({"year":year}, function(err, period){
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
                });
            }
        }
    });
};

async function createTimesheet(domainID, periodNumber, year,res) {

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
                var dateIn = ("0"+ i).slice(-2)+"-"+("0"+(Number(periodNumber)+1)).slice(-2);
                var d = new Date(Number(year), Number(periodNumber), i,+8);
                var day = null;

                if(d.getDay() === 0 || d.getDay() === 6){
                    day = "Weekend";
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
                    "remarks":day
                };

                new_timesheet.push(new Timesheet(timesheetObj));
            }

            return new_timesheet;
        }
    }

    return [];
};

async function clockIn(domainID, dateIn, timeIn, year, res){
    return await Timesheet.findOneAndUpdate({"domain_id": domainID, "date_in": dateIn, "year":year},{"time_in":timeIn},{new:true});
}

exports.clockIn = async function(req,res){
    var domainID = req.params.domainID;
    var dateIn = req.params.dateIn;
    var timeIn = req.params.timeIn;
    var year = req.params.year;
    var period = (Number(dateIn.substr(3,2))-1).toString();

    const resolvePeriod = await createPeriods(year,res);
    await createTimesheet(domainID,period,year,res).then( async (doc) => {

        if(doc.length) {
            doc.map( doc => {
                if(doc.date_in === dateIn) {
                    console.log(doc);
                    doc.time_in = timeIn;
                }
    
                return doc;
            });

            await Timesheet.insertMany(doc);
        } else {
            await clockIn(domainID,dateIn, timeIn, year, res);
        }

        res.send('Clocked In');
    });  
};