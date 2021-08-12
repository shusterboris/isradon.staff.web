import React, { Component } from 'react';
import {Card} from 'primereact/card'
import {Button} from 'primereact/button'
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import AppSets from '../service/AppSettings'
import axios from 'axios'
import { AutoComplete } from 'primereact/autocomplete';

export default class EmployeeCard extends Component {
    state = {
        orgUnits:[], 
        orgUnit:'',
        jobTitles:[],
        jobTitle:'',
        filteredOrgUnits:[],
        filteredJobTitles:[],
        firstName:'', lastName:'',nickName:'',
        pnone:'',eMail:'',birthday:'', shiftLength:8, daysInWeek:5, addConditions:''
    }
    
    constructor(props) {
        super(props);
        this.employee = this.createEmptyEmployee(); 
        this.filterOrgUnit = this.filterOrgUnit.bind(this);
        this.filterJobTitle = this.filterJobTitle.bind(this);
        this.initiateFields = this.initiateFields.bind(this);
        this.onCancelPressed = this.onCancelPressed.bind(this);
        this.onSavePressed = this.onSavePressed.bind(this);
    }

    componentDidMount(){
        AppSets.getOrgUnits(this);
        AppSets.getJobTitles(this);        
        const param = this.props.location.state;
        if (param){
            const id = param.id;
            axios.get(AppSets.host+'/employee/byId/'+id)
            .then(res => {
                this.initiateFields(res.data);
            })
            .catch(error => 
                console.log(error));
        }
    }    

    initiateFields(data){
        this.employee = data;
        let fldPhone = (data.phone) ? data.phone.slice(-12) : '';
        let fldBirthday = (data.birthday) ? data.birthday : '';
        let fldOrgUnit = (data.orgUnit) ? data.orgUnit.name : '';
        this.setState({lastName: data.lastName, firstName: data.firstName, nickName: data.nickName, 
            jobTitle:data.jobTitle, orgUnit: fldOrgUnit, phone: fldPhone, eMail: data.eMail, birthday: fldBirthday});
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

    filterJobTitle(event){
        let results;
        if (event.query.length === 0) {
            results = [...this.state.jobTitles];
        }
        else {
            results = this.state.jobTitles.filter((jobTitle) => {
                return jobTitle.toLowerCase().includes(event.query.toLowerCase());
            });
        }
        this.setState({filteredJobTitles: results});
        return results;
    }

    render() {

        return<div> 
            <Card title="Карточка сотрудника" >
                <div className="p-grid">
                    <div className = 'p-col-fixed' style={{ width: '260px'}}>
                        <img src={'/assets/demo/images/photo1.png'} 
                            onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt='Фото'></img>
                    </div>
                    <div className = 'p-col  p-my-0'>
                        <div className="p-grid form-group " >
                            <div className="p-col-2 p-mx-2" >                            
                                <span className="p-float-label">
                                    <InputText id="lastNameFld" value={this.state.lastName} 
                                        onChange={(e) => this.setState({lastName:e.target.value})}/>
                                    <label htmlFor="lastNameFld">Фамилия</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2" >                            
                                <span className="p-float-label">
                                    <InputText id="firstNameFld" value={this.state.firstName}  
                                        onChange={(e) => this.setState({firstName:e.target.value})}/>
                                    <label htmlFor="firstNameFld">Имя</label>
                                </span>
                            </div>
                            <div className="p-col-12 p-mx-2 p-my-2">                            
                                <span className="p-float-label">
                                    <InputText id="nickNameFld" value={this.state.nickName}  
                                        onChange={(e) => this.setState({nickName:e.target.value})}/>
                                    <label htmlFor="nickNameFld">Как называть (ник)</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2" >                            
                                <span className="p-float-label">
                                    <AutoComplete id="orgUnitFld" dropdown
                                        value={this.state.orgUnit} 
                                        suggestions={this.state.filteredOrgUnits} 
                                        completeMethod={this.filterOrgUnit}
                                        onChange={event => this.setState({ orgUnit: event.value, filteredOrgInits: null})}/>
                                    <label htmlFor="orgUnitFld">Место работы</label>
                                </span>
                            </div>
                            <div className="p-col-8 p-mx-2" >                            
                                <span className="p-float-label">
                                    <AutoComplete id="jobTitleFld" dropdown
                                        value={this.state.jobTitle} 
                                        suggestions={this.state.filteredJobTitles} 
                                        completeMethod={this.filterJobTitle}
                                        onChange={event => this.setState({ jobTitle: event.value, filteredJobTitles: null})}/>
                                    <label htmlFor="jobTitleFld">Должность</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2" >                            
                                <span className="p-float-label">
                                    <InputMask mask="99-999-99-99" id="phoneFld" value={this.state.phone} 
                                        onChange={(e) => this.setState({phone:e.target.value})} />
                                    <label htmlFor="phoneFld">Телефон</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2">                            
                                <span className="p-float-label">
                                    <InputText id="eMailFld" value={this.state.eMail}  
                                        onChange={(e) => this.setState({eMail:e.target.value})}/>
                                    <label htmlFor="eMailFld">Электронная почта</label>
                                </span>
                            </div>
                            <div className="p-col-12 p-mx-2" >                                
                                <span className="p-float-label">
                                    <InputMask mask='99/99/9999' slotChar='dd/mm/yyyy'  id="birthdayFld" 
                                        value={this.state.birthday} onChange={(e) => this.setState({birthday:e.target.value})} />
                                    <label htmlFor="birthdayFld">День рождения</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2">                            
                                <span className="p-float-label">
                                    <InputText id='shiftDurFld' value={this.state.shiftLength} width='3em' 
                                           onChange={(sl) => this.setState({shiftLength:sl.target.value})}/>
                                    <label htmlFor="shiftDurFld"> Длительность смены </label>
                                </span>
                            </div>
                            <div className="p-col-9 p-mx-2">
                                <span className="p-float-label">
                                    <InputText id="daysInWeekFld" value={this.state.daysInWeek} width='3em' 
                                            onChange={(diw) => this.setState({daysInWeek:diw.target.value})}/>
                                    <label htmlFor='daysInWeekFld'> Дней в неделю </label>
                                </span>
                            </div>
                            
                            <div className="p-col-12 p-mx-2" >  
                                <InputText value={this.state.addConditions} placeholder="Дополнительная информация"
                                           style={{width:"40%"}}
                                           onChange={(addc) => this.setState({addConditions:addc.target.value})}/>
                            </div>
                        </div>
                    </div>
                </div>
                <span>
                    <Button label="Сохранить" icon="pi pi-check" style={{marginRight: '1em'}} onClick={this.onSavePressed}/>
                    <Button label="Отменить" icon="pi pi-times" className="p-button-secondary" onClick={this.onCancelPressed}/>
                </span>
            </Card>
        </div>
    }

    onSavePressed(){
        this.props.history.goBack();
    }


    onCancelPressed(){
        this.props.history.goBack();
    }

    createEmptyEmployee(){
        const empty = {
            "id": 0,
            "fullName" : "",
            "nickName": "",
            "jobTitle":"",
            "orgUnit": "",
            "photoFile": "",
            "phone": "",
            "eMail": "",
            "userId": 10,
            "working": 0
        }
        return empty;
    }
}
