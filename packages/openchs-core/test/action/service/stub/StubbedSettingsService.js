import StubbedBaseService from "./StubbedBaseService";
import {Settings} from "openchs-models";

class StubbedSettingsService extends StubbedBaseService {
    constructor(serviceData) {
        super(serviceData);
    }

    getSettings() {
        return new Settings();
    }
}

export default StubbedSettingsService;