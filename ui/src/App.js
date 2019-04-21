import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import './App.css';
import Main from './Main'

const styles = {
  root: {
    flexGrow: 1,
  },
  main:{
    margin:'20px'
  },
  center:{
    textAlign:'center'
  }
};


class App extends React.Component {

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              Face2U
            </Typography>
          </Toolbar>
        </AppBar>
        <main className={classes.main}>
          <Main/>
        </main>
        <footer>
          <div className={classes.center}>
          <h3>
            <span>Author:<a href="https://github.com/XUranus">XUranus</a></span>
            &nbsp;&nbsp;&nbsp;
            <span>Powered By <a href="https://github.com/justadudewhohacks/face-api.js">face-api.js</a></span>
          </h3>
          </div>
        </footer>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);