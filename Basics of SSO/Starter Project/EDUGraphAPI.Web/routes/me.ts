﻿/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import express = require('express');
import { UserService } from '../services/userService';

var router = express.Router();
var userService = new UserService();

router.get('/', function (req, res) {
    var u = req.user;
    userService.getUserModel({ id: u.id })
        .then(user => {
            user.authType = u.authType;
            user.areAccountsLinked =
                user.o365UserId != null && user.o365UserId != ''
                && user.o365Email != null && user.o365Email != '';
            res.json(user);
        })
  .catch(error => res.json(500, { error: error }));
})



router.get('/accessToken', function (req, res) {
    if (!req.isAuthenticated()) {
        res.json(401, { error: "401 unauthorized" });
        return;
    }

    let userId = req.user.oid;
    if (userId == null) {
        res.json(null);
        return;
    }

});

export = router;