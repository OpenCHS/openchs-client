import StubbedMessageService from "../../service/stub/StubbedMessageService";
import StubbedConceptService from "../../service/stub/StubbedConceptService";
import StubbedConfigFileService from "../../service/stub/StubbedConfigFileService";
import StubbedIndividualService from "../../service/stub/StubbedIndividualService";
import StubbedFormMappingService from "../../service/stub/StubbedFormMappingService";
import StubbedProgramEnrolmentService from "../../service/stub/StubbedProgramEnrolmentService";
import _ from 'lodash';
import StubbedRuleEvaluationService from "../../service/stub/StubbedRuleEvaluationService";
import MessageService from "../../../../src/service/MessageService";
import ConceptService from "../../../../src/service/ConceptService";
import ConfigFileService from "../../../../src/service/ConfigFileService";
import IndividualService from "../../../../src/service/IndividualService";
import FormMappingService from "../../../../src/service/FormMappingService";
import ProgramEnrolmentService from "../../../../src/service/ProgramEnrolmentService";
import RuleEvaluationService from "../../../../src/service/RuleEvaluationService";
import IndividualEncounterService from "../../../../src/service/IndividualEncounterService";
import StubbedIndividualEncounterService from "../../service/stub/StubbedIndividualEncounterService";
import EntityService from "../../../../src/service/EntityService";
import StubbedEntityService from "../../service/stub/StubbedEntityService";
import SettingsService from "../../../../src/service/SettingsService";
import StubbedSettingsService from "../../service/stub/StubbedSettingsService";

class TestContext {
    static stubs = new Map([
        [MessageService, (serviceData) => new StubbedMessageService(serviceData)],
        [ConceptService, (serviceData) => new StubbedConceptService(serviceData)],
        [ConfigFileService, (serviceData) => new StubbedConfigFileService(serviceData)],
        [IndividualService, (serviceData) => new StubbedIndividualService(serviceData)],
        [FormMappingService, (serviceData) => new StubbedFormMappingService(serviceData)],
        [ProgramEnrolmentService, (serviceData) => new StubbedProgramEnrolmentService(serviceData)],
        [RuleEvaluationService, (serviceData) => new StubbedRuleEvaluationService(serviceData)],
        [IndividualEncounterService, (serviceData) => new StubbedIndividualEncounterService(serviceData)],
        [EntityService, (serviceData) => new StubbedEntityService(serviceData)],
        [SettingsService, (serviceData) => new StubbedSettingsService(serviceData)]
    ]);

    constructor(serviceData) {
        this.serviceData = serviceData;
    }

    getService(type) {
        const stub = TestContext.stubs.get(type);
        if (_.isNil(stub)) {
            return {
                getDecisions: function () {
                    return [{name: "Treatment", code: "ABC001", value: "The patient should be referred to the hospital immediately as he may having tuberculosis", alert: "ALERT MESSAGE"}]
                }
            };
        }
        return stub(this.serviceData);
    }

    get(type) {
        return this.getBean(type);
    }

    getBean(type) {
        return this.getService(type);
    }

    navigator() {
        return {
            pop: function () {
            }
        }
    }
}

export default TestContext;