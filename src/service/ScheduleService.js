import axios from 'axios'
import AppSets from '../service/AppSettings'
import axiosRetry from 'axios-retry';

export default class ScheduleService {
    constructor(){
        axios.defaults.baseURL = AppSets.host;
        axios.defaults.headers.common['Authorization'] = window.sessionStorage.getItem('token');
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        this.moment = require('moment');
    }    

    getScheduleRecordById(id, _this, processResult){
        const server = AppSets.host;
        const url = server + '/schedule/getrow/'+id
        axios.get(url)
            .then(res => res.data)
            .then(row => {
                if (_this){
                    _this.setState({rowData: row});
                    processResult && processResult(row)
                }
            })
            .catch(err => {
                this.processRequestsCatch(err, 'Расписания сотрудника на день.', _this.messages);
            });
    }

    getMonthScheduleByPerson(month, person, _this, year) {
        if (!person || (month < 0)){
            return [];
        }
        if (!year)
            year = this.moment().year();
        const server = AppSets.host;
        const url = server + '/schedule/employee/'+person+"/"+month+"/"+year
        axios.get(url,{timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this){
                    _this.setState({ days: data });
                    this.updateSummary(data, _this);
                }
                return data;
            })
            .catch(err => {
                this.processRequestsCatch(err, 'Отработанное время.', _this.messages);
            });
    }

    strTimeToMinutes(str){
        if (!str){
            return 0;
        }
        let mult = 1
        if (str.startsWith("-")){
            mult = -1
            str = str.substring(1);
        }
        let parts = str.split(":");
        return (60* parseInt(parts[0]) + parseInt(parts[1])) * mult;
    }

    minutesToTimeStr(minutes){
        let h = Math.trunc(minutes / 60);
        let hh="";
        if (h < 1){
            hh = "00"
        }else if (h < 10){
            hh = "0" + h
        }else{
            hh = h;
        }
        let m = Math.trunc(minutes - h * 60);
        let mm = "";
        if (m === 0){
            mm = "00"
        }else if (m < 10){
            mm = "0" + m;
        }else{
            mm = m;
        }
        return hh+":"+mm
    }

    updateSummary(rows,_this){
        if (!rows)
            {return}
        let totalDays = 0; //запланировано дней
        let totalDaysFact = 0; //отработано дней
        let difPlanMinutes = 0; //рабочего времени план, минуты
        let difFactMinutes = 0; //рабочего времени факт, минуты
        let latenessCount = 0; // количество опозданий
        let latenessTime = 0; // время опозданий
        let overtimeCount = 0; // количество опозданий
        let overtimeTime = 0; // время опозданий
        for(let i=0; i<rows.length;i++){
            let data = rows[i];
            if (data.rowType === 0 && data.comingFact){
                let dayOvertimeRegistered = false; //в этот день уже зарегестрирована переработка (раз), чтобы не учитывать как 2 раза утро и вечер
                let dayLatenesRegistered = false;        
                totalDays += 1
                difPlanMinutes += data.difPlanMinutes;
                if (data.comingAccepted && data.leavingAccepted){
                    totalDaysFact += 1;
                    difFactMinutes += data.workHours ;
                };            
                if (data.totalDif){
                    //считаем количество опозданий. 
                    if (data.comingDif !== ""){
                        //есть отклонение по приходу
                        let cur = this.strTimeToMinutes(data.comingDif);
                        if (cur > 0){//и оно больше 0 - это переработка
                            dayOvertimeRegistered = true;
                            overtimeCount++;
                        }else{// отрицательное отклонение - опоздание
                            dayLatenesRegistered = true;
                            latenessCount++;
                        }
                    }
                    //аналогично количество опозданий и овертаймов по уходу
                    if (data.leavingDif !== ""){
                        let cur = this.strTimeToMinutes(data.leavingDif);
                        if (cur > 0){
                            if (!dayOvertimeRegistered) 
                                { overtimeCount++ };
                        }else{
                            if (! dayLatenesRegistered )
                                { latenessCount++ };
                        }
                    }
                    //а суммарное время опоздания переработки считаем по результатам дня
                    if (data.totalDif !== ""){
                        let cur = this.strTimeToMinutes(data.totalDif)
                        if (cur > 0){
                            overtimeTime += cur;                        
                        }else{
                            latenessTime -= cur;
                        }
                    }
                }
            }else if (!(data.rowType ===1 || data.rowType ===2)){
                totalDays += 1;
            }
        }   
        let summary1 = "", summary2 = "", summary3 = "", summary4 = "", summary5 = "";
        let hhmm = "";
        let s = "";
        if (totalDays !== 0){
            summary1 = "Рабочих дней: " + totalDays
            summary2 = "Отработано дней: " + totalDaysFact
            summary3 = "Планировалось, часов: "+this.minutesToTimeStr(difPlanMinutes);
            summary4 = "Утверждено факт, часов: "+this.minutesToTimeStr(difFactMinutes) + " (утверждено)";
            if (latenessTime !== 0){
                hhmm = this.minutesToTimeStr(latenessTime).split(":");
                s = (hhmm[0] === "00") ? (hhmm[1] + " минут ") : (hhmm[0] + " часов "+hhmm[1] + " минут ")
                summary5 = ("Недоработка: " + latenessCount +" раз -> "+ s + ".");    
            }
            if (overtimeCount !== 0){
                hhmm = this.minutesToTimeStr(overtimeTime).split(":");
                s = (hhmm[0] === "00") ? (hhmm[1] + " минут ") : (hhmm[0] + " часов "+hhmm[1] + " минут ")
                summary5 += ("Переработка: " + overtimeCount +" раз -> "+ s);    
            }
        }
        _this.setState({summary1: summary1, summary2: summary2, summary3: summary3, summary4: summary4, summary5: summary5});
    }

    getCurrentWorkDay(person, _this){
        const personId = (person && person.hasOwnProperty('employeeId') ? ('/' + person.employeeId) : '');
        const server = AppSets.host;
        let url = server + '/schedule/employee'+personId
        return axios.get(url,{timeout: AppSets.timeout})
            .then(
                res => res.data)
            .then(row => {
                if (Object.keys(row).length !== 0){
                    _this.setState({row: row, note: row.note})
                }
            })
            .catch(err => { 
                    this.processRequestsCatch(err, "Получение расписания на день", _this.messages) 
                }
            );
    }

    getWorkCalendar(start, end, onlyAbsense, orgUnit, person, _this){
        //должен вернуть данные календаря в зависимости от фильтров: весь магазин, избранный сотрудник, только дни отсутствия
        if (!(start && end) || (!person && !orgUnit)) { 
            _this.setState({ days: []});
            return
        }
        const orgUnitId = (orgUnit && orgUnit.hasOwnProperty('id') ? ('/' + orgUnit.id) : Number.isInteger(orgUnit) ? orgUnit : '');
        const personId = (person && person.hasOwnProperty('id') ? ('/' + person.id) : '');
        const server = AppSets.host;
        let url = server + '/calendar/'+start+"/"+end;
        url = url + ((onlyAbsense) ? ('/' + true) : ('/' + false));
        if (orgUnit){
            url = url + orgUnitId;    
        }
        if (person){
            if (personId){
                url = (orgUnit) ? (url + personId) : (url + "/0"  + personId);
            }else{
                return;
            }
        }
        return axios.get(url,{timeout: AppSets.timeout})
            .then(
                res => res.data)
            .then(data => {
                if (_this){
                    const notAcceptedFound = data.filter(row=>row.rowType === 0).find(row=>row.accepted === false)
                    _this.setState({ days: data,  scheduleAccepted: (notAcceptedFound === undefined)});
                    
                }
                return data;
            })
            .catch(err => { 
                    this.processRequestsCatch(err, "Получение календаря работы на месяц", _this.messages) 
                }
            );
    }


    processRequestsCatch(err, subject, messages, sticky=false){
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
        }else if (err.response.status === 303 && err.response.hasOwnProperty("data")){
            errMsg = err.response.data;
        }else{
            console.log(err.response.data);
            errMsg = subject+'. Непредусмотренная ошибка';
        }
        if (messages){
            errMsg = (subject) ? subject + '. ' + errMsg : errMsg; 
            messages.show({ severity: 'error', summary: errMsg, sticky: sticky});
        }else{
            console.error(errMsg);
            if (err.response){
                console.error(err.response.data)
            }else{
                console.error(err.toString());
            }
        }
        return errMsg;
    }

    getMonthCalendarByPerson(start, end, person, _this) {
        if (!person){
            return [];
        }
        const server = AppSets.host;
        const url = server + '/calendar/employee/'+person+"/"+start+"/"+end
        return axios.get(url,{timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this){
                    _this.setState({ days: data });
                }
                return data;
            })
            .catch(err => {
                let errMsg = "";
                if (err.toString().includes(': Network')){
                    errMsg = 'Планирование рабочего времени. Сервер не отвечает.'
                }else{
                    errMsg = 'Планирование рабочего времени. Данные не получены';
                }
            _this.messages.show({ severity: 'warn', summary: errMsg});
            });
    }

    getMonthCalendarByOrgUnit(start, end, orgunit, _this) {
        if (!(start && end && orgunit)){
            return [];
        }
        const server = AppSets.host;
        const url = server + '/calendar/orgUnit/'+orgunit+"/"+start+"/"+end
        return axios.get(url,{timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this){
                    _this.setState({ days: data });
                }
                return data;
            })
            .catch(err => {
                let errMsg = "";
                if (err.toString().includes(': Network')){
                    errMsg = 'Планирование рабочего времени. Сервер не отвечает.'
                }else{
                    errMsg = 'Планирование рабочего времени. Данные не получены';
                }
            _this.messages.show({ severity: 'warn', summary: errMsg});
            });
    }


    getMonthCalendarCommon(start, end, _this) {
        if (!start){
            return [];
        }
        const server = AppSets.host;
        const url = server + '/calendar/'+start+"/"+end
        return axios.get(url,{timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this){
                    _this.setState({ days: data });
                }
                return data;
            })
            .catch(err => {
                let errMsg = "";
                if (err.toString().includes(': Network')){
                    errMsg = 'Планирование рабочего времени. Сервер не отвечает.'
                }else{
                    errMsg = 'Планирование рабочего времени. Данные не получены';
                }
            _this.messages.show({ severity: 'warn', summary: errMsg});
            });
    }


    getMonthCalendarByPersonInt(month, person, _this) {
        if (!person || (month < 0)){
            return [];
        }
        const server = AppSets.host;
        const url = server + '/calendar/employee/'+person+"/"+month
        return axios.get(url,{timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this){
                    _this.setState({ days: data });
                }
                return data;
            })
            .catch(err => {
                let errMsg = "";
                if (err.toString().includes(': Network')){
                    errMsg = 'Планирование рабочего времени. Сервер не отвечает.'
                }else{
                    errMsg = 'Планирование рабочего времени. Данные не получены';
                }
            _this.messages.show({ severity: 'warn', summary: errMsg});
            });
    }

    deleteSchedule(payload, _this){
        const server = AppSets.host;
        const query = "/calendar/deleteForPerson" ;
        const url = server + query;
        axios.delete(url, {data: payload},{timeout: AppSets.timeout})
            .then((res)=>{
                _this.messages.show({ severity: 'success', summary: 'Записи расписания успешно удалены'});
                _this.setState({showConfirm: false});
                _this.updateCalendar(_this.chosenOrgUnit);
            })
            .catch(err => {
                this.processRequestsCatch(err, 'Проверка расписания.', _this.messages);
                _this.setState({showConfirm: false});
        });
    }

    verifySchedule(payload, _this){
        const server = AppSets.host;
        const query = "/calendar/verify";
        const url = server + query;
        axios.post(url, payload, {timeout: AppSets.timeout})
            .then((res)=>{
                const answer = res.data;
                if (answer.startsWith("Порядок")){
                    _this.messages.show({ severity: 'success', summary: answer});
                }else{
                    _this.messages.show({ severity: 'warn', summary: answer, sticky: true});
                }
            })
            .catch(err => {
                this.processRequestsCatch(err, 'Проверка расписания.', _this.messages);
            })
    }

    createSchedule(payload, _this, action){
        const server = AppSets.host;
        const query = "/schedule/create";
        const url = server + query;
        axios.post(url, payload, {timeout: AppSets.timeout})
            .then(()=>{
                _this.messages.show({ severity: 'success', summary: 'Выполнено успешно'});
                action()
            })
            .catch(err => {
                this.processRequestsCatch(err, 'Создание расписания', _this.messages);
            })
    }

    acceptSchedule(payload, _this, finalize=null){
        const server = AppSets.host;
        const query = "/schedule/accept";
        const url = server + query;
        axios.post(url, payload, {timeout: AppSets.timeout})
            .then((res)=>{
                if (res.data === 'Ok'){
                    _this.messages.show({ severity: 'success', summary: 'Выполнено успешно'});
                    if (finalize)
                        {finalize()}
                }else{
                    _this.messages.show({ severity: 'warn', summary: 'В расписании нет ни одной записей, которыые подлежат утверждению.'});
                }
            })
            .catch(err => {
                this.processRequestsCatch(err, 'Утверждение расписания', _this.messages);
            })
    }


    orgUnitRemove(id, _this, action){
        const server = AppSets.host;
        const query = "/dictionary/orgunit/delete/"+id;
        const url = server + query;
        axios.delete(url, {timeout: AppSets.timeout})
            .then(()=>{
                action();
            })
            .catch(err => {
                this.processRequestsCatch(err, 'Удаление подразделения.', _this.messages);
            })
    }

    scheduleShiftRemove(_this, action){
        const server = AppSets.host;
        const query = "/schedule/shift/remove/"+_this.state.chosenShift.id;
        const url = server + query;
        axios.delete(url, {timeout: AppSets.timeout})
            .then(()=>{
                action();
            })
            .catch(err => {
                this.processRequestsCatch(err, 'Удаление смены.', _this.messages);
            })
    }

    acceptJobTimeByPlan(ids, startDate, employeeId, _this){
        const server = AppSets.host;
        const month = new Date(startDate).getMonth();
        const query = "/schedule/acceptTimeMonth/" + ids + "/" + AppSets.timeBoundMinutes;
        const url = server + query;
        axios.put(url,{timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this && data){
                    _this.props.updateData(month, employeeId);        
                    _this.messages.show({ severity: 'success', summary: 'Выполнено успешно'});
                }
            })
            .catch(err => {
                const errMsg = err.toString().includes(': Network') ? 
                    'Подтверждение прихода или ухода. Сервер не отвечает.' :  'Не удалось записать изменение в графике прихода и ухода'
                _this.messages.show({ severity: 'warn', summary: errMsg})
            });
    }

    acceptJobTime(selected, mode, _this){
        const server = AppSets.host;
        const query = "/schedule/acceptTime/" + selected.id + "/" + mode + "/" + selected.orgUnitName;
        const url = server + query;
        axios.get(url,{timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this && data){
                    const month = new Date(selected.comingPlan).getMonth();
                    _this.props.updateData(month, selected.employeeId);        
                    _this.messages.show({ severity: 'success', summary: 'Выполнено успешно'});
                }
            })
            .catch(err => {
                const errMsg = err.toString().includes(': Network') ? 
                    'Подтверждение прихода или ухода. Сервер не отвечает.' :  'Не удалось записать изменение в графике прихода и ухода'
                _this.messages.show({ severity: 'warn', summary: errMsg})
            });
    }

    acceptJobTimeUpdate(field, selected, timeValue, _this){
        const server = AppSets.host;
        const id = selected.id;
        const query = "/schedule/acceptTimeUpdate/" + field + "/" + id + "/" + timeValue;
        const url = server + query;
        axios.put(url,{timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this && data){
                    _this.messages.show({ severity: 'success', summary: 'Выполнено успешно'});        
                    _this.props.updateDaysRow(data)
                }
            })
            .catch(
                err => {
                    const errMsg = err.toString().includes(': Network') ? 
                        'Подтверждение прихода или ухода. Сервер не отвечает.' : 'Не удалось записать изменение в графике прихода и ухода'
                    _this.messages.show({ severity: 'warn', summary: errMsg});
                }
            );
    }    

    notesUpdate(data, fieldName, _this){
        const server = AppSets.host;
        const id = data.id;
        const notes = data[fieldName];
        let note = notes ? notes : '-';
        const query = "/schedule/notesUpdate/" + id + "/" + fieldName + "/" + note;
        const url = server + query;
        axios.put(url,{timeout: AppSets.timeout} )
            .then(_this.messages.show({severity: 'success', summary: 'Выполнено успешно'}))
            .catch(err=>{
                this.processRequestsCatch('','Ввод примечаний',_this.messages,true)
            })

    }

    saveOrgUnit(_this, orgUnitId){
        const orgUnitName = _this.state.orgUnitName;
        const server = AppSets.host;
        let query = '/dictionary/orgunit/save'
        const url = server + query;
        axios.put(url, {'id': orgUnitId, name: orgUnitName, 'isra_id': _this.state.israId}, {timeout: AppSets.timeout})
        .then(res => res.data)
        .then(res => {
            _this.messages.show({severity:'success', summary:'Сохранено успешно!'});
            if (_this.state.hasOwnProperty("israId"))
                _this.setState({israId: null});
            AppSets.getOrgUnitList(_this);
            }
        )
        .catch(
            err => {
                let errMsg = '';
                if (err.toString().includes(': Network')){
                    errMsg = 'Запись нового подразделения. Сервер не отвечает.'
                } else if (err.toString().includes('Constraint')){
                    errMsg= " Подразделение с таким именем уже есть.";
                }else{
                    errMsg = 'Не удалось записать сведения о подразделении';
                }
                _this.messages.show({ severity: 'warn', summary: errMsg});
            }
        );

    }

    saveShift(_this){
        const server = AppSets.host;
        const query = "/schedule/shift/save";
        const url = server + query;
        const id = (_this.state.chosenShift) ? _this.state.chosenShift.id : null;
        const ou = _this.state.selectedRow;

        axios.put(url, {'id': id,
            'start1': _this.state.start1, 'end1': _this.state.end1,
            'start2': _this.state.start2, 'end2': _this.state.end2,
            'start3': _this.state.start3, 'end3': _this.state.end3,
            'start4': _this.state.start4, 'end4': _this.state.end4,
            'start5': _this.state.start5, 'end5': _this.state.end5,
            'start6': _this.state.start6, 'end6': _this.state.end6,
            'start7': _this.state.start7, 'end7': _this.state.end7,
            'orgUnitId': ou.id,
            'no': _this.state.shiftNo,
            'notes': _this.state.notes,
        },{timeout: AppSets.timeout})
            .then(res => res.data)
            .then(res => {
                _this.messages.show({severity:'success', summary:'Сохранено успешно!'})
                window.location.reload();
                }
            )
            .catch(
                err => {
                    let errMsg = '';
                    if (err.toString().includes(': Network')){
                        errMsg = 'Запись графика смены. Сервер не отвечает.'
                    } else if (err.toString().includes('Constraint')){
                        errMsg= "Введен неправильный номер смены. У этого подразделения уже есть смена с таким номером";
                    }else{
                        errMsg = 'Не удалось записать расписание смены';
                    }
                    _this.messages.show({ severity: 'warn', summary: errMsg});
                }
            );

    }

    async getFiredEmployees(_this){
        return await axios.get(AppSets.host+'/employee/inactive/list',{timeout: AppSets.timeout})
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


    getSellers(){
        let employees = AppSets.getEmployees();
        const result = [];
        for(let empl in employees){
            let info = {id: empl.id, thename : (empl.lastName + ' ' + empl.firstName).trim()}
            result.push(info);
        }
        return result;
    }

    getOrgUnitShifts(orgunitId, _this) {
        const server = AppSets.host;
        if (!orgunitId) 
            {return};
        const url = server + '/schedule/shifts/'+orgunitId
        axios.get(url,{timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this){
                    _this.setState({ shifts: data });
                }
                return data;
            })
            .catch(err=>{
                const errMsg = err.toString().includes(': Network') ? 
                    'Получение списка смен. Сервер не отвечает.' : "Не удалось получить список смен";
                _this.messages.show({ severity: 'warn', summary: errMsg})
            });
    }

    updateSelectedRowInView(selectedData, _this){
        let list = _this.props.days;
        const selected = selectedData['data']
        let index = -1;
        for(let i=0; i < list.length; i++){
            if (selected.id === list[i]['id']){
                index = i;
                break;
            }
        }
        if (index !== -1){
            list[index] = selected;
            _this.props.updateDaysState(list);
        }
    }

    changeRowType(rowType, _this){
        const server = AppSets.host;
        const id = _this.state.selectedRow.id;
        const url = server + '/schedule/rowStatusChange/' + id + "/" + rowType
        axios.put(url, {}, {timeout: AppSets.timeout})
        .then(res => {
            this.updateSelectedRowInView(res, _this)
        })
        .catch(
            err => {
                let errMsg = '';
                if (err.toString().includes(': Network')){
                    errMsg = 'Изменение типа столбца (причина отсутствия). Сервер не отвечает.'
                }else{
                    errMsg = 'Не удалось записать изменение типа столбца (причина отсутствия)';
                }
                _this.messages.show({ severity: 'warn', summary: errMsg});
            }
        );
    }

    saveDayOff(_this){
        const server = AppSets.host;
        const url = server + '/schedule/newVacation'
        const formattedStart = this.moment(_this.state.start).format('YYYY-MM-DD')+" "+AppSets.minStartTime;
        const formattedEnd = this.moment(_this.state.end).format('YYYY-MM-DD')+" "+AppSets.maxEndTime;
        const data = {"employeeId" : _this.state.employee.id, "orgUnitId": _this.state.employee.orgUnitId,
            "comingPlan":formattedStart, "leavingPlan":formattedEnd, 
            "reason": _this.state.reason, "rowType": _this.state.eventType.id, photoFile: _this.state.photoFile}
        axios.post(url, data, 
            {timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this){
                    //_this.props.history.goBack()
                    _this.messages.show({severity:'success', summary:'Выполнено успешно'})
                }
                return data;
            })
            .catch(err=>{
                const errMsg = err.toString().includes(': Network') ? 
                    'Запись об отсутствии на работе. Сервер не отвечает.' : "Не удалось записать запись: "+_this.state.eventType;
                _this.messages.show({ severity: 'warn', summary: errMsg})
            });
    }

    deleteDayOff(_this, finalActions){
        const server = AppSets.host;
        const formattedStart = this.moment(_this.state.start).format('YYYY-MM-DD');
        const url = server + '/calendar/deleteVacationForPerson/'+_this.state.id + "/" +formattedStart;
        axios.delete(url, {timeout: AppSets.timeout})
            .then(() => {
                if (finalActions)
                    {finalActions()}
            })
            .catch(err=>{
                _this.hideConfirmationDlg();
                this.processRequestsCatch(err, "Удаление записи об отсутствии", _this.messages, true);
            })
    }

    acceptDaysOff(_this, finalActions){
        const server = AppSets.host;
        const formattedStart = this.moment(_this.state.start).format('YYYY-MM-DD');
        const url = server + '/calendar/acceptDaysOff/'+_this.state.id + "/" +formattedStart;
        axios.delete(url, {timeout: AppSets.timeout})
            .then(() => {
                if (finalActions)
                    {finalActions()}
            })
            .catch(err=>{
                _this.hideConfirmationDlg();
                this.processRequestsCatch(err, "Удаление записи об отсутствии", _this.messages, true);
            })

    }

    saveRow(_this){
        let payload = {"comingPlan": _this.state.rowData.comingPlan, "start": _this.state.start, "end": _this.state.end, 
                        "rowType": _this.state.chosenType.id,
                        "chosenEmployeeId": _this.state.chosenEmployee.id, "chosenOrgUnitId": _this.state.chosenOrgUnit.id, 
                        "id": _this.state.rowData.id, "note": _this.state.note, "reason": _this.state.reason}
        const server = AppSets.host;
        const url = server + '/schedule/row/update'
        axios.post(url, payload, {timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                _this.messages.show({severity: 'success', summary: 'Расписание обновлено'})
                _this.props.history.goBack()
            })
            .catch(err=>{
                this.processRequestsCatch(err, "Изменение записи в расписании", _this.messages, true);
        });                    
    }

    deleteRow(_this){
        const server = AppSets.host;
        const url = server + '/schedule/row/delete/'+_this.state.rowData.id
        axios.delete(url, {timeout: AppSets.timeout})
        .then(res => res.data)
        .then(() => {
            _this.messages.show({severity: 'success', summary: 'Запись удалена из расписания'})
            _this.props.history.goBack()
        })
        .catch(err=>{
            this.processRequestsCatch(err, "Удаление записи из расписания", _this.messages, true);
    });                    

    }

    removeDictionaryItem(id, _this, finalProcedure){
        const server = AppSets.host;
        const url = server + '/dictionary/item/delete/'+id
        axios.delete(url, {timeout: AppSets.timeout})
            .then(() => {
                finalProcedure()
                _this.messages.show({severity: 'success', summary: 'Запись удалена'})
            })
            .catch(err=>{
                this.processRequestsCatch(err, "Удаление записи из словаря", _this.messages, true);
        });
    }

    saveDictionaryItem(data, _this, finalProcedure){
        const server = AppSets.host;
        const url = server + '/dictionary/item/save'
        axios.post(url, data, {timeout: AppSets.timeout})
            .then(() => {
                finalProcedure();
                _this.messages.show({severity: 'success', summary: 'Запись успешно сохранена'})
            })
            .catch(err=>{
                this.processRequestsCatch(err, "Сохранение справочных данных", _this.messages, true);
        });
    }

    openPhoto(_this){
        if (!_this.state.photoFile)
            {return}
        const query = AppSets.host+'/files/getImageByName/'+_this.state.photoFile;
        axios.get(query, { responseType: 'arraybuffer', timeout: AppSets.timeout },)
        .then(response => {
            const base64 = btoa(
                new Uint8Array(response.data).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  '',
                ),
              );
            _this.setState({photoData: "data:;base64," + base64})
        })
        .catch(err=>{
            this.processRequestsCatch(err, "Получение скан-копии документа", _this.messages);
        });
    }

    downloadFile(fileName, _this, showProgress=false){
        const server = AppSets.host;
        const query = "/files/getByName/"+fileName;
        const url = server + query;
        return axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(response=>{
            const type = response.headers['content-type'];
            const blob = new Blob([response.data], { type: type, encoding: 'UTF-8' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click()
          })
          .catch(err=>{
              this.processRequestsCatch(err,"Загрузка файла",_this.messages)
        });
    }

    getSalesInfo(employeeId, date, _this){
        if (!(employeeId && date))
            { return };
        const dateStr = this.moment(date).format('yyyy-MM-DD')
        const server = AppSets.host;
        const query = "/employee/getSales/" + employeeId + "/" + dateStr;
        const url = server + query;
        return axios.get(url, {timeout: AppSets.timeout})
            .then(response => {
                _this.setState({salesInfo: response.data})
            })
            .catch(err=>{
                this.processRequestsCatch(err,"Получение данных о продажах",_this.messages)                       
            });
    }

    async checkInOut(_this, finalActions, isIn){
        axiosRetry(axios, { retries: 5 , retryDelay: (retryCount) => {
            return retryCount * 100;
          }});
        const evt = isIn ? 'приход' : 'уход'
        const url = AppSets.host + "/employee/checkInOut/" + AppSets.getUser().employeeId;
        await axios.put(url)
            .then(response => {
                window.localStorage.removeItem('hrLog')
                if (finalActions)
                    { finalActions() }
            })
            .catch(err=>{
                if (err.response != null){
                    const errMsg = this.processRequestsCatch(err,"Отметка прихода-ухода",_this.messages, true);                       
                    this.saveLog(errMsg);
                }else{
                    //timeout
                    _this.setState({waitPlease: false});
                    _this.messages.show({severity: 'warn', sticky: true,
                            summary: 'Нет связи. Не удалось отметить '+evt+'. Повторите или обратитесь в службу поддержки!'})
                    this.saveLog(evt+" - тайм-аут");
                }
            });
    }

    saveLog(item){
        try{
            item = this.moment().format("DD-MM-YY HH:mm") + " " + item;
            let logInfo = window.localStorage.getItem("hrLog");
            let log = [];
            if (logInfo) {
                log = logInfo.split(";")
            }
            if (log.length>15) log.shift();
            log.push(item)
            window.localStorage.setItem("hrLog", log.join(";"))
        }catch(err){
            console.log(err);
        }

    }

    getSummaryReport(month, finalActions, _this){
        const url = AppSets.host + "/schedule/commonreport/" + month;
        return axios.get(url, {timeout: AppSets.timeout})
            .then(response => {
                _this.setState({data: response.data});
                if (finalActions)
                    { finalActions() }
            })
            .catch(err=>{
                this.processRequestsCatch(err,"Сводка по всем магазинам",_this.messages, true);                       
            });
    }

}