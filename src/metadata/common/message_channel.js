
import {PromisifiedChannel} from '../../sw/messageChannel';

export function message_channel({utils}) {
  utils.messageChannel = new PromisifiedChannel(event => {

  });
}
