import axios from 'axios'
import AppSets from '../service/AppSettings'

export default class User{
    constructor(id){
        this.id = id;
        this.authorities = [];
    }

    init(){
        const server = AppSets.host;
        const url = server + '/employee/authorityList/'+this.id
        axios.get(url)
            .then(res => res.data)
            .then(
                data => {this.authorities = data})
            .catch(err => {
                let errMsg = "";
                if (err.toString().includes(': Network')){
                    errMsg = 'Данные о пользователе. Сервер не отвечает.'
                }else{
                    errMsg = 'Данные о пользователе не получены';
                }
                console.error(errMsg);
            });       
    }

    hasAuthority(authName){
        return this.authorities.includes(authName);
    }

    amIhr(){
        return this.hasAuthority('editAll');
    }

}