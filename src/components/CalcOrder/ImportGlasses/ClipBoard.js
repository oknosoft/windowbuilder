import React from 'react';
import Button from '@material-ui/core/Button';

export function ClipBoard(props) {

  const {execute, handleOk, obj, wnd} = props;
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
    execute(obj, textRef.current.value.replace(/⟶/g, '\t'), wnd);
    handleOk();
  };

  return <>
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
