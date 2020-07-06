import React from "react";
import {ListView, Text, TouchableNativeFeedback, View} from 'react-native';
import AbstractComponent from "../../framework/view/AbstractComponent";
import Path from "../../framework/routing/Path";
import Reducers from "../../reducer";
import {MyDashboardActionNames as Actions} from "../../action/mydashboard/MyDashboardActions";
import Colors from '../primitives/Colors';
import CHSContainer from "../common/CHSContainer";
import CHSContent from "../common/CHSContent";
import StatusCountRow from './StatusCountRow';
import Separator from '../primitives/Separator';
import AppHeader from "../common/AppHeader";
import DashboardFilters from "./DashboardFilters";
import CHSNavigator from "../../utility/CHSNavigator";
import General from "../../utility/General";
import CustomActivityIndicator from "../CustomActivityIndicator";
import {Icon} from "native-base";
import UserInfoService from "../../service/UserInfoService";
import Fonts from "../primitives/Fonts";

@Path('/MyDashboard')
class MyDashboardView extends AbstractComponent {
    static propTypes = {};

    constructor(props, context) {
        super(props, context, Reducers.reducerKeys.myDashboard);
        this.ds = new ListView.DataSource({rowHasChanged: () => false});
        this.disableAutoRefresh = context.getService(UserInfoService).getUserInfo().getSettings().disableAutoRefresh;
    }

    viewName() {
        return "MyDashboard";
    }

    componentWillMount() {
        this.dispatchAction(Actions.LOAD_INDICATOR);
        setTimeout(() => this.dispatchAction(Actions.ON_LOAD), 0);
        super.componentWillMount();
    }

    componentDidMount() {
        this.dispatchAction(Actions.LOAD_INDICATOR, {loading: false})
    }

    onBackCallback() {
        this.goBack();
    }

    _onBack() {
        this.goBack();
    }

    filterStateChanged = (prev, next) => {
        return prev.individualFilters === next.individualFilters ||
            prev.encountersFilters === next.encountersFilters ||
            prev.enrolmentFilters === next.enrolmentFilters ||
            prev.generalEncountersFilters === next.generalEncountersFilters;
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.filterStateChanged(this.state, nextState) || this.state.fetchFromDB;
    }

    renderHeader() {
        return <View
            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap'}}>
            {this.disableAutoRefresh ?
                <View style={{flexDirection: 'column', alignItems: 'center', marginLeft: 5}}>
                    <Text>Last updated on </Text>
                    <Text>{this.state.lastUpdatedOn}</Text>
                </View> : <View/>}
            <View style={{alignItems: 'center'}}>
                <Text style={[Fonts.typography("paperFontTitle"),{
                    paddingTop: 15,
                    textAlign: 'center',
                    fontSize: 20,
                    paddingBottom: 15
                }]}>{this.state.selectedSubjectType && this.I18n.t(this.state.selectedSubjectType.name)}</Text>
            </View>
            {this.disableAutoRefresh ?
                <TouchableNativeFeedback onPress={() => this.refreshDashBoard()}
                                         background={TouchableNativeFeedback.SelectableBackground()}>
                    <View style={{marginRight: 10, alignItems: 'center'}}>
                        <Icon style={{
                            color: Colors.AccentColor,
                            opacity: 0.8,
                            alignSelf: 'center',
                            fontSize: 30
                        }} name='refresh'/>
                    </View>
                </TouchableNativeFeedback> : <View/>}
        </View>
    }

    refreshDashBoard() {
        this.dispatchAction(Actions.LOAD_INDICATOR);
        setTimeout(() => this.dispatchAction(Actions.ON_LOAD, {fetchFromDB: true}), 0);
    }

    render() {
        General.logDebug(this.viewName(), 'render');
        const dataSource = this.ds.cloneWithRows((this.state.visits));
        const date = this.state.date;
        return (
            <CHSContainer style={{backgroundColor: Colors.GreyContentBackground}}>
                <AppHeader title={this.I18n.t('home')} hideBackButton={true} startSync={this.props.startSync}
                           renderSync={true} icon={this.props.icon}/>
                <View>
                    <DashboardFilters date={date} filters={this.state.filters}
                                      selectedLocations={this.state.selectedLocations}
                                      selectedPrograms={this.state.selectedPrograms}
                                      selectedEncounterTypes={this.state.selectedEncounterTypes}
                                      selectedGeneralEncounterTypes={this.state.selectedGeneralEncounterTypes}
                                      selectedCustomFilters={this.state.selectedCustomFilters}
                                      selectedGenders={this.state.selectedGenders}
                                      programs={this.state.programs}
                                      activityIndicatorActionName={Actions.LOAD_INDICATOR}
                                      onPress={() => CHSNavigator.navigateToFilterView(this, {
                                          filters: this.state.filters,
                                          locationSearchCriteria: this.state.locationSearchCriteria,
                                          addressLevelState: this.state.addressLevelState,
                                          programs: this.state.programs,
                                          selectedPrograms: this.state.selectedPrograms,
                                          selectedSubjectType: this.state.selectedSubjectType,
                                          encounterTypes: this.state.encounterTypes,
                                          selectedEncounterTypes: this.state.selectedEncounterTypes,
                                          generalEncounterTypes: this.state.generalEncounterTypes,
                                          selectedCustomFilters: this.state.selectedCustomFilters,
                                          selectedGenders: this.state.selectedGenders,
                                          selectedGeneralEncounterTypes: this.state.selectedGeneralEncounterTypes,
                                          onBack: this._onBack.bind(this),
                                          actionName: Actions.APPLY_FILTERS,
                                          filterDate: date
                                      })}/>
                </View>
                <CHSContent>
                    <CustomActivityIndicator
                        loading={this.state.loading}/>
                    <View>
                        <ListView dataSource={dataSource}
                                  initialListSize={1}
                                  removeClippedSubviews={true}
                                  renderHeader={() => this.renderHeader()}
                                  renderRow={(rowData) => <StatusCountRow visits={rowData.visits}
                                                                          backFunction={() => this.onBackCallback()}/>}/>
                        <Separator height={10} backgroundColor={Colors.GreyContentBackground}/>
                    </View>
                    <Separator height={110} backgroundColor={Colors.GreyContentBackground}/>
                </CHSContent>
            </CHSContainer>
        );
    }
}

export default MyDashboardView;
