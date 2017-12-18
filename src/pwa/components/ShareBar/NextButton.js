import React from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { connect } from "react-redux";
import styled from "react-emotion";
import IconNext from "react-icons/lib/fa/angle-right";
import { dep } from "worona-deps";
import Truncate from "react-truncate";

const NextButton = ({ isListLoading, isLastSlide, nextSelected, Link }) => {
  if (isListLoading) {
    return (
      <Container>
        <Text>
          <Truncate>Cargando...</Truncate>
        </Text>
      </Container>
    );
  }

  if (isLastSlide) return null;

  return (
    <Link selected={nextSelected}>
      <Container>
        <Text>
          <Truncate>Siguiente</Truncate>
        </Text>
        <StyledIconNext />
      </Container>
    </Link>
  );
};

NextButton.propTypes = {
  isListLoading: PropTypes.bool.isRequired,
  isLastSlide: PropTypes.bool.isRequired,
  nextSelected: PropTypes.shape({}),
  Link: PropTypes.func.isRequired,
};

NextButton.defaultProps = {
  nextSelected: null,
};

const mapStateToProps = () => ({
  Link: dep("connection", "components", "Link"),
});

export default connect(mapStateToProps)(
  inject(({ connection }) => {
    const { next, fromList } = connection.selected;
    const { list } = connection;

    const currentList = fromList ? list[fromList.type][fromList.id] : list.latest.post;

    return {
      isListLoading: currentList.fetching,
      isLastSlide: !next || !next.id,
      nextSelected: next && { singleType: next.type, singleId: next.id },
    };
  })(NextButton),
);

const Container = styled.a`
  box-sizing: border-box;
  height: 56px;
  margin: 0;
  padding: 0;
  background-color: ${({ theme }) => theme.bgColor};
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  flex-grow: 1;
  text-decoration: none;

  &,
  &:visited {
    color: ${({ theme }) => theme.color};
  }
`;

const Text = styled.span`
  text-transform: uppercase;
  padding-top: 1px;
`;

const StyledIconNext = styled(IconNext)`
  height: 1em;
  width: 1em;
  padding-bottom: 1px;
  padding-left: 0px;
`;
