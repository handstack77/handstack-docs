import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
    title: string;
    Svg: React.ComponentType<React.ComponentProps<'svg'>>;
    description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: '표준 기술 스택을 준수합니다',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                HandStack은 HTML5, ASP.NET Core, Node.js, Docker 기반 표준 기술 스택으로 개발합니다
            </>
        ),
    },
    {
        title: '오픈소스 기반으로 제약 없이 사용하세요',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                HandStack은 제한이 없는 BSD 라이센스를 제공합니다.업무에 따라 수많은 오픈소스와 상용 라이브러리 도입을 부담없이 검토하세요
            </>
        ),
    },
    {
        title: 'Windows, Linux, Mac 실행 환경을 제공합니다',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                다양한 운영 환경에서 한 줄의 CLI 명령어로 프로그램 동작을 관리하세요
            </>
        ),
    },
    {
        title: '메모장으로 풀 스택 개발 및 운영 가능합니다',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                Visual Studio, IntelliJ, WebStorm, Eclipse, Notepad++, UltraEdit 등등 지금 사용 중인 익숙한 도구를 사용하세요
            </>
        ),
    },
    {
        title: '비즈니스 앱을 만들기 위한 IT 인프라 구축 비용을 절감합니다',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                개발 과정과 운영 방법에 대해 단순 및 표준화 방안을 제공하여 적은 학습 곡선, 구축 비용을 절감 할 수 있습니다
            </>
        ),
    },
    {
        title: '프로젝트 개발 및 지원 공인 파트너',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                공인 컨설팅 및 PoC 지원, 프로젝트 개발, 운영 교육 및 기술 지원 서비스를 제공합니다
            </>
        ),
    },
];

function Feature({ title, Svg, description }: FeatureItem) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img" />
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
