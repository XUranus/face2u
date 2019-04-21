import React, { Component } from 'react';
import Webcam from 'react-webcam'
import PropTypes  from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import axios from 'axios'
import * as faceapi from 'face-api.js'
//import { env } from 'face-api.js';
//import { recognizeFaceExpressions } from 'face-api.js';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';


const serverAddr = 'http://localhost:5000'

const MEDIA_WIDTH = 640
const MEDIA_HEIGHT = 480

const styles = theme=> ({
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    overlay:{
        width:MEDIA_WIDTH,
        height:MEDIA_HEIGHT,
        position: 'absolute'
    },
    video:{
        'z-index': -1
    },
    captured:{
        'z-index': -1,
        height:MEDIA_HEIGHT,
        width:MEDIA_WIDTH
    },
    root: {
        flexGrow: 1,
    },
    paper: {
        overflow:'hidden',
        height:580,
        minWidth:640,
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
});

function resizeCanvasAndResults(dimensions, canvas, results) {
    const { width, height } = dimensions instanceof HTMLVideoElement
        ? faceapi.getMediaDimensions(dimensions)
        : dimensions
    canvas.width = width
    canvas.height = height

    // resize detections (and landmarks) in case displayed image is smaller than
    // original size
    return faceapi.resizeResults(results, { width, height })
}

class CameraSection extends Component {
    state = {
        capturedImage:'face_default.jpeg',
        forwardTimes:[]
    }
    //https://www.npmjs.com/package/react-webcam 
    
    setRef = webcam => {
        this.webcam = webcam;
    };

    async recognizeFace() {
        let input = document.getElementById('snapshot')
        const canvas = document.getElementById('overlay')
        canvas.width = input.width
        canvas.height = input.height

        const detections = await faceapi
            .detectAllFaces(input)
            //.withFaceLandmarks()
        console.log(detections)
        const detectionsForSize = faceapi
            .resizeResults(detections, { width: input.width, height: input.height })
        console.log(detectionsForSize)
        // draw them into a canvas
        //faceapi.drawLandmarks
        faceapi.drawDetection(canvas, detectionsForSize, { withScore: true })
    }

    async componentDidMount() {
        document.getElementsByTagName('title')[0].innerHTML = "Face2U"
        //init camera video id
        let video = document.getElementsByTagName('video')[0]
        video.setAttribute("id","webcam")
        //load models
        await faceapi.nets.ssdMobilenetv1.load('/models')
        await faceapi.loadTinyFaceDetectorModel('/models')
        //await faceapi.loadMtcnnModel('/models')
        //await faceapi.loadFaceLandmarkModel('/models')
        //await faceapi.loadFaceLandmarkTinyModel('/models')
        //await faceapi.loadFaceRecognitionModel('/models')
        //await faceapi.loadFaceExpressionModel('/models')
        console.log('models load succ')
        //init web camera
        await this.onPlay(video)
        this.props.setLoaded()
        console.log('camera video inited')
    }


    updateTimeStats(timeInMs) {
        let forwardTimes = this.state.forwardTimes
        forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
        //const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
        //$('#time').val(`${Math.round(avgTimeInMs)} ms`)
        //$('#fps').val(`${faceapi.round(1000 / avgTimeInMs)}`)
        this.setState({forwardTimes:forwardTimes})
    }

    resizeCanvasAndResults(dimensions, canvas, results) {
        const { width, height } = dimensions instanceof HTMLVideoElement
            ? faceapi.getMediaDimensions(dimensions)
            : dimensions
        canvas.width = width
        canvas.height = height
        return faceapi.resizeResults(results, { width, height })
    }
    
    drawDetections(dimensions, canvas, detections) {
        //console.log(resizeCanvasAndResults)
        const resizedDetections = resizeCanvasAndResults(dimensions, canvas, detections)
        faceapi.drawDetection(canvas, resizedDetections)
    }
      
    drawLandmarks(dimensions, canvas, results, withBoxes = true) {
        const resizedResults = this.resizeCanvasAndResults(dimensions, canvas, results)
        
        if (withBoxes) {
            faceapi.drawDetection(canvas, resizedResults.map(det => det.detection))
        }
        
        const faceLandmarks = resizedResults.map(det => det.landmarks)
        const drawLandmarksOptions = {
            lineWidth: 2,
            drawLines: true,
            color: 'green'
        }
        faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions)
    }

    async onPlay(videoEl) {
        if(!videoEl.currentTime || videoEl.paused || videoEl.ended)
          return setTimeout(() => this.onPlay(videoEl))

        let inputSize = 512
        let scoreThreshold = 0.5
        let withFaceLandmarks = false
        let withBoxes = true
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
        
        const ts = Date.now()
        const faceDetectionTask = faceapi.detectAllFaces(videoEl, options)
        const results = withFaceLandmarks
          ? await faceDetectionTask.withFaceLandmarks()
          : await faceDetectionTask
        this.updateTimeStats(Date.now() - ts)
        const drawFunction = withFaceLandmarks
          ? this.drawLandmarks
          : this.drawDetections
        drawFunction(videoEl, document.getElementById('overlay'), results, withBoxes)
        setTimeout(() => this.onPlay(videoEl))
    }

    capture = async () => {
        const imageSrc = this.webcam.getScreenshot();
        this.setState({capturedImage:imageSrc})
        let _this = this
    
        const input = document.getElementById('snapshot')
        const detections = await faceapi.detectAllFaces(input)
        const detectionsForSize = faceapi.resizeResults(detections, { width: input.width, height: input.height })
        const canvas = document.getElementById('snapshot-canvas')
        canvas.width = input.width
        canvas.height = input.height
        faceapi.drawDetection(canvas, detectionsForSize, { withScore: true })
        //console.log(detections)

        if(detections.length===0) 
            alert('没有捕获到面部!')
        else {
            let detection = detections[0]
            let image = new Image()
            image.src = imageSrc
            image.onload = () =>{
                let context = document.getElementById('cutted').getContext('2d')
                let sourceX = detection.relativeBox.x*MEDIA_WIDTH
                let sourceY = detection.relativeBox.y*MEDIA_HEIGHT
                let sourceWidth = detection.relativeBox.width*MEDIA_WIDTH
                let sourceHeight = detection.relativeBox.height*MEDIA_HEIGHT
                context.drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,0,0,100,100)
                let splited = context.getImageData(0,0,100,100)
                console.log(splited)

                axios({
                    method:'post',
                    url:serverAddr+'/face_img',
                    crossDomain:true,
                    data:{
                        matrix:splited,
                        width:100,
                        height:100
                    }
                }).then(function (res) {
                    console.log(res.data)
                    _this.props.updateEcharts(res.data.data)
                }).catch(function (error) {
                    console.log(error);
                });
            }
        }
    };
    

    render() {
        const { classes } = this.props;
        const videoConstraints = {
            width: 320,
            height: 240,
            facingMode: "user"
        };
        
        return (
        <div className={classes.root}>
            <Grid container spacing={24}>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <p>Web Camera</p>
                        <div>
                            <canvas 
                                className={classes.overlay}
                                id="overlay">
                            </canvas>
                            <Webcam
                                id="webcam"
                                className={classes.video}
                                audio={false}
                                width={MEDIA_WIDTH}
                                height={MEDIA_HEIGHT}
                                ref={this.setRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                            />
                        </div>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            className={classes.button}
                            onClick={this.capture}
                            >Capture
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <p>SnapShot</p>
                        <canvas 
                            className={classes.overlay}
                            id="snapshot-canvas"
                        />
                        <img 
                            className={classes.captured}
                            id = "snapshot"
                            src={this.state.capturedImage}
                            alt = "captured"
                        />
                    </Paper>
                </Grid>
            </Grid>
        </div>
        );
    }
}

CameraSection.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CameraSection);
