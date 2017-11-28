/* eslint-disable no-undef */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IconClose from 'react-icons/lib/md/close';
import styled from 'react-emotion';
import { dep } from 'worona-deps';
import * as selectorCreators from '../../selectorCreators';

const CloseButton = ({ listType, listId, Link }) => (
  // <Link type={listType} id={listId}>
  <a href="/">
    <Container>
      <IconClose size={33} />
    </Container>
  </a>
);
// </Link>;

CloseButton.propTypes = {
  // listType: PropTypes.string.isRequired,
  // listId: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({
  // listType: selectorCreators.getListType('currentList')(state),
  // listId: selectorCreators.getListId('currentList')(state),
});

export default connect(mapStateToProps)(CloseButton);

const Container = styled.div`
  box-sizing: border-box;
  height: ${({ theme }) => theme.titleSize};
  width: ${({ theme }) => theme.titleSize};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  color: ${({ theme }) => theme.color};
`;
