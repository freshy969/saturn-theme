import Color from 'color-js';
import { css } from 'react-emotion';

export default {
  test: ({ tagName }) => tagName === 'blockquote',
  process: (element, { state }) => {
    const { blockquoteStyles } = (state && state.settings.collection.theme) || {};
    const color = blockquoteStyles && blockquoteStyles.color ? blockquoteStyles.color : '#666666';
    const backgroundColor = Color(color)
      .setAlpha(0.2)
      .toString();

    const blockquoteClass = css`
      background: ${backgroundColor};
      border-left: 0.25rem solid ${color};
    `;

    if (element.attributes.className) {
      element.attributes.className.push(blockquoteClass);
    } else {
      element.attributes.className = [blockquoteClass];
    }

    return element;
  },
};
