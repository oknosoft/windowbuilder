import React from 'react';
import Additions2DTabs from './Additions2DTabs';
import Additions2DCutsIn from './Additions2DCutsIn';
import Additions2DCutsOut from './Additions2DCutsOut';
import Additions2DCutting from './Additions2DCutting';
import Additions2DReport from './Additions2DReport';

class Additions2D extends React.Component {

  state = {tab: 'cuts_in'};

  componentDidMount() {
    $p.doc.work_centers_task.create().then((doc) => {
      doc.fill_by_orders([this.props.dialog.ref])
        .then(() => doc.fill_cutting({linear: false, c2d: true}))
        .then(() => {
          this.doc = doc.fill_cuts();
          this.forceUpdate();
        });
    });
  }

  componentWillUnmount() {
    this.doc && this.doc.unload();
  }

  handleCalck(attr) {
    if(attr.pre) { // удалить обрезь

    }
    else if (attr.calck) { // добавить в изделия

    }
    else {  // добавить в заказ

    }
    return Promise.resolve({close: true});
  }

  setTab = (tab) => {
    this.setState({tab});
  };

  render() {
    const {state: {tab}, setTab, doc, div} = this;
    return <>
      <Additions2DTabs tab={tab} setTab={setTab}/>
      <div style={{position: 'relative', width: '100%', height: 'calc(100% - 58px)'}} ref={(el => this.div = el)}>
        {tab === 'cuts_in' && doc && <Additions2DCutsIn obj={doc} div={div} />}
        {tab === 'cuts_out' && doc && <Additions2DCutsOut obj={doc} div={div}/>}
        {tab === 'cutting' && doc && <Additions2DCutting obj={doc} div={div}/>}
        {tab === 'report' && doc && <Additions2DReport obj={doc} div={div}/>}
      </div>
    </>;
  }
}

export default Additions2D;
