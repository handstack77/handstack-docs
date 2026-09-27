import React from 'react';
import Layout from '@theme/Layout';

type IFrameWindow = Window & {
    iFrameResize?: (options: { log: boolean }, target: string) => unknown;
};

export default function MyReactPage() {
    React.useEffect(function () {
        setTimeout(() => {
            const resize = (window as IFrameWindow).iFrameResize;
            if (resize) {
                resize({ log: true }, 'iframe');
            }
        });
    }, []);

    return (
        <Layout>
            <iframe src="/iframe.html" className="w:100%"></iframe>
        </Layout>
    );
}
