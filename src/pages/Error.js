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

	return <div className="exception-body  error">
		<div className="exception-panel">
			<div className="exception-image">
				<img src="assets/layout/images/exception/icon-error.png" alt="sapphire" />
			</div>

			<div className="exception-detail">
				<h1>Ошибка вышла!</h1>
				<p>{props.reason}</p>
				<Button label="На главную страницу" onClick={goDashboard} />
				<Button label="Назад" onClick={goBack} style={{margin:'0 0 0 1em'}}/></div>
			</div>
		</div>
}
