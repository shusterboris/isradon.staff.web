import React, { Component } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import ruLocale from '@fullcalendar/core/locales/ru';
import interactionPlugin from '@fullcalendar/interaction';
import AppSets from '../service/AppSettings'
import ScheduleService from '../service/ScheduleService'
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import {Checkbox} from 'primereact/checkbox';

export default class MonthCalendar extends Component{
    state = {days:[], chosenPerson:"", employees:[], chosenOrgUnit:null, orgUnits:[], filteredEmployees:[], filterChecked: true}

    constructor(props){
        super(props);
        this.dataService = new ScheduleService();
        this.updateData = this.updateData.bind(this);
        this.chosenMonthChanged = this.chosenMonthChanged.bind(this);
        this.processSelection = this.processSelection.bind(this);
        this.onEmployeeChange = this.onEmployeeChange.bind(this);
        this.onClearChosenPerson = this.onClearChosenPerson.bind(this);
        this.displayHrHeader = this.displayHrHeader.bind(this);
        this.displaySimpleUserHeader = this.displaySimpleUserHeader.bind(this);
        this.getEmployeeList = this.getEmployeeList.bind(this);
        this.onOrgUnitChange = this.onOrgUnitChange.bind(this);
        this.onCheckFilter = this.onCheckFilter.bind(this);
        this.moment = require('moment');
        this.storage = window.sessionStorage;
        this.filterChecked = true;
        this.history = props.history;
    }

    componentDidMount(){
        if (AppSets.getUser().amIhr()){
            AppSets.getEmployees(this)
        }else{
            AppSets.getEmployees(this, AppSets.getUser().orgUnitId);
        }
        AppSets.getOrgUnitList(this); //orgUnits
    }

    chosenMonthChanged(eventInfo){
        this.startStr = eventInfo.start.toISOString().split('T')[0] + " 00:00";
        this.endStr = eventInfo.end.toISOString().split('T')[0] + " " +AppSets.maxEndTime;
        const middleInterval = new Date((eventInfo.start.getTime() + eventInfo.end.getTime()) / 2);
        window.localStorage.setItem("initalCalDate", middleInterval);
        this.updateData()
    }

    processSelection(eventInfo){
        let start = eventInfo.start;
        const minTime = AppSets.minStartTime.split(":");
        start.setHours(minTime[0]);
        start.setMinutes(minTime[1]);
        let end = eventInfo.end;
        const maxTime = AppSets.maxEndTime.split(":");
        let endMoment = this.moment(end);
        endMoment.hour(maxTime[0]);
        endMoment.minute(maxTime[1]);
        endMoment.subtract(1,'days');
        const unitsToChoose = this.getEmployeeList(this.state.chosenOrgUnit);
        let chosenPerson = this.state.chosenPerson;
        if (!chosenPerson){
            chosenPerson = unitsToChoose.find(empl => {return empl.id === AppSets.getUser().employeeId});
        }
        this.props.history.push(
            {pathname:'/day-off', state: {mode: 'create', employees: unitsToChoose, 
            chosenEmployee: chosenPerson, dateStart:start, dateEnd:endMoment.toDate()}}
            );
    }

    eventClicked(eventInfo){
        //???????????????????? ?????????? ?? 0 ?????????????? ?????? ???? 0 ??????, ???????????????????? ???? ??????????????????
        console.log(eventInfo.event)
    }

    onEmployeeChange(event){
        this.chosenEmployee = event.value;
        this.setState({chosenPerson: event.value});
        this.updateData()
    }

    onClearChosenPerson(){
        this.chosenEmployee = null;
        this.setState({chosenPerson:null, chosenOrgUnit: null, days: []});
        //this.updateData();
    }

    updateData(){
        if (!this.startStr || !this.endStr)
            { return };
        if (!this.chosenOrgUnit && !this.chosenEmployee)
            { return };
        this.dataService.getWorkCalendar(this.startStr, this.endStr, this.filterChecked,
            this.chosenOrgUnit, this.chosenEmployee,  this);
    }

    getEmployeeList(chosenUnit){
        const user = AppSets.getUser()
        if (user){
            if (user.amIhr() && !chosenUnit){
                return this.state.employees;
            }else{
                const employeeOrgUnit = chosenUnit ? chosenUnit.name : user.orgUnit;
                const sameOrgUnitEmployees = this.state.employees.filter(empl=>{
                        return empl.orgUnit === null || empl.orgUnit === employeeOrgUnit});
                return sameOrgUnitEmployees;
            }
        }else{
            return []
        }
    }

    onOrgUnitChange(ou){
        this.chosenOrgUnit = ou.value;
        this.setState({chosenOrgUnit:ou.value});
        this.getEmployeeList(ou.value);
        this.updateData();
    }

    onCheckFilter(event){
        this.filterChecked = event.checked;
        this.setState({filterChecked: event.checked});
        this.updateData();
    }

    displaySimpleUserHeader(){
        return (
            <div className='p-grid'>
                <div className='p-col-2'>
                    <div className="p-shadow-4 p-text-bold p-highlight " style={{height: '50px', fontSize:'large', color: '#1E88E5'}}>
                        {AppSets.getUser() && AppSets.getUser().orgUnit}</div>
                </div>
                <div className='p-col-3'>
                    <Dropdown value={this.state.chosenPerson} 
                        options={this.getEmployeeList()}
                        optionLabel="fullName" placeholder="???????????????? ????????????????????"
                        onChange = {ou=>this.onEmployeeChange(ou)}>
                    </Dropdown> 
                    {this.state.chosenPerson &&
                        <Button icon="pi pi-times" className="p-button-rounded p-button-info" style={{marginInlineStart:'1em'}}
                                onClick={this.onClearChosenPerson}/>
                    }
                </div>
                <div className='p-col-5'>
                    <div className='p-card-title p-text-bold p-text-left' style={{fontSize:'large', color: '#1E88E5'}}>
                        ???????????????????????? ???????????????? ?? ????????????????????
                    </div>
                </div>
                <div className="p-col">
                    <div className="p-field-checkbox">
                        <Checkbox id="checkFilterFld" checked={this.state.filterChecked} 
                            onChange={(chk)=>this.onCheckFilter(chk)}></Checkbox>
                        <label htmlFor="checkFilterFld" >???????????? ??????????????</label>
                    </div>
                </div>
            </div>
            );    
    }

    displayHrHeader(){
        return (
        <div className='p-grid'>
            <div className='p-col-2'>
                <Dropdown value={this.state.chosenOrgUnit} 
                    options={this.state.orgUnits} optionLabel="name" placeholder="??????????????????????????"
                    onChange={this.onOrgUnitChange}>
                </Dropdown>
            </div>
            <div className='p-col-3 p-text-left'>
                <Dropdown value={this.state.chosenPerson} options={this.getEmployeeList(this.state.chosenOrgUnit)}
                    optionLabel="fullName" placeholder="???????????????? ????????????????????"
                    onChange = {this.onEmployeeChange}>
                </Dropdown> 
                {this.state.chosenPerson &&
                    <Button icon="pi pi-times" className="p-button-rounded p-button-info" style={{marginInlineStart:'1em'}}
                            onClick={this.onClearChosenPerson}/>
                }
            </div>
            <div className='p-col-5'>
                <div className='p-card-title p-text-bold p-text-left' style={{fontSize:'large', color: '#1E88E5'}}>
                    ???????????????????????? ???????????????? ?? ????????????????????
                </div>
            </div>
            <div className="p-col">
                <div className="p-field-checkbox">
                    <Checkbox id="checkFilterFld" checked={this.state.filterChecked} 
                            onChange={(chk)=>this.onCheckFilter(chk)}></Checkbox>
                    <label htmlFor="checkFilterFld" >?????? ?????????????? ????????</label>
                </div>
            </div>
        </div>
        );
    }

    render() {
        const user = AppSets.getUser();
        let storedIniDate = window.localStorage.getItem("initalCalDate");
        let iniDate = (storedIniDate) ? this.moment(storedIniDate).toDate() : (new Date());
        return (
            <div>
                <div className="content-section implementation">
                    <div className="card">
                        <Toast ref={(el) => this.messages = el}/>
                        {(user && user.amIhr()) ? this.displayHrHeader() : this.displaySimpleUserHeader()}
                        <FullCalendar events={this.state.days} initialDate={iniDate} locale={ruLocale} id="monthCldr"
                            slotMinTime={AppSets.minStartTime} slotMaxTime={AppSets.maxEndTime} 
                            aspectRatio={2.2}
                            selectable firstDay={0} expandRows
                            displayEventEnd={true}
                            initialView='dayGridMonth' plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            headerToolbar={{ left: 'prev,next', center: 'title', right: 'today,dayGridMonth,timeGridWeek,timeGridDay' }} 
                            datesSet={(info)=>this.chosenMonthChanged(info)}
                            eventClick={info=>this.eventClicked(info)}
                            select={(info)=>this.processSelection(info)}/>
                    </div>
                </div>
            </div>
        );
    }
}