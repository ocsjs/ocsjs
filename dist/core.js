(function(global2, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, factory(global2.OCS = {}));
})(this, function(exports2) {
  "use strict";
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function isObject$2(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  var isObject_1 = isObject$2;
  var freeGlobal$1 = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var _freeGlobal = freeGlobal$1;
  var freeGlobal = _freeGlobal;
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root$3 = freeGlobal || freeSelf || Function("return this")();
  var _root = root$3;
  var root$2 = _root;
  var now$1 = function() {
    return root$2.Date.now();
  };
  var now_1 = now$1;
  var reWhitespace = /\s/;
  function trimmedEndIndex$1(string) {
    var index = string.length;
    while (index-- && reWhitespace.test(string.charAt(index))) {
    }
    return index;
  }
  var _trimmedEndIndex = trimmedEndIndex$1;
  var trimmedEndIndex = _trimmedEndIndex;
  var reTrimStart = /^\s+/;
  function baseTrim$1(string) {
    return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
  }
  var _baseTrim = baseTrim$1;
  var root$1 = _root;
  var Symbol$3 = root$1.Symbol;
  var _Symbol = Symbol$3;
  var Symbol$2 = _Symbol;
  var objectProto$1 = Object.prototype;
  var hasOwnProperty = objectProto$1.hasOwnProperty;
  var nativeObjectToString$1 = objectProto$1.toString;
  var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : void 0;
  function getRawTag$1(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag$1), tag = value[symToStringTag$1];
    try {
      value[symToStringTag$1] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString$1.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }
    return result;
  }
  var _getRawTag = getRawTag$1;
  var objectProto = Object.prototype;
  var nativeObjectToString = objectProto.toString;
  function objectToString$1(value) {
    return nativeObjectToString.call(value);
  }
  var _objectToString = objectToString$1;
  var Symbol$1 = _Symbol, getRawTag = _getRawTag, objectToString = _objectToString;
  var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
  var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
  function baseGetTag$1(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  var _baseGetTag = baseGetTag$1;
  function isObjectLike$1(value) {
    return value != null && typeof value == "object";
  }
  var isObjectLike_1 = isObjectLike$1;
  var baseGetTag = _baseGetTag, isObjectLike = isObjectLike_1;
  var symbolTag = "[object Symbol]";
  function isSymbol$1(value) {
    return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
  }
  var isSymbol_1 = isSymbol$1;
  var baseTrim = _baseTrim, isObject$1 = isObject_1, isSymbol = isSymbol_1;
  var NAN = 0 / 0;
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  var reIsBinary = /^0b[01]+$/i;
  var reIsOctal = /^0o[0-7]+$/i;
  var freeParseInt = parseInt;
  function toNumber$1(value) {
    if (typeof value == "number") {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject$1(value)) {
      var other = typeof value.valueOf == "function" ? value.valueOf() : value;
      value = isObject$1(other) ? other + "" : other;
    }
    if (typeof value != "string") {
      return value === 0 ? value : +value;
    }
    value = baseTrim(value);
    var isBinary = reIsBinary.test(value);
    return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
  }
  var toNumber_1 = toNumber$1;
  var isObject = isObject_1, now = now_1, toNumber = toNumber_1;
  var FUNC_ERROR_TEXT = "Expected a function";
  var nativeMax = Math.max, nativeMin = Math.min;
  function debounce(func, wait, options) {
    var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = "maxWait" in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = "trailing" in options ? !!options.trailing : trailing;
    }
    function invokeFunc(time) {
      var args = lastArgs, thisArg = lastThis;
      lastArgs = lastThis = void 0;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }
    function leadingEdge(time) {
      lastInvokeTime = time;
      timerId = setTimeout(timerExpired, wait);
      return leading ? invokeFunc(time) : result;
    }
    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
      return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
    }
    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
      return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
    }
    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      timerId = setTimeout(timerExpired, remainingWait(time));
    }
    function trailingEdge(time) {
      timerId = void 0;
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = void 0;
      return result;
    }
    function cancel() {
      if (timerId !== void 0) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = void 0;
    }
    function flush() {
      return timerId === void 0 ? result : trailingEdge(now());
    }
    function debounced() {
      var time = now(), isInvoking = shouldInvoke(time);
      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;
      if (isInvoking) {
        if (timerId === void 0) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          clearTimeout(timerId);
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === void 0) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }
  var debounce_1 = debounce;
  const $string = {
    humpToTarget(value, target) {
      return value.replace(/([A-Z])/g, target + "$1").toLowerCase().split(target).slice(1).join(target);
    }
  };
  class StringUtils {
    constructor(_text) {
      this._text = _text;
    }
    static nowrap(str) {
      return (str == null ? void 0 : str.replace(/\n/g, "")) || "";
    }
    nowrap() {
      this._text = StringUtils.nowrap(this._text);
      return this;
    }
    static nospace(str) {
      return (str == null ? void 0 : str.replace(/ +/g, " ")) || "";
    }
    nospace() {
      this._text = StringUtils.nospace(this._text);
      return this;
    }
    static noSpecialChar(str) {
      return (str == null ? void 0 : str.replace(/[^\w\s]/gi, "")) || "";
    }
    noSpecialChar() {
      this._text = StringUtils.noSpecialChar(this._text);
      return this;
    }
    static max(str, len) {
      return str.length > len ? str.substring(0, len) + "..." : str;
    }
    max(len) {
      this._text = StringUtils.max(this._text, len);
      return this;
    }
    static hide(str, start2, end, replacer = "*") {
      return str.substring(0, start2) + str.substring(start2, end).replace(/./g, replacer) + str.substring(end);
    }
    hide(start2, end, replacer = "*") {
      this._text = StringUtils.hide(this._text, start2, end, replacer);
      return this;
    }
    static of(text) {
      return new StringUtils(text);
    }
    toString() {
      return this._text;
    }
  }
  const $const = {
    TAB_UID: "_uid_",
    TAB_URLS: "_urls_",
    TAB_CURRENT_PANEL_NAME: "_current_panel_name_"
  };
  class LocalStoreChangeEvent extends Event {
    constructor() {
      super(...arguments);
      this.key = "";
    }
  }
  const _ObjectStoreProvider = class {
    get(key, defaultValue) {
      var _a;
      return (_a = Reflect.get(_ObjectStoreProvider._source.store, key)) != null ? _a : defaultValue;
    }
    set(key, value) {
      var _a;
      const pre = Reflect.get(_ObjectStoreProvider._source.store, key);
      Reflect.set(_ObjectStoreProvider._source.store, key, value);
      (_a = _ObjectStoreProvider.storeListeners.get(key)) == null ? void 0 : _a.forEach((lis) => lis(value, pre));
    }
    delete(key) {
      Reflect.deleteProperty(_ObjectStoreProvider._source.store, key);
    }
    list() {
      return Object.keys(_ObjectStoreProvider._source.store);
    }
    async getTab(key) {
      return Reflect.get(_ObjectStoreProvider._source.tab, key);
    }
    async setTab(key, value) {
      var _a;
      Reflect.set(_ObjectStoreProvider._source.tab, key, value);
      (_a = _ObjectStoreProvider.tabListeners.get(key)) == null ? void 0 : _a.forEach((lis) => lis(value, this.getTab(key)));
    }
    addChangeListener(key, listener) {
      const listeners = _ObjectStoreProvider.storeListeners.get(key) || [];
      listeners.push(listener);
      _ObjectStoreProvider.storeListeners.set(key, listeners);
    }
    removeChangeListener(listener) {
      _ObjectStoreProvider.tabListeners.forEach((lis, key) => {
        const index = lis.findIndex((l) => l === listener);
        if (index !== -1) {
          lis.splice(index, 1);
          _ObjectStoreProvider.tabListeners.set(key, lis);
        }
      });
    }
    addTabChangeListener(key, listener) {
      const listeners = _ObjectStoreProvider.tabListeners.get(key) || [];
      listeners.push(listener);
      _ObjectStoreProvider.tabListeners.set(key, listeners);
    }
    removeTabChangeListener(key, listener) {
      const listeners = _ObjectStoreProvider.tabListeners.get(key) || [];
      const index = listeners.findIndex((l) => l === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        _ObjectStoreProvider.tabListeners.set(key, listeners);
      }
    }
  };
  let ObjectStoreProvider = _ObjectStoreProvider;
  ObjectStoreProvider._source = { store: {}, tab: {} };
  ObjectStoreProvider.storeListeners = /* @__PURE__ */ new Map();
  ObjectStoreProvider.tabListeners = /* @__PURE__ */ new Map();
  class GMStoreProvider {
    constructor() {
      if (self === top && typeof globalThis.GM_listValues !== "undefined") {
        for (const val of GM_listValues()) {
          if (val.startsWith("_tab_change_")) {
            GM_deleteValue(val);
          }
        }
      }
    }
    getTabChangeHandleKey(tabUid, key) {
      return `_tab_change_${tabUid}_${key}`;
    }
    get(key, defaultValue) {
      return GM_getValue(key, defaultValue);
    }
    set(key, value) {
      GM_setValue(key, value);
    }
    delete(key) {
      GM_deleteValue(key);
    }
    list() {
      return GM_listValues();
    }
    getTab(key) {
      return new Promise((resolve, reject) => {
        GM_getTab((tab = {}) => resolve(Reflect.get(tab, key)));
      });
    }
    setTab(key, value) {
      return new Promise((resolve, reject) => {
        GM_getTab((tab = {}) => {
          Reflect.set(tab, key, value);
          GM_saveTab(tab);
          this.set(this.getTabChangeHandleKey(Reflect.get(tab, $const.TAB_UID), key), value);
          resolve();
        });
      });
    }
    addChangeListener(key, listener) {
      return GM_addValueChangeListener(key, (_, pre, curr, remote) => {
        listener(pre, curr, remote);
      });
    }
    removeChangeListener(listenerId) {
      GM_removeValueChangeListener(listenerId);
    }
    async addTabChangeListener(key, listener) {
      const uid = await this.getTab($const.TAB_UID);
      return GM_addValueChangeListener(this.getTabChangeHandleKey(uid, key), (_, pre, curr) => {
        listener(curr, pre);
      });
    }
    removeTabChangeListener(key, listener) {
      return this.removeChangeListener(listener);
    }
  }
  const $store = typeof globalThis.unsafeWindow === "undefined" ? new ObjectStoreProvider() : new GMStoreProvider();
  const $ = {
    createConfigProxy(script) {
      var _a, _b;
      const proxy = new Proxy(script.cfg, {
        set(target, propertyKey, value) {
          const key = $.namespaceKey(script.namespace, propertyKey);
          $store.set(key, value);
          return Reflect.set(target, propertyKey, value);
        },
        get(target, propertyKey) {
          const value = $store.get($.namespaceKey(script.namespace, propertyKey));
          Reflect.set(target, propertyKey, value);
          return value;
        }
      });
      for (const key in script.configs) {
        if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
          const element = Reflect.get(script.configs, key);
          Reflect.set(proxy, key, $store.get($.namespaceKey(script.namespace, key), element.defaultValue));
        }
      }
      if (script.namespace) {
        proxy.notes = (_b = (_a = script.configs) == null ? void 0 : _a.notes) == null ? void 0 : _b.defaultValue;
      }
      return proxy;
    },
    getAllRawConfigs(scripts) {
      const object = {};
      for (const script of scripts) {
        for (const key in script.configs) {
          if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
            const { label, ...element } = script.configs[key];
            Reflect.set(object, $.namespaceKey(script.namespace, key), {
              label: $.namespaceKey(script.namespace, key),
              ...element
            });
          }
        }
      }
      return object;
    },
    getMatchedScripts(projects, urls) {
      var _a;
      const scripts = [];
      for (const project of projects) {
        for (const key in project.scripts) {
          if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
            const script = project.scripts[key];
            if ((_a = script.excludes) == null ? void 0 : _a.some((u) => urls.some((url) => RegExp(u[1]).test(url)))) {
              continue;
            }
            if (script.url.some((u) => urls.some((url) => RegExp(u[1]).test(url)))) {
              scripts.push(script);
            }
          }
        }
      }
      return scripts;
    },
    namespaceKey(namespace, key) {
      return namespace ? namespace + "." + key.toString() : key.toString();
    },
    uuid() {
      return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    },
    random(min, max) {
      return Math.round(Math.random() * (max - min)) + min;
    },
    async sleep(period) {
      return new Promise((resolve) => {
        setTimeout(resolve, period);
      });
    },
    isInBrowser() {
      return typeof window !== "undefined" && typeof window.document !== "undefined";
    },
    elementToRawObject(el2) {
      return {
        innerText: el2 == null ? void 0 : el2.innerText,
        innerHTML: el2 == null ? void 0 : el2.innerHTML,
        textContent: el2 == null ? void 0 : el2.textContent
      };
    },
    onresize(el2, handler) {
      const resize = debounce_1(() => {
        if (el2.parentNode === null) {
          window.removeEventListener("resize", resize);
        } else {
          handler(el2);
        }
      }, 200);
      resize();
      window.addEventListener("resize", resize);
    },
    loadCustomElements(elements) {
      for (const element of elements) {
        const name = $string.humpToTarget(element.name, "-");
        if (customElements.get(name) === void 0) {
          customElements.define(name, element);
        }
      }
    },
    isInTopWindow() {
      return self === top;
    },
    createCenteredPopupWindow(url, winName, opts) {
      const { width, height, scrollbars, resizable } = opts;
      const LeftPosition = screen.width ? (screen.width - width) / 2 : 0;
      const TopPosition = screen.height ? (screen.height - height) / 2 : 0;
      const settings = "height=" + height + ",width=" + width + ",top=" + TopPosition + ",left=" + LeftPosition + ",scrollbars=" + (scrollbars ? "yes" : "no") + ",resizable=" + (resizable ? "yes" : "no");
      return window.open(url, winName, settings);
    }
  };
  async function start(startConfig) {
    if ([
      "GM_getTab",
      "GM_saveTab",
      "GM_setValue",
      "GM_getValue",
      "unsafeWindow",
      "GM_listValues",
      "GM_deleteValue",
      "GM_notification",
      "GM_xmlhttpRequest",
      "GM_getResourceText",
      "GM_addValueChangeListener",
      "GM_removeValueChangeListener"
    ].some((api) => typeof Reflect.get(globalThis, api) === "undefined")) {
      const open = confirm(
        `OCS\u7F51\u8BFE\u811A\u672C\u4E0D\u652F\u6301\u5F53\u524D\u7684\u811A\u672C\u7BA1\u7406\u5668\uFF08${GM_info.scriptHandler}\uFF09\u3002\u8BF7\u524D\u5F80 https://docs.ocsjs.com/docs/script \u4E0B\u8F7D\u6307\u5B9A\u7684\u811A\u672C\u7BA1\u7406\u5668\uFF0C\u4F8B\u5982 \u201CScriptcat \u811A\u672C\u732B\u201D \u6216\u8005 \u201CTampermonkey \u6CB9\u7334\u201D`
      );
      if (open) {
        window.location.href = "https://docs.ocsjs.com/docs/script";
      }
      return;
    }
    const uid = await $store.getTab($const.TAB_UID);
    if (uid === void 0) {
      await $store.setTab($const.TAB_UID, $.uuid());
    }
    startConfig.projects = startConfig.projects.map((p) => {
      for (const key in p.scripts) {
        if (Object.prototype.hasOwnProperty.call(p.scripts, key)) {
          p.scripts[key].cfg = $.createConfigProxy(p.scripts[key]);
        }
      }
      return p;
    });
    const scripts = $.getMatchedScripts(startConfig.projects, [location.href]);
    scripts.forEach((script) => {
      var _a;
      script.emit("start", startConfig);
      (_a = script.onstart) == null ? void 0 : _a.call(script, startConfig);
    });
    let active = false;
    if (document.readyState === "interactive") {
      active = true;
      scripts.forEach((script) => {
        var _a;
        return (_a = script.onactive) == null ? void 0 : _a.call(script, startConfig);
      });
    } else if (document.readyState === "complete") {
      scripts.forEach((script) => {
        var _a;
        return (_a = script.onactive) == null ? void 0 : _a.call(script, startConfig);
      });
      scripts.forEach((script) => {
        var _a;
        return (_a = script.oncomplete) == null ? void 0 : _a.call(script, startConfig);
      });
    }
    document.addEventListener("readystatechange", () => {
      if (document.readyState === "interactive" && active === false) {
        scripts.forEach((script) => {
          var _a;
          script.emit("active", startConfig);
          (_a = script.onactive) == null ? void 0 : _a.call(script, startConfig);
        });
      }
      if (document.readyState === "complete") {
        scripts.forEach((script) => {
          var _a;
          script.emit("complete");
          (_a = script.oncomplete) == null ? void 0 : _a.call(script, startConfig);
        });
        $store.getTab($const.TAB_URLS).then((urls) => {
          $store.setTab($const.TAB_URLS, Array.from(new Set(urls || [])).concat(location.href));
        });
      }
    });
    history.pushState = addFunctionEventListener(history, "pushState");
    history.replaceState = addFunctionEventListener(history, "replaceState");
    window.addEventListener("pushState", () => {
      scripts.forEach((script) => {
        var _a;
        script.emit("historychange", "push", startConfig);
        (_a = script.onhistorychange) == null ? void 0 : _a.call(script, "push", startConfig);
      });
    });
    window.addEventListener("replaceState", () => {
      scripts.forEach((script) => {
        var _a;
        script.emit("historychange", "replace", startConfig);
        (_a = script.onhistorychange) == null ? void 0 : _a.call(script, "replace", startConfig);
      });
    });
    window.onbeforeunload = (e) => {
      var _a;
      let prevent;
      for (const script of scripts) {
        script.emit("beforeunload");
        if ((_a = script.onbeforeunload) == null ? void 0 : _a.call(script, startConfig)) {
          prevent = true;
        }
      }
      if (prevent) {
        e.preventDefault();
        e.returnValue = true;
        return true;
      }
    };
  }
  function addFunctionEventListener(obj, type) {
    const origin = obj[type];
    return function(...args) {
      const res = origin.apply(this, args);
      const e = new Event(type.toString());
      e.arguments = args;
      window.dispatchEvent(e);
      return res;
    };
  }
  function el(tagName, attrsOrChildren, childrenOrHandler) {
    const element = document.createElement(tagName);
    if (attrsOrChildren) {
      if (Array.isArray(attrsOrChildren)) {
        element.append(...attrsOrChildren);
      } else if (typeof attrsOrChildren === "string") {
        element.append(attrsOrChildren);
      } else {
        const attrs = attrsOrChildren;
        for (const key in attrs) {
          if (Object.prototype.hasOwnProperty.call(attrs, key)) {
            if (key === "style") {
              Object.assign(element.style, attrs[key]);
            } else {
              const value = attrs[key];
              Reflect.set(element, key, value);
            }
          }
        }
      }
    }
    if (childrenOrHandler) {
      if (typeof childrenOrHandler === "function") {
        childrenOrHandler.call(element, element);
      } else if (Array.isArray(childrenOrHandler)) {
        element.append(...childrenOrHandler);
      } else if (typeof childrenOrHandler === "string") {
        element.append(childrenOrHandler);
      }
    }
    return element;
  }
  function $el(selector, root2 = window.document) {
    const el2 = root2.querySelector(selector);
    return el2 === null ? void 0 : el2;
  }
  function $$el(selector, root2 = window.document) {
    return Array.from(root2.querySelectorAll(selector));
  }
  function enableElementDraggable(header, target, ondrag) {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
    header.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      e = e || window.event;
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      e = e || window.event;
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      target.style.top = Math.max(target.offsetTop - pos2, 10) + "px";
      target.style.left = target.offsetLeft - pos1 + "px";
    }
    function closeDragElement() {
      ondrag == null ? void 0 : ondrag();
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
  const panel = el("div");
  const root = panel.attachShadow({ mode: "closed" });
  const $elements = {
    panel,
    root,
    messageContainer: el("div", { className: "message-container" }),
    tooltip: el("div", { className: "tooltip" })
  };
  root.append($elements.messageContainer, $elements.tooltip);
  const $gm = {
    unsafeWindow: typeof globalThis.unsafeWindow === "undefined" ? globalThis.window : globalThis.unsafeWindow,
    getInfos() {
      return typeof GM_info === "undefined" ? void 0 : GM_info;
    },
    getTab(callback) {
      return typeof GM_getTab === "undefined" ? void 0 : GM_getTab(callback);
    },
    notification(content, options) {
      var _a;
      const { onclick, ondone, important, duration = 0 } = options || {};
      const { icon, name } = ((_a = $gm.getInfos()) == null ? void 0 : _a.script) || {};
      GM_notification({
        title: name,
        text: content,
        image: icon || "",
        highlight: important,
        onclick,
        ondone,
        silent: true,
        timeout: duration * 1e3
      });
    }
  };
  let popupWin;
  window.addEventListener("beforeunload", () => {
    popupWin == null ? void 0 : popupWin.close();
  });
  const $creator = {
    notes(lines, tag = "ul") {
      return el(
        tag,
        lines.map(
          (line) => el(
            "li",
            Array.isArray(line) ? line.map((node) => typeof node === "string" ? el("div", { innerHTML: node }) : node) : [typeof line === "string" ? el("div", { innerHTML: line }) : line]
          )
        )
      );
    },
    tooltip(target) {
      target.setAttribute("data-title", target.title);
      if (typeof $gm.getInfos() !== "undefined") {
        target.removeAttribute("title");
      }
      const onMouseMove = (e) => {
        $elements.tooltip.style.top = e.y + "px";
        $elements.tooltip.style.left = e.x + "px";
      };
      const showTitle = (e) => {
        const dataTitle = target.getAttribute("data-title");
        if (dataTitle) {
          $elements.tooltip.innerHTML = dataTitle.split("\n").join("<br>") || "";
          $elements.tooltip.style.top = e.y + "px";
          $elements.tooltip.style.left = e.x + "px";
          $elements.tooltip.style.display = "block";
        } else {
          $elements.tooltip.style.display = "none";
        }
        window.addEventListener("mousemove", onMouseMove);
      };
      const hideTitle = () => {
        $elements.tooltip.style.display = "none";
        window.removeEventListener("mousemove", onMouseMove);
      };
      hideTitle();
      target.addEventListener("mouseenter", showTitle);
      target.addEventListener("click", showTitle);
      target.addEventListener("mouseout", hideTitle);
      target.addEventListener("blur", hideTitle);
      return target;
    },
    selectOptions(selectedValue = "", options) {
      return options.map(
        (opt) => el("option", { value: String(opt[0]), innerText: opt[1], title: opt[2] }, (opt2) => {
          if (opt2.value === selectedValue) {
            opt2.toggleAttribute("selected");
          }
        })
      );
    },
    input(attrs, children, handler) {
      return el("input", attrs, function(input) {
        input.append(...children || []);
        input.classList.add("base-style-input");
        handler == null ? void 0 : handler.apply(this, [input]);
      });
    },
    button(text, attrs, handler) {
      return el("input", { type: "button", ...attrs }, function(btn) {
        btn.value = text || "";
        btn.classList.add("base-style-button");
        handler == null ? void 0 : handler.apply(this, [btn]);
      });
    },
    scriptPanel(script, opts) {
      var _a, _b;
      const scriptPanel = el("script-panel-element", { name: script.name });
      script.onConfigChange("notes", (pre, curr) => {
        scriptPanel.notesContainer.innerHTML = script.cfg.notes || "";
      });
      script.panel = scriptPanel;
      scriptPanel.notesContainer.innerHTML = ((_b = (_a = script.configs) == null ? void 0 : _a.notes) == null ? void 0 : _b.defaultValue) || "";
      const els = $creator.configs(script.namespace, script.configs || {}, opts.onload);
      const elList = [];
      for (const key in els) {
        if (Object.prototype.hasOwnProperty.call(els, key)) {
          elList.push(els[key]);
        }
      }
      scriptPanel.configsBody.append(...elList);
      scriptPanel.configsContainer.append(scriptPanel.configsBody);
      return scriptPanel;
    },
    configsArea(configElements) {
      const configsContainer = el("div", { className: "configs card" });
      const configsBody = el("div", { className: "configs-body" });
      configsBody.append(...Object.entries(configElements).map(([key, el2]) => el2));
      configsContainer.append(configsBody);
      return configsContainer;
    },
    configs(namespace, configs, onload) {
      const elements = /* @__PURE__ */ Object.create({});
      for (const key in configs) {
        if (Object.prototype.hasOwnProperty.call(configs, key)) {
          const config = configs[key];
          if (config.label !== void 0) {
            const element = el("config-element", {
              key: $.namespaceKey(namespace, key),
              tag: config.tag,
              sync: config.sync,
              attrs: config.attrs,
              _onload: config.onload,
              defaultValue: config.defaultValue
            });
            onload == null ? void 0 : onload(element);
            element.label.textContent = config.label;
            elements[key] = element;
          }
        }
      }
      return elements;
    },
    copy(name, value) {
      return el("span", "\u{1F4C4}" + name, (btn) => {
        btn.className = "copy";
        btn.addEventListener("click", () => {
          btn.innerText = "\u5DF2\u590D\u5236\u221A";
          navigator.clipboard.writeText(value);
          setTimeout(() => {
            btn.innerText = "\u{1F4C4}" + name;
          }, 500);
        });
      });
    },
    preventText(opts) {
      const { name, delay = 3, autoRemove = true, ondefault, onprevent } = opts;
      const span = el("span", name);
      span.style.textDecoration = "underline";
      span.style.cursor = "pointer";
      span.onclick = () => {
        clearTimeout(id);
        if (autoRemove) {
          span.remove();
        }
        onprevent == null ? void 0 : onprevent(span);
      };
      const id = setTimeout(() => {
        if (autoRemove) {
          span.remove();
        }
        ondefault(span);
      }, delay * 1e3);
      return span;
    },
    createQuestionTitleExtra(question) {
      const space = $creator.space(
        [
          $creator.copy("\u590D\u5236", question),
          el("span", { className: "question-title-extra-btn", innerText: "\u{1F30F}\u767E\u5EA6\u4E00\u4E0B" }, (btn) => {
            btn.onclick = () => {
              popupWin == null ? void 0 : popupWin.close();
              popupWin = $.createCenteredPopupWindow(`https://www.baidu.com/s?wd=${question}`, "\u767E\u5EA6\u641C\u7D22", {
                width: 800,
                height: 600,
                resizable: true,
                scrollbars: true
              });
            };
          })
        ],
        { x: 4 }
      );
      space.style.marginTop = "6px";
      space.style.textAlign = "right";
      return space;
    },
    space(children, options) {
      return el("div", { className: "space" }, (div) => {
        var _a, _b;
        for (let index = 0; index < children.length; index++) {
          const child = el("span", { className: "space-item" }, [children[index]]);
          child.style.display = "inline-block";
          if (index > 0) {
            child.style.marginLeft = ((_a = options == null ? void 0 : options.x) != null ? _a : 12) + "px";
            child.style.marginTop = ((_b = options == null ? void 0 : options.y) != null ? _b : 0) + "px";
          }
          div.append(child);
        }
      });
    }
  };
  function domSearch(wrapper, root2 = window.document) {
    const obj = /* @__PURE__ */ Object.create({});
    Reflect.ownKeys(wrapper).forEach((key) => {
      const item = wrapper[key.toString()];
      Reflect.set(
        obj,
        key,
        typeof item === "string" ? root2.querySelector(item) : typeof item === "function" ? item(root2) : item.map((fun) => fun(root2))
      );
    });
    return obj;
  }
  function domSearchAll(wrapper, root2 = window.document) {
    const obj = /* @__PURE__ */ Object.create({});
    Reflect.ownKeys(wrapper).forEach((key) => {
      const item = wrapper[key.toString()];
      Reflect.set(
        obj,
        key,
        typeof item === "string" ? Array.from(root2.querySelectorAll(item)) : typeof item === "function" ? item(root2) : item.map((fun) => fun(root2))
      );
    });
    return obj;
  }
  var src = {
    compareTwoStrings,
    findBestMatch
  };
  function compareTwoStrings(first, second) {
    first = first.replace(/\s+/g, "");
    second = second.replace(/\s+/g, "");
    if (first === second)
      return 1;
    if (first.length < 2 || second.length < 2)
      return 0;
    let firstBigrams = /* @__PURE__ */ new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
      firstBigrams.set(bigram, count);
    }
    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }
    return 2 * intersectionSize / (first.length + second.length - 2);
  }
  function findBestMatch(mainString, targetStrings) {
    if (!areArgsValid(mainString, targetStrings))
      throw new Error("Bad arguments: First argument should be a string, second should be an array of strings");
    const ratings = [];
    let bestMatchIndex = 0;
    for (let i = 0; i < targetStrings.length; i++) {
      const currentTargetString = targetStrings[i];
      const currentRating = compareTwoStrings(mainString, currentTargetString);
      ratings.push({ target: currentTargetString, rating: currentRating });
      if (currentRating > ratings[bestMatchIndex].rating) {
        bestMatchIndex = i;
      }
    }
    const bestMatch = ratings[bestMatchIndex];
    return { ratings, bestMatch, bestMatchIndex };
  }
  function areArgsValid(mainString, targetStrings) {
    if (typeof mainString !== "string")
      return false;
    if (!Array.isArray(targetStrings))
      return false;
    if (!targetStrings.length)
      return false;
    if (targetStrings.find(function(s) {
      return typeof s !== "string";
    }))
      return false;
    return true;
  }
  function clearString(str, ...exclude) {
    return str.trim().toLocaleLowerCase().replace(RegExp(`[^\\u4e00-\\u9fa5A-Za-z0-9${exclude.join("")}]*`, "g"), "");
  }
  function answerSimilar(answers, options) {
    const _answers = answers.map(removeRedundant);
    const _options = options.map(removeRedundant);
    const similar = _answers.length !== 0 ? _options.map((option) => {
      if (option.trim() === "") {
        return { rating: 0, target: "" };
      }
      return src.findBestMatch(option, _answers).bestMatch;
    }) : _options.map(() => ({ rating: 0, target: "" }));
    return similar;
  }
  function removeRedundant(str) {
    return (str == null ? void 0 : str.trim().replace(/[A-Z]{1}[^A-Za-z0-9\u4e00-\u9fa5]+([A-Za-z0-9\u4e00-\u9fa5]+)/, "$1")) || "";
  }
  function request(url, opts) {
    return new Promise((resolve, reject) => {
      try {
        const { responseType = "json", method = "get", type = "fetch", data = {}, headers = {} } = opts || {};
        const env = $.isInBrowser() ? "browser" : "node";
        if (type === "GM_xmlhttpRequest" && env === "browser") {
          if (typeof GM_xmlhttpRequest !== "undefined") {
            GM_xmlhttpRequest({
              url,
              method: method === "get" ? "GET" : "POST",
              data: Object.keys(data).length ? new URLSearchParams(data).toString() : void 0,
              headers: Object.keys(headers).length ? headers : void 0,
              responseType: responseType === "json" ? "json" : void 0,
              onload: (response) => {
                if (response.status === 200) {
                  if (responseType === "json") {
                    try {
                      resolve(JSON.parse(response.responseText));
                    } catch (error) {
                      reject(error);
                    }
                  } else {
                    resolve(response.responseText);
                  }
                } else {
                  reject(response.responseText);
                }
              },
              onerror: (err) => {
                console.error("GM_xmlhttpRequest error", err);
                reject(err);
              }
            });
          } else {
            reject(new Error("GM_xmlhttpRequest is not defined"));
          }
        } else {
          const fet = env === "node" ? require("node-fetch").default : fetch;
          fet(url, { body: method === "post" ? JSON.stringify(data) : void 0, method, headers }).then((response) => {
            if (responseType === "json") {
              response.json().then(resolve).catch(reject);
            } else {
              response.text().then(resolve).catch(reject);
            }
          }).catch((error) => {
            reject(new Error(error));
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  class IElement extends HTMLElement {
  }
  class ConfigElement extends IElement {
    constructor() {
      super(...arguments);
      this.label = el("label");
      this.wrapper = el("div", { className: "config-wrapper" });
      this.key = "";
    }
    get value() {
      return $store.get(this.key);
    }
    connectedCallback() {
      var _a;
      const createInput = () => {
        this.provider = el("input");
        if (["checkbox", "radio"].some((t) => {
          var _a2;
          return t === ((_a2 = this.attrs) == null ? void 0 : _a2.type);
        })) {
          this.provider.checked = $store.get(this.key, this.defaultValue);
          const provider = this.provider;
          provider.onchange = () => {
            $store.set(this.key, provider.checked);
          };
        } else {
          this.provider.value = $store.get(this.key, this.defaultValue);
          this.provider.setAttribute("value", this.provider.value);
          this.provider.onchange = () => {
            const { min, max, type } = this.attrs || {};
            if (type === "number") {
              const val = parseFloat(this.provider.value);
              const _min = min ? parseFloat(min) : void 0;
              const _max = max ? parseFloat(max) : void 0;
              if (_min && val < _min) {
                this.provider.value = _min.toString();
              } else if (_max && val > _max) {
                this.provider.value = _max.toString();
              } else {
                $store.set(this.key, val);
              }
            } else {
              $store.set(this.key, this.provider.value);
            }
          };
        }
      };
      switch (this.tag) {
        case "input": {
          createInput();
          break;
        }
        case "select": {
          this.provider = el("select");
          this.provider.setAttribute("value", $store.get(this.key, this.defaultValue));
          this.provider.onchange = () => {
            $store.set(this.key, this.provider.value);
          };
          break;
        }
        case "textarea": {
          this.provider = el("textarea");
          this.provider.value = $store.get(this.key, this.defaultValue);
          this.provider.onchange = () => {
            $store.set(this.key, this.provider.value);
          };
          break;
        }
        default: {
          createInput();
          break;
        }
      }
      this.wrapper.replaceChildren(this.provider);
      this.append(this.label, this.wrapper);
      for (const key in this.attrs) {
        if (Object.prototype.hasOwnProperty.call(this.attrs, key)) {
          Reflect.set(this.provider, key, Reflect.get(this.attrs, key));
        }
      }
      if (this.sync) {
        $store.addChangeListener(this.key, (pre, curr, remote) => {
          this.provider.value = curr;
        });
      }
      $creator.tooltip(this.provider);
      (_a = this._onload) == null ? void 0 : _a.call(this.provider, this);
    }
  }
  class ContainerElement extends IElement {
    constructor() {
      super(...arguments);
      this.header = $creator.tooltip(el("header-element", { className: "header", title: "\u83DC\u5355\u680F-\u53EF\u62D6\u52A8\u533A\u57DF" }));
      this.body = el("div", { className: "body", clientHeight: window.innerHeight / 2 });
      this.footer = el("div", { className: "footer" });
    }
    connectedCallback() {
      this.append(this.header, this.body, this.footer);
      $.onresize(this, (cont) => {
        cont.body.style.maxHeight = window.innerHeight - this.header.clientHeight - 100 + "px";
        cont.body.style.maxWidth = window.innerWidth - 50 + "px";
      });
    }
  }
  class DropdownElement extends IElement {
    constructor() {
      super(...arguments);
      this.triggerElement = el("button");
      this.content = el("div", { className: "dropdown-content" });
      this.trigger = "hover";
    }
    connectedCallback() {
      this.append(this.triggerElement, this.content);
      this.classList.add("dropdown");
      if (this.trigger === "click") {
        this.triggerElement.onclick = () => {
          this.content.classList.toggle("show");
        };
      } else {
        this.triggerElement.onmouseover = () => {
          this.content.classList.add("show");
        };
        this.triggerElement.onmouseout = () => {
          this.content.classList.remove("show");
        };
        this.content.onmouseover = () => {
          this.content.classList.add("show");
        };
        this.content.onmouseout = () => {
          this.content.classList.remove("show");
        };
      }
      this.content.onclick = () => {
        this.content.classList.remove("show");
      };
    }
  }
  class HeaderElement extends IElement {
    connectedCallback() {
      this.append(this.visualSwitcher || "");
    }
  }
  class MessageElement extends IElement {
    constructor() {
      super(...arguments);
      this.closer = el("span", { className: "message-closer" }, "x");
      this.contentContainer = el("span", { className: "message-content-container" });
      this.type = "info";
      this.content = "";
      this.closeable = true;
    }
    connectedCallback() {
      var _a;
      this.classList.add(this.type);
      if (typeof this.content === "string") {
        this.contentContainer.innerHTML = this.content;
      } else {
        this.contentContainer.append(this.content);
      }
      this.duration = Math.max((_a = this.duration) != null ? _a : 5, 0);
      this.append(this.contentContainer);
      if (this.closeable) {
        this.append(this.closer);
        this.closer.addEventListener("click", () => {
          var _a2;
          (_a2 = this.onClose) == null ? void 0 : _a2.call(this);
          this.remove();
        });
      }
      if (this.duration) {
        setTimeout(() => {
          var _a2;
          (_a2 = this.onClose) == null ? void 0 : _a2.call(this);
          this.remove();
        }, this.duration * 1e3);
      }
    }
  }
  class ModalElement extends IElement {
    constructor() {
      super(...arguments);
      this._title = el("div", { className: "modal-title" });
      this.body = el("div", { className: "modal-body" });
      this.footer = el("div", { className: "modal-footer" });
      this.modalInput = el("input", { className: "modal-input" });
      this.modalInputType = "input";
      this.type = "alert";
      this.content = "";
      this.inputDefaultValue = "";
      this.placeholder = "";
      this.modalStyle = {};
    }
    connectedCallback() {
      var _a;
      this.classList.add(this.type);
      Object.assign(this.style, this.modalStyle || {});
      const profile = el("div", {
        innerText: this.profile || "\u5F39\u7A97\u6765\u81EA: OCS " + (((_a = $gm.getInfos()) == null ? void 0 : _a.script.version) || ""),
        className: "modal-profile"
      });
      this._title.innerText = this.title;
      this.body.append(typeof this.content === "string" ? el("div", { innerHTML: this.content }) : this.content);
      if (this.modalInputType === "textarea") {
        this.modalInput = el("textarea", { className: "modal-input", style: { height: "100px" } });
      }
      this.modalInput.placeholder = this.placeholder || "";
      this.modalInput.value = this.inputDefaultValue || "";
      this.footer.append(this.modalInput);
      this.append(profile, this._title, this.body, this.footer);
      this.style.width = (this.width || 400) + "px";
      if (this.cancelButton === void 0) {
        this.cancelButton = el("button", { className: "modal-cancel-button" });
        this.cancelButton.innerText = this.cancelButtonText || "\u53D6\u6D88";
        this.cancelButton.addEventListener("click", () => {
          var _a2, _b;
          (_a2 = this.onCancel) == null ? void 0 : _a2.call(this);
          (_b = this.onClose) == null ? void 0 : _b.call(this);
          this.remove();
        });
      }
      if (this.confirmButton === void 0) {
        this.confirmButton = el("button", { className: "modal-confirm-button" });
        this.confirmButton.innerText = this.confirmButtonText || "\u786E\u5B9A";
        this.confirmButton.addEventListener("click", async () => {
          var _a2, _b;
          if (await ((_a2 = this.onConfirm) == null ? void 0 : _a2.call(this, this.modalInput.value)) !== false) {
            this.remove();
            (_b = this.onClose) == null ? void 0 : _b.call(this, this.modalInput.value);
          }
        });
      }
      this.cancelButton !== null && this.footer.append(this.cancelButton);
      this.confirmButton !== null && this.footer.append(this.confirmButton);
      if (this.type === "simple") {
        this.footer.remove();
      } else if (this.type === "prompt") {
        this.modalInput.focus();
      }
      $.onresize(this.body, (modal) => {
        this.body.style.maxHeight = window.innerHeight - 100 + "px";
        this.body.style.maxWidth = window.innerWidth - 50 + "px";
      });
    }
  }
  class ScriptPanelElement extends IElement {
    constructor() {
      super(...arguments);
      this.separator = el("div", { className: "separator" });
      this.notesContainer = el("div", { className: "notes card" });
      this.configsContainer = el("div", { className: "configs card" });
      this.configsBody = el("div", { className: "configs-body" });
      this.body = el("div", { className: "script-panel-body" });
      this.lockWrapper = el("div", { className: "lock-wrapper" });
    }
    connectedCallback() {
      this.separator.innerText = this.name || "";
      this.append(this.separator);
      this.append(this.notesContainer);
      this.append(this.configsContainer);
      this.append(this.body);
    }
  }
  function defaultWorkTypeResolver(ctx) {
    function count(selector) {
      let c = 0;
      for (const option of ctx.elements.options || []) {
        if ((option == null ? void 0 : option.querySelector(selector)) !== null) {
          c++;
        }
      }
      return c;
    }
    return count('[type="radio"]') === 2 ? "judgement" : count('[type="radio"]') > 2 ? "single" : count('[type="checkbox"]') > 2 ? "multiple" : count("textarea") >= 1 ? "completion" : void 0;
  }
  function isPlainAnswer(answer) {
    answer = answer.trim();
    if (answer.length > 8 || !/[A-Z]/.test(answer)) {
      return false;
    }
    const counter = {};
    let min = 0;
    for (let i = 0; i < answer.length; i++) {
      if (answer.charCodeAt(i) < min) {
        return false;
      }
      min = answer.charCodeAt(i);
      counter[min] = (counter[min] || 0) + 1;
    }
    for (const key in counter) {
      if (counter[key] !== 1) {
        return false;
      }
    }
    return true;
  }
  function splitAnswer(answer) {
    try {
      const json = JSON.parse(answer);
      if (Array.isArray(json)) {
        return json.map(String).filter((el2) => el2.trim().length > 0);
      }
    } catch {
      const seprators = ["===", "#", "---", "###", "|", ";"];
      for (const sep of seprators) {
        if (answer.split(sep).length > 1) {
          return answer.split(sep).filter((el2) => el2.trim().length > 0);
        }
      }
    }
    return [answer];
  }
  const transformImgLinkOfQuestion = (question) => {
    const dom = new DOMParser().parseFromString(question, "text/html");
    for (const img of Array.from(dom.querySelectorAll("img"))) {
      img.replaceWith(img.src);
    }
    return dom.documentElement.innerText.replace(/https?:\/\/.+?\.(png|jpg|jpeg|gif)/g, (img) => {
      return `<img src="${img}" />`;
    });
  };
  class SearchInfosElement extends IElement {
    constructor() {
      super(...arguments);
      this.infos = [];
      this.question = "";
    }
    connectedCallback() {
      const question = transformImgLinkOfQuestion(this.question || "\u65E0");
      this.append(
        el("div", [el("span", { innerHTML: question }), $creator.createQuestionTitleExtra(this.question)], (div) => {
          div.style.padding = "4px";
        }),
        el("hr")
      );
      this.append(
        ...this.infos.map((info) => {
          return el("details", { open: true }, [
            el("summary", [el("a", { href: info.homepage, innerText: info.name, target: "_blank" })]),
            ...info.error ? [el("span", { className: "error" }, [info.error || "\u7F51\u7EDC\u9519\u8BEF\u6216\u8005\u672A\u77E5\u9519\u8BEF"])] : [
              ...info.results.map((ans) => {
                const title = transformImgLinkOfQuestion(ans[0] || this.question || "\u65E0");
                const answer = transformImgLinkOfQuestion(ans[1] || "\u65E0");
                return el("div", { className: "search-result" }, [
                  el("div", { className: "question" }, [el("span", { innerHTML: title })]),
                  el("div", { className: "answer" }, [
                    el("span", "\u7B54\u6848\uFF1A"),
                    ...splitAnswer(answer).map((a) => el("code", { innerHTML: a }))
                  ])
                ]);
              })
            ]
          ]);
        })
      );
      $.onresize(this, (sr) => {
        sr.style.maxHeight = window.innerHeight / 2 + "px";
      });
    }
  }
  const definedCustomElements = [
    ConfigElement,
    ContainerElement,
    HeaderElement,
    ModalElement,
    MessageElement,
    ScriptPanelElement,
    SearchInfosElement,
    DropdownElement
  ];
  class CorsEventEmitter {
    constructor() {
      this.eventMap = /* @__PURE__ */ new Map();
    }
    eventKey(name) {
      return "cors.events." + name;
    }
    tempKey(...args) {
      return ["_temp_", ...args].join(".");
    }
    keyOfReturn(id) {
      return this.tempKey("event", id, "return");
    }
    keyOfArguments(id) {
      return this.tempKey("event", id, "arguments");
    }
    keyOfState(id) {
      return this.tempKey("event", id, "state");
    }
    emit(name, args = [], callback) {
      $store.getTab($const.TAB_UID).then((uid) => {
        const id = $.uuid().replace(/-/g, "");
        const key = uid + "." + this.eventKey(name);
        $store.set(this.keyOfState(id), 0);
        $store.set(this.keyOfArguments(id), args);
        const listenerId = $store.addChangeListener(this.keyOfState(id), (pre, curr, remote) => {
          $store.removeChangeListener(listenerId);
          callback == null ? void 0 : callback($store.get(this.keyOfReturn(id)), !!remote);
          $store.delete(this.keyOfState(id));
          $store.delete(this.keyOfReturn(id));
          $store.delete(this.keyOfArguments(id));
        }) || 0;
        $store.set(key, ($store.get(key) ? String($store.get(key)).split(",") : []).concat(id).join(","));
      }).catch(console.error);
    }
    on(name, handler) {
      return new Promise((resolve) => {
        $store.getTab($const.TAB_UID).then((uid) => {
          const key = uid + "." + this.eventKey(name);
          const originId = this.eventMap.get(key);
          if (originId) {
            resolve(originId);
          } else {
            const id = $store.addChangeListener(key, async (pre, curr, remote) => {
              if (remote) {
                const list = String(curr).split(",");
                const id2 = list.pop();
                if (id2) {
                  $store.set(this.keyOfReturn(id2), await handler($store.get(this.keyOfArguments(id2))));
                  setTimeout(() => {
                    $store.set(this.keyOfState(id2), 1);
                    $store.set(key, list.join(","));
                  }, 100);
                }
              }
            }) || 0;
            this.eventMap.set(key, id);
            resolve(id);
          }
        }).catch(console.error);
      });
    }
    off(name) {
      const key = this.eventKey(name);
      const originId = this.eventMap.get(key);
      if (originId) {
        this.eventMap.delete(key);
        $store.removeChangeListener(originId);
      }
    }
  }
  if (typeof GM_listValues !== "undefined") {
    window.onload = () => {
      $store.list().forEach((key) => {
        if (/_temp_.event.[0-9a-z]{32}.(state|return|arguments)/.test(key)) {
          $store.delete(key);
        }
        if (/[0-9a-z]{32}.cors.events.modal/.test(key)) {
          $store.delete(key);
        }
      });
    };
  }
  const cors = new CorsEventEmitter();
  var events = { exports: {} };
  var R = typeof Reflect === "object" ? Reflect : null;
  var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };
  var ReflectOwnKeys;
  if (R && typeof R.ownKeys === "function") {
    ReflectOwnKeys = R.ownKeys;
  } else if (Object.getOwnPropertySymbols) {
    ReflectOwnKeys = function ReflectOwnKeys2(target) {
      return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
    };
  } else {
    ReflectOwnKeys = function ReflectOwnKeys2(target) {
      return Object.getOwnPropertyNames(target);
    };
  }
  function ProcessEmitWarning(warning) {
    if (console && console.warn)
      console.warn(warning);
  }
  var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
    return value !== value;
  };
  function EventEmitter() {
    EventEmitter.init.call(this);
  }
  events.exports = EventEmitter;
  events.exports.once = once;
  EventEmitter.EventEmitter = EventEmitter;
  EventEmitter.prototype._events = void 0;
  EventEmitter.prototype._eventsCount = 0;
  EventEmitter.prototype._maxListeners = void 0;
  var defaultMaxListeners = 10;
  function checkListener(listener) {
    if (typeof listener !== "function") {
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
    }
  }
  Object.defineProperty(EventEmitter, "defaultMaxListeners", {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
        throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
      }
      defaultMaxListeners = arg;
    }
  });
  EventEmitter.init = function() {
    if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
      this._events = /* @__PURE__ */ Object.create(null);
      this._eventsCount = 0;
    }
    this._maxListeners = this._maxListeners || void 0;
  };
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
    }
    this._maxListeners = n;
    return this;
  };
  function _getMaxListeners(that) {
    if (that._maxListeners === void 0)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }
  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return _getMaxListeners(this);
  };
  EventEmitter.prototype.emit = function emit(type) {
    var args = [];
    for (var i = 1; i < arguments.length; i++)
      args.push(arguments[i]);
    var doError = type === "error";
    var events2 = this._events;
    if (events2 !== void 0)
      doError = doError && events2.error === void 0;
    else if (!doError)
      return false;
    if (doError) {
      var er;
      if (args.length > 0)
        er = args[0];
      if (er instanceof Error) {
        throw er;
      }
      var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
      err.context = er;
      throw err;
    }
    var handler = events2[type];
    if (handler === void 0)
      return false;
    if (typeof handler === "function") {
      ReflectApply(handler, this, args);
    } else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        ReflectApply(listeners[i], this, args);
    }
    return true;
  };
  function _addListener(target, type, listener, prepend) {
    var m;
    var events2;
    var existing;
    checkListener(listener);
    events2 = target._events;
    if (events2 === void 0) {
      events2 = target._events = /* @__PURE__ */ Object.create(null);
      target._eventsCount = 0;
    } else {
      if (events2.newListener !== void 0) {
        target.emit(
          "newListener",
          type,
          listener.listener ? listener.listener : listener
        );
        events2 = target._events;
      }
      existing = events2[type];
    }
    if (existing === void 0) {
      existing = events2[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === "function") {
        existing = events2[type] = prepend ? [listener, existing] : [existing, listener];
      } else if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
      m = _getMaxListeners(target);
      if (m > 0 && existing.length > m && !existing.warned) {
        existing.warned = true;
        var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
        w.name = "MaxListenersExceededWarning";
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        ProcessEmitWarning(w);
      }
    }
    return target;
  }
  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  EventEmitter.prototype.prependListener = function prependListener(type, listener) {
    return _addListener(this, type, listener, true);
  };
  function onceWrapper() {
    if (!this.fired) {
      this.target.removeListener(this.type, this.wrapFn);
      this.fired = true;
      if (arguments.length === 0)
        return this.listener.call(this.target);
      return this.listener.apply(this.target, arguments);
    }
  }
  function _onceWrap(target, type, listener) {
    var state = { fired: false, wrapFn: void 0, target, type, listener };
    var wrapped = onceWrapper.bind(state);
    wrapped.listener = listener;
    state.wrapFn = wrapped;
    return wrapped;
  }
  EventEmitter.prototype.once = function once2(type, listener) {
    checkListener(listener);
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };
  EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
    checkListener(listener);
    this.prependListener(type, _onceWrap(this, type, listener));
    return this;
  };
  EventEmitter.prototype.removeListener = function removeListener(type, listener) {
    var list, events2, position, i, originalListener;
    checkListener(listener);
    events2 = this._events;
    if (events2 === void 0)
      return this;
    list = events2[type];
    if (list === void 0)
      return this;
    if (list === listener || list.listener === listener) {
      if (--this._eventsCount === 0)
        this._events = /* @__PURE__ */ Object.create(null);
      else {
        delete events2[type];
        if (events2.removeListener)
          this.emit("removeListener", type, list.listener || listener);
      }
    } else if (typeof list !== "function") {
      position = -1;
      for (i = list.length - 1; i >= 0; i--) {
        if (list[i] === listener || list[i].listener === listener) {
          originalListener = list[i].listener;
          position = i;
          break;
        }
      }
      if (position < 0)
        return this;
      if (position === 0)
        list.shift();
      else {
        spliceOne(list, position);
      }
      if (list.length === 1)
        events2[type] = list[0];
      if (events2.removeListener !== void 0)
        this.emit("removeListener", type, originalListener || listener);
    }
    return this;
  };
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
    var listeners, events2, i;
    events2 = this._events;
    if (events2 === void 0)
      return this;
    if (events2.removeListener === void 0) {
      if (arguments.length === 0) {
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
      } else if (events2[type] !== void 0) {
        if (--this._eventsCount === 0)
          this._events = /* @__PURE__ */ Object.create(null);
        else
          delete events2[type];
      }
      return this;
    }
    if (arguments.length === 0) {
      var keys = Object.keys(events2);
      var key;
      for (i = 0; i < keys.length; ++i) {
        key = keys[i];
        if (key === "removeListener")
          continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners("removeListener");
      this._events = /* @__PURE__ */ Object.create(null);
      this._eventsCount = 0;
      return this;
    }
    listeners = events2[type];
    if (typeof listeners === "function") {
      this.removeListener(type, listeners);
    } else if (listeners !== void 0) {
      for (i = listeners.length - 1; i >= 0; i--) {
        this.removeListener(type, listeners[i]);
      }
    }
    return this;
  };
  function _listeners(target, type, unwrap) {
    var events2 = target._events;
    if (events2 === void 0)
      return [];
    var evlistener = events2[type];
    if (evlistener === void 0)
      return [];
    if (typeof evlistener === "function")
      return unwrap ? [evlistener.listener || evlistener] : [evlistener];
    return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
  }
  EventEmitter.prototype.listeners = function listeners(type) {
    return _listeners(this, type, true);
  };
  EventEmitter.prototype.rawListeners = function rawListeners(type) {
    return _listeners(this, type, false);
  };
  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === "function") {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };
  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events2 = this._events;
    if (events2 !== void 0) {
      var evlistener = events2[type];
      if (typeof evlistener === "function") {
        return 1;
      } else if (evlistener !== void 0) {
        return evlistener.length;
      }
    }
    return 0;
  }
  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
  };
  function arrayClone(arr, n) {
    var copy = new Array(n);
    for (var i = 0; i < n; ++i)
      copy[i] = arr[i];
    return copy;
  }
  function spliceOne(list, index) {
    for (; index + 1 < list.length; index++)
      list[index] = list[index + 1];
    list.pop();
  }
  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }
  function once(emitter, name) {
    return new Promise(function(resolve, reject) {
      function errorListener(err) {
        emitter.removeListener(name, resolver);
        reject(err);
      }
      function resolver() {
        if (typeof emitter.removeListener === "function") {
          emitter.removeListener("error", errorListener);
        }
        resolve([].slice.call(arguments));
      }
      eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
      if (name !== "error") {
        addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
      }
    });
  }
  function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
    if (typeof emitter.on === "function") {
      eventTargetAgnosticAddListener(emitter, "error", handler, flags);
    }
  }
  function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
    if (typeof emitter.on === "function") {
      if (flags.once) {
        emitter.once(name, listener);
      } else {
        emitter.on(name, listener);
      }
    } else if (typeof emitter.addEventListener === "function") {
      emitter.addEventListener(name, function wrapListener(arg) {
        if (flags.once) {
          emitter.removeEventListener(name, wrapListener);
        }
        listener(arg);
      });
    } else {
      throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
    }
  }
  var EventEmitter$1 = events.exports;
  class CommonEventEmitter extends EventEmitter$1 {
    on(eventName, listener) {
      return super.on(eventName.toString(), listener);
    }
    once(eventName, listener) {
      return super.once(eventName.toString(), listener);
    }
    emit(eventName, ...args) {
      return super.emit(eventName.toString(), ...args);
    }
    off(eventName, listener) {
      return super.off(eventName.toString(), listener);
    }
  }
  class BaseScript extends CommonEventEmitter {
  }
  class Script extends BaseScript {
    constructor({
      name,
      namespace,
      url,
      excludes,
      configs,
      hideInPanel,
      onstart,
      onactive,
      oncomplete,
      onbeforeunload,
      onrender,
      onhistorychange,
      methods
    }) {
      super();
      this.excludes = [];
      this.cfg = {};
      this.methods = /* @__PURE__ */ Object.create({});
      this.event = new EventEmitter$1();
      this.name = name;
      this.namespace = namespace;
      this.url = url;
      this.excludes = excludes;
      this._configs = configs;
      this.hideInPanel = hideInPanel;
      this.onstart = this.errorHandler(onstart);
      this.onactive = this.errorHandler(onactive);
      this.oncomplete = this.errorHandler(oncomplete);
      this.onbeforeunload = this.errorHandler(onbeforeunload);
      this.onrender = this.errorHandler(onrender);
      this.onhistorychange = this.errorHandler(onhistorychange);
      this.methods = (methods == null ? void 0 : methods.bind(this)()) || /* @__PURE__ */ Object.create({});
      if (this.methods) {
        for (const key in methods) {
          if (Reflect.has(this.methods, key) && typeof this.methods[key] !== "function") {
            Reflect.set(this.methods, key, this.errorHandler(this.methods[key]));
          }
        }
      }
    }
    get configs() {
      if (!this._resolvedConfigs) {
        this._resolvedConfigs = typeof this._configs === "function" ? this._configs() : this._configs;
      }
      return this._resolvedConfigs;
    }
    set configs(c) {
      this._configs = c;
    }
    onConfigChange(key, handler) {
      const _key = $.namespaceKey(this.namespace, key.toString());
      return $store.addChangeListener(_key, (pre, curr, remote) => {
        handler(curr, pre, !!remote);
      });
    }
    offConfigChange(listener) {
      $store.removeChangeListener(listener);
    }
    errorHandler(func) {
      return (...args) => {
        try {
          return func == null ? void 0 : func.apply(this, args);
        } catch (err) {
          console.error(err);
          if (err instanceof Error) {
            this.emit("scripterror", err.message);
          } else {
            this.emit("scripterror", String(err));
          }
        }
      };
    }
  }
  const minimizeSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13H5v-2h14v2z"/></svg>';
  const expandSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z"/></svg>';
  const RenderScript = new Script({
    name: "\u{1F5BC}\uFE0F \u7A97\u53E3\u8BBE\u7F6E",
    url: [["\u6240\u6709", /.*/]],
    namespace: "render.panel",
    configs: {
      notes: {
        defaultValue: $creator.notes([
          ["\u5982\u679C\u9700\u8981\u9690\u85CF\u6574\u4E2A\u7A97\u53E3\uFF0C\u53EF\u4EE5\u70B9\u51FB\u4E0B\u65B9\u9690\u85CF\u6309\u94AE\uFF0C", "\u9690\u85CF\u540E\u53EF\u4EE5\u5FEB\u901F\u4E09\u51FB\u5C4F\u5E55\u4E2D\u7684\u4EFB\u610F\u5730\u65B9", "\u6765\u91CD\u65B0\u663E\u793A\u7A97\u53E3\u3002"],
          "\u7A97\u53E3\u8FDE\u7EED\u70B9\u51FB\u663E\u793A\u7684\u6B21\u6570\u53EF\u4EE5\u81EA\u5B9A\u4E49\uFF0C\u9ED8\u8BA4\u4E3A\u4E09\u6B21"
        ]).outerHTML
      },
      x: { defaultValue: window.innerWidth * 0.1 },
      y: { defaultValue: window.innerWidth * 0.1 },
      visual: { defaultValue: "normal" },
      firstCloseAlert: {
        defaultValue: true
      },
      fontsize: {
        label: "\u5B57\u4F53\u5927\u5C0F\uFF08\u50CF\u7D20\uFF09",
        attrs: { type: "number", min: 12, max: 24, step: 1 },
        defaultValue: 14
      },
      switchPoint: {
        label: "\u7A97\u53E3\u663E\u793A\u8FDE\u70B9\uFF08\u6B21\u6570\uFF09",
        attrs: {
          type: "number",
          min: 3,
          max: 10,
          step: 1,
          title: "\u8BBE\u7F6E\u5F53\u8FDE\u7EED\u70B9\u51FB\u5C4F\u5E55 N \u6B21\u65F6\uFF0C\u53EF\u4EE5\u8FDB\u884C\u9762\u677F\u7684 \u9690\u85CF/\u663E\u793A \u5207\u6362\uFF0C\u9ED8\u8BA4\u8FDE\u7EED\u70B9\u51FB\u5C4F\u5E55\u4E09\u4E0B"
        },
        defaultValue: 3
      },
      lockConfigs: {
        defaultValue: false
      },
      lockMessage: {
        defaultValue: "\u5F53\u524D\u811A\u672C\u5DF2\u9501\u5B9A\u914D\u7F6E\uFF0C\u65E0\u6CD5\u4FEE\u6539"
      }
    },
    methods() {
      return {
        isPinned: async (script) => {
          const currentPanelName = await $store.getTab($const.TAB_CURRENT_PANEL_NAME);
          return isCurrentPanel(script.projectName, script, currentPanelName);
        },
        pin: async (script) => {
          if (script.projectName) {
            await $store.setTab($const.TAB_CURRENT_PANEL_NAME, `${script.projectName}-${script.name}`);
          } else if (script.namespace) {
            await $store.setTab($const.TAB_CURRENT_PANEL_NAME, script.namespace);
          } else {
            console.warn("[OCS]", `${script.name} \u65E0\u6CD5\u7F6E\u9876\uFF0C projectName \u4E0E namespace \u90FD\u4E3A undefined`);
          }
        }
      };
    },
    onrender({ panel: panel2 }) {
      const closeBtn = el("button", { className: "base-style-button" }, "\u9690\u85CF\u7A97\u53E3");
      closeBtn.onclick = () => {
        if (this.cfg.firstCloseAlert) {
          $modal("confirm", {
            content: $creator.notes([
              "\u9690\u85CF\u811A\u672C\u9875\u9762\u540E\uFF0C\u5FEB\u901F\u70B9\u51FB\u9875\u9762\u4E09\u4E0B\uFF08\u53EF\u4EE5\u5728\u60AC\u6D6E\u7A97\u8BBE\u7F6E\u4E2D\u8C03\u6574\u6B21\u6570\uFF09\u5373\u53EF\u91CD\u65B0\u663E\u793A\u811A\u672C\u3002\u5982\u679C\u4E09\u4E0B\u65E0\u6548\uFF0C\u53EF\u4EE5\u5C1D\u8BD5\u5220\u9664\u811A\u672C\u91CD\u65B0\u5B89\u88C5\u3002",
              "\u8BF7\u786E\u8BA4\u662F\u5426\u5173\u95ED\u3002\uFF08\u6B64\u540E\u4E0D\u518D\u663E\u793A\u6B64\u5F39\u7A97\uFF09"
            ]),
            onConfirm: () => {
              this.cfg.visual = "close";
              this.cfg.firstCloseAlert = false;
            }
          });
        } else {
          this.cfg.visual = "close";
        }
      };
      panel2.body.replaceChildren(el("hr"), closeBtn);
    },
    async onactive({ style, projects, defaultPanelName }) {
      handleLowLevelBrowser();
      $.loadCustomElements(definedCustomElements);
      const defaults = {
        urls: (urls) => urls && urls.length ? urls : [location.href],
        panelName: (name) => name || defaultPanelName || ""
      };
      const matchedScripts = $.getMatchedScripts(projects, [location.href]).filter((s) => !s.hideInPanel);
      const container = el("container-element");
      const initHeader = (urls, currentPanelName) => {
        const infos = $gm.getInfos();
        const profile = $creator.tooltip(
          el(
            "div",
            { className: "profile", title: "\u83DC\u5355\u680F\uFF08\u53EF\u62D6\u52A8\u533A\u57DF\uFF09" },
            `OCS${infos ? "-" : ""}${(infos == null ? void 0 : infos.script.version) || ""}`
          )
        );
        const scriptDropdowns = [];
        for (const project of projects) {
          const dropdown = el("dropdown-element");
          let selected = false;
          const options = [];
          const scripts = $.getMatchedScripts([project], urls).filter((s) => !s.hideInPanel);
          if (scripts.length) {
            for (const key in project.scripts) {
              if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
                const script = project.scripts[key];
                if (!script.hideInPanel) {
                  const optionSelected = isCurrentPanel(project.name, script, currentPanelName);
                  const option = el("div", { className: "dropdown-option" }, script.name);
                  if (optionSelected) {
                    option.classList.add("active");
                  }
                  if (selected !== true && optionSelected) {
                    selected = true;
                  }
                  option.onclick = () => {
                    $store.setTab($const.TAB_CURRENT_PANEL_NAME, project.name + "-" + script.name);
                  };
                  options.push(option);
                }
              }
            }
            if (selected) {
              dropdown.classList.add("active");
            }
            dropdown.triggerElement = el("div", { className: "dropdown-trigger-element " }, project.name);
            dropdown.triggerElement.style.padding = "0px 8px";
            dropdown.content.append(...options);
            scriptDropdowns.push(dropdown);
          }
        }
        const isMinimize = () => this.cfg.visual === "minimize";
        const visualSwitcher = $creator.tooltip(
          el("div", {
            className: "switch ",
            title: isMinimize() ? "\u70B9\u51FB\u5C55\u5F00\u7A97\u53E3" : "\u70B9\u51FB\u6700\u5C0F\u5316\u7A97\u53E3",
            innerHTML: isMinimize() ? expandSvg : minimizeSvg,
            onclick: () => {
              this.cfg.visual = isMinimize() ? "normal" : "minimize";
              visualSwitcher.title = isMinimize() ? "\u70B9\u51FB\u5C55\u5F00\u7A97\u53E3" : "\u70B9\u51FB\u6700\u5C0F\u5316\u7A97\u53E3";
              visualSwitcher.innerHTML = isMinimize() ? expandSvg : minimizeSvg;
            }
          })
        );
        container.header.visualSwitcher = visualSwitcher;
        container.header.replaceChildren();
        container.header.append(profile, ...scriptDropdowns, container.header.visualSwitcher || "");
      };
      const handlePosition = () => {
        if (this.cfg.x > document.documentElement.clientWidth || this.cfg.x < 0) {
          this.cfg.x = 10;
          this.cfg.y = 10;
        }
        if (this.cfg.y > document.documentElement.clientHeight || this.cfg.y < 0) {
          this.cfg.x = 10;
          this.cfg.y = 10;
        }
        container.style.left = this.cfg.x + "px";
        container.style.top = this.cfg.y + "px";
        const positionHandler = () => {
          this.cfg.x = container.offsetLeft;
          this.cfg.y = container.offsetTop;
        };
        enableElementDraggable(container.header, container, positionHandler);
        this.onConfigChange(
          "x",
          debounce_1((x) => container.style.left = x + "px", 200)
        );
        this.onConfigChange(
          "y",
          debounce_1((y) => container.style.top = y + "px", 200)
        );
      };
      const visual = (value) => {
        container.className = "";
        if (value === "minimize") {
          container.classList.add("minimize");
        } else if (value === "close") {
          container.classList.add("close");
        } else {
          container.classList.add("normal");
        }
      };
      const handleVisible = () => {
        window.addEventListener("click", (e) => {
          if (e.detail === Math.max(this.cfg.switchPoint, 3)) {
            container.style.top = e.y + "px";
            container.style.left = e.x + "px";
            this.cfg.x = e.x;
            this.cfg.y = e.y;
            this.cfg.visual = "normal";
          }
        });
        this.onConfigChange("visual", (curr) => visual(curr));
      };
      const renderBody = async (currentPanelName) => {
        var _a;
        for (const project of projects) {
          for (const key in project.scripts) {
            if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
              const script = project.scripts[key];
              if (isCurrentPanel(project.name, script, currentPanelName)) {
                const panel2 = $creator.scriptPanel(script, {
                  projectName: project.name
                });
                script.projectName = project.name;
                script.panel = panel2;
                script.header = container.header;
                container.body.replaceChildren(panel2);
                (_a = script.onrender) == null ? void 0 : _a.call(script, { panel: panel2, header: container.header });
                script.emit("render", { panel: panel2, header: container.header });
              }
            }
          }
        }
      };
      const initModalSystem = () => {
        cors.on("modal", async ([type, _attrs]) => {
          return new Promise((resolve, reject) => {
            const attrs = _attrs;
            attrs.onCancel = () => resolve("");
            attrs.onConfirm = resolve;
            attrs.onClose = resolve;
            $modal(type, attrs);
          });
        });
      };
      const onFontsizeChange = () => {
        container.style.font = `${this.cfg.fontsize}px  Menlo, Monaco, Consolas, 'Courier New', monospace`;
      };
      const rerender = async (urls, currentPanelName) => {
        initHeader(urls, currentPanelName);
        await renderBody(currentPanelName);
      };
      if (matchedScripts.length !== 0 && self === top) {
        $store.setTab($const.TAB_URLS, []);
        container.append(el("style", {}, style || ""), $elements.messageContainer);
        $elements.root.append(container);
        document.body.children[$.random(0, document.body.children.length - 1)].after($elements.panel);
        handleVisible();
        visual(this.cfg.visual);
        (async () => {
          const urls = await $store.getTab($const.TAB_URLS);
          const currentPanelName = await $store.getTab($const.TAB_CURRENT_PANEL_NAME);
          await rerender(defaults.urls(urls), defaults.panelName(currentPanelName));
        })();
        initModalSystem();
        handlePosition();
        onFontsizeChange();
        $store.addTabChangeListener(
          $const.TAB_URLS,
          debounce_1(async (urls) => {
            const currentPanelName = await $store.getTab($const.TAB_CURRENT_PANEL_NAME);
            rerender(defaults.urls(urls), defaults.panelName(currentPanelName));
          }, 2e3)
        );
        $store.addTabChangeListener($const.TAB_CURRENT_PANEL_NAME, async (currentPanelName) => {
          const urls = await $store.getTab($const.TAB_URLS) || [location.href];
          rerender(defaults.urls(urls), defaults.panelName(currentPanelName));
        });
        this.onConfigChange("fontsize", onFontsizeChange);
      }
    }
  });
  function $modal(type, attrs) {
    if (self === top) {
      const {
        disableWrapperCloseable,
        onConfirm,
        onCancel,
        onClose,
        notification: notify,
        notificationOptions,
        ..._attrs
      } = attrs;
      if (notify) {
        $gm.notification(
          typeof _attrs.content === "string" ? _attrs.content : _attrs.content.innerText,
          notificationOptions
        );
      }
      const wrapper = el("div", { className: "modal-wrapper" }, (wrapper2) => {
        const modal = el("modal-element", {
          async onConfirm(val) {
            const isClose = await (onConfirm == null ? void 0 : onConfirm.apply(modal, [val]));
            if (isClose !== false) {
              wrapper2.remove();
            }
            return isClose;
          },
          onCancel() {
            onCancel == null ? void 0 : onCancel.apply(modal);
            wrapper2.remove();
          },
          onClose(val) {
            onClose == null ? void 0 : onClose.apply(modal, [val]);
            wrapper2.remove();
          },
          type,
          ..._attrs
        });
        wrapper2.append(modal);
        modal.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        if (!disableWrapperCloseable) {
          wrapper2.addEventListener("click", () => {
            onClose == null ? void 0 : onClose.apply(modal);
            wrapper2.remove();
          });
        }
      });
      $elements.root.append(wrapper);
      return wrapper;
    } else {
      cors.emit("modal", [type, attrs], (args, remote) => {
        var _a, _b, _c;
        if (args) {
          (_a = attrs.onConfirm) == null ? void 0 : _a.call(attrs, args);
        } else {
          (_b = attrs.onCancel) == null ? void 0 : _b.call(attrs);
        }
        (_c = attrs.onClose) == null ? void 0 : _c.call(attrs, args);
      });
    }
  }
  function $message(type, attrs) {
    const message = el("message-element", { type, ...attrs });
    $elements.messageContainer.append(message);
    return message;
  }
  function isCurrentPanel(projectName, script, currentPanelName) {
    return projectName + "-" + script.name === currentPanelName || script.namespace === currentPanelName;
  }
  function handleLowLevelBrowser() {
    if (typeof Element.prototype.replaceChildren === "undefined") {
      Element.prototype.replaceChildren = function(...nodes) {
        this.innerHTML = "";
        for (const node of nodes) {
          this.append(node);
        }
      };
    }
  }
  function defaultQuestionResolve(ctx) {
    return {
      async single(infos, options, handler) {
        const allAnswer = infos.map((res) => res.results.map((res2) => splitAnswer(res2.answer)).flat()).flat();
        const optionStrings = options.map((o) => removeRedundant(o.innerText));
        const ratings = answerSimilar(allAnswer, optionStrings);
        let index = -1;
        let max = 0;
        ratings.forEach((rating, i) => {
          if (rating.rating > max) {
            max = rating.rating;
            index = i;
          }
        });
        if (index !== -1 && max > 0.6) {
          await handler("single", options[index].innerText, options[index], ctx);
          await $.sleep(500);
          return {
            finish: true,
            ratings: ratings.map((r) => r.rating)
          };
        }
        for (const info of infos) {
          for (const res of info.results) {
            const ans = StringUtils.nowrap(res.answer).trim();
            if (ans.length === 1 && isPlainAnswer(ans)) {
              const index2 = ans.charCodeAt(0) - 65;
              await handler("single", options[index2].innerText, options[index2], ctx);
              await $.sleep(500);
              return { finish: true, option: options[index2] };
            }
          }
        }
        return { finish: false, allAnswer, options: optionStrings, ratings };
      },
      async multiple(infos, options, handler) {
        const targetAnswers = [];
        const targetOptions = [];
        const list = [];
        const results = infos.map((info) => info.results).flat();
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const answers = splitAnswer(result.answer);
          const matchResult = { options: [], answers: [], ratings: [], similarSum: 0, similarCount: 0 };
          for (const option of options) {
            const ans = answers.find(
              (answer) => answer.includes(removeRedundant(option.textContent || option.innerText))
            );
            if (ans) {
              matchResult.options.push(option);
              matchResult.answers.push(ans);
              matchResult.ratings.push(1);
              matchResult.similarSum += 1;
              matchResult.similarCount += 1;
            }
          }
          const ratingResult = { options: [], answers: [], ratings: [], similarSum: 0, similarCount: 0 };
          const ratings = answerSimilar(
            answers,
            options.map((o) => removeRedundant(o.innerText))
          );
          for (let j = 0; j < ratings.length; j++) {
            const rating = ratings[j];
            if (rating.rating > 0.6) {
              ratingResult.options.push(options[j]);
              ratingResult.answers.push(ratings[j].target);
              ratingResult.ratings.push(ratings[j].rating);
              ratingResult.similarSum += rating.rating;
              ratingResult.similarCount += 1;
            }
          }
          if (matchResult.similarSum > ratingResult.similarSum) {
            list[i] = matchResult;
          } else {
            list[i] = ratingResult;
          }
        }
        const match = list.filter((i) => i.similarCount !== 0).sort((a, b) => {
          const bsc = b.similarCount * 100;
          const asc = a.similarCount * 100;
          const bss = b.similarSum;
          const ass = a.similarSum;
          return bsc + bss - asc + ass;
        });
        if (match[0]) {
          for (let i = 0; i < match[0].options.length; i++) {
            await handler("multiple", match[0].answers[i], match[0].options[i], ctx);
            await $.sleep(500);
          }
          return { finish: true, match, targetOptions, targetAnswers };
        } else {
          const plainOptions = [];
          for (const result of results) {
            const ans = StringUtils.nowrap(result.answer).trim();
            if (isPlainAnswer(ans)) {
              for (const char of ans) {
                const index = char.charCodeAt(0) - 65;
                await handler("single", options[index].innerText, options[index], ctx);
                await $.sleep(500);
                plainOptions.push(options[index]);
              }
            }
          }
          if (plainOptions.length) {
            return { finish: true, plainOptions };
          } else {
            return { finish: false };
          }
        }
      },
      async judgement(infos, options, handler) {
        for (const answers of infos.map((info) => info.results.map((res) => res.answer))) {
          let matches = function(target, options2) {
            return options2.some((option) => RegExp(clearString(option, "\u221A", "\xD7")).test(clearString(target, "\u221A", "\xD7")));
          };
          const correctWords = ["\u662F", "\u5BF9", "\u6B63\u786E", "\u786E\u5B9A", "\u221A", "\u5BF9\u7684", "\u662F\u7684", "\u6B63\u786E\u7684", "true", "True", "yes", "1"];
          const incorrectWords = [
            "\u975E",
            "\u5426",
            "\u9519",
            "\u9519\u8BEF",
            "\xD7",
            "X",
            "\u9519\u7684",
            "\u4E0D\u5BF9",
            "\u4E0D\u6B63\u786E\u7684",
            "\u4E0D\u6B63\u786E",
            "\u4E0D\u662F",
            "\u4E0D\u662F\u7684",
            "false",
            "False",
            "no",
            "0"
          ];
          const answerShowCorrect = answers.find((answer) => matches(answer, correctWords));
          const answerShowIncorrect = answers.find((answer) => matches(answer, incorrectWords));
          if (answerShowCorrect || answerShowIncorrect) {
            let option;
            for (const el2 of options) {
              const textShowCorrect = matches(el2.innerText, correctWords);
              const textShowIncorrect = matches(el2.innerText, incorrectWords);
              if (answerShowCorrect && textShowCorrect) {
                option = el2;
                await handler("judgement", answerShowCorrect, el2, ctx);
                await $.sleep(500);
                break;
              }
              if (answerShowIncorrect && textShowIncorrect) {
                option = el2;
                await handler("judgement", answerShowIncorrect, el2, ctx);
                await $.sleep(500);
                break;
              }
            }
            return { finish: true, option };
          }
        }
        return { finish: false };
      },
      async completion(infos, options, handler) {
        for (const answers of infos.map((info) => info.results.map((res) => res.answer))) {
          let ans = answers.filter((ans2) => ans2);
          if (ans.length === 1) {
            ans = splitAnswer(ans[0]);
          }
          if (ans.length !== 0 && (ans.length === options.length || options.length === 1)) {
            if (ans.length === options.length) {
              for (let index = 0; index < options.length; index++) {
                const element = options[index];
                await handler("completion", ans[index], element, ctx);
                await $.sleep(500);
              }
              return { finish: true };
            } else if (options.length === 1) {
              await handler("completion", ans.join(" "), options[0], ctx);
              await $.sleep(500);
              return { finish: true };
            }
            return { finish: false };
          }
        }
        return { finish: false };
      }
    };
  }
  class OCSWorker extends CommonEventEmitter {
    constructor(opts) {
      super();
      this.isRunning = false;
      this.isClose = false;
      this.isStop = false;
      this.requestIndex = 0;
      this.resolverIndex = 0;
      this.totalQuestionCount = 0;
      this.locks = [];
      this.opts = opts;
    }
    async doWork() {
      var _a, _b, _c, _d;
      this.requestIndex = 0;
      this.resolverIndex = 0;
      this.totalQuestionCount = 0;
      this.emit("start");
      this.isRunning = true;
      this.once("close", () => {
        this.isClose = true;
      });
      this.on("stop", () => {
        this.isStop = true;
      });
      this.on("continuate", () => {
        this.isStop = false;
      });
      const questionRoot = typeof this.opts.root === "string" ? Array.from(document.querySelectorAll(this.opts.root)) : this.opts.root;
      this.totalQuestionCount = questionRoot.length;
      this.locks = Array(this.totalQuestionCount).fill(1);
      const results = [];
      for (const q of questionRoot) {
        const ctx = {
          searchInfos: [],
          root: q,
          elements: domSearchAll(this.opts.elements, q)
        };
        await ((_b = (_a = this.opts).onElementSearched) == null ? void 0 : _b.call(_a, ctx.elements, q));
        ctx.elements.title = (_c = ctx.elements.title) == null ? void 0 : _c.filter(Boolean);
        ctx.elements.options = (_d = ctx.elements.options) == null ? void 0 : _d.filter(Boolean);
        results.push({
          requesting: true,
          resolving: true,
          type: void 0,
          ctx
        });
      }
      const resolvers = [];
      const requestThread = async () => {
        var _a2, _b2, _c2;
        while (this.locks.shift()) {
          const i = this.requestIndex++;
          const ctx = results[i].ctx || {};
          if (this.isClose === true) {
            this.isRunning = false;
            return results;
          }
          let type;
          let error;
          try {
            if (this.isStop) {
              await waitForContinuate(() => this.isStop);
            }
            if (typeof this.opts.work === "object") {
              type = this.opts.work.type === void 0 ? defaultWorkTypeResolver(ctx) : typeof this.opts.work.type === "string" ? this.opts.work.type : this.opts.work.type(ctx);
            }
            const searchInfos = await this.opts.answerer(ctx.elements, type, ctx);
            let resultPromise;
            searchInfos.forEach((info) => {
              info.results = info.results.map((ans) => {
                ans.answer = ans.answer ? ans.answer : "";
                return ans;
              });
            });
            ctx.searchInfos = searchInfos;
            if (searchInfos.length === 0) {
              error = "\u641C\u7D22\u4E0D\u5230\u7B54\u6848, \u8BF7\u91CD\u65B0\u8FD0\u884C, \u6216\u8005\u5FFD\u7565\u6B64\u9898\u3002";
            }
            if (typeof this.opts.work === "object") {
              if (ctx.elements.options) {
                if (type) {
                  const resolver = defaultQuestionResolve(ctx)[type];
                  const handler = this.opts.work.handler;
                  resultPromise = async () => await resolver(searchInfos, ctx.elements.options, handler);
                } else {
                  error = "\u9898\u76EE\u7C7B\u578B\u89E3\u6790\u5931\u8D25, \u8BF7\u81EA\u884C\u63D0\u4F9B\u89E3\u6790\u5668, \u6216\u8005\u5FFD\u7565\u6B64\u9898\u3002";
                }
              } else {
                error = "elements.options \u4E3A\u7A7A ! \u4F7F\u7528\u9ED8\u8BA4\u5904\u7406\u5668, \u5FC5\u987B\u63D0\u4F9B\u9898\u76EE\u9009\u9879\u7684\u9009\u62E9\u5668\u3002";
              }
            } else {
              const work = this.opts.work;
              resultPromise = async () => await work(ctx);
            }
            if (resultPromise) {
              resolvers.push({
                func: resultPromise,
                index: i
              });
            } else {
              resolvers.push({
                func: async () => ({ finish: false }),
                index: i
              });
            }
          } catch (err) {
            resolvers.push({
              func: async () => ({ finish: false }),
              index: i
            });
            if (err instanceof Error) {
              error = err.message;
            } else {
              error = String(err);
            }
          }
          const currentResult = {
            requesting: false,
            resolving: true,
            ctx,
            error,
            type
          };
          results[i] = currentResult;
          await ((_b2 = (_a2 = this.opts).onResultsUpdate) == null ? void 0 : _b2.call(_a2, results, currentResult));
          await $.sleep(((_c2 = this.opts.requestPeriod) != null ? _c2 : 3) * 1e3);
        }
      };
      const resolverThread = new Promise((resolve) => {
        const start2 = async () => {
          var _a2, _b2, _c2, _d2;
          if (this.isClose === true) {
            this.isRunning = false;
            return;
          }
          if (this.isStop) {
            await waitForContinuate(() => this.isStop);
          }
          if (this.resolverIndex < this.totalQuestionCount) {
            const resolver = resolvers.shift();
            if (resolver) {
              this.resolverIndex++;
              try {
                const result = await resolver.func();
                results[resolver.index].result = result;
                results[resolver.index].resolving = false;
                await ((_b2 = (_a2 = this.opts).onResultsUpdate) == null ? void 0 : _b2.call(_a2, results, results[resolver.index]));
                await ((_d2 = (_c2 = this.opts).onResolveUpdate) == null ? void 0 : _d2.call(_c2, results[resolver.index]));
              } catch (e) {
                results[resolver.index].result = { finish: false };
                results[resolver.index].resolving = false;
                results[resolver.index].error = (e == null ? void 0 : e.message) || e;
              }
              loop();
            } else {
              loop();
            }
          } else {
            resolve();
          }
        };
        const loop = async () => {
          var _a2;
          setTimeout(start2, ((_a2 = this.opts.resolvePeriod) != null ? _a2 : 0) * 1e3);
        };
        start2();
      });
      await Promise.all([
        ...Array(Math.max(this.opts.thread || 1, 1)).fill("").map(() => requestThread()),
        resolverThread
      ]);
      this.isRunning = false;
      return results;
    }
    async uploadHandler(options) {
      var _a;
      const { results, type, callback } = options;
      let finished = 0;
      for (const result of results) {
        if ((_a = result.result) == null ? void 0 : _a.finish) {
          finished++;
        }
      }
      const rate = results.length === 0 ? 0 : finished / results.length * 100;
      if (type !== "nomove") {
        if (type === "force") {
          await callback(rate, true);
        } else {
          await callback(rate, type === "save" ? false : rate >= parseFloat(type.toString()));
        }
      }
    }
  }
  async function waitForContinuate(isStopping) {
    if (isStopping()) {
      await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (isStopping() === false) {
            clearInterval(interval);
            resolve();
          }
        }, 200);
      });
    }
  }
  async function defaultAnswerWrapperHandler(answererWrappers, env) {
    const searchInfos = [];
    const temp = JSON.parse(JSON.stringify(answererWrappers));
    if (temp.length === 0) {
      throw new Error("\u9898\u5E93\u914D\u7F6E\u4E0D\u80FD\u4E3A\u7A7A\uFF0C\u8BF7\u914D\u7F6E\u540E\u91CD\u65B0\u5F00\u59CB\u81EA\u52A8\u7B54\u9898\u3002");
    }
    await Promise.all(
      temp.map(async (wrapper) => {
        const {
          name = "\u672A\u77E5\u9898\u5E93",
          homepage = "#",
          method = "get",
          type = "fetch",
          contentType = "json",
          headers = {},
          data: wrapperData = {},
          handler = "return (res)=> [JSON.stringify(res), undefined]"
        } = wrapper;
        try {
          let results = [];
          const data = /* @__PURE__ */ Object.create({});
          Reflect.ownKeys(wrapperData).forEach((key) => {
            Reflect.set(data, key, resolvePlaceHolder(wrapperData[key.toString()]));
          });
          let url = resolvePlaceHolder(wrapper.url);
          url = method === "post" ? url : url + "?" + new URLSearchParams(data).toString();
          const requestData = {
            method,
            contentType,
            data,
            type,
            headers: JSON.parse(JSON.stringify(headers || {}))
          };
          const responseData = await Promise.race([request(url, requestData), $.sleep(30 * 1e3)]);
          if (responseData === void 0) {
            throw new Error("\u9898\u5E93\u8FDE\u63A5\u8D85\u65F6\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216\u8005\u91CD\u8BD5\u3002");
          }
          const info = Function(handler)()(responseData);
          if (info && Array.isArray(info)) {
            if (info.every((item) => Array.isArray(item))) {
              results = results.concat(
                info.map((item) => ({
                  question: item[0],
                  answer: item[1]
                }))
              );
            } else {
              results.push({
                question: info[0],
                answer: info[1]
              });
            }
          }
          searchInfos.push({
            url: wrapper.url,
            name,
            homepage,
            results,
            response: responseData,
            data: requestData
          });
        } catch (error) {
          searchInfos.push({
            url: wrapper.url,
            name,
            homepage,
            results: [],
            response: void 0,
            data: void 0,
            error: (error == null ? void 0 : error.message) || "\u9898\u5E93\u8FDE\u63A5\u5931\u8D25"
          });
        }
      })
    );
    function resolvePlaceHolder(str) {
      if (typeof str === "string") {
        const matches = str.match(/\${(.*?)}/g) || [];
        matches.forEach((placeHolder) => {
          const value = env[placeHolder.replace(/\${(.*)}/, "$1")];
          str = str.replace(placeHolder, value);
        });
      }
      return str;
    }
    return searchInfos;
  }
  class AnswerWrapperParser {
    static fromObject(json) {
      const aw = json;
      if (aw && Array.isArray(aw)) {
        if (aw.length) {
          for (let i = 0; i < aw.length; i++) {
            const item = aw[i];
            if (typeof item.name !== "string") {
              throw new Error(`\u7B2C ${i + 1} \u4E2A\u9898\u5E93\u7684 \u540D\u5B57(name) \u4E3A\u7A7A`);
            }
            if (typeof item.url !== "string") {
              throw new Error(`\u7B2C ${i + 1} \u4E2A\u9898\u5E93\u7684 \u63A5\u53E3\u5730\u5740(url) \u4E3A\u7A7A`);
            }
            if (typeof item.handler !== "string") {
              throw new Error(`\u7B2C ${i + 1} \u4E2A\u9898\u5E93\u7684 \u89E3\u6790\u5668(handler) \u4E3A\u7A7A`);
            }
            if (item.headers && typeof item.headers !== "object") {
              throw new Error(`\u7B2C ${i + 1} \u4E2A\u9898\u5E93\u7684 \u5934\u90E8\u4FE1\u606F(header) \u5E94\u4E3A \u5BF9\u8C61 \u683C\u5F0F`);
            }
            if (item.data && typeof item.data !== "object") {
              throw new Error(`\u7B2C ${i + 1} \u4E2A\u9898\u5E93\u7684 \u63D0\u4EA4\u6570\u636E(data) \u5E94\u4E3A \u5BF9\u8C61 \u683C\u5F0F`);
            }
            const contentTypes = ["json", "text"];
            if (item.contentType && contentTypes.every((i2) => i2 !== item.contentType)) {
              throw new Error(`\u7B2C ${i + 1} \u4E2A\u9898\u5E93\u7684 contentType \u5FC5\u987B\u4E3A\u4EE5\u4E0B\u9009\u9879\u4E2D\u7684\u4E00\u4E2A  ${contentTypes.join(", ")}`);
            }
            const methods = ["post", "get"];
            if (item.method && methods.every((i2) => i2 !== item.method)) {
              throw new Error(`\u7B2C ${i + 1} \u4E2A\u9898\u5E93\u7684 method \u5FC5\u987B\u4E3A\u4EE5\u4E0B\u9009\u9879\u4E2D\u7684\u4E00\u4E2A  ${methods.join(", ")}`);
            }
            const types = ["fetch", "GM_xmlhttpRequest"];
            if (item.type && types.every((i2) => i2 !== item.type)) {
              throw new Error(`\u7B2C ${i + 1} \u4E2A\u9898\u5E93\u7684 type \u5FC5\u987B\u4E3A\u4EE5\u4E0B\u9009\u9879\u4E2D\u7684\u4E00\u4E2A  ${types.join(", ")}`);
            }
          }
          return aw;
        } else {
          throw new Error("\u9898\u5E93\u4E3A\u7A7A\uFF01");
        }
      } else {
        throw new Error("\u9898\u5E93\u914D\u7F6E\u683C\u5F0F\u9519\u8BEF\uFF01");
      }
    }
    static fromJSONString(json) {
      const raw = json.toString();
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error(`\u683C\u5F0F\u9519\u8BEF\uFF0C\u5FC5\u987B\u4E3A\uFF1Ajson\u5B57\u7B26\u4E32 \u6216 \u9898\u5E93\u914D\u7F6E\u94FE\u63A5`);
      }
    }
    static async fromURL(url) {
      const text = await request(url, {
        responseType: "text",
        method: "get",
        type: "fetch"
      });
      return this.fromJSONString(text);
    }
    static fromBase64(base64) {
      return this.fromJSONString(Buffer.from(base64, "base64").toString("utf8"));
    }
    static from(value) {
      if (typeof value === "string") {
        if (value.startsWith("http")) {
          return this.fromURL(value);
        } else {
          return this.fromJSONString(value);
        }
      } else {
        return this.fromObject(value);
      }
    }
  }
  class Project {
    constructor({ name, domains, scripts, studyProject }) {
      this.name = name;
      this.domains = domains;
      this.scripts = scripts;
      this.studyProject = studyProject;
    }
    static create(opts) {
      return new Project(opts);
    }
  }
  exports2.$ = $;
  exports2.$$el = $$el;
  exports2.$const = $const;
  exports2.$creator = $creator;
  exports2.$el = $el;
  exports2.$elements = $elements;
  exports2.$gm = $gm;
  exports2.$message = $message;
  exports2.$modal = $modal;
  exports2.$store = $store;
  exports2.$string = $string;
  exports2.AnswerWrapperParser = AnswerWrapperParser;
  exports2.BaseScript = BaseScript;
  exports2.CommonEventEmitter = CommonEventEmitter;
  exports2.ConfigElement = ConfigElement;
  exports2.ContainerElement = ContainerElement;
  exports2.CorsEventEmitter = CorsEventEmitter;
  exports2.GMStoreProvider = GMStoreProvider;
  exports2.HeaderElement = HeaderElement;
  exports2.LocalStoreChangeEvent = LocalStoreChangeEvent;
  exports2.MessageElement = MessageElement;
  exports2.ModalElement = ModalElement;
  exports2.OCSWorker = OCSWorker;
  exports2.ObjectStoreProvider = ObjectStoreProvider;
  exports2.Project = Project;
  exports2.RenderScript = RenderScript;
  exports2.Script = Script;
  exports2.ScriptPanelElement = ScriptPanelElement;
  exports2.SearchInfosElement = SearchInfosElement;
  exports2.StringUtils = StringUtils;
  exports2.answerSimilar = answerSimilar;
  exports2.clearString = clearString;
  exports2.cors = cors;
  exports2.defaultAnswerWrapperHandler = defaultAnswerWrapperHandler;
  exports2.defaultQuestionResolve = defaultQuestionResolve;
  exports2.defaultWorkTypeResolver = defaultWorkTypeResolver;
  exports2.definedCustomElements = definedCustomElements;
  exports2.domSearch = domSearch;
  exports2.domSearchAll = domSearchAll;
  exports2.el = el;
  exports2.enableElementDraggable = enableElementDraggable;
  exports2.isPlainAnswer = isPlainAnswer;
  exports2.removeRedundant = removeRedundant;
  exports2.request = request;
  exports2.splitAnswer = splitAnswer;
  exports2.start = start;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
