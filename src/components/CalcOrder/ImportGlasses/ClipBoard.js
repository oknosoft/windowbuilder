import React from 'react';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import {execute} from './data';

const {wsql} = $p;

export default function ClipBoard(props) {

  const [flipFormula, setFlipFormula] = React.useState(wsql.get_user_param('flip_formula', 'boolean'));
  const [triangles, setTriangles] = React.useState(false);
  const [flipTriangles, setFlipTriangles] = React.useState(false);

  const {handleOk, obj, wnd} = props;
  const textRef = React.createRef();
  const onKeyDown = (event) => {
    const {key} = event;
    if(key === 'Backspace' || key === 'Delete') {
      //event.preventDefault();
      //event.stopPropagation();
    }
    if(key === 'Tab') {
      if (!event.shiftKey) {
        event.preventDefault();
        const value = textRef.current.value;
        const selectionStart = textRef.current.selectionStart;
        const selectionEnd = textRef.current.selectionEnd;
        textRef.current.value = value.substring(0, selectionStart) + '⟶' + value.substring(selectionEnd);
        textRef.current.selectionStart = selectionEnd + 1 - (selectionEnd - selectionStart);
        textRef.current.selectionEnd = selectionEnd + 1 - (selectionEnd - selectionStart);
      }
    }
  };
  const onPaste = async (event) => {
    const {clipboardData} = event;
    event.preventDefault();
    try {
      textRef.current.value = clipboardData.getData('text/plain').replace(/\t/g, '⟶');
    }
    catch (e) {}
  };
  const onOk = () => {
    execute({
      obj,
      text: textRef.current.value.replace(/⟶/g, '\t'),
      wnd,
      flipFormula,
      triangles,
      flipTriangles
    });
    handleOk();
  };

  return <>
    <Toolbar disableGutters>
      <FormControlLabel
        control={<Checkbox color="primary" checked={flipFormula} onChange={({target}) => {
          wsql.set_user_param('flip_formula', target.checked);
          setFlipFormula(target.checked);
        }} />}
        label="Перевернуть формулу"
      />
      <FormControlLabel
        control={<Checkbox color="primary" checked={triangles} onChange={({target}) => setTriangles(target.checked)} />}
        label="Треугольники"
      />
      <FormControlLabel
        control={<Checkbox color="primary" checked={flipTriangles} onChange={({target}) => setFlipTriangles(target.checked)} />}
        label="Перевернуть треугольники"
      />
    </Toolbar>
    <textarea
      ref={textRef}
      placeholder="Вставьте содержимое буфера обмена или введите текст..."
      style={{
        fontFamily: 'monospace',
        minWidth: 500,
        width: 'calc(100% - 8px)',
        minHeight: 420,
      }}
      onPaste={onPaste}
      onKeyDown={onKeyDown}
    />
    <div style={{display: 'flex'}}>
      <span style={{flex: 1}}/>
      <Button onClick={onOk}>Ок</Button>
    </div>
  </>;
}
