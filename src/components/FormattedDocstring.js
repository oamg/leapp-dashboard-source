import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class FormattedDocstring extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired
  };

  title = () =>
    this.props.text
      .trim('\n')
      .replace('\t', '    ')
      .split('\n')[0];

  body = () => {
    const lines = this.props.text
      .trim('\n')
      .replace('\t', '    ')
      .split('\n');
    lines.shift();
    return `    ${lines.join('\n').trimLeft('\n')}`;
  };

  render() {
    return (
      <div>
        <h3>{this.title()}</h3>
        <pre style={{ border: 'none', background: 'inherit', fontSize: '1em' }}>
          {this.body()}
        </pre>
      </div>
    );
  }
}
