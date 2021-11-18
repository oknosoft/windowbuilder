import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropField from 'metadata-react/DataField/PropField';

const useStyles = makeStyles(() => ({
  details: {
    display: 'inherit',
    padding: 'unset',
  },
  summary: {
    padding: '0px 8px',
  },
}));

export default function Coordinates({elm, fields, read_only, select_b, select_e}) {
  const classes = useStyles();

  return <Accordion>
    <AccordionSummary classes={{root: classes.summary}} expandIcon={<ExpandMoreIcon />}>
      <Typography>Координаты</Typography>
    </AccordionSummary>
    <AccordionDetails classes={{root: classes.details}}>
      <PropField _obj={elm} _fld="x1" _meta={fields.x1} read_only={read_only} onClick={select_b}/>
      <PropField _obj={elm} _fld="y1" _meta={fields.y1} read_only={read_only} onClick={select_b}/>
      <PropField _obj={elm} _fld="x2" _meta={fields.x2} read_only={read_only} onClick={select_e}/>
      <PropField _obj={elm} _fld="y2" _meta={fields.y2} read_only={read_only} onClick={select_e}/>
    </AccordionDetails>
  </Accordion>;
}

Coordinates.propTypes = {
  elm: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  read_only: PropTypes.bool,
  select_b: PropTypes.func,
  select_e: PropTypes.func,
};
