// ==UserScript==
// @name       				OCS 网课助手
// @version    				5.4.0-xueyin.6
// @description				OCS(online-course-script) 网课助手，官网 https://docs.ocsjs.com ，专注于帮助大学生从网课中释放出来 让自己的时间把握在自己的手中，拥有人性化的操作页面，流畅的步骤提示，支持  【超星学习通】 【知到智慧树】 【职教云】 【智慧职教】 【中国大学MOOC】 【雨课堂】 等网课的学习，作业。具体的功能请查看脚本悬浮窗中的教程页面。
// @author     				enncy
// @license    				MIT
// @match      				*://*.zhihuishu.com/*
// @match      				*://*.polymas.com/*
// @match      				*://*.chaoxing.com/*
// @match      				*://*.edu.cn/*
// @match      				*://*.org.cn/*
// @match      				*://*.xueyinonline.com/*
// @match      				*://*.hnsyu.net/*
// @match      				*://*.qutjxjy.cn/*
// @match      				*://*.ynny.cn/*
// @match      				*://*.hnvist.cn/*
// @match      				*://*.fjlecb.cn/*
// @match      				*://*.gdhkmooc.com/*
// @match      				*://*.cugbonline.cn/*
// @match      				*://*.zjelib.cn/*
// @match      				*://*.cqrspx.cn/*
// @match      				*://*.neauce.com/*
// @match      				*://*.zhihui-yun.com/*
// @match      				*://*.cqie.cn/*
// @match      				*://*.ccqmxx.com/*
// @match      				*://*.jxgmxy.com/*
// @match      				*://*.jnzyjsxy.cn/*
// @match      				*://*.smjyxy.cn/*
// @match      				*://*.sslibrary.com/*
// @match      				*://*.xuexi365.com/*
// @match      				*://*.icve.com.cn/*
// @match      				*://*.ai.icve.com.cn/*
// @match      				*://*.course.icve.com.cn/*
// @match      				*://*.courshare.cn/*
// @match      				*://*.webtrn.cn/*
// @match      				*://*.zjy2.icve.com.cn/*
// @match      				*://*.zyk.icve.com.cn/*
// @match      				*://*.icourse163.org/*
// @match      				*://*.yuketang.cn/*
// @match      				*://*.xuetangx.com/*
// @match      				*://*.gdufemooc.cn/*
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
// @connect    				zaizhexue.top
// @connect    				localhost
// @connect    				127.0.0.1
// @connect    				aliyuncs.com
// @antifeature				payment
// ==/UserScript==

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
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
  var root$2 = freeGlobal || freeSelf || Function("return this")();
  var _root = root$2;
  var root$1 = _root;
  var now$1 = function() {
    return root$1.Date.now();
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
  var root = _root;
  var Symbol$3 = root.Symbol;
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
  function objectToString$2(value) {
    return nativeObjectToString.call(value);
  }
  var _objectToString = objectToString$2;
  var Symbol$1 = _Symbol, getRawTag = _getRawTag, objectToString$1 = _objectToString;
  var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
  var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
  function baseGetTag$1(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString$1(value);
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
  var debounce_1$1 = debounce;
  const $ = {
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
    elementToRawObject(el) {
      return {
        innerText: el == null ? void 0 : el.innerText,
        innerHTML: el == null ? void 0 : el.innerHTML,
        textContent: el == null ? void 0 : el.textContent
      };
    },
    onresize(el, handler) {
      const resize = debounce_1$1(() => {
        if (el.parentNode === null) {
          window.removeEventListener("resize", resize);
        } else {
          handler(el);
        }
      }, 200);
      resize();
      window.addEventListener("resize", resize);
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
    },
    transition: async (el, properties, duration_ms, val, options) => {
      return new Promise((resolve) => {
        const original_val = Reflect.get(el.style, properties) || "";
        el.style.transition = `${String(properties)} ${duration_ms}s ${(options == null ? void 0 : options.timing_function) || "ease-in-out"}`;
        Reflect.set(el.style, properties, val);
        el.addEventListener("transitionend", function handler() {
          el.removeEventListener("transitionend", handler);
          setTimeout(() => {
            Reflect.set(el.style, properties, original_val);
            setTimeout(() => {
              el.style.transition = "";
            }, duration_ms * 1e3);
          }, ((options == null ? void 0 : options.reset_ms) || 0) * 1e3);
          resolve();
        });
      });
    }
  };
  const $string = {
    humpToTarget(value, target) {
      return value.replace(/([A-Z])/g, target + "$1").toLowerCase().split(target).slice(1).join(target);
    }
  };
  class StringUtils {
    constructor(_text) {
      this._text = _text;
    }
    static nowrap(str, replace_str) {
      return (str == null ? void 0 : str.replace(/\n/g, replace_str)) || "";
    }
    nowrap(replace_str) {
      this._text = StringUtils.nowrap(this._text, replace_str);
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
    static of(text2) {
      return new StringUtils(text2);
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
        typeof item === "string" ? Array.from(root2.querySelectorAll(item)) : typeof item === "function" ? item(root2).filter(Boolean) : item.map((fun) => fun(root2))
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
      const count2 = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
      firstBigrams.set(bigram, count2);
    }
    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count2 = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
      if (count2 > 0) {
        firstBigrams.set(bigram, count2 - 1);
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
    exclude.push(...["①②③④⑤⑥⑦⑧⑨"]);
    return str.trim().toLocaleLowerCase().replace(RegExp(`[^\\u2E80-\\u9FFFA-Za-z0-9${exclude.join("")}]*`, "g"), "");
  }
  function normalizeString(str) {
    return clearString(
      str.replace(/[，。！？；：""''、（）【】《》\s]/g, "").replace(/[,.\-!?;:'"()[\]<>]/g, "").replace(/[ａ-ｚＡ-Ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248)).replace(/％/g, "%")
    );
  }
  function answerNormalizedMatch(answers, options) {
    const _answers = answers.map(removeRedundant).map(normalizeString);
    const _options = options.map(removeRedundant).map(normalizeString);
    return _answers.length !== 0 ? _options.map((opt, i) => {
      let level = 0;
      if (opt) {
        for (const ans of _answers) {
          if (ans === opt) {
            level = 2;
            break;
          } else if (ans.includes(opt)) {
            level = 1;
          }
        }
      }
      return { opt, original: options[i], level };
    }).filter(({ level }) => level > 0).sort((a, b) => b.level - a.level).map(({ original }) => original) : [];
  }
  function answerSimilar(answers, options) {
    const _answers = answers.map(removeRedundant).map((a) => clearString(a));
    const _options = options.map(removeRedundant).map((o) => clearString(o));
    const similar = _answers.length !== 0 ? _options.map((option) => {
      if (option.trim() === "") {
        return { rating: 0, target: "" };
      }
      return src.findBestMatch(option, _answers).bestMatch;
    }) : _options.map(() => ({ rating: 0, target: "" }));
    return similar;
  }
  function clearStringKeepSign(str) {
    return clearString(str, "\\-", "\\+", "−");
  }
  function normalizeStringKeepSign(str) {
    return clearStringKeepSign(
      str.replace(/[−–—]/g, "-").replace(/[，。！？；：""''、（）【】《》\s]/g, "").replace(/[,.\-!?;:'"()[\]<>]/g, (m) => m === "-" ? m : "").replace(/[ａ-ｚＡ-Ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248)).replace(/％/g, "%")
    );
  }
  function disambiguateBySign(answers, options) {
    if (options.length <= 1)
      return options;
    const _answers = answers.map((a) => normalizeStringKeepSign(removeRedundant(a)));
    const strict = options.filter((opt) => {
      const no = normalizeStringKeepSign(removeRedundant(opt));
      return _answers.some((na) => na === no);
    });
    return strict.length > 0 && strict.length < options.length ? strict : [];
  }
  function answerSimilarWithGap(answers, options) {
    var _a, _b;
    const _answers = answers.map(removeRedundant).map((a) => clearString(a));
    const _options = options.map(removeRedundant).map((o) => clearString(o));
    if (_answers.length === 0) {
      return _options.map(() => ({ rating: 0, target: "", gap: 0 }));
    }
    const ratings = _options.map((option) => {
      if (option.trim() === "") {
        return { rating: 0, target: "" };
      }
      return src.findBestMatch(option, _answers).bestMatch;
    });
    const sortedRatings = [...ratings].sort((a, b) => b.rating - a.rating);
    const maxRating = (_b = (_a = sortedRatings[0]) == null ? void 0 : _a.rating) != null ? _b : 0;
    let secondRating = 0;
    for (let i = 1; i < sortedRatings.length; i++) {
      if (sortedRatings[i].rating < maxRating) {
        secondRating = sortedRatings[i].rating;
        break;
      }
    }
    return ratings.map((r) => ({
      ...r,
      gap: r.rating === maxRating ? maxRating - secondRating : 0
    }));
  }
  function answerExactMatch(answers, options) {
    const _answers = answers.map(removeRedundant);
    const _options = options.map(removeRedundant);
    const result = _answers.length !== 0 ? _options.filter((option) => {
      return _answers.find((answer) => answer.trim() === option.trim());
    }) : [];
    return result;
  }
  function linearizeLatex(str) {
    if (!str.includes("\\")) {
      return str;
    }
    let s = str;
    let prev = "";
    while (prev !== s) {
      prev = s;
      s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1)/($2)");
    }
    return s.replace(/\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*)\}/g, "√[$1]($2)").replace(/\\sqrt\s*\{([^{}]*)\}/g, "√($1)").replace(/\\times|\\cdot/g, "*").replace(/\\div/g, "/").replace(/\\(left|right|displaystyle|limits)\b ?/g, "").replace(/\\[,;!\s]/g, "").replace(/\\(?:mathrm|mathbf|mathit|mathbb|mathcal|boldsymbol|text|operatorname)\s*\{([^{}]*)\}/g, "$1").replace(/\\([A-Za-z]+)/g, "$1").replace(/[{}]/g, "");
  }
  function removeRedundant(str) {
    return linearizeLatex((str == null ? void 0 : str.trim()) || "").replace(/^[A-Z]{1}[^A-Za-z0-9⺀-鿿]+([A-Za-z0-9⺀-鿿]+)/, "$1").replace(/^[A-Z]{1}([⺀-鿿][A-Za-z0-9⺀-鿿]*)/, "$1") || "";
  }
  function request(url, opts) {
    return new Promise((resolve, reject) => {
      try {
        const { responseType = "json", method = "get", type = "fetch", data = {}, headers = {} } = opts || {};
        const env = $.isInBrowser() ? "browser" : "node";
        if (type === "GM_xmlhttpRequest" && env === "browser") {
          if (typeof GM_xmlhttpRequest !== "undefined") {
            const contentType = headers["Content-Type"] || headers["content-type"];
            const requestData = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(data).toString() : Object.keys(data).length ? JSON.stringify(data) : void 0;
            GM_xmlhttpRequest({
              url,
              method: method.toUpperCase(),
              data: requestData,
              headers: Object.keys(headers).length ? headers : void 0,
              responseType: responseType === "json" ? "json" : void 0,
              onload: (response) => {
                if (opts.anyStatus) {
                  resolve({ status: response.status, responseText: response.responseText || "" });
                  return;
                }
                if (response.status === 200) {
                  if (responseType === "json") {
                    try {
                      resolve(JSON.parse(response.responseText));
                    } catch (error) {
                      reject(error);
                    }
                  } else {
                    resolve(response.responseText || "");
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
            if (opts.anyStatus) {
              response.text().then((text2) => resolve({ status: response.status, responseText: text2 })).catch(reject);
              return;
            }
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
  var lib = {};
  var start$1 = {};
  var interfaces = {};
  var common$1 = {};
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
  var __importDefault$2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(common$1, "__esModule", { value: true });
  common$1.CommonEventEmitter = void 0;
  const events_1$1 = __importDefault$2(events.exports);
  class CommonEventEmitter extends events_1$1.default {
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
  common$1.CommonEventEmitter = CommonEventEmitter;
  var config$1 = {};
  Object.defineProperty(config$1, "__esModule", { value: true });
  var cors = {};
  var utils = {};
  var common = {};
  var store = {};
  var store_provider = {};
  var _const = {};
  Object.defineProperty(_const, "__esModule", { value: true });
  _const.$const = void 0;
  _const.$const = {
    TAB_UID: "_uid_",
    TAB_URLS: "_urls_",
    TAB_CURRENT_PANEL_NAME: "_current_panel_name_"
  };
  var __awaiter$3 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(store_provider, "__esModule", { value: true });
  store_provider.GMStoreProvider = store_provider.MemoryStoreProvider = store_provider.LocalStoreChangeEvent = void 0;
  const const_1$1 = _const;
  class LocalStoreChangeEvent extends Event {
    constructor() {
      super(...arguments);
      this.key = "";
    }
  }
  store_provider.LocalStoreChangeEvent = LocalStoreChangeEvent;
  class MemoryStoreProvider {
    get(key, defaultValue) {
      var _a;
      return (_a = Reflect.get(MemoryStoreProvider._source.store, key)) !== null && _a !== void 0 ? _a : defaultValue;
    }
    set(key, value) {
      var _a;
      const pre = Reflect.get(MemoryStoreProvider._source.store, key);
      Reflect.set(MemoryStoreProvider._source.store, key, value);
      (_a = MemoryStoreProvider.storeListeners.get(key)) === null || _a === void 0 ? void 0 : _a.forEach((lis) => lis(value, pre));
    }
    delete(key) {
      Reflect.deleteProperty(MemoryStoreProvider._source.store, key);
    }
    list() {
      return Object.keys(MemoryStoreProvider._source.store);
    }
    getTab(key) {
      return __awaiter$3(this, void 0, void 0, function* () {
        return Reflect.get(MemoryStoreProvider._source.tab, key);
      });
    }
    setTab(key, value) {
      var _a;
      return __awaiter$3(this, void 0, void 0, function* () {
        Reflect.set(MemoryStoreProvider._source.tab, key, value);
        (_a = MemoryStoreProvider.tabListeners.get(key)) === null || _a === void 0 ? void 0 : _a.forEach((lis) => lis(value, this.getTab(key)));
      });
    }
    addChangeListener(key, listener) {
      const listeners = MemoryStoreProvider.storeListeners.get(key) || [];
      listeners.push(listener);
      MemoryStoreProvider.storeListeners.set(key, listeners);
    }
    removeChangeListener(listener) {
      MemoryStoreProvider.storeListeners.forEach((lis, key) => {
        const index = lis.findIndex((l) => l === listener);
        if (index !== -1) {
          lis.splice(index, 1);
          MemoryStoreProvider.storeListeners.set(key, lis);
        }
      });
    }
    addTabChangeListener(key, listener) {
      const listeners = MemoryStoreProvider.tabListeners.get(key) || [];
      listeners.push(listener);
      MemoryStoreProvider.tabListeners.set(key, listeners);
    }
    removeTabChangeListener(key, listener) {
      const listeners = MemoryStoreProvider.tabListeners.get(key) || [];
      const index = listeners.findIndex((l) => l === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        MemoryStoreProvider.tabListeners.set(key, listeners);
      }
    }
  }
  MemoryStoreProvider._source = { store: {}, tab: {} };
  MemoryStoreProvider.storeListeners = /* @__PURE__ */ new Map();
  MemoryStoreProvider.tabListeners = /* @__PURE__ */ new Map();
  store_provider.MemoryStoreProvider = MemoryStoreProvider;
  class GMStoreProvider {
    constructor() {
      this.tabPendingWrites = /* @__PURE__ */ new Map();
      this.tabFlushTimer = void 0;
      if (self === top && typeof globalThis.GM_listValues !== "undefined") {
        for (const val of GM_listValues()) {
          if (val.startsWith("_tab_change_")) {
            GM_deleteValue(val);
          }
        }
      }
      window.addEventListener("beforeunload", () => this.flushTabWrites());
    }
    flushTabWrites() {
      this.tabFlushTimer = void 0;
      if (this.tabPendingWrites.size === 0) {
        return;
      }
      const entries2 = Array.from(this.tabPendingWrites.entries());
      this.tabPendingWrites.clear();
      GM_getTab((tab) => {
        tab = tab || {};
        for (const [key, pending] of entries2) {
          if (!pending) continue;
          Reflect.set(tab, key, pending.value);
          this.set(this.getTabChangeHandleKey(Reflect.get(tab, const_1$1.$const.TAB_UID), key), pending.value);
        }
        GM_saveTab(tab);
        for (const [, pending] of entries2) {
          if (!pending || !pending.resolves) continue;
          pending.resolves.forEach((resolve) => resolve());
        }
      });
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
        const pending = this.tabPendingWrites.get(key);
        if (pending) {
          resolve(pending.value);
          return;
        }
        GM_getTab((tab = {}) => resolve(Reflect.get(tab, key)));
      });
    }
    setTab(key, value) {
      return new Promise((resolve, reject) => {
        const pending = this.tabPendingWrites.get(key);
        if (pending) {
          pending.value = value;
          pending.resolves.push(resolve);
        } else {
          this.tabPendingWrites.set(key, { value, resolves: [resolve] });
        }
        if (this.tabFlushTimer === void 0) {
          this.tabFlushTimer = setTimeout(() => this.flushTabWrites(), 0);
        }
      });
    }
    addChangeListener(key, listener) {
      return GM_addValueChangeListener(key, (_, pre, curr, remote) => {
        listener(curr, pre, remote);
      });
    }
    removeChangeListener(listenerId) {
      if (typeof listenerId === "number") {
        GM_removeValueChangeListener(listenerId);
      }
    }
    addTabChangeListener(key, listener) {
      return __awaiter$3(this, void 0, void 0, function* () {
        const uid = yield this.getTab(const_1$1.$const.TAB_UID);
        return GM_addValueChangeListener(this.getTabChangeHandleKey(uid, key), (_, pre, curr) => {
          listener(curr, pre);
        });
      });
    }
    removeTabChangeListener(key, listener) {
      return this.removeChangeListener(listener);
    }
  }
  store_provider.GMStoreProvider = GMStoreProvider;
  (function(exports3) {
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.$store = exports3.MemoryStoreProvider = exports3.GMStoreProvider = void 0;
    const store_provider_1 = store_provider;
    var store_provider_2 = store_provider;
    Object.defineProperty(exports3, "GMStoreProvider", { enumerable: true, get: function() {
      return store_provider_2.GMStoreProvider;
    } });
    Object.defineProperty(exports3, "MemoryStoreProvider", { enumerable: true, get: function() {
      return store_provider_2.MemoryStoreProvider;
    } });
    exports3.$store = typeof globalThis.unsafeWindow === "undefined" ? new store_provider_1.MemoryStoreProvider() : new store_provider_1.GMStoreProvider();
  })(store);
  (function(exports3) {
    var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __rest2 = commonjsGlobal && commonjsGlobal.__rest || function(s, e) {
      var t2 = {};
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t2[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
            t2[p[i]] = s[p[i]];
        }
      return t2;
    };
    var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.resolveCustomElementName = exports3.$ = void 0;
    const debounce_12 = __importDefault2(debounce_1$1);
    const store_12 = store;
    exports3.$ = {
      createConfigProxy(script2) {
        var _a, _b;
        const declaredKeys = /* @__PURE__ */ new Set();
        for (const key in script2.configs) {
          if (Object.prototype.hasOwnProperty.call(script2.configs, key)) {
            declaredKeys.add(exports3.$.namespaceKey(script2.namespace, key));
          }
        }
        const cache = /* @__PURE__ */ Object.create(null);
        const dirtyKeys = /* @__PURE__ */ new Set();
        let flushTimer = void 0;
        const flush = () => {
          flushTimer = void 0;
          for (const key of dirtyKeys) {
            dirtyKeys.delete(key);
            store_12.$store.set(key, cache[key]);
          }
        };
        const scheduleFlush = () => {
          if (flushTimer === void 0) {
            flushTimer = setTimeout(flush, 0);
          }
        };
        window.addEventListener("beforeunload", flush);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") {
            flush();
          }
        });
        const rawCfg = script2.cfg;
        const proxy = new Proxy(rawCfg, {
          set(target, propertyKey, value) {
            const key = exports3.$.namespaceKey(script2.namespace, propertyKey);
            if (declaredKeys.has(key)) {
              cache[key] = value;
              dirtyKeys.add(key);
              scheduleFlush();
            } else {
              store_12.$store.set(key, value);
            }
            return Reflect.set(target, propertyKey, value);
          },
          get(target, propertyKey) {
            const key = exports3.$.namespaceKey(script2.namespace, propertyKey);
            if (declaredKeys.has(key)) {
              if (!(key in cache)) {
                cache[key] = store_12.$store.get(key);
              }
              Reflect.set(target, propertyKey, cache[key]);
              return cache[key];
            }
            const value = store_12.$store.get(key);
            Reflect.set(target, propertyKey, value);
            return value;
          }
        });
        for (const key in script2.configs) {
          if (Object.prototype.hasOwnProperty.call(script2.configs, key)) {
            const element = Reflect.get(script2.configs, key);
            const storeKey = exports3.$.namespaceKey(script2.namespace, key);
            const value = store_12.$store.get(storeKey, element.defaultValue);
            cache[storeKey] = value;
            Reflect.set(rawCfg, key, value);
            store_12.$store.addChangeListener(storeKey, (curr) => {
              cache[storeKey] = curr;
              Reflect.set(rawCfg, key, curr);
            });
          }
        }
        if (script2.namespace) {
          proxy.notes = (_b = (_a = script2.configs) === null || _a === void 0 ? void 0 : _a.notes) === null || _b === void 0 ? void 0 : _b.defaultValue;
        }
        return proxy;
      },
      createPanelStoreAdapter(script2, store2) {
        const declaredPropOf = (key) => {
          const prefix = script2.namespace ? script2.namespace + "." : "";
          if (prefix && key.startsWith(prefix) === false) {
            return void 0;
          }
          const prop = prefix ? key.slice(prefix.length) : key;
          return Object.prototype.hasOwnProperty.call(script2.configs, prop) ? prop : void 0;
        };
        return {
          get: (key, defaultValue) => {
            var _a;
            const prop = declaredPropOf(key);
            return prop === void 0 ? store2.get(key, defaultValue) : (_a = Reflect.get(script2.cfg, prop)) !== null && _a !== void 0 ? _a : defaultValue;
          },
          set: (key, value) => {
            const prop = declaredPropOf(key);
            if (prop === void 0) {
              store2.set(key, value);
            } else {
              Reflect.set(script2.cfg, prop, value);
            }
          },
          delete: (key) => store2.delete(key),
          list: () => store2.list(),
          getTab: (key) => store2.getTab(key),
          setTab: (key, value) => store2.setTab(key, value),
          addChangeListener: (key, listener) => store2.addChangeListener(key, listener),
          removeChangeListener: (listener) => store2.removeChangeListener(listener),
          addTabChangeListener: (key, listener) => store2.addTabChangeListener(key, listener),
          removeTabChangeListener: (key, listener) => store2.removeTabChangeListener(key, listener)
        };
      },
      getAllRawConfigs(scripts) {
        const object = {};
        for (const script2 of scripts) {
          for (const key in script2.configs) {
            if (Object.prototype.hasOwnProperty.call(script2.configs, key)) {
              const _a = script2.configs[key], element = __rest2(_a, ["label"]);
              Reflect.set(object, exports3.$.namespaceKey(script2.namespace, key), Object.assign({ label: exports3.$.namespaceKey(script2.namespace, key) }, element));
            }
          }
        }
        return object;
      },
      getMatchedScripts(projects, urls) {
        const scripts = [];
        for (const project2 of projects) {
          for (const key in project2.scripts) {
            if (Object.prototype.hasOwnProperty.call(project2.scripts, key)) {
              const script2 = project2.scripts[key];
              const script_matches_urls = script2.matches.map((u) => Array.isArray(u) ? u[1] : u);
              const script_excludes_urls = (script2.excludes || []).map((u) => Array.isArray(u) ? u[1] : u);
              if (project2.domains === void 0 || project2.domains.length === 0 || project2.domains.some((d) => urls.some((url) => new URL(url).origin.includes(d)))) {
                if (script_excludes_urls.some((u) => urls.some((url) => RegExp(u).test(url)))) {
                  continue;
                }
                if (script_matches_urls.some((u) => urls.some((url) => RegExp(u).test(url)))) {
                  scripts.push(script2);
                }
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
      sleep(period) {
        return __awaiter2(this, void 0, void 0, function* () {
          return new Promise((resolve) => {
            setTimeout(resolve, period);
          });
        });
      },
      isInBrowser() {
        return typeof window !== "undefined" && typeof window.document !== "undefined";
      },
      onresize(el, handler) {
        const resize = (0, debounce_12.default)(() => {
          if (el.parentNode === null) {
            window.removeEventListener("resize", resize);
          } else {
            handler(el);
          }
        }, 200);
        resize();
        window.addEventListener("resize", resize);
      },
      loadCustomElements(elements2) {
        for (const element of elements2) {
          const name = resolveCustomElementName(element, "-");
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
      },
      waitForElement(selector, opts) {
        return this.waitFor(() => {
          return typeof selector === "function" ? selector() : document.querySelector(selector);
        }, opts);
      },
      waitFor(predicate, opts) {
        return new Promise((resolve, reject) => {
          let timeout;
          const interval = setInterval(() => {
            const result = predicate();
            if (result) {
              clearInterval(interval);
              timeout && clearTimeout(timeout);
              resolve(result);
            }
          }, (opts === null || opts === void 0 ? void 0 : opts.check_period_ms) || 1e3);
          if (opts === null || opts === void 0 ? void 0 : opts.timeout_seconds) {
            timeout = setTimeout(() => {
              clearInterval(interval);
              resolve(void 0);
            }, ((opts === null || opts === void 0 ? void 0 : opts.timeout_seconds) || 10) * 1e3);
          }
        });
      }
    };
    function resolveCustomElementName(el, target) {
      return el.name.replace(/([A-Z])/g, target + "$1").toLowerCase().split(target).slice(1).join(target);
    }
    exports3.resolveCustomElementName = resolveCustomElementName;
  })(common);
  var ui = {};
  var dom = {};
  Object.defineProperty(dom, "__esModule", { value: true });
  dom.enableElementTouchDraggable = dom.enableElementDraggable = dom.$$el = dom.$el = dom.h = void 0;
  const common_1$5 = common;
  function h(element, attrsOrChildren, childrenOrHandler) {
    let name = "";
    if (typeof element === "function") {
      name = (0, common_1$5.resolveCustomElementName)(element, "-");
    } else {
      name = element;
    }
    const el = document.createElement(name);
    if (attrsOrChildren) {
      if (Array.isArray(attrsOrChildren)) {
        for (const child of attrsOrChildren) {
          if (typeof child === "function") {
            el.append(document.createElement(child.name));
          } else {
            el.append(child);
          }
        }
      } else if (typeof attrsOrChildren === "string") {
        el.append(attrsOrChildren);
      } else {
        const attrs = attrsOrChildren;
        for (const key in attrs) {
          if (Object.prototype.hasOwnProperty.call(attrs, key)) {
            if (key === "style") {
              Object.assign(el.style, attrs[key]);
            } else {
              const value = attrs[key];
              Reflect.set(el, key, value);
            }
          }
        }
      }
    }
    if (childrenOrHandler) {
      if (typeof childrenOrHandler === "function") {
        childrenOrHandler.call(el, el);
      } else if (Array.isArray(childrenOrHandler)) {
        for (const child of childrenOrHandler) {
          if (typeof child === "function") {
            el.append(document.createElement(child.name));
          } else {
            el.append(child);
          }
        }
      } else if (typeof childrenOrHandler === "string") {
        el.append(childrenOrHandler);
      }
    }
    return el;
  }
  dom.h = h;
  function $el(selector, root2 = window.document) {
    const el = root2.querySelector(selector);
    return el === null ? void 0 : el;
  }
  dom.$el = $el;
  function $$el(selector, root2 = window.document) {
    return Array.from(root2.querySelectorAll(selector));
  }
  dom.$$el = $$el;
  function enableElementDraggable(header2, target, ondrag) {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
    header2.addEventListener("mousedown", dragMouseDown);
    function dragMouseDown(e) {
      e = e || window.event;
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener("mouseup", closeDragElement);
      document.addEventListener("mousemove", elementDrag);
    }
    function elementDrag(e) {
      e.stopPropagation();
      e = e || window.event;
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      target.style.top = Math.max(target.offsetTop - pos2, 10) + "px";
      target.style.left = target.offsetLeft - pos1 + "px";
    }
    function closeDragElement() {
      ondrag === null || ondrag === void 0 ? void 0 : ondrag();
      document.removeEventListener("mouseup", closeDragElement);
      document.removeEventListener("mousemove", elementDrag);
    }
  }
  dom.enableElementDraggable = enableElementDraggable;
  function enableElementTouchDraggable(header2, target, ondrag) {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
    header2.addEventListener("touchstart", dragTouchStart);
    function dragTouchStart(e) {
      e = e || window.event;
      const touch = e.touches[0];
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      document.addEventListener("touchend", closeDragElement);
      document.addEventListener("touchcancel", closeDragElement);
      document.addEventListener("touchmove", elementDrag, { capture: true, passive: false });
    }
    function elementDrag(e) {
      e.stopPropagation();
      e.preventDefault();
      e = e || window.event;
      const touch = e.touches[0];
      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      target.style.top = Math.max(target.offsetTop - pos2, 10) + "px";
      target.style.left = target.offsetLeft - pos1 + "px";
    }
    function closeDragElement() {
      ondrag === null || ondrag === void 0 ? void 0 : ondrag();
      document.removeEventListener("touchend", closeDragElement);
      document.removeEventListener("touchcancel", closeDragElement);
      document.removeEventListener("touchmove", elementDrag, { capture: true });
    }
  }
  dom.enableElementTouchDraggable = enableElementTouchDraggable;
  var elements$1 = {};
  Object.defineProperty(elements$1, "__esModule", { value: true });
  elements$1.$elements = void 0;
  elements$1.$elements = {
    tooltipContainer: void 0,
    root: void 0,
    currentScriptPanel: void 0,
    wrapper: void 0
  };
  var tampermonkey = {};
  (function(exports3) {
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.$gm = void 0;
    exports3.$gm = {
      unsafeWindow: typeof globalThis.unsafeWindow === "undefined" ? globalThis.window : globalThis.unsafeWindow,
      isInGMContext() {
        return typeof GM_info !== "undefined";
      },
      getInfos() {
        return typeof GM_info === "undefined" ? void 0 : GM_info;
      },
      getTab(callback) {
        return typeof GM_getTab === "undefined" ? void 0 : GM_getTab(callback);
      },
      notification(content, options) {
        var _a;
        const { onclick, ondone, important, duration = 30, silent = true, extraTitle = "" } = options || {};
        const { icon, name } = ((_a = exports3.$gm.getInfos()) === null || _a === void 0 ? void 0 : _a.script) || {};
        GM_notification({
          title: name + (extraTitle ? "-" + extraTitle : ""),
          text: content,
          image: icon || "",
          highlight: important,
          onclick,
          ondone,
          silent,
          timeout: duration * 1e3
        });
      },
      getMetadataFromScriptHead(key) {
        var _a, _b;
        const metadataString = (_a = this.getInfos()) === null || _a === void 0 ? void 0 : _a.scriptMetaStr;
        if (!metadataString) {
          return [];
        } else {
          const metadata = ((_b = metadataString.match(/\/\/\s+==UserScript==([\s\S]+)\/\/\s+==\/UserScript==/)) === null || _b === void 0 ? void 0 : _b[1]) || "";
          const metadataList = (metadata.match(/\/\/\s+@(.+?)\s+(.*?)(?:\n|$)/g) || []).map((line) => {
            const words = line.match(/[\S]+/g) || [];
            return {
              key: (words[1] || "").replace("@", ""),
              value: words.slice(2).join(" ")
            };
          });
          return metadataList.filter((l) => l.key === key).map((l) => l.value);
        }
      }
    };
  })(tampermonkey);
  Object.defineProperty(ui, "__esModule", { value: true });
  ui.$ui = void 0;
  const common_1$4 = common;
  const dom_1$6 = dom;
  const elements_1$2 = elements$1;
  const tampermonkey_1$1 = tampermonkey;
  function getPageZoom() {
    const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("zoom") || "1");
    return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  }
  const notesListenerBoundScripts = /* @__PURE__ */ new WeakSet();
  ui.$ui = {
    tooltip(target, position) {
      target.setAttribute("data-title", target.title);
      if (tampermonkey_1$1.$gm.isInGMContext()) {
        target.removeAttribute("title");
      }
      const container2 = () => elements_1$2.$elements.tooltipContainer;
      const isVisible = () => {
        var _a;
        return (_a = container2()) === null || _a === void 0 ? void 0 : _a.classList.contains("show");
      };
      let showTimer;
      let autoHideTimer;
      let lastTouchTime = 0;
      const computePlacement = () => {
        const el = container2();
        if (!el) {
          return;
        }
        const zoom = getPageZoom();
        const margin = 8;
        const rect = target.getBoundingClientRect();
        const tipRect = el.getBoundingClientRect();
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;
        let placement = (position === null || position === void 0 ? void 0 : position.startsWith("top")) ? "top" : "bottom";
        const fits = placement === "bottom" ? rect.bottom + margin + tipRect.height <= vh - margin : rect.top - margin - tipRect.height >= margin;
        if (!fits) {
          placement = placement === "bottom" ? "top" : "bottom";
        }
        const top2 = placement === "bottom" ? rect.bottom + margin : rect.top - margin - tipRect.height;
        const align = (position === null || position === void 0 ? void 0 : position.endsWith("left")) ? "left" : (position === null || position === void 0 ? void 0 : position.endsWith("right")) ? "right" : "center";
        let left;
        if (align === "left") {
          left = rect.left;
        } else if (align === "right") {
          left = rect.right - tipRect.width;
        } else {
          left = rect.left + rect.width / 2 - tipRect.width / 2;
        }
        left = Math.max(margin, Math.min(left, vw - margin - tipRect.width));
        const arrowLeft = Math.max(6, Math.min(rect.left + rect.width / 2 - left - 4, tipRect.width - 14));
        el.classList.remove("tooltip-top", "tooltip-bottom");
        el.classList.add(placement === "bottom" ? "tooltip-bottom" : "tooltip-top");
        el.style.setProperty("--tooltip-arrow-left", arrowLeft + "px");
        el.style.top = top2 / zoom + "px";
        el.style.left = left / zoom + "px";
      };
      const onScrollOrResize = () => {
        if (!target.isConnected) {
          hide();
          return;
        }
        computePlacement();
      };
      const onDocumentMouseOver = (e) => {
        if (!target.contains(e.target)) {
          hide();
        }
      };
      const onDocumentTouchStart = (e) => {
        const el = container2();
        const path = e.composedPath();
        if (!path.includes(target) && !(el && path.includes(el))) {
          hide();
        }
      };
      const bindWhileVisible = () => {
        window.addEventListener("scroll", onScrollOrResize, true);
        window.addEventListener("resize", onScrollOrResize);
        document.addEventListener("mouseover", onDocumentMouseOver, true);
        document.addEventListener("touchstart", onDocumentTouchStart, true);
      };
      const unbindWhileVisible = () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
        document.removeEventListener("mouseover", onDocumentMouseOver, true);
        document.removeEventListener("touchstart", onDocumentTouchStart, true);
      };
      const show = () => {
        const el = container2();
        const dataTitle = target.getAttribute("data-title");
        if (!el || !dataTitle) {
          hide();
          return;
        }
        el.innerHTML = dataTitle.split("\n").join("<br>") || "";
        el.__owner = target;
        computePlacement();
        void el.offsetWidth;
        el.classList.add("show");
        bindWhileVisible();
      };
      function hide(owner) {
        const el = container2();
        if (!el) {
          return;
        }
        if (owner && el.__owner !== owner) {
          return;
        }
        el.classList.remove("show");
        el.__owner = void 0;
        clearTimeout(autoHideTimer);
        unbindWhileVisible();
      }
      target.addEventListener("mouseenter", () => {
        if (Date.now() - lastTouchTime < 500) {
          return;
        }
        clearTimeout(showTimer);
        showTimer = setTimeout(show, 100);
      });
      target.addEventListener("mouseleave", () => {
        clearTimeout(showTimer);
        hide(target);
      });
      target.addEventListener("click", show);
      target.addEventListener("blur", () => hide(target));
      target.addEventListener("touchstart", () => {
        var _a;
        lastTouchTime = Date.now();
        clearTimeout(autoHideTimer);
        if (isVisible() && ((_a = container2()) === null || _a === void 0 ? void 0 : _a.__owner) === target) {
          hide(target);
        } else {
          show();
          autoHideTimer = setTimeout(() => hide(target), 3e3);
        }
      });
      return target;
    },
    scriptPanel(script2, store2, opts) {
      var _a, _b, _c, _d;
      const scriptPanel = (0, dom_1$6.h)("script-panel-element", { name: script2.name });
      const notesExpandedKey = `_notes_expanded_${script2.fullName()}`;
      scriptPanel.setNotesExpanded(store2.get(notesExpandedKey, true));
      scriptPanel.notesHeader.addEventListener("click", () => {
        const expanded = !scriptPanel.isNotesExpanded();
        scriptPanel.setNotesExpanded(expanded);
        store2.set(notesExpandedKey, expanded);
      });
      scriptPanel.notesHeader.title = "点击收缩 / 展开";
      this.tooltip(scriptPanel.notesHeader);
      const updateNotesVisibility = (content) => {
        scriptPanel.notesContainer.style.display = (content === null || content === void 0 ? void 0 : content.trim()) ? "" : "none";
      };
      if (!notesListenerBoundScripts.has(script2)) {
        notesListenerBoundScripts.add(script2);
        script2.onConfigChange("notes", () => {
          var _a2;
          const panel = script2.panel;
          if (panel) {
            panel.notesBody.innerHTML = script2.cfg.notes || "";
            panel.notesContainer.style.display = ((_a2 = script2.cfg.notes) === null || _a2 === void 0 ? void 0 : _a2.trim()) ? "" : "none";
          }
        });
      }
      script2.panel = scriptPanel;
      scriptPanel.notesBody.innerHTML = ((_b = (_a = script2.configs) === null || _a === void 0 ? void 0 : _a.notes) === null || _b === void 0 ? void 0 : _b.defaultValue) || "";
      updateNotesVisibility((_d = (_c = script2.configs) === null || _c === void 0 ? void 0 : _c.notes) === null || _d === void 0 ? void 0 : _d.defaultValue);
      let configs = /* @__PURE__ */ Object.create({});
      const elList = [];
      for (const key in script2.configs) {
        if (Object.prototype.hasOwnProperty.call(script2.configs, key)) {
          const cfg = script2.configs[key];
          if (cfg.separator) {
            elList.push(this.configsArea(this.configs(script2.namespace, store2, configs || {}, opts === null || opts === void 0 ? void 0 : opts.onload, script2)));
            elList.push((0, dom_1$6.h)("div", { className: "separator", style: { margin: "0px 8px" } }, cfg.separator));
            configs = /* @__PURE__ */ Object.create({});
          }
          configs[key] = cfg;
        }
      }
      if (Object.keys(configs).length > 0) {
        elList.push(this.configsArea(this.configs(script2.namespace, store2, configs || {}, opts === null || opts === void 0 ? void 0 : opts.onload, script2)));
      }
      scriptPanel.configsContainer.replaceChildren(...elList);
      return scriptPanel;
    },
    configsArea(configElements) {
      const configsContainer = (0, dom_1$6.h)("div", { className: "configs card" });
      const configsBody = (0, dom_1$6.h)("div", { className: "configs-body" });
      configsBody.append(...Object.entries(configElements).map(([key, el]) => el));
      configsContainer.append(configsBody);
      return configsContainer;
    },
    configs(namespace, store2, configs, onload, script2) {
      const resolveSlot = (slot) => typeof slot === "function" ? slot.call(script2, script2 === null || script2 === void 0 ? void 0 : script2.cfg) : slot;
      const elements2 = /* @__PURE__ */ Object.create({});
      for (const key in configs) {
        if (Object.prototype.hasOwnProperty.call(configs, key)) {
          const config2 = configs[key];
          if (config2.label !== void 0) {
            const element = (0, dom_1$6.h)("config-element", {
              key: common_1$4.$.namespaceKey(namespace, key),
              tag: config2.tag,
              sync: config2.sync,
              attrs: config2.attrs,
              _onload: function(el) {
                var _a;
                (_a = config2.onload) === null || _a === void 0 ? void 0 : _a.call(this, el);
                onload === null || onload === void 0 ? void 0 : onload(el);
              },
              defaultValue: config2.defaultValue,
              options: config2.options,
              showIf: config2.showIf,
              elementClassName: config2.elementClassName,
              labelClassName: config2.labelClassName,
              providerClassName: config2.providerClassName,
              enableForAttribute: config2.enableForAttribute,
              prefixSlot: resolveSlot(config2.prefixSlot),
              suffixSlot: resolveSlot(config2.suffixSlot)
            });
            element.store = store2;
            element.label.textContent = config2.label;
            elements2[key] = element;
          }
        }
      }
      return elements2;
    },
    notes(lines, tag = "ul") {
      return (0, dom_1$6.h)(tag, lines.map((line) => (0, dom_1$6.h)("li", Array.isArray(line) ? line.map((node) => typeof node === "string" ? (0, dom_1$6.h)("div", { innerHTML: node }) : node) : [typeof line === "string" ? (0, dom_1$6.h)("div", { innerHTML: line }) : line])));
    },
    copy(name, value) {
      return (0, dom_1$6.h)("span", "📄" + name, (btn) => {
        btn.className = "copy";
        btn.addEventListener("click", () => {
          btn.innerText = "已复制√";
          navigator.clipboard.writeText(value);
          setTimeout(() => {
            btn.innerText = "📄" + name;
          }, 500);
        });
      });
    },
    preventText(opts) {
      const { name, delay = 3, autoRemove = true, ondefault, onprevent } = opts;
      const span = (0, dom_1$6.h)("span", name);
      span.style.textDecoration = "underline";
      span.style.cursor = "pointer";
      span.onclick = () => {
        clearTimeout(id);
        if (autoRemove) {
          span.remove();
        }
        onprevent === null || onprevent === void 0 ? void 0 : onprevent(span);
      };
      const id = setTimeout(() => {
        if (autoRemove) {
          span.remove();
        }
        ondefault(span);
      }, delay * 1e3);
      return span;
    },
    space(children, options) {
      return (0, dom_1$6.h)("div", { className: "space" }, (div) => {
        var _a, _b, _c;
        for (let index = 0; index < children.length; index++) {
          const child = (0, dom_1$6.h)("span", { className: "space-item" }, [children[index]]);
          child.style.display = "inline-block";
          const x = (_a = options === null || options === void 0 ? void 0 : options.x) !== null && _a !== void 0 ? _a : 12;
          const y = (_b = options === null || options === void 0 ? void 0 : options.y) !== null && _b !== void 0 ? _b : 0;
          if (index > 0) {
            child.style.marginLeft = x / 2 + "px";
            child.style.marginRight = x / 2 + "px";
            child.style.marginTop = y / 2 + "px";
            child.style.marginBottom = y / 2 + "px";
          } else {
            child.style.marginRight = x / 2 + "px";
            child.style.marginBottom = y / 2 + "px";
          }
          div.append(child);
          if (index !== children.length - 1) {
            div.append((0, dom_1$6.h)("span", [(_c = options === null || options === void 0 ? void 0 : options.separator) !== null && _c !== void 0 ? _c : " "]));
          }
        }
      });
    },
    button(text2, attrs, handler) {
      return (0, dom_1$6.h)("input", Object.assign({ type: "button" }, attrs), function(btn) {
        btn.value = text2 || "";
        btn.classList.add("base-style-button");
        handler === null || handler === void 0 ? void 0 : handler.apply(this, [btn]);
      });
    }
  };
  (function(exports3) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports4) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports4, p))
          __createBinding(exports4, m, p);
    };
    Object.defineProperty(exports3, "__esModule", { value: true });
    __exportStar(common, exports3);
    __exportStar(ui, exports3);
    __exportStar(dom, exports3);
    __exportStar(elements$1, exports3);
    __exportStar(tampermonkey, exports3);
    __exportStar(store, exports3);
    __exportStar(_const, exports3);
  })(utils);
  (function(exports3) {
    var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.cors = exports3.CorsEventEmitter = void 0;
    const utils_12 = utils;
    const common_12 = common;
    const const_12 = _const;
    const store_12 = store;
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
      keyOfRecord(id) {
        return this.tempKey("event", id);
      }
      emit(name, args = [], callback) {
        store_12.$store.getTab(const_12.$const.TAB_UID).then((uid) => {
          const id = common_12.$.uuid().replace(/-/g, "");
          const key = uid + "." + this.eventKey(name);
          const recordKey = this.keyOfRecord(id);
          store_12.$store.set(recordKey, { state: 0, arguments: args, needReturn: !!callback });
          setTimeout(() => {
            if (callback) {
              const listenerId = store_12.$store.addChangeListener(recordKey, (curr) => {
                if ((curr === null || curr === void 0 ? void 0 : curr.state) !== 1) {
                  return;
                }
                store_12.$store.removeChangeListener(listenerId);
                callback(curr.return);
                store_12.$store.delete(recordKey);
              }) || 0;
            }
            const queue = store_12.$store.get(key);
            store_12.$store.set(key, (queue ? String(queue).split(",") : []).concat(id).join(","));
          }, 100);
        }).catch(console.error);
      }
      on(name, handler) {
        return new Promise((resolve) => {
          store_12.$store.getTab(const_12.$const.TAB_UID).then((uid) => {
            const key = uid + "." + this.eventKey(name);
            const originId = this.eventMap.get(key);
            if (originId) {
              resolve(originId);
            } else {
              const id = store_12.$store.addChangeListener(key, (curr, pre, remote) => __awaiter2(this, void 0, void 0, function* () {
                var _a;
                if (remote) {
                  if (curr === void 0) {
                    return;
                  }
                  const list = String(curr).split(",");
                  const eventId = list.pop();
                  if (eventId) {
                    const recordKey = this.keyOfRecord(eventId);
                    const record = store_12.$store.get(recordKey);
                    const returnValue = yield handler((_a = record === null || record === void 0 ? void 0 : record.arguments) !== null && _a !== void 0 ? _a : []);
                    setTimeout(() => {
                      if (record === null || record === void 0 ? void 0 : record.needReturn) {
                        store_12.$store.set(recordKey, Object.assign(Object.assign({}, record), { state: 1, return: returnValue }));
                      } else {
                        store_12.$store.delete(recordKey);
                      }
                      store_12.$store.set(key, list.join(","));
                    }, 100);
                  }
                }
              })) || 0;
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
          store_12.$store.removeChangeListener(originId);
        }
      }
      defineTopFunction(func) {
        if (utils_12.$gm.isInGMContext() === false) {
          return () => {
          };
        }
        const event_name = "_top_function_." + getFuncId(func);
        if (self === top) {
          exports3.cors.on(event_name, (args) => __awaiter2(this, void 0, void 0, function* () {
            return yield func(...args);
          }));
        }
        return (...args) => __awaiter2(this, void 0, void 0, function* () {
          if (self === top) {
            return yield func(...args);
          }
          const res = yield new Promise((resolve, reject) => {
            try {
              exports3.cors.emit(event_name, args, (val) => {
                resolve(val);
              });
            } catch (e) {
              reject(e);
            }
          });
          return res;
        });
      }
    }
    exports3.CorsEventEmitter = CorsEventEmitter;
    if (typeof GM_listValues !== "undefined" && self === top) {
      window.onload = () => {
        store_12.$store.list().forEach((key) => {
          if (/_temp_.event.[0-9a-z]{32}/.test(key)) {
            store_12.$store.delete(key);
          }
          if (/_top_function_.*/.test(key)) {
            store_12.$store.delete(key);
          }
          if (/[0-9a-z]{32}.cors.events/.test(key)) {
            store_12.$store.delete(key);
          }
        });
      };
    }
    exports3.cors = new CorsEventEmitter();
    function getFuncId(fn) {
      if (typeof fn !== "function") {
        throw new Error("first argument in defineTopFunction() is not Function!");
      }
      const str = fn.toString();
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(36).padStart(16, "0").slice(-16);
    }
  })(cors);
  var project = {};
  Object.defineProperty(project, "__esModule", { value: true });
  project.Project = void 0;
  class Project {
    constructor({ name, domains, scripts }) {
      this.name = name;
      this.domains = domains;
      for (const key in scripts) {
        if (Object.prototype.hasOwnProperty.call(scripts, key)) {
          const element = scripts[key];
          element.projectName = name;
        }
      }
      this.scripts = scripts;
    }
    static create(opts) {
      return new Project(opts);
    }
  }
  project.Project = Project;
  var script = {};
  var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(script, "__esModule", { value: true });
  script.Script = script.BaseScript = void 0;
  const common_1$3 = common;
  const start_1$1 = start$1;
  const store_1$1 = store;
  const common_2 = common$1;
  const events_1 = __importDefault$1(events.exports);
  class BaseScript extends common_2.CommonEventEmitter {
  }
  script.BaseScript = BaseScript;
  class Script extends BaseScript {
    get configs() {
      if (!this._resolvedConfigs) {
        this._resolvedConfigs = typeof this._configs === "function" ? this._configs() : this._configs;
      }
      return this._resolvedConfigs;
    }
    set configs(c) {
      this._configs = c;
    }
    constructor({ name, namespace, matches: matches2, excludes, configs, hideInPanel, onstart, onactive, oncomplete, onbeforeunload, onrender, onhistorychange, onhistorychanged, methods, priority }) {
      super();
      this.excludes = [];
      this.cfg = {};
      this.methods = /* @__PURE__ */ Object.create({});
      this.event = new events_1.default();
      this.name = name;
      this.namespace = namespace;
      this.matches = matches2;
      this.excludes = excludes;
      this._configs = configs;
      this.hideInPanel = hideInPanel;
      this.onstart = this.errorHandler(onstart);
      this.onactive = this.errorHandler(onactive);
      this.oncomplete = this.errorHandler(oncomplete);
      this.onbeforeunload = this.errorHandler(onbeforeunload);
      this.onrender = this.errorHandler(onrender);
      this.onhistorychange = this.errorHandler(onhistorychange);
      this.onhistorychanged = this.errorHandler(onhistorychanged);
      this.methods = (methods === null || methods === void 0 ? void 0 : methods.bind(this)()) || /* @__PURE__ */ Object.create({});
      this.priority = priority !== null && priority !== void 0 ? priority : 0;
      if (this.methods) {
        for (const key in methods) {
          if (Reflect.has(this.methods, key) && typeof this.methods[key] !== "function") {
            Reflect.set(this.methods, key, this.errorHandler(this.methods[key]));
          }
        }
      }
    }
    onConfigChange(key, handler) {
      const _key = common_1$3.$.namespaceKey(this.namespace, key.toString());
      return store_1$1.$store.addChangeListener(_key, (curr, pre, remote) => {
        handler(curr, pre, !!remote);
      });
    }
    offConfigChange(listener) {
      store_1$1.$store.removeChangeListener(listener);
    }
    fullName() {
      return this.projectName ? `${this.projectName}-${this.name}` : this.name;
    }
    withEvents() {
      return this;
    }
    hidePanel() {
      this.setPanelHidden(true);
    }
    showPanel() {
      this.setPanelHidden(false);
    }
    togglePanel() {
      this.setPanelHidden(!this.hideInPanel);
    }
    isPanelHidden() {
      return !!this.hideInPanel;
    }
    setPanelHidden(hidden) {
      this.hideInPanel = hidden;
      start_1$1.$win === null || start_1$1.$win === void 0 ? void 0 : start_1$1.$win.refreshPanel();
    }
    errorHandler(func) {
      return (...args) => {
        try {
          return func === null || func === void 0 ? void 0 : func.apply(this, args);
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
  script.Script = Script;
  (function(exports3) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports4) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports4, p))
          __createBinding(exports4, m, p);
    };
    Object.defineProperty(exports3, "__esModule", { value: true });
    __exportStar(common$1, exports3);
    __exportStar(config$1, exports3);
    __exportStar(cors, exports3);
    __exportStar(project, exports3);
    __exportStar(script, exports3);
    __exportStar(store_provider, exports3);
  })(interfaces);
  var customWindow = {};
  var elements = {};
  var config = {};
  var _interface = {};
  Object.defineProperty(_interface, "__esModule", { value: true });
  _interface.IElement = void 0;
  class IElement extends HTMLElement {
    connectedCallback() {
    }
    disconnectedCallback() {
    }
    adoptedCallback() {
    }
    attributeChangedCallback(name, oldValue, newValue) {
    }
  }
  _interface.IElement = IElement;
  Object.defineProperty(config, "__esModule", { value: true });
  config.ConfigElement = void 0;
  const ui_1 = ui;
  const dom_1$5 = dom;
  const interface_1$6 = _interface;
  class ConfigElement extends interface_1$6.IElement {
    constructor(store2) {
      super();
      this.label = (0, dom_1$5.h)("label");
      this.wrapper = (0, dom_1$5.h)("div", { className: "config-wrapper" });
      this.key = "";
      this.storeListeners = [];
      this.store = store2;
    }
    addStoreListener(key, fn) {
      const id = this.store.addChangeListener(key, fn);
      this.storeListeners.push({ id, fn });
    }
    disconnectedCallback() {
      for (const { id, fn } of this.storeListeners) {
        this.store.removeChangeListener(typeof id === "number" ? id : fn);
      }
      this.storeListeners = [];
    }
    get value() {
      return this.store.get(this.key, this.defaultValue);
    }
    set value(value) {
      this.provider.value = value;
      this.store.set(this.key, value);
    }
    connectedCallback() {
      var _a, _b, _c;
      switch (this.tag) {
        case "select": {
          this.provider = (0, dom_1$5.h)("select");
          const value = this.store.get(this.key, this.defaultValue);
          for (const item of this.options || []) {
            const option = ui_1.$ui.tooltip((0, dom_1$5.h)("option"));
            if (Array.isArray(item)) {
              option.value = item[0];
              option.textContent = (_a = item[1]) !== null && _a !== void 0 ? _a : item[0];
              if (item[2]) {
                option.title = item[2];
              }
              if (String(item[0]) === String(value)) {
                option.selected = true;
                option.toggleAttribute("selected");
              }
              this.provider.add(option);
            } else {
              option.value = item.value;
              option.textContent = (_b = item.label) !== null && _b !== void 0 ? _b : item.value;
              if (item.title) {
                option.title = item.title;
              }
              if (String(item.value) === String(value)) {
                option.selected = true;
                option.toggleAttribute("selected");
              }
              this.provider.add(option);
            }
          }
          this.provider.onchange = () => {
            this.store.set(this.key, this.provider.value);
          };
          break;
        }
        case "textarea": {
          this.provider = (0, dom_1$5.h)("textarea");
          this.provider.value = this.store.get(this.key, this.defaultValue);
          this.provider.onchange = () => {
            this.store.set(this.key, this.provider.value);
          };
          break;
        }
        default: {
          this.provider = (0, dom_1$5.h)("input");
          if (["checkbox", "radio"].some((t2) => {
            var _a2;
            return t2 === ((_a2 = this.attrs) === null || _a2 === void 0 ? void 0 : _a2.type);
          })) {
            this.provider.checked = this.store.get(this.key, this.defaultValue);
            const provider2 = this.provider;
            provider2.onchange = () => {
              this.store.set(this.key, provider2.checked);
            };
          } else {
            this.provider.value = this.store.get(this.key, this.defaultValue);
            this.provider.setAttribute("value", this.provider.value);
            this.provider.onchange = () => {
              const { min, max, type } = this.attrs || {};
              if (type === "number") {
                if (this.provider.value.trim() === "") {
                  this.provider.value = this.defaultValue;
                  this.store.set(this.key, this.defaultValue);
                  return;
                }
                const val = parseFloat(this.provider.value);
                const _min = min ? parseFloat(min) : void 0;
                const _max = max ? parseFloat(max) : void 0;
                if (_min && val < _min) {
                  this.provider.value = _min.toString();
                  this.store.set(this.key, parseFloat(this.provider.value));
                } else if (_max && val > _max) {
                  this.provider.value = _max.toString();
                  this.store.set(this.key, parseFloat(this.provider.value));
                } else {
                  this.store.set(this.key, val);
                }
              } else {
                this.store.set(this.key, this.provider.value);
              }
            };
          }
          break;
        }
      }
      if (this.enableForAttribute) {
        this.provider.setAttribute("id", this.key);
        this.label.setAttribute("for", this.key);
      }
      if (this.labelClassName) {
        this.label.className = this.labelClassName;
      }
      if (this.providerClassName) {
        this.provider.className = this.providerClassName;
      }
      if (this.elementClassName) {
        this.className = this.elementClassName;
      }
      if (this.prefixSlot !== void 0 || this.suffixSlot !== void 0) {
        const toNode = (slot, className) => typeof slot === "string" ? (0, dom_1$5.h)("span", { className, innerHTML: slot }) : slot;
        const children = [];
        if (this.prefixSlot !== void 0) {
          children.push(toNode(this.prefixSlot, "config-prefix"));
        }
        children.push(this.provider);
        if (this.suffixSlot !== void 0) {
          children.push(toNode(this.suffixSlot, "config-suffix"));
        }
        this.wrapper.replaceChildren((0, dom_1$5.h)("div", { className: "config-provider-container" }, children));
      } else {
        this.wrapper.replaceChildren(this.provider);
      }
      this.append(this.label, this.wrapper);
      for (const key in this.attrs) {
        if (key === "style") {
          Object.assign(this.provider.style, this.attrs[key]);
          continue;
        }
        if (Object.prototype.hasOwnProperty.call(this.attrs, key)) {
          Reflect.set(this.provider, key, Reflect.get(this.attrs, key));
        }
      }
      if (this.sync) {
        this.addStoreListener(this.key, (curr) => {
          this.provider.value = curr;
        });
      }
      ui_1.$ui.tooltip(this.provider);
      if (this.showIf) {
        let show_if = false;
        if (Array.isArray(this.showIf)) {
          if (typeof this.showIf[0] !== "string") {
            throw new Error("EUS Config.showIf first element must be a string");
          }
          const val = this.store.get(this.showIf[0], false) || false;
          const res = this.showIf[1].call(null, val, val, this.store);
          show_if = Boolean(res);
        } else {
          show_if = this.store.get(this.showIf, false) || false;
        }
        if (show_if) {
          this.style.display = "";
        } else {
          this.style.display = "none";
        }
        if (Array.isArray(this.showIf)) {
          if (typeof this.showIf[1] !== "function") {
            throw new Error("EUS Config.showIf second element must be a function");
          }
          this.addStoreListener(this.showIf[0], (curr, pre) => {
            if (this.isConnected) {
              if (this.showIf && Array.isArray(this.showIf)) {
                const res = this.showIf[1].call(null, curr, pre, this.store);
                if (res) {
                  this.style.display = "";
                } else {
                  this.style.display = "none";
                }
              }
            }
          });
        } else {
          this.addStoreListener(this.showIf, (curr) => {
            if (this.isConnected) {
              const res = Boolean(curr);
              if (res) {
                this.style.display = "";
              } else {
                this.style.display = "none";
              }
            }
          });
        }
      }
      (_c = this._onload) === null || _c === void 0 ? void 0 : _c.call(this.provider, this);
    }
  }
  config.ConfigElement = ConfigElement;
  var container = {};
  Object.defineProperty(container, "__esModule", { value: true });
  container.ContainerElement = void 0;
  const common_1$2 = common;
  const dom_1$4 = dom;
  const interface_1$5 = _interface;
  class ContainerElement extends interface_1$5.IElement {
    constructor() {
      super(...arguments);
      this.header = (0, dom_1$4.h)("header-element");
      this.body = (0, dom_1$4.h)("div", { className: "body", clientHeight: window.innerHeight / 2 });
      this.footer = (0, dom_1$4.h)("div", { className: "footer" });
    }
    connectedCallback() {
      this.append(this.header, this.body, this.footer);
      const stopScrollPropagation = (e) => e.stopPropagation();
      this.addEventListener("wheel", stopScrollPropagation);
      this.addEventListener("touchmove", stopScrollPropagation);
      common_1$2.$.onresize(this, (cont) => {
        cont.body.style.maxHeight = window.innerHeight - this.header.clientHeight - 64 + "px";
        cont.body.style.maxWidth = window.innerWidth - 50 + "px";
      });
    }
  }
  container.ContainerElement = ContainerElement;
  var dropdown = {};
  Object.defineProperty(dropdown, "__esModule", { value: true });
  dropdown.DropdownElement = void 0;
  const interface_1$4 = _interface;
  const dom_1$3 = dom;
  class DropdownElement extends interface_1$4.IElement {
    constructor() {
      super(...arguments);
      this.triggerElement = (0, dom_1$3.h)("button");
      this.content = (0, dom_1$3.h)("div", { className: "dropdown-content" });
      this.trigger = "hover";
      this.hideDelay = 50;
    }
    connectedCallback() {
      this.append(this.triggerElement, this.content);
      this.classList.add("dropdown");
      if (this.trigger === "click") {
        this.triggerElement.onclick = () => {
          this.content.classList.toggle("show");
        };
        this.removeDocumentClickHandler();
        this.documentClickHandler = (e) => {
          if (this.content.classList.contains("show") && e.composedPath().includes(this) === false) {
            this.content.classList.remove("show");
          }
        };
        document.addEventListener("click", this.documentClickHandler);
      } else {
        let hideTimer;
        const show = () => {
          if (hideTimer !== void 0) {
            clearTimeout(hideTimer);
            hideTimer = void 0;
          }
          this.content.classList.add("show");
        };
        const hide = () => {
          if (hideTimer !== void 0) {
            clearTimeout(hideTimer);
          }
          hideTimer = setTimeout(() => {
            this.content.classList.remove("show");
            hideTimer = void 0;
          }, this.hideDelay);
        };
        this.triggerElement.onmouseenter = show;
        this.triggerElement.onmouseleave = hide;
        this.content.onmouseenter = show;
        this.content.onmouseleave = hide;
      }
      this.content.onclick = () => {
        this.content.classList.remove("show");
      };
    }
    disconnectedCallback() {
      this.removeDocumentClickHandler();
    }
    removeDocumentClickHandler() {
      if (this.documentClickHandler) {
        document.removeEventListener("click", this.documentClickHandler);
        this.documentClickHandler = void 0;
      }
    }
  }
  dropdown.DropdownElement = DropdownElement;
  var header = {};
  Object.defineProperty(header, "__esModule", { value: true });
  header.HeaderElement = void 0;
  const interface_1$3 = _interface;
  class HeaderElement extends interface_1$3.IElement {
    connectedCallback() {
      this.append(this.visualSwitcher || "");
    }
  }
  header.HeaderElement = HeaderElement;
  var message = {};
  Object.defineProperty(message, "__esModule", { value: true });
  message.MessageElement = void 0;
  const dom_1$2 = dom;
  const interface_1$2 = _interface;
  class MessageElement extends interface_1$2.IElement {
    constructor() {
      super(...arguments);
      this.closer = (0, dom_1$2.h)("span", { className: "message-closer" }, "x");
      this.contentContainer = (0, dom_1$2.h)("span", { className: "message-content-container" });
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
      this.duration = Math.max((_a = this.duration) !== null && _a !== void 0 ? _a : 5, 0);
      this.append(this.contentContainer);
      if (this.closeable) {
        this.append(this.closer);
        this.closer.addEventListener("click", () => {
          var _a2;
          (_a2 = this.onClose) === null || _a2 === void 0 ? void 0 : _a2.call(this);
          this.remove();
        });
      }
      if (this.duration) {
        setTimeout(() => {
          var _a2;
          (_a2 = this.onClose) === null || _a2 === void 0 ? void 0 : _a2.call(this);
          this.remove();
        }, this.duration * 1e3);
      }
    }
  }
  message.MessageElement = MessageElement;
  var modal$1 = {};
  var __awaiter$2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(modal$1, "__esModule", { value: true });
  modal$1.ModalElement = void 0;
  const common_1$1 = common;
  const dom_1$1 = dom;
  const tampermonkey_1 = tampermonkey;
  const interface_1$1 = _interface;
  class ModalElement extends interface_1$1.IElement {
    constructor() {
      super(...arguments);
      this._title = (0, dom_1$1.h)("div", { className: "modal-title" });
      this.body = (0, dom_1$1.h)("div", { className: "modal-body" });
      this.footerContainer = (0, dom_1$1.h)("div", { className: "modal-footer" });
      this.modalInput = (0, dom_1$1.h)("input", { className: "modal-input" });
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
      const profile = (0, dom_1$1.h)("div", {
        innerText: this.profile || "弹窗来自: OCS " + (((_a = tampermonkey_1.$gm.getInfos()) === null || _a === void 0 ? void 0 : _a.script.version) || ""),
        className: "modal-profile"
      });
      this._title.innerText = this.title;
      this.body.append(typeof this.content === "string" ? (0, dom_1$1.h)("div", { innerHTML: this.content }) : this.content);
      if (this.modalInputType === "textarea") {
        this.modalInput = (0, dom_1$1.h)("textarea", { className: "modal-input", style: { height: "100px" } });
      }
      this.modalInput.placeholder = this.placeholder || "";
      this.modalInput.value = this.inputDefaultValue || "";
      this.append(profile, this._title, this.body, this.footerContainer);
      this.style.width = (this.width || 400) + "px";
      if (this.footer === void 0) {
        this.footerContainer.append(this.modalInput);
        if (this.cancelButton === void 0) {
          this.cancelButton = (0, dom_1$1.h)("button", { className: "modal-cancel-button" });
          this.cancelButton.innerText = this.cancelButtonText || "取消";
          this.cancelButton.onclick = () => {
            var _a2, _b;
            (_a2 = this.onCancel) === null || _a2 === void 0 ? void 0 : _a2.call(this);
            (_b = this.onClose) === null || _b === void 0 ? void 0 : _b.call(this);
            this.remove();
          };
        }
        if (this.confirmButton === void 0) {
          this.confirmButton = (0, dom_1$1.h)("button", { className: "modal-confirm-button" });
          this.confirmButton.innerText = this.confirmButtonText || "确定";
          this.confirmButton.onclick = () => __awaiter$2(this, void 0, void 0, function* () {
            var _b, _c;
            if ((yield (_b = this.onConfirm) === null || _b === void 0 ? void 0 : _b.call(this, this.modalInput.value)) !== false) {
              this.remove();
              (_c = this.onClose) === null || _c === void 0 ? void 0 : _c.call(this, this.modalInput.value);
            }
          });
        }
        this.cancelButton && this.footerContainer.append(this.cancelButton);
        this.confirmButton && this.footerContainer.append(this.confirmButton);
        if (this.type === "simple") {
          this.footerContainer.remove();
        } else if (this.type === "prompt") {
          this.modalInput.focus();
        }
      } else {
        this.footerContainer.append(this.footer);
      }
      common_1$1.$.onresize(this.body, (modal2) => {
        this.body.style.maxHeight = window.innerHeight - 100 + "px";
        this.body.style.maxWidth = window.innerWidth - 50 + "px";
      });
    }
  }
  modal$1.ModalElement = ModalElement;
  var script_panel = {};
  Object.defineProperty(script_panel, "__esModule", { value: true });
  script_panel.ScriptPanelElement = void 0;
  const dom_1 = dom;
  const interface_1 = _interface;
  class ScriptPanelElement extends interface_1.IElement {
    constructor() {
      super(...arguments);
      this.separator = (0, dom_1.h)("div", { className: "separator" });
      this.notesContainer = (0, dom_1.h)("div", { className: "notes card" });
      this.notesHeader = (0, dom_1.h)("div", { className: "notes-header" });
      this.notesBody = (0, dom_1.h)("div", { className: "notes-body" });
      this.configsContainer = (0, dom_1.h)("div", { className: "configs-container card" });
      this.body = (0, dom_1.h)("div", { className: "script-panel-body" });
      this.lockWrapper = (0, dom_1.h)("div", { className: "lock-wrapper" });
    }
    connectedCallback() {
      this.separator.innerText = this.name || "";
      this.notesHeader.append((0, dom_1.h)("span", { className: "notes-title" }, [(0, dom_1.h)("span", { className: "notes-info-icon" }, "i"), "提示"]), (0, dom_1.h)("span", { className: "notes-collapse-icon" }, "▼"));
      this.notesContainer.append(this.notesHeader);
      this.notesContainer.append(this.notesBody);
      this.append(this.separator);
      this.append(this.notesContainer);
      this.append(this.configsContainer);
      this.append(this.body);
    }
    setNotesExpanded(expanded) {
      this.notesContainer.classList.toggle("collapsed", !expanded);
    }
    isNotesExpanded() {
      return !this.notesContainer.classList.contains("collapsed");
    }
  }
  script_panel.ScriptPanelElement = ScriptPanelElement;
  (function(exports3) {
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.definedCustomElements = exports3.ScriptPanelElement = exports3.ModalElement = exports3.MessageElement = exports3.HeaderElement = exports3.ContainerElement = exports3.ConfigElement = void 0;
    const config_1 = config;
    const container_1 = container;
    const dropdown_1 = dropdown;
    const header_1 = header;
    const message_1 = message;
    const modal_1 = modal$1;
    const script_panel_1 = script_panel;
    var config_2 = config;
    Object.defineProperty(exports3, "ConfigElement", { enumerable: true, get: function() {
      return config_2.ConfigElement;
    } });
    var container_2 = container;
    Object.defineProperty(exports3, "ContainerElement", { enumerable: true, get: function() {
      return container_2.ContainerElement;
    } });
    var header_2 = header;
    Object.defineProperty(exports3, "HeaderElement", { enumerable: true, get: function() {
      return header_2.HeaderElement;
    } });
    var message_2 = message;
    Object.defineProperty(exports3, "MessageElement", { enumerable: true, get: function() {
      return message_2.MessageElement;
    } });
    var modal_2 = modal$1;
    Object.defineProperty(exports3, "ModalElement", { enumerable: true, get: function() {
      return modal_2.ModalElement;
    } });
    var script_panel_2 = script_panel;
    Object.defineProperty(exports3, "ScriptPanelElement", { enumerable: true, get: function() {
      return script_panel_2.ScriptPanelElement;
    } });
    exports3.definedCustomElements = [
      config_1.ConfigElement,
      container_1.ContainerElement,
      header_1.HeaderElement,
      modal_1.ModalElement,
      message_1.MessageElement,
      script_panel_1.ScriptPanelElement,
      dropdown_1.DropdownElement
    ];
  })(elements);
  var __awaiter$1 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __rest = commonjsGlobal && commonjsGlobal.__rest || function(s, e) {
    var t2 = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t2[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t2[p[i]] = s[p[i]];
      }
    return t2;
  };
  Object.defineProperty(customWindow, "__esModule", { value: true });
  customWindow.modal = customWindow.CustomWindow = void 0;
  const _1 = interfaces;
  const elements_1$1 = elements;
  const utils_1 = utils;
  const start_1 = start$1;
  const minimizeSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13H5v-2h14v2z"/></svg>';
  const expandSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z"/></svg>';
  class CustomWindow {
    constructor(projects, inputStoreProvider, config2) {
      this.messageContainer = (0, utils_1.h)("div", { className: "message-container" });
      this.menuBar = utils_1.$ui.tooltip(
        (0, utils_1.h)("div", { className: "header-menu-bar", title: "菜单栏-可拖动区域", style: { display: "flex", width: "100%" } }),
        "top"
      );
      this.extraMenuBar = (0, utils_1.h)("div", { className: "extra-menu-bar" });
      this.defaults = {
        urls: (urls) => urls && urls.length ? urls : [location.href],
        panelName: (name) => name || this.config.render.defaultPanelName || ""
      };
      this.projects = projects;
      this.inputStoreProvider = inputStoreProvider;
      this.config = config2;
      handleLowLevelBrowser();
      utils_1.$.loadCustomElements(elements_1$1.definedCustomElements);
      this.wrapper = (0, utils_1.h)("div");
      utils_1.$elements.tooltipContainer = (0, utils_1.h)("div", { className: "tooltip-container" });
      utils_1.$elements.wrapper = this.wrapper;
      this.root = this.wrapper.attachShadow({ mode: "closed" });
      utils_1.$elements.root = this.root;
      this.container = (0, utils_1.h)("container-element");
      this.root.append(this.container);
      const styles = config2.render.styles.map((s) => (0, utils_1.h)("style", s));
      this.container.append(...styles, this.messageContainer);
      new MutationObserver(() => this.layoutViewportTopMessages()).observe(this.messageContainer, { childList: true });
      const handlePosition = () => {
        const pos = config2.store.getPosition();
        if (pos.x > document.documentElement.clientWidth || pos.x < 0) {
          config2.store.setPosition(10, 10);
        }
        if (pos.y > document.documentElement.clientHeight || pos.y < 0) {
          config2.store.setPosition(10, 10);
        }
        this.container.style.left = pos.x + "px";
        this.container.style.top = pos.y + "px";
        const positionHandler = () => {
          config2.store.setPosition(this.container.offsetLeft, this.container.offsetTop);
        };
        (0, utils_1.enableElementDraggable)(this.menuBar, this.container, positionHandler);
        (0, utils_1.enableElementTouchDraggable)(this.menuBar, this.container, positionHandler);
      };
      const handleVisible = () => {
        window.addEventListener("click", (e) => {
          if (e.detail === Math.max(config2.render.switchPoint, 3)) {
            this.container.style.top = e.y + "px";
            this.container.style.left = e.x + "px";
            config2.store.setPosition(e.x, e.y);
            this.setVisual("normal");
          }
        });
      };
      const initCorsModalSystem = () => {
        _1.cors.on("modal", (args) => __awaiter$1(this, void 0, void 0, function* () {
          const [type, _attrs] = args || [];
          return new Promise((resolve, reject) => {
            const attrs = _attrs;
            attrs.onCancel = () => resolve("");
            attrs.onConfirm = resolve;
            attrs.onClose = resolve;
            modal(type, attrs);
          });
        }));
      };
      const initCorsMessageSystem = () => {
        _1.cors.on("message", (args) => __awaiter$1(this, void 0, void 0, function* () {
          const [type, attrs] = args || [];
          console.log("message", type, attrs);
          this.message(type, attrs);
        }));
      };
      const switchVisual = () => {
        this.setVisual(config2.store.getVisual() === "hidden" ? "normal" : "hidden");
      };
      window.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === config2.render.switchKey) {
          e.stopPropagation();
          e.preventDefault();
          switchVisual();
        }
      }, { capture: true });
      _1.cors.on("switch-visual", () => {
        switchVisual();
      });
      handleVisible();
      this.setVisual(config2.store.getVisual());
      (() => __awaiter$1(this, void 0, void 0, function* () {
        const urls = yield config2.store.getRenderURLs();
        const currentPanelName = yield config2.store.getCurrentPanelName();
        yield this.rerender(this.defaults.urls(urls), this.defaults.panelName(currentPanelName));
      }))();
      initCorsModalSystem();
      initCorsMessageSystem();
      handlePosition();
      this.setFontSize(config2.render.fontsize);
    }
    rerender(urls, currentPanelName) {
      return __awaiter$1(this, void 0, void 0, function* () {
        this.initHeader(urls, currentPanelName);
        yield this.renderBody(currentPanelName);
      });
    }
    initHeader(urls, currentPanelName) {
      const title = this.config.render.title;
      const profile = utils_1.$ui.tooltip((0, utils_1.h)("div", { className: "profile", title: "菜单栏（可拖动区域）" }, (el) => {
        if (title instanceof HTMLElement) {
          el.append(title);
        } else {
          el.innerHTML = title || "无标题";
        }
      }));
      const scriptDropdowns = [];
      for (const project2 of this.projects) {
        const dropdown2 = (0, utils_1.h)("dropdown-element");
        let selected = false;
        const options = [];
        const scripts = utils_1.$.getMatchedScripts([project2], urls).filter((s) => !s.hideInPanel);
        if (scripts.length) {
          for (const key in project2.scripts) {
            if (Object.prototype.hasOwnProperty.call(project2.scripts, key)) {
              const script2 = project2.scripts[key];
              if (!script2.hideInPanel) {
                const optionSelected = isCurrentPanel(project2.name, script2, currentPanelName);
                const option = (0, utils_1.h)("div", { className: "dropdown-option" }, script2.name);
                if (optionSelected) {
                  option.classList.add("active");
                }
                if (selected !== true && optionSelected) {
                  selected = true;
                }
                option.onclick = () => __awaiter$1(this, void 0, void 0, function* () {
                  yield this.config.store.setCurrentPanelName(project2.name + "-" + script2.name);
                });
                options.push(option);
              }
            }
          }
          if (selected) {
            dropdown2.classList.add("active");
          }
          dropdown2.triggerElement = (0, utils_1.h)("div", { className: "dropdown-trigger-element" }, project2.name);
          dropdown2.content.append(...options);
          scriptDropdowns.push(dropdown2);
        }
      }
      const isMinimize = () => this.config.store.getVisual() === "minimize";
      const visualSwitcher = utils_1.$ui.tooltip((0, utils_1.h)("div", {
        className: "switch ",
        title: isMinimize() ? "点击展开窗口" : "点击最小化窗口",
        innerHTML: isMinimize() ? expandSvg : minimizeSvg,
        onclick: () => {
          this.setVisual(isMinimize() ? "normal" : "minimize");
          visualSwitcher.title = isMinimize() ? "点击展开窗口" : "点击最小化窗口";
          visualSwitcher.innerHTML = isMinimize() ? expandSvg : minimizeSvg;
        }
      }));
      this.container.header.visualSwitcher = visualSwitcher;
      this.container.header.replaceChildren();
      this.menuBar.replaceChildren(profile, ...scriptDropdowns, this.container.header.visualSwitcher || "");
      this.container.header.append((0, utils_1.h)("div", { style: { width: "100%" } }, [
        this.menuBar,
        (0, utils_1.h)("div", { style: { display: "flex", width: "100%" } }, [this.extraMenuBar])
      ]));
    }
    renderBody(currentPanelName) {
      var _a;
      return __awaiter$1(this, void 0, void 0, function* () {
        for (const project2 of this.projects) {
          for (const key in project2.scripts) {
            if (Object.prototype.hasOwnProperty.call(project2.scripts, key)) {
              const script2 = project2.scripts[key];
              if (isCurrentPanel(project2.name, script2, currentPanelName)) {
                const panel = utils_1.$ui.scriptPanel(script2, utils_1.$.createPanelStoreAdapter(script2, this.inputStoreProvider));
                script2.projectName = project2.name;
                script2.panel = panel;
                script2.header = this.container.header;
                utils_1.$elements.currentScriptPanel = panel;
                this.container.body.replaceChildren(panel);
                (_a = script2.onrender) === null || _a === void 0 ? void 0 : _a.call(script2, { panel, header: this.container.header });
                script2.emit("render", { panel, header: this.container.header });
              }
            }
          }
        }
      });
    }
    setFontSize(fontsize) {
      this.container.style.font = `${fontsize}px  Menlo, Monaco, Consolas, 'Courier New', monospace`;
    }
    setVisual(value) {
      this.container.className = "";
      if (value === "minimize") {
        this.container.classList.add("minimize");
      } else if (value === "hidden") {
        this.container.classList.add("hidden");
      } else {
        this.container.classList.add("normal");
      }
      this.config.store.setVisual(value);
    }
    changeRenderURLs(urls) {
      return __awaiter$1(this, void 0, void 0, function* () {
        const currentPanelName = yield this.config.store.getCurrentPanelName();
        yield this.rerender(this.defaults.urls(urls), this.defaults.panelName(currentPanelName));
      });
    }
    changePanel(currentPanelName) {
      return __awaiter$1(this, void 0, void 0, function* () {
        this.currentPanelNameCache = currentPanelName;
        const urls = (yield this.config.store.getRenderURLs()) || [location.href];
        yield this.rerender(this.defaults.urls(urls), this.defaults.panelName(currentPanelName));
      });
    }
    getCurrentPanelNameCached() {
      if (this.currentPanelNamePromise === void 0) {
        this.currentPanelNamePromise = Promise.resolve(this.config.store.getCurrentPanelName()).then((name) => {
          this.currentPanelNameCache = name;
          return name;
        });
      }
      return this.currentPanelNamePromise;
    }
    refreshPanel() {
      return __awaiter$1(this, void 0, void 0, function* () {
        const urls = this.defaults.urls((yield this.config.store.getRenderURLs()) || [location.href]);
        let currentPanelName = this.defaults.panelName(yield this.config.store.getCurrentPanelName());
        const visibleScripts = utils_1.$.getMatchedScripts(this.projects, urls).filter((s) => !s.hideInPanel);
        const isCurrentVisible = visibleScripts.some((s) => isCurrentPanel(s.projectName, s, currentPanelName));
        if (!isCurrentVisible && visibleScripts.length > 0) {
          currentPanelName = visibleScripts[0].fullName();
        }
        yield this.rerender(urls, currentPanelName);
      });
    }
    pin(script2) {
      return __awaiter$1(this, void 0, void 0, function* () {
        if (script2.projectName) {
          yield this.config.store.setCurrentPanelName(`${script2.projectName}-${script2.name}`);
        } else if (script2.namespace) {
          yield this.config.store.setCurrentPanelName(script2.namespace);
        } else {
          console.warn("[ERROR]", `${script2.name} 无法置顶， projectName 与 namespace 都为 undefined`);
        }
      });
    }
    minimize() {
      this.setVisual("minimize");
    }
    normal() {
      this.setVisual("normal");
    }
    hidden() {
      this.setVisual("hidden");
    }
    message(type, attrs) {
      if (typeof attrs === "string") {
        attrs = { content: attrs };
      }
      const message2 = (0, utils_1.h)("message-element", Object.assign({ type }, attrs));
      this.messageContainer.append(message2);
      requestAnimationFrame(() => {
        const rect = message2.getBoundingClientRect();
        const outOfViewport = rect.left < 0 || rect.top < 0 || rect.right > window.innerWidth || rect.bottom > window.innerHeight;
        if (outOfViewport) {
          message2.classList.add("message-viewport-top");
          this.layoutViewportTopMessages();
        }
      });
      return message2;
    }
    layoutViewportTopMessages() {
      let top2 = 12;
      const gap = 8;
      const messages = this.messageContainer.querySelectorAll("message-element.message-viewport-top");
      for (const el of Array.from(messages)) {
        el.style.top = top2 + "px";
        top2 += el.offsetHeight + gap;
      }
    }
    menu(label, config2) {
      return __awaiter$1(this, void 0, void 0, function* () {
        this.extraMenuBar.style.display = "flex";
        const btn = (0, utils_1.h)("button", label);
        btn.addEventListener("click", () => {
          if (config2.scriptPanelLink) {
            this.pin(config2.scriptPanelLink).then(() => {
              this.normal();
            }).catch(console.error);
          }
        });
        if (config2.scriptPanelLink) {
          const full_name = (config2.scriptPanelLink.projectName ? config2.scriptPanelLink.projectName + " -> " : "") + config2.scriptPanelLink.name;
          btn.title = "快捷跳转：" + full_name;
          btn.setAttribute("data-name", (config2.scriptPanelLink.projectName + "-" + config2.scriptPanelLink.name).replace(/\s/g, "_"));
          btn.classList.add("script-panel-link");
        }
        this.extraMenuBar.append(utils_1.$ui.tooltip(btn));
        const name = yield this.getCurrentPanelNameCached();
        if (config2.scriptPanelLink) {
          if (isCurrentPanel(config2.scriptPanelLink.projectName, config2.scriptPanelLink, name)) {
            this.extraMenuBar.querySelectorAll(".script-panel-link").forEach((el) => el.classList.remove("active"));
            btn.classList.add("active");
          }
        }
        return btn;
      });
    }
    mount(parent) {
      parent.children[utils_1.$.random(0, parent.children.length - 1)].after(this.wrapper);
    }
  }
  customWindow.CustomWindow = CustomWindow;
  function isCurrentPanel(projectName, script2, currentPanelName) {
    return projectName + "-" + script2.name === currentPanelName || script2.namespace === currentPanelName;
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
  function modal(type, attrs, parent = (start_1.$win === null || start_1.$win === void 0 ? void 0 : start_1.$win.container) || utils_1.$elements.root || document.body) {
    const { maskCloseable = true, onConfirm, onCancel, onClose, notification: notify, notificationOptions, duration } = attrs, _attrs = __rest(attrs, ["maskCloseable", "onConfirm", "onCancel", "onClose", "notification", "notificationOptions", "duration"]);
    if (notify) {
      utils_1.$gm.notification(typeof _attrs.content === "string" ? _attrs.content : _attrs.content.textContent || "", notificationOptions);
    }
    const wrapper = (0, utils_1.h)("div", { className: "modal-wrapper" }, (wrapper2) => {
      const modal2 = (0, utils_1.h)("modal-element", Object.assign({
        onConfirm(val) {
          return __awaiter$1(this, void 0, void 0, function* () {
            const isClose = yield onConfirm === null || onConfirm === void 0 ? void 0 : onConfirm.apply(modal2, [val]);
            if (isClose !== false) {
              wrapper2.remove();
            }
            return isClose;
          });
        },
        onCancel() {
          onCancel === null || onCancel === void 0 ? void 0 : onCancel.apply(modal2);
          wrapper2.remove();
        },
        onClose(val) {
          onClose === null || onClose === void 0 ? void 0 : onClose.apply(modal2, [val]);
          wrapper2.remove();
        },
        type
      }, _attrs));
      wrapper2.append(modal2);
      modal2.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      if (maskCloseable) {
        wrapper2.addEventListener("click", () => {
          onClose === null || onClose === void 0 ? void 0 : onClose.apply(modal2);
          wrapper2.remove();
        });
      }
    });
    if (duration) {
      setTimeout(() => {
        wrapper.remove();
      }, duration * 1e3);
    }
    parent.append(wrapper);
    return wrapper;
  }
  customWindow.modal = modal;
  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(start$1, "__esModule", { value: true });
  start$1.addFunctionEventListener = start$1.start = start$1.$win = void 0;
  const interfaces_1 = interfaces;
  const custom_window_1 = customWindow;
  const common_1 = common;
  const const_1 = _const;
  const elements_1 = elements$1;
  const store_1 = store;
  const debounce_1 = __importDefault(debounce_1$1);
  let mounted = false;
  function start(startConfig) {
    return __awaiter(this, void 0, void 0, function* () {
      startConfig.projects = startConfig.projects.map((p) => {
        for (const key in p.scripts) {
          if (Object.prototype.hasOwnProperty.call(p.scripts, key)) {
            p.scripts[key].cfg = common_1.$.createConfigProxy(p.scripts[key]);
          }
        }
        return p;
      });
      const scripts = common_1.$.getMatchedScripts(startConfig.projects, [location.href]).sort((a, b) => b.priority - a.priority);
      scripts.forEach((script2) => {
        var _a;
        script2.startConfig = startConfig;
        script2.emit("start", startConfig);
        (_a = script2.onstart) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
      });
      const uid = yield store_1.$store.getTab(const_1.$const.TAB_UID);
      if (uid === void 0) {
        yield store_1.$store.setTab(const_1.$const.TAB_UID, common_1.$.uuid());
      }
      const urls = yield store_1.$store.getTab(const_1.$const.TAB_URLS);
      yield store_1.$store.setTab(const_1.$const.TAB_URLS, Array.from(new Set((urls || []).concat(location.href))));
      let active = false;
      if (document.readyState === "interactive") {
        active = true;
        mount(startConfig);
        scripts.forEach((script2) => {
          var _a;
          return (_a = script2.onactive) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
        });
      } else if (document.readyState === "complete") {
        mount(startConfig);
        scripts.forEach((script2) => {
          var _a;
          return (_a = script2.onactive) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
        });
        scripts.forEach((script2) => {
          var _a;
          return (_a = script2.oncomplete) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
        });
      }
      document.addEventListener("readystatechange", () => {
        mount(startConfig);
        if (document.readyState === "interactive" && active === false) {
          scripts.forEach((script2) => {
            var _a;
            script2.emit("active", startConfig);
            (_a = script2.onactive) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
          });
        }
        if (document.readyState === "complete") {
          scripts.forEach((script2) => {
            var _a;
            script2.emit("complete");
            (_a = script2.oncomplete) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
          });
        }
      });
      window.addEventListener("hashchange", () => {
        scripts.forEach((script2) => {
          var _a;
          script2.emit("hashchange", startConfig);
          (_a = script2.onhashchange) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
        });
      });
      history.pushState = addFunctionEventListener(history, "pushState");
      history.replaceState = addFunctionEventListener(history, "replaceState");
      window.addEventListener("pushState", () => {
        scripts.forEach((script2) => {
          var _a;
          script2.emit("historychange", "push", startConfig);
          (_a = script2.onhistorychange) === null || _a === void 0 ? void 0 : _a.call(script2, "push", startConfig);
        });
        const new_scripts = common_1.$.getMatchedScripts(startConfig.projects, [location.href]).sort((a, b) => b.priority - a.priority);
        new_scripts.forEach((ns) => {
          var _a;
          ns.emit("historychanged", "pushed", startConfig);
          (_a = ns.onhistorychanged) === null || _a === void 0 ? void 0 : _a.call(ns, "pushed", startConfig);
        });
      });
      window.addEventListener("replaceState", () => {
        scripts.forEach((script2) => {
          var _a;
          script2.emit("historychange", "replace", startConfig);
          (_a = script2.onhistorychange) === null || _a === void 0 ? void 0 : _a.call(script2, "replace", startConfig);
        });
        const new_scripts = common_1.$.getMatchedScripts(startConfig.projects, [location.href]).sort((a, b) => b.priority - a.priority);
        new_scripts.forEach((ns) => {
          var _a;
          ns.emit("historychanged", "replaced", startConfig);
          (_a = ns.onhistorychanged) === null || _a === void 0 ? void 0 : _a.call(ns, "replaced", startConfig);
        });
      });
      window.addEventListener("beforeunload", (e) => {
        var _a;
        let prevent;
        for (const script2 of scripts) {
          script2.emit("beforeunload");
          if ((_a = script2.onbeforeunload) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig)) {
            prevent = true;
          }
        }
        if (prevent) {
          e.preventDefault();
          e.returnValue = true;
          return true;
        }
      });
    });
  }
  start$1.start = start;
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
  start$1.addFunctionEventListener = addFunctionEventListener;
  function mount(startConfig) {
    return __awaiter(this, void 0, void 0, function* () {
      if (mounted === true) {
        return;
      }
      mounted = true;
      if (startConfig === void 0 || startConfig.renderConfig === void 0) {
        console.warn("the script will not have ui because the renderConfig is not defined.");
        return;
      }
      if (self !== top && startConfig.renderConfig) {
        window.addEventListener("keydown", (e) => {
          if (e.ctrlKey && e.key === "o") {
            e.stopPropagation();
            e.preventDefault();
            interfaces_1.cors.emit("switch-visual", []);
          }
        }, { capture: true });
      }
      if (self === top) {
        const { projects, renderConfig } = startConfig;
        if (typeof renderConfig.renderScript === "undefined") {
          console.warn("the script will not have ui because the RenderScript is not defined.");
          return;
        }
        const scripts = common_1.$.getMatchedScripts(projects, [location.href]).filter((s) => !!s.hideInPanel === false);
        if (scripts.length <= 0) {
          return;
        }
        const RenderScript2 = renderConfig.renderScript;
        const win = new custom_window_1.CustomWindow(startConfig.projects, store_1.$store, {
          render: {
            title: renderConfig.title,
            styles: renderConfig.styles,
            defaultPanelName: renderConfig.defaultPanelName,
            fontsize: RenderScript2.cfg.fontsize,
            switchPoint: RenderScript2.cfg.switchPoint,
            switchKey: "o"
          },
          store: {
            getPosition: () => {
              return { x: RenderScript2.cfg.x, y: RenderScript2.cfg.y };
            },
            setPosition: (x, y) => {
              RenderScript2.cfg.x = x;
              RenderScript2.cfg.y = y;
            },
            getVisual: () => {
              return RenderScript2.cfg.visual;
            },
            setVisual: (size) => {
              RenderScript2.cfg.visual = size;
            },
            getRenderURLs() {
              return __awaiter(this, void 0, void 0, function* () {
                return yield store_1.$store.getTab(const_1.$const.TAB_URLS);
              });
            },
            setRenderURLs(urls) {
              return __awaiter(this, void 0, void 0, function* () {
                return yield store_1.$store.setTab(const_1.$const.TAB_URLS, urls);
              });
            },
            getCurrentPanelName() {
              return __awaiter(this, void 0, void 0, function* () {
                return yield store_1.$store.getTab(const_1.$const.TAB_CURRENT_PANEL_NAME);
              });
            },
            setCurrentPanelName(name) {
              return __awaiter(this, void 0, void 0, function* () {
                return yield store_1.$store.setTab(const_1.$const.TAB_CURRENT_PANEL_NAME, name);
              });
            }
          }
        });
        RenderScript2.onConfigChange("fontsize", (fs) => {
          win.setFontSize(fs);
        });
        store_1.$store.addTabChangeListener(const_1.$const.TAB_URLS, (0, debounce_1.default)((curr, pre) => {
          if (JSON.stringify(curr) === JSON.stringify(pre)) {
            return;
          }
          win.changeRenderURLs(curr);
        }, 2e3));
        store_1.$store.addTabChangeListener(const_1.$const.TAB_CURRENT_PANEL_NAME, (curr, pre) => {
          if (curr === pre) {
            return;
          }
          win.changePanel(curr);
          updateMenusState(win, curr);
        });
        win.mount(startConfig.mountElement || document.body);
        elements_1.$elements.tooltipContainer && win.container.append(elements_1.$elements.tooltipContainer);
        start$1.$win = win;
      }
    });
  }
  function updateMenusState(win, name) {
    var _a;
    win.root.querySelectorAll(".extra-menu-bar .script-panel-link").forEach((el) => el.classList.remove("active"));
    (_a = win.root.querySelector('.extra-menu-bar [data-name="' + name.replace(/\s/g, "_") + '"]')) === null || _a === void 0 ? void 0 : _a.classList.add("active");
  }
  var render = {};
  (function(exports3) {
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.$menu = exports3.$message = exports3.$modal = exports3.createRenderScript = void 0;
    const script_1 = script;
    const ui_12 = ui;
    const dom_12 = dom;
    const custom_window_12 = customWindow;
    const start_12 = start$1;
    const interfaces_12 = interfaces;
    const createRenderScript = (config2) => new script_1.Script({
      name: (config2 === null || config2 === void 0 ? void 0 : config2.name) || "窗口设置",
      matches: (config2 === null || config2 === void 0 ? void 0 : config2.matches) || [["所有", /.*/]],
      namespace: "render.panel",
      configs: {
        notes: {
          defaultValue: ui_12.$ui.notes([
            [
              "如果需要隐藏整个窗口，可以点击下方隐藏按钮，",
              "隐藏后可以快速三击屏幕中的任意地方",
              "来重新在鼠标位置显示窗口。"
            ],
            "窗口连续点击显示的次数可以自定义，默认为三次",
            ["窗口快捷键列表：", "ctrl + o : 隐藏/打开 面板"]
          ]).outerHTML
        },
        x: { defaultValue: window.innerWidth * 0.1 },
        y: { defaultValue: window.innerWidth * 0.1 },
        visual: { defaultValue: "normal" },
        firstCloseAlert: {
          defaultValue: true
        },
        fontsize: {
          label: "字体大小（像素）",
          attrs: { type: "number", min: 12, max: 24, step: 1 },
          defaultValue: 14
        },
        switchPoint: {
          label: "窗口显示连点（次数）",
          attrs: {
            type: "number",
            min: 3,
            max: 10,
            step: 1,
            title: "设置当连续点击屏幕 N 次时，可以进行面板的 隐藏/显示 切换，默认连续点击屏幕三下"
          },
          defaultValue: 3
        }
      },
      methods() {
        return {
          pin: (script2) => start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.pin(script2),
          minimize: () => start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.minimize(),
          setPosition: (x, y) => {
            if (start_12.$win) {
              start_12.$win.config.store.setPosition(x, y);
              start_12.$win.container.style.left = x + "px";
              start_12.$win.container.style.top = y + "px";
            }
          },
          normal: () => {
            start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.normal();
          }
        };
      },
      onrender({ panel }) {
        const closeBtn = (0, dom_12.h)("button", { className: "base-style-button" }, "隐藏窗口");
        closeBtn.onclick = () => {
          if (this.cfg.firstCloseAlert) {
            exports3.$modal.confirm({
              content: ui_12.$ui.notes([
                "隐藏脚本页面后，快速点击页面三下（可以在悬浮窗设置中调整次数）即可重新显示脚本。如果三下无效，可以尝试删除脚本重新安装。",
                "请确认是否关闭。（此后不再显示此弹窗）"
              ]),
              onConfirm: () => {
                start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.hidden();
                this.cfg.firstCloseAlert = false;
              }
            });
          } else {
            start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.hidden();
          }
        };
        panel.body.replaceChildren((0, dom_12.h)("hr"), closeBtn);
      }
    });
    exports3.createRenderScript = createRenderScript;
    function _modal(type, attrs, parent) {
      if (self === top) {
        return (0, custom_window_12.modal)(type, attrs, parent);
      } else {
        interfaces_12.cors.emit("modal", [type, attrs], (args) => {
          var _a, _b, _c;
          if (args) {
            (_a = attrs.onConfirm) === null || _a === void 0 ? void 0 : _a.call(attrs, args);
          } else {
            (_b = attrs.onCancel) === null || _b === void 0 ? void 0 : _b.call(attrs);
          }
          (_c = attrs.onClose) === null || _c === void 0 ? void 0 : _c.call(attrs, args);
        });
      }
    }
    exports3.$modal = {
      confirm: (attrs, parent) => _modal("confirm", attrs, parent),
      alert: (attrs, parent) => _modal("alert", attrs, parent),
      prompt: (attrs, parent) => _modal("prompt", attrs, parent),
      simple: (attrs, parent) => _modal("simple", attrs, parent)
    };
    function _message(type, attrs) {
      if (self === top) {
        return start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.message(type, attrs);
      } else {
        if (typeof attrs === "string") {
          attrs = { content: attrs };
        } else if (typeof attrs.content !== "string") {
          attrs.content = attrs.content.innerHTML;
        }
        interfaces_12.cors.emit("message", [type, attrs]);
      }
    }
    exports3.$message = {
      info: (attrs) => _message("info", attrs),
      success: (attrs) => _message("success", attrs),
      warn: (attrs) => _message("warn", attrs),
      error: (attrs) => _message("error", attrs)
    };
    function $menu(label, config2) {
      if (self !== top) {
        return;
      }
      return start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.menu(label, config2);
    }
    exports3.$menu = $menu;
  })(render);
  (function(exports3) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports4) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports4, p))
          __createBinding(exports4, m, p);
    };
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.start = void 0;
    var start_12 = start$1;
    Object.defineProperty(exports3, "start", { enumerable: true, get: function() {
      return start_12.start;
    } });
    __exportStar(utils, exports3);
    __exportStar(render, exports3);
    __exportStar(elements, exports3);
    __exportStar(interfaces, exports3);
  })(lib);
  const ListOfActions = [
    "click",
    "check",
    "dblclick",
    "bringToFront",
    "dragAndDrop",
    "fill",
    "focus",
    "hover",
    "screenshot",
    "selectOption",
    "setInputFiles",
    "tap",
    "press",
    "reload",
    "waitForRequest",
    "waitForResponse",
    "waitForSelector",
    "keyboard.type",
    "keyboard.press",
    "mouse.wheel",
    "mouse.click",
    "mouse.dblclick",
    "mouse.down",
    "mouse.up",
    "mouse.move"
  ];
  const mouseIdleRequireActions = [
    "click",
    "dblclick",
    "dragAndDrop",
    "fill",
    "hover",
    "tap",
    "press",
    "keyboard.type",
    "keyboard.press",
    "mouse.wheel",
    "mouse.click",
    "mouse.dblclick",
    "mouse.down",
    "mouse.up",
    "mouse.move"
  ];
  class RemotePlaywright {
    static async getRemotePage(show_debug_cursor, logger) {
      if (this.currentPage) {
        return this.currentPage;
      }
      if (!this.authToken) {
        try {
          this.authToken = await request("http://localhost:15319/get-actions-key", {
            type: "GM_xmlhttpRequest",
            method: "get",
            responseType: "text"
          });
          this.currentPage = this.createRemotePage(this.authToken, { show_debug_cursor, logger });
          return this.currentPage;
        } catch (e) {
          console.log(e);
          return void 0;
        }
      } else {
        this.currentPage = this.createRemotePage(this.authToken, { show_debug_cursor, logger });
        return this.currentPage;
      }
    }
    static createRemotePage(authToken, configs) {
      const page = /* @__PURE__ */ Object.create({});
      configs = configs || {};
      configs.logger = configs.logger || console.debug;
      for (const property of ListOfActions) {
        Reflect.set(page, property, async (...args) => {
          var _a, _b, _c;
          let data;
          if (mouseIdleRequireActions.includes(property)) {
            await waitForMouseIdle();
          }
          if (property === "click") {
            if (args[0] instanceof Element) {
              const el = args[0];
              const options = args[1] || {};
              await scrollToElement(el);
              await $.sleep(500);
              const rect = el.getBoundingClientRect();
              const elFromPoint = (_a = lib.$elements.root) == null ? void 0 : _a.elementFromPoint(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2
              );
              if (elFromPoint && lib.$elements.root && lib.$elements.root.contains(elFromPoint)) {
                const panel = lib.$elements.root.querySelector("container-element");
                if (panel) {
                  lib.$message.info({ content: "检测到脚本阻挡点击位置，已自动移开", duration: 2 });
                  await $.transition(panel, "left", 0.1, rect.left + rect.width / 2 + 100 + "px", { reset_ms: 1 });
                }
              }
              if (configs == null ? void 0 : configs.show_debug_cursor) {
                showMousePointer(el);
              }
              data = {
                page: window.location.href,
                property: "mouse.click",
                args: [
                  rect.left + rect.width / 2,
                  rect.top + rect.height / 2,
                  {
                    button: options.button,
                    clickCount: options.clickCount,
                    delay: options.delay
                  }
                ]
              };
            } else if (typeof args[0] === "string") {
              const el = document.querySelector(args[0]);
              if (el) {
                await scrollToElement(el);
                if (configs == null ? void 0 : configs.show_debug_cursor) {
                  showMousePointer(el);
                }
              }
            }
          }
          if (!data) {
            data = { page: window.location.href, property, args };
          }
          (_b = configs == null ? void 0 : configs.logger) == null ? void 0 : _b.call(configs, "[RP]: ", JSON.stringify(data));
          try {
            const res = await request("/ocs-script-actions", {
              type: "fetch",
              method: "post",
              responseType: ["waitForRequest", "waitForResponse", "reload"].includes(property) ? "json" : "text",
              headers: {
                "auth-token": authToken
              },
              data
            });
            return res;
          } catch (e) {
            (_c = configs == null ? void 0 : configs.logger) == null ? void 0 : _c.call(configs, "[RP-ERROR]: ", JSON.stringify(data));
            return void 0;
          }
        });
      }
      console.log(page);
      return page;
    }
  }
  RemotePlaywright.authToken = "";
  RemotePlaywright.currentPage = void 0;
  function scrollToElement(el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    return $.sleep(200);
  }
  function showMousePointer(el) {
    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const div = document.createElement("div");
      div.textContent = "";
      div.style.position = "fixed";
      div.style.zIndex = "99999";
      div.style.width = "20px";
      div.style.height = "20px";
      div.style.border = "2px solid red";
      div.style.borderRadius = "50%";
      div.style.left = rect.left + rect.width / 2 - 11 + "px";
      div.style.top = rect.top + rect.height / 2 - 11 + "px";
      document.body.append(div);
      setTimeout(() => {
        div.remove();
      }, 500);
    }, 100);
  }
  function waitForMouseIdle(timeout = 200) {
    return new Promise((resolve) => {
      let timer;
      const default_timer = setTimeout(() => {
        window.removeEventListener("mousemove", onMouseMove);
        resolve();
      }, timeout);
      function onMouseMove() {
        clearTimeout(default_timer);
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          window.removeEventListener("mousemove", onMouseMove);
          resolve();
        }, timeout);
      }
      window.addEventListener("mousemove", onMouseMove);
    });
  }
  function defaultWorkTypeResolver(ctx) {
    function count2(selector) {
      let c = 0;
      for (const option of ctx.elements.options || []) {
        if ((option == null ? void 0 : option.querySelector(selector)) !== null) {
          c++;
        }
      }
      return c;
    }
    return count2('[type="radio"]') === 2 ? "judgement" : count2('[type="radio"]') > 2 ? "single" : count2('[type="checkbox"]') > 2 ? "multiple" : count2("textarea") >= 1 ? "completion" : void 0;
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
  function resolvePlainAnswer(answer) {
    const resolve = answer.trim().replace(/[,，.。．、 #]/g, "").trim();
    if (isPlainAnswer(resolve)) {
      return resolve;
    }
  }
  function isProgramAnswer(answer) {
    const code = (answer != null ? answer : "").trim();
    if (!code)
      return false;
    if (!/[;|；]/.test(code))
      return false;
    let score = 0;
    const strong = [
      /#include\s*[<"]/,
      /#define\s+\w/,
      /#!\//,
      /\b(?:int|void|float|double|char|long|short)\s+main\s*\(/,
      /\bfunction\s+\w+\s*\(/,
      /\bdef\s+\w+\s*\(/,
      /\bpublic\s+(?:class|static|void|int|float|double|String|final)\b/,
      /\bprivate\s+(?:class|static|void|int|float|double|String|final)\b/,
      /\bprotected\s+(?:class|static|void|int|float|double|String|final)\b/,
      /\bprintf\s*\(/,
      /\bscanf\s*\(/,
      /\bcout\s*<</,
      /\bcin\s*>>/,
      /System\.out\./,
      /console\.log\s*\(/,
      /\bpackage\s+[\w.]+\s*;/,
      /\bimport\s+[\w.*]+\s*;/,
      /\bclass\s+\w+\s*\{/,
      /\bstruct\s+\w+\s*\{/
    ];
    for (const re2 of strong)
      if (re2.test(code))
        score += 2;
    const medium = [
      /=>/,
      /->/,
      /::/,
      /\+\+/,
      /--/,
      /[+\-*/%]=/,
      /\bnew\s+\w+\s*\(/,
      /\bfor\s*\(/,
      /\bwhile\s*\(/,
      /\bif\s*\(/,
      /\bswitch\s*\(/,
      /\btypedef\s+/,
      /\b(?:int|float|double|char|void|bool|boolean|long|short|String|auto|const|let|var)\s+\w+/,
      /\bsizeof\s*\(/,
      /\bmalloc\s*\(/,
      /\bfree\s*\(/,
      /\bcout\b/,
      /\bcin\b/
    ];
    for (const re2 of medium)
      if (re2.test(code))
        score += 1;
    if (/\{/.test(code) && /\}/.test(code))
      score += 1;
    if (/;/.test(code))
      score += 1;
    return score >= 2;
  }
  function splitAnswer(answer, separators = ["===", "#", "---", "###", "|", ";", "；"]) {
    answer = answer.trim();
    if (answer.length === 0) {
      return [];
    }
    separators = separators.length === 0 ? ["===", "#", "---", "###", "|", ";", "；"] : separators;
    separators = separators.filter((el) => el.trim().length > 0);
    if (isProgramAnswer(answer)) {
      separators = separators.filter((el) => el !== ";" && el !== "|" && el !== "；");
    }
    try {
      const json = JSON.parse(answer);
      if (Array.isArray(json)) {
        return json.map(String).map((el) => el.trim()).filter((el) => el.length > 0);
      }
    } catch {
      for (const sep of separators) {
        if (answer.split(sep).length > 1) {
          return answer.split(sep).map((el) => el.trim()).filter((el) => el.length > 0);
        }
      }
    }
    return [answer];
  }
  function resolveSingle(answers, options, separators) {
    const allAnswer = answers.map((a) => splitAnswer(a, separators)).flat();
    const optionStrings = options.map(removeRedundant);
    const normalizedResult = answerNormalizedMatch(allAnswer, optionStrings);
    if (normalizedResult.length) {
      const candidates = normalizedResult.length > 1 ? disambiguateBySign(allAnswer, normalizedResult) : normalizedResult;
      const finalResult = candidates.length ? candidates : normalizedResult;
      const index = optionStrings.findIndex((opt) => opt === finalResult[0]);
      if (index !== -1) {
        return { finish: true, option: options[index] };
      }
    }
    const ratings = answerSimilar(allAnswer, optionStrings);
    let bestIndex = -1;
    let bestRating = 0;
    ratings.forEach((r, i) => {
      if (r.rating > bestRating) {
        bestRating = r.rating;
        bestIndex = i;
      }
    });
    if (bestIndex !== -1 && bestRating > 0.6) {
      let bestOption = options[bestIndex];
      const tied = options.filter((_, i) => ratings[i].rating === bestRating);
      if (tied.length > 1) {
        const strict = disambiguateBySign(allAnswer, tied);
        if (strict.length) {
          bestOption = strict[0];
        }
      }
      return {
        finish: true,
        option: bestOption,
        ratings: ratings.map((r) => r.rating)
      };
    }
    for (const answer of allAnswer) {
      const ans = resolvePlainAnswer(StringUtils.nowrap(answer, "").trim());
      if (ans && ans.length === 1) {
        const index = ans.charCodeAt(0) - 65;
        if (optionStrings[index] !== void 0) {
          return { finish: true, option: options[index] };
        }
      }
    }
    if (allAnswer.length > 1) {
      const merged = allAnswer.join("");
      const r = resolveSingle([merged], options, separators);
      if (r.finish) {
        return r;
      }
    }
    return { finish: false, allAnswer, options: optionStrings };
  }
  function resolveMultiple(resultAnswers, options, separators) {
    const optionStrings = options.map(removeRedundant);
    const groups = [];
    for (let i = 0; i < resultAnswers.length; i++) {
      const answers = splitAnswer(resultAnswers[i].trim(), separators);
      const normalizedGroup = {
        options: [],
        answers: [],
        ratings: [],
        similarSum: 0,
        similarCount: 0
      };
      const normalizedOptions = answerNormalizedMatch(answers, optionStrings);
      for (const opt of normalizedOptions) {
        const idx = optionStrings.indexOf(opt);
        if (idx !== -1) {
          const matchedAns = answers.find((a) => {
            const na2 = normalizeString(removeRedundant(a));
            const no2 = normalizeString(removeRedundant(opt));
            return na2 === no2 || na2.includes(no2);
          });
          if (!matchedAns)
            continue;
          normalizedGroup.options.push(options[idx]);
          normalizedGroup.answers.push(matchedAns);
          const na = normalizeString(removeRedundant(matchedAns));
          const no = normalizeString(removeRedundant(opt));
          const rating = na === no ? 1 : 0.8;
          normalizedGroup.ratings.push(rating);
          normalizedGroup.similarSum += rating;
          normalizedGroup.similarCount += 1;
        }
      }
      if (normalizedGroup.options.length > 1) {
        const signStrict = disambiguateBySign(answers, normalizedGroup.options);
        if (signStrict.length) {
          const keepIndices = signStrict.map((opt) => normalizedGroup.options.indexOf(opt));
          normalizedGroup.options = signStrict;
          normalizedGroup.answers = keepIndices.map((idx) => normalizedGroup.answers[idx]);
          normalizedGroup.ratings = keepIndices.map((idx) => normalizedGroup.ratings[idx]);
        }
      }
      const normalizedDisambiguated = disambiguateSimilarOptions(normalizedGroup.options, normalizedGroup.ratings);
      const normalizedKeptIndices = normalizedDisambiguated.map((opt) => normalizedGroup.options.indexOf(opt));
      normalizedGroup.options = normalizedDisambiguated;
      normalizedGroup.answers = normalizedKeptIndices.map((idx) => normalizedGroup.answers[idx]);
      normalizedGroup.ratings = normalizedKeptIndices.map((idx) => normalizedGroup.ratings[idx]);
      normalizedGroup.similarCount = normalizedGroup.options.length;
      normalizedGroup.similarSum = normalizedGroup.ratings.reduce((a, b) => a + b, 0);
      const ratingGroup = { options: [], answers: [], ratings: [], similarSum: 0, similarCount: 0 };
      const ratings = answerSimilarWithGap(answers, optionStrings);
      for (let j = 0; j < ratings.length; j++) {
        if (ratings[j].rating > 0.6) {
          ratingGroup.options.push(options[j]);
          ratingGroup.answers.push(ratings[j].target);
          ratingGroup.ratings.push(ratings[j].rating);
          ratingGroup.similarSum += ratings[j].rating;
          ratingGroup.similarCount += 1;
        }
      }
      const disambiguated = disambiguateSimilarOptions(ratingGroup.options, ratingGroup.ratings);
      const keptIndices = disambiguated.map((opt) => ratingGroup.options.indexOf(opt));
      ratingGroup.options = disambiguated;
      ratingGroup.answers = keptIndices.map((idx) => ratingGroup.answers[idx]);
      ratingGroup.ratings = keptIndices.map((idx) => ratingGroup.ratings[idx]);
      ratingGroup.similarCount = ratingGroup.options.length;
      ratingGroup.similarSum = ratingGroup.ratings.reduce((a, b) => a + b, 0);
      const best = [normalizedGroup, ratingGroup].sort(
        (a, b) => b.similarCount * 100 + b.similarSum - a.similarCount * 100 - a.similarSum
      )[0];
      groups[i] = best;
    }
    const sorted = groups.filter((g) => g.similarCount !== 0).sort((a, b) => {
      const bsc = b.similarCount * 100;
      const asc = a.similarCount * 100;
      return bsc + b.similarSum - asc - a.similarSum;
    });
    if (sorted[0]) {
      return { finish: true, options: sorted[0].options, groups: sorted };
    }
    const plainOptions = [];
    for (const answer of resultAnswers) {
      const ans = StringUtils.nowrap(answer, "").trim();
      if (resolvePlainAnswer(ans)) {
        for (const char of ans) {
          const index = char.charCodeAt(0) - 65;
          if (options[index] !== void 0) {
            plainOptions.push(options[index]);
          }
        }
      }
    }
    if (plainOptions.length) {
      return { finish: true, plainOptions: [...new Set(plainOptions)] };
    }
    return { finish: false };
  }
  function disambiguateSimilarOptions(options, ratings, threshold = 0.6) {
    if (options.length <= 1)
      return options;
    const normalized = options.map((o) => normalizeString(removeRedundant(o)));
    const eliminated = /* @__PURE__ */ new Set();
    for (let i = 0; i < options.length; i++) {
      if (eliminated.has(i))
        continue;
      for (let j = i + 1; j < options.length; j++) {
        if (eliminated.has(j))
          continue;
        const pairwise = src.findBestMatch(normalized[i], [normalized[j]]).bestMatch.rating;
        if (pairwise > threshold) {
          if (ratings[i] >= ratings[j]) {
            eliminated.add(j);
          } else {
            eliminated.add(i);
            break;
          }
        }
      }
    }
    return options.filter((_, i) => !eliminated.has(i));
  }
  const CORRECT_WORDS = ["是", "对", "正确", "确定", "√", "对的", "是的", "正确的", "true", "True", "T", "yes", "1"];
  const INCORRECT_WORDS = [
    "非",
    "否",
    "错",
    "错误",
    "×",
    "X",
    "错的",
    "不对",
    "不正确的",
    "不正确",
    "不是",
    "不是的",
    "false",
    "False",
    "F",
    "no",
    "0"
  ];
  function resolveJudgement(answerGroups, options) {
    for (const answers of answerGroups) {
      const answerShowCorrect = answers.find((a) => matches(a, CORRECT_WORDS));
      const answerShowIncorrect = answers.find((a) => matches(a, INCORRECT_WORDS));
      if (answerShowCorrect || answerShowIncorrect) {
        for (const option of options) {
          const textShowCorrect = matches(option, CORRECT_WORDS);
          const textShowIncorrect = matches(option, INCORRECT_WORDS);
          if (answerShowCorrect && textShowCorrect) {
            return { finish: true, option };
          }
          if (answerShowIncorrect && textShowIncorrect) {
            return { finish: true, option };
          }
        }
        return { finish: false };
      }
    }
    return { finish: false };
  }
  function matches(target, words) {
    return words.some(
      (word) => clearString(removeRedundant(word), "√", "×") === clearString(removeRedundant(target), "√", "×")
    );
  }
  function isJudgementOptions(options) {
    if (options.length !== 2)
      return false;
    const hasCorrect = options.some((opt) => matches(opt, CORRECT_WORDS));
    const hasIncorrect = options.some((opt) => matches(opt, INCORRECT_WORDS));
    return hasCorrect && hasIncorrect;
  }
  function resolveCompletion(answerGroups, blankCount, separators) {
    for (const answers of answerGroups) {
      let ans = answers.filter((a) => a);
      if (ans.length === 1) {
        ans = splitAnswer(ans[0], separators);
      }
      if (ans.length !== 0 && (ans.length === blankCount || blankCount === 1)) {
        if (ans.length === blankCount) {
          return { finish: true, answers: ans };
        } else if (blankCount === 1) {
          return { finish: true, answers: [ans.join(" ")] };
        }
      }
    }
    return { finish: false };
  }
  function createDefaultQuestionResolver(ctx, optionText) {
    const toText = (o, i) => optionText ? optionText(o, i) : o.innerText;
    return {
      async single(infos, options, handler) {
        const optionTexts = options.map((o, i) => toText(o, i));
        if (isJudgementOptions(optionTexts.map((o) => o.trim()))) {
          const answerGroups = infos.map((info) => info.results.map((res) => res.answer));
          const result2 = resolveJudgement(answerGroups, optionTexts);
          if (result2.finish && result2.option !== void 0) {
            const index = optionTexts.indexOf(result2.option);
            const opt = index !== -1 ? options[index] : options[0];
            await handler("judgement", result2.option, opt, ctx);
          }
          return result2;
        }
        const answers = infos.map((info) => info.results.map((res) => res.answer)).flat();
        const result = resolveSingle(answers, optionTexts, ctx.answerSeparators);
        if (result.finish && result.option !== void 0) {
          const index = optionTexts.indexOf(result.option);
          const opt = index !== -1 ? options[index] : options[0];
          await handler("single", result.option, opt, ctx);
        }
        return result;
      },
      async multiple(infos, options, handler) {
        var _a;
        const resultAnswers = infos.map((info) => info.results.map((res) => res.answer)).flat();
        const optionTexts = options.map((o, i) => toText(o, i));
        const result = resolveMultiple(resultAnswers, optionTexts, ctx.answerSeparators);
        const resolvedOptions = result.finish ? (_a = result.options) != null ? _a : result.plainOptions : void 0;
        if (result.finish && resolvedOptions) {
          for (const optText of resolvedOptions) {
            const index = optionTexts.indexOf(optText);
            const opt = index !== -1 ? options[index] : options[0];
            await handler("multiple", optText, opt, ctx);
          }
        }
        return result;
      },
      async judgement(infos, options, handler) {
        const answerGroups = infos.map((info) => info.results.map((res) => res.answer));
        const optionTexts = options.map((o, i) => toText(o, i));
        const result = resolveJudgement(answerGroups, optionTexts);
        if (result.finish && result.option !== void 0) {
          const index = optionTexts.indexOf(result.option);
          const opt = index !== -1 ? options[index] : options[0];
          await handler("judgement", result.option, opt, ctx);
        }
        return result;
      },
      async completion(infos, options, handler) {
        const answerGroups = infos.map((info) => info.results.map((res) => res.answer));
        const result = resolveCompletion(answerGroups, options.length, ctx.answerSeparators);
        if (result.finish && result.answers) {
          for (let i = 0; i < result.answers.length; i++) {
            await handler("completion", result.answers[i], options[i], ctx);
          }
        }
        return result;
      }
    };
  }
  const AnswerWrapperHandlerConfig = {
    timeout_seconds: 60
  };
  async function defaultAnswerWrapperHandler(answererWrappers, env) {
    const searchInfos = [];
    const temp = JSON.parse(JSON.stringify(answererWrappers));
    if (temp.length === 0) {
      throw new Error("题库配置不能为空，请配置后重新开始自动答题。");
    }
    if (env.title === void 0)
      env.title = "";
    if (env.options === void 0)
      env.options = "";
    if (env.type === void 0)
      env.type = "unknown";
    if (env.images === void 0)
      env.images = [];
    if (env.suggestion_title === void 0)
      env.suggestion_title = "";
    if (env.suggestion_options === void 0)
      env.suggestion_options = "";
    await Promise.all(
      temp.map(async (wrapper) => {
        var _a;
        const {
          name = "未知题库",
          homepage = "#",
          method = "get",
          type = "fetch",
          contentType = "json",
          responseType = "json",
          headers = {},
          data: wrapperData = {},
          handler = "return (res)=> [JSON.stringify(res), undefined]"
        } = wrapper;
        if (method.toLocaleLowerCase() === "post") {
          if (!Object.keys(headers).some((k) => k.toLowerCase() === "content-type")) {
            headers["Content-Type"] = "application/json";
          }
        }
        try {
          let results = [];
          let requestData;
          let url;
          if (method.toLocaleLowerCase() === "get") {
            url = new URL(resolvePlaceHolder(wrapper.url, { encodeURI: true }));
            Object.keys(wrapperData).forEach((key) => {
              url.searchParams.set(key, resolvePlaceHolder(wrapperData[key]));
            });
            requestData = {};
          } else if (method.toLocaleLowerCase() === "post") {
            url = new URL(wrapper.url);
            const data = /* @__PURE__ */ Object.create({});
            Object.keys(wrapperData).forEach((key) => {
              if (typeof wrapperData[key] === "object" && Reflect.has(wrapperData[key], "handler")) {
                const handler2 = Function(Reflect.get(wrapperData[key], "handler"))();
                if (typeof handler2 !== "function") {
                  throw new Error("data 字段解析器必须返回一个函数");
                }
                const result = handler2(env);
                Reflect.set(data, key, result);
              } else {
                Reflect.set(data, key, resolvePlaceHolder(wrapperData[key]));
              }
            });
            requestData = data;
          } else {
            throw new Error("不支持的请求方式");
          }
          const responseData = await Promise.race([
            request(url.toString(), {
              method,
              responseType: responseType || contentType,
              data: requestData,
              type,
              headers: JSON.parse(JSON.stringify(headers || {}))
            }),
            $.sleep(((_a = AnswerWrapperHandlerConfig.timeout_seconds) != null ? _a : 60) * 1e3)
          ]);
          if (responseData === void 0) {
            throw new Error("题库请求超时，可能是题库问题，或者请检查网络或者重试。");
          }
          const responseHandler = Function(handler)();
          if (typeof responseHandler !== "function") {
            throw new Error("handler 响应处理器必须返回一个函数");
          }
          const info = responseHandler(responseData);
          if (info && Array.isArray(info)) {
            if (info.every((item) => Array.isArray(item))) {
              results = results.concat(
                info.map((item) => ({
                  question: item[0],
                  answer: item[1],
                  extra_data: item[2] || {}
                }))
              );
            } else {
              results.push({
                question: info[0],
                answer: info[1],
                extra_data: info[2] || {}
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
          console.error(error);
          searchInfos.push({
            url: wrapper.url,
            name,
            homepage,
            results: [],
            response: void 0,
            data: void 0,
            error: (error == null ? void 0 : error.message) || "题库连接失败"
          });
        }
      })
    );
    function resolvePlaceHolder(data, options) {
      if (typeof data === "string") {
        const matches2 = data.match(/\${(.*?)}/g) || [];
        matches2.forEach((placeHolder) => {
          const value = env[placeHolder.replace(/\${(.*)}/, "$1")];
          data = data.replace(placeHolder, (options == null ? void 0 : options.encodeURI) ? encodeURIComponent(value) : value);
        });
      } else if (typeof data === "object") {
        const keys = Object.keys(data);
        for (const key of keys) {
          data[key] = resolvePlaceHolder(data[key], options);
        }
      }
      return data;
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
              throw new Error(`第 ${i + 1} 个题库的 名字(name) 为空`);
            }
            if (typeof item.url !== "string") {
              throw new Error(`第 ${i + 1} 个题库的 接口地址(url) 为空`);
            }
            if (typeof item.handler !== "string") {
              throw new Error(`第 ${i + 1} 个题库的 解析器(handler) 为空`);
            }
            if (item.headers && typeof item.headers !== "object") {
              throw new Error(`第 ${i + 1} 个题库的 头部信息(header) 应为 对象 格式`);
            }
            if (item.data && typeof item.data !== "object") {
              throw new Error(`第 ${i + 1} 个题库的 提交数据(data) 应为 对象 格式`);
            }
            const contentTypes = ["json", "text"];
            if (item.contentType && contentTypes.every((i2) => i2 !== item.contentType)) {
              throw new Error(`第 ${i + 1} 个题库的 contentType 必须为以下选项中的一个  ${contentTypes.join(", ")}`);
            }
            const methods = ["post", "get"];
            if (item.method && methods.every((i2) => i2 !== item.method)) {
              throw new Error(`第 ${i + 1} 个题库的 method 必须为以下选项中的一个  ${methods.join(", ")}`);
            }
            const types = ["fetch", "GM_xmlhttpRequest"];
            if (item.type && types.every((i2) => i2 !== item.type)) {
              throw new Error(`第 ${i + 1} 个题库的 type 必须为以下选项中的一个  ${types.join(", ")}`);
            }
          }
          return aw;
        } else {
          throw new Error("题库为空！");
        }
      } else {
        throw new Error("题库配置格式错误！");
      }
    }
    static fromJSONString(json) {
      const raw = json.toString();
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error(`格式错误，必须为：json字符串`);
      }
    }
    static fromBase64(base64) {
      return this.fromJSONString(Buffer.from(base64, "base64").toString("utf8"));
    }
    static from(value) {
      if (typeof value === "string") {
        if (/^\s*https?:\/\//.test(value)) {
          throw new Error("已不支持从链接加载题库配置，请直接粘贴题库配置内容，或使用「一键获取题库」功能。");
        }
        return this.fromJSONString(value);
      } else {
        return this.fromObject(value);
      }
    }
  }
  class OCSWorker extends lib.CommonEventEmitter {
    constructor(opts) {
      super();
      this.isRunning = false;
      this.isClose = false;
      this.isStop = false;
      this.totalQuestionCount = 0;
      this.opts = opts;
    }
    startRootObserver() {
      var _a, _b;
      const cfg = this.opts.rootObserver;
      if (!(cfg == null ? void 0 : cfg.enabled) || this.rootObserverTimer !== void 0) {
        return;
      }
      const interval = (_a = cfg.checkIntervalMs) != null ? _a : 1e3;
      const lostTimeout = (_b = cfg.lostTimeoutMs) != null ? _b : 1e3;
      this.rootObserverTimer = setInterval(() => {
        var _a2, _b2;
        if (this.isClose) {
          this.stopRootObserver();
          return;
        }
        const alive = typeof this.opts.root === "string" ? !!document.querySelector(this.opts.root) : this.opts.root.some((el) => el.isConnected);
        if (alive) {
          this.rootLostSince = void 0;
          return;
        }
        (_a2 = this.rootLostSince) != null ? _a2 : this.rootLostSince = Date.now();
        if (Date.now() - this.rootLostSince >= lostTimeout) {
          this.stopRootObserver();
          (_b2 = cfg.onRootLost) == null ? void 0 : _b2.call(cfg);
          if (!this.isClose) {
            lib.$message.warn({
              content: "⚠️ 题目元素已从页面消失（页面可能已跳转或刷新），答题程序已自动关闭。",
              duration: 0
            });
          }
          this.emit("close");
        }
      }, interval);
    }
    stopRootObserver() {
      if (this.rootObserverTimer !== void 0) {
        clearInterval(this.rootObserverTimer);
        this.rootObserverTimer = void 0;
      }
      this.rootLostSince = void 0;
    }
    async doWork(options) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      this.emit("start");
      this.isRunning = true;
      this.once("close", () => {
        this.isClose = true;
        this.stopRootObserver();
      });
      this.startRootObserver();
      this.on("stop", () => {
        this.isStop = true;
      });
      this.on("continuate", () => {
        this.isStop = false;
      });
      const questionRoots = typeof this.opts.root === "string" ? Array.from(document.querySelectorAll(this.opts.root)) : this.opts.root;
      this.totalQuestionCount += questionRoots.length;
      if (options == null ? void 0 : options.enable_debug) {
        console.debug("开始答题", this);
        console.debug("题目数量: ", questionRoots.length);
        console.debug("父节点列表: ", questionRoots);
      }
      const results = [];
      if (questionRoots.length === 0) {
        throw new Error("未找到任何题目，答题结束。");
      }
      for (const questionRoot of questionRoots) {
        const ctx = {
          searchInfos: [],
          root: questionRoot,
          elements: domSearchAll(this.opts.elements, questionRoot),
          type: void 0,
          answerSeparators: this.opts.answerSeparators
        };
        await ((_b = (_a = this.opts).onElementSearched) == null ? void 0 : _b.call(_a, ctx.elements, questionRoot));
        ctx.elements.title = (_c = ctx.elements.title) == null ? void 0 : _c.filter(Boolean);
        ctx.elements.options = (_d = ctx.elements.options) == null ? void 0 : _d.filter(Boolean);
        if (typeof this.opts.work === "object") {
          ctx.type = this.opts.work.type === void 0 ? defaultWorkTypeResolver(ctx) : typeof this.opts.work.type === "string" ? this.opts.work.type : this.opts.work.type(ctx);
        }
        results.push({
          requested: false,
          resolved: false,
          ctx
        });
        await ((_f = (_e = this.opts).onQuestionDetected) == null ? void 0 : _f.call(_e, results[results.length - 1], results));
      }
      if (options == null ? void 0 : options.enable_debug) {
        console.debug("上下文已初始化: ", results);
      }
      if (results.length > 0) {
        await ((_h = (_g = this.opts).onResultsInit) == null ? void 0 : _h.call(_g, results[0], 0, results));
      }
      const requestThread = async (index) => {
        var _a2, _b2, _c2, _d2, _e2;
        let error;
        const result = results[index];
        const ctx = result.ctx || {};
        if (this.isClose === true) {
          this.isRunning = false;
          return;
        }
        try {
          if (this.isStop) {
            await waitForContinuate(() => this.isStop);
          }
          result.searching = true;
          await ((_b2 = (_a2 = this.opts).onResultsUpdate) == null ? void 0 : _b2.call(_a2, result, index, results));
          ctx.searchInfos = [];
          if (options == null ? void 0 : options.enable_debug) {
            console.groupEnd();
            console.group(
              "开始搜题: ",
              (_c2 = ctx.elements.title) == null ? void 0 : _c2.map((t2) => t2 == null ? void 0 : t2.innerText).filter(Boolean).join(", ").slice(0, 20)
            );
            console.log("ctx", result.ctx);
          }
          ctx.searchInfos = await this.opts.answerer(ctx.elements, ctx) || [];
          ctx.searchInfos.forEach((info) => {
            info.results = info.results.map((ans) => {
              ans.answer = ans.answer ? ans.answer.trim() : "";
              return ans;
            });
          });
        } catch (err) {
          console.error("【ERROR】", err);
          error = String(err);
        }
        result.ctx = ctx;
        result.searching = false;
        result.requested = true;
        result.error = error;
        if (options == null ? void 0 : options.enable_debug) {
          console.log("搜题结果: ", ctx.searchInfos);
        }
        await ((_e2 = (_d2 = this.opts).onResultsUpdate) == null ? void 0 : _e2.call(_d2, results[index], index, results));
      };
      const waitForRequested = async (result) => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(() => {
            if ((result == null ? void 0 : result.requested) === true) {
              clearInterval(interval);
              clearTimeout(timeout);
              resolve();
            }
          }, 200);
          const timeout = setTimeout(() => {
            clearInterval(interval);
            reject(new Error("答题超时！"));
          }, (AnswerWrapperHandlerConfig.timeout_seconds + 10) * 1e3);
        });
      };
      const resolverThread = async () => {
        var _a2, _b2, _c2, _d2;
        for (let index = 0; index < results.length; index++) {
          const result = results[index];
          let error;
          let res;
          if (this.isClose === true) {
            this.isRunning = false;
            return;
          }
          try {
            if (this.isStop) {
              await waitForContinuate(() => this.isStop);
            }
            await waitForRequested(result);
          } catch (err) {
          }
          try {
            if (result.ctx && result.ctx.searchInfos.length !== 0) {
              if (typeof this.opts.work === "object") {
                if (result.ctx.elements.options) {
                  if (result.ctx.type) {
                    const resolver = createDefaultQuestionResolver(
                      result.ctx,
                      this.opts.work.optionText
                    )[result.ctx.type];
                    const handler = this.opts.work.handler;
                    res = await resolver(result.ctx.searchInfos, result.ctx.elements.options, handler);
                  } else {
                    error = "题目类型解析失败, 请自行提供解析器, 或者忽略此题。";
                  }
                } else {
                  error = "elements.options 为空 ! 使用默认处理器, 必须提供题目选项的选择器。";
                }
              } else {
                const work2 = this.opts.work;
                res = await work2(result.ctx);
              }
            } else {
              error = result.error || "搜索不到答案, 请重新运行, 或者忽略此题。";
            }
          } catch (err) {
            error = (err == null ? void 0 : err.message) || err;
          }
          result.error = error;
          result.result = res || { finish: false };
          result.resolved = true;
          if (options == null ? void 0 : options.enable_debug) {
            console.log(
              "答题完成: ",
              (_b2 = (_a2 = result.ctx) == null ? void 0 : _a2.elements.title) == null ? void 0 : _b2.map((t2) => t2 == null ? void 0 : t2.innerText).join(", ").slice(0, 20),
              result
            );
          }
          await ((_d2 = (_c2 = this.opts).onResultsUpdate) == null ? void 0 : _d2.call(_c2, result, index, results));
        }
      };
      const requestThreadHandler = async () => {
        const locks = [];
        const waitForLock = () => {
          return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
              if (locks.length > 0) {
                const lock = locks.shift();
                if (lock) {
                  resolve(lock);
                  clearInterval(interval);
                  clearTimeout(timeout);
                }
              }
            }, 100);
            const timeout = setTimeout(() => {
              clearInterval(interval);
              reject(new Error("获取线程锁超时！"));
            }, 3 * 60 * 1e3);
          });
        };
        const requestThreads = [];
        for (let index = 0; index < results.length; index++) {
          requestThreads.push(() => requestThread(index));
        }
        for (let index = 0; index < (this.opts.thread || 1); index++) {
          locks.push(index + 1);
        }
        let requestFinished = 0;
        const promises = [];
        for (let index = 0; index < (this.opts.thread || 1); index++) {
          promises.push(async () => {
            try {
              while (requestFinished < results.length && requestThreads.length > 0 && this.isClose === false) {
                const thread = requestThreads.shift();
                if (thread) {
                  const lock = await waitForLock();
                  await thread();
                  requestFinished++;
                  locks.push(lock);
                }
              }
            } catch (err) {
              console.error(err);
            }
          });
        }
        await Promise.all(promises.map((f) => f()));
      };
      await Promise.all([resolverThread(), requestThreadHandler()]);
      this.isRunning = false;
      return results;
    }
    uploadHandler(options) {
      var _a;
      const { results, type, callback } = options;
      if (type !== "nomove") {
        let finished = 0;
        for (const result of results) {
          if ((_a = result.result) == null ? void 0 : _a.finish) {
            finished++;
          }
        }
        const rate = results.length === 0 ? 0 : finished / results.length * 100;
        if (type === "force") {
          return callback(rate, true);
        } else {
          return callback(rate, type === "save" ? false : rate >= parseFloat(type.toString()));
        }
      }
    }
  }
  class CustomOCSWorker extends lib.CommonEventEmitter {
    constructor(opts) {
      super();
      this.isRunning = false;
      this.isClose = false;
      this.isStop = false;
      this.opts = opts;
    }
    async doWork(options) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
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
      const questions = await ((_b = (_a = this.opts).questions) == null ? void 0 : _b.call(_a));
      if (options == null ? void 0 : options.enable_debug) {
        console.debug("开始答题", this);
        console.debug("题目数量: ", this.opts.questions.length);
      }
      const results = [];
      for (let index = 0; index < questions.length; index++) {
        if (this.isClose === true) {
          this.isRunning = false;
          return;
        }
        if (this.isStop) {
          await waitForContinuate(() => this.isStop);
        }
        const question = questions[index];
        results[index] = {
          question: question.text,
          requested: false,
          resolved: false,
          searchInfos: [],
          type: question.type,
          finish: false,
          error: ""
        };
        try {
          const infos = await this.opts.answerer(question.text);
          results[index].searchInfos = infos.map((i) => ({
            name: i.name,
            homepage: i.homepage,
            results: i.results.map((r) => [r.question, r.answer, r.extra_data || {}]),
            error: i.error
          }));
          results[index].requested = true;
          (_d = (_c = this.opts).onResultsUpdate) == null ? void 0 : _d.call(_c, results[index], index, results);
          try {
            const resolved = await this.opts.resolver(infos);
            results[index].finish = resolved.finish;
            results[index].error = resolved.error;
            results[index].resolved = true;
          } catch (err) {
            results[index].finish = false;
            results[index].error = err instanceof Error ? err.message : String(err);
            results[index].resolved = true;
          }
          (_f = (_e = this.opts).onResultsUpdate) == null ? void 0 : _f.call(_e, results[index], index, results);
        } catch (err) {
          results[index].requested = true;
          results[index].resolved = false;
          results[index].finish = true;
          results[index].error = err instanceof Error ? err.message : String(err);
          (_h = (_g = this.opts).onResultsUpdate) == null ? void 0 : _h.call(_g, results[index], index, results);
        }
        await lib.$.sleep(this.opts.period);
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
      hooks: null,
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
  function escape(html2, encode) {
    if (encode) {
      if (escapeTest.test(html2)) {
        return html2.replace(escapeReplace, getEscapeReplacement);
      }
    } else {
      if (escapeTestNoEncode.test(html2)) {
        return html2.replace(escapeReplaceNoEncode, getEscapeReplacement);
      }
    }
    return html2;
  }
  const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
  function unescape(html2) {
    return html2.replace(unescapeTest, (_, n) => {
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
        prot = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, "").toLowerCase();
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
  function splitCells(tableRow, count2) {
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
    if (cells.length > count2) {
      cells.splice(count2);
    } else {
      while (cells.length < count2)
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
  function repeatString(pattern, count2) {
    if (count2 < 1) {
      return "";
    }
    let result = "";
    while (count2 > 1) {
      if (count2 & 1) {
        result += pattern;
      }
      count2 >>= 1;
      pattern += pattern;
    }
    return result + pattern;
  }
  function outputLink(cap, link, raw, lexer) {
    const href = link.href;
    const title = link.title ? escape(link.title) : null;
    const text2 = cap[1].replace(/\\([\[\]])/g, "$1");
    if (cap[0].charAt(0) !== "!") {
      lexer.state.inLink = true;
      const token = {
        type: "link",
        raw,
        href,
        title,
        text: text2,
        tokens: lexer.inlineTokens(text2)
      };
      lexer.state.inLink = false;
      return token;
    }
    return {
      type: "image",
      raw,
      href,
      title,
      text: escape(text2)
    };
  }
  function indentCodeCompensation(raw, text2) {
    const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
    if (matchIndentToCode === null) {
      return text2;
    }
    const indentToCode = matchIndentToCode[1];
    return text2.split("\n").map((node) => {
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
        const text2 = cap[0].replace(/^ {1,4}/gm, "");
        return {
          type: "code",
          raw: cap[0],
          codeBlockStyle: "indented",
          text: !this.options.pedantic ? rtrim(text2, "\n") : text2
        };
      }
    }
    fences(src2) {
      const cap = this.rules.block.fences.exec(src2);
      if (cap) {
        const raw = cap[0];
        const text2 = indentCodeCompensation(raw, cap[3] || "");
        return {
          type: "code",
          raw,
          lang: cap[2] ? cap[2].trim().replace(this.rules.inline._escapes, "$1") : cap[2],
          text: text2
        };
      }
    }
    heading(src2) {
      const cap = this.rules.block.heading.exec(src2);
      if (cap) {
        let text2 = cap[2].trim();
        if (/#$/.test(text2)) {
          const trimmed = rtrim(text2, "#");
          if (this.options.pedantic) {
            text2 = trimmed.trim();
          } else if (!trimmed || / $/.test(trimmed)) {
            text2 = trimmed.trim();
          }
        }
        return {
          type: "heading",
          raw: cap[0],
          depth: cap[1].length,
          text: text2,
          tokens: this.lexer.inline(text2)
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
        const text2 = cap[0].replace(/^ *>[ \t]?/gm, "");
        const top2 = this.lexer.state.top;
        this.lexer.state.top = true;
        const tokens = this.lexer.blockTokens(text2);
        this.lexer.state.top = top2;
        return {
          type: "blockquote",
          raw: cap[0],
          tokens,
          text: text2
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
          const text2 = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]);
          token.type = "paragraph";
          token.text = text2;
          token.tokens = this.lexer.inline(text2);
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
        const text2 = cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1];
        return {
          type: "paragraph",
          raw: cap[0],
          text: text2,
          tokens: this.lexer.inline(text2)
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
          text: escape(cap[1])
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
          text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]) : cap[0]
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
          const text2 = cap[0].charAt(0);
          return {
            type: "text",
            raw: text2,
            text: text2
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
            const text3 = raw.slice(1, -1);
            return {
              type: "em",
              raw,
              text: text3,
              tokens: this.lexer.inlineTokens(text3)
            };
          }
          const text2 = raw.slice(2, -2);
          return {
            type: "strong",
            raw,
            text: text2,
            tokens: this.lexer.inlineTokens(text2)
          };
        }
      }
    }
    codespan(src2) {
      const cap = this.rules.inline.code.exec(src2);
      if (cap) {
        let text2 = cap[2].replace(/\n/g, " ");
        const hasNonSpaceChars = /[^ ]/.test(text2);
        const hasSpaceCharsOnBothEnds = /^ /.test(text2) && / $/.test(text2);
        if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
          text2 = text2.substring(1, text2.length - 1);
        }
        text2 = escape(text2, true);
        return {
          type: "codespan",
          raw: cap[0],
          text: text2
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
        let text2, href;
        if (cap[2] === "@") {
          text2 = escape(this.options.mangle ? mangle2(cap[1]) : cap[1]);
          href = "mailto:" + text2;
        } else {
          text2 = escape(cap[1]);
          href = text2;
        }
        return {
          type: "link",
          raw: cap[0],
          text: text2,
          href,
          tokens: [
            {
              type: "text",
              raw: text2,
              text: text2
            }
          ]
        };
      }
    }
    url(src2, mangle2) {
      let cap;
      if (cap = this.rules.inline.url.exec(src2)) {
        let text2, href;
        if (cap[2] === "@") {
          text2 = escape(this.options.mangle ? mangle2(cap[0]) : cap[0]);
          href = "mailto:" + text2;
        } else {
          let prevCapZero;
          do {
            prevCapZero = cap[0];
            cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
          } while (prevCapZero !== cap[0]);
          text2 = escape(cap[0]);
          if (cap[1] === "www.") {
            href = "http://" + cap[0];
          } else {
            href = cap[0];
          }
        }
        return {
          type: "link",
          raw: cap[0],
          text: text2,
          href,
          tokens: [
            {
              type: "text",
              raw: text2,
              text: text2
            }
          ]
        };
      }
    }
    inlineText(src2, smartypants2) {
      const cap = this.rules.inline.text.exec(src2);
      if (cap) {
        let text2;
        if (this.lexer.state.inRawBlock) {
          text2 = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]) : cap[0];
        } else {
          text2 = escape(this.options.smartypants ? smartypants2(cap[0]) : cap[0]);
        }
        return {
          type: "text",
          raw: cap[0],
          text: text2
        };
      }
    }
  }
  const block = {
    newline: /^(?: *(?:\n|$))+/,
    code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
    fences: /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
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
  block.normal = { ...block };
  block.gfm = {
    ...block.normal,
    table: "^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
  };
  block.gfm.table = edit(block.gfm.table).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("blockquote", " {0,3}>").replace("code", " {4}[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
  block.gfm.paragraph = edit(block._paragraph).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("table", block.gfm.table).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
  block.pedantic = {
    ...block.normal,
    html: edit(
      `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
    ).replace("comment", block._comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^(#{1,6})(.*)(?:\n+|$)/,
    fences: noopTest,
    lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
    paragraph: edit(block.normal._paragraph).replace("hr", block.hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", block.lheading).replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").getRegex()
  };
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
  inline.normal = { ...inline };
  inline.pedantic = {
    ...inline.normal,
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
  };
  inline.gfm = {
    ...inline.normal,
    escape: edit(inline.escape).replace("])", "~|])").getRegex(),
    _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
    url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
    _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
    del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
    text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
  };
  inline.gfm.url = edit(inline.gfm.url, "i").replace("email", inline.gfm._extended_email).getRegex();
  inline.breaks = {
    ...inline.gfm,
    br: edit(inline.br).replace("{2,}", "*").getRegex(),
    text: edit(inline.gfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
  };
  function smartypants(text2) {
    return text2.replace(/---/g, "—").replace(/--/g, "–").replace(/(^|[-\u2014/(\[{"\s])'/g, "$1‘").replace(/'/g, "’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1“").replace(/"/g, "”").replace(/\.{3}/g, "…");
  }
  function mangle(text2) {
    let out = "", i, ch;
    const l = text2.length;
    for (i = 0; i < l; i++) {
      ch = text2.charCodeAt(i);
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
      let next2;
      while (next2 = this.inlineQueue.shift()) {
        this.inlineTokens(next2.src, next2.tokens);
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
        return "<pre><code>" + (escaped ? code : escape(code, true)) + "</code></pre>\n";
      }
      return '<pre><code class="' + this.options.langPrefix + escape(lang) + '">' + (escaped ? code : escape(code, true)) + "</code></pre>\n";
    }
    blockquote(quote) {
      return `<blockquote>
${quote}</blockquote>
`;
    }
    html(html2) {
      return html2;
    }
    heading(text2, level, raw, slugger) {
      if (this.options.headerIds) {
        const id = this.options.headerPrefix + slugger.slug(raw);
        return `<h${level} id="${id}">${text2}</h${level}>
`;
      }
      return `<h${level}>${text2}</h${level}>
`;
    }
    hr() {
      return this.options.xhtml ? "<hr/>\n" : "<hr>\n";
    }
    list(body, ordered, start2) {
      const type = ordered ? "ol" : "ul", startatt = ordered && start2 !== 1 ? ' start="' + start2 + '"' : "";
      return "<" + type + startatt + ">\n" + body + "</" + type + ">\n";
    }
    listitem(text2) {
      return `<li>${text2}</li>
`;
    }
    checkbox(checked) {
      return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox"' + (this.options.xhtml ? " /" : "") + "> ";
    }
    paragraph(text2) {
      return `<p>${text2}</p>
`;
    }
    table(header2, body) {
      if (body)
        body = `<tbody>${body}</tbody>`;
      return "<table>\n<thead>\n" + header2 + "</thead>\n" + body + "</table>\n";
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
    strong(text2) {
      return `<strong>${text2}</strong>`;
    }
    em(text2) {
      return `<em>${text2}</em>`;
    }
    codespan(text2) {
      return `<code>${text2}</code>`;
    }
    br() {
      return this.options.xhtml ? "<br/>" : "<br>";
    }
    del(text2) {
      return `<del>${text2}</del>`;
    }
    link(href, title, text2) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
      if (href === null) {
        return text2;
      }
      let out = '<a href="' + href + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += ">" + text2 + "</a>";
      return out;
    }
    image(href, title, text2) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
      if (href === null) {
        return text2;
      }
      let out = `<img src="${href}" alt="${text2}"`;
      if (title) {
        out += ` title="${title}"`;
      }
      out += this.options.xhtml ? "/>" : ">";
      return out;
    }
    text(text2) {
      return text2;
    }
  }
  class TextRenderer {
    strong(text2) {
      return text2;
    }
    em(text2) {
      return text2;
    }
    codespan(text2) {
      return text2;
    }
    del(text2) {
      return text2;
    }
    html(text2) {
      return text2;
    }
    text(text2) {
      return text2;
    }
    link(href, title, text2) {
      return "" + text2;
    }
    image(href, title, text2) {
      return "" + text2;
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
      let out = "", i, j, k, l2, l3, row, cell, header2, body, token, ordered, start2, loose, itemBody, item, checked, task, checkbox, ret;
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
              unescape(this.parseInline(token.tokens, this.textRenderer)),
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
            header2 = "";
            cell = "";
            l2 = token.header.length;
            for (j = 0; j < l2; j++) {
              cell += this.renderer.tablecell(
                this.parseInline(token.header[j].tokens),
                { header: true, align: token.align[j] }
              );
            }
            header2 += this.renderer.tablerow(cell);
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
            out += this.renderer.table(header2, body);
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
  class Hooks {
    constructor(options) {
      this.options = options || defaults;
    }
    preprocess(markdown2) {
      return markdown2;
    }
    postprocess(html2) {
      return html2;
    }
  }
  __publicField(Hooks, "passThroughHooks", /* @__PURE__ */ new Set([
    "preprocess",
    "postprocess"
  ]));
  function onError(silent, async, callback) {
    return (e) => {
      e.message += "\nPlease report this to https://github.com/markedjs/marked.";
      if (silent) {
        const msg = "<p>An error occurred:</p><pre>" + escape(e.message + "", true) + "</pre>";
        if (async) {
          return Promise.resolve(msg);
        }
        if (callback) {
          callback(null, msg);
          return;
        }
        return msg;
      }
      if (async) {
        return Promise.reject(e);
      }
      if (callback) {
        callback(e);
        return;
      }
      throw e;
    };
  }
  function parseMarkdown(lexer, parser) {
    return (src2, opt, callback) => {
      if (typeof opt === "function") {
        callback = opt;
        opt = null;
      }
      const origOpt = { ...opt };
      opt = { ...marked.defaults, ...origOpt };
      const throwError = onError(opt.silent, opt.async, callback);
      if (typeof src2 === "undefined" || src2 === null) {
        return throwError(new Error("marked(): input parameter is undefined or null"));
      }
      if (typeof src2 !== "string") {
        return throwError(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src2) + ", string expected"));
      }
      checkSanitizeDeprecation(opt);
      if (opt.hooks) {
        opt.hooks.options = opt;
      }
      if (callback) {
        const highlight = opt.highlight;
        let tokens;
        try {
          if (opt.hooks) {
            src2 = opt.hooks.preprocess(src2);
          }
          tokens = lexer(src2, opt);
        } catch (e) {
          return throwError(e);
        }
        const done = function(err) {
          let out;
          if (!err) {
            try {
              if (opt.walkTokens) {
                marked.walkTokens(tokens, opt.walkTokens);
              }
              out = parser(tokens, opt);
              if (opt.hooks) {
                out = opt.hooks.postprocess(out);
              }
            } catch (e) {
              err = e;
            }
          }
          opt.highlight = highlight;
          return err ? throwError(err) : callback(null, out);
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
      if (opt.async) {
        return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src2) : src2).then((src3) => lexer(src3, opt)).then((tokens) => opt.walkTokens ? Promise.all(marked.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens).then((tokens) => parser(tokens, opt)).then((html2) => opt.hooks ? opt.hooks.postprocess(html2) : html2).catch(throwError);
      }
      try {
        if (opt.hooks) {
          src2 = opt.hooks.preprocess(src2);
        }
        const tokens = lexer(src2, opt);
        if (opt.walkTokens) {
          marked.walkTokens(tokens, opt.walkTokens);
        }
        let html2 = parser(tokens, opt);
        if (opt.hooks) {
          html2 = opt.hooks.postprocess(html2);
        }
        return html2;
      } catch (e) {
        return throwError(e);
      }
    };
  }
  function marked(src2, opt, callback) {
    return parseMarkdown(Lexer.lex, Parser.parse)(src2, opt, callback);
  }
  marked.options = marked.setOptions = function(opt) {
    marked.defaults = { ...marked.defaults, ...opt };
    changeDefaults(marked.defaults);
    return marked;
  };
  marked.getDefaults = getDefaults;
  marked.defaults = defaults;
  marked.use = function(...args) {
    const extensions = marked.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts = { ...pack };
      opts.async = marked.defaults.async || opts.async || false;
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
        opts.extensions = extensions;
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
        opts.renderer = renderer;
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
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = marked.defaults.hooks || new Hooks();
        for (const prop in pack.hooks) {
          const prevHook = hooks[prop];
          if (Hooks.passThroughHooks.has(prop)) {
            hooks[prop] = (arg) => {
              if (marked.defaults.async) {
                return Promise.resolve(pack.hooks[prop].call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = pack.hooks[prop].call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[prop] = (...args2) => {
              let ret = pack.hooks[prop].apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens = marked.defaults.walkTokens;
        opts.walkTokens = function(token) {
          let values = [];
          values.push(pack.walkTokens.call(this, token));
          if (walkTokens) {
            values = values.concat(walkTokens.call(this, token));
          }
          return values;
        };
      }
      marked.setOptions(opts);
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
  marked.parseInline = parseMarkdown(Lexer.lexInline, Parser.parseInline);
  marked.Parser = Parser;
  marked.parser = Parser.parse;
  marked.Renderer = Renderer;
  marked.TextRenderer = TextRenderer;
  marked.Lexer = Lexer;
  marked.lexer = Lexer.lex;
  marked.Tokenizer = Tokenizer;
  marked.Slugger = Slugger;
  marked.Hooks = Hooks;
  marked.parse = marked;
  marked.options;
  marked.setOptions;
  marked.use;
  marked.walkTokens;
  marked.parseInline;
  Parser.parse;
  Lexer.lex;
  /*! @license DOMPurify 3.4.16 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.16/LICENSE */
  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++)
      n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r))
      return r;
  }
  function _iterableToArrayLimit(r, l) {
    var t2 = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t2) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t2 = t2.call(r)).next, 0 === l) {
          if (Object(t2) !== t2)
            return;
          f = false;
        } else
          for (; !(f = (e = i.call(t2)).done) && (a.push(e.value), a.length !== l); f = true)
            ;
      } catch (r2) {
        o = true, n = r2;
      } finally {
        try {
          if (!f && null != t2.return && (u = t2.return(), Object(u) !== u))
            return;
        } finally {
          if (o)
            throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r)
        return _arrayLikeToArray(r, a);
      var t2 = {}.toString.call(r).slice(8, -1);
      return "Object" === t2 && r.constructor && (t2 = r.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray(r, a) : void 0;
    }
  }
  const entries = Object.entries;
  const setPrototypeOf = Object.setPrototypeOf;
  const isFrozen = Object.isFrozen;
  const getPrototypeOf = Object.getPrototypeOf;
  const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  let freeze = Object.freeze;
  let seal = Object.seal;
  let create = Object.create;
  let _ref = typeof Reflect !== "undefined" && Reflect;
  let apply = _ref.apply;
  let construct = _ref.construct;
  if (!freeze)
    freeze = function freeze2(x) {
      return x;
    };
  if (!seal)
    seal = function seal2(x) {
      return x;
    };
  if (!apply)
    apply = function apply2(func, thisArg) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++)
        args[_key - 2] = arguments[_key];
      return func.apply(thisArg, args);
    };
  if (!construct)
    construct = function construct2(Func) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++)
        args[_key2 - 1] = arguments[_key2];
      return new Func(...args);
    };
  const arrayForEach = unapply(Array.prototype.forEach);
  const arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
  const arrayPop = unapply(Array.prototype.pop);
  const arrayPush = unapply(Array.prototype.push);
  const arraySplice = unapply(Array.prototype.splice);
  const arrayIsArray = Array.isArray;
  const stringToLowerCase = unapply(String.prototype.toLowerCase);
  const stringToString = unapply(String.prototype.toString);
  const stringMatch = unapply(String.prototype.match);
  const stringReplace = unapply(String.prototype.replace);
  const stringIndexOf = unapply(String.prototype.indexOf);
  const stringTrim = unapply(String.prototype.trim);
  const numberToString = unapply(Number.prototype.toString);
  const booleanToString = unapply(Boolean.prototype.toString);
  const bigintToString = typeof BigInt === "undefined" ? null : unapply(BigInt.prototype.toString);
  const symbolToString = typeof Symbol === "undefined" ? null : unapply(Symbol.prototype.toString);
  const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
  const objectToString = unapply(Object.prototype.toString);
  const regExpTest = unapply(RegExp.prototype.test);
  const typeErrorCreate = unconstruct(TypeError);
  function unapply(func) {
    return function(thisArg) {
      if (thisArg instanceof RegExp)
        thisArg.lastIndex = 0;
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++)
        args[_key3 - 1] = arguments[_key3];
      return apply(func, thisArg, args);
    };
  }
  function unconstruct(Func) {
    return function() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++)
        args[_key4] = arguments[_key4];
      return construct(Func, args);
    };
  }
  function addToSet(set, array) {
    let transformCaseFunc = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : stringToLowerCase;
    if (setPrototypeOf)
      setPrototypeOf(set, null);
    if (!arrayIsArray(array))
      return set;
    let l = array.length;
    while (l--) {
      let element = array[l];
      if (typeof element === "string") {
        const lcElement = transformCaseFunc(element);
        if (lcElement !== element) {
          if (!isFrozen(array))
            array[l] = lcElement;
          element = lcElement;
        }
      }
      set[element] = true;
    }
    return set;
  }
  function cleanArray(array) {
    for (let index = 0; index < array.length; index++)
      if (!objectHasOwnProperty(array, index))
        array[index] = null;
    return array;
  }
  function clone(object) {
    const newObject = create(null);
    for (const _ref2 of entries(object)) {
      var _ref3 = _slicedToArray(_ref2, 2);
      const property = _ref3[0];
      const value = _ref3[1];
      if (objectHasOwnProperty(object, property)) {
        if (arrayIsArray(value))
          newObject[property] = cleanArray(value);
        else if (value && typeof value === "object" && value.constructor === Object)
          newObject[property] = clone(value);
        else
          newObject[property] = value;
      }
    }
    return newObject;
  }
  function stringifyValue(value) {
    switch (typeof value) {
      case "string":
        return value;
      case "number":
        return numberToString(value);
      case "boolean":
        return booleanToString(value);
      case "bigint":
        return bigintToString ? bigintToString(value) : "0";
      case "symbol":
        return symbolToString ? symbolToString(value) : "Symbol()";
      case "undefined":
        return objectToString(value);
      case "function":
      case "object": {
        if (value === null)
          return objectToString(value);
        const valueAsRecord = value;
        const valueToString = lookupGetter(valueAsRecord, "toString");
        if (typeof valueToString === "function") {
          const stringified = valueToString(valueAsRecord);
          return typeof stringified === "string" ? stringified : objectToString(stringified);
        }
        return objectToString(value);
      }
      default:
        return objectToString(value);
    }
  }
  function lookupGetter(object, prop) {
    while (object !== null) {
      const desc = getOwnPropertyDescriptor(object, prop);
      if (desc) {
        if (desc.get)
          return unapply(desc.get);
        if (typeof desc.value === "function")
          return unapply(desc.value);
      }
      object = getPrototypeOf(object);
    }
    function fallbackValue() {
      return null;
    }
    return fallbackValue;
  }
  function isRegex(value) {
    try {
      regExpTest(value, "");
      return true;
    } catch (_unused) {
      return false;
    }
  }
  const html$1 = freeze([
    "a",
    "abbr",
    "acronym",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "bdi",
    "bdo",
    "big",
    "blink",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "content",
    "data",
    "datalist",
    "dd",
    "decorator",
    "del",
    "details",
    "dfn",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "element",
    "em",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "main",
    "map",
    "mark",
    "marquee",
    "menu",
    "menuitem",
    "meter",
    "nav",
    "nobr",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "search",
    "section",
    "select",
    "shadow",
    "slot",
    "small",
    "source",
    "spacer",
    "span",
    "strike",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "tr",
    "track",
    "tt",
    "u",
    "ul",
    "var",
    "video",
    "wbr"
  ]);
  const svg$1 = freeze([
    "svg",
    "a",
    "altglyph",
    "altglyphdef",
    "altglyphitem",
    "animatecolor",
    "animatemotion",
    "animatetransform",
    "circle",
    "clippath",
    "defs",
    "desc",
    "ellipse",
    "enterkeyhint",
    "exportparts",
    "filter",
    "font",
    "g",
    "glyph",
    "glyphref",
    "hkern",
    "image",
    "inputmode",
    "line",
    "lineargradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "part",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialgradient",
    "rect",
    "stop",
    "style",
    "switch",
    "symbol",
    "text",
    "textpath",
    "title",
    "tref",
    "tspan",
    "view",
    "vkern"
  ]);
  const svgFilters = freeze([
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence"
  ]);
  const svgDisallowed = freeze([
    "animate",
    "color-profile",
    "cursor",
    "discard",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignobject",
    "hatch",
    "hatchpath",
    "mesh",
    "meshgradient",
    "meshpatch",
    "meshrow",
    "missing-glyph",
    "script",
    "set",
    "solidcolor",
    "unknown",
    "use"
  ]);
  const mathMl$1 = freeze([
    "math",
    "menclose",
    "merror",
    "mfenced",
    "mfrac",
    "mglyph",
    "mi",
    "mlabeledtr",
    "mmultiscripts",
    "mn",
    "mo",
    "mover",
    "mpadded",
    "mphantom",
    "mroot",
    "mrow",
    "ms",
    "mspace",
    "msqrt",
    "mstyle",
    "msub",
    "msup",
    "msubsup",
    "mtable",
    "mtd",
    "mtext",
    "mtr",
    "munder",
    "munderover",
    "mprescripts"
  ]);
  const mathMlDisallowed = freeze([
    "maction",
    "maligngroup",
    "malignmark",
    "mlongdiv",
    "mscarries",
    "mscarry",
    "msgroup",
    "mstack",
    "msline",
    "msrow",
    "semantics",
    "annotation",
    "annotation-xml",
    "mprescripts",
    "none"
  ]);
  const text = freeze(["#text"]);
  const html = freeze([
    "accept",
    "action",
    "align",
    "alt",
    "autocapitalize",
    "autocomplete",
    "autopictureinpicture",
    "autoplay",
    "background",
    "bgcolor",
    "border",
    "capture",
    "cellpadding",
    "cellspacing",
    "checked",
    "cite",
    "class",
    "clear",
    "color",
    "cols",
    "colspan",
    "command",
    "commandfor",
    "controls",
    "controlslist",
    "coords",
    "crossorigin",
    "datetime",
    "decoding",
    "default",
    "dir",
    "disabled",
    "disablepictureinpicture",
    "disableremoteplayback",
    "download",
    "draggable",
    "enctype",
    "enterkeyhint",
    "exportparts",
    "face",
    "for",
    "headers",
    "height",
    "hidden",
    "high",
    "href",
    "hreflang",
    "id",
    "inert",
    "inputmode",
    "integrity",
    "ismap",
    "kind",
    "label",
    "lang",
    "list",
    "loading",
    "loop",
    "low",
    "max",
    "maxlength",
    "media",
    "method",
    "min",
    "minlength",
    "multiple",
    "muted",
    "name",
    "nonce",
    "noshade",
    "novalidate",
    "nowrap",
    "open",
    "optimum",
    "part",
    "pattern",
    "placeholder",
    "playsinline",
    "popover",
    "popovertarget",
    "popovertargetaction",
    "poster",
    "preload",
    "pubdate",
    "radiogroup",
    "readonly",
    "rel",
    "required",
    "rev",
    "reversed",
    "role",
    "rows",
    "rowspan",
    "spellcheck",
    "scope",
    "selected",
    "shape",
    "size",
    "sizes",
    "slot",
    "span",
    "srclang",
    "start",
    "src",
    "srcset",
    "step",
    "style",
    "summary",
    "tabindex",
    "title",
    "translate",
    "type",
    "usemap",
    "valign",
    "value",
    "width",
    "wrap",
    "xmlns"
  ]);
  const svg = freeze([
    "accent-height",
    "accumulate",
    "additive",
    "alignment-baseline",
    "amplitude",
    "ascent",
    "attributename",
    "attributetype",
    "azimuth",
    "basefrequency",
    "baseline-shift",
    "begin",
    "bias",
    "by",
    "class",
    "clip",
    "clippathunits",
    "clip-path",
    "clip-rule",
    "color",
    "color-interpolation",
    "color-interpolation-filters",
    "color-profile",
    "color-rendering",
    "cx",
    "cy",
    "d",
    "dx",
    "dy",
    "diffuseconstant",
    "direction",
    "display",
    "divisor",
    "dominant-baseline",
    "dur",
    "edgemode",
    "elevation",
    "end",
    "exponent",
    "fill",
    "fill-opacity",
    "fill-rule",
    "filter",
    "filterunits",
    "flood-color",
    "flood-opacity",
    "font-family",
    "font-size",
    "font-size-adjust",
    "font-stretch",
    "font-style",
    "font-variant",
    "font-weight",
    "fx",
    "fy",
    "g1",
    "g2",
    "glyph-name",
    "glyphref",
    "gradientunits",
    "gradienttransform",
    "height",
    "href",
    "id",
    "image-rendering",
    "in",
    "in2",
    "intercept",
    "k",
    "k1",
    "k2",
    "k3",
    "k4",
    "kerning",
    "keypoints",
    "keysplines",
    "keytimes",
    "lang",
    "lengthadjust",
    "letter-spacing",
    "kernelmatrix",
    "kernelunitlength",
    "lighting-color",
    "local",
    "marker-end",
    "marker-mid",
    "marker-start",
    "markerheight",
    "markerunits",
    "markerwidth",
    "maskcontentunits",
    "maskunits",
    "max",
    "mask",
    "mask-type",
    "media",
    "method",
    "mode",
    "min",
    "name",
    "numoctaves",
    "offset",
    "operator",
    "opacity",
    "order",
    "orient",
    "orientation",
    "origin",
    "overflow",
    "paint-order",
    "path",
    "pathlength",
    "patterncontentunits",
    "patterntransform",
    "patternunits",
    "pointer-events",
    "points",
    "preservealpha",
    "preserveaspectratio",
    "primitiveunits",
    "r",
    "rx",
    "ry",
    "radius",
    "refx",
    "refy",
    "repeatcount",
    "repeatdur",
    "restart",
    "result",
    "rotate",
    "scale",
    "seed",
    "shape-rendering",
    "slope",
    "specularconstant",
    "specularexponent",
    "spreadmethod",
    "startoffset",
    "stddeviation",
    "stitchtiles",
    "stop-color",
    "stop-opacity",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke",
    "stroke-width",
    "style",
    "surfacescale",
    "systemlanguage",
    "tabindex",
    "tablevalues",
    "targetx",
    "targety",
    "transform",
    "transform-origin",
    "text-anchor",
    "text-decoration",
    "text-orientation",
    "text-rendering",
    "textlength",
    "type",
    "u1",
    "u2",
    "unicode",
    "values",
    "vector-effect",
    "viewbox",
    "visibility",
    "version",
    "vert-adv-y",
    "vert-origin-x",
    "vert-origin-y",
    "width",
    "word-spacing",
    "wrap",
    "writing-mode",
    "xchannelselector",
    "ychannelselector",
    "x",
    "x1",
    "x2",
    "xmlns",
    "y",
    "y1",
    "y2",
    "z",
    "zoomandpan"
  ]);
  const mathMl = freeze([
    "accent",
    "accentunder",
    "align",
    "bevelled",
    "close",
    "columnalign",
    "columnlines",
    "columnspacing",
    "columnspan",
    "denomalign",
    "depth",
    "dir",
    "display",
    "displaystyle",
    "encoding",
    "fence",
    "frame",
    "height",
    "href",
    "id",
    "largeop",
    "length",
    "linethickness",
    "lquote",
    "lspace",
    "mathbackground",
    "mathcolor",
    "mathsize",
    "mathvariant",
    "maxsize",
    "minsize",
    "movablelimits",
    "notation",
    "numalign",
    "open",
    "rowalign",
    "rowlines",
    "rowspacing",
    "rowspan",
    "rspace",
    "rquote",
    "scriptlevel",
    "scriptminsize",
    "scriptsizemultiplier",
    "selection",
    "separator",
    "separators",
    "stretchy",
    "subscriptshift",
    "supscriptshift",
    "symmetric",
    "voffset",
    "width",
    "xmlns"
  ]);
  const xml = freeze([
    "xlink:href",
    "xml:id",
    "xlink:title",
    "xml:space",
    "xmlns:xlink"
  ]);
  const MUSTACHE_EXPR = seal(/{{[\w\W]*|^[\w\W]*}}/g);
  const ERB_EXPR = seal(/<%[\w\W]*|^[\w\W]*%>/g);
  const TMPLIT_EXPR = seal(/\${[\w\W]*/g);
  const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/);
  const ARIA_ATTR = seal(/^aria-[\-\w]+$/);
  const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i);
  const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g);
  const DOCTYPE_NAME = seal(/^html$/i);
  const CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);
  const ELEMENT_MARKUP_PROBE = seal(/<[/\w!]/g);
  const COMMENT_MARKUP_PROBE = seal(/<[/\w]/g);
  const FALLBACK_TAG_CLOSE = seal(/<\/no(script|embed|frames)/i);
  const SELF_CLOSING_TAG = seal(/\/>/i);
  const NODE_TYPE = {
    element: 1,
    attribute: 2,
    text: 3,
    cdataSection: 4,
    entityReference: 5,
    entityNode: 6,
    processingInstruction: 7,
    comment: 8,
    document: 9,
    documentType: 10,
    documentFragment: 11,
    notation: 12
  };
  const LITERAL_TEXT_ELEMENT_NAMES = [
    "style",
    "script",
    "xmp",
    "iframe",
    "noembed",
    "noframes",
    "plaintext",
    "noscript"
  ];
  const LITERAL_TEXT_ELEMENTS = freeze(addToSet({}, LITERAL_TEXT_ELEMENT_NAMES));
  const LITERAL_TEXT_CLOSE = function() {
    const map = {};
    arrayForEach(LITERAL_TEXT_ELEMENT_NAMES, (name) => {
      map[name] = seal(new RegExp("</" + name + "(?=[\\t\\n\\f\\r />])", "i"));
    });
    return freeze(map);
  }();
  const getGlobal = function getGlobal2() {
    return typeof window === "undefined" ? null : window;
  };
  const _createTrustedTypesPolicy = function _createTrustedTypesPolicy2(trustedTypes, purifyHostElement) {
    if (typeof trustedTypes !== "object" || typeof trustedTypes.createPolicy !== "function")
      return null;
    let suffix = null;
    const ATTR_NAME = "data-tt-policy-suffix";
    if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME))
      suffix = purifyHostElement.getAttribute(ATTR_NAME);
    const policyName = "dompurify" + (suffix ? "#" + suffix : "");
    try {
      return trustedTypes.createPolicy(policyName, {
        createHTML(html2) {
          return html2;
        },
        createScriptURL(scriptUrl) {
          return scriptUrl;
        }
      });
    } catch (_) {
      console.warn("TrustedTypes policy " + policyName + " could not be created.");
      return null;
    }
  };
  const _createHooksMap = function _createHooksMap2() {
    return {
      afterSanitizeAttributes: [],
      afterSanitizeElements: [],
      afterSanitizeShadowDOM: [],
      beforeSanitizeAttributes: [],
      beforeSanitizeElements: [],
      beforeSanitizeShadowDOM: [],
      uponSanitizeAttribute: [],
      uponSanitizeElement: [],
      uponSanitizeShadowNode: []
    };
  };
  const _resolveSetOption = function _resolveSetOption2(cfg, key, fallback, options) {
    return objectHasOwnProperty(cfg, key) && arrayIsArray(cfg[key]) ? addToSet(options.base ? clone(options.base) : {}, cfg[key], options.transform) : fallback;
  };
  const _resolveObjectOption = function _resolveObjectOption2(cfg, key, makeFallback) {
    const value = objectHasOwnProperty(cfg, key) ? cfg[key] : void 0;
    return value && typeof value === "object" ? clone(value) : makeFallback();
  };
  function createDOMPurify() {
    let window2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : getGlobal();
    const DOMPurify = (root2) => createDOMPurify(root2);
    DOMPurify.version = "3.4.16";
    DOMPurify.removed = [];
    if (!window2 || !window2.document || window2.document.nodeType !== NODE_TYPE.document || !window2.Element) {
      DOMPurify.isSupported = false;
      return DOMPurify;
    }
    let document2 = window2.document;
    const originalDocument = document2;
    const currentScript = originalDocument.currentScript;
    window2.DocumentFragment;
    const HTMLTemplateElement = window2.HTMLTemplateElement, Node2 = window2.Node, Element2 = window2.Element, NodeFilter2 = window2.NodeFilter;
    window2.NamedNodeMap === void 0 && (window2.NamedNodeMap || window2.MozNamedAttrMap);
    window2.HTMLFormElement;
    const DOMParser2 = window2.DOMParser, trustedTypes = window2.trustedTypes;
    const ElementPrototype = Element2.prototype;
    const cloneNode = lookupGetter(ElementPrototype, "cloneNode");
    const remove = lookupGetter(ElementPrototype, "remove");
    const removeAttributeNode = lookupGetter(ElementPrototype, "removeAttributeNode");
    const getNextSibling = lookupGetter(ElementPrototype, "nextSibling");
    const getChildNodes = lookupGetter(ElementPrototype, "childNodes");
    const getParentNode = lookupGetter(ElementPrototype, "parentNode");
    const getShadowRoot = lookupGetter(ElementPrototype, "shadowRoot");
    const getAttributes = lookupGetter(ElementPrototype, "attributes");
    const getNodeType = Node2 && Node2.prototype ? lookupGetter(Node2.prototype, "nodeType") : null;
    const getNodeName = Node2 && Node2.prototype ? lookupGetter(Node2.prototype, "nodeName") : null;
    const getOwnerDocument = Node2 && Node2.prototype ? lookupGetter(Node2.prototype, "ownerDocument") : null;
    const _readNodeType = function _readNodeType2(node) {
      return getNodeType ? getNodeType(node) : node.nodeType;
    };
    const _readNodeName = function _readNodeName2(node) {
      return getNodeName ? getNodeName(node) : node.nodeName;
    };
    if (typeof HTMLTemplateElement === "function") {
      const template = document2.createElement("template");
      if (template.content && template.content.ownerDocument)
        document2 = template.content.ownerDocument;
    }
    let trustedTypesPolicy;
    let emptyHTML = "";
    let defaultTrustedTypesPolicy;
    let defaultTrustedTypesPolicyResolved = false;
    let IN_TRUSTED_TYPES_POLICY = 0;
    const _assertNotInTrustedTypesPolicy = function _assertNotInTrustedTypesPolicy2() {
      if (IN_TRUSTED_TYPES_POLICY > 0)
        throw typeErrorCreate('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
    };
    const _createTrustedHTML = function _createTrustedHTML2(html2) {
      _assertNotInTrustedTypesPolicy();
      IN_TRUSTED_TYPES_POLICY++;
      try {
        return trustedTypesPolicy.createHTML(html2);
      } finally {
        IN_TRUSTED_TYPES_POLICY--;
      }
    };
    const _createTrustedScriptURL = function _createTrustedScriptURL2(scriptUrl) {
      _assertNotInTrustedTypesPolicy();
      IN_TRUSTED_TYPES_POLICY++;
      try {
        return trustedTypesPolicy.createScriptURL(scriptUrl);
      } finally {
        IN_TRUSTED_TYPES_POLICY--;
      }
    };
    const _getDefaultTrustedTypesPolicy = function _getDefaultTrustedTypesPolicy2() {
      if (!defaultTrustedTypesPolicyResolved) {
        defaultTrustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
        defaultTrustedTypesPolicyResolved = true;
      }
      return defaultTrustedTypesPolicy;
    };
    const _document = document2, implementation = _document.implementation, createNodeIterator = _document.createNodeIterator, createDocumentFragment = _document.createDocumentFragment, getElementsByTagName = _document.getElementsByTagName;
    const importNode = originalDocument.importNode;
    let hooks = _createHooksMap();
    DOMPurify.isSupported = typeof entries === "function" && typeof getParentNode === "function" && implementation && implementation.createHTMLDocument !== void 0;
    const MUSTACHE_EXPR$1 = MUSTACHE_EXPR, ERB_EXPR$1 = ERB_EXPR, TMPLIT_EXPR$1 = TMPLIT_EXPR, DATA_ATTR$1 = DATA_ATTR, ARIA_ATTR$1 = ARIA_ATTR, IS_SCRIPT_OR_DATA$1 = IS_SCRIPT_OR_DATA, ATTR_WHITESPACE$1 = ATTR_WHITESPACE, CUSTOM_ELEMENT$1 = CUSTOM_ELEMENT;
    let IS_ALLOWED_URI$1 = IS_ALLOWED_URI;
    let ALLOWED_TAGS = null;
    const DEFAULT_ALLOWED_TAGS = addToSet({}, [
      ...html$1,
      ...svg$1,
      ...svgFilters,
      ...mathMl$1,
      ...text
    ]);
    let ALLOWED_ATTR = null;
    const DEFAULT_ALLOWED_ATTR = addToSet({}, [
      ...html,
      ...svg,
      ...mathMl,
      ...xml
    ]);
    let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
      tagNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      attributeNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      allowCustomizedBuiltInElements: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: false
      }
    }));
    let FORBID_TAGS = null;
    let FORBID_ATTR = null;
    const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
      tagCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      attributeCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      }
    }));
    let ALLOW_ARIA_ATTR = true;
    let ALLOW_DATA_ATTR = true;
    let ALLOW_UNKNOWN_PROTOCOLS = false;
    let ALLOW_SELF_CLOSE_IN_ATTR = true;
    let SAFE_FOR_TEMPLATES = false;
    let SAFE_FOR_XML = true;
    let WHOLE_DOCUMENT = false;
    let SET_CONFIG = false;
    let SET_CONFIG_ALLOWED_TAGS = null;
    let SET_CONFIG_ALLOWED_ATTR = null;
    let FORCE_BODY = false;
    let RETURN_DOM = false;
    let RETURN_DOM_FRAGMENT = false;
    let RETURN_TRUSTED_TYPE = false;
    let SANITIZE_DOM = true;
    let SANITIZE_NAMED_PROPS = false;
    const SANITIZE_NAMED_PROPS_PREFIX = "user-content-";
    let KEEP_CONTENT = true;
    let IN_PLACE = false;
    let USE_PROFILES = {};
    let FORBID_CONTENTS = null;
    const DEFAULT_FORBID_CONTENTS = addToSet({}, [
      "annotation-xml",
      "audio",
      "colgroup",
      "desc",
      "foreignobject",
      "head",
      "iframe",
      "math",
      "mi",
      "mn",
      "mo",
      "ms",
      "mtext",
      "noembed",
      "noframes",
      "noscript",
      "plaintext",
      "script",
      "selectedcontent",
      "style",
      "svg",
      "template",
      "thead",
      "title",
      "video",
      "xmp"
    ]);
    let DATA_URI_TAGS = null;
    const DEFAULT_DATA_URI_TAGS = addToSet({}, [
      "audio",
      "video",
      "img",
      "source",
      "image",
      "track"
    ]);
    let URI_SAFE_ATTRIBUTES = null;
    const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, [
      "alt",
      "class",
      "for",
      "id",
      "label",
      "name",
      "pattern",
      "placeholder",
      "role",
      "summary",
      "title",
      "value",
      "style",
      "xmlns"
    ]);
    const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
    const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
    let NAMESPACE = HTML_NAMESPACE;
    let IS_EMPTY_INPUT = false;
    let ALLOWED_NAMESPACES = null;
    const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [
      MATHML_NAMESPACE,
      SVG_NAMESPACE,
      HTML_NAMESPACE
    ], stringToString);
    const DEFAULT_MATHML_TEXT_INTEGRATION_POINTS = freeze([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext"
    ]);
    let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS);
    const DEFAULT_HTML_INTEGRATION_POINTS = freeze(["annotation-xml"]);
    let HTML_INTEGRATION_POINTS = addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS);
    const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, [
      "title",
      "style",
      "font",
      "a",
      "script"
    ]);
    let PARSER_MEDIA_TYPE = null;
    const SUPPORTED_PARSER_MEDIA_TYPES = ["application/xhtml+xml", "text/html"];
    const DEFAULT_PARSER_MEDIA_TYPE = "text/html";
    let transformCaseFunc = null;
    let CONFIG = null;
    const formElement = document2.createElement("form");
    const isRegexOrFunction = function isRegexOrFunction2(testValue) {
      return testValue instanceof RegExp || testValue instanceof Function;
    };
    const _parseConfig = function _parseConfig2() {
      let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (CONFIG && CONFIG === cfg)
        return;
      if (!cfg || typeof cfg !== "object")
        cfg = {};
      cfg = clone(cfg);
      PARSER_MEDIA_TYPE = SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
      transformCaseFunc = PARSER_MEDIA_TYPE === "application/xhtml+xml" ? stringToString : stringToLowerCase;
      ALLOWED_TAGS = _resolveSetOption(cfg, "ALLOWED_TAGS", DEFAULT_ALLOWED_TAGS, { transform: transformCaseFunc });
      ALLOWED_ATTR = _resolveSetOption(cfg, "ALLOWED_ATTR", DEFAULT_ALLOWED_ATTR, { transform: transformCaseFunc });
      ALLOWED_NAMESPACES = _resolveSetOption(cfg, "ALLOWED_NAMESPACES", DEFAULT_ALLOWED_NAMESPACES, { transform: stringToString });
      URI_SAFE_ATTRIBUTES = _resolveSetOption(cfg, "ADD_URI_SAFE_ATTR", DEFAULT_URI_SAFE_ATTRIBUTES, {
        transform: transformCaseFunc,
        base: DEFAULT_URI_SAFE_ATTRIBUTES
      });
      DATA_URI_TAGS = _resolveSetOption(cfg, "ADD_DATA_URI_TAGS", DEFAULT_DATA_URI_TAGS, {
        transform: transformCaseFunc,
        base: DEFAULT_DATA_URI_TAGS
      });
      FORBID_CONTENTS = _resolveSetOption(cfg, "FORBID_CONTENTS", DEFAULT_FORBID_CONTENTS, { transform: transformCaseFunc });
      FORBID_TAGS = _resolveSetOption(cfg, "FORBID_TAGS", clone({}), { transform: transformCaseFunc });
      FORBID_ATTR = _resolveSetOption(cfg, "FORBID_ATTR", clone({}), { transform: transformCaseFunc });
      USE_PROFILES = objectHasOwnProperty(cfg, "USE_PROFILES") ? cfg.USE_PROFILES && typeof cfg.USE_PROFILES === "object" ? clone(cfg.USE_PROFILES) : cfg.USE_PROFILES : false;
      ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false;
      ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false;
      ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false;
      ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false;
      SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false;
      SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false;
      WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false;
      RETURN_DOM = cfg.RETURN_DOM || false;
      RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false;
      RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false;
      FORCE_BODY = cfg.FORCE_BODY || false;
      SANITIZE_DOM = cfg.SANITIZE_DOM !== false;
      SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false;
      KEEP_CONTENT = cfg.KEEP_CONTENT !== false;
      IN_PLACE = cfg.IN_PLACE || false;
      IS_ALLOWED_URI$1 = isRegex(cfg.ALLOWED_URI_REGEXP) ? cfg.ALLOWED_URI_REGEXP : IS_ALLOWED_URI;
      NAMESPACE = typeof cfg.NAMESPACE === "string" ? cfg.NAMESPACE : HTML_NAMESPACE;
      MATHML_TEXT_INTEGRATION_POINTS = _resolveObjectOption(cfg, "MATHML_TEXT_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS));
      HTML_INTEGRATION_POINTS = _resolveObjectOption(cfg, "HTML_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS));
      const customElementHandling = _resolveObjectOption(cfg, "CUSTOM_ELEMENT_HANDLING", () => create(null));
      CUSTOM_ELEMENT_HANDLING = create(null);
      if (objectHasOwnProperty(customElementHandling, "tagNameCheck") && isRegexOrFunction(customElementHandling.tagNameCheck))
        CUSTOM_ELEMENT_HANDLING.tagNameCheck = customElementHandling.tagNameCheck;
      if (objectHasOwnProperty(customElementHandling, "attributeNameCheck") && isRegexOrFunction(customElementHandling.attributeNameCheck))
        CUSTOM_ELEMENT_HANDLING.attributeNameCheck = customElementHandling.attributeNameCheck;
      if (objectHasOwnProperty(customElementHandling, "allowCustomizedBuiltInElements") && typeof customElementHandling.allowCustomizedBuiltInElements === "boolean")
        CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = customElementHandling.allowCustomizedBuiltInElements;
      seal(CUSTOM_ELEMENT_HANDLING);
      if (SAFE_FOR_TEMPLATES)
        ALLOW_DATA_ATTR = false;
      if (RETURN_DOM_FRAGMENT)
        RETURN_DOM = true;
      if (USE_PROFILES) {
        ALLOWED_TAGS = addToSet({}, text);
        ALLOWED_ATTR = create(null);
        if (USE_PROFILES.html === true) {
          addToSet(ALLOWED_TAGS, html$1);
          addToSet(ALLOWED_ATTR, html);
        }
        if (USE_PROFILES.svg === true) {
          addToSet(ALLOWED_TAGS, svg$1);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.svgFilters === true) {
          addToSet(ALLOWED_TAGS, svgFilters);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.mathMl === true) {
          addToSet(ALLOWED_TAGS, mathMl$1);
          addToSet(ALLOWED_ATTR, mathMl);
          addToSet(ALLOWED_ATTR, xml);
        }
      }
      EXTRA_ELEMENT_HANDLING.tagCheck = null;
      EXTRA_ELEMENT_HANDLING.attributeCheck = null;
      if (objectHasOwnProperty(cfg, "ADD_TAGS")) {
        if (typeof cfg.ADD_TAGS === "function")
          EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
        else if (arrayIsArray(cfg.ADD_TAGS)) {
          if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS)
            ALLOWED_TAGS = clone(ALLOWED_TAGS);
          addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
        }
      }
      if (objectHasOwnProperty(cfg, "ADD_ATTR")) {
        if (typeof cfg.ADD_ATTR === "function")
          EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
        else if (arrayIsArray(cfg.ADD_ATTR)) {
          if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR)
            ALLOWED_ATTR = clone(ALLOWED_ATTR);
          addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
        }
      }
      if (objectHasOwnProperty(cfg, "ADD_FORBID_CONTENTS") && arrayIsArray(cfg.ADD_FORBID_CONTENTS)) {
        if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS)
          FORBID_CONTENTS = clone(FORBID_CONTENTS);
        addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
      }
      if (KEEP_CONTENT)
        ALLOWED_TAGS["#text"] = true;
      if (WHOLE_DOCUMENT)
        addToSet(ALLOWED_TAGS, [
          "html",
          "head",
          "body"
        ]);
      if (ALLOWED_TAGS.table) {
        addToSet(ALLOWED_TAGS, ["tbody"]);
        delete FORBID_TAGS.tbody;
      }
      if (cfg.TRUSTED_TYPES_POLICY) {
        if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== "function")
          throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== "function")
          throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        const previousTrustedTypesPolicy = trustedTypesPolicy;
        trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
        try {
          emptyHTML = _createTrustedHTML("");
        } catch (error) {
          trustedTypesPolicy = previousTrustedTypesPolicy;
          throw error;
        }
      } else if (cfg.TRUSTED_TYPES_POLICY === null) {
        trustedTypesPolicy = void 0;
        emptyHTML = "";
      } else {
        if (trustedTypesPolicy === void 0)
          trustedTypesPolicy = _getDefaultTrustedTypesPolicy();
        if (trustedTypesPolicy && typeof emptyHTML === "string")
          emptyHTML = _createTrustedHTML("");
      }
      if (freeze)
        freeze(cfg);
      CONFIG = cfg;
    };
    const ALL_SVG_TAGS = addToSet({}, [
      ...svg$1,
      ...svgFilters,
      ...svgDisallowed
    ]);
    const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
    const _checkSvgNamespace = function _checkSvgNamespace2(tagName, parent, parentTagName) {
      if (parent.namespaceURI === HTML_NAMESPACE)
        return tagName === "svg";
      if (parent.namespaceURI === MATHML_NAMESPACE)
        return tagName === "svg" && (parentTagName === "annotation-xml" || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      return Boolean(ALL_SVG_TAGS[tagName]);
    };
    const _checkMathMlNamespace = function _checkMathMlNamespace2(tagName, parent, parentTagName) {
      if (parent.namespaceURI === HTML_NAMESPACE)
        return tagName === "math";
      if (parent.namespaceURI === SVG_NAMESPACE)
        return tagName === "math" && HTML_INTEGRATION_POINTS[parentTagName];
      return Boolean(ALL_MATHML_TAGS[tagName]);
    };
    const _checkHtmlNamespace = function _checkHtmlNamespace2(tagName, parent, parentTagName) {
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName])
        return false;
      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName])
        return false;
      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    };
    const _checkValidNamespace = function _checkValidNamespace2(element) {
      let parent = getParentNode(element);
      if (!parent || !parent.tagName)
        parent = {
          namespaceURI: NAMESPACE,
          tagName: "template"
        };
      const tagName = stringToLowerCase(element.tagName);
      const parentTagName = stringToLowerCase(parent.tagName);
      if (!ALLOWED_NAMESPACES[element.namespaceURI])
        return false;
      if (element.namespaceURI === SVG_NAMESPACE)
        return _checkSvgNamespace(tagName, parent, parentTagName);
      if (element.namespaceURI === MATHML_NAMESPACE)
        return _checkMathMlNamespace(tagName, parent, parentTagName);
      if (element.namespaceURI === HTML_NAMESPACE)
        return _checkHtmlNamespace(tagName, parent, parentTagName);
      if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && ALLOWED_NAMESPACES[element.namespaceURI])
        return true;
      return false;
    };
    const _forceRemove = function _forceRemove2(node) {
      arrayPush(DOMPurify.removed, { element: node });
      try {
        getParentNode(node).removeChild(node);
      } catch (_) {
        remove(node);
        if (!getParentNode(node))
          throw typeErrorCreate("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
      }
    };
    const _stripAttributeNode = function _stripAttributeNode2(element, attribute, name) {
      try {
        removeAttributeNode(element, attribute);
      } catch (_) {
        try {
          element.removeAttribute(name);
        } catch (_2) {
        }
      }
    };
    const _neutralizeRoot = function _neutralizeRoot2(root2) {
      _neutralizeSubtree(root2);
      const childNodes = getChildNodes(root2);
      if (childNodes) {
        const snapshot = [];
        arrayForEach(childNodes, (child) => {
          arrayPush(snapshot, child);
        });
        arrayForEach(snapshot, (child) => {
          try {
            remove(child);
          } catch (_) {
          }
        });
      }
      const attributes = getAttributes(root2);
      if (attributes)
        for (let i = attributes.length - 1; i >= 0; --i) {
          const attribute = attributes[i];
          const name = attribute && attribute.name;
          if (typeof name === "string")
            _stripAttributeNode(root2, attribute, name);
        }
    };
    const _removeAttribute = function _removeAttribute2(name, element, attr) {
      if (!attr)
        try {
          attr = element.getAttributeNode(name);
        } catch (_) {
          attr = null;
        }
      arrayPush(DOMPurify.removed, {
        attribute: attr || null,
        from: element
      });
      try {
        if (attr)
          removeAttributeNode(element, attr);
        else
          element.removeAttribute(name);
      } catch (_) {
        try {
          element.removeAttribute(name);
        } catch (_2) {
        }
      }
      if (name === "is") {
        if (RETURN_DOM || RETURN_DOM_FRAGMENT)
          try {
            _forceRemove(element);
          } catch (_) {
          }
        else
          try {
            element.setAttribute(name, "");
          } catch (_) {
          }
      }
    };
    const _stripDisallowedAttributes = function _stripDisallowedAttributes2(element) {
      const attributes = getAttributes(element);
      if (!attributes)
        return;
      for (let i = attributes.length - 1; i >= 0; --i) {
        const attribute = attributes[i];
        const name = attribute && attribute.name;
        if (typeof name !== "string" || ALLOWED_ATTR[transformCaseFunc(name)])
          continue;
        _stripAttributeNode(element, attribute, name);
      }
    };
    const _neutralizeSubtree = function _neutralizeSubtree2(root2) {
      const stack = [root2];
      while (stack.length > 0) {
        const node = stack.pop();
        if (_readNodeType(node) === NODE_TYPE.element)
          _stripDisallowedAttributes(node);
        const childNodes = getChildNodes(node);
        if (childNodes)
          for (let i = childNodes.length - 1; i >= 0; --i)
            stack.push(childNodes[i]);
      }
    };
    const _isPatchLinkageAttribute = function _isPatchLinkageAttribute2(lcName, lcTag) {
      if (!SAFE_FOR_XML)
        return false;
      if (lcName === "patchsrc")
        return true;
      return lcName === "for" && lcTag !== "label" && lcTag !== "output";
    };
    const _neutralizePatchLinkage = function _neutralizePatchLinkage2(root2) {
      if (!SAFE_FOR_XML)
        return;
      const stack = [root2];
      while (stack.length > 0) {
        const node = stack.pop();
        const nodeType = _readNodeType(node);
        if (nodeType === NODE_TYPE.processingInstruction || nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, node.data)) {
          try {
            remove(node);
          } catch (_) {
          }
          continue;
        }
        if (nodeType === NODE_TYPE.element) {
          const element = node;
          const lcTag = transformCaseFunc(_readNodeName(node));
          try {
            if (element.hasAttribute && element.hasAttribute("patchsrc"))
              element.removeAttribute("patchsrc");
            if (element.hasAttribute && element.hasAttribute("for") && _isPatchLinkageAttribute("for", lcTag))
              element.removeAttribute("for");
          } catch (_) {
          }
        }
        const childNodes = getChildNodes(node);
        if (childNodes)
          for (let i = childNodes.length - 1; i >= 0; --i)
            stack.push(childNodes[i]);
      }
    };
    const _initDocument = function _initDocument2(dirty) {
      let doc = null;
      let leadingWhitespace = null;
      if (FORCE_BODY)
        dirty = "<remove></remove>" + dirty;
      else {
        const matches2 = stringMatch(dirty, /^[\r\n\t ]+/);
        leadingWhitespace = matches2 && matches2[0];
      }
      if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && NAMESPACE === HTML_NAMESPACE)
        dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + "</body></html>";
      const dirtyPayload = trustedTypesPolicy ? _createTrustedHTML(dirty) : dirty;
      if (NAMESPACE === HTML_NAMESPACE)
        try {
          doc = new DOMParser2().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
        } catch (_) {
        }
      if (!doc || !doc.documentElement) {
        doc = implementation.createDocument(NAMESPACE, "template", null);
        try {
          doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
        } catch (_) {
        }
      }
      const body = doc.body || doc.documentElement;
      if (dirty && leadingWhitespace)
        body.insertBefore(document2.createTextNode(leadingWhitespace), body.childNodes[0] || null);
      if (NAMESPACE === HTML_NAMESPACE)
        return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? "html" : "body")[0];
      return WHOLE_DOCUMENT ? doc.documentElement : body;
    };
    const _createNodeIterator = function _createNodeIterator2(root2) {
      const doc = getOwnerDocument ? getOwnerDocument(root2) : root2.ownerDocument;
      return createNodeIterator.call(doc || root2, root2, NodeFilter2.SHOW_ELEMENT | NodeFilter2.SHOW_COMMENT | NodeFilter2.SHOW_TEXT | NodeFilter2.SHOW_PROCESSING_INSTRUCTION | NodeFilter2.SHOW_CDATA_SECTION, null);
    };
    const _stripTemplateExpressions = function _stripTemplateExpressions2(value) {
      value = stringReplace(value, MUSTACHE_EXPR$1, " ");
      value = stringReplace(value, ERB_EXPR$1, " ");
      value = stringReplace(value, TMPLIT_EXPR$1, " ");
      return value;
    };
    const _scrubTemplateExpressions2 = function _scrubTemplateExpressions(node) {
      var _node$querySelectorAl;
      node.normalize();
      const doc = getOwnerDocument ? getOwnerDocument(node) : node.ownerDocument;
      const walker = createNodeIterator.call(doc || node, node, NodeFilter2.SHOW_TEXT | NodeFilter2.SHOW_COMMENT | NodeFilter2.SHOW_CDATA_SECTION | NodeFilter2.SHOW_PROCESSING_INSTRUCTION, null);
      let currentNode = walker.nextNode();
      while (currentNode) {
        currentNode.data = _stripTemplateExpressions(currentNode.data);
        currentNode = walker.nextNode();
      }
      const templates = (_node$querySelectorAl = node.querySelectorAll) === null || _node$querySelectorAl === void 0 ? void 0 : _node$querySelectorAl.call(node, "template");
      if (templates)
        arrayForEach(templates, (tmpl) => {
          if (_isDocumentFragment(tmpl.content))
            _scrubTemplateExpressions2(tmpl.content);
        });
    };
    const _isClobbered = function _isClobbered2(element) {
      const realTagName = getNodeName ? getNodeName(element) : null;
      if (typeof realTagName !== "string")
        return false;
      if (transformCaseFunc(realTagName) !== "form")
        return false;
      return typeof element.nodeName !== "string" || typeof element.textContent !== "string" || typeof element.removeChild !== "function" || element.attributes !== getAttributes(element) || typeof element.removeAttribute !== "function" || typeof element.removeAttributeNode !== "function" || typeof element.getAttributeNode !== "function" || typeof element.setAttribute !== "function" || typeof element.namespaceURI !== "string" || typeof element.insertBefore !== "function" || typeof element.hasChildNodes !== "function" || element.nodeType !== getNodeType(element) || element.childNodes !== getChildNodes(element);
    };
    const _isDocumentFragment = function _isDocumentFragment2(value) {
      if (!getNodeType || typeof value !== "object" || value === null)
        return false;
      try {
        return getNodeType(value) === NODE_TYPE.documentFragment;
      } catch (_) {
        return false;
      }
    };
    const _isNode = function _isNode2(value) {
      if (!getNodeType || typeof value !== "object" || value === null)
        return false;
      try {
        return typeof getNodeType(value) === "number";
      } catch (_) {
        return false;
      }
    };
    function _executeHooks(hooks2, currentNode, data) {
      if (hooks2.length === 0)
        return;
      arrayForEach(hooks2, (hook) => {
        hook.call(DOMPurify, currentNode, data, CONFIG);
      });
    }
    const _isUnsafeNode = function _isUnsafeNode2(currentNode, tagName) {
      if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.innerHTML))
        return true;
      if (SAFE_FOR_XML && currentNode.namespaceURI === HTML_NAMESPACE && LITERAL_TEXT_ELEMENTS[tagName] && (_isNode(currentNode.firstElementChild) || typeof currentNode.textContent === "string" && regExpTest(LITERAL_TEXT_CLOSE[tagName], currentNode.textContent)))
        return true;
      if (currentNode.nodeType === NODE_TYPE.processingInstruction)
        return true;
      if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, currentNode.data))
        return true;
      return false;
    };
    const _matchesNameCheck = function _matchesNameCheck2(check, name) {
      if (check instanceof RegExp)
        return regExpTest(check, name);
      if (check instanceof Function) {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++)
          args[_key - 2] = arguments[_key];
        return Boolean(check(name, ...args));
      }
      return false;
    };
    const _sanitizeDisallowedNode = function _sanitizeDisallowedNode2(currentNode, tagName, root2) {
      if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName))
        return false;
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
        const parentNode = getParentNode(currentNode);
        const childNodes = getChildNodes(currentNode);
        if (childNodes && parentNode) {
          const childCount = childNodes.length;
          for (let i = childCount - 1; i >= 0; --i) {
            const hoisted = currentNode === root2 ? cloneNode(childNodes[i], true) : childNodes[i];
            parentNode.insertBefore(hoisted, getNextSibling(currentNode));
          }
        }
      }
      _forceRemove(currentNode);
      return true;
    };
    const _forkSharedAllowlist = function _forkSharedAllowlist2(hookList, set, defaultSet, setConfigSet) {
      if (hookList.length === 0)
        return set;
      return set === defaultSet || set === setConfigSet ? clone(set) : set;
    };
    const _handleHookDetachedNode = function _handleHookDetachedNode2(currentNode, root2) {
      if (currentNode === root2 || getParentNode(currentNode) !== null)
        return false;
      if (IN_PLACE)
        _neutralizeSubtree(currentNode);
      return true;
    };
    const _sanitizeElements = function _sanitizeElements2(currentNode, root2) {
      _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
      if (_handleHookDetachedNode(currentNode, root2))
        return true;
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }
      const tagName = transformCaseFunc(_readNodeName(currentNode));
      ALLOWED_TAGS = _forkSharedAllowlist(hooks.uponSanitizeElement, ALLOWED_TAGS, DEFAULT_ALLOWED_TAGS, SET_CONFIG_ALLOWED_TAGS);
      _executeHooks(hooks.uponSanitizeElement, currentNode, {
        tagName,
        allowedTags: ALLOWED_TAGS
      });
      if (_handleHookDetachedNode(currentNode, root2))
        return true;
      if (_isUnsafeNode(currentNode, tagName)) {
        _forceRemove(currentNode);
        return true;
      }
      if (FORBID_TAGS[tagName] || !(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && !ALLOWED_TAGS[tagName]) {
        const removed = _sanitizeDisallowedNode(currentNode, tagName, root2);
        if (removed === false) {
          _executeHooks(hooks.afterSanitizeElements, currentNode, null);
          if (_handleHookDetachedNode(currentNode, root2))
            return true;
        }
        return removed;
      }
      if (_readNodeType(currentNode) === NODE_TYPE.element && !_checkValidNamespace(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }
      if ((tagName === "noscript" || tagName === "noembed" || tagName === "noframes") && regExpTest(FALLBACK_TAG_CLOSE, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }
      if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
        const content = _stripTemplateExpressions(currentNode.textContent);
        if (currentNode.textContent !== content) {
          arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
          currentNode.textContent = content;
        }
      }
      _executeHooks(hooks.afterSanitizeElements, currentNode, null);
      return _handleHookDetachedNode(currentNode, root2);
    };
    const _isValidAttribute = function _isValidAttribute2(lcTag, lcName, value) {
      if (FORBID_ATTR[lcName])
        return false;
      if (_isPatchLinkageAttribute(lcName, lcTag))
        return false;
      if (SANITIZE_DOM && (lcName === "id" || lcName === "name") && (value in document2 || value in formElement))
        return false;
      const nameIsPermitted = ALLOWED_ATTR[lcName] || EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag);
      if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$1, lcName))
        return true;
      if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$1, lcName))
        return true;
      if (!nameIsPermitted)
        return _isBasicCustomElement(lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName, lcTag) || lcName === "is" && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value);
      if (URI_SAFE_ATTRIBUTES[lcName])
        return true;
      if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE$1, "")))
        return true;
      if ((lcName === "src" || lcName === "xlink:href" || lcName === "href") && lcTag !== "script" && stringIndexOf(value, "data:") === 0 && DATA_URI_TAGS[lcTag])
        return true;
      if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$1, stringReplace(value, ATTR_WHITESPACE$1, "")))
        return true;
      return !value;
    };
    const RESERVED_CUSTOM_ELEMENT_NAMES = addToSet({}, [
      "annotation-xml",
      "color-profile",
      "font-face",
      "font-face-format",
      "font-face-name",
      "font-face-src",
      "font-face-uri",
      "missing-glyph"
    ]);
    const _isBasicCustomElement = function _isBasicCustomElement2(tagName) {
      return !RESERVED_CUSTOM_ELEMENT_NAMES[stringToLowerCase(tagName)] && regExpTest(CUSTOM_ELEMENT$1, tagName);
    };
    const _applyTrustedTypesToAttribute = function _applyTrustedTypesToAttribute2(lcTag, lcName, namespaceURI, value) {
      if (trustedTypesPolicy && typeof trustedTypes === "object" && typeof trustedTypes.getAttributeType === "function" && !namespaceURI)
        switch (trustedTypes.getAttributeType(lcTag, lcName)) {
          case "TrustedHTML":
            return _createTrustedHTML(value);
          case "TrustedScriptURL":
            return _createTrustedScriptURL(value);
        }
      return value;
    };
    const _setAttributeValue = function _setAttributeValue2(currentNode, name, namespaceURI, value) {
      try {
        if (namespaceURI)
          currentNode.setAttributeNS(namespaceURI, name, value);
        else
          currentNode.setAttribute(name, value);
        if (_isClobbered(currentNode)) {
          _forceRemove(currentNode);
          return false;
        }
        return true;
      } catch (_) {
        _removeAttribute(name, currentNode);
        return false;
      }
    };
    const _sanitizeAttributes = function _sanitizeAttributes2(currentNode, root2) {
      _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
      if (_handleHookDetachedNode(currentNode, root2))
        return;
      const attributes = currentNode.attributes;
      if (!attributes || _isClobbered(currentNode))
        return;
      ALLOWED_ATTR = _forkSharedAllowlist(hooks.uponSanitizeAttribute, ALLOWED_ATTR, DEFAULT_ALLOWED_ATTR, SET_CONFIG_ALLOWED_ATTR);
      const hookEvent = {
        attrName: "",
        attrValue: "",
        keepAttr: true,
        allowedAttributes: ALLOWED_ATTR,
        forceKeepAttr: void 0
      };
      let l = attributes.length;
      const lcTag = transformCaseFunc(currentNode.nodeName);
      while (l--) {
        const attr = attributes[l];
        const name = attr.name, namespaceURI = attr.namespaceURI, attrValue = attr.value;
        const lcName = transformCaseFunc(name);
        const initValue = attrValue;
        let value = name === "value" ? initValue : stringTrim(initValue);
        let recreatedNamedProp = false;
        hookEvent.attrName = lcName;
        hookEvent.attrValue = value;
        hookEvent.keepAttr = true;
        hookEvent.forceKeepAttr = void 0;
        _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
        value = hookEvent.attrValue;
        if (SANITIZE_NAMED_PROPS && (lcName === "id" || lcName === "name") && stringIndexOf(value, SANITIZE_NAMED_PROPS_PREFIX) !== 0) {
          _removeAttribute(name, currentNode, attr);
          value = SANITIZE_NAMED_PROPS_PREFIX + value;
          recreatedNamedProp = true;
        }
        if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, value)) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        if (lcName === "attributename" && stringMatch(value, "href")) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        if (hookEvent.forceKeepAttr)
          continue;
        if (!hookEvent.keepAttr) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value)) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        if (SAFE_FOR_TEMPLATES)
          value = _stripTemplateExpressions(value);
        if (!_isValidAttribute(lcTag, lcName, value)) {
          _removeAttribute(name, currentNode, attr);
          continue;
        }
        value = _applyTrustedTypesToAttribute(lcTag, lcName, namespaceURI, value);
        if (value !== initValue) {
          if (_setAttributeValue(currentNode, name, namespaceURI, value) && recreatedNamedProp)
            arrayPop(DOMPurify.removed);
        }
      }
      _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
      _handleHookDetachedNode(currentNode, root2);
    };
    const _sanitizeShadowDOM2 = function _sanitizeShadowDOM(fragment) {
      let shadowNode = null;
      const shadowIterator = _createNodeIterator(fragment);
      _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
      while (shadowNode = shadowIterator.nextNode()) {
        _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
        _sanitizeElements(shadowNode, fragment);
        _sanitizeAttributes(shadowNode, fragment);
        if (_isDocumentFragment(shadowNode.content))
          _sanitizeShadowDOM2(shadowNode.content);
        if (_readNodeType(shadowNode) === NODE_TYPE.element) {
          const innerSr = getShadowRoot(shadowNode);
          if (_isDocumentFragment(innerSr)) {
            _sanitizeAttachedShadowRoots(innerSr);
            _sanitizeShadowDOM2(innerSr);
          }
        }
      }
      _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
    };
    const _sanitizeAttachedShadowRoots = function _sanitizeAttachedShadowRoots2(root2) {
      const stack = [{
        node: root2,
        shadow: null
      }];
      while (stack.length > 0) {
        const item = stack.pop();
        if (item.shadow) {
          _sanitizeShadowDOM2(item.shadow);
          continue;
        }
        const node = item.node;
        const isElement = _readNodeType(node) === NODE_TYPE.element;
        const childNodes = getChildNodes(node);
        if (childNodes)
          for (let i = childNodes.length - 1; i >= 0; --i)
            stack.push({
              node: childNodes[i],
              shadow: null
            });
        if (isElement) {
          const rootName = getNodeName ? getNodeName(node) : null;
          if (typeof rootName === "string" && transformCaseFunc(rootName) === "template") {
            const content = node.content;
            if (_isDocumentFragment(content))
              stack.push({
                node: content,
                shadow: null
              });
          }
        }
        if (isElement) {
          const sr = getShadowRoot(node);
          if (_isDocumentFragment(sr))
            stack.push({
              node: null,
              shadow: sr
            }, {
              node: sr,
              shadow: null
            });
        }
      }
    };
    DOMPurify.sanitize = function(dirty) {
      let cfg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      let body = null;
      let importedNode = null;
      let currentNode = null;
      let returnNode = null;
      IS_EMPTY_INPUT = !dirty;
      if (IS_EMPTY_INPUT)
        dirty = "<!-->";
      if (typeof dirty !== "string" && !_isNode(dirty)) {
        dirty = stringifyValue(dirty);
        if (typeof dirty !== "string")
          throw typeErrorCreate("dirty is not a string, aborting");
      }
      if (!DOMPurify.isSupported)
        return dirty;
      if (SET_CONFIG) {
        ALLOWED_TAGS = SET_CONFIG_ALLOWED_TAGS;
        ALLOWED_ATTR = SET_CONFIG_ALLOWED_ATTR;
      } else
        _parseConfig(cfg);
      if (hooks.uponSanitizeElement.length > 0 || hooks.uponSanitizeAttribute.length > 0)
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      if (hooks.uponSanitizeAttribute.length > 0)
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      DOMPurify.removed = [];
      const inPlace = IN_PLACE && typeof dirty !== "string" && _isNode(dirty);
      if (inPlace) {
        _neutralizePatchLinkage(dirty);
        const nn = _readNodeName(dirty);
        if (typeof nn === "string") {
          const tagName = transformCaseFunc(nn);
          if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
            _neutralizeRoot(dirty);
            throw typeErrorCreate("root node is forbidden and cannot be sanitized in-place");
          }
        }
        if (_isClobbered(dirty)) {
          _neutralizeRoot(dirty);
          throw typeErrorCreate("root node is clobbered and cannot be sanitized in-place");
        }
        try {
          _sanitizeAttachedShadowRoots(dirty);
        } catch (error) {
          _neutralizeRoot(dirty);
          throw error;
        }
      } else if (_isNode(dirty)) {
        body = _initDocument("<!---->");
        importedNode = body.ownerDocument.importNode(dirty, true);
        if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === "BODY")
          body = importedNode;
        else if (importedNode.nodeName === "HTML")
          body = importedNode;
        else
          body.appendChild(importedNode);
        _sanitizeAttachedShadowRoots(body);
      } else {
        if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && dirty.indexOf("<") === -1)
          return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(dirty) : dirty;
        body = _initDocument(dirty);
        if (!body)
          return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : "";
      }
      if (body && FORCE_BODY)
        _forceRemove(body.firstChild);
      const walkRoot = inPlace ? dirty : body;
      try {
        const nodeIterator = _createNodeIterator(walkRoot);
        while (currentNode = nodeIterator.nextNode()) {
          _sanitizeElements(currentNode, walkRoot);
          _sanitizeAttributes(currentNode, walkRoot);
          if (_isDocumentFragment(currentNode.content))
            _sanitizeShadowDOM2(currentNode.content);
        }
      } catch (error) {
        if (inPlace) {
          _neutralizeRoot(dirty);
          arrayForEach(DOMPurify.removed, (entry) => {
            if (entry.element)
              _neutralizeSubtree(entry.element);
          });
        }
        throw error;
      }
      if (inPlace) {
        let rootWasRemoved = false;
        arrayForEach(DOMPurify.removed, (entry) => {
          if (entry.element) {
            if (entry.element === dirty)
              rootWasRemoved = true;
            _neutralizeSubtree(entry.element);
          }
        });
        if (rootWasRemoved)
          throw typeErrorCreate("a node selected for removal could not be safely returned; refusing to sanitize in place");
        if (SAFE_FOR_TEMPLATES)
          _scrubTemplateExpressions2(dirty);
        return dirty;
      }
      if (RETURN_DOM) {
        if (SAFE_FOR_TEMPLATES)
          _scrubTemplateExpressions2(body);
        if (RETURN_DOM_FRAGMENT) {
          returnNode = createDocumentFragment.call(body.ownerDocument);
          while (body.firstChild)
            returnNode.appendChild(body.firstChild);
        } else
          returnNode = body;
        if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode)
          returnNode = importNode.call(originalDocument, returnNode, true);
        return returnNode;
      }
      let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
      if (WHOLE_DOCUMENT && ALLOWED_TAGS["!doctype"] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name))
        serializedHTML = "<!DOCTYPE " + body.ownerDocument.doctype.name + ">\n" + serializedHTML;
      if (SAFE_FOR_TEMPLATES)
        serializedHTML = _stripTemplateExpressions(serializedHTML);
      return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(serializedHTML) : serializedHTML;
    };
    DOMPurify.setConfig = function() {
      let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      _parseConfig(cfg);
      SET_CONFIG = true;
      SET_CONFIG_ALLOWED_TAGS = ALLOWED_TAGS;
      SET_CONFIG_ALLOWED_ATTR = ALLOWED_ATTR;
    };
    DOMPurify.clearConfig = function() {
      CONFIG = null;
      SET_CONFIG = false;
      SET_CONFIG_ALLOWED_TAGS = null;
      SET_CONFIG_ALLOWED_ATTR = null;
      trustedTypesPolicy = defaultTrustedTypesPolicy;
      emptyHTML = "";
    };
    DOMPurify.isValidAttribute = function(tag, attr, value) {
      if (!CONFIG)
        _parseConfig({});
      const lcTag = transformCaseFunc(tag);
      const lcName = transformCaseFunc(attr);
      return _isValidAttribute(lcTag, lcName, value);
    };
    DOMPurify.addHook = function(entryPoint, hookFunction) {
      if (typeof hookFunction !== "function")
        return;
      if (!objectHasOwnProperty(hooks, entryPoint))
        return;
      arrayPush(hooks[entryPoint], hookFunction);
    };
    DOMPurify.removeHook = function(entryPoint, hookFunction) {
      if (!objectHasOwnProperty(hooks, entryPoint))
        return;
      if (hookFunction !== void 0) {
        const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
        return index === -1 ? void 0 : arraySplice(hooks[entryPoint], index, 1)[0];
      }
      return arrayPop(hooks[entryPoint]);
    };
    DOMPurify.removeHooks = function(entryPoint) {
      if (!objectHasOwnProperty(hooks, entryPoint))
        return;
      hooks[entryPoint] = [];
    };
    DOMPurify.removeAllHooks = function() {
      hooks = _createHooksMap();
    };
    return DOMPurify;
  }
  var purify_default = createDOMPurify();
  purify_default.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  function markdown(md) {
    return purify_default.sanitize(marked.parse(md), { ADD_ATTR: ["target"] });
  }
  const debug$1 = typeof process === "object" && process.env && {}.NODE_DEBUG && /\bsemver\b/i.test({}.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
  };
  var debug_1 = debug$1;
  const SEMVER_SPEC_VERSION = "2.0.0";
  const MAX_LENGTH$1 = 256;
  const MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER || 9007199254740991;
  const MAX_SAFE_COMPONENT_LENGTH = 16;
  const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH$1 - 6;
  const RELEASE_TYPES = [
    "major",
    "premajor",
    "minor",
    "preminor",
    "patch",
    "prepatch",
    "prerelease"
  ];
  var constants = {
    MAX_LENGTH: MAX_LENGTH$1,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1,
    RELEASE_TYPES,
    SEMVER_SPEC_VERSION,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  };
  var re$1 = { exports: {} };
  (function(module2, exports3) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: MAX_SAFE_COMPONENT_LENGTH2,
      MAX_SAFE_BUILD_LENGTH: MAX_SAFE_BUILD_LENGTH2,
      MAX_LENGTH: MAX_LENGTH2
    } = constants;
    const debug2 = debug_1;
    exports3 = module2.exports = {};
    const re2 = exports3.re = [];
    const safeRe = exports3.safeRe = [];
    const src2 = exports3.src = [];
    const safeSrc = exports3.safeSrc = [];
    const t2 = exports3.t = {};
    let R2 = 0;
    const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    const safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH2],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH2]
    ];
    const makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    const createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R2++;
      debug2(name, index, value);
      t2[name] = index;
      src2[index] = value;
      safeSrc[index] = safe;
      re2[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src2[t2.NUMERICIDENTIFIER]})\\.(${src2[t2.NUMERICIDENTIFIER]})\\.(${src2[t2.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src2[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src2[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src2[t2.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src2[t2.NONNUMERICIDENTIFIER]}|${src2[t2.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src2[t2.NONNUMERICIDENTIFIER]}|${src2[t2.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src2[t2.PRERELEASEIDENTIFIER]}(?:\\.${src2[t2.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src2[t2.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src2[t2.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
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
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH2}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?`);
    createToken("COERCE", `${src2[t2.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src2[t2.COERCEPLAIN] + `(?:${src2[t2.PRERELEASE]})?(?:${src2[t2.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src2[t2.COERCE], true);
    createToken("COERCERTLFULL", src2[t2.COERCEFULL], true);
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
  const looseOption = Object.freeze({ loose: true });
  const emptyOpts = Object.freeze({});
  const parseOptions$1 = (options) => {
    if (!options) {
      return emptyOpts;
    }
    if (typeof options !== "object") {
      return looseOption;
    }
    return options;
  };
  var parseOptions_1 = parseOptions$1;
  const numeric = /^[0-9]+$/;
  const compareIdentifiers$1 = (a, b) => {
    if (typeof a === "number" && typeof b === "number") {
      return a === b ? 0 : a < b ? -1 : 1;
    }
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
  const { safeRe: re, t } = re$1.exports;
  const parseOptions = parseOptions_1;
  const { compareIdentifiers } = identifiers;
  class SemVer$2 {
    constructor(version, options) {
      options = parseOptions(options);
      if (version instanceof SemVer$2) {
        if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
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
      if (!(other instanceof SemVer$2)) {
        if (typeof other === "string" && other === this.version) {
          return 0;
        }
        other = new SemVer$2(other, this.options);
      }
      if (other.version === this.version) {
        return 0;
      }
      return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
      if (!(other instanceof SemVer$2)) {
        other = new SemVer$2(other, this.options);
      }
      if (this.major < other.major) {
        return -1;
      }
      if (this.major > other.major) {
        return 1;
      }
      if (this.minor < other.minor) {
        return -1;
      }
      if (this.minor > other.minor) {
        return 1;
      }
      if (this.patch < other.patch) {
        return -1;
      }
      if (this.patch > other.patch) {
        return 1;
      }
      return 0;
    }
    comparePre(other) {
      if (!(other instanceof SemVer$2)) {
        other = new SemVer$2(other, this.options);
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
      if (!(other instanceof SemVer$2)) {
        other = new SemVer$2(other, this.options);
      }
      let i = 0;
      do {
        const a = this.build[i];
        const b = other.build[i];
        debug("build compare", i, a, b);
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
    inc(release, identifier, identifierBase) {
      if (release.startsWith("pre")) {
        if (!identifier && identifierBase === false) {
          throw new Error("invalid increment argument: identifier is empty");
        }
        if (identifier) {
          const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
          if (!match || match[1] !== identifier) {
            throw new Error(`invalid identifier: ${identifier}`);
          }
        }
      }
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier, identifierBase);
          this.inc("pre", identifier, identifierBase);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier, identifierBase);
          }
          this.inc("pre", identifier, identifierBase);
          break;
        case "release":
          if (this.prerelease.length === 0) {
            throw new Error(`version ${this.raw} is not a prerelease`);
          }
          this.prerelease.length = 0;
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
        case "pre": {
          const base = Number(identifierBase) ? 1 : 0;
          if (this.prerelease.length === 0) {
            this.prerelease = [base];
          } else {
            let i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === "number") {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) {
              if (identifier === this.prerelease.join(".") && identifierBase === false) {
                throw new Error("invalid increment argument: identifier already exists");
              }
              this.prerelease.push(base);
            }
          }
          if (identifier) {
            let prerelease = [identifier, base];
            if (identifierBase === false) {
              prerelease = [identifier];
            }
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = prerelease;
              }
            } else {
              this.prerelease = prerelease;
            }
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${release}`);
      }
      this.raw = this.format();
      if (this.build.length) {
        this.raw += `+${this.build.join(".")}`;
      }
      return this;
    }
  }
  var semver = SemVer$2;
  const SemVer$1 = semver;
  const compare$1 = (a, b, loose) => new SemVer$1(a, loose).compare(new SemVer$1(b, loose));
  var compare_1 = compare$1;
  const compare = compare_1;
  const gt = (a, b, loose) => compare(a, b, loose) > 0;
  var gt_1 = gt;
  const SemVer = semver;
  const parse$1 = (version, options, throwErrors = false) => {
    if (version instanceof SemVer) {
      return version;
    }
    try {
      return new SemVer(version, options);
    } catch (er) {
      if (!throwErrors) {
        return null;
      }
      throw er;
    }
  };
  var parse_1 = parse$1;
  const parse = parse_1;
  const valid = (version, options) => {
    const v = parse(version, options);
    return v ? v.version : null;
  };
  var valid_1 = valid;
  const RenderScript = lib.createRenderScript({
    name: "🖼️ 窗口设置"
  });
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
      return true;
    } catch (err) {
      console.error(err);
      if (String(err).includes(`failed because the user didn't interact with the document first`)) {
        lib.$modal.alert({
          content: "播放音视频失败，由于浏览器的用户隐私保护措施，如果要播放带有音量的视频，或者某些无法自动播放音视频的网站，您必须先点击一次页面上的任意位置脚本才能进行音视频的播放，后续无需重新点击。",
          onClose: async () => {
            await tryPlayMedia();
          }
        });
        return true;
      } else if (String(err).includes("The element has no supported sources")) {
        $console.error("当前视频无法播放。");
      } else {
        $console.error("播放视频时发生未知错误：" + String(err));
      }
      return false;
    }
  }
  function enableCopy(elements2) {
    function hackSelect(target) {
      if (target) {
        const _original_select = target.onselectstart;
        const _original_oncopy = target.oncopy;
        const _original_onpaste = target.onpaste;
        const _original_onkeydown = target.onkeydown;
        target.onselectstart = (e) => {
          _original_select == null ? void 0 : _original_select.apply(target, [e]);
          e.stopPropagation();
          e.returnValue = true;
          return true;
        };
        target.oncopy = (e) => {
          _original_oncopy == null ? void 0 : _original_oncopy.apply(target, [e]);
          e.stopPropagation();
          e.returnValue = true;
          return true;
        };
        target.onpaste = (e) => {
          _original_onpaste == null ? void 0 : _original_onpaste.apply(target, [e]);
          e.stopPropagation();
          e.returnValue = true;
          return true;
        };
        target.onkeydown = (e) => {
          _original_onkeydown == null ? void 0 : _original_onkeydown.apply(target, [e]);
          e.stopPropagation();
          e.returnValue = true;
          return true;
        };
      }
    }
    for (const el of elements2) {
      hackSelect(el);
    }
  }
  let popupWin;
  window.addEventListener("beforeunload", () => {
    popupWin == null ? void 0 : popupWin.close();
  });
  function createQuestionTitleExtra(question, ...left) {
    const btnAttrs = {
      className: "base-style-button-secondary",
      style: {
        padding: "0 4px",
        fontSize: "12px",
        height: "20px",
        lineHeight: "1",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    };
    const copyBtn = lib.$ui.button("复制", btnAttrs);
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(question);
      copyBtn.value = "已复制√";
      setTimeout(() => {
        copyBtn.value = "复制";
      }, 500);
    };
    const baiduBtn = lib.$ui.button("🌏百度一下", btnAttrs);
    baiduBtn.onclick = () => {
      popupWin == null ? void 0 : popupWin.close();
      popupWin = $.createCenteredPopupWindow(`https://www.baidu.com/s?wd=${question}`, "百度搜索", {
        width: 1e3,
        height: 800,
        resizable: true,
        scrollbars: true
      });
    };
    const space = lib.$ui.space([...left, copyBtn, baiduBtn], { x: 4 });
    space.style.marginTop = "6px";
    space.style.textAlign = "right";
    return lib.h("div", { style: { textAlign: "right" } }, [space]);
  }
  function msgwc(type, attrs) {
    lib.$message[type](attrs);
    if (type === "success") {
      type = "info";
    }
    let content = "";
    if (typeof attrs === "string") {
      content = attrs;
    } else {
      if (attrs.content instanceof HTMLElement) {
        content = attrs.content.innerText;
      } else if (typeof attrs.content === "string") {
        content = attrs.content.toString();
      }
    }
    $console[type](content);
  }
  const $msgwc = {
    info: (attrs) => msgwc("info", attrs),
    warn: (attrs) => msgwc("warn", attrs),
    error: (attrs) => msgwc("error", attrs),
    success: (attrs) => msgwc("success", attrs)
  };
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1080 1080" style="vertical-align:middle;"><path fill-rule="evenodd" d="M504.5 1.109c-72.713 4.577-147.529 25.339-212.035 58.842-50.191 26.068-92.985 57.474-133.527 97.996-41.255 41.234-72.652 84.102-98.549 134.553-63.294 123.306-76.989 265.444-38.445 399 25.189 87.279 71.847 166.103 136.667 230.88 51 50.967 110.694 90.846 176.835 118.135 49.129 20.27 108.457 34.223 163.504 38.452 17.303 1.329 66.996 1.333 83.655.006 55.204-4.397 107.295-16.401 158.822-36.6 17.371-6.81 57.946-26.767 74.073-36.433 41.445-24.842 72.509-49.199 110.493-86.637l21.507-21.198-71.734-71.786-71.734-71.785-19.766 19.567c-10.871 10.762-23.591 22.705-28.266 26.54-53.604 43.971-115.935 69.551-185 75.921-81.757 7.541-165.599-15.992-231.454-64.964-6.35-4.722-11.546-8.93-11.546-9.349s11.385-12.142 25.3-26.049l25.3-25.286 4.777-3.648c13.463 10.28 36.952 23.436 55.855 31.285 52.351 21.738 113.089 25.925 168.768 11.634 35.263-9.05 73.276-28.363 100.754-51.188C722.543 734.838 751 705.231 751 702.338c0-1.002-47.194-48.338-48.193-48.338-.39 0-4.279 4.388-8.642 9.75-24.686 30.342-55.543 51.652-92.165 63.652-22.77 7.461-33.447 9.027-61.5 9.025-20.917-.002-25.46-.293-35.363-2.266-31.598-6.297-58.925-18.374-83.801-37.035-4.858-3.644-16.847-14.474-26.642-24.066l-17.809-17.44-73.994 73.94-73.994 73.94 21.324 21c28.787 28.349 48.737 44.364 77.279 62.033 15.029 9.303 48.315 26.086 63 31.763 35.072 13.559 69.772 21.993 108 26.249 20.372 2.268 63.437 2.268 84-.001 76.772-8.471 146.44-36.203 205.832-81.934 6.508-5.01 12.471-9.558 13.252-10.106 1.101-.773 6.563 4.151 24.406 22l22.988 22.996-10.739 8.675c-65.679 53.053-141.564 86.866-223.817 99.729-27.363 4.279-43.823 5.505-73.922 5.505-46.468 0-83.994-5.037-127.455-17.107C272.797 955.351 156.557 850.805 102.504 715c-22.28-55.977-32.803-111.402-32.94-173.5-.116-52.401 7.047-99.278 22.432-146.793C147.295 223.918 294.816 99.581 473 73.582c41.922-6.117 98.943-5.919 138.5.481 72.78 11.775 134.913 36.126 194.048 76.05C823.221 162.046 848 181.418 848 183.304c0 .661-32.624 33.823-72.498 73.694-55.881 55.877-72.815 72.265-73.88 71.498-41.919-30.237-86.474-47.748-133.478-52.458-13.265-1.329-41.947-1.334-55.288-.01-78.286 7.774-150.572 51.845-194.318 118.472-31.523 48.011-46.706 105.616-42.723 162.094 1.179 16.71 3.688 33.737 6.74 45.73C287.22 620.654 297.35 649 299.235 649c.53 0 12.635-11.675 26.9-25.945l25.936-25.944-1.984-7.806c-4.264-16.777-5.55-28.045-5.569-48.805-.019-21.105.931-29.802 5.136-47 13.445-54.989 48.145-99.893 98.346-127.264 16.503-8.998 39.898-16.833 60.379-20.222 15.558-2.575 45.897-2.791 61.002-.436C638.18 356.306 694.057 399.38 721.704 463c15.443 35.539 19.804 79.228 11.676 117-1.36 6.325-2.706 12.85-2.989 14.5-.482 2.81 1.166 4.677 25.998 29.444 25.179 25.113 26.56 26.321 27.443 24 .512-1.344 2.056-5.144 3.432-8.444 22.118-53.055 24.905-120.158 7.36-177.223-8.309-27.026-22.775-56.32-38.077-77.106-2.501-3.397-4.547-6.512-4.547-6.922s43.893-44.64 97.54-98.289l97.539-97.543-23.289-22.984c-24.441-24.12-39.625-37.373-61.265-53.476C760.232 29.842 634.23-7.058 504.5 1.109m453.75 253.895C944.913 268.521 934 279.798 934 280.065s4.308 7.673 9.574 16.46c22.263 37.147 39.526 77.171 50.801 117.778 3.005 10.825 4.205 15.733 7.623 31.197 10.804 48.879 12.225 117.979 3.485 169.5-11.438 67.422-31.332 118.888-70.557 182.535l-1.87 3.036 24.863 24.848 24.863 24.848 7.942-11.884c45.969-68.783 75.805-150.569 85.686-234.883 5.282-45.065 4.544-97.517-2.004-142.5-11.025-75.743-37.133-146.086-78.498-211.5-4.87-7.7-9.878-15.141-11.131-16.536l-2.277-2.536z"/></svg>`;
  const loadingSpinSvg = `<svg class="aw-spin" width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="10" stroke-linecap="round"/></svg>`;
  function createAccordionCard(options) {
    var _a;
    const card = lib.h("div", {
      className: "accordion-card" + (options.className ? " " + options.className : "") + (options.expanded ? " expanded" : "")
    });
    const header2 = lib.h("div", { className: "accordion-card-header" }, [
      ...options.header,
      lib.h("span", { className: "accordion-card-spacer" }),
      ...(_a = options.headerTrailing) != null ? _a : [],
      lib.h("span", { className: "accordion-card-chevron", innerHTML: CHEVRON_SVG })
    ]);
    header2.onclick = () => card.classList.toggle("expanded");
    card.append(header2, lib.h("div", { className: "accordion-card-body" }, options.body));
    return card;
  }
  const CHEVRON_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  async function probeAnswerer(item, disabled) {
    if (disabled) {
      return { status: "disabled" };
    }
    let probeUrl;
    try {
      probeUrl = new URL(item.url);
    } catch {
      return { status: "invalid" };
    }
    const t2 = Date.now();
    probeUrl.searchParams.set("t", String(t2));
    const doProbe = async (method) => {
      const res = await request(probeUrl.toString(), {
        type: "GM_xmlhttpRequest",
        method,
        responseType: "text",
        anyStatus: true
      });
      if (method === "head" && (res.status === 405 || res.status === 501)) {
        return doProbe("get");
      }
      return res;
    };
    try {
      const res = await Promise.race([
        doProbe("head"),
        (async () => {
          await $.sleep(10 * 1e3);
          return void 0;
        })()
      ]);
      if (res === void 0)
        return { status: "timeout" };
      const latency = Date.now() - t2;
      const ok = res.status >= 200 && res.status < 400;
      return ok ? { status: "success", statusCode: res.status, latency } : { status: "error", statusCode: res.status, latency, error: new Error("HTTP " + res.status) };
    } catch (error) {
      return { status: "error", error };
    }
  }
  function formatProbeStatus(r) {
    switch (r.status) {
      case "success":
        return `连接成功（${r.statusCode}）`;
      case "error":
        return r.statusCode !== void 0 ? `连接失败（${r.statusCode}）` : "连接失败";
      case "timeout":
        return "连接超时";
      case "disabled":
        return "已停用";
      case "invalid":
        return "配置错误";
    }
  }
  function formatProbeLatency(r) {
    return r.latency !== void 0 ? `延迟 ${r.latency}毫秒` : void 0;
  }
  function createAnswererWrapperList(aw, handlers) {
    const canProbe = lib.$gm.isInGMContext();
    const row = (label, value) => lib.h("li", { className: "aw-card-row" }, [
      lib.h("span", { className: "aw-card-label" }, label),
      lib.h("span", { className: "aw-card-value" }, [value])
    ]);
    return aw.map((item) => {
      const statusEl = canProbe ? lib.h("span", { className: "aw-card-status-group" }, [
        lib.h("span", { className: "aw-card-status probing" }, "检测中…")
      ]) : void 0;
      const renderStatus = (r) => {
        var _a;
        if (!statusEl)
          return;
        const latencyText = formatProbeLatency(r);
        statusEl.replaceChildren(
          lib.h("span", { className: "aw-card-status " + r.status }, formatProbeStatus(r)),
          ...latencyText ? [lib.h("span", { className: "aw-card-status latency" }, latencyText)] : []
        );
        statusEl.title = r.status === "success" ? `连接成功，HTTP ${r.statusCode}，延迟 ${r.latency}毫秒` : r.status === "disabled" ? "此题库已被停用，点击右侧开关启用" : r.status === "error" ? "连接失败" + (((_a = r.error) == null ? void 0 : _a.message) ? `：${r.error.message}` : "") : r.status === "timeout" ? "连接超时（>10秒）" : "题库配置 URL 无法解析";
      };
      const startProbe = () => {
        if (!statusEl)
          return;
        statusEl.replaceChildren(lib.h("span", { className: "aw-card-status probing" }, "检测中…"));
        statusEl.title = "正在检测题库连接状态";
        probeAnswerer(item, handlers.isDisabled(item.name)).then(renderStatus);
      };
      startProbe();
      const checkbox = lib.h("input", {
        type: "checkbox",
        checked: !handlers.isDisabled(item.name),
        className: "base-style-switch"
      });
      checkbox.title = "点击停用或者启用题库，停用题库后将无法在自动答题中查询题目";
      const switchWrapper = lib.$ui.tooltip(checkbox);
      checkbox.onclick = (e) => {
        e.stopPropagation();
        const disabled = !checkbox.checked;
        card.classList.toggle("disabled", disabled);
        handlers.onToggle(item.name, disabled);
        if (disabled) {
          renderStatus({ status: "disabled" });
        } else {
          startProbe();
        }
      };
      const host = (() => {
        try {
          return new URL(item.url).hostname;
        } catch {
          return item.url;
        }
      })();
      const hasHomepage = !!item.homepage && item.homepage !== "#";
      const homeLink = lib.h(
        "a",
        {
          className: "aw-card-home" + (hasHomepage ? "" : " no-home"),
          href: hasHomepage ? item.homepage : "javascript:void(0)",
          target: "_blank",
          title: hasHomepage ? "前往题库首页" : "此题库未配置首页"
        },
        "🏠"
      );
      homeLink.onclick = (e) => e.stopPropagation();
      const card = createAccordionCard({
        className: "aw-card" + (handlers.isDisabled(item.name) ? " disabled" : ""),
        header: [
          homeLink,
          lib.h("span", { className: "aw-card-name" }, item.name),
          lib.h("span", { className: "aw-card-badge", title: item.url }, host),
          ...statusEl ? [statusEl] : []
        ],
        headerTrailing: [switchWrapper],
        body: [
          lib.h("ul", { className: "aw-card-rows" }, [
            row("名字", item.name),
            row(
              "官网",
              lib.h("span", {
                innerHTML: `<a target="_blank" href=${item.homepage}>${item.homepage || "无"}</a>`
              })
            ),
            row("接口", item.url),
            row("请求方法", item.method),
            row("请求类型", item.type),
            row("请求头", JSON.stringify(item.headers, null, 4) || "无"),
            row("请求体", JSON.stringify(item.data, null, 4) || "无")
          ])
        ]
      });
      return card;
    });
  }
  function createAnswererWrapperSection(aw, title, handlers, withCopy = true) {
    const copyBtn = withCopy ? lib.$ui.copy("复制题库配置", JSON.stringify(aw, null, 4)) : void 0;
    if (copyBtn) {
      copyBtn.className = "modal-cancel-button aw-section-copy";
    }
    return lib.h("div", [
      lib.h("div", { className: "aw-section-header" }, [lib.h("b", title), ...copyBtn ? [copyBtn] : []]),
      ...createAnswererWrapperList(aw, handlers)
    ]);
  }
  function createAnswererModeDropdown() {
    const dropdown2 = lib.h("dropdown-element");
    dropdown2.trigger = "hover";
    dropdown2.triggerElement = lib.h(
      "button",
      {
        className: "base-style-button-secondary",
        style: { marginLeft: "4px", padding: "4px 12px" }
      },
      "⋯"
    );
    dropdown2.style.display = "inline-flex";
    const content = dropdown2.content;
    content.style.top = "100%";
    content.style.right = "0";
    content.style.left = "auto";
    const refreshPosition = () => {
      const panel = dropdown2.closest("script-panel-element");
      if (!panel)
        return;
      const flipUp = dropdown2.triggerElement.getBoundingClientRect().bottom + content.offsetHeight > panel.getBoundingClientRect().bottom;
      content.style.top = flipUp ? "auto" : "100%";
      content.style.bottom = flipUp ? "100%" : "auto";
    };
    dropdown2.triggerElement.addEventListener("mouseenter", () => {
      setTimeout(() => {
        if (content.classList.contains("show"))
          refreshPosition();
      });
    });
    const options = {
      official: lib.$ui.tooltip(
        lib.h(
          "div",
          {
            className: "dropdown-option",
            title: "打开官方题库获取弹窗，登录题库网站后自动回填配置，无需手动复制粘贴"
          },
          "官方题库"
        )
      ),
      custom: lib.$ui.tooltip(
        lib.h("div", { className: "dropdown-option", title: "打开手动配置弹窗，手动填写或粘贴题库配置" }, "自定义题库")
      )
    };
    const openAnswererModal = (mode) => {
      const configEl = dropdown2.closest("config-element");
      const provider2 = configEl == null ? void 0 : configEl.provider;
      if (provider2 == null ? void 0 : provider2.openAnswererModal) {
        provider2.openAnswererModal(mode);
      } else {
        provider2 == null ? void 0 : provider2.click();
      }
    };
    options.official.onclick = () => openAnswererModal("official");
    options.custom.onclick = () => openAnswererModal("custom");
    dropdown2.content.append(options.official, options.custom);
    return dropdown2;
  }
  function createSteps(items) {
    const children = [];
    items.forEach((text2, i) => {
      children.push(lib.h("span", { className: "aw-step" }, [lib.h("span", { className: "aw-step-num" }, String(i + 1)), text2]));
      if (i < items.length - 1) {
        children.push(lib.h("span", { className: "aw-step-arrow" }, "→"));
      }
    });
    return lib.h("div", { className: "aw-steps" }, children);
  }
  function createStatusBox() {
    const el = lib.h("div", { className: "aw-connect-status" });
    const setStatus = (text2, type) => {
      el.innerHTML = text2;
      el.className = "aw-connect-status " + type;
    };
    return { el, setStatus };
  }
  function createHero(opts) {
    return lib.h("div", { className: "aw-connect-hero" }, [
      lib.h("div", { className: "aw-connect-hero-icon" }, opts.icon),
      lib.h("div", { className: "aw-connect-hero-title" }, opts.title),
      lib.h("div", { className: "aw-connect-hero-subtitle" }, opts.subtitle),
      ...opts.extra ? [lib.h("div", { className: "aw-connect-hero-extra" }, [opts.extra])] : []
    ]);
  }
  const IMG_LINK_RE = /https?:\/\/[^"'<\s一-鿿]+?\.(?:png|jpe?g|gif|bmp|webp|svg)(?:\?[^\s"'<>一-鿿]*)?(?:#[^\s"'<>一-鿿]*)?/g;
  const transformImgLinkOfQuestion = (question) => {
    const toImg = (text2) => text2.replace(IMG_LINK_RE, (img) => `<img src="${img}" />`);
    if (!/<img[\s>]/i.test(question)) {
      return toImg(question);
    }
    const dom2 = new DOMParser().parseFromString(question, "text/html");
    for (const img of Array.from(dom2.querySelectorAll("img"))) {
      img.replaceWith(img.src);
    }
    return toImg(dom2.documentElement.innerHTML);
  };
  const normalizeQuestion = (question) => question.replace(/https?:\/\//gi, "//").replace(/[^\p{L}\p{N}]/gu, "");
  class SearchInfosElement extends HTMLElement {
    constructor() {
      super(...arguments);
      this.infos = [];
      this.question = "";
    }
    connectedCallback() {
      const question = transformImgLinkOfQuestion(this.question || "无");
      const type_text = {
        single: "单选题",
        multiple: "多选题",
        judgement: "判断题",
        completion: "填空题"
      };
      const type_label = this.type ? Reflect.get(type_text, this.type) : "";
      this.append(
        lib.h(
          "div",
          [
            lib.h("div", { className: "title-content" }, [
              ...question.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => lib.h("div", { innerHTML: l }))
            ]),
            createQuestionTitleExtra(
              this.question,
              ...type_label ? [lib.h("span", { className: "search-result-question-type" }, type_label)] : []
            )
          ],
          (div) => {
            div.className = "search-info-title";
          }
        )
      );
      this.append(
        ...this.infos.map((info) => {
          const homeLink = lib.$ui.tooltip(
            lib.h("a", { href: info.homepage, innerText: info.name, target: "_blank", title: "点击前往题库官网" })
          );
          homeLink.onclick = (e) => e.stopPropagation();
          return createAccordionCard({
            className: "search-info-details",
            expanded: true,
            header: [
              homeLink,
              ...info.error ? [] : [lib.h("span", { className: "text-secondary" }, ` 共 ${info.results.length} 个结果`)]
            ],
            body: (info.error ? [lib.h("span", { className: "error" }, [info.error || "网络错误或者未知错误"])] : []).concat([
              ...info.results.map((ans) => {
                const title = transformImgLinkOfQuestion(ans[0] || this.question || "无");
                const answer = splitAnswer(ans[1] || "无").map((a) => transformImgLinkOfQuestion(a));
                const isSameQuestion = normalizeQuestion(ans[0] || "") === normalizeQuestion(this.question || "");
                const extra_data = JSON.parse(JSON.stringify(ans[2] || {}));
                if (extra_data.ai) {
                  extra_data.tags = extra_data.tags || [];
                  extra_data.tags.push({
                    text: "AI",
                    title: "此答案由 AI 生成，仅供参考",
                    color: "blue"
                  });
                }
                if (extra_data.cache) {
                  extra_data.tags = extra_data.tags || [];
                  extra_data.tags.push({
                    text: "题库缓存",
                    title: "此答案来自本地缓存，由在线题库搜索后保存在本地。\n- 清空缓存：请前往通用-全局设置-题库缓存功能-管理缓存\n- 关闭缓存：请前往通用-全局设置-题库缓存功能",
                    color: "gray"
                  });
                }
                return lib.h("div", { className: "search-result" }, [
                  ...isSameQuestion ? [] : [lib.h("div", { className: "question" }, [lib.h("span", { innerHTML: title })])],
                  lib.h("div", { className: "answer" }, [
                    lib.h("span", "答案："),
                    ...extra_data.tags ? extra_data.tags.map(
                      (tag) => lib.$ui.tooltip(
                        lib.h("span", {
                          className: "search-result-answer-tag " + tag.color,
                          innerHTML: tag.text,
                          title: tag.title,
                          dataset: { title: tag.title }
                        })
                      )
                    ) : [],
                    ...answer.map((a) => lib.h("code", { innerHTML: a }))
                  ])
                ]);
              })
            ])
          });
        })
      );
      $.onresize(this, (sr) => {
        sr.style.maxHeight = window.innerHeight / 2 + "px";
      });
    }
  }
  const $render = {
    moveToEdge(x = 80, y = 100) {
      BackgroundProject.scripts.render.methods.minimize();
      BackgroundProject.scripts.render.methods.setPosition(x, y);
    }
  };
  const state$7 = {
    console: {
      listenerIds: {
        logs: 0
      }
    },
    app: {
      listenerIds: {
        sync: 0,
        connected: 0,
        closeSync: 0
      }
    }
  };
  const QUESTION_CACHE_ITEM_MAX_BYTES = 64 * 1024;
  const QUESTION_CACHE_TOTAL_MAX_BYTES = 1024 * 1024;
  const byteLengthOf = (text2) => new TextEncoder().encode(text2).length;
  const localQuestionCaches = [];
  function addToLocalQuestionCaches(items) {
    for (const item of items) {
      if (localQuestionCaches.find((c) => c.title === item.title && c.answer === item.answer) === void 0) {
        localQuestionCaches.unshift(item);
      }
    }
    localQuestionCaches.splice(200);
    let totalBytes = 0;
    for (let i = 0; i < localQuestionCaches.length; i++) {
      totalBytes += byteLengthOf(localQuestionCaches[i].title) + byteLengthOf(localQuestionCaches[i].answer);
      if (totalBytes > QUESTION_CACHE_TOTAL_MAX_BYTES) {
        localQuestionCaches.splice(i);
        break;
      }
    }
  }
  function findInLocalQuestionCaches(title) {
    const results = [];
    for (const cache of localQuestionCaches) {
      if (cache.title.trim() === title.trim()) {
        results.push({
          name: cache.from,
          homepage: cache.homepage,
          results: [{ answer: cache.answer, question: cache.title, extra_data: { ai: cache.ai, cache: true } }]
        });
      }
    }
    return results;
  }
  const questionCacheTopStore = {
    add: lib.cors.defineTopFunction((items) => {
      addToLocalQuestionCaches(items);
    }),
    search: lib.cors.defineTopFunction((title) => {
      return JSON.stringify(findInLocalQuestionCaches(title));
    }),
    list: lib.cors.defineTopFunction(() => {
      return JSON.stringify(localQuestionCaches);
    }),
    clear: lib.cors.defineTopFunction(() => {
      localQuestionCaches.length = 0;
    })
  };
  function onDevtoolsOpen(callback) {
    let triggered = false;
    const trigger = () => {
      if (triggered)
        return;
      triggered = true;
      window.removeEventListener("keydown", onKeydown, true);
      clearInterval(timer);
      callback();
    };
    const onKeydown = (e) => {
      if (e.key === "F12" || (e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        trigger();
      }
    };
    window.addEventListener("keydown", onKeydown, true);
    const probe = lib.h("div");
    Object.defineProperty(probe, "id", {
      get: () => {
        trigger();
        return "devtools-probe";
      }
    });
    const timer = setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 160 || heightDiff > 160) {
        trigger();
      }
    }, 1e3);
  }
  const BackgroundProject = lib.Project.create({
    name: "其他",
    domains: [],
    scripts: {
      elementRegister: new lib.Script({
        name: "🔗 元素注册",
        hideInPanel: true,
        matches: [["所有页面", /.*/]],
        onstart() {
          lib.$.loadCustomElements([SearchInfosElement]);
        }
      }),
      console: new lib.Script({
        name: "📄 日志输出",
        matches: [["所有", /.*/]],
        namespace: "render.console",
        configs: {
          logs: {
            defaultValue: []
          }
        },
        onrender({ panel }) {
          const getTypeDesc = (type) => type === "info" ? "信息" : type === "error" ? "错误" : type === "warn" ? "警告" : type === "debug" ? "调试" : "日志";
          const createLog = (log) => {
            const date = new Date(log.time);
            const item = lib.h(
              "div",
              {
                title: "双击复制日志信息",
                className: "item"
              },
              [
                lib.h(
                  "span",
                  { className: "time" },
                  `${date.getHours().toFixed(0).padStart(2, "0")}:${date.getMinutes().toFixed(0).padStart(2, "0")} `
                ),
                lib.h("span", { className: log.type }, `[${getTypeDesc(log.type)}]`),
                lib.h("span", ":" + log.content)
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
            const div2 = lib.h("div", { className: "card console" });
            const logs2 = this.cfg.logs.map((log) => createLog(log));
            if (logs2.length) {
              div2.replaceChildren(...logs2);
            } else {
              div2.replaceChildren(
                lib.h("div", "暂无任何日志", (div3) => {
                  div3.style.textAlign = "center";
                })
              );
            }
            return { div: div2, logs: logs2 };
          };
          const isScrollBottom = (div2) => {
            const { scrollHeight, scrollTop, clientHeight } = div2;
            return scrollTop + clientHeight + 50 > scrollHeight;
          };
          const { div, logs } = showLogs();
          let lastRenderedLog = this.cfg.logs[this.cfg.logs.length - 1];
          this.offConfigChange(state$7.console.listenerIds.logs);
          state$7.console.listenerIds.logs = this.onConfigChange("logs", (logs2) => {
            const startIndex = lastRenderedLog ? logs2.lastIndexOf(lastRenderedLog) + 1 : 0;
            lastRenderedLog = logs2[logs2.length - 1];
            let lastLogEl;
            for (const log of logs2.slice(startIndex)) {
              lastLogEl = createLog(log);
              div.append(lastLogEl);
            }
            if (lastLogEl) {
              setTimeout(() => {
                if (isScrollBottom(div)) {
                  lastLogEl == null ? void 0 : lastLogEl.scrollIntoView();
                }
              }, 10);
            }
          });
          const show = () => {
            panel.body.replaceChildren(div);
            setTimeout(() => {
              var _a;
              (_a = logs[logs.length - 1]) == null ? void 0 : _a.scrollIntoView();
            }, 10);
          };
          show();
        }
      }),
      render: RenderScript,
      data: new lib.Script({
        name: "拓展数据",
        hideInPanel: true,
        matches: [["", /.*/]],
        namespace: "background.data",
        configs: {
          notes: {
            defaultValue: "这里是一些其他的应用或者拓展功能。"
          }
        },
        onstart() {
          lib.$store.delete("background.data.localQuestionCaches");
        },
        methods() {
          return {
            addQuestionCache: async (...questionCacheItems) => {
              const items = questionCacheItems.filter(
                (item) => byteLengthOf(item.title) + byteLengthOf(item.answer) <= QUESTION_CACHE_ITEM_MAX_BYTES
              );
              if (items.length === 0) {
                return;
              }
              if (lib.$gm.isInGMContext() === false) {
                addToLocalQuestionCaches(items);
              } else {
                await questionCacheTopStore.add(items);
              }
            },
            addQuestionCacheFromWorkResult(swr) {
              BackgroundProject.scripts.data.methods.addQuestionCache(
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
              if (CommonProject.scripts.settings.cfg.enableQuestionCaches === false) {
                return await whenSearchEmpty();
              }
              const results = lib.$gm.isInGMContext() === false ? findInLocalQuestionCaches(title) : JSON.parse(await questionCacheTopStore.search(title) || "[]");
              if (results.length === 0) {
                return await whenSearchEmpty();
              }
              return results;
            },
            showQuestionCaches: async () => {
              const questionCaches = lib.$gm.isInGMContext() === false ? localQuestionCaches.map((c) => ({ ...c })) : JSON.parse(await questionCacheTopStore.list() || "[]");
              const list = questionCaches.map(
                (c) => lib.h(
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
                    lib.h("div", { className: "title" }, [
                      lib.$ui.tooltip(
                        lib.h(
                          "span",
                          {
                            title: `来自：${c.from || "未知题库"}
主页：${c.homepage || "未知主页"}`,
                            style: { fontWeight: "bold" }
                          },
                          c.title
                        )
                      )
                    ]),
                    lib.h("div", { className: "answer", style: { marginTop: "6px" } }, c.answer)
                  ]
                )
              );
              const countEl = lib.h("span", ["当前缓存数量：" + questionCaches.length]);
              lib.$modal.simple({
                width: 800,
                content: lib.h("div", [
                  lib.h("div", { className: "notes card" }, [
                    lib.$ui.notes([
                      "题库缓存是将题库的题目和答案保存在内存中，重复使用时直接读取缓存，不需要再次请求题库。",
                      "默认最多存储 200 题（单条最大 64KB，总量最大 1MB，超限自动剔除最旧记录），当前页面关闭后会自动清除。"
                    ])
                  ]),
                  lib.h("div", { className: "card" }, [
                    lib.$ui.space(
                      [
                        countEl,
                        lib.$ui.button("清空题库缓存", {}, (btn) => {
                          btn.onclick = async () => {
                            if (lib.$gm.isInGMContext() === false) {
                              localQuestionCaches.length = 0;
                            } else {
                              await questionCacheTopStore.clear();
                            }
                            countEl.innerText = "当前缓存数量：0";
                            list.forEach((el) => el.remove());
                          };
                        })
                      ],
                      { separator: "|" }
                    )
                  ]),
                  lib.h(
                    "div",
                    questionCaches.length === 0 ? [lib.h("div", { style: { textAlign: "center" } }, "暂无题库缓存")] : list
                  )
                ])
              });
            }
          };
        }
      }),
      appConfigSync: new lib.Script({
        name: "🔄️ 软件配置同步",
        namespace: "background.app",
        matches: [["所有页面", /./]],
        hideInPanel: lib.$gm.getInfos() === void 0,
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              [
                lib.h("span", [
                  "如果您使用",
                  lib.h("a", { href: "https://docs.ocsjs.com/docs/app", target: "_blank" }, "OCS桌面软件"),
                  "启动浏览器，并使用此脚本，"
                ]),
                "我们会同步软件中的配置到此脚本上，方便多个浏览器的管理。",
                "窗口设置以及后台面板所有设置不会进行同步。"
              ],
              "如果不是，您可以忽略此脚本。"
            ]).outerHTML
          },
          sync_status: {
            defaultValue: "unconnect"
          },
          closeSync: {
            defaultValue: false,
            label: "关闭同步",
            attrs: {
              type: "checkbox"
            }
          }
        },
        onrender({ panel }) {
          panel.lockWrapper.remove();
          panel.configsContainer.classList.remove("lock");
          const update = () => {
            if (this.cfg.closeSync) {
              const tip = lib.h("div", { className: "notes card" }, ["已关闭同步。"]);
              panel.body.replaceChildren(lib.h("hr"), tip);
            } else if (this.cfg.sync_status === "synced") {
              const tip = lib.h("div", { className: "notes card" }, [`已成功同步软件中的配置.`]);
              panel.body.replaceChildren(lib.h("hr"), tip);
            } else if (this.cfg.sync_status === "unconnect") {
              const tip = lib.h("div", { className: "notes card" }, ["未同步软件配置，可能是桌面软件未启动。"]);
              panel.body.replaceChildren(lib.h("hr"), tip);
            } else if (this.cfg.sync_status === "not_playwright_environment") {
              const tip = lib.h("div", { className: "notes card" }, ["当前浏览器不是由桌面端软件启动，无法同步配置。"]);
              panel.body.replaceChildren(lib.h("hr"), tip);
            } else if (this.cfg.sync_status === "not_open_sync") {
              const tip = lib.h("div", { className: "notes card" }, ["桌面端软件未开启配置同步功能"]);
              panel.body.replaceChildren(lib.h("hr"), tip);
            } else if (this.cfg.sync_status === "empty_config") {
              const tip = lib.h("div", { className: "notes card" }, ["已成功连接到软件，但配置为空。"]);
              panel.body.replaceChildren(lib.h("hr"), tip);
            } else {
              const tip = lib.h("div", { className: "notes card" }, ["同步状态未知，请稍后重试。"]);
              panel.body.replaceChildren(lib.h("hr"), tip);
            }
          };
          update();
          this.offConfigChange(state$7.app.listenerIds.sync);
          this.offConfigChange(state$7.app.listenerIds.connected);
          this.offConfigChange(state$7.app.listenerIds.closeSync);
          state$7.app.listenerIds.connected = this.onConfigChange("sync_status", update);
          state$7.app.listenerIds.closeSync = this.onConfigChange("closeSync", (closeSync) => {
            if (closeSync) {
              this.cfg.sync_status = "not_open_sync";
              lib.$message.success({ content: "已关闭同步，刷新页面后生效" });
            }
          });
        },
        async onactive() {
          var _a;
          if (lib.$.isInTopWindow()) {
            if (this.cfg.closeSync) {
              $console.log("配置同步已关闭");
              return;
            }
            this.cfg.sync_status = "unconnect";
            try {
              let authToken = "";
              try {
                authToken = await request("http://localhost:15319/get-actions-key", {
                  type: "GM_xmlhttpRequest",
                  method: "get",
                  responseType: "text"
                });
              } catch {
              }
              const authHeaders = { "auth-token": authToken };
              const res = await request("http://localhost:15319/browser", {
                type: "GM_xmlhttpRequest",
                method: "get",
                responseType: "json",
                headers: authHeaders
              });
              if (!res) {
                this.cfg.sync_status = "unconnect";
                return;
              }
              const open_sync = await request("http://localhost:15319/is-browser-config-sync", {
                type: "GM_xmlhttpRequest",
                method: "get",
                responseType: "text",
                headers: authHeaders
              });
              if (open_sync !== "true") {
                this.cfg.sync_status = "not_open_sync";
                return;
              }
              if (Object.keys(res).length === 0) {
                this.cfg.sync_status = "not_open_sync";
                return;
              }
              const environment_res = await request("/ocs-environment", {
                type: "fetch",
                method: "get"
              });
              const environment = environment_res == null ? void 0 : environment_res.environment;
              if (!environment || environment !== "playwright") {
                this.cfg.sync_status = "not_playwright_environment";
                return;
              }
              for (const key in res) {
                if (Object.prototype.hasOwnProperty.call(res, key)) {
                  if (RenderScript.namespace && key.startsWith(RenderScript.namespace)) {
                    Reflect.deleteProperty(res, key);
                  }
                  for (const scriptKey in BackgroundProject.scripts) {
                    if (Object.prototype.hasOwnProperty.call(BackgroundProject.scripts, scriptKey)) {
                      const script2 = Reflect.get(BackgroundProject.scripts, scriptKey);
                      if (script2.namespace && key.startsWith(script2.namespace)) {
                        Reflect.deleteProperty(res, key);
                      }
                    }
                  }
                }
              }
              for (const project2 of definedProjects()) {
                for (const key in project2.scripts) {
                  if (Object.prototype.hasOwnProperty.call(project2.scripts, key)) {
                    const script2 = project2.scripts[key];
                    for (const ck in script2.configs) {
                      if (Object.prototype.hasOwnProperty.call(script2.configs, ck)) {
                        if (((_a = script2.configs[ck].extra) == null ? void 0 : _a.appConfigSync) === false) {
                          Reflect.deleteProperty(res, lib.$.namespaceKey(script2.namespace, ck));
                        }
                      }
                    }
                  }
                }
              }
              for (const key in res) {
                if (Object.prototype.hasOwnProperty.call(res, key)) {
                  lib.$store.set(key, res[key]);
                }
              }
              for (const project2 of definedProjects()) {
                if (project2.name === BackgroundProject.name) {
                  continue;
                }
                for (const key in project2.scripts) {
                  if (Object.prototype.hasOwnProperty.call(project2.scripts, key)) {
                    const script2 = project2.scripts[key];
                    const originalRender = script2.onrender;
                    script2.onrender = ({ panel, header: header2 }) => {
                      var _a2, _b;
                      originalRender == null ? void 0 : originalRender({ panel, header: header2 });
                      if (panel.configsContainer.children.length) {
                        panel.configsContainer.classList.add("lock");
                        panel.lockWrapper.style.width = ((_a2 = panel.configsContainer.clientWidth) != null ? _a2 : panel.clientWidth) + "px";
                        panel.lockWrapper.style.height = ((_b = panel.configsContainer.clientHeight) != null ? _b : panel.clientHeight) + "px";
                        panel.configsContainer.prepend(panel.lockWrapper);
                        panel.lockWrapper.title = "🚫已同步OCS桌面版软件配置，如需修改请在桌面版软件的左侧栏设置-通用设置-OCS配置，中进行修改。\n\n或者前往脚本悬浮窗:后台-软件配置同步 关闭配置同步功能。\n\n可双击强制修改，并关闭同步配置";
                        panel.lockWrapper = lib.$ui.tooltip(panel.lockWrapper);
                        panel.lockWrapper.addEventListener("dblclick", () => {
                          var _a3;
                          panel.configsContainer.classList.remove("lock");
                          panel.lockWrapper.remove();
                          script2.onrender = originalRender;
                          lib.$message.warn({
                            content: "已解除配置同步，可正常修改配置。想开启同步请前往：后台-软件配置同步",
                            duration: 10
                          });
                          this.cfg.closeSync = true;
                          if (script2.panel && script2.header) {
                            (_a3 = script2.onrender) == null ? void 0 : _a3.call(script2, { panel: script2.panel, header: script2.header });
                          }
                        });
                      }
                    };
                    if (script2.panel && script2.header) {
                      script2.onrender({ panel: script2.panel, header: script2.header });
                    }
                  }
                }
              }
              this.cfg.sync_status = "synced";
            } catch (e) {
              console.error(e);
              this.cfg.sync_status = "unconnect";
              this.hidePanel();
            }
          }
        }
      }),
      update: new lib.Script({
        name: "📥 更新模块",
        matches: [["所有页面", /.*/]],
        namespace: "background.update",
        configs: {
          notes: {
            defaultValue: "脚本自动更新模块，如果有新的版本会自动通知。"
          },
          autoNotify: {
            defaultValue: true,
            label: "开启更新通知",
            attrs: { type: "checkbox", title: "当有最新的版本时自动弹窗通知，默认开启" }
          },
          notToday: {
            defaultValue: -1
          },
          ignoreVersions: {
            defaultValue: []
          }
        },
        methods() {
          return {
            getLastVersion: async () => {
              return await request("https://cdn.ocsjs.com/ocs-version.json?t=" + Date.now(), {
                method: "get",
                type: "GM_xmlhttpRequest"
              });
            },
            showChangelog: async () => {
              const changelog = lib.h("div", {
                className: "markdown card",
                innerHTML: "加载中...",
                style: { maxWidth: "600px" }
              });
              lib.$modal.simple({
                width: 600,
                content: lib.h("div", [
                  lib.h("div", { className: "notes card" }, [
                    lib.$ui.notes(["此页面实时更新，遇到问题可以查看最新版本是否修复。"])
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
        async onrender({ panel }) {
          var _a;
          const version = await this.methods.getLastVersion();
          const infos = lib.$gm.getInfos();
          if (!infos) {
            return;
          }
          const changeLog = lib.h("button", { className: "base-style-button-secondary" }, "📄查看更新日志");
          changeLog.onclick = () => this.methods.showChangelog();
          const updatePage = ((_a = this.startConfig) == null ? void 0 : _a.updatePage) || "";
          panel.body.replaceChildren(
            lib.h("div", { className: "card" }, [
              lib.h("hr"),
              lib.h("div", ["最新版本：" + version["last-version"] + " - ", changeLog]),
              lib.h("hr"),
              lib.h("div", "当前版本：" + infos.script.version),
              lib.h("div", "脚本管理器：" + infos.scriptHandler),
              lib.h("div", ["脚本更新链接：", lib.h("a", { target: "_blank", href: updatePage }, [updatePage || "无"])])
            ])
          );
          console.log("versions", {
            notToday: this.cfg.notToday,
            ignoreVersions: this.cfg.ignoreVersions,
            version
          });
        },
        oncomplete() {
          if (this.cfg.autoNotify && lib.$.isInTopWindow()) {
            if (this.cfg.notToday === -1 || this.cfg.notToday !== new Date().getDate()) {
              const infos = lib.$gm.getInfos();
              if (infos) {
                if (!!valid_1(infos.script.version) === false) {
                  lib.$message.error(`当前版本号 (${infos.script.version}) 不符合semver版本书写规范，请重新修改版本。`);
                  return;
                }
                setTimeout(async () => {
                  var _a;
                  const version = await this.methods.getLastVersion();
                  const last = version["last-version"];
                  if (this.cfg.ignoreVersions.includes(last) === false && gt_1(last, infos.script.version)) {
                    const updatePage = ((_a = this.startConfig) == null ? void 0 : _a.updatePage) || "";
                    const modal2 = lib.$modal.confirm({
                      maskCloseable: false,
                      width: 600,
                      content: lib.$ui.notes([`检测到新版本发布 ${last} ：`, [...version.notes || []]]),
                      footer: lib.h("div", [
                        lib.h("button", { className: "base-style-button-secondary", innerText: "跳过此版本" }, (btn) => {
                          btn.onclick = () => {
                            this.cfg.ignoreVersions = [...this.cfg.ignoreVersions, last];
                            modal2 == null ? void 0 : modal2.remove();
                          };
                        }),
                        lib.h("button", { className: "base-style-button-secondary", innerText: "今日不再提示" }, (btn) => {
                          btn.onclick = () => {
                            this.cfg.notToday = new Date().getDate();
                            modal2 == null ? void 0 : modal2.remove();
                          };
                        }),
                        lib.h(
                          "button",
                          { className: "base-style-button", style: { marginLeft: "4px" }, innerText: "前往更新" },
                          (btn) => {
                            btn.onclick = () => {
                              if (updatePage) {
                                window.open(updatePage, "_blank");
                                modal2 == null ? void 0 : modal2.remove();
                              } else {
                                lib.$message.error({ content: "无法前往更新页面，更新链接为空" });
                              }
                            };
                          }
                        )
                      ])
                    });
                  }
                }, 5 * 1e3);
              }
            }
          }
        }
      }),
      dev: new lib.Script({
        name: "🛠️ 开发者调试",
        namespace: "background.dev",
        matches: [["所有页面", /./]],
        onstart() {
          if (self !== top)
            return;
          const devScripts = [this, BackgroundProject.scripts.requestList];
          for (const script2 of devScripts) {
            script2.hidePanel();
          }
          onDevtoolsOpen(() => {
            for (const script2 of devScripts) {
              script2.showPanel();
            }
          });
        },
        configs: {
          notes: {
            defaultValue: "开发人员调试用。<br>注入OCS_CONTEXT全局变量。用户可忽略此页面。"
          },
          show_debug_cursor: {
            defaultValue: true,
            label: "软件辅助点击时显示鼠标位置",
            attrs: { type: "checkbox" }
          },
          enable_answerer_debug: {
            defaultValue: true,
            label: "开启答题日志输出",
            attrs: { type: "checkbox" }
          }
        },
        methods() {
          return {
            getRemotePlaywrightCurrentPage: () => {
              return RemotePlaywright.getRemotePage(this.cfg.show_debug_cursor, console.debug);
            }
          };
        },
        onrender({ panel }) {
          const injectBtn = lib.h("button", { className: "base-style-button" }, "点击注入全局变量");
          injectBtn.addEventListener("click", () => {
            lib.$gm.unsafeWindow.OCS_CONTEXT = self;
          });
          const showTabDataBtn = lib.h("button", { className: "base-style-button" }, "显示Tab存储");
          lib.$gm.getTab((tab) => {
            const els = [];
            for (const key in tab) {
              if (Object.prototype.hasOwnProperty.call(tab, key)) {
                els.push(lib.h("div", [lib.h("b", key + " : "), lib.h("code", JSON.stringify(tab[key]))]));
              }
            }
            showTabDataBtn.addEventListener("click", () => {
              lib.$modal.simple({
                content: lib.h("div", els),
                width: window.document.documentElement.clientWidth / 2
              });
            });
          });
          const encoder = new TextEncoder();
          let storeBytes = 0;
          const keySizes = [];
          for (const key of lib.$store.list()) {
            const bytes = encoder.encode(key).length + encoder.encode(JSON.stringify(lib.$store.get(key)) || "").length;
            storeBytes += bytes;
            keySizes.push({ key, bytes });
          }
          const formatBytes = (bytes) => bytes < 1024 ? bytes + " B" : bytes < 1024 * 1024 ? (bytes / 1024).toFixed(2) + " KB" : (bytes / 1024 / 1024).toFixed(2) + " MB";
          const storeSizeEl = lib.h("div", { title: "store 本地存储中全部键值对的字节数（键名 + 值的 JSON 序列化）" }, [
            `Store 存储占用：${formatBytes(storeBytes)}（共 ${keySizes.length} 个键）`
          ]);
          const topKeys = keySizes.sort((a, b) => b.bytes - a.bytes).slice(0, 5);
          const topKeysEl = lib.h("div", { style: { fontSize: "12px", marginTop: "4px" } }, [
            lib.h("div", { style: { color: "#888" } }, "占用最高的键 Top5："),
            ...topKeys.map(
              (item, index) => lib.h(
                "div",
                {
                  title: item.key,
                  style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
                },
                `${index + 1}. ${item.key} — ${formatBytes(item.bytes)}`
              )
            )
          ]);
          panel.body.replaceChildren(
            lib.h("div", { className: "card" }, [lib.h("hr"), injectBtn, showTabDataBtn, lib.h("hr"), storeSizeEl, topKeysEl])
          );
        }
      }),
      appLoginHelper: new lib.Script({
        name: "软件登录辅助",
        matches: [
          ["超星登录", "passport2.chaoxing.com/login"],
          ["智慧树登录", "passport.zhihuishu.com/login"],
          ["职教云登录", "zjy2.icve.com.cn/portal/login.html"],
          ["智慧职教登录", "sso.icve.com.cn/sso/auth"]
        ],
        hideInPanel: true,
        oncomplete() {
          if (lib.$.isInTopWindow()) {
            $render.moveToEdge();
          }
        }
      }),
      errorHandle: new lib.Script({
        name: "全局错误捕获",
        matches: [["", /.*/]],
        hideInPanel: true,
        onstart() {
          const projects = definedProjects();
          for (const project2 of projects) {
            for (const key in project2.scripts) {
              if (Object.prototype.hasOwnProperty.call(project2.scripts, key)) {
                const script2 = project2.scripts[key];
                script2.on("scripterror", (err) => {
                  const msg = `[${project2.name} - ${script2.name}] : ${err}`;
                  console.error(msg);
                  $console.error(msg);
                });
              }
            }
          }
        }
      }),
      requestList: new lib.Script({
        name: "📄 请求记录",
        matches: [["", /.*/]],
        priority: 99,
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              "开发人员请求调试记录页面，小白勿入，最多只记录最近的100个请求数据",
              "可打开F12控制台查看请求日志，或者下方的请求列表"
            ]).outerHTML
          },
          enable: {
            label: "开启请求记录",
            attrs: { type: "checkbox" },
            defaultValue: false
          },
          methodFilter: {
            label: "方法过滤",
            tag: "select",
            attrs: { placeholder: "选择选项" },
            options: [["none", "无"], ["GET"], ["POST"], ["OPTIONS"], ["HEAD"]],
            defaultValue: "none"
          },
          typeFilter: {
            label: "类型过滤",
            tag: "select",
            attrs: { placeholder: "选择选项" },
            options: [
              ["none", "无"],
              ["gmxhr", "油猴API请求（gmxhr）"],
              ["fetch", "普通请求（fetch）"]
            ],
            defaultValue: "none"
          },
          searchValue: {
            label: "内容搜索",
            attrs: { placeholder: "搜索 URL/请求体/响应" },
            defaultValue: ""
          },
          list: {
            defaultValue: []
          }
        },
        methods() {
          const render2 = (list) => {
            var _a, _b;
            (_a = this.panel) == null ? void 0 : _a.body.replaceChildren();
            (_b = this.panel) == null ? void 0 : _b.body.append(
              lib.h("div", { className: "card" }, [
                lib.h("div", { style: { padding: "8px 0px", textAlign: "end" } }, [
                  lib.h(
                    "button",
                    {
                      className: "base-style-button-secondary",
                      style: { marginRight: "12px" },
                      innerText: "🗑️清空记录"
                    },
                    (btn) => {
                      btn.onclick = () => {
                        this.cfg.list = [];
                        render2(this.cfg.list);
                      };
                    }
                  ),
                  lib.h("button", { className: "base-style-button", innerText: "🔍执行搜索" }, (btn) => {
                    btn.onclick = () => {
                      if (this.cfg.methodFilter === "none" && this.cfg.typeFilter === "none" && this.cfg.searchValue === "") {
                        render2(this.cfg.list);
                      } else {
                        const list2 = this.cfg.list.filter((item) => {
                          if (this.cfg.methodFilter !== "none" && item.method.toLowerCase() !== this.cfg.methodFilter.toLowerCase()) {
                            return false;
                          }
                          return true;
                        }).filter((item) => {
                          if (this.cfg.typeFilter !== "none" && item.type !== this.cfg.typeFilter) {
                            return false;
                          }
                          return true;
                        }).filter((item) => {
                          var _a2, _b2;
                          if (this.cfg.searchValue && item.url.includes(this.cfg.searchValue) || ((_a2 = item.data) == null ? void 0 : _a2.includes(this.cfg.searchValue)) || ((_b2 = item.response) == null ? void 0 : _b2.includes(this.cfg.searchValue))) {
                            return true;
                          }
                          return false;
                        });
                        render2(list2);
                      }
                    };
                  })
                ]),
                lib.h(
                  "div",
                  { style: { backgroundColor: "#292929", overflow: "auto", maxHeight: window.innerHeight / 2 + "px" } },
                  [
                    ...list.length === 0 ? [lib.h("div", { style: { color: "white", textAlign: "center" } }, "暂无数据")] : [],
                    ...list.map(
                      (item) => lib.h(
                        "div",
                        {
                          title: Object.entries(item).map(
                            ([key, val]) => key === "time" ? `${key} : ${new Date(val).toLocaleString().replace(/\//g, "-")}` : `${key} : ${val}`
                          ).join("\n"),
                          style: {
                            maxWidth: "800px",
                            padding: "4px 0px",
                            margin: "4px 0px",
                            textWrap: "nowrap"
                          }
                        },
                        [
                          lib.h("div", [
                            lib.h("span", { style: { marginRight: "8px" } }, new Date(item.time).toLocaleTimeString()),
                            lib.h(
                              "span",
                              {
                                style: {
                                  backgroundColor: "#2196f3a3",
                                  color: "#ececec",
                                  marginRight: "8px",
                                  padding: "0px 2px"
                                }
                              },
                              item.method
                            ),
                            lib.h(
                              "span",
                              { style: { color: item.response ? "#4eb74e" : "#eb6262", marginRight: "8px" } },
                              "●"
                            ),
                            lib.h(
                              "div",
                              { style: { display: "inline-block", color: "#ececec" } },
                              item.url ? item.url.length > 100 ? item.url.slice(0, 100) + "..." : item.url : "-"
                            )
                          ]),
                          lib.h(
                            "div",
                            { style: { overflow: "hidden", fontSize: "12px", color: "#8f8f8f" } },
                            item.data ? "data: " + item.data : ""
                          ),
                          lib.h(
                            "div",
                            { style: { overflow: "hidden", fontSize: "12px", color: "#8f8f8f" } },
                            item.response ? "resp: " + item.response : item.error ? "err : " + item.error : ""
                          )
                        ]
                      )
                    )
                  ]
                )
              ])
            );
          };
          return {
            render: render2
          };
        },
        onrender() {
          this.methods.render(this.cfg.list);
        },
        onstart() {
          if (lib.$gm.isInGMContext() === false) {
            return;
          }
          const gmRequest = GM_xmlhttpRequest;
          const originalFetch = fetch;
          const getId = () => Math.random().toString(16).slice(2);
          const addRecord = (item) => {
            this.cfg.list = [item, ...this.cfg.list];
            if (this.cfg.list.length > 100) {
              this.cfg.list = this.cfg.list.slice(0, 100);
            }
          };
          const setItem = (id, response, error) => {
            const list = JSON.parse(JSON.stringify(this.cfg.list));
            const index = list.findIndex((item) => item.id === id);
            if (index !== -1) {
              list[index].response = response;
              list[index].error = error;
            }
            this.cfg.list = list;
          };
          GM_xmlhttpRequest = (details) => {
            if (this.cfg.enable) {
              const id = getId();
              const data = {
                id,
                url: details.url,
                method: details.method || "unknown",
                type: "gmxhr",
                data: details.data,
                headers: details.headers,
                response: "",
                error: "",
                time: Date.now()
              };
              addRecord(data);
              const onload = details.onload;
              const onerror = details.onerror;
              details.onload = function(response) {
                setItem(id, response.responseText, "");
                data.response = details.responseType === "json" ? response.response : response.responseText;
                console.log("%c [请求成功]", "color: green; font-weight: bold", data.url, data);
                onload == null ? void 0 : onload.apply(this, [response]);
              };
              details.onerror = function(response) {
                setItem(id, "", response.error);
                data.error = response.error;
                console.log("%c [请求失败]", "color: red; font-weight: bold", data.url, data);
                onerror == null ? void 0 : onerror.apply(this, [response]);
              };
            }
            return gmRequest.apply(this, [details]);
          };
          fetch = (input, init) => {
            if (this.cfg.enable) {
              const id = getId();
              const data = {
                id,
                url: typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
                method: (init == null ? void 0 : init.method) || "unknown",
                type: "fetch",
                data: init == null ? void 0 : init.body,
                headers: init == null ? void 0 : init.headers,
                response: "",
                error: "",
                time: Date.now()
              };
              addRecord(data);
              const res = originalFetch.apply(this, [input, init]);
              res.then((result) => {
                return result.clone().text();
              }).then((result) => {
                setItem(id, result, "");
                data.response = result;
                console.log("%c [请求成功]", "color: green; font-weight: bold", data.url, data);
              });
              res.catch((err) => {
                setItem(id, "", String(err));
                data.error = String(err);
                console.log("%c [请求失败]", "color: red; font-weight: bold", data.url, data);
              });
              return res;
            } else {
              return originalFetch.apply(this, [input, init]);
            }
          };
        }
      }),
      environmentDetect: new lib.Script({
        name: "🤖 环境检测",
        matches: [["所有页面", /.*/]],
        hideInPanel: true,
        oncomplete() {
          if (self !== top)
            return;
          const matches2 = [
            CXProject.scripts.studyDispatcher.matches,
            ZHSProject.scripts["gxk-study"].matches,
            ZHSProject.scripts.hike.matches,
            ZHSProject.scripts["smart-study"].matches,
            ZHSProject.scripts["wisdom-study"].matches,
            ZHSProject.scripts["xnk-study"].matches,
            ICourseProject.scripts.study.matches,
            IcveMoocProject.scripts.study.matches,
            ZJYProject.scripts.study.matches
          ].flat().map((m) => Array.isArray(m) ? m[1] : m);
          const url = window.location.href;
          const match = matches2.some((regex) => {
            return typeof regex === "string" ? url.includes(regex) : regex.test(url);
          });
          if (!match) {
            return;
          }
          let messageElement;
          visibleDetect();
          function visibleDetect() {
            setTimeout(() => {
              if (!(messageElement == null ? void 0 : messageElement.isConnected))
                messageElement = void 0;
              if (document.visibilityState === "hidden" && !messageElement) {
                messageElement = lib.$message.warn({
                  content: "⚠️检测到浏览器最小化/切屏，脚本可能无法正常运行，请保持网课页面在前台！（如果您正在全屏游戏中可以忽略此警告）",
                  duration: 0
                });
              }
              visibleDetect();
            }, 1e3);
          }
        }
      }),
      menus: new lib.Script({
        name: "📁 菜单管理",
        hideInPanel: true,
        matches: [["所有页面", /.*/]],
        async oncomplete() {
          await lib.$menu("🏠", { scriptPanelLink: CommonProject.scripts.guide });
          await lib.$menu("🔎", { scriptPanelLink: CommonProject.scripts.workResults });
          await lib.$menu("⚙️", { scriptPanelLink: CommonProject.scripts.settings });
          await lib.$menu("📄", { scriptPanelLink: BackgroundProject.scripts.console });
          const currentStudyScript = [
            [CXProject.scripts.studyDispatcher, CXProject.scripts.study],
            CXProject.scripts.work,
            CXProject.scripts.autoRead,
            ZHSProject.scripts["study-center"],
            ZHSProject.scripts["work-center"],
            ICourseProject.scripts["study-center"],
            ICourseProject.scripts.work,
            [ZJYProject.scripts.dispatcher, ZJYProject.scripts.study],
            ZJYProject.scripts.work,
            IcveMoocProject.scripts.study,
            IcveMoocProject.scripts.work,
            YKTProject.scripts.ai
          ].map((m) => {
            const url = window.location.href;
            const data = {
              matches: Array.isArray(m) ? m[0].matches : m.matches,
              target: Array.isArray(m) ? m[1] : m
            };
            if (data.matches.some((regexp) => {
              const r = Array.isArray(regexp) ? regexp[1] : regexp;
              return typeof r === "string" ? url.includes(r) : r.test(url);
            })) {
              return data.target;
            }
            return void 0;
          }).find((m) => m !== void 0);
          if (currentStudyScript) {
            await lib.$menu("🖥️", { scriptPanelLink: currentStudyScript });
            BackgroundProject.scripts.render.methods.pin(currentStudyScript);
          }
        }
      })
    }
  });
  let latestConsoleLogs;
  const persistConsoleLogs = debounce_1$1(() => {
    if (latestConsoleLogs) {
      BackgroundProject.scripts.console.cfg.logs = latestConsoleLogs;
    }
  }, 2e3);
  const $console = new Proxy({}, {
    get(target, key) {
      return (...msg) => {
        var _a;
        let logs = latestConsoleLogs != null ? latestConsoleLogs : BackgroundProject.scripts.console.cfg.logs;
        if (logs.length > 50) {
          logs = logs.slice(-50);
        }
        const stack_str = Error().stack || "";
        const stacks = (_a = stack_str.replace("Error", "").match(/at (.*) \(.+:\/\/.+:(.+):(.+)\)/g)) == null ? void 0 : _a.map((s) => {
          const match = s.match(/at (.*) \(.+:\/\/.+:(.+):(.+)\)/) || [];
          return [match[1], match[2], match[3]];
        });
        logs = logs.concat({
          type: key.toString(),
          content: msg.join(" "),
          time: Date.now(),
          stack: JSON.stringify([stack_str.split("\n")[0], ...stacks || []])
        });
        latestConsoleLogs = logs;
        persistConsoleLogs();
      };
    }
  });
  const playbackRate$2 = {
    label: "视频倍速",
    tag: "select",
    options: [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 6, 8, 16].map((rate) => [rate.toString(), rate + " x"]),
    defaultValue: "1"
  };
  const volume = {
    label: "音量调节",
    attrs: { type: "range", step: "0.05", min: "0", max: "1" },
    defaultValue: 0,
    onload() {
      createRangeTooltip(this, "0", (val) => `${parseFloat(val) * 100}%`);
    }
  };
  const restudy = {
    label: "复习模式",
    attrs: { title: "已经完成的视频继续学习", type: "checkbox" },
    defaultValue: false
  };
  const definition = {
    label: "清晰度",
    tag: "select",
    defaultValue: "line1bq",
    options: [
      ["line1bq", "流畅"],
      ["line1gq", "高清"]
    ]
  };
  const workNotes$1 = {
    defaultValue: lib.$ui.notes([
      "自动答题前请在 “通用-全局设置” 中设置题库配置。",
      "可以搭配 “通用-在线搜题” 一起使用。",
      "⚠️禁止同时开多个作业/考试页面。"
    ]).outerHTML
  };
  const dropdownStyle = {
    labelClassName: "checkbox-label",
    providerClassName: "checkbox-input",
    enableForAttribute: true,
    onload(el) {
      const checked = this.checked;
      el.classList.toggle("checked", checked);
      this.addEventListener("change", () => {
        el.classList.toggle("checked", this.checked);
      });
    }
  };
  const IFRAME_CONTROL_EVENT = "ocs.iframe-work-control";
  let controlBar;
  let pauseBtn;
  let reloadBtn;
  function buildControlBar() {
    pauseBtn = lib.$ui.button("⏸暂停", { style: { padding: "0px 8px", fontSize: "12px", lineHeight: "20px" } });
    reloadBtn = lib.$ui.button("🔃重新答题", { style: { padding: "0px 8px", fontSize: "12px", lineHeight: "20px" } });
    pauseBtn.onclick = () => {
      lib.cors.emit(IFRAME_CONTROL_EVENT, [(pauseBtn == null ? void 0 : pauseBtn.dataset.paused) === "true" ? "continuate" : "stop"]);
    };
    reloadBtn.onclick = () => {
      lib.cors.emit(IFRAME_CONTROL_EVENT, ["reload"]);
    };
    const icon = lib.h("span", { className: "ocs-iframe-bar-tip" }, [
      lib.h("span", {
        innerHTML: logoSvg,
        style: { display: "inline-flex", alignItems: "center" }
      }),
      lib.h("div", { className: "tip-content" }, [
        lib.h("div", { style: { fontWeight: "bold", marginBottom: "4px" } }, "OCS 答题操作面板"),
        lib.h("div", "当前页面由 OCS 网课助手自动答题中，可进行以下操作："),
        lib.h("div", "⏸暂停/▶️继续：暂停或恢复自动答题"),
        lib.h("div", "🔃重新答题：刷新页面，重新开始自动答题")
      ])
    ]);
    return lib.h(
      "div",
      {
        style: {
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: "999999",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 10px",
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)"
        }
      },
      [
        lib.h("style", {
          textContent: [
            ".ocs-iframe-bar-tip{position:relative;display:inline-flex;align-items:center;flex-shrink:0;cursor:help;}",
            ".ocs-iframe-bar-tip .tip-content{display:none;position:absolute;top:calc(100% + 8px);left:0;width:230px;padding:8px 10px;background:#303133;color:#fff;font-size:12px;line-height:1.7;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.2);z-index:1;}",
            ".ocs-iframe-bar-tip:hover .tip-content{display:block;}"
          ].join("\n")
        }),
        icon,
        pauseBtn,
        reloadBtn
      ]
    );
  }
  const IframeControlBar = {
    render: lib.cors.defineTopFunction((barState) => {
      const root2 = lib.$elements.root;
      if (!root2) {
        return;
      }
      if (!(controlBar == null ? void 0 : controlBar.isConnected)) {
        controlBar = buildControlBar();
        root2.append(controlBar);
      }
      if (pauseBtn) {
        pauseBtn.dataset.paused = String(barState.paused);
        pauseBtn.value = barState.paused ? "▶️继续" : "⏸️暂停";
        pauseBtn.disabled = barState.done;
      }
    }),
    remove: lib.cors.defineTopFunction(() => {
      controlBar == null ? void 0 : controlBar.remove();
      controlBar = void 0;
      pauseBtn = void 0;
      reloadBtn = void 0;
    })
  };
  function createIframeControlSession(options) {
    if (!options.enabled || self === top) {
      return void 0;
    }
    let stopMessage;
    lib.cors.on(IFRAME_CONTROL_EVENT, (args) => {
      var _a;
      const action = args[0];
      if (action === "reload") {
        location.reload();
        return;
      }
      options.paused.value = action === "stop";
      (_a = options.workerProvider()) == null ? void 0 : _a.emit(action);
      if (options.paused.value) {
        stopMessage = lib.$message.warn({ duration: 0, content: "暂停中..." });
      } else {
        stopMessage == null ? void 0 : stopMessage.remove();
      }
      IframeControlBar.render({ paused: options.paused.value, done: false });
    });
    return {
      activate: () => {
        IframeControlBar.render({ paused: options.paused.value, done: false });
      },
      finish: () => {
        IframeControlBar.render({ paused: false, done: true });
      },
      dispose: () => {
        stopMessage == null ? void 0 : stopMessage.remove();
        IframeControlBar.remove();
      }
    };
  }
  function isNodeEnv$1() {
    var _a;
    return typeof process !== "undefined" && !!((_a = process.versions) == null ? void 0 : _a.node) && globalThis.GM_xmlhttpRequest === void 0;
  }
  const PNG_SIG = [137, 80, 78, 71, 13, 10, 26, 10];
  function dataUrlToBytes(dataUrl) {
    const m = dataUrl.match(/^data:[^;,]+.*?;base64,(.+)$/);
    if (!m)
      return void 0;
    if (typeof Buffer !== "undefined") {
      return new Uint8Array(Buffer.from(m[1], "base64"));
    }
    const bin = atob(m[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++)
      bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  function bytesToDataUrl(bytes) {
    let b64;
    if (typeof Buffer !== "undefined") {
      b64 = Buffer.from(bytes).toString("base64");
    } else {
      let bin = "";
      const chunk = 32768;
      for (let i = 0; i < bytes.length; i += chunk) {
        bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
      }
      b64 = btoa(bin);
    }
    return `data:image/png;base64,${b64}`;
  }
  function readUint32BE(bytes, off) {
    return bytes[off] * 16777216 + (bytes[off + 1] << 16 | bytes[off + 2] << 8 | bytes[off + 3]) >>> 0;
  }
  function concatUint8(arrs) {
    let len = 0;
    for (const a of arrs)
      len += a.length;
    const out = new Uint8Array(len);
    let o = 0;
    for (const a of arrs) {
      out.set(a, o);
      o += a.length;
    }
    return out;
  }
  const CRC_TABLE = (() => {
    const table = new Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      }
      table[n] = c >>> 0;
    }
    return table;
  })();
  function crc32(bytes) {
    let crc = 4294967295;
    for (let i = 0; i < bytes.length; i++) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 255] ^ crc >>> 8;
    }
    return (crc ^ 4294967295) >>> 0;
  }
  function getZlib() {
    try {
      const r = typeof require !== "undefined" ? require : null;
      if (!r)
        return null;
      const name = "zlib";
      return r(name);
    } catch {
      return null;
    }
  }
  function zlibInflate(data) {
    const zlib = getZlib();
    if (!zlib)
      throw new Error("zlib 不可用");
    const buf = zlib.inflateSync(Buffer.from(data));
    return new Uint8Array(buf);
  }
  function zlibDeflate(data) {
    const zlib = getZlib();
    if (!zlib)
      throw new Error("zlib 不可用");
    const buf = zlib.deflateSync(Buffer.from(data));
    return new Uint8Array(buf);
  }
  function getImageSize(dataUrl) {
    const bytes = dataUrlToBytes(dataUrl);
    if (!bytes || bytes.length < 26)
      return void 0;
    for (let i = 0; i < 8; i++)
      if (bytes[i] !== PNG_SIG[i])
        return void 0;
    const width = readUint32BE(bytes, 16);
    const height = readUint32BE(bytes, 20);
    const bitDepth = bytes[24];
    const colorType = bytes[25];
    const channels = colorType === 2 ? 3 : colorType === 6 ? 4 : colorType === 4 ? 2 : colorType === 0 ? 1 : 0;
    if (channels === 0)
      return void 0;
    if (bitDepth !== 8)
      return void 0;
    return { width, height, bitDepth, colorType, channels };
  }
  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc)
      return a;
    if (pb <= pc)
      return b;
    return c;
  }
  function unfilterRow(filter, cur, prev, bpp) {
    const n = cur.length;
    switch (filter) {
      case 0:
        return;
      case 1:
        for (let x = bpp; x < n; x++)
          cur[x] = cur[x] + cur[x - bpp] & 255;
        return;
      case 2:
        for (let x = 0; x < n; x++)
          cur[x] = cur[x] + prev[x] & 255;
        return;
      case 3:
        for (let x = 0; x < n; x++) {
          const a = x >= bpp ? cur[x - bpp] : 0;
          const b = prev[x];
          cur[x] = cur[x] + Math.floor((a + b) / 2) & 255;
        }
        return;
      case 4:
        for (let x = 0; x < n; x++) {
          const a = x >= bpp ? cur[x - bpp] : 0;
          const b = prev[x];
          const c = x >= bpp ? prev[x - bpp] : 0;
          cur[x] = cur[x] + paeth(a, b, c) & 255;
        }
    }
  }
  function decodePng(bytes, info) {
    const idatChunks = [];
    let off = 8;
    while (off + 8 <= bytes.length) {
      const len = readUint32BE(bytes, off);
      const type = String.fromCharCode(bytes[off + 4], bytes[off + 5], bytes[off + 6], bytes[off + 7]);
      if (type === "IDAT") {
        idatChunks.push(bytes.subarray(off + 8, off + 8 + len));
      } else if (type === "IEND")
        break;
      off += 12 + len;
    }
    if (idatChunks.length === 0)
      return void 0;
    const idat = concatUint8(idatChunks);
    let inflated;
    try {
      inflated = zlibInflate(idat);
    } catch {
      return void 0;
    }
    const { width, height, channels } = info;
    const bpp = channels;
    const stride = width * bpp;
    const out = new Uint8Array(height * stride);
    let prev = new Uint8Array(stride);
    let src2 = 0;
    for (let y = 0; y < height; y++) {
      if (src2 + 1 + stride > inflated.length)
        break;
      const filter = inflated[src2++];
      const cur = out.subarray(y * stride, (y + 1) * stride);
      for (let x = 0; x < stride; x++)
        cur[x] = inflated[src2 + x];
      src2 += stride;
      unfilterRow(filter, cur, prev, bpp);
      prev = cur;
    }
    return out;
  }
  function resampleNearest(pixels, width, height, channels, scale) {
    const newW = width * scale;
    const newH = height * scale;
    const out = new Uint8Array(newH * newW * channels);
    const inStride = width * channels;
    const outStride = newW * channels;
    for (let y = 0; y < newH; y++) {
      const sy = Math.floor(y / scale);
      for (let x = 0; x < newW; x++) {
        const sx = Math.floor(x / scale);
        const inOff = sy * inStride + sx * channels;
        const outOff = y * outStride + x * channels;
        for (let c = 0; c < channels; c++)
          out[outOff + c] = pixels[inOff + c];
      }
    }
    return { pixels: out, width: newW, height: newH };
  }
  function makeChunk(type, data) {
    const chunk = new Uint8Array(4 + 4 + data.length + 4);
    const dv = new DataView(chunk.buffer);
    dv.setUint32(0, data.length);
    for (let i = 0; i < 4; i++)
      chunk[4 + i] = type.charCodeAt(i);
    chunk.set(data, 8);
    const crc = crc32(chunk.subarray(4, 8 + data.length));
    dv.setUint32(8 + data.length, crc);
    return chunk;
  }
  function encodePng(width, height, channels, pixels) {
    const bpp = channels;
    const stride = width * bpp;
    const raw = new Uint8Array(height * (1 + stride));
    let o = 0;
    for (let y = 0; y < height; y++) {
      raw[o++] = 0;
      for (let x = 0; x < stride; x++)
        raw[o++] = pixels[y * stride + x];
    }
    let compressed;
    try {
      compressed = zlibDeflate(raw);
    } catch {
      return void 0;
    }
    const sig = new Uint8Array(PNG_SIG);
    const ihdr = new Uint8Array(13);
    const dv = new DataView(ihdr.buffer);
    dv.setUint32(0, width);
    dv.setUint32(4, height);
    ihdr[8] = 8;
    ihdr[9] = channels === 4 ? 6 : channels === 3 ? 2 : channels === 2 ? 4 : 0;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;
    return concatUint8([
      sig,
      makeChunk("IHDR", ihdr),
      makeChunk("IDAT", compressed),
      makeChunk("IEND", new Uint8Array(0))
    ]);
  }
  function upscalePngViaCodec(dataUrl, minDim) {
    const bytes = dataUrlToBytes(dataUrl);
    const info = getImageSize(dataUrl);
    if (!bytes || !info)
      return dataUrl;
    if (info.width >= minDim && info.height >= minDim)
      return dataUrl;
    const decoded = decodePng(bytes, info);
    if (!decoded)
      return dataUrl;
    const scale = Math.ceil(minDim / Math.min(info.width, info.height));
    const { pixels, width, height } = resampleNearest(decoded, info.width, info.height, info.channels, scale);
    const encoded = encodePng(width, height, info.channels, pixels);
    if (!encoded)
      return dataUrl;
    return bytesToDataUrl(encoded);
  }
  async function upscalePngViaCanvas(dataUrl, minDim) {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = dataUrl;
    });
    const w = img.naturalWidth || img.width;
    const h2 = img.naturalHeight || img.height;
    if (w >= minDim && h2 >= minDim)
      return dataUrl;
    const scale = Math.ceil(minDim / Math.min(w, h2));
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h2 * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return dataUrl;
    ctx.drawImage(img, 0, 0, w * scale, h2 * scale);
    return canvas.toDataURL("image/png");
  }
  async function upscalePngDataUrl(dataUrl, minDim) {
    if (isNodeEnv$1())
      return upscalePngViaCodec(dataUrl, minDim);
    return upscalePngViaCanvas(dataUrl, minDim);
  }
  function isNodeEnv() {
    var _a;
    return typeof process !== "undefined" && !!((_a = process.versions) == null ? void 0 : _a.node) && globalThis.GM_xmlhttpRequest === void 0;
  }
  async function nodeFetchToBase64(url) {
    const fet = require("node-fetch").default || require("node-fetch");
    let referer = "";
    try {
      referer = new URL(url).origin + "/";
    } catch {
    }
    const res = await fet(url, {
      headers: {
        Referer: referer,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!res.ok) {
      throw new Error(`图片下载失败 ${res.status}`);
    }
    const buffer = res.buffer ? res.buffer() : res.arrayBuffer();
    const buf = buffer instanceof Promise ? await buffer : buffer;
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${buf.toString("base64")}`;
  }
  const IMAGE_BASE64_CACHE_MAX = 200;
  const imageBase64Cache = /* @__PURE__ */ new Map();
  function imageToBase64(source) {
    const url = typeof source === "string" ? source : source.src;
    if (url && !url.startsWith("data:")) {
      const cached = imageBase64Cache.get(url);
      if (cached) {
        imageBase64Cache.delete(url);
        imageBase64Cache.set(url, cached);
        return Promise.resolve(cached);
      }
      return convertImageToBase64(source).then((b64) => {
        if (imageBase64Cache.size >= IMAGE_BASE64_CACHE_MAX) {
          imageBase64Cache.delete(imageBase64Cache.keys().next().value);
        }
        imageBase64Cache.set(url, b64);
        return b64;
      });
    }
    return convertImageToBase64(source);
  }
  function convertImageToBase64(source) {
    return new Promise((resolve, reject) => {
      if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) {
        if (source.src.startsWith("data:")) {
          resolve(source.src);
          return;
        }
        try {
          const canvas = document.createElement("canvas");
          canvas.width = source.naturalWidth;
          canvas.height = source.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(source, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
          return;
        } catch {
        }
      }
      const url = typeof source === "string" ? source : source.src;
      if (url.startsWith("data:")) {
        resolve(url);
        return;
      }
      if (isNodeEnv()) {
        nodeFetchToBase64(url).then(resolve, reject);
        return;
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch {
          gmXmlHttpRequestFallback(url, resolve, reject);
        }
      };
      img.onerror = () => {
        gmXmlHttpRequestFallback(url, resolve, reject);
      };
      img.src = url;
    });
  }
  function gmXmlHttpRequestFallback(url, resolve, reject) {
    if (typeof GM_xmlhttpRequest === "undefined") {
      reject(new Error("图片转 base64 失败"));
      return;
    }
    GM_xmlhttpRequest({
      url,
      method: "GET",
      responseType: "blob",
      onload: (response) => {
        const blob = response.response;
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      },
      onerror: reject
    });
  }
  function normalizeToPngDataUrl(dataUrl) {
    const m = dataUrl.match(/^data:[^;,]+.*?;base64,(.+)$/);
    return `data:image/png;base64,${m ? m[1] : dataUrl}`;
  }
  const MIN_IMAGE_DIMENSION = 14;
  const IMAGE_URL_REGEX = /https?:\/\/[^\s一-鿿＀-￯]+?\.(?:png|jpe?g|gif|bmp|webp|svg)(?:\?[^\s一-鿿＀-￯]*)?/gi;
  async function createImageSuggestion(title, options, titleImages, optionImages) {
    const titleUrls = titleImages && titleImages.length ? titleImages.slice() : title.match(IMAGE_URL_REGEX) || [];
    const optionUrls = optionImages && optionImages.length ? optionImages.slice() : (options == null ? void 0 : options.match(IMAGE_URL_REGEX)) || [];
    if (titleUrls.length === 0 && optionUrls.length === 0)
      return void 0;
    const allUrls = [];
    const seen = /* @__PURE__ */ new Set();
    for (const url of [...titleUrls, ...optionUrls]) {
      if (!seen.has(url)) {
        seen.add(url);
        allUrls.push(url);
      }
    }
    const base64Map = /* @__PURE__ */ new Map();
    await Promise.all(
      allUrls.map(async (url) => {
        try {
          const base64 = await imageToBase64(url);
          base64Map.set(url, base64);
        } catch {
        }
      })
    );
    if (base64Map.size === 0)
      return void 0;
    const images = [];
    const urls = [];
    const placeholderMap = /* @__PURE__ */ new Map();
    for (const url of allUrls) {
      const base64 = base64Map.get(url);
      if (!base64)
        continue;
      let normalized = normalizeToPngDataUrl(base64);
      const size = getImageSize(normalized);
      if (size && (size.width < MIN_IMAGE_DIMENSION || size.height < MIN_IMAGE_DIMENSION)) {
        try {
          normalized = await upscalePngDataUrl(normalized, MIN_IMAGE_DIMENSION);
        } catch (e) {
          console.warn(`[imageOptimize] 图片 ${size.width}x${size.height} 放大失败，已跳过：${url}（${e == null ? void 0 : e.message}）`);
          continue;
        }
      }
      placeholderMap.set(url, ` [图片${images.length + 1}] `);
      images.push(normalized);
      urls.push(url);
    }
    if (images.length === 0)
      return void 0;
    let suggestionTitle = title;
    for (const [url, placeholder] of placeholderMap) {
      suggestionTitle = suggestionTitle.split(url).join(placeholder);
    }
    let suggestionOptions;
    if (options) {
      const hasOptionImages = optionUrls.some((url) => base64Map.has(url));
      if (hasOptionImages) {
        suggestionOptions = options;
        for (const [url, placeholder] of placeholderMap) {
          suggestionOptions = suggestionOptions.split(url).join(placeholder);
        }
      }
    }
    return {
      images,
      urls,
      suggestion_title: suggestionTitle,
      ...suggestionOptions !== void 0 ? { suggestion_options: suggestionOptions } : {}
    };
  }
  function dedupeLines(str) {
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const line of str.split("\n")) {
      if (!seen.has(line)) {
        seen.add(line);
        result.push(line);
      }
    }
    return result.join("\n");
  }
  async function buildAnswererEnv(params) {
    var _a;
    const rawOptions = Array.isArray(params.options) ? params.options.filter((o) => o != null && o !== "").join("\n") : (_a = params.options) != null ? _a : "";
    const options = dedupeLines(rawOptions);
    const env = {
      type: params.type || "unknown",
      title: params.title,
      options
    };
    let imageUrls = [];
    if (params.enableImageOptimize) {
      const suggestion = await createImageSuggestion(params.title, options, params.titleImages, params.optionsImages);
      if (suggestion) {
        env.images = suggestion.images;
        imageUrls = suggestion.urls;
        env.suggestion_title = suggestion.suggestion_title;
        if (suggestion.suggestion_options !== void 0) {
          env.suggestion_options = dedupeLines(suggestion.suggestion_options);
        }
      }
    }
    return { env, imageUrls };
  }
  const IMAGE_OPTIMIZE_PLACEHOLDERS = [`\${images}`, `\${suggestion_title}`, `\${suggestion_options}`];
  const IMAGE_ENV_REF_PATTERN = /(^|[^\w$])(images|suggestion_title|suggestion_options)(?![\w$])/;
  function isAnswererWrapperSupportImageOptimize(wrapper) {
    if (!wrapper || String(wrapper.method || "get").toLowerCase() !== "post") {
      return false;
    }
    for (const value of Object.values(wrapper.data || {})) {
      if (typeof value === "string") {
        if (IMAGE_OPTIMIZE_PLACEHOLDERS.some((placeholder) => value.includes(placeholder))) {
          return true;
        }
      } else if (value && typeof value === "object" && typeof value.handler === "string") {
        if (IMAGE_ENV_REF_PATTERN.test(value.handler)) {
          return true;
        }
      }
    }
    return false;
  }
  function isAnswererWrappersSupportImageOptimize(wrappers) {
    return wrappers.some(isAnswererWrapperSupportImageOptimize);
  }
  function createAnswererWrappersSignature(wrappers) {
    const content = JSON.stringify(wrappers);
    let hash = 2166136261;
    for (let i = 0; i < content.length; i++) {
      hash ^= content.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }
  const commonWorkRenderBindings = /* @__PURE__ */ new WeakMap();
  function bindCommonWorkRender(script2, render2) {
    const binding = commonWorkRenderBindings.get(script2);
    if (binding) {
      binding.current = render2;
      return;
    }
    const created = { current: render2 };
    commonWorkRenderBindings.set(script2, created);
    script2.on("render", () => created.current());
  }
  function commonWork(options) {
    var _a;
    if (options.mount_script)
      BackgroundProject.scripts.render.methods.pin(options.mount_script);
    CommonProject.scripts.settings.on("answerer-wrapper-change", async (curr, prev) => {
      $console.log("answerer-wrapper-change curr.length", curr.length);
      if (curr.length > 0) {
        state2.checkFailed = false;
        state2.startBtnPressed = false;
        await closeAnswerWrapperEmptyWarning();
        start2();
      }
    });
    let workOptions = CommonProject.scripts.settings.methods.getWorkOptions();
    const state2 = {
      worker: void 0,
      startBtnPressed: false,
      checkFailed: false,
      running: false,
      controlPanel: null,
      paused: false,
      resultPanel: null
    };
    const pausedAccessor = {
      get value() {
        return state2.paused;
      },
      set value(v) {
        state2.paused = v;
      }
    };
    const iframeControl = createIframeControlSession({
      enabled: options.iframe_control,
      workerProvider: () => state2.worker,
      paused: pausedAccessor
    });
    const createWorkControlPanel = () => {
      const { controlBtn, restartBtn, startBtn } = createWorkerControl({
        workerProvider: () => state2.worker,
        paused: pausedAccessor,
        onStart: async () => {
          state2.startBtnPressed = true;
          if (checkMessage instanceof lib.MessageElement) {
            checkMessage.remove();
          }
          await closeAnswerWrapperEmptyWarning();
          start2();
        },
        onRestart: async () => {
          var _a2, _b;
          (_a2 = state2.worker) == null ? void 0 : _a2.emit("close");
          state2.running = false;
          await ((_b = options.onRestart) == null ? void 0 : _b.call(options));
          start2();
        }
      });
      startBtn.style.flex = "1";
      startBtn.style.padding = "4px";
      restartBtn.style.flex = "1";
      restartBtn.style.padding = "4px";
      controlBtn.style.flex = "1";
      controlBtn.style.padding = "4px";
      const container2 = lib.h(
        "div",
        { className: "work-control-panel" },
        state2.running ? [controlBtn, restartBtn] : [startBtn]
      );
      state2.controlPanel = container2;
      return { container: container2, startBtn, restartBtn, controlBtn };
    };
    const renderPanelBody = () => {
      var _a2, _b, _c, _d;
      const gotoSettingsBtn = lib.$ui.button("👉 前往设置题库配置", {
        className: "base-style-button",
        style: { flex: "1", padding: "4px" }
      });
      gotoSettingsBtn.onclick = () => {
        BackgroundProject.scripts.render.methods.pin(CommonProject.scripts.settings);
      };
      if (!((_a2 = state2.resultPanel) == null ? void 0 : _a2.isConnected)) {
        state2.resultPanel = CommonProject.scripts.workResults.methods.createWorkResultsPanel();
      }
      (_d = (_c = (_b = options.mount_script) == null ? void 0 : _b.panel) == null ? void 0 : _c.body) == null ? void 0 : _d.replaceChildren(
        lib.h(
          "div",
          { style: { marginTop: "12px" } },
          state2.checkFailed ? [lib.h("hr"), lib.h("div", { style: { display: "flex" } }, [gotoSettingsBtn])] : [
            lib.h("hr"),
            state2.controlPanel || createWorkControlPanel().container,
            state2.resultPanel
          ]
        )
      );
    };
    if (options.mount_script)
      bindCommonWorkRender(options.mount_script, renderPanelBody);
    let checkMessage;
    if (iframeControl) {
      if (workOptions.answererWrappers.length === 0) {
        state2.checkFailed = true;
        answerWrapperEmptyWarning(0);
      } else {
        const delay = (_a = options.start_delay_seconds) != null ? _a : 5;
        lib.$message.info(`将在 ${delay} 秒后自动答题`);
        setTimeout(() => {
          if (state2.startBtnPressed === false) {
            start2();
          }
        }, delay * 1e3);
      }
    } else {
      checkMessage = workPreCheckMessage({
        onrun: () => state2.startBtnPressed === false && start2(),
        onclose: (_, closedMsg) => checkMessage = closedMsg,
        onNoAnswererWrappers: () => {
          state2.checkFailed = true;
        },
        ...workOptions,
        start_delay_seconds: options.start_delay_seconds
      });
    }
    const start2 = async () => {
      var _a2, _b;
      if (state2.running) {
        return;
      }
      if (state2.checkFailed) {
        return answerWrapperEmptyWarning(0);
      }
      workOptions = CommonProject.scripts.settings.methods.getWorkOptions();
      await ((_a2 = options.beforeRunning) == null ? void 0 : _a2.call(options));
      state2.running = true;
      state2.worker = options.workerProvider(workOptions);
      if (state2.worker) {
        (_b = options.onWorkerCreated) == null ? void 0 : _b.call(options, state2.worker);
      }
      const { controlBtn } = createWorkControlPanel();
      renderPanelBody();
      iframeControl == null ? void 0 : iframeControl.activate();
      if (state2.worker) {
        const emitState = CommonEvents.emitWorkerStateChange;
        emitState("start");
        state2.worker.on("stop", () => emitState("stop"));
        state2.worker.on("continuate", () => emitState("start"));
        state2.worker.once("close", () => {
          emitState("close");
          iframeControl == null ? void 0 : iframeControl.dispose();
        });
        state2.worker.once("done", () => {
          state2.running = false;
          state2.controlPanel = null;
          state2.paused = false;
          controlBtn.disabled = true;
          emitState("done");
          iframeControl == null ? void 0 : iframeControl.finish();
        });
      }
    };
  }
  function dynamicWorkTips(worker) {
    const msg = lib.$message.warn({
      content: "⚠️ 正在逐题自动答题，过程中请勿手动切换题目，防止答题与搜索结果错乱。",
      duration: 0
    });
    worker.once("done", () => msg == null ? void 0 : msg.remove());
    worker.once("close", () => msg == null ? void 0 : msg.remove());
  }
  function createWorkerControl(options) {
    var _a;
    let stopMessage;
    const paused = (_a = options.paused) != null ? _a : { value: false };
    const startBtn = lib.$ui.button("▶️开始答题");
    const restartBtn = lib.$ui.button("🔃重新答题");
    const controlBtn = lib.$ui.button(paused.value ? "▶️继续" : "⏸暂停");
    startBtn.onclick = () => {
      startBtn.remove();
      options.onStart();
    };
    restartBtn.onclick = () => {
      stopMessage == null ? void 0 : stopMessage.remove();
      paused.value = false;
      options.onRestart();
    };
    controlBtn.onclick = () => {
      var _a2;
      paused.value = !paused.value;
      const worker = options.workerProvider();
      (_a2 = worker == null ? void 0 : worker.emit) == null ? void 0 : _a2.call(worker, paused.value ? "stop" : "continuate");
      controlBtn.value = paused.value ? "▶️继续" : "⏸️暂停";
      if (paused.value) {
        stopMessage = lib.$message.warn({ duration: 0, content: "暂停中..." });
      } else {
        stopMessage == null ? void 0 : stopMessage.remove();
      }
    };
    return { startBtn, restartBtn, controlBtn };
  }
  const MATH_SYMBOL_MAP = {
    "′": "'",
    "″": "''",
    "⁡": "",
    "−": "-",
    "⋅": "*",
    "×": "*",
    "÷": "/"
  };
  const MATH_SYMBOL_RE = new RegExp(`[${Object.keys(MATH_SYMBOL_MAP).join("")}]`, "g");
  function extractMathJaxText(container2) {
    const math = container2.querySelector('g[data-mml-node="math"]');
    return math ? mmlNodeText(math) : "";
  }
  function mmlNodeText(node) {
    const type = node.getAttribute("data-mml-node");
    const kids = Array.from(node.children).filter((c) => c.hasAttribute("data-mml-node"));
    const at = (i) => kids[i] ? mmlNodeText(kids[i]) : "";
    switch (type) {
      case "mi":
      case "mo":
      case "mn":
      case "mtext": {
        const chars = [];
        node.querySelectorAll("path[data-c],use[data-c]").forEach((p) => {
          chars.push(String.fromCodePoint(parseInt(p.getAttribute("data-c") || "0", 16)));
        });
        return chars.join("").normalize("NFKC").replace(MATH_SYMBOL_RE, (c) => {
          var _a;
          return (_a = MATH_SYMBOL_MAP[c]) != null ? _a : c;
        });
      }
      case "msup":
        return `${at(0)}^{${at(1)}}`;
      case "msub":
        return `${at(0)}_{${at(1)}}`;
      case "msubsup":
        return `${at(0)}_{${at(1)}}^{${at(2)}}`;
      case "mfrac":
        return `(${at(0)})/(${at(1)})`;
      case "msqrt":
        return `√(${kids.map(mmlNodeText).join("")})`;
      case "mroot":
        return `√[${at(1)}](${at(0)})`;
      case "munder":
        return `${at(0)}_{${at(1)}}`;
      case "mover":
        return `${at(0)}^{${at(1)}}`;
      case "munderover":
        return `${at(0)}_{${at(1)}}^{${at(2)}}`;
      case "mspace":
        return " ";
      default:
        return kids.map(mmlNodeText).join("");
    }
  }
  function extractTextWithImages(root2, opts) {
    const parts = [];
    const images = [];
    const walk = (node) => {
      var _a;
      if (node.nodeType === Node.TEXT_NODE) {
        parts.push(node.textContent || "");
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE)
        return;
      const el = node;
      if (el.tagName === "IMG") {
        const img = el;
        if ((opts == null ? void 0 : opts.imgFilter) && !opts.imgFilter(img))
          return;
        const url = img.src;
        if (url) {
          parts.push(` ${url} `);
          images.push(url);
        }
        return;
      }
      if (el.tagName === "MJX-CONTAINER") {
        const formula = extractMathJaxText(el);
        if (formula)
          parts.push(` ${formula} `);
        return;
      }
      if (el.tagName === "BR") {
        parts.push("\n");
        return;
      }
      try {
        const view = (_a = el.ownerDocument) == null ? void 0 : _a.defaultView;
        if (view && el.isConnected && view.getComputedStyle(el).display === "none")
          return;
      } catch {
      }
      for (const child of Array.from(el.childNodes))
        walk(child);
    };
    walk(root2);
    return { text: parts.join(""), images };
  }
  function simplifyWorkResult(wr, titleTransform, index = 0) {
    var _a, _b, _c, _d, _e, _f;
    const question = (titleTransform == null ? void 0 : titleTransform(((_a = wr.ctx) == null ? void 0 : _a.elements.title) || [], index)) || ((_c = (_b = wr.ctx) == null ? void 0 : _b.elements.title) == null ? void 0 : _c.map((e) => e == null ? void 0 : e.innerText.trim()).filter(Boolean).join("<br>")) || "";
    return {
      requested: wr.requested,
      searching: wr.searching,
      resolved: wr.resolved,
      error: wr.error,
      type: (_d = wr.ctx) == null ? void 0 : _d.type,
      question,
      finish: (_e = wr.result) == null ? void 0 : _e.finish,
      searchInfos: ((_f = wr.ctx) == null ? void 0 : _f.searchInfos.map((sr) => ({
        error: sr.error,
        name: sr.name,
        homepage: sr.homepage,
        results: sr.results.map((ans) => [ans.question, ans.answer, ans.extra_data || {}])
      }))) || []
    };
  }
  function updateDynamicResult(current, titleTransform) {
    return CommonProject.scripts.workResults.methods.append(simplifyWorkResult(current, titleTransform));
  }
  function removeRedundantWords(str, words) {
    for (const word of words.map((w) => w.trim())) {
      str = str.replace(word, "");
    }
    return str;
  }
  let answererWrapperUnsetMessage;
  const answerWrapperEmptyWarning = lib.cors.defineTopFunction((duration) => {
    const setting = lib.h("button", { className: "base-style-button-secondary" }, "通用-全局设置");
    setting.onclick = () => {
      BackgroundProject.scripts.render.methods.pin(CommonProject.scripts.settings);
      setTimeout(() => {
        var _a, _b;
        (_b = (_a = lib.$elements.root) == null ? void 0 : _a.querySelector('[value="点击配置"]')) == null ? void 0 : _b.click();
      }, 500);
    };
    answererWrapperUnsetMessage == null ? void 0 : answererWrapperUnsetMessage.remove();
    answererWrapperUnsetMessage = lib.$message.warn({
      content: lib.h("span", {}, ["你还没设置题库，无法自动答题，请切换到 ", setting, " 页面进行配置。"]),
      duration
    });
  });
  const closeAnswerWrapperEmptyWarning = lib.cors.defineTopFunction(() => {
    console.log(answererWrapperUnsetMessage);
    answererWrapperUnsetMessage == null ? void 0 : answererWrapperUnsetMessage.remove();
    answererWrapperUnsetMessage = void 0;
  });
  function createCommonAnswerer(options) {
    const normalize = (v) => {
      if (v == null)
        return { text: "" };
      return typeof v === "string" ? { text: v } : v;
    };
    const QUESTION_IMAGE_REGEX = /https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|bmp|webp|svg)/i;
    let imageOptimizeOffWarned = false;
    let imageConvertFailWarned = false;
    return async (elements2, ctx) => {
      const titleResult = normalize(options.titleTransform(elements2, ctx));
      const title = titleResult.text;
      if (!title) {
        throw new Error("题目为空，请查看题目是否为空，或者忽略此题");
      }
      const titleImages = titleResult.images;
      return await BackgroundProject.scripts.data.methods.searchAnswerInCaches(title, async () => {
        var _a, _b, _c, _d, _e;
        await $.sleep(((_a = options.period) != null ? _a : 3) * 1e3);
        const optResult = normalize(
          options.optionsTransform ? options.optionsTransform(elements2, ctx) : ((_b = ctx.elements.options) != null ? _b : []).filter(Boolean).map((o) => o.innerText).join("\n")
        );
        const questionHasImages = ((_c = titleImages == null ? void 0 : titleImages.length) != null ? _c : 0) + ((_e = (_d = optResult.images) == null ? void 0 : _d.length) != null ? _e : 0) > 0 || QUESTION_IMAGE_REGEX.test(title) || QUESTION_IMAGE_REGEX.test(optResult.text);
        if (questionHasImages && !CommonProject.scripts.settings.cfg.imageOptimize && !imageOptimizeOffWarned) {
          imageOptimizeOffWarned = true;
          lib.$message.warn({
            content: "检测到题目包含图片，但未开启「图片题优化」（通用-全局设置-高级设置中开启），图片题将无法搜题。",
            duration: 10
          });
        }
        const { env, imageUrls } = await buildAnswererEnv({
          type: ctx.type,
          title,
          options: optResult.text,
          titleImages,
          optionsImages: optResult.images,
          enableImageOptimize: CommonProject.scripts.settings.cfg.imageOptimize
        });
        if (questionHasImages && CommonProject.scripts.settings.cfg.imageOptimize && imageUrls.length === 0 && !imageConvertFailWarned) {
          imageConvertFailWarned = true;
          lib.$message.warn({
            content: "题目图片下载或转换失败（可能跨域受限），本题将按普通题目搜索，图片题可能无法匹配。",
            duration: 10
          });
        }
        const searchInfos = await defaultAnswerWrapperHandler(options.answererWrappers, env);
        if (imageUrls.length) {
          for (const info of searchInfos) {
            for (const res of info.results) {
              if (res.answer && res.answer.includes("[图片")) {
                res.answer = res.answer.replace(/\[图片(\d+)\]/g, (m, n) => {
                  var _a2;
                  return (_a2 = imageUrls[Number(n) - 1]) != null ? _a2 : m;
                });
              }
            }
          }
        }
        return searchInfos;
      });
    };
  }
  function workPreCheckMessage(options) {
    var _a;
    const { onrun, onNoAnswererWrappers, onclose, ...opts } = options;
    if (opts.answererWrappers.length === 0) {
      onNoAnswererWrappers == null ? void 0 : onNoAnswererWrappers(opts);
      return answerWrapperEmptyWarning(0);
    } else {
      options.start_delay_seconds = (_a = options.start_delay_seconds) != null ? _a : 5;
      return lib.$message.info({
        duration: options.start_delay_seconds,
        content: lib.h("span", [
          `将在 ${options.start_delay_seconds} 秒后自动答题，`,
          lib.$ui.preventText({
            name: "点击取消",
            delay: options.start_delay_seconds,
            ondefault: (span) => {
              onrun(opts);
            },
            onprevent(span) {
              const closedMessage = lib.$message.warn({
                content: "已关闭此次的自动答题，请手动开启或者忽略此警告。",
                duration: 0
              });
              if (closedMessage) {
                onclose == null ? void 0 : onclose(opts, closedMessage);
              }
            }
          })
        ])
      });
    }
  }
  const ANSWERER_CONNECT_MESSAGE_TYPE = "ocs-answerer-config";
  const ANSWERER_CONNECT_PROTOCOL_VERSION = 1;
  let provider;
  function setAnswererConfigProvider(p) {
    provider = void 0;
    if (p && p.name && p.connectUrl) {
      try {
        const url = new URL(p.connectUrl);
        if (url.protocol === "https:" || url.protocol === "http:") {
          provider = p;
        }
      } catch {
      }
    }
  }
  function getAnswererConfigProvider() {
    return provider;
  }
  function openAnswererConnect() {
    if (!provider)
      return null;
    const connectUrl = new URL(provider.connectUrl);
    connectUrl.searchParams.set("from", location.origin);
    const width = 980;
    const height = 720;
    const left = Math.max(0, (screen.width - width) / 2);
    const top2 = Math.max(0, (screen.height - height) / 2);
    return window.open(
      connectUrl.toString(),
      "ocs_answerer_connect",
      `width=${width},height=${height},left=${left},top=${top2}`
    );
  }
  function waitForAnswererConfig(win, timeoutMs = 10 * 6e4, isAborted) {
    if (!provider)
      return Promise.reject(new Error("未配置题库获取渠道"));
    const expectedOrigin = new URL(provider.connectUrl).origin;
    return new Promise((resolve, reject) => {
      let finished = false;
      const closeWin = () => {
        try {
          win.close();
        } catch {
        }
      };
      const cleanup = () => {
        finished = true;
        clearTimeout(timer);
        clearInterval(poller);
        window.removeEventListener("message", onMessage);
        window.removeEventListener("pagehide", closeWin);
      };
      const fail = (msg) => {
        if (!finished) {
          cleanup();
          reject(new Error(msg));
        }
      };
      const onMessage = async (e) => {
        if (finished || e.source !== win || e.origin !== expectedOrigin)
          return;
        const d = e.data;
        if (!d || d.type !== ANSWERER_CONNECT_MESSAGE_TYPE || d.version !== ANSWERER_CONNECT_PROTOCOL_VERSION) {
          return;
        }
        try {
          const aws = await AnswerWrapperParser.from(d.config);
          cleanup();
          resolve(aws);
        } catch (err) {
          cleanup();
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      };
      const timer = setTimeout(() => fail("获取题库配置超时，请重试或使用手动配置。"), timeoutMs);
      const poller = setInterval(() => {
        if (win.closed) {
          fail("题库网站窗口已被关闭，请重试或使用手动配置。");
        } else if (isAborted == null ? void 0 : isAborted()) {
          closeWin();
          fail("题库配置弹窗已关闭，获取已取消。");
        }
      }, 1e3);
      window.addEventListener("message", onMessage);
      window.addEventListener("pagehide", closeWin);
    });
  }
  const DANGEROUS_PATTERNS = [
    { pattern: /\beval\b/, feature: "eval", reason: "动态执行任意代码" },
    { pattern: /\bFunction\s*\(/, feature: "Function()", reason: "动态执行任意代码" },
    { pattern: /\bfetch\s*\(/, feature: "fetch", reason: "发起网络请求，可能向外部发送账号数据" },
    { pattern: /\bXMLHttpRequest\b/, feature: "XMLHttpRequest", reason: "发起网络请求，可能向外部发送账号数据" },
    {
      pattern: /\bGM_xmlhttpRequest\b|\bGM\s*\.\s*xmlHttpRequest\b/,
      feature: "GM_xmlhttpRequest",
      reason: "使用脚本管理器权限发起跨域请求，可能向外部发送账号数据"
    },
    {
      pattern: /\bGM_\w+|\bGM\s*\.\s*\w+/,
      feature: "GM API",
      reason: "调用脚本管理器扩展 API（可能读写剪贴板、跨域请求等）"
    },
    {
      pattern: /\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/,
      feature: "本地存储",
      reason: "读写浏览器存储，可能窃取登录凭据"
    },
    { pattern: /\bcookie\b/i, feature: "cookie", reason: "读取 Cookie，可能窃取登录状态" },
    { pattern: /\bsendBeacon\b/, feature: "sendBeacon", reason: "静默向外部服务器发送数据" },
    { pattern: /\bWebSocket\b|\bEventSource\b/, feature: "WebSocket/EventSource", reason: "建立长连接，可持续外传数据" },
    { pattern: /\blocation\b/, feature: "location", reason: "读取或篡改页面地址，可能跳转至钓鱼页面" },
    {
      pattern: /\bwindow\b|\bglobalThis\b|\bunsafeWindow\b|\btop\b|\bparent\b|\bopener\b/,
      feature: "全局对象",
      reason: "访问全局环境，可操控页面与浏览器行为"
    },
    { pattern: /\bdocument\b/, feature: "document", reason: "操作网页内容，可能篡改页面或窃取输入" },
    { pattern: /\bpostMessage\b/, feature: "postMessage", reason: "向其他窗口发送数据" },
    { pattern: /\bimport\s*\(/, feature: "import()", reason: "动态加载并执行外部脚本" },
    { pattern: /\brequire\s*\(/, feature: "require()", reason: "加载外部模块" },
    { pattern: /\.constructor\b|\b__proto__\b/, feature: "原型链访问", reason: "操作原型链，常用于绕过安全检测" },
    {
      pattern: /\bfromCharCode\b|\batob\b|\bunescape\b/,
      feature: "解码函数",
      reason: "解码隐藏内容，常用于混淆恶意代码"
    },
    { pattern: /\bWorker\b/, feature: "Worker", reason: "创建后台线程执行代码" },
    {
      pattern: /\[\s*['"`][^\]'"]*['"`]\s*\+|\+\s*['"`][^\]'"]*['"`]\s*\]/,
      feature: "拼接属性访问",
      reason: "通过字符串拼接隐藏真实调用的功能，常见于混淆代码"
    }
  ];
  function stripCommentsAndStrings(code) {
    const findings = [];
    let stripped = "";
    let i = 0;
    while (i < code.length) {
      const ch = code[i];
      const next2 = code[i + 1];
      if (ch === "/" && next2 === "/") {
        while (i < code.length && code[i] !== "\n")
          i++;
        continue;
      }
      if (ch === "/" && next2 === "*") {
        i += 2;
        while (i < code.length && !(code[i] === "*" && code[i + 1] === "/"))
          i++;
        i += 2;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === "`") {
        const quote = ch;
        let str = "";
        i++;
        while (i < code.length && code[i] !== quote) {
          if (code[i] === "\\") {
            str += code[i] + (code[i + 1] || "");
            i += 2;
            continue;
          }
          if (quote !== "`" && code[i] === "\n")
            break;
          str += code[i];
          i++;
        }
        i++;
        if (/\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/.test(str)) {
          findings.push({ where: "", feature: "转义字符", reason: "使用转义字符隐藏真实内容，常见于混淆代码" });
        }
        if (str.length > 100 && /^[A-Za-z0-9+/=\s]+$/.test(str)) {
          findings.push({ where: "", feature: "超长编码串", reason: "包含超长编码字符串，可能内嵌隐藏代码" });
        }
        if (quote === "`") {
          for (const match of str.matchAll(/\$\{([^{}]*)\}/g)) {
            stripped += " " + match[1] + " ";
          }
        }
        stripped += '""';
        continue;
      }
      stripped += ch;
      i++;
    }
    return { stripped, findings };
  }
  function detectHandlerRisks(code, where = "") {
    const { stripped, findings } = stripCommentsAndStrings(code);
    for (const { pattern, feature, reason } of DANGEROUS_PATTERNS) {
      if (pattern.test(stripped)) {
        findings.push({ where, feature, reason });
      }
    }
    const seen = /* @__PURE__ */ new Set();
    return findings.map((f) => ({ ...f, where })).filter((f) => {
      const key = f.where + "|" + f.feature;
      if (seen.has(key))
        return false;
      seen.add(key);
      return true;
    });
  }
  function scanAnswerWrapperRisks(aw) {
    const findings = [];
    if (typeof aw.handler === "string") {
      findings.push(...detectHandlerRisks(aw.handler, "handler 解析器"));
    }
    if (aw.data && typeof aw.data === "object") {
      for (const key of Object.keys(aw.data)) {
        const field = aw.data[key];
        if (field && typeof field === "object" && typeof field.handler === "string") {
          findings.push(...detectHandlerRisks(field.handler, `data.${key} 字段解析器`));
        }
      }
    }
    return findings;
  }
  function confirmRiskyAnswerWrappers(aws) {
    const riskList = aws.map((aw) => ({ name: aw.name, findings: scanAnswerWrapperRisks(aw) })).filter((item) => item.findings.length > 0);
    if (riskList.length === 0) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      let settled = false;
      const done = (result) => {
        if (!settled) {
          settled = true;
          resolve(result);
        }
      };
      lib.$modal.confirm({
        width: 640,
        maskCloseable: false,
        title: "⚠️ 检测到题库配置中包含可疑代码",
        content: lib.h("div", [
          lib.h("div", { style: { marginBottom: "8px" } }, [
            "题库配置中的解析器（handler）会在答题时以你的登录身份执行。以下题库包含高风险代码特征，可能被用于窃取账号信息、篡改页面或执行其他恶意操作："
          ]),
          ...riskList.map(
            (item) => lib.h(
              "div",
              {
                style: {
                  margin: "8px 0",
                  padding: "8px",
                  border: "1px solid #ffccc7",
                  borderRadius: "4px",
                  background: "#fff2f0"
                }
              },
              [
                lib.h("div", { style: { fontWeight: "bold", marginBottom: "4px" } }, `题库：${item.name}`),
                lib.h(
                  "ul",
                  { style: { margin: "0", paddingLeft: "20px" } },
                  item.findings.map((f) => lib.h("li", `${f.where ? f.where + " - " : ""}${f.feature}：${f.reason}`))
                )
              ]
            )
          ),
          lib.h("div", { style: { marginTop: "8px", color: "#cf1322" } }, [
            "如果你不理解以上内容，或者配置来自陌生人/非官方渠道，请点击「取消」，并从官方渠道重新获取题库配置。"
          ])
        ]),
        confirmButtonText: "我了解风险，仍然使用",
        cancelButtonText: "取消（推荐）",
        onConfirm: () => done(true),
        onCancel: () => done(false),
        onClose: () => done(false)
      });
    });
  }
  const EDGE_WIDTH = 100;
  const ICON_SIZE = 64;
  const SNAP_ANIMATION_MS = 250;
  const EDGE_CLASS = "edge-minimize";
  const SIDE_CLASSES = ["edge-left", "edge-right"];
  const SNAP_ANIM_CLASS = "edge-snapping";
  let snapping = false;
  let headerDragging = false;
  let dropZone;
  function getContainer() {
    var _a, _b;
    return (_b = (_a = lib.$elements.root) == null ? void 0 : _a.querySelector("container-element")) != null ? _b : void 0;
  }
  function updateEdgeMode() {
    const container2 = getContainer();
    if (!container2 || snapping)
      return;
    const render2 = BackgroundProject.scripts.render;
    const clientWidth = document.documentElement.clientWidth;
    const centerX = container2.offsetLeft + container2.offsetWidth / 2;
    const side = render2.cfg.visual !== "minimize" ? void 0 : centerX <= EDGE_WIDTH ? "left" : centerX >= clientWidth - EDGE_WIDTH ? "right" : void 0;
    if (side) {
      const snappedX = side === "left" ? 0 : clientWidth - ICON_SIZE;
      container2.classList.add(EDGE_CLASS);
      container2.classList.remove(...SIDE_CLASSES);
      container2.classList.add(`edge-${side}`);
      if (lib.$elements.tooltipContainer) {
        lib.$elements.tooltipContainer.style.display = "none";
      }
      if (container2.offsetLeft !== snappedX) {
        snapping = true;
        container2.classList.add(SNAP_ANIM_CLASS);
        render2.methods.setPosition(snappedX, container2.offsetTop);
        setTimeout(() => {
          container2.classList.remove(SNAP_ANIM_CLASS);
          snapping = false;
        }, SNAP_ANIMATION_MS);
      }
    } else {
      container2.classList.remove(EDGE_CLASS, ...SIDE_CLASSES);
    }
  }
  function ensureDropZone() {
    if (!dropZone && lib.$elements.root) {
      dropZone = lib.h("div", { className: "edge-drop-zone" }, [
        lib.h("span", { className: "edge-drop-zone-tip" }, "松手自动吸附")
      ]);
      lib.$elements.root.append(dropZone);
    }
    return dropZone;
  }
  function updateDropZone(clientX) {
    const zone = ensureDropZone();
    if (!zone)
      return;
    const clientWidth = document.documentElement.clientWidth;
    const side = BackgroundProject.scripts.render.cfg.visual !== "minimize" ? void 0 : clientX <= EDGE_WIDTH ? "left" : clientX >= clientWidth - EDGE_WIDTH ? "right" : void 0;
    zone.classList.toggle("show", !!side);
    zone.classList.toggle("zone-left", side === "left");
    zone.classList.toggle("zone-right", side === "right");
  }
  function hideDropZone() {
    dropZone == null ? void 0 : dropZone.classList.remove("show", "zone-left", "zone-right");
  }
  function ensurePanelInViewport(container2) {
    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;
    const maxX = Math.max(clientWidth - container2.offsetWidth, 0);
    const maxY = Math.max(clientHeight - container2.offsetHeight, 10);
    const x = Math.min(Math.max(container2.offsetLeft, 0), maxX);
    const y = Math.min(Math.max(container2.offsetTop, 10), maxY);
    if (x !== container2.offsetLeft || y !== container2.offsetTop) {
      BackgroundProject.scripts.render.methods.setPosition(x, y);
    }
  }
  function enableIconDraggable(icon, container2) {
    icon.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startTop = container2.offsetTop;
      const side = container2.classList.contains("edge-right") ? "right" : "left";
      let dragging = false;
      let exited = false;
      const onMove = (ev) => {
        if (!dragging && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) {
          dragging = true;
        }
        if (!dragging)
          return;
        const clientWidth = document.documentElement.clientWidth;
        const outOfZone = side === "left" ? ev.clientX > EDGE_WIDTH + ICON_SIZE : ev.clientX < clientWidth - EDGE_WIDTH - ICON_SIZE;
        if (outOfZone && !exited) {
          exited = true;
          container2.classList.remove(EDGE_CLASS, ...SIDE_CLASSES);
        }
        if (exited) {
          container2.style.left = ev.clientX - ICON_SIZE / 2 + "px";
        }
        container2.style.top = Math.max(startTop + (ev.clientY - startY), 10) + "px";
      };
      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        if (dragging) {
          BackgroundProject.scripts.render.methods.setPosition(container2.offsetLeft, container2.offsetTop);
          updateEdgeMode();
        } else {
          BackgroundProject.scripts.render.methods.normal();
          requestAnimationFrame(() => ensurePanelInViewport(container2));
        }
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });
  }
  let inited = false;
  function initEdgeMinimize(retry = 3) {
    var _a;
    if (inited)
      return;
    const container2 = getContainer();
    if (!container2) {
      if (retry > 0) {
        setTimeout(() => initEdgeMinimize(retry - 1), 1e3);
      }
      return;
    }
    inited = true;
    const render2 = BackgroundProject.scripts.render;
    const edgeIcon = lib.h("div", {
      className: "edge-minimize-icon",
      innerHTML: logoSvg,
      title: "点击展开窗口，或沿边缘拖动"
    });
    container2.append(edgeIcon);
    enableIconDraggable(edgeIcon, container2);
    ensureDropZone();
    (_a = container2.querySelector("header-element")) == null ? void 0 : _a.addEventListener("pointerdown", () => {
      headerDragging = true;
    });
    document.addEventListener("pointermove", (e) => {
      if (headerDragging)
        updateDropZone(e.clientX);
    });
    document.addEventListener("pointerup", () => {
      if (headerDragging) {
        headerDragging = false;
        hideDropZone();
        updateEdgeMode();
      }
    });
    document.addEventListener("pointercancel", () => {
      headerDragging = false;
      hideDropZone();
    });
    render2.onConfigChange("visual", () => updateEdgeMode());
    render2.onConfigChange("x", () => updateEdgeMode());
    window.addEventListener("resize", () => updateEdgeMode());
    updateEdgeMode();
  }
  const TAB_WORK_RESULTS_KEY = "common.work-results.results";
  function formatQuestionForMessage(question) {
    if (!question)
      return question;
    const re2 = new RegExp(IMAGE_URL_REGEX.source, IMAGE_URL_REGEX.flags);
    const placeholderMap = /* @__PURE__ */ new Map();
    let counter = 0;
    return question.replace(re2, (url) => {
      let p = placeholderMap.get(url);
      if (!p) {
        counter++;
        p = `[图片${counter}]`;
        placeholderMap.set(url, p);
      }
      return p;
    });
  }
  const CommonEvents = {
    emitAnswererChanged: lib.cors.defineTopFunction((curr, pre) => {
      CommonProject.scripts.settings.emit("answerer-wrapper-change", curr, pre);
    }),
    emitWorkerChanged: lib.cors.defineTopFunction((result) => {
      CommonProject.scripts.workResults.emit("work-current-result-change", result);
    }),
    emitWorkerStateChange: lib.cors.defineTopFunction((workerState) => {
      state$6.workResult.isWorkerWorking = workerState === "start";
      workerWorkingChangeListeners.forEach((listener) => listener());
      CommonProject.scripts.workResults.emit("work-state-change", workerState);
    })
  };
  const count = (results) => ({
    total: results.length,
    requested: results.filter((r) => r.requested).length,
    resolved: results.filter((r) => r.resolved).length
  });
  const cacheIfFinished = (result) => {
    if (CommonProject.scripts.settings.cfg.enableQuestionCaches === false) {
      return;
    }
    if (result.finish === true) {
      BackgroundProject.scripts.data.methods.addQuestionCacheFromWorkResult([result]);
    }
  };
  const answererListHandlers = {
    isDisabled: (name) => CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames.includes(name),
    onToggle: (name, disabled) => {
      if (disabled) {
        CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames = [
          ...CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames,
          name
        ];
        lib.$message.warn({
          content: "题库：" + name + " 已被停用，如需开启请在：通用-全局设置-题库配置中开启。",
          duration: 30
        });
      } else {
        CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames = CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames.filter((n) => n !== name);
        lib.$message.success({
          content: "题库：" + name + " 已启用。",
          duration: 3
        });
      }
    }
  };
  const workerWorkingChangeListeners = /* @__PURE__ */ new Set();
  const state$6 = {
    workResult: {
      isWorkerWorking: false,
      questionPositionSyncHandler: {
        cx: (index) => {
          var _a;
          const el = (_a = document.querySelectorAll('[id*="sigleQuestionDiv"], .questionLi')) == null ? void 0 : _a.item(index);
          if (el) {
            window.scrollTo({
              top: el.getBoundingClientRect().top + window.pageYOffset - 50,
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
        "zhs-smart": (index) => {
          var _a;
          (_a = document.querySelectorAll('[role="treeitem"] .font-sec-style-node').item(index)) == null ? void 0 : _a.click();
        },
        "zhs-fusion": (index) => {
          var _a;
          (_a = document.querySelectorAll(".right-box .list .item").item(index)) == null ? void 0 : _a.click();
        },
        "zhs-hike": (index) => {
          var _a;
          (_a = document.querySelectorAll(".q_main_right .card_ul .card_li").item(index)) == null ? void 0 : _a.click();
        },
        "zhs-hike-answer-training": (index) => {
          var _a;
          (_a = document.querySelectorAll(".base-question-component").item(index)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        icve: (index) => {
          var _a;
          (_a = document.querySelectorAll(`.sheet_nums [id*="sheetSeq"]`).item(index)) == null ? void 0 : _a.click();
        },
        zjy: (index) => {
          var _a;
          (_a = document.querySelectorAll(".subjectDet").item(index)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        icourse: (index) => {
          var _a;
          (_a = document.querySelectorAll(".u-questionItem,[class*=questionBody]").item(index)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    },
    setting: {
      imageOptimizeMessage: void 0
    }
  };
  const CommonProject = lib.Project.create({
    name: "通用",
    domains: [],
    scripts: {
      guide: new lib.Script({
        name: "🏠 使用教程",
        matches: [["所有页面", /.*/]],
        namespace: "common.guide",
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              "打开任意网课平台，进入视频、作业页面等待脚本运行，",
              "⚠️ 禁止与其他脚本一起使用（不兼容），也不能开多个相同脚本",
              "⚠️ 禁止最小化浏览器、切屏，否则可能导致脚本无法运行！",
              "有疑问请访问下方交流群，进群后带截图进行反馈。"
            ]).outerHTML
          }
        },
        onrender({ panel }) {
          const guide = createGuide();
          panel.body.replaceChildren(guide);
        }
      }),
      settings: new lib.Script({
        name: "⚙️ 全局设置",
        matches: [["所有页面", /.*/]],
        namespace: "common.settings",
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              "✨鼠标移动到按钮或者输入框，可以看到提示！",
              "想要自动答题必须设置 “题库配置” ",
              "设置后进入章节测试，作业，考试页面即可自动答题。"
            ]).outerHTML
          },
          OCS_TYPE: {
            defaultValue: ""
          },
          answererWrappers: {
            separator: "自动答题设置",
            defaultValue: []
          },
          disabledAnswererWrapperNames: {
            defaultValue: []
          },
          imageOptimizeWarnRecords: {
            defaultValue: []
          },
          answererWrappersButton: {
            label: "题库配置",
            defaultValue: "点击配置",
            attrs: {
              type: "button"
            },
            suffixSlot() {
              return getAnswererConfigProvider() ? createAnswererModeDropdown() : "";
            },
            onload() {
              const OCS_TYPE = CommonProject.scripts.settings.cfg.OCS_TYPE;
              const aws = CommonProject.scripts.settings.cfg.answererWrappers || [];
              this.value = aws.length ? aws.length + " 个可用题库（点击进入配置）" : "点击进入配置";
              const openAnswererModal = (mode) => {
                const aw = CommonProject.scripts.settings.cfg.answererWrappers || [];
                const listContainer = lib.h("div");
                const renderAnswererList = () => {
                  const current = CommonProject.scripts.settings.cfg.answererWrappers || [];
                  listContainer.replaceChildren(
                    ...current.length ? [createAnswererWrapperSection(current, "已解析的题库配置：", answererListHandlers)] : []
                  );
                };
                renderAnswererList();
                const textarea = lib.h(
                  "textarea",
                  {
                    className: "modal-input",
                    style: { minHeight: "250px", width: "calc(100% - 20px)", maxWidth: "100%" },
                    placeholder: aw.length ? "重新输入题库配置" : "输入你的题库配置...，不会请看上方填写教程"
                  },
                  aw.length === 0 ? "" : JSON.stringify(aw, null, 4)
                );
                const select = lib.$ui.tooltip(
                  lib.h(
                    "select",
                    {
                      className: "base-style-active-form-control",
                      style: { backgroundColor: "#eef2f7", borderRadius: "2px", padding: "2px 8px" }
                    },
                    [
                      lib.h("option", "默认"),
                      lib.h(
                        "option",
                        {
                          title: "大学生网课题库接口适配器: 将不同的题库整合为一个API接口。详细查看 https://github.com/DokiDoki1103/tikuAdapter"
                        },
                        "TikuAdapter"
                      )
                    ]
                  )
                );
                const applyAws = async (awsResult, showSuccessModal = true) => {
                  if (awsResult.length === 0) {
                    lib.$modal.alert({ content: "题库配置不能为空，请重新配置。" });
                    return false;
                  }
                  const result_set = [];
                  for (const res of awsResult) {
                    if (result_set.find((i) => JSON.stringify(i) === JSON.stringify(res))) {
                      continue;
                    }
                    result_set.push(res);
                  }
                  awsResult = result_set;
                  if (JSON.stringify(CommonProject.scripts.settings.cfg.answererWrappers) === JSON.stringify(awsResult)) {
                    if (showSuccessModal) {
                      lib.$modal.alert({ content: lib.h("div", ["✅️已应用题库配置，但您新配置的题库似乎没有变化~"]) });
                    }
                    return true;
                  }
                  if (awsResult.length > 10) {
                    lib.$modal.alert({
                      content: lib.h("div", [
                        "题库配置过多可能会导致答题效率降低，建议不超过10个题库，目前解析到" + awsResult.length + "个题库，请删除一些不必要的题库后重新配置！"
                      ])
                    });
                    return false;
                  }
                  const confirmed = await confirmRiskyAnswerWrappers(awsResult);
                  if (!confirmed) {
                    return false;
                  }
                  CommonEvents.emitAnswererChanged(awsResult, CommonProject.scripts.settings.cfg.answererWrappers);
                  CommonProject.scripts.settings.cfg.answererWrappers = awsResult;
                  this.value = "当前有" + awsResult.length + "个可用题库";
                  if (showSuccessModal) {
                    lib.$modal.confirm({
                      width: 600,
                      content: lib.h("div", [
                        lib.h("div", ["🎉 配置成功，", lib.h("b", " 刷新界面 "), "或者", lib.h("b", " 重新答题 "), "即可生效。"]),
                        createAnswererWrapperSection(awsResult, "解析到的题库如下所示：", answererListHandlers, false)
                      ]),
                      onConfirm: () => {
                        if (lib.$gm.isInGMContext()) {
                          top == null ? void 0 : top.document.location.reload();
                        }
                      },
                      ...lib.$gm.isInGMContext() ? {
                        confirmButtonText: "立即刷新",
                        cancelButtonText: "稍后刷新"
                      } : {}
                    });
                  }
                  textarea.value = JSON.stringify(awsResult, null, 4);
                  const connects = lib.$gm.getMetadataFromScriptHead("connect");
                  if (connects.length) {
                    const notAllowed = [];
                    if (connects.includes("*")) {
                      return true;
                    }
                    for (const aw2 of awsResult) {
                      if (connects.some((connect) => new URL(aw2.url).hostname.includes(connect)) === false) {
                        notAllowed.push(aw2.url);
                      }
                    }
                    if (notAllowed.length) {
                      lib.$modal.alert({
                        width: 600,
                        maskCloseable: false,
                        title: "⚠️警告",
                        content: lib.h("div", [
                          lib.h("div", [
                            "配置成功，但检测到以下 域名/ip 不在脚本的白名单中，请安装 : ",
                            lib.h(
                              "a",
                              {
                                href: "https://docs.ocsjs.com/docs/other/api#全域名通用版本"
                              },
                              "OCS全域名通用版本"
                            ),
                            "，或者手动添加 @connect ，否则无法进行请求。",
                            lib.h(
                              "ul",
                              notAllowed.map((url) => lib.h("li", new URL(url).hostname))
                            )
                          ])
                        ])
                      });
                    }
                  }
                  return true;
                };
                const provider2 = getAnswererConfigProvider();
                const { el: connectStatus, setStatus: setConnectStatus } = createStatusBox();
                const connectHero = provider2 ? (() => {
                  let origin = provider2.connectUrl;
                  try {
                    origin = new URL(provider2.connectUrl).origin;
                  } catch {
                  }
                  return createHero({
                    icon: "🚀",
                    title: "一键获取题库配置",
                    subtitle: "打开题库网站并登录即可，配置自动回填，无需手动复制粘贴",
                    extra: lib.h("span", [
                      "题库源：",
                      lib.h("b", provider2.name),
                      "　官网：",
                      lib.h("a", { href: origin, target: "_blank" }, origin)
                    ])
                  });
                })() : void 0;
                const connectSteps = provider2 ? createSteps(["点击下方获取按钮、打开题库小窗", "完成登录", "自动回填保存"]) : void 0;
                const connectButton = provider2 ? lib.h("button", "点击前往获取题库", (btn) => {
                  btn.className = "aw-connect-btn" + (aw.length ? "" : " lg");
                  const defaultLabel = "点击前往获取题库";
                  const setBtnLoading = (loading) => {
                    btn.disabled = loading;
                    btn.innerHTML = loading ? `${loadingSpinSvg}获取中 ...` : defaultLabel;
                  };
                  btn.onclick = async () => {
                    var _a;
                    const win = openAnswererConnect();
                    if (!win) {
                      setConnectStatus(
                        "⚠️ 弹窗被浏览器拦截，请允许本站弹窗后重试，或点击题库配置旁的「⋯」选择「自定义题库」手动配置。",
                        "error"
                      );
                      return;
                    }
                    setBtnLoading(true);
                    setConnectStatus("⏳ 正在等待您在题库网站完成登录，登录后配置将自动回填保存。", "info");
                    try {
                      const aws2 = await waitForAnswererConfig(win, void 0, () => !(modal2 == null ? void 0 : modal2.isConnected));
                      select.value = "默认";
                      textarea.value = JSON.stringify(aws2, null, 4);
                      const saved = await applyAws(aws2, false);
                      if (saved) {
                        await new Promise((resolve) => setTimeout(resolve, 1e3));
                        for (let i = 3; i > 0; i--) {
                          setConnectStatus(`✅ 题库配置已保存，${i} 秒后自动关闭小窗…`, "success");
                          await new Promise((resolve) => setTimeout(resolve, 1e3));
                        }
                        setConnectStatus("✅ 题库配置已保存，重新答题或刷新界面 即可生效。", "success");
                        try {
                          win.close();
                        } catch {
                        }
                      } else {
                        setConnectStatus("⚠️ 配置未保存，请根据提示处理后重试。", "error");
                      }
                    } catch (e) {
                      setConnectStatus("⚠️ " + ((_a = e == null ? void 0 : e.message) != null ? _a : "获取题库配置失败"), "error");
                    } finally {
                      setBtnLoading(false);
                    }
                  };
                }) : void 0;
                const manualNotes = lib.$ui.notes([
                  [
                    lib.h("div", { style: { fontSize: "16px", marginBottom: "8px" } }, [
                      lib.h("b", "题库配置填写教程👉："),
                      lib.h("a", { href: "https://docs.ocsjs.com/docs/work" }, "https://docs.ocsjs.com/docs/work")
                    ])
                  ],
                  [
                    lib.h(
                      "div",
                      {
                        className: "secondary"
                      },
                      [
                        "⚠️ 如果无法粘贴，请点->：",
                        lib.h("button", "读取剪贴板", (btn) => {
                          btn.classList.add("base-style-button");
                          btn.onclick = () => {
                            navigator.clipboard.readText().then((result) => {
                              textarea.value = result;
                            });
                          };
                        }),
                        "，并同意浏览器上方的剪贴板读取申请。"
                      ]
                    )
                  ],
                  ...OCS_TYPE === "common" ? [
                    [
                      lib.h(
                        "div",
                        { className: "secondary" },
                        "⚠️ 如果想添加多个不同的题库配置，请在每个配置之间使用三个井号隔开: ###。"
                      )
                    ],
                    [lib.h("div", { className: "secondary" }, "⚠️ 配置第三方题库出现网页弹窗的，点击永久允许连接。")]
                  ] : []
                ]);
                const clearAnswererConfig = () => {
                  lib.$modal.confirm({
                    content: "确定要清空题库配置吗？",
                    onConfirm: () => {
                      lib.$message.success({ content: "已清空，在答题前请记得重新配置。" });
                      modal2 == null ? void 0 : modal2.remove();
                      CommonProject.scripts.settings.cfg.answererWrappers = [];
                      this.value = "点击配置";
                    }
                  });
                };
                const enlargeFooterButton = (btn) => {
                  btn.style.padding = "4px 12px";
                  btn.style.fontSize = "14px";
                };
                const manualFooter = lib.h("div", { style: { width: "100%" } }, [
                  lib.h("div", { className: "separator secondary" }, "题库配置填写/修改区"),
                  textarea,
                  lib.h("div", { style: { marginTop: "12px", fontSize: "12px" } }, [
                    lib.h("div", { style: { marginBottom: "12px" } }, ["解析器：", select]),
                    lib.h("div", { style: { display: "flex", flexWrap: "wrap", justifyContent: "flex-end" } }, [
                      lib.h("button", "清空题库配置", (btn) => {
                        btn.className = "modal-cancel-button";
                        enlargeFooterButton(btn);
                        btn.style.marginRight = "auto";
                        btn.onclick = () => clearAnswererConfig();
                      }),
                      lib.h("button", "关闭", (btn) => {
                        btn.className = "modal-cancel-button";
                        enlargeFooterButton(btn);
                        btn.style.marginRight = "12px";
                        btn.onclick = () => modal2 == null ? void 0 : modal2.remove();
                      }),
                      lib.h("button", "保存配置", (btn) => {
                        btn.className = "modal-confirm-button";
                        enlargeFooterButton(btn);
                        btn.onclick = async () => {
                          const value = textarea.value;
                          if (!value) {
                            lib.$modal.alert({
                              content: lib.h("div", "不能为空！")
                            });
                            return;
                          }
                          if (value.includes("adapter-service/search") && select.value === "TikuAdapter" === false) {
                            lib.$modal.alert({
                              content: lib.h("div", [
                                "检测到您可能正在使用 ",
                                lib.h(
                                  "a",
                                  { href: "https://github.com/DokiDoki1103/tikuAdapter#readme" },
                                  "TikuAdapter 题库"
                                ),
                                "，但是您选择的解析器不是 TikuAdapter，请选择 TikuAdapter 解析器，并填写接口地址即可，例如：http://localhost:8060/adapter-service/search，或者忽略此警告。"
                              ]),
                              confirmButtonText: "切换至 TikuAdapter 解析器，并识别接口地址",
                              onConfirm() {
                                var _a;
                                const origin = ((_a = textarea.value.match(/http:\/\/(.+)\/adapter-service\/search/)) == null ? void 0 : _a[1]) || "";
                                textarea.value = `http://${origin}/adapter-service/search`;
                                select.value = "TikuAdapter";
                              }
                            });
                            return;
                          }
                          try {
                            const awsResult = [];
                            if (select.value === "TikuAdapter") {
                              if (value.startsWith("http") === false) {
                                lib.$modal.alert({
                                  content: lib.h("div", [
                                    "格式错误，TikuAdapter解析器只能解析 url 链接，请重新输入！或者查看：",
                                    lib.h(
                                      "a",
                                      { href: "https://github.com/DokiDoki1103/tikuAdapter#readme" },
                                      "https://github.com/DokiDoki1103/tikuAdapter#readme"
                                    )
                                  ])
                                });
                                return;
                              }
                              select.value = "默认";
                              awsResult.push({
                                name: "TikuAdapter题库",
                                url: value,
                                homepage: "https://github.com/DokiDoki1103/tikuAdapter",
                                method: "post",
                                type: "GM_xmlhttpRequest",
                                contentType: "json",
                                headers: {},
                                data: {
                                  question: "${title}",
                                  options: {
                                    handler: "return (env)=>env.options?.split('\\n')"
                                  },
                                  type: {
                                    handler: " return (env)=> env.type === 'single' ? 0 : env.type === 'multiple' ? 1 : env.type === 'completion' ? 3 : env.type === 'judgement' ? 4 : undefined"
                                  }
                                },
                                handler: "return (res)=>res.answer.allAnswer.map(i=>([res.question,i.join('#')]))"
                              });
                            } else {
                              const contents = value.split("###").map((i) => i.trim()).filter(Boolean);
                              for (const content of contents) {
                                awsResult.push(...await AnswerWrapperParser.from(content));
                              }
                            }
                            await applyAws(awsResult);
                          } catch (e) {
                            lib.$modal.alert({
                              content: lib.h("div", [lib.h("div", "解析失败，原因如下 :"), lib.h("div", e.message)])
                            });
                          }
                        };
                      })
                    ])
                  ])
                ]);
                let modalContent;
                let modalFooter;
                if (mode === "official" && provider2 && connectHero && connectButton && connectSteps) {
                  const connectPanel = lib.h("div", [connectHero, connectSteps, connectStatus, listContainer]);
                  const connectFooter = lib.h(
                    "div",
                    {
                      style: {
                        width: "100%",
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginTop: "24px"
                      }
                    },
                    [
                      ...aw.length ? [
                        lib.h("button", "清空题库配置", (btn) => {
                          btn.className = "modal-cancel-button";
                          btn.style.padding = "2px 8px";
                          btn.style.fontSize = "12px";
                          btn.onclick = () => clearAnswererConfig();
                        }),
                        lib.h("button", "手动配置题库", (btn) => {
                          btn.className = "modal-cancel-button";
                          btn.style.padding = "2px 8px";
                          btn.style.fontSize = "12px";
                          btn.style.marginRight = "auto";
                          btn.title = "手动填写或粘贴题库配置";
                          btn.onclick = () => {
                            modal2 == null ? void 0 : modal2.remove();
                            openAnswererModal("custom");
                          };
                        })
                      ] : [],
                      lib.h("button", "关闭", (btn) => {
                        btn.className = "modal-cancel-button";
                        if (aw.length) {
                          enlargeFooterButton(btn);
                        } else {
                          btn.style.padding = "8px 24px";
                          btn.style.fontSize = "15px";
                        }
                        btn.onclick = () => modal2 == null ? void 0 : modal2.remove();
                      }),
                      connectButton
                    ]
                  );
                  modalContent = connectPanel;
                  modalFooter = connectFooter;
                } else {
                  modalContent = lib.h("div", [manualNotes, listContainer]);
                  modalFooter = manualFooter;
                }
                const modal2 = lib.$modal.prompt({
                  width: 600,
                  maskCloseable: false,
                  content: modalContent,
                  footer: modalFooter
                });
                const awChangeListener = CommonProject.scripts.settings.onConfigChange(
                  "answererWrappers",
                  (_key, _value, remote) => {
                    if (remote === false) {
                      renderAnswererList();
                    }
                  }
                );
                if (modal2) {
                  const originalRemove = modal2.remove.bind(modal2);
                  modal2.remove = () => {
                    CommonProject.scripts.settings.offConfigChange(awChangeListener);
                    originalRemove();
                  };
                }
                if (mode === "official" && aw.length === 0 && connectButton) {
                  setTimeout(() => {
                    if (modal2 == null ? void 0 : modal2.isConnected) {
                      connectButton.click();
                    }
                  }, 1e3);
                }
              };
              this.onclick = () => openAnswererModal(getAnswererConfigProvider() ? "official" : "custom");
              this.openAnswererModal = openAnswererModal;
            }
          },
          upload: {
            label: "答案提交方式（提交率）",
            tag: "select",
            defaultValue: 80,
            options: [
              [
                "save",
                "自动保存（不提交）",
                "答题结束后自动保存答案，但不会提交试卷。注意：如果开启了随机作答，保存后可能无法分辨答案是否正确。"
              ],
              [
                "nomove",
                "不保存也不提交",
                "答题结束后不进行任何保存或提交，等待时间过后自动进入下一节，适合测试脚本时使用。"
              ],
              ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map((rate) => [
                rate,
                `搜到 ${rate}%的答案就自动提交`,
                `例如共100道题，只要有 ${rate} 道题搜索到答案，就会自动提交试卷（答案不一定正确）。`
              ]),
              ["100", "全部题目都搜到答案才提交", "所有题目都搜索到答案后才自动提交试卷（答案不一定正确）。"],
              [
                "force",
                "不管有没有答案都强制提交",
                "不管是否搜到答案、答案是否正确，答题结束后直接强制提交试卷。风险较高，如需开启请配合随机作答谨慎使用。"
              ]
            ],
            attrs: {
              title: "提交方式（提交率）：设置自动答题结束后如何保存/提交答案\n鼠标悬浮在选项上可以查看每个选项的具体解释。\n\n注意：提交率无法控制题库的正确率，题库搜索到的答案不一定正确。"
            }
          },
          "work-when-no-job": {
            defaultValue: false,
            label: "强制答题（仅超星）",
            attrs: {
              type: "checkbox",
              title: "当章节测试左上角并没有黄色任务点的时候依然进行答题（没有任务点说明此作业可能不计入总成绩，如果老师要求则可以开启）"
            }
          },
          "randomWork-choice": {
            defaultValue: false,
            label: "随机选择（仅超星）",
            attrs: { type: "checkbox", title: "题库搜索不到答案时，随机选择任意一个选项，仅支持超星章节测试" }
          },
          "randomWork-complete": {
            defaultValue: false,
            label: "随机填空（仅超星）",
            attrs: { type: "checkbox", title: "题库搜索不到答案时，随机填写以下任意一个文案，仅支持超星章节测试" }
          },
          "randomWork-completeTexts-textarea": {
            defaultValue: ["不会", "不知道", "不清楚", "不懂", "不会写"].join("\n"),
            label: "随机填空文案（仅超星）",
            tag: "textarea",
            showIf: "common.settings.randomWork-complete",
            attrs: { title: "每行一个，随机填入", style: { minWidth: "200px", minHeight: "50px" } },
            onload(el) {
              el.addEventListener("change", () => {
                if (String(el.value).trim() === "") {
                  el.value = el.defaultValue;
                }
              });
            }
          },
          advancedSettings: {
            ...dropdownStyle,
            defaultValue: false,
            label: "高级设置",
            attrs: { type: "checkbox", title: "请谨慎使用高级设置，可能会影响答题效果，小白在未理解的情况下谨慎调整。" }
          },
          thread: {
            showIf: "common.settings.advancedSettings",
            elementClassName: "config-details",
            label: "线程数量（个）",
            attrs: {
              type: "number",
              min: 1,
              step: 1,
              max: 3,
              title: "同一时间内答题线程工作的数量（例子：三个线程则代表一秒内同时搜索三道题），过多可能导致题库服务器压力过大，请适当调低。"
            },
            defaultValue: 1
          },
          imageOptimize: {
            showIf: "common.settings.advancedSettings",
            elementClassName: "config-details",
            label: "图片题优化",
            attrs: {
              type: "checkbox",
              title: `遇到图片题解析图片成 Base64 上传给题库，防止遇到防盗链等问题无法加载。需题库配置支持（POST 方法且引用了 \${images} / \${suggestion_title} / \${suggestion_options} 字段），否则需重新配置题库。原题 title / options 不会被修改。`
            },
            defaultValue: true
          },
          answerWrapperHandlerTimeout: {
            showIf: "common.settings.advancedSettings",
            elementClassName: "config-details",
            label: "搜题最大耗时（秒）",
            attrs: {
              type: "number",
              min: 10,
              step: 1,
              max: 3 * 60,
              title: "搜题超时时间，单位为秒，超过这个时间直接放弃，进行下一题搜索。"
            },
            defaultValue: 120
          },
          stopSecondWhenFinish: {
            showIf: "common.settings.advancedSettings",
            elementClassName: "config-details",
            label: "答题结束后暂停（秒）",
            attrs: {
              type: "number",
              min: 3,
              step: 1,
              max: 9999,
              title: "自动答题脚本结束后暂停的时间（方便查看和检查）。"
            },
            defaultValue: 3
          },
          period: {
            showIf: "common.settings.advancedSettings",
            elementClassName: "config-details",
            label: "搜题间隔（秒）",
            attrs: {
              type: "number",
              min: 1,
              step: 1,
              max: 60,
              title: "每道题的搜题间隔时间，不建议太低，避免增加服务器压力。"
            },
            defaultValue: 3
          },
          answerSeparators: {
            showIf: "common.settings.advancedSettings",
            elementClassName: "config-details",
            label: "答案分隔符",
            attrs: {
              title: "分隔答案的符号，例如：答案1#答案2#答案3，分隔符为 #， 使用英文逗号进行隔开 : ',' "
            },
            defaultValue: ["===", "#", "---", "###", "|", ";", "；"].join(","),
            onload(el) {
              el.addEventListener("change", () => {
                if (String(el.value).trim() === "") {
                  el.value = el.defaultValue;
                }
              });
            }
          },
          redundanceWordsText: {
            showIf: "common.settings.advancedSettings",
            elementClassName: "config-details",
            defaultValue: [
              "单选题(必考)",
              "填空题(必考)",
              "多选题(必考)",
              "(单选题)",
              "(多选题)",
              "(判断题)",
              "(填空题)",
              "【单选题】",
              "【多选题】",
              "【填空题】",
              "【判断题】",
              "【單選题】",
              "【多選题】",
              "【判斷题】",
              "【Single Choice】",
              "【Multiple Choice】",
              "【single choice】",
              "【multiple choice】",
              "【True or False】"
            ].join("\n"),
            label: "题目冗余字段自动删除",
            tag: "textarea",
            attrs: {
              title: "在搜题的时候自动删除多余的文字，以便提高搜题的准确度，每行一个。",
              style: { minWidth: "200px", minHeight: "50px" }
            },
            onload(el) {
              el.addEventListener("change", () => {
                if (String(el.value).trim() === "")
                  el.value = el.defaultValue;
              });
            }
          },
          notification: {
            separator: "其他设置",
            label: "系统通知",
            attrs: {
              title: "允许脚本发送系统通知，只有重要事情发生时会发送系统通知，尽量避免用户受到骚扰（在电脑屏幕右侧显示通知弹窗，例如脚本执行完毕，图形验证码，版本更新等通知）。"
            },
            tag: "select",
            defaultValue: "only-notify",
            suffixSlot: function() {
              const btn = lib.h("button", { className: "base-style-button-secondary" }, "📢测试通知");
              btn.onclick = () => {
                this.methods.notificationBySetting("这是一条测试通知");
              };
              return btn;
            },
            options: [
              ["only-notify", "只显示右下角通知"],
              ["notify-and-voice", "通知以及提示音（叮的一声）"],
              ["all", "通知，提示音，以及任务栏闪烁提示"],
              ["no-notify", "关闭系统通知"]
            ]
          },
          enableQuestionCaches: {
            label: "题库缓存功能",
            defaultValue: true,
            attrs: { type: "checkbox" },
            suffixSlot: function() {
              const btn = lib.h("button", { className: "base-style-button-secondary" }, "⚙️管理缓存");
              btn.onclick = () => {
                BackgroundProject.scripts.data.methods.showQuestionCaches();
              };
              return btn;
            }
          }
        },
        methods() {
          return {
            getWorkOptions: () => {
              const workOptions = JSON.parse(JSON.stringify(this.cfg));
              workOptions.answererWrappers = workOptions.answererWrappers.filter(
                (aw) => this.cfg.disabledAnswererWrapperNames.find((daw) => daw === aw.name) === void 0
              );
              return workOptions;
            },
            notificationBySetting: (content, opts) => {
              var _a;
              if (this.cfg.notification !== "no-notify") {
                lib.$gm.notification(content, {
                  extraTitle: opts == null ? void 0 : opts.extraTitle,
                  duration: (_a = opts == null ? void 0 : opts.duration) != null ? _a : 30,
                  important: this.cfg.notification === "all",
                  silent: this.cfg.notification === "only-notify"
                });
              }
            }
          };
        },
        oncomplete({ OCS_TYPE }) {
          this.cfg.OCS_TYPE = OCS_TYPE;
          AnswerWrapperHandlerConfig.timeout_seconds = this.cfg.answerWrapperHandlerTimeout;
          this.onConfigChange("answerWrapperHandlerTimeout", (sec) => {
            AnswerWrapperHandlerConfig.timeout_seconds = sec;
          });
          const checkImageOptimizeCompatibility = () => {
            var _a;
            if (self !== top) {
              return;
            }
            const wrappers = this.cfg.answererWrappers || [];
            if (!this.cfg.imageOptimize || wrappers.length === 0 || isAnswererWrappersSupportImageOptimize(wrappers)) {
              (_a = state$6.setting.imageOptimizeMessage) == null ? void 0 : _a.remove();
              state$6.setting.imageOptimizeMessage = void 0;
              return;
            }
            const signature = createAnswererWrappersSignature(wrappers);
            if (this.cfg.imageOptimizeWarnRecords.includes(signature)) {
              return;
            }
            if (!state$6.setting.imageOptimizeMessage) {
              state$6.setting.imageOptimizeMessage = lib.$message.warn({
                content: lib.h("div", [
                  "当前题库配置暂不支持图片、公式等题目处理",
                  lib.h("br"),
                  "请前往题库配置源头获取新配置并重新配置题库，否则图片题优化功能无法生效。",
                  lib.h("br"),
                  "题库开发人员请查看： https://docs.ocsjs.com/docs/other/api"
                ]),
                duration: 0,
                onClose: () => {
                  if (!this.cfg.imageOptimizeWarnRecords.includes(signature)) {
                    this.cfg.imageOptimizeWarnRecords = [...this.cfg.imageOptimizeWarnRecords, signature].slice(-50);
                  }
                  state$6.setting.imageOptimizeMessage = void 0;
                }
              });
            }
          };
          checkImageOptimizeCompatibility();
          this.onConfigChange("imageOptimize", () => checkImageOptimizeCompatibility());
          this.onConfigChange("answererWrappers", () => checkImageOptimizeCompatibility());
        }
      }).withEvents(),
      workResults: new lib.Script({
        name: "🔎 搜索结果",
        matches: [["所有页面", /.*/]],
        namespace: "common.work-results",
        configs: {
          notes: {
            defaultValue: lib.$ui.notes(["点击题目序号，查看搜索结果", "如果没有搜到，可能是题库没有收录该题目答案"]).outerHTML
          },
          currentResultIndex: {
            defaultValue: 0
          },
          dynamicResults: {
            defaultValue: false
          },
          questionPositionSyncHandlerType: {
            defaultValue: void 0
          }
        },
        methods() {
          return {
            update: async (index, result) => {
              const data = await lib.$store.getTab(TAB_WORK_RESULTS_KEY) || [];
              const placeholder = {
                question: "",
                searchInfos: [],
                requested: false,
                resolved: false,
                type: void 0
              };
              while (data.length < index) {
                data.push(placeholder);
              }
              data[index] = result;
              await lib.$store.setTab(TAB_WORK_RESULTS_KEY, data);
              cacheIfFinished(result);
              CommonEvents.emitWorkerChanged(result);
            },
            fillAll: async (results) => {
              await lib.$store.setTab(TAB_WORK_RESULTS_KEY, results);
            },
            append: async (result) => {
              CommonProject.scripts.workResults.cfg.dynamicResults = true;
              const data = await lib.$store.getTab(TAB_WORK_RESULTS_KEY) || [];
              const index = result.question ? data.findIndex((r) => r.question === result.question) : -1;
              if (index >= 0) {
                data[index] = result;
              } else {
                data.push(result);
              }
              await lib.$store.setTab(TAB_WORK_RESULTS_KEY, data);
              cacheIfFinished(result);
              CommonEvents.emitWorkerChanged(result);
            },
            clearResults: () => {
              return lib.$store.setTab(TAB_WORK_RESULTS_KEY, []);
            },
            getResults() {
              return lib.$store.getTab(TAB_WORK_RESULTS_KEY) || void 0;
            },
            init(opts) {
              var _a;
              CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = opts == null ? void 0 : opts.questionPositionSyncHandlerType;
              CommonProject.scripts.workResults.cfg.dynamicResults = (_a = opts == null ? void 0 : opts.dynamic) != null ? _a : false;
              CommonProject.scripts.workResults.methods.clearResults();
            },
            createWorkResultsPanel: (mount2) => {
              const container2 = mount2 || lib.h("div");
              container2.style.width = "400px";
              let scrollPercent = 0;
              const list = lib.$ui.tooltip(lib.h("div", { className: "work-result-list" }));
              list.onscroll = () => {
                scrollPercent = list.scrollTop / list.scrollHeight;
              };
              const setNumStyle = (result, num, index) => {
                var _a;
                if (result.searching) {
                  num.classList.add("searching");
                }
                if (result.requested) {
                  num.classList.add("requested");
                }
                if (index === this.cfg.currentResultIndex) {
                  num.classList.add("active");
                }
                if (result.finish) {
                  num.classList.add("finish");
                } else {
                  if (result.requested && result.resolved && (((_a = result.error) == null ? void 0 : _a.trim().length) !== 0 || result.searchInfos.length === 0 || result.finish === false)) {
                    num.classList.add("error");
                  }
                }
              };
              const render2 = debounce_1$1(async (first) => {
                let results = await CommonProject.scripts.workResults.methods.getResults();
                if (results == null ? void 0 : results.length) {
                  if (first) {
                    results = results.map((r) => {
                      r.searching = false;
                      return r;
                    });
                  }
                  const stats = count(results);
                  if (results[this.cfg.currentResultIndex] === void 0) {
                    this.cfg.currentResultIndex = 0;
                  }
                  const resultContainer = lib.h("div", { className: "work-result-container" });
                  const baseInfos = [
                    `已搜题: ${stats.requested}/${stats.total}`,
                    `已答题: ${stats.resolved}/${stats.total}`,
                    "⚪ 白色序号：等待处理中",
                    "🔵 蓝边序号：已完成搜索",
                    "🔵 蓝色序号：已搜索已答题",
                    "🔴 红色序号：搜索失败或没答案/不匹配等情况",
                    "",
                    "👉点击序号，查看搜索结果"
                  ];
                  const nums = results.map((result, index) => {
                    return lib.h("span", { className: "search-infos-num", innerText: (index + 1).toString() }, (num) => {
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
                          (_b = (_a = state$6.workResult.questionPositionSyncHandler)[this.cfg.questionPositionSyncHandlerType]) == null ? void 0 : _b.call(_a, index);
                        }
                      };
                    });
                  });
                  const helpIcon = lib.$ui.tooltip(
                    lib.h(
                      "span",
                      {
                        className: "search-infos-help",
                        title: baseInfos.join("\n")
                      },
                      "?"
                    )
                  );
                  list.replaceChildren(helpIcon, ...nums);
                  resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));
                  container2.replaceChildren(list, resultContainer);
                  list.scrollTo({
                    top: scrollPercent * list.scrollHeight,
                    behavior: "auto"
                  });
                  if (this.cfg.dynamicResults && !state$6.workResult.isWorkerWorking) {
                    container2.append(
                      lib.h("div", { style: { textAlign: "right", marginTop: "8px" } }, [
                        lib.$ui.tooltip(
                          lib.$ui.button("清空搜索结果", { className: "base-style-button-secondary" }, (btn) => {
                            btn.title = "当前为动态答题模式（题目逐题加载，结果累积显示），不会自动清空搜索结果\n点击后清空搜索结果";
                            btn.onclick = () => {
                              var _a, _b, _c, _d;
                              this.methods.clearResults();
                              const { panel, header: header2 } = CXProject.scripts.work;
                              if (panel && header2) {
                                (_b = (_a = CXProject.scripts.work).onrender) == null ? void 0 : _b.call(_a, { panel, header: header2 });
                                (_d = (_c = CommonProject.scripts.workResults).onrender) == null ? void 0 : _d.call(_c, { panel, header: header2 });
                              }
                            };
                          })
                        )
                      ])
                    );
                  }
                } else {
                  container2.replaceChildren(
                    lib.h("div", { className: "alert-info-wrapper" }, [
                      lib.h("div", "暂无任何搜索结果~", (div) => {
                        div.style.marginTop = "12px";
                        div.className = "result-info no-answer";
                      })
                    ])
                  );
                }
              }, 100);
              const createResult = (result) => {
                if (result) {
                  return lib.h("div", [
                    createSearchResultAlertElement(result),
                    lib.h(SearchInfosElement, {
                      infos: result.searchInfos,
                      question: result.question,
                      type: result.type
                    })
                  ]);
                } else {
                  return lib.h("div", "undefined");
                }
              };
              render2(true);
              lib.$store.addTabChangeListener(TAB_WORK_RESULTS_KEY, render2);
              workerWorkingChangeListeners.add(() => render2(false));
              return container2;
            }
          };
        },
        onrender({ panel }) {
          panel.body.replaceChildren(this.methods.createWorkResultsPanel());
        },
        oncomplete() {
          let working_msg;
          CommonProject.scripts.workResults.on("work-state-change", (workerState) => {
            if (workerState === "start") {
              working_msg == null ? void 0 : working_msg.remove();
              working_msg = lib.$message.info({ content: loadingSpinSvg + " 正在搜题中...", duration: 0 });
            } else {
              working_msg == null ? void 0 : working_msg.remove();
              working_msg = void 0;
            }
          });
          CommonProject.scripts.workResults.on("work-current-result-change", (cur) => {
            if (cur.searching) {
              if (working_msg)
                working_msg.innerHTML = loadingSpinSvg + ` 正在搜题 ${formatQuestionForMessage(cur.question)}`;
            }
          });
        }
      }).withEvents(),
      onlineSearch: new lib.Script({
        name: "🌐 在线搜题",
        matches: [["所有页面", /.*/]],
        namespace: "common.online-search",
        configs: {
          notes: {
            defaultValue: "查题前请在 “通用-全局设置” 中设置题库配置，才能进行在线搜题。"
          },
          selectSearch: {
            label: "划词搜索",
            defaultValue: true,
            attrs: { type: "checkbox", title: "使用鼠标滑动选择页面中的题目进行搜索。" }
          },
          searchValue: {
            sync: true,
            label: "搜索题目",
            tag: "textarea",
            attrs: {
              placeholder: "输入题目，请尽量保证题目完整，不要漏字",
              style: {
                minWidth: "300px",
                minHeight: "64px"
              }
            },
            defaultValue: ""
          }
        },
        oncomplete() {
          document.addEventListener(
            "selectionchange",
            debounce_1$1(() => {
              var _a;
              if (this.cfg.selectSearch) {
                const val = ((_a = document.getSelection()) == null ? void 0 : _a.toString()) || "";
                if (val) {
                  this.cfg.searchValue = val;
                }
              }
            }, 500)
          );
        },
        onrender({ panel }) {
          const content = lib.h("div", "", (content2) => {
            content2.style.marginBottom = "12px";
          });
          const search = async (value) => {
            if (CommonProject.scripts.settings.cfg.answererWrappers.length === 0) {
              lib.$modal.alert({ content: "请先在 通用-全局设置 配置题库，才能进行在线搜题。" });
              return;
            }
            content.replaceChildren(lib.h("span", "搜索中..."));
            if (value) {
              const t2 = Date.now();
              const { env } = await buildAnswererEnv({
                title: value,
                enableImageOptimize: CommonProject.scripts.settings.cfg.imageOptimize
              });
              const infos = await defaultAnswerWrapperHandler(CommonProject.scripts.settings.cfg.answererWrappers, env);
              const resume = ((Date.now() - t2) / 1e3).toFixed(2);
              content.replaceChildren(
                lib.h(
                  "div",
                  [
                    lib.h("hr"),
                    lib.h(
                      "div",
                      { style: { color: "#a1a1a1" } },
                      `搜索到 ${infos.map((i) => i.results).flat().length} 个结果，共耗时 ${resume} 秒`
                    ),
                    lib.h(SearchInfosElement, {
                      infos: infos.map((info) => ({
                        results: info.results.map(
                          (res) => [res.question, res.answer, res.extra_data]
                        ),
                        homepage: info.homepage,
                        name: info.name,
                        error: info.error
                      })),
                      question: value
                    })
                  ],
                  (div) => {
                    div.classList.add("card");
                    div.style.width = "480px";
                  }
                )
              );
            } else {
              content.replaceChildren(lib.h("span", "题目不能为空！"));
            }
          };
          const button = lib.h("button", "搜索", (button2) => {
            button2.className = "base-style-button";
            button2.style.width = "120px";
            button2.onclick = () => {
              search(this.cfg.searchValue);
            };
          });
          const searchContainer = lib.h("div", { style: { textAlign: "end" } }, [button]);
          panel.body.append(lib.h("div", [content, searchContainer]));
        }
      }),
      edgeMinimize: new lib.Script({
        name: "边缘最小化图标模式",
        matches: [["所有页面", /.*/]],
        hideInPanel: true,
        onactive() {
          if (self !== top) {
            return;
          }
          initEdgeMinimize();
        }
      }),
      hack: new lib.Script({
        name: "页面复制粘贴限制解除",
        matches: [["所有页面", /.*/]],
        hideInPanel: true,
        onactive() {
          enableCopy([document, document.body]);
        },
        oncomplete() {
          enableCopy([document, document.body]);
          insertCopyableStyle();
          setTimeout(() => {
            enableCopy([document, document.body]);
            insertCopyableStyle();
          }, 3e3);
        }
      }),
      disableDialog: new lib.Script({
        name: "禁止弹窗",
        matches: [["所有页面", /.*/]],
        hideInPanel: true,
        priority: 1,
        onstart() {
          function disableDialog(msg) {
            lib.$modal.alert({
              profile: "弹窗来自：" + location.origin,
              content: msg
            });
          }
          try {
            lib.$gm.unsafeWindow.alert = disableDialog;
            window.alert = disableDialog;
          } catch (e) {
            console.error(e);
          }
        }
      })
    }
  });
  function insertCopyableStyle() {
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
  const createGuide = () => {
    const showProjectDetails = (project2) => {
      lib.$modal.simple({
        title: project2.name,
        width: 800,
        content: lib.h("div", [
          lib.h("div", [
            "运行域名：",
            ...(project2.domains || []).map(
              (d) => lib.h(
                "a",
                { href: d.startsWith("http") ? d : "https://" + d, target: "_blank", style: { margin: "0px 4px" } },
                d
              )
            )
          ]),
          lib.h("div", "脚本列表："),
          lib.h(
            "ul",
            Object.keys(project2.scripts).sort((a, b) => project2.scripts[b].hideInPanel ? -1 : 1).map((key) => {
              const script2 = project2.scripts[key];
              return lib.h(
                "li",
                [
                  lib.h("b", script2.name),
                  lib.$ui.notes([
                    lib.h("span", ["操作面板：", script2.hideInPanel ? "隐藏" : "显示"]),
                    [
                      "运行页面：",
                      lib.h(
                        "ul",
                        script2.matches.map((m) => Array.isArray(m) ? m : ["无描述", m]).map(
                          (i) => lib.h("li", [
                            i[0],
                            "：",
                            i[1] instanceof RegExp ? i[1].toString().replace(/\\/g, "").slice(1, -1) : lib.h("span", i[1])
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
              ul.style.padding = "12px 24px";
              ul.style.border = "1px solid #e1e1e1";
              ul.style.borderRadius = "4px";
              ul.style.maxHeight = "400px";
              ul.style.overflow = "auto";
              ul.style.paddingLeft = "42px";
            }
          )
        ])
      });
    };
    const gotoHome = lib.h("button", { className: "base-style-button-secondary" }, "🏡官网教程");
    gotoHome.onclick = () => window.open("https://docs.ocsjs.com", "_blank");
    const contactUs = lib.h("button", { className: "base-style-button-secondary" }, "🗨️交流群");
    contactUs.onclick = () => window.open("https://docs.ocsjs.com/docs/about#交流方式", "_blank");
    const changeLog = lib.h("button", { className: "base-style-button-secondary" }, "📄更新日志");
    changeLog.onclick = () => BackgroundProject.scripts.update.methods.showChangelog();
    const closeGuide = lib.h("button", { className: "base-style-button-secondary" }, "📄如何关闭脚本？");
    closeGuide.onclick = () => window.open("https://docs.ocsjs.com/docs/script#%E5%85%B3%E9%97%AD%E8%84%9A%E6%9C%AC%E6%95%99%E7%A8%8B", "_blank");
    return lib.h("div", { className: "user-guide" }, [
      lib.h("div", [
        lib.h("div", { style: { marginBottom: "4px", fontWeight: "bold" } }, [
          "✨兼容的网课平台：",
          lib.h("span", { className: "secondary", style: { fontWeight: "normal" } }, "（未适配的平台将无法运行，请等待适配）")
        ]),
        lib.h(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "400px" } },
          [CXProject, ZHSProject, ZJYProject, IcveMoocProject, ICourseProject, YKTProject].map((project2) => {
            const btn = lib.h("button", { className: "base-style-button-secondary" }, [project2.name]);
            btn.onclick = () => {
              showProjectDetails(project2);
            };
            return lib.h("span", [btn]);
          })
        )
      ]),
      lib.h("div", { style: { margin: "12px 0px" } }, [
        lib.h("div", { style: { marginBottom: "8px", fontWeight: "bold" } }, "🌐快捷访问："),
        gotoHome,
        contactUs,
        changeLog,
        closeGuide
      ])
    ]);
  };
  const typeMismatchTexts = {
    single: "⚠️ 给出的答案和选项不匹配，可能是题库答案错误",
    multiple: "⚠️ 给出的答案和选项不匹配，可能是题库答案错误",
    judgement: "⚠️ 无法选择，可能是题库答案错误",
    completion: "⚠️ 给出的答案无法填入，可能是题库答案错误或者格式错误"
  };
  function createSearchResultAlertElement(result) {
    var _a;
    let info = null;
    let err = result.error || ((_a = result.searchInfos.find((i) => i.error)) == null ? void 0 : _a.error);
    if (result.requested === false && result.resolved === false) {
      info = lib.h("div", { className: "result-info unresolved" }, "等待搜索中... 🔍");
    } else if (err) {
      let href = "";
      if (err == null ? void 0 : err.includes("is not valid JSON")) {
        err = "题库返回数据错误";
        href = "https://docs.ocsjs.com/docs/other/FQA#tk-data-error";
      } else if (err == null ? void 0 : err.includes("题库连接失败")) {
        err = "题库连接失败";
        href = "https://docs.ocsjs.com/docs/other/FQA#tk-error";
      }
      if (href) {
        info = lib.h("div", { className: "result-info error" }, [
          "❌ " + err,
          lib.h("a", { href, target: "_blank", style: { marginLeft: "3px" } }, "解决方法?")
        ]);
      } else {
        info = lib.h("div", { className: "result-info error" }, ["❌ " + err]);
      }
    } else if (result.searchInfos.length === 0) {
      info = lib.h("div", { className: "result-info no-answer" }, "❌ 题库没搜索到答案");
    } else {
      const mismatchText = result.type && typeMismatchTexts[result.type] || typeMismatchTexts.single;
      info = result.finish ? null : result.resolved === false ? lib.h("div", { className: "result-info unresolved" }, "等待顺序答题中... ⏱️") : lib.h("div", { className: "result-info warn" }, mismatchText);
    }
    return lib.h("div", { className: "alert-info-wrapper" }, [info != null ? info : lib.h("div")]);
  }
  const playbackRate$1 = {
    label: "视频倍速",
    tag: "select",
    attrs: { title: "目前智慧树倍速最高只能1.5x，超出有封号风险" },
    defaultValue: 1,
    options: [
      ["1", "1 x"],
      ["1.25", "1.25 x"],
      ["1.5", "1.5 x"]
    ]
  };
  const reloadWhenError = {
    label: "视频黑屏时自动刷新",
    attrs: { type: "checkbox", title: "当视频出现加载失败，或者黑屏等异常时，自动刷新页面3次尝试修复" },
    defaultValue: true
  };
  const studyNotes$1 = {
    defaultValue: lib.$ui.notes([
      "请手动进入视频、作业、考试页面，脚本会自动运行。",
      "章节测试/掌握度请大家观看完视频后手动打开。",
      [
        "请大家仔细打开视频上方的“学前必读”，查看成绩分布。",
        "如果“平时成绩-学习习惯成绩”占比多的话，就需要规律学习。",
        "每天定时半小时可获得一分习惯分，如不需要可忽略。"
      ],
      "不要最小化浏览器/关闭电脑屏幕，可能导致脚本暂停。",
      "请使用时关闭卡巴斯基软件，否则会被检测出异常脚本。",
      "运行中请将浏览器缩放调整至适合的大小（例如 50%），避免元素遮挡导致无法点击。",
      "兴趣课会自动下一个，所以不提供脚本。"
    ]).outerHTML
  };
  const workNotes = {
    defaultValue: lib.$ui.notes([
      "自动答题前请在 “通用-全局设置” 中设置题库配置。",
      "可以搭配 “通用-在线搜题” 一起使用。",
      "⚠️ 如果没开始答题，请尝试刷新页面。",
      "⚠️ 禁止一次性打开多个作业/考试页面。",
      ["⚠️ 答题中请勿进行任何操作，如需暂停请", "等待全部题目搜索完成并执行自动保存功能后再操作。"]
    ]).outerHTML
  };
  const workDelay = {
    label: "作业答题开始时间延迟（秒）",
    defaultValue: 3,
    attrs: { type: "number", min: "1", step: "1", max: "10" }
  };
  const readNotes = {
    defaultValue: false
  };
  const stopTime = {
    label: "定时停止",
    tag: "select",
    attrs: {
      title: "到时间后自动暂停脚本。仅在共享课系列学习页面生效：\n共享课学习页面(studyvideoh5.zhihuishu.com)、\n新共享课学习页面(studyplush5.zhihuishu.com)、\n新版AI课页面(fusioncourseh5.zhihuishu.com/stuStudy)、\n2025-9月新智慧共享课学习页面(studywisdomh5.zhihuishu.com/study/index)。其它学习平台（新形态/校内课/新智慧/AI教学空间）不受此配置影响。"
    },
    defaultValue: "0",
    options: [
      ["0", "关闭"],
      ["0.5", "半小时后"],
      ["1", "一小时后"],
      ["2", "两小时后"]
    ]
  };
  const switchMode = {
    label: "跳转模式",
    tag: "select",
    attrs: {
      title: "章节跳转方式。仅在新形态课程学习页面生效：\nsmartcoursestudent.zhihuishu.com \n及其新域名 ai-smart-course-student-pro.zhihuishu.com 的学习页/课程首页。其它学习平台（共享课/校内课/新智慧/AI教学空间）不受此配置影响。"
    },
    defaultValue: "job",
    options: [
      ["job", "只跳转必学章节", "章节后面有必学，并且必学数量未完成的章节，如果全部完成将停止学习"],
      ["all", "顺序跳转"]
    ]
  };
  const skipStudyTimeWarnDialog = {
    label: "忽略习惯分弹窗",
    attrs: {
      title: "忽略学习时长达到习惯分时弹出的提示弹窗。仅在\n新智慧学习页面(wisdom-mooc.zhihuishu.com/study/index)生效。开启后将不再弹出习惯分提示，但如果课程有习惯分需要自行控制学习时长，忽略提示可能拿不到习惯分。",
      type: "checkbox"
    },
    defaultValue: false
  };
  const studyCenterConfigs = {
    notes: studyNotes$1,
    playbackRate: playbackRate$1,
    volume,
    definition,
    restudy,
    reloadWhenError,
    stopTime: { ...stopTime, separator: "平台相关高级选项（仅在对应学习页生效）" },
    switchMode,
    skipStudyTimeWarnDialog
  };
  const workCenterConfigs = {
    notes: workNotes,
    workDelay,
    readNotes
  };
  const legacyZhsStudyNamespaces = [
    "zhs.gxk.study",
    "zhs.smart.study",
    "zhs.xnk.study",
    "zhs.wisdom.study",
    "zhs.hike.study",
    "zhs.hike_v2.study"
  ];
  const zhsStudyNamespace = "zhs.study";
  const legacyZhsWorkNamespaces = [
    "zhs.gxk.work",
    "zhs.smart.work",
    "zhs.xnk.work",
    "zhs.hike.work",
    "zhs.hike.homework"
  ];
  const zhsWorkNamespace = "zhs.work";
  const legacyIcourseStudyNamespaces = ["icourse.study-v1", "icourse.study-v2"];
  const icourseStudyNamespace = "icourse.study";
  function migrateNamespace(sourceNamespaces, targetNamespace) {
    for (const ns of sourceNamespaces) {
      for (const key of lib.$store.list()) {
        if (!key.startsWith(ns + "."))
          continue;
        const newKey = targetNamespace + key.slice(ns.length);
        if (lib.$store.get(newKey) === void 0) {
          lib.$store.set(newKey, lib.$store.get(key));
        }
        lib.$store.delete(key);
      }
    }
  }
  function migrateZhsStudyConfigs() {
    migrateNamespace(legacyZhsStudyNamespaces, zhsStudyNamespace);
  }
  function migrateZhsWorkConfigs() {
    migrateNamespace(legacyZhsWorkNamespaces, zhsWorkNamespace);
  }
  function migrateIcourseStudyConfigs() {
    migrateNamespace(legacyIcourseStudyNamespaces, icourseStudyNamespace);
  }
  async function waitForMedia(options) {
    var _a;
    const timeoutMs = (_a = options == null ? void 0 : options.timeout) != null ? _a : 3 * 60 * 1e3;
    const res = await new Promise((resolve, reject) => {
      let timeoutId;
      const interval = setInterval(() => {
        const video = ((options == null ? void 0 : options.root) || document).querySelector(
          `${(options == null ? void 0 : options.videoSelector) || "video"},${(options == null ? void 0 : options.audioSelector) || "audio"}`
        );
        if (video && (!(options == null ? void 0 : options.filter) || options.filter(video))) {
          clearInterval(interval);
          if (timeoutId !== void 0) {
            clearTimeout(timeoutId);
          }
          resolve(video);
        }
      }, 200);
      timeoutId = setTimeout(() => {
        clearInterval(interval);
        reject(new Error("视频/音频未找到，或者加载超时。"));
      }, timeoutMs);
    });
    return res;
  }
  function waitForElement(selector, opts) {
    return waitFor(() => {
      return typeof selector === "function" ? selector() : document.querySelector(selector);
    }, opts);
  }
  function waitFor(predicate, opts) {
    const { timeout_seconds, check_period_ms = 1e3, timeout_message } = opts != null ? opts : {};
    return new Promise((resolve, reject) => {
      let timeoutId;
      let isRunning = false;
      let finished = false;
      const intervalId = setInterval(poll, check_period_ms);
      const cleanup = () => {
        finished = true;
        clearInterval(intervalId);
        if (timeoutId)
          clearTimeout(timeoutId);
      };
      async function poll() {
        if (isRunning || finished)
          return;
        isRunning = true;
        try {
          const result = await predicate();
          if (finished)
            return;
          if (result) {
            cleanup();
            resolve(result);
          }
        } catch (err) {
          cleanup();
          reject(err);
          return;
        } finally {
          isRunning = false;
        }
      }
      poll();
      if (timeout_seconds != null) {
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error(timeout_message != null ? timeout_message : `waitFor timeout ${timeout_seconds}s`));
        }, timeout_seconds * 1e3);
      }
    });
  }
  const $playwright = {
    showError: () => {
      const href = "https://docs.ocsjs.com/docs/script-helper";
      const errorEl = lib.h("div", [
        "当前页面需要下载OCS桌面端，并在桌面端中新建浏览器，在新建的浏览器中才能进行正常刷课，点击链接查看详情 => ",
        lib.h("a", { href, target: "_blank" }, href)
      ]);
      lib.$modal.alert({
        maskCloseable: false,
        title: "⛔ 错误",
        confirmButtonText: "查看详情",
        content: errorEl.cloneNode(true),
        onConfirm() {
          window.open(href, "_blank");
        }
      });
      lib.$message.error({ content: errorEl.cloneNode(true), duration: 0 });
    }
  };
  const state$5 = {
    study: {
      stop: false,
      currentMedia: void 0,
      stopInterval: 0,
      stopMessage: void 0
    }
  };
  const remote_not_required_pages = [
    "fusioncourseh5.zhihuishu.com",
    "studywisdomh5.zhihuishu.com",
    "wisdom-mooc.zhihuishu.com"
  ];
  const gxk_read_notes = [
    "⚠️ 如果未开始答题，请尝试刷新页面。",
    "⚠️ 禁止同时打开多个作业/考试页面。",
    ["⚠️ 答题中请勿进行任何操作，如需暂停答题", "请等待全部题目搜索完成并执行自动保存功能后才能操作。"],
    ["⚠️ 暂停后手动操作请确保每个题目都点击下一题", "进行答案保存（不然不会保存，提交没分）"]
  ];
  class StudyVideoH5 {
    constructor() {
      this.remotePage = void 0;
    }
    async init() {
      this.remotePage = await BackgroundProject.scripts.dev.methods.getRemotePlaywrightCurrentPage();
      if (!this.remotePage) {
        throw $playwright.showError();
      }
    }
    getCourseName() {
      var _a;
      return ((_a = lib.$el(".source-name")) == null ? void 0 : _a.textContent) || "无名称";
    }
    getChapterName(root2) {
      var _a;
      return ((_a = root2.querySelector(".catalogue_title")) == null ? void 0 : _a.textContent) || "未知章节";
    }
    getNext(opts) {
      let videoItems = Array.from(document.querySelectorAll(".clearfix.video"));
      if (!opts.restudy) {
        videoItems = videoItems.filter((el) => el.querySelector(".time_icofinish") === null);
      }
      for (let i = 0; i < videoItems.length; i++) {
        const item = videoItems[i];
        if (item.classList.contains("current_play")) {
          return videoItems[i + (opts.next ? 1 : 0)];
        }
      }
      return videoItems[0];
    }
    async switchPlaybackRate(rate) {
      var _a;
      const controlsBar = lib.$el(".controlsBar");
      const sl = lib.$el(".speedList");
      if (controlsBar && sl) {
        controlsBar.style.display = "block";
        sl.style.display = "block";
        const rate_parsed = parseFloat(String(rate));
        const selector = `.speedList [rate="${rate_parsed === 1 ? "1.0" : rate}"],.speedList [rate="${rate_parsed === 1 ? "1" : rate}"]`;
        if (this.remotePage) {
          await this.remotePage.click(selector);
        } else {
          (_a = document.querySelector(selector)) == null ? void 0 : _a.click();
        }
      }
    }
    async switchLine(definition2) {
      const controlsBar = lib.$el(".controlsBar");
      const dl = lib.$el(".definiLines");
      if (controlsBar && dl) {
        controlsBar.style.display = "block";
        dl.style.display = "block";
        const selector = `.definiLines .${definition2}:not(.active)`;
        const el = document.querySelector(selector);
        if (el) {
          if (this.remotePage) {
            await this.remotePage.click(selector);
          } else {
            el.click();
          }
        }
      }
    }
    hasJob() {
      var _a;
      return ((_a = lib.$$el(".clearfix.video")) == null ? void 0 : _a.length) > 0;
    }
    hideDialog() {
      lib.$$el(".el-dialog__wrapper").forEach((dialog) => {
        dialog.remove();
      });
    }
    async handleTestDialog() {
      var _a, _b;
      const items = lib.$$el("#playTopic-dialog .el-pager .number");
      if (items.length) {
        for (const item of items) {
          if (item.classList.contains("active") === false) {
            item.click();
            await lib.$.sleep(500);
          }
          const options = lib.$$el("#playTopic-dialog ul .topic-item");
          if (options.length !== 0) {
            await waitForCaptcha();
            $render.moveToEdge();
            const random = Math.floor(Math.random() * options.length);
            await lib.$.sleep(1e3);
            const btn_selector = `#playTopic-dialog .topic .radio ul > li:nth-child(${random + 1})`;
            if (this.remotePage) {
              await this.remotePage.click(btn_selector);
            } else {
              (_a = lib.$el(btn_selector)) == null ? void 0 : _a.click();
            }
            await lib.$.sleep(1e3);
          }
        }
        await lib.$.sleep(1e3);
        const close_btn_selector = "#playTopic-dialog .close-btn,#playTopic-dialog .btn";
        if (this.remotePage) {
          await this.remotePage.click(close_btn_selector);
        } else {
          (_b = lib.$el(close_btn_selector)) == null ? void 0 : _b.click();
        }
      }
      await lib.$.sleep(3e3);
      await this.handleTestDialog();
    }
  }
  class FusionCourseH5 extends StudyVideoH5 {
    getCourseName() {
      return "智慧课程-AI";
    }
    getChapterName(root2) {
      const is_resource_box_mode = !!document.querySelector(".resource-box");
      if (is_resource_box_mode) {
        const card_name = root2.querySelector(".file-name");
        if (card_name) {
          return card_name.textContent || "未知章节";
        }
      }
      return super.getChapterName(root2);
    }
    getNext(opts) {
      const is_resource_box_mode = !!document.querySelector(".resource-box");
      if (is_resource_box_mode) {
        const getNextCard = () => {
          const cards = Array.from(document.querySelectorAll(".resources-item"));
          let target_el;
          let start2 = false;
          for (let index = 0; index < cards.length; index++) {
            const card = cards[index];
            if (start2) {
              if (opts.restudy) {
                target_el = card;
                break;
              } else {
                if (card.querySelector(".isFinish")) {
                  continue;
                }
                target_el = card;
                break;
              }
            }
            if (card.className.includes("active")) {
              start2 = true;
            }
          }
          return target_el;
        };
        const next_card = getNextCard();
        if (next_card) {
          return next_card;
        }
      }
      let videoItems = Array.from(document.querySelectorAll(".clearfix.video")).filter((el) => {
        if (is_resource_box_mode) {
          return !!el.querySelector(".resource-box");
        }
        return true;
      });
      console.log(videoItems);
      if (!opts.restudy) {
        if (is_resource_box_mode) {
          videoItems = videoItems.filter((el) => {
            var _a;
            const text2 = ((_a = el.querySelector(".resource-text")) == null ? void 0 : _a.textContent) || "";
            const [progress, total] = text2.replace("必学", "").trim().split("/").map((s) => parseInt(s));
            return progress < total;
          });
        } else {
          videoItems = videoItems.filter((el) => {
            const num_el = el.querySelector(".progress-num");
            return num_el === null || num_el.textContent !== "100%";
          });
        }
      }
      for (let i = 0; i < videoItems.length; i++) {
        const item = videoItems[i];
        if (is_resource_box_mode) {
          if (item.classList.contains("activeNode")) {
            return videoItems[i + (opts.next ? 1 : 0)];
          }
        } else {
          if (item.classList.contains("current_play")) {
            return videoItems[i + (opts.next ? 1 : 0)];
          }
        }
      }
      return videoItems[0];
    }
  }
  class StudyPlusH5 extends StudyVideoH5 {
    getCourseName() {
      var _a, _b, _c;
      return ((_c = (_b = (_a = lib.$el(".top-back-box > span:nth-child(2)")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.match(/课程名称：(.+)/)) == null ? void 0 : _c[1]) || "无名称";
    }
    getChapterName(item) {
      var _a;
      return ((_a = item.parentElement) == null ? void 0 : _a.textContent) || "未知章节";
    }
    hasJob() {
      var _a;
      return ((_a = lib.$$el(".child-main")) == null ? void 0 : _a.length) > 0;
    }
    getNext(opts) {
      let videoItems = Array.from(document.querySelectorAll(".child-main")).filter(
        (el) => {
          var _a;
          return (_a = el.parentElement) == null ? void 0 : _a.querySelector(".child-time");
        }
      );
      console.log(videoItems);
      if (!opts.restudy) {
        videoItems = videoItems.filter((el) => {
          var _a;
          if ((_a = el.parentElement) == null ? void 0 : _a.querySelector(".finish-icon")) {
            return false;
          }
          return true;
        });
      }
      for (let i = 0; i < videoItems.length; i++) {
        const item = videoItems[i];
        if (item.classList.contains("current")) {
          return videoItems[i + (opts.next ? 1 : 0)];
        }
      }
      return videoItems[0];
    }
    hideDialog() {
      lib.$$el(".el-overlay,.el-dialog").forEach((dialog) => {
        dialog.style.display = "none";
      });
    }
    async handleTestDialog(remotePage) {
      const question_box = lib.$el(".ai-test-question-wrapper");
      const done = lib.$el(".ai-test-question-wrapper .done");
      if (question_box) {
        lib.$message.info("正在关闭弹窗测验...");
        const close_btn = lib.$el(".close-box", question_box);
        if (done) {
          if (close_btn) {
            if (remotePage) {
              await remotePage.click(close_btn);
            } else {
              close_btn.click();
            }
          }
        } else {
          const options = lib.$$el(".options .option", question_box);
          if (options.length !== 0) {
            await waitForCaptcha();
            $render.moveToEdge();
            const random = Math.floor(Math.random() * options.length);
            await lib.$.sleep(1e3);
            if (remotePage) {
              await remotePage.click(options[random]);
            } else {
              options[random].click();
            }
            await lib.$.sleep(1e3);
          }
          await lib.$.sleep(1e3);
          const submit_btn = lib.$el(".submit-btn .submits");
          if (submit_btn) {
            if (remotePage) {
              await remotePage.click(submit_btn);
            } else {
              submit_btn.click();
            }
          }
          await lib.$.sleep(1e3);
          if (close_btn) {
            if (remotePage) {
              await remotePage.click(close_btn);
            } else {
              close_btn.click();
            }
          }
        }
      }
      await lib.$.sleep(3e3);
      await this.handleTestDialog(remotePage);
    }
  }
  class WishdomH5 extends StudyVideoH5 {
    getCourseName() {
      var _a, _b, _c;
      return ((_c = (_b = (_a = lib.$el(".course-name")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.match(/课程名称：(.+)/)) == null ? void 0 : _c[1]) || "无名称";
    }
    getChapterName(item) {
      return item.textContent || "未知章节";
    }
    hasJob() {
      var _a;
      return ((_a = lib.$$el(".chapter-content .chapter-content-second")) == null ? void 0 : _a.length) > 0;
    }
    getNext(opts) {
      let jobs = Array.from(document.querySelectorAll(".chapter-content .chapter-item"));
      jobs = jobs.map((el) => {
        const children = el.querySelectorAll(".chapter-content-second");
        if (children.length > 0) {
          return Array.from(children);
        } else {
          return [el];
        }
      }).flat();
      console.log(jobs);
      if (!opts.restudy) {
        jobs = jobs.filter((el) => {
          if (el.querySelector(".finish-icon")) {
            return false;
          }
          return true;
        });
      }
      for (let i = 0; i < jobs.length; i++) {
        const item = jobs[i];
        if (item.classList.contains("current")) {
          return jobs[i + (opts.next ? 1 : 0)];
        }
      }
      return jobs[0];
    }
    hideDialog() {
      lib.$$el(".el-overlay,.el-dialog").forEach((dialog) => {
        dialog.style.display = "none";
      });
    }
    async handleTestDialog(remotePage) {
      const question_box = lib.$el(".ai-class-exercise-dialog");
      if (question_box) {
        const options = lib.$$el(".ques-list .item .option");
        lib.$message.info("正在关闭弹窗测验...");
        if (options.length !== 0) {
          await waitForCaptcha();
          BackgroundProject.scripts.render.methods.minimize();
          BackgroundProject.scripts.render.methods.setPosition(100, 200);
          const random = Math.floor(Math.random() * options.length);
          await lib.$.sleep(1e3);
          if (remotePage) {
            await remotePage.click(options[random]);
          } else {
            options[random].click();
          }
          await lib.$.sleep(1e3);
        }
        await lib.$.sleep(1e3);
        const submit_btn = lib.$el(".ai-class-exercise-dialog .el-dialog__footer .el-button.btn");
        if (submit_btn) {
          if (remotePage) {
            await remotePage.hover(".ai-class-exercise-dialog .el-dialog__footer .el-button.btn");
            await remotePage.click(".ai-class-exercise-dialog .el-dialog__footer .el-button.btn");
          } else {
            submit_btn.click();
          }
        }
        const close_btn = lib.$el(".ai-class-exercise-dialog .header-icon");
        if (close_btn) {
          if (remotePage) {
            await remotePage.hover(".ai-class-exercise-dialog .header-icon");
            await remotePage.click(".ai-class-exercise-dialog .header-icon");
          } else {
            close_btn.click();
          }
        }
        lib.$message.info("弹窗测验已关闭");
      }
      await lib.$.sleep(3e3);
      await this.handleTestDialog(remotePage);
    }
  }
  class Hike extends StudyVideoH5 {
    getCourseName() {
      return "无名称";
    }
    getChapterName(item) {
      return item.textContent || "未知章节";
    }
    hasJob() {
      var _a;
      return ((_a = document.querySelectorAll(".source-icon")) == null ? void 0 : _a.length) > 0;
    }
    getNext(opts) {
      let jobs = Array.from(document.querySelectorAll(".source-icon")).map(
        (el) => {
          var _a;
          return (_a = el.parentElement) == null ? void 0 : _a.parentElement;
        }
      );
      console.log(jobs);
      if (!opts.restudy) {
        jobs = jobs.filter((el) => {
          if (el.querySelector("i.select")) {
            return false;
          }
          return true;
        });
      }
      for (let i = 0; i < jobs.length; i++) {
        const item = jobs[i];
        if (item.querySelector(".active-file")) {
          return jobs[i + (opts.next ? 1 : 0)];
        }
      }
      return jobs[0];
    }
    hideDialog() {
      lib.$$el(".el-overlay,.el-dialog").forEach((dialog) => {
        dialog.style.display = "none";
      });
    }
  }
  class HikeV2 extends StudyVideoH5 {
    getCourseName() {
      var _a;
      return ((_a = document.querySelector(".header-title-wrap")) == null ? void 0 : _a.textContent) || "无名称";
    }
    getChapterName() {
      var _a;
      return ((_a = document.querySelector(".el-tree-node.is-current .file-name")) == null ? void 0 : _a.textContent) || "未知章节";
    }
    hasJob() {
      var _a;
      return ((_a = document.querySelectorAll(".el-tree-node")) == null ? void 0 : _a.length) > 0;
    }
    getNext(opts) {
      const jobs = Array.from(document.querySelectorAll(".el-tree-node")).filter(
        (e) => {
          var _a;
          return ((_a = e.querySelector(".el-tree-node__children")) == null ? void 0 : _a.children.length) === 0;
        }
      );
      const current_index = jobs.findIndex((job) => job.classList.contains("is-current"));
      return jobs.find((job, i) => {
        return i > current_index && (opts.restudy ? true : !job.querySelector("label.success"));
      });
    }
    hideDialog() {
      lib.$$el(".el-overlay,.el-dialog").forEach((dialog) => {
        dialog.style.display = "none";
      });
    }
  }
  const ZHSProject = lib.Project.create({
    name: "知到智慧树",
    domains: [
      "zhihuishu.com",
      "polymas.com"
    ],
    scripts: {
      guide: new lib.Script({
        name: "💡 使用提示",
        matches: [
          ["学习首页", "https://onlineweb.zhihuishu.com/onlinestuh5"],
          ["首页", "https://www.zhihuishu.com/"]
        ],
        namespace: "zhs.guide",
        configs: {
          notes: {
            defaultValue: createSteps(["登录网课平台", "进入任意视频、作业/考试界面", "等待脚本自动运行"]).outerHTML + lib.$ui.notes(["兴趣课会自动下一个，所以不提供脚本。"]).outerHTML
          }
        },
        oncomplete() {
          BackgroundProject.scripts.render.methods.pin(this);
          ensureWideViewport();
        },
        onrender({ panel }) {
          if (lib.$gm.isInGMContext()) {
            const gotoPanel = (scriptKey) => {
              const target = ZHSProject.scripts[scriptKey];
              target.projectName = ZHSProject.name;
              BackgroundProject.scripts.render.methods.pin(target);
            };
            panel.body.replaceChildren(
              lib.h("hr"),
              lib.$ui.button("👉 前往学习设置", {}, (btn) => {
                btn.style.marginRight = "12px";
                btn.onclick = () => gotoPanel("study-center");
              }),
              lib.$ui.button("👉 前往作业设置", {}, (btn) => {
                btn.onclick = () => gotoPanel("work-center");
              })
            );
          }
        }
      }),
      "study-center": new lib.Script({
        name: "🖥️ 自动学习",
        matches: [
          ["共享课学习页面", "studyvideoh5.zhihuishu.com"],
          ["新共享课学习页面", "studyplush5.zhihuishu.com"],
          ["新版AI课页面", "fusioncourseh5.zhihuishu.com/stuStudy"],
          ["2025-9月新智慧共享课学习页面", "studywisdomh5.zhihuishu.com/study/index"],
          ["新形态课程学习页面", "smartcoursestudent.zhihuishu.com/learnPage"],
          ["新形态课程新域名学习页面", "ai-smart-course-student-pro.zhihuishu.com/learnPage"],
          ["新形态课程首页", "smartcoursestudent.zhihuishu.com/singleCourse"],
          ["新形态课程新域名课程首页", "ai-smart-course-student-pro.zhihuishu.com/singleCourse"],
          ["校内课学习页面", "zhihuishu.com/aidedteaching/sourceLearning"],
          ["新智慧学习页面", "wisdom-mooc.zhihuishu.com/study/index"],
          ["AI教学空间学习首页", "hike-teaching-center.polymas.com/stu-hike/agent-course-hike/ai-course-center"],
          ["AI教学空间学习页面", "tools-hike/studentStudyResource"],
          ["AI教学空间学习首页(v2)", /polymas.com\/stu-hike\/agent-course-full\/.*\/stu\/(course-home|study)/],
          ["AI教学空间学习页面(v2)", "/stu/study/resource-detail"]
        ],
        namespace: zhsStudyNamespace,
        configs: studyCenterConfigs,
        oncomplete() {
          migrateZhsStudyConfigs();
          BackgroundProject.scripts.render.methods.pin(this);
        }
      }),
      "work-center": new lib.Script({
        name: "📝 作业考试",
        matches: [
          ["共享课作业页面", "zhihuishu.com/stuExamWeb.html#/webExamList/dohomework"],
          ["共享课考试页面", "zhihuishu.com/stuExamWeb.html#/webExamList/doexamination"],
          ["作业考试列表", "zhihuishu.com/stuExamWeb.html#/webExamList\\?"],
          ["新形态课程作业页面", "smartcourseexam.zhihuishu.com/ReviewExam"],
          ["新形态课程-掌握提升页面", "studentexamcomh5.zhihuishu.com/studentReviewTestOrExam"],
          ["新形态课程-AI助教掌握度", "fusioncourseh5.zhihuishu.com/exam"],
          ["新形态课程-新AI助教掌握度", "studywisdomh5.zhihuishu.com/exam"],
          ["新形态课程-新AI学伴掌握度", "wisdom-mooc.zhihuishu.com/exam"],
          ["新形态课程-新AI学伴掌握度首页", "wisdom-mooc.zhihuishu.com/study/analysis"],
          ["新形态课程-考试界面", "examloop.zhihuishu.com/exam"],
          ["校内课作业页面", "zhihuishu.com/atHomeworkExam/stu/homeworkQ/exerciseList"],
          ["校内课考试页面", "zhihuishu.com/atHomeworkExam/stu/examQ/examexercise"],
          ["AI教学中心-作业任务页面", "/stu-hike/stuHomeworkDo"],
          ["AI教学中心-题目作业", "/stu/answer-homework"],
          ["AI教学中心-考试页面", "/stu-exam/answer-exam"]
        ],
        namespace: zhsWorkNamespace,
        configs: workCenterConfigs,
        oncomplete() {
          migrateZhsWorkConfigs();
          BackgroundProject.scripts.render.methods.pin(this);
          if (location.href.includes("wisdom-mooc.zhihuishu.com/study/analysis")) {
            return lib.$message.info({ content: "请手动进入掌握度进行自动答题。", duration: 10 });
          }
        }
      }),
      "gxk-study": new lib.Script({
        name: "🖥️ 共享课-学习脚本",
        hideInPanel: true,
        matches: [
          ["共享课学习页面", "studyvideoh5.zhihuishu.com"],
          ["新共享课学习页面", "studyplush5.zhihuishu.com"],
          ["新版AI课页面", "fusioncourseh5.zhihuishu.com/stuStudy"],
          ["2025-9月新智慧共享课学习页面", "studywisdomh5.zhihuishu.com/study/index"]
        ],
        namespace: zhsStudyNamespace,
        configs: {
          studyRecord: {
            defaultValue: [],
            extra: {
              appConfigSync: false
            }
          },
          stopTime,
          restudy,
          reloadWhenError,
          volume,
          definition,
          playbackRate: playbackRate$1
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
        onrender({ panel }) {
          panel.body.replaceChildren(
            lib.h("hr"),
            lib.$ui.button("⏰检测是否需要规律学习", {}, (btn) => {
              btn.style.marginRight = "12px";
              btn.onclick = () => {
                var _a;
                const href = ((_a = document.querySelector("[href*=stuLearnReportNew]")) == null ? void 0 : _a.getAttribute("href")) || "";
                if (href) {
                  lib.$modal.alert({
                    title: "规律学习检测",
                    content: `自动检测功能已失效，<a href="${href}"> -> 点击此处 <- </a> 前往成绩分析页面，点击 <b>"学习习惯"</b> 即可查看习惯分详情。`
                  });
                } else {
                  lib.$modal.alert({
                    title: "提示",
                    content: "自动检测功能已失效，请自行前往成绩分析页面，点击学习习惯即可查看习惯分详情。"
                  });
                }
              };
            }),
            lib.$ui.button("📘查看学习记录", {}, (btn) => {
              btn.onclick = () => {
                lib.$modal.alert({
                  title: "学习记录",
                  content: lib.$ui.notes(
                    this.cfg.studyRecord.map((r) => {
                      const date = new Date(r.date);
                      return [
                        `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`,
                        lib.$ui.notes(r.courses.map((course) => `${course.name} - ${optimizeSecond(course.time)}`))
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
          migrateZhsStudyConfigs();
          const type = location.href.includes("fusioncourseh5") ? "AI课程" : location.href.includes("studyplush5") ? "新共享课" : location.href.includes("studywisdomh5") ? "新智慧共享课" : "共享课";
          const ProcessorConstructor = location.href.includes("fusioncourseh5") ? FusionCourseH5 : location.href.includes("studyplush5") || location.href.includes("studywisdomh5") ? StudyPlusH5 : StudyVideoH5;
          const processor = new ProcessorConstructor();
          setTimeout(() => {
            if (processor.hasJob() === false) {
              finishAlert();
            }
          }, 10 * 1e3);
          const waitForVideoJob = () => {
            return new Promise((resolve, reject) => {
              if (processor.hasJob()) {
                resolve();
              } else {
                setTimeout(() => {
                  resolve(waitForVideoJob());
                }, 200);
              }
            });
          };
          await waitForVideoJob();
          await processor.init();
          this.onConfigChange("stopTime", (stopTime2) => {
            if (stopTime2 === "0") {
              lib.$message.info({ content: "定时停止已关闭" });
            } else {
              autoStop(stopTime2);
            }
          });
          this.onConfigChange("volume", (curr) => {
            state$5.study.currentMedia && (state$5.study.currentMedia.volume = curr);
          });
          this.onConfigChange("playbackRate", (curr) => {
            if (typeof curr === "string") {
              this.cfg.playbackRate = parseFloat(curr);
            }
            processor.switchPlaybackRate(curr);
          });
          this.onConfigChange("definition", (curr) => {
            processor.switchLine(curr);
          });
          const recordStudyTimeLoop = () => {
            this.methods.increaseStudyTime(processor.getCourseName(), this.cfg.playbackRate);
            setTimeout(recordStudyTimeLoop, 1e3);
          };
          closeDialogRead();
          recordStudyTimeLoop();
          autoStop(this.cfg.stopTime);
          processor.hideDialog();
          processor.handleTestDialog(processor.remotePage);
          setInterval(async () => {
            lib.$$el(".v-modal,.mask").forEach((modal2) => {
              modal2.remove();
            });
            fixProcessBar();
          }, 3e3);
          lib.$message.info({ content: "3秒后开始学习", duration: 3 });
          const remotePage = processor.remotePage;
          const study2 = async (opts) => {
            if (state$5.study.stop === false) {
              const item = processor.getNext({ next: opts.next, restudy: this.cfg.restudy });
              if (item) {
                const msg = "即将学习：" + processor.getChapterName(item);
                lib.$message.info({ content: msg });
                $console.log(msg);
                await lib.$.sleep(3e3);
                $render.moveToEdge();
                if (remotePage) {
                  if (type === "新共享课") {
                    await remotePage.click(".title-box");
                    await lib.$.sleep(200);
                  }
                  await remotePage.click(item);
                  await lib.$.sleep(1e3);
                  await remotePage.click(item);
                  await lib.$.sleep(1e3);
                } else {
                  item.click();
                }
                if (type === "AI课程" && document.querySelector(".preview-warp .doc-box,.preview-warp .ppt-box")) {
                  lib.$message.info({ content: "检测到PPT资源，即将跳过..." });
                  await lib.$.sleep(2e3);
                  study2({ next: true });
                  return;
                }
                watch$1(
                  processor,
                  {
                    reloadWhenError: this.cfg.reloadWhenError,
                    volume: this.cfg.volume,
                    playbackRate: this.cfg.playbackRate,
                    definition: this.cfg.definition
                  },
                  {
                    reload() {
                      if (type === "共享课") {
                        study2({ next: false });
                      } else {
                        location.reload();
                      }
                    },
                    onended({ next: next2 }) {
                      study2({ next: next2 });
                    }
                  }
                );
              } else {
                finishAlert();
              }
            } else {
              const msg = "检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。";
              lib.$message.warn({ content: msg });
              CommonProject.scripts.settings.methods.notificationBySetting(msg, {
                duration: 0,
                extraTitle: "知道智慧树学习脚本"
              });
            }
          };
          study2({ next: false });
        }
      }),
      "gxk-work": new lib.Script({
        name: "✍️ 共享课-作业考试脚本",
        hideInPanel: true,
        matches: [
          ["共享课作业页面", "zhihuishu.com/stuExamWeb.html#/webExamList/dohomework"],
          ["共享课考试页面", "zhihuishu.com/stuExamWeb.html#/webExamList/doexamination"],
          ["作业考试列表", "zhihuishu.com/stuExamWeb.html#/webExamList\\?"]
        ],
        namespace: zhsWorkNamespace,
        configs: {
          workDelay: {
            label: "作业答题开始时间延迟（秒）",
            defaultValue: 3,
            attrs: { type: "number", min: 1, step: 1, max: 10 }
          },
          readNotes: {
            defaultValue: false
          }
        },
        methods() {
          async function getWorkInfo(remotePage) {
            const isExam2 = location.href.includes("doexamination");
            let url = "";
            if (isExam2) {
              url = "/taurusExam/gateway/t/v1/student/doExam";
            } else {
              url = "/studentExam/gateway/t/v1/student/doHomework";
            }
            return JSON.parse((await remotePage.waitForResponse(url)).body);
          }
          return {
            getWorkInfo,
            work: async () => {
              const remotePage = await BackgroundProject.scripts.dev.methods.getRemotePlaywrightCurrentPage();
              if (!remotePage) {
                return $playwright.showError();
              }
              const isExam2 = location.href.includes("doexamination");
              const isWork2 = location.href.includes("dohomework");
              if (isExam2 || isWork2) {
                const workInfo = await getWorkInfo(remotePage);
                $render.moveToEdge();
                BackgroundProject.scripts.render.methods.normal();
                BackgroundProject.scripts.render.methods.pin(this);
                if (this.cfg.readNotes === false) {
                  const notes = lib.$ui.notes(gxk_read_notes).outerHTML;
                  const start2 = await new Promise((resolve, reject) => {
                    lib.$modal.confirm({
                      title: isExam2 ? "脚本考前须知" : "脚本作业须知",
                      content: notes,
                      confirmButtonText: "我已知晓，开始自动答题",
                      cancelButtonText: "取消答题",
                      maskCloseable: false,
                      onConfirm: () => {
                        this.cfg.readNotes = true;
                        resolve(true);
                      },
                      onCancel() {
                        resolve(false);
                      }
                    });
                  });
                  if (!start2) {
                    lib.$message.info({ content: "已取消答题，如需答题请刷新页面重新开始。" });
                    return;
                  }
                }
                setTimeout(() => {
                  var _a;
                  lib.$message.info({ content: `开始${isExam2 ? "考试" : "作业"}` });
                  commonWork({
                    mount_script: ZHSProject.scripts["work-center"],
                    workerProvider: (opts) => gxkWorkAndExam(workInfo, opts),
                    start_delay_seconds: (_a = this.cfg.workDelay) != null ? _a : 3
                  });
                }, 1e3);
              } else {
                lib.$message.info({ content: "📢 请手动进入作业/考试，如果未开始答题，请尝试刷新页面。", duration: 0 });
                BackgroundProject.scripts.render.methods.pin(this);
              }
            }
          };
        },
        async onactive() {
          this.methods.work();
          this.on("historychange", () => {
            this.methods.work();
          });
        }
      }),
      "smart-study": new lib.Script({
        name: "🖥️ 新形态课程-学习脚本",
        hideInPanel: true,
        matches: [
          ["新形态课程学习页面", "smartcoursestudent.zhihuishu.com/learnPage"],
          ["新形态课程新域名学习页面", "ai-smart-course-student-pro.zhihuishu.com/learnPage"],
          ["新形态课程首页", "smartcoursestudent.zhihuishu.com/singleCourse"],
          ["新形态课程新域名课程首页", "ai-smart-course-student-pro.zhihuishu.com/singleCourse"]
        ],
        namespace: zhsStudyNamespace,
        configs: {
          switchMode,
          restudy,
          volume,
          definition,
          playbackRate: playbackRate$1
        },
        oncomplete() {
          migrateZhsStudyConfigs();
          this.methods.start();
        },
        onhistorychange(type, ...args) {
          if (type === "push") {
            this.methods.start();
          }
        },
        methods() {
          return {
            start: async () => {
              if (location.href.includes("singleCourse")) {
                lib.$message.info({ content: "请点击任意章节开始进行自动学习", duration: 60 });
                return;
              }
              const processor = new StudyVideoH5();
              const getInfos = () => Array.from(document.querySelectorAll(".section-item-collapse-info"));
              const getChapterName = () => {
                var _a, _b;
                return (((_a = document.querySelector(".point-title-text")) == null ? void 0 : _a.textContent) || "未知章节") + "-" + (((_b = document.querySelector('[class*="card-container"].active .video-title')) == null ? void 0 : _b.textContent) || "未知小节");
              };
              const include_jobs = ["video", "book", "other", "text"];
              const getNextJob = () => {
                var _a, _b;
                const cards = Array.from(document.querySelectorAll('[class*="card-container"]'));
                if (cards.some((card) => card.classList.contains("active")) === false) {
                  return cards[0];
                }
                let target_el;
                const start_index = cards.findIndex((c) => c.classList.contains("active")) || 0;
                for (let index = start_index + 1; index < cards.length; index++) {
                  const card = cards[index];
                  if (this.cfg.restudy) {
                    target_el = card;
                    break;
                  } else {
                    if ((_b = (_a = card.querySelector(".finished-icon")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.includes("已完成")) {
                      continue;
                    }
                    target_el = card;
                    break;
                  }
                }
                return target_el;
              };
              const getNext = () => {
                var _a, _b;
                const infos = getInfos();
                const works = [];
                for (let index = 0; index < infos.length; index++) {
                  const info = infos[index];
                  const text2 = ((_a = info.querySelector(".collapse-info-progress .progress-text")) == null ? void 0 : _a.textContent) || "";
                  if (this.cfg.switchMode === "all") {
                    works.push({
                      info,
                      progress: 0,
                      total: 1
                    });
                  } else {
                    const [progress, total] = text2.replace("必学", "").trim().split("/").map((s) => parseInt(s));
                    if (progress < total) {
                      works.push({ progress, total, info });
                    }
                  }
                }
                let start2 = false;
                for (let index = 0; index < works.length; index++) {
                  const work2 = works[index];
                  if (start2) {
                    if (work2.progress < work2.total) {
                      return works[index].info;
                    }
                  }
                  if (work2.info.classList.contains("active")) {
                    if (this.cfg.switchMode === "all") {
                      return works[index + 1].info;
                    } else {
                      start2 = true;
                    }
                  }
                }
                return (_b = works[0]) == null ? void 0 : _b.info;
              };
              this.onConfigChange("volume", (curr) => {
                state$5.study.currentMedia && (state$5.study.currentMedia.volume = curr);
              });
              this.onConfigChange("playbackRate", (curr) => {
                if (typeof curr === "string") {
                  this.cfg.playbackRate = parseFloat(curr);
                }
                processor.switchPlaybackRate(curr);
              });
              this.onConfigChange("definition", (curr) => {
                processor.switchLine(curr);
              });
              const doWork = async () => {
                await lib.$.sleep(5 * 1e3);
                const next2 = async () => {
                  const nextJob = getNextJob();
                  if (nextJob) {
                    const nextJobTitle = nextJob.querySelector(".common-text");
                    if (include_jobs.some((job) => {
                      var _a;
                      return (_a = nextJob.querySelector(".icon-box")) == null ? void 0 : _a.classList.contains(job);
                    })) {
                      nextJobTitle.click();
                      await doWork();
                    } else {
                      document.querySelectorAll('[class*="card-container"].active').forEach((el) => el.classList.remove("active"));
                      nextJob == null ? void 0 : nextJob.classList.add("active");
                      await lib.$.sleep(1e3);
                      const _open = lib.$gm.unsafeWindow.open;
                      lib.$gm.unsafeWindow.open = () => null;
                      nextJobTitle.click();
                      const msg = "链接任务完成，即将自动下一节！";
                      lib.$message.info(msg);
                      setTimeout(async () => {
                        lib.$gm.unsafeWindow.open = _open;
                        await next2();
                      }, 3e3);
                    }
                    return;
                  }
                  const nextEl = getNext();
                  if (nextEl) {
                    nextEl.click();
                  } else {
                    finishAlert();
                  }
                };
                try {
                  const wrapper = document.querySelector(".video-player-wrapper");
                  if (!wrapper || wrapper.style.display === "none") {
                    throw new Error("视频加载失败");
                  }
                  await waitForMedia({
                    timeout: 5 * 1e3,
                    filter: (m) => m.src.length !== 0
                  });
                } catch {
                  const msg = "未找到学习视频，即将自动下一节！";
                  lib.$message.warn(msg);
                  $console.warn(msg);
                  await lib.$.sleep(3e3);
                  await next2();
                  return;
                }
                const set = async () => {
                  try {
                    await processor.switchLine(this.cfg.definition || "line1bq");
                    await lib.$.sleep(1e3);
                    await processor.switchPlaybackRate(this.cfg.playbackRate);
                    await lib.$.sleep(1e3);
                    const media = await waitForMedia({ timeout: 5 * 1e3, filter: (m) => m.src.length !== 0 });
                    await lib.$.sleep(1e3);
                    state$5.study.currentMedia = media;
                    if (media) {
                      media.currentTime = 1;
                      media.volume = this.cfg.volume;
                    }
                    return state$5.study.currentMedia;
                  } catch (e) {
                    $console.log("视频加载失败，请尝试刷新页面！：" + e);
                    lib.$message.error({ content: "视频加载失败，请尝试刷新页面！：" + e, duration: 0 });
                  }
                };
                const video = await set();
                if (!video) {
                  return;
                }
                playMedia(() => video == null ? void 0 : video.play()).then(() => {
                  const cn = getChapterName();
                  lib.$message.info({ content: "正在学习：" + cn });
                  $console.log("正在学习：" + cn);
                });
                video.onpause = async () => {
                  if (!(video == null ? void 0 : video.ended) && state$5.study.stop === false) {
                    await lib.$.sleep(1e3);
                    video == null ? void 0 : video.play();
                  }
                };
                video.onended = async () => {
                  lib.$message.info({ content: "即将自动跳转下一节" });
                  await lib.$.sleep(3e3);
                  await next2();
                };
              };
              doWork();
            }
          };
        }
      }),
      "smart-work": new lib.Script({
        name: "✍️ 新形态课程-作业/考试/掌握度脚本",
        hideInPanel: true,
        matches: [
          ["新形态课程作业页面", "smartcourseexam.zhihuishu.com/ReviewExam"],
          ["新形态课程-掌握提升页面", "studentexamcomh5.zhihuishu.com/studentReviewTestOrExam"],
          ["新形态课程-AI助教掌握度", "fusioncourseh5.zhihuishu.com/exam"],
          ["新形态课程-新AI助教掌握度", "studywisdomh5.zhihuishu.com/exam"],
          ["新形态课程-新AI学伴掌握度", "wisdom-mooc.zhihuishu.com/exam"]
        ],
        namespace: zhsWorkNamespace,
        configs: {
          workDelay: {
            label: "作业答题开始时间延迟（秒）",
            defaultValue: 3,
            attrs: { type: "number", min: 1, step: 1, max: 10 }
          }
        },
        methods() {
          return {
            start: async () => {
              var _a;
              let remotePage;
              const remote_not_required = remote_not_required_pages.some((domain2) => location.href.includes(domain2));
              remote_not_required ? await waitForElement(".exam-item") : await waitForElement(".questionContent");
              if (remote_not_required)
                ;
              else {
                remotePage = await BackgroundProject.scripts.dev.methods.getRemotePlaywrightCurrentPage();
                if (!remotePage) {
                  return $playwright.showError();
                }
                $render.moveToEdge();
                lib.$message.warn({ content: "答题完毕之前请勿操作页面！", duration: 0 });
              }
              commonWork({
                mount_script: ZHSProject.scripts["work-center"],
                workerProvider: (opts) => {
                  if (remote_not_required) {
                    return fusioncourseWork(remotePage, opts);
                  } else {
                    return smartWork(remotePage, opts);
                  }
                },
                start_delay_seconds: (_a = this.cfg.workDelay) != null ? _a : 3
              });
            }
          };
        },
        oncomplete() {
          this.methods.start();
        },
        onhistorychanged(type, ...args) {
          if (type === "pushed") {
            this.methods.start();
          }
        }
      }),
      "smart-exam": new lib.Script({
        name: "✍️ 新形态课程-考试脚本",
        hideInPanel: true,
        matches: [["新形态课程-考试界面", "examloop.zhihuishu.com/exam"]],
        namespace: zhsWorkNamespace,
        configs: {},
        methods() {
          return {
            start: async () => {
              BackgroundProject.scripts.render.methods.pin(this);
              await waitForElement(".question-area-content");
              if (document.querySelector('[mode="REVIEW_MODE"]')) {
                lib.$message.info("当前试卷状态已完成、脚本将停止运行。");
                return;
              }
              commonWork({
                mount_script: ZHSProject.scripts["work-center"],
                workerProvider: (opts) => {
                  return smartExam(void 0, opts);
                }
              });
            }
          };
        },
        oncomplete() {
          migrateZhsWorkConfigs();
          this.methods.start();
        }
      }),
      "xnk-study": new lib.Script({
        name: "🖥️ 校内课（翻转课）-学习脚本",
        hideInPanel: true,
        matches: [["校内课学习页面", "zhihuishu.com/aidedteaching/sourceLearning"]],
        namespace: zhsStudyNamespace,
        configs: {
          restudy,
          volume
        },
        oncomplete() {
          migrateZhsStudyConfigs();
          const finish = () => {
            lib.$modal.alert({
              content: "检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。"
            });
            CommonProject.scripts.settings.methods.notificationBySetting(
              "检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。",
              { duration: 0, extraTitle: "知道智慧树学习脚本" }
            );
          };
          this.onConfigChange("volume", (curr) => {
            state$5.study.currentMedia && (state$5.study.currentMedia.volume = curr);
          });
          const nextElement = () => {
            const list = document.querySelectorAll(".file-item");
            let passActive = false;
            for (let index = 0; index < list.length; index++) {
              const item = list[index];
              const finish2 = !!item.querySelector(".icon-finish");
              const needsStudy = !finish2 || finish2 && this.cfg.restudy;
              if (item.classList.contains("active")) {
                if (needsStudy) {
                  return list[index + 1];
                } else {
                  passActive = true;
                }
              }
              if (passActive && needsStudy) {
                return item;
              }
            }
          };
          const interval = setInterval(async () => {
            var _a, _b;
            const next2 = nextElement();
            if (next2) {
              clearInterval(interval);
              if (document.querySelector("#mediaPlayer")) {
                (_a = document.querySelector(".file-item.active")) == null ? void 0 : _a.scrollIntoView();
                const name = ((_b = next2.querySelector("#sourceTit")) == null ? void 0 : _b.textContent) || "未知视频";
                lib.$message.info("正在学习：" + name);
                watchXnk({ volume: this.cfg.volume }, () => {
                  lib.$message.info("视频完成播放，正在自动跳转下一节！");
                  setTimeout(() => {
                    const next22 = nextElement();
                    if (next22)
                      next22.click();
                  }, 3e3);
                });
              } else {
                setTimeout(() => {
                  const msg = "未找到学习视频，即将自动下一节！";
                  lib.$message.warn(msg);
                  $console.warn(msg);
                  const next22 = nextElement();
                  if (next22)
                    next22.click();
                }, 3e3);
              }
            }
          }, 1e3);
          setTimeout(() => {
            if (!nextElement()) {
              finish();
              clearInterval(interval);
            }
          }, 10 * 1e3);
        }
      }),
      "xnk-work": new lib.Script({
        name: "✍️ 校内课-作业考试脚本",
        hideInPanel: true,
        matches: [
          ["校内课作业页面", "zhihuishu.com/atHomeworkExam/stu/homeworkQ/exerciseList"],
          ["校内课考试页面", "zhihuishu.com/atHomeworkExam/stu/examQ/examexercise"]
        ],
        namespace: zhsWorkNamespace,
        configs: {},
        onhistorychanged(type) {
          var _a;
          if (type === "pushed") {
            (_a = this.oncomplete) == null ? void 0 : _a.call(this);
          }
        },
        async oncomplete() {
          migrateZhsWorkConfigs();
          commonWork({
            mount_script: ZHSProject.scripts["work-center"],
            workerProvider: xnkWork
          });
        }
      }),
      "wisdom-study": new lib.Script({
        name: "🖥️ 新智慧学习-学习脚本",
        hideInPanel: true,
        matches: [["2025-12月新智慧学习页面", "wisdom-mooc.zhihuishu.com/study/index"]],
        namespace: zhsStudyNamespace,
        configs: {
          restudy,
          skipStudyTimeWarnDialog,
          reloadWhenError,
          volume,
          definition,
          playbackRate: playbackRate$1
        },
        async oncomplete() {
          migrateZhsStudyConfigs();
          const processor = new WishdomH5();
          this.onConfigChange("volume", (curr) => {
            state$5.study.currentMedia && (state$5.study.currentMedia.volume = curr);
          });
          this.onConfigChange("playbackRate", async (curr) => {
            if (typeof curr === "string") {
              this.cfg.playbackRate = parseFloat(curr);
            }
            fixProcessBar();
            processor.switchPlaybackRate(curr);
          });
          this.onConfigChange("definition", async (curr) => {
            fixProcessBar();
            processor.switchLine(curr);
          });
          const next2 = async () => {
            var _a;
            const hidden = lib.$el(".chapter-wrapper.hidden");
            if (hidden) {
              if (processor.remotePage) {
                await processor.remotePage.click(".collapse-box");
              } else {
                await hidden.click();
              }
            }
            document.querySelectorAll(".el-collapse-item__wrap").forEach((e) => e.style.display = "");
            await lib.$.sleep(200);
            const nextJob = processor.getNext({ next: true, restudy: this.cfg.restudy });
            if (nextJob) {
              if (!this.cfg.skipStudyTimeWarnDialog && hasStudyTimeWarnDialog()) {
                lib.$message.warn({
                  content: "检测到习惯分弹窗，当天学习时间已满，如需继续学习，请手动关闭后，刷新页面重新运行脚本！（如想强制学习请前往脚本设置忽略弹窗）",
                  duration: 0
                });
                return;
              } else {
                await closeStudyTimeWarnDialog();
              }
              await waitForMasteryLevelDialogClose();
              await ((_a = processor.remotePage) == null ? void 0 : _a.click(nextJob));
              nextJob.scrollIntoView({ behavior: "smooth", block: "center" });
              doWork();
            } else {
              finishAlert();
            }
          };
          const closeMasteryLevelDialog = () => {
            return new Promise((resolve, reject) => {
              const check = () => {
                var _a;
                if (document.querySelector(".masterylevel-body")) {
                  (_a = processor.remotePage) == null ? void 0 : _a.click(".header-box .close-box");
                  lib.$message.info("掌握度页面已关闭，即将继续学习！");
                }
                setTimeout(check, 3e3);
              };
              check();
            });
          };
          const hasStudyTimeWarnDialog = () => {
            return !!Array.from(document.querySelectorAll(".el-overlay .content")).find(
              (el) => {
                var _a;
                return (_a = el.textContent) == null ? void 0 : _a.includes("保持良好的学习习惯");
              }
            );
          };
          const closeStudyTimeWarnDialog = () => {
            return new Promise((resolve, reject) => {
              const interval = setInterval(() => {
                var _a;
                const dialog = Array.from(document.querySelectorAll(".el-overlay")).find(
                  (el) => {
                    var _a2;
                    return (_a2 = el.textContent) == null ? void 0 : _a2.includes("保持良好的学习习惯");
                  }
                );
                if (dialog) {
                  const btn = dialog.querySelector(".el-dialog__header img");
                  if (btn)
                    (_a = processor.remotePage) == null ? void 0 : _a.click(btn);
                  clearInterval(interval);
                  resolve();
                }
              }, 1e3);
              setTimeout(() => {
                clearInterval(interval);
                resolve();
              }, 3 * 1e3);
            });
          };
          const waitForMasteryLevelDialogClose = async () => {
            return new Promise((resolve, reject) => {
              const check = () => {
                if (!document.querySelector(".masterylevel-body")) {
                  resolve();
                } else {
                  setTimeout(check, 200);
                }
              };
              check();
            });
          };
          const waitForLoad2 = () => {
            return new Promise((resolve, reject) => {
              const check = () => {
                if (document.querySelector(".video-play")) {
                  resolve();
                } else {
                  setTimeout(check, 3e3);
                }
              };
              check();
            });
          };
          await waitForLoad2();
          await lib.$.sleep(3e3);
          closeMasteryLevelDialog();
          processor.hideDialog();
          await processor.init();
          processor.handleTestDialog(processor.remotePage);
          setInterval(() => {
            fixProcessBar();
          }, 1e3);
          lib.$message.success({ content: "即将开始自动学习！" });
          const reload = async (e) => {
            $console.error(e);
            if (this.cfg.reloadWhenError) {
              const msg = "视频加载失败，即将刷新页面。";
              const reload_count = await lib.$store.getTab("reload-count");
              if (reload_count && reload_count > 3) {
                const msg2 = "视频加载失败/黑屏导致重新加载页面次数超过3次，请尝试关闭页面重新打开，或者检查网络连接！";
                await lib.$store.setTab("reload-count", 0);
                lib.$message.error({ content: msg2, duration: 0 });
                $console.log(msg2);
                CommonProject.scripts.settings.methods.notificationBySetting(msg2, {
                  duration: 0,
                  extraTitle: "知道智慧树学习脚本"
                });
                return;
              }
              await lib.$store.setTab("reload-count", (reload_count != null ? reload_count : 0) + 1);
              lib.$message.error(msg);
              $console.log(msg);
              setTimeout(() => {
                location.reload();
              }, 3e3);
            } else {
              const msg = "视频加载失败，即将跳过。";
              lib.$message.error(msg);
              $console.log(msg);
              next2();
            }
          };
          const doWork = async () => {
            await waitForCaptcha();
            const set = async () => {
              try {
                await lib.$.sleep(1e3);
                await processor.switchLine(this.cfg.definition || "line1bq");
                await lib.$.sleep(1e3);
                await processor.switchPlaybackRate(this.cfg.playbackRate);
                await lib.$.sleep(1e3);
                const media = await waitForMedia({ timeout: 5 * 1e3, filter: (m) => m.src.length !== 0 });
                await lib.$.sleep(1e3);
                state$5.study.currentMedia = media;
                if (media) {
                  media.currentTime = 1;
                  media.volume = this.cfg.volume;
                }
                return state$5.study.currentMedia;
              } catch (e) {
                reload(e);
              }
            };
            try {
              const media = await waitForMedia({
                timeout: 10 * 1e3,
                filter: (m) => m.src.length !== 0
              });
              media.pause();
              fixProcessBar();
            } catch (e) {
              reload(e);
              return;
            }
            await waitForCaptcha();
            const video = await set();
            if (!video) {
              return;
            }
            const videoCheckInterval = setInterval(async () => {
              if (!(video == null ? void 0 : video.isConnected)) {
                clearInterval(videoCheckInterval);
                lib.$message.info({ content: "检测到视频切换中..." });
                doWork();
              }
            }, 3e3);
            lib.$message.info("开始播放");
            playMedia(() => video == null ? void 0 : video.play()).then(() => {
              const current = document.querySelector(
                ".chapter-item.current , .chapter-content-second.current"
              );
              const cn = current ? processor.getChapterName(current) : "未知章节";
              lib.$message.info({ content: "正在学习：" + cn });
              $console.log("正在学习：" + cn);
            });
            video.onpause = async () => {
              if (!(video == null ? void 0 : video.isConnected))
                return;
              if (!(video == null ? void 0 : video.ended) && state$5.study.stop === false) {
                await lib.$.sleep(1e3);
                video == null ? void 0 : video.play();
              }
            };
            video.onended = async () => {
              if (!(video == null ? void 0 : video.isConnected))
                return;
              lib.$message.info("即将自动跳转下一节");
              $console.info("即将自动跳转下一节");
              clearInterval(videoCheckInterval);
              await lib.$.sleep(3e3);
              await next2();
            };
          };
          doWork();
        }
      }),
      hike: new lib.Script({
        name: "🖥️ 教学空间-AI智慧课程-学习脚本",
        hideInPanel: true,
        matches: [
          ["学习首页", "hike-teaching-center.polymas.com/stu-hike/agent-course-hike/ai-course-center"],
          ["学习页面", "tools-hike/studentStudyResource"]
        ],
        namespace: zhsStudyNamespace,
        configs: {
          restudy,
          reloadWhenError,
          volume,
          definition,
          playbackRate: playbackRate$1
        },
        async oncomplete(...args) {
          migrateZhsStudyConfigs();
          if (location.href.includes("stu-hike/agent-course-hike/ai-course-center")) {
            lib.$message.info({ content: "请手动进入视频、作业、考试页面，脚本会自动运行。", duration: 60 });
            return;
          }
          const processor = new Hike();
          this.onConfigChange("volume", (curr) => {
            state$5.study.currentMedia && (state$5.study.currentMedia.volume = curr);
          });
          this.onConfigChange("playbackRate", async (curr) => {
            if (typeof curr === "string") {
              this.cfg.playbackRate = parseFloat(curr);
            }
            fixProcessBar();
            processor.switchPlaybackRate(curr);
          });
          this.onConfigChange("definition", async (curr) => {
            fixProcessBar();
            processor.switchLine(curr);
          });
          const getChapterName = () => {
            var _a, _b;
            return ((_b = (_a = document.querySelector(".active-file")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "未知章节";
          };
          const next2 = async () => {
            const nextJob = processor.getNext({ next: true, restudy: this.cfg.restudy });
            if (nextJob) {
              nextJob.click();
              await lib.$.sleep(3e3);
              doWork();
            } else {
              finishAlert();
            }
          };
          const waitForLoad2 = () => {
            return new Promise((resolve, reject) => {
              const check = () => {
                if (processor.hasJob()) {
                  resolve();
                } else {
                  setTimeout(check, 1e3);
                }
              };
              check();
            });
          };
          await waitForLoad2();
          await lib.$.sleep(3e3);
          setInterval(() => {
            fixProcessBar();
          }, 1e3);
          lib.$message.success({ content: "即将开始自动学习！" });
          const reload = async (e) => {
            $console.error(e);
            if (this.cfg.reloadWhenError) {
              const msg = "视频加载失败，即将刷新页面。";
              const reload_count = await lib.$store.getTab("reload-count");
              if (reload_count && reload_count > 3) {
                const msg2 = "视频加载失败/黑屏导致重新加载页面次数超过3次，请尝试关闭页面重新打开，或者检查网络连接！";
                await lib.$store.setTab("reload-count", 0);
                lib.$message.error({ content: msg2, duration: 0 });
                $console.log(msg2);
                CommonProject.scripts.settings.methods.notificationBySetting(msg2, {
                  duration: 0,
                  extraTitle: "知道智慧树学习脚本"
                });
                return;
              }
              await lib.$store.setTab("reload-count", (reload_count != null ? reload_count : 0) + 1);
              lib.$message.error(msg);
              $console.log(msg);
              setTimeout(() => {
                location.reload();
              }, 3e3);
            } else {
              const msg = "视频加载失败，即将跳过。";
              lib.$message.error(msg);
              $console.log(msg);
              next2();
            }
          };
          const doWork = async () => {
            var _a, _b, _c;
            await waitForCaptcha();
            if (!((_c = (_b = (_a = document.querySelector(".active-file")) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.parentElement) == null ? void 0 : _c.querySelector(".icon-movie"))) {
              lib.$message.warn("当前章节不支持学习，即将跳转下一节");
              await lib.$.sleep(3e3);
              await next2();
              return;
            }
            const set = async () => {
              try {
                await processor.switchLine(this.cfg.definition || "line1bq");
                await lib.$.sleep(1e3);
                await processor.switchPlaybackRate(this.cfg.playbackRate);
                await lib.$.sleep(1e3);
                const media = await waitForMedia({ timeout: 5 * 1e3, filter: (m) => m.src.length !== 0 });
                await lib.$.sleep(1e3);
                state$5.study.currentMedia = media;
                if (media) {
                  media.currentTime = 1;
                  media.volume = this.cfg.volume;
                }
                return state$5.study.currentMedia;
              } catch (e) {
                reload(e);
              }
            };
            lib.$message.info("开始播放");
            try {
              const media = await waitForMedia({
                timeout: 10 * 1e3,
                filter: (m) => m.src.length !== 0
              });
              media.pause();
              fixProcessBar();
            } catch (e) {
              reload(e);
              return;
            }
            await waitForCaptcha();
            const video = await set();
            if (!video) {
              return;
            }
            const videoCheckInterval = setInterval(async () => {
              if (!(video == null ? void 0 : video.isConnected)) {
                clearInterval(videoCheckInterval);
                lib.$message.info({ content: "检测到视频切换中..." });
                doWork();
              }
            }, 3e3);
            playMedia(() => video == null ? void 0 : video.play()).then(() => {
              const cn = getChapterName();
              lib.$message.info({ content: "正在学习：" + cn });
              $console.log("正在学习：" + cn);
            });
            video.onpause = async () => {
              if (!(video == null ? void 0 : video.isConnected))
                return;
              if (!(video == null ? void 0 : video.ended) && state$5.study.stop === false) {
                await lib.$.sleep(1e3);
                video == null ? void 0 : video.play();
              }
            };
            video.onended = async () => {
              if (!(video == null ? void 0 : video.isConnected))
                return;
              lib.$message.info("即将自动跳转下一节");
              $console.info("即将自动跳转下一节");
              clearInterval(videoCheckInterval);
              await lib.$.sleep(3e3);
              await next2();
            };
          };
          doWork();
        }
      }),
      hike_v2: new lib.Script({
        name: "🖥️ 教学空间-AI智慧课程-学习脚本",
        hideInPanel: true,
        matches: [
          ["学习首页", /polymas.com\/stu-hike\/agent-course-full\/.*\/stu\/(course-home|study)/],
          ["学习页面", "/stu/study/resource-detail"]
        ],
        namespace: zhsStudyNamespace,
        configs: {
          restudy,
          reloadWhenError,
          volume
        },
        oncomplete(...args) {
          var _a;
          (_a = this.onhistorychanged) == null ? void 0 : _a.call(this, "pushed", ...args);
        },
        async onhistorychanged(type) {
          migrateZhsStudyConfigs();
          if (type !== "pushed") {
            return;
          }
          if (!location.href.includes("stu/study/resource-detail")) {
            lib.$message.info({ content: "请手动进入视频、作业、考试页面，脚本会自动运行。", duration: 60 });
            return;
          }
          const processor = new HikeV2();
          this.onConfigChange("volume", (curr) => {
            state$5.study.currentMedia && (state$5.study.currentMedia.volume = curr);
          });
          const next2 = async () => {
            var _a;
            (_a = document.querySelector(".drawer-panel")) == null ? void 0 : _a.classList.add("active");
            await lib.$.sleep(1e3);
            const nextJob = processor.getNext({ next: true, restudy: this.cfg.restudy });
            if (nextJob) {
              nextJob.scrollIntoView({ behavior: "smooth", block: "center" });
              await lib.$.sleep(1e3);
              nextJob.click();
              await lib.$.sleep(3e3);
              doJob();
            } else {
              finishAlert();
            }
          };
          const waitForLoad2 = () => {
            return new Promise((resolve, reject) => {
              const check = () => {
                if (processor.hasJob()) {
                  resolve();
                } else {
                  setTimeout(check, 1e3);
                }
              };
              check();
            });
          };
          await waitForLoad2();
          await lib.$.sleep(3e3);
          $msgwc.info("即将开始自动学习：" + processor.getChapterName());
          const reload = async (e) => {
            $console.error(e);
            if (this.cfg.reloadWhenError) {
              const msg = "视频加载失败，即将刷新页面。";
              const reload_count = await lib.$store.getTab("reload-count");
              if (reload_count && reload_count > 3) {
                const msg2 = "视频加载失败/黑屏导致重新加载页面次数超过3次，请尝试关闭页面重新打开，或者检查网络连接！";
                await lib.$store.setTab("reload-count", 0);
                lib.$message.error({ content: msg2, duration: 0 });
                $console.log(msg2);
                CommonProject.scripts.settings.methods.notificationBySetting(msg2, {
                  duration: 0,
                  extraTitle: "知道智慧树学习脚本"
                });
                return;
              }
              await lib.$store.setTab("reload-count", (reload_count != null ? reload_count : 0) + 1);
              lib.$message.error(msg);
              $console.log(msg);
              setTimeout(() => {
                location.reload();
              }, 3e3);
            } else {
              const msg = "视频加载失败，即将跳过。";
              lib.$message.error(msg);
              $console.log(msg);
              next2();
            }
          };
          const doJob = async () => {
            await waitForCaptcha();
            const [isTopVideoJob, isIframeVideoJob] = [
              document.querySelector(".video-js"),
              document.querySelector("#previewIframe")
            ];
            if (!isTopVideoJob && !isIframeVideoJob) {
              lib.$message.warn("当前章节不支持学习，即将跳转下一节");
              await lib.$.sleep(3e3);
              await next2();
              return;
            }
            if (isIframeVideoJob) {
              try {
                const duration = await waitFor(() => lib.$store.get("hikev2_polymas_video_duration"), {
                  timeout_seconds: 1e3 * 10,
                  timeout_message: "等待视频时长信息超时"
                });
                await waitFor(() => lib.$store.get("hikev2_polymas_video") === "end", {
                  timeout_seconds: parseFloat(duration || "3") * 1e3,
                  timeout_message: "等待视频播放完成超时"
                });
              } catch (e) {
                lib.$message.warn("视频播放状态等待超时，直接跳转下一节（" + String(e) + "）");
              }
              lib.$message.info("即将自动跳转下一节");
              await lib.$.sleep(3e3);
              await next2();
            } else if (isTopVideoJob) {
              const set = async () => {
                try {
                  await lib.$.sleep(1e3);
                  const media = await waitForMedia({
                    timeout: 5 * 1e3,
                    filter: (m) => m.src.length !== 0
                  });
                  await lib.$.sleep(1e3);
                  state$5.study.currentMedia = media;
                  if (media) {
                    media.currentTime = 1;
                    media.volume = this.cfg.volume;
                  }
                  return state$5.study.currentMedia;
                } catch (e) {
                  reload(e);
                }
              };
              lib.$message.info("开始播放");
              await waitForCaptcha();
              const video = await set();
              if (!video) {
                return;
              }
              const video_src = video.src;
              const videoCheckInterval = setInterval(async () => {
                if (!(video == null ? void 0 : video.isConnected) || video.src !== video_src) {
                  clearInterval(videoCheckInterval);
                  lib.$message.info({ content: "检测到视频切换中..." });
                  doJob();
                }
              }, 3e3);
              playMedia(() => video == null ? void 0 : video.play()).then(() => {
                const cn = processor.getChapterName();
                lib.$message.info({ content: "正在学习：" + cn });
                $console.log("正在学习：" + cn);
              });
              video.onpause = async () => {
                if (!(video == null ? void 0 : video.isConnected))
                  return;
                if (!(video == null ? void 0 : video.ended) && state$5.study.stop === false) {
                  await lib.$.sleep(1e3);
                  video == null ? void 0 : video.play();
                }
              };
              video.onended = async () => {
                if (!(video == null ? void 0 : video.isConnected))
                  return;
                lib.$message.info("即将自动跳转下一节");
                clearInterval(videoCheckInterval);
                await lib.$.sleep(3e3);
                await next2();
              };
            }
          };
          doJob();
        }
      }),
      hike_polymas_video: new lib.Script({
        name: "AI教学中心视频脚本",
        hideInPanel: true,
        matches: [["AI教学中心视频", "/resource/online/preview"]],
        async oncomplete(...args) {
          lib.$store.set("hikev2_polymas_video", "");
          lib.$store.set("hikev2_polymas_video_duration", "");
          waitForMedia().then((media) => {
            watch$1(
              {
                switchLine() {
                },
                switchPlaybackRate() {
                }
              },
              { ...ZHSProject.scripts.hike_v2.cfg, playbackRate: 1 },
              {
                reload() {
                  location.reload();
                },
                onplay() {
                  lib.$store.set("hikev2_polymas_video_duration", media.duration.toString());
                },
                onended() {
                  lib.$store.set("hikev2_polymas_video", "end");
                  lib.$store.set("hikev2_polymas_video_duration", "");
                }
              }
            );
          }).catch((e) => {
            lib.$store.set("hike_polymas_video", "end");
          });
        }
      }),
      "hike-work": new lib.Script({
        matches: [["AI教学中心-作业任务页面", "/stu-hike/stuHomeworkDo"]],
        name: "✍️ 教学空间-AI智慧课程-作业考试脚本",
        hideInPanel: true,
        namespace: zhsWorkNamespace,
        configs: {
          workDelay: {
            label: "作业答题开始时间延迟（秒）",
            defaultValue: 3,
            attrs: { type: "number", min: 1, step: 1, max: 10 }
          }
        },
        async oncomplete() {
          var _a;
          migrateZhsWorkConfigs();
          BackgroundProject.scripts.render.methods.pin(this);
          await waitForElement(".q_main");
          commonWork({
            mount_script: ZHSProject.scripts["work-center"],
            workerProvider: (opts) => {
              return hikeWork(void 0, opts);
            },
            start_delay_seconds: (_a = this.cfg.workDelay) != null ? _a : 3
          });
        }
      }),
      "hike-homework": new lib.Script({
        matches: [
          ["AI教学中心-题目作业", "/stu/answer-homework"],
          ["AI教学中心-作业任务页面", "/stu-exam/answer-exam"],
          ["AI教学中心-随堂练习", /exam-hub\/.+\/stu\/answer-training/]
        ],
        name: "✍️ 教学空间-AI智慧课程-题目作业脚本",
        hideInPanel: true,
        namespace: zhsWorkNamespace,
        configs: {
          workDelay: {
            label: "作业答题开始时间延迟（秒）",
            defaultValue: 3,
            attrs: { type: "number", min: 1, step: 1, max: 10 }
          }
        },
        oncomplete() {
          var _a;
          (_a = this.onhistorychanged) == null ? void 0 : _a.call(this, "pushed");
        },
        async onhistorychanged(type) {
          var _a;
          lib.$message.info("onhistorychange " + type);
          if (type !== "pushed")
            return;
          migrateZhsWorkConfigs();
          BackgroundProject.scripts.render.methods.pin(this);
          const msg = lib.$message.info({ duration: 0, content: "等待界面加载中..." });
          await waitForElement(".question-item");
          await waitFor(
            async () => {
              var _a2, _b;
              await lib.$.sleep(1e3);
              const items = Array.from(document.querySelectorAll(".question-item"));
              (_a2 = items.at(-1)) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth", block: "center" });
              await lib.$.sleep(items.length * 100);
              (_b = items.at(0)) == null ? void 0 : _b.scrollIntoView({ behavior: "smooth", block: "center" });
              await lib.$.sleep(items.length * 100);
              return Array.from(document.querySelectorAll(".question-item")).every(
                (e) => {
                  var _a3;
                  return !((_a3 = e.textContent) == null ? void 0 : _a3.includes("公式加载中"));
                }
              );
            },
            { timeout_seconds: 60 * 3, timeout_message: "界面公式加载失败，请刷新界面尝试" }
          );
          await lib.$.sleep(1e3);
          lib.$message.success("界面加载完毕");
          msg == null ? void 0 : msg.remove();
          commonWork({
            mount_script: ZHSProject.scripts["work-center"],
            workerProvider: (opts) => {
              return hikeHomework(void 0, opts);
            },
            start_delay_seconds: (_a = this.cfg.workDelay) != null ? _a : 3
          });
        }
      })
    }
  });
  async function watch$1(processor, options, actions) {
    const reload = async (e) => {
      var _a;
      $console.error(e);
      if (options.reloadWhenError) {
        const msg = "视频加载失败，即将刷新页面。";
        const reload_count = await lib.$store.getTab("reload-count");
        if (reload_count && reload_count > 3) {
          const msg2 = "视频加载失败导致重新加载页面次数超过3次，请尝试关闭页面重新打开，或者检查网络连接！";
          await lib.$store.setTab("reload-count", 0);
          lib.$message.error({ content: msg2, duration: 0 });
          $console.log(msg2);
          CommonProject.scripts.settings.methods.notificationBySetting(msg2, {
            duration: 0,
            extraTitle: "知道智慧树学习脚本"
          });
          return;
        }
        await lib.$store.setTab("reload-count", (reload_count != null ? reload_count : 0) + 1);
        lib.$message.error(msg);
        $console.log(msg);
        setTimeout(() => {
          actions.reload();
        }, 5e3);
      } else {
        const msg = "视频加载失败，即将跳过。";
        lib.$message.error(msg);
        $console.log(msg);
        (_a = actions.onended) == null ? void 0 : _a.call(actions, { next: true });
      }
    };
    const set = async () => {
      try {
        await lib.$.sleep(1e3);
        fixProcessBar();
        await processor.switchLine(options.definition || "line1bq");
        await lib.$.sleep(1e3);
        fixProcessBar();
        await processor.switchPlaybackRate(options.playbackRate);
        await lib.$.sleep(1e3);
        const media = await waitForMedia({ timeout: 10 * 1e3 });
        await lib.$.sleep(1e3);
        state$5.study.currentMedia = media;
        if (media) {
          media.currentTime = 1;
          media.volume = options.volume;
        }
        return state$5.study.currentMedia;
      } catch (e) {
        return await reload(e);
      }
    };
    lib.$message.info("开始播放");
    try {
      const media = await waitForMedia({ timeout: 10 * 1e3 });
      media.volume = options.volume;
      media.pause();
      fixProcessBar();
    } catch (e) {
      return await reload(e);
    }
    await lib.$.sleep(1e3);
    const video = await set();
    if (!video) {
      return await reload("视频加载失败");
    }
    const videoCheckInterval = setInterval(async () => {
      var _a;
      if ((video == null ? void 0 : video.isConnected) === false) {
        clearInterval(videoCheckInterval);
        lib.$message.info({ content: "检测到视频切换中..." });
        (_a = actions.onended) == null ? void 0 : _a.call(actions, { next: false });
      }
    }, 3e3);
    playMedia(() => video == null ? void 0 : video.play()).then(() => {
      var _a;
      (_a = actions.onplay) == null ? void 0 : _a.call(actions);
    });
    video.onpause = async () => {
      if (!(video == null ? void 0 : video.ended) && state$5.study.stop === false) {
        await waitForCaptcha();
        await lib.$.sleep(1e3);
        video == null ? void 0 : video.play();
      }
    };
    video.onended = () => {
      var _a;
      clearInterval(videoCheckInterval);
      (_a = actions.onended) == null ? void 0 : _a.call(actions, { next: true });
    };
  }
  async function watchXnk(options, onended) {
    const media = await waitForMedia();
    media.volume = options.volume;
    media.currentTime = 1;
    state$5.study.currentMedia = media;
    playMedia(() => media == null ? void 0 : media.play());
    media.onpause = async () => {
      if (!(media == null ? void 0 : media.ended)) {
        await lib.$.sleep(1e3);
        media == null ? void 0 : media.play();
      }
    };
    media.onended = () => {
      onended();
    };
  }
  function checkForCaptcha(update) {
    let modal2;
    let notified = false;
    return setInterval(() => {
      if (lib.$el(".yidun_popup")) {
        update(true);
        if (modal2 === void 0) {
          modal2 = lib.$modal.alert({ content: "当前检测到验证码，请输入后方可继续运行。" });
        }
        if (!notified) {
          notified = true;
          CommonProject.scripts.settings.methods.notificationBySetting(
            "智慧树脚本：当前检测到验证码，请输入后方可继续运行。",
            { duration: 0 }
          );
        }
      } else {
        if (modal2) {
          update(false);
          modal2.remove();
          modal2 = void 0;
        }
      }
    }, 1e3);
  }
  function waitForCaptcha() {
    const popup = getPopupCaptcha();
    if (popup) {
      const message2 = lib.$message.warn({ content: "当前检测到验证码，请输入后方可继续运行。", duration: 0 });
      CommonProject.scripts.settings.methods.notificationBySetting(
        "智慧树脚本：当前检测到验证码，请输入后方可继续运行。",
        { duration: 0 }
      );
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const popup2 = getPopupCaptcha();
          if (popup2 === null) {
            message2 == null ? void 0 : message2.remove();
            clearInterval(interval);
            resolve();
          }
        }, 1e3);
      });
    }
  }
  function getPopupCaptcha() {
    return document.querySelector(".yidun_popup");
  }
  function gxkWorkAndExam(workInfo, { answererWrappers, period, thread, stopSecondWhenFinish, redundanceWordsText, answerSeparators }) {
    var _a, _b, _c;
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "zhs-gxk"
    });
    const allExamParts = ((_c = ((_b = (_a = workInfo == null ? void 0 : workInfo.rt) == null ? void 0 : _a.examBase) == null ? void 0 : _b.workExamParts) || []) == null ? void 0 : _c.map((p) => p.questionDtos).flat()) || [];
    const titleTransform = (_, index) => {
      var _a2;
      const div = lib.h("div");
      div.innerHTML = ((_a2 = allExamParts[index]) == null ? void 0 : _a2.name) || "题目读取失败";
      const extracted = extractTextWithImages(div);
      return {
        text: removeRedundantWords(extracted.text || "", redundanceWordsText.split("\n")),
        images: extracted.images
      };
    };
    const titleText = (_, index) => titleTransform(_, index).text;
    const optionExtract = (o) => extractTextWithImages(o, {
      imgFilter: (img) => {
        if (img.dataset.src)
          img.src = img.dataset.src;
        return !!img.closest(".node_detail");
      }
    });
    let request_index = 0;
    const worker = new OCSWorker({
      root: ".examPaper_subject",
      elements: {
        title: ".subject_describe > div,.smallStem_describe > div:nth-child(2)",
        options: ".subject_node .nodeLab"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: () => titleTransform(void 0, request_index++),
        optionsTransform: (elements2, ctx) => {
          var _a2;
          if (ctx.type === "completion")
            return "";
          const optResults = ((_a2 = ctx.elements.options) != null ? _a2 : []).filter(Boolean).map((o) => optionExtract(o));
          return {
            text: optResults.map((r) => r.text).join("\n"),
            images: optResults.flatMap((r) => r.images)
          };
        },
        answererWrappers,
        period
      }),
      work: {
        optionText: (o) => optionExtract(o).text,
        type(ctx) {
          var _a2, _b2, _c2, _d;
          const type = (_d = (_c2 = (_b2 = (_a2 = ctx.elements.title[0].parentElement) == null ? void 0 : _a2.parentElement) == null ? void 0 : _b2.querySelector(".subject_type")) == null ? void 0 : _c2.textContent) == null ? void 0 : _d.trim();
          if (type == null ? void 0 : type.includes("单选题")) {
            return "single";
          } else if (type == null ? void 0 : type.includes("多选题")) {
            return "multiple";
          } else if (type == null ? void 0 : type.includes("判断题")) {
            return "judgement";
          } else if (type == null ? void 0 : type.includes("填空题")) {
            return "completion";
          } else {
            return void 0;
          }
        },
        async handler(type, answer, option) {
          var _a2;
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (!((_a2 = option.querySelector("input")) == null ? void 0 : _a2.checked)) {
              option.click();
              await lib.$.sleep(200);
            }
          } else if (type === "completion" && answer.trim()) {
            const text2 = option.querySelector("textarea");
            if (text2) {
              text2.value = answer;
              await lib.$.sleep(200);
            }
          }
        }
      },
      async onResultsInit(_curr, _index, res) {
        await CommonProject.scripts.workResults.methods.fillAll(res.map((r, i) => simplifyWorkResult(r, titleText, i)));
      },
      async onResultsUpdate(curr, index, res) {
        await CommonProject.scripts.workResults.methods.update(index, simplifyWorkResult(curr, titleText, index));
      }
    });
    checkForCaptcha((hasCaptcha) => {
      if (hasCaptcha) {
        worker.emit("stop");
      } else {
        worker.emit("continuate");
      }
    });
    worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug }).then(async (res) => {
      var _a2;
      if (worker.isClose === true) {
        return;
      }
      lib.$message.success({ content: `答题完成，将等待 ${stopSecondWhenFinish} 秒后进行保存或提交。` });
      await lib.$.sleep(stopSecondWhenFinish * 1e3);
      if (worker.isClose === true) {
        return;
      }
      for (let index = 0; index < worker.totalQuestionCount; index++) {
        if (worker.isClose === true) {
          return;
        }
        const modal2 = lib.$modal.alert({
          title: "⚠️提示",
          content: `正在自动保存题目中，不然填写的答案将无效，<br>当前进度 ${index}/${worker.totalQuestionCount}<br>保存完毕前请勿操作...`,
          confirmButton: null,
          maskCloseable: false
        });
        await waitForCaptcha();
        await lib.$.sleep(2e3);
        (_a2 = document.querySelectorAll(".answerCard_list ul li").item(index)) == null ? void 0 : _a2.click();
        await lib.$.sleep(200);
        const next2 = lib.$el("div.examPaper_box > div.switch-btn-box > button:nth-child(2)");
        if (next2) {
          next2.click();
        } else {
          $console.error("未找到下一页按钮。");
        }
        modal2 == null ? void 0 : modal2.remove();
      }
      lib.$message.info({ content: "作业/考试完成，请自行检查后保存或提交。", duration: 0 });
      worker.emit("done");
    }).catch((err) => {
      lib.$message.error({ content: "答题程序发生错误 : " + err.message, duration: 0 });
    });
    return worker;
  }
  function xnkWork({ answererWrappers, period, thread, answerSeparators }) {
    lib.$message.info({ content: "开始作业" });
    CommonProject.scripts.workResults.methods.init({ dynamic: true });
    const titleTransform = (titles) => {
      return titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => t2 ? extractTextWithImages(t2).text : "").join(",");
    };
    const worker = new OCSWorker({
      root: "div:has(> .questionContent)",
      elements: {
        title: ".questionContent",
        options: ".optionUl label, .questiontextarea, .ShortAnswer-textarea",
        questionTit: ".questionTit"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2) => titleTransform(elements2.title),
        answererWrappers,
        period
      }),
      work: {
        type(ctx) {
          var _a;
          const type = ((_a = ctx.elements.questionTit[0]) == null ? void 0 : _a.textContent) || "";
          return type.includes("单选") ? "single" : type.includes("多选") ? "multiple" : type.includes("判断") ? "judgement" : type.includes("填空") || type.includes("问答") || type.includes("名词解释") ? "completion" : void 0;
        },
        async handler(type, answer, option, ctx) {
          var _a;
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (((_a = option.querySelector("input")) == null ? void 0 : _a.checked) === false) {
              option.click();
              await lib.$.sleep(200);
            }
          } else if (type === "completion" && answer.trim()) {
            const text2 = option.tagName === "TEXTAREA" ? option : option.querySelector("textarea");
            if (text2) {
              text2.focus();
              await lib.$.sleep(100);
              text2.value = answer;
              await lib.$.sleep(100);
              text2.dispatchEvent(new Event("input", { bubbles: true }));
              await lib.$.sleep(100);
              text2.blur();
              await lib.$.sleep(100);
            }
          }
        }
      },
      onQuestionDetected(current) {
        updateDynamicResult(current, titleTransform);
      },
      onResultsUpdate(current, _, res) {
        updateDynamicResult(current, titleTransform);
      }
    });
    const getBtn = () => document.querySelector("span.Topicswitchingbtn:nth-child(2)");
    let next2 = getBtn();
    (async () => {
      while (next2 && worker.isClose === false) {
        await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
        await lib.$.sleep(1e3);
        next2 = getBtn();
        next2 == null ? void 0 : next2.click();
        await lib.$.sleep(1e3);
      }
      lib.$message.info({ content: "作业/考试完成，请自行检查后保存或提交。", duration: 0 });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "zhs-xnk";
    })();
    dynamicWorkTips(worker);
    return worker;
  }
  function smartWork(remotePage, { answererWrappers, period, thread, answerSeparators }) {
    lib.$message.info({ content: "开始作业" });
    CommonProject.scripts.workResults.methods.init({ dynamic: true });
    const titleTransformWithImages = (titles) => {
      const results = titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => t2 ? extractTextWithImages(t2) : { text: "", images: [] });
      return {
        text: results.map((r) => r.text).join(","),
        images: results.flatMap((r) => r.images)
      };
    };
    const titleTransform = (titles) => titleTransformWithImages(titles).text;
    const worker = new OCSWorker({
      root: ".questionContent",
      elements: {
        title: ".questionName .centent-pre",
        options: ".radio-view li.clearfix, .checkbox-views label.el-checkbox, .fillAnswer"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2) => titleTransformWithImages(elements2.title),
        optionsTransform: (elements2, ctx) => {
          var _a;
          if (ctx.type === "completion")
            return "";
          const optResults = ((_a = ctx.elements.options) != null ? _a : []).filter(Boolean).map((o) => extractTextWithImages(o));
          return {
            text: optResults.map((r) => r.text).join("\n"),
            images: optResults.flatMap((r) => r.images)
          };
        },
        answererWrappers,
        period
      }),
      work: {
        optionText: (o) => extractTextWithImages(o).text,
        type(ctx) {
          var _a, _b, _c;
          const type = (_c = (_b = (_a = ctx.elements.title[0]) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.querySelector(".letterSortNum")) == null ? void 0 : _c.textContent;
          if (type == null ? void 0 : type.includes("单选题")) {
            return "single";
          } else if (type == null ? void 0 : type.includes("多选题")) {
            return "multiple";
          } else if (type == null ? void 0 : type.includes("判断题")) {
            return "judgement";
          } else if (type == null ? void 0 : type.includes("填空")) {
            return "completion";
          } else {
            return void 0;
          }
        },
        async handler(type, answer, option, ctx) {
          if (type === "judgement" || type === "single" || type === "multiple") {
            const opt = option.querySelector(
              ".el-checkbox__input:not(.is-checked),i.iconfont:not(.checkedIcon)"
            );
            if (opt) {
              if (remotePage) {
                await remotePage.click(opt);
              } else {
                opt.click();
              }
              await lib.$.sleep(200);
            }
          } else if (type === "completion") {
            const opt = option.querySelector("input");
            if (opt && answer.trim()) {
              if (remotePage) {
                await remotePage.click(opt);
                opt.value = "";
                await remotePage["keyboard.type"](answer, { delay: Math.floor(Math.random() * 100) });
              } else {
                opt.value = answer;
              }
              await lib.$.sleep(200);
            }
          }
        }
      },
      onQuestionDetected(current) {
        updateDynamicResult(current, titleTransform);
      },
      onResultsUpdate(current, _, res) {
        updateDynamicResult(current, titleTransform);
      }
    });
    const getNextBtn = () => document.querySelector(".next-topic.next-t");
    let next2 = null;
    (async () => {
      const first = document.querySelector('[role="treeitem"] .font-sec-style-node');
      if (first) {
        if (remotePage)
          await remotePage.click(first);
        else
          first.click();
        await lib.$.sleep(3e3);
      }
      let count2 = 0;
      while (worker.isClose === false) {
        await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
        next2 = getNextBtn();
        if (!next2) {
          break;
        }
        await lib.$.sleep(1e3);
        if (remotePage)
          await remotePage.click(next2);
        else
          next2.click();
        await lib.$.sleep(1e3);
        count2++;
      }
      lib.$message.info({
        content: "作业/考试完成，请自行检查后保存或提交。",
        duration: count2 > 10 ? 0 : 30
      });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "zhs-smart";
    })();
    dynamicWorkTips(worker);
    return worker;
  }
  function smartExam(remotePage, { answererWrappers, period, thread, answerSeparators }) {
    lib.$message.info({ content: "开始作业" });
    CommonProject.scripts.workResults.methods.init({ dynamic: true });
    const titleTransformWithImages = (titles) => {
      const results = titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => t2 ? extractTextWithImages(t2) : { text: "", images: [] });
      return {
        text: results.map((r) => r.text).join(","),
        images: results.flatMap((r) => r.images)
      };
    };
    const titleTransform = (titles) => titleTransformWithImages(titles).text;
    const worker = new OCSWorker({
      root: ".question-area-content",
      elements: {
        type: "div.flex.items-center.mb-\\[16px\\]",
        title: "div.flex-1 .mb-\\[32px\\] .text-mainText.font-medium",
        options: "label.user-select.group,div.real-editor"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2) => titleTransformWithImages(elements2.title),
        optionsTransform: (elements2, ctx) => {
          var _a;
          if (ctx.type === "completion")
            return "";
          const optResults = ((_a = ctx.elements.options) != null ? _a : []).filter(Boolean).map((o) => extractTextWithImages(o));
          return {
            text: optResults.map((r) => r.text).join("\n"),
            images: optResults.flatMap((r) => r.images)
          };
        },
        answererWrappers,
        period
      }),
      work: {
        optionText: (o) => extractTextWithImages(o).text,
        type(ctx) {
          const type = ctx.elements.type[0].textContent;
          if (type == null ? void 0 : type.includes("单选")) {
            return "single";
          } else if (type == null ? void 0 : type.includes("多选题")) {
            return "multiple";
          } else if (type == null ? void 0 : type.includes("判断")) {
            return "judgement";
          } else if ((type == null ? void 0 : type.includes("填空")) || (type == null ? void 0 : type.includes("问答"))) {
            return "completion";
          } else {
            return void 0;
          }
        },
        async handler(type, answer, option, ctx) {
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (option.querySelector("div.bg-mainBg") === null) {
              if (remotePage) {
                await remotePage.click(option);
              } else {
                option.click();
              }
              await lib.$.sleep(200);
            }
          } else if (type === "completion") {
            if (option.classList.contains("real-editor")) {
              option.ckeditorInstance.data.set(answer);
            } else {
              const input = option.querySelector("input");
              if (input) {
                input.value = answer;
                Reflect.set(input, "composition", true);
                input.dispatchEvent(new Event("input", { bubbles: true }));
              }
            }
            await lib.$.sleep(200);
          }
        }
      },
      onQuestionDetected(current) {
        updateDynamicResult(current, titleTransform);
      },
      onResultsUpdate(current, _, res) {
        updateDynamicResult(current, titleTransform);
      }
    });
    const getNextBtn = () => Array.from(document.querySelectorAll("button")).find(
      (btn) => {
        var _a;
        return (_a = btn.textContent) == null ? void 0 : _a.includes("下一题");
      }
    );
    let next2 = null;
    (async () => {
      const first = document.querySelector(".grid.grid-cols-7 > button");
      if (first) {
        if (remotePage)
          await remotePage.click(first);
        else
          first.click();
        await lib.$.sleep(3e3);
      }
      let count2 = 0;
      while (worker.isClose === false) {
        await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
        next2 = getNextBtn();
        if (!next2) {
          break;
        }
        await lib.$.sleep(1e3);
        if (remotePage)
          await remotePage.click(next2);
        else
          next2.click();
        await lib.$.sleep(1e3);
        count2++;
      }
      lib.$message.info({
        content: "作业/考试完成，请自行检查后保存或提交。",
        duration: count2 > 10 ? 0 : 30
      });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "zhs-smart";
    })();
    dynamicWorkTips(worker);
    return worker;
  }
  function fusioncourseWork(remotePage, { answererWrappers, period, thread, answerSeparators }) {
    lib.$message.info({ content: "开始作业" });
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "zhs-fusion"
    });
    const titleTransform = (titles) => {
      return titles.filter((t2) => {
        var _a;
        return !!t2 && (!!((_a = t2.textContent) == null ? void 0 : _a.trim()) || !!t2.querySelector("img,mjx-container"));
      }).map((t2) => {
        var _a;
        const clone2 = t2.cloneNode(true);
        (_a = clone2.querySelector(".option-index")) == null ? void 0 : _a.remove();
        return extractTextWithImages(clone2).text;
      }).map((text2) => text2.replace(/\s+/g, " ").trim()).filter(Boolean).join(",");
    };
    const worker = new OCSWorker({
      root: ".exam-item",
      rootObserver: {
        enabled: true,
        onRootLost: () => {
          CommonProject.scripts.workResults.methods.clearResults();
        }
      },
      elements: {
        type: ".quest-type",
        title: ".quest-title",
        options: "label"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2) => titleTransform(elements2.title),
        optionsTransform: (elements2) => {
          var _a;
          return ((_a = elements2.options) != null ? _a : []).filter(Boolean).map((o) => extractTextWithImages(o).text.replace(/\s+/g, " ").trim()).join("\n");
        },
        answererWrappers,
        period
      }),
      work: {
        optionText: (o) => extractTextWithImages(o).text.replace(/\s+/g, " ").trim(),
        type(ctx) {
          const type = ctx.elements.type[0].textContent;
          if (type == null ? void 0 : type.includes("单选题")) {
            return "single";
          } else if (type == null ? void 0 : type.includes("多选题")) {
            return "multiple";
          } else if (type == null ? void 0 : type.includes("判断题")) {
            return "judgement";
          } else if (type == null ? void 0 : type.includes("填空题")) {
            return "completion";
          } else {
            return void 0;
          }
        },
        async handler(type, answer, option, ctx) {
          if (type === "judgement" || type === "single" || type === "multiple") {
            const opt = option.querySelector(
              ".el-checkbox__input:not(.is-checked),.el-radio__input:not(.is-checked)"
            );
            if (opt) {
              if (remotePage) {
                await remotePage.click(opt);
              } else {
                opt.click();
              }
              await lib.$.sleep(200);
            }
          }
        }
      },
      async onResultsInit(_curr, _index, res) {
        await CommonProject.scripts.workResults.methods.fillAll(
          res.map((r, i) => simplifyWorkResult(r, titleTransform, i))
        );
      },
      async onResultsUpdate(current, index, res) {
        await CommonProject.scripts.workResults.methods.update(index, simplifyWorkResult(current, titleTransform, index));
      }
    });
    worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug }).then(async (res) => {
      if (worker.isClose === true) {
        return;
      }
      if (worker.isClose === true) {
        return;
      }
      lib.$message.info({
        content: "作业/考试完成，请自行检查后保存或提交。",
        duration: res.length > 10 ? 0 : 30
      });
      worker.emit("done");
    }).catch((err) => {
      lib.$message.error({ content: "答题程序发生错误 : " + err.message, duration: 0 });
    });
    return worker;
  }
  function hikeWork(remotePage, { answererWrappers, period, thread, answerSeparators }) {
    lib.$message.info({ content: "开始作业" });
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "zhs-hike",
      dynamic: true
    });
    const titleTransform = (titles) => {
      return titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => t2 ? extractTextWithImages(t2).text : "").join(",");
    };
    const worker = new OCSWorker({
      root: ".q_main",
      elements: {
        type: ".question_score",
        title: ".question-topic",
        options: "label"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2) => titleTransform(elements2.title),
        answererWrappers,
        period
      }),
      work: {
        type(ctx) {
          const type = ctx.elements.type[0].textContent;
          if (type == null ? void 0 : type.includes("单选题")) {
            return "single";
          } else if (type == null ? void 0 : type.includes("多选题")) {
            return "multiple";
          } else if (type == null ? void 0 : type.includes("判断题")) {
            return "judgement";
          } else if (type == null ? void 0 : type.includes("填空题")) {
            return "completion";
          } else {
            return void 0;
          }
        },
        async handler(type, answer, option, ctx) {
          if (type === "judgement" || type === "single" || type === "multiple") {
            const opt = option.querySelector(
              ".el-checkbox__input:not(.is-checked),.el-radio__input:not(.is-checked)"
            );
            if (opt) {
              if (remotePage) {
                await remotePage.click(opt);
              } else {
                opt.click();
              }
              await lib.$.sleep(200);
            }
          }
        }
      },
      onQuestionDetected(current) {
        updateDynamicResult(current, titleTransform);
      },
      onResultsUpdate(current, _, res) {
        updateDynamicResult(current, titleTransform);
      }
    });
    const getNextBtn = () => document.querySelector(".check_btn:not(.is-disabled)");
    let next2 = getNextBtn();
    let count2 = 0;
    (async () => {
      const first = document.querySelector(".card_ul .card_li");
      if (first) {
        if (remotePage)
          await remotePage.click(first);
        else
          first.click();
        await lib.$.sleep(3e3);
      }
      while (next2 && worker.isClose === false) {
        await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
        next2 = getNextBtn();
        if (next2) {
          await lib.$.sleep(1e3);
          if (remotePage)
            await remotePage.click(next2);
          else
            next2.click();
          await lib.$.sleep(1e3);
          count2++;
        }
      }
      lib.$message.info({ content: "作业/考试完成，请自行检查后保存或提交。", duration: count2 > 10 ? 0 : 30 });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "zhs-hike";
    })();
    dynamicWorkTips(worker);
    return worker;
  }
  function hikeHomework(remotePage, { answererWrappers, period, thread, answerSeparators }) {
    lib.$message.info({ content: "开始作业" });
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "zhs-hike-answer-training"
    });
    const titleTransform = (titles) => {
      return titles.filter((t2) => {
        var _a;
        return !!t2 && (!!((_a = t2.textContent) == null ? void 0 : _a.trim()) || !!t2.querySelector("img,mjx-container"));
      }).map((t2) => t2 ? extractTextWithImages(t2).text.replace(/\s+/g, " ").trim() : "").filter(Boolean).join(",");
    };
    const worker = new OCSWorker({
      root: ".question-item:not(:has(.stu-score-show))",
      elements: {
        type: ".title-box,.combination-title",
        title: ".qeustion-content .markdown-latex-container, .combination-content ",
        options: ".option-item .markdown-latex-container, .vditor-content"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2) => titleTransform(elements2.title),
        optionsTransform: (elements2) => {
          var _a;
          return ((_a = elements2.options) != null ? _a : []).filter(Boolean).map((o) => extractTextWithImages(o).text.replace(/\s+/g, " ").trim()).join("\n");
        },
        answererWrappers,
        period
      }),
      work: {
        optionText: (o) => extractTextWithImages(o).text.replace(/\s+/g, " ").trim(),
        type(ctx) {
          const type = ctx.elements.type[0].textContent;
          if (type == null ? void 0 : type.includes("单选")) {
            return "single";
          } else if (type == null ? void 0 : type.includes("多选")) {
            return "multiple";
          } else if (type == null ? void 0 : type.includes("判断")) {
            return "judgement";
          } else if (type == null ? void 0 : type.includes("问答")) {
            return "completion";
          } else {
            return void 0;
          }
        },
        async handler(type, answer, option, ctx) {
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (remotePage) {
              await remotePage.click(option);
            } else {
              option.click();
            }
            await lib.$.sleep(200);
          } else if (type === "completion") {
            const textarea = option.querySelector(".vditor-reset");
            if (textarea)
              textarea.innerHTML = `<p data-block="0">${answer.trim()}</p>`;
          }
        }
      },
      async onResultsInit(_curr, _index, res) {
        await CommonProject.scripts.workResults.methods.fillAll(
          res.map((r, i) => simplifyWorkResult(r, titleTransform, i))
        );
      },
      async onResultsUpdate(current, index, res) {
        await CommonProject.scripts.workResults.methods.update(index, simplifyWorkResult(current, titleTransform, index));
      }
    });
    worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug }).then(() => {
      lib.$message.info({ content: "作业/考试完成，请自行检查后保存或提交。", duration: 0 });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "zhs-hike";
    });
    return worker;
  }
  function optimizeSecond(second) {
    if (second > 3600) {
      return `${Math.floor(second / 3600)}小时${Math.floor(second % 3600 / 60)}分钟`;
    } else if (second > 60) {
      return `${Math.floor(second / 60)}分钟${second % 60}秒`;
    } else {
      return `${second}秒`;
    }
  }
  function autoStop(stopTime2) {
    var _a, _b;
    clearInterval(state$5.study.stopInterval);
    (_a = state$5.study.stopMessage) == null ? void 0 : _a.remove();
    if (stopTime2 !== "0") {
      let stopCount = parseFloat(stopTime2) * 60 * 60;
      state$5.study.stopInterval = setInterval(() => {
        var _a2;
        if (stopCount > 0) {
          if (getPopupCaptcha() === null) {
            stopCount--;
          }
        } else {
          clearInterval(state$5.study.stopInterval);
          state$5.study.stop = true;
          (_a2 = lib.$el("video")) == null ? void 0 : _a2.pause();
          lib.$modal.alert({ content: "脚本暂停，已获得今日平时分，如需继续观看，请刷新页面。" });
        }
      }, 1e3);
      const val = ((_b = (ZHSProject.scripts["gxk-study"].configs.stopTime.options || []).find(
        (t2) => t2[0] === stopTime2
      )) == null ? void 0 : _b[0]) || "0";
      const date = new Date();
      date.setMinutes(date.getMinutes() + parseFloat(val) * 60);
      state$5.study.stopMessage = lib.$message.info({
        duration: 0,
        content: `在 ${date.toLocaleTimeString()} 脚本将自动暂停`
      });
    }
  }
  const MIN_VIEWPORT_WIDTH = 1280;
  const MIN_VIEWPORT_HEIGHT = 720;
  function ensureWideViewport() {
    const { innerWidth: width, innerHeight: height } = window;
    if (width >= MIN_VIEWPORT_WIDTH && height >= MIN_VIEWPORT_HEIGHT) {
      return;
    }
    lib.$modal.confirm({
      title: "界面分辨率提示",
      content: lib.h("div", {}, [
        "当前界面分辨率过小，可能影响学习、播放等自动点击功能，点击确定自动调整界面尺寸。",
        lib.h("div", { style: { fontSize: "12px", color: "#999", marginTop: "8px" } }, "如需恢复请刷新界面")
      ]),
      confirmButtonText: "确定",
      cancelButtonText: "暂不调整",
      onConfirm: () => {
        adjustViewportScale(width, height);
      }
    });
  }
  function adjustViewportScale(width, height) {
    const scale = Math.min(1, Math.min(width / MIN_VIEWPORT_WIDTH, height / MIN_VIEWPORT_HEIGHT));
    if (scale >= 1) {
      return;
    }
    const styleId = "ocs-viewport-scale-style";
    let style = document.getElementById(styleId);
    if (style === null) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.append(style);
    }
    style.innerText = `html { zoom: ${scale}; }`;
    lib.$message.success({
      duration: 5,
      content: `已自动调整缩放至 ${Math.round(scale * 100)}%，以满足 1280x720 最小分辨率要求`
    });
  }
  function fixProcessBar() {
    const bar = document.querySelector(".controlsBar");
    if (bar) {
      bar.style.display = "block";
      bar.style.zIndex = "2";
      bar.style.overflow = "";
    }
  }
  function closeDialogRead() {
    const div = document.querySelector(".dialog-read");
    if (div) {
      div.style.display = "none";
    }
  }
  function finishAlert() {
    lib.$modal.alert({
      content: "检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。"
    });
  }
  const refTableCache = /* @__PURE__ */ new Map();
  const REVALIDATE_WITH_VALIDATOR_MS = 60 * 60 * 1e3;
  const REVALIDATE_NO_VALIDATOR_MS = 7 * 24 * 60 * 60 * 1e3;
  const CACHE_NAME = "ocs-font-decrypt-ref-table-v1";
  let cachePromise;
  function openCache() {
    if (!cachePromise) {
      cachePromise = typeof caches === "undefined" ? Promise.resolve(void 0) : caches.open(CACHE_NAME).catch(() => void 0);
    }
    return cachePromise;
  }
  async function readPersistedRecord(url) {
    var _a, _b;
    const cache = await openCache();
    if (!cache)
      return void 0;
    try {
      const res = await cache.match(url);
      if (!res)
        return void 0;
      const updatedAt = Number(res.headers.get("x-ocs-updated-at") || 0);
      if (!updatedAt)
        return void 0;
      const data = await res.arrayBuffer();
      return {
        updatedAt,
        etag: (_a = res.headers.get("etag")) != null ? _a : void 0,
        lastModified: (_b = res.headers.get("last-modified")) != null ? _b : void 0,
        data
      };
    } catch {
      return void 0;
    }
  }
  function buildCachedResponse(record) {
    const headers = new Headers({ "x-ocs-updated-at": String(record.updatedAt) });
    if (record.etag)
      headers.set("etag", record.etag);
    if (record.lastModified)
      headers.set("last-modified", record.lastModified);
    return new Response(record.data, { headers });
  }
  async function persist(url, buf, etag, lastModified) {
    const cache = await openCache();
    if (!cache)
      return;
    try {
      await cache.put(url, buildCachedResponse({ updatedAt: Date.now(), etag, lastModified, data: buf }));
    } catch {
    }
  }
  async function touchPersisted(url, record) {
    const cache = await openCache();
    if (!cache)
      return;
    try {
      await cache.put(url, buildCachedResponse({ ...record, updatedAt: Date.now() }));
    } catch {
    }
  }
  async function deletePersisted(url) {
    const cache = await openCache();
    if (!cache)
      return;
    try {
      await cache.delete(url);
    } catch {
    }
  }
  function unpackBits(packed, offset, count2, dims) {
    const bytesPerGlyph = dims / 8;
    const out = new Uint8Array(count2 * dims);
    for (let i = 0; i < count2; i++) {
      const pBase = offset + i * bytesPerGlyph;
      const oBase = i * dims;
      for (let b = 0; b < bytesPerGlyph; b++) {
        const byte = packed[pBase + b];
        for (let k = 0; k < 8; k++) {
          out[oBase + b * 8 + k] = byte >> 7 - k & 1;
        }
      }
    }
    return out;
  }
  function parseRefTable(buf) {
    const dv = new DataView(buf);
    const magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (magic !== "FRB2") {
      throw new Error("[font-decrypt] 无效的特征表格式: " + magic);
    }
    const count2 = dv.getUint32(4, true);
    const threshold = dv.getUint32(8, true);
    const gc = dv.getUint32(12, true);
    const gf = dv.getUint32(16, true);
    const cps = new Uint32Array(count2);
    let off = 20;
    for (let i = 0; i < count2; i++, off += 4) {
      cps[i] = dv.getUint32(off, true);
    }
    const packed = new Uint8Array(buf);
    const coarse = unpackBits(packed, off, count2, gc * gc);
    off += count2 * gc * gc / 8;
    const fine = unpackBits(packed, off, count2, gf * gf);
    return { count: count2, cps, coarse, fine, gc, gf, threshold };
  }
  async function fetchAndParseRefTable(url) {
    var _a, _b;
    const record = await readPersistedRecord(url);
    const hasValidator = !!((record == null ? void 0 : record.etag) || (record == null ? void 0 : record.lastModified));
    const interval = hasValidator ? REVALIDATE_WITH_VALIDATOR_MS : REVALIDATE_NO_VALIDATOR_MS;
    const parseRecord = (r) => parseRefTable(r.data);
    if (record && Date.now() - record.updatedAt <= interval) {
      try {
        console.debug("[font-decrypt] 特征表命中本地缓存：", url);
        return parseRecord(record);
      } catch {
        await deletePersisted(url);
      }
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3e4);
    try {
      const headers = {};
      if (record == null ? void 0 : record.etag) {
        headers["If-None-Match"] = record.etag;
      } else if (record == null ? void 0 : record.lastModified) {
        headers["If-Modified-Since"] = record.lastModified;
      }
      const res = await fetch(url, { signal: controller.signal, headers });
      if (res.status === 304 && record) {
        console.debug("[font-decrypt] 特征表服务端未变更（304），沿用本地缓存：", url);
        await touchPersisted(url, record);
        return parseRecord(record);
      }
      if (!res.ok) {
        throw new Error("[font-decrypt] 特征表下载失败: HTTP " + res.status);
      }
      const buf = await res.arrayBuffer();
      const table = parseRefTable(buf);
      await persist(url, buf, (_a = res.headers.get("etag")) != null ? _a : void 0, (_b = res.headers.get("last-modified")) != null ? _b : void 0);
      console.debug("[font-decrypt] 特征表已从网络加载并缓存：", url);
      return table;
    } catch (err) {
      if (record) {
        try {
          console.warn("[font-decrypt] 特征表网络加载失败，回退使用本地缓存：", url);
          return parseRecord(record);
        } catch {
          await deletePersisted(url);
        }
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
  function loadRefTable(url) {
    let cached = refTableCache.get(url);
    if (!cached) {
      cached = fetchAndParseRefTable(url).catch((err) => {
        refTableCache.delete(url);
        throw err;
      });
      refTableCache.set(url, cached);
    }
    return cached;
  }
  const WORKER_TIMEOUT = 3e4;
  const WORKER_SOURCE = `
'use strict';
var RENDER = 360, SQ = 480, BASELINE = 384, SHORTLIST = 40, INK_THRESHOLD = 40;

var renderCv = null;
function getRenderCtx() {
	if (!renderCv) {
		renderCv = new OffscreenCanvas(SQ, SQ);
		renderCv.ctx = renderCv.getContext('2d', { willReadFrequently: true });
	}
	return renderCv.ctx;
}

var covCv = {};
function isCoveredByFont(fontFamily, ch) {
	var render = function (fallback) {
		var cv = covCv[fallback];
		if (!cv) {
			cv = new OffscreenCanvas(200, 200);
			cv.ctx = cv.getContext('2d', { willReadFrequently: true });
			covCv[fallback] = cv;
		}
		var ctx = cv.ctx;
		ctx.clearRect(0, 0, 200, 200);
		ctx.fillStyle = '#fff';
		ctx.font = '120px "' + fontFamily + '", ' + fallback;
		ctx.textBaseline = 'middle';
		ctx.fillText(ch, 10, 100);
		return ctx.getImageData(0, 0, 200, 200).data;
	};
	var a = render('serif');
	var b = render('sans-serif');
	var diff = 0;
	for (var i = 3; i < a.length; i += 4) {
		diff += Math.abs(a[i] - b[i]);
	}
	return diff < 1000;
}

function renderGlyph(fontFamily, ch, table) {
	var ctx = getRenderCtx();
	ctx.clearRect(0, 0, SQ, SQ);
	ctx.fillStyle = '#fff';
	ctx.font = RENDER + 'px "' + fontFamily + '"';
	ctx.textBaseline = 'alphabetic';
	var advance = ctx.measureText(ch).width;
	ctx.fillText(ch, (SQ - advance) / 2, BASELINE);
	var px = ctx.getImageData(0, 0, SQ, SQ).data;

	var hasInk = false;
	for (var i = 3; i < px.length; i += 4) {
		if (px[i] > INK_THRESHOLD) { hasInk = true; break; }
	}
	if (!hasInk) {
		return null;
	}

	var W = SQ + 1;
	var ii = new Uint32Array(W * W);
	for (var y = 0; y < SQ; y++) {
		var rowSum = 0;
		var srcRow = y * SQ * 4;
		var dstRow = (y + 1) * W;
		var upRow = y * W;
		for (var x = 0; x < SQ; x++) {
			rowSum += px[srcRow + x * 4 + 3];
			ii[dstRow + x + 1] = ii[upRow + x + 1] + rowSum;
		}
	}

	var box = function (n) {
		var b = SQ / n;
		var area = b * b;
		var out = new Uint8Array(n * n);
		for (var gy = 0; gy < n; gy++) {
			for (var gx = 0; gx < n; gx++) {
				var y0 = gy * b;
				var x0 = gx * b;
				var sum = ii[(y0 + b) * W + x0 + b] - ii[y0 * W + x0 + b] - ii[(y0 + b) * W + x0] + ii[y0 * W + x0];
				out[gy * n + gx] = sum / area > table.threshold ? 1 : 0;
			}
		}
		return out;
	};

	return { coarse: box(table.gc), fine: box(table.gf) };
}

function bitDistance(tableArr, idx, dims, q) {
	var s = 0;
	var base = idx * dims;
	for (var i = 0; i < dims; i++) {
		if (tableArr[base + i] !== q[i]) { s++; }
	}
	return s;
}

function crackChar(table, feat) {
	var count = table.count;
	var dists = new Float64Array(count);
	for (var i = 0; i < count; i++) {
		dists[i] = bitDistance(table.coarse, i, table.gc * table.gc, feat.coarse);
	}
	var sorted = Float64Array.from(dists);
	sorted.sort();
	var threshold = sorted[Math.min(SHORTLIST, count) - 1];
	var idx = [];
	for (var j = 0; j < count; j++) {
		if (dists[j] <= threshold) { idx.push(j); }
	}
	var bestI = -1, best = Infinity, second = Infinity;
	for (var k = 0; k < idx.length; k++) {
		var d = bitDistance(table.fine, idx[k], table.gf * table.gf, feat.fine);
		if (d < best) { second = best; best = d; bestI = idx[k]; }
		else if (d < second) { second = d; }
	}
	return {
		ch: String.fromCodePoint(table.cps[bestI]),
		margin: second > 0 ? 1 - best / second : 1
	};
}

self.onmessage = function (e) {
	var msg = e.data;
	(async function () {
		if (typeof FontFace === 'undefined' || typeof OffscreenCanvas === 'undefined' || !self.fonts) {
			throw new Error('worker env unsupported');
		}
		var family = 'font-decrypt-w-' + Math.random().toString(36).slice(2);
		var source = typeof msg.fontSource === 'string' ? 'url("' + msg.fontSource + '")' : msg.fontSource;
		var face = new FontFace(family, source, msg.fontWeight ? { weight: msg.fontWeight } : {});
		await face.load();
		self.fonts.add(face);
		var table = {
			count: msg.count, cps: msg.cps, coarse: msg.coarse, fine: msg.fine,
			gc: msg.gc, gf: msg.gf, threshold: msg.threshold
		};
		var map = {};
		var details = [];
		var uniq = msg.chars;
		for (var i = 0; i < uniq.length; i++) {
			var ch = uniq[i];
			if (!isCoveredByFont(family, ch)) { map[ch] = ch; continue; }
			var feat = renderGlyph(family, ch, table);
			if (!feat) { map[ch] = ch; continue; }
			var r = crackChar(table, feat);
			map[ch] = r.ch;
			details.push({ from: ch, to: r.ch, margin: +r.margin.toFixed(3) });
			self.postMessage({ type: 'progress', done: i + 1, total: uniq.length });
		}
		self.postMessage({ type: 'result', map: map, details: details });
	})().catch(function (err) {
		self.postMessage({ type: 'error', message: String((err && err.message) || err) });
	});
};
`;
  function crackFontInWorker(fontSource, chars, config2, table) {
    return new Promise((resolve) => {
      if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") {
        return resolve(null);
      }
      let worker;
      try {
        const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "application/javascript" }));
        worker = new Worker(url);
        URL.revokeObjectURL(url);
      } catch {
        return resolve(null);
      }
      let settled = false;
      const timer = setTimeout(() => done(null), WORKER_TIMEOUT);
      const done = (r) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          worker.terminate();
          resolve(r);
        }
      };
      worker.onerror = () => done(null);
      worker.onmessage = (e) => {
        var _a;
        const msg = e.data;
        if (msg.type === "progress") {
          (_a = config2.onProgress) == null ? void 0 : _a.call(config2, msg.done, msg.total);
        } else if (msg.type === "result") {
          done({ map: msg.map, details: msg.details });
        } else if (msg.type === "error") {
          done(null);
        }
      };
      worker.postMessage({
        fontSource,
        chars,
        fontWeight: config2.fontWeight,
        count: table.count,
        cps: table.cps,
        coarse: table.coarse,
        fine: table.fine,
        gc: table.gc,
        gf: table.gf,
        threshold: table.threshold
      });
    });
  }
  const RENDER = 360;
  const SQ = 480;
  const BASELINE = 384;
  const SHORTLIST = 40;
  const INK_THRESHOLD = 40;
  let renderCanvas;
  function getRenderCanvas() {
    if (!renderCanvas) {
      const cv = document.createElement("canvas");
      cv.width = SQ;
      cv.height = SQ;
      renderCanvas = { cv, ctx: cv.getContext("2d", { willReadFrequently: true }) };
    }
    return renderCanvas;
  }
  function renderGlyph(fontFamily, ch, table) {
    const { ctx } = getRenderCanvas();
    ctx.clearRect(0, 0, SQ, SQ);
    ctx.fillStyle = "#fff";
    ctx.font = `${RENDER}px "${fontFamily}"`;
    ctx.textBaseline = "alphabetic";
    const advance = ctx.measureText(ch).width;
    ctx.fillText(ch, (SQ - advance) / 2, BASELINE);
    const px = ctx.getImageData(0, 0, SQ, SQ).data;
    let hasInk = false;
    for (let i = 3; i < px.length; i += 4) {
      if (px[i] > INK_THRESHOLD) {
        hasInk = true;
        break;
      }
    }
    if (!hasInk) {
      return null;
    }
    const W = SQ + 1;
    const ii = new Uint32Array(W * W);
    for (let y = 0; y < SQ; y++) {
      let rowSum = 0;
      const srcRow = y * SQ * 4;
      const dstRow = (y + 1) * W;
      const upRow = y * W;
      for (let x = 0; x < SQ; x++) {
        rowSum += px[srcRow + x * 4 + 3];
        ii[dstRow + x + 1] = ii[upRow + x + 1] + rowSum;
      }
    }
    const box = (n) => {
      const b = SQ / n;
      const area = b * b;
      const out = new Uint8Array(n * n);
      for (let gy = 0; gy < n; gy++) {
        for (let gx = 0; gx < n; gx++) {
          const y0 = gy * b;
          const x0 = gx * b;
          const sum = ii[(y0 + b) * W + x0 + b] - ii[y0 * W + x0 + b] - ii[(y0 + b) * W + x0] + ii[y0 * W + x0];
          out[gy * n + gx] = sum / area > table.threshold ? 1 : 0;
        }
      }
      return out;
    };
    return { coarse: box(table.gc), fine: box(table.gf) };
  }
  const coverageCanvasCache = {};
  function isCoveredByFont(fontFamily, ch) {
    const render2 = (fallback) => {
      var _a;
      const key = fontFamily + "|" + fallback;
      const cv = (_a = coverageCanvasCache[key]) != null ? _a : coverageCanvasCache[key] = (() => {
        const c = document.createElement("canvas");
        c.width = 200;
        c.height = 200;
        return c;
      })();
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, 200, 200);
      ctx.fillStyle = "#fff";
      ctx.font = `120px "${fontFamily}", ${fallback}`;
      ctx.textBaseline = "middle";
      ctx.fillText(ch, 10, 100);
      return ctx.getImageData(0, 0, 200, 200).data;
    };
    const a = render2("serif");
    const b = render2("sans-serif");
    let diff = 0;
    for (let i = 3; i < a.length; i += 4) {
      diff += Math.abs(a[i] - b[i]);
    }
    return diff < 1e3;
  }
  function bitDistance(tableArr, idx, dims, q) {
    let s = 0;
    const base = idx * dims;
    for (let i = 0; i < dims; i++) {
      if (tableArr[base + i] !== q[i]) {
        s++;
      }
    }
    return s;
  }
  function crackChar(table, feat) {
    const { count: count2, cps, coarse, fine, gc, gf } = table;
    const dists = new Float64Array(count2);
    for (let i = 0; i < count2; i++) {
      dists[i] = bitDistance(coarse, i, gc * gc, feat.coarse);
    }
    const sorted = Float64Array.from(dists);
    sorted.sort();
    const threshold = sorted[Math.min(SHORTLIST, count2) - 1];
    const idx = [];
    for (let i = 0; i < count2; i++) {
      if (dists[i] <= threshold) {
        idx.push(i);
      }
    }
    let bestI = -1;
    let best = Infinity;
    let second = Infinity;
    for (let k = 0; k < idx.length; k++) {
      const i = idx[k];
      const d = bitDistance(fine, i, gf * gf, feat.fine);
      if (d < best) {
        second = best;
        best = d;
        bestI = i;
      } else if (d < second) {
        second = d;
      }
    }
    return {
      ch: String.fromCodePoint(cps[bestI]),
      best,
      second,
      margin: second > 0 ? 1 - best / second : 1
    };
  }
  async function crackFont(fontSource, chars, config2) {
    var _a;
    const table = await loadRefTable(config2.refTableUrl);
    const uniq = [...new Set(chars)].filter((c) => c.trim() !== "");
    if (config2.useWorker !== false) {
      const r = await crackFontInWorker(fontSource, uniq, config2, table);
      if (r) {
        return r;
      }
    }
    const family = "font-decrypt-" + Math.random().toString(36).slice(2);
    const source = typeof fontSource === "string" ? `url("${fontSource}")` : fontSource;
    const face = new FontFace(family, source, config2.fontWeight ? { weight: config2.fontWeight } : {});
    await Promise.race([
      face.load(),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error("[font-decrypt] 字体加载超时")), 15e3))
    ]);
    document.fonts.add(face);
    const map = {};
    const details = [];
    for (let i = 0; i < uniq.length; i++) {
      const ch = uniq[i];
      if (!isCoveredByFont(family, ch)) {
        map[ch] = ch;
        continue;
      }
      const feat = renderGlyph(family, ch, table);
      if (!feat) {
        map[ch] = ch;
        continue;
      }
      const r = crackChar(table, feat);
      map[ch] = r.ch;
      details.push({ from: ch, to: r.ch, margin: +r.margin.toFixed(3) });
      (_a = config2.onProgress) == null ? void 0 : _a.call(config2, i + 1, uniq.length);
      if (i % 10 === 9) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    return { map, details };
  }
  function decryptText(text2, map) {
    return [...text2].map((c) => {
      var _a;
      return (_a = map[c]) != null ? _a : c;
    }).join("");
  }
  function decryptElements(roots, map) {
    var _a;
    for (const root2 of Array.isArray(roots) ? roots : [roots]) {
      const walker = document.createTreeWalker(root2, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        nodes.push(walker.currentNode);
      }
      for (const node of nodes) {
        node.nodeValue = decryptText((_a = node.nodeValue) != null ? _a : "", map);
      }
    }
  }
  function collectChars(roots) {
    var _a;
    let text2 = "";
    for (const root2 of Array.isArray(roots) ? roots : [roots]) {
      text2 += (_a = root2.textContent) != null ? _a : "";
    }
    return text2;
  }
  function findFontUrls(doc = document) {
    var _a, _b;
    const urls = /* @__PURE__ */ new Set();
    for (const sheet of Array.from(doc.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule instanceof CSSFontFaceRule) {
            const m = /url\(["']?([^"')]+)["']?\)/.exec(rule.style.getPropertyValue("src"));
            if (m) {
              urls.add(new URL(m[1], location.href).href);
            }
          }
        }
      } catch {
      }
    }
    const perf = (_b = (_a = doc.defaultView) == null ? void 0 : _a.performance) != null ? _b : performance;
    for (const entry of perf.getEntriesByType("resource")) {
      if (/\.(ttf|otf|woff2?)(\?|$)/i.test(entry.name)) {
        urls.add(entry.name);
      }
    }
    return [...urls];
  }
  function extractFontFromStyle(doc, fontFamilyMarker) {
    var _a, _b;
    const styleEl = Array.from(doc.head.querySelectorAll("style")).find((s) => {
      var _a2;
      return (_a2 = s.textContent) == null ? void 0 : _a2.includes(fontFamilyMarker);
    });
    const base64 = (_b = (_a = styleEl == null ? void 0 : styleEl.textContent) == null ? void 0 : _a.match(/base64,([\w\W]+?)['")]/)) == null ? void 0 : _b[1];
    if (!base64) {
      return void 0;
    }
    const raw = window.atob(base64);
    const buffer = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      buffer[i] = raw.charCodeAt(i);
    }
    return buffer.buffer;
  }
  function listFontFaces(doc = document) {
    var _a, _b;
    const faces = [];
    for (const sheet of Array.from(doc.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule instanceof CSSFontFaceRule) {
            const family = rule.style.getPropertyValue("font-family").replace(/["']/g, "").trim();
            const m = /url\(["']?([^"')]+)["']?\)/.exec(rule.style.getPropertyValue("src"));
            if (family && m) {
              const base = (_b = (_a = doc.location) == null ? void 0 : _a.href) != null ? _b : location.href;
              faces.push({ family, src: m[1].startsWith("data:") ? m[1] : new URL(m[1], base).href });
            }
          }
        }
      } catch {
      }
    }
    return faces;
  }
  class FontDecryptor {
    constructor(fontSource, config2) {
      this.map = {};
      this.queue = Promise.resolve();
      this.fontSource = fontSource;
      this.config = config2;
    }
    static async create(fontSource, config2) {
      await loadRefTable(config2.refTableUrl);
      return new FontDecryptor(fontSource, config2);
    }
    get size() {
      return Object.keys(this.map).length;
    }
    decrypt(els) {
      return this.enqueue(async () => {
        const chars = collectChars(els);
        const newChars = [...new Set(chars)].filter((c) => c.trim() !== "" && !(c in this.map));
        if (newChars.length) {
          const useWorker = newChars.length > 20 ? this.config.useWorker : false;
          const r = await crackFont(this.fontSource, newChars, { ...this.config, useWorker });
          Object.assign(this.map, r.map);
        }
        decryptElements(els, this.map);
      });
    }
    waitForIdle() {
      return this.queue;
    }
    enqueue(task) {
      const run = this.queue.then(task, task);
      this.queue = run.catch(() => void 0);
      return run;
    }
  }
  function watchElements(root2, selector, onFound, options) {
    var _a, _b;
    const target = root2 instanceof Document ? (_a = root2.body) != null ? _a : root2.documentElement : root2;
    const debounceMs = (_b = options == null ? void 0 : options.debounceMs) != null ? _b : 50;
    let stopped = false;
    let timer;
    let running = false;
    let rescan = false;
    const scan = async () => {
      if (stopped || running) {
        rescan = !stopped;
        return;
      }
      running = true;
      try {
        const els = Array.from(target.querySelectorAll(selector));
        if (els.length) {
          await onFound(els);
        }
      } catch (err) {
        console.error("[font-decrypt] watchElements 回调执行失败：", err);
      } finally {
        running = false;
        if (rescan && !stopped) {
          rescan = false;
          schedule();
        }
      }
    };
    const schedule = () => {
      if (stopped) {
        return;
      }
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = void 0;
        scan();
      }, debounceMs);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(target, { childList: true, subtree: true, characterData: true });
    scan();
    return {
      stop: () => {
        stopped = true;
        clearTimeout(timer);
        timer = void 0;
        observer.disconnect();
      },
      isBusy: () => timer !== void 0 || running || rescan
    };
  }
  const CX_SECRET_REF_TABLE_URL = "https://cdn.ocsjs.com/resources/font/font_ref_cx.bin";
  const HIGHT_PLAYBACK_RATE_WARNS = [
    "⚠️高倍速、夜间、白天大量运行 等情况\n可能导致学习记录清空/回退",
    "⚠️超星后台可以看到学习时长，请谨慎设置",
    "⚠️如已清空/回退，请降低倍速至1-2倍"
  ];
  let top$1 = (function(){
    try { if (globalThis.top && globalThis.top.document) return globalThis.top; } catch (e) {}
    return self;
  })();
  try {
    top$1.jobs = top$1.jobs || [];
    top$1.currentMedia = top$1.currentMedia || void 0;
  } catch {
  }
  const state$4 = {
    study: {
      videojs: /* @__PURE__ */ Object.create({}),
      hacked: false,
      answererWrapperUnsetMessage: void 0,
      playbackRateWarningListenerId: 0
    }
  };
  const CXProject = lib.Project.create({
    name: "超星学习通",
    domains: [
      "chaoxing.com",
      "edu.cn",
      "org.cn",
      "xueyinonline.com",
      "hnsyu.net",
      "qutjxjy.cn",
      "ynny.cn",
      "hnvist.cn",
      "fjlecb.cn",
      "gdhkmooc.com",
      "cugbonline.cn",
      "zjelib.cn",
      "cqrspx.cn",
      "neauce.com",
      "zhihui-yun.com",
      "cqie.cn",
      "ccqmxx.com",
      "jxgmxy.com",
      "jnzyjsxy.cn",
      "smjyxy.cn",
      "sslibrary.com",
      "xuexi365.com"
    ],
    scripts: {
      env: new lib.Script({
        name: "环境准备脚本",
        matches: [["所有页面", /.*/]],
        hideInPanel: true,
        onstart() {
          try {
            let _self = self;
            let _try_count = 10;
            let found = false;
            while (_self.parent !== void 0 && _try_count > 0) {
              try {
                if (_self.location.href.includes("/mycourse/studentstudy")) {
                  top$1 = _self;
                  found = true;
                  console.log("[ocsjs] top change to " + top$1.location.href);
                  break;
                }
              } catch (e) {
                break;
              }
              _try_count--;
              _self = _self.parent;
            }
            if (!found && _self && _self !== self) {
              try {
                if (_self.document) {
                  top$1 = _self;
                }
              } catch (e) {
                top$1 = self;
              }
            }
          } catch (e) {
            console.warn("[ocsjs] fail of find top");
            console.warn(e);
            top$1 = self;
          }
        }
      }),
      guide: new lib.Script({
        name: "💡 使用提示",
        matches: [
          ["首页", "https://www.chaoxing.com"],
          ["旧版个人首页", "chaoxing.com/space/index"],
          ["新版个人首页", "chaoxing.com/base"],
          ["学习页面", "chaoxing.com/mycourse"],
          ["新版学习页面", "chaoxing.com/mooc2-ans/mycourse"]
        ],
        namespace: "cx.guide",
        configs: {
          notes: {
            defaultValue: createSteps(["登录网课平台", "进入任意视频、作业/考试界面", "等待脚本自动运行"]).outerHTML
          }
        },
        oncomplete() {
          if (["mycourse/studentstudy"].some((path) => location.href.includes(path))) {
            lib.$message.success("已进入学习页面，请等待自动运行...");
            return;
          }
          if (self !== top$1)
            return;
          lib.$message.info("请手动进入视频、作业、考试页面，脚本会自动运行。");
        },
        onrender({ panel }) {
          if (lib.$gm.isInGMContext()) {
            const gotoPanel = (scriptKey) => {
              const target = CXProject.scripts[scriptKey];
              target.projectName = CXProject.name;
              BackgroundProject.scripts.render.methods.pin(target);
            };
            panel.body.replaceChildren(
              lib.h("hr"),
              lib.$ui.button("👉 前往学习设置", {}, (btn) => {
                btn.style.marginRight = "12px";
                btn.onclick = () => gotoPanel("study");
              }),
              lib.$ui.button("👉 前往作业设置", {}, (btn) => {
                btn.onclick = () => gotoPanel("work");
              })
            );
          }
        }
      }),
      study: new lib.Script({
        name: "🖥️ 课程学习",
        namespace: "cx.new.study",
        matches: [
          ["任务点页面", /(?:\/mooc-ans)?\/knowledge\/cards/],
          ["学银节点任务点页面", /\/[^/]*nodedetailcontroller\/visitnodedetail/],
          ["阅读任务点", "/readsvr/book/mooc"]
        ],
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              ["任务点不是顺序执行，如果某一个任务没有动", "请查看是否有其他任务正在学习，耐心等待即可。"],
              "闯关模式请注意题库如果没完成，需要自己完成才能解锁章节。",
              "请勿凌晨刷课，部分学校课程可能会清空进度。",
              ["⚠️目前超星倍速风控严重，如果高倍速", "被平台清空进度，请调到1-2倍速学习！"]
            ]).outerHTML
          },
          playbackRate: { ...playbackRate$2, attrs: { title: HIGHT_PLAYBACK_RATE_WARNS.join("\n") } },
          volume,
          videoQuizStrategy: {
            label: "视频内题目",
            tag: "select",
            options: [
              ["random", "随机答题"],
              ["ignore", "忽略"]
            ],
            attrs: {
              title: "视频有时在学习过程中会弹出题目，这个好像并不计算在分数内，所以可以忽略，视频可以正常观看，这里提供几个方法处理题目"
            },
            defaultValue: "random"
          },
          mode: {
            label: "跳转模式",
            tag: "select",
            options: [
              ["next", "完成后跳转下一节", "完成小节后，自动点击下一节按钮"],
              ["job", "智能模式", "自动寻找任务点完成"],
              ["manually", "完成后暂停，等待手动跳转", "适用于自己手动运行"]
            ],
            defaultValue: "job"
          },
          restudy: {
            label: "复习模式",
            attrs: { title: "已经完成的视频继续学习", type: "checkbox" },
            defaultValue: false
          },
          enables: {
            ...dropdownStyle,
            label: "高级设置",
            attrs: { type: "checkbox" },
            defaultValue: false
          },
          autoJumpToUnFinishJob: {
            elementClassName: "config-details",
            showIf: "cx.new.study.enables",
            label: "自动前往首个任务点",
            attrs: {
              type: "checkbox",
              title: "进入学习界面后自动前往未完成的任务点，如果关闭则从当前任务点往下学习 （积分课、智慧课程等课程 建议关闭）"
            },
            defaultValue: true
          },
          forceLearn: {
            elementClassName: "config-details",
            showIf: "cx.new.study.enables",
            label: "强制学习",
            attrs: {
              title: "视频一般分为：非任务点、任务点、和已完成任务点，当遇到“非任务点”时需要开启此选项才会进行学习",
              type: "checkbox"
            },
            defaultValue: false
          },
          backToFirstWhenFinish: {
            elementClassName: "config-details",
            showIf: "cx.new.study.enables",
            label: "完成全部后重新学习",
            attrs: {
              type: "checkbox",
              title: "当章节已经学习完成至最后一章时，跳转到第一个章节重新开始学习。"
            },
            defaultValue: false
          },
          showTextareaWhenEdit: {
            elementClassName: "config-details",
            label: "编辑时显示自定义编辑框",
            showIf: "cx.new.study.enables",
            attrs: {
              type: "checkbox",
              title: "超星默认禁止在编辑框中复制粘贴，开启此选项可以在文本框编辑时生成一个自定义编辑框进行编辑，脚本会将内容同步到编辑框中。"
            },
            defaultValue: true
          },
          notifyWhenHasFaceRecognition: {
            elementClassName: "config-details",
            showIf: "cx.new.study.enables",
            label: "出现人脸识别时通知我",
            attrs: {
              type: "checkbox"
            },
            defaultValue: true
          },
          enableMedia: {
            elementClassName: "config-details",
            showIf: "cx.new.study.enables",
            label: "视频/音频自动播放",
            attrs: { type: "checkbox", title: "开启：音频和视频的自动播放" },
            defaultValue: true
          },
          enablePPT: {
            elementClassName: "config-details",
            showIf: "cx.new.study.enables",
            label: "PPT/书籍自动完成",
            attrs: { type: "checkbox", title: "开启：PPT/书籍自动翻阅" },
            defaultValue: true
          },
          enableChapterTest: {
            elementClassName: "config-details",
            showIf: "cx.new.study.enables",
            label: "章节测试自动答题",
            attrs: { type: "checkbox", title: "开启：章节测试自动答题" },
            defaultValue: true
          },
          enableHyperlink: {
            elementClassName: "config-details",
            showIf: "cx.new.study.enables",
            label: "链接任务自动完成",
            attrs: { type: "checkbox", title: "开启：链接任务自动完成" },
            defaultValue: true
          }
        },
        onrender({ panel }) {
          var _a;
          if (!((_a = CommonProject.scripts.settings.cfg.answererWrappers) == null ? void 0 : _a.length)) {
            answerWrapperEmptyWarning(10);
          }
          this.offConfigChange(state$4.study.playbackRateWarningListenerId);
          state$4.study.playbackRateWarningListenerId = this.onConfigChange("playbackRate", (playbackRate2) => {
            if (playbackRate2 > 2) {
              lib.$modal.alert({
                title: "⚠️高倍速警告 （倍速 >= 2）",
                content: lib.$ui.notes(HIGHT_PLAYBACK_RATE_WARNS),
                maskCloseable: false,
                confirmButtonText: "我已知晓风险"
              });
            }
          }) || 0;
        },
        async onactive() {
          if (/\/readsvr\/book\/mooc/.test(location.href)) {
            if (document.querySelector("#reader")) {
              require(["reader"], (_reader) => {
                waitForElement(".readerPager").then(() => {
                  setTimeout(async () => {
                    var _a;
                    const jumper = document.querySelector("#pagejump");
                    if ((_reader == null ? void 0 : _reader.goPage) && jumper) {
                      const timing = parseInt(((_a = new URL(location.href).searchParams.get("timing")) == null ? void 0 : _a.toString()) || "60") + 3;
                      console.log(timing);
                      await $.sleep(timing * 1e3);
                      jumper.value = "5";
                      jumper.dispatchEvent(new Event("change"));
                      console.log("已跳转正文页");
                      await $.sleep(timing * 1e3);
                      jumper.value = "7";
                      jumper.dispatchEvent(new Event("change"));
                      console.log("已跳转封底页");
                      await $.sleep(timing * 1e3);
                      Array.from(document.querySelectorAll(".readerPager")).filter((el) => el.style.zIndex === "101")[0].click();
                      console.log("阅读完成");
                    }
                  }, 3e3);
                });
              });
            } else {
              $console.log("正在完成书籍/PPT...");
              setTimeout(() => {
                readweb.goto(epage);
              }, 5e3);
            }
            return;
          }
          if (/\/knowledge\/cards/.test(location.href) || /\/[^/]*nodedetailcontroller\/visitnodedetail/.test(location.href)) {
            const updateMediaState = () => {
              if (top$1.currentMedia) {
                top$1.currentMedia.playbackRate = parseFloat(this.cfg.playbackRate.toString());
                top$1.currentMedia.volume = this.cfg.volume;
              }
            };
            this.onConfigChange("playbackRate", updateMediaState);
            this.onConfigChange("volume", updateMediaState);
            await study({
              ...this.cfg,
              playbackRate: parseFloat(this.cfg.playbackRate.toString())
            });
          }
        }
      }),
      work: new lib.Script({
        name: "✍️ 作业考试脚本",
        matches: [
          ["作业页面", /(?:\/mooc-ans)?\/mooc2\/work\/dowork/],
          ["考试整卷预览页面", /(?:\/mooc-ans)?\/mooc2\/exam\/preview/],
          ["作业完成界面", "/work/view"]
        ],
        namespace: "cx.new.work",
        configs: { notes: workNotes$1 },
        async oncomplete() {
          if (location.href.includes("/work/view")) {
            return lib.$message.info("当前作业已提交、自动答题关闭");
          }
          await ensureCxFontDecrypted();
          const isExam2 = /\/exam\/preview/.test(location.href);
          commonWork({
            mount_script: this,
            workerProvider: (opts) => workOrExam$1(isExam2 ? "exam" : "work", { ...opts, preview_mode: true })
          });
        }
      }),
      mobilelearn: new lib.Script({
        name: "✍️ 任务列表",
        matches: [
          ["任务列表首页", "/page/active/stuActiveList"],
          ["随堂练习页面", "/page/quiz/stu/answerQuestion2"]
        ],
        namespace: "cx.new.mobilelearn",
        configs: { notes: workNotes$1 },
        async oncomplete() {
          if (location.href.includes("/page/quiz/stu/answerQuestion2")) {
            await waitForElement(".left-question-list");
            await $.sleep(1e3);
            await ensureCxFontDecrypted();
            CORSUtils.pinWorkPanel();
            commonWork({
              iframe_control: true,
              workerProvider: (opts) => mobilelearn(opts)
            });
            return;
          }
          CommonEvents.emitWorkerStateChange("close");
        }
      }),
      autoRead: new lib.Script({
        name: "🖥️ 自动阅读",
        matches: [
          ["阅读页面", /\/[^/]*nodedetailcontroller\/visitnodedetail/],
          ["课程目录", /chaoxing.com\/course\/\d+\.html/],
          ["课程目录", /chaoxing.com\/mooc-ans\/course\/\d+\.html/],
          ["积分课阅读课程目录", "/mooc-ans/zt/portal"]
        ],
        namespace: "cx.new.auto-read",
        configs: {
          notes: {
            defaultValue: lib.$ui.notes(["点击任意章节开始自动阅读", "阅读任务次日才会统计阅读时长"]).outerHTML
          },
          restartAfterFinish: {
            label: "无限阅读",
            attrs: { type: "checkbox", title: "阅读完成最后一章后从头第一章继续阅读" },
            defaultValue: false
          }
        },
        oncomplete() {
          BackgroundProject.scripts.render.methods.pin(this);
          if (/\/[^/]*nodedetailcontroller\/visitnodedetail/.test(location.href) === false) {
            lib.$message.info("请手动点击任意章节开始自动阅读");
            startAtFirst();
            return;
          }
          if (document.querySelector(".ans-module, .cardContent iframe, #video, video")) {
            console.log("[ocsjs] 检测到任务点内容，已交给「课程学习」处理，自动阅读避让");
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
            const next2 = lib.$el(".nodeItem.r i") || (function(){
              var els = document.querySelectorAll("[onclick*=linkUrl]");
              for (var i = 0; i < els.length; i++) {
                var oc = (els[i].getAttribute("onclick") || "").replace(/\s/g, "");
                if (/,1\)$/.test(oc)) return els[i];
              }
              var b = lib.$el("#right.prev_next, .prev_next.next");
              return b && (b.getAttribute("onclick") || "").includes("linkUrl") ? b : null;
            })();
            if (next2) {
              next2.click();
            } else {
              if (this.cfg.restartAfterFinish) {
                setTimeout(() => startAtFirst(), 3e3);
                lib.$message.info({ content: "即将重新从头开始阅读", duration: 10 });
                $console.log("即将重新从头开始阅读");
              } else {
                lib.$message.success({ content: "阅读任务已完成", duration: 0 });
                $console.log("未检测到下一页");
              }
            }
          }, (60 + 3) * 1e3);
          function startAtFirst() {
            const texts = lib.$$el(".course_section .chapterText");
            if (texts.length) {
              texts[0].click();
              return;
            }
            const firstNode = lib.$el("#chapterListUl .cursorC") || lib.$el("#chapterListUl [onclick*=linkUrl]") || lib.$el("[onclick*=linkUrl]");
            if (firstNode) {
              firstNode.click();
            }
          }
        }
      }),
      pageRedirect: new lib.Script({
        name: "章节页面自动切换脚本",
        matches: [["课程任务页面", "pageHeader=0"]],
        hideInPanel: true,
        async oncomplete() {
          if (top$1 === window) {
            const a = document.querySelector('a[title="章节"]');
            if (a) {
              await $.sleep(1e3);
              a.click();
              lib.$message.info({
                content: "已经为您自动切换到章节列表页面，手动进入任意章节即可开始自动学习！"
              });
            }
          }
        }
      }),
      versionRedirect: new lib.Script({
        name: "版本切换脚本",
        matches: [
          ["", "mooc2=0"],
          ["", "mycourse/studentcourse"],
          ["", "work/getAllWork"],
          ["", "work/doHomeWorkNew"],
          ["", "exam/test\\?"]
        ],
        hideInPanel: true,
        async oncomplete() {
          if (top$1 === window) {
            lib.$message.warn({
              content: "OCS网课助手不支持旧版超星, 即将切换到超星新版, 如有其他第三方插件请关闭, 可能有兼容问题导致频繁切换。",
              duration: 0
            });
            await $.sleep(2e3);
            await waitForFaceRecognition();
            const experience = document.querySelector(".experience");
            if (experience) {
              experience.click();
            } else {
              const newUrl = new URL(window.location.href);
              if (newUrl.pathname.includes("/mycourse/studentstudy")) {
                const needMoocAns = newUrl.hostname.includes("xueyinonline.com") || newUrl.pathname.includes("/mooc-ans/");
                newUrl.pathname = needMoocAns ? newUrl.pathname.replace(/^.*?\/mycourse\/studentstudy/, "/mooc-ans/mycourse/studentstudy").replace(/^\/mooc-ans\/mooc-ans/, "/mooc-ans") : newUrl.pathname.replace(/^.*?\/mycourse\/studentstudy/, "/mycourse/studentstudy");
              }
              const params = newUrl.searchParams;
              let changed = false;
              if (params.get("mooc2") !== "1") {
                params.set("mooc2", "1");
                changed = true;
              }
              if (params.get("newMooc") !== "true") {
                params.set("newMooc", "true");
                changed = true;
              }
              if (changed)
                window.location.replace(newUrl);
            }
          }
        }
      }),
      examRedirect: new lib.Script({
        name: "考试整卷预览脚本",
        hideInPanel: true,
        matches: [
          ["新版考试页面", "exam-ans/exam/test/reVersionTestStartNew"],
          ["新版考试页面2", "mooc-ans/exam/test/reVersionTestStartNew"]
        ],
        configs: { notes: workNotes$1 },
        async oncomplete() {
          var _a, _b;
          if ((_b = (_a = lib.$gm.unsafeWindow.document.querySelector(".mark_info")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.includes("不允许整卷预览")) {
            lib.$message.warn({
              content: lib.$ui.notes([
                "由于当前考试禁止整卷预览，各题为独立新页面，只能一个个答题",
                "在考完前禁止手动切换题目，否则会导致重复答题！",
                "完成后或者开考前请手动删除搜索结果！",
                "想加快速度请更改通用-全局设置-高级设置-搜题间隔，设置为 1-3 秒即可。"
              ]),
              duration: 0
            });
            const isExam2 = /\/exam\/test/.test(location.href);
            const workOptions = CommonProject.scripts.settings.methods.getWorkOptions();
            BackgroundProject.scripts.render.methods.pin(this);
            await ensureCxFontDecrypted();
            commonWork({
              mount_script: this,
              start_delay_seconds: workOptions.period,
              workerProvider: (opts) => workOrExam$1(isExam2 ? "exam" : "work", { ...opts, preview_mode: false, thread: 1 })
            });
            return;
          }
          lib.$message.info({ content: "即将跳转到整卷预览页面进行考试。" });
          setTimeout(() => lib.$gm.unsafeWindow.topreview(), 3e3);
        }
      }),
      rateHack: new lib.Script({
        name: "屏蔽倍速限制",
        hideInPanel: true,
        matches: [["", "/ananas/modules/video/"]],
        onstart() {
          rateHack();
        }
      }),
      copyHack: new lib.Script({
        name: "屏蔽复制粘贴限制",
        hideInPanel: true,
        matches: [["所有页面", /.*/]],
        methods() {
          return {
            hackEditorPaste() {
              var _a, _b;
              try {
                const instants = ((_b = (_a = lib.$gm.unsafeWindow) == null ? void 0 : _a.UE) == null ? void 0 : _b.instants) || [];
                for (const key in instants) {
                  const ue = instants[key];
                  if (ue == null ? void 0 : ue.textarea) {
                    ue.body.addEventListener("click", async () => {
                      if (CXProject.scripts.study.cfg.showTextareaWhenEdit) {
                        const defaultText = lib.h("span", { innerHTML: ue.textarea.value }).textContent;
                        lib.$modal.prompt({
                          content: "请在此文本框进行编辑，防止超星无法复制粘贴。(如需关闭请前往设置: 课程学习-编辑时显示自定义编辑框)",
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
                    if (lib.$gm.unsafeWindow.editorPaste) {
                      ue.removeListener("beforepaste", lib.$gm.unsafeWindow.editorPaste);
                    }
                    if (lib.$gm.unsafeWindow.myEditor_paste) {
                      ue.removeListener("beforepaste", lib.$gm.unsafeWindow.myEditor_paste);
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
            if (typeof lib.$gm.unsafeWindow.UE !== "undefined") {
              clearInterval(hackInterval);
              this.methods.hackEditorPaste();
              console.log("已解除输入框无法复制粘贴限制");
            }
          }, 500);
        }
      }),
      studyDispatcher: new lib.Script({
        name: "课程学习调度器",
        matches: [["课程学习页面", /(?:\/mooc-ans)?\/mycourse\/studentstudy/]],
        namespace: "cx.new.study-dispatcher",
        hideInPanel: true,
        async oncomplete() {
          let chapters = await CXAnalyses.waitForChapterInfos();
          const moocUrl = new URL(window.location.href);
          if (moocUrl.searchParams.get("mooc2") === null) {
            moocUrl.searchParams.set("mooc2", "1");
            window.location.replace(moocUrl.toString());
            return;
          }
          if (CXProject.scripts.study.cfg.autoJumpToUnFinishJob) {
            chapters = chapters.filter((chapter) => chapter.unFinishCount !== 0);
            if (chapters.length === 0) {
              lib.$message.warn({ content: "页面任务点数量为空! 请刷新重试!" });
            } else {
              const params2 = new URLSearchParams(window.location.href);
              const courseId = params2.get("courseId");
              const classId = params2.get("clazzid");
              if (lib.$$el(`.posCatalog_active[id="cur${chapters[0].chapterId}"]`).length === 0) {
                lib.$gm.unsafeWindow.getTeacherAjax(courseId, classId, chapters[0].chapterId);
              }
              await $.sleep(1e3);
            }
          }
          await $.sleep(1e3);
          CXAnalyses.scrollToActiveChapter();
        }
      }),
      cxSecretFontRecognize: new lib.Script({
        name: "繁体字识别",
        hideInPanel: true,
        matches: [
          ["题目页面", "work/doHomeWorkNew"],
          ["考试整卷预览", /(?:\/mooc-ans)?\/mooc2\/exam\/preview/],
          ["作业", /(?:\/mooc-ans)?\/mooc2\/work\/dowork/]
        ],
        onstart() {
          loadRefTable(CX_SECRET_REF_TABLE_URL).catch(() => void 0);
        },
        async oncomplete() {
          await ensureCxFontDecrypted();
        }
      }),
      jfkGuide: new lib.Script({
        name: "💡 积分课使用提示",
        matches: [["积分课页面", "/plaza"]],
        namespace: "cx.jfk.guide",
        configs: {
          notes: {
            defaultValue: createSteps(["进入课程", "开启复习模式，并关闭自动下一章", "课程完成后手动切换"]).outerHTML + lib.$ui.notes(["⚠️ 如果由脚本进行自动跳转会出现乱跳转的可能，请手动切换课程。"]).outerHTML
          }
        },
        oncomplete(...args) {
          BackgroundProject.scripts.render.methods.pin(this);
        }
      })
    }
  });
  function workOrExam$1(type = "work", {
    answererWrappers,
    period,
    thread,
    redundanceWordsText,
    answerSeparators,
    preview_mode
  }) {
    lib.$message.info(`开始${type === "work" ? "作业" : "考试"}`);
    if (preview_mode) {
      CommonProject.scripts.workResults.methods.init({
        questionPositionSyncHandlerType: "cx"
      });
    }
    const workOrExamQuestionTitleTransform = (titles) => {
      const is_multiple_question = titles.length > 1;
      const images = [];
      const optimizationTitle = titles.map((el, i) => {
        var _a, _b;
        if (el) {
          const titleCloneEl = el.cloneNode(true);
          const childNodes = titleCloneEl.childNodes;
          if (i === 0) {
            (_a = childNodes[0]) == null ? void 0 : _a.remove();
            (_b = childNodes[0]) == null ? void 0 : _b.remove();
          }
          const extracted = extractTextWithImages(titleCloneEl);
          images.push(...extracted.images);
          return extracted.text;
        }
        return "";
      }).join("\n");
      const text2 = removeRedundantWords(
        StringUtils.of(optimizationTitle).nowrap(is_multiple_question ? "\n" : " ").nospace().toString().trim(),
        redundanceWordsText.split("\n")
      );
      return { text: text2, images };
    };
    const workOrExamQuestionTitleText = (titles) => workOrExamQuestionTitleTransform(titles).text;
    const worker = new OCSWorker({
      root: ".questionLi",
      elements: {
        title: (root2) => lib.$$el(
          !preview_mode ? [".splitS-left .mark_name", ".line_wid_half.fl,.line_wid_half.fr"].join(",") : [
            ":scope > h3",
            ":scope > div:not(.stem_answer,.mark_answer)",
            ":scope > p",
            ".line_wid_half.fl,.line_wid_half.fr"
          ].join(","),
          root2
        ).filter((e) => {
          var _a;
          return !!((_a = e.textContent) == null ? void 0 : _a.trim());
        }),
        options: ".answerBg .answer_p, .textDIV, .eidtDiv",
        type: type === "exam" ? 'input[name^="type"]' : 'input[id^="answertype"]',
        lineAnswerInput: ".line_answer input[name^=answer]",
        lineSelectBox: ".line_answer_ct .selectBox ",
        reading: ".reading_answer",
        filling: ".filling_answer"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2, ctx) => {
          if (elements2.title) {
            return workOrExamQuestionTitleTransform(elements2.title);
          }
          return "";
        },
        optionsTransform: (elements2, ctx) => {
          var _a, _b;
          const typeInput = (_a = elements2.type) == null ? void 0 : _a[0];
          const type2 = (typeInput ? getQuestionType(parseInt(typeInput.value)) : void 0) || "unknown";
          ctx.type = type2;
          if (type2 === "completion")
            return "";
          const optResults = ((_b = ctx.elements.options) != null ? _b : []).filter(Boolean).map((o) => extractTextWithImages(o));
          return {
            text: optResults.map((r) => r.text).join("\n"),
            images: optResults.flatMap((r) => r.images)
          };
        },
        answererWrappers,
        period
      }),
      work: async (ctx) => {
        var _a, _b;
        const { elements: elements2, searchInfos } = ctx;
        const type2 = getQuestionType(
          parseInt(((_a = elements2.type.find((t2) => {
            var _a2;
            return (_a2 = t2.getAttribute("name")) == null ? void 0 : _a2.match(/type\d+/);
          })) == null ? void 0 : _a.getAttribute("value")) || "-1")
        );
        if (type2 && (type2 === "completion" || type2 === "multiple" || type2 === "judgement" || type2 === "single")) {
          const resolver = createDefaultQuestionResolver(ctx, (o) => extractTextWithImages(o).text)[type2];
          return await resolver(searchInfos, elements2.options, async (type3, answer, option) => {
            var _a2, _b2, _c;
            if (type3 === "judgement" || type3 === "single" || type3 === "multiple") {
              if ((option == null ? void 0 : option.parentElement) && lib.$$el('[class*="check_answer"]', option.parentElement).length === 0) {
                option.click();
                await $.sleep(500);
              }
            } else if (type3 === "completion" && answer.trim()) {
              const text2 = option == null ? void 0 : option.querySelector("textarea");
              const textareaFrame = option == null ? void 0 : option.querySelector("iframe");
              if (text2) {
                text2.value = answer;
              }
              if (textareaFrame == null ? void 0 : textareaFrame.contentDocument) {
                textareaFrame.contentDocument.body.innerHTML = answer;
              }
              if ((_a2 = option == null ? void 0 : option.parentElement) == null ? void 0 : _a2.parentElement) {
                (_c = lib.$el("[onclick*=saveQuestion]", (_b2 = option == null ? void 0 : option.parentElement) == null ? void 0 : _b2.parentElement)) == null ? void 0 : _c.click();
                await $.sleep(500);
              }
            }
          });
        } else if (type2 && type2 === "line") {
          for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
            let ans = answers;
            if (ans.length === 1) {
              ans = splitAnswer(ans[0]);
            }
            if (ans.filter(Boolean).length !== 0 && elements2.lineAnswerInput && ans.filter(Boolean).length === elements2.lineSelectBox.length) {
              for (let index = 0; index < elements2.lineSelectBox.length; index++) {
                const box = elements2.lineSelectBox[index];
                if (ans[index]) {
                  (_b = lib.$el(`li[data=${ans[index]}] a`, box)) == null ? void 0 : _b.click();
                  await $.sleep(200);
                }
              }
              return { finish: true };
            }
          }
          return { finish: false };
        } else if (type2 && type2 === "fill") {
          return readerAndFillHandle(searchInfos, elements2.filling);
        } else if (type2 && type2 === "reader") {
          return readerAndFillHandle(searchInfos, elements2.reading);
        }
        return { finish: false };
      },
      onQuestionDetected(current) {
        if (preview_mode) {
          return;
        }
        updateDynamicResult(current, workOrExamQuestionTitleText);
      },
      async onResultsInit(_curr, _index, res) {
        if (!preview_mode) {
          return;
        }
        await CommonProject.scripts.workResults.methods.fillAll(
          res.map((r, i) => simplifyWorkResult(r, workOrExamQuestionTitleText, i))
        );
      },
      async onResultsUpdate(current, index, res) {
        if (!preview_mode) {
          updateDynamicResult(current, workOrExamQuestionTitleText);
          return;
        }
        await CommonProject.scripts.workResults.methods.update(
          index,
          simplifyWorkResult(current, workOrExamQuestionTitleText, index)
        );
      }
    });
    if (preview_mode) {
      worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug }).then(() => {
        lib.$message.info({ content: "作业/考试完成，请自行检查后保存或提交。", duration: 0 });
        worker.emit("done");
      }).catch((err) => {
        console.error(err);
        lib.$message.error("答题程序发生错误 : " + err.message);
      });
    } else {
      const getNextBtn = () => document.querySelector('[onclick="getTheNextQuestion(1)"]');
      let next2 = getNextBtn();
      (async () => {
        while (next2 && worker.isClose === false) {
          await ensureCxFontDecrypted();
          await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
          lib.$message.info({ content: "已完成，即将下一题", duration: 0 });
          await $.sleep(3e3);
          next2 = getNextBtn();
          next2 == null ? void 0 : next2.click();
          await $.sleep(1e3);
        }
        lib.$message.success({ content: "作业/考试完成，请自行检查后保存或提交。", duration: 0 });
        worker.emit("done");
        CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "cx";
      })();
    }
    return worker;
  }
  function mobilelearn(opts) {
    var _a;
    lib.$message.info(`开始作业随堂练习`);
    CommonProject.scripts.workResults.methods.init();
    function titleText(el) {
      const clone2 = el.cloneNode(true);
      return extractTextWithImages(clone2).text;
    }
    const redundanceWords = opts.redundanceWordsText.split("\n").filter(Boolean);
    const titleTransform = (titles) => titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map(
      (t2) => t2 ? removeRedundantWords(StringUtils.of(titleText(t2)).nowrap(" ").nospace().toString().trim(), redundanceWords) : ""
    ).join(",");
    const worker = new OCSWorker({
      root: ".question-item",
      elements: {
        title: ".question-name .html-content-box",
        options: ".option-result"
      },
      thread: (_a = opts.thread) != null ? _a : 1,
      answerSeparators: opts.answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2, ctx) => {
          if (elements2.title) {
            return titleTransform(elements2.title);
          }
          return "";
        },
        answererWrappers: opts.answererWrappers,
        period: opts.period
      }),
      work: {
        type(ctx) {
          const cl = ctx.root.classList;
          return cl.contains("single-choice") ? "single" : cl.contains("multiple-choice") ? "multiple" : ctx.elements.options.length === 2 ? "judgement" : "completion";
        },
        async handler(type, answer, option, ctx) {
          var _a2, _b, _c;
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (!(option == null ? void 0 : option.classList.contains("active"))) {
              option.click();
              await $.sleep(500);
            }
          } else if (type === "completion" && answer.trim()) {
            const text2 = option == null ? void 0 : option.querySelector("textarea");
            const textareaFrame = option == null ? void 0 : option.querySelector("iframe");
            if (text2) {
              text2.value = answer;
            }
            if (textareaFrame == null ? void 0 : textareaFrame.contentDocument) {
              textareaFrame.contentDocument.body.innerHTML = answer;
            }
            if ((_a2 = option == null ? void 0 : option.parentElement) == null ? void 0 : _a2.parentElement) {
              (_c = lib.$el("[onclick*=saveQuestion]", (_b = option == null ? void 0 : option.parentElement) == null ? void 0 : _b.parentElement)) == null ? void 0 : _c.click();
              await $.sleep(500);
            }
          }
        }
      },
      async onResultsInit(_curr, _index, res) {
        await CommonProject.scripts.workResults.methods.fillAll(
          res.map((r, i) => simplifyWorkResult(r, titleTransform, i))
        );
      },
      async onResultsUpdate(current, index, res) {
        await CommonProject.scripts.workResults.methods.update(index, simplifyWorkResult(current, titleTransform, index));
      }
    });
    worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug }).then(() => {
      lib.$message.info({ content: "随堂练习完成，请自行检查后保存或提交。", duration: 0 });
      worker.emit("done");
    }).catch((err) => {
      console.error(err);
      lib.$message.error("答题程序发生错误 : " + err.message);
    });
    return worker;
  }
  let cxFontMap;
  let cxFontCrackJob;
  let cxFontCrackFailed = false;
  function crackCxFontOnce(doc) {
    if (!cxFontCrackJob) {
      cxFontCrackJob = (async () => {
        const fontBuffer = extractFontFromStyle(doc, "font-cxsecret");
        if (!fontBuffer) {
          $console.log("未检测到加密文字。");
          return void 0;
        }
        const fonts = CXAnalyses.getSecretFont(doc);
        if (fonts.length === 0) {
          return void 0;
        }
        const t2 = Date.now();
        try {
          const { map, details } = await crackFont(fontBuffer, collectChars(fonts), {
            refTableUrl: CX_SECRET_REF_TABLE_URL,
            onProgress: (done, total) => console.log(`加密文字识别中 ${done}/${total}`)
          });
          const lowMargin = details.filter((d) => d.margin < 0.3);
          if (lowMargin.length > 0) {
            const msg = `有 ${lowMargin.length} 个字符识别置信度较低，可能存在误差`;
            $console.warn(msg);
            console.log(msg, lowMargin);
          }
          $console.info("文字解密完成，耗时 " + ((Date.now() - t2) / 1e3).toFixed(1) + " 秒");
          return map;
        } catch (err) {
          cxFontCrackFailed = true;
          $console.error("加密文字识别失败：", String(err));
          lib.$message.error("加密文字识别失败：" + String(err));
          return void 0;
        }
      })();
    }
    return cxFontCrackJob;
  }
  async function ensureCxFontDecrypted(doc = document) {
    if (cxFontCrackFailed) {
      return;
    }
    const fonts = CXAnalyses.getSecretFont(doc);
    if (fonts.length === 0) {
      return;
    }
    if (!cxFontMap) {
      cxFontMap = await crackCxFontOnce(doc);
      if (!cxFontMap) {
        cxFontCrackJob = void 0;
        return;
      }
    }
    decryptElements(fonts, cxFontMap);
    fonts.forEach((el) => el.classList.remove("font-cxsecret"));
  }
  const CXAnalyses = {
    isInSpecialMode() {
      return Array.from((top$1 == null ? void 0 : top$1.document.querySelectorAll(".catalog_points_sa,.catalog_points_er")) || []).length !== 0;
    },
    async isStuckInBreakingMode() {
      if (this.isInSpecialMode()) {
        const chapter = top$1 == null ? void 0 : top$1.document.querySelector(".posCatalog_active");
        if (chapter) {
          const id = chapter.getAttribute("id");
          if (id) {
            const counter = await lib.$store.getTab("chapter_counter") || /* @__PURE__ */ Object.create({});
            let count2 = Reflect.get(counter, id);
            count2 = count2 ? count2 + 1 : 1;
            Reflect.set(counter, id, count2);
            let res = false;
            if (count2 >= 3) {
              Reflect.set(counter, id, 1);
              res = true;
            }
            await lib.$store.setTab("chapter_counter", counter);
            return res;
          }
        }
      }
      return false;
    },
    isInFinalTab() {
      const tabs = Array.from((top$1 == null ? void 0 : top$1.document.querySelectorAll(".prev_ul li")) || []);
      if (tabs.length === 0) {
        return true;
      }
      return tabs[tabs.length - 1].classList.contains("active");
    },
    isInFinalChapter() {
      var _a;
      return (_a = Array.from((top$1 == null ? void 0 : top$1.document.querySelectorAll(".posCatalog_select")) || []).pop()) == null ? void 0 : _a.classList.contains("posCatalog_active");
    },
    isFinishedAllChapters() {
      return this.getChapterInfos().every((chapter) => chapter.unFinishCount === 0);
    },
    getChapterInfos() {
      return Array.from((top$1 == null ? void 0 : top$1.document.querySelectorAll('[onclick^="getTeacherAjax"]')) || []).map((el) => {
        var _a, _b, _c;
        return {
          element: el,
          chapterId: (_b = (_a = el.getAttribute("onclick")) == null ? void 0 : _a.match(/\('(.*)','(.*)','(.*)'\)/)) == null ? void 0 : _b[3],
          unFinishCount: parseInt(((_c = el.parentElement.querySelector(".jobUnfinishCount")) == null ? void 0 : _c.value) || "0")
        };
      });
    },
    scrollToActiveChapter() {
      const activeChapter = top$1 == null ? void 0 : top$1.document.querySelector(".posCatalog_active");
      if (activeChapter) {
        activeChapter.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    waitForChapterInfos(timeout = 10) {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const res = this.getChapterInfos();
          if (res.length > 0) {
            clearInterval(interval);
            clearInterval(to);
            resolve(res);
          }
        }, 1e3);
        const to = setTimeout(() => {
          clearInterval(interval);
          resolve([]);
        }, timeout * 1e3);
      });
    },
    getSecretFont(doc = document) {
      return Array.from(doc.querySelectorAll(".font-cxsecret")).map((font) => {
        const after = font.querySelector(".after");
        return after === null ? font : after;
      });
    },
    isCurrentChapterFinished() {
      const job = top$1 == null ? void 0 : top$1.document.querySelector(".posCatalog_active");
      if (job) {
        if (job.querySelector(".icon_Completed") !== null) {
          return true;
        }
      }
      return false;
    }
  };
  function rateHack() {
    state$4.study.hacked = false;
    let dragCount = 0;
    try {
      hack();
      window.document.addEventListener("readystatechange", hack);
      window.addEventListener("load", hack);
    } catch (e) {
      console.error(e);
    }
    function hack() {
      const videojs = lib.$gm.unsafeWindow.videojs;
      const Ext = lib.$gm.unsafeWindow.Ext;
      if (typeof videojs !== "undefined" && typeof Ext !== "undefined") {
        if (state$4.study.hacked) {
          return;
        }
        state$4.study.hacked = true;
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
                  (_a = lib.$el("video")) == null ? void 0 : _a.pause();
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
  async function study(opts) {
    var _a, _b;
    await $.sleep(3e3);
    const searchedJobs = [];
    let searching = true;
    let attachmentCount = ((_a = lib.$gm.unsafeWindow.attachments) == null ? void 0 : _a.length) || 0;
    const wait_timeout = 3 + attachmentCount * 2;
    setTimeout(() => {
      searching = false;
    }, Math.min(wait_timeout, 10) * 1e3);
    const runJobs = async () => {
      const job = searchJob(opts, searchedJobs);
      if (job && job.func) {
        try {
          await job.func();
        } catch (e) {
          $console.error("未知错误", e);
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
    top$1._preChapterId = "";
    if (CXProject.scripts.study.cfg.mode === "manually") {
      const msg2 = "页面任务点已完成，自动跳转已关闭，请手动跳转。";
      lib.$message.warn({ content: msg2, duration: 0 });
      $console.warn(msg2);
      return;
    }
    if (/\/[^/]*nodedetailcontroller\/visitnodedetail/.test(location.href)) {
      const curKid = new URLSearchParams(location.search).get("knowledgeId");
      const nodes = Array.from(document.querySelectorAll("#chapterListUl .cursorC, #chapterListUl [onclick*=linkUrl]"));
      let idx = -1;
      for (let i = 0; i < nodes.length; i++) {
        const oc = nodes[i].getAttribute("onclick") || "";
        const mm = oc.match(/knowledgeId=(\d+)/);
        if (mm && curKid && mm[1] === curKid) { idx = i; break; }
      }
      const nextNode = idx >= 0 ? nodes[idx + 1] : nodes[0];
      if (nextNode) {
        $console.info("即将前往下一节：" + (nextNode.innerText || "").trim());
        lib.$message.info({ content: "当前节点已完成，即将前往下一节", duration: 10 });
        await $.sleep(2e3);
        nextNode.click();
      } else {
        const content2 = "本课程所有节点已完成！";
        lib.$modal.alert({ content: content2 });
        CommonProject.scripts.settings.methods.notificationBySetting(content2, { duration: 0, extraTitle: "超星学习通学习脚本" });
      }
      return;
    }
    if (CXAnalyses.isInFinalTab() && await CXAnalyses.isStuckInBreakingMode()) {
      return lib.$modal.alert({
        content: "检测到当前课程为闯关模式（有小旗帜图标）, 但是已经重复进入多次，应该是章节测试没有完成，或者其他情况导致，请手动完成章节测试，然后手动点击下一章。"
      });
    }
    if (CXAnalyses.isInFinalChapter() && CXAnalyses.isInFinalTab()) {
      let content = "";
      if (opts.backToFirstWhenFinish) {
        content = "已经抵达最后一个章节，10秒后返回第一个章节重新开始。";
        setTimeout(() => {
          var _a2;
          (_a2 = top$1 == null ? void 0 : top$1.document.querySelector(".posCatalog_name")) == null ? void 0 : _a2.click();
        }, 10 * 1e3);
      } else {
        if (CXAnalyses.isFinishedAllChapters()) {
          content = "全部任务点已完成！";
        } else {
          content = "已经抵达最后一个章节！但仍然有任务点未完成，请手动切换至未完成的章节。";
          lib.$modal.alert({ content });
        }
      }
      $msgwc.info({ content, duration: 30 });
      CommonProject.scripts.settings.methods.notificationBySetting(content, {
        duration: 0,
        extraTitle: "超星学习通学习脚本"
      });
      return;
    }
    const msg = `页面任务点已完成，即将跳转。(${CXProject.scripts.study.cfg.mode})`;
    lib.$message.success({ content: msg });
    $console.info(msg);
    await $.sleep(3e3);
    if (CXProject.scripts.study.cfg.mode === "job" && CXAnalyses.isInFinalTab()) {
      const chapters = CXAnalyses.getChapterInfos();
      const currentIndex = chapters.findIndex(
        (info) => {
          var _a2;
          return (_a2 = info.element.parentElement) == null ? void 0 : _a2.classList.contains("posCatalog_active");
        }
      );
      const next_chapter = chapters.find((info, index) => {
        return index > currentIndex && info.unFinishCount > 0;
      });
      if (!next_chapter) {
        const content = "全部任务点已完成！";
        lib.$modal.alert({ content });
        CommonProject.scripts.settings.methods.notificationBySetting(content, {
          duration: 0,
          extraTitle: "超星学习通学习脚本"
        });
        return;
      }
      (_b = next_chapter == null ? void 0 : next_chapter.element) == null ? void 0 : _b.click();
      setTimeout(() => {
        CXAnalyses.scrollToActiveChapter();
      }, 1e3);
      return;
    }
    const curCourseId = lib.$el("#curCourseId", top$1 == null ? void 0 : top$1.document);
    const curChapterId = lib.$el("#curChapterId", top$1 == null ? void 0 : top$1.document);
    const curClazzId = lib.$el("#curClazzId", top$1 == null ? void 0 : top$1.document);
    const count2 = lib.$$el("#prev_tab .prev_ul li", top$1 == null ? void 0 : top$1.document);
    if (curChapterId && curCourseId && curClazzId) {
      top$1._preChapterId = curChapterId.value;
      CXAnalyses.scrollToActiveChapter();
      await $.sleep(200);
      top$1 == null ? void 0 : top$1.PCount.next(count2.length.toString(), curChapterId.value, curCourseId.value, curClazzId.value, "");
    } else {
      $console.warn("参数错误，无法跳转下一章，请尝试手动切换。");
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
      }
    }
    return result;
  }
  function searchJob(opts, searchedJobs) {
    const knowCardWin = lib.$gm.unsafeWindow;
    const searchJobElement = (root2) => {
      return domSearch(
        {
          videojs: "#video,#audio",
          chapterTest: ".TiMu",
          read: "#img.imglook",
          pptWithAudio: ".swiper-container",
          hyperlink: "#hyperlink",
          timereader: 'iframe[name="bookifame"][src*="timing"]'
        },
        root2.contentWindow.document
      );
    };
    const search = (root2) => {
      var _a, _b, _c, _d;
      const win = root2.contentWindow;
      const { videojs, read, chapterTest, hyperlink, pptWithAudio, timereader } = searchJobElement(root2);
      if (win && (videojs || read || chapterTest || hyperlink || pptWithAudio || timereader)) {
        const frame_data_str = ((_a = win.frameElement) == null ? void 0 : _a.getAttribute("data")) || ((_d = (_c = (_b = win.frameElement) == null ? void 0 : _b.contentWindow) == null ? void 0 : _c.parent.frameElement) == null ? void 0 : _d.getAttribute("data")) || "{}";
        const frame_data = JSON.parse(frame_data_str);
        const target_jobid = frame_data.jobid || frame_data._jobid;
        const target_objectid = frame_data.objectid;
        if (!target_jobid && !target_objectid) {
          return;
        }
        const attachment = knowCardWin.attachments.find((attachment2) => {
          const attachment_jobid = attachment2.jobid || attachment2.property._jobid;
          const attachment_objectid = attachment2.property.objectid;
          if (target_jobid && attachment_jobid && String(attachment_jobid) === String(target_jobid)) {
            return true;
          }
          if (target_objectid && attachment_objectid && String(attachment_objectid) === String(target_objectid)) {
            if (!attachment2.property.mid && frame_data.mid) attachment2.property.mid = frame_data.mid;
            if (!attachment2.property.name && frame_data.name) attachment2.property.name = frame_data.name;
            if (frame_data.jobid || frame_data._jobid) {
              attachment2.job = true;
              attachment2.property._jobid = frame_data._jobid || frame_data.jobid;
            }
            return true;
          }
          return false;
        });
        if (attachment && searchedJobs.find((job2) => job2.mid === attachment.property.mid) === void 0) {
          const { name, title, bookname, author } = attachment.property;
          const jobName = name || title || (bookname ? bookname + author : void 0) || "未知任务";
          const work_type = attachment.job ? "job" : attachment.isPassed ? "finished" : "not-job";
          let func;
          if (videojs) {
            if (!CXProject.scripts.study.cfg.enableMedia) {
              const msg = `音视频自动学习功能已被关闭（在上方菜单栏，超星学习通-课程学习中开启）。${jobName} 即将跳过`;
              lib.$message.warn({ content: msg, duration: 10 });
              $console.warn(msg);
            } else {
              if (work_type === "job" || work_type === "finished" && opts.restudy || work_type === "not-job" && opts.forceLearn) {
                func = () => {
                  const msg = `即将${work_type === "finished" && opts.restudy ? "重新" : work_type === "not-job" && opts.forceLearn ? "强制" : ""}播放 : ` + jobName;
                  lib.$message.info({ content: msg });
                  $console.log(msg);
                  return JobRunner.media(opts, win.document);
                };
              }
            }
          } else if (chapterTest) {
            if (!CXProject.scripts.study.cfg.enableChapterTest) {
              const msg = `章节测试自动答题功能已被关闭（在上方菜单栏，超星学习通-课程学习中开启）。${jobName} 即将跳过`;
              lib.$message.warn({ content: msg, duration: 10 });
              $console.warn(msg);
            } else {
              const status = win.document.querySelector(".testTit_status");
              if (status == null ? void 0 : status.classList.contains("testTit_status_complete")) {
                const msg = `章节测试已完成 : ` + jobName;
                lib.$message.success({ content: msg });
                $console.log(msg);
              } else {
                if (work_type === "job" || work_type === "not-job" && CommonProject.scripts.settings.cfg["work-when-no-job"]) {
                  const workOptions = CommonProject.scripts.settings.methods.getWorkOptions();
                  if (workOptions.answererWrappers === void 0 || workOptions.answererWrappers.length === 0) {
                    answerWrapperEmptyWarning(0);
                  } else {
                    func = () => {
                      $console.log(`开始答题 : ` + jobName);
                      return JobRunner.chapter(root2, workOptions);
                    };
                  }
                }
                if (work_type === "not-job" && CommonProject.scripts.settings.cfg["work-when-no-job"] === false) {
                  const msg = `当前作业 ${jobName} 不是任务点，但待完成，如需开启自动答题请前往：通用-全局设置，开启强制答题。`;
                  lib.$message.warn({ content: msg });
                  $console.warn(msg);
                }
              }
            }
          } else if (read || pptWithAudio || timereader) {
            if (!CXProject.scripts.study.cfg.enablePPT) {
              const msg = `PPT/书籍阅读功能已被关闭（在上方菜单栏，超星学习通-课程学习中开启）。${jobName} 即将跳过`;
              lib.$message.warn({ content: msg, duration: 10 });
              $console.warn(msg);
            } else {
              if (attachment.job) {
                func = () => {
                  const msg = `正在学习 : ` + jobName;
                  lib.$message.info({ content: msg });
                  $console.log(msg);
                  if (read) {
                    return JobRunner.read(win);
                  } else if (timereader) {
                    return JobRunner.timereader(timereader);
                  } else {
                    return JobRunner.readPPTWithAudio(win);
                  }
                };
              }
            }
          } else if (hyperlink) {
            if (!CXProject.scripts.study.cfg.enableHyperlink) {
              const msg = `链接任务点已被关闭（在上方菜单栏，超星学习通-课程学习中开启）。${jobName} 即将跳过`;
              lib.$message.warn({ content: msg, duration: 10 });
              $console.warn(msg);
            } else {
              if (attachment.job) {
                func = () => {
                  const msg = `正在完成链接阅读任务 : ` + jobName;
                  lib.$message.info({ content: msg });
                  $console.log(msg);
                  return JobRunner.hyperlink(hyperlink);
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
  function fixedVideoProgress() {
    if (state$4.study.videojs) {
      const { bar } = domSearch({ bar: ".vjs-control-bar" }, state$4.study.videojs);
      if (bar) {
        bar.style.opacity = "1";
      }
    }
  }
  const JobRunner = {
    async media(setting, doc) {
      const { playbackRate: playbackRate2 = 1, volume: volume2 = 0 } = setting;
      const media = await waitForMedia({ root: doc });
      const { videojs } = domSearch({ videojs: "#video,#audio" }, doc);
      if (!videojs || !media) {
        $console.error("视频检测不到，请尝试刷新或者手动切换下一章。");
        return;
      }
      state$4.study.videojs = videojs;
      top$1.currentMedia = media;
      fixedVideoProgress();
      if (setting.videoQuizStrategy === "random") {
        const loop = async () => {
          var _a;
          const submitBtn = () => doc.querySelector("#videoquiz-submit");
          if (submitBtn()) {
            const list = Array.from(doc.querySelectorAll(".ans-videoquiz-opt label"));
            const answer = list[Math.floor(Math.random() * list.length)];
            answer == null ? void 0 : answer.click();
            (_a = submitBtn()) == null ? void 0 : _a.click();
            await $.sleep(3e3);
            const container2 = doc.querySelector("#video .ans-videoquiz");
            const components = Array.from(doc.querySelectorAll(".x-component-default"));
            if (container2) {
              container2.remove();
            }
            if (components.length) {
              for (const com of components) {
                com.style.display = "none";
              }
            }
          }
          await $.sleep(3e3);
          await loop();
        };
        loop();
      }
      return new Promise((resolve, reject) => {
        const reloadInterval = setInterval(() => {
          const errorDiv = doc.querySelector(".vjs-modal-dialog-content");
          if (["视频文件损坏", "网络错误导致视频下载中途失败", "视频因格式不支持", "网络的问题无法加载"].some(
            (s) => errorDiv == null ? void 0 : errorDiv.innerText.includes(s)
          )) {
            $console.error("检测到视频加载失败，即将跳过视频。");
            lib.$message.error("检测到视频加载失败，即将跳过视频。");
            setTimeout(resolve, 3e3);
          }
        }, 3e3);
        const playFunction = async () => {
          if (hasFaceRecognition())
            await waitForFaceRecognition();
          if (hasNewFaceRecognition())
            await waitForNewFaceRecognition();
          if (media.ended === false) {
            await $.sleep(1e3);
            media.play();
            media.playbackRate = playbackRate2;
          }
        };
        media.addEventListener("pause", playFunction);
        media.addEventListener("ended", () => {
          media.removeEventListener("pause", playFunction);
          $console.log("视频播放完毕");
          clearInterval(reloadInterval);
          resolve();
        });
        $console.log("视频开始播放");
        media.volume = volume2;
        media.currentTime = 0;
        setTimeout(() => {
          playMedia(() => media.play()).then(() => {
            media.playbackRate = playbackRate2;
          }).catch(reject);
        }, 200);
      });
    },
    async read(win) {
      const finishJob = win.finishJob;
      if (finishJob)
        finishJob();
      await $.sleep(3e3);
    },
    async timereader(iframe) {
      var _a, _b;
      const src2 = ((_a = iframe.getAttribute("src")) == null ? void 0 : _a.toString()) || "";
      const timing = src2 ? parseInt(((_b = new URL(src2).searchParams.get("timing")) == null ? void 0 : _b.toString()) || "60") : 60;
      lib.$message.info({
        content: `正在学习长时阅读任务，请稍等，不要切换..（预计${(timing + 3) * 3}秒）`,
        duration: (timing + 3) * 3
      });
      await $.sleep((timing + 3) * 3 * 1e3);
      lib.$message.success("长时阅读任务完成！");
      await $.sleep(5e3);
    },
    async chapter(frame, {
      answererWrappers,
      period,
      upload,
      thread,
      stopSecondWhenFinish,
      redundanceWordsText,
      answerSeparators
    }) {
      if (answererWrappers === void 0 || answererWrappers.length === 0) {
        return answerWrapperEmptyWarning(0);
      }
      const visual_state = BackgroundProject.scripts.render.cfg.visual;
      const frameWindow = frame.contentWindow;
      await ensureCxFontDecrypted(frameWindow.document);
      CommonEvents.emitWorkerStateChange("start");
      const { TiMu } = domSearchAll({ TiMu: ".TiMu" }, frameWindow.document);
      CORSUtils.panelNormal();
      CommonProject.scripts.workResults.methods.init();
      CORSUtils.pinWorkPanel();
      const chapterTestTaskQuestionTitleTransform = (titles) => {
        const images = [];
        const removed = removeRedundantWords(
          titles.map((t2) => {
            if (!t2)
              return "";
            const extracted = extractTextWithImages(t2);
            images.push(...extracted.images);
            return extracted.text;
          }).join(","),
          redundanceWordsText.split("\n")
        );
        const text2 = removed.trim().replace(/^\d+[。、.]/, "").replace(/（\d+\.\d+分）/, "").replace(/\(..题, \d+?分\)/, "").replace(/\(..题, \d+\.\d+分\)/, "").replace(/[[(【（](..题|名词解释|完形填空|阅读理解)[\])】）]/, "").trim();
        return { text: text2, images };
      };
      const chapterTestTaskQuestionTitleText = (titles) => chapterTestTaskQuestionTitleTransform(titles).text;
      const worker = new OCSWorker({
        root: TiMu,
        elements: {
          title: [
            (root2) => lib.$el(".Zy_TItle .clearfix", root2),
            (root2) => lib.$el(".firstUlList", root2),
            (root2) => lib.$el(".secondUlList", root2)
          ],
          options: "ul li .after,ul li textarea,ul textarea,ul li label:not(.before)",
          type: 'input[id^="answertype"]',
          lineSelectBox: ".thirdUlList .dept_select"
        },
        thread: thread != null ? thread : 1,
        answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
        answerer: createCommonAnswerer({
          titleTransform: (elements2, ctx) => chapterTestTaskQuestionTitleTransform(elements2.title),
          optionsTransform: (elements2, ctx) => {
            var _a, _b;
            const typeInput = (_a = elements2.type) == null ? void 0 : _a[0];
            const type = (typeInput ? getQuestionType(parseInt(typeInput.value)) : void 0) || "unknown";
            ctx.type = type;
            if (type === "completion")
              return "";
            const optResults = ((_b = ctx.elements.options) != null ? _b : []).filter(Boolean).map((o) => extractTextWithImages(o));
            return { text: optResults.map((r) => r.text).join("\n"), images: optResults.flatMap((r) => r.images) };
          },
          answererWrappers,
          period
        }),
        work: async (ctx) => {
          var _a;
          const { elements: elements2, searchInfos } = ctx;
          const typeInput = elements2.type[0];
          const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : void 0;
          if (type && (type === "completion" || type === "multiple" || type === "judgement" || type === "single")) {
            const resolver = createDefaultQuestionResolver(ctx, (o) => extractTextWithImages(o).text)[type];
            const handler = (type2, answer, option, ctx2) => {
              var _a2, _b, _c, _d, _e, _f, _g;
              if (type2 === "judgement" || type2 === "single" || type2 === "multiple") {
                const checked = ((_b = (_a2 = option == null ? void 0 : option.parentElement) == null ? void 0 : _a2.querySelector("label input")) == null ? void 0 : _b.getAttribute("checked")) === "checked" || ((_c = option == null ? void 0 : option.parentElement) == null ? void 0 : _c.getAttribute("aria-checked")) === "true";
                if (checked)
                  ;
                else {
                  option == null ? void 0 : option.click();
                }
              } else if (type2 === "completion" && answer.trim()) {
                const text2 = (_d = option == null ? void 0 : option.parentElement) == null ? void 0 : _d.querySelector("textarea");
                const textareaFrame = (_e = option == null ? void 0 : option.parentElement) == null ? void 0 : _e.querySelector("iframe");
                if (text2) {
                  text2.value = answer;
                }
                if (textareaFrame == null ? void 0 : textareaFrame.contentDocument) {
                  textareaFrame.contentDocument.body.innerHTML = answer;
                }
                if ((_f = option == null ? void 0 : option.parentElement) == null ? void 0 : _f.parentElement) {
                  (_g = lib.$el("[onclick*=saveQuestion]", option.parentElement.parentElement)) == null ? void 0 : _g.click();
                }
              }
            };
            return await resolver(searchInfos, elements2.options, handler);
          } else if (type && type === "line") {
            const select = (el, opt_val) => {
              const selected = el.querySelector(`option[selected]`);
              const opt = el.querySelector(`option[value="${opt_val}"]`);
              selected == null ? void 0 : selected.removeAttribute("selected");
              if (opt) {
                opt.setAttribute("selected", "");
              }
            };
            for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
              for (const ans of answers) {
                const splited_ans = splitAnswer(ans);
                if (splited_ans.length !== 0 && elements2.lineSelectBox.length === splited_ans.length) {
                  for (let index = 0; index < elements2.lineSelectBox.length; index++) {
                    const box = elements2.lineSelectBox[index];
                    if (splited_ans[index]) {
                      select(box, splited_ans[index]);
                      const text2 = (_a = box.parentElement) == null ? void 0 : _a.querySelector(".chosen-single span");
                      if (text2)
                        text2.textContent = splited_ans[index];
                      await $.sleep(200);
                    }
                  }
                  return { finish: true };
                }
              }
            }
            return { finish: false };
          }
          return { finish: false };
        },
        async onResultsInit(_curr, _index, res) {
          await CommonProject.scripts.workResults.methods.fillAll(
            res.map((r, i) => simplifyWorkResult(r, chapterTestTaskQuestionTitleText, i))
          );
        },
        async onResultsUpdate(curr, index, res) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i;
          await CommonProject.scripts.workResults.methods.update(
            index,
            simplifyWorkResult(curr, chapterTestTaskQuestionTitleText, index)
          );
          if (((_a = curr.result) == null ? void 0 : _a.finish) === false && curr.resolved === true) {
            const options = ((_c = (_b = curr.ctx) == null ? void 0 : _b.elements) == null ? void 0 : _c.options) || [];
            const typeInput = (_e = (_d = curr.ctx) == null ? void 0 : _d.elements) == null ? void 0 : _e.type[0];
            const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : void 0;
            const commonSetting = CommonProject.scripts.settings.cfg;
            if (commonSetting["randomWork-choice"] && (type === "judgement" || type === "single" || type === "multiple")) {
              $console.log("正在随机作答");
              const option = options[Math.floor(Math.random() * options.length)];
              (_g = (_f = option == null ? void 0 : option.parentElement) == null ? void 0 : _f.querySelector("a,label")) == null ? void 0 : _g.click();
            } else if (commonSetting["randomWork-complete"] && type === "completion") {
              $console.log("正在随机作答");
              for (const option of options) {
                const textarea = (_h = option == null ? void 0 : option.parentElement) == null ? void 0 : _h.querySelector("textarea");
                const completeTexts = commonSetting["randomWork-completeTexts-textarea"].split("\n").filter(Boolean);
                const text2 = completeTexts[Math.floor(Math.random() * completeTexts.length)];
                const textareaFrame = (_i = option == null ? void 0 : option.parentElement) == null ? void 0 : _i.querySelector("iframe");
                if (text2) {
                  if (textarea) {
                    textarea.value = text2;
                  }
                  if (textareaFrame == null ? void 0 : textareaFrame.contentDocument) {
                    textareaFrame.contentDocument.body.innerHTML = text2;
                  }
                } else {
                  $console.error("请设置随机填空的文案");
                }
                await $.sleep(500);
              }
            }
          }
        },
        async onElementSearched(elements2) {
          const typeInput = elements2.type[0];
          const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : void 0;
          if (type === "judgement") {
            elements2.options.forEach((option) => {
              var _a;
              const opt = ((_a = option == null ? void 0 : option.textContent) == null ? void 0 : _a.trim()) || "";
              if (opt.includes("对") || opt.includes("错"))
                ;
              else if (opt === "True") {
                option.textContent = "√";
              } else if (opt === "False") {
                option.textContent = "x";
              } else if (opt === "對") {
                option.textContent = "√";
              } else if (opt === "錯") {
                option.textContent = "x";
              } else {
                const ri = option.querySelector(".ri");
                const span = document.createElement("span");
                span.innerText = ri ? "√" : "×";
                option.appendChild(span);
              }
            });
          }
        }
      });
      const results = await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
      CommonEvents.emitWorkerStateChange("done");
      const msg = `答题完成，将等待 ${stopSecondWhenFinish} 秒后进行保存或提交。`;
      $console.info(msg);
      lib.$message.info({ content: msg, duration: stopSecondWhenFinish });
      await $.sleep(stopSecondWhenFinish * 1e3);
      await worker.uploadHandler({
        type: upload,
        results,
        async callback(finishedRate, uploadable) {
          const msg2 = `完成率 ${finishedRate.toFixed(2)}% :  ${uploadable ? "3秒后将自动提交" : "3秒后将自动保存"} `;
          $console.info(msg2);
          lib.$message.success({ content: msg2, duration: 3 });
          await $.sleep(3e3);
          if (uploadable) {
            frameWindow.btnBlueSubmit();
            await $.sleep(3e3);
            frameWindow.submitCheckTimes();
            top$1.$("#workpop").hide();
          } else {
            frameWindow.alert = () => {
            };
            frameWindow.noSubmit();
          }
        }
      });
      if (visual_state === "minimize" && BackgroundProject.scripts.render.cfg.visual !== "minimize") {
        CORSUtils.panelMinimize();
      }
      worker.emit("done");
    },
    async readPPTWithAudio(win) {
      var _a;
      win.document.querySelectorAll("audio").forEach((audio) => {
        audio.addEventListener("play", () => {
          audio.muted = true;
        });
      });
      const len = win.document.querySelectorAll(".swiper-container .swiper-slide").length;
      for (let index = 0; index < len; index++) {
        (_a = win.swiperNext) == null ? void 0 : _a.call(win);
        await $.sleep(1e3);
      }
      await $.sleep(3e3);
    },
    async hyperlink(a) {
      const _click = a.onclick;
      a.onclick = () => false;
      a.click();
      a.onclick = _click;
      await $.sleep(3e3);
    }
  };
  function getQuestionType(val) {
    return val === 0 ? "single" : val === 1 ? "multiple" : val === 3 ? "judgement" : [2, 4, 5, 6, 7, 8, 9, 10].some((t2) => t2 === val) ? "completion" : val === 11 ? "line" : val === 14 ? "fill" : val === 15 ? "reader" : void 0;
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
            (_a = lib.$el(`span.saveSingleSelect[data="${ans[index]}"]`, item)) == null ? void 0 : _a.click();
            await $.sleep(200);
          }
        }
        return { finish: true };
      }
    }
    return { finish: false };
  }
  function hasFaceRecognition() {
    const faces = lib.$$el("#fcqrimg", top$1 == null ? void 0 : top$1.document);
    let active = false;
    for (const face of faces) {
      const src2 = face.getAttribute("src");
      if (src2) {
        active = true;
        break;
      }
    }
    return active;
  }
  function hasNewFaceRecognition() {
    const faces = lib.$$el(".chapterVideoFaceMaskDiv", top$1 == null ? void 0 : top$1.document);
    let active = false;
    for (const face of faces) {
      if (face.style.display !== "none") {
        active = true;
        break;
      }
    }
    return active;
  }
  function waitForNewFaceRecognition() {
    let notified = false;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const active = hasNewFaceRecognition();
        if (active) {
          if (!notified) {
            notified = true;
            const msg = "检测到人脸识别，请手动进行识别后脚本才会继续运行。";
            if (CXProject.scripts.study.cfg.notifyWhenHasFaceRecognition) {
              CommonProject.scripts.settings.methods.notificationBySetting(msg, { duration: 0 });
            }
            lib.$message.warn({ content: msg, duration: 0 });
            $console.warn(msg);
          }
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 3e3);
    });
  }
  function waitForFaceRecognition() {
    let notified = false;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const active = hasFaceRecognition();
        if (active) {
          if (!notified) {
            notified = true;
            const msg = "检测到人脸识别，请手动进行识别后脚本才会继续运行。";
            if (CXProject.scripts.study.cfg.notifyWhenHasFaceRecognition) {
              CommonProject.scripts.settings.methods.notificationBySetting(msg, { duration: 0 });
            }
            lib.$message.warn({ content: msg, duration: 0 });
            $console.warn(msg);
          }
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 3e3);
    });
  }
  const CORSUtils = {
    pinWorkPanel: lib.cors.defineTopFunction(() => {
      BackgroundProject.scripts.render.methods.pin(CommonProject.scripts.workResults);
    }),
    panelNormal: lib.cors.defineTopFunction(() => {
      BackgroundProject.scripts.render.methods.normal();
    }),
    panelMinimize: lib.cors.defineTopFunction(() => {
      BackgroundProject.scripts.render.methods.minimize();
    })
  };
  const state$3 = {
    study: {
      currentMedia: void 0,
      currentStudyLockId: 0,
      playbackRateWarningListenerId: 0,
      courseLengthListenerId: 0
    }
  };
  const $msg_and_log$1 = (type, msg) => {
    lib.$message[type](msg);
    $console[type](msg);
  };
  const _StudyLock = class {
    constructor() {
      _StudyLock.auto_inc++;
      this.id = _StudyLock.auto_inc;
      state$3.study.currentStudyLockId = this.id;
    }
    canStudy() {
      return this.id === state$3.study.currentStudyLockId;
    }
    static getLock() {
      return new _StudyLock();
    }
  };
  let StudyLock = _StudyLock;
  StudyLock.auto_inc = 0;
  const IcveMoocProject = lib.Project.create({
    name: "智慧职教",
    domains: [
      "icve.com.cn",
      "ai.icve.com.cn",
      "course.icve.com.cn",
      "courshare.cn",
      "webtrn.cn"
    ],
    scripts: {
      guide: new lib.Script({
        name: "💡 使用提示",
        matches: [
          ["个人首页", "icve.com.cn/studycenter"],
          ["学习页面", "icve.com.cn/study/directory"],
          ["MOOC学院-个人首页", "user.icve.com.cn"],
          ["MOOC学院-首页", "mooc.icve.com.cn"],
          ["AI课程首页", "ai.icve.com.cn/app/my-excellent-home"]
        ],
        namespace: "icve.guide",
        configs: {
          notes: {
            defaultValue: createSteps(["点击任意课程进入", "点击任意章节进入学习", "等待脚本自动运行"]).outerHTML
          }
        },
        oncomplete() {
          BackgroundProject.scripts.render.methods.pin(this);
        }
      }),
      studyCenter: new lib.Script({
        name: "🖥️ 智慧职教-学习中心",
        namespace: "icve.study.center",
        matches: [
          ["学习中心页面", "/study/directory/dir_course.html"],
          ["课程列表", "icve.com.cn/study/directory/directory_list.html"]
        ],
        configs: {
          playbackRate: playbackRate$2,
          volume,
          currentCourseUrlList: {
            defaultValue: []
          }
        },
        async oncomplete() {
          if (location.href.includes("icve.com.cn/study/directory/directory_list.html")) {
            await waitForElement(".h_cells a");
            this.cfg.currentCourseUrlList = Array.from(document.querySelectorAll(".h_cells a")).map(
              (a) => a.href
            );
            return;
          }
          if (this.cfg.currentCourseUrlList.length === 0) {
            try {
              const url = "https://www.icve.com.cn/study/directory/directory_list.html?courseId=" + new URL(location.href).searchParams.get("courseId");
              const res = await fetch(url).then((res2) => res2.text());
              const doc = new DOMParser().parseFromString(res, "text/html");
              this.cfg.currentCourseUrlList = Array.from(doc.querySelectorAll(".h_cells a")).map(
                (a) => a.href
              );
            } catch (e) {
              console.error(e);
              lib.$message.error("课程列表获取失败，请刷新页面重试。");
              return;
            }
          }
          BackgroundProject.scripts.render.methods.pin(this);
          this.onConfigChange("playbackRate", (playbackRate2) => {
            state$3.study.currentMedia && (state$3.study.currentMedia.playbackRate = parseFloat(playbackRate2.toString()));
          });
          this.onConfigChange("volume", (v) => state$3.study.currentMedia && (state$3.study.currentMedia.volume = v));
          const study2 = async () => {
            var _a;
            const res = await Promise.race([waitForElement("video, audio"), waitForElement(".docBox")]);
            if (res) {
              const jobName = ((_a = document.querySelector(".tabsel.seled")) == null ? void 0 : _a.getAttribute("title")) || "-";
              lib.$message.info("开始任务：" + jobName);
              $console.log(`任务 ${jobName} 开始。`);
              if (document.querySelector("video, audio")) {
                const media = await waitForMedia();
                state$3.study.currentMedia = media;
                media.volume = this.cfg.volume;
                await new Promise((resolve, reject) => {
                  try {
                    console.log(document.hasFocus());
                    window.focus();
                    lib.$gm.unsafeWindow.jwplayer().onComplete(async () => {
                      $console.log("视频/音频播放完成。");
                      await $.sleep(3e3);
                      resolve();
                    });
                    const play = () => {
                      lib.$gm.unsafeWindow.jwplayer().play();
                      lib.$gm.unsafeWindow.jwplayer().play();
                      media.playbackRate = parseFloat(this.cfg.playbackRate.toString());
                    };
                    media.addEventListener("pause", async () => {
                      if (!media.ended) {
                        await $.sleep(1e3);
                        playMedia(play);
                      }
                    });
                    playMedia(play);
                  } catch (err) {
                    reject(err);
                  }
                });
              }
              lib.$message.success(`任务 ${jobName} 完成，三秒后下一章`);
              $console.log(`任务 ${jobName} 完成，三秒后下一章`);
            } else {
              $console.error(`不支持的任务页面，请跟作者进行反馈。三秒后下一章`);
            }
            await $.sleep(3e3);
            next2();
          };
          const next2 = () => {
            for (let index = 0; index < this.cfg.currentCourseUrlList.length; index++) {
              const url = this.cfg.currentCourseUrlList[index];
              const nextUrl = this.cfg.currentCourseUrlList[index + 1];
              if (new URL(url).hash === new URL(location.href).hash) {
                if (!nextUrl) {
                  lib.$modal.alert({ content: "全部任务已完成" });
                  CommonProject.scripts.settings.methods.notificationBySetting("全部任务点已完成！", {
                    duration: 0,
                    extraTitle: "智慧职教学习脚本"
                  });
                  return;
                } else {
                  window.location.href = this.cfg.currentCourseUrlList[index + 1];
                }
              }
            }
          };
          study2();
        }
      }),
      study: new lib.Script({
        name: "🖥️ MOOC学院-课程学习",
        namespace: "icve.study.main",
        matches: [["课程学习页面", "/learnspace/learn/learn/templateeight/index.action"]],
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              "如果视频无法播放，可以手动点击其他任务跳过视频。",
              "经过测试视频倍速最多二倍，否则会判定无效。",
              "手动进入作业页面才能使用自动答题。"
            ]).outerHTML
          },
          playbackRate: playbackRate$2,
          volume,
          restudy,
          showScrollBar: {
            label: "显示右侧滚动条",
            attrs: { type: "checkbox" },
            defaultValue: true
          },
          expandAll: {
            label: "展开所有章节",
            attrs: { type: "checkbox" },
            defaultValue: true
          },
          switchPeriod: {
            label: "下一章节切换间隔（秒）",
            defaultValue: 10,
            attrs: {
              type: "number",
              min: 0,
              max: 999,
              step: 1
            }
          }
        },
        onrender() {
          this.offConfigChange(state$3.study.playbackRateWarningListenerId);
          state$3.study.playbackRateWarningListenerId = this.onConfigChange("playbackRate", (playbackRate2) => {
            if (playbackRate2 > 4) {
              lib.$modal.alert({
                title: "⚠️高倍速警告",
                content: lib.$ui.notes(["高倍速可能导致视频无法完成！"])
              });
            }
          }) || 0;
        },
        async oncomplete() {
          var _a;
          BackgroundProject.scripts.render.methods.pin(this);
          await $.sleep(3e3);
          this.onConfigChange("volume", (v) => state$3.study.currentMedia && (state$3.study.currentMedia.volume = v));
          this.onConfigChange(
            "playbackRate",
            (r) => state$3.study.currentMedia && (state$3.study.currentMedia.playbackRate = parseFloat(r.toString()))
          );
          const mainContentWin = (_a = lib.$el("#mainContent")) == null ? void 0 : _a.contentWindow;
          if (mainContentWin) {
            lib.$modal.confirm({
              content: lib.h("div", [
                "是否开始自动学习当前章节？",
                lib.h("br"),
                "你也可以选择任意的章节进行点击，脚本会自动学习，并一直往下寻找章节。"
              ]),
              cancelButtonText: "我想手动选择章节",
              confirmButtonText: "开始学习",
              async onConfirm() {
                study2(StudyLock.getLock());
                scrollToJob();
              }
            });
          }
          if (this.cfg.showScrollBar) {
            const bar = lib.$el(".dumascroll_area", mainContentWin.document);
            bar && (bar.style.overflow = "auto");
          }
          if (this.cfg.expandAll) {
            lib.$$el(".s_sectionlist,.s_sectionwrap", mainContentWin.document).forEach((el) => el.style.display = "block");
          }
          for (const job of lib.$$el(".s_point[itemtype]", mainContentWin.document)) {
            job.addEventListener("click", (e) => {
              const lock = StudyLock.getLock();
              if (e.isTrusted) {
                if (job.getAttribute("itemtype") === "exam") {
                  return lib.$message.info({
                    duration: 60,
                    content: "检测到您手动选择了作业/考试章节，将不会自动跳转，请完成后手动选择其他章节，脚本会自动学习。"
                  });
                } else {
                  lib.$message.info("检测到章节切换，即将自动学习...");
                }
              }
              setTimeout(() => {
                study2(lock);
              }, 3e3);
            });
          }
          const scrollToJob = () => {
            var _a2;
            return (_a2 = lib.$el(".s_pointerct", mainContentWin.document)) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth", block: "center" });
          };
          const study2 = async (studyLock) => {
            var _a2;
            const iframe = lib.$el("iframe", mainContentWin.document);
            const win = iframe == null ? void 0 : iframe.contentWindow;
            if (win) {
              const doc = win.document;
              if (iframe.src.includes("content_video.action") || iframe.src.includes("content_audio.action")) {
                $console.log("视频/音频播放中...");
                try {
                  const media = await waitForMedia({ root: doc });
                  state$3.study.currentMedia = media;
                  media.playbackRate = parseFloat(this.cfg.playbackRate.toString());
                  media.volume = this.cfg.volume;
                  media.currentTime = 0;
                  await new Promise((resolve, reject) => {
                    try {
                      win.jwplayer().onComplete(async () => {
                        $console.log("视频/音频播放完成。");
                        await $.sleep(3e3);
                        resolve();
                      });
                      media.addEventListener("pause", async () => {
                        if (!media.ended) {
                          await Promise.race([
                            waitForPopupQuestion(doc),
                            handleContinueDialog()
                          ]);
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
                  lib.$message.error(String(err));
                }
              } else if (iframe.src.includes("content_doc.action")) {
                await $.sleep(5e3);
              }
            }
            $console.log(this.cfg.switchPeriod + " 秒后切换下一章节。");
            await $.sleep(this.cfg.switchPeriod * 1e3);
            if (studyLock.canStudy()) {
              let nextEl;
              let isBellowCurrentJob = false;
              const jobs = lib.$$el(".s_point[itemtype]", mainContentWin.document);
              for (let index = 0; index < jobs.length; index++) {
                const job = jobs[index];
                if (job.classList.contains("s_pointerct")) {
                  isBellowCurrentJob = true;
                } else if (isBellowCurrentJob) {
                  if (job.querySelector(".done_icon_show") === null || this.cfg.restudy) {
                    $console.log("下一章：", job.title || ((_a2 = lib.$el(".s_pointti", job)) == null ? void 0 : _a2.title) || "未知");
                    nextEl = job;
                    break;
                  }
                }
              }
              if (nextEl) {
                nextEl.click();
                scrollToJob();
              } else {
                lib.$modal.alert({ content: "全部任务已完成" });
                CommonProject.scripts.settings.methods.notificationBySetting("全部任务点已完成！", {
                  duration: 0,
                  extraTitle: "智慧职教学习脚本"
                });
              }
            }
          };
        }
      }),
      work: new lib.Script({
        name: "✍️ 作业考试脚本",
        matches: [["作业考试页面", "/exam"]],
        namespace: "icve.work",
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              "自动答题前请在 “通用-全局设置” 中设置题库配置。",
              "可以搭配 “通用-在线搜题” 一起使用。",
              "请手动进入作业考试页面才能使用自动答题。"
            ]).outerHTML
          }
        },
        async oncomplete() {
          lib.$message.warn({ content: "自动答题时请勿切换题目，否则可能导致重复搜题或者脚本卡主。", duration: 0 });
          const resetToBegin = () => {
            var _a;
            (_a = document.querySelectorAll(`.sheet_nums [id*="sheetSeq"]`).item(0)) == null ? void 0 : _a.click();
          };
          commonWork({
            mount_script: this,
            workerProvider: work,
            beforeRunning: async () => {
              resetToBegin();
              await $.sleep(1e3);
            },
            onRestart: () => resetToBegin()
          });
        }
      }),
      workDispatcher: new lib.Script({
        name: "作业调度脚本",
        matches: [
          ["作业进入页面", "/platformwebapi/student/exam/"],
          ["确认作业页面", "/student/exam/studentExam_studentInfo.action"]
        ],
        hideInPanel: true,
        oncomplete() {
          if (/\/platformwebapi\/student\/exam/.test(window.location.href)) {
            lib.cors.on("icve-work-start", () => {
              setTimeout(() => {
                lib.$gm.unsafeWindow.openExamInfo();
              }, 3e3);
            });
          }
          if (/\/student\/exam\/studentExam_studentInfo.action/.test(window.location.href)) {
            setTimeout(() => {
              lib.$gm.unsafeWindow.enterExamPage();
            }, 3e3);
          }
        }
      }),
      "ai-study": new lib.Script({
        name: "🖥️ AI课程",
        namespace: "icve.ai.study",
        matches: [
          ["课程页面", "ai.icve.com.cn/app/coursedetails-excellent"],
          ["课程页面", "ai.icve.com.cn/app/my-excellent-home"],
          ["学习页面", "ai.icve.com.cn/excellent-study"]
        ],
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              [
                "如果脚本卡死或者您不想学习，",
                "可以点击其他任意章节继续进行学习。",
                "PPT请勿加快点击，否则可能无法记录学习进度。"
              ]
            ]).outerHTML
          },
          volume,
          playbackRate: {
            label: "视频倍速",
            tag: "select",
            options: [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 6, 8, 16].map((rate) => [
              rate.toString(),
              rate + " x"
            ]),
            defaultValue: "1"
          },
          autoOpenAllChapter: {
            label: "自动打开全部章节",
            attrs: {
              title: "如果没有打开全部章节，那么当任务点达到当前章节最后一个时将无法跳转到其他章节列表！",
              type: "checkbox"
            },
            defaultValue: true
          },
          restudy
        },
        onhistorychanged(type) {
          if (type !== "replaced") {
            return;
          }
          if (location.href.includes("kcnr")) {
            location.reload();
          }
        },
        async oncomplete(type) {
          if (document.location.href.includes("ai.icve.com.cn/app/my-excellent-home")) {
            return lib.$message.info("点击任意课程开始自动学习");
          }
          BackgroundProject.scripts.render.methods.pin(this);
          this.onConfigChange("volume", (val) => {
            if (state$3.study.currentMedia) {
              state$3.study.currentMedia.volume = parseFloat(val.toString());
            }
          });
          this.onConfigChange("playbackRate", (val) => {
            if (state$3.study.currentMedia) {
              state$3.study.currentMedia.playbackRate = parseFloat(val.toString());
            }
          });
          const waitForLoad2 = () => {
            return new Promise((resolve) => {
              const check = () => {
                if (document.querySelector(".contentBox")) {
                  resolve();
                } else {
                  setTimeout(check, 100);
                }
              };
              check();
            });
          };
          const closeStudyContinueDialog = () => {
            return new Promise((resolve) => {
              let stop = false;
              const check = () => {
                var _a, _b;
                if (document.querySelector(".el-message-box__wrapper")) {
                  (_a = lib.$el(".el-message-box__wrapper")) == null ? void 0 : _a.remove();
                  (_b = lib.$el(".v-modal")) == null ? void 0 : _b.remove();
                  resolve();
                } else {
                  !stop && setTimeout(check, 100);
                }
              };
              check();
              setTimeout(() => {
                stop = true;
                resolve();
              }, 3 * 1e3);
            });
          };
          await waitForLoad2();
          await closeStudyContinueDialog();
          await waitForLoad2();
          await $.sleep(3e3);
          $msg_and_log$1("info", "即将打开全部章节列表，请稍等");
          const openAllChapter = async () => {
            var _a;
            const model = lib.$modal.simple({
              maskCloseable: false,
              footer: void 0,
              content: "正在展开全部章节列表，请耐心等待不要操作..."
            });
            const not_scrolled_titles = Array.from(document.querySelectorAll(".one-title")).filter(
              (el) => !el.querySelector(".zhankai")
            );
            const waitForChapterOpen = (title) => {
              return new Promise((resolve) => {
                let stop = false;
                const check = () => {
                  var _a2;
                  const parent = (_a2 = title.parentElement) == null ? void 0 : _a2.parentElement;
                  const content = parent == null ? void 0 : parent.querySelector(".panel-content");
                  if ((content == null ? void 0 : content.style.display) !== "none" && ((content == null ? void 0 : content.querySelectorAll(".node").length) || 0) > 0) {
                    resolve();
                  } else {
                    !stop && setTimeout(check, 100);
                  }
                };
                check();
                setTimeout(() => {
                  stop = true;
                  resolve();
                }, 10 * 1e3);
              });
            };
            for (const nst of not_scrolled_titles) {
              try {
                (_a = nst.querySelector(".jiantou")) == null ? void 0 : _a.click();
                nst.focus();
                nst.scrollIntoView({ behavior: "smooth", block: "center" });
                await waitForChapterOpen(nst);
                await $.sleep(1e3);
              } catch (e) {
                $console.error("打开章节失败", e);
              }
            }
            model == null ? void 0 : model.remove();
          };
          if (this.cfg.autoOpenAllChapter)
            await openAllChapter();
          let study_id = "";
          document.querySelectorAll(".node").forEach((el) => {
            el.addEventListener("click", () => {
              study2(study_id = Math.random().toString(36).substr(2, 9));
            });
          });
          const study2 = async (id) => {
            var _a;
            $msg_and_log$1("info", "即将开始学习：" + (((_a = lib.$el(".contentBox")) == null ? void 0 : _a.__vue__.nrdata.name) || "未知任务点"));
            await $.sleep(3e3);
            await (async () => {
              var _a2;
              const active = document.querySelector(".panelList .node.active");
              active == null ? void 0 : active.focus();
              active == null ? void 0 : active.scrollIntoView({ behavior: "smooth", block: "center" });
              if ((active == null ? void 0 : active.querySelector("i.wc")) && !this.cfg.restudy) {
                return $msg_and_log$1("info", "当前任务已完成，即将跳过");
              }
              const vue = (_a2 = lib.$el(".FilePreview")) == null ? void 0 : _a2.__vue__;
              const img = lib.$el(".ql-editor");
              const work2 = lib.$el(".shiti");
              if (work2) {
                return $msg_and_log$1("warn", "检测到当前为作业任务，请完成课程后手动进入自动答题。");
              } else if (img) {
                return $msg_and_log$1("warn", "检测到当前为图片任务，即将跳过");
              } else {
                if (!vue) {
                  return lib.$message.error({ content: "获取课程数据失败，或者未知任务点，即将跳过" });
                }
                const watchOffice = async () => {
                  const total = vue.photoList.length;
                  for (let index = 0; index < total + 1; index++) {
                    if (id !== study_id)
                      return;
                    vue.next();
                    await $.sleep(3e3);
                  }
                };
                lib.$message.info("开始学习");
                if (["video", "audio"].includes(vue.curType)) {
                  await closeStudyContinueDialog();
                  await watchMedia$2();
                } else if (["office", "ppt"].includes(vue.curType)) {
                  await watchOffice();
                  if (id !== study_id)
                    return;
                  await $.sleep(1e3);
                } else {
                  $msg_and_log$1("warn", "未知的任务点，即将跳过");
                }
              }
            })();
            if (id !== study_id)
              return;
            const next2 = getNext();
            if (!next2) {
              return $msg_and_log$1("warn", "没有找到下一章节！");
            }
            $msg_and_log$1("info", "即将进入下一章节");
            await $.sleep(3e3);
            if (id !== study_id)
              return;
            next2.click();
          };
          const getNext = () => {
            const list = Array.from(document.querySelectorAll(".panelList .node"));
            const current_index = list.findIndex((e) => e.classList.contains("active"));
            return list.find((el, index) => {
              return index > current_index && (this.cfg.restudy || el.querySelector("i.wc") === null);
            });
          };
          study2(study_id);
        }
      }),
      "ai-work": new lib.Script({
        name: "✍️ AI作业",
        namespace: "icve.ai.work",
        matches: [["作业页面", "ai.icve.com.cn/preview-exam"]],
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              "自动答题前请在 “通用-全局设置” 中设置题库配置。",
              "可以搭配 “通用-在线搜题” 一起使用。",
              "请手动进入作业考试页面才能使用自动答题。",
              "自动答题时请勿切换题目，否则可能导致重复搜题或者脚本卡主！"
            ]).outerHTML
          }
        },
        oncomplete() {
          lib.$message.warn({ content: "自动答题时请勿切换题目，否则可能导致重复搜题或者脚本卡主。", duration: 0 });
          const resetToBegin = () => {
            var _a;
            (_a = document.querySelectorAll(`.list-box span`).item(0)) == null ? void 0 : _a.click();
          };
          commonWork({
            mount_script: this,
            workerProvider: aiWork,
            beforeRunning: async () => {
              resetToBegin();
              await $.sleep(1e3);
            },
            onRestart: () => resetToBegin()
          });
        }
      })
    }
  });
  async function watchMedia$2() {
    const media = await waitForMedia();
    media.volume = parseFloat(IcveMoocProject.scripts["ai-study"].cfg.volume.toString());
    media.playbackRate = parseFloat(IcveMoocProject.scripts["ai-study"].cfg.playbackRate.toString());
    state$3.study.currentMedia = media;
    const success = await playMedia(() => media.play());
    if (!success) {
      return;
    }
    return new Promise((resolve, reject) => {
      media.addEventListener("ended", () => {
        resolve();
      });
      media.addEventListener("pause", () => {
        setTimeout(() => {
          if (media.ended) {
            resolve();
          } else if (media.paused) {
            media.play();
            media.volume = parseFloat(IcveMoocProject.scripts["ai-study"].cfg.volume.toString());
            media.playbackRate = parseFloat(IcveMoocProject.scripts["ai-study"].cfg.playbackRate.toString());
          }
        }, 1e3);
      });
    });
  }
  function work({ answererWrappers, period, thread, answerSeparators }) {
    lib.$message.info("开始作业");
    CommonProject.scripts.workResults.methods.init({ dynamic: true });
    console.log({ answererWrappers, period, thread });
    const titleTransformWithImages = (titles) => {
      const images = [];
      const text2 = titles.filter((t2) => (t2 == null ? void 0 : t2.innerText) || (t2 == null ? void 0 : t2.querySelector("img"))).map((t2) => {
        var _a, _b;
        if (t2) {
          const title = t2.cloneNode(true);
          (_a = title.querySelector('[name*="questionIndex"]')) == null ? void 0 : _a.remove();
          (_b = title.querySelector(".q_score")) == null ? void 0 : _b.remove();
          const extracted = extractTextWithImages(title);
          images.push(...extracted.images);
          return extracted.text.trim().replace(/^、/, "") || "";
        }
        return "";
      }).join(",");
      return { text: text2, images };
    };
    const titleTransform = (titles) => titleTransformWithImages(titles).text;
    function getType(options) {
      const radio_len = options.map((o) => o.querySelector('[type="radio"]')).reduce((a, b) => {
        return a + (b ? 1 : 0);
      }, 0);
      return radio_len > 0 ? radio_len === 2 ? "judgement" : "single" : options.some((o) => o.querySelector('[type="checkbox"]')) ? "multiple" : options.some((o) => o.querySelector("textarea")) ? "completion" : options.some((o) => o.querySelector(".fillblank_input input")) ? "fill-blank" : void 0;
    }
    const worker = new OCSWorker({
      root: ".q_content",
      elements: {
        title: '.divQuestionTitle, [name="fillblankTitle"]',
        options: ".questionOptions .q_option, .questionOptions.divTextarea, .answerOption"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2, _ctx) => titleTransformWithImages(elements2.title),
        optionsTransform: (elements2, ctx) => {
          var _a;
          const type = getType(ctx.elements.options) || "unknown";
          ctx.type = type;
          if (type === "completion")
            return "";
          const optResults = ((_a = ctx.elements.options) != null ? _a : []).filter(Boolean).map((o) => extractTextWithImages(o));
          return {
            text: optResults.map((r) => r.text).join("\n"),
            images: optResults.flatMap((r) => r.images)
          };
        },
        answererWrappers,
        period
      }),
      async work(ctx) {
        const options = ctx.elements.options;
        const type = getType(options);
        if (!type) {
          throw new Error("无法获取题目类型！");
        }
        if (type === "fill-blank") {
          const inputs = options.map((o) => Array.from(o.querySelectorAll(".fillblank_input input"))).flat();
          for (const searchInfo of ctx.searchInfos) {
            for (const result of searchInfo.results) {
              const answers = splitAnswer(result.answer);
              if (answers.length === inputs.length) {
                for (let index = 0; index < inputs.length; index++) {
                  inputs[index].value = answers[index];
                }
                return { finish: true };
              }
            }
          }
        } else {
          const resolver = createDefaultQuestionResolver(ctx, (o) => extractTextWithImages(o).text)[type];
          const res = await resolver(ctx.searchInfos, ctx.elements.options, (type2, answer, option) => {
            var _a, _b;
            if (type2 === "judgement" || type2 === "single" || type2 === "multiple") {
              if (option.querySelector(".checkbox_on") === null) {
                (_a = lib.$el("div", option)) == null ? void 0 : _a.click();
              }
            } else if (type2 === "completion" && answer.trim()) {
              const text2 = option.querySelector("textarea");
              const textIframe = option.querySelector('iframe[id*="ueditor"]');
              if (text2) {
                text2.value = answer;
              }
              if (textIframe) {
                const view = (_b = textIframe.contentWindow) == null ? void 0 : _b.document.querySelector("body.view > p");
                if (view) {
                  view.innerText = answer;
                }
              }
            }
          });
          return res;
        }
        return { finish: false };
      },
      onElementSearched(elements2, root2) {
        console.log("elements", elements2);
      },
      onQuestionDetected(currentResult) {
        updateDynamicResult(currentResult, titleTransform);
      },
      onResultsUpdate(currentResult) {
        updateDynamicResult(currentResult, titleTransform);
      }
    });
    const getNextBtn = () => document.querySelector(".paging_next");
    let next2 = getNextBtn();
    (async () => {
      while (next2 && worker.isClose === false) {
        await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
        await $.sleep(1e3);
        next2 = getNextBtn();
        if (next2.style.display === "none") {
          break;
        } else {
          next2 == null ? void 0 : next2.click();
          await $.sleep(1e3);
        }
      }
      lib.$message.success({ content: "作业/考试完成，请自行检查后保存或提交。", duration: 0 });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "icve";
    })();
    dynamicWorkTips(worker);
    return worker;
  }
  function aiWork({ answererWrappers, period, thread, answerSeparators }) {
    lib.$message.info("开始作业");
    CommonProject.scripts.workResults.methods.init({ dynamic: true });
    console.log({ answererWrappers, period, thread });
    const titleTransform = (titles) => {
      const images = [];
      const text2 = titles.filter((t2) => (t2 == null ? void 0 : t2.innerText) || (t2 == null ? void 0 : t2.querySelector("img"))).map((t2) => {
        if (t2) {
          const extracted = extractTextWithImages(t2);
          images.push(...extracted.images);
          return extracted.text.replace(/\s+/g, " ").trim() || "";
        }
        return "";
      }).join(",");
      return { text: text2, images };
    };
    const titleText = (titles) => titleTransform(titles).text;
    function getType(options) {
      const radio_len = options.map((o) => o.querySelector('[type="radio"]')).reduce((a, b) => {
        return a + (b ? 1 : 0);
      }, 0);
      return radio_len > 0 ? radio_len === 2 ? "judgement" : "single" : options.some((o) => o.querySelector('[type="checkbox"]')) ? "multiple" : options.some((o) => o.querySelector("textarea")) || options.some((o) => o.classList.contains("ivu-input")) ? "completion" : options.some((o) => o.querySelector(".fillblank_input input")) ? "fill-blank" : void 0;
    }
    const worker = new OCSWorker({
      root: ".content-item",
      elements: {
        title: ".questions-content [class*=title-content]",
        options: "label[class*=group-item],.ivu-input-wrapper input"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2, _ctx) => titleTransform(elements2.title),
        optionsTransform: (elements2, ctx) => {
          ctx.type = getType(ctx.elements.options) || "unknown";
          const optResults = ctx.elements.options.map((o) => extractTextWithImages(o));
          return {
            text: optResults.map((r) => r.text).join("\n"),
            images: optResults.flatMap((r) => r.images)
          };
        },
        answererWrappers,
        period
      }),
      work: {
        optionText: (o) => extractTextWithImages(o).text,
        type: (ctx) => {
          return getType(ctx.elements.options);
        },
        async handler(type, answer, option, ctx) {
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (option.querySelector(".ivu-radio-checked") === null) {
              option == null ? void 0 : option.click();
            }
          } else if (type === "completion" && answer.trim()) {
            if (option.tagName === "INPUT") {
              option.focus();
              await $.sleep(100);
              option.value = answer.trim();
              await $.sleep(100);
              option.dispatchEvent(new Event("input", { bubbles: true }));
              await $.sleep(100);
              option.blur();
              await $.sleep(100);
            }
          }
        }
      },
      onElementSearched(elements2, root2) {
        console.log("elements", elements2);
      },
      onQuestionDetected(currentResult) {
        updateDynamicResult(currentResult, titleText);
      },
      onResultsUpdate(currentResult) {
        updateDynamicResult(currentResult, titleText);
      }
    });
    const getNextBtn = () => document.querySelector("div.center_btn > button:nth-child(2)");
    let next2 = getNextBtn();
    (async () => {
      while (next2 && worker.isClose === false) {
        await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
        await $.sleep(1e3);
        next2 = getNextBtn();
        if (next2.getAttribute("disabled")) {
          break;
        } else {
          next2 == null ? void 0 : next2.click();
          await $.sleep(1e3);
        }
      }
      lib.$message.success({ content: "作业/考试完成，请自行检查后保存或提交。", duration: 0 });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "icve";
    })();
    dynamicWorkTips(worker);
    return worker;
  }
  function waitForPopupQuestion(dom2) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        var _a, _b;
        const el = lib.$el(".popup-test", dom2);
        if (el) {
          clearInterval(interval);
          const right_answer = ((_a = lib.$el("#right_answer", el)) == null ? void 0 : _a.value) || "A";
          for (const answer of right_answer.split("")) {
            const item = lib.$el(`li.test-item-cell[curval="${answer}"]`, el);
            item == null ? void 0 : item.click();
          }
          (_b = lib.$el('[name="save_btn"]', el)) == null ? void 0 : _b.click();
          setTimeout(() => {
            var _a2;
            (_a2 = lib.$el('[name="continue_btn"]', el)) == null ? void 0 : _a2.click();
            resolve();
          }, 3e3);
        }
      }, 1e3);
      setTimeout(() => {
        clearInterval(interval);
        resolve();
        console.log("未找到弹窗，继续执行");
      }, 60 * 1e3);
    });
  }
  function handleContinueDialog() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const el = document.querySelector(".layui-layer-btn0");
        if (el) {
          el.click();
          setTimeout(() => {
            clearInterval(interval);
            resolve();
          }, 1e3);
        }
      }, 3e3);
      setTimeout(() => {
        clearInterval(interval);
        resolve();
        console.log("未找到弹窗，继续执行");
      }, 60 * 1e3);
    });
  }
  const state$2 = {
    studying: false,
    studyingId: "",
    media: null
  };
  const work_pages = [
    ["资源库keep作业页面", "study/spockeepTest"],
    ["资源库job作业页面", "study/spocjobTest"],
    ["资源库考试", "study/spoctest"],
    ["课堂测试作业界面", "study/courseteaching/test/homeWork"],
    ["作业页面", "icve-study/coursePreview/jobTes"],
    ["考试页面", "icve-study/coursePreview/test"],
    ["考试页面", "icve-study/test"],
    ["资源库测验页面", "icve-study/coursePreview/keepTest"]
  ];
  const isWork = () => {
    return window.location.href.includes("icve-study/coursePreview/jobTes") || window.location.href.includes("icve-study/coursePreview/keepTest") || window.location.href.includes("study/spockeepTest") || window.location.href.includes("study/spocjobTest") || window.location.href.includes("study/courseteaching/test/homeWork");
  };
  const isExam = () => {
    return window.location.href.includes("icve-study/coursePreview/test") || window.location.href.includes("icve-study/test") || window.location.href.includes("study/spoctest");
  };
  const ZJYProject = lib.Project.create({
    name: "职教云",
    domains: ["icve.com.cn", "zjy2.icve.com.cn", "zyk.icve.com.cn"],
    scripts: {
      guide: new lib.Script({
        name: "🖥️ 使用提示",
        matches: [
          ["学习页面", "zjy2.icve.com.cn/study"],
          ["资源库", "zyk.icve.com.cn/icve-study/"]
        ],
        namespace: "zjy.study.guide",
        configs: {
          notes: {
            defaultValue: createSteps(["登录网课平台", "点击任意章节进入学习", "等待脚本自动运行"]).outerHTML
          }
        }
      }),
      v2: new lib.Script({
        name: "旧版切换器",
        matches: [["新版智慧职教", "zjy2.icve.com.cn/study/v2/"]],
        hideInPanel: true,
        oncomplete() {
          $msgwc.info("脚本只支持旧版职教云，即将跳转到旧版职教云页面...");
          lib.$modal.alert({
            title: "提示",
            content: "脚本只支持旧版职教云，即将跳转到<b>旧版</b>职教云页面...",
            maskCloseable: false
          });
          setTimeout(() => {
            location.href = "/study/index";
          }, 5e3);
        }
      }),
      dispatcher: new lib.Script({
        name: "调度器",
        matches: [
          ["学习页面", "zjy2.icve.com.cn/study"],
          ["资源库", "zyk.icve.com.cn/icve-study/"],
          ["内容资源页面", "zjy2.icve.com.cn/study/studentFast/classroomNow"],
          ["在线课堂学习页面", "zjy2.icve.com.cn/study/studentFast/courseware"],
          ["课堂作业测试界面", "zjy2.icve.com.cn/study/courseteaching/test/homeWork"]
        ],
        hideInPanel: true,
        methods() {
          return {
            dispatch: async () => {
              var _a, _b, _c;
              if (["zjy2.icve.com.cn/study/studentFast/classroomNow"].some((i) => window.location.href.includes(i))) {
                await waitForElement(".classroom_activities .active_list");
                const courseData = getCourseDataInClassroomNowPage();
                console.log(courseData);
                const courseId = ((_c = (_b = (_a = document.querySelector(".teacherLayout")) == null ? void 0 : _a.__vue__) == null ? void 0 : _b.courseInfo) == null ? void 0 : _c.id) || "";
                if (!courseData || !courseId) {
                  return;
                }
                ZJYProject.scripts.study.cfg.currentCourseId = courseId;
                ZJYProject.scripts.study.cfg.courseList = courseData;
                lib.$message.success("课程数据获取成功，请点击课程章节开始学习");
              } else if ([
                "zyk.icve.com.cn/icve-study/coursePreview/courseware",
                "zjy2.icve.com.cn/study/coursePreview/spoccourseIndex/courseware",
                "zjy2.icve.com.cn/study/studentFast/courseware"
              ].some((i) => window.location.href.includes(i))) {
                const isClassroomNowStudy = location.href.includes("zjy2.icve.com.cn/study/studentFast/courseware");
                ZJYProject.scripts.study.methods.main(isClassroomNowStudy ? "classroomNow" : "normal");
              } else if (work_pages.map(([_, p]) => p).some((i) => window.location.href.includes(i))) {
                ZJYProject.scripts.work.methods.main();
              }
            }
          };
        },
        onhistorychange(type) {
          if (type === "push") {
            this.methods.dispatch();
          }
        },
        oncomplete() {
          this.methods.dispatch();
        }
      }),
      study: new lib.Script({
        matches: [
          ["学习页面", "zjy2.icve.com.cn/study/coursePreview/spoccourseIndex/courseware"],
          ["在线课堂学习页面", "zjy2.icve.com.cn/studentFast/courseware"],
          ["资源库学习页面", "zyk.icve.com.cn/icve-study/coursePreview/courseware"]
        ],
        name: "✍️ 课程学习",
        namespace: "zjy.study.main",
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              ["如果脚本卡死或者您不想学习，", "可以点击其他任意章节继续进行学习。"],
              "提示：职教云无法使用倍速。"
            ]).outerHTML
          },
          volume,
          playbackRate: {
            label: "视频倍速",
            tag: "select",
            options: [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 6, 8].map((rate) => [
              rate.toString(),
              rate + " x"
            ]),
            defaultValue: "1"
          },
          pptReadPeriod: {
            label: "PPT 阅读每页停留时间（秒）",
            defaultValue: 1,
            attrs: { type: "number", min: 1, step: 1, max: 10 }
          },
          currentCourseId: {
            defaultValue: ""
          },
          courseList: {
            defaultValue: []
          }
        },
        methods() {
          return {
            main: async (type) => {
              var _a;
              const id = new URL(window.location.href).searchParams.get(type === "classroomNow" ? "activityId" : "id");
              if (!id) {
                return;
              }
              if (state$2.studying && id === state$2.studyingId) {
                return;
              }
              state$2.studyingId = id;
              state$2.studying = true;
              this.onConfigChange("volume", (val) => {
                if (state$2.media) {
                  state$2.media.volume = parseFloat(val.toString());
                }
              });
              this.onConfigChange("playbackRate", (val) => {
                if (state$2.media) {
                  state$2.media.playbackRate = parseFloat(val.toString());
                }
              });
              await waitForLoad();
              setTimeout(() => {
                var _a2, _b;
                (_a2 = lib.$el(".el-message-box__wrapper")) == null ? void 0 : _a2.remove();
                (_b = lib.$el(".v-modal")) == null ? void 0 : _b.remove();
              }, 3e3);
              await waitForLoad();
              if (type === "normal") {
                const courseId = getUniqueCourseId();
                if (!courseId) {
                  lib.$message.error({ content: "获取课程数据失败，请手动刷新页面" });
                  return;
                }
                const not_same_class = !ZJYProject.scripts.study.cfg.currentCourseId || ZJYProject.scripts.study.cfg.currentCourseId !== courseId;
                if (not_same_class || !ZJYProject.scripts.study.cfg.courseList || ZJYProject.scripts.study.cfg.courseList.length === 0) {
                  const courseData = await getCourseData();
                  if (!courseData) {
                    return;
                  }
                  ZJYProject.scripts.study.cfg.currentCourseId = courseId;
                  ZJYProject.scripts.study.cfg.courseList = courseData;
                }
              }
              const courseInfo = ZJYProject.scripts.study.cfg.courseList.find((i) => i.id === id);
              if (!courseInfo) {
                const btn = lib.h("button", { className: "base-style-button" }, "修复数据");
                btn.onclick = async () => {
                  const courseId = getUniqueCourseId();
                  if (!courseId) {
                    lib.$message.error({ content: "获取课程数据失败！" });
                    return;
                  }
                  const courseData = await getCourseData();
                  if (!courseData) {
                    return;
                  }
                  ZJYProject.scripts.study.cfg.currentCourseId = courseId;
                  ZJYProject.scripts.study.cfg.courseList = courseData;
                  lib.$modal.simple({
                    title: "提示",
                    content: "数据已修复完毕，请刷新页面重新尝试运行。"
                  });
                };
                const err = "获取课程信息失败，请手动刷新页面，或者尝试修复数据：";
                lib.$message.error({ content: lib.h("span", [err, btn]), duration: 0 });
                $console.error(err);
                return;
              }
              const vue = getVueBindElement();
              const courseType = vue.curType === "video" ? "video" : (courseInfo == null ? void 0 : courseInfo.fileType) || "";
              const started_url = window.location.href;
              let msg = "开始学习：" + courseType + "-" + courseInfo.name;
              lib.$message.success(msg);
              $console.info(msg);
              if (["ppt", "doc", "pptx", "docx", "pdf", "txt", "ppt文档", "xls", "xlsx"].some((i) => courseType === i)) {
                await watchFile(this.cfg.pptReadPeriod);
              } else if (["video", "audio", "mp4", "mp3", "flv", "wav", "视频"].some((i) => courseType === i)) {
                const text2 = ((_a = lib.$el(".guide")) == null ? void 0 : _a.textContent) || "";
                msg = `任务点 ${courseInfo.name}，不支持播放。`;
                if (text2.includes("很抱歉，您的浏览器不支持播放此类文件") || text2.includes("此视频暂无法播放")) {
                  msg = `任务点 ${courseInfo.name}，不支持播放。`;
                  lib.$message.error(msg);
                  $console.error(msg);
                } else {
                  await watchMedia$1();
                }
              } else if (["png", "jpg", "图片"].some((i) => courseType === i)) {
                msg = `已查看图片任务点 ${courseInfo.name}，即将跳过。`;
                lib.$message.info(msg);
                $console.info(msg);
              } else {
                msg = `未知的任务点 ${courseInfo.name}，类型 ${courseType}，请跟作者进行反馈。`;
                lib.$message.error(msg);
                $console.error(msg);
              }
              if (started_url === window.location.href) {
                msg = "任务点结束，五秒后下一章";
                lib.$message.warn("如果职教云一直卡在显示：“资源类型无法学习，请核对数据！” 请手动切换下一章。");
                lib.$message.info(msg);
                $console.info(msg);
                await $.sleep(5e3);
                await next(type);
              }
            }
          };
        }
      }),
      work: new lib.Script({
        matches: work_pages,
        name: "✍️ 作业考试脚本",
        namespace: "zjy.work.main",
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              "自动答题前请在 “通用-全局设置” 中设置题库配置。",
              "可以搭配 “通用-在线搜题” 一起使用。",
              "请手动进入作业考试页面才能使用自动答题。"
            ]).outerHTML
          }
        },
        methods() {
          return {
            main: async () => {
              if (isWork() || isExam()) {
                await waitForQuestions();
                commonWork({
                  mount_script: this,
                  workerProvider: (opt) => workOrExam(isWork() ? "work" : "exam", opt)
                });
              }
            }
          };
        }
      })
    }
  });
  async function watchMedia$1() {
    const media = await waitForMedia();
    media.volume = parseFloat(ZJYProject.scripts.study.cfg.volume.toString());
    media.playbackRate = parseFloat(ZJYProject.scripts.study.cfg.playbackRate.toString());
    state$2.media = media;
    const success = await playMedia(() => media.play());
    if (!success) {
      return;
    }
    return new Promise((resolve, reject) => {
      media.addEventListener("ended", () => {
        resolve();
      });
      media.addEventListener("pause", () => {
        setTimeout(() => {
          if (media.ended) {
            resolve();
          } else if (media.paused) {
            media.play();
            media.volume = parseFloat(ZJYProject.scripts.study.cfg.volume.toString());
            media.playbackRate = parseFloat(ZJYProject.scripts.study.cfg.playbackRate.toString());
          }
        }, 1e3);
      });
    });
  }
  async function watchFile(pptReadPeriod) {
    var _a, _b;
    const vue = getPPTVueBindElement();
    if (!vue) {
      return;
    }
    while (true) {
      const [current, total] = ((_b = (_a = document.querySelector(".preview .page")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim().replace("上一页", "").replace("下一页", "").split("/").map((i) => parseInt(i.trim()))) || [];
      if (!current || !total) {
        break;
      }
      if (current >= total) {
        break;
      }
      try {
        vue.next && vue.next();
      } catch {
      }
      try {
        vue.skip && vue.skip();
      } catch {
      }
      await $.sleep(pptReadPeriod * 1e3);
    }
  }
  function getUniqueCourseId() {
    var _a, _b, _c, _d;
    return ((_d = (_c = (_b = (_a = document.querySelector(".coursePreviewIndex")) == null ? void 0 : _a.__vue__) == null ? void 0 : _b.list) == null ? void 0 : _c[0]) == null ? void 0 : _d.courseId) || "";
  }
  function isZyk() {
    return location.href.includes("zyk.icve.com.cn");
  }
  function getVueBindElement() {
    var _a, _b;
    return ((_a = lib.$el(".guide")) == null ? void 0 : _a.__vue__) || ((_b = lib.$el(".teach")) == null ? void 0 : _b.__vue__);
  }
  function getPPTVueBindElement() {
    var _a, _b, _c;
    return ((_a = lib.$el(".FilePreview")) == null ? void 0 : _a.__vue__) || ((_b = lib.$el(".guide")) == null ? void 0 : _b.__vue__) || ((_c = lib.$el(".teach")) == null ? void 0 : _c.__vue__);
  }
  async function next(type) {
    var _a;
    const field = type === "classroomNow" ? "activityId" : "id";
    const id = new URL(window.location.href).searchParams.get(field);
    let nextObject;
    const data = ZJYProject.scripts.study.cfg.courseList;
    const start_index = data.findIndex((i) => i.id === id);
    for (let index = start_index + 1; index < data.length; index++) {
      const item = data[index];
      if (["测验", "讨论"].some((i) => item.fileType === i)) {
        continue;
      }
      nextObject = item;
      break;
    }
    if (id && nextObject) {
      const vue = getVueBindElement();
      if (((_a = vue == null ? void 0 : vue.nextObj) == null ? void 0 : _a.id) && nextObject.id === vue.nextObj.id) {
        vue.preNext(vue.nextObj);
        return;
      }
      await $.sleep(3e3);
      const url = new URL(window.location.href);
      if (nextObject.courseDesignId) {
        url.searchParams.set("courseDesignId", nextObject.courseDesignId);
      }
      url.searchParams.set(field, nextObject.id);
      window.location.replace(url.href);
    } else {
      lib.$message.success({
        duration: 0,
        content: "全部任务已完成。"
      });
      $console.info("全部任务已完成。");
      CommonProject.scripts.settings.methods.notificationBySetting("全部任务点已完成！", {
        duration: 0,
        extraTitle: "职教云学习脚本"
      });
      state$2.studying = false;
    }
  }
  function getCourseDataInClassroomNowPage() {
    var _a, _b, _c;
    const list = ((_b = (_a = document.querySelector(".classroom_activities")) == null ? void 0 : _a.__vue__) == null ? void 0 : _b.activeList) || [];
    const data = [];
    const temp = JSON.parse(JSON.stringify(list));
    while (temp.length > 0) {
      const item = temp.shift();
      if (((_c = item == null ? void 0 : item.children) == null ? void 0 : _c.length) > 0) {
        temp.unshift(...item.children);
      } else {
        data.push({
          name: item.title,
          id: item.activityId,
          fileType: item.fileType,
          courseDesignId: item.courseDesignId,
          levelName: item.levelName || ""
        });
      }
    }
    return data;
  }
  async function getCourseData() {
    var _a;
    const getDataList = () => {
      var _a2, _b, _c;
      const list = ((_b = (_a2 = document.querySelector(".coursePreviewIndex")) == null ? void 0 : _a2.__vue__) == null ? void 0 : _b.list) || [];
      const data = [];
      const temp = JSON.parse(JSON.stringify(list));
      while (temp.length > 0) {
        const item = temp.shift();
        if (((_c = item == null ? void 0 : item.children) == null ? void 0 : _c.length) > 0) {
          temp.unshift(...item.children);
        } else {
          data.push({
            name: item.name,
            id: item.id,
            fileType: item.fileType,
            levelName: item.levelName || "",
            courseDesignId: item.courseDesignId || ""
          });
        }
      }
      return data;
    };
    if (isZyk() === false) {
      const progress = lib.h("div");
      const modal_content = lib.h("div", [
        lib.h("div", { className: "notes card" }, [
          lib.$ui.notes([
            "职教云由于大章节之间无自动下一节按钮，需要在课程开始前",
            "由程序读取全部章节数据，这样才能自动运行",
            "数据只需读取一遍即可，后续无需重新读取"
          ])
        ]),
        progress
      ]);
      let force_pause = false;
      const modal2 = lib.$modal.confirm({
        content: modal_content,
        maskCloseable: false,
        title: "正在获取课程数据中，请勿操作...",
        confirmButton: null,
        cancelButtonText: "强制暂停",
        onCancel() {
          force_pause = true;
        }
      });
      const kejianListEl = document.querySelector(".kejianList");
      if (!kejianListEl) {
        lib.$message.error({ content: "获取课程数据失败，请手动刷新页面" });
        return void 0;
      }
      if (kejianListEl.style.display === "none") {
        (_a = Array.from(document.querySelectorAll(".courseBtn div.customBtn")).find((el) => {
          var _a2;
          return (_a2 = el.textContent) == null ? void 0 : _a2.includes("课件目录");
        })) == null ? void 0 : _a.click();
        await $.sleep(1e3);
      }
      const folders = [];
      while (true) {
        const itemsElList = Array.from(document.querySelectorAll(".items"));
        const unsaved = itemsElList.find((item) => folders.includes(item) === false);
        if (!unsaved) {
          break;
        }
        const list = getDataList();
        const course_info = list.find(
          (item) => {
            var _a2;
            return `${item.levelName || ""}${item.name}`.replace(/\s/g, "") === (((_a2 = unsaved.textContent) == null ? void 0 : _a2.trim().replace(/\s/g, "")) || "");
          }
        );
        if (!course_info || ["父节点", "子节点"].includes(course_info.fileType) === false) {
          folders.push(unsaved);
          continue;
        }
        if (force_pause) {
          const err = "已强制暂停，请手动刷新页面后才能重新运行";
          lib.$message.error({ content: err, duration: 0 });
          lib.$modal.alert({ content: err });
          return void 0;
        }
        folders.push(unsaved);
        if (modal2) {
          progress.innerHTML = "<br><b>当前已获取 " + document.querySelectorAll(".fIteml,.iChild").length + " 个小节</b>";
        }
        unsaved.click();
        await $.sleep(1e3);
      }
      modal2 == null ? void 0 : modal2.remove();
    }
    return getDataList();
  }
  function waitForLoad() {
    return waitForElement(() => getVueBindElement());
  }
  async function waitForQuestions() {
    return waitForElement(
      [
        ".subjectList",
        ".subjectListTest"
      ].join(",")
    );
  }
  function workOrExam(type, { answererWrappers, period, thread, answerSeparators }) {
    lib.$message.info({ content: "开始作业" });
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "zjy"
    });
    const titleTransform = (titles) => {
      return titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => t2 == null ? void 0 : t2.innerText).join(",");
    };
    const worker = new OCSWorker({
      root: ".subjectDet",
      elements: {
        title: type === "work" ? "h2,h3,h4,h5,h6" : ".titleTest span:not(.xvhao)",
        options: ".optionList div , .tkInput .el-input, .tkInput .el-textarea"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2, _ctx) => titleTransform(elements2.title),
        answererWrappers,
        period
      }),
      work: {
        type(ctx) {
          const options = ctx.elements.options;
          const radio_len = options.map((o) => o.querySelector('[type="radio"]')).reduce((a, b) => {
            return a + (b ? 1 : 0);
          }, 0);
          return radio_len > 0 ? radio_len === 2 ? "judgement" : "single" : options.some((o) => o.querySelector('[type="checkbox"]')) ? "multiple" : options.some((o) => o.querySelector('[type="text"]')) || options.some((o) => o.querySelector("textarea")) ? "completion" : void 0;
        },
        handler(type2, answer, option, ctx) {
          var _a, _b;
          if (type2 === "judgement" || type2 === "single" || type2 === "multiple") {
            if (((_a = option.querySelector("input")) == null ? void 0 : _a.checked) !== true) {
              (_b = option.querySelector("label")) == null ? void 0 : _b.click();
            }
          } else if (type2 === "completion" && answer.trim()) {
            const text2 = option.querySelector('input[type="text"]');
            const textarea = option.querySelector("textarea");
            if (text2) {
              text2.value = answer;
              text2.dispatchEvent(new Event("input", { bubbles: true }));
            } else if (textarea) {
              textarea.value = answer;
              textarea.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }
        }
      },
      async onResultsInit(_curr, _index, res) {
        await CommonProject.scripts.workResults.methods.fillAll(
          res.map((r, i) => simplifyWorkResult(r, titleTransform, i))
        );
      },
      async onResultsUpdate(curr, index, res) {
        await CommonProject.scripts.workResults.methods.update(index, simplifyWorkResult(curr, titleTransform, index));
      }
    });
    worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug }).then(() => {
      lib.$message.info({ content: "作业/考试完成，请自行检查后保存或提交。", duration: 0 });
      worker.emit("done");
    }).catch((err) => {
      lib.$message.error({ content: `作业/考试失败: ${err}`, duration: 0 });
    });
    return worker;
  }
  const studyNotes = {
    defaultValue: lib.$ui.notes([
      "请勿在使用过程中最小化浏览器",
      "自动讨论默认关闭，如需开启请在下方设置中设置",
      "作业请完成课程后手动进入"
    ]).outerHTML
  };
  const readSpeed = {
    label: "PPT翻阅速度（秒）",
    attrs: { type: "number", step: "1", min: "1", max: "10" },
    defaultValue: 1
  };
  const playbackRate = {
    label: "视频倍速",
    tag: "select",
    defaultValue: 1,
    options: [
      ["1", "1 x"],
      ["1.25", "1.25 x"],
      ["1.5", "1.5 x"]
    ]
  };
  const discussionStrategy = {
    label: "讨论自动回复方式",
    tag: "select",
    attrs: {
      title: "在课程讨论任务点中自动回复评论的方式，默认为不回复，如需自动回复请手动选择。"
    },
    defaultValue: "not-reply",
    options: [
      ["not-reply", "不讨论回复"],
      ["random", "随机抽取评论区的内容进行回复"],
      ["max-show-up", "获取出现最多的评论进行回复"],
      ["max-fav", "获取最多点赞的评论进行回复"],
      ["use-newest", "获取最新的评论进行回复"]
    ]
  };
  const enableChapterTest = {
    label: "随堂测验自动答题",
    attrs: {
      type: "checkbox",
      title: "是否开启随堂测验自动答题，默认关闭，测试时只需点击即可完成测验，但这里保留选项防止需要开启。"
    },
    defaultValue: false
  };
  const icourseStudyCenterConfigs = {
    notes: studyNotes,
    playbackRate,
    volume,
    readSpeed,
    discussionStrategy,
    enableChapterTest
  };
  const $msg_and_log = (type, msg) => {
    lib.$message[type](msg);
    $console[type](msg);
  };
  const state$1 = {
    currentMedia: void 0,
    currentUrlHash: "",
    currentRunningScriptName: "",
    current_job_id: ""
  };
  const ICourseProject = lib.Project.create({
    name: "中国大学MOOC",
    domains: ["icourse163.org"],
    scripts: {
      dispatcher: new lib.Script({
        name: "调度器",
        hideInPanel: true,
        matches: [["所有页面", "icourse163.org"]],
        oncomplete() {
          if (location.pathname.startsWith("/mooc/learn")) {
            return;
          }
          setInterval(() => {
            var _a, _b, _c;
            const hash = new URL(window.location.href).hash;
            if (state$1.currentUrlHash !== hash) {
              state$1.currentRunningScriptName = "";
            }
            state$1.currentUrlHash = hash;
            for (const key in ICourseProject.scripts) {
              if (Object.prototype.hasOwnProperty.call(ICourseProject.scripts, key)) {
                const script2 = ICourseProject.scripts[key];
                if (typeof ((_a = script2.methods) == null ? void 0 : _a.main) !== "function") {
                  continue;
                }
                const runAtHash = Array.isArray(script2.cfg.runAtHash) ? script2.cfg.runAtHash : [script2.cfg.runAtHash];
                if (runAtHash.length && runAtHash.some((h2) => state$1.currentUrlHash.includes(h2))) {
                  if (state$1.currentRunningScriptName !== script2.name) {
                    state$1.currentRunningScriptName = script2.name;
                    state$1.current_job_id = Math.random().toString(16).slice(2);
                    (_c = (_b = script2.methods) == null ? void 0 : _b.main) == null ? void 0 : _c.call(_b, {
                      canRun: () => {
                        return state$1.currentUrlHash && runAtHash.some((h2) => state$1.currentUrlHash.includes(h2));
                      },
                      job_id: state$1.current_job_id
                    });
                  }
                  break;
                }
              }
            }
          }, 1e3);
        }
      }),
      guide: new lib.Script({
        name: "💡 使用提示",
        matches: [["", "icourse163.org"]],
        namespace: "icourse.guide-v1",
        configs: {
          notes: {
            defaultValue: createSteps(["登录网课平台", "进入任意课程的课件/作业界面", "等待脚本自动运行"]).outerHTML
          },
          runAtHash: {
            defaultValue: ["/home/course"]
          }
        },
        methods() {
          return {
            main: async () => {
              console.log(state$1, this.cfg.runAtHash);
              BackgroundProject.scripts.render.methods.pin(this);
            }
          };
        }
      }),
      "study-center": new lib.Script({
        name: "🖥️ 学习设置",
        matches: [
          ["MOOC学习页面", "icourse163.org/learn"],
          ["SPOC学习页面", "icourse163.org/spoc/learn"],
          ["新智慧慕课学习页面", "/mooc/learn"]
        ],
        namespace: icourseStudyNamespace,
        configs: icourseStudyCenterConfigs,
        oncomplete() {
          migrateIcourseStudyConfigs();
          BackgroundProject.scripts.render.methods.pin(this);
        }
      }),
      study: new lib.Script({
        name: "🖥️ 学习脚本",
        hideInPanel: true,
        namespace: icourseStudyNamespace,
        matches: [
          ["MOOC作业页面", "icourse163.org/learn"],
          ["SPOC作业页面", "icourse163.org/spoc/learn"]
        ],
        configs: {
          runAtHash: {
            defaultValue: "/learn/content?type=detail"
          },
          playbackRate: playbackRate$2,
          volume,
          readSpeed,
          discussionStrategy,
          enableChapterTest
        },
        oncomplete() {
          migrateIcourseStudyConfigs();
          this.onConfigChange("playbackRate", (playbackRate2) => {
            state$1.currentMedia && (state$1.currentMedia.playbackRate = parseFloat(playbackRate2.toString()));
          });
          this.onConfigChange("volume", (v) => state$1.currentMedia && (state$1.currentMedia.volume = v));
        },
        methods() {
          return {
            main: async ({ canRun, job_id }) => {
              const remotePage = await BackgroundProject.scripts.dev.methods.getRemotePlaywrightCurrentPage();
              if (!remotePage) {
                return $playwright.showError();
              }
              $render.moveToEdge();
              const handleVideoTest = async () => {
                if (!canRun() || job_id !== state$1.current_job_id)
                  return;
                setTimeout(async () => {
                  const question = document.querySelector(".u-questionItem");
                  const media = document.querySelector("video,audio");
                  if (question && media) {
                    $msg_and_log("info", "检测到视频弹窗测验，开始答题");
                    await new Promise((resolve) => {
                      ICourseProject.scripts.work.methods.start("chapter-test", canRun, (worker) => {
                        console.log("worker", worker);
                        worker.once("done", resolve);
                        worker.once("close", resolve);
                        worker.once("stop", resolve);
                      });
                    });
                    await $.sleep(1e3);
                    await remotePage.click(".j-unitctBox .u-btn-default.j-continue");
                    $msg_and_log("info", "测验完成");
                  }
                  handleVideoTest();
                }, 3e3);
              };
              handleVideoTest();
              const study2 = async () => {
                var _a, _b;
                const lessonName = (_a = document.querySelector(".j-lesson .j-up")) == null ? void 0 : _a.textContent;
                const currentUnitItem = document.querySelector(".j-unitslist  li.current");
                const unitName = (_b = currentUnitItem == null ? void 0 : currentUnitItem.querySelector(".unit-name")) == null ? void 0 : _b.textContent;
                $msg_and_log("info", `正在学习：${lessonName || ""} - ${unitName || ""}`);
                const isJob = (iconName) => currentUnitItem == null ? void 0 : currentUnitItem.querySelector(`[class*=${iconName}]`);
                let hasJob = true;
                if (isJob("u-icon-video")) {
                  await waitForElement("video, audio");
                  await watchMedia(this.cfg.playbackRate, this.cfg.volume);
                  $msg_and_log("info", "视频学习完成");
                } else if (isJob("u-icon-doc")) {
                  await waitForElement(".ux-pdf-reader");
                  await readPPT(remotePage, this.cfg.readSpeed);
                  $msg_and_log("info", "PPT完成");
                } else if (isJob("u-icon-discuss")) {
                  await waitForElement(".j-reply-all");
                  await discussion(remotePage, this.cfg.discussionStrategy);
                  $msg_and_log("info", "讨论完成");
                } else if (isJob("u-icon-test")) {
                  const replay = await waitForElement(".j-replay");
                  if ((replay == null ? void 0 : replay.style.display) === "none") {
                    if (this.cfg.enableChapterTest) {
                      await new Promise((resolve) => {
                        ICourseProject.scripts.work.methods.start("chapter-test", canRun, (worker) => {
                          console.log("worker", worker);
                          worker.once("done", resolve);
                          worker.once("close", resolve);
                        });
                      });
                      $msg_and_log("info", "测验完成");
                    } else {
                      $msg_and_log(
                        "warn",
                        "随堂测验自动答题功能已关闭（上方菜单栏-中国大学MOOC-学习脚本中开启），即将跳过。"
                      );
                    }
                  } else {
                    $msg_and_log("info", "随堂测验已完成，即将跳过。");
                  }
                } else if (isJob("u-icon-text")) {
                  const key = "text-job-reload";
                  if (await lib.$store.getTab(key) === "1") {
                    lib.$store.setTab(key, "0");
                    $msg_and_log("info", "文档已完成，即将跳过。");
                  } else {
                    lib.$store.setTab(key, "1");
                    $msg_and_log("info", "文档无需处理，将在刷新完成后跳过。");
                    await $.sleep(3e3);
                    window.location.reload();
                    return;
                  }
                } else {
                  hasJob = false;
                }
                await $.sleep(3e3);
                if (canRun()) {
                  if (hasJob) {
                    $msg_and_log("info", "准备跳转下一章");
                  } else {
                    $msg_and_log("warn", "未找到学习内容，或者此章节不支持自动学习！即将跳过本章节");
                  }
                  await gotoNextJob();
                }
              };
              study2();
              async function gotoNextJob() {
                const list = await next2();
                for (const item of list) {
                  const el = typeof item === "function" ? item() : item;
                  if (el) {
                    await (remotePage == null ? void 0 : remotePage.click(el));
                  }
                }
                if (list.length === 0) {
                  lib.$message.success({ content: "所有章节学习完成！", duration: 0 });
                  $console.info("所有章节学习完成！");
                  CommonProject.scripts.settings.methods.notificationBySetting("所有章节学习完成！", {
                    duration: 0,
                    extraTitle: "中国大学MOOC学习脚本"
                  });
                }
              }
              async function next2() {
                var _a;
                const nextEl = (_a = document.querySelector(".unitslist .current")) == null ? void 0 : _a.nextElementSibling;
                if (nextEl) {
                  return [nextEl.querySelector(".unit-name")];
                }
                const getName = (node) => {
                  var _a2;
                  return (_a2 = node == null ? void 0 : node.textContent) == null ? void 0 : _a2.replace(/\s/g, "");
                };
                const lessonName = getName(document.querySelector(".j-lesson .j-up"));
                if (!lessonName) {
                  throw Error("无法读取章节名!");
                }
                const lessonList = Array.from(document.querySelectorAll(".j-lesson .j-list .list"));
                let nextLesson = void 0;
                for (const item of lessonList) {
                  const itemName = getName(item);
                  if (itemName === lessonName) {
                    if (item.nextElementSibling) {
                      nextLesson = item.nextElementSibling;
                      break;
                    }
                  }
                }
                if (nextLesson) {
                  return [
                    document.querySelector(".j-lesson"),
                    nextLesson
                  ];
                }
                const chapterName = getName(document.querySelector(".j-chapter .j-up"));
                if (!chapterName) {
                  throw Error("无法读取单元名!");
                }
                const chapterList = Array.from(document.querySelectorAll(".j-chapter .j-list .list"));
                let nextChapter = void 0;
                for (const item of chapterList) {
                  const itemName = getName(item);
                  if (itemName === chapterName) {
                    if (item.nextElementSibling) {
                      nextChapter = item.nextElementSibling;
                      break;
                    }
                  }
                }
                if (nextChapter) {
                  return [
                    () => document.querySelector(".j-chapter"),
                    () => nextChapter,
                    () => document.querySelector(".j-lesson"),
                    () => document.querySelectorAll(".j-lesson .j-list .list")[0]
                  ];
                } else {
                  return [];
                }
              }
            }
          };
        }
      }),
      study_v2: new lib.Script({
        name: "🖥️ 智慧慕课",
        hideInPanel: true,
        matches: [["新智慧慕课", "/mooc/learn"]],
        namespace: icourseStudyNamespace,
        configs: {
          playbackRate: playbackRate$2,
          volume,
          readSpeed,
          discussionStrategy,
          enableChapterTest
        },
        methods() {
          return {
            waitForV2PageLoaded: () => waitForElement('[data-page-state="loaded"]'),
            main: async () => {
              this.onConfigChange("playbackRate", (playbackRate2) => {
                state$1.currentMedia && (state$1.currentMedia.playbackRate = parseFloat(playbackRate2.toString()));
              });
              this.onConfigChange("volume", (v) => state$1.currentMedia && (state$1.currentMedia.volume = v));
              const section = await waitForElement(".learn-courseware-panel");
              const canRun = () => section == null ? void 0 : section.isConnected;
              lib.$message.info("正在自动学习中...");
              const remotePage = await BackgroundProject.scripts.dev.methods.getRemotePlaywrightCurrentPage();
              if (!remotePage) {
                return $playwright.showError();
              }
              $render.moveToEdge();
              const getCurrentChapter = () => document.querySelectorAll("header > div.flex.flex-wrap.items-center.gap-3 button.rounded-\\[8px\\]")[0];
              const getCurrentLesson = () => document.querySelectorAll("header > div.flex.flex-wrap.items-center.gap-3 button.rounded-\\[8px\\]")[1];
              const getCurrentUnit = () => document.querySelector(".learn-unit-tabs-scroll button[class*=rgba]");
              const study2 = async () => {
                var _a, _b;
                await $.sleep(2e3);
                BackgroundProject.scripts.render.methods.pin(this);
                const lessonName = (_a = getCurrentLesson()) == null ? void 0 : _a.textContent;
                const currentUnitItem = getCurrentUnit();
                const unitName = (_b = getCurrentUnit()) == null ? void 0 : _b.textContent;
                const isJob = (iconName) => !!(currentUnitItem == null ? void 0 : currentUnitItem.querySelector(`[data-lesson-type-icon="${iconName}"]`));
                const isJobFinish = (unit) => !!(unit == null ? void 0 : unit.querySelector(".lucide-circle-check"));
                await (async () => {
                  if (!canRun()) {
                    return;
                  }
                  if (isJobFinish(currentUnitItem)) {
                    return lib.$message.info("当前任务已完成，即将跳转");
                  }
                  const jobs = [isJob("video"), isJob("pdf"), isJob("discussion"), isJob("quiz")];
                  const hasJobs = jobs.every((job) => job);
                  const [isVideoJob, isPdfJob, isDiscussionJob, isQuizJob] = jobs;
                  if (hasJobs) {
                    $msg_and_log("info", `正在学习：${lessonName || ""} - ${unitName || ""}`);
                  }
                  if (isVideoJob) {
                    await waitForElement("video, audio");
                    await watchMedia(this.cfg.playbackRate, this.cfg.volume);
                    return lib.$message.info("视频学习完成，准备跳转下一章");
                  }
                  if (isPdfJob) {
                    await waitForElement(".pdf-unit-reader");
                    await readPPT_v2(remotePage, this.cfg.readSpeed);
                    return lib.$message.info("PPT完成，准备跳转下一章");
                  }
                  if (isDiscussionJob) {
                    await waitForElement("#forum-reply-form");
                    await discussion_v2(remotePage, this.cfg.discussionStrategy);
                    return lib.$message.info("讨论完成，准备跳转下一章");
                  }
                  if (isQuizJob) {
                    await waitForElement(".lesson-quiz-question-rich-text");
                    $msg_and_log("info", "开始答题");
                    if (this.cfg.enableChapterTest) {
                      await new Promise((resolve) => {
                        commonWork({
                          mount_script: this,
                          workerProvider: (opts) => {
                            const worker = chapter_v2(remotePage, opts);
                            worker.once("done", () => {
                              clearInterval(interval);
                              resolve();
                            });
                            worker.once("close", () => {
                              clearInterval(interval);
                              resolve();
                            });
                            const interval = setInterval(() => {
                              if (canRun() === false) {
                                $msg_and_log("warn", "检测到页面切换，无法继续答题，将关闭自动答题。");
                                clearInterval(interval);
                                worker.emit("close");
                              }
                            }, 1e3);
                            return worker;
                          },
                          start_delay_seconds: 3
                        });
                      });
                      $msg_and_log("info", "测验完成");
                    } else {
                      $msg_and_log(
                        "warn",
                        "随堂测验自动答题功能已关闭（上方菜单栏-中国大学MOOC-学习脚本中开启），即将跳过。"
                      );
                    }
                    return lib.$message.info("答题完成，准备跳转下一章");
                  }
                  lib.$message.warn("未找到学习内容，或者此章节不支持自动学习！即将跳过本章节");
                })();
                await $.sleep(2e3);
                if (canRun()) {
                  await gotoNextJob();
                }
              };
              async function gotoNextJob() {
                const list = await next2();
                for (const item of list) {
                  const el = typeof item === "function" ? item() : item;
                  if (el) {
                    await (remotePage == null ? void 0 : remotePage.click(el));
                    await $.sleep(500);
                  }
                }
                if (list.length === 0) {
                  lib.$message.success({ content: "所有章节学习完成！", duration: 0 });
                  $console.info("所有章节学习完成！");
                  CommonProject.scripts.settings.methods.notificationBySetting("所有章节学习完成！", {
                    duration: 0,
                    extraTitle: "中国大学MOOC学习脚本"
                  });
                }
              }
              async function next2() {
                var _a, _b, _c, _d, _e;
                const nextEl = (_a = getCurrentUnit()) == null ? void 0 : _a.nextElementSibling;
                if (nextEl) {
                  return [() => nextEl];
                }
                await (remotePage == null ? void 0 : remotePage.click(getCurrentLesson()));
                const nextLesson = (_c = (_b = getCurrentLesson().nextElementSibling) == null ? void 0 : _b.querySelector("button.text-primary-700")) == null ? void 0 : _c.nextElementSibling;
                if (nextLesson) {
                  return [() => nextLesson];
                }
                await (remotePage == null ? void 0 : remotePage.click(getCurrentChapter()));
                const nextChapter = (_e = (_d = getCurrentChapter().nextElementSibling) == null ? void 0 : _d.querySelector("button.text-primary-700")) == null ? void 0 : _e.nextElementSibling;
                if (nextChapter) {
                  return [
                    () => nextChapter,
                    () => getCurrentLesson(),
                    () => {
                      var _a2;
                      return (_a2 = getCurrentLesson().nextElementSibling) == null ? void 0 : _a2.querySelectorAll("button")[0];
                    }
                  ];
                } else {
                  return [];
                }
              }
              study2();
            }
          };
        },
        async onhistorychange(type) {
          await this.methods.waitForV2PageLoaded();
          if (type === "push") {
            if (document.querySelector('[class="course-content-card"]')) {
              return lib.$message.info({ content: "请手动进入视频、作业页面，脚本会自动运行。", duration: 10 });
            }
            if (document.querySelector(".learn-courseware-panel")) {
              return this.methods.main();
            }
          }
        },
        async oncomplete() {
          migrateIcourseStudyConfigs();
          await this.methods.waitForV2PageLoaded();
          if (document.querySelector('[class="course-content-card"]')) {
            return lib.$message.info({ content: "请手动进入视频、作业页面，脚本会自动运行。", duration: 10 });
          }
          if (document.querySelector(".learn-courseware-panel")) {
            return this.methods.main();
          }
        }
      }),
      work: new lib.Script({
        name: "✍️ 作业考试脚本",
        namespace: "icourse.work-v2",
        matches: [
          ["MOOC作业页面", "icourse163.org/learn"],
          ["SPOC作业页面", "icourse163.org/spoc/learn"],
          ["考试页面", "icourse163.org/mooc/main/newExam"]
        ],
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              "自动答题前请在 “通用-全局设置” 中设置题库配置。",
              "⚠️禁止同时开多个作业/考试页面。",
              [
                "⚠️由于MOOC限制、答题速度和搜题速度将默认调慢",
                " 防止出现网络并发，导致无法选上选项的问题。",
                " 答题和搜题过慢是正常情况。"
              ]
            ]).outerHTML
          },
          runAtHash: {
            defaultValue: ["/learn/quiz", "/learn/examObject"]
          }
        },
        methods() {
          const start2 = async (type, canRun, onWorkerCreated) => {
            const remotePage = await BackgroundProject.scripts.dev.methods.getRemotePlaywrightCurrentPage();
            if (!remotePage) {
              return $playwright.showError();
            }
            await waitForQuestion();
            BackgroundProject.scripts.render.methods.pin(this);
            BackgroundProject.scripts.render.methods.normal();
            $msg_and_log("info", "开始答题");
            commonWork({
              mount_script: this,
              workerProvider: (opts) => {
                const worker = workAndExam(remotePage, type, opts);
                worker.once("close", () => {
                  clearInterval(interval);
                });
                const interval = setInterval(() => {
                  if (canRun() === false) {
                    $msg_and_log("warn", "检测到页面切换，无法继续答题，将关闭自动答题。");
                    clearInterval(interval);
                    worker.emit("close");
                  }
                }, 1e3);
                return worker;
              },
              onWorkerCreated,
              start_delay_seconds: 3
            });
          };
          return {
            main: async ({ canRun }) => {
              if (location.hash.includes("learn/quizscore")) {
                lib.$message.success("当前作业已完成，自动答题关闭。");
                return;
              }
              return start2("work", canRun);
            },
            start: start2
          };
        },
        oncomplete() {
          if (location.href.includes("/learn/examObject") && !location.href.includes("learn/examObjectScore") || location.href.includes("/mooc/main/newExam")) {
            this.methods.start("exam", () => true);
          }
        }
      }),
      passportRedirect: new lib.Script({
        name: "登录重定向修复",
        matches: [["登录重定向", "passport/logingate/changeCookie.htm"]],
        configs: {
          notes: {
            defaultValue: lib.$ui.notes(["检测到页面重定向到空白页面", "程序将会自动修复"]).outerHTML
          }
        },
        hideInPanel: true,
        oncomplete(...args) {
          BackgroundProject.scripts.render.methods.pin(this);
          lib.$message.info("检测到中国大学MOOC空白页面，即将重定向修复...");
          setTimeout(() => {
            location.href = "https://www.icourse163.org/";
          }, 3e3);
        }
      })
    }
  });
  function waitForQuestion() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (document.querySelector(".u-questionItem,[class*=questionBody]")) {
          clearInterval(interval);
          resolve();
        }
      }, 1e3);
    });
  }
  function workAndExam(rp, type, { answererWrappers, redundanceWordsText, upload, stopSecondWhenFinish, answerSeparators }) {
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "icourse"
    });
    const titleTransform = (titles) => {
      const images = [];
      const text2 = removeRedundantWords(
        titles.filter((t2) => (t2 == null ? void 0 : t2.innerText) || (t2 == null ? void 0 : t2.querySelector("img"))).map((t2) => {
          if (t2) {
            const extracted = extractTextWithImages(t2);
            images.push(...extracted.images);
            return extracted.text.replace(/\s+/g, " ").trim() || "";
          }
          return "";
        }).filter((t2) => t2.trim() !== "").join(",").replace(/[\u200A-\u200F]/g, ""),
        redundanceWordsText.split("\n")
      );
      return { text: text2, images };
    };
    const titleText = (titles) => titleTransform(titles).text;
    const work_type = type;
    const worker = new OCSWorker({
      root: type === "exam" ? "[class*=questionBody]" : ".u-questionItem",
      elements: {
        title: type === "exam" ? "[class*=questionInfo]" : ".j-title .j-richTxt",
        options: type === "exam" ? "[class*=index-module__optionBody]" : ".choices li,.inputArea"
      },
      thread: 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2, _ctx) => titleTransform(elements2.title),
        optionsTransform: (elements2, ctx) => {
          const optResults = ctx.elements.options.map((o) => extractTextWithImages(o));
          return {
            text: optResults.map((r) => r.text).join("\n"),
            images: optResults.flatMap((r) => r.images)
          };
        },
        answererWrappers,
        period: 5
      }),
      work: {
        optionText: (o) => extractTextWithImages(o).text,
        async handler(type2, answer, option) {
          var _a;
          if (type2 === "judgement" || type2 === "single" || type2 === "multiple") {
            if (work_type === "exam") {
              const input2 = option.querySelector("input");
              if (input2 && !(input2 == null ? void 0 : input2.checked)) {
                return await networkIdleRequire(rp, async () => {
                  await $.sleep(1e3);
                  return input2.click();
                });
              }
            }
            const text2 = option.querySelector(".f-richEditorText");
            const input = option.querySelector("input");
            if (input && !(input == null ? void 0 : input.checked) && text2) {
              await networkIdleRequire(rp, async () => {
                await $.sleep(1e3);
                await rp.click(text2);
              });
            }
          } else if (type2 === "completion" && answer.trim()) {
            const textarea = option.querySelector("textarea");
            const id = ((_a = textarea == null ? void 0 : textarea.getAttribute("id")) == null ? void 0 : _a.toString()) || "";
            if (id && (textarea == null ? void 0 : textarea.value.trim()) !== answer.trim()) {
              await networkIdleRequire(rp, async () => {
                await $.sleep(1e3);
                await rp.click("#" + id);
                await rp.fill("#" + id, answer.trim());
              });
            }
          }
        }
      },
      onElementSearched(elements2, root2) {
        elements2.options.forEach((el) => {
          const correct = el.querySelector(".u-icon-correct");
          const wrong = el.querySelector(".u-icon-wrong");
          if (correct) {
            correct.replaceWith("对");
          }
          if (wrong) {
            wrong.replaceWith("错");
          }
        });
      },
      async onResultsInit(_curr, _index, res) {
        await CommonProject.scripts.workResults.methods.fillAll(res.map((r, i) => simplifyWorkResult(r, titleText, i)));
      },
      async onResultsUpdate(curr, index, res) {
        await CommonProject.scripts.workResults.methods.update(index, simplifyWorkResult(curr, titleText, index));
      }
    });
    worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug }).then(async (results) => {
      if (worker.isClose) {
        return;
      }
      if (type === "chapter-test") {
        $msg_and_log("info", `答题完成，将等待 ${stopSecondWhenFinish} 秒后进行保存或提交。`);
        await $.sleep(stopSecondWhenFinish * 1e3);
        if (worker.isClose) {
          return;
        }
        await worker.uploadHandler({
          type: upload,
          results,
          async callback(finishedRate, uploadable) {
            const content = `完成率 ${finishedRate.toFixed(2)}% :  ${uploadable ? "3秒后将自动提交" : "3秒后将自动跳过（没保存按钮）"} `;
            $console.info(content);
            lib.$message.success({ content, duration: type === "chapter-test" ? 10 : 0 });
            await $.sleep(3e3);
            if (worker.isClose) {
              return;
            }
            if (uploadable) {
              BackgroundProject.scripts.render.methods.minimize();
              BackgroundProject.scripts.render.methods.setPosition(100, 200);
              const sumbit = document.querySelector(".j-submit");
              if (sumbit) {
                await rp.click(sumbit);
              } else {
                $msg_and_log("warn", "没有找到提交按钮，将跳过提交。");
              }
            }
          }
        });
      } else {
        lib.$message.success({ content: "作业/考试完成，请自行检查后保存或提交。", duration: 0 });
      }
      worker.emit("done");
    }).catch((err) => {
      lib.$message.error({ content: "答题程序发生错误 : " + err.message, duration: 0 });
    });
    return worker;
  }
  function chapter_v2(rp, { answererWrappers, redundanceWordsText, upload, stopSecondWhenFinish, answerSeparators }) {
    const titleTransform = (titles) => {
      const images = [];
      const text2 = removeRedundantWords(
        titles.filter((t2) => (t2 == null ? void 0 : t2.innerText) || (t2 == null ? void 0 : t2.querySelector("img"))).map((t2) => {
          if (t2) {
            const extracted = extractTextWithImages(t2);
            images.push(...extracted.images);
            return extracted.text.replace(/\s+/g, " ").trim() || "";
          }
          return "";
        }).filter((t2) => t2.trim() !== "").join(",").replace(/[\u200A-\u200F]/g, ""),
        redundanceWordsText.split("\n")
      );
      return { text: text2, images };
    };
    const titleText = (titles) => titleTransform(titles).text;
    const worker = new OCSWorker({
      root: '[data-testid="lesson-quiz-unit"] article',
      elements: {
        title: ".lesson-quiz-question-rich-text",
        options: "label.cursor-pointer"
      },
      thread: 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2, _ctx) => titleTransform(elements2.title),
        optionsTransform: (elements2, ctx) => {
          const optResults = ctx.elements.options.map((o) => extractTextWithImages(o));
          return {
            text: optResults.map((r) => r.text).join("\n"),
            images: optResults.flatMap((r) => r.images)
          };
        },
        answererWrappers,
        period: 5
      }),
      work: {
        optionText: (o) => extractTextWithImages(o).text,
        async handler(type, answer, option) {
          var _a;
          if (type === "judgement" || type === "single" || type === "multiple") {
            const input = option.querySelector("input");
            if (input && !(input == null ? void 0 : input.checked)) {
              await $.sleep(1e3);
              await rp.click(option);
            }
          } else if (type === "completion" && answer.trim()) {
            const textarea = option.querySelector("textarea");
            const id = ((_a = textarea == null ? void 0 : textarea.getAttribute("id")) == null ? void 0 : _a.toString()) || "";
            if (id && (textarea == null ? void 0 : textarea.value.trim()) !== answer.trim()) {
              await $.sleep(1e3);
              await rp.click("#" + id);
              await rp.fill("#" + id, answer.trim());
            }
          }
        }
      },
      async onResultsInit(_curr, _index, res) {
        await CommonProject.scripts.workResults.methods.fillAll(res.map((r, i) => simplifyWorkResult(r, titleText, i)));
      },
      async onResultsUpdate(curr, index, res) {
        await CommonProject.scripts.workResults.methods.update(index, simplifyWorkResult(curr, titleText, index));
      }
    });
    worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug }).then(async (results) => {
      if (worker.isClose) {
        return;
      }
      $msg_and_log("info", `答题完成，将等待 ${stopSecondWhenFinish} 秒后进行保存或提交。`);
      await $.sleep(stopSecondWhenFinish * 1e3);
      if (worker.isClose) {
        return;
      }
      await worker.uploadHandler({
        type: upload,
        results,
        async callback(finishedRate, uploadable) {
          const content = `完成率 ${finishedRate.toFixed(2)}% :  ${uploadable ? "3秒后将自动提交" : "3秒后将自动跳过（没保存按钮）"} `;
          $console.info(content);
          lib.$message.success({ content, duration: 10 });
          await $.sleep(3e3);
          if (worker.isClose) {
            return;
          }
          if (uploadable) {
            BackgroundProject.scripts.render.methods.minimize();
            BackgroundProject.scripts.render.methods.setPosition(100, 200);
            const sumbit = Array.from(document.querySelectorAll("button.bg-primary-600")).find(
              (e) => (e.textContent || "") === "提交"
            );
            if (sumbit) {
              await rp.click(sumbit);
            } else {
              $msg_and_log("warn", "没有找到提交按钮，将跳过提交。");
            }
          }
        }
      });
      worker.emit("done");
    }).catch((err) => {
      lib.$message.error({ content: "答题程序发生错误 : " + err.message, duration: 0 });
    });
    return worker;
  }
  async function watchMedia(playbackRate2, volume2) {
    return new Promise((resolve, reject) => {
      waitForMedia().then((video) => {
        video.playbackRate = playbackRate2;
        video.volume = volume2;
        state$1.currentMedia = video;
        playMedia(() => video == null ? void 0 : video.play());
        video.onpause = async () => {
          if (!(video == null ? void 0 : video.ended)) {
            video == null ? void 0 : video.play();
          }
        };
        video.onended = () => {
          resolve();
        };
      }).catch(reject);
    });
  }
  async function readPPT(remotePage, readSpeed2) {
    var _a, _b, _c, _d;
    const reader = document.querySelector(".ux-pdf-reader");
    if (reader) {
      const total = parseInt(
        ((_c = (_b = (_a = document.querySelector(".ux-h5pdfreader_container_footer_pages_total")) == null ? void 0 : _a.childNodes[1]) == null ? void 0 : _b.textContent) == null ? void 0 : _c.replace(/\s/, "")) || "0"
      );
      const start2 = parseInt(
        ((_d = document.querySelector(".ux-h5pdfreader_container_footer_pages_in")) == null ? void 0 : _d.value) || "1"
      );
      for (let index = start2; index < total + 1; index++) {
        const next2 = document.querySelector(".ux-h5pdfreader_container_footer_pages_next");
        if (next2) {
          await remotePage.click(next2);
        } else {
          $msg_and_log("error", "未找到PPT的下一页按钮！");
          return;
        }
        await $.sleep(readSpeed2 * 1e3);
      }
    }
  }
  async function readPPT_v2(remotePage, readSpeed2) {
    var _a, _b;
    const reader = document.querySelector(".pdf-unit-renderer");
    if (reader) {
      const [start2, total] = ((_b = (_a = document.querySelector(".mooc-docs-reader__page-status")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.split("/").map((s) => parseInt(s.trim()))) || [0, 0];
      for (let index = start2; index < total + 1; index++) {
        const next2 = document.querySelector('button[aria-label="下一页"]');
        if (next2) {
          await remotePage.click(next2);
        } else {
          $msg_and_log("error", "未找到PPT的下一页按钮！");
          return;
        }
        await $.sleep(readSpeed2 * 1e3);
      }
    }
  }
  async function discussion(remotePage, discussionStrategy2) {
    var _a, _b, _c, _d, _e, _f;
    if (discussionStrategy2 === "not-reply") {
      return $msg_and_log("warn", "讨论自动回复功能已关闭（上方菜单栏-中国大学MOOC-学习脚本中开启）。");
    }
    let res = "";
    if (discussionStrategy2 === "max-show-up") {
      const list = Array.from(document.querySelectorAll(".j-reply-all .f-pr .j-content"));
      const mapping = /* @__PURE__ */ new Map();
      for (const item of list) {
        mapping.set(item.textContent, (mapping.get(item.textContent) || 0) + 1);
      }
      const content = (_b = (_a = [...mapping.entries()].sort((a, b) => b[1] - a[1])) == null ? void 0 : _a[0]) == null ? void 0 : _b[0];
      if (!content) {
        $msg_and_log("error", "读取出现最多评论失败！");
      }
      res = content;
    } else if (discussionStrategy2 === "max-fav") {
      const list = Array.from(document.querySelectorAll(".j-reply-all .f-pr"));
      let max = 0;
      let maxEl = list[0];
      for (const item of list) {
        const num = parseInt(((_c = item.querySelector(".bar .num")) == null ? void 0 : _c.textContent) || "0");
        if (num > max) {
          max = num;
          maxEl = item;
        }
      }
      const content = ((_d = maxEl == null ? void 0 : maxEl.querySelector(".j-content")) == null ? void 0 : _d.textContent) || "";
      if (!content) {
        $msg_and_log("error", "读取最多点赞评论失败！");
      }
      res = content;
    } else if (discussionStrategy2 === "random") {
      const list = Array.from(document.querySelectorAll(".j-reply-all .f-pr .j-content"));
      const content = ((_e = list[Math.floor(Math.random() * list.length)]) == null ? void 0 : _e.textContent) || "";
      if (!content) {
        $msg_and_log("error", "读取随机评论失败！");
      }
      res = content;
    } else if (discussionStrategy2 === "use-newest") {
      const content = ((_f = document.querySelector(".j-reply-all .f-pr .first .j-content")) == null ? void 0 : _f.textContent) || "";
      if (!content) {
        $msg_and_log("error", "读取最新评论失败！");
      }
      res = content;
    }
    const p = document.querySelector(".j-reply-add div.ql-editor.ql-blank p");
    if (p) {
      p.innerText = res;
      await $.sleep(1e3);
      const submit = document.querySelector(".j-reply-add .editbtn");
      if (submit) {
        await remotePage.click(submit);
        lib.$message.info("提交回复成功！");
      } else {
        $msg_and_log("error", "获取提交按钮失败！");
      }
      await $.sleep(2e3);
    } else {
      $msg_and_log("error", "获取评论输入框失败！");
    }
  }
  async function discussion_v2(remotePage, discussionStrategy2) {
    var _a, _b, _c, _d;
    if (discussionStrategy2 === "not-reply") {
      return $msg_and_log("warn", "讨论自动回复功能已关闭（上方菜单栏-中国大学MOOC-学习脚本中开启）。");
    }
    let res = "";
    const text_list = Array.from(document.querySelectorAll("article.soft-shell.p-5 > p"));
    if (discussionStrategy2 === "max-show-up") {
      const mapping = /* @__PURE__ */ new Map();
      for (const item of text_list) {
        mapping.set(item.textContent, (mapping.get(item.textContent) || 0) + 1);
      }
      const content = (_b = (_a = [...mapping.entries()].sort((a, b) => b[1] - a[1])) == null ? void 0 : _a[0]) == null ? void 0 : _b[0];
      if (!content) {
        $msg_and_log("error", "读取出现最多评论失败！");
      }
      res = content;
    } else if (discussionStrategy2 === "max-fav") {
      const discussion_list = Array.from(document.querySelectorAll("article.soft-shell"));
      let max = 0;
      let maxEl = discussion_list[0];
      for (const item of discussion_list) {
        const num = parseInt(((_c = item.querySelector('button[aria-label="赞同"]')) == null ? void 0 : _c.textContent) || "0");
        if (num > max) {
          max = num;
          maxEl = item;
        }
      }
      const content = ((_d = maxEl == null ? void 0 : maxEl.querySelector("p.whitespace-pre-wrap")) == null ? void 0 : _d.textContent) || "";
      if (!content) {
        $msg_and_log("error", "读取最多点赞评论失败！");
      }
      res = content;
    } else if (discussionStrategy2 === "random") {
      const content = text_list[Math.floor(Math.random() * text_list.length)].textContent || "";
      if (!content) {
        $msg_and_log("error", "读取随机评论失败！");
      }
      res = content;
    } else if (discussionStrategy2 === "use-newest") {
      const content = text_list[0].textContent || "";
      if (!content) {
        $msg_and_log("error", "读取最新评论失败！");
      }
      res = content;
    }
    const p = document.querySelector(".ql-editor p");
    const submit = document.querySelector('#forum-reply-form button[type="submit"]');
    if (p && submit) {
      p.innerText = res;
      await $.sleep(1e3);
      if (submit) {
        await remotePage.click(submit);
        lib.$message.info("提交回复成功！");
      } else {
        $msg_and_log("error", "获取提交按钮失败！");
      }
      await $.sleep(2e3);
    } else {
      $msg_and_log("error", "获取评论输入框失败！");
    }
  }
  async function networkIdleRequire(rp, cb) {
    await cb();
    const modal2 = await waitFor(() => document.querySelector(".ux-modal_content_content"), {
      check_period_ms: 200,
      timeout_seconds: 1
    }).catch(() => void 0);
    if (modal2) {
      const msg = lib.$message.warn("答题速度过快导致并发限制、3秒后再继续答题。");
      await rp.click(".ux-modal-btn");
      await $.sleep(3e3);
      await cb();
      msg == null ? void 0 : msg.remove();
    }
  }
  const YKT_EXAM_REF_TABLE_URL = "https://cdn.ocsjs.com/resources/font/font_ref_yuketang.bin";
  const state = {
    study: {
      currentMedia: void 0,
      is_ai_watch_mode: false
    }
  };
  const YKTProject = lib.Project.create({
    name: "雨课堂",
    domains: [
      "yuketang.cn",
      "xuetangx.com",
      "gdufemooc.cn"
    ],
    scripts: {
      guide: new lib.Script({
        name: "💡 使用提示",
        matches: [
          ["雨课堂课程列表", "/v2/web/index"],
          ["学习内容界面", "/v2/web/studentLog"],
          ["长江雨课堂手机版主页", "/m/v2/course/normalcourse/logs"],
          ["课堂界面", "/v2/web/student-lesson-report"]
        ],
        namespace: "yuketang.study.guide",
        configs: {
          notes: {
            defaultValue: createSteps(["登录网课平台", "点击课程中任意章节进入学习", "等待脚本自动运行"]).outerHTML
          }
        },
        oncomplete(...args) {
          if (location.href.includes("/m/v2/course/normalcourse/logs")) {
            return lib.$message.info("请点击任意视频，进入自动学习。");
          }
          if (location.href.includes("/v2/web/student-lesson-report")) {
            return lib.$message.info("课堂任务不支持学习，请切换到视频、作业等任务。");
          }
        }
      }),
      global: new lib.Script({
        name: "全局脚本",
        matches: [["全部界面", /.*/]],
        hideInPanel: true,
        onstart(...args) {
          const _removeChild = Element.prototype.removeChild;
          Element.prototype.removeChild = function(e) {
            if (e.nodeName === "DIV") {
              if (lib.$elements.wrapper && e === lib.$elements.wrapper) {
                lib.$elements.wrapper.removeAttribute("style");
                return e;
              }
            }
            _removeChild.call(this, e);
            return e;
          };
        }
      }),
      upsupportNote: new lib.Script({
        name: "不支持提示",
        matches: [["课堂界面", "/v2/web/student-lesson-report"]],
        hideInPanel: true,
        oncomplete() {
        }
      }),
      ppt: new lib.Script({
        name: "📚 PPT自动阅读",
        matches: [["PPT界面", /v2\/web\/studentCards\/.*\/ppt/]],
        hideInPanel: true,
        async oncomplete() {
          lib.$message.info("正在学习PPT中，请耐心等待...");
          for (const item of Array.from(document.querySelectorAll(".swiper-container .container")).filter(
            (el) => !!el.querySelector(".noRead")
          )) {
            await lib.$.sleep(1e3);
            item.click();
          }
          lib.$message.info({ content: "PPT阅读完毕，请手动切换到下一个任务", duration: 0 });
        }
      }),
      ai: new lib.Script({
        name: "🖥️ 课程学习",
        matches: [
          ["学习中心", "/v2/web/index"],
          ["课程列表", "/v2/web/studentLog"],
          ["AI学伴课程界面", "/ai-workspace/lms-graph"],
          ["AI学伴课程界面手机版", "/ai-workspace/lms-graph-mobile"]
        ],
        namespace: "yuketang.study.ai",
        configs: {
          notes: {
            defaultValue: lib.$ui.notes([
              "请点击任意小节，脚本会自动运行，并自动下一节。",
              "修改音量、倍速后请刷新页面使设置生效。",
              "课件/PPT 等任务请手动进入触发自动阅读",
              ["遇到作业任务点时可自动搜题作答", "（需在 通用-全局设置 中配置题库）。"]
            ]).outerHTML
          },
          restudy,
          problemWork: {
            label: "作业自动答题",
            attrs: { type: "checkbox", title: "遇到作业任务点时自动搜题作答并按设置提交（需配置题库）" },
            defaultValue: true
          },
          discussMode: {
            label: "讨论任务模式",
            tag: "select",
            defaultValue: "random",
            options: [
              ["random", "随机采用他人评论"],
              ["first", "采用第一条评论"],
              ["none", "不评论"]
            ]
          },
          volume,
          playbackRate: {
            label: "视频倍速",
            tag: "select",
            defaultValue: 1,
            options: [
              ["1", "1 x"],
              ["1.25", "1.25 x"],
              ["1.5", "1.5 x"],
              ["2.0", "2.0 x"]
            ]
          }
        },
        async oncomplete() {
          if (location.href.includes("ai-workspace/lms-graph-mobile")) {
            lib.$message.warn("即将切换到电脑版AI课程...");
            await lib.$.sleep(3e3);
            location.href = location.href.replace("lms-graph-mobile", "lms-graph");
            return;
          }
          if (location.href.includes("/v2/web/index") || location.href.includes("/v2/web/studentLog")) {
            BackgroundProject.scripts.render.methods.pin(this);
            lib.$message.info("请手动进入到任意章节开始自动学习。");
            return;
          }
          this.onConfigChange(
            "volume",
            debounce_1$1((val) => {
              if (state.study.is_ai_watch_mode) {
                if (state.study.currentMedia)
                  state.study.currentMedia.volume = val;
              } else {
                lib.$message.info("音量设置已修改，刷新页面后生效");
              }
            }, 200)
          );
          this.onConfigChange(
            "playbackRate",
            debounce_1$1((val) => {
              if (state.study.is_ai_watch_mode) {
                if (state.study.currentMedia)
                  state.study.currentMedia.playbackRate = val;
              } else {
                lib.$message.info("倍速设置已修改，刷新页面后生效");
              }
            }, 200)
          );
          const getJobs = () => Array.from(document.querySelectorAll("div.leaf-item"));
          const getJobName = () => {
            var _a;
            return ((_a = document.querySelector(".leaf-item.is-active .leaf-item-title")) == null ? void 0 : _a.textContent) || "未知任务点";
          };
          const getJobTag = (el) => {
            var _a;
            return (((_a = el.querySelector(".leaf-item-tag")) == null ? void 0 : _a.textContent) || "").trim();
          };
          const getNextJob = () => {
            const jobs = getJobs();
            const active_index = jobs.findIndex((job) => job.classList.contains("is-active"));
            return jobs.find((job, i) => {
              const tag_text = getJobTag(job);
              const support = ["视频", "作业", "讨论", "图文"].includes(tag_text.trim());
              const finished = job.querySelector("[class*=yuanquangou]");
              return i > active_index && support && (this.cfg.restudy || !finished);
            });
          };
          try {
            lib.$message.info("等待任务加载中...");
            await waitForElement(".detail-container", {
              timeout_seconds: 10 * 1e3
            });
            await lib.$.sleep(3e3);
          } catch (e) {
            lib.$message.error("元素加载失败，请刷新界面重试。");
          }
          const max_level = 5;
          for (let i = 0; i < max_level; i++) {
            document.querySelectorAll(".nav-item-title:not(.is-expand )").forEach((el) => el.click());
            await lib.$.sleep(100);
          }
          const study2 = async () => {
            try {
              if (lib.$el(".detail-container video")) {
                $msgwc.info("即将开始视频学习：" + getJobName());
                if (document.querySelector(".digital-human-video-element-selector")) {
                  await ai_watch({
                    volume: this.cfg.volume,
                    playbackRate: this.cfg.playbackRate
                  });
                } else {
                  await watch({
                    volume: this.cfg.volume,
                    playbackRate: this.cfg.playbackRate
                  });
                }
                await lib.$.sleep(3e3);
              }
              const forum = lib.$el(".detail-container .lms-graph-forum");
              if (forum) {
                $msgwc.info("即将开始自动讨论：" + getJobName());
                await autoCommentYktForum(forum, this.cfg.discussMode);
                $msgwc.success("自动讨论完成");
                await lib.$.sleep(3e3);
              }
              if (lib.$el(".detail-container .lms-graph-exercise")) {
                if (this.cfg.problemWork) {
                  const exerciseIframe = lib.$el(".detail-container .lms-graph-exercise iframe#iframeExerciseId");
                  if (!exerciseIframe) {
                    $console.warn("作业任务点结构未识别（缺少 iframe#iframeExerciseId），跳过自动答题。");
                  } else if (!exerciseIframe.contentDocument) {
                    $console.warn("作业 iframe 无法访问（可能跨域），跳过自动答题。");
                  } else {
                    lib.$message.info("检测到作业任务点，等待作业页面加载...");
                    const questionRoot = await waitForElement(
                      () => {
                        var _a;
                        return (_a = exerciseIframe.contentDocument) == null ? void 0 : _a.querySelector(".container-problem .subject-item");
                      },
                      { timeout_seconds: 20, check_period_ms: 200 }
                    ).catch(() => void 0);
                    if (!questionRoot) {
                      $console.warn("作业页面加载超时，跳过自动答题。");
                    } else {
                      await new Promise((resolve) => {
                        commonWork({
                          mount_script: this,
                          workerProvider: (opts) => {
                            return createYktEmbeddedWorkLoop(opts, exerciseIframe.contentDocument, () => resolve());
                          }
                        });
                      });
                      lib.$message.success("作业任务点答题完成。");
                    }
                  }
                }
                await lib.$.sleep(3e3);
              }
            } catch (e) {
              $console.error(`当前任务点无法完成，即将跳转下一节（${e}）`);
              lib.$message.error(`当前任务点无法完成，即将跳转下一节（${e}）`);
            }
            const next2 = getNextJob();
            if (!next2) {
              return lib.$modal.alert({
                content: "检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。"
              });
            }
            next2.click();
            await lib.$.sleep(200);
            next2.scrollIntoView({ behavior: "smooth", block: "center" });
            await lib.$.sleep(3e3);
            study2();
          };
          study2();
        }
      }),
      exam: new lib.Script({
        name: "自动考试",
        matches: [["考试界面", "examination.xuetangx.com/exam/"]],
        namespace: "yuketang.study.exam",
        configs: {
          notes: workNotes$1
        },
        async onhistorychanged(type, ...args) {
          if (type !== "pushed")
            return;
          await waitForElement(".exam-main--content .subject-item");
          commonWork({
            mount_script: this,
            workerProvider: (opts) => examination(opts)
          });
        },
        async oncomplete() {
          var _a;
          (_a = this.onhistorychanged) == null ? void 0 : _a.call(this, "pushed");
        }
      })
    }
  });
  async function autoCommentYktForum(forum, discussMode) {
    var _a, _b;
    const speakStatus = (_b = (_a = forum.querySelector(".learning-space-control-unit .control-right .f12")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
    if (speakStatus == null ? void 0 : speakStatus.includes("已发言")) {
      lib.$message.info("当前讨论已发言，跳过评论步骤。");
      return;
    }
    if (discussMode === "none") {
      lib.$message.info("已设置为不进行评论，跳过评论步骤。");
      return;
    }
    const textarea = await waitForElement(
      () => forum.querySelector(".forum-publish textarea.el-textarea__inner"),
      { timeout_seconds: 20, check_period_ms: 500, timeout_message: "讨论区输入框加载超时。" }
    );
    const discusses = Array.from(forum.querySelectorAll(".forum-content .forum-item .comment-text")).map((el) => (el.textContent || "").trim()).filter(Boolean);
    if (discusses.length === 0) {
      throw new Error("讨论区暂无评论可参考，无法自动评论。");
    }
    const content = discussMode === "first" ? discusses[0] : discusses[Math.floor(Math.random() * discusses.length)];
    textarea.value = content;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    const send_btn = await waitForElement(() => forum.querySelector(".prompt-send-btn:not(.disabled)"), {
      timeout_seconds: 10,
      check_period_ms: 500,
      timeout_message: "讨论区发送按钮未解除禁用，评论提交失败。"
    });
    send_btn.click();
    await lib.$.sleep(1e3);
  }
  const YKT_ENCRYPTED_SELECTOR = ".xuetangx-com-encrypted-font";
  const fontDecryptors = /* @__PURE__ */ new Map();
  let fontWatchController;
  async function setupYuketangFontDecrypt(doc = document) {
    fontWatchController == null ? void 0 : fontWatchController.stop();
    fontWatchController = void 0;
    const dec_msg = lib.$message.info({ content: "字体解密中...", duration: 0 });
    const waitStart = Date.now();
    let noCipherStable = 0;
    while (!doc.querySelector(YKT_ENCRYPTED_SELECTOR) && Date.now() - waitStart < 3e3) {
      const bodyRendered = !!doc.querySelector(".container-problem .problem-body, .exam-body, .subject-item");
      noCipherStable = bodyRendered ? noCipherStable + 1 : 0;
      if (noCipherStable >= 3) {
        $console.log("题目已渲染且未检测到加密文字，跳过初始解密等待。");
        break;
      }
      await lib.$.sleep(200);
    }
    if (!doc.querySelector(YKT_ENCRYPTED_SELECTOR)) {
      $console.log("暂未检测到加密文字，将持续监听页面变化。");
      dec_msg == null ? void 0 : dec_msg.remove();
    }
    let firstDecrypt = true;
    const decryptEls = async (els) => {
      var _a, _b;
      els = els.filter((el) => el.classList.contains("xuetangx-com-encrypted-font"));
      if (els.length === 0) {
        return;
      }
      for (const el of els) {
        el.classList.remove("xuetangx-com-encrypted-font");
        el.classList.add("xuetangx-com-font-decrypting");
      }
      const markFailed = (groupEls) => {
        for (const el of groupEls) {
          el.classList.remove("xuetangx-com-font-decrypting");
          el.classList.add("xuetangx-com-font-decrypt-failed");
        }
      };
      const findExamFontUrl = () => {
        const faces = listFontFaces(doc);
        const face = faces.find((f) => /exam|decrypt/i.test(f.family) || /exam_font|fe_font/.test(f.src));
        if (face) {
          return face.src;
        }
        return findFontUrls(doc).find((u) => /exam_font|fe_font/.test(u));
      };
      let examFontUrl = findExamFontUrl();
      const fontWaitStart = Date.now();
      while (!examFontUrl && Date.now() - fontWaitStart < 1e4) {
        await lib.$.sleep(300);
        examFontUrl = findExamFontUrl();
      }
      if (!examFontUrl) {
        $console.warn(
          `[font-decrypt] 等待考试字体超时（@font-face=[${listFontFaces(doc).map((f) => f.family).join(", ")}], 字体文件=[${findFontUrls(doc).join(", ")}]），跳过解密。`
        );
        markFailed(els);
        return;
      }
      const resolveFontSource = (family) => {
        var _a2, _b2;
        const faces = listFontFaces(doc);
        return (_b2 = (_a2 = faces.find((f) => family.includes(f.family) || f.family.includes(family))) == null ? void 0 : _a2.src) != null ? _b2 : examFontUrl;
      };
      const groups = /* @__PURE__ */ new Map();
      for (const el of els) {
        const view = (_a = el.ownerDocument.defaultView) != null ? _a : window;
        const family = (view.getComputedStyle(el).fontFamily || "").split(",")[0].replace(/["']/g, "").trim();
        const group = (_b = groups.get(family)) != null ? _b : [];
        group.push(el);
        groups.set(family, group);
      }
      for (const [family, groupEls] of groups) {
        const fontSource = resolveFontSource(family);
        if (!fontSource) {
          $console.warn(`[font-decrypt] 未找到字体 ${family} 对应的字体文件，跳过解密。`);
          markFailed(groupEls);
          continue;
        }
        try {
          let decryptor = fontDecryptors.get(fontSource);
          if (!decryptor) {
            decryptor = await FontDecryptor.create(fontSource, {
              refTableUrl: YKT_EXAM_REF_TABLE_URL,
              fontWeight: "250"
            });
            fontDecryptors.set(fontSource, decryptor);
          }
          await decryptor.decrypt(groupEls);
          for (const el of groupEls) {
            el.classList.remove("xuetangx-com-font-decrypting");
            el.classList.add("xuetangx-com-font-decrypted");
          }
          if (firstDecrypt) {
            firstDecrypt = false;
            if (dec_msg)
              dec_msg.textContent = "字体解密完成，切换题目时将自动解密新内容。";
          }
        } catch (err) {
          $console.error(`[font-decrypt] 字体 ${family} 解密失败：`, String(err));
          markFailed(groupEls);
        }
      }
      setTimeout(() => {
        dec_msg == null ? void 0 : dec_msg.remove();
      }, 3e3);
    };
    activeDecryptHandler = decryptEls;
    fontWatchController = watchElements(doc, YKT_ENCRYPTED_SELECTOR, (found) => enqueueYktDecrypt(found));
    $console.log("字体动态解密已启动。");
  }
  let activeDecryptHandler;
  let decryptChain = Promise.resolve();
  function enqueueYktDecrypt(els) {
    const run = decryptChain.then(() => activeDecryptHandler == null ? void 0 : activeDecryptHandler(els));
    decryptChain = run.then(
      () => void 0,
      () => void 0
    );
    return run;
  }
  async function decryptYktNow(doc) {
    await ensureYktFontDecrypt(doc);
    const els = Array.from(doc.querySelectorAll(YKT_ENCRYPTED_SELECTOR));
    if (els.length) {
      await enqueueYktDecrypt(els);
    }
    await decryptChain;
  }
  let fontDecryptSetupPromise;
  let fontDecryptSetupDoc;
  function ensureYktFontDecrypt(doc = document) {
    if (!fontDecryptSetupPromise || fontDecryptSetupDoc !== doc) {
      fontDecryptSetupDoc = doc;
      fontDecryptSetupPromise = setupYuketangFontDecrypt(doc).catch((err) => {
        fontDecryptSetupPromise = void 0;
        fontDecryptSetupDoc = void 0;
        throw err;
      });
    }
    return fontDecryptSetupPromise;
  }
  function parseYktQuestionType(typeText) {
    if (typeText.includes("单选")) {
      return "single";
    }
    if (typeText.includes("多选")) {
      return "multiple";
    }
    if (typeText.includes("判断")) {
      return "judgement";
    }
    if (typeText.includes("填空") || typeText.includes("简答") || typeText.includes("问答") || typeText.includes("主观")) {
      return "completion";
    }
    return void 0;
  }
  function currentYktQuestionMarker(doc) {
    var _a, _b, _c;
    return (_c = (_b = (_a = doc.querySelector(".container-problem .subject-item .item-type")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.replace(/\s+/g, "")) != null ? _c : "";
  }
  function fillYktUEditor(iframe, answer) {
    var _a, _b, _c;
    const html2 = "<p>" + answer.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n+/g, "</p><p>") + "</p>";
    const containerId = (_a = iframe.closest('[id^="ueditor-"]')) == null ? void 0 : _a.id;
    const ue = (_b = iframe.ownerDocument.defaultView) == null ? void 0 : _b.UE;
    if (containerId && ue) {
      try {
        const editor = ue.getEditor(containerId);
        editor.ready(() => editor.setContent(html2));
        return;
      } catch (err) {
        $console.warn("[answer] UEditor API 填充失败，尝试直接写入：", String(err));
      }
    }
    const body = (_c = iframe.contentDocument) == null ? void 0 : _c.body;
    if (body) {
      body.innerHTML = html2;
      body.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
  async function submitYktCurrentQuestion(doc, order) {
    const hasStatusMark = () => {
      var _a, _b;
      const item = doc.querySelector(`.problems-aside .subject-item.J_order[data-order="${order}"]`);
      return !!(item == null ? void 0 : item.querySelector(".icon-status")) || !!((_b = (_a = item == null ? void 0 : item.querySelector(".text-status")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.includes("未批改"));
    };
    for (let attempt = 0; attempt < 2; attempt++) {
      const submitBtn = Array.from(
        doc.querySelectorAll(".problem-box button.el-button--primary")
      ).find((b) => {
        var _a;
        return ((_a = b.textContent) == null ? void 0 : _a.trim().includes("提交")) && !b.disabled && !b.classList.contains("is-disabled");
      });
      if (!submitBtn) {
        return attempt > 0 ? hasStatusMark() : false;
      }
      submitBtn.click();
      await lib.$.sleep(1e3);
      const waitStart = Date.now();
      while (Date.now() - waitStart < 1e4) {
        if (hasStatusMark()) {
          return true;
        }
        await lib.$.sleep(300);
      }
    }
    $console.error("未检测到完成状态。");
    return false;
  }
  async function waitYktQuestionReady(prevMarker, doc, timeoutMs = 15e3) {
    var _a;
    const start2 = Date.now();
    while (Date.now() - start2 < timeoutMs) {
      const marker = currentYktQuestionMarker(doc);
      if (marker && marker !== prevMarker) {
        break;
      }
      await lib.$.sleep(200);
    }
    let stable = 0;
    while (Date.now() - start2 < timeoutMs) {
      await decryptYktNow(doc);
      const body = doc.querySelector(".container-problem .problem-body");
      const hasContent = !!((_a = body == null ? void 0 : body.textContent) == null ? void 0 : _a.trim()) || !!(body == null ? void 0 : body.querySelector("img"));
      const hasCipher = !!doc.querySelector(
        `.container-problem ${YKT_ENCRYPTED_SELECTOR}, .container-problem .xuetangx-com-font-decrypting`
      );
      if (hasContent && !hasCipher) {
        stable++;
        if (stable >= 2) {
          return;
        }
      } else {
        stable = 0;
      }
      await lib.$.sleep(200);
    }
    $console.warn(`[answer] 等待题目就绪超时（${timeoutMs}ms），将就绪状态降级继续。`);
  }
  const YKT_BLANK_INPUT_SELECTOR = 'input.blank-item-dynamic, input[placeholder="输入答案"]';
  function cloneYktForTextExtract(el) {
    const clone2 = el.cloneNode(true);
    for (const img of Array.from(clone2.querySelectorAll("img.kfformula"))) {
      const latex = img.getAttribute("data-latex") || (img.getAttribute("data-slatex") || "").replace(/\\\\/g, "\\");
      img.replaceWith(latex.trim() ? ` $${latex}$ ` : " [公式] ");
    }
    return clone2;
  }
  function extractYktTitleText(el) {
    const clone2 = cloneYktForTextExtract(el);
    for (const input of Array.from(clone2.querySelectorAll(YKT_BLANK_INPUT_SELECTOR))) {
      input.replaceWith("____");
    }
    return extractTextWithImages(clone2).text;
  }
  function createYktAnswerWorker({
    answererWrappers,
    period,
    thread,
    redundanceWordsText,
    answerSeparators
  }) {
    const redundanceWords = redundanceWordsText.split("\n").filter(Boolean);
    const titleTransform = (titles) => titles.filter((t2) => {
      var _a;
      return !!t2 && (!!((_a = t2.textContent) == null ? void 0 : _a.trim()) || !!t2.querySelector("img"));
    }).map(
      (t2) => t2 ? removeRedundantWords(
        StringUtils.of(extractYktTitleText(t2)).nowrap(" ").nospace().toString().trim(),
        redundanceWords
      ) : ""
    ).join(",");
    const optionText = (option) => {
      const input = option.querySelector("input");
      if ((input == null ? void 0 : input.value) === "true") {
        return "对";
      }
      if ((input == null ? void 0 : input.value) === "false") {
        return "错";
      }
      const textEl = option.querySelector(".radioText, .checkboxText");
      return extractTextWithImages(cloneYktForTextExtract(textEl != null ? textEl : option)).text;
    };
    const questionRootRef = [];
    const worker = new OCSWorker({
      root: questionRootRef,
      rootObserver: {
        enabled: true,
        onRootLost: () => {
          CommonProject.scripts.workResults.methods.clearResults();
        }
      },
      elements: {
        title: (root2) => {
          const pb = lib.$$el(".problem-body", root2);
          return pb.length ? pb : lib.$$el(".item-body > div", root2).slice(0, 1);
        },
        type: ".item-type",
        options: (root2) => {
          const labels = lib.$$el('ul[class*="list-unstyled"] li label', root2);
          if (labels.length) {
            return labels;
          }
          const editors = lib.$$el('iframe[id^="ueditor_"]', root2);
          if (editors.length) {
            return editors;
          }
          const blanks = lib.$$el(YKT_BLANK_INPUT_SELECTOR, root2);
          return blanks.length ? blanks : lib.$$el("textarea", root2);
        }
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2) => titleTransform(elements2.title),
        optionsTransform: (elements2, ctx) => {
          var _a, _b, _c, _d;
          ctx.type = parseYktQuestionType((_c = (_b = (_a = elements2.type) == null ? void 0 : _a[0]) == null ? void 0 : _b.textContent) != null ? _c : "");
          if (ctx.type === "completion") {
            return "";
          }
          return ((_d = elements2.options) != null ? _d : []).map((o) => optionText(o)).join("\n");
        },
        answererWrappers,
        period
      }),
      work: async (ctx) => {
        var _a, _b, _c;
        const type = (_b = (_a = ctx.type) != null ? _a : defaultWorkTypeResolver(ctx)) != null ? _b : "single";
        const resolver = createDefaultQuestionResolver(ctx, (o) => optionText(o))[type];
        if (!resolver) {
          return { finish: false };
        }
        return await resolver(
          ctx.searchInfos,
          (_c = ctx.elements.options) != null ? _c : [],
          async (t2, answer, option) => {
            var _a2;
            if (t2 === "judgement" || t2 === "single" || t2 === "multiple") {
              if (option && !option.classList.contains("is-checked") && ((_a2 = option.querySelector("input")) == null ? void 0 : _a2.checked) !== true) {
                option.click();
                await lib.$.sleep(300);
              }
            } else if (t2 === "completion" && answer.trim()) {
              if ((option == null ? void 0 : option.tagName) === "IFRAME") {
                fillYktUEditor(option, answer);
                await lib.$.sleep(300);
              } else {
                const input = (option == null ? void 0 : option.tagName) === "TEXTAREA" || (option == null ? void 0 : option.tagName) === "INPUT" ? option : option == null ? void 0 : option.querySelector("textarea,input");
                if (input) {
                  input.value = answer;
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  await lib.$.sleep(200);
                }
              }
            }
          }
        );
      },
      onQuestionDetected(current) {
        updateDynamicResult(current, titleTransform);
      },
      onResultsUpdate(current, _, res) {
        updateDynamicResult(current, titleTransform);
      }
    });
    return { worker, questionRootRef };
  }
  async function waitYktCaptcha(doc) {
    const getCaptcha = () => doc.querySelector("#homework-automation-risk-challenge");
    if (!getCaptcha()) {
      return;
    }
    $console.warn("[answer] 检测到平台风控验证码，等待手动完成...");
    const message2 = lib.$message.warn({
      content: "检测到平台风控验证码，请手动完成验证，完成后将自动继续答题。",
      duration: 0
    });
    CommonProject.scripts.settings.methods.notificationBySetting(
      "雨课堂脚本：检测到平台风控验证码，请手动完成验证，完成后将自动继续答题。",
      { duration: 0 }
    );
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!getCaptcha()) {
          clearInterval(interval);
          resolve();
        }
      }, 1e3);
    });
    message2 == null ? void 0 : message2.remove();
    lib.$message.success("验证码已完成，继续自动答题。");
  }
  async function waitYktWorkConfirmDialog(doc) {
    const getDialog = () => {
      const els = Array.from(
        doc.querySelectorAll(".homework-problem-change-guard-dialog,.homework-problem-batch-submit-dialog")
      );
      if (els.some(
        (e) => {
          var _a;
          return ((_a = e == null ? void 0 : e.parentElement) == null ? void 0 : _a.classList.contains("el-dialog__wrapper")) && (e == null ? void 0 : e.parentElement.style.display) !== "none";
        }
      )) {
        return true;
      }
    };
    if (!getDialog()) {
      return;
    }
    $console.warn("[answer] 检测到作业存在未保存答案，等待手动确认...");
    const message2 = lib.$message.warn({
      content: "检测到作业存在未保存答案，请手动确认 。",
      duration: 0
    });
    CommonProject.scripts.settings.methods.notificationBySetting("雨课堂脚本：检测到作业存在未保存答案，请手动确认 。", {
      duration: 0
    });
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!getDialog()) {
          clearInterval(interval);
          resolve();
        }
      }, 1e3);
    });
    message2 == null ? void 0 : message2.remove();
  }
  async function runYktAnswerLoop(worker, questionRootRef, doc) {
    var _a, _b, _c;
    const allResults = [];
    try {
      await ensureYktFontDecrypt(doc);
    } catch (err) {
      $console.error("字体解密初始化失败：", String(err));
    }
    const getUnfinishedNavItems = () => Array.from(doc.querySelectorAll(".problems-aside .subject-item.J_order")).filter((el) => {
      var _a2, _b2;
      if (el.querySelector(".icon-status")) {
        return false;
      }
      if ((_b2 = (_a2 = el.querySelector(".text-status")) == null ? void 0 : _a2.textContent) == null ? void 0 : _b2.includes("未批改")) {
        return false;
      }
      return true;
    });
    const processedOrders = /* @__PURE__ */ new Set();
    const processedMarkers = /* @__PURE__ */ new Set();
    let prevMarker = null;
    let completedAll = false;
    while (worker.isClose === false) {
      await waitYktCaptcha(doc);
      if (worker.isClose) {
        break;
      }
      const unfinished = getUnfinishedNavItems().filter(
        (el) => {
          var _a2;
          return !processedOrders.has((_a2 = el.getAttribute("data-order")) != null ? _a2 : "");
        }
      );
      if (unfinished.length === 0) {
        completedAll = true;
        break;
      }
      let target = unfinished.find((n) => n.classList.contains("active"));
      if (!target) {
        target = unfinished[0];
        prevMarker = currentYktQuestionMarker(doc);
        target.click();
        await lib.$.sleep(1e3);
        await waitYktWorkConfirmDialog(doc);
      }
      await waitYktQuestionReady(prevMarker, doc);
      const marker = currentYktQuestionMarker(doc);
      if (marker && processedMarkers.has(marker)) {
        $console.warn(`[answer] 题目 "${marker}" 重复出现（切换失败或状态未刷新），终止作答以防死循环。`);
        break;
      }
      if (marker) {
        processedMarkers.add(marker);
      }
      const order = (_a = target.getAttribute("data-order")) != null ? _a : "";
      processedOrders.add(order);
      questionRootRef.splice(
        0,
        questionRootRef.length,
        ...Array.from(doc.querySelectorAll(".container-problem .subject-item"))
      );
      if (questionRootRef.length === 0) {
        break;
      }
      try {
        const results = await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
        allResults.push(...results);
        const finished = !!((_c = (_b = results[0]) == null ? void 0 : _b.result) == null ? void 0 : _c.finish);
        if (finished) {
          const submitted = await submitYktCurrentQuestion(doc, order);
          if (!submitted) {
            $console.warn(`[answer] 本题提交失败: ${marker}`);
          }
        }
        await lib.$.sleep(1e3);
        await waitYktWorkConfirmDialog(doc);
      } catch (err) {
        $console.error("[answer] 答题异常，终止作答：", String(err));
        break;
      }
    }
    return { results: allResults, completedAll };
  }
  function createYktEmbeddedWorkLoop(opts, doc, onDone) {
    CommonProject.scripts.workResults.methods.init({ dynamic: true });
    const { worker, questionRootRef } = createYktAnswerWorker(opts);
    dynamicWorkTips(worker);
    (async () => {
      const { results, completedAll } = await runYktAnswerLoop(worker, questionRootRef, doc);
      worker.emit("done");
      const finishCount = results.filter((r) => {
        var _a;
        return (_a = r.result) == null ? void 0 : _a.finish;
      }).length;
      if (!completedAll) {
        lib.$message.warn({
          content: `题目未全部完成（已作答提交 ${finishCount}/${results.length} 题），请手动检查剩余题目。`,
          duration: 60
        });
      } else {
        lib.$message.success({ content: `作业完成，全部 ${finishCount} 题已作答并逐题提交。` });
      }
      onDone();
    })();
    return worker;
  }
  async function watch(options) {
    const set = async () => {
      var _a;
      await lib.$.sleep(1e3);
      const video_vue_data = (_a = document.querySelector(".xtplayer")) == null ? void 0 : _a.__vue__;
      if (video_vue_data) {
        video_vue_data.player.options.speed.value = parseFloat(options.playbackRate.toString());
        video_vue_data.player.options.volume.value = options.volume;
        video_vue_data.player.init();
      }
      const media = await waitForElement("video", {
        timeout_seconds: 10 * 1e3,
        timeout_message: "视频元素加载超时"
      });
      console.log("media", media);
      await lib.$.sleep(1e3);
      state.study.currentMedia = media;
      media.currentTime = 1;
      return media;
    };
    lib.$message.info("开始播放");
    return new Promise((resolve, reject) => {
      let currentVideo;
      let videoCheckInterval;
      let failCount = 0;
      const clearCheckInterval = () => {
        if (videoCheckInterval !== void 0) {
          clearInterval(videoCheckInterval);
          videoCheckInterval = void 0;
        }
      };
      const bindEvents = (video) => {
        video.onpause = async () => {
          if (!video.ended) {
            await lib.$.sleep(1e3);
            video.play();
          }
        };
        video.onended = () => {
          clearCheckInterval();
          $msgwc.success("视频学习完成");
          resolve();
        };
      };
      const watch2 = async () => {
        try {
          const media = await set();
          if (!media) {
            failCount++;
            if (failCount >= 5) {
              reject(new Error("video not found!"));
              return;
            }
            lib.$message.info({ content: "未检测到视频，稍后重试..." });
            setTimeout(watch2, 3e3);
            return;
          }
          failCount = 0;
          currentVideo = media;
          bindEvents(media);
          playMedia(() => media.play());
          clearCheckInterval();
          videoCheckInterval = setInterval(() => {
            if ((currentVideo == null ? void 0 : currentVideo.isConnected) === false) {
              clearCheckInterval();
              lib.$message.info({ content: "检测到视频切换..." });
              resolve();
            }
          }, 3e3);
        } catch (e) {
          clearCheckInterval();
          reject(e);
        }
      };
      watch2();
    });
  }
  async function ai_watch(options) {
    const set = async () => {
      await lib.$.sleep(1e3);
      const media = await waitForElement(".detail-container video", {
        timeout_seconds: 10 * 1e3,
        timeout_message: "AI数字人视频元素加载超时"
      });
      console.log("media", media);
      await lib.$.sleep(1e3);
      state.study.currentMedia = media;
      state.study.is_ai_watch_mode = true;
      media.currentTime = 1;
      media.volume = options.volume;
      media.playbackRate = options.playbackRate;
      return state.study.currentMedia;
    };
    lib.$message.info("开始播放");
    const video = await set();
    if (!video) {
      throw new Error("video not found!");
    }
    return new Promise((resolve, reject) => {
      const videoCheckInterval = setInterval(async () => {
        if ((video == null ? void 0 : video.isConnected) === false) {
          clearInterval(videoCheckInterval);
          lib.$message.info({ content: "检测到视频切换中..." });
          resolve();
        }
      }, 3e3);
      playMedia(() => video == null ? void 0 : video.play());
      video.onpause = async () => {
        if (!(video == null ? void 0 : video.ended)) {
          await lib.$.sleep(1e3);
          video == null ? void 0 : video.play();
        }
      };
      video.onended = () => {
        clearInterval(videoCheckInterval);
        resolve();
      };
    });
  }
  function examination(opts) {
    var _a;
    lib.$message.info(`开始考试`);
    CommonProject.scripts.workResults.methods.init();
    const redundanceWords = opts.redundanceWordsText.split("\n").filter(Boolean);
    const titleTransform = (titles) => titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map(
      (t2) => t2 ? removeRedundantWords(
        StringUtils.of(extractYktTitleText(t2)).nowrap(" ").nospace().toString().trim(),
        redundanceWords
      ) : ""
    ).join(",");
    const worker = new OCSWorker({
      root: ".exam-main--content .subject-item",
      elements: {
        title: ".clearfix.exam-font .custom_ueditor_cn_body",
        options: "ul.list-unstyled li .custom_ueditor_cn_body",
        textareas: (root2) => {
          const editors = lib.$$el('iframe[id^="ueditor_"]', root2);
          if (editors.length) {
            return editors;
          }
          const blanks = lib.$$el(YKT_BLANK_INPUT_SELECTOR, root2);
          return blanks.length ? blanks : lib.$$el("textarea", root2);
        }
      },
      thread: (_a = opts.thread) != null ? _a : 1,
      answerSeparators: opts.answerSeparators.split(",").map((s) => s.trim()),
      answerer: createCommonAnswerer({
        titleTransform: (elements2, ctx) => {
          if (elements2.title) {
            return titleTransform(elements2.title);
          }
          return "";
        },
        answererWrappers: opts.answererWrappers,
        period: opts.period
      }),
      work: async (ctx) => {
        var _a2;
        const { elements: elements2, searchInfos } = ctx;
        const type = (() => {
          var _a3, _b, _c;
          const cl = ((_c = (_b = (_a3 = ctx == null ? void 0 : ctx.root) == null ? void 0 : _a3.querySelector(".item-type")) == null ? void 0 : _b.textContent) == null ? void 0 : _c.trim()) || "";
          return cl.includes("单选题") ? "single" : cl.includes("多选题") ? "multiple" : cl.includes("判断题") ? "judgement" : cl.includes("填空题") ? "completion" : void 0;
        })();
        if (type && (type === "multiple" || type === "single")) {
          const resolver = createDefaultQuestionResolver(ctx, (o) => extractTextWithImages(o).text)[type];
          return await resolver(searchInfos, elements2.options, async (type2, answer, option) => {
            if (!(option == null ? void 0 : option.querySelector(".el-icon-check"))) {
              option.click();
              await lib.$.sleep(500);
            }
          });
        } else if (type && type === "judgement") {
          const answersGroup = searchInfos.map((info) => info.results.map((res) => res.answer));
          const optionTexts = ["对", "错"];
          const result = resolveJudgement(answersGroup, optionTexts);
          if (result.finish && result.option) {
            const index = optionTexts.indexOf(result.option);
            (_a2 = ctx.elements.options[index]) == null ? void 0 : _a2.click();
            return { finish: true };
          }
          return { finish: false };
        } else if (type === "completion") {
          const resolver = createDefaultQuestionResolver(ctx, (o) => extractTextWithImages(o).text).completion;
          return await resolver(searchInfos, elements2.textareas, async (type2, answer, option) => {
            if ((option == null ? void 0 : option.tagName) === "IFRAME") {
              fillYktUEditor(option, answer);
              await lib.$.sleep(300);
            } else {
              const input = (option == null ? void 0 : option.tagName) === "TEXTAREA" || (option == null ? void 0 : option.tagName) === "INPUT" ? option : option == null ? void 0 : option.querySelector("textarea,input");
              if (input) {
                input.value = answer;
                input.dispatchEvent(new Event("input", { bubbles: true }));
                await lib.$.sleep(200);
              }
            }
          });
        }
        return { finish: false };
      },
      async onResultsInit(_curr, _index, res) {
        await CommonProject.scripts.workResults.methods.fillAll(
          res.map((r, i) => simplifyWorkResult(r, titleTransform, i))
        );
      },
      async onResultsUpdate(current, index, res) {
        await CommonProject.scripts.workResults.methods.update(index, simplifyWorkResult(current, titleTransform, index));
      }
    });
    worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug }).then(() => {
      lib.$message.info({ content: "随堂练习完成，请自行检查后保存或提交。", duration: 0 });
      worker.emit("done");
    }).catch((err) => {
      console.error(err);
      lib.$message.error("答题程序发生错误 : " + err.message);
    });
    return worker;
  }
  function definedProjects() {
    return [
      ZHSProject,
      CXProject,
      IcveMoocProject,
      ZJYProject,
      ICourseProject,
      YKTProject,
      CommonProject,
      BackgroundProject
    ];
  }
  exports2.$ = $;
  exports2.$const = $const;
  exports2.$elements = lib.$elements;
  exports2.$store = lib.$store;
  exports2.$string = $string;
  exports2.AnswerWrapperHandlerConfig = AnswerWrapperHandlerConfig;
  exports2.AnswerWrapperParser = AnswerWrapperParser;
  exports2.BackgroundProject = BackgroundProject;
  exports2.CXProject = CXProject;
  exports2.CommonProject = CommonProject;
  exports2.CustomOCSWorker = CustomOCSWorker;
  exports2.ICourseProject = ICourseProject;
  exports2.IcveMoocProject = IcveMoocProject;
  exports2.OCSWorker = OCSWorker;
  exports2.RemotePlaywright = RemotePlaywright;
  exports2.RenderScript = RenderScript;
  exports2.StringUtils = StringUtils;
  exports2.YKTProject = YKTProject;
  exports2.ZHSProject = ZHSProject;
  exports2.ZJYProject = ZJYProject;
  exports2.answerExactMatch = answerExactMatch;
  exports2.answerNormalizedMatch = answerNormalizedMatch;
  exports2.answerSimilar = answerSimilar;
  exports2.answerSimilarWithGap = answerSimilarWithGap;
  exports2.clearString = clearString;
  exports2.clearStringKeepSign = clearStringKeepSign;
  exports2.createDefaultQuestionResolver = createDefaultQuestionResolver;
  exports2.defaultAnswerWrapperHandler = defaultAnswerWrapperHandler;
  exports2.defaultWorkTypeResolver = defaultWorkTypeResolver;
  exports2.definedProjects = definedProjects;
  exports2.disambiguateBySign = disambiguateBySign;
  exports2.disambiguateSimilarOptions = disambiguateSimilarOptions;
  exports2.domSearch = domSearch;
  exports2.domSearchAll = domSearchAll;
  exports2.getAnswererConfigProvider = getAnswererConfigProvider;
  exports2.isJudgementOptions = isJudgementOptions;
  exports2.isPlainAnswer = isPlainAnswer;
  exports2.isProgramAnswer = isProgramAnswer;
  exports2.linearizeLatex = linearizeLatex;
  exports2.logoSvg = logoSvg;
  exports2.normalizeString = normalizeString;
  exports2.normalizeStringKeepSign = normalizeStringKeepSign;
  exports2.openAnswererConnect = openAnswererConnect;
  exports2.removeRedundant = removeRedundant;
  exports2.request = request;
  exports2.resolveCompletion = resolveCompletion;
  exports2.resolveJudgement = resolveJudgement;
  exports2.resolveMultiple = resolveMultiple;
  exports2.resolvePlainAnswer = resolvePlainAnswer;
  exports2.resolveSingle = resolveSingle;
  exports2.setAnswererConfigProvider = setAnswererConfigProvider;
  exports2.splitAnswer = splitAnswer;
  exports2.start = lib.start;
  exports2.waitForAnswererConfig = waitForAnswererConfig;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});


const STYLE = `/** easy-us 基础样式（通过 node_modules 软链引入，相对路径保证 Easy LESS 免配置直接编译） */
/** ===== 主题主色（一键更换） ===== */
/** 主色 */
/** 主色 hover 变浅 */
/** 主色浅色变体（禁用态等） */
/** 激活态浅底 */
/** 极浅底（提示卡片、hover 背景） */
/** 主色边框/竖条 */
/** focus 光环 */
/** 默认字体 */
/** 输入框默认边距 */
ul,
ol {
  line-height: 26px;
  padding-left: 22px;
  margin: 0px;
}
a {
  color: #2b67ff;
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
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
}
.base-style-active-form-control:focus:not([type='checkbox'], [type='radio']) {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
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
  border-radius: 8px;
  color: black;
}
.base-style-input::placeholder {
  color: #bababa;
}
.base-style-switch {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  width: fit-content;
  min-width: 48px;
  height: 20px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  transition: all 0.2s ease-in-out;
  width: auto;
  background: gainsboro;
}
.base-style-switch:checked {
  background: #2b67ff;
}
.base-style-switch:disabled {
  background-color: #f7f7f78b;
}
.base-style-switch:checked::before {
  transform: translate(24px, 0px);
}
.base-style-switch::before {
  background-color: #fff;
  border-radius: 9px;
  box-shadow: 0 2px 4px #00230b33;
  width: 14px;
  height: 14px;
  content: '';
}
.base-style-button {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
}
.base-style-button:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
.base-style-button + .base-style-button {
  margin-left: 12px;
}
.base-style-button:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
.base-style-button.danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}
.base-style-button.danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}
.base-style-button:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
.base-style-button:disabled:active {
  box-shadow: none;
}
.base-style-button-secondary {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
  color: #606266;
  background-color: white;
  border: 1px solid #dcdcdc;
}
.base-style-button-secondary:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
.base-style-button-secondary + .base-style-button-secondary {
  margin-left: 12px;
}
.base-style-button-secondary:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
.base-style-button-secondary.danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}
.base-style-button-secondary.danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}
.base-style-button-secondary:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
.base-style-button-secondary:disabled:active {
  box-shadow: none;
}
.base-style-button-secondary:hover {
  color: #2b67ff;
  border-color: #c4d5ff;
  background-color: rgba(43, 103, 255, 0.06);
}
container-element.hidden {
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
  width: max-content;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #636363;
  box-shadow: 0 0 24px -12px #3f3f3f;
  border-radius: 12px;
  letter-spacing: 0.5px;
  border: 1px solid #c1c1c1;
  background-color: #f5f5f5;
}
header-element {
  display: flex;
  align-items: center;
  border-radius: 12px 12px 0px 0px;
  user-select: none;
  padding-bottom: 0px;
}
header-element .extra-menu-bar {
  width: 100%;
  padding: 4px;
  padding-bottom: 4px;
  background-color: white;
  border-top: 1px solid #e8e8e8;
  /** 默认隐藏，一直到需要激活的时候再更改 */
  display: none;
}
header-element .extra-menu-bar .script-panel-link {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
  color: #606266;
  background-color: white;
  border: 1px solid #dcdcdc;
  padding-bottom: 2px;
  margin-bottom: 0px;
}
header-element .extra-menu-bar .script-panel-link:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
header-element .extra-menu-bar .script-panel-link + header-element .extra-menu-bar .script-panel-link {
  margin-left: 12px;
}
header-element .extra-menu-bar .script-panel-link:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
header-element .extra-menu-bar .script-panel-link.danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}
header-element .extra-menu-bar .script-panel-link.danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}
header-element .extra-menu-bar .script-panel-link:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
header-element .extra-menu-bar .script-panel-link:disabled:active {
  box-shadow: none;
}
header-element .extra-menu-bar .script-panel-link:hover {
  color: #2b67ff;
  border-color: #c4d5ff;
  background-color: rgba(43, 103, 255, 0.06);
}
header-element .extra-menu-bar .script-panel-link.active {
  background-color: rgba(43, 103, 255, 0.1);
  border-color: #2b67ff;
  color: #2b67ff;
}
header-element .extra-menu-bar .script-panel-link + .script-panel-link {
  margin-left: 4px;
}
header-element .header-menu-bar {
  padding-top: 4px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  background-color: #f5f7fa;
  align-items: center;
  gap: 0px;
}
header-element .profile {
  cursor: move;
  margin-right: 4px;
}
header-element .switch:hover {
  background-color: #e4e9f0;
}
header-element .close:hover {
  background-color: #ff000038;
}
header-element .switch,
header-element .close {
  cursor: pointer;
}
header-element .dropdown {
  line-height: 20px;
}
header-element .dropdown .dropdown-trigger-element {
  padding: 2px 12px;
  border: none;
  border-top: 1px solid #00000000;
  border-radius: 8px 8px 0px 0px;
  font-weight: 500;
  color: #606266;
  background-color: transparent;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}
header-element .dropdown .dropdown-trigger-element:hover {
  background-color: #ffffff80;
  color: #2b67ff;
}
header-element .dropdown.active .dropdown-trigger-element {
  --tab-border: 1px;
  --tab-border-color: #e8ecf1;
  --tab-bg: #ffffff;
  --tab-radius-limit: 8px;
  --tab-radius-grad: #0000 calc(69% - var(--tab-border)), var(--tab-border-color) calc(69% - var(--tab-border) + 0.25px), var(--tab-border-color) 69%, var(--tab-bg) calc(69% + 0.25px);
  --radius-start: radial-gradient(circle at top left, var(--tab-radius-grad));
  --radius-end: radial-gradient(circle at top right, var(--tab-radius-grad));
  position: relative;
  color: #2b67ff;
  font-weight: 600;
  padding: 2px 11px;
  background-color: var(--tab-bg);
  border: var(--tab-border) solid var(--tab-border-color);
  border-bottom: none;
  border-radius: var(--tab-radius-limit) var(--tab-radius-limit) 0 0;
  box-shadow: 0 1px 0 var(--tab-bg);
}
header-element .dropdown.active .dropdown-trigger-element::before {
  content: '';
  z-index: 1;
  position: absolute;
  inset: auto calc(-1 * var(--tab-radius-limit)) -1px calc(-1 * var(--tab-radius-limit));
  height: calc(var(--tab-radius-limit) + var(--tab-border));
  transform: translate(0px, 1px);
  pointer-events: none;
  background-image: var(--radius-start), var(--radius-end), linear-gradient(var(--tab-bg), var(--tab-bg));
  background-size: var(--tab-radius-limit) var(--tab-radius-limit), var(--tab-radius-limit) var(--tab-radius-limit), 100% var(--tab-border);
  background-position: top left,
						top right,
						bottom left;
  background-repeat: no-repeat;
}
header-element .switch {
  border-radius: 8px;
  line-height: 20px;
  margin-left: auto;
  transition: background-color 0.2s ease;
}
header-element .switch,
header-element .close,
header-element .profile {
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
  overscroll-behavior: contain;
}
script-panel-element {
  display: block;
  background-color: white;
  border-radius: 0px 0px 12px 12px;
  padding: 0px 8px 12px 8px;
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
  border-radius: 10px;
  padding: 0px 8px;
}
.notes {
  background: rgba(43, 103, 255, 0.06);
  border-left: 4px solid rgba(43, 103, 255, 0.4);
  border-radius: 4px 10px 10px 4px;
  width: -webkit-fill-available;
  margin: 0px 8px;
  line-height: 26px;
  letter-spacing: 1px;
}
.notes .notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
}
.notes .notes-header .notes-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.notes .notes-header .notes-info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #2b67ff;
  color: white;
  font-size: 10px;
  font-weight: bold;
  font-style: italic;
  line-height: 1;
  user-select: none;
}
.notes .notes-collapse-icon {
  font-size: 12px;
  transition: transform 0.2s;
}
.notes.collapsed .notes-body {
  display: none;
}
.notes.collapsed .notes-collapse-icon {
  transform: rotate(-90deg);
}
.secondary {
  font-size: 12px;
  color: #8b8b8b;
}
.tooltip-container {
  z-index: 99999999999999;
  padding: 6px 10px;
  color: white;
  background: rgba(0, 0, 0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: fixed;
  white-space: normal;
  width: fit-content;
  max-width: 400px;
  height: auto;
  border-radius: 6px;
  line-height: 18px;
  touch-action: manipulation;
  /** 展开/收起动画：透明度 + 位移，方向随放置位置翻转 */
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
  /** 气泡尾巴：水平位置由 --tooltip-arrow-left 驱动，始终对准目标中心 */
  /** 气泡在目标下方，尾巴朝上 */
  /** 气泡在目标上方，尾巴朝下 */
}
.tooltip-container.tooltip-bottom {
  transform: translateY(-4px);
}
.tooltip-container.tooltip-top {
  transform: translateY(4px);
}
.tooltip-container.show {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.tooltip-container::before {
  content: '';
  position: absolute;
  left: var(--tooltip-arrow-left, 10px);
  width: 8px;
  height: 8px;
  background: inherit;
  transform: rotate(45deg);
}
.tooltip-container.tooltip-bottom::before {
  top: -4px;
}
.tooltip-container.tooltip-top::before {
  bottom: -4px;
}
/** 移动端（粗指针）适配：限宽并加大内边距 */
@media (pointer: coarse) {
  .tooltip-container {
    max-width: min(400px, 80vw);
    padding: 8px 12px;
  }
}
.configs-container.lock {
  filter: blur(1px);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
.configs-container .lock-wrapper {
  cursor: not-allowed !important;
  border-radius: 4px;
  position: absolute;
  left: 0px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.configs-container .lock-message {
  background-color: #ffffff7d;
  border-radius: 4px;
  box-shadow: 0px 0px 12px #6a6a6a98;
  padding: 2px;
}
.configs {
  display: table;
  background: #e1e1e107;
  width: -webkit-fill-available;
}
.configs .configs-body {
  display: table-row-group;
}
.configs .configs-body config-element + config-element label {
  padding-top: 4px;
}
.configs .configs-body config-element + config-element .config-wrapper {
  padding-top: 4px;
}
.configs .configs-body config-element {
  width: 100%;
  display: table-row;
  line-height: 26px;
  /** 前后插槽容器：仅作布局，抵消 > * 规则带来的底色与圆角 */
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
  border-radius: 8px;
  padding: 2px 8px;
  border: 1px solid #ffffff00;
}
.configs .configs-body config-element .config-wrapper select:focus {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
}
.configs .configs-body config-element .config-wrapper select:focus:not([type='checkbox'], [type='radio']) {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
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
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
}
.configs .configs-body config-element .config-wrapper textarea:focus:not([type='checkbox'], [type='radio']) {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
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
  border-radius: 8px;
  color: black;
  border: 1px solid #ffffff00;
}
.configs .configs-body config-element .config-wrapper input:not([type='button'])::placeholder {
  color: #bababa;
}
.configs .configs-body config-element .config-wrapper input:not([type='button']):focus {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
}
.configs .configs-body config-element .config-wrapper input:not([type='button']):focus:not([type='checkbox'], [type='radio']) {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
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
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
  width: auto;
  padding: 4px 12px;
}
.configs .configs-body config-element .config-wrapper input[type='button']:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
.configs .configs-body config-element .config-wrapper input[type='button'] + .configs .configs-body config-element .config-wrapper input[type='button'] {
  margin-left: 12px;
}
.configs .configs-body config-element .config-wrapper input[type='button']:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
.configs .configs-body config-element .config-wrapper input[type='button'].danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}
.configs .configs-body config-element .config-wrapper input[type='button'].danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}
.configs .configs-body config-element .config-wrapper input[type='button']:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
.configs .configs-body config-element .config-wrapper input[type='button']:disabled:active {
  box-shadow: none;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox'] {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  width: fit-content;
  min-width: 48px;
  height: 20px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  transition: all 0.2s ease-in-out;
  width: auto;
  background: gainsboro;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']:checked {
  background: #2b67ff;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']:disabled {
  background-color: #f7f7f78b;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']:checked::before {
  transform: translate(24px, 0px);
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']::before {
  background-color: #fff;
  border-radius: 9px;
  box-shadow: 0 2px 4px #00230b33;
  width: 14px;
  height: 14px;
  content: '';
}
.configs .configs-body config-element .config-wrapper input:not([type='checkbox'], [type='radio'], [type='button']),
.configs .configs-body config-element .config-wrapper textarea,
.configs .configs-body config-element .config-wrapper select {
  width: -webkit-fill-available;
  font-size: inherit;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox'],
.configs .configs-body config-element .config-wrapper input[type='radio'],
.configs .configs-body config-element .config-wrapper input[type='range'] {
  accent-color: #2b67ff;
}
.configs .configs-body config-element .config-wrapper > *:not(.tooltip) {
  background-color: #eef2f7;
  border-radius: 8px;
  color: black;
  float: right;
}
.configs .configs-body config-element .config-wrapper > .config-provider-container {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  border-radius: 0px;
  padding: 0px;
  /** 插槽中的按钮：去除下外边距保持垂直居中，禁止收缩 */
  /** 容器内的表单控件：恢复独立控件底色 */
}
.configs .configs-body config-element .config-wrapper > .config-provider-container .config-prefix,
.configs .configs-body config-element .config-wrapper > .config-provider-container .config-suffix {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  line-height: 20px;
  flex-shrink: 0;
}
.configs .configs-body config-element .config-wrapper > .config-provider-container .base-style-button,
.configs .configs-body config-element .config-wrapper > .config-provider-container .base-style-button-secondary {
  margin-bottom: 0px;
  white-space: nowrap;
  flex-shrink: 0;
}
.configs .configs-body config-element .config-wrapper > .config-provider-container > input:not([type='checkbox'], [type='radio'], [type='button']),
.configs .configs-body config-element .config-wrapper > .config-provider-container > select,
.configs .configs-body config-element .config-wrapper > .config-provider-container > textarea {
  width: auto;
  min-width: 60px;
  background-color: #eef2f7;
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
  z-index: 2;
}
.message-container message-element {
  display: flex;
  border-radius: 8px;
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
  background-color: #d5e1ff;
  color: #002991;
  border: 1px solid #aac2ff;
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
  border-radius: 14px;
  box-shadow: 0px 0px 24px -12px black;
  border: 1px solid #929292;
  height: fit-content;
  transform: translate(-50%, -50%);
  padding: 12px 18px 18px 18px;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  z-index: 99999999999;
  line-height: 24px;
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
modal-element .modal-footer > * + * {
  margin-left: 12px;
}
modal-element .modal-input {
  outline: none;
  padding: 2px 8px;
  margin: 0px;
  background-color: #eef2f7;
  border-radius: 8px;
  color: black;
  border: 1px solid #ffffff00;
  width: -webkit-fill-available;
}
modal-element .modal-input::placeholder {
  color: #bababa;
}
modal-element .modal-input:focus {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
}
modal-element .modal-input:focus:not([type='checkbox'], [type='radio']) {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
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
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
  color: gray;
  background-color: white;
  border: 1px solid #dcdcdc;
}
modal-element .modal-cancel-button:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
modal-element .modal-cancel-button + modal-element .modal-cancel-button {
  margin-left: 12px;
}
modal-element .modal-cancel-button:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
modal-element .modal-cancel-button.danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}
modal-element .modal-cancel-button.danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}
modal-element .modal-cancel-button:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
modal-element .modal-cancel-button:disabled:active {
  box-shadow: none;
}
modal-element .modal-confirm-button {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
}
modal-element .modal-confirm-button:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
modal-element .modal-confirm-button + modal-element .modal-confirm-button {
  margin-left: 12px;
}
modal-element .modal-confirm-button:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
modal-element .modal-confirm-button.danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}
modal-element .modal-confirm-button.danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}
modal-element .modal-confirm-button:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
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
  padding: 4px 0px 8px 0px;
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
container-element.minimize .body,
container-element.minimize header-element .dropdown,
container-element.minimize .footer {
  display: none;
}
container-element.minimize header-element {
  border-radius: 12px;
  padding-bottom: 8px;
  box-shadow: 0px 0px 24px -12px black;
}
.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown.active .dropdown-trigger-element {
  color: #2b67ff;
}
.dropdown-trigger-element {
  cursor: pointer;
}
.dropdown-content {
  position: absolute;
  background-color: #ffffff;
  overflow: auto;
  box-shadow: 0 6px 16px 0 #00000014, 0 3px 6px -4px #0000001f;
  z-index: 1;
  border: 1px solid #e8ecf1;
  border-radius: 12px;
  padding: 4px;
  min-width: 120px;
  /** 下拉展开/收起动画：透明度 + 下滑 + 轻微缩放，让用户感知这是一个下拉框 */
  display: block;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
  transform-origin: top center;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
}
.dropdown-content.show {
  visibility: visible;
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
.dropdown-content {
  cursor: pointer;
  z-index: 999;
}
.dropdown-content .dropdown-option {
  padding: 4px 12px;
  white-space: nowrap;
  border-radius: 8px;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.dropdown-content .dropdown-option:hover {
  background-color: #f5f5f5;
}
.dropdown-content .dropdown-option.active {
  background-color: rgba(43, 103, 255, 0.1);
  color: #2b67ff;
  font-weight: 500;
}
.space {
  display: inline-flex;
}
.config-details {
  animation: fade-in 0.5s;
}
.config-details label {
  padding-left: 12px;
}
message-element {
  animation: show 0.5s;
}
script-panel-element > div,
script-panel-link,
container-element,
modal-element {
  animation: fade-in 0.3s;
}
@keyframes show {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.checkbox-label {
  display: inline-block !important;
  position: relative;
  cursor: pointer;
  font-size: 16px;
  color: #2c3e50;
}
/* 隐藏原始复选框 */
.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
/* 自定义按钮样式 */
.checkbox-label::after {
  content: '';
  display: inline-block;
  border-radius: 50%;
  transition: all 0.1s ease;
  position: relative;
  margin-left: 4px;
  vertical-align: middle;
}
/* 向下箭头（未选中状态） */
.checkbox-label::before {
  content: '🔽';
  position: absolute;
  width: 0;
  height: 0;
  right: 8px;
  transition: all 0.1s ease;
  z-index: 2;
}
/* 向上箭头（选中状态） */
.checked .checkbox-label::before {
  content: '🔼';
}
/** 气泡自适应：不可视气泡固定显示在屏幕正上方（从顶部向下滑出自身高度） */
message-element.message-viewport-top {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  max-width: 90vw;
  animation: message-viewport-top-slide-down 0.25s ease;
  transition: top 0.2s ease;
}
@keyframes message-viewport-top-slide-down {
  from {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
/** OCS 自定义样式 */
/**
 * OCS 自定义样式（已从 easy-us 样式中隔离）
 * 本文件仅包含与 easy-us/assets/css/style.css 不同或新增的自定义规则。
 */
/** ===== 主题变量（对齐 easy-us 主题，跟随 @primary 一键更换） ===== */
/** 注意：本文件依赖 easy-us/assets/less/style.less 中的主题变量，需在其之后编译（见 style.less） */
/** 主色 */
/** 按钮颜色 */
/** 焦点边框/阴影 */
/** ===== 通用 mixin ===== */
/** 输入控件焦点样式 */
/** 输入控件焦点样式（非 checkbox/radio 时填充白底） */
/** 按钮基础样式 */
/** 按钮状态样式（需在次级样式之前调用，保证次级 hover 覆盖默认 hover） */
/** 次级按钮样式（白底灰边） */
/** 标签配色 */
a {
  color: #2b67ff;
}
.base-style-active-form-control:focus {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
}
.base-style-active-form-control:focus:not([type='checkbox'], [type='radio']) {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
  background-color: white !important;
}
.base-style-switch:checked {
  background: #2b67ff;
}
/**
 * 注意：.base-style-button / .base-style-button-secondary 与 easy-us 中的 mixin 同名，
 * easy-us 调用 .base-style-button() 时会把同名规则集的【内部嵌套规则】一并展开，
 * 因此这两个类的状态规则必须保持扁平写法（单独定义），不能嵌套在类内部。
 */
.base-style-button {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
}
.base-style-button:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
.base-style-button:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
.base-style-button:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
.base-style-button-secondary {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
  color: #606266;
  background-color: white;
  border: 1px solid #dcdcdc;
}
.base-style-button-secondary:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
.base-style-button-secondary:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
.base-style-button-secondary:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
.base-style-button-secondary:hover {
  color: #2b67ff;
  border-color: #91b0ff;
  background-color: rgba(43, 103, 255, 0.06);
}
header-element .extra-menu-bar .script-panel-link {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
  color: #606266;
  background-color: white;
  border: 1px solid #dcdcdc;
  padding-bottom: 2px;
  margin-bottom: 0px;
}
header-element .extra-menu-bar .script-panel-link:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
header-element .extra-menu-bar .script-panel-link:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
header-element .extra-menu-bar .script-panel-link:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
header-element .extra-menu-bar .script-panel-link:hover {
  color: #2b67ff;
  border-color: #91b0ff;
  background-color: rgba(43, 103, 255, 0.06);
}
header-element .extra-menu-bar .script-panel-link.active {
  background-color: rgba(43, 103, 255, 0.1);
  border-color: #2b67ff;
  color: #2b67ff;
}
header-element .dropdown .dropdown-trigger-element:hover {
  background-color: #ffffff80;
  color: #2b67ff;
}
header-element .dropdown.active .dropdown-trigger-element {
  --tab-border: 1px;
  --tab-border-color: #e8ecf1;
  --tab-bg: #ffffff;
  --tab-radius-limit: 8px;
  --tab-radius-grad: #0000 calc(69% - var(--tab-border)), var(--tab-border-color) calc(69% - var(--tab-border) + 0.25px), var(--tab-border-color) 69%, var(--tab-bg) calc(69% + 0.25px);
  --radius-start: radial-gradient(circle at top left, var(--tab-radius-grad));
  --radius-end: radial-gradient(circle at top right, var(--tab-radius-grad));
  position: relative;
  color: #2b67ff;
  font-weight: 600;
  padding: 2px 11px;
  background-color: var(--tab-bg);
  border: var(--tab-border) solid var(--tab-border-color);
  border-bottom: none;
  border-radius: var(--tab-radius-limit) var(--tab-radius-limit) 0 0;
  box-shadow: 0 1px 0 var(--tab-bg);
}
.notes {
  background: rgba(43, 103, 255, 0.06);
  border-left: 4px solid rgba(43, 103, 255, 0.4);
  border-radius: 4px 10px 10px 4px;
  width: -webkit-fill-available;
  margin: 0px 8px;
  line-height: 26px;
  letter-spacing: 1px;
}
.notes .notes-header .notes-info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #2b67ff;
  color: white;
  font-size: 10px;
  font-weight: bold;
  font-style: italic;
  line-height: 1;
  user-select: none;
}
.configs .configs-body config-element .config-wrapper select:focus {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
}
.configs .configs-body config-element .config-wrapper select:focus:not([type='checkbox'], [type='radio']) {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
  background-color: white !important;
}
.configs .configs-body config-element .config-wrapper textarea:focus {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
}
.configs .configs-body config-element .config-wrapper textarea:focus:not([type='checkbox'], [type='radio']) {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
  background-color: white !important;
}
.configs .configs-body config-element .config-wrapper input:not([type='button']):focus {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
}
.configs .configs-body config-element .config-wrapper input:not([type='button']):focus:not([type='checkbox'], [type='radio']) {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
  background-color: white !important;
}
.configs .configs-body config-element .config-wrapper input[type='button'] {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
  width: auto;
  padding: 4px 12px;
}
.configs .configs-body config-element .config-wrapper input[type='button']:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
.configs .configs-body config-element .config-wrapper input[type='button']:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
.configs .configs-body config-element .config-wrapper input[type='button']:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']:checked {
  background: #2b67ff;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox'],
.configs .configs-body config-element .config-wrapper input[type='radio'],
.configs .configs-body config-element .config-wrapper input[type='range'] {
  accent-color: #2b67ff;
}
.message-container message-element.info {
  background-color: #d5e1ff;
  color: #002991;
  border: 1px solid #aac2ff;
}
modal-element .modal-input:focus {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
}
modal-element .modal-input:focus:not([type='checkbox'], [type='radio']) {
  border: 1px solid #2b67ff;
  box-shadow: 0px 0px 4px rgba(43, 103, 255, 0.32);
  background-color: white !important;
}
modal-element .modal-cancel-button {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
  color: gray;
  background-color: white;
  border: 1px solid #dcdcdc;
}
modal-element .modal-cancel-button:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
modal-element .modal-cancel-button:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
modal-element .modal-cancel-button:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
modal-element .modal-confirm-button {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: #2b67ff;
  border: 1px solid #2b67ff;
  color: white;
  cursor: pointer !important;
  transition: all 0.2s ease;
}
modal-element .modal-confirm-button:active {
  box-shadow: 0px 0px 8px rgba(43, 103, 255, 0.65);
}
modal-element .modal-confirm-button:hover {
  background-color: #5e8cff;
  border-color: #5e8cff;
}
modal-element .modal-confirm-button:disabled {
  background-color: #abc2ff;
  border-color: #abc2ff;
  color: white;
  cursor: not-allowed !important;
}
/** ===== 题库状态列表 ===== */
.answerer-status-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}
.answerer-status-list .answerer-status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #fafafa;
}
.answerer-status-list .answerer-status-item .name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.answerer-status-list .answerer-status-item .status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  flex-shrink: 0;
}
.answerer-status-list .answerer-status-item .status .latency {
  color: #8c8c8c;
}
.answerer-status-list .answerer-status-item .status .badge {
  padding: 2px 8px;
  border-radius: 10px;
}
.answerer-status-list .answerer-status-item .status .badge.success {
  color: #52c41a;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}
.answerer-status-list .answerer-status-item .status .badge.error {
  color: #ff4d4f;
  background-color: #fff1f0;
  border: 1px solid #ffa39e;
}
.answerer-status-list .answerer-status-item .status .badge.timeout {
  color: #faad14;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
}
.answerer-status-list .answerer-status-item .status .badge.disabled {
  color: #8c8c8c;
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
}
.dropdown.active .dropdown-trigger-element {
  color: #2b67ff;
}
.dropdown-content .dropdown-option.active {
  background-color: rgba(43, 103, 255, 0.1);
  color: #2b67ff;
  font-weight: 500;
}
/** ===== 搜索结果样式（从 easy-us 迁移，仅 OCS 项目使用） ===== */
.search-infos-num {
  width: 26px;
  margin: 2px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
  background-color: white;
  text-align: center;
  cursor: pointer;
  border: 1px solid #b6b6b6;
}
.search-infos-num.requested {
  border: 1px solid #789eff;
  color: #789eff;
}
.search-infos-num.searching {
  border: 1px solid rgba(43, 103, 255, 0.4);
  border-radius: 4px;
  color: #2b67ff;
  animation: ocs-searching-pulse 1.2s ease-in-out infinite;
}
@keyframes ocs-searching-pulse {
  0%,
  100% {
    box-shadow: 0 0 3px 1px rgba(43, 103, 255, 0.55);
  }
  50% {
    box-shadow: 0 0 1px 0px rgba(43, 103, 255, 0.2);
  }
}
.search-infos-num.active {
  background-color: #2b67ff !important;
  color: white;
}
.search-infos-num.error {
  border: 1px solid #ff8789ed;
  background-color: #ff6b6ded;
  color: white;
}
.search-infos-num.finish {
  background-color: #789eff;
  border: 1px solid #789eff;
  color: white;
}
search-infos-element {
  display: block;
  overflow: auto;
}
search-infos-element .search-result .question {
  font-weight: bold;
  max-height: 200px;
  overflow: auto;
}
search-infos-element .search-result .answer {
  color: #7c7c7c;
}
search-infos-element .search-result .answer code {
  border-bottom: 1px solid #dcdcdc;
  padding: 2px 0px;
  border-radius: 2px;
  margin: 4px;
  line-height: 22px;
}
search-infos-element .search-result .answer code + code {
  margin-left: 4px;
}
search-infos-element .search-result .search-result-answer-tag {
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 6px;
}
search-infos-element .search-result .search-result-answer-tag + .search-result-answer-tag {
  margin-left: 4px;
}
search-infos-element .search-result .search-result-answer-tag.blue {
  color: #2b67ff;
  background-color: rgba(43, 103, 255, 0.08);
  border: 1px solid rgba(43, 103, 255, 0.4);
}
search-infos-element .search-result .search-result-answer-tag.green {
  color: #52c41a;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}
search-infos-element .search-result .search-result-answer-tag.gray {
  color: #595959;
  background-color: #fafafa;
  border: 1px solid #d9d9d9;
}
search-infos-element .search-result .search-result-answer-tag.red {
  color: #ff4d4f;
  background-color: #fff1f0;
  border: 1px solid #ffa39e;
}
search-infos-element .search-result .search-result-answer-tag.yellow {
  color: #faad14;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
}
search-infos-element .search-result-question-type {
  background-color: rgba(43, 103, 255, 0.08);
  border: 1px solid rgba(43, 103, 255, 0.4);
  color: #2b67ff;
  margin-right: 8px;
  padding: 0px 4px;
  border-radius: 4px;
}
search-infos-element .error {
  color: #ff6b6ded;
  display: inline-block;
  padding-left: 12px;
}
.work-result-list {
  max-height: 400px;
  overflow: auto;
  padding: 4px 0px;
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
.search-info-title {
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  line-height: 20px;
  overflow: auto;
}
.search-info-title .title-content {
  max-height: 200px;
  overflow: auto;
}
.alert-info-wrapper {
  margin-bottom: 8px;
  margin-top: 8px;
}
.alert-info-wrapper .result-info {
  padding: 6px;
  text-align: center;
  border-radius: 6px;
}
.alert-info-wrapper .unresolved,
.alert-info-wrapper .no-answer {
  color: #a1a1a1;
  background-color: #f7f7f7;
}
.alert-info-wrapper .warn {
  color: #d48806;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
}
.alert-info-wrapper .error {
  color: #ff4d4f;
  background-color: #fff1f0;
  border: 1px solid #ffa39e;
}
/** ===== 使用指南/控制台/Markdown 样式（从 easy-us 迁移，仅 OCS 项目使用） ===== */
.user-guide > li {
  padding: 4px 0px;
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
  background-color: rgba(43, 103, 255, 0.64);
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
/** ===== 动画 ===== */
@keyframes show {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
/** ===== 边缘最小化图标模式 ===== */
container-element .edge-minimize-icon {
  display: none;
}
container-element.edge-minimize {
  min-width: unset;
  width: 64px;
}
container-element.edge-minimize header-element {
  display: none;
}
container-element.edge-minimize .message-container {
  left: 0;
  transform: none;
}
container-element.edge-minimize .edge-minimize-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  cursor: pointer;
  user-select: none;
}
container-element.edge-minimize .edge-minimize-icon svg {
  width: 42px;
  height: 42px;
}
container-element.edge-minimize.edge-left {
  border-radius: 0 12px 12px 0;
}
container-element.edge-minimize.edge-right {
  border-radius: 12px 0 0 12px;
}
/** ===== 吸附过渡动画（仅在程序化吸附时临时添加） ===== */
container-element.edge-snapping {
  transition: left 0.2s ease, top 0.2s ease;
}
/** ===== 边缘拖放高亮区域 ===== */
.edge-drop-zone {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100px;
  z-index: 99998;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edge-drop-zone .edge-drop-zone-tip {
  writing-mode: vertical-rl;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 6px;
  color: rgba(43, 103, 255, 0.9);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
  user-select: none;
}
.edge-drop-zone.show {
  opacity: 1;
}
.edge-drop-zone.zone-left {
  left: 0;
  background: linear-gradient(to right, rgba(43, 103, 255, 0.25), transparent);
  border-right: 2px solid rgba(43, 103, 255, 0.6);
}
.edge-drop-zone.zone-right {
  right: 0;
  background: linear-gradient(to left, rgba(43, 103, 255, 0.25), transparent);
  border-left: 2px solid rgba(43, 103, 255, 0.6);
}
container-element .edge-minimize-icon {
  touch-action: none;
}
header-element .profile {
  gap: 8px;
}
modal-element .modal-cancel-button:hover {
  color: white;
}
/** ===== 题库配置弹窗组件（src/utils/ui.ts 配套样式） ===== */
/** ===== 通用口风琴卡片（下拉展开/收起列表组件） =====
 * 结构：.accordion-card > .accordion-card-header（点击整行展开/收起）+ .accordion-card-body
 * 状态：.expanded 展开（箭头旋转 + 详情区显示），由 JS 切换 class 驱动
 * 组件工厂：utils/ui.ts 的 createAccordionCard
 * 使用方：题库配置卡片（aw-card）、搜索结果下拉列表 
 */
.accordion-card {
  border: 1px solid #e3e8ee;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.accordion-card:hover {
  border-color: #b6c6dd;
  box-shadow: 0 2px 8px rgba(31, 35, 41, 0.08);
}
.accordion-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.accordion-card-header:hover {
  background-color: #f5f8fb;
}
.accordion-card-spacer {
  flex: 1;
}
.accordion-card-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 20px;
  height: 20px;
  color: #9aa4b2;
  border-radius: 4px;
  transition: transform 0.2s ease;
  transform: rotate(-90deg);
}
.accordion-card.expanded .accordion-card-chevron {
  transform: rotate(0deg);
}
.accordion-card-body {
  display: none;
  border-top: 1px solid #eef2f7;
  background-color: #f8fafc;
  padding: 8px 12px;
  max-height: 300px;
  overflow: auto;
}
.accordion-card.expanded .accordion-card-body {
  display: block;
}
.aw-card-name {
  font-weight: 600;
  font-size: 14px;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}
.aw-card.disabled .aw-card-name {
  opacity: 0.45;
}
.aw-card-badge {
  flex: none;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  line-height: 18px;
  color: #5a6b85;
  background-color: #eef2f7;
  border-radius: 999px;
  padding: 0 8px;
}
.aw-card-home {
  flex: none;
  text-decoration: none;
  font-size: 13px;
  line-height: 1;
}
.aw-card-home.no-home {
  opacity: 0.4;
  cursor: default;
}
.aw-card-status-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
}
.aw-card-status {
  flex: none;
  font-size: 11px;
  line-height: 18px;
  padding: 0 8px;
  border-radius: 999px;
  background-color: #eef2f7;
  color: #5a6b85;
  white-space: nowrap;
}
.aw-card-status.probing {
  color: #9aa4b2;
}
.aw-card-status.success {
  background-color: #e8f7ee;
  color: #2e7d4f;
}
.aw-card-status.error,
.aw-card-status.invalid {
  background-color: #fdeeee;
  color: #c0392b;
}
.aw-card-status.timeout {
  background-color: #fdf3e5;
  color: #b26a00;
}
.aw-card-status.disabled {
  background-color: #eef2f7;
  color: #8a94a6;
}
.aw-card-status.latency {
  background-color: #eef2f7;
  color: #5a6b85;
}
.aw-card-rows {
  list-style: none;
  padding: 0;
  margin: 0;
}
.aw-card-row {
  display: flex;
  align-items: flex-start;
  line-height: 22px;
  font-size: 13px;
}
.aw-card-label {
  flex: none;
  width: 64px;
  margin-right: 8px;
  color: #8a94a6;
}
.aw-card-value {
  word-break: break-all;
  color: #1f2329;
}
.aw-section-header {
  margin-top: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.aw-section-copy {
  padding: 2px 8px;
  font-size: 12px;
  margin-left: auto;
}
.aw-connect-hero {
  text-align: center;
  padding: 20px 16px;
  background-color: #f6f8fb;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  margin-bottom: 16px;
}
.aw-connect-hero-icon {
  font-size: 28px;
  line-height: 1;
  margin-bottom: 8px;
}
.aw-connect-hero-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2329;
  margin-bottom: 6px;
}
.aw-connect-hero-subtitle {
  font-size: 13px;
  color: #5a6b85;
  line-height: 18px;
}
.aw-connect-hero-extra {
  font-size: 13px;
  color: #5a6b85;
  line-height: 18px;
  margin-top: 6px;
}
.aw-connect-hero-extra b {
  color: #1f2329;
}
.aw-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0;
}
.aw-step {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #5a6b85;
}
.aw-step-num {
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #2b67ff;
  color: #fff;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
}
.aw-step-arrow {
  color: #c1c9d4;
  font-size: 12px;
}
.aw-connect-status {
  display: none;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 13px;
  line-height: 20px;
  text-align: center;
  margin-bottom: 12px;
}
.aw-connect-status.info {
  display: block;
  background-color: #eef4ff;
  border-color: #c9d9ff;
  color: #3f5de0;
}
.aw-connect-status.success {
  display: block;
  background-color: #e8f7ee;
  border-color: #b7e3c7;
  color: #2e7d4f;
}
.aw-connect-status.error {
  display: block;
  background-color: #fdeeee;
  border-color: #f5c6c6;
  color: #c0392b;
}
.aw-connect-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background-color: #2b67ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.15s ease;
}
.aw-connect-btn:hover:not(:disabled) {
  background-color: #5e8cff;
}
.aw-connect-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}
.aw-connect-btn.lg {
  padding: 8px 24px;
  font-size: 15px;
}
@keyframes ocs-spin {
  to {
    transform: rotate(360deg);
  }
}
.aw-spin {
  animation: ocs-spin 0.8s linear infinite;
  margin-right: 6px;
}
/** ===== 快捷菜单链接按钮（background.ts $menu 注册）淡入淡出动画 ===== */
.script-panel-link {
  animation: ocs-menu-fade-in 0.3s ease both;
  transition: opacity 0.25s ease, background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}
.script-panel-link:hover {
  opacity: 0.85;
}
.script-panel-link.active {
  transition: opacity 0.25s ease, background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
}
@keyframes ocs-menu-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/** ===== 搜索结果面板：序号列表前的帮助图标（承载答题进度/序号解释提示） ===== */
.search-infos-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 4px;
  border-radius: 50%;
  border: 1px solid #c1c9d4;
  color: #9aa4b2;
  font-weight: bold;
  cursor: help;
  user-select: none;
}
.search-infos-help:hover {
  border-color: #2b67ff;
  color: #2b67ff;
}
.work-control-panel {
  display: flex;
  margin: 12px 0px;
}
.text-secondary {
  color: #606266;
  font-size: 12px;
}
`;

/* eslint-disable no-undef, max-len */
/// <reference path="./global.d.ts" />

// 环境检测
if (
	[
		'GM_getTab',
		'GM_saveTab',
		'GM_setValue',
		'GM_getValue',
		'unsafeWindow',
		'GM_listValues',
		'GM_deleteValue',
		'GM_notification',
		'GM_xmlhttpRequest',
		'GM_getResourceText',
		'GM_addValueChangeListener',
		'GM_removeValueChangeListener'
	].some((api) => typeof Reflect.get(globalThis, api) === 'undefined')
) {
	const open = confirm(
		`OCS网课脚本不支持当前的脚本管理器（${GM_info.scriptHandler}）。` +
			'请前往 https://docs.ocsjs.com/docs/script 下载指定的脚本管理器，例如 “Scriptcat 脚本猫” 或者 “Tampermonkey 油猴”'
	);

	if (open) {
		window.location.href = 'https://docs.ocsjs.com/docs/script';
	}
	return;
}

const { start, definedProjects, CommonProject, RenderScript, logoSvg } = OCS;

const infos = GM_info;

(function () {
	'use strict';

	const projects = definedProjects();

	// 运行脚本
	start({
		OCS_TYPE: 'main',
		projects: projects,
		renderConfig: {
			renderScript: RenderScript,
			styles: [STYLE],
			defaultPanelName: CommonProject.scripts.guide.namespace,
			title: `${logoSvg} OCS <span style="font-size: 12px; color: #969696;">v${infos.script.version}</span>`
		},
		updatePage: 'https://docs.ocsjs.com/docs/update'
	});
})();
