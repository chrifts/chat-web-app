
const UM = require("../../models/user.model");

function ADD_CONTACT(io: any) {

    const callback = async (req, res) => {
        
        try {
            
            const contact = await UM.findOne({email: req.body.contactEmail}).lean()


            const me = await UM.findOne({email: req.body.myEmail}).lean()
            let userExists = false;
            me.contacts.filter(function(e) { 
                if(e.contact_id == contact._id) {
                    userExists = true;
                } 
            })

            if(userExists) {
                res.status(403).json({message: 'User exists'})
                return;
            }

            if(contact && me) {
                delete me.password;
                delete me.contacts;
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
                    me.status = 'requested_by'
                    io.of('/user-'+contact._id).emit('CONTACT_REQUEST', me)
                    delete contact.password;
                    delete contact._id;
                    delete contact.contacts;
                    contact.status = 'sent'
                    res.json({contact_data: contact});
                } else {
                    res.send(403).json({error: 'Error adding contact'});
                }
            } else {
                res.status(403).json({error: 'No user found'})
            }
        } catch (error) {
            res.status(500).json({error: error})
            throw new Error(error);
        }
        
    }
    return callback;
}

function GET_CONTACTS(io: any) {

    const callback = async (req, res) => {
        
        try {
            const me = await UM.findOne({email: req.body.email}).lean()
            let contacts = []
            for await (const element of me.contacts) {
                const contact = await UM.findOne(
                    {
                        _id: element.contact_id,
                        
                    },
                    
                ).lean()
                if(contact) {
                    contact.status = element.status;
                    contact.lastMessage = element.lastMessage;
                    delete contact.password;
                    delete contact.contacts;
                    contacts.push(contact);
                }
            }            
            res.status(200).json({contacts: contacts});
        } catch (error) {
            res.status(500).json({error: error})
            throw new Error(error);
        }
    }
    return callback;
}

function HANDLE_CONTACT_REQUEST(io: any) {
    //EVENTS:
    //@CONTACT_REQUEST_RESEND
    //@CONTACT_REQUEST_ACCEPTED
    //@CONTACT_REQUEST_REJECTED
    //@CONTACT_STATUS_RESEND_CANCEL
    const callback = async (req, res) => {
        
        try {
            const my_data = await UM.findOne({_id: req.body.myId}).lean();             
            delete my_data.password;
            delete my_data.contacts;

            const contact_data = await UM.findOne({_id: req.body.contactId}).lean()
            delete contact_data.password;
            delete contact_data.contacts;
            var event_to_send: String;
            switch (req.body.event) {
                case 'ACCEPTED':
                    event_to_send = 'CONTACT_STATUS_ACCEPTED';
                    try {
                        const contact = await UM.updateOne({
                            _id: req.body.contactId,
                            "contacts.contact_id": req.body.myId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'connecteds' 
                            }
                        })
                        const me = await UM.updateOne({
                            _id: req.body.myId,
                            "contacts.contact_id": req.body.contactId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'connecteds' 
                            }
                        })
                        my_data.status = 'connecteds';
                        contact_data.status = 'connecteds';
                        io.of('/user-'+req.body.contactId).emit(event_to_send, my_data)
                        io.of('/user-'+req.body.myId).emit(event_to_send, contact_data)
                        res.status(200).json({event:'ACCEPTED', status: 'connecteds'})
                    } catch (error) {
                        res.status(500).json({error: error})
                        throw new Error(error)
                    }
                    break;
            
                case 'RESEND':
                    event_to_send = 'CONTACT_STATUS_RESEND';
                    try {    
                        const contact = await UM.updateOne({
                            _id: req.body.contactId,
                            "contacts.contact_id": req.body.myId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'requested_by' 
                            }
                        })
                        const me = await UM.updateOne({
                            _id: req.body.myId,
                            "contacts.contact_id": req.body.contactId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'sent' 
                            }
                        })
                        my_data.status ='requested_by';
                        contact_data.status = 'sent';
                        io.of('/user-'+req.body.contactId).emit(event_to_send, my_data)
                        io.of('/user-'+req.body.myId).emit(event_to_send, contact_data)
                        console.log('emmited');
                        res.status(200).json({event:event_to_send, status: 'resent'})
                    } catch (error) {
                        res.status(500).json({error: error})
                        throw new Error(error)
                    }
                    break;
                
                case 'REJECTED':
                    event_to_send = 'CONTACT_STATUS_REJECTED';
                    try {    
                        const contact = await UM.updateOne({
                            _id: req.body.contactId,
                            "contacts.contact_id": req.body.myId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'rejected_by_contact' 
                            }
                        })
    
                        const me = await UM.updateOne({
                            _id: req.body.myId,
                            "contacts.contact_id": req.body.contactId
                        }, 
                        {
                            $set: {
                                "contacts.$.status" : 'rejected_by_me' 
                            }
                        })
                        my_data.status = 'rejected_by_contact'
                        contact_data.status = 'rejected_by_me'
                        io.of('/user-'+req.body.contactId).emit(event_to_send, my_data)
                        io.of('/user-'+req.body.myId).emit(event_to_send, contact_data)
                        res.status(200).json({message: 'rejected'})
                    } catch (error) {
                        res.status(500).json({error: error})
                        throw new Error(error)
                    }
                    break;
                
                case 'RESEND_CANCEL':
                    event_to_send = 'CONTACT_STATUS_RESEND_CANCEL';

                    try {    
                        const contact = await UM.updateOne( 
                            {
                                _id: req.body.contactId
                            }, 
                            {
                                $pull: { contacts: { contact_id: req.body.myId } }
                            },
                            {multi: true} 
                        )

                        const me = await UM.updateOne( 
                            {
                                _id: req.body.myId
                            }, 
                            {
                                $pull: { contacts: { contact_id: req.body.contactId } }
                            },
                            {multi: true} 
                        )
                        
                        

                        my_data.status = 'resend_cancelled'
                        //contact_data.status = 'resend_cancelled'
                        //io.of('/'+req.body.contactId).emit(event_to_send, my_data)
                        io.of('/user-'+req.body.myId).emit(event_to_send, contact_data)
                        res.status(200).json({message: 'resend_cancelled'})
                    } catch (error) {
                        res.status(500).json({error: error})
                        throw new Error(error)
                    }

                    break;
                default:
                    console.log('NO CASE SENT IN REQUEST')
                    res.send(500).json({error: 'default event undefined'})
                    break;
            }
        } catch (error) {
            res.status(500).json({error: error})
            throw new Error(error);
        }
        
    }
    return callback;
}

export {
    ADD_CONTACT,
    GET_CONTACTS,
    HANDLE_CONTACT_REQUEST
}