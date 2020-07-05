
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';

import SelectProd from './SelectProd';
import Editor from './Editor';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  backButton: {
    marginRight: theme.spacing(),
  },
  instructions: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  cont: {
    minHeight: 320,
    marginBottom: theme.spacing(),
  }
}));

function getSteps() {
  return ['Выбор изделия', 'Выбор створки'];
}

function getStepContent({step, ...props}) {
  switch (step) {
  case 0:
    return <SelectProd {...props}/>;
  case 1:
    return <Editor {...props}/>;
  default:
    return 'Unknown stepIndex';
  }
}

export default function HorizontalStepper({step, setStep, sz_product, ...props}) {
  const classes = useStyles();
  const steps = getSteps();

  const handleNext = () => {
    if(!sz_product) {
      $p.ui.dialogs.alert({title: 'Выбор размеров', text: 'Укажите изделие'});
    }
    else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };


  return (
    <div className={classes.root}>
      <Stepper activeStep={step} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        <div className={classes.cont}>
          {getStepContent({step, handleNext, sz_product, ...props})}
        </div>
        <div>
          <Button
            disabled={step === 0}
            onClick={handleBack}
            className={classes.backButton}
          >
            Назад
          </Button>
          <Button
            disabled={step === steps.length - 1}
            variant="contained"
            color="primary"
            onClick={handleNext}>
            Далее
          </Button>
        </div>
      </div>
    </div>
  );
}

HorizontalStepper.propTypes = {
  step: PropTypes.number,
  setStep: PropTypes.func,
  sz_product: PropTypes.object,
  setProduct: PropTypes.func,
  setSizes: PropTypes.func,
};
