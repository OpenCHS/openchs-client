import Individual from "./Individual";
import ResourceUtil from "./utility/ResourceUtil";
import AbstractEncounter from "./AbstractEncounter";
import _ from "lodash";
import ValidationResult from "./application/ValidationResult";
import G from "./utility/General";
import moment from "moment";

class Encounter extends AbstractEncounter {
    static schema = {
        name: 'Encounter',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            encounterType: 'EncounterType',
            encounterDateTime: 'date',
            individual: 'Individual',
            observations: {type: 'list', objectType: 'Observation'}
        }
    };

    static create() {
        let encounter = new Encounter();
        encounter.observations = [];
        encounter.uuid = G.randomUUID();
        encounter.encounterDateTime = new Date();
        return encounter;
    }

    static fromResource(resource, entityService) {
        const encounter = AbstractEncounter.fromResource(resource, entityService, new Encounter());

        encounter.individual = entityService.findByKey("uuid", ResourceUtil.getUUIDFor(resource, "individualUUID"), Individual.schema.name);
        return encounter;
    }

    get toResource() {
        const resource = super.toResource;
        resource.encounterDateTime = moment(this.encounterDateTime).format();
        resource["individualUUID"] = this.individual.uuid;
        return resource;
    }

    cloneForEdit() {
        const encounter = super.cloneForEdit(new Encounter());
        encounter.individual = this.individual;
        return encounter;
    }

    validate() {
        const validationResults = super.validate();
        if (!_.isNil(this.encounterDateTime) && G.dateAIsBeforeB(this.encounterDateTime, this.individual.registrationDate))
            validationResults.push(new ValidationResult(false, AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME, 'encounterDateBeforeRegistrationDate'));
    }

    getName() {
        return 'Encounter';
    }
}

export default Encounter;