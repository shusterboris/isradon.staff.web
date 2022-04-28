import React, { Component } from 'react';
import { Toast } from 'primereact/toast';
import ScheduleService from '../service/ScheduleService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { ru, gb } from '../service/AppSettings'
import { addLocale } from 'primereact/api';
import AppSets from '../service/AppSettings';

export default class SummaryReport extends Component {
    state = {chosenMonth: null, choosenYear: null, chosenDate: new Date(), data: []};
    constructor(props) {
        super(props);
        this.getStatus = this.getStatus.bind(this);
        this.dataService = new ScheduleService()
        this.messages = {};
        this.headerTemplate = this.headerTemplate.bind(this);
        this.onChangeCalendar = this.onChangeCalendar.bind(this);
        this.moment = require('moment');
        this.history = props.history;
        addLocale('ru', ru); 
        addLocale('gb', gb); 
    }

    componentDidMount(){
        let storedIniDate = window.localStorage.getItem("initalCalDate");
        let iniDate = (storedIniDate) ? this.moment(storedIniDate).toDate() : (new Date());
        const month = iniDate.getMonth() + 1;
        const year = iniDate.getFullYear();
        this.setState({chosenMonth: month, choosenYear: year, chosenDate:iniDate});
        this.getStatus(month, year);
    }

    getStatus(month, year){
        month = (month) ? month : this.state.chosenMonth;
        year = (year) ? year : this.state.choosenYear;
        this.dataService.getSummaryReport(month, year, null, this);
    }

    onChangeCalendar(event){
        if (event){
            const theDate = this.moment(event.value);
            let month = theDate.month() + 1;
            const year = theDate.year();
            this.setState({chosenMonth: month});
            this.setState({choosenYear : year})
            window.localStorage.setItem("initalCalDate", theDate.toDate());
            this.getStatus(month, year);
        }else{
            this.setState({chosenMonth: this.moment.month()});
        }
    }

    headerTemplate(){
        if (!AppSets.getUser().amIhr())
            { this.history.push("/access") }

        let lang = this.props.i18n.language;

        let monthName =  ""
        if (this.state.chosenMonth){
            const monthNames = (lang === 'ru') ? ru.monthNames : gb.monthNames;
            monthName = monthNames[this.state.chosenMonth-1];
        }
        return(<div>
            <Calendar readOnly={true} dateFormat="mm/yy" placeholder="Выберите месяц" 
                style = {{margin: '0 1em 0 1em'}}
                view="month" yearNavigator yearRange="2021:2040"
                locale={lang.includes('ru') ? 'ru' : 'gb'}
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
            <Toast id="toastMsg" ref={(el) => this.messages = el} position="top-left  "/>
            <DataTable value={this.state.data} header={header}  id="summaryReportDataTable"
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