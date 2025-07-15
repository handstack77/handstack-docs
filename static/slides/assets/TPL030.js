'use strict';
let $TPL030 = {
    config: {
        actionButtons: [{
            command: 'search',
            icon: 'search',
            text: '조회',
            action(evt) {
                $this.method.search();
            }
        },
        {
            command: 'save',
            icon: 'edit',
            text: '저장',
            class: 'btn-primary',
            action(evt) {
            }
        },
        {
            command: 'refresh',
            icon: 'refresh',
            action(evt) {
                location.reload();
            }
        }]
    },

    prop: {
        adjustHeight: 424
    },

    transaction: {
        LD01: {
            inputs: [{ type: 'Row', dataFieldID: 'MainForm' }]
        },

        MD01: {
            inputs: [{ type: 'Form', dataFieldID: 'MainForm' }],
            outputs: [],
            callback: (error, responseObject, addtionalData, correlationID) => {
                if ($string.isNullOrEmpty(error) == true) {
                    syn.$w.notify('success', '저장 되었습니다');
                    $this.method.search();
                }
                else {
                    syn.$w.notify('warning', '저장에 실패했습니다. 오류: ' + error);
                }
            }
        },
    },

    hook: {
        pageLoad() {
            syn.$l.get('txtApplicationNo').value = syn.$w.Variable.ApplicationNo;

            $this.method.search();
        }
    },

    event: {
        btnNewDataList_click(evt) {
            var windowID = 'TPL030';

            var popupOptions = $object.clone(syn.$w.popupOptions);
            popupOptions.title = '신규 항목';
            popupOptions.src = 'HML011.html';
            popupOptions.channelID = windowID;
            popupOptions.width = 620;
            popupOptions.height = 690;
            popupOptions.notifyActions.push({
                actionID: 'response',
                handler(evt, val) {
                    syn.$w.windowClose(windowID);
                    $this.method.search();
                }
            });

            syn.$w.windowOpen(windowID, popupOptions, (elID) => {
                console.log(elID + ' window Open');
            });
        }
    },

    method: {
        search() {
            // syn.$w.transactionAction('LD01');
        },
    },
}
