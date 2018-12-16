import React, { Component } from "react";
import AceEditor from 'react-ace';

// Currently supported formats
import 'brace/mode/java';
import 'brace/mode/javascript';
import 'brace/mode/jsx';
import 'brace/mode/json';
import 'brace/mode/css';
import 'brace/mode/scss';
import 'brace/theme/monokai';

class TextEditor extends Component {

  render() {
    const { file, onChange } = this.props;
    const extension = file ? file.name.split('.')[1].replace(/js$/, 'javascript') : 'javascript';

    const height = `${window.innerHeight}px`;
    
    return (
      <AceEditor
        mode={extension}
        theme="monokai"
        editorProps={{ $blockScrolling: true }}
        width="calc(100% - 300px)"
        height={height}
        value={file.content}
        onChange={onChange}
      />
    )
  }
}

export default TextEditor;
