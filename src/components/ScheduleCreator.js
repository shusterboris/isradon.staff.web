import React, { Component } from 'react';
import AppSets from '../service/AppSettings';
import { InputText } from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Dropdown} from 'primereact/dropdown'
import ScheduleService from '../service/ScheduleService';
import { Messages } from 'primereact/messages';


export default class ScheduleCreator extends Component{
    state = {
        orgUnits: [],
        shifts: [],
        employees: [],
        orgUnitName: '',
        chosenShift: null,
    }

    constructor(props){
        super(props);
        this.dataService = new ScheduleService();
    }

    componentDidMount(){
        AppSets.getOrgUnitList(this);
        AppSets.getEmployees(this);
        
    }

    onChooseShift(val){
        this.dataService.getOrgUnitShifts(val.id, this);
    }

    render(){
        return (
            <div className="p-card">
                <div className="p-fluid p-formgrid ">
                    <div className="p-field p-col-2 p-md-2">
                        <label className="p-text-left" htmlFor="orgUnitNameFld">Название подразделения</label>                                        
                        <InputText id="orgUnitNameFld" value={this.state.orgUnitName} 
                                            onChange={(e) => this.setState({orgUnitName:e.target.value, orgUnitChanged: true})}/>
                    </div>
                </div>
            </div>
    )}
}