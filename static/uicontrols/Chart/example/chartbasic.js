'use strict';
let $chartbasic = {
    prop: {
        // $chart.setValue는 Highcharts 시리즈 객체 배열([{ name, data }, ...])을 그대로 받습니다.
        // (참고: $chartjs.setValue는 이와 달리 "행 배열 + 컬럼 메타데이터"를 받습니다. API.md 참고)
        newSeries: [
            { name: '2026(예상)', data: [25, 40, 33, 50] }
        ]
    },

    event: {
        btnGetValue_click() {
            // getValue는 [{ name, data }] 형태로 각 시리즈 값을 돌려줍니다.
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$chart.getValue('chtSales')));
        },

        btnSetValue_click() {
            // $chart.setValue는 기존 시리즈를 모두 제거한 뒤 newSeries를 addSeries로 반영합니다(예외 없이 정상 동작).
            syn.uicontrols.$chart.setValue('chtSales', $this.prop.newSeries);
            syn.$l.eventLog('btnSetValue_click', '새 시리즈로 교체 완료');
        },

        btnClear_click() {
            syn.uicontrols.$chart.clear('chtSales');
        },

        btnToImage_click() {
            // 주의(API.md "알려진 이슈" 참고): toImage 내부에서 getChartControl(elID)가 반환하는
            // Highcharts.Chart 인스턴스를 control.chart로 다시 감싸 읽으려다 TypeError가 발생합니다.
            try {
                syn.uicontrols.$chart.toImage('chtSales', 'sales-chart');
            } catch (error) {
                syn.$l.eventLog('btnToImage_click', '알려진 버그(control.chart 오참조)로 예외 발생: ' + error.message, 'Debug');
            }
        }
    }
}
