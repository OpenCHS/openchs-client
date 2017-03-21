import {View, StyleSheet, Alert, Navigator} from "react-native";
import React, {Component} from "react";
import AbstractComponent from "../../framework/view/AbstractComponent";
import Path from "../../framework/routing/Path";
import ReducerKeys from "../../reducer";
import themes from "../primitives/themes";
import {Actions} from "../../action/individual/IndividualRegisterActions";
import IndividualRegisterView from "./IndividualRegisterView";
import TypedTransition from "../../framework/routing/TypedTransition";
import {Content, Container} from "native-base";
import AppHeader from '../common/AppHeader';
import FormElementGroup from "../form/FormElementGroup";
import WizardButtons from "../common/WizardButtons";
import IndividualRegisterViewsMixin from './IndividualRegisterViewsMixin';
import ObservationsHolder from "../../models/ObservationsHolder";

@Path('/IndividualRegisterFormView')
class IndividualRegisterFormView extends AbstractComponent {
    static propTypes = {};

    viewName() {
        return "IndividualRegisterFormView";
    }

    constructor(props, context) {
        super(props, context, ReducerKeys.individualRegister);
    }

    previous() {
        this.dispatchAction(Actions.PREVIOUS, {
            cb: (newState) => {
                if (newState.wizard.isFirstPage())
                    TypedTransition.from(this).goBack();
            }
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !nextState.wizard.isNonFormPage()
    }

    render() {
        return (
            <Container theme={themes}>
                <Content>
                    <AppHeader title={this.I18n.t('registration')}/>
                    <View style={{flexDirection: 'column'}}>
                        <FormElementGroup observationHolder={new ObservationsHolder(this.state.individual.observations)} group={this.state.formElementGroup}
                                          actions={Actions} validationResults={this.state.validationResults}/>
                        <WizardButtons previous={{func: () => this.previous(), visible: true}}
                                       next={{
                                           func: () => IndividualRegisterViewsMixin.next(this),
                                           label: this.I18n.t(this.state.wizard.isLastPage() ? 'register' : 'next')
                                       }} nextDisabled={this.state.validationResults.length !== 0}/>
                    </View>
                </Content>
            </Container>
        );
    }
}

export default IndividualRegisterFormView;