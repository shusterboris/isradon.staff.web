import React from 'react';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';

export const Error = () => {

	const history = useHistory();

	const goDashboard = () => {
		history.push('/');
	}

	return <div className="exception-body  error">
		<div className="exception-panel">
			<div className="exception-image">
				<img src="assets/layout/images/exception/icon-error.png" alt="sapphire" />
			</div>

			<div className="exception-detail">
				<h1>ERROR OCCURED</h1>
				<p>Something went wrong.</p>
				<Button label="GO TO DASHBOARD" onClick={goDashboard} />
			</div>
		</div>
	</div>
}
