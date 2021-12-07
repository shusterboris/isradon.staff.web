import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom'
import classNames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { Ripple } from 'primereact/ripple';

const AppSubmenu = (props) => {

    const [activeIndex, setActiveIndex] = useState(null);

    const onMenuItemClick = (event, item, index) => {
        if (item.disabled) {
            event.preventDefault();
            return;
        }
        //execute command
        if (item.command) {
            item.command({ originalEvent: event, item: item });
            event.preventDefault();
        }
        if (item.items) {
            event.preventDefault();
        }
        if (props.root && props.onRootMenuItemClick) {
            props.onRootMenuItemClick({
                originalEvent: event,
                isSameIndex: index === activeIndex
            });
        }
        if (item.items) {
            setActiveIndex(index === activeIndex ? null : index);
        }

        props.onMenuItemClick({
            originalEvent: event,
            item: item
        });
    };

    const onMenuItemMouseEnter = (index) => {
        if (props.root && props.menuHoverActive && props.horizontal && !props.isMobile()) {
            setActiveIndex(index);
        }
    };

    const visible = (item) => {
        return (typeof item.visible === 'function' ? item.visible() : item.visible !== false);
    };

    const getLink = (item, index) => {
        const menuitemIconClassName = classNames('layout-menuitem-icon', item.icon);
        const content = (
            <>
                <i className={menuitemIconClassName}></i>
                <span className="menuitem-text">{item.label}</span>
                { item.items && <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>}
                { item.badge && <span className="menuitem-badge">{item.badge}</span> }
                <Ripple />
            </>
        );
        const commonLinkProps = {
            'style': item.style,
            'className': classNames(item.class, 'p-ripple', { 'p-disabled': item.disabled, 'p-link': !item.to }),
            'target': item.target,
            'onClick': (e) => onMenuItemClick(e, item, index),
            'onMouseEnter': () => onMenuItemMouseEnter(index)
        }

        if (item.url) {
            return <a href={item.url} rel="noopener noreferrer" {...commonLinkProps} tabIndex={0}>{content}</a>
        }
        else if (!item.to) {
            return <button type="button" {...commonLinkProps}>{content}</button>
        }

        return <NavLink to={item.to} exact activeClassName="router-link-active" {...commonLinkProps}>{content}</NavLink>;
    };

    const isMenuActive = (item, i) => {
        return item.items && (props.mega ? true : activeIndex === i);
    }

    const getItems = () => {
        const timeout = !props.root || !props.horizontal || props.isMobile() ? { enter: 1000, exit: 450 } : 0;
        return props.items.map((item, i) => {
            if (visible(item)) {
                if (!item.separator) {
                    const menuitemClassName = classNames({ 'active-menuitem': activeIndex === i && !item.disabled });
                    const submenuContainerClassName = classNames('layout-submenu-container', { 'layout-submenu-megamenu-container': item.mega });
                    const submenuClassName = classNames('layout-submenu', { 'layout-megamenu':item.mega });
                    const link = getLink(item, i);
                    const megaMenuItem = !props.root && props.mega && (
                        <span className="layout-megamenu-submenu-text">{item.label}</span>
                    );

                    return (
                        <li key={item.label || i} className={menuitemClassName} role="menuitem">
                            {link}
                            {megaMenuItem}
                            <CSSTransition classNames="layout-submenu-container" timeout={timeout} in={isMenuActive(item, i)} unmountOnExit>
                                <div className={submenuContainerClassName} style={{'padding': activeIndex === i ? '' : '0'}}>
                                    <AppSubmenu items={visible(item) && item.items} className={submenuClassName} menuHoverActive={props.menuHoverActive}
                                        horizontal={props.horizontal} mega={item.mega} onMenuItemClick={props.onMenuItemClick} isMobile={props.isMobile}></AppSubmenu>
                                </div>
                            </CSSTransition>
                        </li>
                    )
                }
                else {
                    return <li className="p-menu-separator" style={item.style} key={`separator${i}`} role="separator"></li>;
                }
            }

            return null;
        })
    };

    useEffect(() => {
        if (!props.menuHoverActive && props.horizontal && !props.isMobile()) {
            setActiveIndex(null);
        }
    }, [props]);

    if (!props.items) {
        return null;
    }

    const items = getItems();
    return (
        <ul className={props.className} role="menu">
            {items}
        </ul>
    );
}

export const AppMenu = (props) => {

    return (
        <div id="mainMenu" className="layout-menu-container" onClick={props.onSidebarClick}>
            <div className="layout-menu-wrapper">
                <AppSubmenu items={props.model} className="layout-menu" mega={false} root={true}
                    isMobile={props.isMobile} menuHoverActive={props.menuHoverActive} onRootMenuItemClick={props.onRootMenuItemClick}
                    onMenuItemClick={props.onMenuItemClick} horizontal={props.horizontal} />
            </div>
        </div>
    )
}

export default AppMenu;
