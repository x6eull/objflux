/* eslint-disable no-undef */
(() => {
  const key = __key;
  __key = null;
  ___store = [];
  self.addEventListener('message', async (ev) => {
    if (ev.data.type !== 'eval.request')
      return;
    const { evalData } = ev.data;
    if (evalData) {
      const { doStore, doAwait, withStore, args, body, doReturn, doMessage, doReturnError } = evalData;
      const useStore = typeof withStore === 'number';
      try {
        const fargList = (useStore ? 'store,' : '') + '...args';
        const fargs = useStore ? [___store[withStore], ...args] : [...args];
        let r = (new Function(fargList, body))(...fargs);
        if (doAwait)
          r = await r;
        if (doStore)
          ___store.push(r);
        if (doMessage)
          sendBack({ type: 'eval.result', storeIndex: doStore ? ___store.length - 1 : null, evalResult: doReturn ? r : null, msgId: ev.data.msgId, key });
      } catch (er) {
        if (doMessage)
          sendBack({ type: 'eval.result', error: doReturnError ? er : true, msgId: ev.data.msgId, key });
      }
    }
  });
  function sendBack(fullData) {
    self.postMessage(fullData);
  }
  sendBack({ type: 'init.ok', key });
})();