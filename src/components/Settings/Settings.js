import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Card, {CardHeader, CardContent} from 'material-ui/Card';
import Radio, {RadioGroup} from 'material-ui/Radio';
import {FormLabel, FormControl, FormControlLabel} from 'material-ui/Form';

import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Switch from 'material-ui/Switch';
import Divider from 'material-ui/Divider';
import Confirm from 'metadata-react/Confirm';

import withStyles from 'material-ui/styles/withStyles';
import withIface from 'metadata-redux/src/withIface';
import withPrm from 'metadata-redux/src/withPrm';

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2,
  },
  demo: {
    minHeight: 240,
    height: '100%',
  },
  paper: {
    padding: theme.spacing.unit * 2,
    height: '100%',
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
});

class Settings extends Component {

  constructor(props) {
    super(props);
    const {zone, couch_path, enable_save_pwd, couch_suffix, couch_direct} = props;

    let hide_price;
    if($p.wsql.get_user_param("hide_price_dealer")){
      hide_price = "dealer";
    }
    else if($p.wsql.get_user_param("hide_price_manufacturer")){
      hide_price = "manufacturer";
    }
    else{
      hide_price = "none";
    }

    let surcharge_internal = $p.wsql.get_user_param("surcharge_internal", "number");
    let discount_percent_internal = $p.wsql.get_user_param("discount_percent_internal", "number");
    let surcharge_disabled;
    if($p.current_user.partners_uids.length){

      // если заданы параметры для текущего пользователя - используем их
      if(!surcharge_internal){

        let partner = $p.cat.partners.get($p.current_user.partners_uids[0]);
        let prm = {calc_order_row: {
            nom: $p.cat.nom.get(),
            characteristic: {params: {find_rows: () => null}},
            _owner: {_owner: {partner: partner}}
          }};

        $p.pricing.price_type(prm);

        $p.wsql.set_user_param("surcharge_internal", surcharge_internal = prm.price_type.extra_charge_external);
        $p.wsql.set_user_param("discount_percent_internal", discount_percent_internal = prm.price_type.discount_external);
      }
    }
    else{
      surcharge_disabled = true;
    }

    this.state = {zone, couch_path, couch_suffix, enable_save_pwd, couch_direct, hide_price,
      confirm_reset: false, surcharge_internal, discount_percent_internal, surcharge_disabled};
  }

  handleSetPrm = () => this.props.handleSetPrm(this.state);

  openConfirm = () => this.setState({confirm_reset: true});

  closeConfirm = () => this.setState({confirm_reset: false});

  resetData = () => {
    this.closeConfirm();
    $p.eve && ($p.eve.redirect = true);
    $p.adapters.pouch.reset_local_data();
  };

  valueToState(name) {
    return (event) => this.setState({[name]: event.target.value});
  }

  componentDidMount() {
    this.shouldComponentUpdate(this.props);
  }

  shouldComponentUpdate({handleIfaceState, title}) {
    const ltitle = 'Настройки';
    if(title != ltitle) {
      handleIfaceState({
        component: '',
        name: 'title',
        value: ltitle,
      });
      return false;
    }
    return true;
  }

  render() {
    const {classes} = this.props;
    const {zone, couch_path, enable_save_pwd, couch_suffix, couch_direct, confirm_reset, hide_price,
      surcharge_internal, discount_percent_internal, surcharge_disabled} = this.state;



    return (
      <div>
        <Grid container className={classes.root}>

          <Grid item sm={12} md={6}>
            <Grid
              container
              className={classes.demo}
              align="stretch"
              justify="center"
            >
              <Card className={classes.paper}>
                <CardHeader title="Подключение к базе данных" />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Адрес CouchDB"
                  InputProps={{placeholder: 'couch_path'}}
                  helperText="Абсолютный либо относительный путь CouchDB"
                  onChange={this.valueToState('couch_path')}
                  value={couch_path}/>

                <TextField
                  fullWidth
                  margin="dense"
                  label="Область данных"
                  InputProps={{placeholder: 'zone'}}
                  helperText="Значение разделителя данных"
                  onChange={this.valueToState('zone')}
                  value={zone}/>

                <TextField
                  fullWidth
                  margin="dense"
                  label="Суффикс пользователя"
                  InputProps={{placeholder: 'couch_suffix'}}
                  helperText="Назначается дилеру при регистрации"
                  onChange={this.valueToState('couch_suffix')}
                  value={couch_suffix}/>

                <FormControlLabel
                  control={
                    <Switch
                      onChange={(event, checked) => this.setState({couch_direct: checked})}
                      checked={couch_direct}/>
                  }
                  label="Прямое подключение без кеширования"
                />

                <FormControlLabel
                  control={
                    <Switch
                      onChange={(event, checked) => this.setState({enable_save_pwd: checked})}
                      checked={enable_save_pwd}/>
                  }
                  label="Разрешить сохранение пароля"
                />
              </Card>
            </Grid>
          </Grid>

          <Grid item sm={12} md={6}>
            <Grid
              container
              className={classes.demo}
              align="stretch"
              justify="center"
            >
              <Card className={classes.paper}>
                <CardHeader
                  title="Колонки цен"
                  subheader="Настройка видимости колонок в документе 'Расчет' и графическом построителе"
                />
                <CardContent>
                  <RadioGroup
                    className={classes.group}
                    value={hide_price}
                    onChange={this.handleChange}
                  >
                    <FormControlLabel value="none" control={<Radio/>} label="Показывать все цены"/>
                    <FormControlLabel value="dealer" control={<Radio/>} label="Скрыть цены дилера"/>
                    <FormControlLabel value="manufacturer" control={<Radio/>} label="Скрыть цены завода"/>

                  </RadioGroup>
                </CardContent>
              </Card>

              <Card className={classes.paper}>
                <CardHeader
                  title="Наценки и скидки"
                  subheader="Значения наценки и скидки по умолчанию, которые дилер предоставляет своим (конечным) покупателям"
                />
                <CardContent>

                  <TextField
                    fullWidth
                    margin="dense"
                    label="Наценка дилера, %"
                    InputProps={{placeholder: 'surcharge_internal'}}
                    helperText="Наценка относительно цены производителя"
                    onChange={this.valueToState('surcharge_internal')}
                    value={surcharge_internal}
                    disabled={surcharge_disabled}
                  />

                </CardContent>
              </Card>
            </Grid>
          </Grid>

        </Grid>

        <Confirm
          title="Сброс данных"
          text="Уничтожить локальные данные и пересоздать базы в IndexedDB браузера?"
          handleOk={this.resetData}
          handleCancel={this.closeConfirm}
          open={confirm_reset}
        />
      </div>
    );
  }
}


Settings.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withIface(withPrm(Settings)));
