import _ from 'lodash';
import {Concept, Encounter} from 'openchs-models';
import General from "../../utility/General";

//on encounter
let getCodedAnswer = function (observation) {
    return Encounter.prototype.dynamicDataResolver.getConceptByUUID(observation.getValueWrapper().getConceptUUID()).name;
};

const getObservationValue = function (conceptName) {
    const observation = this.findObservation(conceptName);

    if (_.isNil(observation)) {
        General.logWarn('AdditionalFunctions', `No observation found for concept: ${conceptName}`);
        return undefined;
    }

    switch (observation.concept.datatype) {
        case Concept.dataType.Coded: {
            return _.isArray(observation.getValue()) ? getCodedAnswers(observation) : getCodedAnswer(observation);
        }
        default:
            return observation.getValue();
    }
};

const _getObservationValue = function (observation) {
    if (_.isNil(observation)) {
        return undefined;
    }

    switch (observation.concept.datatype) {
        case Concept.dataType.Coded: {
            return _.isArray(observation.getValue()) ? getCodedAnswers(observation) : getCodedAnswer(observation);
        }
        default:
            return observation.getValue();
    }
};

const getObservationValueFromEntireEnrolment = function (conceptName, currentEncounter) {
    const observation = this.findObservationInEntireEnrolment(conceptName, currentEncounter);
    return _getObservationValue(observation, conceptName);
};

const observationExistsInEntireEnrolment = function (conceptName, currentEncounter) {
    return !_.isNil(this.findObservationInEntireEnrolment(conceptName, currentEncounter));
};

const observationExists = function (conceptName) {
    return _.some(this.observations, (observation) => observation.concept.name === conceptName);
};

const getCodedAnswers = function (observation) {
    return observation.getValue().map((conceptUUID) => {
        const concept = Encounter.prototype.dynamicDataResolver.getConceptByUUID(conceptUUID);
        if (_.isNil(concept))
            General.logWarn('AdditionalFunctions', `No concept found for UUID: ${conceptUUID}`);
        return concept.name;
    });
};
//end on encounter

export {
    getObservationValue as getObservationValue,
    observationExists as observationExists,
    getCodedAnswers as getCodedAnswers,
    getObservationValueFromEntireEnrolment as getObservationValueFromEntireEnrolment,
    observationExistsInEntireEnrolment as observationExistsInEntireEnrolment
};
