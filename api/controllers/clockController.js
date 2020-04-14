var mongoose = require('mongoose');
var Period = mongoose.model('period');

exports.createPeriods = async function(req,res){
    var year = req.params.year;

    await Period.findOne({"year":year},function(err, period){
        if(err){
            res.status(500);
            res.send('There is a problem with the record');
        }

        if(period){
            res.send("This period already exists");
        }else{
            for(var i = 0; i<12;i++){
                var d = new Date(year, i + 1, 0,+8);
                let date = ("0" + d.getDate()).slice(-2);
                let month = ("0" + (d.getMonth() + 1)).slice(-2);
        
                var periodObj = {
                    "period_number" : i.toString(),
                    "date_start" : "01/"+month,
                    "date_end" : date+'/'+month,
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
            res.send();
        }
    });
};

