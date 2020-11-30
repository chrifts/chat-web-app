import { NEW_MESSAGE } from "../../constants";

const CM = require("../../models/chat.model");
const UM = require("../../models/user.model");
const ObjectID = require('mongodb').ObjectID;

const getOrCreate = async (req, res) => {
    //get chat where members
    try {

        const chat = await CM.findOne({members: { "$eq" : req.body.members.sort()}}).lean()
        if(chat !== null) {
            //return chat
            res.status(200).json({chat: chat});
        } else {
            //create and return
            const chat = new CM(
            { 
                members: req.body.members 
            });
            chat.save(async function (err) {
                if (err) {
                    return res.json(err);
                }
                const created_chat = await CM.findOne({members: { "$eq" : req.body.members.sort()}}).lean()
                res.status(200).json({chat: created_chat});
            });
            
        }
    } catch (error) {
        res.status(500).json({error: error});
        throw new Error(error)
    }
}

function postMessage(io: any) {
    const notificationType = NEW_MESSAGE;
    const callback = async (req, res) => {
        console.log(req.body)
        try {
            const chat = await CM.findOneAndUpdate(
                {
                    _id: req.body.chatId
                },
                {
                    $push: {
                        messages: req.body.message
                    }
                }
            )
            if(chat) {
                io.of('/chat-'+req.body.chatId).emit('NEW_MESSAGE', req.body.message)
                const chat = await CM.findOne(
                    {
                        _id: req.body.chatId,
                    }
                ).lean()
                let i = 0;
                //TODO: Make this for await fully dynamic
                for await (const user_id of chat.members) {
                    
                    const user = await UM.updateOne({
                        _id: chat.members[i],
                        "contacts.contact_id": chat.members[i+1 == 2 ? 0 : i+1]
                    }, 
                    {
                        $set: {
                            "contacts.$.lastMessage" : {message: req.body.message.message, timestamp: req.body.message.timestamp},
                        }
                    })
                    i++;
                }

                console.log(req.body.message);
                const sender = req.body.message.from;
                delete sender.contacts;
                delete sender.notifications;
                
                const notification = {
                    _id: ObjectID(),
                    extraDataFrom: sender,
                    from: req.body.message.from._id,
                    message: req.body.message.message,
                    timestamp: req.body.message.timestamp,
                    type: notificationType,
                };
                const user = await UM.findOneAndUpdate({
                        _id: req.body.message.to,
                    },
                    {
                        $push: {
                            [`notifications.${notificationType}.${req.body.message.from._id}`]: notification
                        },
                        
                    },{multi: true}
                    
                ).exec()
                
                chat.members.forEach(user_id => {
                    if(user_id == req.body.message.to) {
                        req.body.message.notification = notification;
                    } else {
                        req.body.message.notification = null;
                    }
                    io.of('/user-'+user_id).emit('MESSAGE_NOTIFICATION', req.body.message)    
                });
                
                res.status(200).json({message: chat})
            }
        } catch (error) {
            res.status(500).json({error: error})
            throw new Error(error)
        }
    }
    return callback;
}

const getMessages = async (req, res) => {
    try {
        const chat = await CM.findOne({_id: req.body.chatId}).lean()
        //DELETE NEW-MESSAGE NOTIFICATIONS FROM CONTACT
        console.log(req.body)
        if(req.body.contact) {
            const user = await UM.findOneAndUpdate({
                _id: req.body.user._id,
            },
            {
                $unset: [`notifications.${NEW_MESSAGE}.${req.body.contact._id}`],
                
            }
            ).exec()
        }  
        
        res.status(200).json({messages: chat.messages})
    } catch (error) {
        res.status(500).json({error: error})
        throw new Error(error)
    }
    
}

export {
    getOrCreate,
    postMessage,
    getMessages
}