import React, { Component } from 'react';
import { InputText } from 'primereact/inputtext';

export default class EmptyPage extends Component {
    state = {
        orgUnitName: '', value1:'',value2:'',value3:'',
    }

    
    render() {
        return( <div className='card'>                   
        <span className="p-float-label">    
            <InputText id="inputtext"  value={this.state.value1} onChange={(e) => this.setState({ value1: e.target.value })} />
            <label for="inputtext" >InputText</label>
        </span>
    </div>
        )     
    }
}