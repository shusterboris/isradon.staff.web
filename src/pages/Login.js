import React, { useState }  from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import AppSets from '../service/AppSettings';

export const Login = () => {

	const [userName, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const history = useHistory();


	const goAhead = (userName,password) => {
		const server = AppSets.host;
        const url = server + '/auth';
		const data = {"username": userName, "password": password};
		axios.post(url, data, {headers: {'Content-Type': 'application/json'}})
		.then(res=>{
			console.log(res);
		})
		.catch(window.location="/access")
		history.push('/');
	}

	return (
		<div className="login-body">
			<div className="login-panel ui-fluid">
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
							<Button label="Дальше" onClick={()=>goAhead(userName, password)} style={{ width: '100%' }} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
