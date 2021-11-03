import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import AppSets from '../service/AppSettings';
import Confirmation from './Confirmation';
import ScheduleService from '../service/ScheduleService'
import { InputTextarea } from 'primereact/inputtextarea';


export default class InOutPage extends Component {
    state = {showConfirm: false, row: {}, note:'', notesChanged: false};

    constructor(props) {
        super(props);
        this.dataService = new ScheduleService();
        this.setInOutDialogParameters = this.setInOutDialogParameters.bind(this);
        this.checkInOut = this.checkInOut.bind(this);
        this.hideConfirmDlg = this.hideConfirmDlg.bind(this);
        this.checkIn = this.checkIn.bind(this);
        this.checkOut = this.checkOut.bind(this);
        this.moment = require('moment');
    }

    componentDidMount(){
        this.getStatus(this)
    }
    
    getStatus(_this){
        _this.dataService.getCurrentWorkDay(AppSets.getUser(), _this)
    }
    

    setInOutDialogParameters(mode){
        //0- приход, 1 - уход
        if (this.state.row.comingFact && this.state.row.leavingFact){
            this.messages.show({severity: 'warn', 
                summary: 'Вы уже отмечали сегодня и приход, и уход. Для изменения обратитесь к менеджеру по персоналу', sticky: true})
            return;
        }
        if (mode === 0){
            if (!this.state.row.comingFact && !this.state.row.leavingFact){
                this.confirmMessage = "Хотите отметить приход на работу?"
            }else{
                this.messages.show({severity: 'warn', 
                    summary: 'Вы уже отмечали сегодня приход на работу. Для изменения обратитесь к менеджеру по персоналу', sticky: false})
                return;
            }
        }else {//уход
            if (!this.state.row.comingFact){
                this.messages.show({severity: 'warn', 
                    summary: 'Вы еще не отмечали приход!', sticky: false})
                return;
            }
            if (!this.state.row.leavingFact){
                this.confirmMessage = "Завершаете работу на сегодня?";
            }else{
                this.messages.show({severity: 'warn', 
                    summary: 'Вы уже отметили уход. Для изменения обратитесь к менеджеру по персоналу', sticky: false})
                return;
            }
        }
        this.confirmHeader = "Внимание!"
        this.confirmAccept = this.checkInOut;
        this.confirmReject = this.hideConfirmDlg;
        this.setState({showConfirm: true});
    }

    checkInOut(){
        this.setState({showConfirm: false});
        if (this.state.notesChanged){
            const data = {"note": this.state.note, "id": this.state.row.id}
            this.dataService.notesUpdate(data, "note", this)
        }
        this.dataService.checkInOut(this, this.confirmMessage.includes("приход") ? this.checkIn : this.checkOut);
    }

    checkIn(){
        let user = AppSets.getUser();
        user.coming = Date.now()
        const userString = JSON.stringify(user);
        AppSets.user = user;
        window.sessionStorage.setItem("user", userString);
        this.getStatus(this);
        this.messages.show({severity:'info', summary:"Приход на работу зарегистрирован"});
    }

    checkOut(){
        AppSets.user.leaving=Date.now();
        const userString = JSON.stringify(AppSets.user);
        window.sessionStorage.setItem("user", userString);
        this.getStatus(this);
        this.messages.show({severity:'info', summary:"Отмечен уход с работы"});
    }

    hideConfirmDlg(){
        this.setState({showConfirm: false})
    }


    render() {
        return <div className="p-card p-grid p-justify-center" >
            {this.state.showConfirm && 
            <Confirmation visibility={this.state.showConfirm} header={this.confirmHeader} body={this.confirmMessage}
                        accept={this.confirmAccept} reject={this.confirmReject} messages={this.messages} context={this}/>}
            <Toast ref={(el) => this.messages = el} position="top-left  "/>

            <div className="p-col-12">
                {(this.state.row && !this.state.row.comingFact) ?
                <Button label="Приход" className="p-button-info p-button-rounded" icon='pi pi-check-square'
                    style={{margin: '0 20px 0 20px'}}
                    onClick={()=>this.setInOutDialogParameters(0)}
                    tooltip="Отметить начало работы">
                </Button> : 
                <div className="p-text-bold" style={{margin:'1em', color:'#5265d3'}}> 
                    Пришел на работу в  {this.moment(this.state.row.comingFact).format("HH:mm")}
                </div>}
            </div>
            {(this.state.row && this.state.row.comingFact) && 
                <div className="p-col-12 ">
                    { (!this.state.row.leavingFact) ? 
                    <Button label="Уход" className="p-button-info p-button-rounded" icon='pi pi-external-link' iconPos='right'
                        style={{margin: '0 20px 0 20px'}}
                        onClick={()=>this.setInOutDialogParameters(1)}
                        tooltip="Отметить уход с работы">
                    </Button> : 
                    <div className="p-text-bold" style={{margin:'0 0 0 1em', color:'#5265d3'}}> 
                        Закончил работу в  {this.moment(this.state.row.leavingFact).format("HH:mm")}
                    </div>}
                </div>
            }
            <div className="p-col-12 ">
                <span className="p-float-label">
                    <InputTextarea id='inputReasonFld' value={this.state.row.reason} style={{minHeight:'30px', overflow:'auto'}}
                    rows={5} cols={60} autoResize={true} />
                    <label htmlFor='inputReasonFld'>Примечание руководителя </label>
                </span>
                <span className="p-float-label" style={{margin: "1em 0 0 0"}}>
                    <InputTextarea id='inputNoteFld' value={this.state.note.reason} style={{minHeight:'30px', overflow:'auto'}}
                        rows={5} cols={60} autoResize={true}
                        disabled={!this.state.row.comingFact}
                        onChange={(e) => this.setState({note: e.target.value, notesChanged: true})} rows={5}/>
                    <label htmlFor='inputNoteFld' style={{width: '90%'}}>Заметки сотрудника (перед уходом, если необходимо)</label>
                </span>
            </div>
        </div>
    }
}