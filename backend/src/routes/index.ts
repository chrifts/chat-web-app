const router = require("express").Router();
const AuthController = require("../controllers/AuthController");
const Middleware = require("../middlewares");
const UserModel = require ("../models/user.model");

import { ADD_CONTACT, GET_CONTACTS, HANDLE_CONTACT_REQUEST } from "../controllers/user/index";

import { getOrCreate, postMessage, getMessages } from '../controllers/chat/index';

module.exports = function(io: any) {
    

    router.post("/auth/signup", AuthController.signup);

    router.post("/auth/login", AuthController.login);

    router.post("/auth/refresh_token", AuthController.generateRefreshToken);

    router.post("/auth/logout", AuthController.logout);

    router.post('/get-user', Middleware.checkAuth, async function (req, res) {
        if(req.body.getFull) {
            console.log('entro');
            let fullUser = await UserModel.findOne({ email: req.body.email });
            if(fullUser) {
                fullUser = fullUser.toObject()
                delete fullUser.password;
            }
            res.status(200).json(fullUser);
            return;
        }
        if(req.user.email) {
            return res.status(200).json(req.user);
        } else {
            return res.status(200).json(req.user.user);
        }
    }); 

    router.post("/user/add-contact", Middleware.checkAuth, ADD_CONTACT(io));    
    
    router.post("/user/get-contacts", Middleware.checkAuth, GET_CONTACTS(io));
    
    router.post("/user/handle-contact-request", Middleware.checkAuth, HANDLE_CONTACT_REQUEST(io));

    router.post("/chat/get-or-create", Middleware.checkAuth, getOrCreate);

    router.post("/chat/get-messages", Middleware.checkAuth, getMessages);
    
    router.post("/chat/post-message", Middleware.checkAuth, postMessage(io));
    
    return router; 
}