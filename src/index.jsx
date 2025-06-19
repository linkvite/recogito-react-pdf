import React from 'react';
import ReactDOM from 'react-dom';
import PDFViewer from './pdf/PDFViewer';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
pdfjs.GlobalWorkerOptions.workerSrc = 'https://s3.us-west-1.wasabisys.com/assets.linkvite.io/public/recogito/pdf.worker.js';

import {annotationStore} from './pdf/AnnotationStore';
import {getGlobalRecogito} from './globalRecogito';

export class RecogitoPDF {
    constructor(config) {
        this.config = config;
        this.containerEl = null;
        this.appInstance = null;

        this._init();
    }

    _init() {
        this.containerEl = document.createElement('DIV');

        if (this.config.containerEl) {
            this.config.containerEl.appendChild(this.containerEl);
        } else {
            document.body.appendChild(this.containerEl);
        }

        this._render();
    }

    _render() {
        ReactDOM.render(
            <PDFViewer
                key={Date.now()}
                url={this.config.url}
                linkvite={this.config.linkvite}
                mode={this.config.mode || 'scrolling'}
                onCreateAnnotation={this._handleAnnotationCreated.bind(this)}
                onUpdateAnnotation={this._handleAnnotationUpdated.bind(this)}
                onDeleteAnnotation={this._handleAnnotationDeleted.bind(this)}
            />,
            this.containerEl
        );
    }

    _handleAnnotationCreated(annotation, overrideId) {
        if (this.config.handleAnnotationCreated) {
            this.config.handleAnnotationCreated(annotation.underlying || annotation, overrideId);
        }
    }

    _handleAnnotationUpdated(annotation, previous) {
        if (this.config.handleAnnotationUpdated) {
            this.config.handleAnnotationUpdated(
                annotation.underlying || annotation,
                previous.underlying || previous
            );
        }
    }

    _handleAnnotationDeleted(annotation) {
        if (this.config.handleAnnotationDeleted) {
            this.config.handleAnnotationDeleted(annotation.underlying || annotation);
        }
    }

    setAnnotations(annotations) {
        annotationStore.set(annotations);
        const globalRecogito = getGlobalRecogito();
        if (globalRecogito) {
            globalRecogito.setAnnotations(annotations);
        }
        return  annotations;
    }

    async loadAnnotations(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.setAnnotations(data);
            return data;
        } catch (error) {
            console.error('Error loading annotations:', error);
            throw error;
        }
    }

    getAnnotations() {
        const globalRecogito = getGlobalRecogito();
        if (globalRecogito) {
            return globalRecogito.getAnnotations();
        }

        return annotationStore.get();
    }

    removeAnnotation(annotation) {
        annotationStore.delete(annotation);
        const globalRecogito = getGlobalRecogito();
        if (globalRecogito) {
            globalRecogito.removeAnnotation(annotation);
        }
    }

    addAnnotation(annotation) {
        annotationStore.create(annotation);
        const globalRecogito = getGlobalRecogito();
        if (globalRecogito) {
            globalRecogito.addAnnotation(annotation);
        }
    }

    destroy() {
        if (this.containerEl) {
            ReactDOM.unmountComponentAtNode(this.containerEl);
            if (this.containerEl.parentNode) {
                this.containerEl.parentNode.removeChild(this.containerEl);
            }
            this.containerEl = null;
        }

        this.appInstance = null;
    }
}

export const init = config => new RecogitoPDF(config);