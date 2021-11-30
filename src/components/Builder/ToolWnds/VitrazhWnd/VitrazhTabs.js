
import React from 'react';
import PropTypes from 'prop-types';
import {Tabs} from 'metadata-react/App/AntTabs';
import Tab from '@material-ui/core/Tab';
import Dimensions from './Dimensions';
import Sizes from './Sizes';

export default function VitrazhTabs({editor, ext}) {

  const {tool} = editor;
  const {_obj} = tool;

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Tabs
        //orientation="vertical"
        //variant="scrollable"
        value={value}
        onChange={handleChange}
      >
        <Tab label="Габариты" />
        <Tab label="Ширины" />
        <Tab label="Высоты" />
      </Tabs>
      {value === 0 && <Dimensions _obj={_obj} ext={ext}/>}
      {value === 1 && <Sizes _obj={_obj} elm={0}/>}
      {value === 2 && <Sizes _obj={_obj} elm={1}/>}
    </div>
  );
}

VitrazhTabs.propTypes = {
  editor: PropTypes.object.isRequired,
  ext: PropTypes.object,
};
