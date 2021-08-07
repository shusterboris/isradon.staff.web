import React, { Component } from 'react';
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Messages } from 'primereact/messages';
import {Error} from '../pages/Error'
import App from '../App';
import User from '../entities/user'
import AppSets from '../service/AppSettings';
import ScheduleService from '../service/ScheduleService';


export default class DayOffForm extends Component {
    state = {start: new Date(), end: new Date(), eventType: null, reason: '', id: null, errorMsg:''};

    constructor(props) {
        super(props);
        this.dataService = new ScheduleService();
        this.user = AppSets.user;
        this.editStartDate = this.editStartDate.bind(this);
        this.editEndDate = this.editEndDate.bind(this);
        this.isDataValid = this.isDataValid.bind(this);
        this.save = this.save.bind(this);
        this.createNewRecord = this.createNewRecord.bind(this);
        this.ownerId = 1;
        this.disabledInput = true;
        this.eventTypes = [
            {code: 'HOLIDAY', name:'Праздник'},
            {code: 'REST', name:'Плановый отпуск'},
            {code: 'DAY_OFF', name:'Отпуск за свой счет'}, 
            {code: 'SICK_LEAVE', name:'Больничный'},
        ];
        this.isDataValid = this.isDataValid.bind(this);
        
        const param = this.props.location.state;
        if (! (param.hasOwnProperty('type') && param.hasOwnProperty('mode'))){
            this.state.errorMsg = 'Некорректный режим открытия страницы'
            return;
        }
        let found = this.eventTypes.filter(et => et.code === param.type);
        if (found == null || found.length === 0){
            this.state.errorMsg = 'Некорректный режим открытия страницы'
            return;
        }
        this.state.eventType = found[0].name;
        this.state.employee = param.employee;
        let currentMonth = this.state.start;
        currentMonth.setMonth(param.month);
        let currentMonthEnd = this.state.end;
        currentMonthEnd.setMonth(param.month)
        this.setState({start: currentMonth, end: currentMonthEnd});
        this.createNewRecord('create')
    }

    createNewRecord(mode){
        //открывает рядовой сотрудник
        //задача: определить, с какой даты можно планировать и можно ли редактировать даты
        const moment = require('moment');
        if (mode == 'create'){//создается новый
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

    

    componentDidMount(){
        const user = new User('nobody');
    }
    
    thisIsMy(){
        return this.state.id == null || this.state.id === App.getUser.getId();
    }

    isDataValid(){
        if (this.state.start > this.state.end){
            this.messages.show({severity: 'warn', summary: "Дата окончания больше даты начала!"});
            return false;
        }
        const daysDiffers = (this.state.start - this.state.end) / 1000 / 60 / 60 / 24;
        if (daysDiffers > 31){
            this.messages.show({severity: 'warn', summary: "Слишком большой интервал дат!"});
            return false;
        }

        return true;
    }

    save(){
        if (! this.isDataValid)
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


    render() {
        if (this.state.errorMsg !== ''){
            return <Error reason={this.state.errorMsg}></Error>;
        }
        return(
        <div className="card">
            <Messages ref={(msgE) => this.messages = msgE} style={{marginBottom: '1em'}}/>
            <div className="card-title p-text-bold p-highlight">{this.state.eventType  + ': ' }</div>

            <div className="p-grid">
                <div className="p-col-12  p-md-8">
                    <div className="p-text-left p-text-bold" style={{margin: '0 1em 0 1em'}}>Пояснение сотрудника:</div>
                    <InputText value={this.state.reason} 
                        onChange={(reasonText) => this.setState({ reason: reasonText.value })}
                        style={{margin: '0 1em 0 1em', width: '75%'}} placeholder='Введите необходимые комментарии, если надо'></InputText>
                </div>
            </div>
            <div className="p-grid">
                <div className="p-col-4  p-md-4">
                    <div className="p-text-left p-text-bold" style={{margin: '0 1em 0 1em'}}>Дата начала:</div>
                </div>
                <div className="p-col-4  p-md-4">
                    <div className="p-text-left p-text-bold" style={{margin: '0 1em 0 1em'}}>Дата окончания:</div>
                </div>
            </div>
            
            <div className="p-grid">
                <div className="p-col-4  p-md-4">
                    <Calendar value={this.state.start} inline showWeek
                        minDate = {this.startDateMin} 
                        onChange={(newStartDate) => this.editStartDate(newStartDate.value)}  />
                </div>
                <div className="p-col-3  p-md-3">
                    <Calendar value={this.state.end} inline showWeek
                        minDate={this.endDateMin}
                        onChange={(newEndDate) => this.editEndDate(newEndDate.value)}  />
                </div>
            </div>

            <div className="p-grid">
                <div className="p-col-4  p-md-4">
                    <Button label="Отменить" onClick={this.props.history.goBack} style={{marginRight: '1em'}}></Button>
                    <Button label="Сохранить" onClick={this.save} style={{marginRight: '1em'}}></Button>
                </div>
                <div className="p-col-4  p-md-4">
                    <Button label="Удалить" style={{marginRight: '1em'}}></Button>
                </div>                
            </div>
        </div>
    )}
}