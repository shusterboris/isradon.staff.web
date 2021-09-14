import React, { Component } from 'react';
import { Messages } from 'primereact/messages';
import { DataTable } from 'primereact/datatable';
import AppSets from '../service/AppSettings';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import ScheduleService from '../service/ScheduleService';

export class DictionaryJT extends Component {
    state = { values : [], appendMode: false, newValue:''};
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
    }

    componentDidMount(){
        this.updateDataList()
        this.tableHeader = this.displayTableHeader();
    }

    updateDataList(){
        AppSets.getJobTitlesDict(this);
        if (this.state.appendMode){
            this.setState({newValue:'', appendMode: false});
        }
    }

    onEditTextSubmit(props){
        this.dataService.saveDictionaryItem(props.columnProps.rowData, this, this.updateDataList);
    }

    onEditTextInit(props, fieldName){
        this.originalValue = this.state.values[props.columnProps.rowIndex][fieldName];
    }

    onEditTextCancel(props){
        let updatedValues = [...this.state.values];
        updatedValues[props.columnProps.rowIndex]['value'] = this.originalValue;
        this.setState({values: updatedValues});
        delete this.originalValue;
    }

    onEditorValueChange(props, newValue){
        //обработка ввода нового значения в текущую клетку таблицы
        let updatedProducts = [...props.value];
        updatedProducts[props.rowIndex]['value'] = newValue;
        this.setState({values: updatedProducts});
    }

    textEditor(props, fieldName){
        //редактирование содержимого столбца
        let val = props.rowData[fieldName];
        return <InputText type="text" value={val}  onChange={(e) => this.onEditorValueChange(props, e.target.value)} />;
    }

    onRemoveRecordPressed(rowData){
        //нажатие кнопки "Удалить" в строке таблицы
        const id = rowData.id;
        this.dataService.removeDictionaryItem(id, this, this.updateDataList);
    }

    onAppendNewRecord(){
        //нажатие кнопки "Сохранить" в панели ввода нового значения справочника
        const data = {"value": this.state.newValue, "parentKey": null, "itemKey": "JobTitle"}
        this.dataService.saveDictionaryItem(data, this, this.updateDataList);
    }

    actionBodyTemplate(rowData) {
        //столбец с кнопками удаления в таблице
        if (!rowData.deleted){
            return (
                <Button type="button" icon="pi pi-times" className="p-button-secondary" 
                    tooltip="Удалить эту должность из базы данных"
                    onClick={()=>this.onRemoveRecordPressed(rowData)}>
                </Button>
            );
        }else{
            return(<i className="pi pi-trash p-ml-4"></i>)
        }
    }

    displayTableHeader(){
        return(<div>
            <Button className="p-button-rounded p-button-secondary" icon="pi pi-plus"
                onClick={()=>this.setState({appendMode: true, newValue:''})}>
            </Button>
        </div>)
    }

    //при нажатии на кнопку + в заголовке таблицы отображает поле и кнопки ввода нового значения, иначе - заголовок над таблицей
    displayEditTools(){
        if (this.state.appendMode){
            return(<div className="p-float-label" > 
                <InputText id="newValueFld" value={this.state.newValue} style={{width:'70%'}}
                    onChange={(e)=>this.setState({newValue: e.target.value})}/>
                <label htmlFor="newValueFld">Новое значение должности</label>
                <Button className="p-button-rounded p-button-success" icon="pi pi-check" style={{margin:'0 1em 0 1em'}}
                        onClick={this.onAppendNewRecord}>
                </Button>
                <Button className="p-button-rounded p-button-warning" icon="pi pi-times"
                        onClick={()=>this.setState({newValue:'', appendMode: false})}>
                </Button>
            </div>);
        }else{
            return (<div className="card-title">Справочные данные </div>);
        }

    }

    render() {
        if (!AppSets.getUser()) { 
            this.history.push("/login")
        }else if (!AppSets.getUser().amIhr()){
            this.history.push({pathname: '/employee-edit', state: {reason: 'Эта операция доступна только уполномоченному персоналу'}});
        }else{
            this.user = AppSets.getUser();
        }
        const editTools = this.displayEditTools();
                
        return (<div className="card">
            <Messages ref={(el) => this.messages = el} style={{marginBottom: '1em'}} />
            <div className="p-grid">
                <div className="p-col-6 p-md-4">
                    <div>{editTools}</div>
                    <DataTable value = {this.state.values} editMode="cell" className="editable-cells-table">
                        <Column field="value" header="Название должности" style={{width:'75%'}}
                            scrollable emptyMessage='Нет сведений' 
                            editor = {props=>this.textEditor(props, "value")} 
                            onEditorInit = {props=>this.onEditTextInit(props, "value")}
                            onEditorSubmit = {props=>this.onEditTextSubmit(props)} 
                            onEditorCancel = {props=>this.onEditTextCancel(props)}
                            />
                        <Column body={this.actionBodyTemplate} header={this.tableHeader} style={{width:'15%'}}/>
                    </DataTable>
                </div>
            </div>
        </div>)
    }
}