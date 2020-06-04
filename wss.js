const client = require('socket.io').listen(3333).sockets;
const mongoose = require('mongoose'),
Notification = require('./api/models/notificationModel');

mongoose.Promise=global.Promise;
mongoose.connect('mongodb+srv://freeuser:freeuser@cluster0-wvlrg.mongodb.net/EMS', function(err){
    if(err){
        console.log(err);
    }
    console.log("MongoDB connected...");

    client.on("connection", function(socket){
        const Notification = mongoose.model('notification');

        socket.on("getNotifications", function(domainID){
            Notification.find({domain_id:domainID}).then(function(notification){
                client.emit('notifications', notification);
            }).catch(function(err){
                console.log(err);
            });
        })
    });
});