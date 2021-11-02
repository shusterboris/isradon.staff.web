import React, { Component } from 'react';

export default class EmptyPage extends Component {
    state = {};
    constructor(props) {
        super(props);
    }

    render() {
        return <div className="p-grid">
            <div className="p-col-12">
                <div className="card">
                    <div className="card-title">Empty Page</div>
                    <p>Начинаем отсюда</p>
                </div>
            </div>
    </div>
    }
}