import BaseService from "../BaseService";
import Service from "../../framework/bean/Service";
import {IndividualRelationGenderMapping} from 'avni-models';

@Service("individualRelationGenderMappingService")
class IndividualRelationGenderMappingService extends BaseService {
    constructor(db, context) {
        super(db, context);
    }

    getSchema() {
        return IndividualRelationGenderMapping.schema.name;
    }

    getRelationsForGender(gender) {
        const individualRelationGenderMappings = this.findAllByCriteria(`voided = false AND gender.uuid="${gender.uuid}"`);
        return individualRelationGenderMappings.map((individualRelationGenderMapping) => {return individualRelationGenderMapping.relation})
    }

    getGenderForRelation(relation) {
        return this.findAllByCriteria(`voided = false and relation.uuid = '${relation.uuid}'`);
    }

}

export default IndividualRelationGenderMappingService;
