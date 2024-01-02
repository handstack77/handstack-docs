import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
                <Heading as="h1" className="hero__title">
                    {siteConfig.title}
                </Heading>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link className="button button--secondary button--lg" to="/docs/startup/빠른-시작">
                        5분 만에 개발 및 운영 환경을 만들어 보세요. Get Started !!!
                    </Link>
                </div>
                <h2 className="mt:24!">디지털 전환 시대에 <a href="/blog/HandStack%EC%9D%84-%EC%82%AC%EC%9A%A9-%ED%95%B4%EC%95%BC-%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0" className="text-decoration-line:underline">HandStack을 사용 해야 하는 이유</a>에 대해 알아보세요</h2>
            </div>
        </header>
    );
}

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`Hello from ${siteConfig.title}`}
            description="Description will go into a meta tag in <head />">
            <HomepageHeader />

            <div className="container mt:32! text--center">
                <h1 className="mt:24!">개발자와 엔지니어를 위한 앱 개발 솔루션</h1>
            </div>

            <main>
                <HomepageFeatures />
            </main>
        </Layout>
    );
}
