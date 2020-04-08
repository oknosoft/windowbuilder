import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';

import SelectMode from './Mode';
import Progress from '../../WorkCentersTask/Progress';
import Report1D from '../../WorkCentersTask/Report1D';

const styles = theme => ({
  root: {
    width: '100%',
  },
  head: {
    padding: theme.spacing(),
  },
  backButton: {
    marginRight: theme.spacing(),
  },
  instructions: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    maxHeight: 'calc(100vh - 320px)',
    overflow: 'auto',
  },
});

const steps = ['Выбор профилей', 'Раскрой', 'Анализ'];


class Additions extends React.Component {

  state = {
    activeStep: 0,
    evaluating: true,
    statuses: [],
    mode: 'all',
  };

  componentDidMount() {
    $p.doc.work_centers_task.create().then((doc) => {
      this.doc = doc;
      doc.fill_by_orders([this.props.dialog.ref])
        .then(() => this.setState({evaluating: false}));
    });
  }

  componentWillUnmount() {
    this.doc && this.doc.unload();
  }

  // закидываем обрезки в заказ
  handleCalck() {
    const {props: {dialog}, doc} = this;
    const calc_order = $p.doc.calc_order.get(dialog.ref);
    const {production} = dialog.wnd ? dialog.wnd.elmnts.grids : {};
    doc.cuts.clear({record_kind: 'Расход'});
    doc.cuts.group_by(['nom', 'characteristic'], ['quantity']);
    doc.cuts.forEach((row) => {
      if(!row.quantity) {
        return;
      }
      const order_row = calc_order.production.add({
        nom: row.nom,
        characteristic: row.characteristic,
        quantity: row.quantity,
        qty: row.quantity,
        len: 0,
        width: 0,
      });
      order_row.s = 0;
      if(production) {
        production.refresh_row(order_row);
      }
    });
    return Promise.resolve();
  }

  handleNext = () => {
    const {activeStep} = this.state;
    this.setState({activeStep: activeStep + 1});

    if(activeStep === 0) {
      this.fillAndRun()
        .then(() => {

        })
        .catch(() => null)
        .then(() => {
          this.setState({evaluating: false}, this.handleNext);
        });
    }
  };

  handleBack = () => {
    const {activeStep} = this.state;
    this.setState({activeStep: activeStep - 1});
  };

  handleReset = () => {
    this.setState({activeStep: 0});
  };

  setMode = (mode) => {
    this.setState({mode});
  };

  // вызывается из раскроя
  handleOnStep = (status) => {
    const {nom, characteristic} = status.cut_row;
    const statuses = $p.utils._clone(this.state.statuses);
    let row;
    if(!statuses.some((elm) => {
      if(elm.nom === nom && elm.characteristic === characteristic) {
        row = elm;
        return true;
      }
    })) {
      row = {nom, characteristic};
      statuses.push(row);
    }
    Object.assign(row, status);

    this.setState({statuses});
  };

  fillAndRun() {
    const {state: {mode}, doc} = this;
    this.setState({evaluating: true, statuses: []});

    // чистим документ
    doc.demand.clear();
    doc.cuts.clear();
    doc.cutting.clear();

    // заполняем
    return doc.fill_cutting({clr_only: mode === 'clrs'})
      .then(() => {
        // подключаем визуализацию процесса раскроя и запускаем
        return doc.optimize({onStep: this.handleOnStep});
      });

  }

  getStepContent() {
    const {state: {mode, activeStep, statuses}, setMode, doc} = this;
    switch (activeStep) {
    case 0:
      return <SelectMode mode={mode} setMode={setMode}/>;
    case 1:
      return <List>
        {statuses.map((status, index) => <Progress key={`p-${index}`} status={status}/>)}
      </List>;
    case 2:
      return doc ? <Report1D _obj={doc} hide_head/> : 'Документ пуст';
    default:
      return 'Ошибка шага';
    }
  }

  render() {
    const {props: {classes}, state: {activeStep, evaluating}, doc} = this;

    return (
      <div className={classes.root}>
        <Stepper activeStep={activeStep} classes={{root: classes.head}}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div>
          <div className={classes.instructions}>{this.getStepContent()}</div>
          {!doc && <div>Подготовка данных</div>}
          <div>
            <Button
              disabled={(activeStep === 0) || (activeStep === steps.length - 1) || evaluating}
              onClick={this.handleBack}
              className={classes.backButton}
            >
              Назад
            </Button>
            <Button
              disabled={evaluating}
              variant="contained"
              color="primary"
              onClick={activeStep === steps.length - 1 ? this.handleReset : this.handleNext}
            >
              {activeStep === steps.length - 1 ? 'Сброс' : 'Далее'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

Additions.propTypes = {
  dialog: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Additions);
