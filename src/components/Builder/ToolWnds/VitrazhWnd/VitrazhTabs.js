
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

export default function VitrazhTabs({tool, layer, ext}) {

  const tabRef = React.useRef(null);
  const [tab, setTab] = React.useState('vert');
  const handleChange = (event, newValue) => setTab(newValue);
  const selection = React.useMemo(() => (tab === 'vert' ? {elm: 1} : (
    tab === 'hor' ? {elm: 0} : {elm: 3}
  )), [tab]);

  React.useEffect(() => {
    const {dp} = tool;
    function update(o, flds) {
      Promise.resolve().then(tool.createProfiles.bind(tool));
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
        <FieldNumberNative _obj={tool.dp} _fld="h" extClasses={ext} fullWidth/>
        {tab === 'overlaps' ?
          <FormControl classes={ext.control} fullWidth readOnly>
            <InputLabel classes={ext.label}>Опора</InputLabel>
            <Input classes={ext.input} readOnly value="Низ"/>
          </FormControl> :
          <FieldSelect
            key={`align-${tab}`}
            _obj={tool.dp}
            _fld={tab === 'vert' ? 'align_by_x' : 'align_by_y'}
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
