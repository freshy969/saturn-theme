import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import IconDownload from 'react-icons/lib/md/file-download';

const WPAppbox = ({ title, link, developer, price, image, error, isAmp }) => (
  <Container href={link} rel="noopener" target="_blank">
    {error ? (
      <ErrorMessage>The app was not found in the store :(</ErrorMessage>
    ) : (
      <Fragment>
        <IconContainer>
          {isAmp ? (
            <amp-img alt="Icon" src={image} layout="responsive" width="1" height="1" />
          ) : (
            <img alt="Icon" src={image} />
          )}
        </IconContainer>
        <InfoContainer>
          <Title>{title}</Title>
          <Developer>Developer: {developer}</Developer>
          <Price>{price}</Price>
        </InfoContainer>
        <DownloadContainer>
          <IconDownload size={50} verticalAlign="none" />
        </DownloadContainer>
      </Fragment>
    )}
  </Container>
);

WPAppbox.propTypes = {
  title: PropTypes.string,
  link: PropTypes.string,
  developer: PropTypes.string,
  price: PropTypes.string,
  image: PropTypes.string,
  error: PropTypes.bool,
  isAmp: PropTypes.bool.isRequired,
};

WPAppbox.defaultProps = {
  title: null,
  link: null,
  developer: null,
  price: null,
  image: null,
  error: null,
};

const mapStateToProps = state => ({
  isAmp: state.build.amp,
});

export default connect(mapStateToProps)(WPAppbox);

const Container = styled.a`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  margin: 10px;
  border: 1px solid #ccc;
  border-top: 5px solid #ccc;
  color: ${({ theme }) => theme.colors.black};
`;

const IconContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  padding: 10px;

  amp-img {
    width: 100%;
    height: 100%;
  }
`;

const InfoContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: calc(100% - 160px);
  padding: 10px 5px;
  font-size: 0.9rem;
`;

const Title = styled.span`
  box-sizing: border-box;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-weight: 700;
  text-decoration: none;
`;

const Developer = styled.span`
  box-sizing: border-box;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const Price = styled.span`
  box-sizing: border-box;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const DownloadContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  padding: 10px;
  color: ${({ theme }) => theme.colors.black};
`;

const ErrorMessage = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;
