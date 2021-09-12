import React, { Component } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import ruLocale from '@fullcalendar/core/locales/ru';
import interactionPlugin from '@fullcalendar/interaction';
import AppSets from '../service/AppSettings'
import { AutoComplete } from 'primereact/autocomplete'; 
import ScheduleService from '../service/ScheduleService';
import { Dropdown } from 'primereact/dropdown';
import { Calendar as CalendarFld} from 'primereact/calendar';
import { InputMask } from 'primereact/inputmask';
import { ru } from '../service/AppSettings';
import { addLocale } from 'primereact/api';
import { Button } from 'primereact/button';
import {Messages} from 'primereact/messages'
import { Toolbar } from 'primereact/toolbar';
import { Menu } from 'primereact/menu'
import Confirmation from './Confirmation';
import ScheduleCreateProxy from '../entities/ScheduleCreateProxy';


export default class SchedulePlan extends Component {
    state = {days:[], selectedDates:[],
        chosenOrgUnit: null, orgUnits: [], filteredOrgUnits: [], 
        chosenEmployee: null, employees:[], filteredEmployees: [], 
        chosenShift: null, shifts: [], timeFrom:null, timeTo:null, showConfirm: false,
        wasChanged: false, scheduleAccepted: false};

    constructor(props) {
        super(props);
        addLocale('ru', ru); 
        this.dataService = new ScheduleService();
        this.moment = require('moment');
        this.chosenMonthChanged = this.chosenMonthChanged.bind(this);
        this.onOrgUnitChoose = this.onOrgUnitChoose.bind(this);
        this.searchOrgUnit = this.searchOrgUnit.bind(this);
        this.onShiftChange = this.onShiftChange.bind(this);
        this.onEmployeeChoose = this.onEmployeeChoose.bind(this);
        this.searchEmployee = this.searchEmployee.bind(this);
        this.updateCalendar = this.updateCalendar.bind(this);
        this.save = this.save.bind(this);
        this.verify = this.verify.bind(this);
        this.delete = this.delete.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.hideConfirmationDlg = this.hideConfirmationDlg.bind(this);
        this.isDataValid = this.isDataValid.bind(this);
        this.finalizeCalendarView = this.finalizeCalendarView.bind(this);
        this.selectDates = this.selectDates.bind(this);
        this.displayShiftInfo = this.displayShiftInfo.bind(this);
        this.onEventClick = this.onEventClick.bind(this);
        this.displayEmployeeInfo = this.displayEmployeeInfo.bind(this);
        this.intervalIsInPast = this.intervalIsInPast.bind(this);
        this.inputSimpleTimes = this.inputSimpleTimes.bind(this);
        this.clearEnteredShift = this.clearEnteredShift.bind(this);
        this.displayCardHeader = this.displayCardHeader.bind(this);
        this.history = props.history;
        this.storage = window.sessionStorage;
    }

    componentDidMount(){
        AppSets.getOrgUnitList(this);
        AppSets.getEmployees(this);
        const storedOrgUnit = this.storage.getItem("chosenOrgUnit")
        let valuesRestored = false;
        let ou = null;
        if (storedOrgUnit != null){
            ou = JSON.parse(storedOrgUnit)
            this.setState({chosenOrgUnit: ou});
            valuesRestored = true;
            this.dataService.getOrgUnitShifts(ou.id, this);
        }
        const storedEmployee = this.storage.getItem("chosenEmployee")
        if (storedEmployee != null){
            const empl = JSON.parse(storedEmployee);
            this.setState({chosenEmployee: empl})
            this.chosenEmployee = empl;
            valuesRestored = true
        }
        if (valuesRestored) 
            {this.updateCalendar(ou)}
    }

    updateCalendar(ou){
        if (!ou){
            ou = this.state.chosenOrgUnit;
        }
        if (ou != null && this.startStr != null  && this.endStr != null){
            this.dataService.getWorkCalendar(this.startStr, this.endStr, false, ou, this.chosenEmployee, this);
        }
    }

    chosenMonthChanged(eventInfo){
        this.startStr = eventInfo.start.toISOString().split('T')[0] + " " + AppSets.minStartTime;
        this.endStr = eventInfo.end.toISOString().split('T')[0] + " " +AppSets.maxEndTime;
        let mstart = this.moment(eventInfo.view.currentStart);
        let mend = this.moment(eventInfo.view.currentEnd);
        this.interval = [mstart.format("YYYY-MM-DD") + " 00:00",
                        mend.subtract(1, 'days').format("YYYY-MM-DD") + " " +AppSets.maxEndTime]
        this.storage.setItem("initalCalDate", mstart.toDate())
        this.updateCalendar();
    }

    selectDates(event){
        let start = this.moment(event.start)
        let end = event.end;
        let current = start;
        let result = []
        while (current.isBefore(end)){
            result.push(current.toDate());
            current = current.add(1, 'days');
        }
        this.setState({selectedDates: result});
    }

    searchOrgUnit(event){
        let filteredValues
        if (!event.query.trim().length) {
            filteredValues = [...this.state.orgUnits];
        }else{
            filteredValues = this.state.orgUnits.filter(
                (ou) => {
                    return ou.name.toLowerCase().includes(event.query.toLowerCase())
                }
            )
        }
        this.setState({filteredOrgUnits: filteredValues});
    }

    onOrgUnitChoose(ouInfo){
        this.setState({chosenOrgUnit: ouInfo, chosenShift:null, wasChanged: true});
        this.dataService.getOrgUnitShifts(ouInfo.id, this);
        this.updateCalendar(ouInfo);
        this.storage.setItem("chosenOrgUnit", JSON.stringify(ouInfo));
    }

    onShiftChange(shft){
        const s = (shft) ? shft.value : null;
        this.setState({chosenShift: s, wasChanged: true})
    }

    searchEmployee(event){
        let filteredValues
        if (!event.query.trim().length) {
            filteredValues = [...this.state.employees];
        }else{
            filteredValues = this.state.employees.filter(
                (empl) => {
                    return empl.fullName.toLowerCase().includes(event.query.toLowerCase())
                }
            )
        }
        this.setState({filteredEmployees: filteredValues});
    }

    onEmployeeChoose(empl){
        this.chosenEmployee = empl;
        this.setState({chosenEmployee: empl, wasChanged: true});
        this.updateCalendar();
        this.storage.setItem("chosenEmployee", JSON.stringify(empl)); 
    }

    onEventClick(info){
        this.props.history.push({
            pathname: '/edit-day:id', state: {id: info.event.id, 
                chosenEmployee: this.state.chosenEmployee, employees: this.state.employees,
                chosenOrgUnit: this.state.chosenOrgUnit, orgUnits: this.state.orgUnits}});
    }


    intervalIsInPast(){
        //проверяет, не приходится ли выбранный интервал на текущий или прошедший месяц
        const startInt = this.moment(this.startStr);
        const dayDifs = -1 * (startInt.diff(this.endStr, 'days'));
        //TODO Удалить !!!!! пока для отладки
        return false;
        return  startInt.month() <= (new Date).getMonth();
    }

    isDataValid(){
        if (! (this.state.chosenEmployee && this.state.chosenOrgUnit)){
            this.messages.show({ severity: 'error', sticky:true, life:5000,
                 summary: "Нельзя создавать расписание, пока не выбрано подразделение и сотрудник"});
            return false;
        }
        if (!this.state.chosenShift && (!this.state.timeFrom || !this.state.timeTo)){
            this.messages.show({ severity: 'error', sticky:true, life:5000,
                 summary: "Нельзя создавать расписание, если не выбрана смена или введен интервал времени с и по."});
                 return false;
        }else if (!this.state.chosenShift){
            //смена не задана, а времена заданы, проверяем...
            if (this.state.timeFrom>=this.state.timeTo){
                this.messages.show({ severity: 'error', sticky:true, life:5000,
                summary: "Время прихода раньше времени ухода"});
                return false;
            }else if(this.state.timeFrom<AppSets.minStartTime || this.state.timeTo>AppSets.maxEndTime){
                this.messages.show({ severity: 'error', sticky:true, life:5000,
                summary: "Введено неправильное время прихода или ухода"});
                return false;
            }
        }

        const now = this.moment();
        if (this.state.selectedDates && this.state.selectedDates.length>0){
            for(let i=0; i < this.state.selectedDates.length; i++){
                let current = this.moment(this.state.selectedDates[i])
                if (current.isBefore(now)){
                    const currentStr = current.format("DD/MM/yy")
                    let errMsg = "Как минимум, одна из дат в списке - "+currentStr+" - уже прошла. Это запрещено!";
                    this.messages.show({severity: 'error', sticky:true, life:5000, summary: errMsg});    
                    //// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!УБРАТЬ   УБРАТЬ 
                    return true;
                }
            }
        }else{//период задается выбором в календаре
            if (this.moment(this.endStr).isBefore(now)){
                this.messages.show({severity: 'error', sticky:true, life:5000,
                     summary: "Вы хотите составить расписание на ПРОШЕДШИЙ месяц. Так нельзя!"});
                return false;
            }else if (this.intervalIsInPast()){
                //если дата начала или конца периода больше текущего - ошибка
                this.messages.show({severity: 'error', sticky:true, life:5000,
                     summary: "Вы составляете расписание на месяц, но месяц уже начался. Так нельзя!"});
                return false;
            }
        }
        return true;
    }

    finalizeCalendarView(){
        this.setState({selectedDates:null, wasChanged: false});
        this.updateCalendar()
    }

    clearEnteredShift(){
        this.setState({chosenShift: null, timeFrom:null, timeTo:null, wasChanged: true});
    }

    save(){
        if (this.isDataValid()){
            let selectedDatesFormatted = [];
            for (let theDate of this.state.selectedDates){
                let formDate = this.moment(theDate).format("YYYY-MM-DD HH:mm");
                selectedDatesFormatted.push(formDate);
            }
            const shiftId = this.state.chosenShift ? this.state.chosenShift.id : null;
            let payload = new ScheduleCreateProxy(this.state.chosenOrgUnit.id, shiftId, 
                this.state.chosenEmployee.id, selectedDatesFormatted, this.interval, this.state.timeFrom, this.state.timeTo)
            this.dataService.createSchedule(payload, this, this.finalizeCalendarView);
        }
    }

    verify(){
        if (! (this.state.chosenEmployee && this.state.chosenOrgUnit)){
            this.messages.show({ severity: 'error', sticky:true, life:5000,
                 summary: "Для запуска проверки, выберите подразделение и сотрудника"});
            return;
        }
        const shiftId = this.state.chosenShift ? this.state.chosenShift.id : null;
        let payload = new ScheduleCreateProxy(this.state.chosenOrgUnit.id, shiftId, 
            this.state.chosenEmployee.id, [], this.interval, this.state.timeFrom, this.state.timeTo)
        this.dataService.verifySchedule(payload, this, this.finalizeCalendarView);
    }

    delete(){
        const shiftId = this.state.chosenShift ? this.state.chosenShift.id : null;
        const payload = new ScheduleCreateProxy(this.state.chosenOrgUnit.id, shiftId, 
            this.state.chosenEmployee.id, [], this.interval, this.state.timeFrom, this.state.timeTo)
        this.dataService.deleteSchedule(payload, this)
    }

    hideConfirmationDlg(){
        this.setState({showConfirm: false});
    }

    onDelete(){
        if (this.intervalIsInPast()){
            this.messages.show({severity:'error', summary:'Нельзя удалять расписания за прошедший период'})
            return;
        }
        this.confirmHeader='Подтвердите удаление?';
        this.confirmBody='Удалить полностью расписание на месяц для выбранного сотрудника?'; 
        this.confirmAccept=this.delete;
        this.confirmReject=this.hideConfirmationDlg;
        this.setState({showConfirm: true});
    }

    displayEmployeeInfo(){
        if (!this.state.chosenEmployee)
            {return}
        if (!(AppSets.getUser() && AppSets.getUser().amIhr()))
            {return}
        let info = this.state.chosenEmployee.shiftLength>0 ? (this.state.chosenEmployee.shiftLength+" ч ") : ""
        info = info + ((this.state.chosenEmployee.daysInWeek>0) ? (", "+this.state.chosenEmployee.daysInWeek+" дней/нед. ") : "");
        info = info + ((this.state.chosenEmployee.shiftLengthOnFriday>0) ? (", в пятницу "+this.state.chosenEmployee.shiftLengthOnFriday+" ч") : "");
        info = info + ((this.state.chosenEmployee.addConditions) ? (", "+this.state.chosenEmployee.addConditions) : '');
        info = (info !== "") ? ("Работает: "+info) : "";
        return(
            <div className='p-grid'>
                <div className='p-col-12' margintop='1em' style={{color:'#4095eb'}}>
                    {info}
                </div>
            </div>
        )
    }

    displayShiftInfo(){
        return <div className='p-grid'>
            <div className='p-col p-md-4'>Вс</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.start1}</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.end1}</div>
            <div className='p-col p-md-4'>Пн</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.start2}</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.end2}</div>
            <div className='p-col p-md-4'>Вт</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.start3}</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.end3}</div>
            <div className='p-col p-md-4'>Ср</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.start4}</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.end4}</div>
            <div className='p-col p-md-4'>Чт</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.start5}</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.end5}</div>
            <div className='p-col p-md-4'>Пт</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.start6}</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.end6}</div>
            <div className='p-col p-md-4'>Сб</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.start7}</div>
            <div className='p-col p-md-4'>{this.state.chosenShift.end7}</div>
            <div className='p-col-12' margintop='1em' style={{color:'#2c29eb'}}>{this.state.chosenShift.notes} </div>
        </div>
    }

    inputSimpleTimes(){
        if (!(AppSets.getUser() && AppSets.getUser().amIhr()))
            {return}
        return(<div className="p-grid">
            <div className="p-field p-col-3 p-md-3">
                <label htmlFor="simpleTimeFrom">C</label>
                <InputMask id="simpleTimeFrom"
                    value={this.state.timeFrom} mask="99:99" style={{width:'5em'}}
                    onChange={(e) => this.setState({timeFrom:e.target.value, chosenShift:null})}>
                </InputMask>
            </div>
            <div className="p-field p-col-2 p-md-2">
                <label htmlFor="simpleTimeTo">По</label>
                <InputMask id="simpleTimeTo"
                    value={this.state.timeTo} mask="99:99" style={{width:'5em'}}
                    onChange={(e) => this.setState({timeTo:e.target.value, chosenShift:null})}>
                </InputMask>
            </div>
        </div>);
    }

    displayToolbar(hasHrRole=false){
        //если не выбран сотрудник, подразделение или текущий пользователь не HR - вообще нет разговора о показе кнопок
        if (!(this.state.chosenEmployee && this.state.chosenOrgUnit && hasHrRole)){
            return
        }
        //выбрана смена или оба времени (приход и уход)
        const leftBar = (<React.Fragment>
                {(this.state.wasChanged && (this.state.chosenShift || (this.state.timeFrom && this.state.timeTo))) &&
                <Button label="Создать" icon="pi pi-check" 
                    tooltip = "Создать или изменить расписание для выбранного подразделения и сотрудника"
                    onClick={this.save} style={{marginRight: '1em'}}/>
                }
                <Button icon="pi pi-search" className="p-button-rounded p-button-success"
                        tooltip = "Проверить соответствие рабочих часов настройкам сотрудника"
                        onClick={this.verify} style={{marginRight: '1em'}}/>
        </React.Fragment>)
        const rightBar = (<React.Fragment>
                <Button className="p-button-rounded p-button-danger" icon="pi pi-thumbs-down" 
                    tooltip = "Удалить полностью запланированное расписание для выбранного сотудника"
                    onClick={this.onDelete} style={{marginRight: '1em'}}/>
        </React.Fragment>)

        return(<div>
            <Toolbar left={leftBar} right={rightBar} />
        </div>);
    }

    displayCardHeader(){
        const amIhr = AppSets.getUser().amIhr();
        const cardTitle = (amIhr) ? "Планирование графика" : "Просмотр графика";
        const planMenuModel = [{label: 'Утвердить', icon: 'pi pi-check', command: () => {
                    this.toast.show({severity:'success', summary:'Будем уведомлять', detail:'Data Updated'});
                }},]
        if (amIhr){
            return( <span className="card-title p-text-bold p-text-center">
                <Menu model={planMenuModel} popup ref={el => this.menu = el} id="popup_menu" />
                <Button icon="pi pi-bars" onClick={(event) => this.menu.toggle(event)} aria-controls="popup_menu" aria-haspopup></Button>
                {cardTitle} </span>)
        }else {
            return <span>{cardTitle} </span>
        }
    }

    acceptSchedule(){
        if (this.intervalIsInPast()){
            this.messages.show({severity:'error', summary: 'Нельзя утверждать расписание за прошедший период'});
            return;
        }
        if (!this.state.chosenOrgUnit){
            this.messages.show({severity:'error', summary: 'Не выбрано подразделение'});
            return;
        }
        let employeeId = this.state.chosenEmployee ? this.state.chosenEmployee.id : null;
        let payload = new ScheduleCreateProxy(this.state.chosenOrgUnit.id, 0, 
            employeeId, null, this.interval, null, null)
        this.dataService.acceptSchedule(payload, this);
    }

    render() {
        if (!AppSets.getUser())
            { this.history.push("/login")}
        let storedIniDate = this.storage.getItem("initalCalDate");
        let iniDate = (storedIniDate) ? this.moment(storedIniDate).toDate() : (new Date());
        const amIhr = (AppSets.getUser() && AppSets.getUser().amIhr());
        const cardTitle = amIhr ? "Планирование графика" : "Просмотр графика"
        const planMenuModel = [{label: 'Утвердить', icon: 'pi pi-check', command: () => {this.acceptSchedule()} },]

        return <div className="p-grid">
            <div className="p-col-12">
                <Messages ref={(el) => this.messages = el} position="left"/>
            </div>
            <div className="p-col-9">
                <div className="card">
                    {this.state.showConfirm && 
                    <Confirmation visibility={this.state.showConfirm} header={this.confirmHeader} body={this.confirmBody}
                            accept={this.confirmAccept} reject={this.confirmReject} messages={this.messages} context={this}/>}
                    <div className='p-card-title p-text-bold p-text-left' style={{fontSize:'large', color: '#1E88E5'}}>
                        {this.state.scheduleAccepted ? 'Планирование графика работы' : 'Планирование графика работы (не утвержден)'}</div>
                    <FullCalendar 
                        initialDate={iniDate}
                        events={this.state.days} locale={ruLocale}
                        slotMinTime={AppSets.minStartTime} slotMaxTime={AppSets.maxEndTime} 
                        selectable editable displayEventEnd firstDay={0} expandRows={true}
                        initialView='dayGridMonth' plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{ left: 'prev,next', center: 'title', right: 'today,dayGridMonth,timeGridWeek,timeGridDay' }}  
                        datesSet={(info)=>this.chosenMonthChanged(info)}
                        eventClick={(e)=>this.onEventClick(e)}
                        select={(selEvent)=>this.selectDates(selEvent)}
                    />                    
                </div>
            </div>
            <div className="p-col-3">
                <div className="card">
                    {amIhr && <div>
                        <span className="card-title p-text-bold p-text-center">
                            <Menu model={planMenuModel} popup ref={el => this.menu = el} id="popup_menu" />
                            <Button icon="pi pi-bars" onClick={(event) => this.menu.toggle(event)} aria-controls="popup_menu" aria-haspopup></Button>
                            <span style={{marginLeft:'1em'}}> {cardTitle} </span>
                        </span>
                        <span className="p-float-label" style={{marginTop: '1em', marginBottom:'1em'}}>
                            <CalendarFld  id="selectedDatesFld" selectionMode="multiple" readOnlyInput showIcon 
                                dateFormat="dd/mm/yy" locale={'ru'}
                                value={this.state.selectedDates}
                                onChange={(dte) => this.setState({selectedDates: dte.value, wasChanged: true})}/>
                            <label htmlFor="selectedDatesFld">Даты - если график на отдельные дни</label>
                        </span></div>
                    }
                    <span className="p-float-label" >
                        <AutoComplete id = "orgUnitFld" dropdown
                            value={this.state.chosenOrgUnit} 
                            suggestions={this.state.filteredOrgUnits} 
                            completeMethod={this.searchOrgUnit} field="name" 
                            onChange={(ouInfo) => this.onOrgUnitChoose(ouInfo.value)} />
                        <label htmlFor="orgUnitFld">Подразделение</label>
                    </span>
                    <span className="p-float-label" style={{marginTop: '1em'}}>
                        <AutoComplete id="employeeFld" dropdown
                            value={this.state.chosenEmployee}
                            suggestions={this.state.filteredEmployees} field="fullName"
                            completeMethod={(emplQry) => this.searchEmployee(emplQry)}
                            onChange={empl => this.onEmployeeChoose(empl.value)}
                        />
                        <label htmlFor="employeeFld">Сотрудник</label>
                    </span>
                    <div className="p-row-6">
                        <span className="p-float-label" style={{marginTop: '1em'}}>
                            <Dropdown id="shiftFld" dropdown
                                value={this.state.chosenShift} 
                                options={this.state.shifts} optionLabel="no"
                                onChange={shft => this.onShiftChange(shft)}/>
                            <label htmlFor="shiftFld">Смена</label>
                            <Button className='p-button-rounded p-button-info' icon="pi pi-times" style={{margin:'0 0 0 1em'}}
                                    tooltip="Очистка выбранной смены или интервала времени прихода и ухода"
                                    onClick={this.clearEnteredShift}/>
                        </span>
                        
                    </div>
                    {(this.state.chosenShift) ? this.displayShiftInfo() : this.inputSimpleTimes()}
                    {this.displayToolbar(amIhr)}
                    {this.displayEmployeeInfo()}
                </div>
            </div>            
        </div>
    }
}