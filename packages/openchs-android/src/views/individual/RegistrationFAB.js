import FloatingActionButton from "../common/FloatingActionButton";
import CHSNavigator from "../../utility/CHSNavigator";
import {Text, TouchableOpacity} from "react-native";
import React from "react";
import AbstractComponent from "../../framework/view/AbstractComponent";
import ProgramService from "../../service/program/ProgramService";
import ProgramEnrolment from "openchs-models/src/ProgramEnrolment";
import ObservationsHolder from "openchs-models/src/ObservationsHolder";
import Colors from "../primitives/Colors";

export default class RegistrationFAB extends AbstractComponent {
    static propTypes = {
        parent: React.PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context);
        this.createStyles();
    }

    componentWillMount() {
        const programs = this.context.getService(ProgramService).findAll();
        this.setState({programs: _.map(programs, _.identity)});
    }

    createStyles() {
        this.iconStyle = {
            alignSelf: 'flex-end',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 80,
            backgroundColor: Colors.AccentColor,
            elevation: 2,
            marginBottom: 10,
            marginLeft: 6
        };
        this.textStyle = {
            color: Colors.TextOnPrimaryColor,
            fontFamily: 'FontAwesome',
            fontWeight: 'bold',
            textAlign: 'justify',
            lineHeight: 25,
            fontSize: 30,
            padding: 5,
        }
    }

    renderIcon(icon) {
        return (<TouchableOpacity disabled={true} style={this.iconStyle}>
            <Text style={this.textStyle}>{icon}</Text>
        </TouchableOpacity>);
    }

    render() {
        return <FloatingActionButton actions={
            this.state.programs.map((program)=> {
                return {
                    fn: ()=> {
                        CHSNavigator.navigateToIndividualRegisterView(this, null, {
                            key: 'saveAndEnrol',
                            callback: (systemRecommendationView) => {
                                const individual = systemRecommendationView.state.individual;
                                const enrolment = ProgramEnrolment.createEmptyInstance();
                                enrolment.individual = individual.cloneForEdit();
                                enrolment.program = program;
                                ObservationsHolder.convertObsForSave(enrolment.individual.observations);
                                CHSNavigator.navigateToProgramEnrolmentView(source, enrolment);
                            }
                        });
                    },
                    icon: this.renderIcon(program.name[0]),
                    label: 'Registration ' + program.name
                }
            })
        }/>
    }

}

