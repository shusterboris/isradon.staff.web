import axios from 'axios';
import User from '../entities/user';

export default class AppSets{
    static dateformat = new Intl.DateTimeFormat('ru-RU');
    static hhmmFormat = new Intl.DateTimeFormat('ru-RU', {hour: "2-digit", minute: "2-digit"});
    static minStartTime = "07:00";
    static maxEndTime = "20:00";
    static timeBound = 10 * 60 * 1000; // допустимое время отклонения от запланированного времени прихода/ухода в милисекундах  
    static dayOffTimeLag = 10; //за какое количество дней пользователь может планировать отпуск
    static host = 'http://10.100.102.58:8080';
    static timeout = 5000;
    static mmyyFormat = new Intl.DateTimeFormat('ru', {month: "2-digit", year: "numeric"});
    static user = AppSets.getCurrentUser()
    
    static getCurrentUser(){
        const user = new User('hr')
        return user;
    }

    static getHolydays(){
        const holyStr = '2021-09-07, 2021-09-08,2021-09-16,2021-09-21,2021-09-28';
        let result = [];
        if (! holyStr)
            return [];
        let holyStrList = holyStr.split(",")
        for(let i=0; i < holyStrList.length; i++){
            try{
                let current = new Date(holyStrList[i]);
                result.push(current);
            }catch{
                console.error("Неправильный формат даты одного из праздников")
            }
        }
        return result;
    }
    
    static getOrgUnits(_this) {
        return axios.get(AppSets.host+'/dictionary/orgunit/stringlist')
            .then(
                res => res.data)
            .then(data => {
                _this.setState({ orgUnits: data });
                return data;
            })
            .catch(err=>{
                const errMsg = err.toString().includes(': Network') ? 
                    'Список подразделений. Сервер не отвечает.' : 'Не удалось получить справочник подразделений.'
                _this.messages.show({severity: 'warn', summary: errMsg })
            });
    }


    static getOrgUnitList(_this) {
        return axios.get(AppSets.host+'/dictionary/orgunit/list')
            .then(
                res => res.data)
            .then(data => {
                _this.setState({ orgUnits: data, waitPlease: false });
                return data;
            }).catch(err=>{
                const errMsg = err.toString().includes(': Network') ? 
                    'Справочник подразделений. Сервер не отвечает.' : 'Не удалось получить данные о справочнике подразделений.'
                _this.messages.show({severity: 'warn', summary: errMsg })
            });
    }

    static async getEmployees(_this){
        return await axios.get(AppSets.host+'/employee/active/list')
            .then(
                res => res.data)
            .then(data => {
                if (_this){
                    _this.setState({ employees: data });
                }
                return data;
            }).catch(err=>{
                const errMsg = err.toString().includes(': Network') ? 
                    'Список сотрудников. Сервер не отвечает.' : 'Не удалось получить список сотрудников.'
                _this.messages.show({severity: 'warn', summary: errMsg })
            });
    }

    static getJobTitles(_this){
        return axios.get(AppSets.host+'/dictionary/items/titlestringlist')
            .then(
                res => res.data)
            .then(data => {
                _this.setState({ jobTitles: data });
                return data;
            }).catch(err=>{
                const errMsg = err.toString().includes(': Network') ? 
                    'Список должностей. Сервер не отвечает.' : 'Не удалось получить список должностей из справочника'
                _this.messages.show({severity: 'warn', summary: errMsg })
            });
    }


}