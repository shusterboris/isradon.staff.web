import React, { Component } from 'react';
import { Toast } from 'primereact/toast';
import ScheduleService from '../service/ScheduleService';

export default class SummaryReport extends Component {
    state = {chosenMonth: null};
    constructor(props) {
        super(props);
        this.getStatus = this.getStatus.bind(this);
        this.dataService = new ScheduleService()
        this.messages = {};
        this.moment = require('moment');
    }

    componentDidMount(){
        let storedIniDate = window.localStorage.getItem("initalCalDate");
        let iniDate = (storedIniDate) ? this.moment(storedIniDate).toDate() : (this.moment().toDate());
        this.setState({chosenMonth: iniDate.getMonth()})
        this.getStatus(iniDate.getMonth())
    }

    getStatus(month){
        month = (month) ? month : this.state.chosenMonth;
        this.dataService.getSummaryReport(month, null, this);
    }

    render() {
        return <div className="p-card p-grid">
            <Toast ref={(el) => this.messages = el} position="top-left  "/>
            <div className="p-col-12">
                <div className="card">
                    <div className="card-title">Empty Page</div>
                    <p>Начинаем отсюда</p>
                </div>
            </div>
    </div>
    }
}