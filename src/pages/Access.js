import React from 'react';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';

export const Access = () => {

	const history = useHistory();

	const goDashboard = () => {
		history.push('/');
	}

	return (
		<div className="exception-body accessdenied" >
			<div className="exception-panel">
				<div className="exception-image">
					<img src="assets/layout/images/exception/icon-access.png" alt="sapphire" />
				</div>

				<div className="exception-detail">
					<h1>ACCESS DENIED</h1>
					<p>You do not have the necessary permissons.</p>
					<Button label="GO TO DASHBOARD" onClick={goDashboard} />
				</div>
			</div>
		</div>
	)
}
