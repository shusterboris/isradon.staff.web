import React from 'react';
import { useHistory, useLocation, withRouter } from 'react-router-dom';

const AppBreadcrumb = (props) => {

    const location = useLocation();
    const history = useHistory();

    let pathname = props.routers.filter((router) => {
        return router.path === location.pathname;
    })


    return (
        <div className="layout-breadcrumb">
            <ul>
                <li><button type="button" className="p-link" onClick={() => history.push('/')} ><i className="pi pi-home"></i></button></li>
                <li><i className="pi pi-chevron-right chevron-icon"></i></li>
                <li><button className="p-link">{pathname[0].label}</button></li>
            </ul>
        </div>
    );
}

export default withRouter(AppBreadcrumb);
