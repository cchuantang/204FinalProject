import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Files.scss';

class Files extends Component {

    renderFile(file, index) {
        const {
            currentFile,
            selectFile,
            starToggle,
            removeFile,
            editFileName
        } = this.props;

        return (
            <div
                key={file.id}
                onClick={() => selectFile(index)}
                className={index === currentFile ? 'active' : ''}>
                
                {/* File name */}
                <span className="name">{file.name}</span>

                <div className="options">
                    {/* Edit */}
                    <i
                        onClick={event => (event.stopPropagation(), editFileName(index))}>
                        <FontAwesomeIcon icon="edit" />
                    </i>
                    {/* Remove */}
                    <i
                        onClick={event => (event.stopPropagation(), removeFile(index))}>
                        <FontAwesomeIcon icon="trash" />
                    </i>
                    {/* Star */}
                    <i
                        className={file.starred ? 'starred' : ''}
                        onClick={event => (event.stopPropagation(), starToggle(index))}>
                        <FontAwesomeIcon icon="star" />
                    </i>
                </div>
            </div>
        );
    }

    render() {
        const { files, newFile } = this.props;

        return (
            <div className="file-container">
                <div className="file-controls">
                    <span>App</span>
                    <div className="options">
                        {/* New file */}
                        <i
                            onClick={newFile}>
                            <FontAwesomeIcon icon="file-code" />
                        </i>
                    </div>
                </div>
                <div className="file-list">
                    {files.map(this.renderFile.bind(this))}
                </div>
            </div>
        );
    }
}

export default Files;
