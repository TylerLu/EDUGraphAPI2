﻿import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { GraphHelper } from '../utils/graphHelper'
import { SchoolModel } from '../school/school';
import { SvcConsts } from '../SvcConsts/SvcConsts'
import { UserModel, StudentModel, TeacherModel } from '../school/user';
import { ClassesModel, ClassesModelWithPagination } from '../school/classes';
import { Document, OneDrive} from './document';
import { Conversation } from './conversation';
import { SeatingArrangement } from './seatingarrangements'

@Injectable()
export class SchoolService {
    private files = [];
    private urlBase: string = SvcConsts.AAD_Graph_RESOURCE + '/' + SvcConsts.TENANT_ID;
    private bingMapUrl: string = "http://dev.virtualearth.net/REST/v1/Locations/US/{0}/{1}/{2}?output=json&key=" + SvcConsts.BING_MAP_KEY;

    constructor(private http: Http, @Inject('auth') private authService, @Inject('data') private dataService) { }


    /**
     * Retrieves all schools.
     * Reference URL: https://msdn.microsoft.com/office/office365/api/school-rest-operations#get-all-schools
     */
    getSchools(): any {
        return this.dataService.get(this.urlBase + "/administrativeUnits?api-version=beta")
            .map((response: Response) => <SchoolModel[]>response.json().value);
    }

    /**
    * Retrieves longitude and latitude by address.
    * Reference URL: 
    */
    getLongitudeAndLatitude(state: string, city: string, address: string): any {
        return this.dataService.get(this.bingMapUrl.replace("{0}", state).replace("{1}", city).replace("{2}", address))
            .map((response: Response): any => {
                var j = response.json();
                return j;
            });
    }

    /**
	 * Retrieves school by id.
     * @param  {string} id Identification of the school
     * Reference URL: https://msdn.microsoft.com/office/office365/api/school-rest-operations#get-a-school.
	 */
    getSchoolById(id: string): any {
        return this.dataService.get(this.urlBase + '/administrativeUnits/' + id + '?api-version=beta')
            .map((response: Response) => <SchoolModel>response.json());
    }
    /**
    * Retrieves all classes of a school.
    * @param  {string} schoolId Identification of the school
    * @param  {string} nextLink next link in the previous response for next page
    * Reference URL: https://msdn.microsoft.com/office/office365/api/school-rest-operations#get-sections-within-a-school.
    */
    getClasses(schoolId: string, nextLink: string): any {
        //https://graph.windows.net/64446b5c-6d85-4d16-9ff2-94eddc0c2439/groups?api-version=beta&$filter=extension_fe2174665583431c953114ff7268b7b3_Education_ObjectType%20eq%20'Section'%20and%20extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_SchoolId%20eq%20'10001'
        let url: string = this.urlBase +
            "/groups?api-version=beta&$top=12&$filter=extension_fe2174665583431c953114ff7268b7b3_Education_ObjectType%20eq%20'Section'%20and%20extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_SchoolId%20eq%20'" + schoolId + "'";
        if (nextLink) {
            url += "&" + GraphHelper.getSkipToken(nextLink);
        }
        return this.dataService.get(url)
            .map((response: Response) =>
                <ClassesModelWithPagination>response.json()
            );

    }
    /**
     * Get current user's information from AD
     * Reference URL: https://msdn.microsoft.com/en-us/office/office365/api/teacher-rest-operations
     */
    getMe(): any {
        return this.dataService.get(this.urlBase + "/me?api-version=1.5")
            .map((response: Response) => <UserModel>response.json());
    }

    /**
     * Get current users's classes.
     * @param schoolId
     * Reference URL: https://msdn.microsoft.com/en-us/office/office365/api/section-rest-operations
     */
    getMyClasses(schoolId: string): any {
        return this.dataService.get(this.urlBase + "/me/memberOf?api-version=1.5")
            .map((response: Response) => <ClassesModel[]>response.json().value);
    }

    /**
    * Get a section by using the object_id.
    * Reference URL: https://msdn.microsoft.com/office/office365/api/section-rest-operations#get-a-section.
    * @param classId The Object ID of the section group in Azure Active Directory.
    * <returns></returns>
     */
    getClassById(classId: string) {
        return this.dataService.get(this.urlBase + "/groups/" + classId+"?api-version=beta&$expand=members")
            .map((response: Response) => <ClassesModel>response.json());
    }
    /**
     * Get all users of a school.
     * Get all users of a school.
     * @param  {string} schoolId Identification of the school
     * @param  {string} nextLink next link in the previous response for next page
     * Reference URL: https://msdn.microsoft.com/en-us/office/office365/api/school-rest-operations#get-school-members
     */
    getUsers(schoolId: string, nextLink: string): any {
        var url = this.urlBase + "/administrativeUnits/" + schoolId + "/members?api-version=beta&$top=12";
        if (nextLink) {
            url += "&" + GraphHelper.getSkipToken(nextLink);
        }
        return this.dataService.get(url)
            .map((response: Response) => <UserModel[]>response.json());
    }

    /**
     * Get all students of a school.
     * @param  {string} schoolId Identification of the school
     * @param  {string} nextLink next link in the previous response for next page
     * Reference URL: https://msdn.microsoft.com/en-us/office/office365/api/school-rest-operations#get-school-members
     */
    getStudents(schoolId: string, nextLink: string): any {
        var url = this.urlBase + "/users?api-version=1.5&$filter=extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_SchoolId%20eq%20'" + schoolId + "'%20and%20extension_fe2174665583431c953114ff7268b7b3_Education_ObjectType%20eq%20'Student'&$top=12";
        if (nextLink) {
            url += "&" + GraphHelper.getSkipToken(nextLink);
        }
        return this.dataService.get(url)
            .map((response: Response) => <StudentModel[]>response.json());
    }

    /**
     * Get all teachers of a school.
    * @param  {string} schoolId Identification of the school
    * @param  {string} nextLink next link in the previous response for next page
    * Reference URL: https://msdn.microsoft.com/en-us/office/office365/api/school-rest-operations#get-school-members
     */
    getTeachers(schoolId: string, nextLink: string): any {
        var url = this.urlBase + "/users?api-version=1.5&$filter=extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_SchoolId%20eq%20'" + schoolId + "'%20and%20extension_fe2174665583431c953114ff7268b7b3_Education_ObjectType%20eq%20'Teacher'&$top=12";
        if (nextLink) {
            url += "&" + GraphHelper.getSkipToken(nextLink);
        }
        return this.dataService.get(url)
            .map((response: Response) => <TeacherModel[]>response.json());
    }

    getDocuments(classId: string) {
        var url = SvcConsts.MS_GRAPH_RESOURCE +  "/v1.0/groups/" + classId + "/drive/root/children";
        return this.dataService.getWithMsToken(url)
            .map((response: Response) => <Document[]>response.json().value);
    }

    getOneDriveWebURl(classId: string) {
        var url = SvcConsts.MS_GRAPH_RESOURCE + "/v1.0/groups/" + classId + "/drive/root";
        return this.dataService.getWithMsToken(url)
            .map((response: Response) => <OneDrive>response.json());
    }

    getConversation(classId: string) {
        var url = SvcConsts.MS_GRAPH_RESOURCE + "/v1.0/" + SvcConsts.TENANT_ID+"/groups/" + classId + "/conversations";
        return this.dataService.getWithMsToken(url)
            .map((response: Response) => <Conversation[]>response.json().value);
    }

    getSeatingArrangements(classId: string) {
        var url = "/api/schools/seatingArrangements/" + classId;
        return this.dataService.get(url)
            .map((response: Response) => <SeatingArrangement[]>response.json());
    }

    saveSeatingArrangement(classId: string, seatingArrangements: SeatingArrangement[] ) {
        var url = "/api/schools/seatingArrangements/" + classId;
        return this.dataService.post(url, seatingArrangements)
            .map(this.extractData);
    }

    private extractData(res: Response) {
        let body = res.json();
        return body.data || {};
    }
}