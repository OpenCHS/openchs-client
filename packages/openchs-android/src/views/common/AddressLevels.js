import React from "react"; import PropTypes from 'prop-types';
import AbstractComponent from "../../framework/view/AbstractComponent";
import Colors from "../primitives/Colors";
import Reducers from "../../reducer";
import Fonts from "../primitives/Fonts";
import RadioGroup, {RadioLabelValue} from "../primitives/RadioGroup";

class AddressLevels extends AbstractComponent {
    static propTypes = {
        multiSelect: PropTypes.bool.isRequired,
        selectedAddressLevels: PropTypes.array.isRequired,
        actionName: PropTypes.string.isRequired,
        validationError: PropTypes.object,
        style: PropTypes.object,
        mandatory: PropTypes.bool
    };

    viewName() {
        return 'AddressLevels';
    }

    constructor(props, context) {
        super(props, context, Reducers.reducerKeys.addressLevels);
        this.inputTextStyle = {fontSize: Fonts.Large, marginLeft: 11, color: Colors.InputNormal};
    }

    toggleAddressLevelSelection(addressLevelUuid) {
        const selectedAddressLevel = this.state.addressLevels.addressLevels.find((al) => al.uuid === addressLevelUuid);
        return this.dispatchAction(this.props.actionName, {value: selectedAddressLevel});
    }

    refreshState() {
        this.setState({addressLevels: this.getContextState("addressLevels")});
    }

    render() {
        const valueLabelPairs = this.state.addressLevels.addressLevels.map(({uuid, name}) => new RadioLabelValue(name, uuid));
        return (
            <RadioGroup
                multiSelect={this.props.multiSelect}
                style={this.props.style}
                inPairs={true}
                onPress={({label, value}) => this.toggleAddressLevelSelection(value)}
                selectionFn={(addressLevel) => this.props.selectedAddressLevels.some((al) => al.uuid === addressLevel)}
                labelKey={`${this.state.addressLevels.catchmentType}`}
                mandatory={this.props.mandatory}
                validationError={this.props.validationError}
                labelValuePairs={valueLabelPairs}/>
        );
    }
}

export default AddressLevels;