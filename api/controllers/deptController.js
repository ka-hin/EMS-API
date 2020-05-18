var mongoose = require('mongoose');
var Department = mongoose.model('department');

exports.createDepartment = async function(req, res){
    let deptObj = req.body;

    //deptObj["activated"] = true;

    const new_dept = new Department(deptObj);
    await new_dept.save(function(err, dept){
        if(err){
            res.status(500);
            res.send('There is a problem with the record');
        }
        res.json(dept);
    });
};