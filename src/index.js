import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import AppWrapper from './AppWrapper';
import {Router} from 'react-router-dom';
import {createBrowserHistory} from 'history';
import 'primeflex/primeflex.css';
import 'primereact/resources/primereact.min.css';
import * as serviceWorker from './serviceWorker';
import { ProgressBar } from 'primereact/progressbar'
import './i18n';

let history = createBrowserHistory();

ReactDOM.render(
	<Router history={history}>
		<Suspense fallback={<ProgressBar mode="indeterminate"/>}>
			<AppWrapper></AppWrapper>
		</Suspense>
	</Router>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();