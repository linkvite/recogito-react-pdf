import React, { useEffect, useState } from 'react';
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf';
import EndlessViewer from './endless/EndlessViewer';
import PaginatedViewer from './paginated/PaginatedViewer';
import { annotationStore } from './AnnotationStore';

import 'pdfjs-dist/web/pdf_viewer.css';
import './PDFViewer.css';

const PDFViewer = props => {
    const [pdf, setPdf] = useState();
    const linkvite = props?.linkvite ?? {
        autoHighlight: {
            enabled: false,
            color: 'lv-highlighter-4',
            delay: 200,
        },
        sendMessage: (msg) => console.info("[Message]: ", JSON.stringify(msg, null, 2)),
    };

    useEffect(() => {
        PDFJS
            .getDocument(props.url)
            .promise
            .then(
                pdf => setPdf(pdf),
                error => console.error(error)
            );
    }, [props.url]);

    const onCreateAnnotation = a => {
        annotationStore.create(a);
        props.onCreateAnnotation && props.onCreateAnnotation(a);
    }

    const onUpdateAnnotation = (a, p) => {
        annotationStore.update(a, p);
        props.onUpdateAnnotation && props.onUpdateAnnotation(a, p);
    }

    const onDeleteAnnotation = a => {
        annotationStore.delete(a);
        props.onDeleteAnnotation && props.onDeleteAnnotation(a);
    }

    const onCancelSelected = a => {
        props.onCancelSelected && props.onCancelSelected(a);
    }

    return pdf ?
        props.mode === 'scrolling' ?
            <EndlessViewer
                {...props}
                pdf={pdf}
                linkvite={linkvite}
                onCreateAnnotation={onCreateAnnotation}
                onUpdateAnnotation={onUpdateAnnotation}
                onDeleteAnnotation={onDeleteAnnotation}
                onCancelSelected={onCancelSelected} /> :

            <PaginatedViewer
                {...props}
                pdf={pdf}
                linkvite={linkvite}
                onCreateAnnotation={onCreateAnnotation}
                onUpdateAnnotation={onUpdateAnnotation}
                onDeleteAnnotation={onDeleteAnnotation}
                onCancelSelected={onCancelSelected} />

        : null;

}

export default PDFViewer;