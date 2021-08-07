import React, { Component } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import ruLocale from '@fullcalendar/core/locales/ru';
import interactionPlugin from '@fullcalendar/interaction';
import AppSets from '../service/AppSettings'
import ScheduleService from '../service/ScheduleService'
import { Messages } from 'primereact/messages';


export default class MonthCalendar extends Component{
    state = {days:[]}

    constructor(props){
        super(props);
        this.dataService = new ScheduleService();
        this.updateData = this.updateData.bind(this);
        this.chosenMonthChanged = this.chosenMonthChanged.bind(this);
    }

    chosenMonthChanged(eventInfo){
        const startStr = eventInfo.start.toISOString().split('T')[0] + " 00:00";
        const endStr = eventInfo.end.toISOString().split('T')[0] + " " +AppSets.maxEndTime;
        this.updateData(startStr, endStr, 1);
    }

    updateData(startStr, endStr, chosenPersonId){
        if (chosenPersonId && startStr && endStr){
            this.dataService.getMonthCalendarByPerson(startStr, endStr, chosenPersonId, this);
        }
    }

    render() {
        return (
            <div>
                <div className="content-section implementation">
                    <div className="card">
                        <Messages ref={(el) => this.messages = el}></Messages>
                        <FullCalendar events={this.state.days} initialDate={Date.now()} locale={ruLocale}
                            initialView='dayGridMonth' plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            headerToolbar={{ left: 'prev,next', center: 'title', right: 'today,dayGridMonth,timeGridWeek,timeGridDay' }} editable selectable selectMirror dayMaxEvents 
                            datesSet={(info)=>this.chosenMonthChanged(info)}/>
                    </div>
                </div>
            </div>
        );
    }
}