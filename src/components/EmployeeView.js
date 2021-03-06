import React from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from "primereact/column";
import {Button} from 'primereact/button';
import ScheduleService from '../service/ScheduleService';
import AppSets from '../service/AppSettings';
import { Toast } from 'primereact/toast';

export default class EmployeeView extends React.Component{
    state = {
        employees: [],
        orgUnits : [],
        selectedRow: null,
      }
    
    constructor(props){
        super(props);
        this.actionBodyTemplate = this.actionBodyTemplate.bind(this);
        this.nameBody = this.nameBody.bind(this);
        this.history = props.history;
        this.dataService = new ScheduleService();
        this.displayHeader1 = this.displayHeader1.bind(this);
        this.startEditEmployee = this.startEditEmployee.bind(this);
        this.t = props.t;
    }


    componentDidMount() {
        if (this.props.location.pathname !== '/employees-fired'){
            //показать работающих
            AppSets.getEmployees(this);
            this.hideAddBtn = false;
        }else{
            //показать уволенных
            this.dataService.getFiredEmployees(this);
            this.hideAddBtn = true;
        }
        AppSets.getOrgUnitList(this)
    }

    startEditEmployee(rowData){
        this.setState({selectedRow: rowData})
        let orgUnitList = JSON.stringify(this.state.orgUnits)
        this.props.history.push({pathname: '/employee-edit', state: {id: rowData.id, orgUnitList: orgUnitList}});
    }

    startCreateEmployee(rowData){
        this.setState({selectedRow: null})
        let orgUnitList = JSON.stringify(this.state.orgUnits)
        this.props.history.push({pathname: '/employee-edit', state: {orgUnitList: orgUnitList}});
    }

    nameBody(rowData){
        if (rowData.lastName == null)
            {rowData.lastName=''}
        const theName = (rowData.lastName + ' ' + rowData.firstName).trim();
        return (theName !== '') ? theName : rowData.nickName;
    }

    actionBodyTemplate(rowData) {
        return (
            <Button id="removeButton" type="button" icon="pi pi-cog" className="p-button-secondary" 
                onClick={()=>this.startEditEmployee(rowData)}></Button>
        );
    }

    addMessages() {
        this.messages.show({severity:'error', summary: 'Проблема', detail:'Не удалось получить данные с сервера. Возможно, плохая связь', life: 3000});
    }

    displayHeader1(){
        return(<div >
            {!this.hideAddBtn && 
                <Button id="addButton" className="p-button-rounded p-button-secondary" icon="pi pi-plus"                
                onClick={()=>this.startCreateEmployee()}> </Button>
            }</div>)
    }

    render(){
        if (!AppSets.getUser().amIhr())
            { this.history.push("/access") }
        return (
            <div className = 'p-grid'>
                <Toast id="toastMsg" ref={(el) => this.messages = el} style={{marginBottom: '1em'}} />
                <div className = 'p-col-12 datatable-style-sched-repo'></div>
                <DataTable id="employeeDataTable" value={this.state.employees} 
                    header={this.hideAddBtn ?  this.t("mainMenu1_notActiveEmployees") : this.t("mainMenu1_notActiveEmployees")} headerStyle={{fontWeight: '500'}}
                    scrollable scrollHeight="500px" sortField="fullName" 
                    emptyMessage={this.t('summary_hr_emptyMessage')} >
                        <Column body={this.actionBodyTemplate} header={this.displayHeader1()} 
                            headerStyle={{width: '4em', textAlign: 'center'}} bodyStyle={{textAlign: 'center', overflow: 'visible'}}></Column>
                        <Column field='fullName' header={this.t("empl_fullName")} filter filterPlaceholder={this.t("filter_byName")} filterMatchMode="contains" sortable></Column>
                        <Column field="jobTitle" header={this.t("empl_jobTitle")} filter filterPlaceholder={this.t("filter_byPost")} sortable></Column>
                        <Column field="orgUnit" header={this.t("empl_orgUnit")}  filter filterPlaceholder={this.t("filter_byOrg")}  sortable></Column>
                        <Column field="phone" header={this.t("empl_phone")} ></Column>
                </DataTable>
            </div>
        )
    }    
}