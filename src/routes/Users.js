const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

router.get('/users/', checkAuth, (req, res, next) => {
    User.find()
    .select("user_name email link_profile")
    .exec()
    .then(result => {
        const response = {
            count: result.length,
            users : result.map(user => {
                return {
                    _id: user._id,
                    user_name: user.user_name,
                    email: user.email,
                    created_on: user.created_on,
                    updated_on: user.updated_on,
                    link_profile: process.env.APP_URL + ':' + process.env.APP_PORT + '/api/users/' + user._id
                }
            })
        }
        if(result.length > 0) {
            res.status(200).json(response);
        } else {
            res.status(404).json({
                'status' : 404,
                'message' : 'Not Found !!!'
            });
        }
    })
    .catch(error => {
        res.status(500).json({
            'status' : 500,
            'error' : error
        });
    });
});

router.get('/:id_user', checkAuth, (req, res, next) => {
    const id_user = req.params.id_user;
    User.findById(id_user)
    .select("_id user_name email rules created_on")
    .then(result => {
        if(result) {
            const response = {
                message: `${result.user_name} info detail :`,
                user : {
                    _id: result._id,
                    user_name: result.user_name,
                    email: result.email,
                    rules: result.rules,
                    created_on: result.created_on
                }
            }
            res.status(200).json(response);
        }
        else {
            res.status(404).json({
                'status' : 404,
                'message' : 'Not Found'
            })
        }
    })
    .catch(error => {
        res.status(500).json({
            'status' : 500,
            'error' : error
        });
    });
});

router.post('/', checkAuth, (req, res, next) => {
    const new_user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        user_name: req.body.user_name,
        pwd:  req.body.pwd, 
        rules: 'BASIC'
    });

    new_user.save()
    .then(result => {
        res.status(201).json({
            'message' : 'Created new User',
            'data': result
        });
    })
    .catch(error => {
        res.status(500).json({
            'status' : 500,
            'error' : error
        });
    });    
});

router.patch('/:id_user', checkAuth, (req, res, next) => {
    const id_user = req.params.id_user;
    const updateOps = {};
    if(req.body.length > 0) {
        for(const ops of req.body){
            updateOps[ops.propName] = ops.value;
        }
        updateOps['updated_on'] = Date.now();
    }
    
    User.findByIdAndUpdate(id_user, {$set : updateOps}, {runValidators: true} ,(error, result) => {
        if (error) return res.status(500).json(error);
        const response = {
            message: 'Updated Successfully!!!',
            user: {
                type: 'GET',
                url: process.env.APP_URL + ':' + process.env.APP_PORT + '/api/users/' + result._id   
            }
        }
        res.status(200).json(response);
    });
});

router.delete('/:id_user', checkAuth, (req, res, next) => {
    const id_user = req.params.id_user;
    User.findByIdAndDelete(id_user)
    .then(result => {
        res.status(200).json({
            'message' : `Delete user with id : ${id_user} success!!!!`,
            'url_test' :  process.env.APP_URL + ':' + process.env.APP_PORT + '/api/users/' + id_user
        });
    })
    .catch(error => {
        res.status(500).json({
            'Error' : error
        });
    });
    
});

router.post('/register', (req, res, next) => {
    User.find({email: req.body.email})
    .then(users => {
        if(users.length > 0) {
            return res.status(403).json({
                status : 403,
                message: 'Email have in system'
            })
        } else {
            const new_user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                user_name: req.body.user_name,
                pwd: req.body.pwd
            });

            new_user.save()
            .then(result => {
                const response = {
                    status: 201,
                    message: 'Create new user successful',
                    user : result
                }

                res.status(201).json(response);
            }).catch(error => {
                res.status(500).json({
                    status: 500,
                    error : error
                });
            });
        }
    })
    .catch(error => {
        res.status(500).json({
            status: 500,
            error : error
        });
    });
});

router.post('/login', (req, res, next) => {
    const user_name = req.body.user_name;
    const pwd = req.body.pwd;

    User.find({user_name: user_name})
    .then(users => {
        if(users.length <= 0) {
            return res.status(401).json({
                status: 401,
                message: 'Auth failed'
            });
        }

        bcrypt.compare(pwd, users[0].pwd, (error, result) => {
            if(error) {
                return res.status(401).json({
                    status: 401,
                    message: 'Auth Fail!!!'
                });
            }
            
            if(result) {
                const token = jwt.sign(
                    {user_name: users[0].user_name, email: users[0].email},
                    process.env.SECRET_KEY,
                    {
                        expiresIn: "1h"
                    }
                );
                return res.status(200).json({
                    status: 200,
                    message: 'Auth successful!!!',
                    token: token
                });
            }

            res.status(401).json({
                status: 401,
                message: 'Auth Fail!!!'
            });
        });
        
    })
    .catch(error => {
        res.status(500).json({
            'Error' : error.message
        })
    });
});

module.exports = router;