import React, { useEffect } from 'react';
import { Route, useLocation, withRouter } from 'react-router-dom';
import App from './App';
import {Error} from './pages/Error';
import { NotFound } from './pages/NotFound';
import { Access } from './pages/Access';
import { Transit } from './components/Transit';

const AppWrapper = () => {

    let location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location]);

    switch (location.pathname) {
        case '/error':
            return <Route path="/error" component={Error} />
        case '/notfound':
            return <Route path="/notfound" component={NotFound} />
        case '/access':
            return <Route path="/access" component={Access} />
        default:
            if (location.pathname.startsWith("/transit")){
                return <Route path="/transit" component={Transit} />
            } else{
                return <App/>;
            }
    }
}

export default withRouter(AppWrapper);
