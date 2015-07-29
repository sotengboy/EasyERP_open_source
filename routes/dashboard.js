/**
 * Created by Roman on 09.07.2015.
 */
var express = require('express');
var router = express.Router();
var wTrackHandler = require('../handlers/dashboard');

module.exports = function (models) {
    var handler = new wTrackHandler(models);

    router.get('/vacation', handler.composeForVacation);
    router.get('/hr', handler.composeForHr);

    return router;
};