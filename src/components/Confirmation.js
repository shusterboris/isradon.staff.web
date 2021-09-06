import React, { Component } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';


export default class Confirmation extends Component{
    state= {displayDlg: true}
    constructor(props){
        super(props);
        this.header = props.header;
        this.accept = props.accept ? props.accept : this.dummyOk;
        this.body = props.body;
        this.parentContext = props.parentContext;
        this.visibility = true;
        this.onHide = this.onHide.bind(this);
        this.reject = props.reject;
    }

    onAccept(){
        this.accept();
        this.setState({visibility: false});
    }

    onReject(){
        this.setState({displayDlg: false});
    }

    onHide(){
        this.reject()
    }

    render(){
        const footer = (
            <div>
                <Button label="Да" icon="pi pi-check" onClick={this.accept} />
                <Button label="Нет" icon="pi pi-times"  onClick={this.reject}/>
            </div>
        );
        return(
            <Dialog  header={this.header} footer={footer} visible={this.visibility} onHide={this.reject} style={{width:'50vw'}}>
                {this.body}
            </Dialog>
            
        );
    }
}