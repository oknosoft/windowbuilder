import {withStyles} from '@material-ui/styles';
import {light} from '@material-ui/core/styles/createPalette';
import transitions from '@material-ui/core/styles/transitions';

export default withStyles({
  list: {
    width: 300,
    flex: 'initial',
  },
  root: {
    width: '100%',
    maxWidth: 360,
    background: light.background.paper,
  },
  flex: {
    flex: 1,
  },
  bar: {
    height: 48,
  },
  bold: {
    fontWeight: 'bold',
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: transitions.create('transform', {
      duration: transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  pointer: {cursor: 'pointer'},
});
