const router = require("express").Router();
const AuthController = require("../controllers/AuthController");
const Middleware = require("../middlewares");
const UserModel = require ("../models/user.model");

import { ADD } from "../controllers/chat/index";

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

    router.post("/chat/add-contact", Middleware.checkAuth, ADD(io));    
    
    return router; 
}