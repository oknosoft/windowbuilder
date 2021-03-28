import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import qs from 'qs';

import {steps, stepContent} from './stepContent';
import CloseBtn from 'wb-forms/dist/Common/CloseBtn';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  pointer: {
    cursor: 'pointer !important',
  },
  flex: {
    display: 'flex',
  },
  full: {
    flex: 1,
  }
}));

const prm = () => qs.parse(location.search.replace('?',''));

function TemplatesFrame(props) {
  const classes = useStyles();
  let {order, ref, action = 'refill'} = prm();
  let [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    const {cat: {templates}, ui: {dialogs}, utils} = $p;
    if(activeStep === 0 && templates._select_template.calc_order.empty()) {
      return dialogs.alert({text: `Не выбран заказ-шаблон`, title: 'Пустой заказ'});
    }
    if([1, 2].includes(activeStep) && templates._select_template.base_block.empty()) {
      return dialogs.alert({text: `Не выбрано изделие-шаблон`, title: 'Пустой шаблон'});
    }
    if(activeStep === steps.length - 1) {
      if(templates._select_template.refill && templates._select_template.base_block.empty()) {
        return dialogs.alert({text: `Взведён признак перезаполнить по системе, но система не выбрана`, title: 'Пустая система'});
      }
      if(!order) {
        return dialogs.alert({text: `Не задан заказ назначения в url`, title: 'Пустой заказ'});
      }
      if(!utils.is_guid(ref)) {
        action = 'new';
        ref = utils.generate_guid();
      }
      props.handleNavigate(`/builder/${ref}?order=${order}&action=${action}`);
    }
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    if(activeStep === 0) {
      if(action === 'new') {
        const ox = $p.cat.characteristics.get(ref);
        if(ox.is_new() && ox.calc_order_row) {
          ox.calc_order.production.del(ox.calc_order_row);
          ox.unload();
        }
        return props.history.goBack();
      }
      return props.handleNavigate(`/builder/${ref}?order=${order}&action=cancel`);
    }
    setActiveStep(prevStep => prevStep - 1);
  };

  return (
    <Stepper activeStep={activeStep} orientation="vertical">
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel
            classes={{root: classes.pointer, label: classes.flex}}
            onClick={() => setActiveStep(index)}
          >
            <div className={classes.full}>{label}</div>
            {index === 0 && <CloseBtn handleClose={() => {
              activeStep = 0;
              handleBack();
            }}/>}
          </StepLabel>
          <StepContent>
            {stepContent(index, {handleNext, handleBack, props, order})}
            <div className={classes.actionsContainer}>
              <div>
                <Button
                  onClick={handleBack}
                  className={classes.button}
                >
                  {activeStep === 0 ? 'Отмена' : 'Назад'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  className={classes.button}
                >
                  {activeStep === steps.length - 1 ? 'Завершить' : 'Далее'}
                </Button>
              </div>
            </div>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}

TemplatesFrame.propTypes = {
  history: PropTypes.object.isRequired,
  handleNavigate: PropTypes.func.isRequired,
};

export default TemplatesFrame;
