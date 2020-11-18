
const UM = require("../../models/user.model");

function ADD(io: any) {

    const addContact = async (req, res) => {
        
        try {
            const contact = await UM.findOne({email: req.body.contactEmail})
            
            
            const me = await UM.findOne({email: req.body.myEmail}).lean()
            if(contact && me) {
                delete me.password;
                delete me.contacts;
                // console.log(io.of('/'+contact._id).sockets.entries().next().value[1])
                io.of('/'+contact._id).emit('CONTACT_REQUEST', me)
                //let socketId = io.of('/'+contact._id).sockets.entries().next().value[1].client.id;

                //io.to(socketId).emit('CONTACT_REQUEST', me)

                const added = await UM.findOneAndUpdate({
                    email: req.body.myEmail
                }, 
                {
                    $push: {
                        contacts: {
                            status: 'sent',
                            contact_id: contact._id
                        }
                    }
                })
                const insertInContact = await UM.findOneAndUpdate({
                    email: req.body.contactEmail
                },
                {
                    $push: {
                        contacts: {
                            status: 'requested_by',
                            contact_id: me._id
                        }
                    }
                })
                
                if(added && insertInContact) {
                    res.send(200);
                    

                } else {
                    res.send(500).json({error: 'Error adding contact'});
                }
            } else {
                res.status(500).json({error: 'No user found'})
            }
        } catch (error) {
            res.status(500).json({error: error})
            throw new Error(error);
        }
        
    }
    return addContact;
}

export {
    ADD
}