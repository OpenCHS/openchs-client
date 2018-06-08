import Settings from "./Settings";
import LocaleMapping from "./LocaleMapping";
import Concept, {ConceptAnswer} from "./Concept";
import Individual from "./Individual";
import Family from "./Family";
import AddressLevel from "./AddressLevel";
import UserDefinedIndividualProperty from "./UserDefinedIndividualProperty";
import Gender from "./Gender";
import EntitySyncStatus from "./EntitySyncStatus";
import ProgramEnrolment from "./ProgramEnrolment";
import ProgramEncounter from "./ProgramEncounter";
import Program from "./Program";
import Observation from "./Observation";
import Encounter from "./Encounter";
import EncounterType from "./EncounterType";
import ProgramOutcome from "./ProgramOutcome";
import FormElement from "./application/FormElement";
import FormElementGroup from "./application/FormElementGroup";
import Form from "./application/Form";
import KeyValue from "./application/KeyValue";
import Format from "./application/Format";
import EntityQueue from "./EntityQueue";
import FormMapping from "./application/FormMapping";
import ConfigFile from "./ConfigFile";
import Checklist from "./Checklist";
import ChecklistItem from "./ChecklistItem";
import _ from 'lodash';
import UserInfo from "./UserInfo";
import ProgramConfig from "./ProgramConfig";
import StringKeyNumericValue from "./application/StringKeyNumericValue";
import VisitScheduleInterval from "./VisitScheduleInterval";
import VisitScheduleConfig from "./VisitScheduleConfig";
import IndividualRelation from "./IndividualRelation";
import IndividualRelative from "./IndividualRelative";

export default {
    //order is important, should be arranged according to the dependency
    schema: [LocaleMapping, Settings, ConceptAnswer, Concept, EncounterType, Gender, UserDefinedIndividualProperty, AddressLevel, KeyValue, Form, FormMapping, FormElementGroup, FormElement, Individual, ProgramOutcome, Program, ProgramEnrolment, Observation, ProgramEncounter, Encounter, EntitySyncStatus, EntityQueue, ConfigFile, Checklist, ChecklistItem, Format, UserInfo, StringKeyNumericValue, VisitScheduleInterval, VisitScheduleConfig, ProgramConfig, Family, IndividualRelation, IndividualRelative],
    schemaVersion: 58,
    migration: function (oldDB, newDB) {
        if (oldDB.schemaVersion < 10) {
            var oldObjects = oldDB.objects('DecisionConfig');
            oldObjects.forEach((decisionConfig) => {
                newDB.create(ConfigFile.schema.name, ConfigFile.create(decisionConfig.fileName, decisionConfig.decisionCode), true);
            });
        }
        if (oldDB.schemaVersion < 17) {
            var oldObjects = oldDB.objects('AddressLevel');
            var newObjects = newDB.objects('AddressLevel');

            for (var i = 0; i < oldObjects.length; i++) {
                newObjects[i].name = oldObjects[i].title;
            }
        }
        if (oldDB.schemaVersion < 23) {
            var newObjects = newDB.objects('Individual');
            for (var i = 0; i < newObjects.length; i++) {
                newObjects[i].registrationDate = new Date(2017, 0, 0);
            }
        }
        if (oldDB.schemaVersion < 30) {
            var oldObjects = oldDB.objects('Settings');
            var newObjects = newDB.objects('Settings');
            for (var i = 0; i < newObjects.length; i++) {
                newObjects[i].locale = null;
            }
            const oldLocaleMappings = newDB.objects('LocaleMapping');
            newDB.delete(oldLocaleMappings);
        }
        if (oldDB.schemaVersion < 32) {
            const oldSettings = newDB.objects('Settings');
            newDB.delete(oldSettings);
        }
        if (oldDB.schemaVersion < 33) {
            const checklists = newDB.objects('Checklist');
            _.forEach(checklists, (checklist) => {
                checklist.baseDate = checklist.programEnrolment.individual.dateOfBirth;
            });
        }
        if (oldDB.schemaVersion < 38) {
            const programs = newDB.objects('Program');
            _.forEach(programs, (program) => {
                program.colour = Program.randomColour();
            })
        }
        if (oldDB.schemaVersion < 39) {
            const settings = newDB.objects('Settings');
            _.forEach(settings, (setting) => {
                setting.userId = "";
                setting.password = "";
            })
        }
        if (oldDB.schemaVersion < 40) {
            const settings = newDB.objects('Settings');
            _.forEach(settings, (setting) => {
                setting.authToken = "";
            })
        }
        if (oldDB.schemaVersion < 41) {
            const settings = newDB.objects('Settings');
            _.forEach(settings, (setting) => {
                setting.poolId = "";
                setting.clientId = "";
                setting.organisationName = "";
            })
        }
        if (oldDB.schemaVersion < 42) {
            const individuals = newDB.objects('Individual');
            _.forEach(individuals, (individual) => {
                individual.firstName = "";
                individual.lastName = "";
            })
        }
        if (oldDB.schemaVersion < 48) {
            const concepts = newDB.objects('Concept');
            _.forEach(concepts, (concept) => {
                concept.voided = false;
            });
            const conceptAnswers = newDB.objects('ConceptAnswer');
            _.forEach(conceptAnswers, (conceptAnswer) => {
                conceptAnswer.voided = false;
            });
        }
        if (oldDB.schemaVersion < 49) {
            const oldFormElements = oldDB.objects('FormElement');
            const formElements = newDB.objects('FormElement');
            for (let i = 0; i < oldFormElements.length; i++) {
                formElements[i].displayOrder = oldFormElements[i].displayOrder;
            }
            const oldFormElementGroups = oldDB.objects('FormElementGroup');
            const formElementGroups = newDB.objects('FormElementGroup');
            for (let j = 0; j < oldFormElementGroups.length; j++) {
                formElementGroups[j].displayOrder = oldFormElementGroups[j].displayOrder;
            }
        }
        if (oldDB.schemaVersion < 50) {
            const concepts = newDB.objects('Concept');
            _.forEach(concepts, (concept) => {
                if (concept.datatype === "N/A") {
                    concept.datatype = "NA";
                }
            });
        }
        if (oldDB.schemaVersion < 51) {
            const conceptAnswers = newDB.objects('ConceptAnswer');
            _.forEach(conceptAnswers, (conceptAnswer) => {
                conceptAnswer.unique = false;
            });
        }
        if (oldDB.schemaVersion < 54) {
            _.forEach(newDB.objects('FormMapping'), (fm) => fm.voided = false);
        }
        if (oldDB.schemaVersion < 55) {
            _.forEach(newDB.objects('EncounterType'), (fm) => fm.voided = false);
        }
    }
};
