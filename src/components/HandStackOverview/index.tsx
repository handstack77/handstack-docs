import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const modules = [
    { name: 'dbclient', purpose: 'SQL 실행' },
    { name: 'command', purpose: 'CLI·HTTP 호출' },
    { name: 'prompter', purpose: 'AI 연결' },
    { name: 'function', purpose: '업무 함수' },
    { name: 'graphclient', purpose: '그래프 질의' },
];

const reasons = [
    {
        title: '익숙한 기술로 시작하세요',
        description: 'HTML·JavaScript로 화면을 만들고 SQL로 데이터를 다룹니다. UI 라이브러리와 기존 데이터베이스를 활용해, 새로운 도구 학습보다 업무 구현에 집중할 수 있습니다.',
        label: '첫 조회 만들어 보기',
        to: '/docs/tutorial/첫-조회',
    },
    {
        title: '필요한 기능을 모듈로 확장하세요',
        description: '조회·저장부터 외부 프로그램, AI, 사용자 함수까지. transact가 요청을 실행 모듈에 연결하므로, 화면과 실행 로직을 나누어 관리할 수 있습니다.',
        label: '요청 흐름 이해하기',
        to: '/docs/tutorial/handstack-기초개념/요청흐름-이해',
    },
    {
        title: '소스와 운영 환경을 직접 관리하세요',
        description: '공개된 소스를 확인하고 필요한 부분을 수정하세요. 사내 서버나 클라우드에 직접 배포하고, 데이터 연결과 운영 설정을 프로젝트 요구에 맞게 관리합니다.',
        label: '소스 개발 환경 보기',
        to: '/docs/startup/install/개발-환경-설정하기',
    },
];

export default function HandStackOverview(): JSX.Element {
    const imageUrl = useBaseUrl('/img/handstack-ecosystem-flat-v2.png');

    return (
        <section className={styles.overview} aria-labelledby="handstack-overview-title">
            <div className="container">
                <div className={styles.introduction}>
                    <p className={styles.eyebrow}>HANDSTACK AT A GLANCE</p>
                    <Heading as="h2" id="handstack-overview-title">화면에서 데이터·AI까지, 하나의 개발 흐름</Heading>
                    <p className={styles.lead}>
                        HandStack은 웹 화면, 거래 규칙, 실행 모듈을 연결하는 오픈소스 업무 앱 개발 환경입니다.
                        다양한 오픈소스를 활용하고, 프로젝트에 필요한 업무 로직에 집중하세요.
                    </p>
                </div>

                <figure className={styles.architecture}>
                    <img
                        src={imageUrl}
                        width="1774"
                        height="887"
                        loading="lazy"
                        decoding="async"
                        alt="왼쪽의 웹 브라우저와 Tabler·jQuery·ECharts가 가운데 ASP.NET Core 기반 HandStack 서버의 ack·wwwroot·transact에 연결되고, 오른쪽의 dbclient·command·prompter·function·graphclient 모듈이 데이터베이스, CLI·HTTP, AI, 함수, 그래프 데이터베이스를 실행하는 구조"
                    />
                    <figcaption className={styles.caption}>
                        <span>화면의 요청을 <code>transact</code>가 연결하고, 각 모듈이 맡은 작업을 실행합니다.</span>
                        <a href={imageUrl} target="_blank" rel="noopener noreferrer">이미지 크게 보기 ↗</a>
                    </figcaption>
                </figure>

                <ul className={styles.moduleLinks} aria-label="실행 모듈 레퍼런스">
                    {modules.map(({ name, purpose }) => (
                        <li key={name}>
                            <Link to={`/docs/reference/api/modules/${name}`}>
                                <code>{name}</code><span>{purpose} →</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <p className={styles.note}>그림의 연동 기술은 활용 예시입니다. 사용할 모듈과 외부 도구는 별도로 설정하며, 각 오픈소스의 라이선스를 확인하세요.</p>

                <div className={styles.why}>
                    <Heading as="h2">왜 HandStack인가요?</Heading>
                    <div className={styles.reasons}>
                        {reasons.map(({ title, description, label, to }, index) => (
                            <article className={styles.reason} key={to}>
                                <span className={styles.number} aria-hidden="true">0{index + 1}</span>
                                <Heading as="h3">{title}</Heading>
                                <p>{description}</p>
                                <Link to={to}>{label} →</Link>
                            </article>
                        ))}
                    </div>
                    <p className={styles.note}>도입 전 <Link to="/docs/라이선스">HandStack 사용 조건</Link>을 확인하세요.</p>
                </div>
            </div>
        </section>
    );
}
