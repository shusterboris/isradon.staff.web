import React from 'react';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';

export const NotFound = () => {

	const history = useHistory();

	const goDashboard = () => {
		history.push('/');
	}

	const goBack = () => {
		history.goBack();
	}

	return <div className="exception-body notfound">
		<div className="exception-panel">
			<div className="exception-image">
				<img src="assets/layout/images/exception/icon-404.png" alt="sapphire" />
			</div>

			<div className="exception-detail">
				<h1>НЕТ ТАКОЙ СТРАНИЦЫ</h1>
				<p>Запрошенная страница не существует.</p>
				<Button label="На главную страницу" onClick={goDashboard} />
				<Button label="Назад" onClick={goBack} style={{margin:'0 0 0 1em'}}/>
			</div>
		</div>
	</div>

}
