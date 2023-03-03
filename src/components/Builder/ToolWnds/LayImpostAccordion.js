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
import DataField from 'metadata-react/DataField/PropField';
import FieldSelectStatic from 'metadata-react/DataField/FieldSelectStatic';
import FieldNumberNative from 'metadata-react/DataField/FieldNumberNative';
import useStyles from '../Controls/stylesAccordion';

export default function LayImpostAccordion({direction, profile, inserts}) {
  const classes = useStyles();

  return <Accordion square elevation={0} classes={{expanded: classes.rootExpanded}} defaultExpanded>
    <AccordionSummary classes={{
      root: classes.summary,
      content: classes.summaryContent,
      expanded: classes.summaryExpanded,
      expandIcon: classes.icon,
    }} expandIcon={<ArrowDropDownIcon />}>
      <FormControl classes={{root: classes.control}}>
        <InputLabel classes={{shrink: classes.lshrink, formControl: classes.lformControl}}>
          {`Деление по ${direction.toUpperCase()}`}
        </InputLabel>
        <Input
          classes={{root: classes.iroot, input: classes.input}}
          readOnly
          value={'\u00A0'}
          endAdornment={<InputAdornment position="end" classes={{root: classes.input}}>
            <ArrowDropDownIcon />
          </InputAdornment>}
        />
      </FormControl>
    </AccordionSummary>
    <AccordionDetails classes={{root: classes.details}}>
      <DataField _obj={profile} _fld={`inset_by_${direction}`} Component={FieldSelectStatic} options={inserts}/>
      <DataField _obj={profile} _fld={`elm_by_${direction}`} Component={FieldNumberNative}/>
      <DataField _obj={profile} _fld={`step_by_${direction}`} Component={FieldNumberNative}/>
      <DataField _obj={profile} _fld={`align_by_${direction}`} />
    </AccordionDetails>
  </Accordion>;

}

