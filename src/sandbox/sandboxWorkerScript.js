/*eslint-env worker*/
(() => {
  const ___store = [];
  const openKey = Math.floor(Math.random() * 99999999).toString();
  let key;
  const _Function = Function;
  const _Array_push = Array.prototype.push;
  self.addEventListener('message', async (ev) => {
    if (!ev.isTrusted)
      return;
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
          let r = (new _Function(fargList, body))(...fargs);
          if (doAwait)
            r = await r;
          if (doStore)
            _Array_push.call(___store, r);
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
  const _postMessage = self.postMessage.bind(self);
  function sendBack(fullData) {
    _postMessage(fullData);
  }
  function restrictAPI(config) {
    for (const c of config) {
      const target = c.target;
      const targetKeys = Reflect.ownKeys(target);
      // const proDescriptors = Object.getOwnPropertyDescriptors(target);
      // const proNames = Reflect.ownKeys(proDescriptors);
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
              console.error('API restricted', key, this);
              return null;
            }
          };
        const result = Reflect.defineProperty(target, key, newDesc);
        if (!result) console.error('Restriction Failed', target, key);
      }
    }
  }
  const _RegExp = RegExp;
  const _RegExp_test = RegExp.prototype.test;
  function arrayMatch(array, target) {
    return array.some((v) => {
      if (v instanceof _RegExp)
        return typeof target === 'string' && _RegExp_test.call(v, target);
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