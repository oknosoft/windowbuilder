import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'metadata-react/Markdown/MarkdownDocsLight';
import {withIface} from 'metadata-redux';

const MarkdownDocs = withIface(Markdown);

export default function MarkdownRoute(props) {
  const [value, setValue] = React.useState('Получаем файл с сервера...');

  let fname = location.pathname.replace('/help', '');
  if(fname.startsWith('/')) {
    fname = fname.substr(1);
  }
  else if(!fname) {
    props.history.push(`${location.pathname}/`);
  }
  fetch(`${$p.job_prm.docs_root}${fname || 'index.md'}`)
    .then((res) => {
      return res.text();
    })
    .then((markdown) => {
      setValue(markdown);
    })
    .catch((err) => setValue(err.message || err));

  return <MarkdownDocs markdown={value}  />;
}

MarkdownRoute.propTypes = {
  history: PropTypes.object.isRequired,
};





