import React, { Component } from 'react';
import AppSets from '../service/AppSettings';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { Panel } from 'primereact/panel'

export default class UsersView extends Component {
    state = {selectedRow: null, employees: [], userName: '', password1: '', password2: '', 
        israWorker: '', israOrgUnit: '', israLinkChanged: false, israData: [],
        userInfo: {}, selectedRoles:new Set()};
    
    constructor(props) {
        super(props);
        this.onRowSelect = this.onRowSelect.bind(this);
        this.save = this.save.bind(this);
        this.onCheck = this.onCheck.bind(this)
        this.updateEmployee = this.updateEmployee.bind(this);
        this.displayIsraLinkPanel = this.displayIsraLinkPanel.bind(this);
        this.onRemoveLink = this.onRemoveLink.bind(this);
        this.bodyDeleteLink = this.bodyDeleteLink.bind(this);
        this.addNewIsraLink = this.addNewIsraLink.bind(this);
        this.updateIsraLinks = this.updateIsraLinks.bind(this);
        this.messages = {};
        this.history = props.history;
    }

    componentDidMount(){
        this.updateEmployee()
    }

    onRowSelect(row){
        this.setState({selectedRow: row, userName: row.userName ? row.userName : "", password1:'', password2: '', userInfo: {}, selectedRoles:new Set()});
            AppSets.loadUserData(this, row.userName,row.id);
    }

    onCheck(event, value){
        let userInfo = this.state.userInfo;
        let authorities = userInfo.hasOwnProperty('authorities') ? userInfo.authorities : [];
        if (event.checked){
            authorities.push(value);
        }else{
            authorities = authorities.filter(function(cur, index, arr){ return cur !== value})
        }
        userInfo.authorities = authorities;
        this.setState({userInfo: userInfo});
        this.save()
    }

    updateEmployee(){
        AppSets.getEmployees(this);
        this.setState({password1:"", password2:""})
    }

    save(){
        if (!this.state.selectedRow.userName){
            //?????? ???????????????? ?????? ?????????? ????????????
            if (!this.state.password1 || !this.state.password2 || !this.state.userName){
                this.messages.show({severity: 'error', summary: '?????? ???????? ?? ???????????????? * ???????????? ???????? ??????????????????'})
                return;
            }if (this.state.password1 !== this.state.password2){
                this.messages.show({severity: 'error', summary: '???????????? ?? ?????????? ?????????? ???????????? ???????? ????????????????????'})
                return;
            }
        }else{
            //?????? ???????????????????????? - ?????? ???????????? ????????, ?????????????????? ???????????? ?????????????????? ?????????????? - ?????? ???????? ?? ???????????????????? ?????? ?????? ????????????
            if (this.state.password1 !== this.state.password2){
                this.messages.show({severity: 'error', summary: '???????????? ?? ?????????? ?????????? ???????????? ???????? ????????????????????'})
                return;
            }
        }
        let userInfo = this.state.userInfo;
        userInfo.userName = this.state.userName;
        userInfo.employeeId = this.state.selectedRow.id;
        if (this.state.password1){
            userInfo.password = this.state.password1
        }
        
        AppSets.saveUserData(userInfo, this, this.updateEmployee);
    }

    updateIsraLinks(){
        AppSets.loadUserData(this, this.state.selectedRow.userName, this.state.selectedRow.id);
        this.setState({israWorker: '', israOrgUnit: '', israLinkChanged: false});
    }

    addNewIsraLink(){
        AppSets.addNewExtraLink(this, this.updateIsraLinks);
    }

    onRemoveLink(rowData){
        AppSets.removeIsraLink(rowData.israWorker, rowData.israOrgUnit, this, this.updateIsraLinks)
    }

    bodyDeleteLink(rowData){
        return (
            <Button type="button" icon="pi pi-times" className="p-button-secondary"
                tooltip="?????????????? ?????? ?????????????"
                onClick={()=>this.onRemoveLink(rowData)}>
            </Button>
        );
    }

    displayIsraLinkPanel(){
        if (!this.state.selectedRow)
            { return null };
        return (
            <Panel header="?????????? ?? ???????????????????????????? ??????????????????">
                <div className='p-grid'>
                    <div className='p-col-5'>
                        <span className="p-float-label">
                            <InputText id="israUserIdFld" value={this.state.israWorker} keyfilter="int" 
                                onChange={(e)=>this.setState({israWorker: e.target.value, israLinkChanged: true})}/>
                            <label htmlFor="israUserIdFld"> ?????????????? ?????? ????????????????????</label>
                        </span>
                    </div>
                    <div className='p-col-5'>
                        <span className="p-float-label">
                            <InputText id="israOrgUnitIdFld" value={this.state.israOrgUnit} keyfilter="int"
                                onChange={(e)=>this.setState({israOrgUnit: e.target.value, israLinkChanged: true})}/>
                            <label htmlFor="israOrgUnitIdFld"> ?????????????? ?????? ????????????????</label>
                        </span>
                    </div>
                    {(this.state.israWorker && this.state.israOrgUnit && this.state.israLinkChanged) && 
                        <div className='p-col'>
                            <Button className='p-button-success p-button-rounded' icon='pi pi-plus' tooltip="???????????????? ?????????????????? ???????????? ?? ?????????????? ????????????"
                                onClick={()=>this.addNewIsraLink(this, this.updateIsraLinks)}/>
                        </div>}
                </div>
                <DataTable value={this.state.israData} howGridlines>
                    <Column field="israWorker" header="?????? ????????????????????"/>
                    <Column field="israOrgUnit" header="?????? ????????????????" />
                    <Column body={this.bodyDeleteLink} style={{width:'15%'}}/>
                </DataTable>
            </Panel>
        )
    }

    render() {
        if (!AppSets.getUser().amIhr())
            { this.history.push("/access") }
        return <div className="content-section implementation">
            <Toast ref = {(e) => this.messages = e} position = {"top-left"} life='5000'/>
            <div className='p-fluid p-grid'>
                <div className="p-col-12 p-md-4 p-card">
                    <DataTable value={this.state.employees} emptyMessage='?????? ??????????????'                                
                                scrollable scrollHeight='600px' showGridlines
                                selectionMode="single" selection={this.state.selectedRow} dataKey="id"
                                onSelectionChange={e => {this.onRowSelect(e.value)}} >
                        <Column field='fullName' style={{width: '45%', margin: '1em 0 0 0' }} header="??????????????????" filter/>
                        <Column field='userName' header='????????????????????????' filter 
                            style={{margin: '0 0 0 0', padding: '0 0 0 0'}} 
                            headerStyle={{textAlign: 'center'}} />
                        <Column field='orgUnit' header='??????????????.' filter
                            headerStyle={{width: '25%',textAlign: 'center' }} 
                            style={{margin: '0 0 0 0', padding: '0 0 0 0', color:'#1E88E5'}}/>
                    </DataTable>
                </div>
                <div className='p-col-4 p-md-4 p-card'>
                    <div className='p-card-title p-text-center'>???????????? ????????????????????????  </div>
                    {this.state.selectedRow && <div>
                        <div className='p-card-title p-text-center p-text-light'> {this.state.selectedRow && this.state.selectedRow.fullName}</div>
                        <div >
                            <span className="p-float-label" style={{margin: '0.5em 0 0 0'}}>
                                <InputText id="userNameFld"  style={{ width: '100%' }} disabled={this.state.selectedRow.userName}
                                        value={this.state.userName} onChange={(e)=>this.setState({userName: e.target.value})}/>
                                <label htmlFor="userNameFld">?????? ????????????????????????*</label>
                            </span>
                            <span className="p-float-label"  style={{margin: '0.5em 0 0 0'}}>
                                <InputText id="newPassword1Fld"  style={{ width: '100%' }} type="password" 									
                                        value={this.state.password1} onChange={(e)=>this.setState({password1: e.target.value})}/>
                                <label htmlFor="newPassword1Fld">????????????*</label>
                            </span>
                            <span className="p-float-label" style={{margin: '0.5em 0 1em 0'}}>
                                <InputText id="newPassword2Fld"  style={{ width: '100%' }} type="password" 									
                                        value={this.state.password2} onChange={(e)=>this.setState({password2: e.target.value})}/>
                                <label htmlFor="newPassword2Fld">???????????? ????????????????*</label>
                            </span>
                            <span style={{padding: '2em 0 1em 1 em'}}> ???????? ?? ??????????????
                                    <div className="p-field-checkbox">
                                        <Checkbox inputId="editAll" name="role" value="HR" 
                                            checked={this.state.userInfo && this.state.userInfo.hasOwnProperty('authorities') && this.state.userInfo.authorities.includes('editAll')}
                                            onChange={(e)=>{this.onCheck(e, 'editAll')}}/>
                                        <label htmlFor="editAll">HR</label>
                                    </div>
                                    <div className="p-field-checkbox">
                                        <Checkbox inputId="manualCheckIn" name="role" value="manualCheckIn" 
                                            checked={this.state.userInfo && this.state.userInfo.hasOwnProperty('authorities') && this.state.userInfo.authorities.includes('manualCheckIn')}
                                            onChange={(e)=>{this.onCheck(e, 'manualCheckIn')}}/>                                            
                                        <label htmlFor="manualCheckIn">???????????? ??????????????</label>
                                    </div>
                            </span>
                        </div>
                        <span >
                            <Button className="p-button-warning" icon="pi pi-arrow-left" iconPos="left" 
                                label=  '??????????'
                                style={{margin: '1em 1em 1em 1em', width:"40%"}}
                                onClick={this.props.history.goBack}/>
                            {(this.state.password1 && this.state.password2 && this.state.userName) && 
                                <Button className="p-button-info" icon="pi pi-check" label="??????????????????" iconPos="right"
                                    style={{margin: '1em 1em 1em 1em', width:"40%"}}
                                    onClick={()=>this.save()}>
                                </Button>}
                        </span>
                        {this.displayIsraLinkPanel()}
                    </div>}
                </div>
            </div>
        </div>
    }
}