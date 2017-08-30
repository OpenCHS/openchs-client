import {Dimensions} from "react-native";
import Colors from '../primitives/Colors';
import Fonts from '../primitives/Fonts';

class DynamicGlobalStyles {
    constructor() {
        this.windowWidth = Dimensions.get('window').width;
        this.windowHeight = Dimensions.get('window').height;

        this.formElementLabel = {fontSize: Fonts.Normal, textAlignVertical: 'center', color: 'rgba(15, 15, 15, 0.75)'};
        this.formElementTextInput = {flex: 1, fontSize: Fonts.Large};
        this.formRadioText = {fontSize: Fonts.Large, marginLeft: this.resizeWidth(10)};

        this.createCommonStyles();
        this.createGeneralHistoryStyles();
        this.createCardStyles();

        this.stylesForHorizontalDistances = ['marginLeft', 'marginRight', 'marginHorizontal', 'paddingLeft', 'paddingRight', 'paddingHorizontal', 'width'];
        this.stylesForVerticalDistances = ['marginTop', 'marginBottom', 'marginVertical', 'paddingTop', 'paddingBottom', 'paddingVertical', 'height'];
    }

    resizeWidth(size) {
        return size * this.windowWidth / 600;
    }

    resizeHeight(size) {
        return size * this.windowHeight / 900;
    }

    resizeTextInputHeight(size) {
        const resizedHeight = this.resizeHeight(size);
        return resizedHeight < 26 ? 26 : resizedHeight;
    }

    numberOfTableColumns() {
        return this.windowWidth / this.resizeWidth(110);
    }

    numberOfRows(numberOfCells) {
        return Math.round(numberOfCells % this.numberOfTableColumns() + 1);
    }

    createCommonStyles() {
        this.common = {
            content: {marginTop: this.resizeHeight(16)}
        }
    }

    createGeneralHistoryStyles() {
        this.generalHistory = {
            encounterDateGrid: {marginBottom: this.resizeHeight(8)},
            buttonRowStyle: {justifyContent: 'center', height: this.resizeHeight(40)}
        };
    }

    createCardStyles() {
        this.card = {
            self: {
                paddingHorizontal: this.resizeWidth(12),
                paddingVertical: this.resizeHeight(18),
                marginHorizontal: this.resizeWidth(12),
                marginTop: this.resizeHeight(8),
                borderRadius: 5
            },
            title: {fontSize: 20, color: Colors.InputNormal, marginTop: this.resizeHeight(4)},
            separator: {marginTop: this.resizeHeight(24)},
            aggregate: {
                self: {marginLeft: this.resizeWidth(3.2), marginTop: this.resizeHeight(24)},
                label: {fontSize: Fonts.Normal, color: Colors.InputNormal},
                value: {fontSize: 32, color: Colors.InputNormal}
            },
            action: {
                self: {marginTop: this.resizeHeight(20), flexDirection: 'row', justifyContent: 'flex-end'},
                button: {fontSize: 14}
            },
            table: {
                title: {fontSize: Fonts.Large, color: Colors.InputNormal, marginTop: this.resizeHeight(18)}
            }
        }
    }
}

export default new DynamicGlobalStyles();