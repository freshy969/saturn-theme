/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { dep } from 'worona-deps';
import { Container, Logo, Title, Desktop } from '../../../shared/styled/Footer';
import * as actions from '../../actions';

const Footer = ({ classicVersionRequested, bar, poweredDisplay, poweredBy, classicVersion }) => (
  <Container bar={bar}>
    {poweredDisplay && (
      <Logo>
        <Title>{poweredBy}</Title>
        <a href="https://worona.org" rel="noopener nofollow" target="_blank">
          <img
            src="https://worona-cdn.sirv.com/assets/worona%20icons/worona-logo-color.png?scale.width=100"
            width="100"
            height="17"
            srcSet="https://worona-cdn.sirv.com/assets/worona%20icons/worona-logo-color.png?scale.width=100 1x, https://worona-cdn.sirv.com/assets/worona%20icons/worona-logo-color.png?scale.width=200 2x"
            alt="Logo de Worona"
          />
        </a>
      </Logo>
    )}
    <Desktop onClick={classicVersionRequested}>{classicVersion}</Desktop>
  </Container>
);

Footer.propTypes = {
  classicVersionRequested: PropTypes.func.isRequired,
  bar: PropTypes.string.isRequired,
  poweredDisplay: PropTypes.bool,
  poweredBy: PropTypes.string.isRequired,
  classicVersion: PropTypes.string.isRequired,
};

Footer.defaultProps = {
  poweredDisplay: true,
};

const mapStateToProps = state => {
  const powered =
    dep('settings', 'selectorCreators', 'getSetting')('theme', 'powered')(state) || {};
  return {
    poweredDisplay: powered.display,
  };
};

const mapDispatchToProps = dispatch => ({
  classicVersionRequested: () => dispatch(actions.footer.classicVersionRequested()),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  inject(({ connection, theme }) => ({
    bar: connection.selectedContext.options.bar,
    poweredBy: theme.lang.get('poweredBy'),
    classicVersion: theme.lang.get('classicVersion'),
  })),
)(Footer);
