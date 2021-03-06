﻿/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import * as uuid from "node-uuid";
import * as Promise from "bluebird";
import * as bcrypt from 'bcryptjs';
import { DbContext, UserInstance } from '../data/dbContext';
import { TokenCacheService } from '../services/TokenCacheService';
import { Constants } from '../constants';

export class UserService {

    private dbContext = new DbContext();

    public creatUser(email: string, password: string, firstName: string, lastName: string, favoriteColor: string): Promise<UserInstance> {
        email = email.toLowerCase();
        return this.dbContext.User
            .findOne({ where: { email: email } })
            .then(user => {
                if (user == null) {
                    let passwordSalt = bcrypt.genSaltSync();
                    let passwordHash = password != null
                        ? bcrypt.hashSync(password, passwordSalt)
                        : null;
                    return this.dbContext.User.create(
                        {
                            id: uuid.v4(),
                            email: email,
                            firstName: firstName,
                            lastName: lastName,
                            passwordHash: passwordHash,
                            salt: passwordSalt,
                            favoriteColor: favoriteColor
                        });
                }
                else
                    throw (`Email ${email} is used by others`);

            });
    }

    public validUser(email: string, password: string): Promise<any> {
        email = email.toLowerCase();
        let retUser;
        return this.dbContext.User
            .findOne({ where: { email: email } })
            .then((user) => {
                let isValid = user != null && bcrypt.hashSync(password, user.salt) == user.passwordHash;
                if (isValid) {
                    retUser = user;
                    return user;
                }
                else
                    throw 'Invalid Username or password';
            })
            .then((user: UserInstance) => {
                return user.getOrganization();
            })
            .then((organization) => {
                if (organization != null)
                    retUser.organization = {
                        tenantId: organization.tenantId,
                        name: organization.name,
                        isAdminConsented: organization.isAdminConsented
                    };

                return retUser;
            })
    }


    public validUserHasSameEmail(email: string): Promise<boolean> {
        email = email.toLowerCase();
        return this.dbContext.User
            .findOne({ where: { email: email } })
            .then(user => {
                return user != null;
            });
    }



    public getUserModel(where: any): Promise<any> {
        return this.dbContext.User.findOne({ where: where })
            .then(user => {
                if (user == null) {
                    return null;
                }
                var result = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    o365UserId: user.o365UserId,
                    o365Email: user.o365Email,
                    favoriteColor: user.favoriteColor,
                    organization: null,
                    roles: []
                }
                var p1 = user.getOrganization()
                    .then(organization => {
                        if (organization != null) {
                            result.organization = {
                                tenantId: organization.tenantId,
                                name: organization.name,
                                isAdminConsented: organization.isAdminConsented
                            }
                        }
                    });
                var p2 = user.getUserRoles()
                    .then(userRoles => userRoles.forEach(i => result.roles.push(i.name)));
                return Promise.all([p1, p2])
                    .then((ret) => {
                        return result;
                    })
            });
    }

    
    private getUserById(userId: string): Promise<UserInstance> {
        return this.dbContext.User.findById(userId);
    }

    private getUserRoles(userId: string): Promise<any> {
        return this.getUserById(userId)
            .then((user) => {
                return user.getUserRoles();
            })
            .then((roles) => {
                let retRoles = [];
                roles.forEach(i => retRoles.push(i.name));
                return retRoles;
            })
    }
}