/*eslint-env worker*/
(() => {
  const store = [];
  const openKey = Math.floor(Math.random() * 99999999 + 1).toString();//[1,99999999]
  let key;
  const _Array_isArray = Array.isArray;
  const _Function = Function;
  const _store_push = Array.prototype.push.bind(store);
  const _console_error = console.error.bind(console);
  self.addEventListener('message', async (ev) => {
    if (!ev.isTrusted)
      return;
    const msgId = ev.data.msgId;
    switch (ev.data.type) {
      case 'init.key': {
        key = ev.data.key;
        sendBack({ type: 'init.ready', key });
        break;
      }
      case 'eval.request': {
        const { doStore, doAwait, withStore, args, body, doReturn, doMessage, doReturnError } = ev.data.evalData;
        const doUseStore = _Array_isArray(withStore);
        try {
          const fargList = (doUseStore ? 'store,' : '') + '...args';
          const fargs = doUseStore ? [withStore.map(withId => store[withId]), ...args] : [...args];
          let r = (new _Function(fargList, body))(...fargs);
          if (doAwait)
            r = await r;
          if (doStore)
            _store_push(r);
          if (doMessage)
            return sendBack({ type: 'eval.result', storeIndex: doStore ? store.length - 1 : null, evalResult: doReturn ? r : null, msgId, key });
        } catch (er) {
          if (doMessage)
            return sendBack({ type: 'eval.result', error: doReturnError ? er : true, msgId, key });
        }
        break;
      }
      case 'store.delete': {
        const { index } = ev.data;
        delete store[index];
        return sendBack({ type: 'store.done', msgId });
      }
    }
  });
  const _postMessage = self.postMessage.bind(self);
  function sendBack(fullData) {
    _postMessage(fullData);
  }
  //**不能在运行第三方代码后使用**
  function restrictAPI(config) {
    for (const c of config) {
      const target = c.target;
      const targetKeys = Reflect.ownKeys(target);
      for (const key of targetKeys) {
        const oriDesc = Object.getOwnPropertyDescriptor(target, key);
        if (Array.isArray(c.filter) && arrayMatch(c.filter, key) !== true)
          continue;
        if (typeof c.filter === 'function' && c.filter.call(c, key, oriDesc) !== true)
          continue;
        let newDesc;
        if (typeof c.replaceWith === 'function')
          newDesc = c.replaceWith.call(c, key, oriDesc);
        if (!newDesc)
          newDesc = {
            get() {
              _console_error('API restricted', key, this);
              return null;
            }
          };
        const result = Reflect.defineProperty(target, key, newDesc);
        if (!result) _console_error('Restriction Failed', target, key);
      }
    }
  }
  //**不能在运行第三方代码后使用**
  function arrayMatch(array, target) {
    return array.some((v) => {
      if (v instanceof RegExp)
        return typeof target === 'string' && v.test(target);
      return target === v;
    });
  }
  restrictAPI([
    {
      target: self,
      filter(key, desc) {
        const disallowed = ['XMLHttpRequest'];
        if (arrayMatch(disallowed, key)) return true;
        if (desc.enumerable === false) return false;
        const allowed = [];
        return !arrayMatch(allowed, key);
      }
    }, {
      target: self.WorkerGlobalScope?.prototype ?? Reflect.getPrototypeOf(self),
      filter: ['fetch']
    }, {
      target: self.WorkerLocation?.prototype ?? Reflect.getPrototypeOf(self.location),
      _replacer: { href: 'objflux/sandbox/' + openKey, pathname: '/sandbox/' + openKey },
      filter(key) { return key in this._replacer },
      replaceWith(key) { return { get: () => this._replacer[key] } }
    }
  ]);
  sendBack({ type: 'init.listening' });
})();