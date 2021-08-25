import React from 'react';
import AppSets from '../service/AppSettings'
import ScheduleService from '../service/ScheduleService'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {Calendar} from 'primereact/calendar';
import {AutoComplete} from 'primereact/autocomplete';
import {Button} from 'primereact/button'
import {ContextMenu} from 'primereact/contextmenu';
import {ColumnGroup} from 'primereact/columngroup';
import {Row} from 'primereact/row';
import { InputText } from 'primereact/inputtext';
import {Messages} from 'primereact/messages';
import { OverlayPanel } from 'primereact/overlaypanel';
import classNames from 'classnames';
import './ScheduleReport.css'
import { ru } from '../service/AppSettings';
import { addLocale } from 'primereact/api';

export default class ScheduleReportHR extends React.Component{
    state = {
        days: [],
        employees: [],
        selectedRow: null,
        chosenMonth: 4
    }
    
    constructor(){
        super();
        this.messages = [];
        this.dataService = new ScheduleService();
        this.onCalendarChange = this.onCalendarChange.bind(this);
        this.onSellerChange = this.onSellerChange.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateDaysState = this.updateDaysState.bind(this);
    }

    updateData(chosenMonth, chosenPersonId){
        if (chosenPersonId && chosenMonth > -1){
            this.dataService.getMonthScheduleByPerson(chosenMonth + 1, chosenPersonId, this);
        }
    }

    updateDaysState(value){
        this.setState({days: value });
    }

    onCalendarChange(month){
        this.setState(
            {chosenMonth: month}
        )
        if (this.state.chosenPersonId !== null)
            this.updateData(month, this.state.chosenPersonId)
    }

    onSellerChange(personName, personId){
        this.setState(
            {chosenPerson: personName, chosenPersonId: personId}
        );
        this.updateData(this.state.chosenMonth,personId);
    }

    
    render(){
        return(
            <div>
                <ScheduleFilter 
                    messages = {this.messages}
                    dataService = {this.dataService} 
                    onCalendarChange = {this.onCalendarChange}
                    onSellerChange = {this.onSellerChange}
                />
                <ScheduleResultTable
                    updateData = {this.updateData}
                    updateDaysState = {this.updateDaysState}
                    messages = {this.messages}
                    dataService = {this.dataService} 
                    days = {this.state.days} 
                />
            </div>
        );
    }
}

class ScheduleResultTable extends React.Component{
    constructor(props){
        super(props);
        this.messages = props.messages;
        this.state = {selectedRow: null,errorMsg: null};
        this.getRowClassName = this.getRowBackgroundClassName.bind(this);
        this.bodyComingDif = this.bodyComingDif.bind(this);
        this.bodyLeavingDif = this.bodyLeavingDif.bind(this);
        this.bodyTotalDif = this.bodyTotalDif.bind(this);
        this.setDifferenceColor = this.setDifferenceColor.bind(this);
        this.dataService = this.props.dataService;
        this.bodyLeavingFact = this.bodyLeavingFact.bind(this);
        this.bodyComingFact = this.bodyComingFact.bind(this);
        this.setBold = this.setBold.bind(this);
        this.rowMenuModel = this.createHrMenuModel(this);
        this.acceptTime = this.acceptTime.bind(this)
        this.inputTextEditor = this.inputTimeEditor.bind(this);
        this.onEditorValueChange = this.onEditorValueChange.bind(this);
        this.onAcceptedTimeSubmit = this.onAcceptedTimeSubmit.bind(this);
        this.onAcceptedTimeCancel = this.onAcceptedTimeCancel.bind(this);
        this.changeRowType = this.changeRowType.bind(this);
        this.createHrMenuModel = this.createHrMenuModel.bind(this);
        this.inputNotesEditor = this.inputNotesEditor.bind(this);
        this.onNoteSubmit = this.onNoteSubmit.bind(this);
        this.actionBodyReason = this.actionBodyReason.bind(this);
        this.displayReason = this.displayReason.bind(this);
    }

    createHrMenuModel(){
        return([
            {label:"Подвердить:", icon: 'pi pi-check'},
            {label:"Все", command: () => this.acceptTime(3)},
            {label:"Приход", command: () => this.acceptTime(1)},
            {label:"Уход", command: () => this.acceptTime(2)},
            {label:"Закрыть"},
            {separator: true},
            {label:"Невыход:", icon: 'pi pi-check'},
            {label:"Больничный", command: () => this.changeRowType(4)},
            {label:"Прогул", command: () => this.changeRowType(5)},
            {label:"За свой счет", command: () => this.changeRowType(3)},
            {label:"Отменить", command: () => this.changeRowType(0)},
        ]);
    }

    changeRowType(rowType){
        this.dataService.changeRowType(rowType, this);
    }

    acceptTime(mode){
        this.dataService.acceptJobTime(this.state.selectedRow, mode, this);
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

    bodyDOW(rowData){
        const index = rowData.dow - 1;
        const dow = ru.dayNamesMin[index];
        return(
            <div>{dow}</div>
        );
    }

    displayReason(reason){

    }

    actionBodyReason(rowData){
        const reason = rowData.reason;
        if (reason != ''){
            return(<div>
                <Button type="button" icon="pi pi-bell" className="p-button-sm p-button-rounded p-button-warning p-button-text"
                        style={{margin:'0 0 0 0', }}  
                        onClick={() => this.messages.show({severity: 'info', summary: reason, sticky: true})}/>
                </div>
        )}else
            {<div></div>}
    }
    

    onEditorValueChange(props, value) {
        let updatedSchedule = [...props.value];
        updatedSchedule[props.rowIndex][props.field] = value;
        this.props.updateDaysState(updatedSchedule)
    }

    inputNotesEditor(fieldName, props) {
        let val = '';
        let user = AppSets.user;
        if (fieldName.startsWith('note')){
            if (user.amIhr()){
                val = props.rowData['note'];
            }else{
                val = props.rowData['reason'];
            }
        }
        return <InputText type="text" value={val}  onChange={(e) => this.onEditorValueChange(props, e.target.value)} />;
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
        let fieldName = (AppSets.user && AppSets.user.amIhr()) ? "note" : "reason";
        this.props.dataService.notesUpdate(data.columnProps.rowData, fieldName, this);
    }

    onAcceptedTimeSubmit(fieldName, data){
        const enteredValue = data.columnProps.rowData[fieldName];
        const selected = data.columnProps.rowData;
        this.props.dataService.acceptJobTimeUpdate(fieldName, selected, enteredValue);
    }

    onAcceptedTimeCancel(fieldName, data){
        data.columnProps.rowData[fieldName] = this.storedTimeValue;
        this.props.updateDaysState(data.columnProps.rowData)
    }

    render(){
            let header = <ColumnGroup>
            <Row>
                <Column header="Дата" rowSpan={2} />
                <Column header="ДН" rowSpan={2} />
                <Column header="Магазин" rowSpan={2} style={{width: '10%'}}/>
                <Column header="Приход на работу" colSpan={4} />
                <Column header="Уход с работы" colSpan={4} />
                <Column header="Всего, +/-" rowSpan={2}/>
                <Column header="Раб. время" rowSpan={2}/>
                <Column header="Примечания" rowSpan={2} />
                <Column header='i' rowSpan={2} />
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
            <div className = 'p-grid'>
                <div className = 'p-col-12 datatable-style-sched-repo'>
                    <Messages ref={(el) => this.messages = el} style={{marginBottom: '1em'}}/>
                    <ContextMenu model={this.rowMenuModel} ref={el => this.cm = el} onHide={() => this.setState({ selectedRow: null })}/>
                    <DataTable value={this.props.days} rowClassName={this.getRowBackgroundClassName} 
                        headerColumnGroup={header}
                        scrollable scrollHeight="800px"
                        contextMenuSelection={this.state.selectedRow}
                        onContextMenuSelectionChange={e => this.setState({ selectedRow: e.value })}
                        onContextMenu={e => this.cm.show(e.originalEvent)}
                        emptyMessage='Нет сведений для данного сотрудника за выбранный период'>
                        <Column field='workDate' style={{width : '6em'}}></Column>
                        <Column body={this.bodyDOW} style={{width : '4em'}}> </Column>
                        <Column field="orgUnitName" style={{width: '10%', textAlign: 'left'}}></Column>
                        <Column field='comingPlanDisp' ></Column>
                        <Column body={this.bodyComingFact} ></Column>
                        <Column field='comingAcceptedDisp' 
                                editor={props=>this.inputTimeEditor('comingAcceptedDisp', props)} 
                                onEditorSubmit = {props=>this.onAcceptedTimeSubmit('comingAcceptedDisp', props)}
                                onEditorCancel = {props=>this.onAcceptedTimeCancel('comingAcceptedDisp', props)}
                                style={{color:'#00008B'}}></Column>
                        <Column body={this.bodyComingDif} ></Column>
                        <Column field='leavingPlanDisp' ></Column>
                        <Column body={this.bodyLeavingFact} ></Column>
                        <Column field='leavingAcceptedDisp' 
                                editor={props=>this.inputTimeEditor('leavingAcceptedDisp', props)} 
                                onEditorSubmit = {props=>this.onAcceptedTimeSubmit('leavingAcceptedDisp', props)}
                                style={{color:'#00008B'}}></Column>
                        <Column body={this.bodyLeavingDif} ></Column>
                        <Column body={this.bodyTotalDif} ></Column>
                        <Column field='total'></Column>
                        <Column field='note' 
                                editor = {props=>this.inputNotesEditor('note', props)}
                                onEditorSubmit = {props=>this.onNoteSubmit(props)}
                                style={{width: '15%', textAlign: 'left'}}></Column>
                        <Column body={this.actionBodyReason} />
                    </DataTable>
                </div>
            </div>
        );
    }
}

class ScheduleFilter extends React.Component{
    //Панель фильтра, содержащая выбранный месяц года и продавца
    constructor(props){
        super(props);
        this.state = {filteredSellers: null, employees: []};
        this.dataService = props.dataService;
        this.sellersSuggestions = [];
        this.messages = props.messages;
        this.chosenDate = new Date()
        this.chosenPerson = '';
        this.onChangeCalendar = this.onChangeCalendar.bind(this);
        this.onChangeSeller = this.onChangeSeller.bind(this);
        this.filterSellers = this.filterSellers.bind(this); 
        addLocale('ru', ru);   
    }

    filterSellers(event){
        let results;
        if (this.sellersSuggestions)
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
            const theDate = event.value;
            //this.chosenDate = AppSets.mmyyFormat.format(theDate)
            let month = new Date(Date.parse(theDate)).getMonth()
            this.props.onCalendarChange(month)
        }else{
            this.chosenDate = '';
        }
    }

    onChangeSeller(event){
        this.setState({chosenPerson: event.target.value});
        if (this.state.employees){
            let foundEmployee = this.state.employees.filter(employee =>  employee.fullName.includes(event.target.value))
            if (foundEmployee)
                this.props.onSellerChange(event.target.value, foundEmployee[0].id);
        }
        
    }

    componentDidMount() {
        AppSets.getEmployees(this);
        this.setInitialChosenDate();
    }

    setInitialChosenDate(){
        let chosenDate = new Date();
        //если число меньше 10, берем прошлый месяц, иначе текущий
        chosenDate = chosenDate.getDay() > 10 ?  
            chosenDate :  chosenDate.setMonth(chosenDate.getMonth() - 1); 
        //this.chosenDate = AppSets.mmyyFormat.format(chosenDate)
    }

    render(){
        return(
            <div className = 'p-grid'>
                <div className = 'p-col-4'>
                    <Calendar readOnly={true} dateFormat="mm/yy" placeholder="Выберите месяц" view="month" 
                        locale={"ru"}
                        value={this.chosenDate}
                        onSelect={(e) => {this.onChangeCalendar(e)}}/>
                </div>
                <div className = 'p-col-4'>
                    <AutoComplete 
                        dropdown = {true}
                        value = {this.state.chosenPerson}
                        suggestions={this.state.filteredSellers}
                        completeMethod = {this.filterSellers} 
                        onChange = {(e) => {this.onChangeSeller(e) }}/>
                </div>
                <div className = 'p-col-4'>
                    <Messages ref={(el) => this.messages = el} style={{marginBottom: '1em'}}/>
                </div>
            </div>
        );
    }
}