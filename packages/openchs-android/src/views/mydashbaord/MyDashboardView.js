import React from "react"; import PropTypes from 'prop-types';
import {View, StyleSheet, ListView, Text} from 'react-native';
import _ from 'lodash';
import AbstractComponent from "../../framework/view/AbstractComponent";
import Path from "../../framework/routing/Path";
import Reducers from "../../reducer";
import themes from "../primitives/themes";
import {MyDashboardActionNames as Actions} from "../../action/mydashboard/MyDashboardActions";
import AppHeader from "../common/AppHeader";
import Colors from '../primitives/Colors';
import CHSContainer from "../common/CHSContainer";
import CHSContent from "../common/CHSContent";
import AddressVisitRow from './AddressVisitRow';
import Distances from '../primitives/Distances'
import Separator from '../primitives/Separator';

@Path('/MyDashboard')
class MyDashboardView extends AbstractComponent {
    static propTypes = {};

    viewName() {
        return "MyDashboard";
    }

    constructor(props, context) {
        super(props, context, Reducers.reducerKeys.myDashboard);
        this.ds = new ListView.DataSource({rowHasChanged: () => false});
    }

    static styles = StyleSheet.create({
        container: {
            marginRight: Distances.ScaledContentDistanceFromEdge,
            marginLeft: Distances.ScaledContentDistanceFromEdge
        }
    });

    componentWillMount() {
        this.dispatchAction(Actions.ON_LOAD);
        super.componentWillMount();
    }

    render() {
        const dataSource = this.ds.cloneWithRows(_.values(this.state.visits));
        return (
            <CHSContainer theme={themes} style={{backgroundColor: Colors.GreyContentBackground}}>
                <AppHeader title={this.I18n.t('myDashboard')}/>
                <CHSContent>
                    <View style={MyDashboardView.styles.container}>
                        <ListView dataSource={dataSource}
                                  initialListSize={1}
                                  removeClippedSubviews={true}
                                  renderSeparator={(ig, idx) => (<Separator key={idx} height={2}/>)}
                                  renderRow={(rowData) => <AddressVisitRow address={rowData.address}
                                                                           visits={rowData.visits}/>}/>
                    </View>
                </CHSContent>
            </CHSContainer>
        );
    }
}

export default MyDashboardView;