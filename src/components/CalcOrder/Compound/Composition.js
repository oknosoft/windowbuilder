import React from 'react';
import CompositionFragment from './Fragment';

export default class Composition extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {dialog: {ref, _mgr}} = props;
    const obj = _mgr.get(ref);
    const {job_prm: {properties: {compoundable}}, cch: {properties}} = $p;
    this.prms = {obj, compoundable: new Map(), composition: obj.composition.toJSON()};
    for(const ref in compoundable) {
      const param = properties.get(ref);
      const folder = compoundable[ref];
      this.prms.compoundable.set(folder, {param, inserts: folder._children()});
    }
  }

  handleCalck(attr) {
    console.log(attr);
  }

  render() {
    const {prms, props: {dialogRef}} = this;
    return Array.from(prms.compoundable.keys())
      .map((folder, pkey) => {
        return <CompositionFragment key={`${pkey}`} folder={folder} {...prms} dialogRef={dialogRef}/>;
      });
  }
}
