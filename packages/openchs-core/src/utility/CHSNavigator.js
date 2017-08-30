import TypedTransition from "../framework/routing/TypedTransition";
import ProgramEnrolmentView from "../views/program/ProgramEnrolmentView";
import ProgramEnrolmentDashboardView from "../views/program/ProgramEnrolmentDashboardView";
import ProgramExitView from "../views/program/ProgramExitView";
import ProgramEnrolmentState from "../action/program/ProgramEnrolmentState";
import _ from "lodash";
import ProgramEncounterView from "../views/program/ProgramEncounterView";
import IndividualRegistrationDetailView from "../views/individual/IndividualRegistrationDetailView";
import IndividualRegisterView from "../views/individual/IndividualRegisterView";
import IndividualEncounterLandingView from "../views/individual/IndividualEncounterLandingView";
import SystemRecommendationView from "../views/conclusion/SystemRecommendationView";
import ChecklistView from "../views/program/ChecklistView";
import StartProgramView from "../views/program/StartProgramView";

class CHSNavigator {
    static navigateToProgramEnrolmentView(source, enrolment, backFunction) {
        TypedTransition.from(source).with({enrolment: enrolment, backFunction: backFunction}).to(ProgramEnrolmentView, true);
    }

    static navigateToProgramEnrolmentDashboardView(source, individualUUID, selectedEnrolmentUUID, usage) {
        const from = TypedTransition.from(source);
        if (_.isNil(usage)) {
            from.with({individualUUID: individualUUID}).to(ProgramEnrolmentDashboardView, true);
        } else {
            const wizardViewClass = usage === ProgramEnrolmentState.UsageKeys.Enrol ? ProgramEnrolmentView : ProgramExitView;
            from.wizardCompleted([wizardViewClass, SystemRecommendationView], ProgramEnrolmentDashboardView, {individualUUID: individualUUID, enrolmentUUID: selectedEnrolmentUUID}, true);
        }
    }

    static navigateToExitProgram(source, enrolment) {
        TypedTransition.from(source).with({enrolment: enrolment}).to(ProgramExitView);
    }

    static navigateToStartProgramView(source, enrolmentUUID) {
        TypedTransition.from(source).with({enrolmentUUID: enrolmentUUID}).to(StartProgramView);
    }

    static goBack(source) {
        TypedTransition.from(source).goBack()
    }

    static navigateToProgramEncounterView(source, programEncounter) {
        TypedTransition.from(source).with({programEncounter: programEncounter}).to(ProgramEncounterView);
    }

    static navigateToIndividualRegistrationDetails(source, individual) {
        TypedTransition.from(source).with({individualUUID: individual.uuid}).to(IndividualRegistrationDetailView);
    }

    static navigateToIndividualRegisterView(source, individualUUID) {
        TypedTransition.from(source).with({individualUUID: individualUUID}).to(IndividualRegisterView);
    }

    static navigateToIndividualEncounterLandingView(source, individualUUID, encounter) {
        TypedTransition.from(source).bookmark().with({encounter: encounter, individualUUID: individualUUID}).to(IndividualEncounterLandingView, true);
    }

    static navigateToSystemRecommendationViewFromEncounterWizard(source, decisions, ruleValidationErrors, encounter, action, headerMessage) {
        const onSaveCallback = (source) => {
            TypedTransition.from(source).popToBookmark();
        };
        CHSNavigator.navigateToSystemsRecommendationView(source, decisions, ruleValidationErrors, encounter.individual, encounter.observations, action, onSaveCallback, headerMessage);
    }

    static navigateToSystemsRecommendationView(source, decisions, ruleValidationErrors, individual, observations, saveActionName, onSaveCallback, headerMessage, checklists, nextScheduledVisits) {
        TypedTransition.from(source).with({
            decisions: decisions,
            individual: individual,
            saveActionName: saveActionName,
            onSaveCallback: onSaveCallback,
            observations: observations,
            validationErrors: ruleValidationErrors,
            headerMessage: headerMessage,
            checklists: _.isNil(checklists) ? [] : checklists,
            nextScheduledVisits: _.isNil(nextScheduledVisits) ? [] : nextScheduledVisits
        }).to(SystemRecommendationView, true);
    }

    static navigateToChecklistView(source, enrolmentUUID) {
        TypedTransition.from(source).with({
            enrolmentUUID: enrolmentUUID,
        }).to(ChecklistView, true);
    }

    static goHome(view) {
        TypedTransition.from(view).toBeginning();
    }
}

export default CHSNavigator;