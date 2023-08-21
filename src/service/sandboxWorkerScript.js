(() => {
  const ___store = [];
  let key;
  self.addEventListener('message', async (ev) => {
    switch (ev.data.type) {
      case 'init.key': {
        key = ev.data.key;
        sendBack({ type: 'init.ready', key });
        break;
      }
      case 'eval.request': {
        const { doStore, doAwait, withStore, args, body, doReturn, doMessage, doReturnError } = ev.data.evalData;
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
            return sendBack({ type: 'eval.result', storeIndex: doStore ? ___store.length - 1 : null, evalResult: doReturn ? r : null, msgId: ev.data.msgId, key });
        } catch (er) {
          if (doMessage)
            return sendBack({ type: 'eval.result', error: doReturnError ? er : true, msgId: ev.data.msgId, key });
        }
        break;
      }
    }
  });
  function sendBack(fullData) {
    self.postMessage(fullData);
  }
  sendBack({ type: 'init.listening' });
})();