import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { dep } from 'worona-deps';
import Image from '../../../shared/components/Image';
import ShareButton from './ShareButton';

const ListItemFirst = ({ id, title, media, selected, context, Link }) => (
  <Post>
    <Link selected={selected} context={context} event={{ category: 'List', action: 'open post' }}>
      <A>
        <Image lazy offsetHorizontal={-50} id={media} width="100%" height="100%" />
        <Info>
          <Title dangerouslySetInnerHTML={{ __html: title }} />
        </Info>
      </A>
    </Link>
    <ShareButton id={id} type="post" />
  </Post>
);

ListItemFirst.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  media: PropTypes.number,
  selected: PropTypes.shape({}).isRequired,
  context: PropTypes.shape({}).isRequired,
  Link: PropTypes.func.isRequired,
};

ListItemFirst.defaultProps = {
  media: null,
};

const mapStateToProps = () => ({
  Link: dep('connection', 'components', 'Link'),
});

export default connect(mapStateToProps)(ListItemFirst);

const Post = styled.div`
  box-sizing: border-box;
  min-height: 10vh;
  height: 55vh;
  margin-bottom: 5px;
  box-shadow: ${({ theme }) => `0 0 3px 0 ${theme.colors.shadow}`};
  position: relative;
`;

const A = styled.a`
  all: inherit;
  box-shadow: none;
  margin: 0;
`;

const Info = styled.div`
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  left: 0;
  min-height: 20%;
  width: 100%;
  color: ${({ theme }) => theme.colors.white};
  -webkit-text-fill-color: ${({ theme }) => theme.colors.white};
  background-color: rgba(0, 0, 0, 0.6);
`;

const Title = styled.h2`
  box-sizing: border-box;
  margin: 0;
  padding: 15px;
  padding-right: 20px;
  padding-left: 10px;
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.5rem;
  line-height: 1.8rem;
`;
