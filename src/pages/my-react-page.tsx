import React from 'react';
import Layout from '@theme/Layout';

export default function MyReactPage() {
    React.useEffect(function () {
        setTimeout(() => {
            if (window.iFrameResize) {
                iFrameResize({ log: true }, 'iframe');
            }
        });
    }, []);

    return (
        <Layout>
            <iframe src="/iframe.html" className="w:100%"></iframe>
        </Layout>
    );
}
