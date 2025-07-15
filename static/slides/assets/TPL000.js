'use strict';
let $TPL000 = {
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
                var gridID = 'grdDataList';
                if (syn.uicontrols.$auigrid.checkEditValue(gridID) == false) {
                    return false;
                }

                if (syn.uicontrols.$auigrid.checkEmptyValueCol(gridID, 'EmailID') == true) {
                    syn.$w.alert('이메일을 입력하세요');
                    return false;
                }

                if (syn.uicontrols.$auigrid.checkUniqueValueCol(gridID, 'EmailID') == false) {
                    syn.$w.alert('고유한 이메일을 입력하세요');
                    return false;
                }

                if (syn.uicontrols.$auigrid.checkEmptyValueCols(gridID, ['RoleDevelop', 'RoleBusiness', 'RoleOperation', 'RoleManaged'], '0') == true) {
                    syn.$w.alert('개발, 업무, 운영, 관리 역할중 하나를 선택 하세요');
                    return false;
                }

                // syn.$w.transactionAction('MD01');
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
            inputs: [{ type: 'Row', dataFieldID: 'MainForm' }],
            outputs: [{ type: 'Grid', dataFieldID: 'DataList', clear: true }]
        },

        MD01: {
            inputs: [{ type: 'List', dataFieldID: 'DataList' }],
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
        },

        pageResizing: function (dimension) {
            var adjustHeight = (dimension.windowHeight - $this.prop.adjustHeight);
            if (syn.$m.hasClass('divDataListFooter', 'hidden') == false) {
                adjustHeight = adjustHeight - 104;
            }
            syn.uicontrols.$auigrid.setControlSize('grdDataList', { height: adjustHeight });
        }
    },

    event: {
        grdDataList_afterSelectionEnd(elID, rowIndex, columnIndex, dataField, value) {
            var gridID = 'grdDataList';
            var notes = syn.uicontrols.$auigrid.getDataAtCell(gridID, rowIndex, 'Notes');
            txtNotes.value = notes;
        },

        grdDataList_afterChange(elID, rowIndex, columnIndex, dataField, oldValue, newValue, item) {
            oldValue = $object.isNullOrUndefined(oldValue) == true ? '' : oldValue;

            var columns = ['MemberStatusName', 'RoleDevelop', 'RoleBusiness', 'RoleOperation', 'RoleManaged', 'ExpiredAt'];
            if (columns.indexOf(dataField) > -1 && oldValue != newValue) {
                if (syn.uicontrols.$auigrid.getDataAtCell(elID, rowIndex, 'ModifiedMemberNo') != syn.$w.User.UserNo) {
                    syn.uicontrols.$auigrid.setDataAtCell(elID, rowIndex, 'ModifiedMemberNo', syn.$w.User.UserNo);
                    syn.uicontrols.$auigrid.setDataAtCell(elID, rowIndex, 'ModifiedMemberName', syn.$w.User.UserName);
                }
            }
        },

        grdDataList_cellEditBegin(evt) {
            var result = true;
            var gridID = 'grdDataList';
            var rowIndex = evt.rowIndex;
            var dataField = evt.dataField;
            if (['ApplicationNo', 'EmailID'].indexOf(dataField) > -1) {
                var flag = syn.uicontrols.$auigrid.getFlag(gridID, rowIndex);
                if (flag != 'C') {
                    result = false;
                }
            }
            return result;
        },

        btnNewDataList_click(evt) {
            var windowID = 'TPL000';

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
        },

        btnAddDataList_click() {
            syn.uicontrols.$auigrid.insertRow('grdDataList', {
                amount: 1,
                values: {
                    ApplicationNo: syn.$w.Variable.ApplicationNo,
                    MemberStatus: 'R',
                    MemberStatusName: '요청',
                    CreatedMemberNo: syn.$w.User.UserNo,
                    CreatedMemberName: syn.$w.User.UserName
                },
                focusColumnID: 'EmailID'
            });
        },

        btnRemoveDataList_click() {
            syn.uicontrols.$auigrid.removeRow('grdDataList');
        },

        btnToogleFooter_click() {
            var iconEL = syn.$l.querySelector('#btnToogleFooter i');

            if (syn.$m.hasClass('divDataListFooter', 'hidden') == true) {
                syn.$m.removeClass('divDataListFooter', 'hidden');
                syn.$m.removeClass(iconEL, 'ti-eye-up');
                syn.$m.addClass(iconEL, 'ti-eye-down');
            }
            else {
                syn.$m.addClass('divDataListFooter', 'hidden');
                syn.$m.removeClass(iconEL, 'ti-eye-down');
                syn.$m.addClass(iconEL, 'ti-eye-up');
            }

            syn.$w.frameResizeEvent();
        },

        txtNotes_blur() {
            var gridID = 'grdDataList';
            var activeRow = syn.uicontrols.$auigrid.getActiveRowIndex(gridID);
            syn.uicontrols.$auigrid.setDataAtCell(gridID, activeRow, 'Notes', syn.$l.get('txtNotes').value.trim());
        }
    },

    method: {
        search() {
            // syn.$w.transactionAction('LD01');
        },
    },
}
