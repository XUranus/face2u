import React, { Component } from 'react';
import CameraSection from './CameraSection'
import ChartsSection from './ChartsSection'
import PropTypes  from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const styles = theme=> ({
    root: {
        flexGrow: 1,
    },
    paper: {
        height:580,
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    split:{
        'margin-top':'50px',
        'padding-left':'30%'
    }
});

class Main extends Component {

    state = {
        echartsData:[0,0,0,0,0,0,0],
        loaded:false
    }

    updateEcharts(data) {
        this.setState({echartsData:data})
    }

    setLoaded() {
        this.setState({loaded:true})
    }

    render() {
        const { classes } = this.props;
        const echartsData = this.state.echartsData
        return (
            <div>
            {this.state.loaded?null:<div><LinearProgress /><br/></div>}
            <CameraSection setLoaded={this.setLoaded.bind(this)} updateEcharts={this.updateEcharts.bind(this)}/>
            <ChartsSection data={this.state.echartsData}/>
            </div>
        );
    }
}

Main.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Main);
