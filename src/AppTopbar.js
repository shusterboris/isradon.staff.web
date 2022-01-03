import React from 'react';
import classNames from 'classnames';
import AppMenu from './AppMenu';
import { Ripple } from 'primereact/ripple';
import AppSets from './service/AppSettings'
import { useHistory} from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AppTopbar = (props) => {

	let topbarMenuClassName = classNames('layout-profile-menu fadeInDown ', { 'layout-profile-menu-active': props.topbarUserMenuActive });
	let menuButtonClassName = classNames('layout-menubutton ', { 'layout-menubutton-active': props.menuActive })
	const history = useHistory();
	const [t, i18n] = useTranslation();
	
	const getLangData = () => {
		const lang = i18n.language.toLowerCase();
		return (lang.includes('ru')) ? {"label":"English", "abbr":"gb"} : {"label":"Русский", "abbr":"ru"}
	}

	const getInk = (el) => {
        for (let i = 0; i < el.children.length; i++) {
            if (typeof el.children[i].className === 'string' && el.children[i].className.indexOf('p-ink') !== -1) {
                return el.children[i];
            }
        }
        return null;
	}
	
	const removeClass = (element, className) => {
        if (element.classList)
            element.classList.remove(className);
        else
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

	const onItemClick = (event, itemNo) => {
		const ink = getInk(event.currentTarget);
		if (ink) {
			removeClass(ink, 'p-ink-active');
		}
		processTopbarMenuClick(itemNo);
	}

	const processTopbarMenuClick = (itemNo) =>{
		if (itemNo === 1){
			history.push("/login")
		}else if (itemNo === 2){
			window.sessionStorage.clear();
			AppSets.clearUser();
			history.push("/login")
		}else if (itemNo === 3){
			if (i18n.language.toLowerCase().includes('ru')){
				i18n.changeLanguage('gb')
			}else{
				i18n.changeLanguage('ru')
			}
		}
		
	}

	let langData = getLangData();

	return (
		<div className="layout-topbar">
			<button type="button" className={menuButtonClassName} onClick={props.onMenuButtonClick}>
				<div className="layout-menubutton-icon" />
			</button>

			<div className="layout-topbar-grid">
				<div className="layout-topbar-grid-column ">
					<button type="button" className="layout-logo p-link" onClick={() => { window.location = "/#" }}>
						<img src="/assets/images/isradon-logo-hor.png" alt="logotype"/>
					</button>
				</div>

				<div className="layout-topbar-grid-column">
					<AppMenu model={props.model} horizontal={props.horizontal} menuHoverActive={props.menuHoverActive} isMobile={props.isMobile}
						onMenuItemClick={props.onMenuItemClick} onRootMenuItemClick={props.onRootMenuItemClick} onSidebarClick={props.onSidebarClick} />
				</div>
				<div className="layout-topbar-grid-column layout-topbar-grid-column-fixed">
					{AppSets.getUser() && AppSets.getUser().employeeName}
				</div>

				<div className="layout-topbar-grid-column layout-topbar-grid-column-fixed">
					<button type="button" className="p-link profile-menu-button" onClick={props.onTopbarUserMenuButtonClick}>
						<img src="assets/layout/images/avatar.png" alt="Profile" />
					</button>
					<ul className={topbarMenuClassName} onClick={props.onTopbarUserMenuClick}>
						<li role="menuitem">
							<button type="button" className="p-link p-ripple" onClick={(e)=>onItemClick(e,1)}>
								<i className="pi pi-key"></i>
								<span>{AppSets.getUser() ? t('topbarMenuChangeUser') : t('topbarMenuLogin')}</span>
                                <Ripple />
							</button>
						</li>
						{AppSets.user &&
							<li role="menuitem">
								<button type="button" className="p-link p-ripple" onClick={(e)=>onItemClick(e,2)}>
									<i className="pi pi-times"></i>
									<span>{t('topbarMenuExit')}</span>
									<Ripple />
								</button>
							</li>}
						<li role="menuitem">
							<button type="button" className="p-link p-ripple" onClick={(e)=>onItemClick(e,3)}>
								<img src="assets/images/flag_placeholder.png" alt="выбранный язык в виде флажка"
									className={'flag flag-'+langData.abbr} />
								<span className='p-ml-1'>{langData.label}</span>
								<Ripple />
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

export default AppTopbar;
