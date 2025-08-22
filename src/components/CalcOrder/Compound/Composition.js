import React from 'react';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CompositionFragment from './Fragment';


export default class Composition extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {dialog: {ref, _mgr}} = props;
    const obj = _mgr.get(ref);
    const {job_prm: {properties: {compoundable}}, cat: {inserts}} = $p;
    this.prms = {obj, compoundable: new Map(), composition: obj.composition.toJSON()};
    for(const ref in compoundable) {
      const param = compoundable[ref];
      const folder = inserts.get(ref);
      this.prms.compoundable.set(folder, {param, inserts: folder._children()});
    }
  }

  handleCalck(attr) {
    console.log(attr);
  }

  render() {
    const {prms, props: {dialogRef, classes}} = this;
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
}
