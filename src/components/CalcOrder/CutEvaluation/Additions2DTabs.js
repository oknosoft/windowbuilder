import React from 'react';
import {Tabs} from 'metadata-react/App/AntTabs';
import Tab from '@material-ui/core/Tab';

export default function Additions2DTabs({tab, setTab}) {

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return <Tabs value={tab} onChange={handleChange}>
    <Tab value="cuts_in" label="Заготовки"/>
    <Tab value="cutting" label="Раскрой"/>
    <Tab value="cuts_out" label="Обрезь"/>
    <Tab value="report" label="Отчет"/>
  </Tabs>;
}
