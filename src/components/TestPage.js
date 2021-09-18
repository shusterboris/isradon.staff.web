import React, { Component } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import AppSets from '../service/AppSettings';

export default class EmptyPage extends Component {
    state = {
        orgUnitName: '', value1:'',value2:'',value3:'',
    }

    constructor(props){
        super(props);
        this.uploadHandler = this.uploadHandler.bind(this);
    }

    uploadHandler(files){
        const file = files.files.shift();
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.uploadEmployeePhoto(e.target.result, this);
        };
        fileReader.readAsDataURL(file);
    }

    uploadFile(file){
        const subject = "Отправка файла";
        axios.post(AppSets.host + '/files/image/save', file, {headers: { 'Content-Type': 'image/png', timeout: AppSets.timeout }})
            .then(
                this.toast.show({severity:'info', summary:'Отправлено'}))
            .catch(err => {
                let errMsg = "";
                if (err.response== null || err.toString().includes(': Network')){
                    errMsg = subject+'Сервер не отвечает. Возможно проблемы с подключением к сети...'
                }else if (err.toString().includes('status code 400')){
                    errMsg = 'Неправильный запрос к системе(400). Обратитесь в техническую поддержку';
                }else if (err.toString().includes('status code 405')){
                    errMsg = 'Неправильный запрос к системе(405). Обратитесь в техническую поддержку';
                }else if (err.toString().includes('status code 500')){
                    errMsg = 'Сервер не может обработать запрос(500). Обратитесь в техническую поддержку';
                }else if (err.toString().includes('status code 403')){
                    errMsg = 'Недостаточно прав. Обратитесь в IT-службу компании';
                }else{
                    console.log(err.response.data);
                    errMsg = subject+'. Непредусмотренная ошибка';
                }
                if (this.toast){
                    this.toast.show({ severity: 'error', summary: errMsg});
                }else{
                    console.error(errMsg);
                    if (err.response){
                        console.error(err.response.data)
                    }else{
                        console.error(err.toString());
                    }
                }
            })
    }
    
    render() {
        return( <div className='card'>  
            <Toast ref={(el) => { this.toast = el; }}></Toast> 
            <FileUpload mode="basic" name="document" 
                customUpload={true}
                uploadHandler={this.uploadHandler}
                accept="image/*" 
                maxFileSize={1024000} 
                auto chooseLabel="Browse" />
        </div>)     
    }
}