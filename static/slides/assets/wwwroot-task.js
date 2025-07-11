const axios = require('axios');
const { URLSearchParams, URL } = require('url');

const jenkinsUrl = 'http://localhost:8080';
const jobName = 'wwwroot-Task';
const username = 'handstack';
const apiToken = '1111111111111111111111111111111111'; // API Token 발급 키 붙여넣기

const auth = { username, password: apiToken };

function normalizeJenkinsUrl(url) {
    if (!url) return url;

    try {
        const parsedUrl = new URL(url);
        const externalBaseUrl = new URL(jenkinsUrl);

        if (parsedUrl.origin !== externalBaseUrl.origin) {
            parsedUrl.protocol = externalBaseUrl.protocol;
            parsedUrl.host = externalBaseUrl.host;
            parsedUrl.port = externalBaseUrl.port;

            return parsedUrl.toString();
        }
        return url;
    } catch (error) {
        console.error(`URL 정규화 실패 (입력값: ${url}):`, error.message);
        return url;
    }
}

async function getCrumb() {
    try {
        const res = await axios.get(`${jenkinsUrl}/crumbIssuer/api/json`, { auth });
        return { [res.data.crumbRequestField]: res.data.crumb };
    } catch (err) {
        console.error('Crumb 발급 실패:', err.response?.statusText || err.message);
        throw err;
    }
}

async function triggerBuildWithParams(params = {}) {
    try {
        const crumbHeader = await getCrumb();
        const queryParams = new URLSearchParams(params).toString();
        const res = await axios.post(
            `${jenkinsUrl}/job/${jobName}/buildWithParameters?${queryParams}`,
            null,
            { auth, headers: { ...crumbHeader } }
        );
        const queueUrl = res.headers['location'];
        if (!queueUrl) {
            throw new Error('응답 헤더에서 빌드 큐 Location을 찾을 수 없습니다.');
        }
        console.log('빌드 트리거 완료. 빌드 큐:', queueUrl);
        return queueUrl;
    } catch (err) {
        console.error('빌드 트리거 실패:', err.response?.data || err.message);
        return null;
    }
}

async function getBuildLog(buildUrl) {
    try {
        const logRes = await axios.get(`${buildUrl}logText/progressiveText`, { auth });
        return logRes.data;
    } catch (error) {
        console.error(`로그 가져오기 오류 (URL: ${buildUrl}logText/progressiveText):`, error.message);
        return `로그를 가져올 수 없습니다: ${error.message}`;
    }
}

async function waitForBuildToComplete(queueItemUrl) {
    const normalizedQueueUrl = normalizeJenkinsUrl(queueItemUrl);
    if (!normalizedQueueUrl) {
        console.error('유효하지 않은 큐 URL입니다.');
        return null;
    }
    console.log('사용할 빌드 큐 URL:', normalizedQueueUrl);

    let buildInfo = null;
    const POLLING_INTERVAL = 5000;
    const MAX_WAIT_TIME = 300000;
    let totalWaitTime = 0;

    console.log('빌드 시작 대기 중...');
    while (totalWaitTime < MAX_WAIT_TIME) {
        try {
            const queueRes = await axios.get(`${normalizedQueueUrl}api/json`, { auth });

            if (queueRes.data.executable) {
                buildInfo = queueRes.data.executable;
                buildInfo.url = normalizeJenkinsUrl(buildInfo.url);
                console.log(`빌드 시작됨. 빌드 번호: ${buildInfo.number}, URL: ${buildInfo.url}`);
                break;
            }
        } catch (error) {
            console.warn('빌드 큐 상태 확인 중 참고:', error.message);
            if (error.name === 'AggregateError') {
                console.error(`AggregateError 발생: '${normalizedQueueUrl}api/json' 주소에 접근할 수 없습니다. 네트워크 연결 상태나 Jenkins URL 설정을 확인하세요.`);
            }
        }
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        totalWaitTime += POLLING_INTERVAL;
    }

    if (!buildInfo) {
        console.error('시간 초과: 빌드가 큐에서 시작되지 않았습니다.');
        return null;
    }

    console.log(`빌드 #${buildInfo.number} 완료 대기 중...`);
    totalWaitTime = 0;
    while (totalWaitTime < MAX_WAIT_TIME) {
        try {
            const buildRes = await axios.get(`${buildInfo.url}api/json`, { auth });

            if (!buildRes.data.building) {
                console.log(`빌드 #${buildInfo.number} 완료. 결과: ${buildRes.data.result}`);
                const buildLog = await getBuildLog(buildInfo.url);
                console.log(`\n--- 빌드 #${buildInfo.number} 콘솔 출력 ---`);
                console.log(buildLog);
                console.log(`--- 콘솔 출력 종료 ---`);
                return {
                    result: buildRes.data.result,
                    url: buildRes.data.url,
                    number: buildRes.data.number
                };
            }
        } catch (error) {
            console.error(`빌드 #${buildInfo.number} 상태 확인 중 오류 발생:`, error.message);
            if (error.name === 'AggregateError') {
                console.error(`AggregateError 발생: '${buildInfo.url}api/json' 주소에 접근할 수 없습니다.`);
            }
        }
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        totalWaitTime += POLLING_INTERVAL;
    }

    console.error(`시간 초과: 빌드 #${buildInfo.number}가 시간 내에 완료되지 않았습니다.`);
    return null;
}

async function triggerAndMonitorBuild({ TASK_COMMAND, TASK_SETTING, TASK_ARGUMENTS }) {
    console.log(`\n--- 새로운 빌드 요청 시작 ---`);

    const jenkinsParams = {
        TASK_COMMAND: TASK_COMMAND || '',
        TASK_SETTING: TASK_SETTING || '',
        TASK_ARGUMENTS: TASK_ARGUMENTS || ''
    };
    console.log('Jenkins에 전달될 파라미터:', jenkinsParams);

    const queueUrl = await triggerBuildWithParams(jenkinsParams);
    if (!queueUrl) {
        console.log('프로세스 중단: 빌드를 시작할 수 없습니다.');
        return;
    }

    const finalBuildStatus = await waitForBuildToComplete(queueUrl);

    if (!finalBuildStatus) {
        console.log('프로세스 중단: 빌드 상태를 최종 확인할 수 없습니다.');
        return;
    }

    console.log(`--- 빌드 요청 및 모니터링 프로세스 완료 ---`);
    console.log(`최종 결과: ${JSON.stringify(finalBuildStatus)}`);
}

function printUsage() {
    console.log(`
wwwroot-task Jenkins 빌드를 원격으로 실행하고 결과를 모니터링합니다.

사용법:
  node wwwroot-task.js [TASK_COMMAND] [TASK_SETTING] [TASK_ARGUMENTS]

인자 (Arguments):
  [TASK_COMMAND]    (선택) Jenkins에 전달할 작업 명령어입니다. (기본값: 없음)
  [TASK_SETTING]    (선택) Jenkins에 전달할 작업 설정입니다. (기본값: 없음)
  [TASK_ARGUMENTS]  (선택) Jenkins에 전달할 작업 인자입니다. 공백이 포함된 경우 따옴표로 감싸세요.

옵션 (Options):
  --help, -h        이 도움말 메시지를 출력합니다.

예시:
  node wwwroot-task.js "copy"
  node wwwroot-task.js "www"
  node wwwroot-task.js "syn"
  node wwwroot-task.js --help
    `);
}

(async () => {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        printUsage();
        process.exit(0);
    }

    const TASK_COMMAND = args[0] || '';
    const TASK_SETTING = args[1] || '';
    const TASK_ARGUMENTS = args[2] || '';
    
    await triggerAndMonitorBuild({
        TASK_COMMAND,
        TASK_SETTING,
        TASK_ARGUMENTS
    });
})();