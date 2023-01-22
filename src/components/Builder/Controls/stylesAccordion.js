import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  rootExpanded: {
    margin: '0px !important',
  },
  details: {
    display: 'inherit',
    padding: 'unset',
  },
  summary: {
    padding: 0,
    minHeight: 33,
  },
  summaryContent: {
    margin: 0,
  },
  icon: {
    padding: 0,
    marginRight: 0,
    display: 'none',
  },
  summaryExpanded: {
    minHeight: '31px !important',
    margin: '0 !important',
  },

  lshrink: {
    transform: 'translate(0, 12px)',
  },
  lformControl: {
    color: 'inherit',
    cursor: 'pointer',
  },
  iroot: {
    marginLeft: '40%',
    'label + &': {
      marginTop: 0,
    },
  },
  input: {
    cursor: 'pointer',
  },
  control: {
    flex: 1,
    paddingTop: 2,
    borderBottom: '1px solid #e8e8e8',
    background: '#eee'
  },
}));

export default useStyles;
