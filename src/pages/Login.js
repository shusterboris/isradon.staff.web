import React, { useState, useRef }  from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';
import { Messages } from 'primereact/messages';
import AppSets from '../service/AppSettings';

export const Login = () => {

	const [userName, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const history = useHistory();
	const messages = useRef(null);


    const showMessage = (msgParams) => {
        messages.current.show(msgParams)
    }

	return (
		<div className="login-body">
			<div className="login-panel ui-fluid">
				<Messages ref = {messages}/>
				<div className="login-panel-header">
					<img src="/assets/layout/images/isradon-logo-hor.png" alt="logotype"/>		
				</div>
				<div className="login-panel-content">
					<div className="p-grid">
						<div className="p-col-12">
							<h1>HR - портал</h1>
							<h2>Пожалуйста, зарегистрируйтесь</h2>
						</div>
						<div className="p-col-12">
							<span className="p-float-label">
								<InputText id="username" type="text" style={{ width: '100%' }} v-model="username" 
									value={userName} onChange={(e)=>setUserName(e.target.value)}/>
								<label htmlFor="username">Имя (логин) пользователя: </label>
							</span>
						</div>
						<div className="p-col-12">
							<span className="p-float-label">
								<InputText id="password" type="password" style={{ width: '100%' }} v-model="password" 
									value={password} onChange={(e)=>setPassword(e.target.value)}/>
								<label htmlFor="password">Пароль: </label>
							</span>
						</div>
						<div className="p-col-6">
							
						</div>
						<div className="p-col-6" style={{ textAlign: 'right' }}>
							<Button label="Дальше" onClick={()=>AppSets.authenticateUser(userName, password, showMessage, history)} style={{ width: '100%' }} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
