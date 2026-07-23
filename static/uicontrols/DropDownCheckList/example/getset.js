'use strict';
let $getset = {
    config: {
        dataSource: {}
    },

    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', syn.uicontrols.$multiselect.getValue('ddlGrade'));
        },

        btnGetSelectedValue_click() {
            syn.$l.eventLog('btnGetSelectedValue_click', JSON.stringify(syn.uicontrols.$multiselect.getSelectedValue('ddlGrade')));
        },

        btnGetSelectedText_click() {
            syn.$l.eventLog('btnGetSelectedText_click', JSON.stringify(syn.uicontrols.$multiselect.getSelectedText('ddlGrade')));
        },

        btnSetValue_click() {
            // setValue는 호출 시 기존 선택을 모두 해제한 뒤 지정한 값만 다시 선택합니다.
            syn.uicontrols.$multiselect.setValue('ddlGrade', ['A', 'C']);
        },

        btnClear_click() {
            syn.uicontrols.$multiselect.clear('ddlGrade');
        },

        btnLoadData_click() {
            var dataSource = {
                CodeColumnID: 'CodeID',
                ValueColumnID: 'CodeValue',
                DataSource: [
                    { CodeID: 'S', CodeValue: '특급' },
                    { CodeID: 'A', CodeValue: 'A등급' },
                    { CodeID: 'B', CodeValue: 'B등급' }
                ]
            };

            syn.uicontrols.$multiselect.loadData('ddlGrade', dataSource, false);
        }
    }
}
