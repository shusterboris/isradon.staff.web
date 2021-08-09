import React, { Component } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import ruLocale from '@fullcalendar/core/locales/ru';
import interactionPlugin from '@fullcalendar/interaction';
import AppSets from '../service/AppSettings'
import ScheduleService from '../service/ScheduleService'
import { Messages } from 'primereact/messages';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';


export default class MonthCalendar extends Component{
    state = {days:[], chosenPerson:"", employees:[]}

    constructor(props){
        super(props);
        this.dataService = new ScheduleService();
        this.updateData = this.updateData.bind(this);
        this.chosenMonthChanged = this.chosenMonthChanged.bind(this);
        this.processSelection = this.processSelection.bind(this);
        this.onEmployeeChange = this.onEmployeeChange.bind(this);
        this.onClearChosenPerson = this.onClearChosenPerson.bind(this);
        this.moment = require('moment');
    }

    componentDidMount(){
        AppSets.getEmployees(this);
    }

    chosenMonthChanged(eventInfo){
        this.startStr = eventInfo.start.toISOString().split('T')[0] + " 00:00";
        this.endStr = eventInfo.end.toISOString().split('T')[0] + " " +AppSets.maxEndTime;
        if (AppSets.user.amIhr())
            this.updateData(this.startStr, this.endStr, NaN);
        else
            this.updateData(this.startStr, this.endStr, AppSets.user.id);
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
        this.props.history.push(
            {pathname:'/day-off', state: {mode: 'create', employee: this.state.chosenPerson, dateStart:start, dateEnd:endMoment.toDate()}}
            );
    }

    eventClicked(eventInfo){
        //выбирается время с 0 первого дня до 0 дня, следующего за последним
        console.log(eventInfo.event)
    }

    onEmployeeChange(event){
        this.setState({chosenPerson: event.value});
        this.updateData(this.startStr, this.endStr, event.value.id);
    }

    onClearChosenPerson(){
        this.setState({chosenPerson:null});
        this.updateData(this.startStr, this.endStr, NaN);
    }

    updateData(startStr, endStr, chosenPersonId){
        if (!AppSets.user.amIhr || chosenPersonId){
            if (chosenPersonId && startStr && endStr){
                this.dataService.getMonthCalendarByPerson(startStr, endStr, chosenPersonId, this);
            }
        }else{//hr
            if (startStr && endStr){
                this.dataService.getMonthCalendarCommon(startStr, endStr, this);
            }
        }
    }

    render() {
        return (
            <div>
                <div className="content-section implementation">
                    <div className="card">
                        <Messages ref={(el) => this.messages = el}></Messages>
                        {AppSets.user.amIhr() && 
                        <Dropdown value={this.state.chosenPerson} options={this.state.employees}
                            optionLabel="fullName" placeholder="Выберите сотрудника"
                            onChange = {this.onEmployeeChange}>
                        </Dropdown>}
                        {!AppSets.user.amIhr() && <div className="card-title p-text-bold p-highlight">{AppSets.user.fullName}</div>}

                        {this.state.chosenPerson &&
                            <Button icon="pi pi-times" className="p-button-rounded p-button-info" style={{marginInlineStart:'1em'}}
                                    onClick={this.onClearChosenPerson}/>
                        }
                        <FullCalendar events={this.state.days} initialDate={Date.now()} locale={ruLocale}
                            slotMinTime={AppSets.minStartTime} slotMaxTime={AppSets.maxEndTime} 
                            selectable firstDay={0} weekends={false} 
                            editable selectMirror dayMaxEvents 
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