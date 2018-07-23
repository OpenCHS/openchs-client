import AbstractDataEntryState from "../../state/AbstractDataEntryState";
import Wizard from "../../state/Wizard";
import {AbstractEncounter, ObservationsHolder, ProgramEncounter} from "openchs-models";
import ConceptService from "../../service/ConceptService";
import ProgramConfig from "../../../../openchs-models/src/ProgramConfig";
import _ from 'lodash';

class ProgramEncounterState extends AbstractDataEntryState {
    constructor(formElementGroup, wizard, isNewEntity, programEncounter, filteredFormElements) {
        super([], formElementGroup, wizard, isNewEntity, filteredFormElements);
        this.programEncounter = programEncounter;
    }

    getEntity() {
        return this.programEncounter;
    }

    getEntityType() {
        return ProgramEncounter.schema.name;
    }

    static createOnLoad(programEncounter, form, isNewEntity, formElementGroup, filteredFormElements) {
        const formElementGroupPageNumber = formElementGroup.displayOrder;
        return new ProgramEncounterState(formElementGroup, new Wizard(form.numberOfPages, formElementGroupPageNumber, formElementGroupPageNumber), isNewEntity, programEncounter, filteredFormElements);
    }

    clone() {
        return new ProgramEncounterState(this.formElementGroup, this.wizard.clone(), this.isNewEntity, this.programEncounter.cloneForEdit(), this.filteredFormElements);
    }

    get observationsHolder() {
        return new ObservationsHolder(this.programEncounter.observations);
    }

    validateEntity() {
        return this.programEncounter.validate();
    }

    get staticFormElementIds() {
        return this.wizard.isFirstPage() ? [AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME] : [];
    }

    validateEntityAgainstRule(ruleService) {
        return ruleService.validateAgainstRule(this.programEncounter, this.formElementGroup.form, ProgramEncounter.schema.name);
    }

    executeRule(ruleService, context) {
        let decisions = ruleService.getDecisions(this.programEncounter, ProgramEncounter.schema.name);
        context.get(ConceptService).addDecisions(this.programEncounter.observations, decisions.encounterDecisions);

        const enrolment = this.programEncounter.programEnrolment.cloneForEdit();
        context.get(ConceptService).addDecisions(enrolment.observations, decisions.enrolmentDecisions);
        this.programEncounter.programEnrolment = enrolment;

        return decisions;
    }

    getNextScheduledVisits(ruleService, context) {
        const programConfig = {
            ...ruleService
                .findByKey("program.uuid", this.programEncounter.programEnrolment.program.uuid, ProgramConfig.schema.name)
        };
        return ruleService.getNextScheduledVisits(this.programEncounter, ProgramEncounter.schema.name, [..._.get(programConfig, "visitSchedule", [])]
            .map(k => Object.assign({}, k)));
    }

    getEffectiveDataEntryDate() {
        return this.programEncounter.encounterDateTime;
    }
}

export default ProgramEncounterState;