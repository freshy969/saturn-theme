import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { defer } from 'lodash';
import adler32 from 'adler-32';
import LinkedItemList from './LinkedItemList';

const getGalleryName = mediaIds =>
  `Gallery [${adler32.buf(
    mediaIds
      .slice()
      .sort((a, b) => a - b)
      .toString(),
  )}]`;

class GalleryWithLinks extends Component {
  constructor(props) {
    super(props);
    this.state = { listRequested: this.props.galleryExists };
  }
  async componentWillMount() {
    const { mediaIds, requestMedia, galleryExists } = this.props;
    if (!galleryExists) {
      await requestMedia(mediaIds);
      this.setState({ listRequested: true });
    }
  }
  render() {
    const { mediaIds, ssr } = this.props;
    const { listRequested } = this.state;
    const name = getGalleryName(mediaIds);
    return !ssr && listRequested ? <LinkedItemList name={name} mediaIds={mediaIds} /> : null;
  }
}

GalleryWithLinks.propTypes = {
  ssr: PropTypes.bool.isRequired,
  mediaIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  requestMedia: PropTypes.func.isRequired,
  galleryExists: PropTypes.bool.isRequired,
};

export default inject(({ connection, build }, { mediaIds }) => ({
  galleryExists: connection.custom(getGalleryName(mediaIds)).isReady,
  ssr: build.isSsr,
  requestMedia() {
    return new Promise(resolve =>
      defer(() => {
        connection.fetchCustomPage({
          name: getGalleryName(mediaIds),
          type: 'media',
          page: 1,
          params: {
            include: mediaIds.join(','),
            per_page: mediaIds.length,
            _embed: true,
          },
        });
        resolve();
      }),
    );
  },
}))(GalleryWithLinks);
