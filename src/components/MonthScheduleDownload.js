import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import {Calendar} from 'primereact/calendar';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { RadioButton} from 'primereact/radiobutton';
import AppSets from '../service/AppSettings'
import { ru } from '../service/AppSettings';
import { addLocale } from 'primereact/api';
import axios from 'axios';


export default class MonthScheduleDownload extends Component{
    state = {chosenOrgUnit: null, chosenDate: Date.now(), fileName:null, orgUnits: [], filteredOrgUnits: [],
            chosenEmployee: null, filteredEmployees: [], employees: [], selector : "Факт"}
    constructor(props){
        super(props);
        this.displayToolbar = this.displayToolbar.bind(this);
        this.searchOrgUnit = this.searchOrgUnit.bind(this);
        this.onOrgUnitChoose = this.onOrgUnitChoose.bind(this);
        this.searchEmployee = this.searchEmployee.bind(this);
        this.onEmployeeChoose = this.onEmployeeChoose.bind(this);
        this.onChangeCalendar = this.onChangeCalendar.bind(this);
        this.sendQuery = this.sendQuery.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
        this.history = props.history;
        this.moment = require('moment');
        addLocale('ru', ru);  
    }

    componentDidMount(){
        AppSets.getOrgUnitList(this);
        AppSets.getEmployees(this);
    }

    displayToolbar(){
        const leftBar = (<React.Fragment>
            {((this.state.chosenOrgUnit || this.state.chosenEmployee) && this.state.chosenDate) &&
            <Button label="Начать" icon="pi pi-check" 
                tooltip = "Сформировать файл для выгрузки данных на сервере"
                onClick={this.sendQuery} style={{marginRight: '1em'}}/>
            }
            {(this.state.fileName != null) && 
            <Button label="Получить" icon="pi pi-check" 
                tooltip = "Загрузить файл с данными на свой комьютер"
                onClick={this.downloadFile} style={{marginRight: '1em'}}/>}
        </React.Fragment>)

        return(<div>
            <Toolbar left={leftBar} />
        </div>);
    }

    sendQuery(){
        const date = this.moment(this.state.chosenDate);
        const server = AppSets.host;
        const month = date.month()+1;
        let year = month>1 ? date.year() : (date.year() - 1);
        let query = query = "/schedule/exportplan/" + this.state.chosenEmployee.id + "/" + month + "/" + year;
        if (this.state.selector === "Факт"){
            if (this.state.chosenOrgUnit){
                query = "/schedule/exportcsv/"+this.state.chosenOrgUnit.id+"/" + month + "/" + year;
            }else{
                query = "/schedule/exportcsv/person/" + this.state.chosenEmployee.id + "/" + month + "/" + year;
            }
        }
        const url = server + query;
        axios.get(url)
        .then(response=>{
            this.setState({fileName:response.data})
            this.messages.show({severity:'success', summary: 'Сформирован файл для выгрузки. Нажмите кнопку "Получить"'});
        })
        .catch(err=>{
            const errMsg = (!err.response) ? "Сервер не отвечает или проблемы с Интернетом" : "Не удалось сформировать отчет";
            this.messages.show({severity:'error', summary: errMsg});
        });
        
    }

    downloadFile(){
        const server = AppSets.host;
        const query = "/files/getByName/"+this.state.fileName;
        const url = server + query;
        return axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(response=>{
            const type = response.headers['content-type'];
            const blob = new Blob([response.data], { type: type, encoding: 'UTF-8' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = this.state.fileName;
            link.click()
            this.setState({chosenOrgUnit: null, chosenDate: null, fileName:null})              
          })
          .catch(err=>{
            const errMsg = (!err.response) ? "Сервер не отвечает или проблемы с Интернетом" : "Не удалось сформировать отчет";
            this.messages.show({severity:'error', summary: errMsg});
        });
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

    onEmployeeChoose(info){
        this.setState({chosenEmployee: info, fileName:null});
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
        this.setState({chosenOrgUnit: ouInfo, fileName:null});
    }

    onChangeCalendar(event){
        if (event){
            const theDate = event.value;
            this.setState({chosenDate: theDate, fileName:null});
        }else{
            this.chosenDate = null;
        }
    }

    render(){
        if (!AppSets.getUser())
            { this.history.push("/login")}
        return (<div className="card" style={{width:'50vw'}}>
            <Toast ref={(el) => this.messages = el } position="top-left"/>
            <div className="card-title p-text-bold">Выгрузка данных о времени</div>
            <div className="p-field-radiobutton">
                <RadioButton inputId="selPlan" name="selector" value="План" onChange={(e) => this.setState({selector: e.value})} checked={this.state.selector === 'План'} />
                    <label htmlFor="selPlan">План</label>
            </div>
            <div className="p-field-radiobutton">
                <RadioButton inputId="selFact" name="selector" value="Факт" onChange={(e) => this.setState({selector: e.value})} checked={this.state.selector === 'Факт'} />
                <label htmlFor="selFact">Факт</label>
            </div>
            <div >
                <Calendar readOnly={true} dateFormat="mm/yy" placeholder="Выберите месяц" view="month" 
                        locale={"ru"}
                        value={this.chosenDate ? this.chosenDate : (new Date())}
                        onSelect={(e) => {this.onChangeCalendar(e)}}/>
            </div>
            <div className="p-grid">
                <div className="p-col-5">
                    <span className="p-float-label" style={{margin:'1em 0 0 0 '}}>
                        <AutoComplete id = "employeeFld" dropdown 
                            value={this.state.chosenEmployee} 
                            suggestions={this.state.filteredEmployees} 
                            completeMethod={this.searchEmployee} field="fullName" 
                            onChange={(emInfo) => this.onEmployeeChoose(emInfo.value)} />
                        <label htmlFor="employeeFld">Сотрудник</label>
                    </span>
                </div>
                {this.state.selector === "Факт" && <div className="p-col-1" style={{marginTop:'auto'}}>ИЛИ</div>}
                {this.state.selector === "Факт" && <div className="p-col-5">
                    <span className="p-float-label" style={{margin:'1em 0 0 0 '}}>
                    <AutoComplete id = "orgUnitFld" dropdown 
                            value={this.state.chosenOrgUnit} 
                            suggestions={this.state.filteredOrgUnits} 
                            completeMethod={this.searchOrgUnit} field="name" 
                            onChange={(ouInfo) => this.onOrgUnitChoose(ouInfo.value)} />
                        <label htmlFor="orgUnitFld">Подразделение</label>
                    </span>
                </div>}
            </div>
            {this.displayToolbar()}
        </div>);
    };
}