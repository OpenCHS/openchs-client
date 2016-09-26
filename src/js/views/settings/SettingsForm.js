import {StyleSheet, View, Alert} from 'react-native';
import React, {Component} from 'react';
import SettingsFormField from './SettingsFormField';
import SettingsMultipleChoiceField from './SettingsMultipleChoiceField';
import SettingsView from './SettingsView';
import SettingsButton from './SettingsButton';
import AbstractComponent from "../../framework/view/AbstractComponent";
import Actions from "../../action/index";
import DecisionSupportSessionService from "../../service/DecisionSupportSessionService";
import MessageService from "../../service/MessageService";


class SettingsForm extends AbstractComponent {
    constructor(props, context) {
        super(props, context);
        this.state = {syncing: false, error: false};
        this._triggerSync = this._triggerSync.bind(this);
        this.I18n = context.getService(MessageService).getI18n();
    }

    _triggerSync() {
        this.setState({syncing: true});
        this.dispatchAction(Actions.GET_CONFIG, {
            cb: ()=> this.setState({syncing: false}),
            errorHandler: (message)=> {
                this.setState({error: true, errorMessage: `${message}`, syncing: false})
            }
        });
    }

    onDeleteSessionsPress = () => {
        const service = this.context.getService(DecisionSupportSessionService);
        Alert.alert(
            this.I18n.t('deleteConfirmation'),
            this.I18n.t("numberOfSessions", {count: service.getNumberOfSessions()}),
            [
                {
                    text: this.I18n.t('yes'), onPress: () => {
                    service.deleteAll()
                }
                },
                {
                    text: this.I18n.t('no'), onPress: () => {
                }, style: 'cancel'
                }
            ]
        )
    };

    static propTypes = {
        onServerURLChanged: React.PropTypes.func.isRequired,
        settings: React.PropTypes.object.isRequired,
        getService: React.PropTypes.func.isRequired,
    };

    render() {
        return (
            <View style={SettingsView.styles.form}>
                {this.showError("syncError")}
                <SettingsFormField
                    onChangeText={this.props.onServerURLChanged}
                    defaultValue={this.props.settings.serverURL}
                />
                <SettingsMultipleChoiceField
                    onChangeSelection={this.props.onLocaleChanged}
                    selectedValue={this.props.settings.locale.selectedLocale}
                    availableValues={this.props.settings.locale.availableValues}
                />
                <View style={{flex: 1, flexDirection: 'row', justifyContent: "space-around"}}>
                <SettingsButton onPress={this._triggerSync} buttonText={"syncConfig"} loading={this.state.syncing}/>
                <SettingsButton onPress={this.onDeleteSessionsPress} buttonText={"deleteSessions"} loading={false}/>
                </View>
            </View>
        );
    }
}

export default SettingsForm;