import EntityService from "../../service/EntityService";
import ProgramEnrolment from '../../models/ProgramEnrolment';
import Individual from '../../models/Individual';
import _ from 'lodash';
import EntityTypeChoiceState from "../common/EntityTypeChoiceState";
import ProgramEncounter from '../../models/ProgramEncounter';

class ProgramEnrolmentDashboardActions {
    static setEncounterType(encounterType) {
        this.entity.encounterType = encounterType;
    }

    static cloneEntity(programEncounter) {
        if (!_.isNil(programEncounter))
            return programEncounter.cloneForEdit();
    }

    static getInitialState() {
        return {encounterTypeState: new EntityTypeChoiceState(null, ProgramEnrolmentDashboardActions.setEncounterType, ProgramEnrolmentDashboardActions.cloneEntity)};
    }

    static onLoad(state, action, context) {
        const newState = {encounterTypeState: state.encounterTypeState.clone()};
        const entityService = context.get(EntityService);
        if (_.isNil(action.enrolmentUUID)) {
            const individual = entityService.findByUUID(action.individualUUID, Individual.schema.name);
            newState.enrolment = individual.firstActiveOrRecentEnrolment;
        } else {
            newState.enrolment = entityService.findByUUID(action.enrolmentUUID, ProgramEnrolment.schema.name);
        }

        const encounter = ProgramEncounter.createSafeInstance();
        encounter.individual = action.value;
        newState.encounterTypeState.entityParentSelected(context.get(IndividualService).eligiblePrograms(action.value.uuid), encounter);
        return newState;
    }

    static onEditEnrolment(state, action, context) {
        const enrolment = context.get(EntityService).findByUUID(action.enrolmentUUID, ProgramEnrolment.schema.name);
        action.cb(enrolment);
        return state;
    }

    static onProgramChange(state, action, context) {
        if (action.program.uuid === state.enrolment.program.uuid) return state;

        const newState = {encounterTypeState: state.encounterTypeState.clone()};
        const entityService = context.get(EntityService);
        newState.enrolment = state.enrolment.individual.findEnrolmentForProgram(action.program);
        return newState;
    }
}

const ProgramEnrolmentDashboardActionsNames = {
    ON_LOAD: 'PEDA.ON_LOAD',
    ON_EDIT_ENROLMENT: 'PEDA.ON_EDIT_ENROLMENT',
    ON_PROGRAM_CHANGE: 'PEDA.ON_PROGRAM_CHANGE',
    LAUNCH_CHOOSE_ENTITY_TYPE: "PEDA.LAUNCH_CHOOSE_ENTITY_TYPE",
    ENTITY_TYPE_SELECTED: "PEDA.ENTITY_TYPE_SELECTED",
    CANCELLED_ENTITY_TYPE_SELECTION: "PEDA.CANCELLED_ENTITY_TYPE_SELECTION",
    ENTITY_TYPE_SELECTION_CONFIRMED: "PEDA.ENTITY_TYPE_SELECTION_CONFIRMED",
};

const ProgramEnrolmentDashboardActionsMap = new Map([
    [ProgramEnrolmentDashboardActionsNames.ON_LOAD, ProgramEnrolmentDashboardActions.onLoad],
    [ProgramEnrolmentDashboardActionsNames.ON_EDIT_ENROLMENT, ProgramEnrolmentDashboardActions.onEditEnrolment],
    [ProgramEnrolmentDashboardActionsNames.ON_PROGRAM_CHANGE, ProgramEnrolmentDashboardActions.onProgramChange],
    [ProgramEnrolmentDashboardActionsNames.LAUNCH_CHOOSE_ENTITY_TYPE, ProgramEnrolmentDashboardActions.launchChooseEncounterType],
    [ProgramEnrolmentDashboardActionsNames.ENTITY_TYPE_SELECTED, ProgramEnrolmentDashboardActions.onEncounterTypeSelected],
    [ProgramEnrolmentDashboardActionsNames.CANCELLED_ENTITY_TYPE_SELECTION, ProgramEnrolmentDashboardActions.onCancelledEncounterTypeSelection],
    [ProgramEnrolmentDashboardActionsNames.ENTITY_TYPE_SELECTION_CONFIRMED, ProgramEnrolmentDashboardActions.onEncounterTypeConfirmed],
]);

export {
    ProgramEnrolmentDashboardActionsNames,
    ProgramEnrolmentDashboardActionsMap,
    ProgramEnrolmentDashboardActions
};