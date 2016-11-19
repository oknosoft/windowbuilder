import React, {Component, PropTypes} from "react";

import {Tabs, Tab} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import Divider from 'material-ui/Divider';
import DataField from 'components/DataField'

import CircularProgress from "material-ui/CircularProgress";

import classes from "./User.scss";

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: '8px'
  },
  block: {
    //flex: '1 100%',
    fontWeight: 'bold'
  }
}

export default class UserObj extends Component {

  static contextTypes = {
    screen: React.PropTypes.object.isRequired
  }

  static propTypes = {

    _obj: PropTypes.object,
    _acl: PropTypes.string.isRequired,

    handleSave: PropTypes.func.isRequired,
    handleRevert: PropTypes.func.isRequired,
    handleMarkDeleted: PropTypes.func.isRequired,
    handlePost: PropTypes.func.isRequired,
    handleUnPost: PropTypes.func.isRequired,
    handlePrint: PropTypes.func.isRequired,
    handleAttachment: PropTypes.func.isRequired,
    handleValueChange: PropTypes.func.isRequired,
    handleAddRow: PropTypes.func.isRequired,
    handleDelRow: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      tab_value: 'a',
      btn_login_disabled: !this.props.login || !this.props.password
    };
  }

  tabChange = (tab_value) => {
    if(tab_value === 'a' || tab_value === 'b'){
      this.setState({
        tab_value: tab_value,
      });
    }
  };

  handleSetPrm(){
    this.props.handleSetPrm({
      zone: this.state.zone,
      couch_path: this.state.couch_path,
      enable_save_pwd: this.state.enable_save_pwd
    })
  }

  handleLogOut = () => {
    this.props.handleLogOut()
  }

  handleSave(){

  }

  handleSend(){

  }

  handleMarkDeleted(){

  }

  handlePrint(){

  }

  handleAttachment(){

  }


  render() {

    const { screen } = this.context

    return (


        <div className={classes.paper}>

          {
            this.props._obj

              ?

              <Paper zDepth={3} rounded={false}>

                <Tabs
                  value={this.state.tab_value}
                  onChange={this.tabChange}
                >
                  <Tab label="Профиль" value="a">

                    <div className={classes.sub_paper}>

                      <div className={classes.cont}>

                        <DataField _obj={this.props._obj} _fld="id" />
                        <DataField _obj={this.props._obj} _fld="name" />
                        <DataField _obj={this.props._obj} _fld="department" />


                      </div>

                      <br />
                      <Divider />

                      <RaisedButton label="Выйти"
                                    className={classes.button}
                                    onTouchTap={this.handleLogOut}/>

                    </div>

                  </Tab>

                  <Tab label="Подключение" value="b">

                    <div className={classes.sub_paper}>

                      <TextField
                        ref="zone"
                        floatingLabelText="Область данных"
                        hintText="zone"
                        fullWidth={true}
                        defaultValue={this.props.zone}
                      />

                      <TextField
                        ref="couch_path"
                        floatingLabelText="Адрес CouchDB"
                        hintText="couch_path"
                        fullWidth={true}
                        defaultValue={this.props.couch_path}
                      />

                      <Toggle
                        ref="enable_save_pwd"
                        label="Разрешить сохранение пароля"
                        className={classes.toggle}
                        defaultToggled={this.props.enable_save_pwd}
                      />

                      <br />
                      <Divider />

                      <RaisedButton label="Сохранить настройки"
                                    className={classes.button}
                                    onTouchTap={::this.handleSetPrm}/>

                    </div>

                  </Tab>

                </Tabs>

              </Paper>

              :
              <div >
                <CircularProgress size={120} thickness={5} className={classes.progress} />
              </div>
          }

        </div>

    );
  }
}

