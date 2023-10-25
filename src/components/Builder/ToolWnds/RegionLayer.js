import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';

function RegionLayer({editor}) {
  const {tool} = editor;
  const {text} = tool;
  return text ? <div>
      <PropField _obj={text} _fld="text"/>
      <PropField _obj={text} _fld="font_family"/>
      <PropField _obj={text} _fld="bold" ctrl_type="cb"/>
      <PropField _obj={text} _fld="font_size"/>
      <PropField _obj={text} _fld="angle"/>
      <PropField _obj={text} _fld="align" ctrl_type="oselect"/>
      <PropField _obj={text} _fld="clr"/>
      <PropField _obj={text} _fld="x"/>
      <PropField _obj={text} _fld="y"/>
    </div> :
    <div>Элемент текста не выбран</div>;
}

RegionLayer.propTypes = {
  editor: PropTypes.object.isRequired,
};

export function region_layer({Editor, ui: {dialogs}}) {
  dialogs.region_layer = function (project) {
    const current = project.getActiveLayer();
    if(!current || [0, 4].includes(current.kind)) {
      return dialogs.alert({
        title: 'Слой ряда',
        text: 'Текущий слой не выбран либо не может иметь рядов',
        timeout: 180000,
      });
    }
    return dialogs.alert({
      title: 'Слой ряда',
      hide_btn: true,
      timeout: 180000,
      Component: RegionLayer
    });
  };
}
export default RegionLayer;
