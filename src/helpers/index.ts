import axios from "axios";
import { MAIN_APP_CONTACT_HANDLER, MAIN_APP_MESSAGES } from '../constants'

async function axiosRequest(type: string, url: string, postData?: {}, headers?: {}) {
    
    let data: any;
    if(type == 'GET') {
        try {
            const response = await axios.get(url, headers)
            data = response;
        } catch (error) {
            throw new Error(error.response.data.message);
        }
    }
    if(type == 'POST') {
        try {
            const response = await axios.post(url, postData, headers)
            data = response;
        } catch (error) {
            data = error.response;
        }
        
    }
    return data;
}

const emailRegex = (email: string) => {
    if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)){
        return true;
    }
    return false;
}

// const chatKey = (myuid: string, contactUid: string) => {
//     if(myuid < contactUid){
//         return myuid+contactUid;  
//       }
//     else{
//         return contactUid+myuid;
//     }
// }

function defaultSocketEvents (socket: any, opts?: {context?: string, store: any}) {
    //context = context app (main app or selectedChat)

    // connect	            Fired upon connection (including a successful reconnection)
    // disconnect	        Fired upon disconnection
    // connect_error	    Fired upon a connection error
    // connect_timeout	    Fired upon a connection timeout
    // reconnect_attempt	Fired upon an attempt to reconnect
    // reconnect_error	    Fired upon a reconnection attempt error
    // reconnect_failed	    Fired when the client couldn’t reconnect within reconnectionAttempts
    // reconnecting	        Alias for “reconnect_attempt”
    // reconnect	        Fired upon a successful reconnection
    // ping	                Fired when a ping is sent to the server
    // pong	                Fired when a pong is received from the server
    let socketStatus = '';

    socket.on('connect', ()=>{
        console.log('connected', socket)
        if(opts?.store) {
            socketStatus = 'connected';
            opts?.store.commit('setMainAppSocketStatus', socketStatus)
        }
    })
    socket.on('error', (error)=>{
        console.log('socket error: ', error, socket)
        if(opts?.store) {
            socketStatus = 'error';
            opts?.store.commit('setMainAppSocketStatus', socketStatus)
        }
    })
    socket.on('disconnect', (res)=>{
        console.log('disconnected: ', res, socket)
        if(opts?.store) {
            socketStatus = 'disconnected';
            opts?.store.commit('setMainAppSocketStatus', socketStatus)
        }
    })
}

function customSocketEvents(socket: any,  context: string, store: any, auth?: {}) {
    console.log('executed customSoket')
    if(context == MAIN_APP_CONTACT_HANDLER) {
        console.log('on If')
        socket.on('CONTACT_STATUS_ACCEPTED', async (payload) => {
            await store.dispatch('GET_CONTACTS', auth)
            store.commit('updateContactStatus', {payload: payload, event:'ACCEPTED'})
        });

        socket.on('CONTACT_STATUS_RESEND', async (payload) => {
            await store.dispatch('GET_CONTACTS', auth)
            store.commit('updateContactStatus', {payload: payload, event:'RESEND'})
        });

        socket.on('CONTACT_STATUS_REJECTED', async (payload) => {
            await store.dispatch('GET_CONTACTS', auth)
            store.commit('updateContactStatus', {payload: payload, event:'REJECTED'})
        });

        socket.on('CONTACT_STATUS_RESEND_CANCEL', async (payload) => {
            await store.dispatch('GET_CONTACTS', auth)
            store.commit('updateContactStatus', {payload: payload, event:'RESEND_CANCEL'})
        });

        socket.on('CONTACT_REQUEST', async (payload) => {
            console.log(payload)
            //add incoming Contact request to store
            store.commit('addContact', payload)
        });
    }

    if(context == MAIN_APP_MESSAGES) {
        socket.on('MESSAGE_NOTIFICATION', (payload) => {
            console.log('New message: ', payload)
            //PAY LOAD TIENE LA NOTIFICACION CORRESPONDIENTE
            store.commit('updateContactLastMessage', payload)
            if(payload.notification) {
                store.commit('updateNotifications', payload)
            }
            
            //SEND A NOTIFICATION TO PAYLOAD MEMBERS (from to)
        });
        
    }
}

export {
    axiosRequest,
    emailRegex,
    defaultSocketEvents,
    customSocketEvents
}