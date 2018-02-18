import {Dimensions} from "react-native";
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import PathRegistry from './framework/routing/PathRegistry';
import BeanRegistry from './framework/bean/BeanRegistry';
import Realm from 'realm';
import {Schema, EntityMetaData} from "openchs-models";
import './views';
import AppStore from './store/AppStore';
import EntitySyncStatusService from "./service/EntitySyncStatusService";
import ErrorHandler from './utility/ErrorHandler';

let routes, beans, reduxStore, db = undefined;

export default class App extends Component {
    constructor(props, context) {
        super(props, context);
        ErrorHandler.set();
        if (db === undefined) {
            db = new Realm(Schema);
            beans = BeanRegistry.init(db, this);
            reduxStore = AppStore.create(beans);
            routes = PathRegistry.routes();
            const entitySyncStatusService = beans.get(EntitySyncStatusService);
            entitySyncStatusService.setup(EntityMetaData.model());
        }
        this.getBean = this.getBean.bind(this);
    }

    static childContextTypes = {
        getService: PropTypes.func.isRequired,
        getDB: PropTypes.func.isRequired,
        getStore: PropTypes.func.isRequired
    };

    getChildContext = () => ({
        getDB: () => db,
        getService: (serviceName) => {
            return beans.get(serviceName)
        },
        getStore: () => reduxStore
    });

    getBean(name) {
        return beans.get(name);
    }

    render() {
        return routes;
    }
}