const routesDevice = require('./Devices');
const routesUser = require('./Users');
const express = require('express');
const router = express.Router();

router.use("/devices", routesDevice);
router.use("/users", routesUser);

module.exports = router;

