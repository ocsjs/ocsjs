import { RawElements, SearchedElements } from './../worker/interface';
/**
 * 与 {@link domSearchAll } 相同，区别是这个只返回单个元素，而不是一个元素数组
 * @param root
 * @param wrapper
 * @returns
 */
export function domSearch<E extends RawElements>(
  /** 搜索构造器 */
  wrapper: E,
  root: HTMLElement | Document = window.document
): SearchedElements<E, HTMLElement | null> {
  const obj = Object.create({});
  Reflect.ownKeys(wrapper).forEach((key) => {
    Reflect.set(obj, key, root.querySelector(wrapper[key.toString()]));
  });
  return obj;
}

/**
 * 元素搜索
 *
 * @example
 *
 * const { title , btn , arr } = domSearch(document.body,{
 *      title: '.title'
 *      btn: ()=> '.btn',
 *      arr: ()=> Array.from(document.body.querySelectorAll('.function-arr'))
 * })
 *
 * console.log(title) // 等价于 Array.from(document.body.querySelectorAll('.title'))
 * console.log(btn)// 等价于 Array.from(document.body.querySelectorAll('.btn'))
 */
export function domSearchAll<E extends RawElements>(
  /** 搜索构造器 */
  wrapper: E,
  root: HTMLElement | Document = window.document
): SearchedElements<E, HTMLElement[]> {
  const obj = Object.create({});
  Reflect.ownKeys(wrapper).forEach((key) => {
    Reflect.set(obj, key, Array.from(root.querySelectorAll(wrapper[key.toString()])));
  });
  return obj;
}

/**
 * 元素拖拽
 */

export function dragElement(
  draggable: HTMLElement,
  container: HTMLElement,
  onMove: (x: number, y: number) => void
) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;

  const draggableEl = draggable;
  const containerEl = container;

  if (draggableEl) {
    // if present, the header is where you move the DIV from:
    draggableEl.onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    containerEl.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e: any) {
    e = e || window.event;
    e.preventDefault();

    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: any) {
    e = e || window.event;
    e.preventDefault();

    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    containerEl.style.top = containerEl.offsetTop - pos2 + 'px';
    containerEl.style.left = containerEl.offsetLeft - pos1 + 'px';
    onMove(containerEl.offsetLeft - pos1, containerEl.offsetTop - pos2);
    containerEl.style.bottom = 'unset';
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/**
 *  递归寻找 iframe
 */
export function searchIFrame(root: Document) {
  let list = Array.from(root.querySelectorAll('iframe'));
  const result: HTMLIFrameElement[] = [];
  while (list.length) {
    const frame = list.shift();

    try {
      if (frame && frame?.contentWindow?.document) {
        result.push(frame);
        const frames = frame?.contentWindow?.document.querySelectorAll('iframe');
        list = list.concat(Array.from(frames || []));
      }
    } catch (e) {
      // @ts-ignore
      console.log(e.message);
      console.log({ frame });
    }
  }
  return result;
}

/**
 * 检测页面是否准备完毕
 */
export function onComplete(callback: () => void, root: Document = document) {
  function checkReady() {
    if (root.readyState === 'complete') {
      callback();
      root.removeEventListener('readystatechange', checkReady);
    }
  }
  checkReady();
  root.addEventListener('readystatechange', checkReady);
}
/**
 * 检测页面是否加载
 */
export function onInteractive(callback: () => void, root: Document = document) {
  function checkLoaded() {
    if (root.readyState === 'interactive') {
      root.removeEventListener('readystatechange', checkLoaded);
      callback();
    }
  }
  checkLoaded();
  root.addEventListener('readystatechange', checkLoaded);
}
