import{e as S,z as F,r as d,j as h,i as T,k as A,A as P,D as w,o as L}from"./index--Ct_i1hN.js";/**
 * @license lucide-react v0.503.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]],re=S("crown",z);/**
 * @license lucide-react v0.503.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],ne=S("external-link",D);/**
 * @license lucide-react v0.503.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],oe=S("save",U);/**
 * @license lucide-react v0.503.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],se=S("trash-2",G);var g={exports:{}},E={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _;function B(){if(_)return E;_=1;var e=F();function a(n,s){return n===s&&(n!==0||1/n===1/s)||n!==n&&s!==s}var r=typeof Object.is=="function"?Object.is:a,o=e.useState,u=e.useEffect,t=e.useLayoutEffect,f=e.useDebugValue;function i(n,s){var p=s(),y=o({inst:{value:p,getSnapshot:s}}),l=y[0].inst,x=y[1];return t(function(){l.value=p,l.getSnapshot=s,c(l)&&x({inst:l})},[n,p,s]),u(function(){return c(l)&&x({inst:l}),n(function(){c(l)&&x({inst:l})})},[n]),f(p),p}function c(n){var s=n.getSnapshot;n=n.value;try{var p=s();return!r(n,p)}catch{return!0}}function v(n,s){return s()}var m=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?v:i;return E.useSyncExternalStore=e.useSyncExternalStore!==void 0?e.useSyncExternalStore:m,E}var N;function K(){return N||(N=1,g.exports=B()),g.exports}var O=K();function W(){return O.useSyncExternalStore(J,()=>!0,()=>!1)}function J(){return()=>{}}var k="Avatar",[Q,ue]=T(k),[X,M]=Q(k),I=d.forwardRef((e,a)=>{const{__scopeAvatar:r,...o}=e,[u,t]=d.useState("idle");return h.jsx(X,{scope:r,imageLoadingStatus:u,onImageLoadingStatusChange:t,children:h.jsx(A.span,{...o,ref:a})})});I.displayName=k;var j="AvatarImage",C=d.forwardRef((e,a)=>{const{__scopeAvatar:r,src:o,onLoadingStatusChange:u=()=>{},...t}=e,f=M(j,r),i=Y(o,t),c=P(v=>{u(v),f.onImageLoadingStatusChange(v)});return w(()=>{i!=="idle"&&c(i)},[i,c]),i==="loaded"?h.jsx(A.img,{...t,ref:a,src:o}):null});C.displayName=j;var b="AvatarFallback",q=d.forwardRef((e,a)=>{const{__scopeAvatar:r,delayMs:o,...u}=e,t=M(b,r),[f,i]=d.useState(o===void 0);return d.useEffect(()=>{if(o!==void 0){const c=window.setTimeout(()=>i(!0),o);return()=>window.clearTimeout(c)}},[o]),f&&t.imageLoadingStatus!=="loaded"?h.jsx(A.span,{...u,ref:a}):null});q.displayName=b;function R(e,a){return e?a?(e.src!==a&&(e.src=a),e.complete&&e.naturalWidth>0?"loaded":"loading"):"error":"idle"}function Y(e,{referrerPolicy:a,crossOrigin:r}){const o=W(),u=d.useRef(null),t=o?(u.current||(u.current=new window.Image),u.current):null,[f,i]=d.useState(()=>R(t,e));return w(()=>{i(R(t,e))},[t,e]),w(()=>{const c=n=>()=>{i(n)};if(!t)return;const v=c("loaded"),m=c("error");return t.addEventListener("load",v),t.addEventListener("error",m),a&&(t.referrerPolicy=a),typeof r=="string"&&(t.crossOrigin=r),()=>{t.removeEventListener("load",v),t.removeEventListener("error",m)}},[t,r,a]),f}var V=I,$=C,H=q;const Z=d.forwardRef(({className:e,...a},r)=>h.jsx(V,{ref:r,className:L("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",e),...a}));Z.displayName=V.displayName;const ee=d.forwardRef(({className:e,...a},r)=>h.jsx($,{ref:r,className:L("aspect-square h-full w-full",e),...a}));ee.displayName=$.displayName;const ae=d.forwardRef(({className:e,...a},r)=>h.jsx(H,{ref:r,className:L("flex h-full w-full items-center justify-center rounded-full bg-muted",e),...a}));ae.displayName=H.displayName;export{Z as A,re as C,ne as E,oe as S,se as T,ae as a};
