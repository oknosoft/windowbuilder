import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';

function TextWnd({editor}) {
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

TextWnd.propTypes = {
  editor: PropTypes.object.isRequired,
};

export default TextWnd;
