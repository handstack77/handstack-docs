const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

class MarpServer {
    constructor() {
        this.slidesDir = path.join(__dirname, 'static', 'slides');
        this.watcher = null;
        this.isProcessing = new Set();
        this.marpCommand = null;
    }

    async findMarpCommand() {
        if (this.marpCommand) {
            return this.marpCommand;
        }

        const marpCmdName = 'marp';

        try {
            const testProcess = spawn(marpCmdName, ['--version'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            const result = await new Promise((resolve) => {
                let output = '';
                testProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                testProcess.stderr.on('data', (data) => {
                    output += data.toString();
                });

                testProcess.on('close', (code) => {
                    resolve({ code, output });
                });

                testProcess.on('error', (err) => {
                    resolve({ code: -1, output: '', error: err });
                });
            });

            if (result.error) {
                throw new Error(`'${marpCmdName}' 명령어를 실행할 수 없습니다. 시스템 PATH에 없거나 권한 문제가 있을 수 있습니다. (${result.error.message})`);
            }

            if (result.code === 0 && result.output.includes('marp')) {
                this.marpCommand = marpCmdName;
                console.log(`Marp 명령어 발견: ${marpCmdName}`);
                return marpCmdName;
            } else {
                throw new Error(`'${marpCmdName}' 명령어가 올바른 Marp CLI가 아니거나 실행에 실패했습니다. (종료 코드: ${result.code}, 출력: ${result.output.trim()})`);
            }
        } catch (error) {
            console.error(`Marp 명령어 확인 중 오류 발생: ${error.message}`);
            throw new Error('Marp 명령어를 찾을 수 없습니다. @marp-team/marp-cli가 전역으로 설치되어 있는지 확인하세요.');
        }
    }

    ensureDirectoryExists() {
        if (!fs.existsSync(this.slidesDir)) {
            console.log(`디렉토리가 존재하지 않습니다: ${this.slidesDir}`);
            console.log('디렉토리를 생성합니다...');
            fs.mkdirSync(this.slidesDir, { recursive: true });
        }
        console.log(`모니터링 디렉토리: ${this.slidesDir}`);
    }

    async executeMarp(mdFilePath) {
        try {
            const fileName = path.basename(mdFilePath, '.md');
            const htmlFilePath = path.join(path.dirname(mdFilePath), `${fileName}.html`);

            console.log(`Marp 실행 중: ${mdFilePath}`);

            const marpCmd = await this.findMarpCommand();

            const quotedMdPath = JSON.stringify(mdFilePath);
            const quotedHtmlPath = JSON.stringify(htmlFilePath);

            const fullCommandString = `${marpCmd} ${quotedMdPath} -o ${quotedHtmlPath} --no-stdin`;

            console.log(`DEBUG: 실행될 전체 명령어: ${fullCommandString}`);

            return new Promise((resolve, reject) => {
                const marpProcess = spawn(fullCommandString, [], {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: true,
                    cwd: path.dirname(mdFilePath)
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
                        console.log(`HTML 생성 완료: ${htmlFilePath}`);
                        if (stdout.trim()) console.log(`최종 출력: ${stdout.trim()}`);
                        resolve(htmlFilePath);
                    } else {
                        console.error(`Marp 실행 실패 (코드: ${code}): ${mdFilePath}`);
                        if (stderr.trim()) console.error(`최종 오류: ${stderr.trim()}`);
                        reject(new Error(`Marp failed with code ${code}: ${stderr}`));
                    }
                });

                marpProcess.on('error', (error) => {
                    console.error(`Marp 프로세스 오류 (spawn 실패): ${error.message}`);
                    reject(error);
                });
            });
        } catch (error) {
            console.error(`Marp 명령어 실행 준비 실패: ${error.message}`);
            throw error;
        }
    }

    deleteHtmlFile(mdFilePath) {
        const fileName = path.basename(mdFilePath, '.md');
        const htmlFilePath = path.join(path.dirname(mdFilePath), `${fileName}.html`);

        if (fs.existsSync(htmlFilePath)) {
            try {
                fs.unlinkSync(htmlFilePath);
                console.log(`HTML 파일 삭제 완료: ${htmlFilePath}`);
            } catch (error) {
                console.error(`HTML 파일 삭제 실패: ${htmlFilePath}`, error.message);
            }
        } else {
            console.log(`삭제할 HTML 파일이 없습니다: ${htmlFilePath}`);
        }
    }

    async handleFileChange(filePath, eventType) {
        if (this.isProcessing.has(filePath)) {
            console.log(`이미 처리 중인 파일: ${filePath}`);
            return;
        }

        if (!filePath.endsWith('.md')) {
            return;
        }

        this.isProcessing.add(filePath);

        try {
            const relativePath = path.relative(this.slidesDir, filePath);
            console.log(`\n파일 ${eventType}: ${relativePath}`);
            console.log(`시간: ${new Date().toLocaleString()}`);

            if (eventType === 'unlink') {
                this.deleteHtmlFile(filePath);
            } else if (eventType === 'add' || eventType === 'change') {
                await this.executeMarp(filePath);
            }
        } catch (error) {
            console.error(`파일 처리 중 오류 발생: ${filePath}`, error.message);
        } finally {
            setTimeout(() => {
                this.isProcessing.delete(filePath);
            }, 500);
        }
    }

    async processExistingFiles() {
        console.log('\n기존 마크다운 파일 검색 중...');

        try {
            const files = fs.readdirSync(this.slidesDir);
            const mdFiles = files.filter(file => file.endsWith('.md'));

            if (mdFiles.length === 0) {
                console.log('기존 마크다운 파일이 없습니다.');
                return;
            }

            console.log(`발견된 마크다운 파일: ${mdFiles.length}개`);

            for (const file of mdFiles) {
                const filePath = path.join(this.slidesDir, file);
                try {
                    await this.executeMarp(filePath);
                } catch (error) {
                    console.error(`기존 파일 처리 실패: ${file}`, error.message);
                }
            }

            console.log('기존 파일 처리 완료\n');
        } catch (error) {
            console.error('기존 파일 검색 중 오류:', error.message);
        }
    }

    async start() {
        console.log('Marp 파일 감시 서버 시작...\n');

        try {
            await this.findMarpCommand();
        } catch (error) {
            console.error('Marp 설치 확인 실패:', error.message);
            console.log('\n해결 방법:');
            console.log('Marp CLI를 전역으로 설치하세요: npm install -g @marp-team/marp-cli');
            process.exit(1);
        }

        this.ensureDirectoryExists();

        await this.processExistingFiles();

        const watchPath = path.join(this.slidesDir, '**/*.md');

        console.log('파일 감시 시작...');
        console.log('감시 경로 (Glob 패턴 포함):', watchPath);
        console.log('감시 디렉토리 절대 경로:', path.resolve(this.slidesDir));
        console.log('대상 파일: *.md');
        console.log('서버가 실행 중입니다. Ctrl+C로 종료하세요.\n');

        this.watcher = chokidar.watch(watchPath, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
            ignoreInitial: false,
            usePolling: true,
            interval: 300,
            awaitWriteFinish: {
                stabilityThreshold: 200,
                pollInterval: 100
            }
        });

        this.watcher
            .on('all', (event, filePath) => {
                console.log(`[CHOKIDAR DEBUG] Event: ${event}, Path: ${filePath}`);
            })
            .on('add', (filePath) => this.handleFileChange(filePath, 'add'))
            .on('change', (filePath) => this.handleFileChange(filePath, 'change'))
            .on('unlink', (filePath) => this.handleFileChange(filePath, 'unlink'))
            .on('error', (error) => console.error('파일 감시 오류:', error.message));
    }

    async stop() {
        console.log('\n서버 종료 중...');

        if (this.watcher) {
            await this.watcher.close();
            console.log('파일 감시 중지');
        }

        console.log('서버 종료 완료');
        process.exit(0);
    }
}

const server = new MarpServer();

process.on('SIGINT', () => server.stop());
process.on('SIGTERM', () => server.stop());

process.on('uncaughtException', (error) => {
    console.error('처리되지 않은 예외:', error.message);
    server.stop();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('처리되지 않은 Promise 거부:', reason);
    server.stop();
});

server.start().catch((error) => {
    console.error('서버 시작 실패:', error.message);
    process.exit(1);
});