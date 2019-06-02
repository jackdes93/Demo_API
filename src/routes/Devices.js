const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Device = require('../model/Device');
const checkAuth = require('../middleware/check-auth');

router.get('/', checkAuth, (req, res, next) => {
    Device.find()
    .then(result => {
        const response = {
            count: result.length,
            devices: result.map( device => {
                return {
                    _id: device._id,
                    ip_address: device.ip_address,
                    phone_number: device.phone_number,
                    sensor_status: device.sensor_status,
                    fslim_status: device.fslim_status,
                    url: process.env.APP_URL + ':' + process.env.APP_PORT + '/api/devices/' + device._id   
                }
            })
        }
        if(result.length > 0) {
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
            'message' : error
        })
    });
    
});

router.get('/:id_device', checkAuth, (req, res, next) => {
    const id_device = req.params.id_device;
    Device.findById(id_device)
    .then(result => {
        const response = {
            message: `${id_device} with detail :`,
            device: {
                _id : result._id,
                ip_address : result.ip_address,
                phone_number : result.phone_number,
                sensor_status: result.sensor_status,
                fslim_status: result.fslim_status
            }
        }
        res.status(200).json(response);
    })
    .catch(error => {
        res.status(500).json({
            status: 500,
            message: error
        })
    });
    
});

router.post('/', checkAuth, (req, res, next) => {
    const new_device = new Device({
        _id: new mongoose.Types.ObjectId(),
        ip_address : req.body.ip_address,
        phone_number : req.body.phone_number
    });

    new_device.save()
    .then(result => {
        res.status(201).json({
            'message' : 'Created successfully !!!',
            'device' : result
        });
    })
    .catch(error => {
        res.status(500).json({
            'status' : 500,
            'Error' : error
        });
    });
});

router.patch('/:id_device', checkAuth, (req, res, next) => {
    const id_device = req.params.id_device;
    const updateOps = {};

    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }

    Device.findByIdAndUpdate(id_device, {$set: updateOps}, {runValidators: true})
    .then(result => {
        if(result) {
            res.status(200).json({
                status: 200,
                message: 'Updated successfully!!!'
            });
        } else {
            res.status(404).json({
                status: 404,
                'message' : 'Not Found'
            })
        }
    })
    .catch(error => {
        res.status(500).json({
            status: 500,
            error: error.message
        })
    });
});

router.delete('/:id_device', checkAuth, (req, res, next) => { 
    const id_device = req.params.id_device;
    Device.findByIdAndDelete(id_device)
    .then(result => {
        res.status(200).json({
            status : 200,
            message: 'Done!!!!'
        })
    })
    .catch(error => {
        res.status(500).json({
            status : 500,
            message: error
        })
    });
});
module.exports = router;