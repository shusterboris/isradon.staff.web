export default class User{
    constructor(userData){
        this.employeeName = userData.employeeName;
        this.employeeId = userData.employeeId;
        this.userName = userData.userName;
        this.jobTitle = userData.jobTitle;
        this.orgUnit = userData.orgUnit;
        this.orgUnitId = userData.orgUnitId;
        this.authorities = userData.authorities;
        this.coming = userData.coming;
        this.leaving = userData.leaving;
    }

    hasAuthority(authName){
        return this.authorities ? this.authorities.includes(authName) : false;
    }

    amIhr(){
        return this.hasAuthority('editAll');
    }

    isPortable(){
        if (this.hasAuthority("manualCheckIn")) {return true}; 
        if (this.hasAuthority("editAll")) {return false};
        if (this.authorities && this.authorities.leaving===0){
            return !this.jobTitle.toLowerCase().includes("продавец")
        }
        return false;
    }

}