import {NativeModules} from 'react-native';
import BaseService from "./BaseService";
import Service from "../framework/bean/Service";
import General from "../utility/General";
import SettingsService from './SettingsService';
import QuestionnaireService from './QuestionnaireService';
import DecisionSupportSessionService from './DecisionSupportSessionService';
import BatchRequest from '../framework/http/BatchRequest';
import RNFetchBlob from 'react-native-fetch-blob';

@Service("exportService")
class ExportService extends BaseService {
    constructor(db, beanStore) {
        super(db, beanStore);
        const batchRequests = new BatchRequest();
        this.fire = batchRequests.fire;
        this.post = batchRequests.post;
    }

    downloadAll(done, errorHandler) {
        const downloadDir = `${RNFetchBlob.fs.dirs.DownloadDir}`;
        this.getService(QuestionnaireService).getQuestionnaireNames().map((questionnaire)=>
            RNFetchBlob.fs.createFile(`${downloadDir}/${General.replaceAndroidIncompatibleChars(questionnaire.name)}_${General.getSafeTimeStamp()}.csv`, this.exportContents(questionnaire)).catch(errorHandler)
        );
        setTimeout(()=>done(), 1000);
    }

    exportAll(done, errorHandler) {
        const exportURL = `${this.getService(SettingsService).getServerURL()}/export`;
        this.getService(QuestionnaireService).getQuestionnaireNames().map(this.exportFileTo(exportURL));
        setTimeout(()=>this.fire(done, errorHandler), 1000);
    }

    exportFileTo(exportURL) {
        return (questionnaire) => {
            const fileContents = this.exportContents(questionnaire);
            const fileName = `${General.replaceAndroidIncompatibleChars(questionnaire.name)}_${General.getTimeStamp()}.csv`;
            this.post(`${exportURL}/${fileName}`, fileContents, ()=> {
            });
        }
    }

    getHeader(questionnaire) {
        const questionnaireService = this.getService(QuestionnaireService);
        const completeQuestionnaire = questionnaireService.getQuestionnaire(questionnaire.uuid);
        var header = '';
        completeQuestionnaire.questions.forEach(function (question) {
            header += General.toExportable(question.name);
            header += ',';
        });

        completeQuestionnaire.decisionKeys.forEach(function (decisionKey) {
            header += General.toExportable(decisionKey);
            header += ',';
        });
        header += "Created At";
        header += '\n';
        return header;
    }

    exportContents(questionnaire) {
        const decisionSupportSessionService = this.getService(DecisionSupportSessionService);
        var contents = this.getHeader(questionnaire);

        const decisionSupportSessions = decisionSupportSessionService.getAll(questionnaire.uuid);
        decisionSupportSessions.forEach((session) => {
            session.questionAnswers.forEach(function (questionAnswer) {
                contents += questionAnswer.answerAsExportableString();
                contents += ',';
            });
            for (var i = 0; i < session.decisions.length; i++) {
                contents += General.toExportable(session.decisions[i].value);
                contents += ',';
            }

            contents += General.formatDateTime(session.saveDate);
            contents += '\n';
        });
        return contents;
    }
}

export default ExportService;