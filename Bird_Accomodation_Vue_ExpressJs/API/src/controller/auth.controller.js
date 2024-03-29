const accountModel = require("../models/account.model");
const jwt = require("jsonwebtoken");
const config = require("../../src/config/config");

module.exports = {
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const loginDetail = {
                email: email,
                password: password
            }
            const result = await accountModel.login(loginDetail);
            if (result.length > 0) {
                // Create payload for encryption
                const payload = {
                    email: email,
                };
                res.status(200).send({
                    message: "Login successfully",
                    token: jwt.sign(payload, config.JWT_SECRET, {
                        expiresIn: config.JWT_EXP_TIME,
                    }),
                    account: result
                })
            } else {
                res.status(200).send({message: "Login failed, wrong password or email"})
            }
        } catch (error) {
           console.log(error.message);
            res.status(500).send("Internal server error");
        }
    },
    register: async (req, res, next) => {
        try {
            const { email, password, name, address, phone } = req.body;
            const registerDetail = {
                email: email,
                password: password,
                name: name,
                address: address,
                phone: phone
            }
            const result = await accountModel.register(registerDetail);
            if (result > 0) {
                res.status(201).send({message: "Register successfully"})
            } else {
                res.status(200).send({message: "Register failed"})
            }
        } catch (error) {
           console.log(error.message);
            res.status(500).send("Internal server error");
        }
    },
    isAccountExist: async (req, res, next) => {
        try {
            const { email, phone } = req.body;
            const validateEmail = await accountModel.validateEmail(email);
            const validatePhone = await accountModel.validatePhone(phone);
            if (validateEmail) {
                res.status(409).send({message: "Email already exists"});
                return;
            }
            if (validatePhone) {
                res.status(409).send({message: "Phone already exists"});
                return;
            }
            res.status(200).send({message: "Email and phone does not exist"});
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal server error");
        }
    }
}