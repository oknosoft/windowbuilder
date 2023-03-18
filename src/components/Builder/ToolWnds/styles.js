import {makeStyles} from '@material-ui/core/styles';

export const useStyles = makeStyles(({spacing}) => ({
  root: {
    paddingTop: spacing(),
    paddingLeft: spacing(),
    paddingRight: spacing(),
  },
}));
