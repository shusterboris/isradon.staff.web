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
import { ru } from '../service/AppSettings';
import { addLocale } from 'primereact/api';
import { Button } from 'primereact/button';
import {Toast} from 'primereact/toast';
import ScheduleCreateProxy from '../entities/ScheduleCreateProxy';


export default class SchedulePlan extends Component {
    state = {days:[], selectedDates:[],
        chosenOrgUnit: null, orgUnits: [], filteredOrgUnits: [], 
        chosenEmployee: null, employees:[], filteredEmployees: [], 
        chosenShift: null, shifts: []};

    constructor() {
        super();
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
        this.isDataValid = this.isDataValid.bind(this);
        this.finalizeCalendarView = this.finalizeCalendarView.bind(this);
        this.selectDates = this.selectDates.bind(this);
        this.displayShiftInfo = this.displayShiftInfo.bind(this);
        this.onEventClick = this.onEventClick.bind(this);
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
        this.setState({chosenOrgUnit: ouInfo, chosenShift:null});
        this.dataService.getOrgUnitShifts(ouInfo.id, this);
        this.updateCalendar(ouInfo);
        this.storage.setItem("chosenOrgUnit", JSON.stringify(ouInfo));
    }

    onShiftChange(shft){
        const s = shft.value;
        this.setState({chosenShift: s})
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
        this.setState({chosenEmployee: empl});
        this.updateCalendar();
        this.storage.setItem("chosenEmployee", JSON.stringify(empl));   
    }

    onEventClick(info){
        this.props.history.push({
            pathname: '/edit-day:id', state: {id: info.event.id, 
                chosenEmployee: this.state.chosenEmployee, employees: this.state.employees,
                chosenOrgUnit: this.state.chosenOrgUnit, orgUnits: this.state.orgUnits}});
    }

    isDataValid(){
        if (! (this.state.chosenEmployee && this.state.chosenOrgUnit && this.state.chosenShift)){
            this.messages.show({ severity: 'error', sticky:true, life:5000,
                 summary: "Нельзя создавать расписание, пока не выбрано подразделение, смена и сотрудник"});
            return false;
        }
        const now = this.moment();
        if (this.state.selectedDates && this.state.selectedDates.length>0){
            for(let i=0; i < this.state.selectedDates.length; i++){
                let current = this.moment(this.state.selectedDates[i])
                if (current.isBefore(now)){
                    const currentStr = current.format("DD/MM/yy")
                    let errMsg = "Как минимум, одна из дат в списке - "+currentStr+" - уже прошла. Это запрещено!";
                    this.messages.show({severity: 'error', sticky:true, life:5000, summary: errMsg});    
                    return false;
                }
            }
        }else{//период задается выбором в календаре
            if (this.moment(this.endStr).isBefore(now)){
                this.messages.show({severity: 'error', sticky:true, life:5000,
                     summary: "Вы хотите составить расписание на ПРОШЕДШИЙ месяц. Так нельзя!"});
                return false;
            }else if (this.moment(this.startStr).isBefore(now)){
                //если дата начала или конца периода больше текущего - ошибка
                this.messages.show({severity: 'error', sticky:true, life:5000,
                     summary: "Вы составляете расписание на месяц, но месяц уже начался. Так нельзя!"});
                return false;
            }
        }
        return true;
    }

    finalizeCalendarView(){
        this.setState({selectedDates:null});
        this.updateCalendar()
    }

    save(){
        if (this.isDataValid()){
            let selectedDatesFormatted = []
            for (let theDate of this.state.selectedDates){
                let formDate = this.moment(theDate).format("YYYY-MM-DD HH:mm")
                selectedDatesFormatted.push(formDate);
            }
            let payload = new ScheduleCreateProxy(this.state.chosenOrgUnit.id, this.state.chosenShift.id, 
                this.state.chosenEmployee.id, selectedDatesFormatted, this.interval)
            this.dataService.createSchedule(payload, this, this.finalizeCalendarView);
        }
    }

    displayShiftInfo(){
        return <div className='p-grid'>
            <div className='p-col-12' margintop='1em'>{this.state.chosenShift.notes}</div>
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

        </div>
    }

    render() {
        if (!AppSets.getUser())
            { window.location = "/login" }
        let storedIniDate = this.storage.getItem("initalCalDate");
        let iniDate = (storedIniDate) ? this.moment(storedIniDate).toDate() : (new Date());
        return <div className="p-grid">
            <Toast ref={(el) => this.messages = el}/>
            <div className="p-col-9">
                <div className="card">
                    <div className='p-card-title p-text-bold p-text-left' style={{fontSize:'large', color: '#1E88E5'}}>Планирование графика работы</div>
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
                    <div className="card-title p-text-bold">Планирование графика</div>
                    <span className="p-float-label" >
                        <AutoComplete id = "orgUnitFld" dropdown
                            value={this.state.chosenOrgUnit} 
                            suggestions={this.state.filteredOrgUnits} 
                            completeMethod={this.searchOrgUnit} field="name" 
                            onChange={(ouInfo) => this.onOrgUnitChoose(ouInfo.value)} />
                        <label htmlFor="orgUnitFld">Подразделение</label>
                    </span>
                    <span className="p-float-label" style={{marginTop: '1em'}}>
                        <Dropdown id="shiftFld" dropdown
                            value={this.state.chosenShift} 
                            options={this.state.shifts} optionLabel="no"
                            onChange={shft => this.onShiftChange(shft)}/>
                        <label htmlFor="shiftFld">Смена</label>
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
                    <span className="p-float-label" style={{marginTop: '1em'}}>
                        <CalendarFld  id="selectedDatesFld" selectionMode="multiple" readOnlyInput showIcon 
                            dateFormat="dd/mm/yy" locale={'ru'}
                            value={this.state.selectedDates}
                            onChange={(dte) => this.setState({selectedDates: dte.value})}/>
                        <label htmlFor="selectedDatesFld">Даты - если график на отдельные дни</label>
                    </span>
                    {(this.state.chosenEmployee && this.state.chosenOrgUnit && this.state.chosenShift) && 
                        <div className="p-col-12">
                            <Button label="Создать" icon="pi pi-check" onClick={this.save} style={{marginRight: '1em'}}/>
                        </div>
                    }
                    {this.state.chosenShift && this.displayShiftInfo()}
                </div>
            </div>            
        </div>
    }
}