import React from 'react';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CompositionFragment from './Fragment';


export default function Composition({prms, classes, dialogRef}) {

  const rows = Array.from(prms.compoundable.keys());
  if(rows.length === 1) {
    const folder = rows[0];
    return <>
      <Typography variant="h6">{folder.name}</Typography>
      <CompositionFragment folder={folder} {...prms} dialogRef={dialogRef}/>
    </>;
  }
  return rows.map((folder) => {
    return <Accordion key={folder.ref} square elevation={0} classes={{expanded: classes.rootExpanded}} defaultExpanded>
      <AccordionSummary classes={{
        root: classes.summary,
        content: classes.summaryContent,
        expanded: classes.summaryExpanded,
        expandIcon: classes.icon,
      }} expandIcon={<ArrowDropDownIcon />}>
        <Typography variant="h6">{folder.name}</Typography>
      </AccordionSummary>
      <AccordionDetails classes={{root: classes.details}}>
        <CompositionFragment folder={folder} {...prms} dialogRef={dialogRef}/>
      </AccordionDetails>
    </Accordion>;
  });
}
