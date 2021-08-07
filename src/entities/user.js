export default class User{
    constructor(login){
        if (login === 'hr')
            this.getHrUser()
        else
            this.getSimpleUser()
    }

    getHrUser(){
        this.login = 'hr'
        this.id = 6;
        this.firstName = 'Катерина';
        this.lastName = '';
        this.nickName = 'Катя';
        this.fullName = 'Катерина'
        this.jobTitle = "HR"
        this.org_unit_id = 3
        this.authorities = ['editAll'];
    }

    getSimpleUser(){
        this.login = 'sales'
        this.id = 1;
        this.firstName = 'Лариса';
        this.lastName = 'Дорош';
        this.nickName = 'Лариса';
        this.jobTitle = "Продавец"
        this.fullName = 'Дорош Лариса'
        this.org_unit_id = 1
        this.authorities = [];
    }

    hasAuthority(authName){
        return this.authorities.includes(authName);
    }

    amIhr(){
        return this.hasAuthority('editAll');
    }

    getId(){return this.id}

    getFullName(){
        return this.lastName.concat(" ").concat(this.firstName).trim();
    }

    toString(){
        const main = this.getFullName.concat(", ").concat(this.jobTitle);
    }
}