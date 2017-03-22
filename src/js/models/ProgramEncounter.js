import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";
import EncounterType from "./EncounterType";
import ProgramEnrolment from './ProgramEnrolment';

class ProgramEncounter {
    static schema = {
        name: 'ProgramEncounter',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            encounterType: 'EncounterType',
            scheduledDateTime: {type: 'date', optional: true},
            actualDateTime: {type: 'date', optional: true},
            programEnrolment: 'ProgramEnrolment',
            observations: {type: 'list', objectType: 'Observation'}
        }
    };

    static fromResource(resource, entityService) {
        const encounterType = entityService.findByKey("uuid", ResourceUtil.getUUIDFor(resource, "encounterTypeUUID"), EncounterType.schema.name);
        const programEnrolment = entityService.findByKey("uuid", ResourceUtil.getUUIDFor(resource, "programEnrolmentUUID"), ProgramEnrolment.schema.name);

        const programEncounter = General.assignFields(resource, new ProgramEncounter(), ["uuid"], ["scheduledDateTime", "actualDateTime"], ["observations"], entityService);
        programEncounter.encounterType = encounterType;
        programEncounter.programEnrolment = programEnrolment;

        return programEncounter;
    }

    static createSafeInstance() {
        const programEncounter = new ProgramEncounter();
        programEncounter.uuid = General.randomUUID();
        programEncounter.observations = [];
        return programEncounter;
    }
}

export default ProgramEncounter;