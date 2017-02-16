﻿/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Inject } from '@angular/core';
import { UserInfo } from '../models/common/userInfo';
import { AboutMeModel } from './aboutme';
import { ClassesModel } from '../school/classes';
import { MapUtils } from '../utils/jsonHelper';
import { Constants } from '../constants';
import { SchoolService } from '../school/school.service';
import { UserModel } from '../school/user';

@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'aboutme.component.template.html',
    styles: []
})

export class AboutMe implements OnInit {

    model: AboutMeModel = new AboutMeModel();
    me: UserModel;
    userRole: string = "";
    isAdmin: boolean = false;

    constructor(
        @Inject('aboutMeService') private aboutMeservice,
        private route: ActivatedRoute,
        private router: Router,
        @Inject('schoolService') private schoolService: SchoolService
    ) {
        this.model.FavoriteColors = Constants.FavoriteColors;
    }

    ngOnInit() {
        this.aboutMeservice
            .getMe()
            .subscribe((data) => {
                let user: UserInfo = new UserInfo();
                user.readFromJson(data);
                this.model.UserName = (user.firstName + " " + user.lastName).trim();
                this.model.MyFavoriteColor = user.favoriteColor || this.model.FavoriteColors[0].Value;
                this.model.IsLinked = user.areAccountsLinked();
                this.isAdmin = this.isUserAdmin(data);
                if (!this.isAdmin) {
                    this.schoolService
                        .getMe()
                        .subscribe((result) => {
                            this.me = MapUtils.deserialize(UserModel, result);
                            this.userRole = this.me.ObjectType;
                        });
                } else {
                    this.userRole = "Admin";
                }
                
            });


        this.aboutMeservice
            .getMyClasses()
            .subscribe((result) => {
                if (this.model.Groups === undefined) {
                    this.model.Groups = new Array<string>();
                }
                result.forEach((obj) => {
                    var classModel = MapUtils.deserialize(ClassesModel, obj);
                    this.model.Groups.push(classModel.DisplayName);
                });
            });
    }
    isUserAdmin(user: UserInfo): boolean {
        let result = false;
        let roles = user.roles;
        if (roles == undefined || roles == null || roles.length == 0)
            return result;
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].toLowerCase() == "admin") {
                result = true;
                break;
            }
        }
        return result;
    }
    updateFavoriteColor() {
        this.aboutMeservice.updateFavoriteColor(this.model.MyFavoriteColor).then((response) => {
            this.model.SaveSucceeded = response.ok;
        });
    }
}