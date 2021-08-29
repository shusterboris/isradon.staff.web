export default class User{
    constructor(userData){
        this.employeeName = userData.employeeName;
        this.userName = userData.userName;
        this.jobTitle = userData.jobTitle;
        this.orgUnit = userData.orgUnit;
        this.orgUnitId = userData.orgUnitId;
        this.authorities = userData.authorities;
    }

    hasAuthority(authName){
        return this.authorities.includes(authName);
    }

    amIhr(){
        return this.hasAuthority('editAll');
    }

}