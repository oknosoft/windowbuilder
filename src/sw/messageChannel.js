
export class PromisifiedChannel extends BroadcastChannel {

  constructor(onMessage, name = 'channel4') {
    super(name);
    const echo = (event) => {
      if(!onMessage?.(event) && event.data?.stamp) {
        this.postMessage({type: event.data.type, stamp: event.data.stamp, ok: true});
      }
    };
    this.addEventListener('message', echo);
  }

  exchange(data) {
    return new Promise((resolve, reject) => {
      const stamp = Date.now() + Math.random();
      const receiver = (event) => {
        if(event.data.stamp === stamp) {
          clearTimeout(timer);
          this.removeEventListener('message', receiver);
          resolve(event.data);
        }
      };
      const aborter = () => {
        this.removeEventListener('message', receiver);
        reject(new Error('timeout'));
      };
      this.addEventListener('message', receiver);
      this.postMessage({...data, stamp});
      const timer = setTimeout(aborter, 5000);
    });
  }

}
