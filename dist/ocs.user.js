// ==UserScript==
// @name       				OCS 网课助手
// @version    				4.4.5
// @description				OCS(online-course-script) 网课助手，专注于帮助大学生从网课中释放出来。让自己的时间把握在自己的手中，拥有人性化的操作页面，流畅的步骤提示，支持 【知到智慧树】 【超星学习通】 【智慧职教(MOOC学院)】 【职教云】，等网课的学习，作业。具体的功能请查看脚本悬浮窗中的教程页面，OCS官网 https://docs.ocsjs.com 。
// @author     				enncy
// @license    				MIT
// @match      				*://*.zhihuishu.com/*
// @match      				*://*.chaoxing.com/*
// @match      				*://*.edu.cn/*
// @match      				*://*.org.cn/*
// @match      				*://*.xueyinonline.com/*
// @match      				*://*.hnsyu.net/*
// @match      				*://*.icve.com.cn/*
// @match      				*://*.course.icve.com.cn/*
// @match      				*://*.icve.com.cn/*
// @match      				*://*.zjy2.icve.com.cn/*
// @grant      				GM_info
// @grant      				GM_getTab
// @grant      				GM_saveTab
// @grant      				GM_setValue
// @grant      				GM_getValue
// @grant      				unsafeWindow
// @grant      				GM_listValues
// @grant      				GM_deleteValue
// @grant      				GM_notification
// @grant      				GM_xmlhttpRequest
// @grant      				GM_getResourceText
// @grant      				GM_addValueChangeListener
// @grant      				GM_removeValueChangeListener
// @run-at     				document-start
// @namespace  				https://enncy.cn
// @homepage   				https://docs.ocsjs.com
// @source     				https://github.com/ocsjs/ocsjs
// @icon       				https://cdn.ocsjs.com/logo.png
// @connect    				enncy.cn
// @connect    				icodef.com
// @connect    				ocsjs.com
// @connect    				localhost
// @antifeature				payment
// ==/UserScript==

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
    createCenteredPopupWindow(url, winName, opts2) {
      const { width, height, scrollbars, resizable } = opts2;
      const LeftPosition = screen.width ? (screen.width - width) / 2 : 0;
      const TopPosition = screen.height ? (screen.height - height) / 2 : 0;
      const settings = "height=" + height + ",width=" + width + ",top=" + TopPosition + ",left=" + LeftPosition + ",scrollbars=" + (scrollbars ? "yes" : "no") + ",resizable=" + (resizable ? "yes" : "no");
      return window.open(url, winName, settings);
    }
  };
  async function start$1(startConfig) {
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
    scriptPanel(script, opts2) {
      var _a, _b;
      const scriptPanel = el("script-panel-element", { name: script.name });
      script.onConfigChange("notes", (pre, curr) => {
        scriptPanel.notesContainer.innerHTML = script.cfg.notes || "";
      });
      script.panel = scriptPanel;
      scriptPanel.notesContainer.innerHTML = ((_b = (_a = script.configs) == null ? void 0 : _a.notes) == null ? void 0 : _b.defaultValue) || "";
      const els = $creator.configs(script.namespace, script.configs || {}, opts2.onload);
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
    preventText(opts2) {
      const { name, delay = 3, autoRemove = true, ondefault, onprevent } = opts2;
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
  function request(url, opts2) {
    return new Promise((resolve, reject) => {
      try {
        const { responseType = "json", method = "get", type = "fetch", data = {}, headers = {} } = opts2 || {};
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
        if (["checkbox", "radio"].some((t2) => {
          var _a2;
          return t2 === ((_a2 = this.attrs) == null ? void 0 : _a2.type);
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
    var state2 = { fired: false, wrapFn: void 0, target, type, listener };
    var wrapped = onceWrapper.bind(state2);
    wrapped.listener = listener;
    state2.wrapFn = wrapped;
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
      const defaults2 = {
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
          await rerender(defaults2.urls(urls), defaults2.panelName(currentPanelName));
        })();
        initModalSystem();
        handlePosition();
        onFontsizeChange();
        $store.addTabChangeListener(
          $const.TAB_URLS,
          debounce_1(async (urls) => {
            const currentPanelName = await $store.getTab($const.TAB_CURRENT_PANEL_NAME);
            rerender(defaults2.urls(urls), defaults2.panelName(currentPanelName));
          }, 2e3)
        );
        $store.addTabChangeListener($const.TAB_CURRENT_PANEL_NAME, async (currentPanelName) => {
          const urls = await $store.getTab($const.TAB_URLS) || [location.href];
          rerender(defaults2.urls(urls), defaults2.panelName(currentPanelName));
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
    constructor(opts2) {
      super();
      this.isRunning = false;
      this.isClose = false;
      this.isStop = false;
      this.requestIndex = 0;
      this.resolverIndex = 0;
      this.totalQuestionCount = 0;
      this.locks = [];
      this.opts = opts2;
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
              const work2 = this.opts.work;
              resultPromise = async () => await work2(ctx);
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
    static create(opts2) {
      return new Project(opts2);
    }
  }
  function getDefaults() {
    return {
      async: false,
      baseUrl: null,
      breaks: false,
      extensions: null,
      gfm: true,
      headerIds: true,
      headerPrefix: "",
      highlight: null,
      langPrefix: "language-",
      mangle: true,
      pedantic: false,
      renderer: null,
      sanitize: false,
      sanitizer: null,
      silent: false,
      smartypants: false,
      tokenizer: null,
      walkTokens: null,
      xhtml: false
    };
  }
  let defaults = getDefaults();
  function changeDefaults(newDefaults) {
    defaults = newDefaults;
  }
  const escapeTest = /[&<>"']/;
  const escapeReplace = new RegExp(escapeTest.source, "g");
  const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
  const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, "g");
  const escapeReplacements = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  const getEscapeReplacement = (ch) => escapeReplacements[ch];
  function escape$1(html, encode) {
    if (encode) {
      if (escapeTest.test(html)) {
        return html.replace(escapeReplace, getEscapeReplacement);
      }
    } else {
      if (escapeTestNoEncode.test(html)) {
        return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
      }
    }
    return html;
  }
  const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
  function unescape$1(html) {
    return html.replace(unescapeTest, (_, n) => {
      n = n.toLowerCase();
      if (n === "colon")
        return ":";
      if (n.charAt(0) === "#") {
        return n.charAt(1) === "x" ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
      }
      return "";
    });
  }
  const caret = /(^|[^\[])\^/g;
  function edit(regex, opt) {
    regex = typeof regex === "string" ? regex : regex.source;
    opt = opt || "";
    const obj = {
      replace: (name, val) => {
        val = val.source || val;
        val = val.replace(caret, "$1");
        regex = regex.replace(name, val);
        return obj;
      },
      getRegex: () => {
        return new RegExp(regex, opt);
      }
    };
    return obj;
  }
  const nonWordAndColonTest = /[^\w:]/g;
  const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
  function cleanUrl(sanitize, base, href) {
    if (sanitize) {
      let prot;
      try {
        prot = decodeURIComponent(unescape$1(href)).replace(nonWordAndColonTest, "").toLowerCase();
      } catch (e) {
        return null;
      }
      if (prot.indexOf("javascript:") === 0 || prot.indexOf("vbscript:") === 0 || prot.indexOf("data:") === 0) {
        return null;
      }
    }
    if (base && !originIndependentUrl.test(href)) {
      href = resolveUrl(base, href);
    }
    try {
      href = encodeURI(href).replace(/%25/g, "%");
    } catch (e) {
      return null;
    }
    return href;
  }
  const baseUrls = {};
  const justDomain = /^[^:]+:\/*[^/]*$/;
  const protocol = /^([^:]+:)[\s\S]*$/;
  const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;
  function resolveUrl(base, href) {
    if (!baseUrls[" " + base]) {
      if (justDomain.test(base)) {
        baseUrls[" " + base] = base + "/";
      } else {
        baseUrls[" " + base] = rtrim(base, "/", true);
      }
    }
    base = baseUrls[" " + base];
    const relativeBase = base.indexOf(":") === -1;
    if (href.substring(0, 2) === "//") {
      if (relativeBase) {
        return href;
      }
      return base.replace(protocol, "$1") + href;
    } else if (href.charAt(0) === "/") {
      if (relativeBase) {
        return href;
      }
      return base.replace(domain, "$1") + href;
    } else {
      return base + href;
    }
  }
  const noopTest = { exec: function noopTest2() {
  } };
  function merge(obj) {
    let i = 1, target, key;
    for (; i < arguments.length; i++) {
      target = arguments[i];
      for (key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          obj[key] = target[key];
        }
      }
    }
    return obj;
  }
  function splitCells(tableRow, count) {
    const row = tableRow.replace(/\|/g, (match, offset, str) => {
      let escaped = false, curr = offset;
      while (--curr >= 0 && str[curr] === "\\")
        escaped = !escaped;
      if (escaped) {
        return "|";
      } else {
        return " |";
      }
    }), cells = row.split(/ \|/);
    let i = 0;
    if (!cells[0].trim()) {
      cells.shift();
    }
    if (cells.length > 0 && !cells[cells.length - 1].trim()) {
      cells.pop();
    }
    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count)
        cells.push("");
    }
    for (; i < cells.length; i++) {
      cells[i] = cells[i].trim().replace(/\\\|/g, "|");
    }
    return cells;
  }
  function rtrim(str, c, invert) {
    const l = str.length;
    if (l === 0) {
      return "";
    }
    let suffLen = 0;
    while (suffLen < l) {
      const currChar = str.charAt(l - suffLen - 1);
      if (currChar === c && !invert) {
        suffLen++;
      } else if (currChar !== c && invert) {
        suffLen++;
      } else {
        break;
      }
    }
    return str.slice(0, l - suffLen);
  }
  function findClosingBracket(str, b) {
    if (str.indexOf(b[1]) === -1) {
      return -1;
    }
    const l = str.length;
    let level = 0, i = 0;
    for (; i < l; i++) {
      if (str[i] === "\\") {
        i++;
      } else if (str[i] === b[0]) {
        level++;
      } else if (str[i] === b[1]) {
        level--;
        if (level < 0) {
          return i;
        }
      }
    }
    return -1;
  }
  function checkSanitizeDeprecation(opt) {
    if (opt && opt.sanitize && !opt.silent) {
      console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options");
    }
  }
  function repeatString(pattern, count) {
    if (count < 1) {
      return "";
    }
    let result = "";
    while (count > 1) {
      if (count & 1) {
        result += pattern;
      }
      count >>= 1;
      pattern += pattern;
    }
    return result + pattern;
  }
  function outputLink(cap, link, raw, lexer) {
    const href = link.href;
    const title = link.title ? escape$1(link.title) : null;
    const text = cap[1].replace(/\\([\[\]])/g, "$1");
    if (cap[0].charAt(0) !== "!") {
      lexer.state.inLink = true;
      const token = {
        type: "link",
        raw,
        href,
        title,
        text,
        tokens: lexer.inlineTokens(text)
      };
      lexer.state.inLink = false;
      return token;
    }
    return {
      type: "image",
      raw,
      href,
      title,
      text: escape$1(text)
    };
  }
  function indentCodeCompensation(raw, text) {
    const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
    if (matchIndentToCode === null) {
      return text;
    }
    const indentToCode = matchIndentToCode[1];
    return text.split("\n").map((node) => {
      const matchIndentInNode = node.match(/^\s+/);
      if (matchIndentInNode === null) {
        return node;
      }
      const [indentInNode] = matchIndentInNode;
      if (indentInNode.length >= indentToCode.length) {
        return node.slice(indentToCode.length);
      }
      return node;
    }).join("\n");
  }
  class Tokenizer {
    constructor(options) {
      this.options = options || defaults;
    }
    space(src2) {
      const cap = this.rules.block.newline.exec(src2);
      if (cap && cap[0].length > 0) {
        return {
          type: "space",
          raw: cap[0]
        };
      }
    }
    code(src2) {
      const cap = this.rules.block.code.exec(src2);
      if (cap) {
        const text = cap[0].replace(/^ {1,4}/gm, "");
        return {
          type: "code",
          raw: cap[0],
          codeBlockStyle: "indented",
          text: !this.options.pedantic ? rtrim(text, "\n") : text
        };
      }
    }
    fences(src2) {
      const cap = this.rules.block.fences.exec(src2);
      if (cap) {
        const raw = cap[0];
        const text = indentCodeCompensation(raw, cap[3] || "");
        return {
          type: "code",
          raw,
          lang: cap[2] ? cap[2].trim().replace(this.rules.inline._escapes, "$1") : cap[2],
          text
        };
      }
    }
    heading(src2) {
      const cap = this.rules.block.heading.exec(src2);
      if (cap) {
        let text = cap[2].trim();
        if (/#$/.test(text)) {
          const trimmed = rtrim(text, "#");
          if (this.options.pedantic) {
            text = trimmed.trim();
          } else if (!trimmed || / $/.test(trimmed)) {
            text = trimmed.trim();
          }
        }
        return {
          type: "heading",
          raw: cap[0],
          depth: cap[1].length,
          text,
          tokens: this.lexer.inline(text)
        };
      }
    }
    hr(src2) {
      const cap = this.rules.block.hr.exec(src2);
      if (cap) {
        return {
          type: "hr",
          raw: cap[0]
        };
      }
    }
    blockquote(src2) {
      const cap = this.rules.block.blockquote.exec(src2);
      if (cap) {
        const text = cap[0].replace(/^ *>[ \t]?/gm, "");
        const top2 = this.lexer.state.top;
        this.lexer.state.top = true;
        const tokens = this.lexer.blockTokens(text);
        this.lexer.state.top = top2;
        return {
          type: "blockquote",
          raw: cap[0],
          tokens,
          text
        };
      }
    }
    list(src2) {
      let cap = this.rules.block.list.exec(src2);
      if (cap) {
        let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine, line, nextLine, rawLine, itemContents, endEarly;
        let bull = cap[1].trim();
        const isordered = bull.length > 1;
        const list = {
          type: "list",
          raw: "",
          ordered: isordered,
          start: isordered ? +bull.slice(0, -1) : "",
          loose: false,
          items: []
        };
        bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
        if (this.options.pedantic) {
          bull = isordered ? bull : "[*+-]";
        }
        const itemRegex = new RegExp(`^( {0,3}${bull})((?:[	 ][^\\n]*)?(?:\\n|$))`);
        while (src2) {
          endEarly = false;
          if (!(cap = itemRegex.exec(src2))) {
            break;
          }
          if (this.rules.block.hr.test(src2)) {
            break;
          }
          raw = cap[0];
          src2 = src2.substring(raw.length);
          line = cap[2].split("\n", 1)[0].replace(/^\t+/, (t2) => " ".repeat(3 * t2.length));
          nextLine = src2.split("\n", 1)[0];
          if (this.options.pedantic) {
            indent = 2;
            itemContents = line.trimLeft();
          } else {
            indent = cap[2].search(/[^ ]/);
            indent = indent > 4 ? 1 : indent;
            itemContents = line.slice(indent);
            indent += cap[1].length;
          }
          blankLine = false;
          if (!line && /^ *$/.test(nextLine)) {
            raw += nextLine + "\n";
            src2 = src2.substring(nextLine.length + 1);
            endEarly = true;
          }
          if (!endEarly) {
            const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`);
            const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
            const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
            const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);
            while (src2) {
              rawLine = src2.split("\n", 1)[0];
              nextLine = rawLine;
              if (this.options.pedantic) {
                nextLine = nextLine.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ");
              }
              if (fencesBeginRegex.test(nextLine)) {
                break;
              }
              if (headingBeginRegex.test(nextLine)) {
                break;
              }
              if (nextBulletRegex.test(nextLine)) {
                break;
              }
              if (hrRegex.test(src2)) {
                break;
              }
              if (nextLine.search(/[^ ]/) >= indent || !nextLine.trim()) {
                itemContents += "\n" + nextLine.slice(indent);
              } else {
                if (blankLine) {
                  break;
                }
                if (line.search(/[^ ]/) >= 4) {
                  break;
                }
                if (fencesBeginRegex.test(line)) {
                  break;
                }
                if (headingBeginRegex.test(line)) {
                  break;
                }
                if (hrRegex.test(line)) {
                  break;
                }
                itemContents += "\n" + nextLine;
              }
              if (!blankLine && !nextLine.trim()) {
                blankLine = true;
              }
              raw += rawLine + "\n";
              src2 = src2.substring(rawLine.length + 1);
              line = nextLine.slice(indent);
            }
          }
          if (!list.loose) {
            if (endsWithBlankLine) {
              list.loose = true;
            } else if (/\n *\n *$/.test(raw)) {
              endsWithBlankLine = true;
            }
          }
          if (this.options.gfm) {
            istask = /^\[[ xX]\] /.exec(itemContents);
            if (istask) {
              ischecked = istask[0] !== "[ ] ";
              itemContents = itemContents.replace(/^\[[ xX]\] +/, "");
            }
          }
          list.items.push({
            type: "list_item",
            raw,
            task: !!istask,
            checked: ischecked,
            loose: false,
            text: itemContents
          });
          list.raw += raw;
        }
        list.items[list.items.length - 1].raw = raw.trimRight();
        list.items[list.items.length - 1].text = itemContents.trimRight();
        list.raw = list.raw.trimRight();
        const l = list.items.length;
        for (i = 0; i < l; i++) {
          this.lexer.state.top = false;
          list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
          if (!list.loose) {
            const spacers = list.items[i].tokens.filter((t2) => t2.type === "space");
            const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t2) => /\n.*\n/.test(t2.raw));
            list.loose = hasMultipleLineBreaks;
          }
        }
        if (list.loose) {
          for (i = 0; i < l; i++) {
            list.items[i].loose = true;
          }
        }
        return list;
      }
    }
    html(src2) {
      const cap = this.rules.block.html.exec(src2);
      if (cap) {
        const token = {
          type: "html",
          raw: cap[0],
          pre: !this.options.sanitizer && (cap[1] === "pre" || cap[1] === "script" || cap[1] === "style"),
          text: cap[0]
        };
        if (this.options.sanitize) {
          const text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$1(cap[0]);
          token.type = "paragraph";
          token.text = text;
          token.tokens = this.lexer.inline(text);
        }
        return token;
      }
    }
    def(src2) {
      const cap = this.rules.block.def.exec(src2);
      if (cap) {
        const tag = cap[1].toLowerCase().replace(/\s+/g, " ");
        const href = cap[2] ? cap[2].replace(/^<(.*)>$/, "$1").replace(this.rules.inline._escapes, "$1") : "";
        const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline._escapes, "$1") : cap[3];
        return {
          type: "def",
          tag,
          raw: cap[0],
          href,
          title
        };
      }
    }
    table(src2) {
      const cap = this.rules.block.table.exec(src2);
      if (cap) {
        const item = {
          type: "table",
          header: splitCells(cap[1]).map((c) => {
            return { text: c };
          }),
          align: cap[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
          rows: cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, "").split("\n") : []
        };
        if (item.header.length === item.align.length) {
          item.raw = cap[0];
          let l = item.align.length;
          let i, j, k, row;
          for (i = 0; i < l; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = "right";
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = "center";
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = "left";
            } else {
              item.align[i] = null;
            }
          }
          l = item.rows.length;
          for (i = 0; i < l; i++) {
            item.rows[i] = splitCells(item.rows[i], item.header.length).map((c) => {
              return { text: c };
            });
          }
          l = item.header.length;
          for (j = 0; j < l; j++) {
            item.header[j].tokens = this.lexer.inline(item.header[j].text);
          }
          l = item.rows.length;
          for (j = 0; j < l; j++) {
            row = item.rows[j];
            for (k = 0; k < row.length; k++) {
              row[k].tokens = this.lexer.inline(row[k].text);
            }
          }
          return item;
        }
      }
    }
    lheading(src2) {
      const cap = this.rules.block.lheading.exec(src2);
      if (cap) {
        return {
          type: "heading",
          raw: cap[0],
          depth: cap[2].charAt(0) === "=" ? 1 : 2,
          text: cap[1],
          tokens: this.lexer.inline(cap[1])
        };
      }
    }
    paragraph(src2) {
      const cap = this.rules.block.paragraph.exec(src2);
      if (cap) {
        const text = cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1];
        return {
          type: "paragraph",
          raw: cap[0],
          text,
          tokens: this.lexer.inline(text)
        };
      }
    }
    text(src2) {
      const cap = this.rules.block.text.exec(src2);
      if (cap) {
        return {
          type: "text",
          raw: cap[0],
          text: cap[0],
          tokens: this.lexer.inline(cap[0])
        };
      }
    }
    escape(src2) {
      const cap = this.rules.inline.escape.exec(src2);
      if (cap) {
        return {
          type: "escape",
          raw: cap[0],
          text: escape$1(cap[1])
        };
      }
    }
    tag(src2) {
      const cap = this.rules.inline.tag.exec(src2);
      if (cap) {
        if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
          this.lexer.state.inLink = true;
        } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
          this.lexer.state.inLink = false;
        }
        if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          this.lexer.state.inRawBlock = true;
        } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          this.lexer.state.inRawBlock = false;
        }
        return {
          type: this.options.sanitize ? "text" : "html",
          raw: cap[0],
          inLink: this.lexer.state.inLink,
          inRawBlock: this.lexer.state.inRawBlock,
          text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$1(cap[0]) : cap[0]
        };
      }
    }
    link(src2) {
      const cap = this.rules.inline.link.exec(src2);
      if (cap) {
        const trimmedUrl = cap[2].trim();
        if (!this.options.pedantic && /^</.test(trimmedUrl)) {
          if (!/>$/.test(trimmedUrl)) {
            return;
          }
          const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
          if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
            return;
          }
        } else {
          const lastParenIndex = findClosingBracket(cap[2], "()");
          if (lastParenIndex > -1) {
            const start2 = cap[0].indexOf("!") === 0 ? 5 : 4;
            const linkLen = start2 + cap[1].length + lastParenIndex;
            cap[2] = cap[2].substring(0, lastParenIndex);
            cap[0] = cap[0].substring(0, linkLen).trim();
            cap[3] = "";
          }
        }
        let href = cap[2];
        let title = "";
        if (this.options.pedantic) {
          const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
          if (link) {
            href = link[1];
            title = link[3];
          }
        } else {
          title = cap[3] ? cap[3].slice(1, -1) : "";
        }
        href = href.trim();
        if (/^</.test(href)) {
          if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
            href = href.slice(1);
          } else {
            href = href.slice(1, -1);
          }
        }
        return outputLink(cap, {
          href: href ? href.replace(this.rules.inline._escapes, "$1") : href,
          title: title ? title.replace(this.rules.inline._escapes, "$1") : title
        }, cap[0], this.lexer);
      }
    }
    reflink(src2, links) {
      let cap;
      if ((cap = this.rules.inline.reflink.exec(src2)) || (cap = this.rules.inline.nolink.exec(src2))) {
        let link = (cap[2] || cap[1]).replace(/\s+/g, " ");
        link = links[link.toLowerCase()];
        if (!link) {
          const text = cap[0].charAt(0);
          return {
            type: "text",
            raw: text,
            text
          };
        }
        return outputLink(cap, link, cap[0], this.lexer);
      }
    }
    emStrong(src2, maskedSrc, prevChar = "") {
      let match = this.rules.inline.emStrong.lDelim.exec(src2);
      if (!match)
        return;
      if (match[3] && prevChar.match(/[\p{L}\p{N}]/u))
        return;
      const nextChar = match[1] || match[2] || "";
      if (!nextChar || nextChar && (prevChar === "" || this.rules.inline.punctuation.exec(prevChar))) {
        const lLength = match[0].length - 1;
        let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
        const endReg = match[0][0] === "*" ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
        endReg.lastIndex = 0;
        maskedSrc = maskedSrc.slice(-1 * src2.length + lLength);
        while ((match = endReg.exec(maskedSrc)) != null) {
          rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
          if (!rDelim)
            continue;
          rLength = rDelim.length;
          if (match[3] || match[4]) {
            delimTotal += rLength;
            continue;
          } else if (match[5] || match[6]) {
            if (lLength % 3 && !((lLength + rLength) % 3)) {
              midDelimTotal += rLength;
              continue;
            }
          }
          delimTotal -= rLength;
          if (delimTotal > 0)
            continue;
          rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
          const raw = src2.slice(0, lLength + match.index + (match[0].length - rDelim.length) + rLength);
          if (Math.min(lLength, rLength) % 2) {
            const text2 = raw.slice(1, -1);
            return {
              type: "em",
              raw,
              text: text2,
              tokens: this.lexer.inlineTokens(text2)
            };
          }
          const text = raw.slice(2, -2);
          return {
            type: "strong",
            raw,
            text,
            tokens: this.lexer.inlineTokens(text)
          };
        }
      }
    }
    codespan(src2) {
      const cap = this.rules.inline.code.exec(src2);
      if (cap) {
        let text = cap[2].replace(/\n/g, " ");
        const hasNonSpaceChars = /[^ ]/.test(text);
        const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
        if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
          text = text.substring(1, text.length - 1);
        }
        text = escape$1(text, true);
        return {
          type: "codespan",
          raw: cap[0],
          text
        };
      }
    }
    br(src2) {
      const cap = this.rules.inline.br.exec(src2);
      if (cap) {
        return {
          type: "br",
          raw: cap[0]
        };
      }
    }
    del(src2) {
      const cap = this.rules.inline.del.exec(src2);
      if (cap) {
        return {
          type: "del",
          raw: cap[0],
          text: cap[2],
          tokens: this.lexer.inlineTokens(cap[2])
        };
      }
    }
    autolink(src2, mangle2) {
      const cap = this.rules.inline.autolink.exec(src2);
      if (cap) {
        let text, href;
        if (cap[2] === "@") {
          text = escape$1(this.options.mangle ? mangle2(cap[1]) : cap[1]);
          href = "mailto:" + text;
        } else {
          text = escape$1(cap[1]);
          href = text;
        }
        return {
          type: "link",
          raw: cap[0],
          text,
          href,
          tokens: [
            {
              type: "text",
              raw: text,
              text
            }
          ]
        };
      }
    }
    url(src2, mangle2) {
      let cap;
      if (cap = this.rules.inline.url.exec(src2)) {
        let text, href;
        if (cap[2] === "@") {
          text = escape$1(this.options.mangle ? mangle2(cap[0]) : cap[0]);
          href = "mailto:" + text;
        } else {
          let prevCapZero;
          do {
            prevCapZero = cap[0];
            cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
          } while (prevCapZero !== cap[0]);
          text = escape$1(cap[0]);
          if (cap[1] === "www.") {
            href = "http://" + cap[0];
          } else {
            href = cap[0];
          }
        }
        return {
          type: "link",
          raw: cap[0],
          text,
          href,
          tokens: [
            {
              type: "text",
              raw: text,
              text
            }
          ]
        };
      }
    }
    inlineText(src2, smartypants2) {
      const cap = this.rules.inline.text.exec(src2);
      if (cap) {
        let text;
        if (this.lexer.state.inRawBlock) {
          text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$1(cap[0]) : cap[0];
        } else {
          text = escape$1(this.options.smartypants ? smartypants2(cap[0]) : cap[0]);
        }
        return {
          type: "text",
          raw: cap[0],
          text
        };
      }
    }
  }
  const block = {
    newline: /^(?: *(?:\n|$))+/,
    code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
    fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
    hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
    heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
    blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
    list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
    html: "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",
    def: /^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
    table: noopTest,
    lheading: /^((?:.|\n(?!\n))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
    _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
    text: /^[^\n]+/
  };
  block._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
  block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
  block.def = edit(block.def).replace("label", block._label).replace("title", block._title).getRegex();
  block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
  block.listItemStart = edit(/^( *)(bull) */).replace("bull", block.bullet).getRegex();
  block.list = edit(block.list).replace(/bull/g, block.bullet).replace("hr", "\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def", "\\n+(?=" + block.def.source + ")").getRegex();
  block._tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
  block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
  block.html = edit(block.html, "i").replace("comment", block._comment).replace("tag", block._tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
  block.paragraph = edit(block._paragraph).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
  block.blockquote = edit(block.blockquote).replace("paragraph", block.paragraph).getRegex();
  block.normal = merge({}, block);
  block.gfm = merge({}, block.normal, {
    table: "^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
  });
  block.gfm.table = edit(block.gfm.table).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("blockquote", " {0,3}>").replace("code", " {4}[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
  block.gfm.paragraph = edit(block._paragraph).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("table", block.gfm.table).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
  block.pedantic = merge({}, block.normal, {
    html: edit(
      `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
    ).replace("comment", block._comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^(#{1,6})(.*)(?:\n+|$)/,
    fences: noopTest,
    lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
    paragraph: edit(block.normal._paragraph).replace("hr", block.hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", block.lheading).replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").getRegex()
  });
  const inline = {
    escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
    autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
    url: noopTest,
    tag: "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",
    link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
    reflink: /^!?\[(label)\]\[(ref)\]/,
    nolink: /^!?\[(ref)\](?:\[\])?/,
    reflinkSearch: "reflink|nolink(?!\\()",
    emStrong: {
      lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
      rDelimAst: /^(?:[^_*\\]|\\.)*?\_\_(?:[^_*\\]|\\.)*?\*(?:[^_*\\]|\\.)*?(?=\_\_)|(?:[^*\\]|\\.)+(?=[^*])|[punct_](\*+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|(?:[^punct*_\s\\]|\\.)(\*+)(?=[^punct*_\s])/,
      rDelimUnd: /^(?:[^_*\\]|\\.)*?\*\*(?:[^_*\\]|\\.)*?\_(?:[^_*\\]|\\.)*?(?=\*\*)|(?:[^_\\]|\\.)+(?=[^_])|[punct*](\_+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/
    },
    code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
    br: /^( {2,}|\\)\n(?!\s*$)/,
    del: noopTest,
    text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
    punctuation: /^([\spunctuation])/
  };
  inline._punctuation = "!\"#$%&'()+\\-.,/:;<=>?@\\[\\]`^{|}~";
  inline.punctuation = edit(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex();
  inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
  inline.escapedEmSt = /(?:^|[^\\])(?:\\\\)*\\[*_]/g;
  inline._comment = edit(block._comment).replace("(?:-->|$)", "-->").getRegex();
  inline.emStrong.lDelim = edit(inline.emStrong.lDelim).replace(/punct/g, inline._punctuation).getRegex();
  inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, "g").replace(/punct/g, inline._punctuation).getRegex();
  inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, "g").replace(/punct/g, inline._punctuation).getRegex();
  inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
  inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
  inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
  inline.autolink = edit(inline.autolink).replace("scheme", inline._scheme).replace("email", inline._email).getRegex();
  inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
  inline.tag = edit(inline.tag).replace("comment", inline._comment).replace("attribute", inline._attribute).getRegex();
  inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
  inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
  inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
  inline.link = edit(inline.link).replace("label", inline._label).replace("href", inline._href).replace("title", inline._title).getRegex();
  inline.reflink = edit(inline.reflink).replace("label", inline._label).replace("ref", block._label).getRegex();
  inline.nolink = edit(inline.nolink).replace("ref", block._label).getRegex();
  inline.reflinkSearch = edit(inline.reflinkSearch, "g").replace("reflink", inline.reflink).replace("nolink", inline.nolink).getRegex();
  inline.normal = merge({}, inline);
  inline.pedantic = merge({}, inline.normal, {
    strong: {
      start: /^__|\*\*/,
      middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      endAst: /\*\*(?!\*)/g,
      endUnd: /__(?!_)/g
    },
    em: {
      start: /^_|\*/,
      middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
      endAst: /\*(?!\*)/g,
      endUnd: /_(?!_)/g
    },
    link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", inline._label).getRegex(),
    reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", inline._label).getRegex()
  });
  inline.gfm = merge({}, inline.normal, {
    escape: edit(inline.escape).replace("])", "~|])").getRegex(),
    _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
    url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
    _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
    del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
    text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
  });
  inline.gfm.url = edit(inline.gfm.url, "i").replace("email", inline.gfm._extended_email).getRegex();
  inline.breaks = merge({}, inline.gfm, {
    br: edit(inline.br).replace("{2,}", "*").getRegex(),
    text: edit(inline.gfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
  });
  function smartypants(text) {
    return text.replace(/---/g, "\u2014").replace(/--/g, "\u2013").replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018").replace(/'/g, "\u2019").replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C").replace(/"/g, "\u201D").replace(/\.{3}/g, "\u2026");
  }
  function mangle(text) {
    let out = "", i, ch;
    const l = text.length;
    for (i = 0; i < l; i++) {
      ch = text.charCodeAt(i);
      if (Math.random() > 0.5) {
        ch = "x" + ch.toString(16);
      }
      out += "&#" + ch + ";";
    }
    return out;
  }
  class Lexer {
    constructor(options) {
      this.tokens = [];
      this.tokens.links = /* @__PURE__ */ Object.create(null);
      this.options = options || defaults;
      this.options.tokenizer = this.options.tokenizer || new Tokenizer();
      this.tokenizer = this.options.tokenizer;
      this.tokenizer.options = this.options;
      this.tokenizer.lexer = this;
      this.inlineQueue = [];
      this.state = {
        inLink: false,
        inRawBlock: false,
        top: true
      };
      const rules = {
        block: block.normal,
        inline: inline.normal
      };
      if (this.options.pedantic) {
        rules.block = block.pedantic;
        rules.inline = inline.pedantic;
      } else if (this.options.gfm) {
        rules.block = block.gfm;
        if (this.options.breaks) {
          rules.inline = inline.breaks;
        } else {
          rules.inline = inline.gfm;
        }
      }
      this.tokenizer.rules = rules;
    }
    static get rules() {
      return {
        block,
        inline
      };
    }
    static lex(src2, options) {
      const lexer = new Lexer(options);
      return lexer.lex(src2);
    }
    static lexInline(src2, options) {
      const lexer = new Lexer(options);
      return lexer.inlineTokens(src2);
    }
    lex(src2) {
      src2 = src2.replace(/\r\n|\r/g, "\n");
      this.blockTokens(src2, this.tokens);
      let next;
      while (next = this.inlineQueue.shift()) {
        this.inlineTokens(next.src, next.tokens);
      }
      return this.tokens;
    }
    blockTokens(src2, tokens = []) {
      if (this.options.pedantic) {
        src2 = src2.replace(/\t/g, "    ").replace(/^ +$/gm, "");
      } else {
        src2 = src2.replace(/^( *)(\t+)/gm, (_, leading, tabs) => {
          return leading + "    ".repeat(tabs.length);
        });
      }
      let token, lastToken, cutSrc, lastParagraphClipped;
      while (src2) {
        if (this.options.extensions && this.options.extensions.block && this.options.extensions.block.some((extTokenizer) => {
          if (token = extTokenizer.call({ lexer: this }, src2, tokens)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            return true;
          }
          return false;
        })) {
          continue;
        }
        if (token = this.tokenizer.space(src2)) {
          src2 = src2.substring(token.raw.length);
          if (token.raw.length === 1 && tokens.length > 0) {
            tokens[tokens.length - 1].raw += "\n";
          } else {
            tokens.push(token);
          }
          continue;
        }
        if (token = this.tokenizer.code(src2)) {
          src2 = src2.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
            lastToken.raw += "\n" + token.raw;
            lastToken.text += "\n" + token.text;
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }
          continue;
        }
        if (token = this.tokenizer.fences(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.heading(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.hr(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.blockquote(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.list(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.html(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.def(src2)) {
          src2 = src2.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
            lastToken.raw += "\n" + token.raw;
            lastToken.text += "\n" + token.raw;
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else if (!this.tokens.links[token.tag]) {
            this.tokens.links[token.tag] = {
              href: token.href,
              title: token.title
            };
          }
          continue;
        }
        if (token = this.tokenizer.table(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.lheading(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        cutSrc = src2;
        if (this.options.extensions && this.options.extensions.startBlock) {
          let startIndex = Infinity;
          const tempSrc = src2.slice(1);
          let tempStart;
          this.options.extensions.startBlock.forEach(function(getStartIndex) {
            tempStart = getStartIndex.call({ lexer: this }, tempSrc);
            if (typeof tempStart === "number" && tempStart >= 0) {
              startIndex = Math.min(startIndex, tempStart);
            }
          });
          if (startIndex < Infinity && startIndex >= 0) {
            cutSrc = src2.substring(0, startIndex + 1);
          }
        }
        if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
          lastToken = tokens[tokens.length - 1];
          if (lastParagraphClipped && lastToken.type === "paragraph") {
            lastToken.raw += "\n" + token.raw;
            lastToken.text += "\n" + token.text;
            this.inlineQueue.pop();
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }
          lastParagraphClipped = cutSrc.length !== src2.length;
          src2 = src2.substring(token.raw.length);
          continue;
        }
        if (token = this.tokenizer.text(src2)) {
          src2 = src2.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && lastToken.type === "text") {
            lastToken.raw += "\n" + token.raw;
            lastToken.text += "\n" + token.text;
            this.inlineQueue.pop();
            this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
          } else {
            tokens.push(token);
          }
          continue;
        }
        if (src2) {
          const errMsg = "Infinite loop on byte: " + src2.charCodeAt(0);
          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }
      this.state.top = true;
      return tokens;
    }
    inline(src2, tokens = []) {
      this.inlineQueue.push({ src: src2, tokens });
      return tokens;
    }
    inlineTokens(src2, tokens = []) {
      let token, lastToken, cutSrc;
      let maskedSrc = src2;
      let match;
      let keepPrevChar, prevChar;
      if (this.tokens.links) {
        const links = Object.keys(this.tokens.links);
        if (links.length > 0) {
          while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
            if (links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))) {
              maskedSrc = maskedSrc.slice(0, match.index) + "[" + repeatString("a", match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
            }
          }
        }
      }
      while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
        maskedSrc = maskedSrc.slice(0, match.index) + "[" + repeatString("a", match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
      }
      while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
        maskedSrc = maskedSrc.slice(0, match.index + match[0].length - 2) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
        this.tokenizer.rules.inline.escapedEmSt.lastIndex--;
      }
      while (src2) {
        if (!keepPrevChar) {
          prevChar = "";
        }
        keepPrevChar = false;
        if (this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some((extTokenizer) => {
          if (token = extTokenizer.call({ lexer: this }, src2, tokens)) {
            src2 = src2.substring(token.raw.length);
            tokens.push(token);
            return true;
          }
          return false;
        })) {
          continue;
        }
        if (token = this.tokenizer.escape(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.tag(src2)) {
          src2 = src2.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && token.type === "text" && lastToken.type === "text") {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }
          continue;
        }
        if (token = this.tokenizer.link(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.reflink(src2, this.tokens.links)) {
          src2 = src2.substring(token.raw.length);
          lastToken = tokens[tokens.length - 1];
          if (lastToken && token.type === "text" && lastToken.type === "text") {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }
          continue;
        }
        if (token = this.tokenizer.emStrong(src2, maskedSrc, prevChar)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.codespan(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.br(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.del(src2)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (token = this.tokenizer.autolink(src2, mangle)) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        if (!this.state.inLink && (token = this.tokenizer.url(src2, mangle))) {
          src2 = src2.substring(token.raw.length);
          tokens.push(token);
          continue;
        }
        cutSrc = src2;
        if (this.options.extensions && this.options.extensions.startInline) {
          let startIndex = Infinity;
          const tempSrc = src2.slice(1);
          let tempStart;
          this.options.extensions.startInline.forEach(function(getStartIndex) {
            tempStart = getStartIndex.call({ lexer: this }, tempSrc);
            if (typeof tempStart === "number" && tempStart >= 0) {
              startIndex = Math.min(startIndex, tempStart);
            }
          });
          if (startIndex < Infinity && startIndex >= 0) {
            cutSrc = src2.substring(0, startIndex + 1);
          }
        }
        if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
          src2 = src2.substring(token.raw.length);
          if (token.raw.slice(-1) !== "_") {
            prevChar = token.raw.slice(-1);
          }
          keepPrevChar = true;
          lastToken = tokens[tokens.length - 1];
          if (lastToken && lastToken.type === "text") {
            lastToken.raw += token.raw;
            lastToken.text += token.text;
          } else {
            tokens.push(token);
          }
          continue;
        }
        if (src2) {
          const errMsg = "Infinite loop on byte: " + src2.charCodeAt(0);
          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }
      return tokens;
    }
  }
  class Renderer {
    constructor(options) {
      this.options = options || defaults;
    }
    code(code, infostring, escaped) {
      const lang = (infostring || "").match(/\S*/)[0];
      if (this.options.highlight) {
        const out = this.options.highlight(code, lang);
        if (out != null && out !== code) {
          escaped = true;
          code = out;
        }
      }
      code = code.replace(/\n$/, "") + "\n";
      if (!lang) {
        return "<pre><code>" + (escaped ? code : escape$1(code, true)) + "</code></pre>\n";
      }
      return '<pre><code class="' + this.options.langPrefix + escape$1(lang) + '">' + (escaped ? code : escape$1(code, true)) + "</code></pre>\n";
    }
    blockquote(quote) {
      return `<blockquote>
${quote}</blockquote>
`;
    }
    html(html) {
      return html;
    }
    heading(text, level, raw, slugger) {
      if (this.options.headerIds) {
        const id = this.options.headerPrefix + slugger.slug(raw);
        return `<h${level} id="${id}">${text}</h${level}>
`;
      }
      return `<h${level}>${text}</h${level}>
`;
    }
    hr() {
      return this.options.xhtml ? "<hr/>\n" : "<hr>\n";
    }
    list(body, ordered, start2) {
      const type = ordered ? "ol" : "ul", startatt = ordered && start2 !== 1 ? ' start="' + start2 + '"' : "";
      return "<" + type + startatt + ">\n" + body + "</" + type + ">\n";
    }
    listitem(text) {
      return `<li>${text}</li>
`;
    }
    checkbox(checked) {
      return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox"' + (this.options.xhtml ? " /" : "") + "> ";
    }
    paragraph(text) {
      return `<p>${text}</p>
`;
    }
    table(header, body) {
      if (body)
        body = `<tbody>${body}</tbody>`;
      return "<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
    }
    tablerow(content) {
      return `<tr>
${content}</tr>
`;
    }
    tablecell(content, flags) {
      const type = flags.header ? "th" : "td";
      const tag = flags.align ? `<${type} align="${flags.align}">` : `<${type}>`;
      return tag + content + `</${type}>
`;
    }
    strong(text) {
      return `<strong>${text}</strong>`;
    }
    em(text) {
      return `<em>${text}</em>`;
    }
    codespan(text) {
      return `<code>${text}</code>`;
    }
    br() {
      return this.options.xhtml ? "<br/>" : "<br>";
    }
    del(text) {
      return `<del>${text}</del>`;
    }
    link(href, title, text) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
      if (href === null) {
        return text;
      }
      let out = '<a href="' + href + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += ">" + text + "</a>";
      return out;
    }
    image(href, title, text) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
      if (href === null) {
        return text;
      }
      let out = `<img src="${href}" alt="${text}"`;
      if (title) {
        out += ` title="${title}"`;
      }
      out += this.options.xhtml ? "/>" : ">";
      return out;
    }
    text(text) {
      return text;
    }
  }
  class TextRenderer {
    strong(text) {
      return text;
    }
    em(text) {
      return text;
    }
    codespan(text) {
      return text;
    }
    del(text) {
      return text;
    }
    html(text) {
      return text;
    }
    text(text) {
      return text;
    }
    link(href, title, text) {
      return "" + text;
    }
    image(href, title, text) {
      return "" + text;
    }
    br() {
      return "";
    }
  }
  class Slugger {
    constructor() {
      this.seen = {};
    }
    serialize(value) {
      return value.toLowerCase().trim().replace(/<[!\/a-z].*?>/ig, "").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, "").replace(/\s/g, "-");
    }
    getNextSafeSlug(originalSlug, isDryRun) {
      let slug = originalSlug;
      let occurenceAccumulator = 0;
      if (this.seen.hasOwnProperty(slug)) {
        occurenceAccumulator = this.seen[originalSlug];
        do {
          occurenceAccumulator++;
          slug = originalSlug + "-" + occurenceAccumulator;
        } while (this.seen.hasOwnProperty(slug));
      }
      if (!isDryRun) {
        this.seen[originalSlug] = occurenceAccumulator;
        this.seen[slug] = 0;
      }
      return slug;
    }
    slug(value, options = {}) {
      const slug = this.serialize(value);
      return this.getNextSafeSlug(slug, options.dryrun);
    }
  }
  class Parser {
    constructor(options) {
      this.options = options || defaults;
      this.options.renderer = this.options.renderer || new Renderer();
      this.renderer = this.options.renderer;
      this.renderer.options = this.options;
      this.textRenderer = new TextRenderer();
      this.slugger = new Slugger();
    }
    static parse(tokens, options) {
      const parser = new Parser(options);
      return parser.parse(tokens);
    }
    static parseInline(tokens, options) {
      const parser = new Parser(options);
      return parser.parseInline(tokens);
    }
    parse(tokens, top2 = true) {
      let out = "", i, j, k, l2, l3, row, cell, header, body, token, ordered, start2, loose, itemBody, item, checked, task, checkbox, ret;
      const l = tokens.length;
      for (i = 0; i < l; i++) {
        token = tokens[i];
        if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
          ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
          if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(token.type)) {
            out += ret || "";
            continue;
          }
        }
        switch (token.type) {
          case "space": {
            continue;
          }
          case "hr": {
            out += this.renderer.hr();
            continue;
          }
          case "heading": {
            out += this.renderer.heading(
              this.parseInline(token.tokens),
              token.depth,
              unescape$1(this.parseInline(token.tokens, this.textRenderer)),
              this.slugger
            );
            continue;
          }
          case "code": {
            out += this.renderer.code(
              token.text,
              token.lang,
              token.escaped
            );
            continue;
          }
          case "table": {
            header = "";
            cell = "";
            l2 = token.header.length;
            for (j = 0; j < l2; j++) {
              cell += this.renderer.tablecell(
                this.parseInline(token.header[j].tokens),
                { header: true, align: token.align[j] }
              );
            }
            header += this.renderer.tablerow(cell);
            body = "";
            l2 = token.rows.length;
            for (j = 0; j < l2; j++) {
              row = token.rows[j];
              cell = "";
              l3 = row.length;
              for (k = 0; k < l3; k++) {
                cell += this.renderer.tablecell(
                  this.parseInline(row[k].tokens),
                  { header: false, align: token.align[k] }
                );
              }
              body += this.renderer.tablerow(cell);
            }
            out += this.renderer.table(header, body);
            continue;
          }
          case "blockquote": {
            body = this.parse(token.tokens);
            out += this.renderer.blockquote(body);
            continue;
          }
          case "list": {
            ordered = token.ordered;
            start2 = token.start;
            loose = token.loose;
            l2 = token.items.length;
            body = "";
            for (j = 0; j < l2; j++) {
              item = token.items[j];
              checked = item.checked;
              task = item.task;
              itemBody = "";
              if (item.task) {
                checkbox = this.renderer.checkbox(checked);
                if (loose) {
                  if (item.tokens.length > 0 && item.tokens[0].type === "paragraph") {
                    item.tokens[0].text = checkbox + " " + item.tokens[0].text;
                    if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
                      item.tokens[0].tokens[0].text = checkbox + " " + item.tokens[0].tokens[0].text;
                    }
                  } else {
                    item.tokens.unshift({
                      type: "text",
                      text: checkbox
                    });
                  }
                } else {
                  itemBody += checkbox;
                }
              }
              itemBody += this.parse(item.tokens, loose);
              body += this.renderer.listitem(itemBody, task, checked);
            }
            out += this.renderer.list(body, ordered, start2);
            continue;
          }
          case "html": {
            out += this.renderer.html(token.text);
            continue;
          }
          case "paragraph": {
            out += this.renderer.paragraph(this.parseInline(token.tokens));
            continue;
          }
          case "text": {
            body = token.tokens ? this.parseInline(token.tokens) : token.text;
            while (i + 1 < l && tokens[i + 1].type === "text") {
              token = tokens[++i];
              body += "\n" + (token.tokens ? this.parseInline(token.tokens) : token.text);
            }
            out += top2 ? this.renderer.paragraph(body) : body;
            continue;
          }
          default: {
            const errMsg = 'Token with "' + token.type + '" type was not found.';
            if (this.options.silent) {
              console.error(errMsg);
              return;
            } else {
              throw new Error(errMsg);
            }
          }
        }
      }
      return out;
    }
    parseInline(tokens, renderer) {
      renderer = renderer || this.renderer;
      let out = "", i, token, ret;
      const l = tokens.length;
      for (i = 0; i < l; i++) {
        token = tokens[i];
        if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
          ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
          if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(token.type)) {
            out += ret || "";
            continue;
          }
        }
        switch (token.type) {
          case "escape": {
            out += renderer.text(token.text);
            break;
          }
          case "html": {
            out += renderer.html(token.text);
            break;
          }
          case "link": {
            out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
            break;
          }
          case "image": {
            out += renderer.image(token.href, token.title, token.text);
            break;
          }
          case "strong": {
            out += renderer.strong(this.parseInline(token.tokens, renderer));
            break;
          }
          case "em": {
            out += renderer.em(this.parseInline(token.tokens, renderer));
            break;
          }
          case "codespan": {
            out += renderer.codespan(token.text);
            break;
          }
          case "br": {
            out += renderer.br();
            break;
          }
          case "del": {
            out += renderer.del(this.parseInline(token.tokens, renderer));
            break;
          }
          case "text": {
            out += renderer.text(token.text);
            break;
          }
          default: {
            const errMsg = 'Token with "' + token.type + '" type was not found.';
            if (this.options.silent) {
              console.error(errMsg);
              return;
            } else {
              throw new Error(errMsg);
            }
          }
        }
      }
      return out;
    }
  }
  function marked(src2, opt, callback) {
    if (typeof src2 === "undefined" || src2 === null) {
      throw new Error("marked(): input parameter is undefined or null");
    }
    if (typeof src2 !== "string") {
      throw new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src2) + ", string expected");
    }
    if (typeof opt === "function") {
      callback = opt;
      opt = null;
    }
    opt = merge({}, marked.defaults, opt || {});
    checkSanitizeDeprecation(opt);
    if (callback) {
      const highlight = opt.highlight;
      let tokens;
      try {
        tokens = Lexer.lex(src2, opt);
      } catch (e) {
        return callback(e);
      }
      const done = function(err) {
        let out;
        if (!err) {
          try {
            if (opt.walkTokens) {
              marked.walkTokens(tokens, opt.walkTokens);
            }
            out = Parser.parse(tokens, opt);
          } catch (e) {
            err = e;
          }
        }
        opt.highlight = highlight;
        return err ? callback(err) : callback(null, out);
      };
      if (!highlight || highlight.length < 3) {
        return done();
      }
      delete opt.highlight;
      if (!tokens.length)
        return done();
      let pending = 0;
      marked.walkTokens(tokens, function(token) {
        if (token.type === "code") {
          pending++;
          setTimeout(() => {
            highlight(token.text, token.lang, function(err, code) {
              if (err) {
                return done(err);
              }
              if (code != null && code !== token.text) {
                token.text = code;
                token.escaped = true;
              }
              pending--;
              if (pending === 0) {
                done();
              }
            });
          }, 0);
        }
      });
      if (pending === 0) {
        done();
      }
      return;
    }
    function onError(e) {
      e.message += "\nPlease report this to https://github.com/markedjs/marked.";
      if (opt.silent) {
        return "<p>An error occurred:</p><pre>" + escape$1(e.message + "", true) + "</pre>";
      }
      throw e;
    }
    try {
      const tokens = Lexer.lex(src2, opt);
      if (opt.walkTokens) {
        if (opt.async) {
          return Promise.all(marked.walkTokens(tokens, opt.walkTokens)).then(() => {
            return Parser.parse(tokens, opt);
          }).catch(onError);
        }
        marked.walkTokens(tokens, opt.walkTokens);
      }
      return Parser.parse(tokens, opt);
    } catch (e) {
      onError(e);
    }
  }
  marked.options = marked.setOptions = function(opt) {
    merge(marked.defaults, opt);
    changeDefaults(marked.defaults);
    return marked;
  };
  marked.getDefaults = getDefaults;
  marked.defaults = defaults;
  marked.use = function(...args) {
    const extensions = marked.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts2 = merge({}, pack);
      opts2.async = marked.defaults.async || opts2.async;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if (ext.renderer) {
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              extensions.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if (ext.tokenizer) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            if (extensions[ext.level]) {
              extensions[ext.level].unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === "inline") {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if (ext.childTokens) {
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts2.extensions = extensions;
      }
      if (pack.renderer) {
        const renderer = marked.defaults.renderer || new Renderer();
        for (const prop in pack.renderer) {
          const prevRenderer = renderer[prop];
          renderer[prop] = (...args2) => {
            let ret = pack.renderer[prop].apply(renderer, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args2);
            }
            return ret;
          };
        }
        opts2.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = marked.defaults.tokenizer || new Tokenizer();
        for (const prop in pack.tokenizer) {
          const prevTokenizer = tokenizer[prop];
          tokenizer[prop] = (...args2) => {
            let ret = pack.tokenizer[prop].apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts2.tokenizer = tokenizer;
      }
      if (pack.walkTokens) {
        const walkTokens = marked.defaults.walkTokens;
        opts2.walkTokens = function(token) {
          let values = [];
          values.push(pack.walkTokens.call(this, token));
          if (walkTokens) {
            values = values.concat(walkTokens.call(this, token));
          }
          return values;
        };
      }
      marked.setOptions(opts2);
    });
  };
  marked.walkTokens = function(tokens, callback) {
    let values = [];
    for (const token of tokens) {
      values = values.concat(callback.call(marked, token));
      switch (token.type) {
        case "table": {
          for (const cell of token.header) {
            values = values.concat(marked.walkTokens(cell.tokens, callback));
          }
          for (const row of token.rows) {
            for (const cell of row) {
              values = values.concat(marked.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          values = values.concat(marked.walkTokens(token.items, callback));
          break;
        }
        default: {
          if (marked.defaults.extensions && marked.defaults.extensions.childTokens && marked.defaults.extensions.childTokens[token.type]) {
            marked.defaults.extensions.childTokens[token.type].forEach(function(childTokens) {
              values = values.concat(marked.walkTokens(token[childTokens], callback));
            });
          } else if (token.tokens) {
            values = values.concat(marked.walkTokens(token.tokens, callback));
          }
        }
      }
    }
    return values;
  };
  marked.parseInline = function(src2, opt) {
    if (typeof src2 === "undefined" || src2 === null) {
      throw new Error("marked.parseInline(): input parameter is undefined or null");
    }
    if (typeof src2 !== "string") {
      throw new Error("marked.parseInline(): input parameter is of type " + Object.prototype.toString.call(src2) + ", string expected");
    }
    opt = merge({}, marked.defaults, opt || {});
    checkSanitizeDeprecation(opt);
    try {
      const tokens = Lexer.lexInline(src2, opt);
      if (opt.walkTokens) {
        marked.walkTokens(tokens, opt.walkTokens);
      }
      return Parser.parseInline(tokens, opt);
    } catch (e) {
      e.message += "\nPlease report this to https://github.com/markedjs/marked.";
      if (opt.silent) {
        return "<p>An error occurred:</p><pre>" + escape$1(e.message + "", true) + "</pre>";
      }
      throw e;
    }
  };
  marked.Parser = Parser;
  marked.parser = Parser.parse;
  marked.Renderer = Renderer;
  marked.TextRenderer = TextRenderer;
  marked.Lexer = Lexer;
  marked.lexer = Lexer.lex;
  marked.Tokenizer = Tokenizer;
  marked.Slugger = Slugger;
  marked.parse = marked;
  marked.options;
  marked.setOptions;
  marked.use;
  marked.walkTokens;
  marked.parseInline;
  Parser.parse;
  Lexer.lex;
  function markdown(md) {
    return marked.parse(md);
  }
  const TAB_WORK_RESULTS_KEY = "common.work-results.results";
  const gotoHome = () => {
    const btn = el("button", { className: "base-style-button-secondary" }, "\u{1F3E1}\u5B98\u7F51\u6559\u7A0B");
    btn.onclick = () => window.open("https://docs.ocsjs.com", "_blank");
    return btn;
  };
  const state$4 = {
    workResult: {
      questionPositionSyncHandler: {
        cx: (index) => {
          var _a;
          const el2 = (_a = document.querySelectorAll('[id*="sigleQuestionDiv"], .questionLi')) == null ? void 0 : _a.item(index);
          if (el2) {
            window.scrollTo({
              top: el2.getBoundingClientRect().top + window.pageYOffset - 50,
              behavior: "smooth"
            });
          }
        },
        "zhs-gxk": (index) => {
          var _a;
          (_a = document.querySelectorAll(".answerCard_list ul li").item(index)) == null ? void 0 : _a.click();
        },
        "zhs-xnk": (index) => {
          var _a;
          (_a = document.querySelectorAll(".jobclassallnumber-div li[questionid]").item(index)) == null ? void 0 : _a.click();
        },
        icve: (index) => {
          var _a;
          (_a = document.querySelectorAll(`.sheet_nums [id*="sheetSeq"]`).item(index)) == null ? void 0 : _a.click();
        },
        zjy: (index) => {
          var _a;
          (_a = document.querySelector(`.e-q-body[data-num="${index + 1}"]`)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };
  const CommonProject = Project.create({
    name: "\u901A\u7528",
    domains: [],
    scripts: {
      guide: new Script({
        name: "\u{1F3E0} \u811A\u672C\u9996\u9875",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        namespace: "common.guide",
        onrender({ panel: panel2 }) {
          const guide = createGuide();
          const contactUs = el("button", { className: "base-style-button-secondary" }, "\u{1F5E8}\uFE0F\u4EA4\u6D41\u7FA4");
          contactUs.onclick = () => window.open("https://docs.ocsjs.com/docs/about#\u4EA4\u6D41\u65B9\u5F0F", "_blank");
          const notify = el("button", { className: "base-style-button-secondary" }, "\u2728\u67E5\u770B\u901A\u77E5\u63D0\u793A");
          notify.onclick = () => CommonProject.scripts.apps.methods.showNotify();
          const changeLog = el("button", { className: "base-style-button-secondary" }, "\u{1F4C4}\u67E5\u770B\u66F4\u65B0\u65E5\u5FD7");
          changeLog.onclick = () => CommonProject.scripts.apps.methods.showChangelog();
          changeLog.style.marginBottom = "12px";
          guide.style.width = "480px";
          panel2.body.replaceChildren(el("div", { className: "card" }, [gotoHome(), contactUs, notify, changeLog]), guide);
        }
      }),
      settings: new Script({
        name: "\u2699\uFE0F \u5168\u5C40\u8BBE\u7F6E",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        namespace: "common.settings",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u2728\u9F20\u6807\u79FB\u52A8\u5230\u6309\u94AE\u6216\u8005\u8F93\u5165\u6846\uFF0C\u53EF\u4EE5\u770B\u5230\u63D0\u793A\uFF01",
              "\u60F3\u8981\u81EA\u52A8\u7B54\u9898\u5FC5\u987B\u8BBE\u7F6E \u201C\u9898\u5E93\u914D\u7F6E\u201D ",
              "\u8BBE\u7F6E\u540E\u8FDB\u5165\u7AE0\u8282\u6D4B\u8BD5\uFF0C\u4F5C\u4E1A\uFF0C\u8003\u8BD5\u9875\u9762\u5373\u53EF\u81EA\u52A8\u7B54\u9898\u3002"
            ]).outerHTML
          },
          notification: {
            label: "\u5F00\u542F\u7CFB\u7EDF\u901A\u77E5",
            defaultValue: true,
            attrs: {
              title: "\u5141\u8BB8\u811A\u672C\u53D1\u9001\u7CFB\u7EDF\u901A\u77E5\uFF0C\u53EA\u6709\u91CD\u8981\u4E8B\u60C5\u53D1\u751F\u65F6\u4F1A\u53D1\u9001\u7CFB\u7EDF\u901A\u77E5\uFF0C\u5C3D\u91CF\u907F\u514D\u7528\u6237\u53D7\u5230\u9A9A\u6270\uFF08\u5728\u7535\u8111\u5C4F\u5E55\u53F3\u4FA7\u663E\u793A\u901A\u77E5\u5F39\u7A97\uFF0C\u4F8B\u5982\u811A\u672C\u6267\u884C\u5B8C\u6BD5\uFF0C\u7248\u672C\u66F4\u65B0\u7B49\u901A\u77E5\uFF09\u3002",
              type: "checkbox"
            }
          },
          answererWrappers: {
            defaultValue: []
          },
          enableQuestionCaches: {
            label: "\u9898\u5E93\u7F13\u5B58\u529F\u80FD",
            defaultValue: true,
            attrs: { type: "checkbox", title: "\u8BE6\u60C5\u8BF7\u524D\u5F80 \u901A\u7528-\u5176\u4ED6\u5E94\u7528-\u9898\u5E93\u62D3\u5C55\u67E5\u770B\u3002" }
          },
          answererWrappersButton: {
            label: "\u9898\u5E93\u914D\u7F6E",
            defaultValue: "\u70B9\u51FB\u914D\u7F6E",
            attrs: {
              type: "button"
            },
            onload() {
              const aws = CommonProject.scripts.settings.cfg.answererWrappers || [];
              this.value = aws.length ? "\u5F53\u524D\u6709" + aws.length + "\u4E2A\u53EF\u7528\u9898\u5E93\uFF0C\u70B9\u51FB\u91CD\u65B0\u914D\u7F6E" : "\u70B9\u51FB\u914D\u7F6E";
              this.onclick = () => {
                const aw = CommonProject.scripts.settings.cfg.answererWrappers || [];
                const copy = $creator.copy("\u590D\u5236\u9898\u5E93\u914D\u7F6E", JSON.stringify(aw));
                const list = el("div", [
                  el("div", aw.length ? ["\u4EE5\u4E0B\u662F\u5DF2\u7ECF\u89E3\u6790\u8FC7\u7684\u9898\u5E93\u914D\u7F6E\uFF1A", copy] : ""),
                  ...createAnswererWrapperList(aw)
                ]);
                const modal = $modal("prompt", {
                  content: $creator.notes([
                    [
                      el("div", [
                        "\u5177\u4F53\u914D\u7F6E\u6559\u7A0B\uFF0C\u8BF7\u67E5\u770B\u5B98\u7F51\uFF1A",
                        el("a", { href: "https://docs.ocsjs.com/docs/work" }, "\u81EA\u52A8\u7B54\u9898\u6559\u7A0B")
                      ])
                    ],
                    "\u5982\u679C\u9898\u5E93\u914D\u7F6E\u65E0\u6CD5\u7C98\u8D34\uFF0C\u5219\u8BF4\u660E\u6B64\u9875\u9762\u7981\u6B62\u7C98\u8D34\uFF0C\u8BF7\u5C1D\u8BD5\u524D\u5F80\u5176\u4ED6\u9875\u9762(\u7F51\u8BFE\u4E3B\u9875\u6216\u8005\u5B66\u4E60\u9875\u9762)\u518D\u5C1D\u8BD5\u8FDB\u884C\u7C98\u8D34\u3002",
                    ...aw.length ? [list] : []
                  ]),
                  placeholder: aw.length ? "\u91CD\u65B0\u8F93\u5165" : "\u8F93\u5165\u9898\u5E93\u914D\u7F6E",
                  cancelButton: el("button", {
                    className: "modal-cancel-button",
                    innerText: "\u6E05\u7A7A\u9898\u5E93\u914D\u7F6E",
                    onclick: () => {
                      $message("success", { content: "\u5DF2\u6E05\u7A7A\uFF0C\u5728\u7B54\u9898\u524D\u8BF7\u8BB0\u5F97\u91CD\u65B0\u914D\u7F6E\u3002" });
                      modal == null ? void 0 : modal.remove();
                      CommonProject.scripts.settings.cfg.answererWrappers = [];
                      this.value = "\u70B9\u51FB\u914D\u7F6E";
                    }
                  }),
                  onConfirm: async (value) => {
                    if (value) {
                      try {
                        const aw2 = await AnswerWrapperParser.from(value);
                        if (aw2.length) {
                          CommonProject.scripts.settings.cfg.answererWrappers = aw2;
                          this.value = "\u5F53\u524D\u6709" + aw2.length + "\u4E2A\u53EF\u7528\u9898\u5E93";
                          $modal("alert", {
                            content: el("div", [
                              el("div", ["\u{1F389} \u914D\u7F6E\u6210\u529F\uFF0C\u5237\u65B0\u7F51\u9875\u540E\u91CD\u65B0\u7B54\u9898\u5373\u53EF\u3002", "\u89E3\u6790\u5230\u7684\u9898\u5E93\u5982\u4E0B\u6240\u793A:"]),
                              ...createAnswererWrapperList(aw2)
                            ])
                          });
                        } else {
                          $modal("alert", { content: "\u9898\u5E93\u914D\u7F6E\u4E0D\u80FD\u4E3A\u7A7A\uFF0C\u8BF7\u91CD\u65B0\u914D\u7F6E\u3002" });
                        }
                      } catch (e) {
                        $modal("alert", {
                          content: el("div", [el("div", "\u89E3\u6790\u5931\u8D25\uFF0C\u539F\u56E0\u5982\u4E0B :"), el("div", e.message)])
                        });
                      }
                    } else {
                      $modal("alert", {
                        content: el("div", "\u4E0D\u80FD\u4E3A\u7A7A\uFF01")
                      });
                    }
                  }
                });
              };
            }
          },
          upload: {
            label: "\u7B54\u9898\u5B8C\u6210\u540E",
            tag: "select",
            defaultValue: 80,
            attrs: {
              title: "\u81EA\u52A8\u7B54\u9898\u5B8C\u6210\u540E\u7684\u8BBE\u7F6E\uFF0C\u76EE\u524D\u4EC5\u5728 \u8D85\u661F\u5B66\u4E60\u901A\u7684\u7AE0\u8282\u6D4B\u8BD5 \u4E2D\u751F\u6548, \u9F20\u6807\u60AC\u6D6E\u5728\u9009\u9879\u4E0A\u53EF\u4EE5\u67E5\u770B\u6BCF\u4E2A\u9009\u9879\u7684\u5177\u4F53\u89E3\u91CA\u3002"
            },
            onload() {
              this.append(
                ...$creator.selectOptions(this.getAttribute("value"), [
                  ["save", "\u81EA\u52A8\u4FDD\u5B58", "\u5B8C\u6210\u540E\u81EA\u52A8\u4FDD\u5B58\u7B54\u6848, \u6CE8\u610F\u5982\u679C\u4F60\u5F00\u542F\u4E86\u968F\u673A\u4F5C\u7B54, \u6709\u53EF\u80FD\u5206\u8FA8\u4E0D\u51FA\u7B54\u6848\u662F\u5426\u6B63\u786E\u3002"],
                  ["nomove", "\u4E0D\u4FDD\u5B58\u4E5F\u4E0D\u63D0\u4EA4", "\u7B49\u5F85\u65F6\u95F4\u8FC7\u540E\u5C06\u4F1A\u81EA\u52A8\u4E0B\u4E00\u8282, \u9002\u5408\u5728\u6D4B\u8BD5\u811A\u672C\u65F6\u4F7F\u7528\u3002"],
                  ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map((rate) => [
                    rate.toString(),
                    `\u641C\u5230${rate}%\u7684\u9898\u76EE\u5219\u81EA\u52A8\u63D0\u4EA4`,
                    `\u4F8B\u5982: 100\u9898\u4E2D\u67E5\u8BE2\u5230 ${rate} \u9898\u7684\u7B54\u6848,\uFF08\u7B54\u6848\u4E0D\u4E00\u5B9A\u6B63\u786E\uFF09, \u5219\u4F1A\u81EA\u52A8\u63D0\u4EA4\u3002`
                  ]),
                  ["100", "\u6BCF\u4E2A\u9898\u76EE\u90FD\u67E5\u5230\u7B54\u6848\u624D\u81EA\u52A8\u63D0\u4EA4", "\u7B54\u6848\u4E0D\u4E00\u5B9A\u6B63\u786E"],
                  ["force", "\u5F3A\u5236\u81EA\u52A8\u63D0\u4EA4", "\u4E0D\u7BA1\u7B54\u6848\u662F\u5426\u6B63\u786E\u76F4\u63A5\u5F3A\u5236\u81EA\u52A8\u63D0\u4EA4\uFF0C\u5982\u9700\u5F00\u542F\uFF0C\u8BF7\u914D\u5408\u968F\u673A\u4F5C\u7B54\u8C28\u614E\u4F7F\u7528\u3002"]
                ])
              );
            }
          },
          stopSecondWhenFinish: {
            label: "\u7B54\u9898\u7ED3\u675F\u540E\u6682\u505C\uFF08\u79D2\uFF09",
            attrs: {
              type: "number",
              min: 3,
              step: 1,
              max: 9999,
              title: "\u81EA\u52A8\u7B54\u9898\u811A\u672C\u7ED3\u675F\u540E\u6682\u505C\u7684\u65F6\u95F4\uFF08\u65B9\u4FBF\u67E5\u770B\u548C\u68C0\u67E5\uFF09\u3002"
            },
            defaultValue: 3
          },
          thread: {
            label: "\u7EBF\u7A0B\u6570\u91CF\uFF08\u4E2A\uFF09",
            attrs: {
              type: "number",
              min: 1,
              step: 1,
              max: 3,
              title: "\u540C\u4E00\u65F6\u95F4\u5185\u7B54\u9898\u7EBF\u7A0B\u5DE5\u4F5C\u7684\u6570\u91CF\uFF08\u4F8B\u5B50\uFF1A\u4E09\u4E2A\u7EBF\u7A0B\u5219\u4EE3\u8868\u4E00\u79D2\u5185\u540C\u65F6\u641C\u7D22\u4E09\u9053\u9898\uFF09\uFF0C\u8FC7\u591A\u53EF\u80FD\u5BFC\u81F4\u9898\u5E93\u670D\u52A1\u5668\u538B\u529B\u8FC7\u5927\uFF0C\u8BF7\u9002\u5F53\u8C03\u4F4E\u3002"
            },
            defaultValue: 1
          },
          period: {
            label: "\u7B54\u9898\u95F4\u9694\uFF08\u79D2\uFF09",
            attrs: {
              type: "number",
              min: 0,
              step: 1,
              max: 60,
              title: "\u6BCF\u9053\u9898\u7684\u95F4\u9694\u65F6\u95F4\uFF0C\u4E0D\u5EFA\u8BAE\u592A\u4F4E\uFF0C\u907F\u514D\u589E\u52A0\u670D\u52A1\u5668\u538B\u529B\u3002"
            },
            defaultValue: 3
          },
          "randomWork-choice": {
            defaultValue: false,
            label: "(\u4EC5\u8D85\u661F)\u968F\u673A\u9009\u62E9",
            attrs: { type: "checkbox", title: "\u968F\u673A\u9009\u62E9\u4EFB\u610F\u4E00\u4E2A\u9009\u9879" }
          },
          "randomWork-complete": {
            defaultValue: false,
            label: "(\u4EC5\u8D85\u661F)\u968F\u673A\u586B\u7A7A",
            attrs: { type: "checkbox", title: "\u968F\u673A\u586B\u5199\u4EE5\u4E0B\u4EFB\u610F\u4E00\u4E2A\u6587\u6848" }
          },
          "randomWork-completeTexts-textarea": {
            defaultValue: ["\u4E0D\u4F1A", "\u4E0D\u77E5\u9053", "\u4E0D\u6E05\u695A", "\u4E0D\u61C2", "\u4E0D\u4F1A\u5199"].join("\n"),
            label: "(\u4EC5\u8D85\u661F)\u968F\u673A\u586B\u7A7A\u6587\u6848",
            tag: "textarea",
            attrs: { title: "\u6BCF\u884C\u4E00\u4E2A\uFF0C\u968F\u673A\u586B\u5165" }
          },
          redundanceWordsText: {
            defaultValue: ["\u5355\u9009\u9898(\u5FC5\u8003)", "\u586B\u7A7A\u9898(\u5FC5\u8003)", "\u591A\u9009\u9898(\u5FC5\u8003)"].join("\n"),
            label: "\u9898\u76EE\u5197\u4F59\u5B57\u6BB5\u81EA\u52A8\u5220\u9664",
            tag: "textarea",
            attrs: { title: "\u5728\u641C\u9898\u7684\u65F6\u5019\u81EA\u52A8\u5220\u9664\u591A\u4F59\u7684\u6587\u5B57\uFF0C\u4EE5\u4FBF\u63D0\u9AD8\u641C\u9898\u7684\u51C6\u786E\u5EA6\uFF0C\u6BCF\u884C\u4E00\u4E2A\u3002" }
          }
        },
        onrender({ panel: panel2 }) {
          if ($gm.getInfos() !== void 0) {
            panel2.body.replaceChildren(el("hr"));
            const refresh = el(
              "button",
              { className: "base-style-button", disabled: this.cfg.answererWrappers.length === 0 },
              "\u{1F504}\uFE0F\u5237\u65B0\u9898\u5E93\u72B6\u6001"
            );
            refresh.onclick = () => {
              updateState();
            };
            const tableContainer = el("div");
            refresh.style.display = "none";
            tableContainer.style.display = "none";
            panel2.body.append(refresh, tableContainer);
            const updateState = async () => {
              tableContainer.replaceChildren();
              let loadedCount = 0;
              if (this.cfg.answererWrappers.length) {
                refresh.style.display = "block";
                tableContainer.style.display = "block";
                refresh.textContent = "\u{1F6AB}\u6B63\u5728\u52A0\u8F7D...";
                refresh.setAttribute("disabled", "true");
                const table = el("table");
                table.style.width = "100%";
                this.cfg.answererWrappers.forEach(async (item) => {
                  const t2 = Date.now();
                  let success = false;
                  let error;
                  const res = await Promise.race([
                    (async () => {
                      try {
                        return await request(new URL(item.url).origin + "/?t=" + t2, {
                          type: "GM_xmlhttpRequest",
                          method: "get",
                          responseType: "text",
                          headers: {
                            "Content-Type": "text/html"
                          }
                        });
                      } catch (err) {
                        error = err;
                        return false;
                      }
                    })(),
                    (async () => {
                      await $.sleep(10 * 1e3);
                      return false;
                    })()
                  ]);
                  if (res) {
                    success = true;
                  } else {
                    success = false;
                  }
                  const body = el("tbody");
                  body.append(el("td", item.name));
                  body.append(el("td", success ? "\u8FDE\u63A5\u6210\u529F\u{1F7E2}" : error ? "\u8FDE\u63A5\u5931\u8D25\u{1F534}" : "\u8FDE\u63A5\u8D85\u65F6\u{1F7E1}"));
                  body.append(el("td", `\u5EF6\u8FDF : ${success ? Date.now() - t2 : "---"}/ms`));
                  table.append(body);
                  loadedCount++;
                  if (loadedCount === this.cfg.answererWrappers.length) {
                    setTimeout(() => {
                      refresh.textContent = "\u{1F504}\uFE0F\u5237\u65B0\u9898\u5E93\u72B6\u6001";
                      refresh.removeAttribute("disabled");
                    }, 3e3);
                  }
                });
                tableContainer.append(table);
              } else {
                refresh.style.display = "none";
                tableContainer.style.display = "none";
              }
            };
            updateState();
            this.onConfigChange("answererWrappers", () => {
              updateState();
            });
          }
        },
        oncomplete() {
          if ($.isInTopWindow()) {
            this.onConfigChange("notification", (open) => {
              if (open) {
                $gm.notification("\u60A8\u5DF2\u5F00\u542F\u7CFB\u7EDF\u901A\u77E5\uFF0C\u5982\u679C\u811A\u672C\u6709\u91CD\u8981\u60C5\u51B5\u9700\u8981\u5904\u7406\uFF0C\u5219\u4F1A\u53D1\u8D77\u901A\u77E5\u63D0\u793A\u60A8\u3002", {
                  duration: 5
                });
              }
            });
          }
        }
      }),
      workResults: new Script({
        name: "\u{1F30F} \u641C\u7D22\u7ED3\u679C",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        namespace: "common.work-results",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              ["\u8B66\u544A\uFF1A\u7981\u6B62\u4E0E\u5176\u4ED6\u811A\u672C\u4E00\u8D77\u4F7F\u7528\uFF0C", "\u5426\u5219\u51FA\u73B0\u7B54\u6848\u9009\u4E0D\u4E0A\u6216\u8005\u5176\u4ED6\u95EE\u9898\u4E00\u5F8B\u540E\u679C\u81EA\u8D1F\u3002"],
              "\u70B9\u51FB\u9898\u76EE\u5E8F\u53F7\uFF0C\u67E5\u770B\u641C\u7D22\u7ED3\u679C",
              "\u6BCF\u6B21\u81EA\u52A8\u7B54\u9898\u5F00\u59CB\u524D\uFF0C\u90FD\u4F1A\u6E05\u7A7A\u4E0A\u4E00\u6B21\u7684\u641C\u7D22\u7ED3\u679C\u3002"
            ]).outerHTML
          },
          type: {
            label: "\u663E\u793A\u7C7B\u578B",
            tag: "select",
            attrs: { title: "\u4F7F\u7528\u9898\u76EE\u5217\u8868\u53EF\u80FD\u4F1A\u9020\u6210\u9875\u9762\u5361\u987F\u3002" },
            defaultValue: "numbers",
            onload() {
              this.append(
                ...$creator.selectOptions(this.getAttribute("value"), [
                  ["numbers", "\u5E8F\u53F7\u5217\u8868"],
                  ["questions", "\u9898\u76EE\u5217\u8868"]
                ])
              );
            }
          },
          totalQuestionCount: {
            defaultValue: 0
          },
          requestIndex: {
            defaultValue: 0
          },
          resolverIndex: {
            defaultValue: 0
          },
          currentResultIndex: {
            defaultValue: 0
          },
          questionPositionSyncHandlerType: {
            defaultValue: void 0
          }
        },
        methods() {
          return {
            updateWorkState: (state2) => {
              this.cfg.totalQuestionCount = state2.totalQuestionCount;
              this.cfg.requestIndex = state2.requestIndex;
              this.cfg.resolverIndex = state2.resolverIndex;
            },
            refreshState: () => {
              this.cfg.totalQuestionCount = 0;
              this.cfg.requestIndex = 0;
              this.cfg.resolverIndex = 0;
            },
            clearResults: () => {
              return $store.setTab(TAB_WORK_RESULTS_KEY, []);
            },
            getResults() {
              return $store.getTab(TAB_WORK_RESULTS_KEY) || void 0;
            },
            setResults(results) {
              return $store.setTab(TAB_WORK_RESULTS_KEY, results);
            },
            init(opts2) {
              CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = opts2 == null ? void 0 : opts2.questionPositionSyncHandlerType;
              CommonProject.scripts.workResults.methods.refreshState();
              CommonProject.scripts.workResults.methods.clearResults();
            },
            createWorkResultsPanel: (mount) => {
              const container = mount || el("div");
              let scrollPercent = 0;
              const list = el("div");
              let mouseoverIndex = -1;
              list.onscroll = () => {
                scrollPercent = list.scrollTop / list.scrollHeight;
              };
              const setNumStyle = (result, num, index) => {
                if (result.requesting) {
                  num.classList.add("requesting");
                } else if (result.resolving) {
                  num.classList.add("resolving");
                } else if (result.error || result.searchInfos.length === 0 || result.finish === false) {
                  num.classList.add("error");
                } else if (index === this.cfg.currentResultIndex) {
                  num.classList.add("active");
                }
              };
              const render = debounce_1(async () => {
                const results = await this.methods.getResults();
                if (results == null ? void 0 : results.length) {
                  if (results[this.cfg.currentResultIndex] === void 0) {
                    this.cfg.currentResultIndex = 0;
                  }
                  if (this.cfg.type === "numbers") {
                    const resultContainer = el("div", {}, (res) => {
                      res.style.width = "400px";
                    });
                    list.style.width = "400px";
                    list.style.marginBottom = "12px";
                    list.style.maxHeight = window.innerHeight / 2 + "px";
                    const nums = results.map((result, index) => {
                      return el("span", { className: "search-infos-num", innerText: (index + 1).toString() }, (num) => {
                        setNumStyle(result, num, index);
                        num.onclick = () => {
                          var _a, _b;
                          for (const n of nums) {
                            n.classList.remove("active");
                          }
                          num.classList.add("active");
                          this.cfg.currentResultIndex = index;
                          resultContainer.replaceChildren(createResult(result));
                          if (this.cfg.questionPositionSyncHandlerType) {
                            (_b = (_a = state$4.workResult.questionPositionSyncHandler)[this.cfg.questionPositionSyncHandlerType]) == null ? void 0 : _b.call(
                              _a,
                              index
                            );
                          }
                        };
                      });
                    });
                    list.replaceChildren(...nums);
                    resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));
                    container.replaceChildren(list, resultContainer);
                  } else {
                    list.style.width = "400px";
                    list.style.overflow = "auto";
                    list.style.maxHeight = window.innerHeight / 2 + "px";
                    const resultContainer = el("div", { className: "work-result-question-container" });
                    const nums = [];
                    const questions = results.map((result, index) => {
                      const num = el(
                        "span",
                        {
                          className: "search-infos-num",
                          innerHTML: (index + 1).toString()
                        },
                        (num2) => {
                          num2.style.marginRight = "12px";
                          num2.style.display = "inline-block";
                          setNumStyle(result, num2, index);
                        }
                      );
                      nums.push(num);
                      return el(
                        "div",
                        [num, result.question],
                        (question) => {
                          question.className = "search-infos-question";
                          if (result.requesting === false && result.resolving === false && (result.error || result.searchInfos.length === 0 || result.finish === false)) {
                            question.classList.add("error");
                          } else if (index === this.cfg.currentResultIndex) {
                            question.classList.add("active");
                          }
                          question.onmouseover = () => {
                            mouseoverIndex = index;
                            question.classList.add("hover");
                            resultContainer.replaceChildren(createResult(result));
                          };
                          question.onmouseleave = () => {
                            mouseoverIndex = -1;
                            question.classList.remove("hover");
                            resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));
                          };
                          question.onclick = () => {
                            var _a, _b;
                            for (const n of nums) {
                              n.classList.remove("active");
                            }
                            for (const q of questions) {
                              q.classList.remove("active");
                            }
                            nums[index].classList.add("active");
                            question.classList.add("active");
                            this.cfg.currentResultIndex = index;
                            resultContainer.replaceChildren(createResult(result));
                            if (this.cfg.questionPositionSyncHandlerType) {
                              (_b = (_a = state$4.workResult.questionPositionSyncHandler)[this.cfg.questionPositionSyncHandlerType]) == null ? void 0 : _b.call(
                                _a,
                                index
                              );
                            }
                          };
                        }
                      );
                    });
                    list.replaceChildren(...questions);
                    if (mouseoverIndex === -1) {
                      resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));
                    } else {
                      resultContainer.replaceChildren(createResult(results[mouseoverIndex]));
                    }
                    container.replaceChildren(
                      el("div", [list, el("div", {}, [resultContainer])], (div) => {
                        div.style.display = "flex";
                      })
                    );
                  }
                } else {
                  container.replaceChildren(
                    el("div", "\u26A0\uFE0F\u6682\u65E0\u4EFB\u4F55\u641C\u7D22\u7ED3\u679C", (div) => {
                      div.style.textAlign = "center";
                    })
                  );
                }
                list.scrollTo({
                  top: scrollPercent * list.scrollHeight,
                  behavior: "auto"
                });
                const tip = el("div", [
                  el("div", { className: "search-infos-num requesting" }, "n"),
                  "\u8868\u793A\u641C\u7D22\u4E2D ",
                  el("br"),
                  el("div", { className: "search-infos-num resolving" }, "n"),
                  "\u8868\u793A\u5DF2\u641C\u7D22\u4F46\u672A\u5F00\u59CB\u7B54\u9898 ",
                  el("br"),
                  el("div", { className: "search-infos-num" }, "n"),
                  "\u8868\u793A\u5DF2\u641C\u7D22\u5DF2\u7B54\u9898 "
                ]);
                container.prepend(
                  el("hr"),
                  el(
                    "div",
                    [
                      `\u5F53\u524D\u641C\u9898: ${this.cfg.requestIndex}/${this.cfg.totalQuestionCount}`,
                      " , ",
                      `\u5F53\u524D\u7B54\u9898: ${this.cfg.resolverIndex}/${this.cfg.totalQuestionCount}`,
                      " , ",
                      el("a", "\u67E5\u770B\u63D0\u793A", (btn) => {
                        btn.style.cursor = "pointer";
                        btn.addEventListener("click", () => {
                          $modal("confirm", {
                            content: tip
                          });
                        });
                      })
                    ],
                    (div) => {
                      div.style.marginBottom = "12px";
                    }
                  ),
                  el("hr")
                );
              }, 100);
              const createResult = (result) => {
                if (result) {
                  const error = el("span", {}, (el2) => el2.style.color = "red");
                  if (result.requesting && result.resolving) {
                    return el("div", [
                      result.question,
                      $creator.createQuestionTitleExtra(result.question),
                      el("hr"),
                      "\u5F53\u524D\u9898\u76EE\u8FD8\u672A\u5F00\u59CB\u641C\u7D22\uFF0C\u8BF7\u7A0D\u7B49\u3002"
                    ]);
                  } else {
                    if (result.error) {
                      error.innerText = result.error;
                      return el("div", [
                        result.question,
                        $creator.createQuestionTitleExtra(result.question),
                        el("hr"),
                        error
                      ]);
                    } else if (result.searchInfos.length === 0) {
                      error.innerText = "\u6B64\u9898\u672A\u641C\u7D22\u5230\u7B54\u6848";
                      return el("div", [
                        result.question,
                        $creator.createQuestionTitleExtra(result.question),
                        el("hr"),
                        error
                      ]);
                    } else {
                      error.innerText = "\u6B64\u9898\u672A\u5B8C\u6210, \u53EF\u80FD\u662F\u6CA1\u6709\u5339\u914D\u7684\u9009\u9879\u3002";
                      return el("div", [
                        ...result.finish ? [] : [result.resolving ? "\u6B63\u5728\u7B49\u5F85\u7B54\u9898\u4E2D\uFF0C\u8BF7\u7A0D\u7B49\u3002" : error],
                        el("search-infos-element", {
                          infos: result.searchInfos,
                          question: result.question
                        })
                      ]);
                    }
                  }
                } else {
                  return el("div", "undefined");
                }
              };
              render();
              this.onConfigChange("type", render);
              this.onConfigChange("requestIndex", render);
              this.onConfigChange("resolverIndex", render);
              $store.addChangeListener(TAB_WORK_RESULTS_KEY, render);
              return container;
            }
          };
        },
        onrender({ panel: panel2 }) {
          panel2.body.replaceChildren(this.methods.createWorkResultsPanel());
        }
      }),
      onlineSearch: new Script({
        name: "\u{1F50E} \u5728\u7EBF\u641C\u9898",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        namespace: "common.online-search",
        configs: {
          notes: {
            defaultValue: "\u67E5\u9898\u524D\u8BF7\u5728 \u201C\u901A\u7528-\u5168\u5C40\u8BBE\u7F6E\u201D \u4E2D\u8BBE\u7F6E\u9898\u5E93\u914D\u7F6E\uFF0C\u624D\u80FD\u8FDB\u884C\u5728\u7EBF\u641C\u9898\u3002"
          },
          selectSearch: {
            label: "\u5212\u8BCD\u641C\u7D22",
            defaultValue: true,
            attrs: { type: "checkbox", title: "\u4F7F\u7528\u9F20\u6807\u6ED1\u52A8\u9009\u62E9\u9875\u9762\u4E2D\u7684\u9898\u76EE\u8FDB\u884C\u641C\u7D22\u3002" }
          },
          selection: {
            defaultValue: ""
          }
        },
        oncomplete() {
          if (this.cfg.selectSearch) {
            document.addEventListener(
              "selectionchange",
              debounce_1(() => {
                var _a;
                this.cfg.selection = ((_a = document.getSelection()) == null ? void 0 : _a.toString()) || "";
              }, 500)
            );
          }
        },
        onrender({ panel: panel2 }) {
          const content = el("div", "\u8BF7\u8F93\u5165\u9898\u76EE\u8FDB\u884C\u641C\u7D22\uFF1A", (content2) => {
            content2.style.marginBottom = "12px";
          });
          const input = el("input", { placeholder: "\u8BF7\u5C3D\u91CF\u4FDD\u8BC1\u9898\u76EE\u5B8C\u6574\uFF0C\u4E0D\u8981\u6F0F\u5B57\u54E6\u3002" }, (input2) => {
            input2.className = "base-style-input";
            input2.style.flex = "1";
          });
          const search = async (value) => {
            content.replaceChildren(el("span", "\u641C\u7D22\u4E2D..."));
            if (value) {
              const t2 = Date.now();
              const infos = await defaultAnswerWrapperHandler(CommonProject.scripts.settings.cfg.answererWrappers, {
                title: value
              });
              const resume = ((Date.now() - t2) / 1e3).toFixed(2);
              content.replaceChildren(
                el(
                  "div",
                  [
                    el("div", `\u641C\u7D22\u5230 ${infos.map((i) => i.results).flat().length} \u4E2A\u7ED3\u679C\uFF0C\u5171\u8017\u65F6 ${resume} \u79D2`),
                    el("search-infos-element", {
                      infos: infos.map((info) => ({
                        results: info.results.map((res) => [res.question, res.answer]),
                        homepage: info.homepage,
                        name: info.name
                      })),
                      question: value
                    })
                  ],
                  (div) => {
                    div.style.width = "400px";
                  }
                )
              );
            } else {
              content.replaceChildren(el("span", "\u9898\u76EE\u4E0D\u80FD\u4E3A\u7A7A\uFF01"));
            }
          };
          const button = el("button", "\u641C\u7D22", (button2) => {
            button2.className = "base-style-button";
            button2.onclick = () => {
              search(input.value);
            };
          });
          const searchContainer = el("div", [input, button], (div) => {
            div.style.display = "flex";
          });
          this.onConfigChange("selection", (curr) => {
            if (input.parentElement) {
              input.value = curr;
            }
          });
          panel2.body.append(el("div", [el("hr"), content, searchContainer]));
        }
      }),
      render: RenderScript,
      hack: new Script({
        name: "\u9875\u9762\u590D\u5236\u7C98\u8D34\u9650\u5236\u89E3\u9664",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        hideInPanel: true,
        onactive() {
          enableCopy();
        },
        oncomplete() {
          enableCopy();
          setTimeout(() => enableCopy(), 3e3);
        }
      }),
      disableDialog: new Script({
        name: "\u7981\u6B62\u5F39\u7A97",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        hideInPanel: true,
        onstart() {
          try {
            $gm.unsafeWindow.alert = (msg) => {
              $modal("alert", {
                profile: "\u5F39\u7A97\u6765\u81EA\uFF1A" + location.origin,
                content: msg
              });
            };
          } catch (e) {
          }
        }
      }),
      apps: new Script({
        name: "\u{1F4F1} \u5176\u4ED6\u5E94\u7528",
        url: [["", /.*/]],
        namespace: "common.apps",
        configs: {
          notes: {
            defaultValue: "\u8FD9\u91CC\u662F\u4E00\u4E9B\u5176\u4ED6\u7684\u5E94\u7528\u6216\u8005\u62D3\u5C55\u529F\u80FD\u3002"
          },
          localQuestionCaches: {
            defaultValue: []
          }
        },
        methods() {
          return {
            addQuestionCache: async (...questionCacheItems) => {
              const questionCaches = this.cfg.localQuestionCaches;
              for (const item of questionCacheItems) {
                if (questionCaches.find((c) => c.title === item.title && c.answer === item.answer) === void 0) {
                  questionCaches.push(item);
                }
              }
              questionCaches.splice(200);
              this.cfg.localQuestionCaches = questionCaches;
            },
            addQuestionCacheFromWorkResult(swr) {
              CommonProject.scripts.apps.methods.addQuestionCache(
                ...swr.map(
                  (r) => r.searchInfos.map(
                    (i) => i.results.filter((res) => res[1]).map((res) => ({
                      title: r.question,
                      answer: res[1],
                      from: i.name.replace(/【题库缓存】/g, ""),
                      homepage: i.homepage || ""
                    })).flat()
                  ).flat()
                ).flat()
              );
            },
            searchAnswerInCaches: async (title, whenSearchEmpty) => {
              let results = [];
              const caches = this.cfg.localQuestionCaches;
              for (const cache of caches) {
                if (cache.title === title) {
                  results.push({
                    name: `\u3010\u9898\u5E93\u7F13\u5B58\u3011${cache.from}`,
                    homepage: cache.homepage,
                    results: [{ answer: cache.answer, question: cache.title }]
                  });
                }
              }
              if (results.length === 0) {
                results = await whenSearchEmpty();
              }
              return results;
            },
            async showNotify() {
              const notify = el("div", { className: "markdown card", innerHTML: "\u52A0\u8F7D\u4E2D..." });
              $modal("simple", {
                content: el("div", [
                  el("div", { className: "notes card" }, [
                    $creator.notes([
                      "\u6B64\u9875\u9762\u5B9E\u65F6\u66F4\u65B0\uFF0C\u5927\u5BB6\u9047\u5230\u95EE\u9898\u53EF\u4EE5\u770B\u770B\u901A\u77E5",
                      el("div", ["\u6216\u8005\u8FDB\u5165 ", gotoHome(), " \u91CC\u7684\u4EA4\u6D41\u7FA4\u8FDB\u884C\u53CD\u9988\u3002"])
                    ])
                  ]),
                  notify
                ])
              });
              const md = await request("https://cdn.ocsjs.com/articles/ocs/notify.md?t=" + Date.now(), {
                type: "GM_xmlhttpRequest",
                responseType: "text",
                method: "get"
              });
              notify.innerHTML = markdown(md);
            },
            async showChangelog() {
              const changelog = el("div", {
                className: "markdown card",
                innerHTML: "\u52A0\u8F7D\u4E2D...",
                style: { maxWidth: "600px" }
              });
              $modal("simple", {
                width: 600,
                content: el("div", [
                  el("div", { className: "notes card" }, [
                    $creator.notes(["\u6B64\u9875\u9762\u5B9E\u65F6\u66F4\u65B0\uFF0C\u9047\u5230\u95EE\u9898\u53EF\u4EE5\u67E5\u770B\u6700\u65B0\u7248\u672C\u662F\u5426\u4FEE\u590D\u3002"])
                  ]),
                  changelog
                ])
              });
              const md = await request("https://cdn.ocsjs.com/articles/ocs/changelog.md?t=" + Date.now(), {
                type: "GM_xmlhttpRequest",
                responseType: "text",
                method: "get"
              });
              changelog.innerHTML = markdown(md);
            }
          };
        },
        onrender({ panel: panel2 }) {
          const btnStyle = {
            padding: "6px 12px",
            margin: "4px",
            marginBottom: "8px",
            boxShadow: "0px 0px 4px #bebebe",
            borderRadius: "8px",
            cursor: "pointer"
          };
          const cachesBtn = el("div", { innerText: "\u{1F4BE} \u9898\u5E93\u7F13\u5B58", style: btnStyle }, (btn) => {
            btn.onclick = () => {
              console.log(this.cfg);
              const questionCaches = this.cfg.localQuestionCaches;
              const list = questionCaches.map(
                (c) => el(
                  "div",
                  {
                    className: "question-cache",
                    style: {
                      margin: "8px",
                      border: "1px solid lightgray",
                      borderRadius: "4px",
                      padding: "8px"
                    }
                  },
                  [
                    el("div", { className: "title" }, [
                      $creator.tooltip(
                        el(
                          "span",
                          {
                            title: `\u6765\u81EA\uFF1A${c.from || "\u672A\u77E5\u9898\u5E93"}
\u4E3B\u9875\uFF1A${c.homepage || "\u672A\u77E5\u4E3B\u9875"}`,
                            style: { fontWeight: "bold" }
                          },
                          c.title
                        )
                      )
                    ]),
                    el("div", { className: "answer", style: { marginTop: "6px" } }, c.answer)
                  ]
                )
              );
              $modal("simple", {
                width: 800,
                content: el("div", [
                  el("div", { className: "notes card" }, [
                    $creator.notes([
                      "\u9898\u5E93\u7F13\u5B58\u662F\u5C06\u9898\u5E93\u7684\u9898\u76EE\u548C\u7B54\u6848\u4FDD\u5B58\u5728\u5185\u5B58\uFF0C\u5728\u91CD\u590D\u4F7F\u7528\u65F6\u53EF\u4EE5\u76F4\u63A5\u4ECE\u5185\u5B58\u83B7\u53D6\uFF0C\u4E0D\u9700\u8981\u518D\u6B21\u8BF7\u6C42\u9898\u5E93\u3002",
                      "\u4EE5\u4E0B\u662F\u5F53\u524D\u5B58\u50A8\u7684\u9898\u5E93\uFF0C\u9ED8\u8BA4\u5B58\u50A8200\u9898\uFF0C\u5F53\u524D\u9875\u9762\u5173\u95ED\u540E\u4F1A\u81EA\u52A8\u6E05\u9664\u3002"
                    ])
                  ]),
                  el("div", { className: "card" }, [
                    $creator.space([
                      el("span", ["\u5F53\u524D\u7F13\u5B58\u6570\u91CF\uFF1A" + questionCaches.length]),
                      $creator.button("\u6E05\u7A7A\u9898\u5E93\u7F13\u5B58", {}, (btn2) => {
                        btn2.onclick = () => {
                          this.cfg.localQuestionCaches = [];
                          list.forEach((el2) => el2.remove());
                        };
                      })
                    ])
                  ]),
                  el(
                    "div",
                    questionCaches.length === 0 ? [el("div", { style: { textAlign: "center" } }, "\u6682\u65E0\u9898\u5E93\u7F13\u5B58")] : list
                  )
                ])
              });
            };
          });
          [cachesBtn].forEach((btn) => {
            btn.onmouseover = () => {
              btn.style.boxShadow = "0px 0px 4px #0099ff9c";
            };
            btn.onmouseout = () => {
              btn.style.boxShadow = "0px 0px 4px #bebebe";
            };
          });
          panel2.body.replaceChildren(
            el("div", [el("div", { className: "separator", style: { padding: "4px 0px" } }, "\u9898\u5E93\u62D3\u5C55"), cachesBtn])
          );
        }
      })
    }
  });
  function enableCopy() {
    function hackSelect(target) {
      if (target) {
        const _original_select = target.onselectstart;
        const _original_oncopy = target.oncopy;
        const _original_onpaste = target.onpaste;
        const _original_onkeydown = target.onkeydown;
        target.onselectstart = (e) => {
          _original_select == null ? void 0 : _original_select.apply(target, [e]);
          return true;
        };
        target.oncopy = (e) => {
          _original_oncopy == null ? void 0 : _original_oncopy.apply(target, [e]);
          return true;
        };
        target.onpaste = (e) => {
          _original_onpaste == null ? void 0 : _original_onpaste.apply(target, [e]);
          return true;
        };
        target.onkeydown = (e) => {
          _original_onkeydown == null ? void 0 : _original_onkeydown.apply(target, [e]);
          return true;
        };
      }
    }
    hackSelect(document);
    hackSelect(document.body);
    const style = document.createElement("style");
    style.innerHTML = `
		html * {
		  -webkit-user-select: text !important;
		  -khtml-user-select: text !important;
		  -moz-user-select: text !important;
		  -ms-user-select: text !important;
		  user-select: text !important;
		}`;
    document.head.append(style);
  }
  function createAnswererWrapperList(aw) {
    return aw.map(
      (item) => el(
        "details",
        [
          el("summary", [item.name]),
          el("ul", [
            el("li", ["\u540D\u5B57	", item.name]),
            el("li", { innerHTML: `\u5B98\u7F51	<a target="_blank" href=${item.homepage}>${item.homepage || "\u65E0"}</a>` }),
            el("li", ["\u63A5\u53E3	", item.url]),
            el("li", ["\u8BF7\u6C42\u65B9\u6CD5	", item.method]),
            el("li", ["\u8BF7\u6C42\u7C7B\u578B	", item.type]),
            el("li", ["\u8BF7\u6C42\u5934	", JSON.stringify(item.headers, null, 4) || "\u65E0"]),
            el("li", ["\u8BF7\u6C42\u4F53	", JSON.stringify(item.data, null, 4) || "\u65E0"])
          ])
        ],
        (details) => {
          details.style.paddingLeft = "12px";
        }
      )
    );
  }
  const createGuide = () => {
    const showProjectDetails = (project) => {
      $modal("simple", {
        title: project.name + " - \u7684\u811A\u672C\u5217\u8868",
        width: 800,
        content: el(
          "ul",
          Object.keys(project.scripts).sort((a, b) => project.scripts[b].hideInPanel ? -1 : 1).map((key) => {
            const script = project.scripts[key];
            return el(
              "li",
              [
                el("b", script.name),
                $creator.notes([
                  el("span", ["\u64CD\u4F5C\u9762\u677F\uFF1A", script.hideInPanel ? "\u9690\u85CF" : "\u663E\u793A"]),
                  [
                    "\u8FD0\u884C\u9875\u9762\uFF1A",
                    el(
                      "ul",
                      script.url.map(
                        (i) => el("li", [
                          i[0],
                          "\uFF1A",
                          i[1] instanceof RegExp ? i[1].toString().replace(/\\/g, "").slice(1, -1) : el("span", i[1])
                        ])
                      )
                    )
                  ]
                ])
              ],
              (li) => {
                li.style.marginBottom = "12px";
              }
            );
          }),
          (ul) => {
            ul.style.paddingLeft = "42px";
          }
        )
      });
    };
    return el("div", { className: "user-guide card" }, [
      el("div", { className: "separator", style: { padding: "12px 0px" } }, "\u2728 \u652F\u6301\u7684\u7F51\u8BFE\u5E73\u53F0"),
      el("div", [
        ...definedProjects().filter((p) => p.studyProject).map((project) => {
          const btn = el("button", { className: "base-style-button-secondary" }, [project.name]);
          btn.onclick = () => {
            showProjectDetails(project);
          };
          return btn;
        })
      ]),
      el("div", { className: "separator", style: { padding: "12px 0px" } }, "\u{1F4D6} \u4F7F\u7528\u6559\u7A0B"),
      $creator.notes(
        [
          "\u6253\u5F00\u4EFB\u610F\u7F51\u8BFE\u5E73\u53F0\uFF0C\u7B49\u5F85\u811A\u672C\u52A0\u8F7D\uFF0C",
          "\u811A\u672C\u52A0\u8F7D\u540E\u67E5\u770B\u6BCF\u4E2A\u7F51\u8BFE\u4E0D\u540C\u7684\u4F7F\u7528\u63D0\u793A\u3002",
          "\u5982\u679C\u4E0D\u652F\u6301\u5F53\u524D\u7F51\u8BFE\uFF0C\u5219\u4E0D\u4F1A\u6709\u76F8\u5E94\u7684\u63D0\u793A\u4EE5\u53CA\u8BBE\u7F6E\u9762\u677F\u3002",
          [
            "\u6700\u540E\u6E29\u99A8\u63D0\u793A: ",
            "- \u7981\u6B62\u4E0E\u5176\u4ED6\u811A\u672C\u4E00\u8D77\u4F7F\u7528\uFF0C\u5426\u5219\u51FA\u73B0\u7B54\u6848\u9009\u4E0D\u4E0A\u6216\u8005\u9875\u9762\u5361\u6B7B\uFF0C\u65E0\u9650\u5237\u65B0\uFF0C\u7B49\u95EE\u9898\u4E00\u5F8B\u540E\u679C\u81EA\u8D1F\u3002",
            "- \u4EFB\u4F55\u5176\u4ED6\u7591\u95EE\u8BF7\u524D\u5F80\u5B98\u7F51\u67E5\u770B\u4EA4\u6D41\u7FA4\uFF0C\u8FDB\u5165\u4EA4\u6D41\u7FA4\u540E\u5E26\u622A\u56FE\u8FDB\u884C\u53CD\u9988\u3002",
            "- \u8BF7\u5C06\u6D4F\u89C8\u5668\u9875\u9762\u4FDD\u6301\u6700\u5927\u5316\uFF0C\u6216\u8005\u7F29\u5C0F\u7A97\u53E3\uFF0C\u4E0D\u80FD\u6700\u5C0F\u5316\uFF0C\u5426\u5219\u53EF\u80FD\u5BFC\u81F4\u811A\u672C\u5361\u6B7B\uFF01"
          ]
        ],
        "ol"
      )
    ]);
  };
  function workPreCheckMessage(options) {
    const { onrun, onNoAnswererWrappers, onclose, ...opts2 } = options;
    if (opts2.answererWrappers.length === 0) {
      onNoAnswererWrappers == null ? void 0 : onNoAnswererWrappers(opts2);
      return $message("warn", { content: "\u68C0\u6D4B\u5230\u9898\u5E93\u914D\u7F6E\u4E3A\u7A7A\uFF0C\u65E0\u6CD5\u81EA\u52A8\u7B54\u9898\uFF0C\u8BF7\u524D\u5F80\u5168\u5C40\u8BBE\u7F6E\u9875\u9762\u8FDB\u884C\u914D\u7F6E\u3002" });
    } else {
      return $message("info", {
        duration: 5,
        content: el("span", [
          "5\u79D2\u540E\u81EA\u52A8\u7B54\u9898\uFF0C",
          $creator.preventText({
            name: "\u70B9\u51FB\u53D6\u6D88",
            delay: 5,
            ondefault: (span) => {
              onrun(opts2);
            },
            onprevent(span) {
              const closedMessage = $message("warn", {
                content: "\u5DF2\u5173\u95ED\u6B64\u6B21\u7684\u81EA\u52A8\u7B54\u9898\uFF0C\u8BF7\u624B\u52A8\u5F00\u542F\u6216\u8005\u5FFD\u7565\u6B64\u8B66\u544A\u3002",
                duration: 0
              });
              onclose == null ? void 0 : onclose(opts2, closedMessage);
            }
          })
        ])
      });
    }
  }
  function createRangeTooltip(input, defaultValue, transform) {
    input.addEventListener("change", () => {
      input.setAttribute("data-title", transform(input.value || input.getAttribute("value") || defaultValue));
    });
    input.setAttribute("data-title", transform(input.value || input.getAttribute("value") || defaultValue));
  }
  async function playMedia(playFunction) {
    const tryPlayMedia = () => {
      return new Promise((resolve, reject) => {
        try {
          const playRes = playFunction();
          if (playRes) {
            playRes.then(resolve).catch(reject);
          } else {
            resolve();
          }
        } catch (err) {
          reject(err);
        }
      });
    };
    try {
      await tryPlayMedia();
    } catch (err) {
      if (String(err).includes(`failed because the user didn't interact with the document first`)) {
        $modal("alert", {
          content: "\u7531\u4E8E\u6D4F\u89C8\u5668\u4FDD\u62A4\u9650\u5236\uFF0C\u5982\u679C\u8981\u64AD\u653E\u5E26\u6709\u97F3\u91CF\u7684\u89C6\u9891\uFF0C\u60A8\u5FC5\u987B\u5148\u70B9\u51FB\u9875\u9762\u4E0A\u7684\u4EFB\u610F\u4F4D\u7F6E\u624D\u80FD\u8FDB\u884C\u89C6\u9891\u7684\u64AD\u653E\uFF0C\u5982\u679C\u60F3\u81EA\u52A8\u64AD\u653E\uFF0C\u5FC5\u987B\u5148\u5728\u8BBE\u7F6E\u9875\u9762\u9759\u97F3\uFF0C\u7136\u540E\u91CD\u65B0\u8FD0\u884C\u811A\u672C\u3002",
          onClose: async () => {
            await tryPlayMedia();
          }
        });
      }
    }
  }
  const volume = {
    label: "\u97F3\u91CF\u8C03\u8282",
    attrs: { type: "range", step: "0.05", min: "0", max: "1" },
    defaultValue: 0,
    onload() {
      createRangeTooltip(this, "0", (val) => `${parseFloat(val) * 100}%`);
    }
  };
  const restudy = {
    label: "\u590D\u4E60\u6A21\u5F0F",
    attrs: { title: "\u5DF2\u7ECF\u5B8C\u6210\u7684\u89C6\u9891\u7EE7\u7EED\u5B66\u4E60", type: "checkbox" },
    defaultValue: false
  };
  const definition = {
    label: "\u6E05\u6670\u5EA6",
    tag: "select",
    defaultValue: "line1bq",
    onload() {
      this.append(
        ...$creator.selectOptions(this.getAttribute("value"), [
          ["line1bq", "\u6D41\u7545"],
          ["line1gq", "\u9AD8\u6E05"]
        ])
      );
    }
  };
  const workNotes = {
    defaultValue: $creator.notes([
      "\u81EA\u52A8\u7B54\u9898\u524D\u8BF7\u5728 \u201C\u901A\u7528-\u5168\u5C40\u8BBE\u7F6E\u201D \u4E2D\u8BBE\u7F6E\u9898\u5E93\u914D\u7F6E\u3002",
      "\u53EF\u4EE5\u642D\u914D \u201C\u901A\u7528-\u5728\u7EBF\u641C\u9898\u201D \u4E00\u8D77\u4F7F\u7528\u3002"
    ]).outerHTML
  };
  function commonWork(script, options) {
    CommonProject.scripts.render.methods.pin(script);
    let worker;
    let startBtnPressed = false;
    let checkFailed = false;
    const createControls = () => {
      const { controlBtn, restartBtn, startBtn } = createWorkerControl({
        workerProvider: () => worker,
        onStart: async () => {
          startBtnPressed = true;
          checkMessage == null ? void 0 : checkMessage.remove();
          start2();
        },
        onRestart: async () => {
          var _a;
          worker == null ? void 0 : worker.emit("close");
          await ((_a = options.onRestart) == null ? void 0 : _a.call(options));
          start2();
        }
      });
      startBtn.style.flex = "1";
      startBtn.style.padding = "4px";
      restartBtn.style.flex = "1";
      restartBtn.style.padding = "4px";
      controlBtn.style.flex = "1";
      controlBtn.style.padding = "4px";
      const container = el(
        "div",
        { style: { marginTop: "12px", display: "flex" } },
        (worker == null ? void 0 : worker.isRunning) ? [controlBtn, restartBtn] : [startBtn]
      );
      return { container, startBtn, restartBtn, controlBtn };
    };
    const workResultPanel = () => CommonProject.scripts.workResults.methods.createWorkResultsPanel();
    script.on("render", () => {
      var _a, _b;
      let gotoSettingsBtnContainer = "";
      if (checkFailed) {
        const gotoSettingsBtn = $creator.button("\u{1F449} \u524D\u5F80\u8BBE\u7F6E\u9898\u5E93\u914D\u7F6E", {
          className: "base-style-button",
          style: { flex: "1", padding: "4px" }
        });
        gotoSettingsBtn.style.flex = "1";
        gotoSettingsBtn.style.padding = "4px";
        gotoSettingsBtn.onclick = () => {
          CommonProject.scripts.render.methods.pin(CommonProject.scripts.settings);
        };
        gotoSettingsBtnContainer = el("div", { style: { display: "flex" } }, [gotoSettingsBtn]);
      }
      (_b = (_a = script.panel) == null ? void 0 : _a.body) == null ? void 0 : _b.replaceChildren(
        el("div", { style: { marginTop: "12px" } }, [
          gotoSettingsBtnContainer,
          createControls().container,
          workResultPanel()
        ])
      );
    });
    let checkMessage = workPreCheckMessage({
      onrun: () => startBtnPressed === false && start2(),
      onclose: (_, closedMsg) => checkMessage = closedMsg,
      onNoAnswererWrappers: () => {
        checkFailed = true;
      },
      ...CommonProject.scripts.settings.cfg
    });
    const start2 = async () => {
      var _a, _b, _c;
      await ((_a = options.beforeRunning) == null ? void 0 : _a.call(options));
      worker = options.workerProvider(CommonProject.scripts.settings.cfg);
      const { container, controlBtn } = createControls();
      (_c = (_b = script.panel) == null ? void 0 : _b.body) == null ? void 0 : _c.replaceChildren(container, workResultPanel());
      worker == null ? void 0 : worker.once("done", () => {
        controlBtn.disabled = true;
      });
    };
  }
  function createWorkerControl(options) {
    let stop2 = false;
    let stopMessage;
    const startBtn = $creator.button("\u25B6\uFE0F\u5F00\u59CB\u7B54\u9898");
    const restartBtn = $creator.button("\u{1F503}\u91CD\u65B0\u7B54\u9898");
    const controlBtn = $creator.button("\u23F8\u6682\u505C");
    startBtn.onclick = () => {
      startBtn.remove();
      options.onStart();
    };
    restartBtn.onclick = () => {
      stopMessage == null ? void 0 : stopMessage.remove();
      options.onRestart();
    };
    controlBtn.onclick = () => {
      var _a;
      stop2 = !stop2;
      const worker = options.workerProvider();
      (_a = worker == null ? void 0 : worker.emit) == null ? void 0 : _a.call(worker, stop2 ? "stop" : "continuate");
      controlBtn.value = stop2 ? "\u25B6\uFE0F\u7EE7\u7EED" : "\u23F8\uFE0F\u6682\u505C";
      if (stop2) {
        stopMessage = $message("warn", { duration: 0, content: "\u6682\u505C\u4E2D..." });
      } else {
        stopMessage == null ? void 0 : stopMessage.remove();
      }
    };
    return { startBtn, restartBtn, controlBtn };
  }
  function optimizationElementWithImage(root2) {
    if (root2) {
      for (const img of Array.from(root2.querySelectorAll("img"))) {
        const src2 = document.createElement("span");
        src2.innerText = img.src;
        src2.style.fontSize = "0px";
        img.after(src2);
      }
    }
    return root2;
  }
  function createUnVisibleTextOfImage(img) {
    const src2 = document.createElement("span");
    src2.innerText = img.src;
    src2.style.fontSize = "0px";
    img.after(src2);
  }
  function simplifyWorkResult(results, titleTransform) {
    var _a, _b, _c, _d, _e;
    const res = [];
    for (const wr of results) {
      res.push({
        requesting: wr.requesting,
        resolving: wr.resolving,
        error: wr.error,
        question: (titleTransform == null ? void 0 : titleTransform(((_a = wr.ctx) == null ? void 0 : _a.elements.title) || [])) || ((_c = (_b = wr.ctx) == null ? void 0 : _b.elements.title) == null ? void 0 : _c.join(",")) || "",
        finish: (_d = wr.result) == null ? void 0 : _d.finish,
        searchInfos: ((_e = wr.ctx) == null ? void 0 : _e.searchInfos.map((sr) => ({
          error: sr.error,
          name: sr.name,
          homepage: sr.homepage,
          results: sr.results.map((ans) => [ans.question, ans.answer])
        }))) || []
      });
    }
    return res;
  }
  function removeRedundantWords(str, words) {
    for (const word of words) {
      str = str.replace(word, "");
    }
    return str;
  }
  const debug$1 = typeof process === "object" && process.env && {}.NODE_DEBUG && /\bsemver\b/i.test({}.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
  };
  var debug_1 = debug$1;
  const SEMVER_SPEC_VERSION = "2.0.0";
  const MAX_LENGTH$1 = 256;
  const MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER || 9007199254740991;
  const MAX_SAFE_COMPONENT_LENGTH = 16;
  var constants = {
    SEMVER_SPEC_VERSION,
    MAX_LENGTH: MAX_LENGTH$1,
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1,
    MAX_SAFE_COMPONENT_LENGTH
  };
  var re$1 = { exports: {} };
  (function(module2, exports3) {
    const { MAX_SAFE_COMPONENT_LENGTH: MAX_SAFE_COMPONENT_LENGTH2 } = constants;
    const debug2 = debug_1;
    exports3 = module2.exports = {};
    const re2 = exports3.re = [];
    const src2 = exports3.src = [];
    const t2 = exports3.t = {};
    let R2 = 0;
    const createToken = (name, value, isGlobal) => {
      const index = R2++;
      debug2(name, index, value);
      t2[name] = index;
      src2[index] = value;
      re2[index] = new RegExp(value, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "[0-9]+");
    createToken("NONNUMERICIDENTIFIER", "\\d*[a-zA-Z-][a-zA-Z0-9-]*");
    createToken("MAINVERSION", `(${src2[t2.NUMERICIDENTIFIER]})\\.(${src2[t2.NUMERICIDENTIFIER]})\\.(${src2[t2.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src2[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src2[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src2[t2.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src2[t2.NUMERICIDENTIFIER]}|${src2[t2.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src2[t2.NUMERICIDENTIFIERLOOSE]}|${src2[t2.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASE", `(?:-(${src2[t2.PRERELEASEIDENTIFIER]}(?:\\.${src2[t2.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src2[t2.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src2[t2.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", "[0-9A-Za-z-]+");
    createToken("BUILD", `(?:\\+(${src2[t2.BUILDIDENTIFIER]}(?:\\.${src2[t2.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src2[t2.MAINVERSION]}${src2[t2.PRERELEASE]}?${src2[t2.BUILD]}?`);
    createToken("FULL", `^${src2[t2.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src2[t2.MAINVERSIONLOOSE]}${src2[t2.PRERELEASELOOSE]}?${src2[t2.BUILD]}?`);
    createToken("LOOSE", `^${src2[t2.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src2[t2.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src2[t2.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src2[t2.XRANGEIDENTIFIER]})(?:\\.(${src2[t2.XRANGEIDENTIFIER]})(?:\\.(${src2[t2.XRANGEIDENTIFIER]})(?:${src2[t2.PRERELEASE]})?${src2[t2.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src2[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src2[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src2[t2.XRANGEIDENTIFIERLOOSE]})(?:${src2[t2.PRERELEASELOOSE]})?${src2[t2.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src2[t2.GTLT]}\\s*${src2[t2.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src2[t2.GTLT]}\\s*${src2[t2.XRANGEPLAINLOOSE]}$`);
    createToken("COERCE", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH2}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?(?:$|[^\\d])`);
    createToken("COERCERTL", src2[t2.COERCE], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src2[t2.LONETILDE]}\\s+`, true);
    exports3.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src2[t2.LONETILDE]}${src2[t2.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src2[t2.LONETILDE]}${src2[t2.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src2[t2.LONECARET]}\\s+`, true);
    exports3.caretTrimReplace = "$1^";
    createToken("CARET", `^${src2[t2.LONECARET]}${src2[t2.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src2[t2.LONECARET]}${src2[t2.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src2[t2.GTLT]}\\s*(${src2[t2.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src2[t2.GTLT]}\\s*(${src2[t2.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src2[t2.GTLT]}\\s*(${src2[t2.LOOSEPLAIN]}|${src2[t2.XRANGEPLAIN]})`, true);
    exports3.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src2[t2.XRANGEPLAIN]})\\s+-\\s+(${src2[t2.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src2[t2.XRANGEPLAINLOOSE]})\\s+-\\s+(${src2[t2.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(re$1, re$1.exports);
  const opts = ["includePrerelease", "loose", "rtl"];
  const parseOptions$1 = (options) => !options ? {} : typeof options !== "object" ? { loose: true } : opts.filter((k) => options[k]).reduce((o, k) => {
    o[k] = true;
    return o;
  }, {});
  var parseOptions_1 = parseOptions$1;
  const numeric = /^[0-9]+$/;
  const compareIdentifiers$1 = (a, b) => {
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
  };
  const rcompareIdentifiers = (a, b) => compareIdentifiers$1(b, a);
  var identifiers = {
    compareIdentifiers: compareIdentifiers$1,
    rcompareIdentifiers
  };
  const debug = debug_1;
  const { MAX_LENGTH, MAX_SAFE_INTEGER } = constants;
  const { re, t } = re$1.exports;
  const parseOptions = parseOptions_1;
  const { compareIdentifiers } = identifiers;
  class SemVer$1 {
    constructor(version, options) {
      options = parseOptions(options);
      if (version instanceof SemVer$1) {
        if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError(`Invalid Version: ${version}`);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError(
          `version is longer than ${MAX_LENGTH} characters`
        );
      }
      debug("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
      if (!m) {
        throw new TypeError(`Invalid Version: ${version}`);
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    format() {
      this.version = `${this.major}.${this.minor}.${this.patch}`;
      if (this.prerelease.length) {
        this.version += `-${this.prerelease.join(".")}`;
      }
      return this.version;
    }
    toString() {
      return this.version;
    }
    compare(other) {
      debug("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer$1)) {
        if (typeof other === "string" && other === this.version) {
          return 0;
        }
        other = new SemVer$1(other, this.options);
      }
      if (other.version === this.version) {
        return 0;
      }
      return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
      if (!(other instanceof SemVer$1)) {
        other = new SemVer$1(other, this.options);
      }
      return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
    }
    comparePre(other) {
      if (!(other instanceof SemVer$1)) {
        other = new SemVer$1(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      let i = 0;
      do {
        const a = this.prerelease[i];
        const b = other.prerelease[i];
        debug("prerelease compare", i, a, b);
        if (a === void 0 && b === void 0) {
          return 0;
        } else if (b === void 0) {
          return 1;
        } else if (a === void 0) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    compareBuild(other) {
      if (!(other instanceof SemVer$1)) {
        other = new SemVer$1(other, this.options);
      }
      let i = 0;
      do {
        const a = this.build[i];
        const b = other.build[i];
        debug("prerelease compare", i, a, b);
        if (a === void 0 && b === void 0) {
          return 0;
        } else if (b === void 0) {
          return 1;
        } else if (a === void 0) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    inc(release, identifier) {
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier);
          this.inc("pre", identifier);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier);
          }
          this.inc("pre", identifier);
          break;
        case "major":
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        case "pre":
          if (this.prerelease.length === 0) {
            this.prerelease = [0];
          } else {
            let i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === "number") {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) {
              this.prerelease.push(0);
            }
          }
          if (identifier) {
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = [identifier, 0];
              }
            } else {
              this.prerelease = [identifier, 0];
            }
          }
          break;
        default:
          throw new Error(`invalid increment argument: ${release}`);
      }
      this.format();
      this.raw = this.version;
      return this;
    }
  }
  var semver = SemVer$1;
  const SemVer = semver;
  const compare$1 = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
  var compare_1 = compare$1;
  const compare = compare_1;
  const gt = (a, b, loose) => compare(a, b, loose) > 0;
  var gt_1 = gt;
  const state$3 = {
    console: {
      listener: {
        logs: 0
      }
    }
  };
  const BackgroundProject = Project.create({
    name: "\u540E\u53F0",
    domains: [],
    scripts: {
      console: new Script({
        name: "\u{1F4C4} \u65E5\u5FD7\u8F93\u51FA",
        url: [["\u6240\u6709", /.*/]],
        namespace: "render.console",
        configs: {
          logs: {
            defaultValue: []
          }
        },
        onrender({ panel: panel2 }) {
          this.offConfigChange(state$3.console.listener.logs);
          const getTypeDesc = (type) => type === "info" ? "\u4FE1\u606F" : type === "error" ? "\u9519\u8BEF" : type === "warn" ? "\u8B66\u544A" : type === "debug" ? "\u8C03\u8BD5" : "\u65E5\u5FD7";
          const createLog = (log) => {
            const date = new Date(log.time);
            const item = el(
              "div",
              {
                title: "\u53CC\u51FB\u590D\u5236\u65E5\u5FD7\u4FE1\u606F",
                className: "item"
              },
              [
                el(
                  "span",
                  { className: "time" },
                  `${date.getHours().toFixed(0).padStart(2, "0")}:${date.getMinutes().toFixed(0).padStart(2, "0")} `
                ),
                el("span", { className: log.type }, `[${getTypeDesc(log.type)}]`),
                el("span", ":" + log.content)
              ]
            );
            item.addEventListener("dblclick", () => {
              navigator.clipboard.writeText(
                Object.keys(log).map((k) => `${k}: ${log[k]}`).join("\n")
              );
            });
            return item;
          };
          const showLogs = () => {
            const div2 = el("div", { className: "card console" });
            const logs2 = this.cfg.logs.map((log) => createLog(log));
            if (logs2.length) {
              div2.replaceChildren(...logs2);
            } else {
              div2.replaceChildren(
                el("div", "\u6682\u65E0\u4EFB\u4F55\u65E5\u5FD7", (div3) => {
                  div3.style.textAlign = "center";
                })
              );
            }
            return { div: div2, logs: logs2 };
          };
          const isScrollBottom = (div2) => {
            const { scrollHeight, scrollTop, clientHeight } = div2;
            console.log(scrollHeight, scrollTop + clientHeight);
            return scrollTop + clientHeight + 50 > scrollHeight;
          };
          const { div, logs } = showLogs();
          state$3.console.listener.logs = this.onConfigChange("logs", (logs2) => {
            const log = createLog(logs2[logs2.length - 1]);
            div.append(log);
            setTimeout(() => {
              if (isScrollBottom(div)) {
                log.scrollIntoView();
              }
            }, 10);
          }) || 0;
          const show = () => {
            panel2.body.replaceChildren(div);
            setTimeout(() => {
              var _a;
              (_a = logs[logs.length - 1]) == null ? void 0 : _a.scrollIntoView();
            }, 10);
          };
          show();
        }
      }),
      app: new Script({
        name: "\u{1F504}\uFE0F \u8F6F\u4EF6\u914D\u7F6E\u540C\u6B65",
        namespace: "background.app",
        url: [["\u6240\u6709\u9875\u9762", /./]],
        hideInPanel: $gm.getInfos() === void 0,
        configs: {
          notes: {
            defaultValue: $creator.notes([
              [
                el("span", [
                  "\u5982\u679C\u60A8\u4F7F\u7528",
                  el("a", { href: "https://docs.ocsjs.com/docs/app", target: "_blank" }, "OCS\u684C\u9762\u8F6F\u4EF6"),
                  "\u542F\u52A8\u6D4F\u89C8\u5668\uFF0C\u5E76\u4F7F\u7528\u6B64\u811A\u672C\uFF0C"
                ]),
                "\u6211\u4EEC\u4F1A\u540C\u6B65\u8F6F\u4EF6\u4E2D\u7684\u914D\u7F6E\u5230\u6B64\u811A\u672C\u4E0A\uFF0C\u65B9\u4FBF\u591A\u4E2A\u6D4F\u89C8\u5668\u7684\u7BA1\u7406\u3002",
                "\u7A97\u53E3\u8BBE\u7F6E\u4EE5\u53CA\u540E\u53F0\u9762\u677F\u6240\u6709\u8BBE\u7F6E\u4E0D\u4F1A\u8FDB\u884C\u540C\u6B65\u3002"
              ],
              "\u5982\u679C\u4E0D\u662F\uFF0C\u60A8\u53EF\u4EE5\u5FFD\u7565\u6B64\u811A\u672C\u3002"
            ]).outerHTML
          },
          sync: {
            defaultValue: false
          },
          connected: {
            defaultValue: false
          },
          closeSync: {
            defaultValue: false,
            label: "\u5173\u95ED\u540C\u6B65",
            attrs: {
              type: "checkbox"
            }
          }
        },
        onrender({ panel: panel2 }) {
          panel2.lockWrapper.remove();
          panel2.configsBody.classList.remove("lock");
          const update = () => {
            if (this.cfg.sync) {
              const tip = el("div", { className: "notes card" }, [`\u5DF2\u6210\u529F\u540C\u6B65\u8F6F\u4EF6\u4E2D\u7684\u914D\u7F6E.`]);
              panel2.body.replaceChildren(el("hr"), tip);
            } else if (this.cfg.connected) {
              const tip = el("div", { className: "notes card" }, [`\u5DF2\u6210\u529F\u8FDE\u63A5\u5230\u8F6F\u4EF6\uFF0C\u4F46\u914D\u7F6E\u4E3A\u7A7A\u3002`]);
              panel2.body.replaceChildren(el("hr"), tip);
            }
          };
          update();
          this.onConfigChange("sync", update);
          this.onConfigChange("connected", update);
          this.onConfigChange("closeSync", (closeSync) => {
            if (closeSync) {
              this.cfg.sync = false;
              this.cfg.connected = false;
              $message("success", { content: "\u5DF2\u5173\u95ED\u540C\u6B65\uFF0C\u5237\u65B0\u9875\u9762\u540E\u751F\u6548" });
            }
          });
        },
        async oncomplete() {
          if ($.isInTopWindow() && this.cfg.closeSync === false) {
            this.cfg.sync = false;
            try {
              const res = await request("http://localhost:15319/browser", {
                type: "GM_xmlhttpRequest",
                method: "get",
                responseType: "json"
              });
              this.cfg.connected = true;
              if (res && Object.keys(res).length) {
                for (const key in res) {
                  if (Object.prototype.hasOwnProperty.call(res, key)) {
                    if (RenderScript.namespace && key.startsWith(RenderScript.namespace)) {
                      Reflect.deleteProperty(res, key);
                    }
                    for (const scriptKey in BackgroundProject.scripts) {
                      if (Object.prototype.hasOwnProperty.call(BackgroundProject.scripts, scriptKey)) {
                        const script = Reflect.get(BackgroundProject.scripts, scriptKey);
                        if (script.namespace && key.startsWith(script.namespace)) {
                          Reflect.deleteProperty(res, key);
                        }
                      }
                    }
                  }
                }
                for (const key in res) {
                  if (Object.prototype.hasOwnProperty.call(res, key)) {
                    $store.set(key, res[key]);
                  }
                }
                for (const projects of definedProjects()) {
                  for (const key in projects.scripts) {
                    if (Object.prototype.hasOwnProperty.call(projects.scripts, key)) {
                      const script = projects.scripts[key];
                      const originalRender = script.onrender;
                      script.onrender = ({ panel: panel2, header }) => {
                        originalRender == null ? void 0 : originalRender({ panel: panel2, header });
                        if (panel2.configsBody.children.length) {
                          panel2.configsBody.classList.add("lock");
                          panel2.lockWrapper.style.width = (panel2.configsBody.clientWidth || panel2.clientWidth) + "px";
                          panel2.lockWrapper.style.height = (panel2.configsBody.clientHeight || panel2.clientHeight) + "px";
                          panel2.configsContainer.prepend(panel2.lockWrapper);
                          panel2.lockWrapper.title = "\u{1F6AB}\u5DF2\u540C\u6B65OCS\u8F6F\u4EF6\u914D\u7F6E\uFF0C\u5982\u9700\u4FEE\u6539\u8BF7\u5728\u8F6F\u4EF6\u8BBE\u7F6E\u4E2D\u4FEE\u6539\u3002\u6216\u8005\u524D\u5F80 \u540E\u53F0-\u8F6F\u4EF6\u914D\u7F6E\u540C\u6B65 \u5173\u95ED\u914D\u7F6E\u540C\u6B65\u3002";
                          panel2.lockWrapper = $creator.tooltip(panel2.lockWrapper);
                        }
                      };
                      if (script.panel && script.header) {
                        script.onrender({ panel: script.panel, header: script.header });
                      }
                    }
                  }
                }
                this.cfg.sync = true;
              }
            } catch {
              this.cfg.sync = false;
              this.cfg.connected = false;
            }
          }
        }
      }),
      dev: new Script({
        name: "\u{1F6E0}\uFE0F \u5F00\u53D1\u8005\u8C03\u8BD5",
        namespace: "background.dev",
        url: [["\u6240\u6709\u9875\u9762", /./]],
        configs: {
          notes: {
            defaultValue: "\u5F00\u53D1\u4EBA\u5458\u8C03\u8BD5\u7528\u3002<br>\u6CE8\u5165OCS_CONTEXT\u5168\u5C40\u53D8\u91CF\u3002\u7528\u6237\u53EF\u5FFD\u7565\u6B64\u9875\u9762\u3002"
          }
        },
        onrender({ panel: panel2 }) {
          const injectBtn = el("button", { className: "base-style-button" }, "\u70B9\u51FB\u6CE8\u5165\u5168\u5C40\u53D8\u91CF");
          injectBtn.addEventListener("click", () => {
            $gm.unsafeWindow.OCS_CONTEXT = self;
          });
          panel2.body.replaceChildren(el("div", { className: "card" }, [injectBtn]));
        }
      }),
      appLoginHelper: new Script({
        name: "\u8F6F\u4EF6\u767B\u5F55\u8F85\u52A9",
        url: [
          ["\u8D85\u661F\u767B\u5F55", "passport2.chaoxing.com/login"],
          ["\u667A\u6167\u6811\u767B\u5F55", "passport.zhihuishu.com/login"]
        ],
        hideInPanel: true,
        oncomplete() {
          if ($.isInTopWindow()) {
            CommonProject.scripts.render.cfg.x = 40;
            CommonProject.scripts.render.cfg.y = 60;
            CommonProject.scripts.render.cfg.visual = "minimize";
          }
        }
      }),
      update: new Script({
        name: "\u811A\u672C\u66F4\u65B0\u68C0\u6D4B",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        hideInPanel: true,
        namespace: "background.update",
        configs: {
          notToday: {
            defaultValue: -1
          }
        },
        oncomplete() {
          if ($.isInTopWindow()) {
            if (this.cfg.notToday === -1 || this.cfg.notToday !== new Date().getDate()) {
              const infos = $gm.getInfos();
              if (infos) {
                setTimeout(async () => {
                  const version = await request("https://cdn.ocsjs.com/ocs-version.json?t=" + Date.now(), {
                    method: "get",
                    type: "fetch"
                  });
                  if (gt_1(version["last-version"], infos.script.version)) {
                    const modal = $modal("confirm", {
                      width: 600,
                      content: $creator.notes([
                        `\u68C0\u6D4B\u5230\u65B0\u7248\u672C\u53D1\u5E03 ${version["last-version"]} \uFF1A`,
                        [...version.notes || []]
                      ]),
                      cancelButton: el(
                        "button",
                        { className: "base-style-button-secondary", innerText: "\u4ECA\u65E5\u4E0D\u518D\u63D0\u793A" },
                        (btn) => {
                          btn.onclick = () => {
                            this.cfg.notToday = new Date().getDate();
                            modal == null ? void 0 : modal.remove();
                          };
                        }
                      ),
                      confirmButton: el("button", { className: "base-style-button", innerText: "\u524D\u5F80\u66F4\u65B0" }, (btn) => {
                        btn.onclick = () => {
                          window.open(version.resource[infos.scriptHandler], "_blank");
                          modal == null ? void 0 : modal.remove();
                        };
                      })
                    });
                  }
                }, 10 * 1e3);
              }
            }
          }
        }
      }),
      errorHandle: new Script({
        name: "\u5168\u5C40\u9519\u8BEF\u6355\u83B7",
        url: [["", /.*/]],
        hideInPanel: true,
        onstart() {
          const projects = definedProjects();
          for (const project of projects) {
            for (const key in project.scripts) {
              if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
                const script = project.scripts[key];
                script.on("scripterror", (err) => {
                  const msg = `[${project.name} - ${script.name}] : ${err}`;
                  console.error(msg);
                  $console.error(msg);
                });
              }
            }
          }
        }
      })
    }
  });
  const $console = new Proxy({}, {
    get(target, key) {
      return (...msg) => {
        let logs = BackgroundProject.scripts.console.cfg.logs;
        if (logs.length > 50) {
          logs = logs.slice(-50);
        }
        logs = logs.concat({
          type: key.toString(),
          content: msg.join(" "),
          time: Date.now(),
          stack: (Error().stack || "").replace("Error", "")
        });
        BackgroundProject.scripts.console.cfg.logs = logs;
      };
    }
  });
  async function waitForMedia(options) {
    const res = await Promise.race([
      new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const video = ((options == null ? void 0 : options.root) || document).querySelector(
            `${(options == null ? void 0 : options.videoSelector) || "video"},${(options == null ? void 0 : options.audioSelector) || "audio"}`
          );
          if (video) {
            clearInterval(interval);
            resolve(video);
          }
        }, 1e3);
      }),
      $.sleep(3 * 60 * 1e3)
    ]);
    if (res) {
      return res;
    } else {
      throw new Error("\u89C6\u9891/\u97F3\u9891\u672A\u627E\u5230\uFF0C\u6216\u8005\u52A0\u8F7D\u8D85\u65F6\u3002");
    }
  }
  let stop = false;
  const hasCapture = false;
  const state$2 = {
    study: {
      currentMedia: void 0
    }
  };
  const ZHSProject = Project.create({
    name: "\u77E5\u5230\u667A\u6167\u6811",
    domains: ["zhihuishu.com"],
    studyProject: true,
    scripts: {
      guide: new Script({
        name: "\u{1F4A1} \u4F7F\u7528\u63D0\u793A",
        url: [
          ["\u5B66\u4E60\u9996\u9875", "https://onlineweb.zhihuishu.com/onlinestuh5"],
          ["\u9996\u9875", "https://www.zhihuishu.com/"]
        ],
        namespace: "zhs.guide",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u8BF7\u624B\u52A8\u8FDB\u5165\u89C6\u9891\u3001\u4F5C\u4E1A\u3001\u8003\u8BD5\u9875\u9762\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u8FD0\u884C\u3002",
              "\u5174\u8DA3\u8BFE\u4F1A\u81EA\u52A8\u4E0B\u4E00\u4E2A\uFF0C\u6240\u4EE5\u4E0D\u63D0\u4F9B\u811A\u672C\u3002"
            ]).outerHTML
          }
        },
        oncomplete() {
          CommonProject.scripts.render.methods.pin(this);
        }
      }),
      "gxk-study": new Script({
        name: "\u{1F5A5}\uFE0F \u5171\u4EAB\u8BFE-\u5B66\u4E60\u811A\u672C",
        url: [["\u5171\u4EAB\u8BFE\u5B66\u4E60\u9875\u9762", "studyvideoh5.zhihuishu.com"]],
        namespace: "zhs.gxk.study",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u7AE0\u8282\u6D4B\u8BD5\u8BF7\u5927\u5BB6\u89C2\u770B\u5B8C\u89C6\u9891\u540E\u624B\u52A8\u6253\u5F00\u3002",
              [
                "\u8BF7\u5927\u5BB6\u4ED4\u7EC6\u6253\u5F00\u89C6\u9891\u4E0A\u65B9\u7684\u201D\u5B66\u524D\u5FC5\u8BFB\u201C\uFF0C\u67E5\u770B\u6210\u7EE9\u5206\u5E03\u3002",
                "\u5982\u679C \u201C\u5E73\u65F6\u6210\u7EE9-\u5B66\u4E60\u4E60\u60EF\u6210\u7EE9\u201D \u5360\u6BD4\u591A\u7684\u8BDD\uFF0C\u5C31\u9700\u8981\u89C4\u5F8B\u5B66\u4E60\u3002",
                "\u6BCF\u5929\u5B9A\u65F6\u534A\u5C0F\u65F6\u53EF\u83B7\u5F97\u4E00\u5206\u4E60\u60EF\u5206\u3002",
                "\u5982\u679C\u4E0D\u60F3\u8981\u4E60\u60EF\u5206\u53EF\u5FFD\u7565\u3002"
              ],
              "\u4E0D\u8981\u6700\u5C0F\u5316\u6D4F\u89C8\u5668\uFF0C\u53EF\u80FD\u5BFC\u81F4\u811A\u672C\u6682\u505C\u3002"
            ]).outerHTML
          },
          studyRecord: {
            defaultValue: []
          },
          stopTime: {
            label: "\u5B9A\u65F6\u505C\u6B62",
            tag: "select",
            attrs: { title: "\u5230\u65F6\u95F4\u540E\u81EA\u52A8\u6682\u505C\u811A\u672C" },
            defaultValue: "0",
            onload() {
              this.append(
                ...$creator.selectOptions(this.getAttribute("value"), [
                  [0, "\u5173\u95ED"],
                  [0.5, "\u534A\u5C0F\u65F6\u540E"],
                  [1, "\u4E00\u5C0F\u65F6\u540E"],
                  [2, "\u4E24\u5C0F\u65F6\u540E"]
                ])
              );
            }
          },
          restudy,
          volume,
          definition,
          playbackRate: {
            label: "\u89C6\u9891\u500D\u901F",
            tag: "select",
            defaultValue: 1,
            onload() {
              this.append(
                ...$creator.selectOptions(
                  this.getAttribute("value"),
                  [1, 1.25, 1.5].map((rate) => [rate, rate + "x"])
                )
              );
            }
          }
        },
        methods() {
          return {
            increaseStudyTime: (courseName, val) => {
              const records = this.cfg.studyRecord;
              const record = records.find(
                (r) => new Date(r.date).toLocaleDateString() === new Date().toLocaleDateString()
              );
              let courses = [];
              if (record) {
                courses = record.courses;
              } else {
                records.push({ date: Date.now(), courses });
              }
              const course = courses.find((c) => c.name === courseName);
              if (course) {
                course.time = course.time + val;
                if (typeof course.time === "string") {
                  course.time = parseFloat(course.time);
                }
              } else {
                courses.push({ name: courseName, time: 0 });
              }
              this.cfg.studyRecord = records;
            }
          };
        },
        onrender({ panel: panel2 }) {
          panel2.body.append(
            el("hr"),
            $creator.button("\u23F0\u68C0\u6D4B\u662F\u5426\u9700\u8981\u89C4\u5F8B\u5B66\u4E60", {}, (btn) => {
              btn.style.marginRight = "12px";
              btn.onclick = () => {
                var _a;
                (_a = $el(".iconbaizhoumoshi-xueqianbidu")) == null ? void 0 : _a.click();
                setTimeout(() => {
                  var _a2;
                  const pmd = $el(".preschool-Mustread-div");
                  if (pmd) {
                    const num = parseInt(((_a2 = pmd.innerText.match(/学习习惯成绩（(\d+)分）/)) == null ? void 0 : _a2[1]) || "0");
                    $modal("alert", {
                      content: `\u5F53\u524D\u8BFE\u7A0B\u4E60\u60EF\u5206\u5360\u6BD4\u4E3A${num}\u5206\uFF0C` + (num ? `\u9700\u8981\u89C4\u5F8B\u5B66\u4E60${num}\u5929, \u6BCF\u5929\u5B9A\u65F6\u89C2\u770B\u534A\u5C0F\u65F6\u5373\u53EF\u3002\uFF08\u5982\u679C\u4E0D\u60F3\u62FF\u4E60\u60EF\u5206\u53EF\u4EE5\u5FFD\u7565\uFF09` : "\u53EF\u4E00\u76F4\u89C2\u770B\u5B66\u4E60\uFF0C\u65E0\u9700\u5B9A\u65F6\u505C\u6B62\u3002")
                    });
                  } else {
                    $modal("alert", { content: "\u68C0\u6D4B\u5931\u8D25\uFF0C\u8BF7\u786E\u8BA4\u5728\u89C6\u9891\u5B66\u4E60\u9875\u9762\u4F7F\u7528\u6B64\u6309\u94AE\u3002" });
                  }
                }, 100);
              };
            }),
            $creator.button("\u{1F4D8}\u67E5\u770B\u5B66\u4E60\u8BB0\u5F55", {}, (btn) => {
              btn.onclick = () => {
                $modal("alert", {
                  title: "\u5B66\u4E60\u8BB0\u5F55",
                  content: $creator.notes(
                    this.cfg.studyRecord.map((r) => {
                      const date = new Date(r.date);
                      return [
                        `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`,
                        $creator.notes(r.courses.map((course) => `${course.name} - ${optimizeSecond(course.time)}`))
                      ];
                    })
                  )
                });
              };
            })
          );
        },
        onactive() {
          this.cfg.stopTime = "0";
          if (this.cfg.playbackRate) {
            this.cfg.playbackRate = parseFloat(this.cfg.playbackRate.toString());
          }
        },
        async oncomplete() {
          CommonProject.scripts.render.methods.pin(this);
          const waitForVue = () => {
            return new Promise((resolve, reject) => {
              var _a, _b;
              const vue2 = (_a = $el(".video-study")) == null ? void 0 : _a.__vue__;
              if ((_b = vue2 == null ? void 0 : vue2.data) == null ? void 0 : _b.courseInfo) {
                resolve(vue2);
              } else {
                setTimeout(() => {
                  resolve(waitForVue());
                }, 1e3);
              }
            });
          };
          const vue = await waitForVue();
          console.log(vue);
          let stopInterval = 0;
          let stopMessage;
          this.onConfigChange("stopTime", () => {
            var _a;
            clearInterval(stopInterval);
            stopMessage == null ? void 0 : stopMessage.remove();
            if (this.cfg.stopTime === "0") {
              $message("info", { content: "\u5B9A\u65F6\u505C\u6B62\u5DF2\u5173\u95ED" });
            } else {
              let stopCount = parseFloat(this.cfg.stopTime) * 60 * 60;
              stopInterval = setInterval(() => {
                var _a2;
                if (stopCount > 0 && hasCapture === false) {
                  stopCount--;
                } else {
                  clearInterval(stopInterval);
                  stop = true;
                  (_a2 = $el("video")) == null ? void 0 : _a2.pause();
                  $modal("alert", { content: "\u811A\u672C\u6682\u505C\uFF0C\u5DF2\u83B7\u5F97\u4ECA\u65E5\u5E73\u65F6\u5206\uFF0C\u5982\u9700\u7EE7\u7EED\u89C2\u770B\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u3002" });
                }
              }, 1e3);
              const val = (_a = [
                [0.5, "\u534A\u5C0F\u65F6\u540E"],
                [1, "\u4E00\u5C0F\u65F6\u540E"],
                [2, "\u4E24\u5C0F\u65F6\u540E"]
              ].find((t2) => t2[0].toString() === this.cfg.stopTime)) == null ? void 0 : _a[0];
              const date = new Date();
              date.setMinutes(date.getMinutes() + val * 60);
              stopMessage = $message("info", {
                duration: 0,
                content: `\u5728 ${date.toLocaleTimeString()} \u811A\u672C\u5C06\u81EA\u52A8\u6682\u505C`
              });
            }
          });
          this.onConfigChange("volume", (curr) => {
            state$2.study.currentMedia && (state$2.study.currentMedia.volume = curr);
          });
          this.onConfigChange("playbackRate", (curr) => {
            if (typeof curr === "string") {
              this.cfg.playbackRate = parseFloat(curr);
            }
            switchPlaybackRate(this.cfg.playbackRate);
          });
          this.onConfigChange("definition", (curr) => {
            switchLine(curr);
          });
          const hideDialog = () => {
            $$el(".el-dialog__wrapper").forEach((dialog) => {
              dialog.remove();
            });
          };
          const closeTestDialog = async () => {
            const items = $$el(".topic-item");
            if (items.length !== 0) {
              items[0].click();
              await $.sleep(1e3);
              vue.testDialog = false;
            }
          };
          const finish = () => {
            $modal("alert", {
              content: "\u68C0\u6D4B\u5230\u5F53\u524D\u89C6\u9891\u5168\u90E8\u64AD\u653E\u5B8C\u6BD5\uFF0C\u5982\u679C\u8FD8\u6709\u672A\u5B8C\u6210\u7684\u89C6\u9891\u8BF7\u5237\u65B0\u91CD\u8BD5\uFF0C\u6216\u8005\u6253\u5F00\u590D\u4E60\u6A21\u5F0F\u3002"
            });
          };
          const fixProcessBar = () => {
            const bar = $el(".controlsBar");
            if (bar) {
              bar.style.display = "block";
            }
          };
          const recordStudyTimeLoop = () => {
            this.methods.increaseStudyTime(vue.data.courseInfo.name, this.cfg.playbackRate);
            setTimeout(recordStudyTimeLoop, 1e3);
          };
          recordStudyTimeLoop();
          let timeMessage;
          const calculateTime = () => {
            var _a, _b;
            try {
              const vue2 = (_a = $el(".video-study")) == null ? void 0 : _a.__vue__;
              const videos = vue2.videoList.map((v) => v.videoLessons).flat().map((l) => (l == null ? void 0 : l.videoSmallLessons) || l).flat().filter((v) => v.isStudiedLesson === 0);
              const allTime = videos.map((l) => l.videoSec || 0).reduce((pre, curr) => pre + curr, 0) / (60 * 60);
              const record = this.cfg.studyRecord.find(
                (r) => new Date(r.date).toLocaleDateString() === new Date().toLocaleDateString()
              );
              const time = optimizeSecond(((_b = record == null ? void 0 : record.courses.find((c) => c.name === vue2.data.courseInfo.name)) == null ? void 0 : _b.time) || 0);
              timeMessage == null ? void 0 : timeMessage.remove();
              timeMessage = $message("info", {
                duration: 0,
                content: `\u8FD8\u5269${videos.length - 1}\u4E2A\u89C6\u9891\uFF0C\u603B\u65F6\u957F${allTime.toFixed(2)}\u5C0F\u65F6\uFF0C\u4ECA\u65E5\u5DF2\u5B66\u4E60${time}`
              });
            } catch (err) {
              console.error(err);
            }
          };
          const interval = setInterval(async () => {
            if (vue.videoList.length) {
              clearInterval(interval);
              hack();
              hideDialog();
              setInterval(() => {
                closeTestDialog();
                fixProcessBar();
                $$el(".v-modal,.mask").forEach((modal) => {
                  modal.remove();
                });
              }, 3e3);
              const findVideoItem = (opts2) => {
                let videoItems = Array.from(document.querySelectorAll(".clearfix.video"));
                if (!this.cfg.restudy) {
                  videoItems = videoItems.filter((el2) => el2.querySelector(".time_icofinish") === null);
                }
                for (let i = 0; i < videoItems.length; i++) {
                  const item = videoItems[i];
                  if (item.classList.contains("current_play")) {
                    return videoItems[i + (opts2.next ? 1 : 0)];
                  }
                }
                return videoItems[0];
              };
              $message("info", { content: "3\u79D2\u540E\u5F00\u59CB\u5B66\u4E60", duration: 3 });
              const study2 = async (opts2) => {
                if (stop === false) {
                  const item = findVideoItem(opts2);
                  console.log("item", item);
                  if (item) {
                    await $.sleep(3e3);
                    item.click();
                    await $.sleep(5e3);
                    watch(
                      { volume: this.cfg.volume, playbackRate: this.cfg.playbackRate, definition: this.cfg.definition },
                      ({ next }) => {
                        study2({ next });
                      }
                    );
                    calculateTime();
                  } else {
                    finish();
                  }
                } else {
                  $message("warn", {
                    content: "\u68C0\u6D4B\u5230\u5F53\u524D\u89C6\u9891\u5168\u90E8\u64AD\u653E\u5B8C\u6BD5\uFF0C\u5982\u679C\u8FD8\u6709\u672A\u5B8C\u6210\u7684\u89C6\u9891\u8BF7\u5237\u65B0\u91CD\u8BD5\uFF0C\u6216\u8005\u6253\u5F00\u590D\u4E60\u6A21\u5F0F\u3002"
                  });
                }
              };
              study2({ next: false });
            }
          }, 1e3);
          setTimeout(() => {
            if (vue.videoList.length === 0) {
              finish();
              clearInterval(interval);
            }
          }, 10 * 1e3);
        }
      }),
      "gxk-work": new Script({
        name: "\u270D\uFE0F \u5171\u4EAB\u8BFE-\u4F5C\u4E1A\u8003\u8BD5\u811A\u672C",
        url: [
          ["\u5171\u4EAB\u8BFE\u4F5C\u4E1A\u9875\u9762", "zhihuishu.com/stuExamWeb.html#/webExamList/dohomework"],
          ["\u5171\u4EAB\u8BFE\u8003\u8BD5\u9875\u9762", "zhihuishu.com/stuExamWeb.html#/webExamList/doexamination"],
          ["\u4F5C\u4E1A\u8003\u8BD5\u5217\u8868", "zhihuishu.com/stuExamWeb.html#/webExamList\\?"]
        ],
        namespace: "zhs.gxk.work",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u81EA\u52A8\u7B54\u9898\u524D\u8BF7\u5728 \u201C\u901A\u7528-\u5168\u5C40\u8BBE\u7F6E\u201D \u4E2D\u8BBE\u7F6E\u9898\u5E93\u914D\u7F6E\u3002",
              "\u53EF\u4EE5\u642D\u914D \u201C\u901A\u7528-\u5728\u7EBF\u641C\u9898\u201D \u4E00\u8D77\u4F7F\u7528\u3002",
              "\u{1F4E2} \u624B\u52A8\u8FDB\u5165\u4F5C\u4E1A/\u8003\u8BD5\uFF0C\u5982\u679C\u672A\u5F00\u59CB\u7B54\u9898\uFF0C\u8BF7\u5C1D\u8BD5\u5237\u65B0\u9875\u9762\u3002"
            ]).outerHTML
          }
        },
        methods() {
          return {
            work: async () => {
              const isExam = location.href.includes("doexamination");
              const isWork = location.href.includes("dohomework");
              if (isExam || isWork) {
                await waitForQuestionsLoad();
                $message("info", { content: `\u5F00\u59CB${isExam ? "\u8003\u8BD5" : "\u4F5C\u4E1A"}` });
                commonWork(this, {
                  workerProvider: (opts2) => gxkWorkAndExam(opts2)
                });
              } else {
                CommonProject.scripts.render.methods.pin(this);
              }
            }
          };
        },
        async oncomplete() {
          this.methods.work();
          this.on("historychange", () => {
            this.methods.work();
          });
        }
      }),
      "xnk-study": new Script({
        name: "\u{1F5A5}\uFE0F \u6821\u5185\u8BFE-\u5B66\u4E60\u811A\u672C",
        url: [["\u6821\u5185\u8BFE\u5B66\u4E60\u9875\u9762", "zhihuishu.com/aidedteaching/sourceLearning"]],
        namespace: "zhs.xnk.study",
        configs: {
          notes: {
            defaultValue: $creator.notes(["\u7AE0\u8282\u6D4B\u8BD5\u8BF7\u5927\u5BB6\u89C2\u770B\u5B8C\u89C6\u9891\u540E\u624B\u52A8\u6253\u5F00\u3002", "\u6B64\u8BFE\u7A0B\u4E0D\u80FD\u4F7F\u7528\u500D\u901F\u3002"]).outerHTML
          },
          restudy,
          volume
        },
        oncomplete() {
          CommonProject.scripts.render.methods.pin(this);
          const finish = () => {
            $modal("alert", {
              content: "\u68C0\u6D4B\u5230\u5F53\u524D\u89C6\u9891\u5168\u90E8\u64AD\u653E\u5B8C\u6BD5\uFF0C\u5982\u679C\u8FD8\u6709\u672A\u5B8C\u6210\u7684\u89C6\u9891\u8BF7\u5237\u65B0\u91CD\u8BD5\uFF0C\u6216\u8005\u6253\u5F00\u590D\u4E60\u6A21\u5F0F\u3002"
            });
          };
          this.onConfigChange("volume", (curr) => {
            state$2.study.currentMedia && (state$2.study.currentMedia.volume = curr);
          });
          let list = [];
          const interval = setInterval(async () => {
            list = $$el(".icon-video").map((icon) => icon.parentElement);
            if (list.length) {
              clearInterval(interval);
              if (!this.cfg.restudy) {
                list = list.filter((el2) => el2.querySelector(".icon-finish") === null);
              }
              const item = list[0];
              if (item) {
                if (item.classList.contains("active")) {
                  watch({ volume: this.cfg.volume, playbackRate: 1 }, () => {
                    if (list[1])
                      list[1].click();
                  });
                } else {
                  item.click();
                }
              }
            }
          }, 1e3);
          setTimeout(() => {
            if (list.length === 0) {
              finish();
              clearInterval(interval);
            }
          }, 10 * 1e3);
        }
      }),
      "xnk-work": new Script({
        name: "\u270D\uFE0F \u6821\u5185\u8BFE-\u4F5C\u4E1A\u8003\u8BD5\u811A\u672C",
        url: [
          ["\u6821\u5185\u8BFE\u4F5C\u4E1A\u9875\u9762", "zhihuishu.com/atHomeworkExam/stu/homeworkQ/exerciseList"],
          ["\u6821\u5185\u8BFE\u8003\u8BD5\u9875\u9762", "zhihuishu.com/atHomeworkExam/stu/examQ/examexercise"]
        ],
        namespace: "zhs.xnk.work",
        configs: { notes: workNotes },
        async oncomplete() {
          commonWork(this, {
            workerProvider: xnkWork
          });
        }
      })
    }
  });
  async function watch(options, onended) {
    await waitForMedia();
    const set = async () => {
      switchLine(options.definition);
      await $.sleep(1e3);
      switchPlaybackRate(options.playbackRate);
      await $.sleep(1e3);
      const video2 = await waitForMedia();
      state$2.study.currentMedia = video2;
      if (video2) {
        video2.currentTime = 1;
        video2.volume = options.volume;
      }
      return video2;
    };
    const video = await set();
    const videoCheckInterval = setInterval(async () => {
      if ((video == null ? void 0 : video.isConnected) === false) {
        clearInterval(videoCheckInterval);
        $message("info", { content: "\u68C0\u6D4B\u5230\u89C6\u9891\u5207\u6362\u4E2D..." });
        onended({ next: false });
      }
    }, 3e3);
    playMedia(() => video == null ? void 0 : video.play());
    video.onpause = async () => {
      if (!(video == null ? void 0 : video.ended) && stop === false) {
        await waitForCaptcha();
        await $.sleep(1e3);
        video == null ? void 0 : video.play();
      }
    };
    video.onended = () => {
      clearInterval(videoCheckInterval);
      onended({ next: true });
    };
  }
  function switchLine(definition2 = "line1bq") {
    var _a;
    (_a = $el(`.definiLines .${definition2}`)) == null ? void 0 : _a.click();
  }
  function switchPlaybackRate(playbackRate) {
    var _a;
    (_a = $el(`.speedList [rate="${playbackRate === 1 ? "1.0" : playbackRate}"]`)) == null ? void 0 : _a.click();
  }
  function checkForCaptcha(update) {
    let modal;
    return setInterval(() => {
      if ($el(".yidun_popup")) {
        update(true);
        if (modal === void 0) {
          modal = $modal("alert", { content: "\u5F53\u524D\u68C0\u6D4B\u5230\u9A8C\u8BC1\u7801\uFF0C\u8BF7\u8F93\u5165\u540E\u65B9\u53EF\u7EE7\u7EED\u8FD0\u884C\u3002" });
        }
      } else {
        if (modal) {
          update(false);
          modal.remove();
          modal = void 0;
        }
      }
    }, 1e3);
  }
  function waitForCaptcha() {
    const popup = document.querySelector(".yidun_popup");
    if (popup) {
      $message("warn", { content: "\u5F53\u524D\u68C0\u6D4B\u5230\u9A8C\u8BC1\u7801\uFF0C\u8BF7\u8F93\u5165\u540E\u65B9\u53EF\u7EE7\u7EED\u8FD0\u884C\u3002" });
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const popup2 = document.querySelector(".yidun_popup");
          if (popup2 === null) {
            clearInterval(interval);
            resolve();
          }
        }, 1e3);
      });
    }
  }
  function waitForQuestionsLoad() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        var _a;
        const vue = (_a = $el("#app > div")) == null ? void 0 : _a.__vue__;
        if (vue == null ? void 0 : vue.alllQuestionTest) {
          clearInterval(interval);
          resolve();
        }
      }, 1e3);
    });
  }
  function hack() {
    var _a;
    const vue = (_a = $el(".video-study")) == null ? void 0 : _a.__vue__;
    const empty = () => {
    };
    vue.checkout = empty;
    vue.notTrustScript = empty;
    vue.checkoutNotTrustScript = empty;
    const _videoClick = vue.videoClick;
    vue.videoClick = function(...args) {
      const e = new PointerEvent("click");
      const event = /* @__PURE__ */ Object.create({ isTrusted: true });
      Object.setPrototypeOf(event, e);
      args[args.length - 1] = event;
      return _videoClick.apply(vue, args);
    };
    vue.videoClick = function(...args) {
      args[args.length - 1] = { isTrusted: true };
      return _videoClick.apply(vue, args);
    };
  }
  function gxkWorkAndExam({
    answererWrappers,
    period,
    thread,
    stopSecondWhenFinish,
    redundanceWordsText
  }) {
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "zhs-gxk"
    });
    const titleTransform = (titles) => {
      return removeRedundantWords(
        titles.map((title) => {
          if (title.__vue__) {
            const div = document.createElement("div");
            div.innerHTML = title.__vue__._data.shadowDom.innerHTML;
            for (const img of Array.from(div.querySelectorAll("img"))) {
              img.src = img.dataset.src || "";
            }
            return div;
          } else {
            return title;
          }
        }).map((t2) => t2 ? optimizationElementWithImage(t2).innerText : "").filter((t2) => t2.trim() !== "").join(","),
        redundanceWordsText.split("\n")
      );
    };
    const worker = new OCSWorker({
      root: ".examPaper_subject",
      elements: {
        title: ".subject_describe > div,.smallStem_describe > div:nth-child(2)",
        options: (root2) => $$el(".subject_node .nodeLab", root2).map((t2) => {
          for (const img of Array.from(t2.querySelectorAll(".node_detail img"))) {
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            createUnVisibleTextOfImage(img);
          }
          return t2;
        })
      },
      requestPeriod: period != null ? period : 3,
      resolvePeriod: 1,
      thread: thread != null ? thread : 1,
      answerer: (elements, type, ctx) => {
        const title = titleTransform(elements.title);
        if (title) {
          return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, () => {
            return defaultAnswerWrapperHandler(answererWrappers, {
              type,
              title,
              options: ctx.elements.options.map((o) => o.innerText).join("\n")
            });
          });
        } else {
          throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
        }
      },
      work: {
        handler(type, answer, option) {
          var _a;
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (!((_a = option.querySelector("input")) == null ? void 0 : _a.checked)) {
              option.click();
            }
          } else if (type === "completion" && answer.trim()) {
            const text = option.querySelector("textarea");
            if (text) {
              text.value = answer;
            }
          }
        }
      },
      onResultsUpdate(res) {
        CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, titleTransform));
      },
      onResolveUpdate(res) {
        var _a;
        if ((_a = res.result) == null ? void 0 : _a.finish) {
          CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(simplifyWorkResult([res], titleTransform));
        }
        CommonProject.scripts.workResults.methods.updateWorkState(worker);
      }
    });
    checkForCaptcha((hasCaptcha) => {
      if (hasCaptcha) {
        worker.emit("stop");
      } else {
        worker.emit("continuate");
      }
    });
    worker.doWork().then(async () => {
      var _a;
      $message("success", { content: `\u7B54\u9898\u5B8C\u6210\uFF0C\u5C06\u7B49\u5F85 ${stopSecondWhenFinish} \u79D2\u540E\u8FDB\u884C\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002` });
      await $.sleep(stopSecondWhenFinish * 1e3);
      for (let index = 0; index < worker.totalQuestionCount; index++) {
        const modal = $modal("alert", { content: "\u6B63\u5728\u4FDD\u5B58\u9898\u76EE\u4E2D\uFF0C\u8BF7\u52FF\u64CD\u4F5C...", confirmButton: null });
        await waitForCaptcha();
        await $.sleep(2e3);
        (_a = document.querySelectorAll(".answerCard_list ul li").item(index)) == null ? void 0 : _a.click();
        await $.sleep(200);
        const next = $el("div.examPaper_box > div.switch-btn-box > button:nth-child(2)");
        if (next) {
          next.click();
        } else {
          $console.error("\u672A\u627E\u5230\u4E0B\u4E00\u9875\u6309\u94AE\u3002");
        }
        modal == null ? void 0 : modal.remove();
      }
      $message("info", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      worker.emit("done");
    }).catch((err) => {
      $message("error", { content: "\u7B54\u9898\u7A0B\u5E8F\u53D1\u751F\u9519\u8BEF : " + err.message });
    });
    return worker;
  }
  function xnkWork({ answererWrappers, period, thread }) {
    $message("info", { content: "\u5F00\u59CB\u4F5C\u4E1A" });
    CommonProject.scripts.workResults.methods.init();
    const titleTransform = (titles) => {
      return titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => t2 ? optimizationElementWithImage(t2).innerText : "").join(",");
    };
    const workResults = [];
    let totalQuestionCount = 0;
    let requestIndex = 0;
    let resolverIndex = 0;
    const worker = new OCSWorker({
      root: ".questionBox",
      elements: {
        title: ".questionContent",
        options: ".optionUl label",
        questionTit: ".questionTit"
      },
      requestPeriod: period != null ? period : 3,
      resolvePeriod: 1,
      thread: thread != null ? thread : 1,
      answerer: (elements, type, ctx) => {
        const title = titleTransform(elements.title);
        if (title) {
          return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, () => {
            return defaultAnswerWrapperHandler(answererWrappers, {
              type,
              title,
              options: ctx.elements.options.map((o) => o.innerText).join("\n")
            });
          });
        } else {
          throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
        }
      },
      work: {
        handler(type, answer, option, ctx) {
          var _a;
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (((_a = option.querySelector("input")) == null ? void 0 : _a.checked) === false) {
              option.click();
            }
          } else if (type === "completion" && answer.trim()) {
            const text = option.querySelector("textarea");
            if (text) {
              text.value = answer;
            }
          }
        }
      },
      onResultsUpdate(res, currentResult) {
        if (currentResult.result) {
          workResults.push(...simplifyWorkResult([currentResult], titleTransform));
          CommonProject.scripts.workResults.methods.setResults(workResults);
          totalQuestionCount++;
          requestIndex++;
          resolverIndex++;
        }
      },
      onResolveUpdate(res) {
        var _a;
        if ((_a = res.result) == null ? void 0 : _a.finish) {
          CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(simplifyWorkResult([res], titleTransform));
        }
        CommonProject.scripts.workResults.methods.updateWorkState({
          totalQuestionCount,
          requestIndex,
          resolverIndex
        });
      }
    });
    const getBtn = () => document.querySelector("span.Topicswitchingbtn:nth-child(2)");
    let next = getBtn();
    (async () => {
      while (next && worker.isClose === false) {
        await worker.doWork();
        await $.sleep((period != null ? period : 3) * 1e3);
        next = getBtn();
        next == null ? void 0 : next.click();
        await $.sleep((period != null ? period : 3) * 1e3);
      }
      $message("info", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "zhs-xnk";
    })();
    return worker;
  }
  function optimizeSecond(second) {
    if (second > 3600) {
      return `${Math.floor(second / 3600)}\u5C0F\u65F6${Math.floor(second % 3600 / 60)}\u5206\u949F`;
    } else if (second > 60) {
      return `${Math.floor(second / 60)}\u5206\u949F${second % 60}\u79D2`;
    } else {
      return `${second}\u79D2`;
    }
  }
  var md5$1 = { exports: {} };
  var crypt = { exports: {} };
  (function() {
    var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", crypt$1 = {
      rotl: function(n, b) {
        return n << b | n >>> 32 - b;
      },
      rotr: function(n, b) {
        return n << 32 - b | n >>> b;
      },
      endian: function(n) {
        if (n.constructor == Number) {
          return crypt$1.rotl(n, 8) & 16711935 | crypt$1.rotl(n, 24) & 4278255360;
        }
        for (var i = 0; i < n.length; i++)
          n[i] = crypt$1.endian(n[i]);
        return n;
      },
      randomBytes: function(n) {
        for (var bytes = []; n > 0; n--)
          bytes.push(Math.floor(Math.random() * 256));
        return bytes;
      },
      bytesToWords: function(bytes) {
        for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
          words[b >>> 5] |= bytes[i] << 24 - b % 32;
        return words;
      },
      wordsToBytes: function(words) {
        for (var bytes = [], b = 0; b < words.length * 32; b += 8)
          bytes.push(words[b >>> 5] >>> 24 - b % 32 & 255);
        return bytes;
      },
      bytesToHex: function(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
          hex.push((bytes[i] >>> 4).toString(16));
          hex.push((bytes[i] & 15).toString(16));
        }
        return hex.join("");
      },
      hexToBytes: function(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
          bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
      },
      bytesToBase64: function(bytes) {
        for (var base64 = [], i = 0; i < bytes.length; i += 3) {
          var triplet = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
          for (var j = 0; j < 4; j++)
            if (i * 8 + j * 6 <= bytes.length * 8)
              base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 63));
            else
              base64.push("=");
        }
        return base64.join("");
      },
      base64ToBytes: function(base64) {
        base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");
        for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
          if (imod4 == 0)
            continue;
          bytes.push((base64map.indexOf(base64.charAt(i - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << imod4 * 2 | base64map.indexOf(base64.charAt(i)) >>> 6 - imod4 * 2);
        }
        return bytes;
      }
    };
    crypt.exports = crypt$1;
  })();
  var charenc = {
    utf8: {
      stringToBytes: function(str) {
        return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
      },
      bytesToString: function(bytes) {
        return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
      }
    },
    bin: {
      stringToBytes: function(str) {
        for (var bytes = [], i = 0; i < str.length; i++)
          bytes.push(str.charCodeAt(i) & 255);
        return bytes;
      },
      bytesToString: function(bytes) {
        for (var str = [], i = 0; i < bytes.length; i++)
          str.push(String.fromCharCode(bytes[i]));
        return str.join("");
      }
    }
  };
  var charenc_1 = charenc;
  /*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */
  var isBuffer_1 = function(obj) {
    return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
  };
  function isBuffer(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
  }
  function isSlowBuffer(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isBuffer(obj.slice(0, 0));
  }
  (function() {
    var crypt$1 = crypt.exports, utf8 = charenc_1.utf8, isBuffer2 = isBuffer_1, bin = charenc_1.bin, md52 = function(message, options) {
      if (message.constructor == String)
        if (options && options.encoding === "binary")
          message = bin.stringToBytes(message);
        else
          message = utf8.stringToBytes(message);
      else if (isBuffer2(message))
        message = Array.prototype.slice.call(message, 0);
      else if (!Array.isArray(message) && message.constructor !== Uint8Array)
        message = message.toString();
      var m = crypt$1.bytesToWords(message), l = message.length * 8, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
      for (var i = 0; i < m.length; i++) {
        m[i] = (m[i] << 8 | m[i] >>> 24) & 16711935 | (m[i] << 24 | m[i] >>> 8) & 4278255360;
      }
      m[l >>> 5] |= 128 << l % 32;
      m[(l + 64 >>> 9 << 4) + 14] = l;
      var FF = md52._ff, GG = md52._gg, HH = md52._hh, II = md52._ii;
      for (var i = 0; i < m.length; i += 16) {
        var aa = a, bb = b, cc = c, dd = d;
        a = FF(a, b, c, d, m[i + 0], 7, -680876936);
        d = FF(d, a, b, c, m[i + 1], 12, -389564586);
        c = FF(c, d, a, b, m[i + 2], 17, 606105819);
        b = FF(b, c, d, a, m[i + 3], 22, -1044525330);
        a = FF(a, b, c, d, m[i + 4], 7, -176418897);
        d = FF(d, a, b, c, m[i + 5], 12, 1200080426);
        c = FF(c, d, a, b, m[i + 6], 17, -1473231341);
        b = FF(b, c, d, a, m[i + 7], 22, -45705983);
        a = FF(a, b, c, d, m[i + 8], 7, 1770035416);
        d = FF(d, a, b, c, m[i + 9], 12, -1958414417);
        c = FF(c, d, a, b, m[i + 10], 17, -42063);
        b = FF(b, c, d, a, m[i + 11], 22, -1990404162);
        a = FF(a, b, c, d, m[i + 12], 7, 1804603682);
        d = FF(d, a, b, c, m[i + 13], 12, -40341101);
        c = FF(c, d, a, b, m[i + 14], 17, -1502002290);
        b = FF(b, c, d, a, m[i + 15], 22, 1236535329);
        a = GG(a, b, c, d, m[i + 1], 5, -165796510);
        d = GG(d, a, b, c, m[i + 6], 9, -1069501632);
        c = GG(c, d, a, b, m[i + 11], 14, 643717713);
        b = GG(b, c, d, a, m[i + 0], 20, -373897302);
        a = GG(a, b, c, d, m[i + 5], 5, -701558691);
        d = GG(d, a, b, c, m[i + 10], 9, 38016083);
        c = GG(c, d, a, b, m[i + 15], 14, -660478335);
        b = GG(b, c, d, a, m[i + 4], 20, -405537848);
        a = GG(a, b, c, d, m[i + 9], 5, 568446438);
        d = GG(d, a, b, c, m[i + 14], 9, -1019803690);
        c = GG(c, d, a, b, m[i + 3], 14, -187363961);
        b = GG(b, c, d, a, m[i + 8], 20, 1163531501);
        a = GG(a, b, c, d, m[i + 13], 5, -1444681467);
        d = GG(d, a, b, c, m[i + 2], 9, -51403784);
        c = GG(c, d, a, b, m[i + 7], 14, 1735328473);
        b = GG(b, c, d, a, m[i + 12], 20, -1926607734);
        a = HH(a, b, c, d, m[i + 5], 4, -378558);
        d = HH(d, a, b, c, m[i + 8], 11, -2022574463);
        c = HH(c, d, a, b, m[i + 11], 16, 1839030562);
        b = HH(b, c, d, a, m[i + 14], 23, -35309556);
        a = HH(a, b, c, d, m[i + 1], 4, -1530992060);
        d = HH(d, a, b, c, m[i + 4], 11, 1272893353);
        c = HH(c, d, a, b, m[i + 7], 16, -155497632);
        b = HH(b, c, d, a, m[i + 10], 23, -1094730640);
        a = HH(a, b, c, d, m[i + 13], 4, 681279174);
        d = HH(d, a, b, c, m[i + 0], 11, -358537222);
        c = HH(c, d, a, b, m[i + 3], 16, -722521979);
        b = HH(b, c, d, a, m[i + 6], 23, 76029189);
        a = HH(a, b, c, d, m[i + 9], 4, -640364487);
        d = HH(d, a, b, c, m[i + 12], 11, -421815835);
        c = HH(c, d, a, b, m[i + 15], 16, 530742520);
        b = HH(b, c, d, a, m[i + 2], 23, -995338651);
        a = II(a, b, c, d, m[i + 0], 6, -198630844);
        d = II(d, a, b, c, m[i + 7], 10, 1126891415);
        c = II(c, d, a, b, m[i + 14], 15, -1416354905);
        b = II(b, c, d, a, m[i + 5], 21, -57434055);
        a = II(a, b, c, d, m[i + 12], 6, 1700485571);
        d = II(d, a, b, c, m[i + 3], 10, -1894986606);
        c = II(c, d, a, b, m[i + 10], 15, -1051523);
        b = II(b, c, d, a, m[i + 1], 21, -2054922799);
        a = II(a, b, c, d, m[i + 8], 6, 1873313359);
        d = II(d, a, b, c, m[i + 15], 10, -30611744);
        c = II(c, d, a, b, m[i + 6], 15, -1560198380);
        b = II(b, c, d, a, m[i + 13], 21, 1309151649);
        a = II(a, b, c, d, m[i + 4], 6, -145523070);
        d = II(d, a, b, c, m[i + 11], 10, -1120210379);
        c = II(c, d, a, b, m[i + 2], 15, 718787259);
        b = II(b, c, d, a, m[i + 9], 21, -343485551);
        a = a + aa >>> 0;
        b = b + bb >>> 0;
        c = c + cc >>> 0;
        d = d + dd >>> 0;
      }
      return crypt$1.endian([a, b, c, d]);
    };
    md52._ff = function(a, b, c, d, x, s, t2) {
      var n = a + (b & c | ~b & d) + (x >>> 0) + t2;
      return (n << s | n >>> 32 - s) + b;
    };
    md52._gg = function(a, b, c, d, x, s, t2) {
      var n = a + (b & d | c & ~d) + (x >>> 0) + t2;
      return (n << s | n >>> 32 - s) + b;
    };
    md52._hh = function(a, b, c, d, x, s, t2) {
      var n = a + (b ^ c ^ d) + (x >>> 0) + t2;
      return (n << s | n >>> 32 - s) + b;
    };
    md52._ii = function(a, b, c, d, x, s, t2) {
      var n = a + (c ^ (b | ~d)) + (x >>> 0) + t2;
      return (n << s | n >>> 32 - s) + b;
    };
    md52._blocksize = 16;
    md52._digestsize = 16;
    md5$1.exports = function(message, options) {
      if (message === void 0 || message === null)
        throw new Error("Illegal argument " + message);
      var digestbytes = crypt$1.wordsToBytes(md52(message, options));
      return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt$1.bytesToHex(digestbytes);
    };
  })();
  var md5 = md5$1.exports;
  var Typr = {};
  Typr.parse = function(buff) {
    var bin = Typr._bin;
    var data = new Uint8Array(buff);
    var offset = 0;
    bin.readFixed(data, offset);
    offset += 4;
    var numTables = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    var tags = ["cmap", "head", "hhea", "maxp", "hmtx", "name", "OS/2", "post", "loca", "glyf", "kern", "CFF ", "GPOS", "GSUB", "SVG "];
    var obj = { _data: data };
    var tabs = {};
    for (var i = 0; i < numTables; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      bin.readUint(data, offset);
      offset += 4;
      var toffset = bin.readUint(data, offset);
      offset += 4;
      var length = bin.readUint(data, offset);
      offset += 4;
      tabs[tag] = { offset: toffset, length };
    }
    for (var i = 0; i < tags.length; i++) {
      var t2 = tags[i];
      if (tabs[t2])
        obj[t2.trim()] = Typr[t2.trim()].parse(data, tabs[t2].offset, tabs[t2].length, obj);
    }
    return obj;
  };
  Typr._tabOffset = function(data, tab) {
    var bin = Typr._bin;
    var numTables = bin.readUshort(data, 4);
    var offset = 12;
    for (var i = 0; i < numTables; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      bin.readUint(data, offset);
      offset += 4;
      var toffset = bin.readUint(data, offset);
      offset += 4;
      bin.readUint(data, offset);
      offset += 4;
      if (tag == tab)
        return toffset;
    }
    return 0;
  };
  Typr._bin = { readFixed: function(data, o) {
    return (data[o] << 8 | data[o + 1]) + (data[o + 2] << 8 | data[o + 3]) / (256 * 256 + 4);
  }, readF2dot14: function(data, o) {
    var num = Typr._bin.readShort(data, o);
    return num / 16384;
  }, readInt: function(buff, p) {
    var a = Typr._bin.t.uint8;
    a[0] = buff[p + 3];
    a[1] = buff[p + 2];
    a[2] = buff[p + 1];
    a[3] = buff[p];
    return Typr._bin.t.int32[0];
  }, readInt8: function(buff, p) {
    var a = Typr._bin.t.uint8;
    a[0] = buff[p];
    return Typr._bin.t.int8[0];
  }, readShort: function(buff, p) {
    var a = Typr._bin.t.uint8;
    a[1] = buff[p];
    a[0] = buff[p + 1];
    return Typr._bin.t.int16[0];
  }, readUshort: function(buff, p) {
    return buff[p] << 8 | buff[p + 1];
  }, readUshorts: function(buff, p, len) {
    var arr = [];
    for (var i = 0; i < len; i++)
      arr.push(Typr._bin.readUshort(buff, p + i * 2));
    return arr;
  }, readUint: function(buff, p) {
    var a = Typr._bin.t.uint8;
    a[3] = buff[p];
    a[2] = buff[p + 1];
    a[1] = buff[p + 2];
    a[0] = buff[p + 3];
    return Typr._bin.t.uint32[0];
  }, readUint64: function(buff, p) {
    return Typr._bin.readUint(buff, p) * (4294967295 + 1) + Typr._bin.readUint(buff, p + 4);
  }, readASCII: function(buff, p, l) {
    var s = "";
    for (var i = 0; i < l; i++)
      s += String.fromCharCode(buff[p + i]);
    return s;
  }, readUnicode: function(buff, p, l) {
    var s = "";
    for (var i = 0; i < l; i++) {
      var c = buff[p++] << 8 | buff[p++];
      s += String.fromCharCode(c);
    }
    return s;
  }, _tdec: window["TextDecoder"] ? new window["TextDecoder"]() : null, readUTF8: function(buff, p, l) {
    var tdec = Typr._bin._tdec;
    if (tdec && p == 0 && l == buff.length)
      return tdec["decode"](buff);
    return Typr._bin.readASCII(buff, p, l);
  }, readBytes: function(buff, p, l) {
    var arr = [];
    for (var i = 0; i < l; i++)
      arr.push(buff[p + i]);
    return arr;
  }, readASCIIArray: function(buff, p, l) {
    var s = [];
    for (var i = 0; i < l; i++)
      s.push(String.fromCharCode(buff[p + i]));
    return s;
  } };
  Typr._bin.t = { buff: new ArrayBuffer(8) };
  Typr._bin.t.int8 = new Int8Array(Typr._bin.t.buff);
  Typr._bin.t.uint8 = new Uint8Array(Typr._bin.t.buff);
  Typr._bin.t.int16 = new Int16Array(Typr._bin.t.buff);
  Typr._bin.t.uint16 = new Uint16Array(Typr._bin.t.buff);
  Typr._bin.t.int32 = new Int32Array(Typr._bin.t.buff);
  Typr._bin.t.uint32 = new Uint32Array(Typr._bin.t.buff);
  Typr._lctf = {};
  Typr._lctf.parse = function(data, offset, length, font, subt) {
    var bin = Typr._bin;
    var obj = {};
    var offset0 = offset;
    bin.readFixed(data, offset);
    offset += 4;
    var offScriptList = bin.readUshort(data, offset);
    offset += 2;
    var offFeatureList = bin.readUshort(data, offset);
    offset += 2;
    var offLookupList = bin.readUshort(data, offset);
    offset += 2;
    obj.scriptList = Typr._lctf.readScriptList(data, offset0 + offScriptList);
    obj.featureList = Typr._lctf.readFeatureList(data, offset0 + offFeatureList);
    obj.lookupList = Typr._lctf.readLookupList(data, offset0 + offLookupList, subt);
    return obj;
  };
  Typr._lctf.readLookupList = function(data, offset, subt) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = [];
    var count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var noff = bin.readUshort(data, offset);
      offset += 2;
      var lut = Typr._lctf.readLookupTable(data, offset0 + noff, subt);
      obj.push(lut);
    }
    return obj;
  };
  Typr._lctf.readLookupTable = function(data, offset, subt) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = { tabs: [] };
    obj.ltype = bin.readUshort(data, offset);
    offset += 2;
    obj.flag = bin.readUshort(data, offset);
    offset += 2;
    var cnt = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < cnt; i++) {
      var noff = bin.readUshort(data, offset);
      offset += 2;
      var tab = subt(data, obj.ltype, offset0 + noff);
      obj.tabs.push(tab);
    }
    return obj;
  };
  Typr._lctf.numOfOnes = function(n) {
    var num = 0;
    for (var i = 0; i < 32; i++)
      if ((n >>> i & 1) != 0)
        num++;
    return num;
  };
  Typr._lctf.readClassDef = function(data, offset) {
    var bin = Typr._bin;
    var obj = [];
    var format = bin.readUshort(data, offset);
    offset += 2;
    if (format == 1) {
      var startGlyph = bin.readUshort(data, offset);
      offset += 2;
      var glyphCount = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < glyphCount; i++) {
        obj.push(startGlyph + i);
        obj.push(startGlyph + i);
        obj.push(bin.readUshort(data, offset));
        offset += 2;
      }
    }
    if (format == 2) {
      var count = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < count; i++) {
        obj.push(bin.readUshort(data, offset));
        offset += 2;
        obj.push(bin.readUshort(data, offset));
        offset += 2;
        obj.push(bin.readUshort(data, offset));
        offset += 2;
      }
    }
    return obj;
  };
  Typr._lctf.getInterval = function(tab, val) {
    for (var i = 0; i < tab.length; i += 3) {
      var start2 = tab[i], end = tab[i + 1];
      tab[i + 2];
      if (start2 <= val && val <= end)
        return i;
    }
    return -1;
  };
  Typr._lctf.readValueRecord = function(data, offset, valFmt) {
    var bin = Typr._bin;
    var arr = [];
    arr.push(valFmt & 1 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 1 ? 2 : 0;
    arr.push(valFmt & 2 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 2 ? 2 : 0;
    arr.push(valFmt & 4 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 4 ? 2 : 0;
    arr.push(valFmt & 8 ? bin.readShort(data, offset) : 0);
    offset += valFmt & 8 ? 2 : 0;
    return arr;
  };
  Typr._lctf.readCoverage = function(data, offset) {
    var bin = Typr._bin;
    var cvg = {};
    cvg.fmt = bin.readUshort(data, offset);
    offset += 2;
    var count = bin.readUshort(data, offset);
    offset += 2;
    if (cvg.fmt == 1)
      cvg.tab = bin.readUshorts(data, offset, count);
    if (cvg.fmt == 2)
      cvg.tab = bin.readUshorts(data, offset, count * 3);
    return cvg;
  };
  Typr._lctf.coverageIndex = function(cvg, val) {
    var tab = cvg.tab;
    if (cvg.fmt == 1)
      return tab.indexOf(val);
    if (cvg.fmt == 2) {
      var ind = Typr._lctf.getInterval(tab, val);
      if (ind != -1)
        return tab[ind + 2] + (val - tab[ind]);
    }
    return -1;
  };
  Typr._lctf.readFeatureList = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = [];
    var count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var noff = bin.readUshort(data, offset);
      offset += 2;
      obj.push({ tag: tag.trim(), tab: Typr._lctf.readFeatureTable(data, offset0 + noff) });
    }
    return obj;
  };
  Typr._lctf.readFeatureTable = function(data, offset) {
    var bin = Typr._bin;
    bin.readUshort(data, offset);
    offset += 2;
    var lookupCount = bin.readUshort(data, offset);
    offset += 2;
    var indices = [];
    for (var i = 0; i < lookupCount; i++)
      indices.push(bin.readUshort(data, offset + 2 * i));
    return indices;
  };
  Typr._lctf.readScriptList = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    var count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var noff = bin.readUshort(data, offset);
      offset += 2;
      obj[tag.trim()] = Typr._lctf.readScriptTable(data, offset0 + noff);
    }
    return obj;
  };
  Typr._lctf.readScriptTable = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    var defLangSysOff = bin.readUshort(data, offset);
    offset += 2;
    obj.default = Typr._lctf.readLangSysTable(data, offset0 + defLangSysOff);
    var langSysCount = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < langSysCount; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var langSysOff = bin.readUshort(data, offset);
      offset += 2;
      obj[tag.trim()] = Typr._lctf.readLangSysTable(data, offset0 + langSysOff);
    }
    return obj;
  };
  Typr._lctf.readLangSysTable = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    bin.readUshort(data, offset);
    offset += 2;
    obj.reqFeature = bin.readUshort(data, offset);
    offset += 2;
    var featureCount = bin.readUshort(data, offset);
    offset += 2;
    obj.features = bin.readUshorts(data, offset, featureCount);
    return obj;
  };
  Typr.CFF = {};
  Typr.CFF.parse = function(data, offset, length) {
    var bin = Typr._bin;
    data = new Uint8Array(data.buffer, offset, length);
    offset = 0;
    data[offset];
    offset++;
    data[offset];
    offset++;
    data[offset];
    offset++;
    data[offset];
    offset++;
    var ninds = [];
    offset = Typr.CFF.readIndex(data, offset, ninds);
    var names = [];
    for (var i = 0; i < ninds.length - 1; i++)
      names.push(bin.readASCII(data, offset + ninds[i], ninds[i + 1] - ninds[i]));
    offset += ninds[ninds.length - 1];
    var tdinds = [];
    offset = Typr.CFF.readIndex(data, offset, tdinds);
    var topDicts = [];
    for (var i = 0; i < tdinds.length - 1; i++)
      topDicts.push(Typr.CFF.readDict(data, offset + tdinds[i], offset + tdinds[i + 1]));
    offset += tdinds[tdinds.length - 1];
    var topdict = topDicts[0];
    var sinds = [];
    offset = Typr.CFF.readIndex(data, offset, sinds);
    var strings = [];
    for (var i = 0; i < sinds.length - 1; i++)
      strings.push(bin.readASCII(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
    offset += sinds[sinds.length - 1];
    Typr.CFF.readSubrs(data, offset, topdict);
    if (topdict.CharStrings) {
      offset = topdict.CharStrings;
      var sinds = [];
      offset = Typr.CFF.readIndex(data, offset, sinds);
      var cstr = [];
      for (var i = 0; i < sinds.length - 1; i++)
        cstr.push(bin.readBytes(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
      topdict.CharStrings = cstr;
    }
    if (topdict.Encoding)
      topdict.Encoding = Typr.CFF.readEncoding(data, topdict.Encoding, topdict.CharStrings.length);
    if (topdict.charset)
      topdict.charset = Typr.CFF.readCharset(data, topdict.charset, topdict.CharStrings.length);
    if (topdict.Private) {
      offset = topdict.Private[1];
      topdict.Private = Typr.CFF.readDict(data, offset, offset + topdict.Private[0]);
      if (topdict.Private.Subrs)
        Typr.CFF.readSubrs(data, offset + topdict.Private.Subrs, topdict.Private);
    }
    var obj = {};
    for (var p in topdict) {
      if (["FamilyName", "FullName", "Notice", "version", "Copyright"].indexOf(p) != -1)
        obj[p] = strings[topdict[p] - 426 + 35];
      else
        obj[p] = topdict[p];
    }
    return obj;
  };
  Typr.CFF.readSubrs = function(data, offset, obj) {
    var bin = Typr._bin;
    var gsubinds = [];
    offset = Typr.CFF.readIndex(data, offset, gsubinds);
    var bias, nSubrs = gsubinds.length;
    if (nSubrs < 1240)
      bias = 107;
    else if (nSubrs < 33900)
      bias = 1131;
    else
      bias = 32768;
    obj.Bias = bias;
    obj.Subrs = [];
    for (var i = 0; i < gsubinds.length - 1; i++)
      obj.Subrs.push(bin.readBytes(data, offset + gsubinds[i], gsubinds[i + 1] - gsubinds[i]));
  };
  Typr.CFF.tableSE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 0, 111, 112, 113, 114, 0, 115, 116, 117, 118, 119, 120, 121, 122, 0, 123, 0, 124, 125, 126, 127, 128, 129, 130, 131, 0, 132, 133, 0, 134, 135, 136, 137, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 138, 0, 139, 0, 0, 0, 0, 140, 141, 142, 143, 0, 0, 0, 0, 0, 144, 0, 0, 0, 145, 0, 0, 146, 147, 148, 149, 0, 0, 0, 0];
  Typr.CFF.glyphByUnicode = function(cff, code) {
    for (var i = 0; i < cff.charset.length; i++)
      if (cff.charset[i] == code)
        return i;
    return -1;
  };
  Typr.CFF.glyphBySE = function(cff, charcode) {
    if (charcode < 0 || charcode > 255)
      return -1;
    return Typr.CFF.glyphByUnicode(cff, Typr.CFF.tableSE[charcode]);
  };
  Typr.CFF.readEncoding = function(data, offset, num) {
    Typr._bin;
    var array = [".notdef"];
    var format = data[offset];
    offset++;
    if (format == 0) {
      var nCodes = data[offset];
      offset++;
      for (var i = 0; i < nCodes; i++)
        array.push(data[offset + i]);
    } else
      throw "error: unknown encoding format: " + format;
    return array;
  };
  Typr.CFF.readCharset = function(data, offset, num) {
    var bin = Typr._bin;
    var charset = [".notdef"];
    var format = data[offset];
    offset++;
    if (format == 0) {
      for (var i = 0; i < num; i++) {
        var first = bin.readUshort(data, offset);
        offset += 2;
        charset.push(first);
      }
    } else if (format == 1 || format == 2) {
      while (charset.length < num) {
        var first = bin.readUshort(data, offset);
        offset += 2;
        var nLeft = 0;
        if (format == 1) {
          nLeft = data[offset];
          offset++;
        } else {
          nLeft = bin.readUshort(data, offset);
          offset += 2;
        }
        for (var i = 0; i <= nLeft; i++) {
          charset.push(first);
          first++;
        }
      }
    } else
      throw "error: format: " + format;
    return charset;
  };
  Typr.CFF.readIndex = function(data, offset, inds) {
    var bin = Typr._bin;
    var count = bin.readUshort(data, offset);
    offset += 2;
    var offsize = data[offset];
    offset++;
    if (offsize == 1)
      for (var i = 0; i < count + 1; i++)
        inds.push(data[offset + i]);
    else if (offsize == 2)
      for (var i = 0; i < count + 1; i++)
        inds.push(bin.readUshort(data, offset + i * 2));
    else if (offsize == 3)
      for (var i = 0; i < count + 1; i++)
        inds.push(bin.readUint(data, offset + i * 3 - 1) & 16777215);
    else if (count != 0)
      throw "unsupported offset size: " + offsize + ", count: " + count;
    offset += (count + 1) * offsize;
    return offset - 1;
  };
  Typr.CFF.getCharString = function(data, offset, o) {
    var bin = Typr._bin;
    var b0 = data[offset], b1 = data[offset + 1];
    data[offset + 2];
    data[offset + 3];
    data[offset + 4];
    var vs = 1;
    var op = null, val = null;
    if (b0 <= 20) {
      op = b0;
      vs = 1;
    }
    if (b0 == 12) {
      op = b0 * 100 + b1;
      vs = 2;
    }
    if (21 <= b0 && b0 <= 27) {
      op = b0;
      vs = 1;
    }
    if (b0 == 28) {
      val = bin.readShort(data, offset + 1);
      vs = 3;
    }
    if (29 <= b0 && b0 <= 31) {
      op = b0;
      vs = 1;
    }
    if (32 <= b0 && b0 <= 246) {
      val = b0 - 139;
      vs = 1;
    }
    if (247 <= b0 && b0 <= 250) {
      val = (b0 - 247) * 256 + b1 + 108;
      vs = 2;
    }
    if (251 <= b0 && b0 <= 254) {
      val = -(b0 - 251) * 256 - b1 - 108;
      vs = 2;
    }
    if (b0 == 255) {
      val = bin.readInt(data, offset + 1) / 65535;
      vs = 5;
    }
    o.val = val != null ? val : "o" + op;
    o.size = vs;
  };
  Typr.CFF.readCharString = function(data, offset, length) {
    var end = offset + length;
    var bin = Typr._bin;
    var arr = [];
    while (offset < end) {
      var b0 = data[offset], b1 = data[offset + 1];
      data[offset + 2];
      data[offset + 3];
      data[offset + 4];
      var vs = 1;
      var op = null, val = null;
      if (b0 <= 20) {
        op = b0;
        vs = 1;
      }
      if (b0 == 12) {
        op = b0 * 100 + b1;
        vs = 2;
      }
      if (b0 == 19 || b0 == 20) {
        op = b0;
        vs = 2;
      }
      if (21 <= b0 && b0 <= 27) {
        op = b0;
        vs = 1;
      }
      if (b0 == 28) {
        val = bin.readShort(data, offset + 1);
        vs = 3;
      }
      if (29 <= b0 && b0 <= 31) {
        op = b0;
        vs = 1;
      }
      if (32 <= b0 && b0 <= 246) {
        val = b0 - 139;
        vs = 1;
      }
      if (247 <= b0 && b0 <= 250) {
        val = (b0 - 247) * 256 + b1 + 108;
        vs = 2;
      }
      if (251 <= b0 && b0 <= 254) {
        val = -(b0 - 251) * 256 - b1 - 108;
        vs = 2;
      }
      if (b0 == 255) {
        val = bin.readInt(data, offset + 1) / 65535;
        vs = 5;
      }
      arr.push(val != null ? val : "o" + op);
      offset += vs;
    }
    return arr;
  };
  Typr.CFF.readDict = function(data, offset, end) {
    var bin = Typr._bin;
    var dict = {};
    var carr = [];
    while (offset < end) {
      var b0 = data[offset], b1 = data[offset + 1];
      data[offset + 2];
      data[offset + 3];
      data[offset + 4];
      var vs = 1;
      var key = null, val = null;
      if (b0 == 28) {
        val = bin.readShort(data, offset + 1);
        vs = 3;
      }
      if (b0 == 29) {
        val = bin.readInt(data, offset + 1);
        vs = 5;
      }
      if (32 <= b0 && b0 <= 246) {
        val = b0 - 139;
        vs = 1;
      }
      if (247 <= b0 && b0 <= 250) {
        val = (b0 - 247) * 256 + b1 + 108;
        vs = 2;
      }
      if (251 <= b0 && b0 <= 254) {
        val = -(b0 - 251) * 256 - b1 - 108;
        vs = 2;
      }
      if (b0 == 255) {
        val = bin.readInt(data, offset + 1) / 65535;
        vs = 5;
        throw "unknown number";
      }
      if (b0 == 30) {
        var nibs = [];
        vs = 1;
        while (true) {
          var b = data[offset + vs];
          vs++;
          var nib0 = b >> 4, nib1 = b & 15;
          if (nib0 != 15)
            nibs.push(nib0);
          if (nib1 != 15)
            nibs.push(nib1);
          if (nib1 == 15)
            break;
        }
        var s = "";
        var chars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ".", "e", "e-", "reserved", "-", "endOfNumber"];
        for (var i = 0; i < nibs.length; i++)
          s += chars[nibs[i]];
        val = parseFloat(s);
      }
      if (b0 <= 21) {
        var keys = ["version", "Notice", "FullName", "FamilyName", "Weight", "FontBBox", "BlueValues", "OtherBlues", "FamilyBlues", "FamilyOtherBlues", "StdHW", "StdVW", "escape", "UniqueID", "XUID", "charset", "Encoding", "CharStrings", "Private", "Subrs", "defaultWidthX", "nominalWidthX"];
        key = keys[b0];
        vs = 1;
        if (b0 == 12) {
          var keys = ["Copyright", "isFixedPitch", "ItalicAngle", "UnderlinePosition", "UnderlineThickness", "PaintType", "CharstringType", "FontMatrix", "StrokeWidth", "BlueScale", "BlueShift", "BlueFuzz", "StemSnapH", "StemSnapV", "ForceBold", 0, 0, "LanguageGroup", "ExpansionFactor", "initialRandomSeed", "SyntheticBase", "PostScript", "BaseFontName", "BaseFontBlend", 0, 0, 0, 0, 0, 0, "ROS", "CIDFontVersion", "CIDFontRevision", "CIDFontType", "CIDCount", "UIDBase", "FDArray", "FDSelect", "FontName"];
          key = keys[b1];
          vs = 2;
        }
      }
      if (key != null) {
        dict[key] = carr.length == 1 ? carr[0] : carr;
        carr = [];
      } else
        carr.push(val);
      offset += vs;
    }
    return dict;
  };
  Typr.cmap = {};
  Typr.cmap.parse = function(data, offset, length) {
    data = new Uint8Array(data.buffer, offset, length);
    offset = 0;
    var bin = Typr._bin;
    var obj = {};
    bin.readUshort(data, offset);
    offset += 2;
    var numTables = bin.readUshort(data, offset);
    offset += 2;
    var offs = [];
    obj.tables = [];
    for (var i = 0; i < numTables; i++) {
      var platformID = bin.readUshort(data, offset);
      offset += 2;
      var encodingID = bin.readUshort(data, offset);
      offset += 2;
      var noffset = bin.readUint(data, offset);
      offset += 4;
      var id = "p" + platformID + "e" + encodingID;
      var tind = offs.indexOf(noffset);
      if (tind == -1) {
        tind = obj.tables.length;
        var subt;
        offs.push(noffset);
        var format = bin.readUshort(data, noffset);
        if (format == 0)
          subt = Typr.cmap.parse0(data, noffset);
        else if (format == 4)
          subt = Typr.cmap.parse4(data, noffset);
        else if (format == 6)
          subt = Typr.cmap.parse6(data, noffset);
        else if (format == 12)
          subt = Typr.cmap.parse12(data, noffset);
        else
          console.log("unknown format: " + format, platformID, encodingID, noffset);
        obj.tables.push(subt);
      }
      if (obj[id] != null)
        throw "multiple tables for one platform+encoding";
      obj[id] = tind;
    }
    return obj;
  };
  Typr.cmap.parse0 = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    var len = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    obj.map = [];
    for (var i = 0; i < len - 6; i++)
      obj.map.push(data[offset + i]);
    return obj;
  };
  Typr.cmap.parse4 = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    var length = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    var segCountX2 = bin.readUshort(data, offset);
    offset += 2;
    var segCount = segCountX2 / 2;
    obj.searchRange = bin.readUshort(data, offset);
    offset += 2;
    obj.entrySelector = bin.readUshort(data, offset);
    offset += 2;
    obj.rangeShift = bin.readUshort(data, offset);
    offset += 2;
    obj.endCount = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    offset += 2;
    obj.startCount = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    obj.idDelta = [];
    for (var i = 0; i < segCount; i++) {
      obj.idDelta.push(bin.readShort(data, offset));
      offset += 2;
    }
    obj.idRangeOffset = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    obj.glyphIdArray = [];
    while (offset < offset0 + length) {
      obj.glyphIdArray.push(bin.readUshort(data, offset));
      offset += 2;
    }
    return obj;
  };
  Typr.cmap.parse6 = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    obj.firstCode = bin.readUshort(data, offset);
    offset += 2;
    var entryCount = bin.readUshort(data, offset);
    offset += 2;
    obj.glyphIdArray = [];
    for (var i = 0; i < entryCount; i++) {
      obj.glyphIdArray.push(bin.readUshort(data, offset));
      offset += 2;
    }
    return obj;
  };
  Typr.cmap.parse12 = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    obj.format = bin.readUshort(data, offset);
    offset += 2;
    offset += 2;
    bin.readUint(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    var nGroups = bin.readUint(data, offset);
    offset += 4;
    obj.groups = [];
    for (var i = 0; i < nGroups; i++) {
      var off = offset + i * 12;
      var startCharCode = bin.readUint(data, off + 0);
      var endCharCode = bin.readUint(data, off + 4);
      var startGlyphID = bin.readUint(data, off + 8);
      obj.groups.push([startCharCode, endCharCode, startGlyphID]);
    }
    return obj;
  };
  Typr.glyf = {};
  Typr.glyf.parse = function(data, offset, length, font) {
    var obj = [];
    for (var g = 0; g < font.maxp.numGlyphs; g++)
      obj.push(null);
    return obj;
  };
  Typr.glyf._parseGlyf = function(font, g) {
    var bin = Typr._bin;
    var data = font._data;
    var offset = Typr._tabOffset(data, "glyf") + font.loca[g];
    if (font.loca[g] == font.loca[g + 1])
      return null;
    var gl = {};
    gl.noc = bin.readShort(data, offset);
    offset += 2;
    gl.xMin = bin.readShort(data, offset);
    offset += 2;
    gl.yMin = bin.readShort(data, offset);
    offset += 2;
    gl.xMax = bin.readShort(data, offset);
    offset += 2;
    gl.yMax = bin.readShort(data, offset);
    offset += 2;
    if (gl.xMin >= gl.xMax || gl.yMin >= gl.yMax)
      return null;
    if (gl.noc > 0) {
      gl.endPts = [];
      for (var i = 0; i < gl.noc; i++) {
        gl.endPts.push(bin.readUshort(data, offset));
        offset += 2;
      }
      var instructionLength = bin.readUshort(data, offset);
      offset += 2;
      if (data.length - offset < instructionLength)
        return null;
      gl.instructions = bin.readBytes(data, offset, instructionLength);
      offset += instructionLength;
      var crdnum = gl.endPts[gl.noc - 1] + 1;
      gl.flags = [];
      for (var i = 0; i < crdnum; i++) {
        var flag = data[offset];
        offset++;
        gl.flags.push(flag);
        if ((flag & 8) != 0) {
          var rep = data[offset];
          offset++;
          for (var j = 0; j < rep; j++) {
            gl.flags.push(flag);
            i++;
          }
        }
      }
      gl.xs = [];
      for (var i = 0; i < crdnum; i++) {
        var i8 = (gl.flags[i] & 2) != 0, same = (gl.flags[i] & 16) != 0;
        if (i8) {
          gl.xs.push(same ? data[offset] : -data[offset]);
          offset++;
        } else {
          if (same)
            gl.xs.push(0);
          else {
            gl.xs.push(bin.readShort(data, offset));
            offset += 2;
          }
        }
      }
      gl.ys = [];
      for (var i = 0; i < crdnum; i++) {
        var i8 = (gl.flags[i] & 4) != 0, same = (gl.flags[i] & 32) != 0;
        if (i8) {
          gl.ys.push(same ? data[offset] : -data[offset]);
          offset++;
        } else {
          if (same)
            gl.ys.push(0);
          else {
            gl.ys.push(bin.readShort(data, offset));
            offset += 2;
          }
        }
      }
      var x = 0, y = 0;
      for (var i = 0; i < crdnum; i++) {
        x += gl.xs[i];
        y += gl.ys[i];
        gl.xs[i] = x;
        gl.ys[i] = y;
      }
    } else {
      var ARG_1_AND_2_ARE_WORDS = 1 << 0;
      var ARGS_ARE_XY_VALUES = 1 << 1;
      var WE_HAVE_A_SCALE = 1 << 3;
      var MORE_COMPONENTS = 1 << 5;
      var WE_HAVE_AN_X_AND_Y_SCALE = 1 << 6;
      var WE_HAVE_A_TWO_BY_TWO = 1 << 7;
      var WE_HAVE_INSTRUCTIONS = 1 << 8;
      gl.parts = [];
      var flags;
      do {
        flags = bin.readUshort(data, offset);
        offset += 2;
        var part = { m: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, p1: -1, p2: -1 };
        gl.parts.push(part);
        part.glyphIndex = bin.readUshort(data, offset);
        offset += 2;
        if (flags & ARG_1_AND_2_ARE_WORDS) {
          var arg1 = bin.readShort(data, offset);
          offset += 2;
          var arg2 = bin.readShort(data, offset);
          offset += 2;
        } else {
          var arg1 = bin.readInt8(data, offset);
          offset++;
          var arg2 = bin.readInt8(data, offset);
          offset++;
        }
        if (flags & ARGS_ARE_XY_VALUES) {
          part.m.tx = arg1;
          part.m.ty = arg2;
        } else {
          part.p1 = arg1;
          part.p2 = arg2;
        }
        if (flags & WE_HAVE_A_SCALE) {
          part.m.a = part.m.d = bin.readF2dot14(data, offset);
          offset += 2;
        } else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
          part.m.a = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.d = bin.readF2dot14(data, offset);
          offset += 2;
        } else if (flags & WE_HAVE_A_TWO_BY_TWO) {
          part.m.a = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.b = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.c = bin.readF2dot14(data, offset);
          offset += 2;
          part.m.d = bin.readF2dot14(data, offset);
          offset += 2;
        }
      } while (flags & MORE_COMPONENTS);
      if (flags & WE_HAVE_INSTRUCTIONS) {
        var numInstr = bin.readUshort(data, offset);
        offset += 2;
        gl.instr = [];
        for (var i = 0; i < numInstr; i++) {
          gl.instr.push(data[offset]);
          offset++;
        }
      }
    }
    return gl;
  };
  Typr.GPOS = {};
  Typr.GPOS.parse = function(data, offset, length, font) {
    return Typr._lctf.parse(data, offset, length, font, Typr.GPOS.subt);
  };
  Typr.GPOS.subt = function(data, ltype, offset) {
    if (ltype != 2)
      return null;
    var bin = Typr._bin, offset0 = offset, tab = {};
    tab.format = bin.readUshort(data, offset);
    offset += 2;
    var covOff = bin.readUshort(data, offset);
    offset += 2;
    tab.coverage = Typr._lctf.readCoverage(data, covOff + offset0);
    tab.valFmt1 = bin.readUshort(data, offset);
    offset += 2;
    tab.valFmt2 = bin.readUshort(data, offset);
    offset += 2;
    var ones1 = Typr._lctf.numOfOnes(tab.valFmt1);
    var ones2 = Typr._lctf.numOfOnes(tab.valFmt2);
    if (tab.format == 1) {
      tab.pairsets = [];
      var count = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < count; i++) {
        var psoff = bin.readUshort(data, offset);
        offset += 2;
        psoff += offset0;
        var pvcount = bin.readUshort(data, psoff);
        psoff += 2;
        var arr = [];
        for (var j = 0; j < pvcount; j++) {
          var gid2 = bin.readUshort(data, psoff);
          psoff += 2;
          var value1, value2;
          if (tab.valFmt1 != 0) {
            value1 = Typr._lctf.readValueRecord(data, psoff, tab.valFmt1);
            psoff += ones1 * 2;
          }
          if (tab.valFmt2 != 0) {
            value2 = Typr._lctf.readValueRecord(data, psoff, tab.valFmt2);
            psoff += ones2 * 2;
          }
          arr.push({ gid2, val1: value1, val2: value2 });
        }
        tab.pairsets.push(arr);
      }
    }
    if (tab.format == 2) {
      var classDef1 = bin.readUshort(data, offset);
      offset += 2;
      var classDef2 = bin.readUshort(data, offset);
      offset += 2;
      var class1Count = bin.readUshort(data, offset);
      offset += 2;
      var class2Count = bin.readUshort(data, offset);
      offset += 2;
      tab.classDef1 = Typr._lctf.readClassDef(data, offset0 + classDef1);
      tab.classDef2 = Typr._lctf.readClassDef(data, offset0 + classDef2);
      tab.matrix = [];
      for (var i = 0; i < class1Count; i++) {
        var row = [];
        for (var j = 0; j < class2Count; j++) {
          var value1 = null, value2 = null;
          if (tab.valFmt1 != 0) {
            value1 = Typr._lctf.readValueRecord(data, offset, tab.valFmt1);
            offset += ones1 * 2;
          }
          if (tab.valFmt2 != 0) {
            value2 = Typr._lctf.readValueRecord(data, offset, tab.valFmt2);
            offset += ones2 * 2;
          }
          row.push({ val1: value1, val2: value2 });
        }
        tab.matrix.push(row);
      }
    }
    return tab;
  };
  Typr.GSUB = {};
  Typr.GSUB.parse = function(data, offset, length, font) {
    return Typr._lctf.parse(data, offset, length, font, Typr.GSUB.subt);
  };
  Typr.GSUB.subt = function(data, ltype, offset) {
    var bin = Typr._bin, offset0 = offset, tab = {};
    if (ltype != 1 && ltype != 4 && ltype != 5)
      return null;
    tab.fmt = bin.readUshort(data, offset);
    offset += 2;
    var covOff = bin.readUshort(data, offset);
    offset += 2;
    tab.coverage = Typr._lctf.readCoverage(data, covOff + offset0);
    if (ltype == 1) {
      if (tab.fmt == 1) {
        tab.delta = bin.readShort(data, offset);
        offset += 2;
      } else if (tab.fmt == 2) {
        var cnt = bin.readUshort(data, offset);
        offset += 2;
        tab.newg = bin.readUshorts(data, offset, cnt);
        offset += tab.newg.length * 2;
      }
    } else if (ltype == 4) {
      tab.vals = [];
      var cnt = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < cnt; i++) {
        var loff = bin.readUshort(data, offset);
        offset += 2;
        tab.vals.push(Typr.GSUB.readLigatureSet(data, offset0 + loff));
      }
    } else if (ltype == 5) {
      if (tab.fmt == 2) {
        var cDefOffset = bin.readUshort(data, offset);
        offset += 2;
        tab.cDef = Typr._lctf.readClassDef(data, offset0 + cDefOffset);
        tab.scset = [];
        var subClassSetCount = bin.readUshort(data, offset);
        offset += 2;
        for (var i = 0; i < subClassSetCount; i++) {
          var scsOff = bin.readUshort(data, offset);
          offset += 2;
          tab.scset.push(scsOff == 0 ? null : Typr.GSUB.readSubClassSet(data, offset0 + scsOff));
        }
      } else
        console.log("unknown table format", tab.fmt);
    }
    return tab;
  };
  Typr.GSUB.readSubClassSet = function(data, offset) {
    var rUs = Typr._bin.readUshort, offset0 = offset, lset = [];
    var cnt = rUs(data, offset);
    offset += 2;
    for (var i = 0; i < cnt; i++) {
      var loff = rUs(data, offset);
      offset += 2;
      lset.push(Typr.GSUB.readSubClassRule(data, offset0 + loff));
    }
    return lset;
  };
  Typr.GSUB.readSubClassRule = function(data, offset) {
    var rUs = Typr._bin.readUshort, rule = {};
    var gcount = rUs(data, offset);
    offset += 2;
    var scount = rUs(data, offset);
    offset += 2;
    rule.input = [];
    for (var i = 0; i < gcount - 1; i++) {
      rule.input.push(rUs(data, offset));
      offset += 2;
    }
    rule.substLookupRecords = Typr.GSUB.readSubstLookupRecords(data, offset, scount);
    return rule;
  };
  Typr.GSUB.readSubstLookupRecords = function(data, offset, cnt) {
    var rUs = Typr._bin.readUshort;
    var out = [];
    for (var i = 0; i < cnt; i++) {
      out.push(rUs(data, offset), rUs(data, offset + 2));
      offset += 4;
    }
    return out;
  };
  Typr.GSUB.readChainSubClassSet = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, lset = [];
    var cnt = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < cnt; i++) {
      var loff = bin.readUshort(data, offset);
      offset += 2;
      lset.push(Typr.GSUB.readChainSubClassRule(data, offset0 + loff));
    }
    return lset;
  };
  Typr.GSUB.readChainSubClassRule = function(data, offset) {
    var bin = Typr._bin, rule = {};
    var pps = ["backtrack", "input", "lookahead"];
    for (var pi = 0; pi < pps.length; pi++) {
      var cnt = bin.readUshort(data, offset);
      offset += 2;
      if (pi == 1)
        cnt--;
      rule[pps[pi]] = bin.readUshorts(data, offset, cnt);
      offset += rule[pps[pi]].length * 2;
    }
    var cnt = bin.readUshort(data, offset);
    offset += 2;
    rule.subst = bin.readUshorts(data, offset, cnt * 2);
    offset += rule.subst.length * 2;
    return rule;
  };
  Typr.GSUB.readLigatureSet = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, lset = [];
    var lcnt = bin.readUshort(data, offset);
    offset += 2;
    for (var j = 0; j < lcnt; j++) {
      var loff = bin.readUshort(data, offset);
      offset += 2;
      lset.push(Typr.GSUB.readLigature(data, offset0 + loff));
    }
    return lset;
  };
  Typr.GSUB.readLigature = function(data, offset) {
    var bin = Typr._bin, lig = { chain: [] };
    lig.nglyph = bin.readUshort(data, offset);
    offset += 2;
    var ccnt = bin.readUshort(data, offset);
    offset += 2;
    for (var k = 0; k < ccnt - 1; k++) {
      lig.chain.push(bin.readUshort(data, offset));
      offset += 2;
    }
    return lig;
  };
  Typr.head = {};
  Typr.head.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    bin.readFixed(data, offset);
    offset += 4;
    obj.fontRevision = bin.readFixed(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    obj.flags = bin.readUshort(data, offset);
    offset += 2;
    obj.unitsPerEm = bin.readUshort(data, offset);
    offset += 2;
    obj.created = bin.readUint64(data, offset);
    offset += 8;
    obj.modified = bin.readUint64(data, offset);
    offset += 8;
    obj.xMin = bin.readShort(data, offset);
    offset += 2;
    obj.yMin = bin.readShort(data, offset);
    offset += 2;
    obj.xMax = bin.readShort(data, offset);
    offset += 2;
    obj.yMax = bin.readShort(data, offset);
    offset += 2;
    obj.macStyle = bin.readUshort(data, offset);
    offset += 2;
    obj.lowestRecPPEM = bin.readUshort(data, offset);
    offset += 2;
    obj.fontDirectionHint = bin.readShort(data, offset);
    offset += 2;
    obj.indexToLocFormat = bin.readShort(data, offset);
    offset += 2;
    obj.glyphDataFormat = bin.readShort(data, offset);
    offset += 2;
    return obj;
  };
  Typr.hhea = {};
  Typr.hhea.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    bin.readFixed(data, offset);
    offset += 4;
    obj.ascender = bin.readShort(data, offset);
    offset += 2;
    obj.descender = bin.readShort(data, offset);
    offset += 2;
    obj.lineGap = bin.readShort(data, offset);
    offset += 2;
    obj.advanceWidthMax = bin.readUshort(data, offset);
    offset += 2;
    obj.minLeftSideBearing = bin.readShort(data, offset);
    offset += 2;
    obj.minRightSideBearing = bin.readShort(data, offset);
    offset += 2;
    obj.xMaxExtent = bin.readShort(data, offset);
    offset += 2;
    obj.caretSlopeRise = bin.readShort(data, offset);
    offset += 2;
    obj.caretSlopeRun = bin.readShort(data, offset);
    offset += 2;
    obj.caretOffset = bin.readShort(data, offset);
    offset += 2;
    offset += 4 * 2;
    obj.metricDataFormat = bin.readShort(data, offset);
    offset += 2;
    obj.numberOfHMetrics = bin.readUshort(data, offset);
    offset += 2;
    return obj;
  };
  Typr.hmtx = {};
  Typr.hmtx.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    var obj = {};
    obj.aWidth = [];
    obj.lsBearing = [];
    var aw = 0, lsb = 0;
    for (var i = 0; i < font.maxp.numGlyphs; i++) {
      if (i < font.hhea.numberOfHMetrics) {
        aw = bin.readUshort(data, offset);
        offset += 2;
        lsb = bin.readShort(data, offset);
        offset += 2;
      }
      obj.aWidth.push(aw);
      obj.lsBearing.push(lsb);
    }
    return obj;
  };
  Typr.kern = {};
  Typr.kern.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    var version = bin.readUshort(data, offset);
    offset += 2;
    if (version == 1)
      return Typr.kern.parseV1(data, offset - 2, length, font);
    var nTables = bin.readUshort(data, offset);
    offset += 2;
    var map = { glyph1: [], rval: [] };
    for (var i = 0; i < nTables; i++) {
      offset += 2;
      var length = bin.readUshort(data, offset);
      offset += 2;
      var coverage = bin.readUshort(data, offset);
      offset += 2;
      var format = coverage >>> 8;
      format &= 15;
      if (format == 0)
        offset = Typr.kern.readFormat0(data, offset, map);
      else
        throw "unknown kern table format: " + format;
    }
    return map;
  };
  Typr.kern.parseV1 = function(data, offset, length, font) {
    var bin = Typr._bin;
    bin.readFixed(data, offset);
    offset += 4;
    var nTables = bin.readUint(data, offset);
    offset += 4;
    var map = { glyph1: [], rval: [] };
    for (var i = 0; i < nTables; i++) {
      bin.readUint(data, offset);
      offset += 4;
      var coverage = bin.readUshort(data, offset);
      offset += 2;
      bin.readUshort(data, offset);
      offset += 2;
      var format = coverage >>> 8;
      format &= 15;
      if (format == 0)
        offset = Typr.kern.readFormat0(data, offset, map);
      else
        throw "unknown kern table format: " + format;
    }
    return map;
  };
  Typr.kern.readFormat0 = function(data, offset, map) {
    var bin = Typr._bin;
    var pleft = -1;
    var nPairs = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    for (var j = 0; j < nPairs; j++) {
      var left = bin.readUshort(data, offset);
      offset += 2;
      var right = bin.readUshort(data, offset);
      offset += 2;
      var value = bin.readShort(data, offset);
      offset += 2;
      if (left != pleft) {
        map.glyph1.push(left);
        map.rval.push({ glyph2: [], vals: [] });
      }
      var rval = map.rval[map.rval.length - 1];
      rval.glyph2.push(right);
      rval.vals.push(value);
      pleft = left;
    }
    return offset;
  };
  Typr.loca = {};
  Typr.loca.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    var obj = [];
    var ver = font.head.indexToLocFormat;
    var len = font.maxp.numGlyphs + 1;
    if (ver == 0)
      for (var i = 0; i < len; i++)
        obj.push(bin.readUshort(data, offset + (i << 1)) << 1);
    if (ver == 1)
      for (var i = 0; i < len; i++)
        obj.push(bin.readUint(data, offset + (i << 2)));
    return obj;
  };
  Typr.maxp = {};
  Typr.maxp.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    var ver = bin.readUint(data, offset);
    offset += 4;
    obj.numGlyphs = bin.readUshort(data, offset);
    offset += 2;
    if (ver == 65536) {
      obj.maxPoints = bin.readUshort(data, offset);
      offset += 2;
      obj.maxContours = bin.readUshort(data, offset);
      offset += 2;
      obj.maxCompositePoints = bin.readUshort(data, offset);
      offset += 2;
      obj.maxCompositeContours = bin.readUshort(data, offset);
      offset += 2;
      obj.maxZones = bin.readUshort(data, offset);
      offset += 2;
      obj.maxTwilightPoints = bin.readUshort(data, offset);
      offset += 2;
      obj.maxStorage = bin.readUshort(data, offset);
      offset += 2;
      obj.maxFunctionDefs = bin.readUshort(data, offset);
      offset += 2;
      obj.maxInstructionDefs = bin.readUshort(data, offset);
      offset += 2;
      obj.maxStackElements = bin.readUshort(data, offset);
      offset += 2;
      obj.maxSizeOfInstructions = bin.readUshort(data, offset);
      offset += 2;
      obj.maxComponentElements = bin.readUshort(data, offset);
      offset += 2;
      obj.maxComponentDepth = bin.readUshort(data, offset);
      offset += 2;
    }
    return obj;
  };
  Typr.name = {};
  Typr.name.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    bin.readUshort(data, offset);
    offset += 2;
    var count = bin.readUshort(data, offset);
    offset += 2;
    bin.readUshort(data, offset);
    offset += 2;
    var offset0 = offset;
    for (var i = 0; i < count; i++) {
      var platformID = bin.readUshort(data, offset);
      offset += 2;
      var encodingID = bin.readUshort(data, offset);
      offset += 2;
      var languageID = bin.readUshort(data, offset);
      offset += 2;
      var nameID = bin.readUshort(data, offset);
      offset += 2;
      var length = bin.readUshort(data, offset);
      offset += 2;
      var noffset = bin.readUshort(data, offset);
      offset += 2;
      var plat = "p" + platformID;
      if (obj[plat] == null)
        obj[plat] = {};
      var names = ["copyright", "fontFamily", "fontSubfamily", "ID", "fullName", "version", "postScriptName", "trademark", "manufacturer", "designer", "description", "urlVendor", "urlDesigner", "licence", "licenceURL", "---", "typoFamilyName", "typoSubfamilyName", "compatibleFull", "sampleText", "postScriptCID", "wwsFamilyName", "wwsSubfamilyName", "lightPalette", "darkPalette"];
      var cname = names[nameID];
      var soff = offset0 + count * 12 + noffset;
      var str;
      if (platformID == 0)
        str = bin.readUnicode(data, soff, length / 2);
      else if (platformID == 3 && encodingID == 0)
        str = bin.readUnicode(data, soff, length / 2);
      else if (encodingID == 0)
        str = bin.readASCII(data, soff, length);
      else if (encodingID == 1)
        str = bin.readUnicode(data, soff, length / 2);
      else if (encodingID == 3)
        str = bin.readUnicode(data, soff, length / 2);
      else if (platformID == 1) {
        str = bin.readASCII(data, soff, length);
        console.log("reading unknown MAC encoding " + encodingID + " as ASCII");
      } else
        throw "unknown encoding " + encodingID + ", platformID: " + platformID;
      obj[plat][cname] = str;
      obj[plat]._lang = languageID;
    }
    for (var p in obj)
      if (obj[p].postScriptName != null && obj[p]._lang == 1033)
        return obj[p];
    for (var p in obj)
      if (obj[p].postScriptName != null && obj[p]._lang == 3084)
        return obj[p];
    for (var p in obj)
      if (obj[p].postScriptName != null)
        return obj[p];
    var tname;
    for (var p in obj) {
      tname = p;
      break;
    }
    console.log("returning name table with languageID " + obj[tname]._lang);
    return obj[tname];
  };
  Typr["OS/2"] = {};
  Typr["OS/2"].parse = function(data, offset, length) {
    var bin = Typr._bin;
    var ver = bin.readUshort(data, offset);
    offset += 2;
    var obj = {};
    if (ver == 0)
      Typr["OS/2"].version0(data, offset, obj);
    else if (ver == 1)
      Typr["OS/2"].version1(data, offset, obj);
    else if (ver == 2 || ver == 3 || ver == 4)
      Typr["OS/2"].version2(data, offset, obj);
    else if (ver == 5)
      Typr["OS/2"].version5(data, offset, obj);
    else
      throw "unknown OS/2 table version: " + ver;
    return obj;
  };
  Typr["OS/2"].version0 = function(data, offset, obj) {
    var bin = Typr._bin;
    obj.xAvgCharWidth = bin.readShort(data, offset);
    offset += 2;
    obj.usWeightClass = bin.readUshort(data, offset);
    offset += 2;
    obj.usWidthClass = bin.readUshort(data, offset);
    offset += 2;
    obj.fsType = bin.readUshort(data, offset);
    offset += 2;
    obj.ySubscriptXSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySubscriptYSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySubscriptXOffset = bin.readShort(data, offset);
    offset += 2;
    obj.ySubscriptYOffset = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptXSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptYSize = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptXOffset = bin.readShort(data, offset);
    offset += 2;
    obj.ySuperscriptYOffset = bin.readShort(data, offset);
    offset += 2;
    obj.yStrikeoutSize = bin.readShort(data, offset);
    offset += 2;
    obj.yStrikeoutPosition = bin.readShort(data, offset);
    offset += 2;
    obj.sFamilyClass = bin.readShort(data, offset);
    offset += 2;
    obj.panose = bin.readBytes(data, offset, 10);
    offset += 10;
    obj.ulUnicodeRange1 = bin.readUint(data, offset);
    offset += 4;
    obj.ulUnicodeRange2 = bin.readUint(data, offset);
    offset += 4;
    obj.ulUnicodeRange3 = bin.readUint(data, offset);
    offset += 4;
    obj.ulUnicodeRange4 = bin.readUint(data, offset);
    offset += 4;
    obj.achVendID = [bin.readInt8(data, offset), bin.readInt8(data, offset + 1), bin.readInt8(data, offset + 2), bin.readInt8(data, offset + 3)];
    offset += 4;
    obj.fsSelection = bin.readUshort(data, offset);
    offset += 2;
    obj.usFirstCharIndex = bin.readUshort(data, offset);
    offset += 2;
    obj.usLastCharIndex = bin.readUshort(data, offset);
    offset += 2;
    obj.sTypoAscender = bin.readShort(data, offset);
    offset += 2;
    obj.sTypoDescender = bin.readShort(data, offset);
    offset += 2;
    obj.sTypoLineGap = bin.readShort(data, offset);
    offset += 2;
    obj.usWinAscent = bin.readUshort(data, offset);
    offset += 2;
    obj.usWinDescent = bin.readUshort(data, offset);
    offset += 2;
    return offset;
  };
  Typr["OS/2"].version1 = function(data, offset, obj) {
    var bin = Typr._bin;
    offset = Typr["OS/2"].version0(data, offset, obj);
    obj.ulCodePageRange1 = bin.readUint(data, offset);
    offset += 4;
    obj.ulCodePageRange2 = bin.readUint(data, offset);
    offset += 4;
    return offset;
  };
  Typr["OS/2"].version2 = function(data, offset, obj) {
    var bin = Typr._bin;
    offset = Typr["OS/2"].version1(data, offset, obj);
    obj.sxHeight = bin.readShort(data, offset);
    offset += 2;
    obj.sCapHeight = bin.readShort(data, offset);
    offset += 2;
    obj.usDefault = bin.readUshort(data, offset);
    offset += 2;
    obj.usBreak = bin.readUshort(data, offset);
    offset += 2;
    obj.usMaxContext = bin.readUshort(data, offset);
    offset += 2;
    return offset;
  };
  Typr["OS/2"].version5 = function(data, offset, obj) {
    var bin = Typr._bin;
    offset = Typr["OS/2"].version2(data, offset, obj);
    obj.usLowerOpticalPointSize = bin.readUshort(data, offset);
    offset += 2;
    obj.usUpperOpticalPointSize = bin.readUshort(data, offset);
    offset += 2;
    return offset;
  };
  Typr.post = {};
  Typr.post.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    obj.version = bin.readFixed(data, offset);
    offset += 4;
    obj.italicAngle = bin.readFixed(data, offset);
    offset += 4;
    obj.underlinePosition = bin.readShort(data, offset);
    offset += 2;
    obj.underlineThickness = bin.readShort(data, offset);
    offset += 2;
    return obj;
  };
  Typr.SVG = {};
  Typr.SVG.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = { entries: [] };
    var offset0 = offset;
    bin.readUshort(data, offset);
    offset += 2;
    var svgDocIndexOffset = bin.readUint(data, offset);
    offset += 4;
    bin.readUint(data, offset);
    offset += 4;
    offset = svgDocIndexOffset + offset0;
    var numEntries = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < numEntries; i++) {
      var startGlyphID = bin.readUshort(data, offset);
      offset += 2;
      var endGlyphID = bin.readUshort(data, offset);
      offset += 2;
      var svgDocOffset = bin.readUint(data, offset);
      offset += 4;
      var svgDocLength = bin.readUint(data, offset);
      offset += 4;
      var sbuf = new Uint8Array(data.buffer, offset0 + svgDocOffset + svgDocIndexOffset, svgDocLength);
      var svg = bin.readUTF8(sbuf, 0, sbuf.length);
      for (var f = startGlyphID; f <= endGlyphID; f++) {
        obj.entries[f] = svg;
      }
    }
    return obj;
  };
  Typr.SVG.toPath = function(str) {
    var pth = { cmds: [], crds: [] };
    if (str == null)
      return pth;
    var prsr = new DOMParser();
    var doc = prsr["parseFromString"](str, "image/svg+xml");
    var svg = doc.firstChild;
    while (svg.tagName != "svg")
      svg = svg.nextSibling;
    var vb = svg.getAttribute("viewBox");
    if (vb)
      vb = vb.trim().split(" ").map(parseFloat);
    else
      vb = [0, 0, 1e3, 1e3];
    Typr.SVG._toPath(svg.children, pth);
    for (var i = 0; i < pth.crds.length; i += 2) {
      var x = pth.crds[i], y = pth.crds[i + 1];
      x -= vb[0];
      y -= vb[1];
      y = -y;
      pth.crds[i] = x;
      pth.crds[i + 1] = y;
    }
    return pth;
  };
  Typr.SVG._toPath = function(nds, pth, fill) {
    for (var ni = 0; ni < nds.length; ni++) {
      var nd = nds[ni], tn = nd.tagName;
      var cfl = nd.getAttribute("fill");
      if (cfl == null)
        cfl = fill;
      if (tn == "g")
        Typr.SVG._toPath(nd.children, pth, cfl);
      else if (tn == "path") {
        pth.cmds.push(cfl ? cfl : "#000000");
        var d = nd.getAttribute("d");
        var toks = Typr.SVG._tokens(d);
        Typr.SVG._toksToPath(toks, pth);
        pth.cmds.push("X");
      } else if (tn == "defs")
        ;
      else
        console.log(tn, nd);
    }
  };
  Typr.SVG._tokens = function(d) {
    var ts = [], off = 0, rn = false, cn = "";
    while (off < d.length) {
      var cc = d.charCodeAt(off), ch = d.charAt(off);
      off++;
      var isNum = 48 <= cc && cc <= 57 || ch == "." || ch == "-";
      if (rn) {
        if (ch == "-") {
          ts.push(parseFloat(cn));
          cn = ch;
        } else if (isNum)
          cn += ch;
        else {
          ts.push(parseFloat(cn));
          if (ch != "," && ch != " ")
            ts.push(ch);
          rn = false;
        }
      } else {
        if (isNum) {
          cn = ch;
          rn = true;
        } else if (ch != "," && ch != " ")
          ts.push(ch);
      }
    }
    if (rn)
      ts.push(parseFloat(cn));
    return ts;
  };
  Typr.SVG._toksToPath = function(ts, pth) {
    var i = 0, x = 0, y = 0, ox = 0, oy = 0;
    var pc = { M: 2, L: 2, H: 1, V: 1, S: 4, C: 6 };
    var cmds = pth.cmds, crds = pth.crds;
    while (i < ts.length) {
      var cmd = ts[i];
      i++;
      if (cmd == "z") {
        cmds.push("Z");
        x = ox;
        y = oy;
      } else {
        var cmu = cmd.toUpperCase();
        var ps = pc[cmu], reps = Typr.SVG._reps(ts, i, ps);
        for (var j = 0; j < reps; j++) {
          var xi = 0, yi = 0;
          if (cmd != cmu) {
            xi = x;
            yi = y;
          }
          if (cmu == "M") {
            x = xi + ts[i++];
            y = yi + ts[i++];
            cmds.push("M");
            crds.push(x, y);
            ox = x;
            oy = y;
          } else if (cmu == "L") {
            x = xi + ts[i++];
            y = yi + ts[i++];
            cmds.push("L");
            crds.push(x, y);
          } else if (cmu == "H") {
            x = xi + ts[i++];
            cmds.push("L");
            crds.push(x, y);
          } else if (cmu == "V") {
            y = yi + ts[i++];
            cmds.push("L");
            crds.push(x, y);
          } else if (cmu == "C") {
            var x1 = xi + ts[i++], y1 = yi + ts[i++], x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
            cmds.push("C");
            crds.push(x1, y1, x2, y2, x3, y3);
            x = x3;
            y = y3;
          } else if (cmu == "S") {
            var co = Math.max(crds.length - 4, 0);
            var x1 = x + x - crds[co], y1 = y + y - crds[co + 1];
            var x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
            cmds.push("C");
            crds.push(x1, y1, x2, y2, x3, y3);
            x = x3;
            y = y3;
          } else
            console.log("Unknown SVG command " + cmd);
        }
      }
    }
  };
  Typr.SVG._reps = function(ts, off, ps) {
    var i = off;
    while (i < ts.length) {
      if (typeof ts[i] == "string")
        break;
      i += ps;
    }
    return (i - off) / ps;
  };
  if (Typr == null)
    Typr = {};
  if (Typr.U == null)
    Typr.U = {};
  Typr.U.codeToGlyph = function(font, code) {
    var cmap = font.cmap;
    var tind = -1;
    if (cmap.p0e4 != null)
      tind = cmap.p0e4;
    else if (cmap.p3e1 != null)
      tind = cmap.p3e1;
    else if (cmap.p1e0 != null)
      tind = cmap.p1e0;
    if (tind == -1)
      throw "no familiar platform and encoding!";
    var tab = cmap.tables[tind];
    if (tab.format == 0) {
      if (code >= tab.map.length)
        return 0;
      return tab.map[code];
    } else if (tab.format == 4) {
      var sind = -1;
      for (var i = 0; i < tab.endCount.length; i++)
        if (code <= tab.endCount[i]) {
          sind = i;
          break;
        }
      if (sind == -1)
        return 0;
      if (tab.startCount[sind] > code)
        return 0;
      var gli = 0;
      if (tab.idRangeOffset[sind] != 0)
        gli = tab.glyphIdArray[code - tab.startCount[sind] + (tab.idRangeOffset[sind] >> 1) - (tab.idRangeOffset.length - sind)];
      else
        gli = code + tab.idDelta[sind];
      return gli & 65535;
    } else if (tab.format == 12) {
      if (code > tab.groups[tab.groups.length - 1][1])
        return 0;
      for (var i = 0; i < tab.groups.length; i++) {
        var grp = tab.groups[i];
        if (grp[0] <= code && code <= grp[1])
          return grp[2] + (code - grp[0]);
      }
      return 0;
    } else
      throw "unknown cmap table format " + tab.format;
  };
  Typr.U.glyphToPath = function(font, gid) {
    var path = { cmds: [], crds: [] };
    if (font.SVG && font.SVG.entries[gid]) {
      var p = font.SVG.entries[gid];
      if (p == null)
        return path;
      if (typeof p == "string") {
        p = Typr.SVG.toPath(p);
        font.SVG.entries[gid] = p;
      }
      return p;
    } else if (font.CFF) {
      var state2 = { x: 0, y: 0, stack: [], nStems: 0, haveWidth: false, width: font.CFF.Private ? font.CFF.Private.defaultWidthX : 0, open: false };
      Typr.U._drawCFF(font.CFF.CharStrings[gid], state2, font.CFF, path);
    } else if (font.glyf) {
      Typr.U._drawGlyf(gid, font, path);
    }
    return path;
  };
  Typr.U._drawGlyf = function(gid, font, path) {
    var gl = font.glyf[gid];
    if (gl == null)
      gl = font.glyf[gid] = Typr.glyf._parseGlyf(font, gid);
    if (gl != null) {
      if (gl.noc > -1)
        Typr.U._simpleGlyph(gl, path);
      else
        Typr.U._compoGlyph(gl, font, path);
    }
  };
  Typr.U._simpleGlyph = function(gl, p) {
    for (var c = 0; c < gl.noc; c++) {
      var i0 = c == 0 ? 0 : gl.endPts[c - 1] + 1;
      var il = gl.endPts[c];
      for (var i = i0; i <= il; i++) {
        var pr = i == i0 ? il : i - 1;
        var nx = i == il ? i0 : i + 1;
        var onCurve = gl.flags[i] & 1;
        var prOnCurve = gl.flags[pr] & 1;
        var nxOnCurve = gl.flags[nx] & 1;
        var x = gl.xs[i], y = gl.ys[i];
        if (i == i0) {
          if (onCurve) {
            if (prOnCurve)
              Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]);
            else {
              Typr.U.P.moveTo(p, x, y);
              continue;
            }
          } else {
            if (prOnCurve)
              Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]);
            else
              Typr.U.P.moveTo(p, (gl.xs[pr] + x) / 2, (gl.ys[pr] + y) / 2);
          }
        }
        if (onCurve) {
          if (prOnCurve)
            Typr.U.P.lineTo(p, x, y);
        } else {
          if (nxOnCurve)
            Typr.U.P.qcurveTo(p, x, y, gl.xs[nx], gl.ys[nx]);
          else
            Typr.U.P.qcurveTo(p, x, y, (x + gl.xs[nx]) / 2, (y + gl.ys[nx]) / 2);
        }
      }
      Typr.U.P.closePath(p);
    }
  };
  Typr.U._compoGlyph = function(gl, font, p) {
    for (var j = 0; j < gl.parts.length; j++) {
      var path = { cmds: [], crds: [] };
      var prt = gl.parts[j];
      Typr.U._drawGlyf(prt.glyphIndex, font, path);
      var m = prt.m;
      for (var i = 0; i < path.crds.length; i += 2) {
        var x = path.crds[i], y = path.crds[i + 1];
        p.crds.push(x * m.a + y * m.b + m.tx);
        p.crds.push(x * m.c + y * m.d + m.ty);
      }
      for (var i = 0; i < path.cmds.length; i++)
        p.cmds.push(path.cmds[i]);
    }
  };
  Typr.U._getGlyphClass = function(g, cd) {
    var intr = Typr._lctf.getInterval(cd, g);
    return intr == -1 ? 0 : cd[intr + 2];
  };
  Typr.U.getPairAdjustment = function(font, g1, g2) {
    if (font.GPOS) {
      var ltab = null;
      for (var i = 0; i < font.GPOS.featureList.length; i++) {
        var fl = font.GPOS.featureList[i];
        if (fl.tag == "kern") {
          for (var j = 0; j < fl.tab.length; j++)
            if (font.GPOS.lookupList[fl.tab[j]].ltype == 2)
              ltab = font.GPOS.lookupList[fl.tab[j]];
        }
      }
      if (ltab) {
        for (var i = 0; i < ltab.tabs.length; i++) {
          var tab = ltab.tabs[i];
          var ind = Typr._lctf.coverageIndex(tab.coverage, g1);
          if (ind == -1)
            continue;
          var adj;
          if (tab.format == 1) {
            var right = tab.pairsets[ind];
            for (var j = 0; j < right.length; j++)
              if (right[j].gid2 == g2)
                adj = right[j];
            if (adj == null)
              continue;
          } else if (tab.format == 2) {
            var c1 = Typr.U._getGlyphClass(g1, tab.classDef1);
            var c2 = Typr.U._getGlyphClass(g2, tab.classDef2);
            var adj = tab.matrix[c1][c2];
          }
          return adj.val1[2];
        }
      }
    }
    if (font.kern) {
      var ind1 = font.kern.glyph1.indexOf(g1);
      if (ind1 != -1) {
        var ind2 = font.kern.rval[ind1].glyph2.indexOf(g2);
        if (ind2 != -1)
          return font.kern.rval[ind1].vals[ind2];
      }
    }
    return 0;
  };
  Typr.U.stringToGlyphs = function(font, str) {
    var gls = [];
    for (var i = 0; i < str.length; i++) {
      var cc = str.codePointAt(i);
      if (cc > 65535)
        i++;
      gls.push(Typr.U.codeToGlyph(font, cc));
    }
    var gsub = font["GSUB"];
    if (gsub == null)
      return gls;
    var llist = gsub.lookupList, flist = gsub.featureList;
    var wsep = '\n	" ,.:;!?()  \u060C';
    var R2 = "\u0622\u0623\u0624\u0625\u0627\u0629\u062F\u0630\u0631\u0632\u0648\u0671\u0672\u0673\u0675\u0676\u0677\u0688\u0689\u068A\u068B\u068C\u068D\u068E\u068F\u0690\u0691\u0692\u0693\u0694\u0695\u0696\u0697\u0698\u0699\u06C0\u06C3\u06C4\u06C5\u06C6\u06C7\u06C8\u06C9\u06CA\u06CB\u06CD\u06CF\u06D2\u06D3\u06D5\u06EE\u06EF\u0710\u0715\u0716\u0717\u0718\u0719\u071E\u0728\u072A\u072C\u072F\u074D\u0759\u075A\u075B\u076B\u076C\u0771\u0773\u0774\u0778\u0779\u0840\u0846\u0847\u0849\u0854\u0867\u0869\u086A\u08AA\u08AB\u08AC\u08AE\u08B1\u08B2\u08B9\u0AC5\u0AC7\u0AC9\u0ACA\u0ACE\u0ACF\u0AD0\u0AD1\u0AD2\u0ADD\u0AE1\u0AE4\u0AEF\u0B81\u0B83\u0B84\u0B85\u0B89\u0B8C\u0B8E\u0B8F\u0B91\u0BA9\u0BAA\u0BAB\u0BAC";
    var L = "\uA872\u0ACD\u0AD7";
    for (var ci = 0; ci < gls.length; ci++) {
      var gl = gls[ci];
      var slft = ci == 0 || wsep.indexOf(str[ci - 1]) != -1;
      var srgt = ci == gls.length - 1 || wsep.indexOf(str[ci + 1]) != -1;
      if (!slft && R2.indexOf(str[ci - 1]) != -1)
        slft = true;
      if (!srgt && R2.indexOf(str[ci]) != -1)
        srgt = true;
      if (!srgt && L.indexOf(str[ci + 1]) != -1)
        srgt = true;
      if (!slft && L.indexOf(str[ci]) != -1)
        slft = true;
      var feat = null;
      if (slft)
        feat = srgt ? "isol" : "init";
      else
        feat = srgt ? "fina" : "medi";
      for (var fi = 0; fi < flist.length; fi++) {
        if (flist[fi].tag != feat)
          continue;
        for (var ti = 0; ti < flist[fi].tab.length; ti++) {
          var tab = llist[flist[fi].tab[ti]];
          if (tab.ltype != 1)
            continue;
          Typr.U._applyType1(gls, ci, tab);
        }
      }
    }
    var cligs = ["rlig", "liga", "mset"];
    for (var ci = 0; ci < gls.length; ci++) {
      var gl = gls[ci];
      var rlim = Math.min(3, gls.length - ci - 1);
      for (var fi = 0; fi < flist.length; fi++) {
        var fl = flist[fi];
        if (cligs.indexOf(fl.tag) == -1)
          continue;
        for (var ti = 0; ti < fl.tab.length; ti++) {
          var tab = llist[fl.tab[ti]];
          for (var j = 0; j < tab.tabs.length; j++) {
            if (tab.tabs[j] == null)
              continue;
            var ind = Typr._lctf.coverageIndex(tab.tabs[j].coverage, gl);
            if (ind == -1)
              continue;
            if (tab.ltype == 4) {
              var vals = tab.tabs[j].vals[ind];
              for (var k = 0; k < vals.length; k++) {
                var lig = vals[k], rl = lig.chain.length;
                if (rl > rlim)
                  continue;
                var good = true;
                for (var l = 0; l < rl; l++)
                  if (lig.chain[l] != gls[ci + (1 + l)])
                    good = false;
                if (!good)
                  continue;
                gls[ci] = lig.nglyph;
                for (var l = 0; l < rl; l++)
                  gls[ci + l + 1] = -1;
              }
            } else if (tab.ltype == 5) {
              var ltab = tab.tabs[j];
              if (ltab.fmt != 2)
                continue;
              var cind = Typr._lctf.getInterval(ltab.cDef, gl);
              var cls = ltab.cDef[cind + 2], scs = ltab.scset[cls];
              for (var i = 0; i < scs.length; i++) {
                var sc = scs[i], inp = sc.input;
                if (inp.length > rlim)
                  continue;
                var good = true;
                for (var l = 0; l < inp.length; l++) {
                  var cind2 = Typr._lctf.getInterval(ltab.cDef, gls[ci + 1 + l]);
                  if (cind == -1 && ltab.cDef[cind2 + 2] != inp[l]) {
                    good = false;
                    break;
                  }
                }
                if (!good)
                  continue;
                var lrs = sc.substLookupRecords;
                for (var k = 0; k < lrs.length; k += 2) {
                  lrs[k];
                  lrs[k + 1];
                }
              }
            }
          }
        }
      }
    }
    return gls;
  };
  Typr.U._applyType1 = function(gls, ci, tab) {
    var gl = gls[ci];
    for (var j = 0; j < tab.tabs.length; j++) {
      var ttab = tab.tabs[j];
      var ind = Typr._lctf.coverageIndex(ttab.coverage, gl);
      if (ind == -1)
        continue;
      if (ttab.fmt == 1)
        gls[ci] = gls[ci] + ttab.delta;
      else
        gls[ci] = ttab.newg[ind];
    }
  };
  Typr.U.glyphsToPath = function(font, gls, clr) {
    var tpath = { cmds: [], crds: [] };
    var x = 0;
    for (var i = 0; i < gls.length; i++) {
      var gid = gls[i];
      if (gid == -1)
        continue;
      var gid2 = i < gls.length - 1 && gls[i + 1] != -1 ? gls[i + 1] : 0;
      var path = Typr.U.glyphToPath(font, gid);
      for (var j = 0; j < path.crds.length; j += 2) {
        tpath.crds.push(path.crds[j] + x);
        tpath.crds.push(path.crds[j + 1]);
      }
      if (clr)
        tpath.cmds.push(clr);
      for (var j = 0; j < path.cmds.length; j++)
        tpath.cmds.push(path.cmds[j]);
      if (clr)
        tpath.cmds.push("X");
      x += font.hmtx.aWidth[gid];
      if (i < gls.length - 1)
        x += Typr.U.getPairAdjustment(font, gid, gid2);
    }
    return tpath;
  };
  Typr.U.pathToSVG = function(path, prec) {
    if (prec == null)
      prec = 5;
    var out = [], co = 0, lmap = { M: 2, L: 2, Q: 4, C: 6 };
    for (var i = 0; i < path.cmds.length; i++) {
      var cmd = path.cmds[i], cn = co + (lmap[cmd] ? lmap[cmd] : 0);
      out.push(cmd);
      while (co < cn) {
        var c = path.crds[co++];
        out.push(parseFloat(c.toFixed(prec)) + (co == cn ? "" : " "));
      }
    }
    return out.join("");
  };
  Typr.U.pathToContext = function(path, ctx) {
    var c = 0, crds = path.crds;
    for (var j = 0; j < path.cmds.length; j++) {
      var cmd = path.cmds[j];
      if (cmd == "M") {
        ctx.moveTo(crds[c], crds[c + 1]);
        c += 2;
      } else if (cmd == "L") {
        ctx.lineTo(crds[c], crds[c + 1]);
        c += 2;
      } else if (cmd == "C") {
        ctx.bezierCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3], crds[c + 4], crds[c + 5]);
        c += 6;
      } else if (cmd == "Q") {
        ctx.quadraticCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3]);
        c += 4;
      } else if (cmd.charAt(0) == "#") {
        ctx.beginPath();
        ctx.fillStyle = cmd;
      } else if (cmd == "Z") {
        ctx.closePath();
      } else if (cmd == "X") {
        ctx.fill();
      }
    }
  };
  Typr.U.P = {};
  Typr.U.P.moveTo = function(p, x, y) {
    p.cmds.push("M");
    p.crds.push(x, y);
  };
  Typr.U.P.lineTo = function(p, x, y) {
    p.cmds.push("L");
    p.crds.push(x, y);
  };
  Typr.U.P.curveTo = function(p, a, b, c, d, e, f) {
    p.cmds.push("C");
    p.crds.push(a, b, c, d, e, f);
  };
  Typr.U.P.qcurveTo = function(p, a, b, c, d) {
    p.cmds.push("Q");
    p.crds.push(a, b, c, d);
  };
  Typr.U.P.closePath = function(p) {
    p.cmds.push("Z");
  };
  Typr.U._drawCFF = function(cmds, state2, font, p) {
    var stack = state2.stack;
    var nStems = state2.nStems, haveWidth = state2.haveWidth, width = state2.width, open = state2.open;
    var i = 0;
    var x = state2.x, y = state2.y, c1x = 0, c1y = 0, c2x = 0, c2y = 0, c3x = 0, c3y = 0, c4x = 0, c4y = 0, jpx = 0, jpy = 0;
    var o = { val: 0, size: 0 };
    while (i < cmds.length) {
      Typr.CFF.getCharString(cmds, i, o);
      var v = o.val;
      i += o.size;
      if (v == "o1" || v == "o18") {
        var hasWidthArg;
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
          width = stack.shift() + font.Private.nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
      } else if (v == "o3" || v == "o23") {
        var hasWidthArg;
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
          width = stack.shift() + font.Private.nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
      } else if (v == "o4") {
        if (stack.length > 1 && !haveWidth) {
          width = stack.shift() + font.Private.nominalWidthX;
          haveWidth = true;
        }
        if (open)
          Typr.U.P.closePath(p);
        y += stack.pop();
        Typr.U.P.moveTo(p, x, y);
        open = true;
      } else if (v == "o5") {
        while (stack.length > 0) {
          x += stack.shift();
          y += stack.shift();
          Typr.U.P.lineTo(p, x, y);
        }
      } else if (v == "o6" || v == "o7") {
        var count = stack.length;
        var isX = v == "o6";
        for (var j = 0; j < count; j++) {
          var sval = stack.shift();
          if (isX)
            x += sval;
          else
            y += sval;
          isX = !isX;
          Typr.U.P.lineTo(p, x, y);
        }
      } else if (v == "o8" || v == "o24") {
        var count = stack.length;
        var index = 0;
        while (index + 6 <= count) {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          x = c2x + stack.shift();
          y = c2y + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
          index += 6;
        }
        if (v == "o24") {
          x += stack.shift();
          y += stack.shift();
          Typr.U.P.lineTo(p, x, y);
        }
      } else if (v == "o11")
        break;
      else if (v == "o1234" || v == "o1235" || v == "o1236" || v == "o1237") {
        if (v == "o1234") {
          c1x = x + stack.shift();
          c1y = y;
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y;
          c3x = jpx + stack.shift();
          c3y = c2y;
          c4x = c3x + stack.shift();
          c4y = y;
          x = c4x + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
        if (v == "o1235") {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y + stack.shift();
          c3x = jpx + stack.shift();
          c3y = jpy + stack.shift();
          c4x = c3x + stack.shift();
          c4y = c3y + stack.shift();
          x = c4x + stack.shift();
          y = c4y + stack.shift();
          stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
        if (v == "o1236") {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y;
          c3x = jpx + stack.shift();
          c3y = c2y;
          c4x = c3x + stack.shift();
          c4y = c3y + stack.shift();
          x = c4x + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
        if (v == "o1237") {
          c1x = x + stack.shift();
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          jpx = c2x + stack.shift();
          jpy = c2y + stack.shift();
          c3x = jpx + stack.shift();
          c3y = jpy + stack.shift();
          c4x = c3x + stack.shift();
          c4y = c3y + stack.shift();
          if (Math.abs(c4x - x) > Math.abs(c4y - y)) {
            x = c4x + stack.shift();
          } else {
            y = c4y + stack.shift();
          }
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
          Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y);
        }
      } else if (v == "o14") {
        if (stack.length > 0 && !haveWidth) {
          width = stack.shift() + font.nominalWidthX;
          haveWidth = true;
        }
        if (stack.length == 4) {
          var adx = stack.shift();
          var ady = stack.shift();
          var bchar = stack.shift();
          var achar = stack.shift();
          var bind = Typr.CFF.glyphBySE(font, bchar);
          var aind = Typr.CFF.glyphBySE(font, achar);
          Typr.U._drawCFF(font.CharStrings[bind], state2, font, p);
          state2.x = adx;
          state2.y = ady;
          Typr.U._drawCFF(font.CharStrings[aind], state2, font, p);
        }
        if (open) {
          Typr.U.P.closePath(p);
          open = false;
        }
      } else if (v == "o19" || v == "o20") {
        var hasWidthArg;
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
          width = stack.shift() + font.Private.nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
        i += nStems + 7 >> 3;
      } else if (v == "o21") {
        if (stack.length > 2 && !haveWidth) {
          width = stack.shift() + font.Private.nominalWidthX;
          haveWidth = true;
        }
        y += stack.pop();
        x += stack.pop();
        if (open)
          Typr.U.P.closePath(p);
        Typr.U.P.moveTo(p, x, y);
        open = true;
      } else if (v == "o22") {
        if (stack.length > 1 && !haveWidth) {
          width = stack.shift() + font.Private.nominalWidthX;
          haveWidth = true;
        }
        x += stack.pop();
        if (open)
          Typr.U.P.closePath(p);
        Typr.U.P.moveTo(p, x, y);
        open = true;
      } else if (v == "o25") {
        while (stack.length > 6) {
          x += stack.shift();
          y += stack.shift();
          Typr.U.P.lineTo(p, x, y);
        }
        c1x = x + stack.shift();
        c1y = y + stack.shift();
        c2x = c1x + stack.shift();
        c2y = c1y + stack.shift();
        x = c2x + stack.shift();
        y = c2y + stack.shift();
        Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
      } else if (v == "o26") {
        if (stack.length % 2) {
          x += stack.shift();
        }
        while (stack.length > 0) {
          c1x = x;
          c1y = y + stack.shift();
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          x = c2x;
          y = c2y + stack.shift();
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
        }
      } else if (v == "o27") {
        if (stack.length % 2) {
          y += stack.shift();
        }
        while (stack.length > 0) {
          c1x = x + stack.shift();
          c1y = y;
          c2x = c1x + stack.shift();
          c2y = c1y + stack.shift();
          x = c2x + stack.shift();
          y = c2y;
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
        }
      } else if (v == "o10" || v == "o29") {
        var obj = v == "o10" ? font.Private : font;
        if (stack.length == 0) {
          console.log("error: empty stack");
        } else {
          var ind = stack.pop();
          var subr = obj.Subrs[ind + obj.Bias];
          state2.x = x;
          state2.y = y;
          state2.nStems = nStems;
          state2.haveWidth = haveWidth;
          state2.width = width;
          state2.open = open;
          Typr.U._drawCFF(subr, state2, font, p);
          x = state2.x;
          y = state2.y;
          nStems = state2.nStems;
          haveWidth = state2.haveWidth;
          width = state2.width;
          open = state2.open;
        }
      } else if (v == "o30" || v == "o31") {
        var count, count1 = stack.length;
        var index = 0;
        var alternate = v == "o31";
        count = count1 & ~2;
        index += count1 - count;
        while (index < count) {
          if (alternate) {
            c1x = x + stack.shift();
            c1y = y;
            c2x = c1x + stack.shift();
            c2y = c1y + stack.shift();
            y = c2y + stack.shift();
            if (count - index == 5) {
              x = c2x + stack.shift();
              index++;
            } else
              x = c2x;
            alternate = false;
          } else {
            c1x = x;
            c1y = y + stack.shift();
            c2x = c1x + stack.shift();
            c2y = c1y + stack.shift();
            x = c2x + stack.shift();
            if (count - index == 5) {
              y = c2y + stack.shift();
              index++;
            } else
              y = c2y;
            alternate = true;
          }
          Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
          index += 4;
        }
      } else if ((v + "").charAt(0) == "o") {
        console.log("Unknown operation: " + v, cmds);
        throw v;
      } else
        stack.push(v);
    }
    state2.x = x;
    state2.y = y;
    state2.nStems = nStems;
    state2.haveWidth = haveWidth;
    state2.width = width;
    state2.open = open;
  };
  var typr_js = Typr;
  try {
    top.typrMapping = top.typrMapping || void 0;
    top.jobs = top.jobs || [];
    top.currentMedia = top.currentMedia || void 0;
  } catch {
  }
  const state$1 = {
    study: {
      videojs: /* @__PURE__ */ Object.create({}),
      hacked: false,
      answererWrapperUnsetMessage: void 0
    }
  };
  const CXProject = Project.create({
    name: "\u8D85\u661F\u5B66\u4E60\u901A",
    domains: [
      "chaoxing.com",
      "edu.cn",
      "org.cn",
      "xueyinonline.com",
      "hnsyu.net"
    ],
    studyProject: true,
    scripts: {
      guide: new Script({
        name: "\u{1F4A1} \u4F7F\u7528\u63D0\u793A",
        url: [
          ["\u9996\u9875", "https://www.chaoxing.com"],
          ["\u65E7\u7248\u4E2A\u4EBA\u9996\u9875", "chaoxing.com/space/index"],
          ["\u65B0\u7248\u4E2A\u4EBA\u9996\u9875", "chaoxing.com/base"],
          ["\u8BFE\u7A0B\u9996\u9875", "chaoxing.com/mycourse"]
        ],
        namespace: "cx.guide",
        configs: {
          notes: {
            defaultValue: `\u8BF7\u624B\u52A8\u8FDB\u5165\u89C6\u9891\u3001\u4F5C\u4E1A\u3001\u8003\u8BD5\u9875\u9762\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u8FD0\u884C\u3002`
          }
        },
        oncomplete() {
          CommonProject.scripts.render.methods.pin(this);
        }
      }),
      study: new Script({
        name: "\u{1F5A5}\uFE0F \u8BFE\u7A0B\u5B66\u4E60",
        namespace: "cx.new.study",
        url: [
          ["\u4EFB\u52A1\u70B9\u9875\u9762", "/knowledge/cards"],
          ["\u9605\u8BFB\u4EFB\u52A1\u70B9", "/readsvr/book/mooc"]
        ],
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u81EA\u52A8\u7B54\u9898\u524D\u8BF7\u5728 \u201C\u901A\u7528-\u5168\u5C40\u8BBE\u7F6E\u201D \u4E2D\u8BBE\u7F6E\u9898\u5E93\u914D\u7F6E\u3002",
              ["\u4EFB\u52A1\u70B9\u4E0D\u662F\u987A\u5E8F\u6267\u884C\uFF0C\u5982\u679C\u67D0\u4E00\u4E2A\u4EFB\u52A1\u6CA1\u6709\u52A8", "\u8BF7\u67E5\u770B\u662F\u5426\u6709\u5176\u4ED6\u4EFB\u52A1\u6B63\u5728\u5B66\u4E60\uFF0C\u8010\u5FC3\u7B49\u5F85\u5373\u53EF\u3002"],
              "\u95EF\u5173\u6A21\u5F0F\u8BF7\u6CE8\u610F\u9898\u5E93\u5982\u679C\u6CA1\u5B8C\u6210\uFF0C\u9700\u8981\u81EA\u5DF1\u5B8C\u6210\u624D\u80FD\u89E3\u9501\u7AE0\u8282\u3002",
              "\u4E0D\u8981\u6700\u5C0F\u5316\u6D4F\u89C8\u5668\uFF0C\u53EF\u80FD\u5BFC\u81F4\u811A\u672C\u6682\u505C\u3002"
            ]).outerHTML
          },
          playbackRate: {
            label: "\u89C6\u9891\u500D\u901F",
            attrs: {
              type: "range",
              step: 0.5,
              min: 1,
              max: 16
            },
            defaultValue: 1,
            onload() {
              createRangeTooltip(
                this,
                "1",
                (val) => (parseFloat(val) > 2 ? `${val}x - \u9AD8\u500D\u901F\u8B66\u544A\uFF01` : `${val}x`) + "\n\n\u9AD8\u500D\u901F(\u5927\u4E8E1\u500D)\u53EF\u80FD\u5BFC\u81F4: \n- \u5B66\u4E60\u8BB0\u5F55\u6E05\u7A7A\n- \u9891\u7E41\u9A8C\u8BC1\u7801\n\u8D85\u661F\u540E\u53F0\u53EF\u4EE5\u770B\u5230\u5B66\u4E60\u65F6\u957F\uFF0C\u8BF7\u8C28\u614E\u8BBE\u7F6E\u2757\n\u5982\u679C\u8BBE\u7F6E\u540E\u65E0\u6548\u5219\u662F\u8D85\u661F\u4E0D\u5141\u8BB8\u4F7F\u7528\u500D\u901F\u3002"
              );
            }
          },
          volume,
          restudy,
          autoNextPage: {
            label: "\u81EA\u52A8\u4E0B\u4E00\u7AE0",
            attrs: { type: "checkbox" },
            defaultValue: true
          },
          reloadVideoWhenError: {
            label: "\u89C6\u9891\u52A0\u8F7D\u9519\u8BEF\u65F6\u81EA\u52A8\u5237\u65B0",
            attrs: { type: "checkbox" },
            defaultValue: false
          },
          showTextareaWhenEdit: {
            label: "\u7F16\u8F91\u65F6\u663E\u793A\u81EA\u5B9A\u4E49\u7F16\u8F91\u6846",
            attrs: {
              type: "checkbox",
              title: "\u8D85\u661F\u9ED8\u8BA4\u7981\u6B62\u5728\u7F16\u8F91\u6846\u4E2D\u590D\u5236\u7C98\u8D34\uFF0C\u5F00\u542F\u6B64\u9009\u9879\u53EF\u4EE5\u5728\u6587\u672C\u6846\u7F16\u8F91\u65F6\u751F\u6210\u4E00\u4E2A\u81EA\u5B9A\u4E49\u7F16\u8F91\u6846\u8FDB\u884C\u7F16\u8F91\uFF0C\u811A\u672C\u4F1A\u5C06\u5185\u5BB9\u540C\u6B65\u5230\u7F16\u8F91\u6846\u4E2D\u3002"
            },
            defaultValue: true
          },
          enableMedia: {
            label: "\u5F00\u542F-\u89C6\u9891/\u97F3\u9891\u81EA\u52A8\u64AD\u653E",
            attrs: { type: "checkbox", title: "\u5F00\u542F\uFF1A\u97F3\u9891\u548C\u89C6\u9891\u7684\u81EA\u52A8\u64AD\u653E" },
            defaultValue: true
          },
          enablePPT: {
            label: "\u5F00\u542F-PPT/\u4E66\u7C4D\u81EA\u52A8\u5B8C\u6210",
            attrs: { type: "checkbox", title: "\u5F00\u542F\uFF1APPT/\u4E66\u7C4D\u81EA\u52A8\u7FFB\u9605" },
            defaultValue: true
          },
          enableChapterTest: {
            label: "\u5F00\u542F-\u7AE0\u8282\u6D4B\u8BD5\u81EA\u52A8\u7B54\u9898",
            attrs: { type: "checkbox", title: "\u5F00\u542F\uFF1A\u7AE0\u8282\u6D4B\u8BD5\u81EA\u52A8\u7B54\u9898" },
            defaultValue: true
          }
        },
        onrender({ panel: panel2 }) {
          var _a;
          if (!((_a = CommonProject.scripts.settings.cfg.answererWrappers) == null ? void 0 : _a.length)) {
            const setting = el("button", { className: "base-style-button-secondary" }, "\u901A\u7528-\u5168\u5C40\u8BBE\u7F6E");
            setting.onclick = () => CommonProject.scripts.render.methods.pin(CommonProject.scripts.settings);
            if (state$1.study.answererWrapperUnsetMessage === void 0) {
              state$1.study.answererWrapperUnsetMessage = $message("warn", {
                content: el("span", {}, ["\u68C0\u6D4B\u5230\u672A\u8BBE\u7F6E\u9898\u5E93\u914D\u7F6E\uFF0C\u5C06\u65E0\u6CD5\u81EA\u52A8\u7B54\u9898\uFF0C\u8BF7\u5207\u6362\u5230 ", setting, " \u9875\u9762\u8FDB\u884C\u914D\u7F6E\u3002"]),
                duration: 0
              });
            }
          }
        },
        async oncomplete() {
          if (/\/readsvr\/book\/mooc/.test(location.href)) {
            $console.log("\u6B63\u5728\u5B8C\u6210\u4E66\u7C4D/PPT...");
            setTimeout(() => {
              readweb.goto(epage);
            }, 5e3);
            return;
          }
          if (/\/knowledge\/cards/.test(location.href)) {
            const updateMediaState = () => {
              if (top.currentMedia) {
                top.currentMedia.playbackRate = parseFloat(this.cfg.playbackRate.toString());
                top.currentMedia.volume = this.cfg.volume;
              }
            };
            this.onConfigChange("playbackRate", updateMediaState);
            this.onConfigChange("volume", updateMediaState);
            await study({
              ...this.cfg,
              playbackRate: parseFloat(this.cfg.playbackRate.toString()),
              workOptions: { ...CommonProject.scripts.settings.cfg }
            });
          }
        }
      }),
      work: new Script({
        name: "\u270D\uFE0F \u4F5C\u4E1A\u8003\u8BD5\u811A\u672C",
        url: [
          ["\u4F5C\u4E1A\u9875\u9762", "/mooc2/work/dowork"],
          ["\u8003\u8BD5\u6574\u5377\u9884\u89C8\u9875\u9762", "/mooc2/exam/preview"]
        ],
        namespace: "cx.new.work",
        configs: { notes: workNotes },
        async oncomplete() {
          const isExam = /\/exam\/preview/.test(location.href);
          commonWork(this, {
            workerProvider: (opts2) => workOrExam(isExam ? "exam" : "work", opts2)
          });
        }
      }),
      autoRead: new Script({
        name: "\u{1F5A5}\uFE0F \u81EA\u52A8\u9605\u8BFB",
        url: [
          ["\u9605\u8BFB\u9875\u9762", "/ztnodedetailcontroller/visitnodedetail"],
          ["\u8BFE\u7A0B\u9996\u9875", /chaoxing.com\/course\/\d+\.html/]
        ],
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u8BF7\u624B\u52A8\u70B9\u51FB\u8FDB\u5165\u9605\u8BFB\u4EFB\u52A1\u70B9",
              "\u9605\u8BFB\u4EFB\u52A1\u70B9\u901A\u5E38\u9700\u8981\u6302\u673A\u4E00\u5C0F\u65F6",
              "\u7B49\u5F85\u5B8C\u6210\u540E\u6B21\u65E5\u624D\u4F1A\u7EDF\u8BA1\u9605\u8BFB\u65F6\u957F"
            ]).outerHTML
          }
        },
        oncomplete() {
          if (/chaoxing.com\/course\/\d+\.html/.test(location.href)) {
            const texts = $$el(".course_section .chapterText");
            if (texts.length) {
              texts[0].click();
            }
            return;
          }
          let top2 = 0;
          const interval = setInterval(() => {
            top2 += (document.documentElement.scrollHeight - window.innerHeight) / 60;
            window.scrollTo({
              behavior: "smooth",
              top: top2
            });
          }, 1e3);
          setTimeout(() => {
            clearInterval(interval);
            const next = $el(".nodeItem.r i");
            if (next) {
              next.click();
            } else {
              $console.log("\u672A\u68C0\u6D4B\u5230\u4E0B\u4E00\u9875");
            }
          }, 63 * 1e3);
        }
      }),
      versionRedirect: new Script({
        name: "\u7248\u672C\u5207\u6362\u811A\u672C",
        url: [
          ["", "mooc2=0"],
          ["", "mycourse/studentcourse"],
          ["", "work/getAllWork"],
          ["", "work/doHomeWorkNew"],
          ["", "exam/test\\?"],
          ["", "exam/test/reVersionTestStartNew.*examsystem.*"]
        ],
        hideInPanel: true,
        async oncomplete() {
          if (top === window) {
            $message("warn", {
              content: "OCS\u7F51\u8BFE\u52A9\u624B\u4E0D\u652F\u6301\u65E7\u7248\u8D85\u661F, \u5373\u5C06\u5207\u6362\u5230\u8D85\u661F\u65B0\u7248, \u5982\u6709\u5176\u4ED6\u7B2C\u4E09\u65B9\u63D2\u4EF6\u8BF7\u5173\u95ED, \u53EF\u80FD\u6709\u517C\u5BB9\u95EE\u9898\u9891\u7E41\u9891\u7E41\u5207\u6362\u3002"
            });
            await $.sleep(1e3);
            const experience = document.querySelector(".experience");
            if (experience) {
              experience.click();
            } else {
              const params = new URLSearchParams(window.location.href);
              params.set("mooc2", "1");
              params.set("newMooc", "true");
              params.delete("examsystem");
              window.location.replace(decodeURIComponent(params.toString()));
            }
          }
        }
      }),
      examRedirect: new Script({
        name: "\u8003\u8BD5\u6574\u5377\u9884\u89C8\u811A\u672C",
        url: [["\u65B0\u7248\u8003\u8BD5\u9875\u9762", "exam-ans/exam/test/reVersionTestStartNew"]],
        hideInPanel: true,
        oncomplete() {
          $message("info", { content: "\u5373\u5C06\u8DF3\u8F6C\u5230\u6574\u5377\u9884\u89C8\u9875\u9762\u8FDB\u884C\u8003\u8BD5\u3002" });
          setTimeout(() => $gm.unsafeWindow.topreview(), 3e3);
        }
      }),
      rateHack: new Script({
        name: "\u5C4F\u853D\u500D\u901F\u9650\u5236",
        hideInPanel: true,
        url: [["", "/ananas/modules/video/"]],
        onstart() {
          rateHack();
        }
      }),
      copyHack: new Script({
        name: "\u5C4F\u853D\u590D\u5236\u7C98\u8D34\u9650\u5236",
        hideInPanel: true,
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        methods() {
          return {
            hackEditorPaste() {
              var _a, _b;
              try {
                const instants = ((_b = (_a = $gm.unsafeWindow) == null ? void 0 : _a.UE) == null ? void 0 : _b.instants) || [];
                for (const key in instants) {
                  const ue = instants[key];
                  if (ue == null ? void 0 : ue.textarea) {
                    ue.body.addEventListener("click", async () => {
                      if (CXProject.scripts.study.cfg.showTextareaWhenEdit) {
                        const defaultText = el("span", { innerHTML: ue.textarea.value }).textContent;
                        $modal("prompt", {
                          content: "\u8BF7\u5728\u6B64\u6587\u672C\u6846\u8FDB\u884C\u7F16\u8F91\uFF0C\u9632\u6B62\u8D85\u661F\u65E0\u6CD5\u590D\u5236\u7C98\u8D34\u3002",
                          width: 800,
                          inputDefaultValue: defaultText || "",
                          modalInputType: "textarea",
                          onConfirm: (val = "") => {
                            ue.setContent(
                              val.split("\n").map((line) => `<p>${line}</p>`).join("")
                            );
                          }
                        });
                      }
                    });
                    if ($gm.unsafeWindow.editorPaste) {
                      ue.removeListener("beforepaste", $gm.unsafeWindow.editorPaste);
                    }
                    if ($gm.unsafeWindow.myEditor_paste) {
                      ue.removeListener("beforepaste", $gm.unsafeWindow.myEditor_paste);
                    }
                  }
                }
              } catch {
              }
            }
          };
        },
        oncomplete() {
          const hackInterval = setInterval(() => {
            if (typeof $gm.unsafeWindow.UE !== "undefined") {
              clearInterval(hackInterval);
              this.methods.hackEditorPaste();
              console.log("\u5DF2\u89E3\u9664\u8F93\u5165\u6846\u65E0\u6CD5\u590D\u5236\u7C98\u8D34\u9650\u5236");
            }
          }, 500);
        }
      }),
      studyDispatcher: new Script({
        name: "\u8BFE\u7A0B\u5B66\u4E60\u8C03\u5EA6\u5668",
        url: [["\u8BFE\u7A0B\u5B66\u4E60\u9875\u9762", "/mycourse/studentstudy"]],
        namespace: "cx.new.study-dispatcher",
        hideInPanel: true,
        async oncomplete() {
          const restudy2 = CXProject.scripts.study.cfg.restudy;
          CommonProject.scripts.render.methods.pin(CXProject.scripts.study);
          if (!restudy2) {
            const params = new URLSearchParams(window.location.href);
            const mooc = params.get("mooc2");
            if (mooc === null) {
              params.set("mooc2", "1");
              window.location.replace(decodeURIComponent(params.toString()));
              return;
            }
            let chapters = CXAnalyses.getChapterInfos();
            chapters = chapters.filter((chapter) => chapter.unFinishCount !== 0);
            if (chapters.length === 0) {
              $message("warn", { content: "\u9875\u9762\u4EFB\u52A1\u70B9\u6570\u91CF\u4E3A\u7A7A! \u8BF7\u5237\u65B0\u91CD\u8BD5!" });
            } else {
              const params2 = new URLSearchParams(window.location.href);
              const courseId = params2.get("courseId");
              const classId = params2.get("clazzid");
              setTimeout(() => {
                if ($$el(`.posCatalog_active[id="cur${chapters[0].chapterId}"]`).length === 0) {
                  $gm.unsafeWindow.getTeacherAjax(courseId, classId, chapters[0].chapterId);
                }
              }, 1e3);
            }
          }
        }
      }),
      cxSecretFontRecognize: new Script({
        name: "\u7E41\u4F53\u5B57\u8BC6\u522B",
        hideInPanel: true,
        url: [
          ["\u9898\u76EE\u9875\u9762", "work/doHomeWorkNew"],
          ["\u8003\u8BD5\u6574\u5377\u9884\u89C8", "/mooc2/exam/preview"],
          ["\u4F5C\u4E1A", "/mooc2/work/dowork"]
        ],
        async oncomplete() {
          await mappingRecognize();
        }
      })
    }
  });
  function workOrExam(type = "work", { answererWrappers, period, thread, redundanceWordsText }) {
    $message("info", { content: `\u5F00\u59CB${type === "work" ? "\u4F5C\u4E1A" : "\u8003\u8BD5"}` });
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "cx"
    });
    const workOrExamQuestionTitleTransform = (titles) => {
      const optimizationTitle = titles.map((titleElement) => {
        if (titleElement) {
          const titleCloneEl = titleElement.cloneNode(true);
          const childNodes = titleCloneEl.childNodes;
          childNodes[0].remove();
          childNodes[0].remove();
          return optimizationElementWithImage(titleCloneEl).innerText;
        }
        return "";
      }).join(",");
      return removeRedundantWords(
        StringUtils.of(optimizationTitle).nowrap().nospace().toString().trim(),
        redundanceWordsText.split("\n")
      );
    };
    const worker = new OCSWorker({
      root: ".questionLi",
      elements: {
        title: [
          (root2) => $el("h3", root2)
        ],
        options: ".answerBg .answer_p, .textDIV, .eidtDiv",
        type: type === "exam" ? 'input[name^="type"]' : 'input[id^="answertype"]',
        lineAnswerInput: ".line_answer input[name^=answer]",
        lineSelectBox: ".line_answer_ct .selectBox ",
        reading: ".reading_answer",
        filling: ".filling_answer"
      },
      requestPeriod: period != null ? period : 3,
      resolvePeriod: 0,
      thread: thread != null ? thread : 1,
      answerer: (elements, type2, ctx) => {
        if (elements.title) {
          const title = workOrExamQuestionTitleTransform(elements.title);
          if (title) {
            return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, () => {
              return defaultAnswerWrapperHandler(answererWrappers, {
                type: type2,
                title,
                options: ctx.elements.options.map((o) => o.innerText).join("\n")
              });
            });
          } else {
            throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
          }
        } else {
          throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
        }
      },
      work: async (ctx) => {
        var _a;
        const { elements, searchInfos } = ctx;
        const typeInput = elements.type[0];
        const type2 = getQuestionType$1(parseInt(typeInput.value));
        if (type2 && (type2 === "completion" || type2 === "multiple" || type2 === "judgement" || type2 === "single")) {
          const resolver = defaultQuestionResolve(ctx)[type2];
          return await resolver(
            searchInfos,
            elements.options.map((option) => optimizationElementWithImage(option)),
            (type3, answer, option) => {
              var _a2;
              if (type3 === "judgement" || type3 === "single" || type3 === "multiple") {
                if ((option == null ? void 0 : option.parentElement) && $$el('[class*="check_answer"]', option.parentElement).length === 0) {
                  option.click();
                }
              } else if (type3 === "completion" && answer.trim()) {
                const text = option == null ? void 0 : option.querySelector("textarea");
                const textareaFrame = option == null ? void 0 : option.querySelector("iframe");
                if (text) {
                  text.value = answer;
                }
                if (textareaFrame == null ? void 0 : textareaFrame.contentDocument) {
                  textareaFrame.contentDocument.body.innerHTML = answer;
                }
                if (option == null ? void 0 : option.parentElement) {
                  (_a2 = $el("[onclick*=saveQuestion]", option == null ? void 0 : option.parentElement)) == null ? void 0 : _a2.click();
                }
              }
            }
          );
        } else if (type2 && type2 === "line") {
          for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
            let ans = answers;
            if (ans.length === 1) {
              ans = splitAnswer(ans[0]);
            }
            if (ans.filter(Boolean).length !== 0 && elements.lineAnswerInput) {
              for (let index = 0; index < elements.lineSelectBox.length; index++) {
                const box = elements.lineSelectBox[index];
                if (ans[index]) {
                  (_a = $el(`li[data=${ans[index]}] a`, box)) == null ? void 0 : _a.click();
                  await $.sleep(200);
                }
              }
              return { finish: true };
            }
          }
          return { finish: false };
        } else if (type2 && type2 === "fill") {
          return readerAndFillHandle(searchInfos, elements.filling);
        } else if (type2 && type2 === "reader") {
          return readerAndFillHandle(searchInfos, elements.reading);
        }
        return { finish: false };
      },
      onResultsUpdate(res) {
        CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, workOrExamQuestionTitleTransform));
      },
      onResolveUpdate(res) {
        var _a;
        if ((_a = res.result) == null ? void 0 : _a.finish) {
          CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
            simplifyWorkResult([res], workOrExamQuestionTitleTransform)
          );
        }
        CommonProject.scripts.workResults.methods.updateWorkState(worker);
      }
    });
    worker.doWork().then(() => {
      $message("info", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      worker.emit("done");
    }).catch((err) => {
      console.error(err);
      $message("error", { content: "\u7B54\u9898\u7A0B\u5E8F\u53D1\u751F\u9519\u8BEF : " + err.message });
    });
    return worker;
  }
  async function mappingRecognize(doc = document) {
    var _a, _b;
    let typrMapping = /* @__PURE__ */ Object.create({});
    try {
      top.typrMapping = top.typrMapping || await loadTyprMapping();
      typrMapping = top.typrMapping;
    } catch {
      typrMapping = await loadTyprMapping();
    }
    const fontFaceEl = Array.from(doc.head.querySelectorAll("style")).find(
      (style) => {
        var _a2;
        return (_a2 = style.textContent) == null ? void 0 : _a2.includes("font-cxsecret");
      }
    );
    const base64ToUint8Array = (base64) => {
      const data = window.atob(base64);
      const buffer = new Uint8Array(data.length);
      for (let i = 0; i < data.length; ++i) {
        buffer[i] = data.charCodeAt(i);
      }
      return buffer;
    };
    const fontMap = typrMapping;
    if (fontFaceEl && Object.keys(fontMap).length > 0) {
      const font = (_b = (_a = fontFaceEl.textContent) == null ? void 0 : _a.match(/base64,([\w\W]+?)'/)) == null ? void 0 : _b[1];
      if (font) {
        $console.log("\u6B63\u5728\u8BC6\u522B\u7E41\u4F53\u5B57");
        const code = typr_js.parse(base64ToUint8Array(font));
        const match = {};
        for (let i = 19968; i < 40870; i++) {
          const Glyph = typr_js.U.codeToGlyph(code, i);
          if (!Glyph)
            continue;
          const path = typr_js.U.glyphToPath(code, Glyph);
          const hex = md5(JSON.stringify(path)).slice(24);
          match[i.toString()] = fontMap[hex];
        }
        const fonts = CXAnalyses.getSecretFont(doc);
        fonts.forEach((el2, index) => {
          let html = el2.innerHTML;
          for (const key in match) {
            const word = String.fromCharCode(parseInt(key));
            const value = String.fromCharCode(match[key]);
            while (html.indexOf(word) !== -1) {
              html = html.replace(word, value);
            }
          }
          el2.innerHTML = html;
          el2.classList.remove("font-cxsecret");
        });
        $console.log("\u8BC6\u522B\u7E41\u4F53\u5B57\u5B8C\u6210\u3002");
      } else {
        $console.log("\u672A\u68C0\u6D4B\u5230\u7E41\u4F53\u5B57\u3002");
      }
    }
  }
  async function loadTyprMapping() {
    try {
      $console.log("\u6B63\u5728\u52A0\u8F7D\u7E41\u4F53\u5B57\u5E93\u3002");
      return await request("https://cdn.ocsjs.com/resources/font/table.json", {
        type: "GM_xmlhttpRequest",
        method: "get",
        responseType: "json"
      });
    } catch (err) {
      $console.error("\u8F7D\u7E41\u4F53\u5B57\u5E93\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5\uFF1A", String(err));
    }
  }
  const CXAnalyses = {
    isInSpecialMode() {
      return Array.from((top == null ? void 0 : top.document.querySelectorAll(".catalog_points_sa,.catalog_points_er")) || []).length !== 0;
    },
    isStuckInBreakingMode() {
      if (this.isInSpecialMode()) {
        const chapter = top == null ? void 0 : top.document.querySelector(".posCatalog_active");
        if (chapter) {
          chapter.finish_count = chapter.finish_count ? chapter.finish_count + 1 : 1;
          if (chapter.finish_count >= 2) {
            chapter.finish_count = 1;
            return true;
          }
        }
      }
      return false;
    },
    isInFinalTab() {
      const tabs = Array.from((top == null ? void 0 : top.document.querySelectorAll(".prev_ul li")) || []);
      return tabs.length && tabs[tabs.length - 1].classList.contains("active");
    },
    isInFinalChapter() {
      var _a;
      return (_a = Array.from((top == null ? void 0 : top.document.querySelectorAll(".posCatalog_select")) || []).pop()) == null ? void 0 : _a.classList.contains("posCatalog_active");
    },
    isFinishedAllChapters() {
      return this.getChapterInfos().every((chapter) => chapter.unFinishCount === 0);
    },
    getChapterInfos() {
      return Array.from((top == null ? void 0 : top.document.querySelectorAll('[onclick^="getTeacherAjax"]')) || []).map((el2) => {
        var _a, _b, _c;
        return {
          chapterId: (_b = (_a = el2.getAttribute("onclick")) == null ? void 0 : _a.match(/\('(.*)','(.*)','(.*)'\)/)) == null ? void 0 : _b[3],
          unFinishCount: parseInt(((_c = el2.parentElement.querySelector(".jobUnfinishCount")) == null ? void 0 : _c.value) || "0")
        };
      });
    },
    getSecretFont(doc = document) {
      return Array.from(doc.querySelectorAll(".font-cxsecret")).map((font) => {
        const after = font.querySelector(".after");
        return after === null ? font : after;
      });
    }
  };
  function rateHack() {
    state$1.study.hacked = false;
    let dragCount = 0;
    try {
      hack2();
      window.document.addEventListener("readystatechange", hack2);
      window.addEventListener("load", hack2);
    } catch (e) {
      console.error(e);
    }
    function hack2() {
      const videojs = $gm.unsafeWindow.videojs;
      const Ext = $gm.unsafeWindow.Ext;
      if (typeof videojs !== "undefined" && typeof Ext !== "undefined") {
        if (state$1.study.hacked) {
          return;
        }
        state$1.study.hacked = true;
        const _origin = videojs.getPlugin("seekBarControl");
        const plugin = videojs.extend(videojs.getPlugin("plugin"), {
          constructor: function(videoExt, data) {
            const _sendLog = data.sendLog;
            data.sendLog = (...args) => {
              var _a;
              if (args[1] === "drag") {
                dragCount++;
                if (dragCount > 100) {
                  dragCount = 0;
                  (_a = $el("video")) == null ? void 0 : _a.pause();
                }
              } else {
                _sendLog.apply(data, args);
              }
            };
            _origin.apply(_origin.prototype, [videoExt, data]);
          }
        });
        videojs.registerPlugin("seekBarControl", plugin);
        Ext.define("ans.VideoJs", {
          override: "ans.VideoJs",
          constructor: function(data) {
            this.addEvents(["seekstart"]);
            this.mixins.observable.constructor.call(this, data);
            const vjs = videojs(data.videojs, this.params2VideoOpt(data.params), function() {
            });
            Ext.fly(data.videojs).on("contextmenu", function(f) {
              f.preventDefault();
            });
            Ext.fly(data.videojs).on("keydown", function(f) {
              if (f.keyCode === 32 || f.keyCode === 37 || f.keyCode === 39 || f.keyCode === 107) {
                f.preventDefault();
              }
            });
            if (vjs.videoJsResolutionSwitcher) {
              vjs.on("resolutionchange", function() {
                const cr = vjs.currentResolution();
                const re2 = cr.sources ? cr.sources[0].res : false;
                Ext.setCookie("resolution", re2);
              });
            }
            if (vjs.videoJsPlayLine) {
              vjs.on("playlinechange", function() {
                const cp = vjs.currentPlayline();
                Ext.setCookie("net", cp.net);
              });
            }
          }
        });
      }
    }
  }
  async function study(opts2) {
    var _a;
    await $.sleep(3e3);
    const searchedJobs = [];
    let searching = true;
    let attachmentCount = ((_a = $gm.unsafeWindow.attachments) == null ? void 0 : _a.length) || 0;
    setTimeout(() => {
      searching = false;
    }, 10 * 1e3);
    const runJobs = async () => {
      const job = searchJob(opts2, searchedJobs);
      if (job && job.func) {
        try {
          await job.func();
        } catch (e) {
          $console.error("\u672A\u77E5\u9519\u8BEF", e);
        }
        await $.sleep(1e3);
        await runJobs();
      } else if (attachmentCount > 0) {
        attachmentCount--;
        await $.sleep(1e3);
        await runJobs();
      } else if (searching) {
        await $.sleep(1e3);
        await runJobs();
      }
    };
    await runJobs();
    top._preChapterId = "";
    const next = () => {
      var _a2;
      const curCourseId = $el("#curCourseId", top == null ? void 0 : top.document);
      const curChapterId = $el("#curChapterId", top == null ? void 0 : top.document);
      const curClazzId = $el("#curClazzId", top == null ? void 0 : top.document);
      const count = $$el("#prev_tab .prev_ul li", top == null ? void 0 : top.document);
      if (CXAnalyses.isInFinalTab()) {
        if (CXAnalyses.isStuckInBreakingMode()) {
          return $modal("alert", {
            content: "\u68C0\u6D4B\u5230\u6B64\u7AE0\u8282\u91CD\u590D\u8FDB\u5165, \u4E3A\u4E86\u907F\u514D\u65E0\u9650\u91CD\u590D, \u8BF7\u81EA\u884C\u624B\u52A8\u5B8C\u6210\u540E\u624B\u52A8\u70B9\u51FB\u4E0B\u4E00\u7AE0, \u6216\u8005\u5237\u65B0\u91CD\u8BD5\u3002"
          });
        }
      }
      if (CXAnalyses.isInFinalChapter()) {
        if (CXAnalyses.isFinishedAllChapters()) {
          $modal("alert", { content: "\u5168\u90E8\u4EFB\u52A1\u70B9\u5DF2\u5B8C\u6210\uFF01" });
        } else {
          $modal("alert", { content: "\u5DF2\u7ECF\u62B5\u8FBE\u6700\u540E\u4E00\u4E2A\u7AE0\u8282\uFF01\u4F46\u4ECD\u7136\u6709\u4EFB\u52A1\u70B9\u672A\u5B8C\u6210\uFF0C\u8BF7\u624B\u52A8\u5207\u6362\u81F3\u672A\u5B8C\u6210\u7684\u7AE0\u8282\u3002" });
        }
      } else {
        if (curChapterId && curCourseId && curClazzId) {
          top._preChapterId = curChapterId.value;
          (_a2 = $gm.unsafeWindow.top) == null ? void 0 : _a2.PCount.next(
            count.length.toString(),
            curChapterId.value,
            curCourseId.value,
            curClazzId.value,
            ""
          );
        } else {
          $console.warn("\u53C2\u6570\u9519\u8BEF\uFF0C\u65E0\u6CD5\u8DF3\u8F6C\u4E0B\u4E00\u7AE0\uFF0C\u8BF7\u5C1D\u8BD5\u624B\u52A8\u5207\u6362\u3002");
        }
      }
    };
    if (CXProject.scripts.study.cfg.autoNextPage) {
      $console.info("\u9875\u9762\u4EFB\u52A1\u70B9\u5DF2\u5B8C\u6210\uFF0C\u5373\u5C06\u5207\u6362\u4E0B\u4E00\u7AE0\u3002");
      await $.sleep(5e3);
      next();
    } else {
      $console.warn("\u9875\u9762\u4EFB\u52A1\u70B9\u5DF2\u5B8C\u6210\uFF0C\u81EA\u52A8\u4E0B\u4E00\u7AE0\u5DF2\u5173\u95ED\uFF0C\u8BF7\u624B\u52A8\u5207\u6362\u3002");
    }
  }
  function searchIFrame(root2) {
    var _a, _b;
    let list = Array.from(root2.querySelectorAll("iframe"));
    const result = [];
    while (list.length) {
      const frame = list.shift();
      try {
        if (frame && ((_a = frame == null ? void 0 : frame.contentWindow) == null ? void 0 : _a.document)) {
          result.push(frame);
          const frames = (_b = frame == null ? void 0 : frame.contentWindow) == null ? void 0 : _b.document.querySelectorAll("iframe");
          list = list.concat(Array.from(frames || []));
        }
      } catch (e) {
        console.log(e.message);
      }
    }
    return result;
  }
  function searchJob(opts2, searchedJobs) {
    const knowCardWin = $gm.unsafeWindow;
    const searchJobElement = (root2) => {
      return domSearch(
        {
          media: "video,audio",
          chapterTest: ".TiMu",
          read: "#img.imglook"
        },
        root2.contentWindow.document
      );
    };
    const search = (root2) => {
      const win = root2.contentWindow;
      const { media, read, chapterTest } = searchJobElement(root2);
      if (win && (media || read || chapterTest)) {
        const doc = win.document;
        const attachment = knowCardWin.attachments[getValidNumber(win._jobindex, win.parent._jobindex)];
        if (attachment && searchedJobs.find((job2) => job2.mid === attachment.property.mid) === void 0) {
          const { name, title, bookname, author } = attachment.property;
          const jobName = name || title || (bookname ? bookname + author : void 0) || "\u672A\u77E5\u4EFB\u52A1";
          let func;
          if (media) {
            if (!CXProject.scripts.study.cfg.enableMedia) {
              $console.warn(`\u97F3\u89C6\u9891\u81EA\u52A8\u5B66\u4E60\u529F\u80FD\u5DF2\u5173\u95ED\u3002${jobName} \u5373\u5C06\u8DF3\u8FC7`);
            } else {
              if (opts2.restudy || attachment.job) {
                func = () => {
                  $console.log(`\u5373\u5C06${opts2.restudy ? "\u91CD\u65B0" : ""}\u64AD\u653E : `, jobName);
                  return mediaTask(opts2, media, doc);
                };
              }
            }
          } else if (chapterTest) {
            if (!CXProject.scripts.study.cfg.enableChapterTest) {
              $console.warn(`\u7AE0\u8282\u6D4B\u8BD5\u81EA\u52A8\u7B54\u9898\u529F\u80FD\u5DF2\u5173\u95ED\u3002${jobName} \u5373\u5C06\u8DF3\u8FC7`);
            } else {
              if (attachment.job) {
                func = () => {
                  $console.log("\u5F00\u59CB\u7B54\u9898 : ", jobName);
                  return chapterTestTask(root2, opts2.workOptions);
                };
              }
            }
          } else if (read) {
            if (!CXProject.scripts.study.cfg.enablePPT) {
              $console.warn(`PPT/\u4E66\u7C4D\u9605\u8BFB\u529F\u80FD\u5DF2\u5173\u95ED\u3002${jobName} \u5373\u5C06\u8DF3\u8FC7`);
            } else {
              if (attachment.job) {
                func = () => {
                  $console.log("\u6B63\u5728\u5B66\u4E60 \uFF1A", jobName);
                  return readTask(win);
                };
              }
            }
          }
          const job2 = {
            mid: attachment.property.mid,
            attachment,
            func
          };
          searchedJobs.push(job2);
          return job2;
        }
      } else {
        return void 0;
      }
    };
    let job;
    for (const iframe of searchIFrame(knowCardWin.document)) {
      job = search(iframe);
      if (job) {
        return job;
      }
    }
    return job;
  }
  function fixedVideoProgress$1() {
    if (state$1.study.videojs) {
      const { bar } = domSearch({ bar: ".vjs-control-bar" }, state$1.study.videojs);
      if (bar) {
        bar.style.opacity = "1";
      }
    }
  }
  async function mediaTask(setting, media, doc) {
    const { playbackRate = 1, volume: volume2 = 0 } = setting;
    const { videojs } = domSearch({ videojs: "#video,#audio" }, doc);
    if (!videojs) {
      $console.error("\u89C6\u9891\u68C0\u6D4B\u4E0D\u5230\uFF0C\u8BF7\u5C1D\u8BD5\u5237\u65B0\u6216\u8005\u624B\u52A8\u5207\u6362\u4E0B\u4E00\u7AE0\u3002");
      return;
    }
    state$1.study.videojs = videojs;
    top.currentMedia = media;
    fixedVideoProgress$1();
    let reloadInterval;
    if (setting.reloadVideoWhenError) {
      reloadInterval = setInterval(() => {
        if (doc.documentElement.innerText.includes("\u7F51\u7EDC\u9519\u8BEF\u5BFC\u81F4\u89C6\u9891\u4E0B\u8F7D\u4E2D\u9014\u5931\u8D25")) {
          $console.error("\u89C6\u9891\u52A0\u8F7D\u5931\u8D25\uFF0C\u5373\u5C06\u5237\u65B0\u9875\u9762");
          setTimeout(() => {
            location.reload();
          }, 3e3);
        }
      }, 5e3);
    }
    await new Promise((resolve, reject) => {
      const playFunction = async () => {
        if (!media.ended) {
          await $.sleep(1e3);
          media.play();
          media.playbackRate = playbackRate;
        }
      };
      media.addEventListener("pause", playFunction);
      media.addEventListener("ended", () => {
        $console.log("\u89C6\u9891\u64AD\u653E\u5B8C\u6BD5");
        media.removeEventListener("pause", playFunction);
        clearInterval(reloadInterval);
        resolve();
      });
      $console.log("\u89C6\u9891\u5F00\u59CB\u64AD\u653E");
      media.volume = volume2;
      playMedia(() => media.play()).then(() => {
        media.playbackRate = playbackRate;
      }).catch(reject);
    });
  }
  async function readTask(win) {
    const finishJob = win.finishJob;
    if (finishJob)
      finishJob();
    await $.sleep(3e3);
  }
  async function chapterTestTask(frame, { answererWrappers, period, upload, thread, stopSecondWhenFinish, redundanceWordsText }) {
    if (answererWrappers === void 0 || answererWrappers.length === 0) {
      return $console.warn("\u68C0\u6D4B\u5230\u9898\u5E93\u914D\u7F6E\u4E3A\u7A7A\uFF0C\u65E0\u6CD5\u81EA\u52A8\u7B54\u9898\uFF0C\u8BF7\u524D\u5F80 \u201C\u901A\u7528-\u5168\u5C40\u8BBE\u7F6E\u201D \u9875\u9762\u8FDB\u884C\u914D\u7F6E\u3002");
    }
    $console.info("\u5F00\u59CB\u7AE0\u8282\u6D4B\u8BD5");
    const frameWindow = frame.contentWindow;
    const { TiMu } = domSearchAll({ TiMu: ".TiMu" }, frameWindow.document);
    CommonProject.scripts.workResults.methods.init();
    const chapterTestTaskQuestionTitleTransform = (titles) => {
      const transformed = StringUtils.of(
        titles.map((t2) => t2 ? optimizationElementWithImage(t2).innerText : "").join(",")
      ).nowrap().nospace().toString().trim().replace(/^\d+[。、.]/, "").replace(/（\d+.\d+分）/, "").replace(/\(..题, .+?分\)/, "").replace(/[[(【（](.+题|名词解释|完形填空|阅读理解)[\])】）]/, "").trim();
      return removeRedundantWords(transformed, redundanceWordsText.split("\n"));
    };
    const worker = new OCSWorker({
      root: TiMu,
      elements: {
        title: ".Zy_TItle .clearfix",
        options: "ul li .after,ul li textarea,ul textarea,ul li label:not(.before)",
        type: 'input[id^="answertype"]',
        lineAnswerInput: ".line_answer input[name^=answer]",
        lineSelectBox: ".line_answer_ct .selectBox "
      },
      requestPeriod: period != null ? period : 3,
      resolvePeriod: 0,
      thread: thread != null ? thread : 1,
      answerer: (elements, type, ctx) => {
        const title = chapterTestTaskQuestionTitleTransform(elements.title);
        if (title) {
          return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, () => {
            return defaultAnswerWrapperHandler(answererWrappers, {
              type,
              title,
              options: ctx.elements.options.map((o) => o.innerText).join("\n")
            });
          });
        } else {
          throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
        }
      },
      work: async (ctx) => {
        var _a;
        const { elements, searchInfos } = ctx;
        const typeInput = elements.type[0];
        const type = typeInput ? getQuestionType$1(parseInt(typeInput.value)) : void 0;
        if (type && (type === "completion" || type === "multiple" || type === "judgement" || type === "single")) {
          const resolver = defaultQuestionResolve(ctx)[type];
          const handler = (type2, answer, option, ctx2) => {
            var _a2, _b, _c, _d, _e;
            if (type2 === "judgement" || type2 === "single" || type2 === "multiple") {
              if (((_b = (_a2 = option == null ? void 0 : option.parentElement) == null ? void 0 : _a2.querySelector("label input")) == null ? void 0 : _b.getAttribute("checked")) === "checked")
                ;
              else {
                option == null ? void 0 : option.click();
              }
            } else if (type2 === "completion" && answer.trim()) {
              const text = (_c = option == null ? void 0 : option.parentElement) == null ? void 0 : _c.querySelector("textarea");
              const textareaFrame = (_d = option == null ? void 0 : option.parentElement) == null ? void 0 : _d.querySelector("iframe");
              if (text) {
                text.value = answer;
              }
              if (textareaFrame == null ? void 0 : textareaFrame.contentDocument) {
                textareaFrame.contentDocument.body.innerHTML = answer;
              }
              if (option == null ? void 0 : option.parentElement) {
                (_e = $el("[onclick*=saveQuestion]", option.parentElement)) == null ? void 0 : _e.click();
              }
            }
          };
          return await resolver(
            searchInfos,
            elements.options.map((option) => optimizationElementWithImage(option)),
            handler
          );
        } else if (type && type === "line") {
          for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
            let ans = answers;
            if (ans.length === 1) {
              ans = splitAnswer(ans[0]);
            }
            if (ans.filter(Boolean).length !== 0 && elements.lineAnswerInput) {
              for (let index = 0; index < elements.lineSelectBox.length; index++) {
                const box = elements.lineSelectBox[index];
                if (ans[index]) {
                  (_a = $el(`li[data=${ans[index]}] a`, box)) == null ? void 0 : _a.click();
                  await $.sleep(200);
                }
              }
              return { finish: true };
            }
          }
          return { finish: false };
        }
        return { finish: false };
      },
      async onResultsUpdate(res, curr) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i;
        CommonProject.scripts.workResults.methods.setResults(
          simplifyWorkResult(res, chapterTestTaskQuestionTitleTransform)
        );
        if (!((_a = curr.result) == null ? void 0 : _a.finish) && curr.resolving === false) {
          const options = ((_c = (_b = curr.ctx) == null ? void 0 : _b.elements) == null ? void 0 : _c.options) || [];
          const typeInput = (_e = (_d = curr.ctx) == null ? void 0 : _d.elements) == null ? void 0 : _e.type[0];
          const type = typeInput ? getQuestionType$1(parseInt(typeInput.value)) : void 0;
          const commonSetting = CommonProject.scripts.settings.cfg;
          if (commonSetting["randomWork-choice"] && (type === "judgement" || type === "single" || type === "multiple")) {
            $console.log("\u6B63\u5728\u968F\u673A\u4F5C\u7B54");
            const option = options[Math.floor(Math.random() * options.length)];
            (_g = (_f = option == null ? void 0 : option.parentElement) == null ? void 0 : _f.querySelector("a,label")) == null ? void 0 : _g.click();
          } else if (commonSetting["randomWork-complete"] && type === "completion") {
            $console.log("\u6B63\u5728\u968F\u673A\u4F5C\u7B54");
            for (const option of options) {
              const textarea = (_h = option == null ? void 0 : option.parentElement) == null ? void 0 : _h.querySelector("textarea");
              const completeTexts = commonSetting["randomWork-completeTexts-textarea"].split("\n").filter(Boolean);
              const text = completeTexts[Math.floor(Math.random() * completeTexts.length)];
              const textareaFrame = (_i = option == null ? void 0 : option.parentElement) == null ? void 0 : _i.querySelector("iframe");
              if (text) {
                if (textarea) {
                  textarea.value = text;
                }
                if (textareaFrame == null ? void 0 : textareaFrame.contentDocument) {
                  textareaFrame.contentDocument.body.innerHTML = text;
                }
              } else {
                $console.error("\u8BF7\u8BBE\u7F6E\u968F\u673A\u586B\u7A7A\u7684\u6587\u6848");
              }
              await $.sleep(500);
            }
          }
        }
      },
      onResolveUpdate(res) {
        var _a;
        if ((_a = res.result) == null ? void 0 : _a.finish) {
          CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
            simplifyWorkResult([res], chapterTestTaskQuestionTitleTransform)
          );
        }
        CommonProject.scripts.workResults.methods.updateWorkState(worker);
      },
      async onElementSearched(elements) {
        const typeInput = elements.type[0];
        const type = typeInput ? getQuestionType$1(parseInt(typeInput.value)) : void 0;
        if (type === "judgement") {
          elements.options.forEach((option) => {
            const ri = option.querySelector(".ri");
            const span = document.createElement("span");
            span.innerText = ri ? "\u221A" : "\xD7";
            option.appendChild(span);
          });
        }
      }
    });
    const results = await worker.doWork();
    $message("success", { content: `\u7B54\u9898\u5B8C\u6210\uFF0C\u5C06\u7B49\u5F85 ${stopSecondWhenFinish} \u79D2\u540E\u8FDB\u884C\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002` });
    await $.sleep(stopSecondWhenFinish * 1e3);
    await worker.uploadHandler({
      type: upload,
      results,
      async callback(finishedRate, uploadable) {
        $console.info(`\u5B8C\u6210\u7387 ${finishedRate.toFixed(2)} :  ${uploadable ? "5\u79D2\u540E\u5C06\u81EA\u52A8\u63D0\u4EA4" : "5\u79D2\u540E\u5C06\u81EA\u52A8\u4FDD\u5B58"} `);
        await $.sleep(5e3);
        if (uploadable) {
          frameWindow.btnBlueSubmit();
          await $.sleep(3e3);
          frameWindow.submitCheckTimes();
        } else {
          frameWindow.alert = () => {
          };
          frameWindow.noSubmit();
        }
      }
    });
    worker.emit("done");
  }
  function getValidNumber(...nums) {
    return nums.map((num) => typeof num === "number" ? num : void 0).find((num) => num !== void 0);
  }
  function getQuestionType$1(val) {
    return val === 0 ? "single" : val === 1 ? "multiple" : val === 3 ? "judgement" : [2, 4, 5, 6, 7].some((t2) => t2 === val) ? "completion" : val === 11 ? "line" : val === 14 ? "fill" : val === 15 ? "reader" : void 0;
  }
  async function readerAndFillHandle(searchInfos, list) {
    var _a;
    for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
      let ans = answers;
      if (ans.length === 1) {
        ans = splitAnswer(ans[0]);
      }
      if (ans.filter(Boolean).length !== 0 && list.length !== 0) {
        for (let index = 0; index < ans.length; index++) {
          const item = list[index];
          if (item) {
            (_a = $el(`span.saveSingleSelect[data="${ans[index]}"]`, item)) == null ? void 0 : _a.click();
            await $.sleep(200);
          }
        }
        return { finish: true };
      }
    }
    return { finish: false };
  }
  const state = {
    study: {
      currentMedia: void 0,
      currentStudyLockId: 0
    }
  };
  const _StudyLock = class {
    constructor() {
      _StudyLock.auto_inc++;
      this.id = _StudyLock.auto_inc;
      state.study.currentStudyLockId = this.id;
    }
    canStudy() {
      return this.id === state.study.currentStudyLockId;
    }
    static getLock() {
      return new _StudyLock();
    }
  };
  let StudyLock = _StudyLock;
  StudyLock.auto_inc = 0;
  const IcveMoocProject = Project.create({
    name: "\u667A\u6167\u804C\u6559(MOOC\u5B66\u9662)",
    domains: ["icve.com.cn", "course.icve.com.cn"],
    studyProject: true,
    scripts: {
      guide: new Script({
        name: "\u{1F4A1} \u4F7F\u7528\u63D0\u793A",
        url: [["\u9996\u9875", "user.icve.com.cn"]],
        namespace: "icve.guide",
        configs: {
          notes: {
            defaultValue: $creator.notes(["\u70B9\u51FB\u4EFB\u610F\u8BFE\u7A0B\u8FDB\u5165\u3002"]).outerHTML
          }
        },
        oncomplete() {
          CommonProject.scripts.render.methods.pin(this);
        }
      }),
      study: new Script({
        name: "\u{1F5A5}\uFE0F \u8BFE\u7A0B\u5B66\u4E60",
        namespace: "icve.study.main",
        url: [["\u8BFE\u7A0B\u5B66\u4E60\u9875\u9762", "course.icve.com.cn/learnspace/learn/learn/templateeight/index.action"]],
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u5982\u679C\u89C6\u9891\u65E0\u6CD5\u64AD\u653E\uFF0C\u53EF\u4EE5\u624B\u52A8\u70B9\u51FB\u5176\u4ED6\u4EFB\u52A1\u8DF3\u8FC7\u89C6\u9891\u3002",
              "\u7ECF\u8FC7\u6D4B\u8BD5\u89C6\u9891\u500D\u901F\u6700\u591A\u4E8C\u500D\uFF0C\u5426\u5219\u4F1A\u5224\u5B9A\u65E0\u6548\u3002",
              "\u624B\u52A8\u8FDB\u5165\u4F5C\u4E1A\u9875\u9762\u624D\u80FD\u4F7F\u7528\u81EA\u52A8\u7B54\u9898\u3002"
            ]).outerHTML
          },
          playbackRate: {
            label: "\u89C6\u9891\u500D\u901F",
            attrs: {
              type: "range",
              step: 0.5,
              min: 1,
              max: 16
            },
            defaultValue: 1,
            onload() {
              createRangeTooltip(
                this,
                "1",
                (val) => (parseFloat(val) > 2 ? `${val}x - \u9AD8\u500D\u901F\u8B66\u544A\uFF01` : `${val}x`) + "\u9AD8\u500D\u901F\u53EF\u80FD\u5BFC\u81F4\u89C6\u9891\u65E0\u6CD5\u5B8C\u6210\u3002"
              );
            }
          },
          volume,
          restudy,
          showScrollBar: {
            label: "\u663E\u793A\u53F3\u4FA7\u6EDA\u52A8\u6761",
            attrs: { type: "checkbox" },
            defaultValue: true
          },
          expandAll: {
            label: "\u5C55\u5F00\u6240\u6709\u7AE0\u8282",
            attrs: { type: "checkbox" },
            defaultValue: true
          },
          switchPeriod: {
            label: "\u4E0B\u4E00\u7AE0\u8282\u5207\u6362\u95F4\u9694\uFF08\u79D2\uFF09",
            defaultValue: 10,
            attrs: {
              type: "number",
              min: 0,
              max: 999,
              step: 1
            }
          }
        },
        async oncomplete() {
          var _a;
          CommonProject.scripts.render.methods.pin(this);
          await $.sleep(3e3);
          this.onConfigChange("volume", (v) => state.study.currentMedia && (state.study.currentMedia.volume = v));
          this.onConfigChange(
            "playbackRate",
            (r) => state.study.currentMedia && (state.study.currentMedia.playbackRate = parseFloat(r.toString()))
          );
          const mainContentWin = (_a = $el("#mainContent")) == null ? void 0 : _a.contentWindow;
          if (mainContentWin) {
            $modal("confirm", {
              content: el("div", [
                "\u662F\u5426\u5F00\u59CB\u81EA\u52A8\u5B66\u4E60\u5F53\u524D\u7AE0\u8282\uFF1F",
                el("br"),
                "\u4F60\u4E5F\u53EF\u4EE5\u9009\u62E9\u4EFB\u610F\u7684\u7AE0\u8282\u8FDB\u884C\u70B9\u51FB\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u5B66\u4E60\uFF0C\u5E76\u4E00\u76F4\u5F80\u4E0B\u5BFB\u627E\u7AE0\u8282\u3002"
              ]),
              cancelButtonText: "\u6211\u60F3\u624B\u52A8\u9009\u62E9\u7AE0\u8282",
              confirmButtonText: "\u5F00\u59CB\u5B66\u4E60",
              async onConfirm() {
                study2(StudyLock.getLock());
                scrollToJob();
              }
            });
          }
          if (this.cfg.showScrollBar) {
            const bar = $el(".dumascroll_area", mainContentWin.document);
            bar && (bar.style.overflow = "auto");
          }
          if (this.cfg.expandAll) {
            $$el(".s_sectionlist,.s_sectionwrap", mainContentWin.document).forEach((el2) => el2.style.display = "block");
          }
          for (const job of $$el(".s_point", mainContentWin.document)) {
            job.addEventListener("click", (e) => {
              const lock = StudyLock.getLock();
              if (e.isTrusted) {
                if (job.getAttribute("itemtype") === "exam") {
                  return $message("info", {
                    duration: 60,
                    content: "\u68C0\u6D4B\u5230\u60A8\u624B\u52A8\u9009\u62E9\u4E86\u4F5C\u4E1A/\u8003\u8BD5\u7AE0\u8282\uFF0C\u5C06\u4E0D\u4F1A\u81EA\u52A8\u8DF3\u8F6C\uFF0C\u8BF7\u5B8C\u6210\u540E\u624B\u52A8\u9009\u62E9\u5176\u4ED6\u7AE0\u8282\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u5B66\u4E60\u3002"
                  });
                } else {
                  $message("info", { content: "\u68C0\u6D4B\u5230\u7AE0\u8282\u5207\u6362\uFF0C\u5373\u5C06\u81EA\u52A8\u5B66\u4E60..." });
                }
              }
              setTimeout(() => {
                study2(lock);
              }, 3e3);
            });
          }
          const scrollToJob = () => {
            var _a2;
            return (_a2 = $el(".s_pointerct", mainContentWin.document)) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth", block: "center" });
          };
          const study2 = async (studyLock) => {
            var _a2;
            const iframe = $el("iframe", mainContentWin.document);
            const win = iframe == null ? void 0 : iframe.contentWindow;
            if (win) {
              const doc = win.document;
              if (iframe.src.includes("content_video.action") || iframe.src.includes("content_audio.action")) {
                $console.log("\u89C6\u9891/\u97F3\u9891\u64AD\u653E\u4E2D...");
                try {
                  const media = await waitForMedia({ root: doc });
                  state.study.currentMedia = media;
                  media.playbackRate = parseFloat(this.cfg.playbackRate.toString());
                  media.volume = this.cfg.volume;
                  media.currentTime = 0;
                  await new Promise((resolve, reject) => {
                    try {
                      win.jwplayer().onComplete(async () => {
                        $console.log("\u89C6\u9891/\u97F3\u9891\u64AD\u653E\u5B8C\u6210\u3002");
                        await $.sleep(3e3);
                        resolve();
                      });
                      media.addEventListener("pause", async () => {
                        if (!media.ended) {
                          await waitForPopupQuestion(doc);
                          await $.sleep(1e3);
                          playMedia(() => media.play());
                        }
                      });
                      playMedia(() => media.play());
                    } catch (err) {
                      reject(err);
                    }
                  });
                } catch (err) {
                  $message("error", { content: String(err) });
                }
              } else if (iframe.src.includes("content_doc.action")) {
                await $.sleep(5e3);
              }
            }
            await $.sleep(this.cfg.switchPeriod * 1e3);
            if (studyLock.canStudy()) {
              let nextEl;
              let isBellowCurrentPont = false;
              const jobs = $$el(".s_point", mainContentWin.document);
              for (let index = 0; index < jobs.length; index++) {
                const job = jobs[index];
                if (job.classList.contains("s_pointerct")) {
                  isBellowCurrentPont = true;
                } else if (isBellowCurrentPont) {
                  if (job.querySelector(".done_icon_show") === null) {
                    $console.log("\u4E0B\u4E00\u7AE0\uFF1A", ((_a2 = $el(".s_pointti", job)) == null ? void 0 : _a2.title) || "\u672A\u77E5");
                    nextEl = job;
                    break;
                  }
                }
              }
              if (nextEl) {
                nextEl.click();
                scrollToJob();
              } else {
                $modal("alert", { content: "\u5168\u90E8\u4EFB\u52A1\u5DF2\u5B8C\u6210" });
              }
            }
          };
        }
      }),
      work: new Script({
        name: "\u270D\uFE0F \u4F5C\u4E1A\u8003\u8BD5\u811A\u672C",
        url: [["\u4F5C\u4E1A\u8003\u8BD5\u9875\u9762", "spoc-exam.icve.com.cn/exam"]],
        namespace: "icve.work",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u81EA\u52A8\u7B54\u9898\u524D\u8BF7\u5728 \u201C\u901A\u7528-\u5168\u5C40\u8BBE\u7F6E\u201D \u4E2D\u8BBE\u7F6E\u9898\u5E93\u914D\u7F6E\u3002",
              "\u53EF\u4EE5\u642D\u914D \u201C\u901A\u7528-\u5728\u7EBF\u641C\u9898\u201D \u4E00\u8D77\u4F7F\u7528\u3002",
              "\u8BF7\u624B\u52A8\u8FDB\u5165\u4F5C\u4E1A\u8003\u8BD5\u9875\u9762\u624D\u80FD\u4F7F\u7528\u81EA\u52A8\u7B54\u9898\u3002"
            ]).outerHTML
          }
        },
        async oncomplete() {
          $message("info", { content: "\u81EA\u52A8\u7B54\u9898\u65F6\u8BF7\u52FF\u5207\u6362\u9898\u76EE\uFF0C\u5426\u5219\u53EF\u80FD\u5BFC\u81F4\u91CD\u590D\u641C\u9898\u6216\u8005\u811A\u672C\u5361\u4E3B\u3002" });
          const resetToBegin = () => {
            var _a;
            (_a = document.querySelectorAll(`.sheet_nums [id*="sheetSeq"]`).item(0)) == null ? void 0 : _a.click();
          };
          commonWork(this, {
            workerProvider: work,
            beforeRunning: async () => {
              resetToBegin();
              await $.sleep(1e3);
            },
            onRestart: () => resetToBegin()
          });
        }
      }),
      workDispatcher: new Script({
        name: "\u4F5C\u4E1A\u8C03\u5EA6\u811A\u672C",
        url: [
          ["\u4F5C\u4E1A\u8FDB\u5165\u9875\u9762", "spoc-exam.icve.com.cn/platformwebapi/student/exam/"],
          ["\u786E\u8BA4\u4F5C\u4E1A\u9875\u9762", "spoc-exam.icve.com.cn/student/exam/studentExam_studentInfo.action"]
        ],
        hideInPanel: true,
        oncomplete() {
          if (/spoc-exam.icve.com.cn\/platformwebapi\/student\/exam/.test(window.location.href)) {
            cors.on("icve-work-start", () => {
              setTimeout(() => {
                $gm.unsafeWindow.openExamInfo();
              }, 3e3);
            });
          }
          if (/spoc-exam.icve.com.cn\/student\/exam\/studentExam_studentInfo.action/.test(window.location.href)) {
            setTimeout(() => {
              $gm.unsafeWindow.enterExamPage();
            }, 3e3);
          }
        }
      })
    }
  });
  function work({ answererWrappers, period, thread }) {
    $message("info", { content: "\u5F00\u59CB\u4F5C\u4E1A" });
    CommonProject.scripts.workResults.methods.init();
    const titleTransform = (titles) => {
      return titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => {
        var _a, _b;
        if (t2) {
          const title = t2.cloneNode(true);
          (_a = title.querySelector('[name*="questionIndex"]')) == null ? void 0 : _a.remove();
          (_b = title.querySelector(".q_score")) == null ? void 0 : _b.remove();
          return title.innerText.trim().replace(/^、/, "") || "";
        }
        return "";
      }).join(",");
    };
    const workResults = [];
    let totalQuestionCount = 0;
    let requestIndex = 0;
    let resolverIndex = 0;
    const worker = new OCSWorker({
      root: ".q_content",
      elements: {
        title: ".divQuestionTitle",
        options: ".questionOptions .q_option,.questionOptions.divTextarea "
      },
      requestPeriod: period != null ? period : 3,
      resolvePeriod: 1,
      thread: thread != null ? thread : 1,
      answerer: (elements, type, ctx) => {
        const title = titleTransform(elements.title);
        if (title) {
          return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, () => {
            return defaultAnswerWrapperHandler(answererWrappers, {
              type,
              title,
              options: ctx.elements.options.map((o) => o.innerText).join("\n")
            });
          });
        } else {
          throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
        }
      },
      work: {
        handler(type, answer, option, ctx) {
          var _a, _b;
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (option.querySelector(".checkbox_on") === null) {
              (_a = $el("div", option)) == null ? void 0 : _a.click();
            }
          } else if (type === "completion" && answer.trim()) {
            const text = option.querySelector("textarea");
            const textIframe = option.querySelector('iframe[id*="ueditor"]');
            if (text) {
              text.value = answer;
            }
            if (textIframe) {
              const view = (_b = textIframe.contentWindow) == null ? void 0 : _b.document.querySelector(".view");
              if (view) {
                view.innerText = answer;
              }
            }
          }
        }
      },
      onResultsUpdate(res, currentResult) {
        if (currentResult.result) {
          workResults.push(...simplifyWorkResult([currentResult], titleTransform));
          CommonProject.scripts.workResults.methods.setResults(workResults);
          totalQuestionCount++;
          requestIndex++;
          resolverIndex++;
        }
      },
      onResolveUpdate(res) {
        var _a;
        if ((_a = res.result) == null ? void 0 : _a.finish) {
          CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(simplifyWorkResult([res], titleTransform));
        }
        CommonProject.scripts.workResults.methods.updateWorkState({
          totalQuestionCount,
          requestIndex,
          resolverIndex
        });
      }
    });
    const getNextBtn = () => document.querySelector(".paging_next");
    let next = getNextBtn();
    (async () => {
      while (next && worker.isClose === false) {
        await worker.doWork();
        await $.sleep((period != null ? period : 3) * 1e3);
        next = getNextBtn();
        if (next.style.display === "none") {
          break;
        } else {
          next == null ? void 0 : next.click();
          await $.sleep((period != null ? period : 3) * 1e3);
        }
      }
      $message("info", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "icve";
    })();
    return worker;
  }
  function waitForPopupQuestion(dom) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        var _a, _b;
        const el2 = $el(".popup-test", dom);
        if (el2) {
          clearInterval(interval);
          const right_answer = ((_a = $el("#right_answer", el2)) == null ? void 0 : _a.value) || "A";
          for (const answer of right_answer.split("")) {
            const item = $el(`li.test-item-cell[curval="${answer}"]`, el2);
            item == null ? void 0 : item.click();
          }
          (_b = $el('[name="save_btn"]', el2)) == null ? void 0 : _b.click();
          setTimeout(() => {
            var _a2;
            (_a2 = $el('[name="continue_btn"]', el2)) == null ? void 0 : _a2.click();
            resolve();
          }, 3e3);
        }
      }, 1e3);
    });
  }
  const ZJYProject = Project.create({
    name: "\u804C\u6559\u4E91",
    domains: ["icve.com.cn", "zjy2.icve.com.cn"],
    studyProject: true,
    scripts: {
      studyDispatcher: new Script({
        name: "\u{1F5A5}\uFE0F \u8BFE\u7A0B\u5B66\u4E60",
        url: [["\u8BFE\u7A0B\u9875\u9762", "zjy2.icve.com.cn/study/process/process"]],
        namespace: "zjy.study.dispatcher",
        configs: {
          notes: {
            defaultValue: "\u8BF7\u70B9\u51FB\u4EFB\u610F\u7AE0\u8282\u8FDB\u884C\u5B66\u4E60\u3002"
          }
        }
      }),
      read: new Script({
        name: "\u9605\u8BFB\u811A\u672C",
        hideInPanel: true,
        url: [["ppt\u9875\u9762", "file.icve.com.cn"]],
        async oncomplete() {
          await $.sleep(10 * 1e3);
          console.log("reading", true);
          $store.setTab("reading", true);
          const fixTime = $gm.unsafeWindow._fixTime || 10;
          while (true) {
            const { gc, Presentation } = $gm.unsafeWindow;
            const { TotalSlides } = Presentation.GetContentDetails();
            if (gc < TotalSlides) {
              console.log(gc, TotalSlides);
              await $.sleep(1e3);
              Presentation.Next();
            } else {
              break;
            }
          }
          $console.info(`PPT\u64AD\u653E\u5B8C\u6210 ${fixTime * 2} \u79D2\u540E\u5C06\u81EA\u52A8\u5207\u6362\u4E0B\u4E00\u4E2A\u4EFB\u52A1\u3002`);
          await $.sleep(1e3 * fixTime * 2);
          $store.setTab("reading", false);
        }
      }),
      study: new Script({
        name: "\u{1F5A5}\uFE0F \u5B66\u4E60\u811A\u672C",
        url: [["\u5B66\u4E60\u9875\u9762", "zjy2.icve.com.cn/common/directory/directory.html"]],
        namespace: "zjy.study.main",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u5982\u679C\u811A\u672C\u5361\u6B7B\u6216\u8005\u60A8\u4E0D\u60F3\u5B66\u4E60\uFF0C\u53EF\u4EE5\u70B9\u51FB\u4EFB\u610F\u7AE0\u8282\u7EE7\u7EED\u8FDB\u884C\u5B66\u4E60\u3002",
              "\u63D0\u793A\uFF1A\u804C\u6559\u4E91\u65E0\u6CD5\u4F7F\u7528\u500D\u901F\u3002"
            ]).outerHTML
          },
          volume
        },
        async onstart() {
          CommonProject.scripts.render.methods.pin(this);
          this.onConfigChange("volume", (volume2) => {
          });
        },
        async oncomplete() {
          await $.sleep(1e3);
          const sildeDirectory = $el(".sildeDirectory");
          sildeDirectory == null ? void 0 : sildeDirectory.click();
          await $.sleep(1e3);
          sildeDirectory == null ? void 0 : sildeDirectory.click();
          const getActiveNode = () => $el("li[data-cellid].active");
          const getActiveNodeList = () => {
            var _a, _b;
            return (_b = (_a = getActiveNode()) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.parentElement;
          };
          const getActiveModule = () => {
            var _a, _b;
            return (_b = (_a = getActiveNodeList()) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.parentElement;
          };
          const getNextNode = async () => {
            var _a, _b, _c, _d, _e, _f;
            const active = getActiveNode();
            if (active) {
              const next = $el(`li[data-upcellid="${active.dataset.cellid}"]`);
              if (next) {
                return next;
              } else {
                const list = getActiveNodeList();
                if (list) {
                  const nextList = $el(`li[data-uptopicid="${list.dataset.topicid}"]`);
                  if (nextList) {
                    if (((_a = $el(".topicCellContainer", nextList)) == null ? void 0 : _a.children.length) === 0) {
                      (_b = $el(".topicData", nextList)) == null ? void 0 : _b.click();
                      await $.sleep(5e3);
                    }
                    return $el('li[data-upcellid="0"]', nextList);
                  } else {
                    const _module = getActiveModule();
                    if (_module) {
                      const modules = $$el("[data-moduleid]");
                      let nextModule;
                      for (let index = 0; index < modules.length; index++) {
                        if (modules[index] === _module) {
                          nextModule = modules[index + 1];
                          break;
                        }
                      }
                      if (nextModule) {
                        if (((_c = $el(".moduleTopicContainer", nextModule)) == null ? void 0 : _c.children.length) === 0) {
                          (_d = $el(".moduleData", nextModule)) == null ? void 0 : _d.click();
                          await $.sleep(5e3);
                        }
                        const nextList2 = $el('li[data-uptopicid="0"]', nextModule);
                        if (nextList2) {
                          if (((_e = $el(".topicCellContainer", nextList2)) == null ? void 0 : _e.children.length) === 0) {
                            (_f = $el(".topicData", nextList2)) == null ? void 0 : _f.click();
                            await $.sleep(5e3);
                          }
                          return $el('li[data-upcellid="0"]', nextList2);
                        }
                      }
                    }
                  }
                }
              }
            }
          };
          const studyLoop = async () => {
            const studyNow = $el("#studyNow");
            if (studyNow) {
              studyNow.click();
            }
            await $.sleep(3e3);
            try {
              const active = getActiveNode();
              if (active) {
                await start(active.innerText || "\u672A\u77E5\u4EFB\u52A1", document);
                const next = await getNextNode();
                if (next) {
                  next.click();
                  await studyLoop();
                } else {
                  console.log("\u68C0\u6D4B\u4E0D\u5230\u4E0B\u4E00\u7AE0\u4EFB\u52A1\u70B9\uFF0C\u8BF7\u68C0\u67E5\u662F\u5426\u5DF2\u7ECF\u5168\u90E8\u5B8C\u6210\u3002");
                  $modal("alert", {
                    content: "\u68C0\u6D4B\u4E0D\u5230\u4E0B\u4E00\u7AE0\u4EFB\u52A1\u70B9\uFF0C\u8BF7\u68C0\u67E5\u662F\u5426\u5DF2\u7ECF\u5168\u90E8\u5B8C\u6210\u3002"
                  });
                }
              }
            } catch (error) {
              $console.error("\u672A\u77E5\u9519\u8BEF\uFF1A", error);
            }
          };
          await studyLoop();
        }
      }),
      work: new Script({
        name: "\u270D\uFE0F \u4F5C\u4E1A\u8003\u8BD5\u811A\u672C",
        url: [
          ["\u4F5C\u4E1A\u9875\u9762", "zjy2.icve.com.cn/study/homework/do.html"],
          ["\u8003\u8BD5\u9875\u9762", "zjy2.icve.com.cn/study/onlineExam/preview.html"]
        ],
        namespace: "zjy.work-and-exam",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u81EA\u52A8\u7B54\u9898\u524D\u8BF7\u5728 \u201C\u901A\u7528-\u5168\u5C40\u8BBE\u7F6E\u201D \u4E2D\u8BBE\u7F6E\u9898\u5E93\u914D\u7F6E\u3002",
              "\u53EF\u4EE5\u642D\u914D \u201C\u901A\u7528-\u5728\u7EBF\u641C\u9898\u201D \u4E00\u8D77\u4F7F\u7528\u3002",
              "\u8BF7\u624B\u52A8\u8FDB\u5165\u4F5C\u4E1A/\u8003\u8BD5\u9875\u9762\u624D\u80FD\u4F7F\u7528\u81EA\u52A8\u7B54\u9898\u3002"
            ]).outerHTML
          }
        },
        async oncomplete() {
          commonWork(this, {
            workerProvider: workAndExam
          });
        }
      })
    }
  });
  function fixedVideoProgress(doc) {
    $el(".jw-controlbar", doc);
  }
  function start(name, doc) {
    return new Promise((resolve, reject) => {
      (async () => {
        const fixTime = $gm.unsafeWindow._fixTime || 10;
        const { ppt, video, iframe, link, docPlay, nocaptcha } = domSearch(
          {
            ppt: ".page-bar",
            iframe: "iframe",
            video: "video",
            link: "#externalLinkDiv",
            docPlay: "#docPlay",
            nocaptcha: "#waf_nc_block,#nocaptcha"
          },
          doc
        );
        console.log({ doc, ppt, video, iframe, link, docPlay, nocaptcha });
        if (nocaptcha && nocaptcha.style.display !== "none") {
          $message("warn", { content: "\u8BF7\u624B\u52A8\u6ED1\u52A8\u9A8C\u8BC1\u7801\u3002" });
        } else if (video) {
          $console.info("\u5F00\u59CB\u64AD\u653E:", name);
          const _video = video;
          const jp = $gm.unsafeWindow.jwplayer($gm.unsafeWindow.$(".video_container").attr("id"));
          video.onended = async () => {
            $console.info("\u89C6\u9891\u7ED3\u675F\uFF1A", name);
            await $.sleep(3e3);
            resolve();
          };
          fixedVideoProgress(doc);
          _video.volume = 0;
          if (_video.paused) {
            playMedia(() => jp.play());
          }
        } else if (iframe && iframe.src.startsWith("https://file.icve.com.cn")) {
          const id = await $store.addTabChangeListener("reading", (reading) => {
            if (reading === false) {
              $store.removeTabChangeListener("reading", id);
              resolve();
            }
          }) || 0;
        } else if (ppt) {
          $console.info("\u5F00\u59CB\u64AD\u653E: ", name);
          const { pageCount, pageCurrentCount, pageNext } = domSearch({
            pageCount: ".MPreview-pageCount",
            pageNext: ".MPreview-pageNext",
            pageCurrentCount: ".MPreview-pageInput"
          });
          if (pageCurrentCount && pageCount && pageNext) {
            let count = parseInt(pageCurrentCount.value);
            const total = parseInt(pageCount.innerText.replace("/", "").trim() || "0");
            while (count <= total) {
              pageNext.click();
              await $.sleep(1e3);
              count++;
            }
            $console.info(`${name} \u64AD\u653E\u5B8C\u6210, ${fixTime * 2} \u79D2\u540E\u5C06\u81EA\u52A8\u5207\u6362\u4E0B\u4E00\u4E2A\u4EFB\u52A1\u3002`);
            await $.sleep(1e3 * fixTime * 2);
            resolve();
          } else {
            $message("error", { content: "\u672A\u627E\u5230PPT\u8FDB\u5EA6\uFF0C\u8BF7\u5237\u65B0\u91CD\u8BD5\u6216\u8005\u8DF3\u8FC7\u6B64\u4EFB\u52A1\u3002" });
          }
        } else if (link && link.style.display !== "none" || docPlay) {
          $console.info(`${name} \u67E5\u770B\u5B8C\u6210\uFF0C${fixTime}\u79D2\u540E\u4E0B\u4E00\u4E2A\u4EFB\u52A1`);
          await $.sleep(1e3 * fixTime + 1);
          resolve();
        } else {
          $console.error(`${name} : \u672A\u77E5\u7684\u8BFE\u4EF6\u7C7B\u578B\uFF0C\u8BF7\u8054\u7CFB\u4F5C\u8005\u8FDB\u884C\u53CD\u9988\uFF0C${fixTime}\u79D2\u540E\u4E0B\u4E00\u4E2A\u4EFB\u52A1\u3002`);
          await $.sleep(1e3 * fixTime + 1);
          resolve();
        }
      })();
    });
  }
  function workAndExam({ answererWrappers, period, redundanceWordsText, thread }) {
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "zjy"
    });
    const titleTransform = (titles) => {
      return removeRedundantWords(
        titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => t2 ? optimizationElementWithImage(t2).innerText : "").join(","),
        redundanceWordsText.split("\n")
      );
    };
    const worker = new OCSWorker({
      root: ".e-q-body",
      elements: {
        title: ".e-q-q",
        options: "li.e-a"
      },
      requestPeriod: period != null ? period : 3,
      resolvePeriod: 0,
      thread: thread != null ? thread : 1,
      answerer: (elements, type, ctx) => {
        const title = titleTransform(elements.title);
        if (title) {
          return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, () => {
            return defaultAnswerWrapperHandler(answererWrappers, {
              type,
              title,
              options: ctx.elements.options.map((o) => o.innerText).join("\n")
            });
          });
        } else {
          throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
        }
      },
      work: async (ctx) => {
        const { elements, searchInfos, root: root2 } = ctx;
        const questionTypeNum = parseInt(root2.getAttribute("data-questiontype") || "-1");
        const type = getQuestionType(questionTypeNum);
        if (type && (type === "completion" || type === "multiple" || type === "judgement" || type === "single")) {
          const handler = (type2, answer, option, ctx2) => {
            if (type2 === "judgement" || type2 === "single" || type2 === "multiple") {
              if (option.classList.contains("checked"))
                ;
              else {
                option.click();
              }
            } else if (type2 === "completion" && answer.trim()) {
              const text = option.querySelector("textarea");
              if (text) {
                text.value = answer;
              }
            }
          };
          return await defaultQuestionResolve(ctx)[type](
            searchInfos,
            elements.options.map((option) => optimizationElementWithImage(option)),
            handler
          );
        }
        return { finish: false };
      },
      async onResultsUpdate(res, curr) {
        CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, titleTransform));
      },
      onResolveUpdate(res) {
        var _a;
        if ((_a = res.result) == null ? void 0 : _a.finish) {
          CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(simplifyWorkResult([res], titleTransform));
        }
        CommonProject.scripts.workResults.methods.updateWorkState(worker);
      }
    });
    worker.doWork().then(() => {
      $message("info", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      worker.emit("done");
    }).catch((err) => {
      $message("error", { content: `\u4F5C\u4E1A/\u8003\u8BD5\u5931\u8D25: ${err}`, duration: 0 });
    });
    return worker;
  }
  function getQuestionType(questionTypeNum) {
    return questionTypeNum === 1 ? "single" : questionTypeNum === 2 ? "multiple" : questionTypeNum === 3 ? "judgement" : questionTypeNum === 4 ? "completion" : questionTypeNum === 4 ? "completion" : "unknown";
  }
  function definedProjects() {
    return [ZHSProject, CXProject, IcveMoocProject, ZJYProject, CommonProject, BackgroundProject];
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
  exports2.BackgroundProject = BackgroundProject;
  exports2.BaseScript = BaseScript;
  exports2.CXProject = CXProject;
  exports2.CommonEventEmitter = CommonEventEmitter;
  exports2.CommonProject = CommonProject;
  exports2.ConfigElement = ConfigElement;
  exports2.ContainerElement = ContainerElement;
  exports2.CorsEventEmitter = CorsEventEmitter;
  exports2.GMStoreProvider = GMStoreProvider;
  exports2.HeaderElement = HeaderElement;
  exports2.IcveMoocProject = IcveMoocProject;
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
  exports2.ZHSProject = ZHSProject;
  exports2.ZJYProject = ZJYProject;
  exports2.answerSimilar = answerSimilar;
  exports2.clearString = clearString;
  exports2.cors = cors;
  exports2.defaultAnswerWrapperHandler = defaultAnswerWrapperHandler;
  exports2.defaultQuestionResolve = defaultQuestionResolve;
  exports2.defaultWorkTypeResolver = defaultWorkTypeResolver;
  exports2.definedCustomElements = definedCustomElements;
  exports2.definedProjects = definedProjects;
  exports2.domSearch = domSearch;
  exports2.domSearchAll = domSearchAll;
  exports2.el = el;
  exports2.enableElementDraggable = enableElementDraggable;
  exports2.isPlainAnswer = isPlainAnswer;
  exports2.removeRedundant = removeRedundant;
  exports2.request = request;
  exports2.splitAnswer = splitAnswer;
  exports2.start = start$1;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});


const STYLE = `/** 默认字体 */
/** 输入框默认边距 */
ul,
ol {
	line-height: 26px;
	padding-left: 16px;
	margin: 0px;
}
a {
	color: #1890ff;
}
hr {
	border-style: solid;
	border-color: #63636346;
	border-width: 0px;
	border-bottom: 1px solid #63636346;
	margin-block-start: 1em;
	margin-block-end: 1em;
}
.base-style-active-form-control {
	border: 1px solid #ffffff00;
}
.base-style-active-form-control:focus {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
}
.base-style-active-form-control:focus:not([type='checkbox'], [type='radio']) {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
	background-color: white !important;
}
.base-style-active-form-control:hover {
	background-color: #ebeef4;
}
.base-style-input {
	outline: none;
	border: 1px solid #ffffff00;
	padding: 2px 8px;
	margin: 0px;
	background-color: #eef2f7;
	border-radius: 2px;
	color: black;
}
.base-style-input::placeholder {
	color: #bababa;
}
.base-style-button {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	background-color: white;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
}
.base-style-button:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
.base-style-button + .base-style-button {
	margin-left: 12px;
}
.base-style-button:hover {
	background-color: #7abbff24;
}
.base-style-button:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
.base-style-button:disabled:active {
	box-shadow: none;
}
.base-style-button-secondary {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
	color: gray;
	background-color: white;
	border: 1px solid #dcdcdc;
}
.base-style-button-secondary:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
.base-style-button-secondary + .base-style-button-secondary {
	margin-left: 12px;
}
.base-style-button-secondary:hover {
	background-color: #7abbff24;
}
.base-style-button-secondary:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
.base-style-button-secondary:disabled:active {
	box-shadow: none;
}
container-element.close {
	display: none;
}
container-element.minimize {
	min-width: unset;
}
container-element {
	position: fixed;
	top: 10%;
	left: 10%;
	z-index: 99999;
	text-align: left;
	min-width: 300px;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #636363;
	box-shadow: 0 0 24px -12px #3f3f3f;
	border-radius: 8px;
	letter-spacing: 0.5px;
}
.header {
	display: flex;
	align-items: center;
	background-color: white;
	border-radius: 8px 8px 0px 0px;
	user-select: none;
	padding: 4px;
}
.header .profile {
	flex: 1;
	cursor: move;
}
.header .switch:hover,
.header .dropdown:hover {
	background-color: #f3f3f3;
}
.header .close:hover {
	background-color: #ff000038;
}
.header .switch,
.header .close {
	cursor: pointer;
}
.header .dropdown {
	line-height: 24px;
}
.header .switch,
.header .close,
.header .profile {
	display: inline-flex;
	align-items: center;
	padding: 0px 8px;
}
.logo {
	width: 18px;
	height: 18px;
	cursor: pointer;
}
.project-selector {
	display: flex;
	align-items: center;
}
.project-selector select {
	background: #ffffff00;
	border-radius: 4px;
	border: 1px solid #63636346;
	padding: 4px;
}
.project-selector.expand-all {
	display: none;
}
.body {
	overflow: auto;
	width: auto;
	height: 100%;
}
script-panel-element {
	display: block;
	background-color: white;
	border-radius: 0px 0px 8px 8px;
	padding: 0px 8px 12px 8px;
	resize: vertical;
	overflow: auto;
}
script-panel-element .script-panel-body {
	padding: 0px 8px;
}
script-panel-element + script-panel-element {
	margin-top: 12px;
}
.card + .card {
	margin-top: 12px;
}
.card {
	background-color: white;
	border-radius: 2px;
	padding: 0px 8px;
}
.notes {
	background: #0099ff0e;
	border-left: 4px solid #0099ff65;
	width: -webkit-fill-available;
	margin: 0px 8px;
	line-height: 26px;
	letter-spacing: 1px;
}
.tooltip {
	z-index: 99999999999999;
	margin: 12px 0px 0px 12px;
	padding: 4px;
	color: black;
	background: #f0f0f0;
	box-shadow: 0px 0px 4px #949494;
	position: fixed;
	white-space: normal;
	max-width: 200px;
	height: auto;
	border-radius: 2px;
	line-height: 18px;
}
.configs {
	display: table;
	background: #e1e1e107;
	width: -webkit-fill-available;
}
.configs .lock {
	filter: blur(1px);
	user-select: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
}
.configs .lock-wrapper {
	cursor: not-allowed !important;
	border-radius: 4px;
	position: absolute;
	left: 16px;
	z-index: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}
.configs .lock-message {
	background-color: #ffffff7d;
	border-radius: 4px;
	box-shadow: 0px 0px 12px #6a6a6a98;
	padding: 2px;
}
.configs .configs-body {
	display: table-row-group;
}
.configs .configs-body config-element + config-element label {
	padding-top: 3px;
}
.configs .configs-body config-element + config-element .config-wrapper {
	padding-top: 3px;
}
.configs .configs-body config-element {
	width: 100%;
	display: table-row;
	line-height: 26px;
}
.configs .configs-body config-element label {
	white-space: nowrap;
	color: #4e5969;
	display: table-cell;
	padding-right: 12px;
	text-align: left;
	vertical-align: top;
	margin-right: 12px;
}
.configs .configs-body config-element .config-wrapper {
	display: table-cell;
	vertical-align: middle;
	/** check box 的样式 */
}
.configs .configs-body config-element .config-wrapper select {
	outline: none;
	border: none;
	border: 1px solid #e4e4e4;
	border-radius: 4px;
	padding: 2px 8px;
	border: 1px solid #ffffff00;
}
.configs .configs-body config-element .config-wrapper select:focus {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
}
.configs .configs-body config-element .config-wrapper select:focus:not([type='checkbox'], [type='radio']) {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
	background-color: white !important;
}
.configs .configs-body config-element .config-wrapper select:hover {
	background-color: #ebeef4;
}
.configs .configs-body config-element .config-wrapper textarea {
	padding: 2px 8px;
	outline: none;
	border: none;
	border: 1px solid #ffffff00;
}
.configs .configs-body config-element .config-wrapper textarea:focus {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
}
.configs .configs-body config-element .config-wrapper textarea:focus:not([type='checkbox'], [type='radio']) {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
	background-color: white !important;
}
.configs .configs-body config-element .config-wrapper textarea:hover {
	background-color: #ebeef4;
}
.configs .configs-body config-element .config-wrapper input:not([type='button']) {
	outline: none;
	padding: 2px 8px;
	margin: 0px;
	background-color: #eef2f7;
	border-radius: 2px;
	color: black;
	border: 1px solid #ffffff00;
}
.configs .configs-body config-element .config-wrapper input:not([type='button'])::placeholder {
	color: #bababa;
}
.configs .configs-body config-element .config-wrapper input:not([type='button']):focus {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
}
.configs
	.configs-body
	config-element
	.config-wrapper
	input:not([type='button']):focus:not([type='checkbox'], [type='radio']) {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
	background-color: white !important;
}
.configs .configs-body config-element .config-wrapper input:not([type='button']):hover {
	background-color: #ebeef4;
}
.configs .configs-body config-element .config-wrapper input[type='range'] {
	padding: 0px;
}
.configs .configs-body config-element .config-wrapper input[type='button'] {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	background-color: white;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
}
.configs .configs-body config-element .config-wrapper input[type='button']:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
.configs
	.configs-body
	config-element
	.config-wrapper
	input[type='button']
	+ .configs
	.configs-body
	config-element
	.config-wrapper
	input[type='button'] {
	margin-left: 12px;
}
.configs .configs-body config-element .config-wrapper input[type='button']:hover {
	background-color: #7abbff24;
}
.configs .configs-body config-element .config-wrapper input[type='button']:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
.configs .configs-body config-element .config-wrapper input[type='button']:disabled:active {
	box-shadow: none;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox'] {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	width: fit-content;
	min-width: 36px;
	height: 20px;
	border-radius: 100px;
	display: flex;
	align-items: center;
	padding: 2px 4px;
	transition: all 0.2s ease-in-out;
	width: auto;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']:checked {
	background: #1890ff;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']:disabled {
	background-color: #f7f7f78b;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']:checked::before {
	transform: translate(100%, 0px);
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']::before {
	background-color: #fff;
	border-radius: 9px;
	box-shadow: 0 2px 4px #00230b33;
	width: 14px;
	height: 14px;
	content: '';
}
.configs .configs-body config-element .config-wrapper input:not([type='checkbox'], [type='radio']),
.configs .configs-body config-element .config-wrapper textarea,
.configs .configs-body config-element .config-wrapper select {
	width: -webkit-fill-available;
	font-size: inherit;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox'],
.configs .configs-body config-element .config-wrapper input[type='radio'],
.configs .configs-body config-element .config-wrapper input[type='range'] {
	accent-color: #0e8ee2;
}
.configs .configs-body config-element .config-wrapper > *:not(.tooltip) {
	background-color: #eef2f7;
	border-radius: 2px;
	color: black;
	float: right;
}
.configs .configs-body config-element .config-wrapper > *:disabled {
	cursor: not-allowed;
	background-color: #f7f7f78b;
}
.message-container {
	margin-bottom: 4px;
	position: absolute;
	bottom: 100%;
	left: 50%;
	width: 100%;
	transform: translate(-50%, 0px);
	min-width: 300px;
}
.message-container message-element {
	display: flex;
	border-radius: 4px;
	padding: 4px 12px;
	margin-bottom: 4px;
}
.message-container message-element .message-content-container {
	margin-right: 8px;
	flex: auto;
}
.message-container message-element .message-text {
	letter-spacing: 1px;
	font-weight: bold;
}
.message-container message-element .message-closer {
	width: 18px;
	min-width: 18px;
	cursor: pointer;
	background-color: #ffffffb3;
	color: #a1a1a1;
	border-radius: 100%;
	text-align: center;
	height: 18px;
	vertical-align: middle;
	font-size: 12px;
}
.message-container message-element.error {
	background-color: #ffe6e6;
	color: #c70208;
	border: 1px solid #ff6b6ded;
}
.message-container message-element.info {
	background-color: #c9e7ff;
	color: #004d95;
	border: 1px solid #1890ff69;
}
.message-container message-element.success {
	background-color: #e8ffe0;
	color: #3e8d0d;
	border: 1px solid #6fd91d;
}
.message-container message-element.warn {
	background-color: #ffefc8;
	color: #9b7400;
	border: 1px solid #ffc107;
}
modal-element {
	position: absolute;
	top: 50%;
	left: 50%;
	background-color: white;
	border-radius: 4px;
	box-shadow: 0px 0px 24px -12px black;
	border: 1px solid #929292;
	height: fit-content;
	transform: translate(-50%, -50%);
	padding: 12px 18px 18px 18px;
	font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
	z-index: 99999999999;
}
modal-element .modal-profile {
	zoom: 0.9;
	color: #969696;
	user-select: none;
	margin-bottom: 4px;
}
modal-element .modal-title {
	font-size: 18px;
	font-weight: bold;
	user-select: none;
}
modal-element .modal-body {
	margin: 12px 0px;
	overflow: auto;
}
modal-element .modal-footer {
	display: flex;
	white-space: nowrap;
	justify-content: end;
	align-items: end;
}
modal-element .modal-footer * + * {
	margin-left: 12px;
}
modal-element .modal-input {
	outline: none;
	padding: 2px 8px;
	margin: 0px;
	background-color: #eef2f7;
	border-radius: 2px;
	color: black;
	border: 1px solid #ffffff00;
	width: -webkit-fill-available;
}
modal-element .modal-input::placeholder {
	color: #bababa;
}
modal-element .modal-input:focus {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
}
modal-element .modal-input:focus:not([type='checkbox'], [type='radio']) {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
	background-color: white !important;
}
modal-element .modal-input:hover {
	background-color: #ebeef4;
}
modal-element .modal-cancel-button {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
	color: gray;
	background-color: white;
	border: 1px solid #dcdcdc;
}
modal-element .modal-cancel-button:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
modal-element .modal-cancel-button + modal-element .modal-cancel-button {
	margin-left: 12px;
}
modal-element .modal-cancel-button:hover {
	background-color: #7abbff24;
}
modal-element .modal-cancel-button:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
modal-element .modal-cancel-button:disabled:active {
	box-shadow: none;
}
modal-element .modal-confirm-button {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	background-color: white;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
}
modal-element .modal-confirm-button:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
modal-element .modal-confirm-button + modal-element .modal-confirm-button {
	margin-left: 12px;
}
modal-element .modal-confirm-button:hover {
	background-color: #7abbff24;
}
modal-element .modal-confirm-button:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
modal-element .modal-confirm-button:disabled:active {
	box-shadow: none;
}
modal-element.alert .modal-input,
modal-element.alert .modal-cancel-button {
	display: none;
}
modal-element.alert .modal-confirm-button {
	margin: 0;
}
modal-element.prompt .modal-input,
modal-element.prompt .modal-cancel-button,
modal-element.prompt .modal-confirm-button {
	display: block;
}
modal-element.confirm .modal-input {
	display: none;
}
.modal-wrapper {
	width: 100%;
	height: 100%;
	z-index: 9999;
	position: fixed;
	top: 0px;
	left: 0px;
	z-index: 9999999;
	background-color: rgba(0, 0, 0, 0.265);
	color: #636363;
	font: 14px Menlo, Monaco, Consolas, 'Courier New', monospace;
}
.pointer {
	cursor: pointer;
}
.separator {
	display: flex;
	align-items: center;
	text-align: center;
	padding-bottom: 4px;
}
.separator::before,
.separator::after {
	content: '';
	flex: 1;
	border-bottom: 1px solid #63636346;
}
.separator:not(:empty)::before {
	margin-right: 0.25em;
}
.separator:not(:empty)::after {
	margin-left: 0.25em;
}
.minimize .body,
.minimize .header .dropdown,
.minimize .footer {
	display: none;
}
.minimize .header {
	padding: 8px;
	border-radius: 8px;
	box-shadow: 0px 0px 24px -12px black;
}
.user-guide > li {
	padding: 4px 0px;
}
.search-infos-question {
	white-space: nowrap;
	cursor: pointer;
	padding: 4px 0px;
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
}
.search-infos-question.hover {
	color: #00488d;
}
.search-infos-question.active {
	color: #1890ff;
}
.search-infos-question.error {
	color: #ff6b6ded;
}
.search-infos-num {
	width: 22px;
	margin: 2px;
	height: 20px;
	border-radius: 4px;
	display: inline-block;
	color: white;
	background-color: #63b4ff;
	text-align: center;
	cursor: pointer;
	border: 1px solid #63b4ff;
}
.search-infos-num.requesting {
	border: 1px solid #b6b6b6;
	background-color: white;
	color: inherit;
}
.search-infos-num.resolving {
	border: 1px solid #1890ff;
	background-color: white;
	color: #1890ff;
}
.search-infos-num.active {
	background-color: #1890ff;
	color: white;
}
.search-infos-num.error {
	border: 1px solid #ff8789ed;
	background-color: #ff6b6ded;
	color: white;
}
search-infos-element {
	display: block;
	overflow: auto;
}
search-infos-element .search-result {
	margin-bottom: 12px;
	padding-left: 12px;
}
search-infos-element .search-result .question {
	font-weight: bold;
}
search-infos-element .search-result .answer {
	color: #7c7c7c;
}
search-infos-element .search-result .answer code {
	background-color: #f3f3f3;
	padding: 2px 4px;
	border-radius: 2px;
	margin: 4px;
	line-height: 20px;
}
search-infos-element .error {
	color: #ff6b6ded;
	display: inline-block;
	padding-left: 12px;
}
.copy,
.question-title-extra-btn {
	margin-left: 4px;
	padding: 2px 4px;
	border-radius: 2px;
	box-shadow: 0 0 4px #b1b1b1;
	cursor: pointer !important;
	font-weight: normal;
	font-size: 12px;
}
.work-result-question-container {
	position: absolute;
	width: 400px;
	left: -100%;
	top: 0px;
	background: white;
	border: 1px solid #cbcbcb;
	border-radius: 4px;
	box-shadow: 0px 0px 12px #d1cfcf;
	padding: 12px;
}
.work-result-question-container .close-search-result {
	font-size: 12px;
	margin-left: 8px;
	text-decoration: underline;
	color: gray;
	cursor: pointer;
}
.console {
	max-height: 300px;
	max-width: 400px;
	overflow: auto;
	background-color: #292929;
	padding: 12px 6px;
	color: #ececec;
	font-size: 12px;
}
.console .item {
	padding: 3px 0px;
	border-radius: 2px;
}
.console .item .time {
	color: #757575;
}
.console .item .info {
	background-color: #2196f3a3;
}
.console .item .warn {
	background-color: #ffc107db;
}
.console .item .error {
	background-color: #f36c71cc;
}
.console .item .debug,
.console .item .log {
	background-color: #9e9e9ec4;
}
.console *::selection {
	background-color: #ffffff6b;
}
/* 设置滚动条的样式 */
::-webkit-scrollbar {
	width: 10px;
	height: 10px;
}
/* 滚动槽 */
::-webkit-scrollbar-track {
	background: #ffffffd8;
	border-radius: 4px;
	margin: 4px;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
	border-radius: 4px;
	background: rgba(0, 0, 0, 0.253);
	box-shadow: inset006pxrgba(0, 0, 0, 0.3);
}
.markdown {
	max-width: 400px;
	max-height: 50vh;
	overflow: auto;
}
.markdown code {
	padding: 2px 4px;
	background-color: #f0f0f0;
	border-radius: 6px;
	font-size: 12px;
}
.markdown blockquote {
	padding: 4px 4px 4px 12px;
	margin: 0px;
	color: #b5b5b5;
	border-left: #ababab 2px solid;
}
.markdown blockquote p {
	margin: 0px;
}
.markdown h1,
.markdown h2,
.markdown h3,
.markdown h4,
.markdown h5,
.markdown h6,
.markdown p {
	margin: 8px 0px;
}
.dropdown {
	position: relative;
	display: inline-block;
}
.dropdown.active .dropdown-trigger-element {
	color: #1890ff;
}
.dropdown-trigger-element {
	cursor: pointer;
}
.dropdown-content {
	display: none;
	position: absolute;
	background-color: #ffffff;
	overflow: auto;
	box-shadow: 0px 8px 16px 0px #00000033;
	z-index: 1;
	border-radius: 4px;
	padding: 12px;
	min-width: 120px;
}
.dropdown-content.show {
	display: block;
}
.dropdown-content {
	cursor: pointer;
	z-index: 999;
}
.dropdown-content .dropdown-option {
	white-space: nowrap;
}
.dropdown-content .dropdown-option:hover {
	background-color: #f3f3f3;
}
.dropdown-content .dropdown-option.active {
	color: #1890ff;
}
`;

/* eslint-disable no-undef */
/// <reference path="./global.d.ts" />

const { start, definedProjects, CommonProject } = OCS;

(function () {
	'use strict';

	// 运行脚本
	start({
		style: STYLE,
		projects: definedProjects(),
		defaultPanelName: CommonProject.scripts.guide.namespace
	});
})();
