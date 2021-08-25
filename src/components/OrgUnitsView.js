import React, { Component } from 'react';
import AppSets from '../service/AppSettings';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import {Button} from 'primereact/button';
import { Toolbar } from 'primereact/toolbar'
import {Dropdown} from 'primereact/dropdown'
import ScheduleService from '../service/ScheduleService';
import { Messages } from 'primereact/messages';
import { ProgressSpinner } from 'primereact/progressspinner';

export default class OrgUnitView extends Component {
    state = {
        orgUnits: [],
        shifts: [],
        selectedRow: null,
        orgUnitName: '',
        orgUnitChanged: false,
        shiftChanged: false,
        chosenShift: null,
        shiftNo: '',
        start1:'', end1:'', start2:'', end2:'', start3:'', end3:'', start4:'', end4:'', start5:'', end5:'', start6:'', end6:'', start7:'', end7:'', notes:'',
        waitPlease: true
    }

    constructor(props) {
        super(props);
        this.orgUnitTitle = '';
        this.dataService = new ScheduleService();
        this.onRowSelect = this.onRowSelect.bind(this);
        this.onShiftSavePressed = this.onShiftSavePressed.bind(this);
        this.onShiftCancelPressed = this.onShiftSavePressed.bind(this);
        this.onChooseOrgUnitShift = this.onChooseOrgUnitShift.bind(this);
        this.onCreateOrgUnit = this.onCreateOrgUnit.bind(this);
        this.onOrgUnitSavePressed = this.onOrgUnitSavePressed.bind(this);
        this.onShiftValidation = this.onShiftValidation.bind(this);
        this.onCreateShift = this.onCreateShift.bind(this);
        this.onRemoveShift = this.onRemoveShift.bind(this);
        this.displayButtonBar = this.displayButtonBar.bind(this);
    }

    componentDidMount(){
        AppSets.getOrgUnitList(this)
    }

    onRowSelect(val){
        //выбрано новое подразделение в таблице, берем список смен
        this.setState({selectedRow: val, orgUnitName: val.name,start1: '', start2: '', start3: '', start4: '', start5: '', start6: '', start7: '',
            end1: '', end2: '', end3: '', end4: '', end5: '', end6: '', end7: '',shiftChanged: false, orgUnitChanged: false});
        this.dataService.getOrgUnitShifts(val.id, this);
    }

    createTime(timeStr){
        try{            
            if (! timeStr)
                return "не задано";
            if (! timeStr.trim())
                return "не задано";
            if (timeStr.trim().length < 5)
                return "слишком короткое"
            let dt = new Date() 
            const hhmm = timeStr.split(":");
            if (hhmm.length !== 2)
                return "время задано неверно"
            if (hhmm[0] > '59')
                return "время задано неверно"
            dt.setHours(hhmm[0]);
            dt.setMinutes(hhmm[1]);
            dt.setSeconds(0);
            return dt;
        }catch(err){
            return "время задано неверно";
        }
    }

    intervalValidation(startTimeStr, endTimeStr){
        const errList = [];
        let startTime = this.createTime(startTimeStr);
        let startEmpty = false;
        let endEmpty = false;
        if (typeof startTime === 'string'){
            errList.push("время начала смены " + startTime);
            if (startTime === 'не задано'){
                startEmpty = true;
            }
        }
        let endTime = this.createTime(endTimeStr);    
        if (typeof endTime === 'string'){
            errList.push("время окончания смены " + endTime);
            if (endTime === 'не задано'){
                endEmpty = true;
            }
        }
        //обе даты пустые - это допустимо
        if (startEmpty && endEmpty)
            return '';
        //неправильная или пустая дата начала или конца, но не обе - ошибка, дальше не проверяем
        if (errList.length !== 0)
            return errList;
        if (endTime < startTime)
            errList.push("Время начала смены должно быть больше времени окончания");
        if (startTime < this.createTime(AppSets.minStartTime))
            errList.push("слишком рано");
        if (endTime > this.createTime(AppSets.maxEndTime))
            errList.push("слишком поздно");        
        if (errList.length>0)
            return errList.toString();
        return '';
    }

    onShiftValidation(){
        let errMsg = this.intervalValidation(this.state.start1, this.state.end1);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "Воскресенье: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start2, this.state.end2);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "Понедельник: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start3, this.state.end3);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "Вторник: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start4, this.state.end4);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "Среда: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start5, this.state.end5);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "Четверг: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start6, this.state.end6);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "Пятница: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start7, this.state.end7);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "Субботы: " + errMsg});
            return false;
        }
        if (!this.state.shiftNo){
            this.messages.show({severity: 'warn', summary: "Не введен номер смены. "});
            return false;
        }
        if (!this.state.start1 & !this.state.start2 & !this.state.start3 & !this.state.start4 &
            !this.state.start5 & !this.state.start6 & !this.state.start7){
                this.messages.show({severity: 'warn', summary: "Данные о рабочих часах не введены. "});
                return false;    
            }
        return true;
    }

    onShiftSavePressed(){
        if (this.onShiftValidation()){
            this.dataService.saveShift(this);
        }
    }

    onChooseOrgUnitShift(v){
        const found = this.state.shifts.filter(item=>item.no === v);
        if (found.length > 0){
            const val = found[0];
            this.setState({start1: val.start1, start2: val.start2, start3: val.start3, start4: val.start4, start5: val.start5, start6: val.start6, start7: val.start7,
                    end1: val.end1, end2: val.end2, end3: val.end3, end4: val.end4, end5: val.end5, end6: val.end6, end7: val.end7,
                    shiftNo: val.no, chosenShift: val,shiftChanged: false, notes:val.notes, });
        }
    }

    onCreateOrgUnit(){
        this.setState({selectedRow: null, orgUnitName: ''});
    }

    onOrgUnitSavePressed(){
        const id = (this.state.selectedRow != null) ? this.state.selectedRow.id : null;
        this.dataService.saveOrgUnit(this,id, this.state.orgUnitName);
    }

    onCreateShift(){
        const row = this.state.selectedRow;
        this.setState({selectedRow: row, chosenShift: null, shiftNo: '', start1: '', start2: '', start3: '', start4: '', start5: '', start6: '', start7: '',
        end1: '', end2: '', end3: '', end4: '', end5: '', end6: '', end7: '',shiftChanged: false, orgUnitChanged: false});
    }

    displayButtonBar(){
        const leftBar = (<React.Fragment>
            {(this.state.shiftChanged && this.state.selectedRow) && 
                <Button id="btnShiftSave" label="Сохранить" icon="pi pi-check" style={{marginRight: '1em'}} 
                        className="p-button-primary p-mr-2"
                        onClick={this.onShiftSavePressed}/>}
                <Button id="btnShiftCancel" label="Выйти" icon="pi pi-arrow-left" className="p-button-secondary p-mr-2" 
                        onClick={this.props.history.goBack}/>
            </React.Fragment>);
        const rightBar = (<React.Fragment>
            {this.state.shiftNo &&
                <Button id="btnShiftDelete" label="Удалить" icon="pi pi-thumbs-down" className="p-button-danger"
                        style={{marginLeft: '1em'}} 
                        onClick={this.onConfirmRemoveShift}/>
            }
        </React.Fragment>);    
        return <div>
            <Toolbar left={leftBar} right={rightBar} />
        </div>
    }

    onRemoveShift(){

    }


    actionBodyTemplate() {
        return (
            <Button type="button" icon="pi pi-times" className="p-button-secondary"></Button>
        );
    }

    render() {
        return <div className="content-section implementation">
            <div className="p-card">
                <Messages ref={(el) => this.messages = el}/>
            <div className='p-fluid p-grid'>
                <div className="p-col-12 p-md-4">
                    <DataTable value={this.state.orgUnits} scrollable emptyMessage='Нет сведений'
                                selectionMode="single" selection={this.state.selectedRow} dataKey="id"
                                onSelectionChange={e => {
                                    this.onRowSelect(e.value)}} >
                        <Column header='Список подразделений' field='name' style={{margin: '1em 0 0 0' }}/>
                        <Column body={this.actionBodyTemplate} 
                            headerStyle={{width: '4.5em', textAlign: 'center'}} 
                            bodyStyle={{padding: '2px 0 0 0'}} />

                    </DataTable>
                </div>
                <div className="p-col-12 p-md-2">
                    <div className="card-title" style={{margin:'0.5em 0 2em 0', fontWeight:'bold'}} >Подразделение
                        <Button id="btnCreateOrgUnit" icon="pi pi-plus" className="p-button-rounded" 
                            style={{margin: '0 0 0 1em'}}
                            onClick={this.onCreateOrgUnit} tooltip='Нажмите для создания нового подразделения'/>
                    </div>
                    <div className = 'p-field'>
                        <label htmlFor="orgUnitNameFld">Название подразделения</label>
                        <InputText id="orgUnitNameFld" value={this.state.orgUnitName} placeholder="Введите название подразделения"
                                            onChange={(e) => this.setState({orgUnitName:e.target.value, orgUnitChanged: true})}/>
                    </div>
                    <Dropdown style={{margin:'1em 0 0 0'}}
                        value={this.state.chosenShift}
                        options={this.state.shifts} optionLabel="no" optionValue='no'
                        onChange={(e)=>this.onChooseOrgUnitShift(e.target.value)}
                        placeholder='Выберите смену'>
                    </Dropdown>
                    {this.state.orgUnitChanged && 
                    <div style={{margin: '1.5em 1em 1em 1em'}}>
                        <span >
                            <Button id="btnOrgUnitSave" label="Сохранить" icon="pi pi-check" style={{marginRight: '1em'}} 
                                    onClick={this.onOrgUnitSavePressed}/>
                        </span>
                    </div>}
                    {this.state.waitPlease && <ProgressSpinner/>}
                </div>  

                <div className="p-col-12 p-md-6" >                
                    <div className="card-title" style={{margin:'0.5em 0 2em 0', fontWeight:'bold'}}>Расписание смен
                        <Button id="btnCreateShift" icon="pi pi-plus" className="p-button-rounded" style={{margin: '0 0 0 1em'}}
                            onClick={this.onCreateShift} tooltip='Нажмите для создания новой смены'/>
                    </div>
                    <div className="p-grid form-group">
                        <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>Вс</div>
                        <InputMask id='dow0Start' mask='99:99'
                                style={{width:'5em'}} 
                                value={this.state.start1} 
                                onChange={(e) => this.setState({start1:e.target.value, shiftChanged: true})}/>
                            
                        <InputMask id='dow0End' mask='99:99' 
                                style={{margin:'0 0 0 1em', width:'5em'}}
                                value={this.state.end1} 
                                onChange={(e) => this.setState({end1:e.target.value, shiftChanged: true})}/>
                    </div>                        
                            
                    <div className="p-grid  form-group" style={{padding:'1em 0 0 0'}}>
                        <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>Пн</div>
                        <InputMask id='dow1Start' mask='99:99' 
                            style={{width:'5em'}} 
                            value={this.state.start2} 
                            onChange={(e) => this.setState({start2:e.target.value, shiftChanged: true})}/>
                        <InputMask id='dow1End' mask='99:99' 
                            style={{margin:'0 0 0 1em', width:'5em'}} 
                            value={this.state.end2} 
                            onChange={(e) => this.setState({end2:e.target.value, shiftChanged: true})}/>
                    </div>
                            
                    <div className="p-grid  form-group" style={{padding:'1em 0 0 0'}}>
                        <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>Вт</div>
                        <InputMask id='dow2Start' mask='99:99' 
                            style={{width:'5em'}} 
                            value={this.state.start3} 
                            onChange={(e) => this.setState({start3:e.target.value, shiftChanged: true})}/>
                        <InputMask id='dow2End' mask='99:99'
                            style={{margin:'0 0 0 1em', width:'5em'}} 
                            value={this.state.end3} 
                            onChange={(e) => this.setState({end3:e.target.value, shiftChanged: true})}/>
                    </div>
                            
                    <div className="p-grid form-group" style={{padding:'1em 0 0 0'}}>
                    <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>Ср</div>
                        <InputMask id='dow3Start' mask='99:99' 
                            style={{width:'5em'}} 
                            value={this.state.start4} 
                            onChange={(e) => this.setState({start4:e.target.value, shiftChanged: true})}/>
                        <InputMask id='dow3End' mask='99:99'
                            style={{margin:'0 0 0 1em', width:'5em'}} 
                            value={this.state.end4} 
                            onChange={(e) => this.setState({end4:e.target.value, shiftChanged: true})}/>
                    </div>

                        <div className="p-grid form-group" style={{padding:'1em 0 0 0'}}>
                        <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>Чт</div>
                            <InputMask id='dow4Start' mask='99:99' 
                                style={{width:'5em'}} 
                                value={this.state.start5} 
                                onChange={(e) => this.setState({start5:e.target.value, shiftChanged: true})}/>
                            <InputMask id='dow4End' mask='99:99'
                                style={{margin:'0 0 0 1em', width:'5em'}} 
                                value={this.state.end5} 
                                onChange={(e) => this.setState({end5:e.target.value, shiftChanged: true})}/>
                        </div>

                        <div className="p-grid form-group" style={{padding:'1em 0 0 0'}}>
                            <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>Пт</div>
                            <InputMask id='dow5Start' mask='99:99' 
                                style={{width:'5em'}} 
                                value={this.state.start6} 
                                onChange={(e) => this.setState({start6:e.target.value, shiftChanged: true})}/>
                            <InputMask id='dow5End' mask='99:99'
                                style={{margin:'0 0 0 1em', width:'5em'}} 
                                value={this.state.end6} 
                                onChange={(e) => this.setState({end6:e.target.value, shiftChanged: true})}/>
                        </div>

                        <div className="p-grid form-group" style={{padding:'1em 0 0 0'}}>
                            <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>Сб</div>
                            <InputMask id='dow6Start' mask='99:99' 
                                style={{width:'5em'}} 
                                value={this.state.start7} 
                                onChange={(e) => this.setState({start7:e.target.value, shiftChanged: true})}/>
                            <InputMask id='dow6End' mask='99:99'
                                style={{margin:'0 0 0 1em', width:'5em'}} 
                                value={this.state.end7} 
                                onChange={(e) => this.setState({end7:e.target.value, shiftChanged: true})}/>
                        </div>

                        <div className="p-grid form-group" style={{padding:'1em 0 0 0'}}>
                            <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>No</div>
                            <InputMask id='shiftNoFld' mask='9' 
                                style={{width:'3em'}}
                                value={this.state.shiftNo} 
                                onChange={(e) => this.setState({shiftNo: e.target.value, shiftChanged: true})}/>
                            <InputText id='shiftNotesFld'  placeholder='доп.информация о смене'
                                value={this.state.notes}
                                style={{width: '70%'}}
                                onChange={(e) => this.setState({notes: e.target.value, shiftChanged: true})}/>

                        </div>

                        <div className='p-grid ' style={{margin: '1.5em 1em 1em 1em'}}>
                            {this.displayButtonBar()}
                        </div>
                    </div>
                </div>
            </div>
        </div>    
    }
}
