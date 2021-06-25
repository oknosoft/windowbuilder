
import React from 'react';
import PropTypes from 'prop-types';
import {Tabs} from 'wb-forms/dist/Common/AntTabs';
import Tab from '@material-ui/core/Tab';
import Dimensions from './Dimensions';

export default function VitrazhTabs({_obj, ext}) {
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
      {value === 1 && <div>Размеры по ширине</div>}
      {value === 2 && <div>Размеры по высоте</div>}
    </div>
  );
}
