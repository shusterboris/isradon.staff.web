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
import { SplitButton} from 'primereact/splitbutton';
import Confirmation from './Confirmation';
import Utils from '../service/utils';
import axios from 'axios';
import { ListBox} from 'primereact/listbox';

export default class DayOffForm extends Component {
    state = {eventType: null, reason: '', id: null, errorMsg:'', employees: [], 
                photoFile:null, photoData: null, salesInfo: [], showConfirm: false};

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
        this.onBtnRemoveClick = this.onBtnRemoveClick.bind(this);
        this.onBtnAcceptClick = this.onBtnAcceptClick.bind(this);
        this.delete = this.delete.bind(this);
        this.accept = this.accept.bind(this);
        this.afterDelete = this.afterDelete.bind(this);
        this.inThePast = this.inThePast.bind(this);
        this.hideConfirmationDlg = this.hideConfirmationDlg.bind(this);
        this.displaySalesRow = this.displaySalesRow.bind(this)
        
        const param = this.props.location.state;
        if (! param.hasOwnProperty('mode')){
            this.state.errorMsg = 'Некорректный режим открытия страницы'
            return;
        }

        if (! (param.hasOwnProperty('start')) && param.hasOwnProperty('end')){
            this.state.errorMsg = 'Некорректный режим открытия страницы'
            return;
        }   
        const eventType  = (param.hasOwnProperty('rowType')) ? row_types[param.rowType] : row_types[0]; 
        const emloyeeName = (param.hasOwnProperty('employee')) ? param.employee : '';
        const id = (param.hasOwnProperty('id')) ? param.id : '';
        const photoFile = (param.hasOwnProperty('photoFile')) ? param.photoFile : '';

        this.accepted = param.accepted;
        this.mode = param.mode;
        this.setEditMode(this.mode, eventType);

        this.state = {start: param.dateStart, end: param.dateEnd, employee: emloyeeName, errorMsg:'', id: id,
            employees: param.employeeList, eventType: eventType, photoFile: photoFile, addButtons: []};
    }

    componentDidMount(){
        this.editMode = true;
        this.setEditMode(this.mode);
        let addButtons = [];
        addButtons.push({label: 'Удалить', icon: 'pi pi-trash', command: () => {this.onBtnRemoveClick()}});

        //если еще не утверждено - добавить кнопку утверждения    
        if (!this.accepted){
            addButtons.push({label: 'Утвердить', icon: 'pi pi-thumbs-up', command: () => {this.onBtnAcceptClick()}});
        }
        this.setState({addButtons: addButtons});
        this.dataService.openPhoto(this);
        if (AppSets.rowTypesIsEqual(this.state.eventType,AppSets.getRowType('ORDINAL'))){
            this.dataService.getSalesInfo(this.state.employee.id, this.state.start, this);
        }

    }

    inThePast(){
        const moment = require('moment');
        return moment(this.state.start).isSameOrBefore(moment());
    }

    onBtnRemoveClick(){
        if (this.inThePast()){
            this.confirmHeader='ВНИМАНИЕ! ДАТА уже прошла';
            this.confirmBody='ЗАДНИМ ЧИСЛОМ удалить всю информацию про ' + this.state.eventType.name + "?"; 
            this.icons = "pi pi-exclamation-triangle"
        }else if (this.accepted){
            this.icons = "pi pi-exclamation-triangle"
            this.confirmHeader='УЖЕ УТВЕРЖДЕНО!';
            this.confirmBody='Удалить УТВЕРЖДЕННЫЙ ' + this.state.eventType.name + "?"; 
        }else{
            this.icons = null;
            this.confirmHeader='Подтвердите';
            this.confirmBody='Хотите удалить ' + this.state.eventType.name + "?"; 
        }
        this.confirmAccept=this.delete;
        this.confirmReject=this.hideConfirmationDlg;    
        this.setState({showConfirm: true});
    }

    onBtnAcceptClick(){
        if (AppSets.rowTypesIsEqual("SEAK_LEAVE") && this.state.photoFile === ''){
            this.messages.show({severity:'error', summary: 'Нельзя утвердить больничный, пока не загружен подтверждающий документ'});
            return;
        }
        this.confirmAccept=this.accept;
        this.confirmReject=this.hideConfirmationDlg;    
        this.confirmHeader='Подтвердите';
        this.confirmBody='Хотите утвердить ' + this.state.eventType.name + "?"; 
        this.setState({showConfirm: true});
    }

    accept(){
        if (!AppSets.getUser.amIhr()){
            this.dataService.deleteDaysOff(this, this.afterDelete);        
        }
    }

    hideConfirmationDlg(){
        this.setState({showConfirm: false});
    }

    delete(){
        if (!AppSets.getUser.amIhr()){
            const moment = require('moment');
            if (moment(this.state.start).isSameOrBefore(moment())){
                this.messages.show({severity:'error', summary: 'Запрещено. Срок уже прошел.', sticky:true});
                return;
            }
            if (this.accepted){
                const msg = 'Невозможно! Руководитель уже утвердил этот ' + this.state.eventType.name;
                this.messages.show({severity:'error', summary: msg, sticky:true});
                return;
            }
        }
        this.dataService.deleteDayOff(this, this.afterDelete);
    }

    afterDelete(){
        this.props.history.goBack();
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
                let start = moment(this.state.start);
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
        if ((!extention || extention.length > 4 || extention.length < 2) || (!['jpg', 'jpeg', 'png', 'pdf'].includes(extention.toLowerCase()))){
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
        if (!this.state.photoFile){
            this.messages.show({severity:'error', summary:'Для данной записи нет документа, который можно загрузить!'})
            return;
        }
        if (AppSets.getUser().amIhr()){
            this.dataService.downloadFile(this.state.photoFile, this);
        }else{
            this.messages.show({severity:'warn', summary:'У Вас нет полномочий получать чужой больничный'})
        }
    }
    
    displaySalesRow(rowData){
        return(rowData)
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
                            <div className="p-col-9">
                            {this.state.showConfirm && 
                                <Confirmation visibility={this.state.showConfirm} header={this.confirmHeader} body={this.confirmBody} icons = {this.icons}
                                            accept={this.confirmAccept} reject={this.confirmReject} messages={this.messages} context={this}/>}
                                <Button label="Закрыть" onClick={this.props.history.goBack} icon="pi pi-arrow-left" style={{marginRight: '1em'}}/>
                                {this.isFilledOut() && 
                                    !AppSets.getUser().amIhr() ? 
                                        <Button label="Сохранить" onClick={this.save} style={{marginRight: '1em'}}/> : 
                                        <SplitButton label="Сохранить" onClick={this.save} model={this.state.addButtons} style={{marginRight: '1em'}}/>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {(this.state.eventType && this.state.eventType.id === 0 && this.state.salesInfo) && 
                    <div className="p-col-4">
                        <ListBox options={this.state.salesInfo} listStyle={{maxHeight: '250px'}}/>
                    </div>}
                {this.state.eventType.id == AppSets.getRowType("SEAK_LEAVE").id && 
                <div className="p-col-4">
                    <Tooltip target=".scan" mouseTrack mouseTrackLeft={10}/>
                    {this.state.photoFile ? 
                        <img className="scan" src = {this.state.photoData} width = {250} height={300} alt="Скан-копия документа"
                            onError={(e) => e.target.src='/assets/images/3-schedule.png'} data-pr-tooltip="Соответствующей кнопкой сюда можно загрузить документ (png, jpeg, pdf) до 1 Мб размером"/> :
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