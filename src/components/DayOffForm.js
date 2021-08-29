import React, { Component } from 'react';
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Messages } from 'primereact/messages';
import {Error} from '../pages/Error'
import App from '../App';
import AppSets from '../service/AppSettings';
import ScheduleService from '../service/ScheduleService';
import { Dropdown } from 'primereact/dropdown';


export default class DayOffForm extends Component {
    state = {eventType: null, reason: '', id: null, errorMsg:'', employees: []};

    constructor(props) {
        super(props);
        this.dataService = new ScheduleService();
        this.user = AppSets.user;
        this.editStartDate = this.editStartDate.bind(this);
        this.editEndDate = this.editEndDate.bind(this);
        this.isDataValid = this.isDataValid.bind(this);
        this.save = this.save.bind(this);
        this.createNewRecord = this.createNewRecord.bind(this);
        this.onChangeType = this.onChangeType.bind(this);
        this.ownerId = 1;
        this.disabledInput = true;
        this.eventTypes = [
            {code: 'HOLIDAY', name:'Праздник'},
            {code: 'REST', name:'Плановый отпуск'},
            {code: 'DAY_OFF', name:'Не оплачиваемый отпуск'}, 
            {code: 'SICK_LEAVE', name:'Больничный'},
        ];
        this.isDataValid = this.isDataValid.bind(this);
        
        const param = this.props.location.state;
        if (! param.hasOwnProperty('mode')){
            this.state.errorMsg = 'Некорректный режим открытия страницы'
            return;
        }

        if (! (param.hasOwnProperty('start')) && param.hasOwnProperty('end')){
            this.state.errorMsg = 'Некорректный режим открытия страницы'
            return;
        }    
        
        this.state = {start: param.dateStart, end: param.dateEnd, employee: param.employee, errorMsg:'', employees: param.employeeList};
    }

    createNewRecord(mode){
        //открывает рядовой сотрудник
        //задача: определить, с какой даты можно планировать и можно ли редактировать даты
        const moment = require('moment');
        if (mode === 'create'){//создается новый
            if (this.state.eventType.toLowerCase().includes('отпуск')) {
                //поля можно редактировать, миним  альная дата + заданное количество дней от сегодня
                this.editMode = true;
                let minDate = moment();
                minDate.add(10, 'days');
                this.startDateMin = minDate.toDate();
                this.endDateMin = minDate.toDate();               
            }else if (this.state.eventType.toLowerCase().includes('больничный')){
                //для больничного включен режим редактирования, можно задним числом, но не больше, чем на месяц
                this.editMode = true;
                let minDate = moment();
                minDate.subtract(31, 'days');
                this.startDateMin = minDate.toDate();
                this.endDateMin = minDate.toDate();
            }
        }
    }
    
    thisIsMy(){
        return this.state.id == null || this.state.id === App.getUser.getId();
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
        if (this.editMode)
            this.setState({start:  value});
    }

    editEndDate(value){
        if (this.editMode)
            this.setState({end:  value});
    }

    onChangeType(chosenType){
        this.setState({eventType: chosenType.value});
    }

    isFilledOut(){
        //ключевые поля заполнены
        return (this.state.employee && this.state.eventType && this.state.start && this.state.end)
    }

    render() {
        if (!AppSets.getUser())
            { window.location = "/login" }

        return(
        <div className="card" >
            <Messages ref={(msgE) => this.messages = msgE} style={{marginBottom: '1em'}}/>
            
            <div className="p-grid">
                <div className="p-col-12  p-md-8">
                    <span className="p-float-label" >
                        <Dropdown id='employeeFld' value={this.state.employee} 
                            options={this.state.employees}
                            optionLabel="fullName" 
                            onChange = {pers=>this.setState({employee: pers.value})}
                            style={{width:'50%'}}>
                        </Dropdown> 
                        <label htmlFor="employeeFld">Сотрудник</label>
                    </span>
                </div>
                <div className="p-col-12  p-md-8">
                    <span className="p-float-label" >
                        <Dropdown id='reasonTypeFld' value={this.state.eventType} style={{width:'50%'}}
                                options={this.eventTypes} optionLabel="name"
                                required={true}
                                onChange={chosenType => {this.onChangeType(chosenType)}}/>
                    </span>
                </div>
                <div className="p-col-12  p-md-8">
                    <span className="p-float-label" >
                        <InputText id='reasonFld' value={this.state.reason} 
                            onChange={(reasonText) => this.setState({ reason: reasonText.value })}
                            style={{width: '50%'}} ></InputText>
                        <label htmlFor="reasonFld">Пояснения сотрудника*</label>
                    </span>
                </div>
            </div>
            
            <div className="p-grid" > 
                <div className="p-col-2  p-md-2" >
                    <span className="p-float-label" >
                    <Calendar id='startCalendarFld' value={this.state.start} 
                        showWeek showIcon dateFormat="dd/mm/yy" 
                        minDate = {this.startDateMin} 
                        onChange={(newStartDate) => this.editStartDate(newStartDate.value)}  />
                        <label htmlFor="startCalendarFld">Дата начала*</label>
                    </span>
                </div>
                <div className="p-col-2  p-md-2">
                    <span className="p-float-label">
                        <Calendar id='endCalendarFld' value={this.state.end} 
                            showWeek showIcon dateFormat="dd/mm/yy"
                            minDate={this.endDateMin}
                            onChange={(newEndDate) => this.editEndDate(newEndDate.value)}  />
                        <label htmlFor="endCalendarFld">Дата окончания*</label>
                    </span>
                </div>
            </div>

            <div className="p-grid" style={{margin: '0 1em 0 1em'}}>
                <div className="p-col-3  p-md-3">
                    <Button label="Отменить" onClick={this.props.history.goBack} style={{marginRight: '1em'}}></Button>
                    {this.isFilledOut() &&
                    <Button label="Сохранить" onClick={this.save} style={{marginRight: '1em'}}></Button>}
                </div>
                <div className="p-col-4  p-md-4">
                    {this.isFilledOut() &&
                    <Button label="Удалить" style={{marginRight: '1em'}}></Button>}
                </div>                
            </div>
        </div>
    )}
}