import React from 'react';
import PropTypes from 'prop-types';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import PropField from 'metadata-react/DataField/PropField';
import FieldNumberNative from 'metadata-react/DataField/FieldNumberNative';
import FieldCheckbox from 'metadata-react/DataField/FieldCheckbox';
import useStyles from './stylesAccordion';
import {useOpenContext} from './index';

export default function Coordinates({elm, fields, read_only, select_b, select_e}) {
  const {x1, y1, x2, y2, _row} = elm;
  const classes = useStyles();
  let text = `[${x1}, ${y1}] [${x2}, ${y2}]`;
  if(!read_only) {
    text += ` [${_row.alp1.toFixed()}°, ${_row.alp2.toFixed()}°]`;
  }

  const {open, openChange} = useOpenContext();
  const onChange = (e, coordinates) => {
    openChange({coordinates});
  };

  return <Accordion square elevation={0} classes={{expanded: classes.rootExpanded}} expanded={open.coordinates} onChange={onChange}>
    <AccordionSummary classes={{
      root: classes.summary,
      content: classes.summaryContent,
      expanded: classes.summaryExpanded,
      expandIcon: classes.icon,
    }} expandIcon={<ArrowDropDownIcon />}>
      <FormControl classes={{root: classes.control}}>
        <InputLabel classes={{shrink: classes.lshrink, formControl: classes.lformControl}}>
          Координаты
        </InputLabel>
        <Input
          classes={{root: classes.iroot, input: classes.input}}
          readOnly
          value={text}
          endAdornment={<InputAdornment position="end" classes={{root: classes.input}}>
            <ArrowDropDownIcon />
          </InputAdornment>}
        />
      </FormControl>
    </AccordionSummary>
    <AccordionDetails classes={{root: classes.details}}>
      {read_only ? null : <PropField Component={FieldNumberNative} _obj={elm} _fld="offset" _meta={fields.offset}/>}
      {read_only ? null : <PropField Component={FieldNumberNative} _obj={elm} _fld="r" _meta={fields.r} allowNegative={false}/>}
      {read_only ? null : <PropField Component={FieldNumberNative} _obj={elm} _fld="arc_h" _meta={fields.arc_h} allowNegative={false}/>}
      {read_only ? null : <PropField Component={FieldCheckbox} _obj={elm} _fld="arc_ccw" _meta={fields.arc_ccw} allowNegative={false}/>}
      <PropField Component={FieldNumberNative} _obj={elm} _fld="x1" _meta={fields.x1} readOnly={read_only} onClick={select_b}/>
      <PropField Component={FieldNumberNative} _obj={elm} _fld="y1" _meta={fields.y1} readOnly={read_only} onClick={select_b}/>
      <PropField Component={FieldNumberNative} _obj={elm} _fld="x2" _meta={fields.x2} readOnly={read_only} onClick={select_e}/>
      <PropField Component={FieldNumberNative} _obj={elm} _fld="y2" _meta={fields.y2} readOnly={read_only} onClick={select_e}/>
    </AccordionDetails>
  </Accordion>;

}

/*

 */

Coordinates.propTypes = {
  elm: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  read_only: PropTypes.bool,
  select_b: PropTypes.func,
  select_e: PropTypes.func,
};
