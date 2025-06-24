const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

class MarpServer {
    constructor() {
        this.slidesDir = path.join(__dirname, '../', 'slides'); // __dirname 추가하여 절대 경로 기준 명확화
        this.watcher = null;
        this.isProcessing = new Set(); // 동시 처리 방지
        this.marpCommand = null; // marp 명령어 경로 캐시
    }

    // marp 명령어 경로 찾기
    async findMarpCommand() {
        if (this.marpCommand) {
            return this.marpCommand;
        }

        const marpCmdName = 'marp'; // 테스트할 명령어 이름

        try {
            // 'marp --version' 명령어를 실행하여 Marp CLI가 설치되어 있는지 확인
            const testProcess = spawn(marpCmdName, ['--version'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true // 쉘을 통해 실행하여 PATH에서 'marp' 명령어를 찾음
            });

            const result = await new Promise((resolve) => {
                let output = '';
                testProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                testProcess.stderr.on('data', (data) => {
                    // 에러 스트림도 출력에 포함하여 디버깅 용이
                    // Marp --version은 정상적인 출력도 stderr로 보내는 경우가 있습니다.
                    output += data.toString();
                });

                testProcess.on('close', (code) => {
                    resolve({ code, output });
                });

                testProcess.on('error', (err) => {
                    // spawn 자체에서 에러 발생 시 (예: 명령어 PATH에 없음)
                    resolve({ code: -1, output: '', error: err });
                });
            });

            // spawn 자체에서 에러가 발생했는지 확인
            if (result.error) {
                throw new Error(`'${marpCmdName}' 명령어를 실행할 수 없습니다. 시스템 PATH에 없거나 권한 문제가 있을 수 있습니다. (${result.error.message})`);
            }

            // 명령어가 성공적으로 실행되었고, Marp CLI임을 나타내는 출력이 포함되어 있는지 확인
            if (result.code === 0 && result.output.includes('marp')) {
                this.marpCommand = marpCmdName;
                console.log(`✅ Marp 명령어 발견: ${marpCmdName}`);
                return marpCmdName;
            } else {
                // 명령어가 실행되었으나, 성공하지 못했거나 Marp CLI가 아닌 경우
                throw new Error(`'${marpCmdName}' 명령어가 올바른 Marp CLI가 아니거나 실행에 실패했습니다. (종료 코드: ${result.code}, 출력: ${result.output.trim()})`);
            }
        } catch (error) {
            console.error(`❌ Marp 명령어 확인 중 오류 발생: ${error.message}`);
            // 최종적으로 사용자에게 보여줄 메시지
            throw new Error('Marp 명령어를 찾을 수 없습니다. @marp-team/marp-cli가 전역으로 설치되어 있는지 확인하세요.');
        }
    }

    // 디렉토리 존재 확인 및 생성
    ensureDirectoryExists() {
        if (!fs.existsSync(this.slidesDir)) {
            console.log(`📁 디렉토리가 존재하지 않습니다: ${this.slidesDir}`);
            console.log('📁 디렉토리를 생성합니다...');
            fs.mkdirSync(this.slidesDir, { recursive: true });
        }
        console.log(`📂 모니터링 디렉토리: ${this.slidesDir}`);
    }

    // marp 명령어 실행
    async executeMarp(mdFilePath) {
        try {
            const fileName = path.basename(mdFilePath, '.md');
            const htmlFilePath = path.join(path.dirname(mdFilePath), `${fileName}.html`);

            console.log(`🔄 Marp 실행 중: ${mdFilePath}`);

            // marp 명령어 경로 확인
            const marpCmd = await this.findMarpCommand();

            // 파일 경로에 공백 등이 있을 경우를 대비해 JSON.stringify로 묶어줍니다.
            // 이는 쉘 명령어로 전달될 때 인수를 안전하게 처리하는 일반적인 방법입니다.
            const quotedMdPath = JSON.stringify(mdFilePath);
            const quotedHtmlPath = JSON.stringify(htmlFilePath);

            // 중요: 여기에 --no-stdin 옵션을 추가합니다.
            // 이는 Marp CLI가 stdin에서 입력을 기다리지 않도록 합니다.
            const fullCommandString = `${marpCmd} ${quotedMdPath} -o ${quotedHtmlPath} --no-stdin`;

            console.log(`DEBUG: 실행될 전체 명령어: ${fullCommandString}`);

            return new Promise((resolve, reject) => {
                // spawn의 첫 인수로 전체 명령어를 넘기고, shell: true로 실행
                // 이렇게 하면 쉘이 `marp "..." -o "..." --no-stdin` 전체를 파싱하여 실행합니다.
                const marpProcess = spawn(fullCommandString, [], {
                    stdio: ['pipe', 'pipe', 'pipe'], // 표준 입출력 파이프 연결
                    shell: true, // 쉘을 통해 명령어를 실행 (PATH 환경변수 사용 등)
                    cwd: path.dirname(mdFilePath) // 마크다운 파일이 있는 디렉토리에서 실행
                });

                let stdout = '';
                let stderr = '';

                marpProcess.stdout.on('data', (data) => {
                    const chunk = data.toString();
                    stdout += chunk;
                    console.log(`DEBUG: ${chunk.trim()}`);
                });

                marpProcess.stderr.on('data', (data) => {
                    const chunk = data.toString();
                    stderr += chunk;
                    console.error(`DEBUG: ${chunk.trim()}`);
                });

                marpProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log(`✅ HTML 생성 완료: ${htmlFilePath}`);
                        if (stdout.trim()) console.log(`📝 최종 출력: ${stdout.trim()}`);
                        resolve(htmlFilePath);
                    } else {
                        console.error(`❌ Marp 실행 실패 (코드: ${code}): ${mdFilePath}`);
                        if (stderr.trim()) console.error(`🔥 최종 오류: ${stderr.trim()}`);
                        reject(new Error(`Marp failed with code ${code}: ${stderr}`));
                    }
                });

                marpProcess.on('error', (error) => {
                    // spawn 자체에서 에러 발생 시 (예: 명령어 실행 파일 경로 잘못됨)
                    console.error(`❌ Marp 프로세스 오류 (spawn 실패): ${error.message}`);
                    reject(error);
                });
            });
        } catch (error) {
            console.error(`❌ Marp 명령어 실행 준비 실패: ${error.message}`);
            throw error;
        }
    }

    // HTML 파일 삭제
    deleteHtmlFile(mdFilePath) {
        const fileName = path.basename(mdFilePath, '.md');
        const htmlFilePath = path.join(path.dirname(mdFilePath), `${fileName}.html`);

        if (fs.existsSync(htmlFilePath)) {
            try {
                fs.unlinkSync(htmlFilePath);
                console.log(`🗑️  HTML 파일 삭제 완료: ${htmlFilePath}`);
            } catch (error) {
                console.error(`❌ HTML 파일 삭제 실패: ${htmlFilePath}`, error.message);
            }
        } else {
            console.log(`ℹ️  삭제할 HTML 파일이 없습니다: ${htmlFilePath}`);
        }
    }

    // 파일 변경 처리
    async handleFileChange(filePath, eventType) {
        // 중복 처리 방지 (짧은 시간 내에 여러 이벤트 발생 방지)
        if (this.isProcessing.has(filePath)) {
            console.log(`⏳ 이미 처리 중인 파일: ${filePath}`);
            return;
        }

        // 마크다운 파일만 처리
        if (!filePath.endsWith('.md')) {
            return;
        }

        this.isProcessing.add(filePath);

        try {
            const relativePath = path.relative(this.slidesDir, filePath);
            console.log(`\n📋 파일 ${eventType}: ${relativePath}`);
            console.log(`⏰ 시간: ${new Date().toLocaleString()}`);

            if (eventType === 'unlink') {
                // 파일 삭제 시 HTML 파일도 삭제
                this.deleteHtmlFile(filePath);
            } else if (eventType === 'add' || eventType === 'change') {
                // 파일 생성/변경 시 HTML 생성
                await this.executeMarp(filePath);
            }
        } catch (error) {
            console.error(`❌ 파일 처리 중 오류 발생: ${filePath}`, error.message);
        } finally {
            // 처리 완료 후 일정 시간 뒤에 Set에서 제거 (연속된 변경 이벤트 방지)
            setTimeout(() => {
                this.isProcessing.delete(filePath);
            }, 500); // 0.5초 후 제거
        }
    }

    // 초기 HTML 파일 생성 (기존 마크다운 파일들 처리)
    async processExistingFiles() {
        console.log('\n🔍 기존 마크다운 파일 검색 중...');

        try {
            const files = fs.readdirSync(this.slidesDir);
            const mdFiles = files.filter(file => file.endsWith('.md'));

            if (mdFiles.length === 0) {
                console.log('📄 기존 마크다운 파일이 없습니다.');
                return;
            }

            console.log(`📄 발견된 마크다운 파일: ${mdFiles.length}개`);

            for (const file of mdFiles) {
                const filePath = path.join(this.slidesDir, file);
                try {
                    await this.executeMarp(filePath);
                } catch (error) {
                    console.error(`❌ 기존 파일 처리 실패: ${file}`, error.message);
                }
            }

            console.log('✅ 기존 파일 처리 완료\n');
        } catch (error) {
            console.error('❌ 기존 파일 검색 중 오류:', error.message);
        }
    }

    // 서버 시작
    async start() {
        console.log('🚀 Marp 파일 감시 서버 시작...\n');

        try {
            // marp 명령어 확인
            await this.findMarpCommand();
        } catch (error) {
            console.error('❌ Marp 설치 확인 실패:', error.message);
            console.log('\n💡 해결 방법:');
            console.log('Marp CLI를 전역으로 설치하세요: npm install -g @marp-team/marp-cli');
            process.exit(1);
        }

        // 디렉토리 확인 및 생성
        this.ensureDirectoryExists();

        // 기존 파일들 처리
        await this.processExistingFiles();

        const watchPath = path.join(this.slidesDir, '**/*.md');

        // 파일 감시 시작
        console.log('👀 파일 감시 시작...');
        console.log('📁 감시 경로 (Glob 패턴 포함):', watchPath);
        console.log('📂 감시 디렉토리 절대 경로:', path.resolve(this.slidesDir)); // 절대 경로 확인
        console.log('📝 대상 파일: *.md');
        console.log('⚡ 서버가 실행 중입니다. Ctrl+C로 종료하세요.\n');

        this.watcher = chokidar.watch(watchPath, {
            ignored: /(^|[\/\\])\../, // 숨김 파일 무시
            persistent: true,
            ignoreInitial: false,
            usePolling: true,
            interval: 300,
            awaitWriteFinish: { // 파일 쓰기 완료 대기 (특히 큰 파일이나 빠르게 변경될 때 유용)
                stabilityThreshold: 200, // 파일 쓰기 완료 후 200ms 대기
                pollInterval: 100 // 100ms마다 변경 확인
            }
        });

        // 이벤트 리스너 등록
        this.watcher
            .on('all', (event, filePath) => {
                console.log(`[CHOKIDAR DEBUG] Event: ${event}, Path: ${filePath}`);
            })
            .on('add', (filePath) => this.handleFileChange(filePath, 'add'))
            .on('change', (filePath) => this.handleFileChange(filePath, 'change'))
            .on('unlink', (filePath) => this.handleFileChange(filePath, 'unlink'))
            .on('error', (error) => console.error('❌ 파일 감시 오류:', error.message));
    }

    // 서버 종료
    async stop() {
        console.log('\n🛑 서버 종료 중...');

        if (this.watcher) {
            await this.watcher.close();
            console.log('👀 파일 감시 중지');
        }

        console.log('✅ 서버 종료 완료');
        process.exit(0);
    }
}

// 서버 인스턴스 생성 및 시작
const server = new MarpServer();

// 시그널 처리 (Ctrl+C, 프로세스 종료)
process.on('SIGINT', () => server.stop());
process.on('SIGTERM', () => server.stop());

// 처리되지 않은 예외 처리
process.on('uncaughtException', (error) => {
    console.error('❌ 처리되지 않은 예외:', error.message);
    server.stop();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 처리되지 않은 Promise 거부:', reason);
    server.stop();
});

// 서버 시작
server.start().catch((error) => {
    console.error('❌ 서버 시작 실패:', error.message);
    process.exit(1);
});