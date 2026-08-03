import React, {Component} from 'react';
import {withStyles} from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {styleSheet} from '../About/About'

const initState = {useOffline: false, forceOffline: false};
async function onMount(setState, idbChannel) {
  setState({
    useOffline: await idbChannel.get('useOffline'),
    forceOffline: await idbChannel.get('forceOffline'),
  });
}

const disabled = !process.env.ENABLE_OFFLINE;

function OfflineSetting({classes}) {

  const [state, setState] = React.useState(initState);
  const {idbChannel, messageChannel} = $p.utils;

  React.useEffect(() => {
    onMount(setState, idbChannel);
  }, []);

  const setUseOffline = async (v) => {
    await idbChannel.set('useOffline', v);
    await messageChannel.postMessage({type: 'useOffline', value: v});
    let {forceOffline} = state;
    if(!v && forceOffline) {
      forceOffline = v;
      await idbChannel.set('forceOffline', v);
      await messageChannel.postMessage({type: 'forceOffline', value: v});
    }
    setState({forceOffline, useOffline: v});
  };

  const setForceOffline = async (v) => {
    await idbChannel.set('forceOffline', v);
    await messageChannel.postMessage({type: 'forceOffline', value: v});
    setState({...state, forceOffline: v});
  };

  return <div className={classes.root}>
    <Grid container spacing={2}>
      <Grid item md={1} lg={2} xl={3} />
      <Grid item xs={12} sm={12} md={11} lg={10} xl={8}>

        <Typography component="h1" variant="h4" color="primary">Управление автономным режимом</Typography>
        <Typography color="primary">Кеш справочников и документов, позволяет продолжить работу при недоступности сервера</Typography>

        <FormGroup>
          <FormControl>
            <FormControlLabel
              control={<Switch
                disabled={disabled}
                onChange={(event, checked) => setUseOffline(checked)}
                checked={state.useOffline}/>}
              label={"Запоминать ответы сервера"}
            />
            <FormHelperText style={{marginTop: -4}}>{state.useOffline ? "Запросы к серверу, кешируются в хранилище браузера" : "Кеширование не используется"}</FormHelperText>
          </FormControl>

          <FormControl>
            <FormControlLabel
              control={<Switch
                disabled={disabled}
                onChange={(event, checked) => setForceOffline(checked)}
                checked={state.forceOffline}/>}
              label={"Форсировать автономный режим"}
            />
            <FormHelperText style={{marginTop: -4}}>{state.forceOffline ? "По кнопке 'записать', данные на сервер не отправляются. Для доставки изменений в облако, требуется синхронизация" : "Изменения изделий и заказов, отправляются на сервер как обычно - промежуточное хранилище не используется"}</FormHelperText>
          </FormControl>
        </FormGroup>


      </Grid>
    </Grid>
  </div>;
}

export default withStyles({root: {...styleSheet.root, marginTop: 32}})(OfflineSetting);
