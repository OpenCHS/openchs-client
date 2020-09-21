import {StyleSheet, TouchableNativeFeedback, View, PermissionsAndroid} from "react-native";
import PropTypes from 'prop-types';
import React from "react";
import AbstractFormElement from "./AbstractFormElement";
import ValidationErrorMessage from "../../form/ValidationErrorMessage";
import ImagePicker from "react-native-image-picker";
import fs from 'react-native-fs';
import General from "../../../utility/General";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from "../../primitives/Colors";
import ExpandableMedia from "../../common/ExpandableMedia";
import FileSystem from "../../../model/FileSystem";

const styles = StyleSheet.create({
    icon: {
        color: Colors.ActionButtonColor,
        opacity: 0.8,
        alignSelf: 'center',
        fontSize: 36,
    },
    closeIcon: {
        color: '#ff0000',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        marginTop: 16
    },
    imageRow: {
        justifyContent: 'space-between'
    }
});

const Mode = {
    MediaLibrary: "MediaLibrary",
    Camera: "Camera"
};

const DEFAULT_IMG_WIDTH = 1280;
const DEFAULT_IMG_HEIGHT = 960;
const DEFAULT_IMG_QUALITY = 1;
const DEFAULT_VIDEO_QUALITY = 'high';
const DEFAULT_DURATION_LIMIT = 60;

const DEFAULT_SAMPLE_RATE = 22050;
const DEFAULT_CHANNELS = 1;
const DEFAULT_AUDIO_QUALITY = "Low";
const DEFAULT_AUDIO_ENCODING = "aac";

export default class MediaFormElement extends AbstractFormElement {
    static propTypes = {
        element: PropTypes.object.isRequired,
        actionName: PropTypes.string.isRequired,
        value: PropTypes.object,
        validationResult: PropTypes.object,
        extraStyle: PropTypes.object
    };
    static defaultProps = {
        style: {}
    };

    constructor(props, context) {
        super(props, context);
        this.state = {};
    }

    get isVideo() {
        return this.props.element.concept.datatype === 'Video';
    }

    get isAudio() {
        return this.props.element.concept.datatype === 'Audio';
    }

    get isImage() {
        return this.props.element.concept.datatype === 'Image';
    }

    get mediaUri() {
        return _.get(this, 'props.value.answer');
    }

    get label() {       
        let label = super.label;
        if (this.isVideo) {
            let duration = this.getFromKeyValue('durationLimitInSecs', DEFAULT_DURATION_LIMIT);
            let durationSuffix = duration > 60 ? `(`+this.I18n.t(`Upto ${Math.floor(duration/60)} min ${duration%60} sec`)+`)` : `(`+this.I18n.t(`Upto ${duration} sec`)+`)`;
            return React.cloneElement(label, {}, [...label.props.children, durationSuffix]);
        }
        return label;
    }

    addMediaFromPicker(response) {
        if (!response.didCancel && !response.error) {
            const ext = this.isVideo ? 'mp4' : 'jpg';
            const fileName = `${General.randomUUID()}.${ext}`;
            const directory = this.isVideo ? FileSystem.getVideosDir() : FileSystem.getImagesDir();
            const fileSystemAction = this.state.mode === Mode.Camera ? fs.moveFile : fs.copyFile;

            fileSystemAction(response.path, `${directory}/${fileName}`)
                .then(() => {
                    this.dispatchAction(this.props.actionName, {
                        formElement: this.props.element,
                        value: fileName
                    });
                });
        }
    }

    clearAnswer() {
        this.dispatchAction(this.props.actionName, {
            formElement: this.props.element,
            value: null,
        });
    }

    getFromKeyValue(key, defaultVal) {
        let keyVal = this.props.element.keyValues.find(keyVal => keyVal.key === key);
        let value = keyVal ? keyVal.getValue() : defaultVal;
        if (key === 'videoQuality' && ['low', 'high'].indexOf(value) === -1)
            throw Error("videoQuality must be either of 'low' or 'high'");
        return value;
    }

    async launchCamera() {
        this.setState({mode: Mode.Camera});

        const options = {
            mediaType: this.isVideo ? 'video' : this.isAudio ? 'video' : 'photo',
            maxWidth: this.getFromKeyValue('maxWidth', DEFAULT_IMG_WIDTH),
            maxHeight: this.getFromKeyValue('maxHeight', DEFAULT_IMG_HEIGHT),
            quality: this.getFromKeyValue('imageQuality', DEFAULT_IMG_QUALITY),
            videoQuality: this.getFromKeyValue('videoQuality', DEFAULT_VIDEO_QUALITY),
            durationLimit: this.getFromKeyValue('durationLimitInSecs', DEFAULT_DURATION_LIMIT),
            noData: true,
            storageOptions: {
                waitUntilSaved: true,
            }
        };
        if (await this.isPermissionGranted()) {
            ImagePicker.launchCamera(options,
                (response) => this.addMediaFromPicker(response));
        }
    }

    async launchMediaLibrary() {
        this.setState({mode: Mode.MediaLibrary});

        const options = {
            mediaType: this.isVideo ? 'video' : this.isAudio ? 'video' : 'photo',
        };
        if (await this.isPermissionGranted()) {
            ImagePicker.launchImageLibrary(options,
                (response) => this.addMediaFromPicker(response));
        }
    }

    async isPermissionGranted() {
        const readStoragePermission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const writeStoragePermission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        const cameraPermission = PermissionsAndroid.PERMISSIONS.CAMERA;
        const audioPermission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
        const granted = PermissionsAndroid.RESULTS.GRANTED;

        const permissionRequest = await PermissionsAndroid.requestMultiple([readStoragePermission, writeStoragePermission, cameraPermission]);

        return permissionRequest[readStoragePermission] === granted && permissionRequest[writeStoragePermission] === granted
            && permissionRequest[cameraPermission] === granted
    }

    showMedia() {
        console.log('mediaUri',this.mediaUri);
        if (this.mediaUri) {
            return (
                <View style={[styles.contentRow, styles.imageRow]}>
                    <ExpandableMedia source={this.mediaUri} type={this.props.element.concept.datatype}/>
                    <TouchableNativeFeedback onPress={() => this.clearAnswer()}>
                        <Icon name={"backspace"} style={[styles.icon]}/>
                    </TouchableNativeFeedback>
                </View>
            );
        }
    }

    showInputOptions() {
        console.log('mediaUri',this.mediaUri);
        return !this.mediaUri && (
            <View style={[styles.contentRow, {justifyContent: 'flex-end'}]}>
                <TouchableNativeFeedback onPress={() => {
                    this.launchMediaLibrary()
                }}
                                         background={TouchableNativeFeedback.SelectableBackground()}>
                    <Icon name={'folder-open'} style={styles.icon}/>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback onPress={() => {
                    this.launchCamera()
                }}
                                         background={TouchableNativeFeedback.SelectableBackground()}>
                    <Icon name={this.isImage? 'camera': this.isVideo ? 'video': this.isAudio ? 'video': 'alert-octagon'} style={styles.icon}/>
                </TouchableNativeFeedback>
            </View>
        );
    }

    render() {
        console.log('this.props.element.concept.datatype',this.props.element.concept.datatype);
    
        return (
            <View style={{marginVertical: 16}}>
                {this.label}
                {this.showInputOptions()}
                {this.showMedia()}
                <View
                    style={{flex: 1, borderColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth, opacity: 0.1}}/>
                <ValidationErrorMessage validationResult={this.props.validationResult}/>
            </View>
        );
    }
}
