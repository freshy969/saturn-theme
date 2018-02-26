import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { inject } from 'mobx-react';
import { Helmet } from 'react-helmet';
import { ads } from '../../../pwa/selectors';

class SmartAd extends Component {
  static propTypes = {
    networkId: PropTypes.number.isRequired,
    siteId: PropTypes.number.isRequired,
    pageId: PropTypes.number.isRequired,
    formatId: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    target: PropTypes.string.isRequired,
    isAmp: PropTypes.bool.isRequired,
    item: PropTypes.shape({
      type: PropTypes.string,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  };

  static defaultProps = {
    item: {},
  };

  static firstAd = true;

  constructor(props) {
    super(props);
    const { formatId, item: { type, id } } = this.props;
    this.tagId = `ad${formatId}${type}${id}`;
  }

  componentDidMount() {
    const { networkId, siteId, pageId, formatId, target, width, height } = this.props;
    const { tagId } = this;
    const callParams = { siteId, pageId, formatId, target, width, height, tagId, async: true };

    const sas = window && window.sas ? window.sas : (window.sas = {});
    sas.cmd = sas.cmd || [];

    if (SmartAd.firstAd) {
      SmartAd.firstAd = false;
      sas.cmd.push(() => {
        sas.setup({ networkid: networkId, domain: '//www8.smartadserver.com', async: true });
      });
    }

    sas.cmd.push(() => {
      const containerExists = window.document.getElementById(tagId) !== null;
      if (containerExists) sas.call('iframe', callParams);
    });
  }

  render() {
    const { networkId, formatId, width, height, isAmp, siteId, pageId, target } = this.props;
    const { tagId } = this;

    if (isAmp) {
      return [
        <Helmet>
          <script
            async=""
            custom-element="amp-ad"
            src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"
          />
        </Helmet>,
        <amp-ad
          type="smartadserver"
          data-site={siteId}
          data-page={pageId}
          data-format={formatId}
          data-domain="https://www8.smartadserver.com"
          data-target={target}
          layout="fill"
        />,
      ];
    }

    return (
      <Fragment>
        <Helmet>
          <script src={`//ced.sascdn.com/tag/${networkId}/smart.js`} type="text/javascript" async />
        </Helmet>
        <InnerContainer id={tagId} width={width} height={height} />
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  networkId: ads.getConfig(state).settings.networkId,
});

export default connect(mapStateToProps)(
  inject(({ connection }, { item }) => {
    if (!item) return { target: '' };

    const { type, id } = item;
    const currentItem = type !== 'latest' ? connection.single[type][id] : null;

    return { target: currentItem ? currentItem.target : '' };
  })(SmartAd),
);

const InnerContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.white};

  iframe {
    max-width: 100%;
  }
`;
