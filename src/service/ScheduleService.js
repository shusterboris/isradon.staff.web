import axios from 'axios'
import AppSets from '../service/AppSettings'

export default class ScheduleService {    

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

    createSchedule(payload, _this, action){
        const server = AppSets.host;
        const query = "/schedule/create";
        const url = server + query;
        axios.post(url, payload, {timeout: 5000})
            .then(()=>{
                _this.messages.show({ severity: 'success', summary: 'Выполнено успешно'});
                action()
            })
            .catch(err => {
                const errMsg = err.toString().includes(': Network') ? 
                    'Создание расписания. Сервер не отвечает.' :  err;
                _this.messages.show({ severity: 'error', summary: errMsg, sticky:true})
            })
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

    saveOrgUnit(_this, orgUnitId, orgUnitName){
        const server = AppSets.host;
        let query = '/dictionary/orgunit/save'
        const url = server + query;
        axios.put(url, {'id': orgUnitId, name: orgUnitName}, {timeout: 5000})
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
        const rowType = _this.state.eventType.code === 'DAY_OFF' ? 3 : 
                        _this.state.eventType.code === 'REST' ? 2 : 
                        _this.state.eventType.code === 'SICK_LEAVE' ? 4 : 0;

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

}