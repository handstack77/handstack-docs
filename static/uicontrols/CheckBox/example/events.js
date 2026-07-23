'use strict';
let $events = {
    event: {
        chkNotify_change(evt) {
            var value = syn.uicontrols.$checkbox.getValue('chkNotify');
            syn.$l.eventLog('chkNotify_change', 'value: ' + value);
        },

        btnGetValue_click() {
            var value = syn.uicontrols.$checkbox.getValue('chkNotify');
            syn.$l.eventLog('btnGetValue_click', value);
        },

        btnSetValueTrue_click() {
            // 주의(API.md 참고): setValue는 value를 대문자 문자열로 변환한 뒤 checkedValue와 정확히 일치할 때만 체크합니다.
            // checkedValue가 '1'인 상태에서 setValue(elID, true)를 넘기면 'TRUE' != '1'이 되어 오히려 체크가 해제됩니다.
            // 체크시키려면 checkedValue와 같은 문자열('1')을 그대로 넘겨야 합니다.
            syn.uicontrols.$checkbox.setValue('chkNotify', '1');
            syn.$l.eventLog('btnSetValueTrue_click', "chkNotify: '1'");
        },

        btnSetValueFalse_click() {
            syn.uicontrols.$checkbox.setValue('chkNotify', false);
            syn.$l.eventLog('btnSetValueFalse_click', 'chkNotify: false');
        },

        btnToggleValue_click() {
            syn.uicontrols.$checkbox.toggleValue('chkNotify');
            syn.$l.eventLog('btnToggleValue_click', 'toggled');
        },

        btnClear_click() {
            syn.uicontrols.$checkbox.clear('chkNotify');
            syn.$l.eventLog('btnClear_click', 'cleared');
        }
    }
}
