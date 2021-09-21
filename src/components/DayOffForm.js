import React, { Component } from 'react';
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Messages } from 'primereact/messages';
import App from '../App';
import AppSets from '../service/AppSettings';
import ScheduleService from '../service/ScheduleService';
import { Dropdown } from 'primereact/dropdown';
import { row_types } from '../service/AppSettings';
import { Tooltip } from 'primereact/tooltip';
import { FileUpload } from 'primereact/fileupload';
import Utils from '../service/utils';
import axios from 'axios';

export default class DayOffForm extends Component {
    state = {eventType: null, reason: '', id: null, errorMsg:'', employees: [], photoFile:null, photoData: null};

    constructor(props) {
        super(props);
        this.dataService = new ScheduleService();
        this.user = AppSets.getUser();
        this.hismodetory = props.history;
        this.editStartDate = this.editStartDate.bind(this);
        this.editEndDate = this.editEndDate.bind(this);
        this.isDataValid = this.isDataValid.bind(this);
        this.save = this.save.bind(this);
        this.setSingleUserEditMode     = this.setSingleUserEditMode    .bind(this);
        this.onChangeType = this.onChangeType.bind(this);
        this.ownerId = 1;
        this.eventTypeEditable = true;
        this.isDataValid = this.isDataValid.bind(this);
        this.uploadHandler = this.uploadHandler.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
        
        const param = this.props.location.state;
        if (! param.hasOwnProperty('mode')){
            this.state.errorMsg = 'Некорректный режим открытия страницы'
            return;
        }

        if (! (param.hasOwnProperty('start')) && param.hasOwnProperty('end')){
            this.state.errorMsg = 'Некорректный режим открытия страницы'
            return;
        }   
        let eventType  = row_types[0]; 
        if (param.hasOwnProperty('rowType')){
            eventType = row_types[param.rowType];
        }
        let emloyeeName = '';
        if (param.hasOwnProperty('employee')){
            emloyeeName = param.employee;
        }

        let photoFile = '';
        if (param.hasOwnProperty('photoFile')){
            photoFile = param.photoFile;
        }

        this.accepted = param.accepted;

        this.mode = param.mode;
        this.setEditMode(this.mode, eventType);

        this.state = {start: param.dateStart, end: param.dateEnd, employee: emloyeeName, errorMsg:'',
            employees: param.employeeList, eventType: eventType, photoFile: photoFile};
    }

    componentDidMount(){
        this.editMode = true;
        this.setEditMode(this.mode);
        this.dataService.openPhoto(this);
    }

    setEditMode(mode, eventTypeObj){
        if (!AppSets.getUser().amIhr()){
            this.setSingleUserEditMode(mode, eventTypeObj);
        }else{
            this.setHrEditMode(mode, eventTypeObj);
        }

    }

    setHrEditMode(mode){

    }

    setSingleUserEditMode(mode, eventType){
        //открывает рядовой сотрудник
        //задача: определить, с какой даты можно планировать и можно ли редактировать даты
        const moment = require('moment');
        if (mode === 'create'){//создается новый
            this.editMode = true;
            this.startDateDisabled = false;
            this.endDateDisabled = false;
            this.empoyeeEditDisabled = false;
            this.typeEditDisabled = false;
            if (eventType!=null && !AppSets.rowTypesIsEqual(eventType.id, "SEAK_LEAVE")){
                let start = moment();
                if (start.isSameOrBefore(moment())){
                    //если дата начала уже прошла, а пользователь создает что-то, кроме больниченого - запрещаем
                    this.empoyeeEditDisabled = true;
                    this.typeEditDisabled = true;        
                    this.startDateDisabled = true;
                    this.endDateDisabled = true;
                    return;   
                }
            }
            if (eventType!=null && AppSets.rowTypesIsEqual(eventType.id, "REST")) {
                //это отпуск минимальная дата + заданное количество дней от сегодня
                let minDate = moment();
                minDate.add(AppSets.restTimeLag, 'days');
                this.startDateMin = minDate.toDate();
                this.endDateMin = minDate.add(1, 'days').toDate();               
            }else if (eventType!=null && AppSets.rowTypesIsEqual(eventType.id, "DAY_OFF")) {
                let minDate = moment();
                minDate.add(AppSets.dayOffTimeLag, 'days');
                this.startDateMin = minDate.toDate();
                this.endDateMin = minDate.add(1, 'days').toDate();               
            }else if (eventType!=null && AppSets.rowTypesIsEqual(eventType.id, "SEAK_LEAVE")){
                //для больничного включен режим редактирования, можно задним числом, но не больше, чем на месяц
                this.editMode = true;
                let minDate = moment();
                minDate.subtract(31, 'days');
                this.startDateMin = minDate.toDate();
                this.endDateMin = minDate.toDate();
            }else{
                this.startDateDisabled = true
                this.endDateDisabled = true   
            }
        }else{
            //режим редактирования готовой записи
            // нельзя менять сотрудника и тип записи
            this.empoyeeEditDisabled = true;
            this.typeEditDisabled = true;
            let minDate = moment();
            if (eventType!=null && AppSets.rowTypesIsEqual(eventType.id, "REST")) {
                //это отпуск 
                let start = moment(this.dateStart);
                if (start.isSameOrBefore(moment())){//если отпуск уже начался - ничего изменить уже нельзя
                    this.startDateDisabled = true;
                    this.endDateDisabled = true;   
                }else{//не утвержден - даем менять, но это будет проверено при попытке сохранения
                    minDate.add(AppSets.restTimeLag, 'days');
                    this.startDateMin = minDate.toDate();
                    this.endDateMin = minDate.add(1, 'days').toDate();                   
                }
            }else if (eventType!=null && AppSets.rowTypesIsEqual(eventType.id, "DAY_OFF")) {
                let start = moment(this.dateStart);
                let minDate = moment(this.dateStart);
                if (start.isSameOrBefore(moment())){//если отпуск уже начался - нельзя менять дату начала
                    this.startDateDisabled = true;
                }else{
                    minDate.add(AppSets.dayOffTimeLag, 'days');
                    this.startDateMin = minDate.toDate();    
                }
                let end = moment(this.dateEnd);
                if (end.isSameOrBefore(moment())){//если дата окончания прошла - все
                    this.endDateDisabled = true;
                }else{
                    minDate.add(1, 'days');
                    this.startDateMin = minDate.toDate();
                    this.endDateMin = minDate.add(1, 'days').toDate();               
                }
            }else if (eventType!=null && AppSets.rowTypesIsEqual(eventType.id, "SEAK_LEAVE")){
                //для больничного включен режим редактирования, можно задним числом, но не больше, чем на месяц
                this.editMode = true;
                let minDate = moment();
                minDate.subtract(31, 'days');
                this.startDateMin = minDate.toDate();
                this.endDateMin = minDate.toDate();
            }else{
                //работа

                this.startDateDisabled = true
                this.endDateDisabled = true   
            }


        }
    }
    
    thisIsMy(){
        return this.state.id == null || this.state.id === App.getUser().getId();
    }

    isDataValid(){
        if (!this.state.employee){
            this.messages.show({severity: 'error', summary: "Не выбран сотрудник!"});
            return false;
        }
        if (!this.state.eventType){
            this.messages.show({severity: 'error', summary: "Не выбрана причина отсутствия - отпуск, больничный и т.д.!"});
            return false;
        }
        if (this.state.start > this.state.end){
            this.messages.show({severity: 'error', summary: "Дата окончания больше даты начала!"});
            return false;
        }
        const daysDiffers = (this.state.start - this.state.end) / 1000 / 60 / 60 / 24;
        if (daysDiffers > 31){
            this.messages.show({severity: 'error', summary: "Слишком большой интервал дат!"});
            return false;
        }

        return true;
    }

    save(){
        if (! this.isDataValid())
            return;
        this.dataService.saveDayOff(this);
    }

    editStartDate(value){
        //если режим редактирования включен - присваиваем измененное с клавиатуры значение, иначе нет
        if (this.editMode){
            this.setState({start:  value});
        }
    }

    editEndDate(value){
        if (this.editMode){
            this.setState({end:  value});
        }
    }

    onChangeType(chosenType){
        this.setState({eventType: chosenType.value});
        this.setEditMode(this.mode, chosenType.target.value);
    }

    isFilledOut(){
        //ключевые поля заполнены
        return (this.state.employee && this.state.eventType && this.state.start && this.state.end)
    }

    uploadScan(file, extention, _this){
        const cType = Utils.getContentTypeByExtention(extention);
        const config = {headers: { 'Content-Type': cType, timeout: AppSets.timeout }}
        axios.post(AppSets.host + '/files/image/save', file, config)
            .then(res => {
                _this.setState({photoFile: res.data});
                this.dataService.saveDayOff(_this)
            })
            .catch(err=>{
                this.dataService.processRequestsCatch(err, "Загрузка фото сотрудника", this.messages, true);
            });
            
    }       

    uploadHandler(event){
        if (!this.isDataValid())
            return;
        
        const fileName = event.files.shift();
        const extention = Utils.getFileExtension(fileName.name)
        if ((extention.length > 4 || extention.length < 2) || (!['jpg', 'jpeg', 'png', 'pdf'].includes(extention))){
            this.messages.show({severity: 'error', summary: 'Неправильный тип файла. Разрешенными типами являются: png, pdf, jpg'});
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.uploadScan(e.target.result, extention, this);
        };
        fileReader.readAsDataURL(fileName);
    }

    downloadFile(){
        if (AppSets.getUser().amIhr()){
            this.dataService.downloadFile(this.state.photoFile, this);
        }else{
            this.messages.show({severity:'warn', summary:'У Вас нет полномочий получать чужой больничный'})
        }
    }

    render() {
        if (!AppSets.getUser()) 
            { this.history.push("/login")}
        return(
        <div className="card" >
            <Messages ref={(msgE) => this.messages = msgE} style={{marginBottom: '1em'}}/>
            
            <div className="p-grid nested-grid">
                <div className="p-col-4">
                    <div className="p-col-12 p-float-label" >                        
                        <Dropdown id='employeeFld' value={this.state.employee} 
                            options={this.state.employees}
                            disabled={this.empoyeeEditDisabled}
                            optionLabel="fullName" 
                            onChange = {pers=>this.setState({employee: pers.value})}
                            style={{width:'100%'}}>
                        </Dropdown> 
                        <label htmlFor="employeeFld">Сотрудник</label>
                    </div>
                    <div className="p-col-12 p-float-label">
                        <Dropdown id='reasonTypeFld' value={this.state.eventType} style={{width:'100%'}}
                            disabled={this.typeEditDisabled}
                            options={row_types} optionLabel="name"
                            required={true}
                            onChange={chosenType => {this.onChangeType(chosenType)}}/>
                        <label htmlFor="reasonTypeFld">Причина</label>
                    </div>
                    <div className="p-col-12 p-float-label">
                        <InputText id='reasonFld' value={this.state.reason} 
                            onChange={(reasonText) => 
                                this.setState({ reason: reasonText.target.value })}
                            style={{width: '100%'}} ></InputText>
                        <label htmlFor="reasonFld">Пояснения сотрудника</label>
                    </div>

                    <div className="p-col-12">
                        <div className="p-grid">
                            <div className="p-col-6 p-float-label" >
                                <Calendar id='startCalendarFld' value={this.state.start} 
                                    showWeek showIcon dateFormat="dd/mm/yy" 
                                    disabled = {!this.state.eventType  || this.startDateDisabled}
                                    minDate = {this.startDateMin} 
                                    onChange={(newStartDate) => this.editStartDate(newStartDate.value)}  />
                                <label htmlFor="startCalendarFld">Дата начала*</label>
                            </div>
                            <div className="p-col-6 p-float-label">
                                <Calendar id='endCalendarFld' value={this.state.end} 
                                    showWeek showIcon dateFormat="dd/mm/yy"
                                    disabled = {!this.state.eventType || this.endDateDisabled}
                                    minDate={this.endDateMin}
                                    onChange={(newEndDate) => this.editEndDate(newEndDate.value)}  />
                                <label htmlFor="endCalendarFld">Дата окончания*</label>
                            </div>
                        </div>
                    </div>
                    <div className="p-col-12">
                        <div className="p-grid">
                            <div className="p-col-8">
                                <Button label="Закрыть" onClick={this.props.history.goBack} style={{marginRight: '1em'}}></Button>
                                {this.isFilledOut() &&
                                <Button label="Сохранить" onClick={this.save} style={{marginRight: '1em'}}></Button>}
                            </div>
                            <div className="p-col-4">
                                {(this.isFilledOut() && AppSets.getUser().amIhr()) &&
                                <Button label="Удалить" style={{marginRight: '1em'}}></Button>}
                            </div>                
                        </div>
                    </div>
                </div>
                {this.state.eventType.id == AppSets.getRowType("SEAK_LEAVE").id && 
                <div className="p-col-4">
                    <Tooltip target=".scan" mouseTrack mouseTrackLeft={10}/>
                    {this.state.photoFile ? 
                        <img className="scan" src = {this.state.photoData} width = {250} height={300} alt="Скан-копия документа"
                            onError={(e) => e.target.src='/assets/images/3-schedule.png'} data-pr-tooltip="Соответствующей кнопкой сюда можно загрузить документ"/> :
                        <img className="scan" src = '/assets/images/3-schedule.png' width = {250} height={250} alt="Место для скан-копии документа"
                            data-pr-tooltip="Соответствующей кнопкой сюда можно загрузить документ"/>
                    }
                    <div className="p-grid" style={{margin:"0.5em 0 0 0"}}>
                        <FileUpload mode="basic" name="document" className="p-button-rounded" icon="pi pi-cloud-upload"
                            customUpload={true}
                            uploadHandler={this.uploadHandler}
                            maxFileSize={1024000} 
                            chooseLabel="Загрузить"
                            auto  />
                        {this.state.photoFile && 
                        <Button className="p-button-rounded p-button-info" icon="pi pi-download" 
                            label="Получить"
                            tooltip="Скачать скан-копию документа"
                            style={{marginLeft:"2em"}}
                            onClick={this.downloadFile}/>
                        }
                    </div>
                </div>}            
            </div>
        </div>
    )}
}