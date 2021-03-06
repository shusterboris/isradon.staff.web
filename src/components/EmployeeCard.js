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
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import Utils from '../service/utils';

export default class EmployeeCard extends Component {
    state = {
        wasChanged: false,
        id : null,
        orgUnits:[], 
        orgUnit:null,
        jobTitles:[],
        jobTitle:'',
        filteredOrgUnits:[],
        filteredJobTitles:[],
        firstName:'', lastName:'',nickName:'',
        phone:'',email:'',birthday:'', shiftLength:8, daysInWeek:5, shiftLengthOnFriday:null, addConditions:'',
        photoFile: null, photoData: null, working: true,
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
        this.isUploadButtonVisible = this.isUploadButtonVisible.bind(this);
        this.getEmployeeById = this.getEmployeeById.bind(this);
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
            }else{
                AppSets.getOrgUnitList(this);
            }
            if (param.hasOwnProperty('id')){
                const id = param.id;
                this.getEmployeeById(id);
            }
        }
    }    

    getEmployeeById(id){
        if (!id)
            {id = this.state.id}
        axios.get(AppSets.host+'/employee/byId/'+id)
        .then(res => {
            this.initiateFields(res.data);
            this.openPhoto();
        })
        .catch(error => 
            this.messages.show({ severity: 'error', summary: "???? ?????????????? ???????????????? ???????????? ?? ????????????????????????", sticky: true}));
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
                return orgunit.name.toLowerCase().includes(event.query.toLowerCase());
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
                    if (!res.data.startsWith("????????????")){
                        _this.setState({photoFile: res.data});
                        AppSets.saveEmployee(_this.state, _this, this.getEmployeeById);
                    }else{
                        _this.messages.show({severity:'warn', summary:res.data});
                    }
                    _this.setState({pleaseWait: false});
            })
            .then(()=>this.openPhoto())
            .catch(err=>{
                _this.setState({pleaseWait: false});
                this.dataService.processRequestsCatch(err, "???????????????? ???????? ????????????????????", this.messages, true);
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

    isUploadButtonVisible(){
        console.log(this.state.phone.includes('_'))
        if (!((this.state.firstName || this.state.lastName) && this.state.phone && this.state.jobTitle)){
            return false;
        }else if (this.state.phone === '' || this.state.phone.includes('_')){
            return false
        }else{
            //?????????????? ???????????????? ????????????, ?????????????? ?????????????????? ??????????????, ?????????????????? ??????????????
            return this.isPhoneValid(this.state.phone);
        }
    }

    render() {
        if (!AppSets.getUser().amIhr()){
            this.history.push("/access") }
        return<div> 
            <Card title="???????????????? ????????????????????" >
            <Toast id="toastMsg" ref={(m) => this.messages = m}/>
                <div className="p-grid">
                    <div className = 'p-col-fixed' style={{ width: '260px'}}>
                        <div className="p-field-checkbox">   
                            <Checkbox inputId="isWorkingFld" value={this.state.working} 
                                onChange={chk => this.onWorkStatusChange(chk)} 
                                checked={this.state.working === true}
                                tooltip="?????? ???????????????????? ?????????????? ?????? ?????????????? - ???? ???????????? ?? ?????????? ????????????"/>
                            <label htmlFor="isWorkingFld" className="p-checkbox-label">????????????????</label>
                        </div>
                        {!this.state.photoData ? 
                            <img src={'/assets/images/personal.png'}  alt='???????????????????? ????????????????????' id="photoTemplate"></img> : 
                            <img src = {this.state.photoData} width = {250} height={250} alt="???????????????????? ????????????????????" id="photoImage"
                                onError={(e) => e.target.src='/assets/images/personal.png'}/>
                        }
                        {this.isUploadButtonVisible() && 
                        <FileUpload mode="basic" name="document" 
                            accept="image/*" 
                            onBeforeUpload={x=>this.showSpinner(x)}
                            onClick= {x=>this.showSpinner(x)}
                            customUpload={true} uploadHandler={this.uploadHandler}
                            auto chooseLabel="?????????????????? ????????">
                        </FileUpload>}
                    </div>
                    <div className = 'p-col  p-my-0'>
                        <div className="p-grid form-group " >
                            <div className="p-col-2 p-mx-2" >                            
                                <span className="p-float-label">
                                    <InputText id="lastNameFld" value={this.state.lastName} maxLength={15} 
                                        onChange={(e) => this.setState({lastName:e.target.value, wasChanged: true})}/>
                                    <label htmlFor="lastNameFld">??????????????*</label>
                                </span>
                            </div>
                            <div className="p-col-8 p-mx-2" >                            
                                <span className="p-float-label">
                                    <InputText id="firstNameFld" value={this.state.firstName}  maxLength={15}
                                        onChange={(e) => this.setState({firstName:e.target.value, wasChanged: true})}/>
                                    <label htmlFor="firstNameFld">??????*</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2" >                            
                                <span className="p-float-label">
                                    <AutoComplete id="orgUnitFld" dropdown
                                        value={this.state.orgUnit} 
                                        suggestions={this.state.filteredOrgUnits} field="name"
                                        completeMethod={this.filterOrgUnit}
                                        onChange={event => this.setState({ orgUnit: event.value, filteredOrgInits: null, wasChanged: true})}/>
                                    <label htmlFor="orgUnitFld">?????????? ????????????</label>
                                </span>
                            </div>
                            <div className="p-col-8 p-mx-2" >                            
                                <span className="p-float-label">
                                    <AutoComplete id="jobTitleFld" dropdown
                                        value={this.state.jobTitle} 
                                        suggestions={this.state.filteredJobTitles} 
                                        completeMethod={this.filterJobTitle}
                                        onChange={event => this.setState({ jobTitle: event.value, filteredJobTitles: null, wasChanged: true})}/>
                                    <label htmlFor="jobTitleFld">??????????????????*</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2" >                            
                                <span className="p-float-label">
                                    <InputMask mask="999-999-99-99" id="phoneFld" value={this.state.phone} 
                                        onChange={(e) => this.setState({phone:e.target.value, wasChanged: true})} />
                                    <label htmlFor="phoneFld">??????????????*</label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2">                            
                                <span className="p-float-label">
                                    <InputText id="eMailFld" type="email" value={this.state.email}  
                                        onChange={(e) => this.setState({email:e.target.value, wasChanged: true})}/>
                                    <label htmlFor="eMailFld">?????????????????????? ??????????</label>
                                </span>
                            </div>
                            <div className="p-col-12 p-mx-2" >                                
                                <span className="p-float-label">
                                    <InputMask mask='99/99/9999' slotChar='dd/mm/yyyy'  id="birthdayFld" 
                                        value={this.state.birthday} onChange={(e) => this.setState({birthday:e.target.value, wasChanged: true})} />
                                    <label htmlFor="birthdayFld">???????? ????????????????</label>
                                    {this.props.pleaseWait && <ProgressSpinner />}
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2">
                                <span className="p-float-label">
                                    <InputText id="daysInWeekFld" value={this.state.daysInWeek} width='3em' keyfilter="int"
                                            onChange={(diw) => this.setState({daysInWeek:diw.target.value, wasChanged: true})}/>
                                    <label htmlFor='daysInWeekFld'> ????????/??????.* </label>
                                </span>
                            </div>
                            <div className="p-col-2 p-mx-2">                            
                                <span className="p-float-label">
                                    <InputText id='shiftDurFld' value={this.state.shiftLength} width='3em' keyfilter="num"
                                           onChange={(sl) => this.setState({shiftLength:sl.target.value, wasChanged: true})}/>
                                    <label htmlFor="shiftDurFld"> ??????????, ??* </label>
                                </span>
                            </div>
                            <div className="p-col-7 p-mx-2">
                                <span className="p-float-label">
                                    <InputText id="shiftDurFryFld" value={this.state.shiftLengthOnFriday} width='3em' keyfilter="num" 
                                            onChange={(diw) => this.setState({shiftLengthOnFriday:diw.target.value, wasChanged: true})}/>
                                    <label htmlFor='shiftDurFryFld'> ?? ??????????????, ?? </label>
                                </span>
                            </div>
                            
                            <div className="p-col-12 p-mx-2" >  
                                <InputText value={this.state.addConditions} placeholder="???????????????????????????? ????????????????????" id="addInfoFld"
                                           style={{width:"40%"}}
                                           onChange={(addc) => this.setState({addConditions:addc.target.value, wasChanged: true})}/>
                            </div>
                        </div>
                        
                    </div>
                </div>
                <span>
                    {this.state.wasChanged && 
                        <Button label="??????????????????" icon="pi pi-check" style={{marginRight: '1em'}} id="saveButton"
                                onClick={this.onSavePressed}/>
                    }
                    <Button label="??????????????" icon="pi pi-times" className="p-button-secondary" id="cancelButton"
                        onClick={this.goBack}/>
                </span>
            </Card>
        </div>
    }

    isPhoneValid(enteredPhone){
        if (enteredPhone.startsWith('0')){
            enteredPhone =  enteredPhone.replace('0', '+972');
        }
        const result = parsePhoneNumberFromString(enteredPhone)
        return (result && result.isValid());
    }

    isDataValid(messages){
        let errFields = [];
        let lstFlds = ""
        let msg = ""
        if (!this.state.firstName && !this.state.lastName){
            errFields.push('?????? ?????? ??????????????')
        }else if ((this.state.firstName && this.state.firstName.trim() === "") || 
                    (this.state.lastName && this.state.lastName.trim() === "")){
            errFields.push('?????? ?????? ??????????????')
        }
        if (!this.state.jobTitle || this.state.jobTitle.trim() === ''){
            errFields.push('??????????????????')
        }
        if (!this.state.phone || this.state.phone.trim() === ''){
            errFields.push('?????????? ????????????????')
        }
        if (errFields.length !== 0){
            lstFlds = errFields.join(", ")
            msg = "???? ??????????????: "+lstFlds+". ?????? ????????, ???????????????????????? ???????????????? * ???????????? ???????? ?????????????????????? ??????????????????!";
            messages.show({severity: 'error', summary: msg, sticky: true});
            return false;
        }
        errFields = [];
        if (this.state.orgUnit) {
            if (this.state.orgUnit.hasOwnProperty("name")){
                if (!this.state.orgUnits.find((ou)=>(ou.name === this.state.orgUnit.name))){
                    errFields.push('???????????????????????? ???????????????? ??????????????????????????');
                }
            }else{
                if (!this.state.orgUnits.find((ou)=>(ou.name === this.state.orgUnit))){
                    errFields.push('???????????????????????? ???????????????? ??????????????????????????');
                }
            }
        }
        if (!this.state.jobTitles.find((jt)=>(jt === this.state.jobTitle))){
            errFields.push('???????????????????????? ???????????????? ??????????????????');
        }
        if (this.state.email && !Utils.emailIsValid(this.state.email)){
            errFields.push('???????????????????????? ???????????? ?????????????????????? ??????????');
        }
        if (!this.state.shiftLength){
            errFields.push("???????????????????????? ?????????? ???????????? ???????? ??????????????");
        }else if (this.state.shiftLength < 0 || this.state.shiftLength > 12){
            errFields.push("???????????????????????? ?????????? ???????????? ???????? ???????????? 0 ?? ???????????? 12");
        }
        if (this.state.shiftLengthOnFriday && (this.state.shiftLengthOnFriday < 0 || this.state.shiftLengthOnFriday > 12)){
            errFields.push("???????????????????????? ??????????  ?? ?????????????? ???????????? ???????? ???????????? 0 ?? ???????????? 12");
        }
        if (!this.state.daysInWeek){
            errFields.push("???????????????????? ?????????????? ???????? ?? ???????????? ???? ?????????? ???????? ????????????")
        }else if (this.state.daysInWeek <= 0 || this.state.daysInWeek > 7){
            errFields.push("???????????????????? ?????????????? ???????? ?? ???????????? ???????????? ???????? ???????????? ???? 1 ???? 7");
        }
        if (this.state.birthday){
            try{
                const birthday = this.moment(this.state.birthday,"DD/MM/yyyy");
                if (!birthday.isValid()){
                    return false;
                }            
                const minInt = this.moment().subtract(16,'years');
                const maxInt = this.moment().subtract(80,'years');
                if (!birthday.isBetween(maxInt,minInt)){
                    errFields.push('???????????????????????? ???????? ???????????????? (???????????????? ??????????????)')
                }
            }catch(err){
                errFields.push("?????????????? ???????????????????????? ???????? ????????????????")
            }
        }
        if (this.state.phone){
            let phoneNumber = this.isPhoneValid(this.state.phone);
            if (!phoneNumber){
                errFields.push("?????????? ???????????????? ????????????????????????");
            }
        }
        if (errFields.length !== 0){
            lstFlds = errFields.join(", ")
            msg = "?????? ?????????? ???????????? ???????????????????? ?????????????????? ????????????. "+lstFlds;
            messages.show({severity: 'error', summary: msg, sticky: true});
            return false;
        }
        return true;
    }

    onSavePressed(){
        if (this.state.wasChanged){
            if (this.isDataValid(this.messages)){
                AppSets.saveEmployee(this.state, this, this.getEmployeeById);
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
