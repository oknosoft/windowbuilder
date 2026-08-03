
import {PromisifiedChannel} from '../../sw/messageChannel';
import {idbChannel} from '../../sw/idbChannel';

export function message_channel({utils}) {
  utils.idbChannel = idbChannel;
  utils.messageChannel = new PromisifiedChannel(event => {

  });
}
