
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';

import SelectProd from './SelectProd';
import MainProps from './MainProps';
import SubProps from './SubProps';

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
  return ['Выбор изделий', 'Основные свойства', 'Дополнительные свойства'];
}

function getStepContent(stepIndex, props) {
  switch (stepIndex) {
  case 0:
    return <SelectProd {...props}/>;
  case 1:
    return <MainProps {...props}/>;
  case 2:
    return <SubProps {...props}/>;
  default:
    return 'Unknown stepIndex';
  }
}

export default function HorizontalStepper({setReady, ...props}) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setReady(activeStep === steps.length - 2);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setReady(false);
  };


  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        <div className={classes.cont}>
          {getStepContent(activeStep, props)}
        </div>
        <div>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            className={classes.backButton}
          >
            Назад
          </Button>
          <Button
            disabled={activeStep === steps.length - 1}
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
