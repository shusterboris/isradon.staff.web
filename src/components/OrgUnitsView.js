import React, { Component } from 'react';
import AppSets from '../service/AppSettings';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import {Button} from 'primereact/button';
import { Toolbar } from 'primereact/toolbar'
import { ListBox} from 'primereact/listbox'
import ScheduleService from '../service/ScheduleService';
import { ProgressSpinner } from 'primereact/progressspinner';
import {Checkbox} from 'primereact/checkbox'
import { ContextMenu } from 'primereact/contextmenu'
import Confirmation from './Confirmation'
import ScheduleCreateProxy from '../entities/ScheduleCreateProxy';
import axios from 'axios'
import { Toast } from 'primereact/toast';
import { ru, gb } from '../service/AppSettings'

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
        start1:'', end1:'', start2:'', end2:'', start3:'', end3:'', start4:'', end4:'', start5:'', end5:'', start6:'', end6:'', start7:'', end7:'',
        waitPlease: true, showConfirm: false, showDeletedUnits: false, notes: '', employees: [], israId: null,
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
        this.onPressRemoveShift = this.onPressRemoveShift.bind(this);
        this.onRemoveShift = this.onRemoveShift.bind(this);
        this.hideConfirmDlg = this.hideConfirmDlg.bind(this);
        this.afterShiftRemoving = this.afterShiftRemoving.bind(this);
        this.actionBodyTemplate = this.actionBodyTemplate.bind(this);
        this.onRemoveOrgUnitPressed = this.onRemoveOrgUnitPressed.bind(this);
        this.onRemoveOrgUnit = this.onRemoveOrgUnit.bind(this);
        this.afterOrgUnitRemoving = this.afterOrgUnitRemoving.bind(this);
        this.checkShowDeleted = this.checkShowDeleted.bind(this);
        this.shiftTemplate = this.shiftTemplate.bind(this);
        this.copyHours = this.copyHours.bind(this);
        this.ouDateSendBody = this.ouDateSendBody.bind(this);
        this.ouDateApprovalBody = this.ouDateApprovalBody.bind(this);
        this.renderOuSendHeader = this.renderOuSendHeader.bind(this);
        this.renderOuApproveHeader = this.renderOuApproveHeader.bind(this);
        this.approveSchedule = this.approveSchedule.bind(this);
        this.sendSchedule = this.sendSchedule.bind(this);
        this.createSheduleReport = this.createSheduleReport.bind(this);
        this.showOrgUnitEmployees = this.showOrgUnitEmployees.bind(this);
        this.onInputIsraId = this.onInputIsraId.bind(this);
        this.history = props.history;
        this.moment = require('moment');
        this.ouMenuModel = [
            {label: '?????????????????? ????????', icon: 'pi pi-calendar', command: () => this.approveSchedule(this.state.selectedRow)},
            {label: '??????????????????', icon: 'pi pi-send', command: () => this.createSheduleReport(this.state.selectedRow)},
        ];
        this.t = props.t;
        this.bodyDOW=this.bodyDOW.bind(this);
        this.lang = props.i18n.language;
    }

    componentDidMount(){
        AppSets.getOrgUnitList(this)
    }

    onInputIsraId(){
        this.messages.show({severity:'warn', summary: '?????? ???????? ?????? ?????????? ?? ???????????????????????????? ???????????????? ??????????????. ?????????????? ??????, ???????????? ???????? ???????????? ??????????, ?????? ??????????????!', sticky: true})
    }

    showOrgUnitEmployees(id){
        AppSets.getEmployees(this, id);
    }

    onRowSelect(val){
        //?????????????? ?????????? ?????????????????????????? ?? ??????????????, ?????????? ???????????? ????????
        if (!val.deleted){
            this.setState({selectedRow: val, orgUnitName: val.name,start1: '', start2: '', start3: '', start4: '', start5: '', start6: '', start7: '',
                end1: '', end2: '', end3: '', end4: '', end5: '', end6: '', end7: '',shiftChanged: false, orgUnitChanged: false,
                shiftNo: '', notes: '', israId: val.isra_id});
            this.dataService.getOrgUnitShifts(val.id, this);
            this.showOrgUnitEmployees(val.id);
        }else{
            this.messages.show({severity: 'warn', summary: '???????????? ???????????????? ?????????????????? ??????????????????????????!'})
        }
    }

    approveSchedule(selRow){
        //???????? ?????????? ???????????????? ???????????? - ????????????, ?????????? ???????????????????? ?????????????? ??????????, ?????????? - ??????????????
        let today = this.moment();
        if (today.day > 20){
            today.add(1,'month');
        }
        let interval = [today.startOf('month').format('yyyy-MM-DD HH:mm'), today.endOf('month').format('yyyy-MM-DD HH:mm')]
        let payload = new ScheduleCreateProxy(selRow.id, 0, 
            null, null, interval, null, null)
        this.dataService.acceptSchedule(payload, this);    
    }

    
    createSheduleReport(selRow){
        let today = this.moment();
        if (today.day > 20){
            today.add(1,'month');
        }
        //?????? ?????????????????? ?????????????? ??????????????????????
        let month = today.month();
        const orgUnitId = selRow.id;
        const server = AppSets.host;
        month = 5
        const query = "/schedule/getCoworkers/" + month + "/" + orgUnitId;
        const url = server + query;
        axios.get(url, {timeout: AppSets.timeout})
            .then((res)=>{
                if (res.data.length !== 0){
                    this.sendSchedule(selRow, res.data);
                }else{
                    this.messages.show({ severity: 'warn', summary: '?????? ?????????????????????????? ???????????????????? ?????? ?????????????? ??????????????????????????'});
                }
            })
            .catch(err => {
                this.dataService.processRequestsCatch(err, '???????????????????????? ?????????????????? ?????? ????????????????????', this.messages);
            })
    }

    sendSchedule(selRow, employeeIds = []){
        let today = this.moment();
        if (today.day > 20){
            today.add(1,'month');
        }
        let interval = [today.startOf('month').format('yyyy-MM-DD HH:mm'), today.endOf('month').format('yyyy-MM-DD HH:mm')]
        if (employeeIds.length === 0){
            new ScheduleCreateProxy(selRow.id, 0, null, null, interval, null, null)
        }else{
            for (let i=0; i < employeeIds.length; i++ ){
                let employeeId = employeeIds[i];
                new ScheduleCreateProxy(selRow.id, 0, employeeId, null, interval, null, null);
            }
        }

    }

    createTime(timeStr){
        try{            
            if (! timeStr)
                return "???? ????????????";
            if (! timeStr.trim())
                return "???? ????????????";
            if (timeStr.trim().length < 5)
                return "?????????????? ????????????????"
            let dt = new Date() 
            const hhmm = timeStr.split(":");
            if (hhmm.length !== 2)
                return "?????????? ???????????? ??????????????"
            if (hhmm[0] > '59')
                return "?????????? ???????????? ??????????????"
            dt.setHours(hhmm[0]);
            dt.setMinutes(hhmm[1]);
            dt.setSeconds(0);
            return dt;
        }catch(err){
            return "?????????? ???????????? ??????????????";
        }
    }

    intervalValidation(startTimeStr, endTimeStr){
        const errList = [];
        let startTime = this.createTime(startTimeStr);
        let startEmpty = false;
        let endEmpty = false;
        if (typeof startTime === 'string'){
            errList.push("?????????? ???????????? ?????????? " + startTime);
            if (startTime === '???? ????????????'){
                startEmpty = true;
            }
        }
        let endTime = this.createTime(endTimeStr);    
        if (typeof endTime === 'string'){
            errList.push("?????????? ?????????????????? ?????????? " + endTime);
            if (endTime === '???? ????????????'){
                endEmpty = true;
            }
        }
        //?????? ???????? ???????????? - ?????? ??????????????????
        if (startEmpty && endEmpty)
            return '';
        //???????????????????????? ?????? ???????????? ???????? ???????????? ?????? ??????????, ???? ???? ?????? - ????????????, ???????????? ???? ??????????????????
        if (errList.length !== 0)
            return errList;
        if (endTime < startTime)
            errList.push("?????????? ???????????? ?????????? ???????????? ???????? ???????????? ?????????????? ??????????????????");
        if (startTime < this.createTime(AppSets.minStartTime))
            errList.push("?????????????? ????????");
        if (endTime > this.createTime(AppSets.maxEndTime))
            errList.push("?????????????? ????????????");        
        if (errList.length>0)
            return errList.toString();
        return '';
    }

    onShiftValidation(){
        let errMsg = this.intervalValidation(this.state.start1, this.state.end1);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "??????????????????????: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start2, this.state.end2);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "??????????????????????: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start3, this.state.end3);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "??????????????: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start4, this.state.end4);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "??????????: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start5, this.state.end5);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "??????????????: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start6, this.state.end6);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "??????????????: " + errMsg});
            return false;
        }
        errMsg = this.intervalValidation(this.state.start7, this.state.end7);
        if (errMsg !== ''){
            this.messages.show({severity: 'warn', summary: "??????????????: " + errMsg});
            return false;
        }
        if (!this.state.shiftNo){
            this.messages.show({severity: 'warn', summary: "???? ???????????? ?????????? ??????????. "});
            return false;
        }
        if (!this.state.start1 & !this.state.start2 & !this.state.start3 & !this.state.start4 &
            !this.state.start5 & !this.state.start6 & !this.state.start7){
                this.messages.show({severity: 'warn', summary: "???????????? ?? ?????????????? ?????????? ???? ??????????????. "});
                return false;    
            }
        return true;
    }

    onShiftSavePressed(){
        if (this.onShiftValidation()){
            this.dataService.saveShift(this);
        }
    }

    onPressRemoveShift(){
        this.confirmHeader = "?????????????????????? ????????????????!"
        this.confirmMessage = "?????????????? ???? ???????? ???????????? ??????????, ?????????????? ???????????? ???????????????????????? ???? ?????????????"
        this.confirmAccept = this.onRemoveShift;
        this.confirmReject = this.hideConfirmDlg;
        this.setState({showConfirm: true});
    }

    onRemoveShift(){
        this.dataService.scheduleShiftRemove(this, this.afterShiftRemoving);
    }

    afterShiftRemoving(){
        this.setState({chosenShift: null, showConfirm: false});
        this.onRowSelect(this.state.selectedRow);
        this.messages.show({severity:'success', summary:'???????????????????? ?? ?????????? ??????????????'});
    }

    hideConfirmDlg(){
        this.setState({showConfirm: false});
    }

    onChooseOrgUnitShift(v){
        const found = this.state.shifts.filter(item=>item.no === v);
        if (found.length > 0){
            const val = found[0];
            this.setState({start1: val.start1, start2: val.start2, start3: val.start3, start4: val.start4, start5: val.start5, start6: val.start6, start7: val.start7,
                    end1: val.end1, end2: val.end2, end3: val.end3, end4: val.end4, end5: val.end5, end6: val.end6, end7: val.end7,
                    shiftNo: val.no, chosenShift: val,shiftChanged: false, notes:val.notes, israId: val.isra_id});
        }
    }

    onCreateOrgUnit(){
        this.setState({orgUnitName: '', israId: null, employees: [], choosenEmployee: null, selectedRow: null, shifts:[]});
    }

    onOrgUnitSavePressed(){
        const id = (this.state.selectedRow != null) ? this.state.selectedRow.id : null;
        this.dataService.saveOrgUnit(this,id);
    }

    onCreateShift(){
        const row = this.state.selectedRow;
        this.setState({selectedRow: row, chosenShift: null, start1: '', start2: '', start3: '', start4: '', start5: '', start6: '', start7: '',
        end1: '', end2: '', end3: '', end4: '', end5: '', end6: '', end7: '',shiftChanged: false, orgUnitChanged: false, 
        shiftNo: '', notes: '' });
    }

    displayButtonBar(){
        const leftBar = (<React.Fragment>
            {(this.state.shiftChanged && this.state.selectedRow) && 
                <Button id="btnShiftSave" label={this.t("common_save")} icon="pi pi-check" style={{marginRight: '1em'}} 
                        className="p-button-primary p-mr-2"
                        onClick={this.onShiftSavePressed}/>}
                <Button id="btnShiftCancel" label={this.t("common_exit")} icon="pi pi-arrow-left" className="p-button-secondary p-mr-2" 
                        onClick={this.props.history.goBack}/>
            </React.Fragment>);
        const rightBar = (<React.Fragment>
            {this.state.shiftNo &&
                <Button id="btnShiftDelete" label={this.t("common_del")} icon="pi pi-thumbs-down" className="p-button-danger"
                        style={{marginLeft: '1em'}} 
                        onClick={this.onPressRemoveShift}/>
            }
        </React.Fragment>);    
        return <div>
            <Toolbar left={leftBar} right={rightBar} />
        </div>
    }

    afterOrgUnitRemoving(){
        AppSets.getOrgUnitList(this);
        this.hideConfirmDlg()
    }

    onRemoveOrgUnit(){
        this.dataService.orgUnitRemove(this.orgUnitToRemove, this, this.afterOrgUnitRemoving);
    }

    onRemoveOrgUnitPressed(rowData){
        this.confirmHeader = " ?????????????? ?????????????????????"
        this.confirmMessage = "?????????????? ???? ?????????? " + rowData.name + " ???? ???????? ?????????????"
        this.confirmAccept = this.onRemoveOrgUnit;
        this.confirmReject = this.hideConfirmDlg;
        this.orgUnitToRemove = rowData.id;
        this.setState({showConfirm: true});
    }

    actionBodyTemplate(rowData) {
        if (!rowData.deleted){
            return (
                <Button type="button" icon="pi pi-times" className="p-button-secondary"
                    tooltip="?????????????? ?????? ?????????????????????????? ???? ???????? ????????????"
                    onClick={()=>this.onRemoveOrgUnitPressed(rowData)}>
                </Button>
            );
        }else{
            return(<i className="pi pi-trash p-ml-4"></i>)
        }
    }

    ouDateApprovalBody(rowData){
        if (!rowData.dateVerify)
            {return "-"}
        return this.moment(rowData.dateVerify).format("DD/MM");
    }

    ouDateSendBody(rowData){
        if (!rowData.dateSend)
            {return "-"}
        return this.moment(rowData.dateSend).format("DD/MM");
    }

    checkShowDeleted(chkEvent){
        this.setState({showDeletedUnits: chkEvent.checked});
        AppSets.getOrgUnitList(this, chkEvent.checked)
    }

    shiftTemplate(option) {
        return (
            <div>
                {option.no}. {option.notes}
            </div>
        );
    }
    copyHours(){
        let s = this.state.start1;
        let e = this.state.end1;
        this.setState({start2: s, start3: s, start4: s, start5: s, end2: e, end3: e, end4: e, end5: e})
    }

    renderOuHeader(){
        return(
            <Checkbox checked={this.state.showDeletedUnits} onChange={(chkEvent)=>this.checkShowDeleted(chkEvent)} tooltip="???????????????????? ?????????????????? ????????????"/>
        )
    }

    renderOuApproveHeader(){
        return(
            <i className="pi pi-thumbs-up"></i>
        )
    }

    renderOuSendHeader(){
        return(
            <i className="pi pi-send" placeholder="???????? ???????????????? ??????????????????????"></i>
        )
    }
    bodyDOW(index){
         let dow;
        let s = (!this.lang) ? 'gb':this.lang;
       
      if (s.indexOf('gb')!==-1){
           dow = gb.dayNamesMin[index];
      }else{
           dow = ru.dayNamesMin[index];
       }
        return(
            <div>{dow}</div>
        );
    }
    render() {
        if (!AppSets.getUser().amIhr()){
            this.history.push("/access") }

        return <div className="content-section implementation">
            <div className="p-card">
                <Toast ref={(el) => this.messages = el}/>
            <div className='p-fluid p-grid'>
                <div className="p-col-12 p-md-4">
                    <ContextMenu model={this.ouMenuModel} ref={el => this.cm = el} onHide={() => this.setState({ selectedRow: null })}/>
                    <DataTable value={this.state.orgUnits} 
                                scrollable scrollHeight='600px' showGridlines
                                contextMenuSelection={this.state.selectedRow}
                                onContextMenuSelectionChange={e => this.setState({ selectedRow: e.value })}
                                onContextMenu={e => this.cm.show(e.originalEvent)}
                                emptyMessage={this.t('orgUnit_empty')}//'?????? ???????????????? ?? ????????????????????????????'       
                                selectionMode="single" selection={this.state.selectedRow} dataKey="id"
                                onSelectionChange={e => {this.onRowSelect(e.value)}} >
                        <Column field='name' style={{margin: '1em 0 0 0' }} header={this.t("orgUnit_list")}/>
                        <Column body={this.ouDateSendBody} header={this.renderOuSendHeader()} 
                            style={{margin: '0 0 0 0', padding: '0 0 0 0'}} 
                            headerStyle={{width: '3em', textAlign: 'center'}} />
                        <Column body={this.ouDateApprovalBody} header={this.renderOuApproveHeader()} 
                            headerStyle={{width: '3em', textAlign: 'center'}} 
                            style={{margin: '0 0 0 0', padding: '0 0 0 0', color:'#1E88E5'}}/>
                        <Column body={this.actionBodyTemplate} header={this.renderOuHeader()}
                            headerStyle={{width: '4.5em', textAlign: 'center'}} 
                            bodyStyle={{padding: '2px 0 0 0'}} />

                    </DataTable>
                </div>
                <div className="p-col-12 p-md-2">
                    {this.state.selectedRow ?  
                    <div className="card-title" style={{margin:'0.5em 0 2em 0', fontWeight:'bold'}} >{this.t("orgUnit_branch")}
                        <Button id="btnCreateOrgUnit" icon="pi pi-plus" className="p-button-rounded" 
                            style={{margin: '0 0 0 1em'}}
                            onClick={this.onCreateOrgUnit} tooltip='?????????????? ?????? ???????????????? ???????????? ??????????????????????????'/> </div> : 
                        <div className="card-title" style={{margin:'0.5em 0 2em 0', fontWeight:'bold'}} >{this.t("orgUnit_branch")} </div>
                    }
                    <div className = 'p-field'>
                        <label htmlFor="orgUnitNameFld" style={{fontWeight:'bold'}}>{this.t("orgUnit_name")}</label>
                        <InputText id="orgUnitNameFld" value={this.state.orgUnitName} placeholder={this.t("orgUnit_add")}
                                            onChange={(e) => this.setState({orgUnitName:e.target.value, orgUnitChanged: true})}/>
                    </div>
                    <div className = "p-field">
                        <InputText id = "orgUnitIsraId" placeholder={this.t("orgUnit_israId")} 
                            value = {this.state.israId} keyfilter="int" 
                            onChange={(e) => this.setState({israId:e.target.value, orgUnitChanged: true})}/>
                    </div>
                    {this.state.orgUnitChanged && 
                    <div style={{margin: '1.5em 1em 1em 1em'}}>
                        <span >
                            <Button id="btnOrgUnitSave" label="??????????????????" icon="pi pi-check" style={{marginRight: '1em'}} 
                                    onClick={this.onOrgUnitSavePressed}/>
                        </span>
                    </div>}
                    <label htmlFor="shiftList" style={{fontWeight:'bold'}}>{this.t("orgUnit_shiftList")}</label>
                    <ListBox id="shiftList" style={{margin:'0.5em 0 0 0'}} listStyle={{margin:'1em 0 0 0' }}
                        value={this.state.chosenShift}
                        options={this.state.shifts} itemTemplate={this.shiftTemplate} optionValue='no' 
                        onChange={(e)=>this.onChooseOrgUnitShift(e.target.value)}
                        tooltip="???????????????? ?????????? (????????????)"/>
                    {this.state.waitPlease && <ProgressSpinner/>}
                    {this.state.selectedRow && <div>
                        <label htmlFor="ouEmployees" style={{fontWeight:'bold'}}>{this.t("orgUnit_empl")}</label>
                        <ListBox id='ouEmployees' style={{margin:'0.5em 0 0 0'}} listStyle={{margin:'1em 0 0 0' }}
                            value={this.choosenEmployee}
                            options={this.state.employees} 
                            optionLabel="fullName"
                        /></div>
                    }
                </div>  

                <div className="p-col-12 p-md-6" >                
                    {this.state.chosenShift ? 
                    <div className="card-title" style={{margin:'0.5em 0 2em 0', fontWeight:'bold'}}>{this.t("orgUnit_shift")}
                        <Button id="btnCreateShift" icon="pi pi-plus" className="p-button-rounded" style={{margin: '0 0 0 1em'}}
                            onClick={this.onCreateShift} tooltip='?????????????? ?????? ???????????????? ?????????? ??????????'/>
                    </div> :
                    <div className="card-title" style={{margin:'0.5em 0 2em 0', fontWeight:'bold'}}>{this.t("orgUnit_shift")}</div>
                    }
                    {this.state.showConfirm && 
                        <Confirmation header={this.confirmHeader} body={this.confirmMessage} 
                            accept={this.confirmAccept} reject={this.confirmReject} visibility={true} parentContext={this}> 
                    </Confirmation>}
                    <div className="p-grid form-group">
                        <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>{this.bodyDOW(0)}</div>
                        <InputMask id='dow0Start' mask='99:99'
                                style={{width:'5em'}} 
                                value={this.state.start1} 
                                onChange={(e) => this.setState({start1:e.target.value, shiftChanged: true})}/>
                            
                        <InputMask id='dow0End' mask='99:99' 
                                style={{margin:'0 0 0 1em', width:'5em'}}
                                value={this.state.end1} 
                                onChange={(e) => this.setState({end1:e.target.value, shiftChanged: true})}/>
                        <Button icon="pi pi-copy" style={{marginLeft:'1em'}} 
                                    onClick={this.copyHours}
                                    tooltip="?????????????????????? ???? ??????????????????????-??????????????"/>
                    </div>                        
                            
                    <div className="p-grid  form-group" style={{padding:'1em 0 0 0'}}>
                        <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>{this.bodyDOW(1)}</div>
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
                        <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>{this.bodyDOW(2)}</div>
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
                    <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>{this.bodyDOW(3)}</div>
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
                        <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>{this.bodyDOW(4)}</div>
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
                            <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>{this.bodyDOW(5)}</div>
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
                            <div className="p-text-left" style={{margin: '0 1em 0 1em'}}>{this.bodyDOW(6)}</div>
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
                            <InputText id='shiftNotesFld'  placeholder={this.t('orgUnit_shiftInfo')}
                                value={this.state.notes}
                                style={{width: '60%', margin: '0 0 0 1em'}}
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
