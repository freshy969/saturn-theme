import React from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import styled from 'react-emotion';
import { dep } from 'worona-deps';
import fecha from 'fecha';

const Fecha = ({ date }) => <Container>{date}</Container>;

Fecha.propTypes = {
  date: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  const generalSettings =
    dep('settings', 'selectorCreators', 'getSetting')('theme', 'generalSettings')(state) || {};

  return {
    timeZone: generalSettings.timeZone || 1,
  };
};

export default compose(
  connect(mapStateToProps),
  inject(({ connection }, { id, timeZone }) => {
    const gmt = connection.single.post[id].creationDate;
    const offset = new Date(1000 * 60 * 60 * timeZone).getTime();
    const date = new Date(gmt.getTime() + offset);

    // console.log('gmt:', gmt);
    // console.log('gmt unix:', gmt.getTime());
    // console.log('offset:', offset);
    // console.log('date:', date);

    return {
      date: fecha.format(date, 'DD/MM/YYYY [-] HH:mm'),
    };
  }),
)(Fecha);

const Container = styled.div`
  font-weight: 300;
  margin: 0;
  padding: 5px 15px;
  font-size: 0.9rem;
  text-align: right;
`;
