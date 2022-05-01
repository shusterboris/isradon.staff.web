import React, { Component } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import AppSets from '../service/AppSettings';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import {Calendar} from 'primereact/calendar';
import ScheduleService from '../service/ScheduleService';

export class DictionaryHolidays extends Component {
    state = { values : [], appendMode: false, newValue:'',newDateValue:null};
    constructor(props) {
        super(props);
        this.dataService = new ScheduleService();
        this.history = props.history;
        this.textEditor = this.textEditor.bind(this);
        this.onEditTextInit = this.onEditTextInit.bind(this);
        this.onEditTextSubmit = this.onEditTextSubmit.bind(this);
        this.onEditedTextCancel = this.onEditTextCancel.bind(this);
        this.onAppendNewRecord = this.onAppendNewRecord.bind(this);
        this.displayTableHeader = this.displayTableHeader.bind(this);
        this.onRemoveRecordPressed = this.onRemoveRecordPressed.bind(this);
        this.updateDataList = this.updateDataList.bind(this);
        this.actionBodyTemplate = this.actionBodyTemplate.bind(this);
        this.dateBodyTemplate = this.dateBodyTemplate.bind(this);
    }

    componentDidMount(){
        this.updateDataList()
        this.tableHeader = this.displayTableHeader();
        this.moment = require('moment')
    }

    updateDataList(){
        this.setState({newDateValue: null, newValue: null})
        AppSets.getHolidays(this);
        if (this.state.appendMode){
            this.setState({newValue:'', appendMode: false});
        }
    }

    onEditTextSubmit(props){
        this.dataService.saveHoliday(props.columnProps.rowData, this, this.updateDataList);
    }

    onEditTextInit(props, fieldName){
        this.originalValue = this.state.values[props.columnProps.rowIndex][fieldName];
    }

    onEditTextCancel(props, fieldName){
        let updatedValues = [...this.state.values];
        updatedValues[props.columnProps.rowIndex][fieldName] = this.originalValue;
        this.setState({values: updatedValues});
        delete this.originalValue;
    }

    onEditorValueChange(props, fieldName, newValue){
        //обработка ввода нового значения в текущую клетку таблицы
        let updatedProducts = [...props.value];
        updatedProducts[props.rowIndex][fieldName] = newValue;
        this.setState({values: updatedProducts});
    }

    textEditor(props, fieldName){
        //редактирование содержимого столбца
        if (fieldName === 'note'){
            let val = props.rowData[fieldName];
            return <InputText type="text" value={val}  style = {{width:'90%'}}
                    onChange={(e) => 
                        this.onEditorValueChange(props, fieldName, e.target.value)} />;
        }else{
            let val = props.rowData[fieldName].slice(0,10);
            return <InputText type="text" value={val}  style = {{width:'8rem'}}
                    onChange={(e) => this.onEditorValueChange(props, fieldName, e.target.value)} />;
        }
    }

    onRemoveRecordPressed(rowData){
        //нажатие кнопки "Удалить" в строке таблицы
        const id = rowData.id;
        this.dataService.removeHolidaysItem(id, this, this.updateDataList);
    }

    onAppendNewRecord(){
        //нажатие кнопки "Сохранить" в панели ввода нового значения справочника
        const data = {"comingPlan": this.state.newDateValue, "note": this.state.newValue}
        this.dataService.saveHoliday(data, this, this.updateDataList);
    }

    actionBodyTemplate(rowData) {
        //столбец с кнопками удаления в таблице
        if (!rowData.deleted){
            return (
                <Button type="button" icon="pi pi-times" className="p-button-secondary" id="rowRemoveButton"
                    tooltip="Удалить эту запись из базы данных"
                    onClick={()=>this.onRemoveRecordPressed(rowData)}>
                </Button>
            );
        }else{
            return(<i className="pi pi-trash p-ml-4"></i>)
        }
    }

    dateBodyTemplate(rowData){
        const val = this.moment(rowData.comingPlan).format("DD/MM/YYYY");
        return val
    }

    displayTableHeader(){
        return(<div>
            <Button className="p-button-rounded p-button-secondary" icon="pi pi-plus" id="addButton"
                onClick={()=>this.setState({appendMode: true, newValue:''})}>
            </Button>
        </div>)
    }

    //при нажатии на кнопку + в заголовке таблицы отображает поле и кнопки ввода нового значения, иначе - заголовок над таблицей
    displayEditTools(){
        if (this.state.appendMode){
            return(<div className="p-float-label" > 
                <Calendar id="newDateValueFld" value={this.state.newDateValue} style={{margin:'0 1em 5px 0', width:'8rem'}} tooltip="Дата"
                    onChange={(e)=>this.setState({newDateValue: e.target.value})}/>
                
                <InputText id="newValueFld" value={this.state.newValue} tooltip="Праздник"
                    onChange={(e)=>this.setState({newValue: e.target.value})}/>
                <Button className="p-button-rounded p-button-success" icon="pi pi-check" style={{margin:'0 0 5px 1em', width:'3rem'}} id="saveButton"
                        onClick={this.onAppendNewRecord}>
                </Button>
                <Button className="p-button-rounded p-button-warning" icon="pi pi-times" id="clearButton" style={{margin:'0 0 5px 0', width:'3rem'}}
                        onClick={()=>this.setState({newValue:'', appendMode: false})}>
                </Button>
            </div>);
        }else{
            return (<div className="card-title">Справочные данные </div>);
        }

    }

    render() {
        if (!AppSets.getUser()) { 
            this.user = AppSets.getUser();
        }
        if (!AppSets.getUser().amIhr()){
            this.history.push({pathname: '/error', state: {reason: 'Эта операция доступна только уполномоченному персоналу'}});
        }
        const editTools = this.displayEditTools();
                
        return (<div className="card">
            <Toast ref={(el) => this.messages = el} style={{marginBottom: '1em'}} />
            <div className="p-grid">
                <div className="p-col-12 p-md-6">
                    <div>{editTools}</div>
                    <DataTable value = {this.state.values} editMode="cell" className="editable-cells-table" scrollable emptyMessage='Нет сведений' >
                        <Column body={this.dateBodyTemplate} header="Дата" style={{width:'10rem'}}
                           
                        />
                        <Column field="note" header="Праздник"                            
                            editor = {props=>this.textEditor(props, "note")} 
                            onEditorInit = {props=>this.onEditTextInit(props, "note")}
                            onEditorSubmit = {props=>this.onEditTextSubmit(props, "note")} 
                            onEditorCancel = {props=>this.onEditTextCancel(props, "note")}
                            />
                        <Column body={this.actionBodyTemplate} header={this.tableHeader} style={{width:'15%'}}/>
                    </DataTable>
                </div>
            </div>
        </div>)
    }
}