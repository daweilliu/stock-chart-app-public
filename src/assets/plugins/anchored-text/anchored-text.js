var u = Object.defineProperty;
var p = (e, t, a) => t in e ? u(e, t, { enumerable: !0, configurable: !0, writable: !0, value: a }) : e[t] = a;
var i = (e, t, a) => p(e, typeof t != "symbol" ? t + "" : t, a);
class w {
  constructor(t) {
    i(this, "_data");
    this._data = t;
  }
  draw(t) {
    t.useMediaCoordinateSpace((a) => {
      const s = a.context;
      s.font = this._data.font;
      const h = s.measureText(this._data.text).width, n = 20;
      let d = n;
      const c = a.mediaSize.width, o = a.mediaSize.height;
      switch (this._data.horzAlign) {
        case "right": {
          d = c - n - h;
          break;
        }
        case "middle": {
          d = c / 2 - h / 2;
          break;
        }
      }
      const _ = 10, l = this._data.lineHeight;
      let r = _ + l;
      switch (this._data.vertAlign) {
        case "middle": {
          r = o / 2 + l / 2;
          break;
        }
        case "bottom": {
          r = o - _;
          break;
        }
      }
      s.fillStyle = this._data.color, s.fillText(this._data.text, d, r);
    });
  }
}
class x {
  constructor(t) {
    i(this, "_source");
    this._source = t;
  }
  update() {
  }
  renderer() {
    return new w(this._source._data);
  }
}
class V {
  constructor(t) {
    i(this, "_paneViews");
    i(this, "_data");
    i(this, "requestUpdate");
    this._data = t, this._paneViews = [new x(this)];
  }
  updateAllViews() {
    this._paneViews.forEach((t) => t.update());
  }
  paneViews() {
    return this._paneViews;
  }
  attached({ requestUpdate: t }) {
    this.requestUpdate = t;
  }
  detached() {
    this.requestUpdate = void 0;
  }
  applyOptions(t) {
    this._data = { ...this._data, ...t }, this.requestUpdate && this.requestUpdate();
  }
}
export {
  V as AnchoredText
};
