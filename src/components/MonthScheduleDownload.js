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
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
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
        this.bodyDateSent = this.bodyDateSent.bind(this);
        this.bodyDateApprove = this.bodyDateApprove.bind(this);
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
            {((this.state.chosenOrgUnit || this.state.chosenEmployee) && this.state.chosenDate !== null) &&
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
        let query = ""
        if (this.state.chosenEmployee){
            query = "/schedule/exportplan/" + this.state.chosenEmployee.id + "/" + month + "/" + year;
        }
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
            this.setState({chosenOrgUnit: null, chosenEmployee: null, fileName:null})              
            AppSets.getEmployees(this);
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
            this.chosenDate = new Date();
        }
    }

    bodyDateApprove(rowData){
        if (!rowData.dateApprove)
            {return "-"}
        return this.moment(rowData.dateApprove).format('DD/MM HH:mm');
    }
    
    bodyDateSent(rowData){
        if (!rowData.dateSent)
            {return "-"}
        return this.moment(rowData.dateSent).format('DD/MM HH:mm');

    }

    render(){
        if (!AppSets.getUser().amIhr())
            { this.history.push("/access") }
        return (<div >
            <Toast ref={(el) => this.messages = el } position="top-left"/>
            <div className="p-grid p-card">
                <div className="p-col-3 ">
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
                    <span className="p-float-label" style={{margin:'1em 0 0 0 '}}>
                        <AutoComplete id = "employeeFld" dropdown 
                            value={this.state.chosenEmployee} 
                            suggestions={this.state.filteredEmployees} 
                            completeMethod={this.searchEmployee} field="fullName" 
                            onChange={(emInfo) => this.onEmployeeChoose(emInfo.value)} />
                        <label htmlFor="employeeFld">Сотрудник</label>
                    </span>
                    {this.state.selector === "Факт" && <div>ИЛИ</div>}
                    {this.state.selector === "Факт" && 
                        <span className="p-float-label" >
                        <AutoComplete id = "orgUnitFld" dropdown 
                                value={this.state.chosenOrgUnit} 
                                suggestions={this.state.filteredOrgUnits} 
                                completeMethod={this.searchOrgUnit} field="name" 
                                onChange={(ouInfo) => this.onOrgUnitChoose(ouInfo.value)} />
                            <label htmlFor="orgUnitFld">Подразделение</label>
                        </span>}
                    {this.displayToolbar()}
                    </div>

                    <div className="p-col-8"> 
                        <DataTable value={this.state.employees} showGridlines scrollable scrollHeight="500px" >
                            <Column field='fullName' header="Сотрудник" sortable filter filterPlaceholder="ФИО для поиска"
                                    filterHeaderStyle={{padding: '1 0 1 0'}}/>
                            <Column field='orgUnit' header="Подразделение"  sortable filter filterPlaceholder="Поиск..."
                                    filterHeaderStyle={{padding: '1 0 1 0'}}/>
                            <Column body={this.bodyDateSent} header="План отпр." sortable style={{width:'20%'}} />
                            <Column field={this.bodyDateApprove} sortable header="Факт отпр." style={{width:'20%'}}/>
                        </DataTable>
                    </div>
                </div>
        </div>);
    };
}