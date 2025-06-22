import clsx from 'clsx';
import Heading from '@theme/Heading';
import useBaseUrl, { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

type FeatureItem = {
    title: string;
    src: string;
    description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: 'HandStack은 표준을 준수합니다',
        src: require('@site/static/img/1.png').default,
        description: (
            <>
                HandStack은 HTML5, ASP.NET Core, Node.js, Docker 기반 표준 기술 스택으로 개발합니다. 비즈니스 앱은 HTML5, Javascript, SQL 만 필요합니다
            </>
        ),
    },
    {
        title: '오픈소스 기반으로 제약 없이 사용하세요',
        src: require('@site/static/img/2.png').default,
        description: (
            <>
                상업적 사용 제한이 없는 BSD 라이선스를 제공합니다. 업무에 따라 수많은 오픈소스와 상용 라이브러리 도입을 부담없이 검토하세요
            </>
        ),
    },
    {
        title: 'Windows, Linux, Mac, Cloud, Docker 실행 환경을 제공합니다',
        src: require('@site/static/img/3.png').default,
        description: (
            <>
                HandStack은 복잡한 SaaS 연동 없이, 셀프 호스팅 또는 클라우드에서 안전하게 개발할 수 있는 환경을 제공합니다.
            </>
        ),
    },
    {
        title: '메모장으로 풀 스택 개발 및 운영 가능합니다',
        src: require('@site/static/img/4.png').default,
        description: (
            <>
                비즈니스 앱은 컴파일 과정이 필요 없습니다. Visual Studio, IntelliJ, WebStorm, Eclipse, Notepad++, UltraEdit 등등 지금 사용 중인 익숙한 도구를 사용하세요
            </>
        ),
    },
    {
        title: '비즈니스 앱을 만들기 위한 IT 인프라 구축 비용을 절감합니다',
        src: require('@site/static/img/5.png').default,
        description: (
            <>
                로컬 개발, 운영에 이르는 반복적 비용과 마찰을 줄이고, 하나의 통합된 개발 워크플로우로 당신의 비즈니스 소프트웨어 개발에만 집중할 수 있게 돕습니다.
            </>
        ),
    },
    {
        title: '프로젝트 개발 및 지원 파트너',
        src: require('@site/static/img/6.png').default,
        description: (
            <>
                중요한 건 기술과 프레임워크가 아니라, 당신이 만들고자 하는 비즈니스와 소프트웨어입니다. 프로젝트에 맞춤화된 안전하고 코딩할 수 있는 환경으로, 당신의 비즈니스 소프트웨어를 구축하는 데 집중하세요.
            </>
        ),
    },
];

function Feature({ title, src, description }: FeatureItem) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <img
                    className="mb:4"
                    src={useBaseUrl(src)}
                    width="120"
                    height="120"
                />
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
