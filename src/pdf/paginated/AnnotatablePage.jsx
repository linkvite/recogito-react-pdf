import React, { useEffect, useRef, useState } from 'react';
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf';
import { splitByType } from '../PDFAnnotation';
import { setGlobalRecogito } from '../../globalRecogito';

const AnnotatablePage = props => {
    const containerEl = useRef();
    const [recogito, setRecogito] = useState();

    const destroyPreviousPage = () => {
        if (recogito) {
            recogito.destroy();
        }

        const canvas = containerEl.current.querySelector('canvas');
        if (canvas)
            containerEl.current.removeChild(canvas);

        const textLayer = containerEl.current.querySelector('.textLayer');
        textLayer.innerHTML = '';
    }

    // Render on page change
    useEffect(() => {
        destroyPreviousPage();

        if (props.page) {
            const scale = props.scale || 1.8;
            const viewport = props.page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            containerEl.current.appendChild(canvas);

            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport
            };

            props.page.render(renderContext);

            props.page.getTextContent().then(textContent => PDFJS.renderTextLayer({
                textContent: textContent,
                container: containerEl.current.querySelector('.textLayer'),
                viewport: viewport,
                textDivs: []
            }).promise.then(() => {
                const config = props.config || {};
                const { text } = splitByType(props.annotations);

                const r = Recogito.init({
                    ...config,
                    content: containerEl.current.querySelector('.textLayer'),
                    mode: 'pre',
                    allowEmpty: true,
                    linkvite: props.linkvite,
                });

                r.on('createAnnotation', a => props.onCreateAnnotation(a));
                r.on('updateAnnotation', (a, p) => props.onUpdateAnnotation(a, p));
                r.on('deleteAnnotation', a => props.onDeleteAnnotation(a));
                r.on('cancelSelected', a => props.onCancelSelected(a));

                r.setAnnotations(text);
                setRecogito(r);
                setGlobalRecogito(r);
            }));
        }
    }, [props.page]);

    useEffect(() => {
        if (recogito && recogito.getAnnotations() === 0) {
            recogito.setAnnotations(props.annotations);
        }
    }, [props.annotations]);

    return (
        <div
            ref={containerEl}
            className="page-container">
            <div className="textLayer" />
        </div>
    )

}

export default AnnotatablePage;