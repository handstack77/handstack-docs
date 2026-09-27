import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './ide.module.css';

type DownloadAsset = {
    fileName: string;
    url: string;
    extension: string;
    size: number;
};

type Platform = {
    channel: 'win' | 'osx' | 'linux';
    name: string;
    status: 'ready' | 'pending' | 'unavailable';
    version: string | null;
    publishedAt: string | null;
    installer: DownloadAsset | null;
    portable: DownloadAsset | null;
};

type Catalog = {
    status: 'available' | 'unavailable';
    checkedAt: string;
    sourceUrl: string;
    platforms: Platform[];
};

function formatSize(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value: string, includeTime = false): string {
    const koreanTime = new Date(Date.parse(value) + 9 * 60 * 60 * 1000).toISOString();
    return koreanTime.slice(0, includeTime ? 16 : 10).replace('T', ' ');
}

function PlatformCard({ platform }: { platform: Platform }): JSX.Element {
    const ready = platform.status === 'ready';
    const prerelease = platform.version?.split('+')[0].includes('-');
    const statusLabel = ready ? (prerelease ? '미리 보기 버전' : '다운로드 가능')
        : platform.status === 'pending' ? '배포 준비 중' : '확인 필요';

    return (
        <section className={clsx(styles.card, ready && styles.available)} aria-labelledby={`ide-${platform.channel}`} data-platform={platform.channel} data-status={platform.status}>
            <div className={styles.cardHeading}>
                <Heading as="h2" id={`ide-${platform.channel}`}>{platform.name}</Heading>
                <span className={clsx(styles.badge, ready && styles.readyBadge)}>{statusLabel}</span>
            </div>
            {ready ? (
                <>
                    <p className={styles.version}>{platform.version ? `v${platform.version}` : '최신 배포 파일'}</p>
                    <p className={styles.metadata}>
                        {platform.publishedAt ? <><time dateTime={platform.publishedAt}>{formatDate(platform.publishedAt)}</time> 배포</> : '배포일은 공식 배포 페이지에서 확인하세요.'}
                    </p>
                    <div className={styles.downloads}>
                        {platform.installer && (
                            <>
                                <a className="button button--primary button--block" href={platform.installer.url} aria-label={`${platform.name} 최신 설치 프로그램 다운로드`}>
                                    {platform.name} 설치 프로그램
                                </a>
                                <p className={styles.fileInfo}>{platform.installer.extension} · {formatSize(platform.installer.size)}</p>
                            </>
                        )}
                        {platform.portable && (
                            <div className={styles.portable}>
                                <a href={platform.portable.url} aria-label={`${platform.name} 포터블 다운로드`}>포터블 다운로드</a>
                                <span>{platform.portable.extension} · {formatSize(platform.portable.size)}</span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <p className={styles.pending}>
                    {platform.status === 'pending'
                        ? '아직 공개된 설치 파일이 없습니다. 배포 여부는 아래 공식 배포 페이지에서 확인하세요.'
                        : '배포 정보를 불러오지 못했습니다. 아래 공식 배포 페이지에서 설치 파일을 확인하세요.'}
                </p>
            )}
        </section>
    );
}

export default function IdeDownloads(): JSX.Element {
    const catalog = usePluginData('handstack-ide-downloads') as Catalog;
    return (
        <Layout title="HandStack IDE 설치하기" description="Windows, macOS, Linux용 HandStack IDE의 최신 배포 정보와 설치 파일을 확인하세요.">
            <main className={clsx('container', styles.page)}>
                <header className={styles.intro}>
                    <p className={styles.eyebrow}>HANDSTACK IDE</p>
                    <Heading as="h1">개발에 필요한 도구를 한곳에</Heading>
                    <p>작업영역 편집부터 화면 개발과 계약 관리까지.<br />내 운영체제에 맞는 HandStack IDE를 내려받으세요.</p>
                </header>
                <div className={styles.platforms}>
                    {catalog.platforms.map(platform => <PlatformCard platform={platform} key={platform.channel} />)}
                </div>
                <aside className={styles.releaseInfo} aria-label="배포 정보 안내">
                    <p>
                        {catalog.status === 'available' ? '배포 정보 확인' : '배포 정보 조회 실패'}: <time dateTime={catalog.checkedAt}>{formatDate(catalog.checkedAt, true)}</time> (한국 시간 · 사이트 빌드 시점)
                    </p>
                    <p>버전·배포일·크기는 위 시점의 정보이며, 다운로드 링크는 배포 서버의 최신 파일로 연결됩니다. 새 배포 여부와 변경 내역은 공식 배포 페이지에서 확인하세요.</p>
                    <p>새 배포 패키지는 <code>Stavlo</code> 이름을 사용합니다. 기존 파일은 이전 이름으로 표시될 수 있으며, 다운로드 주소는 공식 카탈로그를 따릅니다.</p>
                    <a href={catalog.sourceUrl}>공식 배포 페이지에서 최신 정보 확인 →</a>
                </aside>
                <section className={styles.nextSteps} aria-labelledby="ide-next-steps">
                    <Heading as="h2" id="ide-next-steps">설치 후에는 무엇을 하나요?</Heading>
                    <p><Link to="/docs/ide/">IDE 사용하기</Link>에서 작업 영역 열기부터 화면·계약 검증까지 익혀 보세요. HandStack 서버 실행 환경은 <Link to="/docs/startup/빠른-시작">빠른 시작</Link>에서 확인할 수 있습니다.</p>
                </section>
            </main>
        </Layout>
    );
}
