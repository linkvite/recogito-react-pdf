import React, { useEffect, useState } from 'react';
import PDFNavigationBar from './Nav';

import AnnotatablePage from './AnnotatablePage';
import { extendTarget } from '../PDFAnnotation';
import { annotationStore } from '../AnnotationStore';

const PaginatedViewer = props => {
  const [ page, setPage ] = useState();

  useEffect(() => {
    props.pdf.getPage(1).then(setPage);
  }, []);

  const onPreviousPage = () => {
    const { pageNumber } = page;
    const prevNum = Math.max(0, pageNumber - 1);
    if (prevNum !== pageNumber)
      props.pdf.getPage(prevNum).then(page => setPage(page));
  }

  const onNextPage = () => {
    const { numPages } = props.pdf;
    const { pageNumber } = page;
    const nextNum = Math.min(pageNumber + 1, numPages);
    if (nextNum !== pageNumber)
      props.pdf.getPage(nextNum).then(page => setPage(page));
  }

  const onCreateAnnotation = a => {
    const extended = extendTarget(a, props.url, page.pageNumber);
    props.onCreateAnnotation && props.onCreateAnnotation(extended);
  }

  const onUpdateAnnotation = (a, p) => {
    const updated = extendTarget(a, props.url, page.pageNumber);
    const previous = extendTarget(p, props.url, page.pageNumber);
    props.onUpdateAnnotation && props.onUpdateAnnotation(updated, previous);
  }
    
  const onDeleteAnnotation = a => {
    const extended = extendTarget(a, props.url, page.pageNumber);
    props.onDeleteAnnotation && props.onDeleteAnnotation(extended);
  }
  
  return (
    <div>
      <main>
        <div className="pdf-viewer-container">
          <AnnotatablePage 
            page={page} 
            annotations={page ? annotationStore.getAll(page.pageNumber) : []}
            config={props.config}
            linkvite={props.linkvite}
            onCreateAnnotation={onCreateAnnotation}
            onUpdateAnnotation={onUpdateAnnotation}
            onDeleteAnnotation={onDeleteAnnotation} 
            onCancelSelected={props.onCancelSelected} />
        </div>
      </main>

      <PDFNavigationBar
        page={page}
        pdf={props.pdf}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  )

}

export default PaginatedViewer;