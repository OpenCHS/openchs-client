import AbstractFormElement from "./AbstractFormElement";
import React from "react";
import PropTypes from "prop-types";
import {View} from "react-native";
import RadioGroup, {RadioLabelValue} from "../../primitives/RadioGroup";
import Distances from "../../primitives/Distances";
import _ from "lodash";
import IndividualService from "../../../service/IndividualService";

class GroupAffiliationFormElement extends AbstractFormElement {

    static propTypes = {
        element: PropTypes.object.isRequired,
        actionName: PropTypes.string.isRequired,
        validationResult: PropTypes.object,
        groupSubjectObservation: PropTypes.object,
    };

    static defaultProps = {
        style: {}
    };

    constructor(props, context) {
        super(props, context);
        this.individualService = context.getService(IndividualService);
    }

    componentWillMount() {
        super.componentWillMount();
    }

    onPress(groupSubjectUUID) {
        this.dispatchAction(this.props.actionName, {
            formElement: this.props.element,
            groupSubjectRoleUUID: this.props.element.recordValueByKey('groupSubjectRoleUUID'),
            groupSubjectUUID,
        });
    }

    render() {
        const groupSubjectObservation = this.props.groupSubjectObservation;
        const valueLabelPairs = this.individualService.getAllBySubjectTypeUUID(this.props.element.recordValueByKey('groupSubjectTypeUUID'))
            .map((subject) => new RadioLabelValue(subject.nameString, subject.uuid));
        return (
            <View style={{flexDirection: 'column', paddingBottom: Distances.ScaledVerticalSpacingBetweenOptionItems}}>
                {!_.isEmpty(this.props.actionName) &&
                <RadioGroup
                    multiSelect={false}
                    inPairs={true}
                    onPress={({label, value}) => this.onPress(value)}
                    selectionFn={(groupSubjectUUID) => _.isEmpty(groupSubjectObservation) ? false : groupSubjectObservation.groupSubject.groupSubject.uuid === groupSubjectUUID}
                    labelKey={this.props.element.name}
                    mandatory={this.props.element.mandatory}
                    validationError={this.props.validationResult}
                    labelValuePairs={valueLabelPairs}/>}
            </View>);
    }

}

export default GroupAffiliationFormElement
