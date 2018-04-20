import IndividualEncounterService from "../../service/IndividualEncounterService";
import EncounterActionState from "../../state/EncounterActionState";
import ObservationsHolderActions from "../common/ObservationsHolderActions";
import _ from "lodash";
import IndividualService from "../../service/IndividualService";
import FormMappingService from "../../service/FormMappingService";
import RuleEvaluationService from "../../service/RuleEvaluationService";
import {Encounter, Form} from "openchs-models";

export class EncounterActions {
    static getInitialState(context) {
        return {};
    }

    static onEncounterLandingViewLoad(state, action, context) {
        if (!action.encounter.encounterType) return state;

        const individualEncounterService = context.get(IndividualEncounterService);
        var encounter = individualEncounterService.findByUUID(action.encounter.uuid);
        const isNewEncounter = _.isNil(encounter);
        if (isNewEncounter) {
            encounter = action.encounter;
            encounter.individual = context.get(IndividualService).findByUUID(action.individualUUID);
        }

        const form = context.get(FormMappingService)
                            .findFormForEncounterType(encounter.encounterType, Form.formTypes.Encounter);
        let formElementStatuses = context.get(RuleEvaluationService).getFormElementsStatuses(action.encounter, Encounter.schema.name, form.firstFormElementGroup);
        let filteredElements = form.firstFormElementGroup.filterElements(formElementStatuses);
        return EncounterActionState.createOnLoadState(form, encounter, isNewEncounter, filteredElements);
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
        return newState;
    }

    static onToggleShowingPreviousEncounter(state, action, context) {
        const newState = state.clone();
        newState.previousEncountersDisplayed = !newState.previousEncountersDisplayed;
        newState.previousEncounters = context.get(IndividualEncounterService).getEncounters(state.encounter.individual);
        return newState;
    }

    static onSave(state, action, context) {
        const newState = state.clone();
        context.get(IndividualEncounterService).saveOrUpdate(newState.encounter);
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
    DURATION_CHANGE: 'EA.DURATION_CHANGE',
    ON_LOAD: 'EA.ON_LOAD',
    TOGGLE_SHOWING_PREVIOUS_ENCOUNTER: 'EA.TOGGLE_SHOWING_PREVIOUS_ENCOUNTER',
    SAVE: 'EA.SAVE'
};

const individualEncounterViewActionsMap = new Map([
    [individualEncounterViewActions.PREVIOUS, EncounterActions.onPrevious],
    [individualEncounterViewActions.NEXT, EncounterActions.onNext],
    [individualEncounterViewActions.TOGGLE_MULTISELECT_ANSWER, ObservationsHolderActions.toggleMultiSelectAnswer],
    [individualEncounterViewActions.TOGGLE_SINGLESELECT_ANSWER, ObservationsHolderActions.toggleSingleSelectAnswer],
    [individualEncounterViewActions.PRIMITIVE_VALUE_CHANGE, ObservationsHolderActions.onPrimitiveObsUpdateValue],
    [individualEncounterViewActions.PRIMITIVE_VALUE_END_EDITING, ObservationsHolderActions.onPrimitiveObsEndEditing],
    [individualEncounterViewActions.DURATION_CHANGE, ObservationsHolderActions.onDurationChange],
    [individualEncounterViewActions.ON_LOAD, EncounterActions.onEncounterViewLoad],
    [individualEncounterViewActions.ON_ENCOUNTER_LANDING_LOAD, EncounterActions.onEncounterLandingViewLoad],
    [individualEncounterViewActions.ENCOUNTER_DATE_TIME_CHANGE, EncounterActions.onEncounterDateTimeChange],
    [individualEncounterViewActions.TOGGLE_SHOWING_PREVIOUS_ENCOUNTER, EncounterActions.onToggleShowingPreviousEncounter],
    [individualEncounterViewActions.SAVE, EncounterActions.onSave]
]);

export {
    individualEncounterViewActions as IndividualEncounterViewActions,
    individualEncounterViewActionsMap as IndividualEncounterViewActionsMap
};