import axios from 'axios';
import User from '../entities/user';

export default class AppSets{
    static minStartTime = "04:00";
    static maxEndTime = "20:00";
    static timeBoundMinutes = 5;
    static timeBound = AppSets.timeBoundMinutes * 60 * 1000; // допустимое время отклонения от запланированного времени прихода/ухода в милисекундах  
    static restTimeLag = 10; //за какое количество дней пользователь может планировать отпуск
    static dayOffTimeLag = 2; //за какое количество дней пользователь может планировать отпуск за свой счет
    static host = 'http://localhost:8080';
    //static host = "https://test.sclub.in.ua";
    //static host = "https://smart.sclub.in.ua";
    static version = "ver. 1.6"
    static timeout = 5000;
    static authList = {'editAll': 'HR', 'manualCheckIn': 'Ручная отметка'};
        
    static authenticateUser(userName, password, newPassword, showMessage, history){
		const server = AppSets.host;
        let url = server + '/auth';
		const data = {"username": userName, "password": password, "newPassword": newPassword};
		axios.post(url, data, {headers: {'Content-Type': 'application/json'}, timeout: AppSets.timeout})
		.then(res=>{
			const token = "Bearer " + res.data.jwttoken;
			window.sessionStorage.setItem("token", token);
			const headers = {headers: {'Authorization': token}}
            // данные о сотруднике и полномочия пользователя
            url = server + '/user/authorities/'+userName;
			axios.get(url, headers, {timeout: AppSets.timeout})
			.then(userInfo=>{
                const user = new User(userInfo.data);
                const userString = JSON.stringify(user);
                AppSets.user = user;
                window.sessionStorage.setItem("user", userString);
                window.location = !user.isPortable() ? "/summary" : "/inout";
			})
            .catch((err)=>{
                let errMsg = "";
                if (!err.response){
                    errMsg = 'Нет связи с сервером!'
                }else{
                    errMsg = (err.response.data) ? err.response.data : 'Непредвиденная ошибка (' + err.response.status + '). Обратитесь в тех. поддержку'
                }
                showMessage({severity: 'error', summary: errMsg});
            })// получения данных о сотруднике
        })// получения токена 
		.catch((err)=>{
            if (!err.response){
                showMessage({severity: 'error', summary: 'Нет связи с сервером!'});
            }else{
                if (err.response.status === 401 || err.response.status === 403){
                    window.location="/access"
                }else{
                    showMessage({severity: 'error', summary: 'Непредвиденная ошибка (' + err.response.status + '). Обратитесь в тех. поддержку', sticky: true})
                }
            }
        });
    }

    static clearUser(){
        AppSets.user = null;
        window.sessionStorage.removeItem("chosenEmployee")
        window.sessionStorage.removeItem("user")
    }

    static getUser(){
        if (AppSets.user){
            return AppSets.user;
        }else{
            let userData = window.sessionStorage.getItem("user");
            if (!userData)
                {return null}
            const userInfo = JSON.parse(userData);
            const user = new User(userInfo);
            AppSets.user = user;
        }
        return AppSets.user;
    }

    static async getOrgUnits(_this) {
        try {
            const res = await axios.get(AppSets.host + '/dictionary/orgunit/stringlist',{timeout: AppSets.timeout});
            const data = res.data;
            _this.setState({ orgUnits: data });
            return data;
        } catch (err) {
            AppSets.processRequestsCatch(err, "Справочник подразделений", _this.messages, false);
        }
    }

    static async getOrgUnitById(id, _this, actions) {
        try {
            if (!id || !Number.isInteger(id))
                {return};
            const res = await axios.get(AppSets.host + '/dictionary/orgunit/findById/' + id ,{timeout: AppSets.timeout});
            _this.setState({ chosenOrgUnit: res.data });
            if (actions){
                actions(res.data);
            }
        } catch (err) {
            AppSets.processRequestsCatch(err, "Данные о подразделении", _this.messages, false);
        }
    }    

    static getOrgUnitList(_this, includeDeleted = false) {
        let query = (!includeDeleted) ? '/dictionary/orgunit/list' : '/dictionary/orgunit/listAll'
        return axios.get(AppSets.host + query,{timeout: AppSets.timeout})
            .then(
                res => res.data)
            .then(data => {
                _this.setState({ orgUnits: data, waitPlease: false });
            }).catch(err=>{
                AppSets.processRequestsCatch(err, "Справочник подразделений", _this.messages, false)
            });
    }

    static async getEmployees(_this, id=undefined){
        let query = AppSets.host+'/employee/active/list';
        if (id)
            { query = query + "/" + id}
        return await axios.get(query, {timeout: AppSets.timeout})
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

    static createEmployeeProxy(edata){
        const data = {"addConditions": edata.addConditions, "birtday": edata.birtday, "daysInWeek": edata.daysInWeek, 
            "email": edata.email, "firstName": edata.firstName, "lastName": edata.lastName, "id": edata.id, 
            "jobTitle": edata.jobTitle, "nickName": edata.nickName, "photoFile": edata.photoFile, "shiftLength": edata.shiftLength,
            "shiftLengthOnFriday": edata.shiftLengthOnFriday, "working": edata.working, "phone": edata.phone, "orgUnit": edata.orgUnit }
        return data;
    }

    static saveEmployee(edata, _this, finalize){
        const data = AppSets.createEmployeeProxy(edata);
        if (data.orgUnit){
            if (Number.isInteger(data.orgUnit)){
                data.orgUnitId = data.orgUnit;
                data.orgUnit = "";
            }else{
                data.orgUnitId = data.orgUnit.id;
                data.orgUnit = data.orgUnit.name;
            }
        }
        if (Number.isNaN(data.shiftLengthOnFriday)){
            data.shiftLengthOnFriday = null
        }else if (typeof data.shiftLengthOnFriday === 'string' || data.shiftLengthOnFriday instanceof String){
            data.shiftLengthOnFriday = parseFloat(data.shiftLengthOnFriday);
        }
        if (data.shiftLength === '')
            {data.shiftLength = null}
        if (data.daysInWeek === '')
            {data.daysInWeek = null}
        return axios.post(AppSets.host+'/employee/save', data,{timeout: AppSets.timeout})
            .then((result) => {
                if (data.birtday){
                    const classic = data.birtday;
                    const birthday = this.moment(classic,"DD/MM/yyyy").format("yyyy-MM-DD")
                    data.birthday = birthday;
                }
                _this.setState({id: result.data});
                _this.messages.show({severity:'success', summary:'Успешно сохранено'});
                if (finalize)
                    { finalize() }
            })
            .catch(err=>{
                AppSets.processRequestsCatch(err, "Информация о сотруднике", _this.messages, true)
            })
    }

    static loadUserData(_this, userName){
        if (!userName)
            {return}
        let token = window.sessionStorage.getItem("token");
        const headers = {headers: {'Authorization': token}, timeout: AppSets.timeout}
        // данные о сотруднике и полномочия пользователя
        const url = AppSets.host + '/user/authorities/'+userName;
        axios.get(url, headers)
        .then(userInfo=>{
            _this.setState({userInfo: userInfo.data});
        })
        .catch((err)=>{
            let errMsg = "";
            if (!err.response){
                errMsg = 'Нет связи с сервером!'
            }else{
                errMsg = (err.response.data) ? err.response.data : 'Непредвиденная ошибка (' + err.response.status + '). Обратитесь в тех. поддержку'
            }
            _this.messages.show({severity: 'error', summary: errMsg});
        })    
    }

    static saveUserData(userToSave, _this, finalActions){
        let token = window.sessionStorage.getItem("token");
        const headers = {headers: {'Authorization': token}, timeout: AppSets.timeout}
        let url = AppSets.host+'/user/save'
        axios.post(url, userToSave, headers)
        .then(()=>{
            if (finalActions)
                {finalActions()}
            _this.messages.show({severity:'success', summary:'Данные пользователя сохранены'})})
        .catch(err=>{
            AppSets.processRequestsCatch(err, 'Данные пользователя. ', this.messages, false)
        });
    }

    static getJobTitles(_this){
        return axios.get(AppSets.host+'/dictionary/items/titlestringlist' ,{timeout: AppSets.timeout})
            .then(
                res => res.data)
            .then(data => {
                _this.setState({ jobTitles: data });
            }).catch(err=>{
                AppSets.processRequestsCatch(err, 'Список должностей.', this.messages, false)
            });
    }
    
    static getJobTitlesDict(_this){
        return axios.get(AppSets.host+'/dictionary/items/titles', {timeout: AppSets.timeout})
            .then(
                res => res.data)
            .then(data => {
                _this.setState({ values : data });
            }).catch(err=>{
                AppSets.processRequestsCatch(err, 'Список должностей.', this.messages, false)
            });
    }

    static saveJobTitle(data, _this){
        return axios.post(AppSets.host+'dictionary/titles/save', data)
            .then(() => {
                _this.messages.show({severity:'success', summary:'Успешно сохранено'});
            })
            .catch(err=>{
                AppSets.processRequestsCatch(err, "Должность сотрудника", _this.messages, true)
            })
    }



    static processRequestsCatch(err, subject, messages, sticky){
        let errMsg = "";
        if (err.response== null || err.toString().includes(': Network')){
            errMsg = subject+'. Сервер не отвечает. Возможно проблемы с подключением к сети...'
        }else if (err.toString().includes('status code 400')){
            errMsg = 'Неправильный запрос к системе(400). Обратитесь в техническую поддержку';
        }else if (err.toString().includes('status code 415')){
            errMsg = 'Неправильный запрос к системе(415). Обратитесь в техническую поддержку';
        }else if (err.toString().includes('status code 405')){
            errMsg = 'Неправильный запрос к системе(405). Обратитесь в техническую поддержку';
        }else if (err.toString().includes('status code 500')){
            errMsg = 'Сервер не может обработать запрос(500). Обратитесь в техническую поддержку';
        }else if (err.toString().includes('status code 403')){
            errMsg = 'Недостаточно прав. Обратитесь в IT-службу компании';
        }else if (err.response.status = 303 && err.response.hasOwnProperty("data")){
            errMsg = err.response.data;
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

    static rowTypesIsEqual(t1, t2){
        if (! (t1 && t2))
            {return false};
        const type1 = t1.hasOwnProperty('id') ? t1 : AppSets.getRowType(t1);
        const type2 = t2.hasOwnProperty('id') ? t2 : AppSets.getRowType(t2);
        return type1.id === type2.id;
    }

    static getRowType(key){
        if (!key)
            {return row_types[0]}
        if (typeof key === 'number'){
            return row_types.find(v=>v.id === key);
        }else{
            return row_types.find(v=>(v.code === key || v.name === key));
        }
    }
}

export const row_types = [{name: 'Работа', id: 0, code: 'ORDINAL'}, {name: 'Праздник', id: 1, code: 'HOLIDAY'}, 
    {name: 'Отпуск', id: 2, code: 'REST'},  {name: 'Неоплачиваемый отпуск', id: 3, code: 'DAY_OFF'}, 
    {name: 'Больничный', id: 4, code: 'SEAK_LEAVE'}, {name: 'Прогул', id: 5,code: 'HOOKY'}]

export const ru = {
    firstDayOfWeek: 0,
    dayNames: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    dayNamesShort: ["Вск", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"],
    dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    monthNamesShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
    today: "Сегодня",
    clear: "Очистить"
}

