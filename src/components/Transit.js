import axios from "axios";
import React, {useEffect} from "react";
import AppSets from '../service/AppSettings';
import { ProgressSpinner } from 'primereact/progressspinner'

export const  Transit = (props) => {

    useEffect(()=>{
        transmitToPage()
    },[])

    const transmitToPage = async () => {
        //const keys = props.location.pathname.split("/")
        const param = props.location.search
        if (!param || !param.startsWith("?"))
            {props.history.push({pathname: '/error', state:'Неправильные данные для входа в систему'})}
        const keys = param.slice(1)
        let url = AppSets.host+"/user/key/" + keys
        await axios.get(url, {timeout: AppSets.timeout})
        .then(response => {
            let userName = response.data
            let pswd = window.localStorage.getItem(response.data);
            if (!pswd){
                props.history.push({pathname:"/login", state: userName})
            }else{
                AppSets.authenticateUser(userName,pswd)
            }
        })
        .catch(err =>{
            (err.response) ?
                props.history.push(props.history.push({pathname: '/error', state: err.response.data})) :
                props.history.push(props.history.push({pathname: '/error', state: "Сервер не отвечает, возможно проблемы с Интернет. Попробуйте позже или обратитесь в техническую поддержку"}))
        })
    }

    return(
        <div className="p-d-flex p-flex-column p-jc-center">
            <div className="p-card-title p-mx-auto" >Подождите...</div>
            <ProgressSpinner style={{width: '100px', height: '100px'}} strokeWidth="8"/>
            <div className="p-card-title p-mx-auto">Аутентификация пользователя</div>
        </div>
    )
}