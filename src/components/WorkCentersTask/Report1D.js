import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

export default function Report1D(props) {
  return [
    <Head key="head" {...props}/>,
    <Table key="table" {...props}/>,
    <Stick key="stick" {...props}/>,
    <Footer key="footer" {...props}/>,
  ];
}

// рисует шапку
function Head(props) {
  return <Typography variant="display1">Head</Typography>;
}

// рисует таблицу по номенклатуре
function Table(props) {
  return <div>Table</div>;
}

// рисует одну палку
function Stick(props) {
  return <div>Stick</div>;
}

// рисует подвал
function Footer(props) {
  return <div>Footer</div>;
}
