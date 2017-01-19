import React, {Component, PropTypes} from "react";
import About from "./About";
import classes from "./FrmAbout.scss";


export default class FrmAbout extends Component {

  render() {
    return (

      <div className={classes.loginPaper}>
        <About />
      </div>

    );
  }
}
