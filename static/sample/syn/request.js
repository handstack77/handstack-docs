'use strict';
let $requests = {
    extends: [
        'parsehtml'
    ],

    method: {
    },

    event: {
        btn_query_click() {
            syn.$r.params['p1'] = 'aaa';
            syn.$r.params['p2'] = 'bbb';
            syn.$r.params['p3'] = 'ccc';
            syn.$l.get('txt_query').value = syn.$r.query('p2');
        },

        btn_url_click() {
            syn.$r.params['p1'] = 'aaa';
            syn.$r.params['p2'] = 'bbb';
            syn.$r.params['p3'] = 'ccc';
            syn.$l.get('txt_url').value = syn.$r.url();
        },

        btn_setCookie_click() {
            syn.$r.setCookie('txtSetCookie', 'hello');
            syn.$l.get('txt_setCookie').value = '설정 완료';
        },

        btn_getCookie_click() {
            syn.$l.get('txt_getCookie').value = syn.$r.getCookie('txtSetCookie');
        },

        btn_deleteCookie_click() {
            syn.$r.deleteCookie('txtSetCookie');
            syn.$l.get('txt_deleteCookie').value = '삭제 완료';
        }
    }
};
