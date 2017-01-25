﻿/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
export class DemoHelperPage {

    component: string;
    links: Link[];

    constructor() {
        this.component = undefined;
        this.links = [];
    }
}

export class Link {

    title: string;
    url: string;
}