import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';

import SelectOrder from './SelectOrder';
import SelectFigure from 'wb-forms/dist/CalcOrder/Templates/SelectFigure';
import SelectSys from 'wb-forms/dist/CalcOrder/Templates/SelectSys';


const {cat: {templates}, job_prm} = $p;
const _obj = templates._select_template;
const {templates_nested} = job_prm.builder;

function TemplatesFrame(props) {
  const [order, setOrder] = React.useState(_obj.calc_order);
  const [step, setStep] = React.useState(0);
  const orderChange = (order) => {
    setStep(0);
    setOrder(order);
  };
  const handleFin = () => {
    if(_obj.base_block.empty() || _obj.base_block.calc_order !== _obj.calc_order) {
      return alert('Не выбрано изделие-шаблон');
    }
    props.handleOk(true);
  };
  return <>
    <SelectOrder _obj={_obj} onChange={orderChange} templates_nested={templates_nested} />
    <div style={{paddingTop: 8}}>
      {step === 0 && templates_nested.includes(order) && <SelectFigure handleNext={() => setStep(1)} />}
      {step === 1 && templates_nested.includes(order) && <SelectSys handleNext={handleFin} />}
    </div>
    <DialogActions>
      <Button disabled={step != 1} onClick={() => setStep(0)}>Назад</Button>
      <div style={{flex: 1}}></div>
      <Button disabled={step != 1} onClick={handleFin}>Ок</Button>
    </DialogActions>
  </>;
}

TemplatesFrame.propTypes = {
  handleSelect: PropTypes.func.isRequired,
};

export default TemplatesFrame;
