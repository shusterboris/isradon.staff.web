export default class User{
    constructor(userData){
        this.employeeName = userData.employeeName;
        this.userName = userData.userName;
        this.authorities = userData.authorities;
    }

    hasAuthority(authName){
        return this.authorities.includes(authName);
    }

    amIhr(){
        return this.hasAuthority('editAll');
    }

}