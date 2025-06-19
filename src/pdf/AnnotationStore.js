import { proxy, snapshot } from 'valtio';
export const annotationStore = proxy({
    annotations: [],
    set: (annotations) => {
        annotationStore.annotations = annotations;
    },
    create: (annotation) => {
        annotationStore.annotations.push(annotation);
    },
    update: (updated, previous) => {
        annotationStore.annotations = annotationStore.annotations.map(a =>
            a.id === previous.id ? updated : a);
    },
    delete: (annotation) => {
        const idx = annotationStore.annotations.findIndex(a => a.id === annotation.id);
        if (idx >= 0) {
            annotationStore.annotations.splice(idx, 1);
        }
    },
    get: () => {
        const { annotations } = snapshot(annotationStore);
        return annotations;
    },
    getAll: (pageNumber) => {
        const isOnPage = annotation => {
            if (annotation.target.selector) {
                const selectors = Array.isArray(annotation.target.selector) ?
                    annotation.target.selector : [annotation.target.selector];

                const selectorWithPage = selectors.find(s => s.page);
                return selectorWithPage?.page == pageNumber;
            }
        };

        const { annotations } = snapshot(annotationStore);
        return annotations.filter(isOnPage);
    }
});
