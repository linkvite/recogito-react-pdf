import React from 'react';
import AnnotatablePage from './AnnotatablePage';

const Range = maxValue =>
    Array.from(Array(maxValue).keys());

const EndlessViewer = props => {
    return (
        <div>
            <main>
                <div className="pdf-viewer-container">
                    {Range(props.pdf.numPages).map(idx =>
                        <AnnotatablePage
                            key={idx}
                            page={idx + 1}
                            url={props.url}
                            pdf={props.pdf}
                            config={props.config}
                            linkvite={props.linkvite}
                            onCreateAnnotation={props.onCreateAnnotation}
                            onUpdateAnnotation={props.onUpdateAnnotation}
                            onDeleteAnnotation={props.onDeleteAnnotation}
                            onCancelSelected={props.onCancelSelected} />
                    )}
                </div>
            </main>
        </div>
    )

}

export default EndlessViewer;