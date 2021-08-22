import axios from 'axios';
import User from '../entities/user';

export default class AppSets{
    static minStartTime = "09:00";
    static maxEndTime = "20:00";
    static timeBound = 10 * 60 * 1000; // допустимое время отклонения от запланированного времени прихода/ухода в милисекундах  
    static dayOffTimeLag = 10; //за какое количество дней пользователь может планировать отпуск
    static host = 'http://localhost:8080';
    //static host = "https://test.sclub.in.ua";
    static timeout = 2000;
    
    static getCurrentUser(id){       
        let user = new User(id)
        user.init()
        AppSets.user = user;
    }

    static getUser(){
        return AppSets.user
    }

    static getCurrentEmployee(){
        return axios.get(AppSets.host+'/employee/byId/7')
        .then(result=> result.data)
        .then(data => {
            AppSets.curEmployee = data;
            this.getCurrentUser(data.userId);
        })    
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
                AppSets.processRequestsCatch(err, "Справочник подразделений", _this.messages, false)
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
                AppSets.processRequestsCatch(err, "Справочник подразделений", _this.messages, false)
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
                AppSets.processRequestsCatch(err, "Список сотрудников", _this.messages, true)
            });
    }

    static saveEmployee(data, finalAction, _this){
        return axios.get(AppSets.host+'/employee/save')
            .then(res => {
                _this.messages({severity:'info', summary:'Успешно сохранено'});
                finalAction()
            })
            .catch(err=>{
                AppSets.processRequestsCatch(err, "Список сотрудников", _this.messages, true)
            })
    }

    static getJobTitles(_this){
        return axios.get(AppSets.host+'/dictionary/items/titlestringlist')
            .then(
                res => res.data)
            .then(data => {
                _this.setState({ jobTitles: data });
                return data;
            }).catch(err=>{
                AppSets.processRequestsCatch(err, 'Список должностей.', this.messages, false)
            });
    }
    
    static processRequestsCatch(err, subject, messages, sticky){
        let errMsg = "";
        if (err.response== null || err.toString().includes(': Network')){
            errMsg = subject+'. Сервер не отвечает. Возможно проблемы с подключением к сети...'
        }else if (err.toString().includes('status code 400')){
            errMsg = 'Неправильный запрос к системе(400). Обратитесь в техническую поддержку';
        }else if (err.toString().includes('status code 405')){
            errMsg = 'Неправильный запрос к системе(405). Обратитесь в техническую поддержку';
        }else if (err.toString().includes('status code 500')){
            errMsg = 'Сервер не может обработать запрос(500). Обратитесь в техническую поддержку';
        }else if (err.toString().includes('status code 403')){
            errMsg = 'Недостаточно прав. Обратитесь в IT-службу компании';
        }else{
            console.log(err.response.data);
            errMsg = subject+'. Непредусмотренная ошибка';
        }
        if (messages){
            messages.show({ severity: 'error', summary: errMsg, sticky: sticky});
        }else{
            console.error(errMsg);
            if (err.response){
                console.error(err.response.data)
            }else{
                console.error(err.toString());
            }
        }
    }
    
}

export const row_types = [{name: 'Работа', id: 0}, {name: 'Отпуск', id: 2}, {name: 'Неоплачиваемый отпуск', id: 3},
                            {name: 'Больничный', id: 4}, {name: 'Прогул', id: 5}]

export const ru = {
    firstDayOfWeek: 0,
    dayNames: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    dayNamesShort: ["Вск", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"],
    dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    monthNamesShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авн", "Сен", "Окт", "Ноя", "Дек"],
    today: "Сегодня",
    clear: "Очистить"
}

AppSets.getCurrentEmployee();