import React from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from "primereact/column";
import {Button} from 'primereact/button';
import {Messages} from 'primereact/messages';
import AppSets from '../service/AppSettings';
import axios from 'axios';

export default class EmployeeView extends React.Component{
    state = {
        employees: [],
        selectedRow: null,
      }
    
    constructor(props){
        super(props);
        this.actionBodyTemplate = this.actionBodyTemplate.bind(this);
        this.nameBody = this.nameBody.bind(this);
    }


    componentDidMount() {
        axios.get(AppSets.host+'/employee/active/list')
            .then(res => {
                const employeeList = res.data;
                this.setState({employees: employeeList})
            })
            .catch(()=>{
                let msg = {severity: 'error', summary: 'Данные не получены', detail: 'Возможно, проблемы со связью'};
                this.messages.current.show(msg);
            });
    }

    startEditEmployee(rowData){
        this.setState({selectedRow: rowData})
        this.props.history.push({pathname: '/employee-edit', state: {id: rowData.id}});
    }

    nameBody(rowData){
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
        this.messages.show({severity:'error', summary: 'Проблема', detail:'Не удалось получить данные с сервера. ВОзможно, плохая связь', life: 3000});
    }

    render(){
        return (
            <div className = 'p-grid'>
                <Messages ref={(el) => this.messages = el} style={{marginBottom: '1em'}} />
                <div className = 'p-col-12 datatable-style-sched-repo'></div>
                <DataTable value={this.state.employees}
                    scrollable scrollHeight="800px"
                    emptyMessage='Нет сведений для данного сотрудника за выбранный период' >
                        <Column body={this.actionBodyTemplate} 
                            headerStyle={{width: '3.5em', textAlign: 'center'}} bodyStyle={{textAlign: 'center', overflow: 'visible'}}></Column>
                        <Column body={this.nameBody} header="Полное имя"></Column>
                        <Column field="jobTitle" header="Должность"></Column>
                        <Column field="orgUnit" header="Место работы"></Column>
                        <Column field="phone" header="Телефон"></Column>
                </DataTable>
            </div>
        )
    }    
}