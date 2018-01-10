import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import LazyLoad from 'react-lazy-load';
import IconTwitter from 'react-icons/lib/fa/twitter';
import styled from 'react-emotion';

class LazyTweet extends Component {
  static propTypes = {
    children: PropTypes.shape({}).isRequired,
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    isAmp: PropTypes.bool.isRequired,
    tweetId: PropTypes.string.isRequired
  };

  constructor() {
    super();

    this.ref = null;
    this.state = {
      loaded: false
    };

    this.handleContentVisible = this.handleContentVisible.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.loaded !== nextState.loaded;
  }

  componentWillUpdate() {
    if (window.document.getElementById('lazy-twitter') && window.twttr) {
      window.twttr.widgets.load(this.ref);
    } else {
      const script = window.document.createElement('script');
      script.id = 'lazy-twitter';
      script.src = '//platform.twitter.com/widgets.js';
      script.async = true;
      script.chartset = 'utf-8';

      window.document.body.appendChild(script);
    }
  }

  handleContentVisible() {
    this.setState({
      loaded: true
    });
  }

  render() {
    const { children, width, height, tweetId, isAmp } = this.props;
    const { loaded } = this.state;

    if (isAmp) {
      return [
        <Helmet>
          <script
            async=""
            custom-element="amp-twitter"
            src="https://cdn.ampproject.org/v0/amp-twitter-0.1.js"
          />
        </Helmet>,
        <Container
          styles={{ height, width }}
          innerRef={node => {
            this.ref = node;
          }}
        >
          <amp-twitter height={1} width={1} layout="responsive" data-tweetid={tweetId} />
        </Container>
      ];
    }

    return (
      <Container
        styles={{ height, width }}
        innerRef={node => {
          this.ref = node;
        }}
      >
        {!loaded && (
          <Icon>
            <IconTwitter size={40} />
          </Icon>
        )}
        <StyledLazyLoad
          offsetVertical={700}
          throttle={50}
          onContentVisible={this.handleContentVisible}
        >
          {children}
        </StyledLazyLoad>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  isAmp: state.build.amp
});

export default connect(mapStateToProps)(LazyTweet);

const Container = styled.div`
  position: relative;
  box-sizing: border-box;
  width: ${({ styles }) => styles.width};
  height: ${({ styles }) => styles.height};
  min-height: 170px;
  padding: 0 15px;
  margin: 15px 0;

  blockquote {
    margin: 0;
  }
`;

const Icon = styled.div`
  position: absolute;
  top: 65px;
  left: 0;
  color: #bdbdbd;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledLazyLoad = styled(LazyLoad)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  background-color: transparent;
  border: none !important;
  z-index: 10 !important;
`;
