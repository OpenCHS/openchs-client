import moment from "moment";
import ResourceUtil from "./utility/ResourceUtil";
import AddressLevel from "./AddressLevel";
import Gender from "./Gender";
import General from "./utility/General";
import BaseEntity from "./BaseEntity";
import ProgramEnrolment from "./ProgramEnrolment";
import Encounter from "./Encounter";
import Duration from "./Duration";
import _ from "lodash";
import ValidationResult from "./application/ValidationResult";
import ObservationsHolder from "./ObservationsHolder";

class Individual extends BaseEntity {
    static schema = {
        name: "Individual",
        primaryKey: 'uuid',
        properties: {
            uuid: "string",
            name: "string",
            dateOfBirth: "date",
            dateOfBirthVerified: "bool",
            gender: 'Gender',
            registrationDate: "date",
            lowestAddressLevel: 'AddressLevel',
            enrolments: {type: "list", objectType: "ProgramEnrolment"},
            encounters: {type: "list", objectType: "Encounter"},
            observations: {type: 'list', objectType: 'Observation'},
        }
    };

    static validationKeys = {
        DOB: 'DOB',
        GENDER: 'GENDER',
        NAME: 'NAME',
        REGISTRATION_DATE: 'REGISTRATION_DATE',
        LOWEST_ADDRESS_LEVEL: 'LOWEST_ADDRESS_LEVEL'
    };

    static createEmptyInstance() {
        const individual = new Individual();
        individual.uuid = General.randomUUID();
        individual.registrationDate = new Date();
        individual.observations = [];
        individual.encounters = [];
        individual.enrolments = [];
        return individual;
    }

    get toResource() {
        const resource = _.pick(this, ["uuid", "name", "dateOfBirthVerified"]);
        resource.dateOfBirth = moment(this.dateOfBirth).format('YYYY-MM-DD');
        resource.registrationDate = moment(this.registrationDate).format('YYYY-MM-DD');
        resource["genderUUID"] = this.gender.uuid;
        resource["addressLevelUUID"] = this.lowestAddressLevel.uuid;

        resource["observations"] = [];
        this.observations.forEach((obs) => {
            resource["observations"].push(obs.toResource);
        });

        return resource;
    }

    static newInstance(uuid, name, dateOfBirth, dateOfBirthVerified, gender, lowestAddressLevel) {
        const individual = new Individual();
        individual.uuid = uuid;
        individual.name = name;
        individual.dateOfBirth = dateOfBirth;
        individual.dateOfBirthVerified = dateOfBirthVerified;
        individual.gender = gender;
        individual.lowestAddressLevel = lowestAddressLevel;
        return individual;
    }

    static fromResource(individualResource, entityService) {
        const addressLevel = entityService.findByKey("uuid", ResourceUtil.getUUIDFor(individualResource, "addressUUID"), AddressLevel.schema.name);
        const gender = entityService.findByKey("uuid", ResourceUtil.getUUIDFor(individualResource, "genderUUID"), Gender.schema.name);


        const individual = General.assignFields(individualResource, new Individual(), ["uuid", "name", "dateOfBirthVerified"], ["dateOfBirth", 'registrationDate'], ["observations"], entityService);

        individual.gender = gender;
        individual.lowestAddressLevel = addressLevel;

        return individual;
    }

    static merge = (childEntityClass) =>
        BaseEntity.mergeOn(new Map([[ProgramEnrolment, 'enrolments'], [Encounter, "encounters"]]).get(childEntityClass));

    static associateChild(child, childEntityClass, childResource, entityService) {
        var individual = entityService.findByKey("uuid", ResourceUtil.getUUIDFor(childResource, "individualUUID"), Individual.schema.name);
        individual = General.pick(individual, ["uuid"], ["enrolments", "encounters"]);

        if (childEntityClass === ProgramEnrolment)
            BaseEntity.addNewChild(child, individual.enrolments);
        else if (childEntityClass === Encounter)
            BaseEntity.addNewChild(child, individual.encounters);
        else
            throw `${childEntityClass.name} not support by ${Individual.name}`;

        return individual;
    }

    getDisplayAge(i18n) {
        const ageInYears = this.getAgeInYears();
        if (ageInYears < 1){
            let ageInWeeks = moment().diff(this.dateOfBirth, 'weeks');
            return ageInWeeks === 0 ? Duration.inDay(moment().diff(this.dateOfBirth, 'days')).toString(i18n) : Duration.inWeek(ageInWeeks).toString(i18n);
        } else if (ageInYears < 2) {
            return Duration.inMonth(moment().diff(this.dateOfBirth, 'months')).toString(i18n);
        } else {
            return Duration.inYear(ageInYears).toString(i18n);
        }
    }

    getAge() {
        const ageInYears = this.getAgeInYears();
        return ageInYears > 0 ? Duration.inYear(ageInYears) : Duration.inMonth(moment().diff(this.dateOfBirth, 'months'));
    }

    getAgeInMonths(asOnDate) {
        asOnDate = asOnDate || moment();
        return moment(asOnDate).diff(this.dateOfBirth, 'months');
    }

    getAgeInWeeks(asOnDate) {
        asOnDate = asOnDate || moment();
        return moment(asOnDate).diff(this.dateOfBirth, 'weeks');
    }

    getAgeInYears() {
        return moment().diff(this.dateOfBirth, 'years');
    }

    toSummaryString() {
        return `${this.name}, Age: ${this.getAge().toString()}, ${this.gender.name}`;
    }

    setDateOfBirth(date) {
        this.dateOfBirth = date;
        this.dateOfBirthVerified = true;
    }

    setAge(age, isInYears) {
        this.dateOfBirth = moment().subtract(age, isInYears ? 'years' : 'months').toDate();
        this.dateOfBirthVerified = false;
    }

    validateDateOfBirth() {
        if (_.isNil(this.dateOfBirth)) {
            return ValidationResult.failure(Individual.validationKeys.DOB, "emptyValidationMessage");
        } else if (General.dateAIsAfterB(this.dateOfBirth, new Date())) {
            return ValidationResult.failure(Individual.validationKeys.DOB, "dateOfBirthCannotBeInFuture");
        } else if (this.getAgeInYears() > 120) {
            return ValidationResult.failure(Individual.validationKeys.DOB, "ageTooHigh");
        } else if (this.isRegistrationBeforeDateOfBirth) {
            return ValidationResult.failure(Individual.validationKeys.DOB, 'registrationBeforeDateOfBirth');
        } else {
            return ValidationResult.successful(Individual.validationKeys.DOB);
        }
    }

    get isRegistrationBeforeDateOfBirth() {
        if (_.isNil(this.dateOfBirth) || _.isNil(this.registrationDate)) return false;
        return General.dateAIsAfterB(this.dateOfBirth, this.registrationDate);
    }

    validateRegistrationDate() {
        const validationResult = this.validateFieldForEmpty(this.registrationDate, Individual.validationKeys.REGISTRATION_DATE);
        if (validationResult.success && this.isRegistrationBeforeDateOfBirth)
            return ValidationResult.failure(Individual.validationKeys.REGISTRATION_DATE, 'registrationBeforeDateOfBirth');
        return validationResult;
    }

    validateName() {
        return this.validateFieldForEmpty(this.name, Individual.validationKeys.NAME);
    }

    validate() {
        const validationResults = [];
        validationResults.push(this.validateName());
        validationResults.push(this.validateDateOfBirth());
        validationResults.push(this.validateRegistrationDate());
        validationResults.push(this.validateGender());
        validationResults.push(this.validateAddress());
        return validationResults;
    }

    validateAddress() {
        return this.validateFieldForEmpty(this.lowestAddressLevel, Individual.validationKeys.LOWEST_ADDRESS_LEVEL);
    }

    validateGender() {
        return this.validateFieldForEmpty(this.gender, Individual.validationKeys.GENDER);
    }

    isGender(gender) {
        return this.gender === gender;
    }

    eligiblePrograms(allPrograms) {
        const eligiblePrograms = _.slice(allPrograms);

        _.remove(eligiblePrograms, (program) => {
            const find = _.find(this.enrolments, (enrolment) => {
                return enrolment.program.uuid === program.uuid && enrolment.isActive;
            });
            return find !== undefined;
        });

        return eligiblePrograms;
    }

    addEncounter(encounter) {
        if (!_.some(this.encounters, (existingEncounter) => existingEncounter.uuid === encounter.uuid))
            this.encounters.push(encounter);
    }

    cloneForEdit() {
        const individual = new Individual();
        individual.uuid = this.uuid;
        individual.name = this.name;
        individual.dateOfBirth = this.dateOfBirth;
        individual.registrationDate = this.registrationDate;
        individual.dateOfBirthVerified = this.dateOfBirthVerified;
        individual.gender = _.isNil(this.gender) ? null : this.gender.clone();
        individual.lowestAddressLevel = _.isNil(this.lowestAddressLevel) ? null : this.lowestAddressLevel.cloneForReference();
        individual.observations = ObservationsHolder.clone(this.observations);
        return individual;
    }

    get hasActiveEnrolment() {
        return _.some(this.enrolments, (enrolment) => enrolment.isActive);
    }

    get firstActiveOrRecentEnrolment() {
        return _.find(_.reverse(_.sortBy(this.enrolments, (enrolment) => enrolment.enrolmentDateTime), (enrolment) => enrolment.isActive));
    }

    get hasEnrolments() {
        return this.enrolments.length;
    }

    findEnrolmentForProgram(program) {
        return _.find(this.enrolments, (enrolment) => enrolment.program.uuid === program.uuid);
    }

    addEnrolment(programEnrolment) {
        if (!_.some(this.enrolments, (x) => x.uuid === programEnrolment.uuid)) {
            this.enrolments.push(programEnrolment);
        }
    }
}

export default Individual;