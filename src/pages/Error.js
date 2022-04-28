import React from 'react';
import { Button } from 'primereact/button';
import { useHistory} from 'react-router-dom';

export const Error = (props) => {

	const history = useHistory();

	const goDashboard = () => {
		history.push('/');
	}

	const goBack = () => {
		history.goBack();
	}

	let reason = props.reason ? props.reason : ((history.location.state && history.location.state.reason) ? history.location.state.reason : "")
	return <div className="exception-body  error" id="errorPage">
		<div className="exception-panel">
			<div className="exception-image">
				<img src="assets/layout/images/exception/icon-error.png" alt="sapphire" />
			</div>

			<div className="exception-detail">
				<h1>Ошибка!</h1>
				<p>{reason}</p>
				<Button label="На главную страницу" onClick={goDashboard} />
				<Button label="Назад" onClick={goBack} style={{margin:'0 0 0 1em'}}/></div>
			</div>
		</div>
}
