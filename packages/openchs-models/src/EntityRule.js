import _ from 'lodash';
import BaseEntity from './BaseEntity';
import General from "./utility/General";

class EntityRule {
    constructor(ruleFile) {
        this.ruleFile = ruleFile;
    }

    setFunctions(exports) {
        General.logInfo('EntityRule', `Found ${JSON.stringify(_.keys(exports))} in ${this.ruleFile.toString()}`);
        if (!_.isNil(exports)) {
            this.decisionFn = exports.getDecisions;
            this.validationFn = exports.validate;
            this.getNextScheduledVisitsFn = exports.getNextScheduledVisits;
            this.getChecklistFn = exports.getChecklists;
        }
    }

    getDecisions(entity) {
        const defaultValue = {enrolmentDecisions: [], encounterDecisions: [], registrationDecisions: []};
        const decisions = this._safeInvokeRule(this.decisionFn, 'Decision', defaultValue, entity);
        if (General.canLog(General.LogLevel.Debug))
            General.logDebug('EntityRule', `Decisions made: ${JSON.stringify(decisions)}`);
        return decisions;
    }

    _safeInvokeRule(func, ruleNameForLogging, defaultValue, ...params) {
        General.logInfo('EntityRule', `Invoking rule ${ruleNameForLogging} on entity: ${params[0].constructor.name}`);
        if (_.isNil(func)) return defaultValue;

        const results = func(...params);
        if (_.isNil(results)) {
            General.logInfo('EntityRule', `${ruleNameForLogging} rule didn't return anything for: ${params[0].constructor.name}`);
            return defaultValue;
        } else if (typeof results !== typeof defaultValue) {
            General.logInfo('EntityRule', `${ruleNameForLogging} didn't return an array for: ${params[0].constructor.name}`);
            return defaultValue;
        }
        return results;
    }

    validate(entity, form) {
        const validationResults = this._safeInvokeRule(this.validationFn, 'Validation', [], entity, form);
        validationResults.forEach((validationResult) => validationResult.formIdentifier = BaseEntity.fieldKeys.EXTERNAL_RULE);
        return validationResults;
    }

    getNextScheduledVisits(entity) {
        const nextScheduledVisits = this._safeInvokeRule(this.getNextScheduledVisitsFn, 'NextScheduledVisits', [], entity);
        General.logInfo('EntityRule', `${nextScheduledVisits.length} scheduled visits returned`);
        if (General.canLog(General.LogLevel.Debug))
            General.logDebug('EntityRule', `NextScheduledVisits: ${JSON.stringify(nextScheduledVisits)}`);
        return nextScheduledVisits;
    }

    getChecklists(enrolment) {
        const checklists = this._safeInvokeRule(this.getChecklistFn, 'GetChecklists', [], enrolment);
        if (General.canLog(General.LogLevel.Debug))
            General.logDebug('EntityRule', `Checklists: ${JSON.stringify(checklists)}`);
        return checklists;
    }
}

export default EntityRule;