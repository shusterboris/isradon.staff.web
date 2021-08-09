import React, { Component } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import ruLocale from '@fullcalendar/core/locales/ru';
import interactionPlugin from '@fullcalendar/interaction';
import AppSets from '../service/AppSettings'
import { AutoComplete } from 'primereact/autocomplete'; 


export default class SchedulePlan extends Component {
    state = {days:[], chosenOrgUnit: null};

    constructor() {
        super();
        this.chosenMonthChanged = this.chosenMonthChanged.bind(this);
        this.onOrgUnitChoose = this.onOrgUnitChoose.bind(this);
    }

    chosenMonthChanged(eventInfo){
        this.startStr = eventInfo.start.toISOString().split('T')[0] + " 00:00";
        this.endStr = eventInfo.end.toISOString().split('T')[0] + " " +AppSets.maxEndTime;
    }

    onOrgUnitChoose(ouInfo){
        this.setState({chosenOrgUnit: ouInfo});
    }

    render() {
        return <div className="p-grid">
            <div className="p-col-8">
                <div className="card">
                    <FullCalendar 
                        events={this.state.days} initialDate={Date.now()} locale={ruLocale}
                        slotMinTime={AppSets.minStartTime} slotMaxTime={AppSets.maxEndTime} 
                        selectable firstDay={0} weekends={false} 
                        initialView='dayGridMonth' plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{ left: 'prev,next', center: 'title', right: 'today,dayGridMonth,timeGridWeek,timeGridDay' }} 
                        editable selectMirror dayMaxEvents 
                        datesSet={(info)=>this.chosenMonthChanged(info)}
                    />                    
                </div>
            </div>
            <div className="p-col-4">
                <div className="card">
                    <div className="card-title">Планирование графика</div>
                    <div className="p-field p-col-12 p-md-4">
                        <span className="p-float-label" style={{width:'90%'}}>
                            <AutoComplete id = "orgUnitFld"
                                value={this.state.value4} 
                                suggestions={this.state.filteredCountries} 
                                completeMethod={this.searchOrgUnit} field="name" 
                                onChange={(ouInfo) => this.onOrgUnitChoose(ouInfo.value)} />
                            <label htmlFor="orgUnitFld">Подразделение</label>
                        </span>
                    </div>
                </div>
            </div>            
        </div>
    }
}