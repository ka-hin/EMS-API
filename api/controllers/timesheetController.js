var mongoose = require('mongoose');
var Timesheet = mongoose.model('timesheet');

exports.viewTimesheet = async function(req, res){
    var domainID = req.params.domainID;
    var period = (Number(req.params.month)-1).toString();
    var year = req.params.year;

    await Timesheet.find({"domain_id": domainID, "period_number": period, "year":year})
        .then(function(timesheet){
            res.json(timesheet);
        }).catch(function(){
            res.status(500);
            res.send("There is a problem with the record");
        });
}