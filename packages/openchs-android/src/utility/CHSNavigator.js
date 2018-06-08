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
import LoginView from "../views/LoginView";
import LandingView from "../views/LandingView";
import MenuView from "../views/MenuView";
import ForgotPasswordView from "../views/ForgotPasswordView";
import SetPasswordView from "../views/SetPasswordView";
import ResetForgottenPasswordView from "../views/ResetForgottenPasswordView";
import ChangePasswordView from "../views/ChangePasswordView";
import ProgramEncounterCancelView from "../views/program/ProgramEncounterCancelView";
import IndividualSearchView from "../views/individual/IndividualSearchView";
import IndividualAddRelativeView from "../views/individual/IndividualAddRelativeView";

class CHSNavigator {
    static navigateToLoginView(source, allowSkipLogin, backFunction) {
        TypedTransition.from(source).with({allowSkipLogin: allowSkipLogin, backFunction: backFunction}).to(LoginView, true, _.isNil(backFunction));
    }

    static navigateToLandingView(source, replace, props) {
        TypedTransition.from(source).with(props).to(LandingView, true, replace);
    }

    static navigateToProgramEnrolmentView(source, enrolment, backFunction) {
        TypedTransition.from(source).with({
            enrolment: enrolment,
            backFunction: backFunction
        }).to(ProgramEnrolmentView, true);
    }

    static navigateToProgramEnrolmentDashboardView(source, individualUUID, selectedEnrolmentUUID, isFromWizard) {
        const from = TypedTransition.from(source);
        if (isFromWizard) {
            from.wizardCompleted([SystemRecommendationView, ProgramEnrolmentView, ProgramEncounterView, ProgramExitView, ProgramEncounterCancelView], ProgramEnrolmentDashboardView, {
                individualUUID: individualUUID,
                enrolmentUUID: selectedEnrolmentUUID
            }, true);
        } else {
            from.with({individualUUID: individualUUID}).to(ProgramEnrolmentDashboardView, true);
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

    static navigateToProgramEncounterCancelView(source, programEncounter) {
        TypedTransition.from(source).with({programEncounter: programEncounter}).to(ProgramEncounterCancelView);
    }

    static navigateToIndividualRegistrationDetails(source, individual, backFunction) {
        TypedTransition.from(source).with({individualUUID: individual.uuid, backFunction: backFunction}).to(IndividualRegistrationDetailView);
    }

    static navigateToIndividualRegisterView(source, individualUUID) {
        TypedTransition.from(source).with({individualUUID: individualUUID}).to(IndividualRegisterView);
    }

    static navigateToIndividualSearchView(source, onIndividualSelection) {
        TypedTransition.from(source).with({onIndividualSelection: onIndividualSelection}).to(IndividualSearchView, true);
    }

    static navigateToIndividualEncounterLandingView(source, individualUUID, encounter) {
        TypedTransition.from(source).bookmark().with({
            encounter: encounter,
            individualUUID: individualUUID
        }).to(IndividualEncounterLandingView, true);
    }

    static navigateToSystemRecommendationViewFromEncounterWizard(source, decisions, ruleValidationErrors, encounter, action, headerMessage, form) {
        const onSaveCallback = (source) => {
            TypedTransition.from(source).popToBookmark();
        };
        CHSNavigator.navigateToSystemsRecommendationView(source, decisions, ruleValidationErrors, encounter.individual, encounter.observations, action, onSaveCallback, headerMessage, null, null, form);
    }

    static navigateToSystemsRecommendationView(source, decisions, ruleValidationErrors, individual, observations, saveActionName, onSaveCallback, headerMessage, checklists, nextScheduledVisits, form) {
        TypedTransition.from(source).with({
            form: form,
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

    static navigateToMenuView(source, startSync) {
        TypedTransition.from(source).with({startSync: startSync}).to(MenuView, true);
    }

    static navigateToForgotPasswordView(source) {
        TypedTransition.from(source).to(ForgotPasswordView, true);
    }

    static navigateToSetPasswordView(source, user) {
        TypedTransition.from(source).with({user: user}).to(SetPasswordView, true);
    }

    static navigateToResetPasswordView(source, user) {
        TypedTransition.from(source).with({user: user}).to(ResetForgottenPasswordView, true);
    }

    static navigateToChangePasswordView(source) {
        TypedTransition.from(source).to(ChangePasswordView, true);
    }

    static navigateToAddRelativeView(source, individual, onSaveCallback) {
        TypedTransition.from(source).with({individual: individual, onSaveCallback: onSaveCallback}).to(IndividualAddRelativeView, true);
    }
}

export default CHSNavigator;