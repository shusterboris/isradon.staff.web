import React from 'react';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';

export const Access = () => {

	const history = useHistory();

	const goLoginPage = () => {
		history.push('/login');
	}

	return (
		<div className="exception-body accessdenied" id="notAccessPage">
			<div className="exception-panel">
				<div className="exception-image">
					<img src="assets/layout/images/exception/icon-access.png" alt="Isradon" />
				</div>

				<div className="exception-detail">
					<h1>ДОСТУП ЗАПРЕЩЕН!</h1>
					<p>Вы не ввели правильные реквизиты для доступа или у Вас недостаточно прав для выполнения избранной операции.</p>
					<Button label="Вход в систему" onClick={goLoginPage} />
				</div>
			</div>
		</div>
	)
}
