import React from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from "primereact/column";
import {Button} from 'primereact/button';
import ScheduleService from '../service/ScheduleService';
import {Messages} from 'primereact/messages';
import AppSets from '../service/AppSettings';

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
    }


    componentDidMount() {
        if (this.props.location.pathname !== '/employees-fired'){
            //показать работающих
            AppSets.getEmployees(this);
        }else{
            //показать уволенных
            this.dataService.getFiredEmployees(this);
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
            <Button type="button" icon="pi pi-cog" className="p-button-secondary" 
                onClick={()=>this.startEditEmployee(rowData)}></Button>
        );
    }

    addMessages() {
        this.messages.show({severity:'error', summary: 'Проблема', detail:'Не удалось получить данные с сервера. Возможно, плохая связь', life: 3000});
    }

    displayHeader1(){
        return(<div >
            <Button className="p-button-rounded p-button-secondary" icon="pi pi-plus"                
                onClick={()=>this.startCreateEmployee()}>
            </Button>
        </div>)
    }

    render(){
        if (!AppSets.getUser())
            { this.history.push("/login")}        
        return (
            <div className = 'p-grid'>
                <Messages ref={(el) => this.messages = el} style={{marginBottom: '1em'}} />
                <div className = 'p-col-12 datatable-style-sched-repo'></div>
                <DataTable value={this.state.employees}
                    scrollable scrollHeight="500px"
                    emptyMessage='Нет сведений для данного сотрудника за выбранный период' >
                        <Column body={this.actionBodyTemplate} header={this.displayHeader1()} 
                            headerStyle={{width: '4em', textAlign: 'center'}} bodyStyle={{textAlign: 'center', overflow: 'visible'}}></Column>
                        <Column field='fullName' header="Полное имя" filter filterPlaceholder="Поиск по имени" sortable></Column>
                        <Column field="jobTitle" header="Должность" filter filterPlaceholder="Поиск по должности" sortable></Column>
                        <Column field="orgUnit" header="Место работы" filter filterPlaceholder="Поиск по подразделению" sortable></Column>
                        <Column field="phone" header="Телефон"></Column>
                </DataTable>
            </div>
        )
    }    
}