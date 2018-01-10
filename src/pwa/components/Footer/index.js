/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import styled from 'react-emotion';
import { Container, Logo, Title } from '../../../shared/styled/Footer';
import * as actions from '../../actions';

const Footer = ({ classicVersionRequested, bar }) => (
  <Container bar={bar}>
    <Logo>
      <Title>powered by</Title>
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
    <Desktop onClick={classicVersionRequested}>Versión clásica</Desktop>
  </Container>
);

Footer.propTypes = {
  classicVersionRequested: PropTypes.func.isRequired,
  bar: PropTypes.string.isRequired
};

const mapDispatchToProps = dispatch => ({
  classicVersionRequested: () => dispatch(actions.footer.classicVersionRequested())
});

export default compose(
  connect(null, mapDispatchToProps),
  inject(({ connection }) => ({
    bar: connection.context.options.bar
  }))
)(Footer);

const Desktop = styled.a`
  font-size: 0.6rem;
  text-decoration: underline !important;
`;
