import React, { Component } from 'react';
import {Card} from 'primereact/card'
import {Button} from 'primereact/button'
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Checkbox} from 'primereact/checkbox';
import AppSets from '../service/AppSettings';
import axios from 'axios';
import { AutoComplete } from 'primereact/autocomplete';
import ScheduleService from '../service/ScheduleService';
import { Messages } from 'primereact/messages';
import { FileUpload } from 'primereact/fileupload';

export default class EmployeeCard extends Component {
    state = {
        wasChanged: false,
        orgUnits:[], 
        orgUnit:null,
        jobTitles:[],
        jobTitle:'',
        filteredOrgUnits:[],
        filteredJobTitles:[],
        firstName:'', lastName:'',nickName:'',
        phone:'',email:'',birthday:'', shiftLength:8, daysInWeek:5, shiftLengthOnFriday:0, addConditions:'',
        photoFile: null, photoData: null
    }
    
    constructor(props) {
        super(props);
        this.dataService = new ScheduleService();
        this.employee = this.createEmptyEmployee(); 
        this.filterOrgUnit = this.filterOrgUnit.bind(this);
        this.filterJobTitle = this.filterJobTitle.bind(this);
        this.initiateFields = this.initiateFields.bind(this);
        this.onCancelPressed = this.goBack.bind(this);
        this.onSavePressed = this.onSavePressed.bind(this);
        this.goBack = this.goBack.bind(this);
        this.onWorkStatusChange = this.onWorkStatusChange.bind(this);
        this.uploadEmployeePhoto = this.uploadEmployeePhoto.bind(this);
        this.uploadHandler = this.uploadHandler.bind(this);
        this.history = props.history;
        this.moment = require('moment');
    }

    componentDidMount(){
        AppSets.getJobTitles(this);        
        const param = this.props.location.state;
        if (param){
            const orgUnitListParam = param.orgUnitList;
            if (orgUnitListParam){
                const orgUnitList = JSON.parse(orgUnitListParam);
                this.setState({orgUnits: orgUnitList});
        }   else{
                AppSets.getOrgUnitList(this);
            }
            const id = param.id;
            axios.get(AppSets.host+'/employee/byId/'+id)
            .then(res => {
                this.initiateFields(res.data);
                this.openPhoto();
            })
            .catch(error => 
                this.messages.show({ severity: 'error', summary: "Не удается получить данные о пользователе", sticky: true}));
        }
    }    

    initiateFields(data){
        this.employee = data;
        let fldPhone = (data.phone) ? data.phone.slice(-13) : '';
        let fldBirthday = null;
        if (data.birthday){
            fldBirthday = this.moment(data.birthday,"yyyy-MM-DD").format("DD/MM/yyyy")
        }
        this.orgUnitName = data.orgUnit;
        const found = this.state.orgUnits.find(ou => ou.name === this.orgUnitName)
        this.setState({lastName: data.lastName, firstName: data.firstName, working: data.working,
            jobTitle:data.jobTitle, phone: fldPhone, orgUnit: found, addConditions: data.addConditions,
            email: data.email, birthday: fldBirthday, id:data.id, shiftLength: data.shiftLength, 
            shiftLengthOnFriday: data.shiftLengthOnFriday,  daysInWeek: data.daysInWeek, photoFile: data.photoFile,
            photoData: null
        }); 
    }

    openPhoto(){
        if (!this.state.photoFile)
            {return}
        const query = AppSets.host+'/files/getImageByName/'+this.state.photoFile;
        axios.get(query, { responseType: 'arraybuffer' },)
        .then(response => {
            const base64 = btoa(
                new Uint8Array(response.data).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  '',
                ),
              );
            this.setState({photoData: "data:;base64," + base64})
        })
        .catch(err=>
            console.log(err)
        )
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

    onWorkStatusChange(event){
        this.setState({working: event.checked, wasChanged: true});
    }

    uploadEmployeePhoto(file, _this){
        const config = {headers: { 'Content-Type': 'image/png', timeout: AppSets.timeout }}
        axios.post(AppSets.host + '/files/image/save', file, config)
            .then(res => {
                _this.setState({photoFile: res.data});
                AppSets.saveEmployee(_this.state, _this);
            })
            .catch(err=>{
                this.dataService.processRequestsCatch(err, "Загрузка фото сотрудника", this.messages, true);
            });
            
    }       

    uploadHandler(files){
        const file = files.files.shift();
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.uploadEmployeePhoto(e.target.result, this);
        };
        fileReader.readAsDataURL(file);
    }

    render() {
        if (!AppSets.getUser())
            { this.history.push("/login")}
        return<div> 
            <Card title="Карточка сотрудника" >
            <Messages ref={(m) => this.messages = m}/>
                <div className="p-grid">
                    <div className = 'p-col-fixed' style={{ width: '260px'}}>
                        <div className="p-field-checkbox">   
                            <Checkbox inputId="isWorkingFld" value={this.state.working} 
                                onChange={chk => this.onWorkStatusChange(chk)} 
                                checked={this.state.working === true}></Checkbox>
                            <label htmlFor="isWorkingFld" className="p-checkbox-label">Работает</label>
                        </div>
                        {!this.state.photoData ? 
                            <img src={'/assets/images/personal.png'}  alt='Фотография сотрудника'></img> : 
                            <img src = {this.state.photoData} width = {250} height={250} alt="Фотография сотрудника"
                                onError={(e) => e.target.src='/assets/images/personal.png'}/>
                        }
                        <FileUpload mode="basic" name="document" 
                            accept="image/*" 
                            maxFileSize={1024000} invalidFileSizeMessageSummary="Слишком большой файл" invalidFileSizeMessageDetail = "Максимально допустимый размер файла 1 Мб" 
                            customUpload={true} uploadHandler={this.uploadHandler}
                            auto chooseLabel="Загрузить фото">
                        </FileUpload>
                    </div>
                    <div className = 'p-col  p-my-0'>
                        <div className="p-grid form-group " >
                            <div className="p-col-2 p-mx-2" >                            
                                <span className="p-float-label">
                                    <InputText id="lastNameFld" value={this.state.lastName} 
                                        onChange={(e) => this.setState({lastName:e.target.value, wasChanged: true})}/>
                                    <label htmlFor="lastNameFld">Фамилия*</label>
                                </span>
                            </div>
                            <div className="p-col-8 p-mx-2" >                            
                                <span className="p-float-label">
                                    <InputText id="firstNameFld" value={this.state.firstName}  
                                        onChange={(e) => this.setState({firstName:e.target.value, wasChanged: true})}/>
                                    <label htmlFor="firstNameFld">Имя*</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2" >                            
                                <span className="p-float-label">
                                    <AutoComplete id="orgUnitFld" dropdown
                                        value={this.state.orgUnit} 
                                        suggestions={this.state.filteredOrgUnits} field="name"
                                        completeMethod={this.filterOrgUnit}
                                        onChange={event => this.setState({ orgUnit: event.value, filteredOrgInits: null, wasChanged: true})}/>
                                    <label htmlFor="orgUnitFld">Место работы</label>
                                </span>
                            </div>
                            <div className="p-col-8 p-mx-2" >                            
                                <span className="p-float-label">
                                    <AutoComplete id="jobTitleFld" dropdown
                                        value={this.state.jobTitle} 
                                        suggestions={this.state.filteredJobTitles} 
                                        completeMethod={this.filterJobTitle}
                                        onChange={event => this.setState({ jobTitle: event.value, filteredJobTitles: null, wasChanged: true})}/>
                                    <label htmlFor="jobTitleFld">Должность*</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2" >                            
                                <span className="p-float-label">
                                    <InputMask mask="999-999-99-99" id="phoneFld" value={this.state.phone} 
                                        onChange={(e) => this.setState({phone:e.target.value, wasChanged: true})} />
                                    <label htmlFor="phoneFld">Телефон*</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2">                            
                                <span className="p-float-label">
                                    <InputText id="eMailFld" value={this.state.email}  
                                        onChange={(e) => this.setState({email:e.target.value, wasChanged: true})}/>
                                    <label htmlFor="eMailFld">Электронная почта</label>
                                </span>
                            </div>
                            <div className="p-col-12 p-mx-2" >                                
                                <span className="p-float-label">
                                    <InputMask mask='99/99/9999' slotChar='dd/mm/yyyy'  id="birthdayFld" 
                                        value={this.state.birthday} onChange={(e) => this.setState({birthday:e.target.value, wasChanged: true})} />
                                    <label htmlFor="birthdayFld">День рождения</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2">                            
                                <span className="p-float-label">
                                    <InputText id='shiftDurFld' value={this.state.shiftLength} width='3em' 
                                           onChange={(sl) => this.setState({shiftLength:sl.target.value, wasChanged: true})}/>
                                    <label htmlFor="shiftDurFld"> Смена, ч </label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2">
                                <span className="p-float-label">
                                    <InputText id="daysInWeekFld" value={this.state.daysInWeek} width='3em' 
                                            onChange={(diw) => this.setState({daysInWeek:diw.target.value, wasChanged: true})}/>
                                    <label htmlFor='daysInWeekFld'> Дней/нед. </label>
                                </span>
                            </div>
                            <div className="p-col-7 p-mx-2">
                                <span className="p-float-label">
                                    <InputText id="shiftDurFryFld" value={this.state.shiftLengthOnFriday} width='3em' 
                                            onChange={(diw) => this.setState({shiftLengthOnFriday:diw.target.value, wasChanged: true})}/>
                                    <label htmlFor='shiftDurFryFld'> В пятницу </label>
                                </span>
                            </div>
                            
                            <div className="p-col-12 p-mx-2" >  
                                <InputText value={this.state.addConditions} placeholder="Дополнительная информация"
                                           style={{width:"40%"}}
                                           onChange={(addc) => this.setState({addConditions:addc.target.value, wasChanged: true})}/>
                            </div>
                        </div>
                        
                    </div>
                </div>
                <span>
                    {this.state.wasChanged && 
                        <Button label="Сохранить" icon="pi pi-check" style={{marginRight: '1em'}} onClick={this.onSavePressed}/>
                    }
                    <Button label="Отменить" icon="pi pi-times" className="p-button-secondary" onClick={this.goBack}/>
                </span>
            </Card>
        </div>
    }

    isDataValid(messages){
        let errFields = [];
        if (!this.state.firstName && !this.state.lastName){
            errFields.push('Имя или фамилия')
        }if (!this.state.jobTitle || this.state.jobTitle.trim() === ''){
            errFields.push('Должность')
        }if (!this.state.phone || this.state.phone.trim() === ''){
            errFields.push('Номер телефона')
        }
        if (errFields.length !== 0){
            const lstFlds = errFields.join(", ")
            const msg = "Не введены: "+lstFlds+". Все поля, обозначенные символом * должны быть обязательно заполнены!";
            messages.show({severity: 'error', summary: msg});
            return false;
        }
        return true;
    }

    onSavePressed(){
        if (this.state.wasChanged){
            if (this.isDataValid(this.messages)){
                AppSets.saveEmployee(this.state, this);
            }
        }
    }


    goBack(){
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
            "email": "",
            "userId": 10,
            "working": true
        }
        return empty;
    }
}
