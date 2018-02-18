import React from "react"; import PropTypes from 'prop-types';
import AbstractFormElement from "./AbstractFormElement";
import SelectFormElement from "./SelectFormElement";

class SingleSelectFormElement extends AbstractFormElement {
    render() {
        return (
            <SelectFormElement multiSelect={false}
                               isSelected={(answer) => this.props.singleCodedValue.hasValue(answer)}
                               {...this.props}/>);
    }
}

export default SingleSelectFormElement;