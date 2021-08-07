import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';

export const Login = () => {

	const history = useHistory();

	const goDashboard = () => {
		history.push('/');
	}

	return (
		<div className="login-body">
			<div className="login-panel ui-fluid">
				<div className="login-panel-header">
					<img src="assets/layout/images/login/logo-sapphire-color.png" alt="sapphire" />
				</div>
				<div className="login-panel-content">
					<div className="p-grid">
						<div className="p-col-12">
							<h1>SAPPHIRE NETWORK</h1>
							<h2>Welcome, please use the form to sign-in</h2>
						</div>
						<div className="p-col-12">
							<span className="p-float-label">
								<InputText id="username" type="text" style={{ width: '100%' }} v-model="username" />
								<label htmlFor="username">Username</label>
							</span>
						</div>
						<div className="p-col-12">
							<span className="p-float-label">
								<InputText id="password" type="text" style={{ width: '100%' }} v-model="password" />
								<label htmlFor="password">Password</label>
							</span>
						</div>
						<div className="p-col-6">
							<button className="p-link">Forget Password?</button>
						</div>
						<div className="p-col-6" style={{ textAlign: 'right' }}>
							<Button label="NEXT" onClick={goDashboard} style={{ width: '100%' }} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
