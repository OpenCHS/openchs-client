import {View, Button} from "react-native";
import React from "react";
import AbstractComponent from "../../framework/view/AbstractComponent";
import Path from "../../framework/routing/Path";
import TypedTransition from "../../framework/routing/TypedTransition";
import IndividualSearchResultsView from "./IndividualSearchResultsView";
import AddressLevels from "../common/AddressLevels";
import Reducers from "../../reducer";
import {IndividualSearchActionNames as Actions} from "../../action/individual/IndividualSearchActions";
import General from "../../utility/General";
import StaticFormElement from "../viewmodel/StaticFormElement";
import TextFormElement from "../form/formElement/TextFormElement";
import CheckBoxFormElement from "../form/formElement/CheckBoxFormElement";
import {PrimitiveValue} from "openchs-models";
import CHSContent from "../common/CHSContent";
import Styles from "../primitives/Styles";
import AppHeader from "../common/AppHeader";
import themes from "../primitives/themes";
import CHSContainer from "../common/CHSContainer";

@Path('/individualSearch')
class IndividualSearchView extends AbstractComponent {
    static propTypes = {
        onIndividualSelection: React.PropTypes.func.isRequired,
        showHeader: React.PropTypes.bool,
        headerMessage: React.PropTypes.string
    };

    constructor(props, context) {
        super(props, context, Reducers.reducerKeys.individualSearch);
    }

    viewName() {
        return 'IndividualSearchView';
    }

    componentWillMount() {
        this.dispatchAction(Actions.ON_LOAD);
        super.componentWillMount();
    }


    searchIndividual() {
        this.dispatchAction(Actions.SEARCH_INDIVIDUALS, {
            cb: (individualSearchResults, count) => TypedTransition.from(this).with({
                searchResults: individualSearchResults,
                totalSearchResultsCount: count,
                onIndividualSelection: this.props.onIndividualSelection
            }).to(IndividualSearchResultsView, true)
        });
    }

    render() {
        General.logDebug(this.viewName(), 'render');
        console.log('ISV.render',this.state.subjectType);

        return (
            <CHSContainer theme={themes}>
                <CHSContent>
                    {this.props.showHeader ? <AppHeader
                        title={this.props.headerMessage ? this.props.headerMessage : this.I18n.t("search")}/> : <View/>}
                    <View style={{
                        marginTop: Styles.ContentDistanceFromEdge,
                        paddingHorizontal: Styles.ContentDistanceFromEdge,
                        flexDirection: 'column'
                    }}>
                        <TextFormElement actionName={Actions.ENTER_NAME_CRITERIA}
                                         element={new StaticFormElement('name')}
                                         style={Styles.simpleTextFormElement}
                                         value={new PrimitiveValue(this.state.searchCriteria.name)} multiline={false}/>
                        {this.state.subjectType.isIndividual() ? <TextFormElement actionName={Actions.ENTER_AGE_CRITERIA}
                                         element={new StaticFormElement('age')}
                                         style={Styles.simpleTextFormElement}
                                         value={new PrimitiveValue(this.state.searchCriteria.age)} multiline={false}/> : null }
                        {this.state.subjectType.isIndividual() ? <TextFormElement actionName={Actions.ENTER_OBS_CRITERIA}
                                         element={new StaticFormElement('obsKeyword')}
                                         style={Styles.simpleTextFormElement}
                                         value={new PrimitiveValue(this.state.searchCriteria.obsKeyword)} multiline={false}/> : null}
                        <AddressLevels
                            key={this.state.key}
                            onSelect={(selectedAddressLevels) =>
                                this.dispatchAction(Actions.TOGGLE_INDIVIDUAL_SEARCH_ADDRESS_LEVEL, {values: selectedAddressLevels})
                            }
                            multiSelect={true}/>
                        <CheckBoxFormElement
                            label={this.I18n.t("includeVoided")}
                            checkBoxText={this.I18n.t("yes")}
                            checked={this.state.searchCriteria.includeVoided}
                            onPress={() => this.dispatchAction(Actions.ENTER_VOIDED_CRITERIA,
                                {value: !this.state.searchCriteria.includeVoided})}/>
                        <Button title={this.I18n.t("search")} color={Styles.accentColor} style={{marginTop: 30}}
                                onPress={() => this.searchIndividual()}/>
                    </View>
                </CHSContent>
            </CHSContainer>
        );
    }
}

export default IndividualSearchView;