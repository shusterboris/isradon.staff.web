import React from 'react';
import AppSets from '../service/AppSettings'
import ScheduleService from '../service/ScheduleService'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {Calendar} from 'primereact/calendar';
import {AutoComplete} from 'primereact/autocomplete';
import {ContextMenu} from 'primereact/contextmenu';
import {ColumnGroup} from 'primereact/columngroup';
import {Row} from 'primereact/row';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import {Toast} from 'primereact/toast';
import classNames from 'classnames';
import './ScheduleReport.css'
import { ru } from '../service/AppSettings';
import { addLocale } from 'primereact/api';
import Confirmation from './Confirmation'

export default class ScheduleReportHR extends React.Component{
    state = {
        days: [],
        employees: [],
        selectedRow: null,
        chosenMonth: (new Date()).getMonth(),
        summary: '',
        showConfirm: false,
        summary1:'', summary2:'',summary3:'',summary4:'', summary5: '',
    }
    
    constructor(props){
        super(props);
        this.messages = [];
        this.dataService = new ScheduleService();
        this.onCalendarChange = this.onCalendarChange.bind(this);
        this.onSellerChange = this.onSellerChange.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateDaysState = this.updateDaysState.bind(this);
        this.updateDaysRow = this.updateDaysRow.bind(this);
        this.history = props.history;
        this.moment = require('moment');
        this.restoreInitalDate();
    }

    restoreInitalDate(){
        let storedIniDate = window.localStorage.getItem("initalCalDate");
        let iniDate = (storedIniDate) ? this.moment(storedIniDate).toDate() : (new Date());
        this.setState({chosenDate: iniDate, chosenMonth: iniDate.getMonth()});
    }

    updateData(chosenMonth, chosenPersonId, year){
        if (chosenPersonId && chosenMonth > -1){
            this.dataService.getMonthScheduleByPerson(chosenMonth + 1, chosenPersonId, this, year);
        }else if (AppSets.getUser() && chosenMonth > -1){
            this.dataService.getMonthScheduleByPerson(chosenMonth + 1, AppSets.getUser().employeeId, this, year);
        }
    }

    updateDaysState(value){
        this.setState({days: value});
        this.dataService.updateSummary(value, this);
    }

    updateDaysRow(row){
        //обновление одной строки в таблице
        const index = this.state.days.findIndex(day=>(row.id === day.id));
        let value = this.state.days;
        value[index] = row;
        this.updateDaysState(value);
    }

    onCalendarChange(month, year){
        this.setState(
            {chosenMonth: month}
        )
        if (this.state.chosenPersonId !== null){
            this.updateData(month, this.state.chosenPersonId, year)
        }
    }

    onSellerChange(personName, personId, coEmployees, chosenDate=null){
        this.setState(
            {chosenPerson: personName, chosenPersonId: personId}
        );
        let month = (!chosenDate) ? this.state.chosenMonth : chosenDate.getMonth()
        this.updateData(month,personId);
        this.coEmployees = coEmployees
    }

    
    render(){
        if (!AppSets.getUser())
            { this.history.push("/login") }
        return(
            <div>
                <Toast ref={(el) => this.messages = el} position="top-left" />
                <ScheduleFilter 
                    summary1 = {this.state.summary1}
                    summary2 = {this.state.summary2}
                    summary3 = {this.state.summary3}
                    summary4 = {this.state.summary4}
                    summary5 = {this.state.summary5}
                    messages = {this.messages}
                    dataService = {this.dataService} 
                    onCalendarChange = {this.onCalendarChange}
                    onSellerChange = {this.onSellerChange}
                    history = {this.history}
                />
                <ScheduleResultTable
                    updateData = {this.updateData}
                    updateDaysState = {this.updateDaysState}
                    updateDaysRow = {this.updateDaysRow}   
                    messages = {this.messages}
                    dataService = {this.dataService} 
                    days = {this.state.days} 
                    coEmployees = {this.coEmployees}
                    history = {this.history}
                />
            </div>
        );
    }
}

class ScheduleResultTable extends React.Component{

    constructor(props){
        super(props);
        this.history = props.history;
        AppSets.getUser();
        this.messages = props.messages;
        this.state = {selectedRow: null,errorMsg: null};
        this.getRowClassName = this.getRowBackgroundClassName.bind(this);
        this.bodyComingDif = this.bodyComingDif.bind(this);
        this.bodyLeavingDif = this.bodyLeavingDif.bind(this);
        this.bodyHoursStr = this.bodyHoursStr.bind(this);
        this.bodyTotalDif = this.bodyTotalDif.bind(this);
        this.setDifferenceColor = this.setDifferenceColor.bind(this);
        this.dataService = this.props.dataService;
        this.bodyLeavingFact = this.bodyLeavingFact.bind(this);
        this.bodyComingFact = this.bodyComingFact.bind(this);
        this.setBold = this.setBold.bind(this);
        this.acceptTime = this.acceptTime.bind(this)
        this.inputTextEditor = this.inputTimeEditor.bind(this);
        this.onAcceptedTimeSubmit = this.onAcceptedTimeSubmit.bind(this);
        this.onAcceptedTimeCancel = this.onAcceptedTimeCancel.bind(this);
        this.changeRowType = this.changeRowType.bind(this);
        this.rowModel = null;
        this.createHrMenuModel = this.createHrMenuModel.bind(this);
        this.createOrdinalMenuModel = this.createOrdinalMenuModel.bind(this);
        this.getContextMenuModel = this.getContextMenuModel.bind(this);
        this.inputNotesEditor = this.inputNotesEditor.bind(this);
        this.inputReasonEditor = this.inputReasonEditor.bind(this);
        this.onNoteValueChange = this.onNoteValueChange.bind(this);
        this.onReasonValueChange = this.onReasonValueChange.bind(this);
        this.onEditorValueChange = this.onEditorValueChange.bind(this);
        this.onNoteSubmit = this.onNoteSubmit.bind(this);
        this.actionBodyReason = this.actionBodyReason.bind(this);
        this.openDayOffForm = this.openDayEditForm.bind(this);
        this.contextMenuMode = null;
        this.downloadSickLeaveDocument = this.downloadSickLeaveDocument.bind(this);
        this.moment = require('moment');
    }

    downloadSickLeaveDocument(){
        if (!this.state.selectedRow.photoFile){
            this.messages.show({severity:'error', summary:'Для данной записи нет документа, который можно загрузить!'})
            return;
        }
        this.dataService.downloadFile(this.state.selectedRow.photoFile, this);  
    }

    getContextMenuModel(){
        if (!this.rowModel){
            const user = AppSets.getUser();
            if (user){
                let theModel = null; 
                if (user.amIhr()){
                    theModel = this.createHrMenuModel()
                }else{
                    theModel = this.createOrdinalMenuModel();
                }
                this.rowModel = theModel;
                return theModel;
            }
        }else{
            return this.rowModel;
        }
    }

    createOrdinalMenuModel(){
        return([
            {label:"Больничный:", icon: 'pi pi-calendar-plus',
            items: [
                {label:"Отметить день как больничный", icon: 'pi pi-calendar-plus', command: () => this.changeRowType(4)},
                {label:"Внести скан", icon: 'pi pi-calendar-plus', command: () => this.openDayEditForm()},
            ]}])
    }

    createHrMenuModel(){
        return([
            {label:"Посчитать по факту:", icon: 'pi pi-thumbs-up',
            items: [
                {label:"Приход и уход", command: () => this.acceptTime(3)},
                {label:"Приход", command: () => this.acceptTime(1)},
                {label:"Уход", command: () => this.acceptTime(2)},
                {label:"Все, что по плану", command: () => this.acceptTime(0)}
            ]},
            {separator: true},
            {label:"Посчитать по плану:", icon: 'pi pi-thumbs-down',
            items: [
                {label:"Приход и уход", command: () => this.acceptTime(13)},
                {label:"Приход", command: () => this.acceptTime(11)},
                {label:"Уход", command: () => this.acceptTime(12)},
            ]},
            {separator: true},
            {label:"Отметить невыход как...", icon: 'pi pi-check',
            items: [
                {label:"Больничный", command: () => this.changeRowType(4)},
                {label:"Прогул", command: () => this.changeRowType(5)},
                {label:"За свой счет", command: () => this.changeRowType(3)},
                {label:"Отменить отметку", command: () => this.changeRowType(0)},
            ]},
            {separator: true},
            {label:"Больничный:", icon: 'pi pi-calendar-plus',
            items: [
                {label:"Получить документ", icon: 'pi pi-download', command: () => this.downloadSickLeaveDocument()},
            ]},
            {separator: true},
            {label:"Открыть", icon: "pi pi-eye", command: () => this.openDayEditForm()},
            {separator: true},
            {label:"Закрыть это меню", icon: 'pi pi-sign-out'},
        ]);
    }

    rowSort(a, b){
        if (a.comingPlan == b.comingPlan){
            return 0;
        }else if (a.comingPlan < b.comingPlan){
            return -1
        }else{
            return 1;
        }
    }

    openDayEditForm(){
        let start = this.state.selectedRow.comingPlan;
        let end = this.state.selectedRow.leavingPlan;
        let startMoment = this.moment(start);
        let endMoment = this.moment(end);
        let mode = "create";
        if (this.state.selectedRow.rowType !== 0){
            //т.е. мы не создаем новый, а открываем действующий выходной, отпуск и т.д.
            //это может занимать несколько дней, поэтому ищем начало и конец
            mode = "edit"
        }
        const minTime = AppSets.minStartTime.split(":");
        startMoment.hours(minTime[0]);
        startMoment.minute(minTime[1]);
        const maxTime = AppSets.maxEndTime.split(":");
        
        endMoment.hour(maxTime[0]);
        endMoment.minute(maxTime[1]);
        const employeeToChoose = this.props.coEmployees;
        const chosenPerson = employeeToChoose.find(empl=>empl.id === this.state.selectedRow.employeeId);
        const row = this.state.selectedRow
        const orgUnitProxy = {'id' : row.orgUnitId, 'name': row.orgUnitName}; //чтобы избежать получения отсутствующего здесь полного объекта для выбора в форме
        if (this.state.selectedRow.rowType === 0){
            this.props.history.push({
                pathname: '/edit-day:id', state: {id: row.id, rowType: row.rowType,
                    chosenEmployee: chosenPerson, employees: this.props.coEmployees,
                    chosenOrgUnit: orgUnitProxy, orgUnits: []}});     
        }else{
            //ищем в сводке дни с таким же байндером, что и выбранный, т.е., тот же отпуск, больничный и т.д., чтобы найти начальную и конечную даты
            const anotherDays = this.props.days.filter(day=>{return day.binder === row.binder});
            let start = row.comingPlan
            let end = row.leavingPlan;
            if (anotherDays.length >= 2){
                anotherDays.sort((a,b) => this.rowSort(a, b));
                start = anotherDays[0].comingPlan;
                end = anotherDays[anotherDays.length - 1].comingPlan;
            }
            this.props.history.push({
                pathname: '/day-off:id', state: {id: row.id, rowType: row.rowType, mode: 'edit', 
                    dateStart : start, dateEnd: end, 
                    chosenEmployee: chosenPerson, employees: [chosenPerson],
                    chosenOrgUnit: orgUnitProxy, orgUnits: []}});     
        }
    }

    changeRowType(rowType){
        this.dataService.changeRowType(rowType, this);
    }

    acceptTime(mode){   
        if (mode === 0){
            if (!this.props.days || this.props.days.length === 0){
                return;
            }
            let idsList="";
            for(let row of this.props.days){
                if (!(row.comingAccepted && row.leavingAccepted)){
                    idsList = (idsList !== "") ? (idsList+","+row.id) : row.id;
                }
            }
            if (idsList === ""){
                this.messages.show({severity: 'info', summary:'В выбранном периоде нет записей, которые можно так подтвердить'})
                return;
            }
            this.dataService.acceptJobTimeByPlan(idsList, this.props.days[0].comingPlan, this.props.days[0].employeeId ,this);            
        }else{
            this.dataService.acceptJobTime(this.state.selectedRow, mode, this);
        }
    }


    getRowBackgroundClassName(data){
        //ORDINAL, HOLIDAY, REST, DAY_OFF, SICK_LEAVE, HOOKY
        return({
            'row-hooky' : data.rowType === 5,
            'row-rest' : data.rowType === 2,
            'row-day-off' : data.rowType === 3,
            'row-holiday' : data.rowType === 1,
            'row-sick-leave' : data.rowType === 4,
            'row-shift' : data.rowType === 6,
        });
    }

    setDifferenceColor(dif){
        const cellClassName = classNames({
            'undef-dif': dif.startsWith('не утв'),
            'positive-dif': ! dif.startsWith('-'),
            'negative-dif': dif.startsWith('-')
        });

        return cellClassName;
    }

    bodyComingDif(rowData){
        const difClassName = this.setDifferenceColor(rowData.comingDif);
        return (
            <div className={difClassName}>
                {rowData.comingDif}
            </div>
        );
    }

    bodyLeavingDif(rowData){
        const difClassName = this.setDifferenceColor(rowData.leavingDif);
        return (
            <div className={difClassName}>
                {rowData.leavingDif}
            </div>
        );
    }

    bodyComingFact(rowData){
        if (rowData.comingFact === '')
            return "";
        const difClassName = this.setBold(rowData.comingFactDisp !== rowData.comingPlanDisp);
        return (
            <div className={difClassName} > 
                {rowData.comingFactDisp}
            </div>
        );
    }


    bodyLeavingFact(rowData){
        if (rowData.leavingFact === '')
            return "";
        const difClassName = this.setBold(rowData.leavingFactDisp !== rowData.leavingPlanDisp);
        return (
            <div className={difClassName} > 
                {rowData.leavingFactDisp}
            </div>
        );
    }

    setBold(hasDif){
        const cellClassName = classNames({
            'boldText': hasDif,
            '': !hasDif
        });

        return cellClassName;
    }

    bodyTotalDif(rowData){
        if (rowData.totalDif === '')
            return "";
        const difClassName = this.setDifferenceColor(rowData.totalDif);
        return (
            <div className={difClassName}>
                {rowData.totalDif}
            </div>
        );
    }

    bodyHoursStr(rowData){
        if (!rowData.comingAccepted || !rowData.leavingAccepted){
            return (
                <div className='undef-dif'>
                    не утв.
                </div>
            );
        }else{
            return (rowData.workHoursStr);
        }
            
    }

    bodyDOW(rowData){
        const index = rowData.dow !== 7 ? rowData.dow : 0;
        const dow = ru.dayNamesMin[index];
        return(
            <div>{dow}</div>
        );
    }

    actionBodyReason(rowData){
        if (rowData.rowType === 0 || rowData.reason){
            return (<div>{rowData.reason}</div>)
        }else{
            let reasonPrefix = "";
            if (rowData.rowType === 2) { 
                reasonPrefix = "Отпуск" 
            }else if (rowData.rowType === 3) { 
                reasonPrefix = "За свой счет" 
            }else if (rowData.rowType === 4) { 
                reasonPrefix = "Больничный" 
            }else {
                reasonPrefix = "Прогул"
            }
            return (!rowData.reason) ? (<div>{reasonPrefix}</div>) : (<div>{rowData.reason + " " + rowData.reason}</div>)
        }
    }

    onEditorValueChange(props, value) {
        let updatedSchedule = [...props.value];
        updatedSchedule[props.rowIndex][props.field] = value;
        this.props.updateDaysState(updatedSchedule)
    }


    onNoteValueChange(props, value) {
        let updatedSchedule = [...props.value];
        updatedSchedule[props.rowIndex]['note'] = value;
        this.props.updateDaysState(updatedSchedule)
    }

    onReasonValueChange(props, value) {
        let updatedSchedule = [...props.value];
        updatedSchedule[props.rowIndex]['reason'] = value;
        this.props.updateDaysState(updatedSchedule)
    }

    inputNotesEditor(props) {
        return <InputText type="text" value={props.rowData.note}  style={{width: '100%',textAlign: 'left', fontSize:'smaller'}}
            onChange={(e) => this.onNoteValueChange(props, e.target.value)} />;
    }

    inputReasonEditor(props) {
        return <InputText type="text" value={props.rowData.reason}  style={{width: '100%',textAlign: 'left', fontSize:'smaller'}}
            onChange={(e) => this.onReasonValueChange(props, e.target.value)} />;
    }

    inputTimeEditor(fieldName, props) {
        let val = props.rowData[fieldName];
        this.storedTimeValue = val;
        if (val === ''){
            if (fieldName.startsWith('comingAccepted')){
                val = props.rowData['comingFactDisp'];
            }else{ 
                val = props.rowData['leavingFactDisp'];
            }
        }
        return <InputText type="time" value={val}  onChange={(e) => this.onEditorValueChange(props, e.target.value)} />;
    }

    onNoteSubmit(data){
        this.props.dataService.notesUpdate(data.columnProps.rowData, "note", this);
    }

    onReasonSubmit(data){
        this.props.dataService.notesUpdate(data.columnProps.rowData, "reason", this);
    }

    onAcceptedTimeSubmit(fieldName, data){
        const enteredValue = data.columnProps.rowData[fieldName];
        const selected = data.columnProps.rowData;
        this.props.dataService.acceptJobTimeUpdate(fieldName, selected, enteredValue, this);
    }

    onAcceptedTimeCancel(fieldName, data){
        data.columnProps.rowData[fieldName] = this.storedTimeValue;
        this.props.updateDaysState(data.columnProps.rowData)
    }

    render(){
            let header = <ColumnGroup>
            <Row>
                <Column header="Дата" rowSpan={2}/>
                <Column header="ДН" rowSpan={2} />
                <Column header="Магазин" rowSpan={2} style={{width: '10%'}}/>
                <Column header="Приход на работу" colSpan={4} />
                <Column header="Уход с работы" colSpan={4} />
                <Column header="Всего, +/-" rowSpan={2}/>
                <Column header="Раб. время" rowSpan={2}/>
                <Column header="Примечания сотрудника" rowSpan={2} style={{width: '10%'}}/>
                <Column header='Примечания HR' rowSpan={2} style={{width: '10%'}}/>
            </Row>
            <Row>
                <Column header='План'/>
                <Column header='Факт'/>
                <Column header='Соглас.' style={{width : '6em'}}/>
                <Column header='+ / -'/>
                <Column header='План' />
                <Column header='Факт' />
                <Column header='Соглас.' style={{width : '6em'}}/>
                <Column header='+ / -'/>
            </Row>
        </ColumnGroup>

        return (
                <div className = 'p-col-12 datatable-style-sched-repo'>
                    <Toast ref={(el) => this.messages = el} position="top-left"/>
                    <ContextMenu model={this.getContextMenuModel()} ref={el => this.cm = el} onHide={() => this.setState({ selectedRow: null })}/>
                    <DataTable value={this.props.days} rowClassName={this.getRowBackgroundClassName} 
                        headerColumnGroup={header}
                        contextMenuSelection={this.state.selectedRow}
                        onContextMenuSelectionChange={e => this.setState({ selectedRow: e.value })}
                        onContextMenu={e => this.cm.show(e.originalEvent)}
                        emptyMessage='Нет сведений для данного сотрудника за выбранный период'>
                        <Column field='workDate' style={{width : '6em'}}></Column>
                        <Column body={this.bodyDOW} style={{width : '4em'}}> </Column>
                        <Column field="orgUnitName" style={{width: '10%', textAlign: 'left'}}></Column>
                        <Column field='comingPlanDisp' ></Column>
                        <Column body={this.bodyComingFact} ></Column>
                        {AppSets.getUser() && AppSets.getUser().amIhr() ?
                        <Column field='comingAcceptedDisp' 
                                editor={props=>this.inputTimeEditor('comingAcceptedDisp', props)} 
                                onEditorSubmit = {props=>this.onAcceptedTimeSubmit('comingAcceptedDisp', props)}
                                onEditorCancel = {props=>this.onAcceptedTimeCancel('comingAcceptedDisp', props)}
                                style={{color:'#00008B'}}></Column> :
                        <Column field='comingAcceptedDisp' style={{color:'#00008B'}}/>         
                        }
                        <Column body={this.bodyComingDif} ></Column>
                        <Column field='leavingPlanDisp' ></Column>
                        <Column body={this.bodyLeavingFact} ></Column>
                        {AppSets.getUser() && AppSets.getUser().amIhr() ?
                        <Column field='leavingAcceptedDisp' 
                                editor={props=>this.inputTimeEditor('leavingAcceptedDisp', props)} 
                                onEditorSubmit = {props=>this.onAcceptedTimeSubmit('leavingAcceptedDisp', props)}
                                style={{color:'#00008B'}}/> :
                        <Column field='leavingAcceptedDisp' style={{color:'#00008B'}}/> }
                        <Column body={this.bodyLeavingDif} ></Column>
                        <Column body={this.bodyTotalDif} ></Column>
                        <Column body={this.bodyHoursStr}></Column>
                        {(AppSets.getUser() && AppSets.getUser().amIhr()) ?
                            <Column field='note' style={{width: '10%', margin:'0', padding: '0', fontSize:'smaller'}}/> : 
                            <Column field='note' 
                                    editor = {props=>this.inputNotesEditor(props)}
                                    onEditorSubmit = {props=>this.onNoteSubmit(props)}
                                    style={{width: '10%', margin:'0', padding: '0', fontSize:'smaller'}}/>}
                        {(AppSets.getUser() && AppSets.getUser().amIhr()) ?
                            <Column field='reason' 
                                    editor = {props=>this.inputReasonEditor(props)}
                                    onEditorSubmit = {props=>this.onReasonSubmit(props)}
                                    style={{width: '10%', margin:'0', padding: '0', fontSize:'smaller'}}/> :
                            <Column body={this.actionBodyReason} style={{width: '10%', fontSize:'smaller'}}/>}
                    </DataTable>
                </div>
        );
    }
}

class ScheduleFilter extends React.Component{
    state = {showConfirm:false, jobStatus:0, summary1:'', summary2:'', summary3:'', summary4:'', summary5:''}
    //Панель фильтра, содержащая выбранный месяц года и продавца
    constructor(props){
        super(props);
        this.state = {filteredSellers: null, employees: []};
        this.dataService = props.dataService;
        this.sellersSuggestions = [];
        this.messages = props.messages;
        this.chosenPerson = '';
        this.onChangeCalendar = this.onChangeCalendar.bind(this);
        this.onChangeSeller = this.onChangeSeller.bind(this);
        this.filterSellers = this.filterSellers.bind(this); 
        this.setInOutDialogParameters = this.setInOutDialogParameters.bind(this);
        this.checkInOut = this.checkInOut.bind(this);
        this.setInOutDialogParameters = this.setInOutDialogParameters.bind(this);
        this.updateViewAfterCheckingIn = this.updateViewAfterCheckingIn.bind(this);
        this.checkout = this.checkout.bind(this);
        this.hideConfirmDlg = this.hideConfirmDlg.bind(this);
        this.state.summary1 = props.summary1;
        this.state.summary2 = props.summary2;
        this.state.summary3 = props.summary3;
        this.state.summary4 = props.summary4;
        this.state.summary5 = props.summary5;
        this.moment =  require('moment');
        addLocale('ru', ru);   
    }

    filterSellers(event){
        let results;
        if (this.sellersSuggestions && this.state.employees)
            this.sellersSuggestions = this.state.employees.map(entry => entry.fullName);
        if (event.query.length === 0){
            results = [...this.sellersSuggestions]
        }else{
            results = this.sellersSuggestions.filter(seller =>
                {return seller.toLowerCase().includes(event.query.toLowerCase())}
            );
        }
        this.setState({filteredSellers: results});
    }

    onChangeCalendar(event){
        if (event){
            const theDate = this.moment(event.value);
            let month = theDate.month();
            let year = theDate.year();
            this.props.onCalendarChange(month, year)
            window.localStorage.setItem("initalCalDate", theDate.toDate());
        }else{
            this.chosenDate = '';
        }
    }

    onChangeSeller(event){
        this.setState({chosenPerson: event.target.value});
        if (this.state.employees){
            let foundEmployee = this.state.employees.find(employee =>  employee.fullName.includes(event.target.value))
            if (foundEmployee && foundEmployee.hasOwnProperty("id")){
                this.props.onSellerChange(event.target.value, foundEmployee.id, this.state.employees, );
                window.sessionStorage.setItem("chosenEmployee", JSON.stringify(foundEmployee));
            }
        }
        
    }

    componentDidMount() {
        if (AppSets.getUser().amIhr()){
            AppSets.getEmployees(this)
        }else{
            AppSets.getEmployees(this, AppSets.getUser().orgUnitId);
        }
        try{
            const storedEmployeeStr = window.sessionStorage.getItem("chosenEmployee");
            let storedIniDate = window.localStorage.getItem("initalCalDate");
            let iniDate = (storedIniDate) ? this.moment(storedIniDate).toDate() : (this.moment().toDate() );
            this.setState({chosenDate: iniDate});
            if (storedEmployeeStr!=null){
                const storedEmployee = JSON.parse(storedEmployeeStr);
                this.setState({chosenPerson: storedEmployee.fullName});
                this.props.onSellerChange(storedEmployee.fullName, storedEmployee.id, [storedEmployee], iniDate);
            }else{
                const employeeName = AppSets.getUser().employeeName;
                if (employeeName){
                    this.setState({chosenPerson: employeeName});
                    this.props.onSellerChange(employeeName, AppSets.getUser().employeeId, [employeeName], iniDate);
                }
            }    
        }catch(err){
            console.log(err)
        };

    }

    checkout(){
        AppSets.user.leaving=this.moment();
        const userString = JSON.stringify(AppSets.user);
        window.sessionStorage.setItem("user", userString);
        this.props.onSellerChange(AppSets.getUser().employeeName, AppSets.getUser().employeeId, [AppSets.getUser().employeeName] );
    }

    hideConfirmDlg(){
        this.setState({showConfirm: false})
    }

    updateViewAfterCheckingIn(){
        this.props.onSellerChange(AppSets.getUser().employeeName, AppSets.getUser().employeeId, [AppSets.getUser().employeeName] );
        let user = AppSets.getUser();
        user.coming = Date.now()
        const userString = JSON.stringify(user);
        AppSets.user = user;
        window.sessionStorage.setItem("user", userString);
        this.messages.show({severity:'info', summary:"Отмечено успешно"});
    }

    checkInOut(){
        this.setState({showConfirm: false});
        this.dataService.checkInOut(this, this.confirmMessage.includes("приход") ? this.updateViewAfterCheckingIn : this.checkout);
    }

    setInOutDialogParameters(mode){
        //0- приход, 1 - уход
        if (AppSets.getUser().coming && AppSets.getUser().leaving){
            this.messages.show({severity: 'warn', 
                summary: 'Вы уже отмечали сегодня и приход, и уход. Для изменения обратитесь к менеджеру по персоналу', sticky: true})
            return;
        }
        if (mode === 0){
            if (!AppSets.getUser().coming && !AppSets.getUser().leaving){
                this.confirmMessage = "Хотите отметить приход на работу?"
            }else{
                this.messages.show({severity: 'warn', 
                    summary: 'Вы уже отмечали сегодня приход на работу. Для изменения обратитесь к менеджеру по персоналу', sticky: false})
                return;
            }
        }else {//уход
            if (!AppSets.getUser().coming){
                this.messages.show({severity: 'warn', 
                    summary: 'Вы еще не отмечали приход!', sticky: false})
                return;
            }
            if (!AppSets.getUser().leaving){
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

    render(){
        return(
            <div className = 'p-grid' style={{marginTop:'-20px'}}>
                <div className = 'p-col-12'>
                    <Toast ref={(el) => this.messages = el} position="top-left  "/>
                </div>
                {this.state.showConfirm && 
                    <Confirmation visibility={this.state.showConfirm} header={this.confirmHeader} body={this.confirmMessage}
                            accept={this.confirmAccept} reject={this.confirmReject} messages={this.messages} context={this}/>}
                   
                <div className = 'p-col-3' style={{margin: '0 0 0.5em 1em'}}>
                    <Calendar readOnly={true} dateFormat="mm/yy" placeholder="Выберите месяц" view="month" yearNavigator yearRange="2021:2040"
                        locale={"ru"}
                        value={this.state.chosenDate}
                        onSelect={(e) => {this.onChangeCalendar(e)}}/>
                </div>
                <div className = 'p-col-3'>
                    {(AppSets.getUser() && (!AppSets.getUser().isPortable())) ?
                        <AutoComplete id="chooseEmployeeFld"
                            dropdown = {true}
                            value = {this.state.chosenPerson}
                            suggestions={this.state.filteredSellers}
                            completeMethod = {this.filterSellers} 
                            onChange = {(e) => {this.onChangeSeller(e) }}/> :
                    <div >
                        <Button label="Приход" className="p-button-info p-button-rounded" icon='pi pi-check-square'
                            onClick={()=>this.setInOutDialogParameters(0)}
                            tooltip="Отметить начало работы">
                        </Button>
                        <Button label="Уход" className="p-button-info p-button-rounded" icon='pi pi-external-link' iconPos='right'
                            style={{margin: '0 20px 0 20px'}}
                            onClick={()=>this.setInOutDialogParameters(1)}
                            tooltip="Отметить уход с работы">
                        </Button>
                    </div>}
                </div>
                <div className = 'p-col-5'>
                    {this.props.summary1 && <div style={{color:'white'}}>{this.props.summary1} </div>}
                    {this.props.summary2 && <div style={{color:'white'}}>{this.props.summary2} </div>}
                    {this.props.summary3 && <div style={{color:'white'}}>{this.props.summary3} </div>}
                    {this.props.summary4 && <div style={{color:'white'}}>{this.props.summary4} </div>}
                    {this.props.summary5 && <div style={{color:'white'}}>{this.props.summary5} </div>}
                </div>
            </div>
        );
    }
}