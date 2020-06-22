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

        socket.on("getNotifications", async function(){
            await Notification.find({seen: false}).then(function(notification){
                client.emit('notifications', notification);
            }).catch(function(err){
                console.log(err);
            });
        });

        socket.on("newNotification", async function(data){
            const d = new Date();
            const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            const nd = new Date(utc + (3600000*8));
            const date = ("0" + nd.getDate()).slice(-2);
            const month = ("0" + (nd.getMonth() + 1)).slice(-2);
            const year = nd.getFullYear().toString();
            const hours = ("0" + nd.getHours()).slice(-2);
            const minutes = ("0" + nd.getMinutes()).slice(-2);

            const domainID = data.domain_id;
            const content = data.content;
            const link = data.link;

            const notificationObj ={
                "domain_id": domainID,
                "date": date+"-"+month,
                "year": year,
                "time": hours+minutes,
                "content": content,
                "link": link,
                "seen": false
            }

            const new_notification = new Notification(notificationObj);
            await new_notification.save(function(err){
                if(err){
                    console.log(err);
                }
            });

            await Notification.find({seen: false}).then(function(notification){
                client.emit('notifications', notification);
            }).catch(function(err){
                console.log(err);
            });

        });

        socket.on("seenNotification", async function(data){
            const notif_id = data.notif_id;

            await Notification.findByIdAndUpdate(notif_id,{seen:true}, {new:true})
                .catch(function(err){
                    console.log(err);
                })

            await Notification.find({seen: false}).then(function(notification){
                client.emit('notifications', notification);
            }).catch(function(err){
                console.log(err);
            });
        })
    });
});