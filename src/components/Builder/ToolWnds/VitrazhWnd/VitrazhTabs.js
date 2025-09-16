
import React from 'react';
import PropTypes from 'prop-types';
import {Tabs, Tab} from 'metadata-react/App/AntTabs';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FieldNumberNative from 'metadata-react/DataField/FieldNumberNative';
import FieldSelect from 'metadata-react/DataField/FieldSelect';
import Sizes from './Sizes';

const padding = {padding: 8};
function meta() {
  const {dp, utils} = $p;
  const {fields} = dp.builder_lay_impost.metadata();
  const align_by_x = utils._clone(fields.align_by_x);
  const align_by_y = utils._clone(fields.align_by_y);
  let index = align_by_x.choice_params[0].path.indexOf('Центр');
  if(index >= 0) {
    align_by_x.choice_params[0].path.splice(index, 1);
  }
  index = align_by_y.choice_params[0].path.indexOf('Центр');
  if(index >= 0) {
    align_by_y.choice_params[0].path.splice(index, 1);
  }
  return {align_by_x, align_by_y};
}

export default function VitrazhTabs({tool, layer, ext}) {

  const tabRef = React.useRef(null);
  const [tab, setTab] = React.useState('vert');
  const [ih, setIh] = React.useState(0);
  const handleChange = (event, newValue) => setTab(newValue);
  const selection = React.useMemo(() => (tab === 'vert' ? {elm: 1} : (
    tab === 'hor' ? {elm: 0} : {elm: 3}
  )), [tab]);

  const {align_by_x, align_by_y} = React.useMemo(meta, []);

  React.useEffect(() => {
    const {dp} = tool;
    function update(o, flds) {
      Promise.resolve().then(() => {
        if(flds && 'h' in flds && o.h !== flds.h) {
          setIh((ih) => ih + 1);
        }
        tool.createProfiles();
      });
    }
    dp._manager.on({update, rows: update});
    return () => dp._manager.off({update, rows: update});
  }, [tool]);

  return (
    <>
      <div style={padding}>
        <FormControl classes={ext.control} fullWidth readOnly>
          <InputLabel classes={ext.label}>Текущий слой</InputLabel>
          <Input classes={ext.input} readOnly value={layer?.presentation()}/>
        </FormControl>
      </div>
      <Tabs value={tab} onChange={handleChange}>
        <Tab value="vert" label="Стойки" />
        <Tab value="hor" label="Ригели" />
        <Tab value="overlaps" label="Перекрытия" />
      </Tabs>
      <div style={padding}>
        <FieldNumberNative key={`h-${ih}`} _obj={tool.dp} _fld="h" extClasses={ext} fullWidth/>
        {tab === 'overlaps' ?
          <FormControl classes={ext.control} fullWidth readOnly>
            <InputLabel classes={ext.label}>Опора</InputLabel>
            <Input classes={ext.input} readOnly value="Низ"/>
          </FormControl> :
          <FieldSelect
            key={`align-${tab}`}
            _obj={tool.dp}
            _fld={tab === 'vert' ? 'align_by_x' : 'align_by_y'}
            _meta={tab === 'vert' ? align_by_x : align_by_y}
            extClasses={ext}
            fullWidth/>}
      </div>
      <div ref={tabRef} style={{ width: '100%' }}>
        <Sizes tabRef={tabRef} obj={tool.dp} ts="sizes" selection={selection}/>
      </div>
    </>
  );
}

VitrazhTabs.propTypes = {
  tool: PropTypes.object.isRequired,
  ext: PropTypes.object,
};
