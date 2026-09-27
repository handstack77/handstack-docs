import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HandStackOverview from '@site/src/components/HandStackOverview';
import styles from './index.module.css';

const paths = [
    { title: '처음 사용하나요?', text: '필요한 도구를 준비하고 내 PC에서 HandStack을 실행합니다.', label: '설치 준비 확인', to: '/docs/startup/install/필수-프로그램-설치하기' },
    { title: '만들면서 배우고 싶나요?', text: '게시판을 실행한 뒤 조회 조건을 바꾸고 저장 기능으로 확장합니다.', label: '학습 경로 보기', to: '/docs/tutorial/' },
    { title: '정확한 사용법이 필요한가요?', text: 'API, 계약, 설정과 파일 경로를 이름이나 작업으로 찾습니다.', label: 'HandStack 레퍼런스', to: '/docs/reference/' },
];

export default function Home(): JSX.Element {
    return (
        <Layout title="업무 웹 앱 개발 시작하기" description="HandStack 설치부터 게시판 실습, API와 계약 참조까지. HTML·JavaScript·SQL로 업무 웹 앱을 만들어 보세요.">
            <header className={clsx('hero hero--primary', styles.heroBanner)}>
                <div className="container">
                    <Heading as="h1" className="hero__title">HTML·JavaScript·SQL로<br />업무 웹 앱을 만드세요</Heading>
                    <p className="hero__subtitle">HandStack으로 화면과 데이터를 연결하고, 조회부터 저장까지 직접 만들어 봅니다.</p>
                    <div className={styles.buttons}>
                        <Link className="button button--secondary button--lg" to="/docs/startup/빠른-시작">내 PC에서 실행하기</Link>
                        <Link className="button button--secondary button--lg" to="/ide">IDE 설치하기</Link>
                        <Link className="button button--secondary button--lg" to="/docs/tutorial/첫-조회">게시판 예제 살펴보기</Link>
                    </div>
                    <p className={styles.setupNote}>처음 설치할 때는 도구와 파일을 내려받는 시간이 필요합니다.</p>
                </div>
            </header>
            <main>
                <HandStackOverview />
                <section className={clsx('container', styles.learningPaths)} aria-label="문서 학습 경로">
                    <Heading as="h2">지금 필요한 문서로 시작하세요</Heading>
                    <div className="row">
                        {paths.map((path) => (
                            <div className={clsx('col col--4', styles.pathColumn)} key={path.to}>
                                <section className={clsx('card', styles.pathCard)}>
                                    <div className="card__body">
                                        <Heading as="h3">{path.title}</Heading>
                                        <p>{path.text}</p>
                                        <Link to={path.to}>{path.label} →</Link>
                                    </div>
                                </section>
                            </div>
                        ))}
                    </div>
                    <p className={styles.moreLinks}>
                        필요한 작업만 찾으려면 <Link to="/docs/guides/">작업별 가이드</Link>,
                        구조와 원리가 궁금하다면 <Link to="/docs/reference/concept/">개념 이해</Link>를 확인하세요.
                    </p>
                </section>
            </main>
        </Layout>
    );
}
