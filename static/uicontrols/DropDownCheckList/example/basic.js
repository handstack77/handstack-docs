'use strict';
let $basic = {
    config: {
        dataSource: {}
    },

    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', syn.uicontrols.$multiselect.getValue('ddlFruit'));
        },

        btnSetValue_click() {
            // setValue는 호출 시 기존 선택을 모두 해제한 뒤 지정한 값만 다시 선택합니다.
            syn.uicontrols.$multiselect.setValue('ddlFruit', ['banana', 'grape']);
        },

        btnClear_click() {
            syn.uicontrols.$multiselect.clear('ddlFruit');
        }
    }
}
