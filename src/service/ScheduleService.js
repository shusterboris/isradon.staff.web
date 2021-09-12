import axios from 'axios'
import AppSets from '../service/AppSettings'
import { row_types } from '../service/AppSettings';

export default class ScheduleService {    

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

    getMonthScheduleByPerson(month, person, _this) {
        if (!person || (month < 0)){
            return [];
        }
        const server = AppSets.host;
        const url = server + '/schedule/employee/'+person+"/"+month
        axios.get(url)
            .then(res => res.data)
            .then(data => {
                if (_this){
                    _this.setState({ days: data });
                    this.updateSummary(data, _this);
                }
                return data;
            })
            .catch(err => {
                let errMsg = "";
                if (err.toString().includes(': Network')){
                    errMsg = 'Отработанное время. Сервер не отвечает.'
                }else{
                    errMsg = 'Отработанное время. Данные не получены';
                }
            _this.messages.show({ severity: 'warn', summary: errMsg});
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
        let totalDays = 0; //отработано дней
        let difPlanMinutes = 0; //рабочего времени план, минуты
        let difFactMinutes = 0; //рабочего времени факт, минуты
        let latenessCount = 0; // количество опозданий
        let latenessTime = 0; // время опозданий
        let overtimeCount = 0; // количество опозданий
        let overtimeTime = 0; // время опозданий
        for(let i=0; i<rows.length;i++){
            let data = rows[i];
            if (data.rowType === 0 && data.comingFact){
                totalDays += 1
                difPlanMinutes += data.difPlanMinutes;
                difFactMinutes += data.workHours;            
                if (data.totalDif){
                    //считаем количество опозданий. 
                    if (data.comingDif !== ""){
                        //есть отклонение по приходу
                        let cur = this.strTimeToMinutes(data.comingDif);
                        if (cur > 0){//и оно больше 0 - это переработка
                            overtimeCount++;
                        }else{// отрицательное отклонение - опоздание
                            latenessCount++;
                        }
                    }
                    //аналогично количество опозданий и овертаймов по уходу
                    if (data.leavingDif !== ""){
                        let cur = this.strTimeToMinutes(data.leavingDif);
                        if (cur > 0){
                            overtimeCount++;
                        }else{
                            latenessCount++;
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
            }
        }
        let summary = "";
        if (totalDays !== 0){
            summary = "Отработано, дней:"+totalDays+", часов:"+this.minutesToTimeStr(difFactMinutes)+", по плану:"+this.minutesToTimeStr(difPlanMinutes)
            if (latenessTime !== 0){
                summary += (". Опоздания: " + latenessCount +" раз, "+ this.minutesToTimeStr(latenessTime) + " час");    
            }
            if (overtimeCount !== 0){
                summary += (". Переработка: " + overtimeCount +" раз, "+ this.minutesToTimeStr(overtimeTime) + " час");    
            }
        }
        _this.setState({summary: summary});
    }

    getWorkCalendar(start, end, onlyAbsense, orgUnit, person, _this){
        //должен вернуть данные календаря в зависимости от фильтров: весь магазин, избранный сотрудник, только дни отсутствия
        if (!(start && end)) { 
            _this.setState({ days: []});
            return
        }
        const server = AppSets.host;
        let url = server + '/calendar/'+start+"/"+end;
        url = url + ((onlyAbsense) ? ('/' + true) : ('/' + false));
        if (orgUnit){
            url = url + (orgUnit.hasOwnProperty('id') ? ('/' + orgUnit.id) : '');    
        }
        if (person){
            url = url + (person.hasOwnProperty('id') ? ('/' + person.id) : '');
        }
        return axios.get(url)
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

    getMonthCalendarByPerson(start, end, person, _this) {
        if (!person){
            return [];
        }
        const server = AppSets.host;
        const url = server + '/calendar/employee/'+person+"/"+start+"/"+end
        return axios.get(url)
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
        return axios.get(url)
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
        return axios.get(url)
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
        return axios.get(url)
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

    acceptSchedule(payload, _this){
        const server = AppSets.host;
        const query = "/schedule/accept";
        const url = server + query;
        axios.post(url, payload, {timeout: AppSets.timeout})
            .then((res)=>{
                if (res.data === 'Ok'){
                    _this.messages.show({ severity: 'success', summary: 'Выполнено успешно'});
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
        const query = "/schedule/acceptTimeMonth/" + ids;
        const url = server + query;
        axios.get(url)
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
        axios.get(url)
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
        axios.put(url)
            .then(res => res.data)
            .then(data => {
                if (_this && data){
                    const month = new Date(selected.comingPlan).getMonth();
                    _this.messages.show({ severity: 'success', summary: 'Выполнено успешно'});        
                    _this.props.updateData(month, selected.employeeId);
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
        const notes = data.note;
        const query = "/schedule/notesUpdate/" + id + "/" + fieldName + "/" + notes;
        const url = server + query;
        axios.put(url, )
            .then(_this.messages.show({severity: 'success', summary: 'Выполнено успешно'}))
            .catch(err=>{
                this.processRequestsCatch('','Ввод примечаний',_this.messages,true)
            })

    }

    saveOrgUnit(_this, orgUnitId, orgUnitName){
        const server = AppSets.host;
        let query = '/dictionary/orgunit/save'
        const url = server + query;
        axios.put(url, {'id': orgUnitId, name: orgUnitName}, {timeout: AppSets.timeout})
        .then(res => res.data)
        .then(res => {
            _this.messages.show({severity:'success', summary:'Сохранено успешно!'});
            window.location.reload();
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
        }, {timeout: 5000})
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
        return await axios.get(AppSets.host+'/employee/inactive/list')
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
        const url = server + '/schedule/shifts/'+orgunitId
        axios.get(url)
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
        const moment = require('moment');
        const formattedStart = moment(_this.state.start).format('YYYY-MM-DD')+" "+AppSets.minStartTime;
        const formattedEnd = moment(_this.state.end).format('YYYY-MM-DD')+" "+AppSets.maxEndTime;
        const rowType = row_types.find(rt=>rt.code === _this.state.eventType);

        axios.post(url, 
            {"employeeId" : _this.state.employee.id, "comingPlan":formattedStart, "leavingPlan":formattedEnd, "reason": _this.state.reason, "rowType": rowType}, 
            {timeout: AppSets.timeout})
            .then(res => res.data)
            .then(data => {
                if (_this){
                    _this.props.history.goBack()
                }
                return data;
            })
            .catch(err=>{
                const errMsg = err.toString().includes(': Network') ? 
                    'Запись об отсутствии на работе. Сервер не отвечает.' : "Не удалось записать запись: "+_this.state.eventType;
                _this.messages.show({ severity: 'warn', summary: errMsg})
            });
    }

    saveRow(_this){
        let payload = {"comingPlan": _this.state.rowData.comingPlan, "start": _this.state.start, "end": _this.state.end, 
                        "rowType": _this.state.chosenType.id,
                        "chosenEmployeeId": _this.state.chosenEmployee.id, "chosenOrgUnitId": _this.state.chosenEmployee.id, 
                        "id": _this.state.rowData.id}
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

}