import React, { Component } from 'react';
import { Toast } from 'primereact/toast';
import ScheduleService from '../service/ScheduleService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { ru } from '../service/AppSettings'
import { addLocale } from 'primereact/api';

export default class SummaryReport extends Component {
    state = {chosenMonth: null, chosenDate: new Date(), data: []};
    constructor(props) {
        super(props);
        this.getStatus = this.getStatus.bind(this);
        this.dataService = new ScheduleService()
        this.messages = {};
        this.headerTemplate = this.headerTemplate.bind(this);
        this.onChangeCalendar = this.onChangeCalendar.bind(this);
        this.moment = require('moment');
        addLocale('ru', ru); 
    }

    componentDidMount(){
        let storedIniDate = window.localStorage.getItem("initalCalDate");
        let iniDate = (storedIniDate) ? this.moment(storedIniDate).toDate() : (this.moment().toDate());
        const month = iniDate.getMonth() + 1;
        this.setState({chosenMonth: month, chosenDate:iniDate});
        this.getStatus(month);
    }

    getStatus(month){
        month = (month) ? month : this.state.chosenMonth;
        this.dataService.getSummaryReport(month, null, this);
    }

    onChangeCalendar(event){
        if (event){
            const theDate = this.moment(event.value);
            let month = theDate.month() + 1;
            this.setState({chosenMonth: month});
            window.localStorage.setItem("initalCalDate", theDate.toDate());
            this.getStatus(month);
        }else{
            this.setState({chosenMonth: this.moment.month()});
        }
    }

    headerTemplate(){
        let monthName =  ""
        if (this.state.chosenMonth){
            const monthNames = ru.monthNames;
            monthName = monthNames[this.state.chosenMonth-1];
        }
        return(<div>
            <Calendar readOnly={true} dateFormat="mm/yy" placeholder="Выберите месяц" 
                style = {{margin: '0 1em 0 1em'}}
                view="month" yearNavigator yearRange="2021:2040"
                locale={"ru"}
                value={this.state.chosenDate}
                onSelect={(e) => {this.onChangeCalendar(e)}}/>
            <span/>
            <span className="p-mx-10"> {"Сводка за "} 
                <span className="p-text-bold" style={{color:'#5265d3'}}> {monthName} </span>
                {" месяц"} </span>
        </div>);
    }

    groupHeaderTemplate(){

    }

    groupFooterTemplate(){

    }


    render() {
        const header = this.headerTemplate()
        return <div className="p-card p-grid">
            <Toast ref={(el) => this.messages = el} position="top-left  "/>
            <DataTable value={this.state.data} header={header}  
                rowGroupMode="rowspan" groupRowsBy="orgUnitName"
                sortMode="single" sortField="orgUnitName" sortOrder={1} responsiveLayout="scroll">
                <Column field="orgUnitName" header="Подразделение"/>
                <Column field="employeeName" header="Сотрудник"/>
                <Column field="planHours" header="План"/>
                <Column field="workHours" header="Факт"/>
                <Column field="lateHours" header="Опоздания"/>
                <Column field="overHours" header="Переработка"/>
            </DataTable>
        </div>
    }
}