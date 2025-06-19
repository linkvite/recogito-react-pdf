import React from 'react';
import ReactDOM from 'react-dom';
import Emitter from 'tiny-emitter';
import PDFViewer from './pdf/PDFViewer';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
pdfjs.GlobalWorkerOptions.workerSrc = 'https://s3.us-west-1.wasabisys.com/assets.linkvite.io/public/recogito/pdf.worker.js';

import { annotationStore } from './pdf/AnnotationStore';
import { getGlobalRecogito } from './globalRecogito';

export class RecogitoPDF {
    constructor(config) {
        this.config = config;
        this.containerEl = null;
        this._emitter = new Emitter();

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
                onCreateAnnotation={this.handleAnnotationCreated}
                onUpdateAnnotation={this.handleAnnotationUpdated}
                onDeleteAnnotation={this.handleAnnotationDeleted}
            />,
            this.containerEl
        );
    }

    handleAnnotationCreated = (annotation, overrideId) =>
        this._emitter.emit('pdf:create:annotation', annotation.underlying, overrideId);

    handleAnnotationUpdated = (annotation, previous) =>
        this._emitter.emit('pdf:update:annotation', annotation.underlying, previous.underlying);

    handleAnnotationDeleted = annotation =>
        this._emitter.emit('pdf:delete:annotation', annotation.underlying);

    /******************/
    /*  External API  */
    /******************/

    off = (event, callback) =>
        this._emitter.off(event, callback);

    on = (event, handler) =>
        this._emitter.on(event, handler);

    setAnnotations(annotations) {
        annotationStore.set(annotations);
        const globalRecogito = getGlobalRecogito();
        if (globalRecogito) {
            globalRecogito.setAnnotations(annotations);
        }
        return annotations;
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
    }
}

export const init = config => new RecogitoPDF(config);