import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Route } from 'react-router-dom';
import AppTopbar from './AppTopbar';
import AppConfig from './AppConfig';
import EmptyPage from './components/TestPage';
import ScheduleReportHR from './components/ScheduleReportHR';
import EmployeeCard from './components/EmployeeCard';
import EmployeeView from './components/EmployeeView';
import OrgUnitView from './components/OrgUnitsView';
import DayOffForm from './components/DayOffForm';
import MonthCalendar from './components/MonthCalendar'
import SchedulePlan from './components/SchedulePlan';
import PrimeReact from 'primereact/api';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.scss';

const App = () => {

    const [horizontal, setHorizontal] = useState(true);
    const [topbarSize, setTopbarSize] = useState('large');
    const [topbarColor, setTopbarColor] = useState('layout-topbar-blue');
    const [menuColor, setMenuColor] = useState('layout-menu-light');
    const [menuActive, setMenuActive] = useState(false);
    const [menuHoverActive, setMenuHoverActive] = useState(false);
    const [topbarUserMenuActive, setTopbarUserMenuActive] = useState(false);
    const [compactMode, setCompactMode] = useState(false);
    const [layoutColor, setLayoutColor] = useState('blue');
    const [themeColor, setThemeColor] = useState('blue');
    const [inputStyle, setInputStyle] = useState('outlined');
    const [ripple, setRipple] = useState(true);

    PrimeReact.ripple = true;

    const menu = [
        {label: 'Сводка', icon: 'pi pi-th-large', to: '/'},
        {
            label: 'График работы', icon: 'pi pi-list',
            items: [
                {label: 'По подразделениям', icon: 'pi pi-sitemap', to: '/shed-plan-orgunit'},
                {label: 'По сотрудникам', icon: 'pi pi-users', to: '/shed-plan'},
            ]
        },
        {label: 'Настройки', icon: 'pi pi-cog', 
            items: [
                {label: 'Настройки приложения', icon:'pi pi-cog', to: '/app-settings'},
                {label: 'Сотрудники', icon: 'pi pi-user-edit', to: '/employees-all'},
                {label: 'Подразделения', icon: 'pi pi-home', to: '/orgunit-list'},
            ]
        },
    ];

    let menuClick;
    let userMenuClick;

    const onWrapperClick = () => {
        if (!menuClick) {
            setMenuActive(false)
            unblockBodyScroll();

            if (horizontal) {
                setMenuHoverActive(false);
            }
        }

        if (!userMenuClick) {
            setTopbarUserMenuActive(false);
        }

        userMenuClick = false;
        menuClick = false;
    };

    const onInputStyleChange = (inputStyle) => {
        setInputStyle(inputStyle);
    };

    const onRippleChange = (e) => {
        PrimeReact.ripple = e.value;
        setRipple(e.value);
    };

    const onMenuButtonClick = (event) => {
        menuClick = true;

        if (!horizontal || isMobile()) {
            setMenuActive(prevMenuActive => !prevMenuActive);
        }

        event.preventDefault();
    };

    const blockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    }

    const unblockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
                'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    const onTopbarUserMenuButtonClick = (event) => {
        userMenuClick = true;
        setTopbarUserMenuActive(prevTopbarUserMenuActive => !prevTopbarUserMenuActive);

        event.preventDefault();
    };

    const onTopbarUserMenuClick = (event) => {
        userMenuClick = true;

        if (event.target.nodeName === 'BUTTON' || event.target.parentNode.nodeName === 'BUTTON') {
            setTopbarUserMenuActive(false)
        }
        event.preventDefault();
    };

    const onRootMenuItemClick = (event) => {
        menuClick = true;
        if (horizontal && isMobile()) {
            setMenuHoverActive(event.isSameIndex ? false : true);
        }
        else {
            setMenuHoverActive(prevMenuHoverActive => !prevMenuHoverActive);
        }
    };

    const onMenuItemClick = (event) => {
        if (event.item && !event.item.items) {
            if (!horizontal || isMobile()) {
                setMenuActive(false);
                unblockBodyScroll();
            }

            setMenuHoverActive(false);
        }
    };

    const onSidebarClick = () => {
        menuClick = true;
    };

    const isMobile = () => {
        return window.innerWidth <= 1024;
    };

    const onTopbarSizeChange = (size) => {
        setTopbarSize(size);
    };

    const onTopbarThemeChange = (color) => {
        setTopbarColor('layout-topbar-' + color);
    };

    const onMenuToHorizontalChange = (mode) => {
        setHorizontal(mode);
    };

    const onMenuThemeChange = (color) => {
        setMenuColor('layout-menu-' + color);
    };

    const onThemeColorChange = (color) => {
        setThemeColor(color);
    };

    const onLayoutColorChange = (color) => {
        setLayoutColor(color)
    };

    const onCompactModeChange = (mode) => {
        setCompactMode(mode);
    };

    useEffect(() => {
        if (menuActive) {
            blockBodyScroll();
        }
        else {
            unblockBodyScroll();
        }
    }, [menuActive]);

    const layoutContainerClassName = classNames('layout-container', {
        'layout-menu-horizontal': horizontal,
        'layout-menu-active': menuActive,
        'layout-top-small': topbarSize === 'small',
        'layout-top-medium': topbarSize === 'medium',
        'layout-top-large': topbarSize === 'large',
        'p-input-filled': inputStyle === 'filled',
        'p-ripple-disabled': !ripple,
    }, topbarColor, menuColor);

    const routers = [
        {path: "/" , component: ScheduleReportHR, exact:true },
		{path: "/shed-plan", component: MonthCalendar },
        {path: "/shed-plan-orgunit", component: SchedulePlan},
		{path: "/shed-fact", component: EmptyPage},
		{path: "/app-settings", component: EmptyPage},
		{path: "/employees-all", component: EmployeeView},
		{path: "/employee-edit", component:EmployeeCard},
		{path: "/employee-edit:id", component:EmployeeCard},
		{path: "/orgunit-list", component:OrgUnitView},
		{path: "/day-off", component:DayOffForm},
		{path: "/day-off:type", component:DayOffForm},
		{path: "/create-schedule", component:EmptyPage},
		{path: "/public/" },
    ];

    return (
        <div className={layoutContainerClassName} onClick={onWrapperClick}>
            <div className="layout-top">
                <AppTopbar topbarUserMenuActive={topbarUserMenuActive} menuActive={menuActive} menuHoverActive={menuHoverActive}
                    onMenuButtonClick={onMenuButtonClick} onTopbarUserMenuButtonClick={onTopbarUserMenuButtonClick}
                    onTopbarUserMenuClick={onTopbarUserMenuClick} model={menu} horizontal={horizontal} onSidebarClick={onSidebarClick}
                    onRootMenuItemClick={onRootMenuItemClick} onMenuItemClick={onMenuItemClick} isMobile={isMobile} />

                <div className="layout-topbar-separator" />

            </div>

            <div className="layout-content">
                {
                    routers.map((router, index) => {
                        if (router.exact) {
                            return <Route key={`router${index}`} path={router.path} exact component={router.component} />
                        }

                        return <Route key={`router${index}`} path={router.path} component={router.component} />
                    })
                }
            </div>

            <AppConfig topbarSize={topbarSize} onTopbarSizeChange={onTopbarSizeChange}
                topbarColor={topbarColor} onTopbarThemeChange={onTopbarThemeChange}
                horizontal={horizontal} onMenuToHorizontalChange={onMenuToHorizontalChange}
                menuColor={menuColor} onMenuThemeChange={onMenuThemeChange}
                themeColor={themeColor} onThemeColorChange={onThemeColorChange}
                layoutColor={layoutColor} onLayoutColorChange={onLayoutColorChange}
                compactMode={compactMode} onCompactModeChange={onCompactModeChange}
                rippleActive={ripple} onRippleChange={onRippleChange}
                inputStyle={inputStyle} onInputStyleChange={onInputStyleChange} />

            {menuActive && <div className="layout-mask" />}
        </div>
    );

}

export default App;
