import React, { useEffect, useRef, useState } from 'react';
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf';
import { extendTarget, splitByType } from '../PDFAnnotation';
import { annotationStore } from '../AnnotationStore';
import { setGlobalRecogito } from '../../globalRecogito';

const AnnotatablePage = props => {
    const containerEl = useRef();
    const [recogito, setRecogito] = useState();
    const [isRendered, setRendered] = useState(false);
    const [pageVisible, setPageVisible] = useState(false)

    const renderPage = () => {
        props.pdf.getPage(props.page).then(page => {
            const scale = props.scale || 1.8;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.setAttribute('data-page', props.page);

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            containerEl.current.appendChild(canvas);

            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport
            };

            page.render(renderContext).promise.then(() => {
                page.getTextContent().then(textContent =>
                    PDFJS.renderTextLayer({
                        textContent: textContent,
                        container: containerEl.current.querySelector('.textLayer'),
                        viewport: viewport,
                        textDivs: []
                    }).promise.then(() => {
                        setRendered(true);
                    }));
            });
        });
    }

    const onCreateAnnotation = a => {
        const extended = extendTarget(a, props.url, props.page);
        props.onCreateAnnotation(extended);
    }

    const onUpdateAnnotation = (a, p) => {
        const updated = extendTarget(a, props.url, props.page);
        const previous = extendTarget(p, props.url, props.page);
        props.onUpdateAnnotation(updated, previous);
    }

    const onDeleteAnnotation = a => {
        const extended = extendTarget(a, props.url, props.page);
        props.onDeleteAnnotation(extended)
    }

    const initAnnotationLayer = () => {
        const config = props.config || {};
        const { text } = splitByType(annotationStore.getAll(props.page));

        const r = Recogito.init({
            ...config,
            content: containerEl.current.querySelector('.textLayer'),
            mode: 'pre',
            allowEmpty: true,
            linkvite: props.linkvite,
        });

        r.on('createAnnotation', onCreateAnnotation);
        r.on('updateAnnotation', onUpdateAnnotation);
        r.on('deleteAnnotation', onDeleteAnnotation);
        r.on('cancelSelected', a => props.onCancelSelected(a));
        setRecogito(r);
        setGlobalRecogito(r);

        // For some reason, React is not done initializing the Image-/TextAnnotators.
        // This remains an unsolved mystery for now. The hack is to introduce a little
        // wait time until Recogito/Annotorious inits are complete.
        const init = () => {
            if (r._app.current) {
                r.setAnnotations(text);
            } else {
                setTimeout(() => init(), 50);
            }
        }

        init();
    }

    const destroyAnnotationLayer = () => {
        if (recogito) {
            recogito.destroy();
        }
    }

    useEffect(() => {
        const onIntersect = entries => {
            const intersecting = entries[0].isIntersecting;
            setPageVisible(intersecting);
        }

        const observer = new IntersectionObserver(onIntersect, {
            rootMargin: '40px'
        });

        const target = containerEl.current;
        observer.observe(target);

        if (props.page === 1) {
            renderPage();
        }

        return () => {
            observer.unobserve(target);
        }
    }, []);

    useEffect(() => {
        if (isRendered) {
            if (pageVisible)
                initAnnotationLayer();
            else
                destroyAnnotationLayer();
        } else if (pageVisible && props.page > 1) {
            renderPage();
        }
    }, [isRendered, pageVisible]);

    return (
        <div
            ref={containerEl}
            className={'page-container'}>
            <div className="textLayer" />
        </div>
    )

}

export default AnnotatablePage;