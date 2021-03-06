import EncounterService from "../../service/EncounterService";
import EncounterActionState from "../../state/EncounterActionState";
import ObservationsHolderActions from "../common/ObservationsHolderActions";
import FormMappingService from "../../service/FormMappingService";
import RuleEvaluationService from "../../service/RuleEvaluationService";
import {Encounter, Form, Point, WorkItem, WorkList, WorkLists} from 'avni-models';
import GeolocationActions from "../common/GeolocationActions";
import General from "../../utility/General";
import EntityService from "../../service/EntityService";
import PhoneNumberVerificationActions from "../common/PhoneNumberVerificationActions";

export class EncounterActions {
    static getInitialState(context) {
        return {};
    }

    static filterFormElements(formElementGroup, context, encounter) {
        let formElementStatuses = context.get(RuleEvaluationService).getFormElementsStatuses(encounter, Encounter.schema.name, formElementGroup);
        return formElementGroup.filterElements(formElementStatuses);
    };

    static onEncounterLandingViewLoad(state, action, context) {
        const formMapping = context.get(FormMappingService).getIndividualEncounterFormMapping(action.encounter.encounterType, action.encounter.individual.subjectType);

        const form = formMapping && formMapping.form;

        const firstGroupWithAtLeastOneVisibleElement = _.find(_.sortBy(form.nonVoidedFormElementGroups(), [function (o) {
            return o.displayOrder
        }]), (formElementGroup) => EncounterActions.filterFormElements(formElementGroup, context, action.encounter).length !== 0);

        const isNewEntity = _.isNil(context.get(EntityService).findByUUID(action.encounter.uuid, Encounter.schema.name));
        const workLists = action.workLists || new WorkLists(new WorkList('Encounter', [new WorkItem(
            General.randomUUID(), WorkItem.type.ENCOUNTER, {
                encounterType: action.encounter.encounterType.name,
                subjectUUID: action.encounter.individual.uuid
            }
        )]));

        if (_.isNil(firstGroupWithAtLeastOneVisibleElement)) {
            return EncounterActionState.createOnLoadStateForEmptyForm(action.encounter, form, isNewEntity, workLists)
        }

        const formElementStatuses = context.get(RuleEvaluationService).getFormElementsStatuses(action.encounter, Encounter.schema.name, firstGroupWithAtLeastOneVisibleElement);
        const filteredElements = firstGroupWithAtLeastOneVisibleElement.filterElements(formElementStatuses);
        return EncounterActionState.createOnLoadState(action.encounter, form, isNewEntity, firstGroupWithAtLeastOneVisibleElement, filteredElements, formElementStatuses, workLists);
    }

    static onNext(state, action, context) {
        const newState = state.clone();
        newState.handleNext(action, context);
        return newState;
    }

    static onPrevious(state, action, context) {
        return state.clone().handlePrevious(action, context);
    }

    static onEncounterViewLoad(state, action, context) {
        return state.clone();
    }

    static onEncounterDateTimeChange(state, action, context) {
        const newState = state.clone();
        newState.encounter.encounterDateTime = action.value;
        newState.handleValidationResults(newState.encounter.validate(), context);
        return newState;
    }

    static setEncounterLocation(state, action, context) {
        const newState = state.clone();
        const position = action.value;
        newState.encounter.encounterLocation = Point.newInstance(position.coords.latitude, position.coords.longitude);
        newState.handleValidationResult(
            state.validateLocation(
                newState.encounter.encounterLocation,
                Encounter.validationKeys.ENCOUNTER_LOCATION,
                context
            )
        );
        return newState;
    }

    static onToggleShowingPreviousEncounter(state, action, context) {
        const newState = state.clone();
        newState.previousEncountersDisplayed = !newState.previousEncountersDisplayed;
        newState.previousEncounters = context.get(EncounterService).getEncounters(state.encounter.individual);
        return newState;
    }

    static onSave(state, action, context) {
        const newState = state.clone();
        context.get(EncounterService).saveOrUpdate(newState.encounter, action.nextScheduledVisits, action.skipCreatingPendingStatus);
        action.cb();
        return state;
    }
}

const individualEncounterViewActions = {
    ON_ENCOUNTER_LANDING_LOAD: 'EA.ON_ENCOUNTER_LANDING_LOAD',
    ENCOUNTER_DATE_TIME_CHANGE: 'EA.',
    PREVIOUS: 'EA.PREVIOUS',
    NEXT: 'EA.NEXT',
    TOGGLE_MULTISELECT_ANSWER: "EA.TOGGLE_MULTISELECT_ANSWER",
    TOGGLE_SINGLESELECT_ANSWER: "EA.TOGGLE_SINGLESELECT_ANSWER",
    PRIMITIVE_VALUE_CHANGE: 'EA.PRIMITIVE_VALUE_CHANGE',
    PRIMITIVE_VALUE_END_EDITING: 'EA.PRIMITIVE_VALUE_END_EDITING',
    DATE_DURATION_CHANGE: 'EA.DATE_DURATION_CHANGE',
    DURATION_CHANGE: 'EA.DURATION_CHANGE',
    ON_LOAD: 'EA.ON_LOAD',
    TOGGLE_SHOWING_PREVIOUS_ENCOUNTER: 'EA.TOGGLE_SHOWING_PREVIOUS_ENCOUNTER',
    SAVE: 'EA.SAVE',
    SET_ENCOUNTER_LOCATION: "EA.SET_ENCOUNTER_LOCATION",
    SET_LOCATION_ERROR: "EA.SET_LOCATION_ERROR",
    PHONE_NUMBER_CHANGE: "EA.PHONE_NUMBER_CHANGE",
    ON_SUCCESS_OTP_VERIFICATION: "EA.ON_SUCCESS_OTP_VERIFICATION",
    ON_SKIP_VERIFICATION: "EA.ON_SKIP_VERIFICATION",
};

const individualEncounterViewActionsMap = new Map([
    [individualEncounterViewActions.PREVIOUS, EncounterActions.onPrevious],
    [individualEncounterViewActions.NEXT, EncounterActions.onNext],
    [individualEncounterViewActions.TOGGLE_MULTISELECT_ANSWER, ObservationsHolderActions.toggleMultiSelectAnswer],
    [individualEncounterViewActions.TOGGLE_SINGLESELECT_ANSWER, ObservationsHolderActions.toggleSingleSelectAnswer],
    [individualEncounterViewActions.PRIMITIVE_VALUE_CHANGE, ObservationsHolderActions.onPrimitiveObsUpdateValue],
    [individualEncounterViewActions.PRIMITIVE_VALUE_END_EDITING, ObservationsHolderActions.onPrimitiveObsEndEditing],
    [individualEncounterViewActions.DATE_DURATION_CHANGE, ObservationsHolderActions.onDateDurationChange],
    [individualEncounterViewActions.DURATION_CHANGE, ObservationsHolderActions.onDurationChange],
    [individualEncounterViewActions.ON_LOAD, EncounterActions.onEncounterViewLoad],
    [individualEncounterViewActions.ON_ENCOUNTER_LANDING_LOAD, EncounterActions.onEncounterLandingViewLoad],
    [individualEncounterViewActions.ENCOUNTER_DATE_TIME_CHANGE, EncounterActions.onEncounterDateTimeChange],
    [individualEncounterViewActions.TOGGLE_SHOWING_PREVIOUS_ENCOUNTER, EncounterActions.onToggleShowingPreviousEncounter],
    [individualEncounterViewActions.SAVE, EncounterActions.onSave],
    [individualEncounterViewActions.SET_ENCOUNTER_LOCATION, EncounterActions.setEncounterLocation],
    [individualEncounterViewActions.SET_LOCATION_ERROR, GeolocationActions.setLocationError],
    [individualEncounterViewActions.PHONE_NUMBER_CHANGE, ObservationsHolderActions.onPhoneNumberChange],
    [individualEncounterViewActions.ON_SUCCESS_OTP_VERIFICATION, PhoneNumberVerificationActions.onSuccessVerification],
    [individualEncounterViewActions.ON_SKIP_VERIFICATION, PhoneNumberVerificationActions.onSkipVerification],
]);

export {
    individualEncounterViewActions as IndividualEncounterViewActions,
    individualEncounterViewActionsMap as IndividualEncounterViewActionsMap
};
