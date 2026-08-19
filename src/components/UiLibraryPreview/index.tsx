import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

type UiLibraryPreviewProps = {
    src: string;
    height?: number;
};

export default function UiLibraryPreview({ src, height = 480 }: UiLibraryPreviewProps): JSX.Element {
    const url = useBaseUrl(`/sample/ui-library/${src}.html`);

    return (
        <div className={styles.previewContainer}>
            <div className={styles.previewToolbar}>
                <span className={styles.previewLabel}>미리보기</span>
                <a href={url} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                    새 창에서 열기 ↗
                </a>
            </div>
            <iframe
                src={url}
                title={`${src} 미리보기`}
                loading="lazy"
                className={styles.previewFrame}
                style={{ height }}
            />
        </div>
    );
}
