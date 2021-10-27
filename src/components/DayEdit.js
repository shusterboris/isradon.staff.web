import React, { Component } from 'react';
import ScheduleService from '../service/ScheduleService';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { confirmDialog } from 'primereact/confirmdialog';
import AppSets from '../service/AppSettings';
import { AutoComplete } from 'primereact/autocomplete';
import { Dropdown } from 'primereact/dropdown';
import { row_types } from '../service/AppSettings'
import { Messages } from 'primereact/messages';
import { InputTextarea } from 'primereact/inputtextarea';
import { ListBox } from 'primereact/listbox';
import App from '../App';

export class DayEdit extends Component {
    state = {rowData: null, changed: false, filteredOrgUnits: [], chosenOrgUnit:null, chosenEmployee:null, 
        filteredEmployees:[], chosenType: row_types[0], salesInfo: [],}
    
    constructor(props) {
        super(props);
        this.dataService = new ScheduleService();
        this.fieldsInit = this.fieldsInit.bind(this);
        this.filterOrgUnit = this.filterOrgUnit.bind(this);
        this.onEmployeeChoose = this.onEmployeeChoose.bind(this);
        this.searchEmployee = this.searchEmployee.bind(this);
        this.onSavePressed = this.onSavePressed.bind(this);
        this.delete = this.delete.bind(this);
        this.onDeletePressed = this.onDeletePressed.bind(this);
        this.isDataValid = this.isDataValid.bind(this);
        this.isShowSalesInfo = this.isShowSalesInfo.bind(this);
        this.moment = require('moment');
        this.history = props.history;
    }

    componentDidMount(){
        const param = this.props.location.state;
        if (param){
            const id = param.id;
            this.dataService.getScheduleRecordById(id, this, this.fieldsInit);
        }
    }

    fieldsInit(rowData){
        //здесь мы обрабатываем полученную запись календаря и заполняем поля ввода
        let startTime = rowData.comingPlan.split("T")[1];
        let endTime = rowData.leavingPlan.split("T")[1];
        startTime = startTime.substr(0,5);
        endTime = endTime.substr(0,5);
        const startDate = this.moment(rowData.comingPlan);
        this.title = "Расписание на " + startDate.format("DD/MM/YYYY");
        let chosenOrgunit = null;
        let orgUnitList = [];
        let employeeList = [];
        let chosenEmployee = null;
        const param = this.props.location.state;
        if (param){
            chosenOrgunit = param.chosenOrgUnit;
            orgUnitList = param.orgUnits;
            if (orgUnitList === null || orgUnitList.length === 0){
                AppSets.getOrgUnitList(this)
            }else{
                this.setState({orgUnits: orgUnitList});
            }
            if (!chosenEmployee)
                {chosenEmployee = param.chosenEmployee;}
            employeeList = param.employees;
            if (employeeList === null || employeeList.length === 0){
                AppSets.getEmployees();
            }else{
                this.setState({employees: employeeList});        
            }
            if (!this.chosenEmployee){
                for(let employee of employeeList){
                    if (employee.id === rowData.employeeId){
                        chosenEmployee = employee;
                        break;
                    }

                }
            }
            this.setState({chosenEmployee: chosenEmployee, chosenOrgUnit: chosenOrgunit});
            this.dataService.getSalesInfo(this.state.chosenEmployee.id,startDate, this);
        }
        
        const rowTypeNum = (rowData.rowType) ? rowData.rowType : (param.rowType ? param.rowType : 0);
        const eventType = AppSets.getRowType(rowTypeNum);
        this.setState({start: startTime, end: endTime, note: rowData.note, reason: rowData.reason, 
            orgUnitId: rowData.orgUnitId, employeeId: rowData.employeeId, chosenType: eventType
            });
    }
    
    filterOrgUnit(event){
        let results;
        if (event.query.length === 0) {
            results = [...this.state.orgUnits];
        }
        else {
            results = this.state.orgUnits.filter((orgunit) => {
                return orgunit.toLowerCase().includes(event.query.toLowerCase());
            });
        }
        this.setState({filteredOrgUnits: results});
        return results;
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

    delete(){
        this.dataService.deleteRow(this);
    }


    onEmployeeChoose(empl){
        this.chosenEmployee = empl;
        this.setState({chosenEmployee: empl, changed: true});
    }

    isDataValid(){
        let errMsgs = []
        if (typeof(this.state.chosenEmployee) !== 'object')
            {errMsgs.push("Сотрудник")}
        if (typeof(this.state.chosenOrgUnit) !== 'object')
            {errMsgs.push("Подразделение")}
        if (typeof(this.state.chosenType) !== 'object')
            {errMsgs.push("Тип записи")}
        if (this.state.start == null || this.state.start.trim() === '')
            {errMsgs.push("Плановое время прихода")}
        if (this.state.end == null || this.state.end.trim() === '')
            {errMsgs.push("Плановое время ухода")}
        if (errMsgs.length > 0){
            const msg = "Не введены значения: " + errMsgs.join(",");
            this.message.show({severity: 'error', summary: msg})
            return false;
        }
        let startTime = this.moment(this.state.start, "HH:mm");
        if (! startTime.isValid()){
            this.message.show({severity: 'error', summary: 'Неправильное время прихода'})
            return false;           
        }
        let endTime = this.moment(this.state.end, "HH:mm");
        if (! endTime.isValid()){
            this.message.show({severity: 'error', summary: 'Неправильное время ухода'})
            return false;           
        }
        let minTime = this.moment(AppSets.minStartTime);
        if (startTime.isBefore(minTime)){
            this.message.show({severity: 'error', summary: 'Слишком раннее время прихода'})
            return false;           
        }
        let maxTime = this.moment(AppSets.maxEndTime);
        if (endTime.isAfter(maxTime)){
            this.message.show({severity: 'error', summary: 'Слишком позднее время ухода'})
            return false;           
        }
        if (startTime.isAfter(endTime)){
            this.message.show({severity: 'error', summary: 'Время прихода больше времени ухода'})
            return false;           
        }
        if (endTime.diff(startTime,'minutes') < 30){
            this.message.show({severity: 'warn', summary: 'Слишком маленький интервал между приходом и уходом', sticky: true})
            return;           
        }
        return true;
    }

    onSavePressed(){
        if (! this.isDataValid())
            return;
        this.dataService.saveRow(this);                       
    }

    onDeletePressed(){
        confirmDialog({
            message: 'Вы действительно хотите удалить запись из расписания?',
            header: 'Подтвердите!',
            icon: 'pi pi-exclamation-triangle',
            accept: this.delete
        });
    }

    isShowSalesInfo(){
        if (!AppSets.getUser().amIhr()) 
            { return false }
        if (!this.state.salesInfo || this.state.salesInfo.length === 0)
            { return false }
        return true;
    }

    displayToolbar(){
        const user = AppSets.getUser();
        const leftBar = (<React.Fragment>
            {(this.state.changed) && 
                <Button id="btnSave" label="Сохранить" icon="pi pi-check" style={{marginRight: '1em'}} 
                        className="p-button-primary p-mr-2"
                        onClick={this.onSavePressed}/>}
                <Button id="btnCancel" label="Выйти" icon="pi pi-arrow-left" className="p-button-secondary p-mr-2" 
                        onClick={this.props.history.goBack}/>
            </React.Fragment>);
        const rightBar = (<React.Fragment>
            {user.amIhr() &&
                <Button id="btnDelete" label="Удалить" icon="pi pi-thumbs-down" className="p-button-danger"
                        style={{marginLeft: '1em'}} 
                        onClick={this.onDeletePressed}/>
            }
        </React.Fragment>);    
        return <div>
            <Toolbar left={leftBar} right={rightBar} />
        </div>
       
    }

    render() {
        if (!AppSets.getUser())
            { this.history.push("/login")}

        return <div className="card">
            <Messages ref={(el) => this.messages = el}/>
            <div className="card-title">{this.title}</div>
            <div className="p-grid">
                <div className="p-col-4">
                    <div className="p-grid  form-group" style={{padding:'1em 0 0 0'}}>
                            <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>Рабочее время, с: </div>
                            <InputMask id='startFld' mask='99:99' 
                                style={{width:'5em'}} 
                                value={this.state.start} 
                                onChange={(e) => this.setState({start:e.target.value, changed: true})}/>
                            <div className="p-text-left" style={{margin: '0 1em 0 1em'}}> по: </div>
                            <InputMask id='endFld' mask='99:99' 
                                style={{margin:'0 0 0 1em', width:'5em'}} 
                                value={this.state.end} 
                                onChange={(e) => this.setState({end:e.target.value, changed: true})}/>
                    </div>    
                    <div className="p-col-10 p-mx-2" >                            
                        <span className="p-float-label">
                            <AutoComplete id="orgUnitFld" dropdown
                                value={this.state.chosenOrgUnit} 
                                suggestions={this.state.filteredOrgUnits} 
                                completeMethod={this.filterOrgUnit} field="name"
                                onChange={event => this.setState({ chosenOrgUnit: event.value, filteredOrgInits: null, changed: true})}/>
                            <label htmlFor="orgUnitFld">Место работы</label> 
                        </span>
                        <span className="p-float-label" style={{marginTop: '1em'}}>
                            <AutoComplete id="employeeFld" dropdown
                                value={this.state.chosenEmployee}
                                suggestions={this.state.filteredEmployees} field="fullName"
                                completeMethod={(emplQry) => this.searchEmployee(emplQry)}
                                onChange={empl => this.onEmployeeChoose(empl.value)}/>
                            <label htmlFor="employeeFld">Сотрудник</label>
                        </span>
                        <span className="p-float-label" style={{marginTop: '1em'}}>
                            <Dropdown id="rowTypeFld" dropdown width="5em"
                                value={this.state.chosenType} 
                                options={row_types} optionLabel="name"
                                onChange={chType => this.setState({chosenType: chType.value, changed: true})}/>
                            <label htmlFor="rowTypeFld">Тип записи</label>
                        </span>
                            {this.displayToolbar()}
                        </div>
                    </div>
                {this.isShowSalesInfo && 
                <div className="p-col-2" aria-rowspan='2'> 
                    <label style={{margin:'0 0 2em 0.5em', fontWeight:'bold'}}>Список продаж</label>
                    <ListBox options={this.state.salesInfo} listStyle={{maxHeight: '250px'}}/>
                </div>}
                <div className="p-col-4" aria-rowspan='2'> 
                    <span className="p-float-label">
                        <InputTextarea rows={5} cols={30} value={this.state.reason} id="inputReasonTextArea"
                            disabled = {!AppSets.getUser().amIhr()}
                            onChange={(e) => this.setState({reason: e.target.value, changed: true})}/>
                        <label htmlFor="inputReasonTextArea"> Примечания HR</label>
                    </span>
                    <span className="p-float-label">
                        <InputTextarea rows={5} cols={30} value={this.state.note} id="inputNoteTextArea"
                            disabled = {AppSets.getUser().amIhr()}
                            onChange={(e) => this.setState({note: e.target.value, changed: true})}/>
                        <label htmlFor="inputNoteTextArea"> Примечания сотрудника</label>
                    </span>
                </div>
            </div>           
        </div>
    }
}