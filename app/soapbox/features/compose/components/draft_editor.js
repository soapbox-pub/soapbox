import React from 'react';
import { Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default class DraftEditor extends React.Component {

  state = {
    editorState: EditorState.createEmpty(),
  }

  handleChange = editorState => {
    this.setState({ editorState });
  }

  render() {
    const { editorState } = this.state;

    return (
      <Editor
        editorState={editorState}
        onChange={this.handleChange}
      />
    );
  }

}
