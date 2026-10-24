@echo off
chcp 65001

REM publish.bat win Debug

REM win, linux, osx
set os_mode=%1
if "%os_mode%" == "" set os_mode=win

REM Debug, Release
set configuration_mode=%2
if "%configuration_mode%" == "" set configuration_mode=Debug

REM x64, x86, arm64
set arch_mode=%3
if "%arch_mode%" == "" set arch_mode=x64

echo os_mode: %os_mode%, configuration_mode: %configuration_mode%, arch_mode: %arch_mode%

REM 에이전트 스킬 배포 zip(static/agent-skills/)을 만듭니다. 실패해도 사이트 배포는 계속합니다(Python 3.10 이상 필요).
call npm run package:agent
if errorlevel 1 echo [경고] npm run package:agent 실패: handstack-developer-skills.zip 없이 계속합니다.

call npm run build

REM MCP 서버(mcp/)가 실행에 쓰는 운영 의존성만 설치합니다. 사이트 호스트가 배포 폴더의 mcp/ 를 직접 실행합니다.
call npm ci --omit=dev --prefix mcp

rmdir /s /q ..\publish\%os_mode%-%arch_mode%\handstack-docs
dotnet build handstack-docs.csproj --configuration %configuration_mode% --arch %arch_mode% --os %os_mode% --output ../publish/%os_mode%-%arch_mode%/handstack-docs
