import _ from "lodash";
import AbstractDataEntryState from "./AbstractDataEntryState";
import {AbstractEncounter, ObservationsHolder, Encounter, StaticFormElementGroup} from 'avni-models';
import Wizard from "./Wizard";
import ConceptService from "../service/ConceptService";
import IndividualService from "../service/IndividualService";
import EntityService from "../service/EntityService";

class EncounterActionState extends AbstractDataEntryState {
    constructor(validationResults, formElementGroup, wizard, isNewEntity, encounter, filteredFormElements, workLists, messageDisplayed) {
        super(validationResults, formElementGroup, wizard, isNewEntity, filteredFormElements, workLists);
        this.encounter = encounter;
        this.previousEncountersDisplayed = false;
        this.messageDisplayed = messageDisplayed;
    }

    getEntity() {
        return this.encounter;
    }

    getEntityType() {
        return Encounter.schema.name;
    }

    clone() {
        const newState = new EncounterActionState();
        newState.encounter = _.isNil(this.encounter) ? this.encounter : this.encounter.cloneForEdit();
        newState.previousEncountersDisplayed = this.previousEncountersDisplayed;
        newState.messageDisplayed = this.messageDisplayed;
        if(newState.previousEncountersDisplayed){
            newState.previousEncounters = this.previousEncounters;
        }
        super.clone(newState);
        return newState;
    }

    getWorkContext() {
        return {
            subjectUUID: this.encounter.individual.uuid,
        };
    }

    get observationsHolder() {
        return new ObservationsHolder(this.encounter.observations);
    }

    get staticFormElementIds() {
        return this.wizard.isFirstPage() ? [AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME] : [];
    }

    static createOnLoadState(encounter, form, isNewEntity, formElementGroup, filteredFormElements, formElementStatuses, workLists, messageDisplayed) {
        let indexOfGroup = _.findIndex(form.getFormElementGroups(), (feg) => feg.uuid === formElementGroup.uuid) + 1;
        let state = new EncounterActionState([], formElementGroup, new Wizard(form.numberOfPages, indexOfGroup, indexOfGroup), isNewEntity, encounter, filteredFormElements, workLists, messageDisplayed);
        state.observationsHolder.updatePrimitiveCodedObs(filteredFormElements, formElementStatuses);
        return state;
    }

    static createOnLoadStateForEmptyForm(encounter, form, isNewEntity, workLists, messageDisplayed) {
        let state = new EncounterActionState([], new StaticFormElementGroup(form), new Wizard(1), isNewEntity, encounter, [], workLists, messageDisplayed);
        return state;
    }

    validateEntityAgainstRule(ruleService) {
        return ruleService.validateAgainstRule(this.encounter, this.formElementGroup.form, 'Encounter');
    }

    executeRule(ruleService, context) {
        let decisions = ruleService.getDecisions(this.encounter, 'Encounter');
        context.get(ConceptService).addDecisions(this.encounter.observations, decisions.encounterDecisions);

        return decisions;
    }

    validateEntity(context) {
        const validationResults = this.encounter.validate();
        const locationValidation = this.validateLocation(
            this.encounter.encounterLocation,
            Encounter.validationKeys.ENCOUNTER_LOCATION,
            context
        );
        validationResults.push(locationValidation);
        return validationResults;
    }

    getEffectiveDataEntryDate() {
        return this.encounter.encounterDateTime;
    }

    getNextScheduledVisits(ruleService, context) {
        const nextScheduledVisits = ruleService.getNextScheduledVisits(this.encounter, Encounter.schema.name, []);
        return context.get(IndividualService).validateAndInjectOtherSubjectForScheduledVisit(this.encounter.individual, nextScheduledVisits);
    }

    getEntityResultSetByType(context) {
        const {individual, encounterType} = this.encounter;
        return context.get(EntityService).getAllNonVoided(Encounter.schema.name)
            .filtered('individual.subjectType.uuid = $0 and encounterType.uuid = $1', individual.subjectType.uuid, encounterType.uuid);
    }
}

export default EncounterActionState;
