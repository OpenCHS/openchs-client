import {View} from "react-native";
import React from "react";
import AbstractComponent from "../../framework/view/AbstractComponent";
import Path from "../../framework/routing/Path";
import Reducers from "../../reducer";
import themes from "../primitives/themes";
import AppHeader from "../common/AppHeader";
import {Actions} from "../../action/subject/SubjectRegisterActions";
import FormElementGroup from "../form/FormElementGroup";
import WizardButtons from "../common/WizardButtons";
import {ObservationsHolder, PrimitiveValue, AbstractEncounter, Individual} from "openchs-models";
import CHSNavigator from "../../utility/CHSNavigator";
import StaticFormElement from "../viewmodel/StaticFormElement";
import AbstractDataEntryState from "../../state/AbstractDataEntryState";
import DateFormElement from "../../views/form/formElement/DateFormElement";
import _ from "lodash";
import TypedTransition from "../../framework/routing/TypedTransition";
import General from "../../utility/General";
import Distances from "../primitives/Distances";
import CHSContainer from "../common/CHSContainer";
import CHSContent from "../common/CHSContent";
import TextFormElement from "../form/formElement/TextFormElement";
import AddressLevels from "../common/AddressLevels";

@Path('/SubjectRegisterView')
class SubjectRegisterView extends AbstractComponent {
    static propTypes = {
        params: React.PropTypes.object.isRequired
    };

    viewName() {
        return 'SubjectRegisterView';
    }

    constructor(props, context) {
        super(props, context, Reducers.reducerKeys.subject);
    }

    componentWillMount() {
        this.dispatchAction(Actions.ON_LOAD, {subjectUUID: this.props.params.subjectUUID});
        return super.componentWillMount();
    }

    previous() {
        if (this.state.wizard.isFirstFormPage())
            TypedTransition.from(this).goBack();
        else
            this.dispatchAction(Actions.PREVIOUS);
    }

    next() {
        this.dispatchAction(Actions.NEXT, {
            completed: (state, decisions, ruleValidationErrors) => {
                const observations = state.subject.observations;
                const onSaveCallback = (source) => {
                    CHSNavigator.navigateToProgramEnrolmentDashboardView(source, state.subject.uuid, null, true);
                };
                const headerMessage = `${this.I18n.t('registration', {subjectName:state.subject.subjectType.name})} - ${this.I18n.t('summaryAndRecommendations')}`;
                CHSNavigator.navigateToSystemsRecommendationView(this, decisions, ruleValidationErrors, state.subject, observations, Actions.SAVE, onSaveCallback, headerMessage);
            },
            movedNext: this.scrollToTop
        });
    }


    shouldComponentUpdate(nextProps, nextState) {
        return !_.isNil(nextState.subject);
    }

    render() {
        General.logDebug(this.viewName(), 'render');
        return (
            <CHSContainer theme={themes}>
                <CHSContent ref="scroll">
                    <AppHeader title={this.I18n.t('registration', {subjectName:this.state.subject.subjectType.name})}
                               func={() => this.previous()}/>
                    <View style={{flexDirection: 'column', paddingHorizontal: Distances.ScaledContentDistanceFromEdge}}>
                        {this.state.wizard.isFirstFormPage() && (
                                <View>
                                    <DateFormElement actionName={Actions.REGISTRATION_ENTER_REGISTRATION_DATE}
                                                     element={new StaticFormElement('registrationDate')}
                                                     dateValue={new PrimitiveValue(this.state.subject.registrationDate)}
                                                     validationResult={AbstractDataEntryState.getValidationError(this.state, AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME)}/>
                                    <TextFormElement actionName={Actions.REGISTRATION_ENTER_NAME}
                                                     element={new StaticFormElement('Name', true)}
                                                     validationResult={AbstractDataEntryState.getValidationError(this.state, Individual.validationKeys.FIRST_NAME)}
                                                     value={new PrimitiveValue(this.state.subject.firstName)}
                                                     style={{marginTop: Distances.VerticalSpacingBetweenFormElements}}
                                                     multiline={false}
                                    />
                                    <AddressLevels
                                        selectedLowestLevel={this.state.subject.lowestAddressLevel}
                                        multiSelect={false}
                                        validationError={AbstractDataEntryState.getValidationError(this.state, Individual.validationKeys.LOWEST_ADDRESS_LEVEL)}
                                        mandatory={true}
                                        onLowestLevel={(lowestSelectedAddresses) =>
                                        {
                                            this.dispatchAction(Actions.REGISTRATION_ENTER_ADDRESS_LEVEL, {value: _.head(lowestSelectedAddresses)})}
                                        }

                                    />

                                </View>
                            )
                        }
                        <FormElementGroup
                            observationHolder={new ObservationsHolder(this.state.subject.observations)}
                            group={this.state.formElementGroup}
                            actions={Actions}
                            validationResults={this.state.validationResults}
                            filteredFormElements={this.state.filteredFormElements}
                            formElementsUserState={this.state.formElementsUserState}
                            dataEntryDate={this.state.subject.registrationDate}
                        />
                        <WizardButtons previous={{
                            func: () => this.previous(),
                            visible: !this.state.wizard.isFirstPage(),
                            label: this.I18n.t('previous')
                        }} next={{
                            func: () => this.next(), label: this.I18n.t('next')
                        }}/>
                    </View>
                </CHSContent>
            </CHSContainer>
        );
    }
}

export default SubjectRegisterView;