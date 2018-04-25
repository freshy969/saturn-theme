import React from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { dep } from 'worona-deps';
import styled from 'react-emotion';
import Image from '../Image';
import SharedCount from './SharedCount';
import ReadingTime from './ReadingTime';

const FeaturedImage = ({
  type,
  id,
  media,
  featuredImageHeight,
  sharedCountPosition,
  readingTimePosition,
}) => (
  <Container>
    <Image id={media} height={featuredImageHeight} width="100%" />
    {(sharedCountPosition === 'featured-image' || readingTimePosition === 'featured-image') && (
      <InnerContainer>
        {sharedCountPosition === 'featured-image' && <SharedCount type={type} id={id} />}
        {readingTimePosition === 'featured-image' && <ReadingTime type={type} id={id} />}
      </InnerContainer>
    )}
  </Container>
);

FeaturedImage.propTypes = {
  type: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  media: PropTypes.number,
  featuredImageHeight: PropTypes.string,
  sharedCountPosition: PropTypes.string,
  readingTimePosition: PropTypes.string,
};

FeaturedImage.defaultProps = {
  media: null,
  featuredImageHeight: '310px',
  sharedCountPosition: 'header',
  readingTimePosition: 'header',
};

const mapStateToProps = state => {
  const featuredImage =
    dep('settings', 'selectorCreators', 'getSetting')('theme', 'featuredImage')(state) || {};
  const sharedCount =
    dep('settings', 'selectorCreators', 'getSetting')('theme', 'sharedCount')(state) || {};
  const readingTime =
    dep('settings', 'selectorCreators', 'getSetting')('theme', 'readingTime')(state) || {};

  return {
    featuredImageHeight: featuredImage.height,
    sharedCountPosition: sharedCount.position,
    readingTimePosition: readingTime.position,
  };
};

export default compose(
  connect(mapStateToProps),
  inject(({ connection }, { type, id }) => ({
    media: connection.entity(type, id).media.featured.id,
  })),
)(FeaturedImage);

const Container = styled.div`
  position: relative;
`;

const InnerContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.4);
  color: ${({ theme }) => theme.colors.white};
  height: 36px;
`;
