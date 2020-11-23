const CM = require("../../models/chat.model");
const UM = require("../../models/user.model");

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
                for await (const user_id of chat.members) {
                    
                    const user = await UM.updateOne({
                        _id: chat.members[i],
                        "contacts.contact_id": chat.members[i+1 == 2 ? 0 : i+1]
                    }, 
                    {
                        $set: {
                            "contacts.$.lastMessage" : req.body.message.message
                        }
                    })
                    i++;
                }

                chat.members.forEach(user_id => {
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
        console.log(chat.messages);    
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