﻿/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import express = require('express');
import { UserService } from '../services/userService';

var router = express.Router();
var userService = new UserService();

router.get('/linked', function (req, res, next) {
    userService.getLinkedUsers(req.user.tid)
        .then(users => res.json(users))
        .catch(error => res.json(500, { error: error }));
});

router.post('/:userId/unlink', function (req, res) {
    var userId = req.params.userId;
    userService.unlinkUser(userId)
        .then((ret) => res.end())
        .catch(error => res.json(500, { error: error }));
});

router.get('/:o365Id/FavoriteColor', function (req, res) {
    userService.GetUserFavoriteColorByO365Id(req.params.o365Id)
        .then((ret) => res.json(ret))
        .catch(error => res.json(""));
});

export = router;