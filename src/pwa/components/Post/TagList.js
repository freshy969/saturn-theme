/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { dep } from 'worona-deps';
import { Container, Item } from '../../../shared/styled/Post/TagList';
import { home } from '../../../shared/contexts';

const TagList = ({ categoryList, tagList, context, Link }) => {
  const list = categoryList.concat(tagList);

  return list.length ? (
    <Container>
      {list.map(({ mstId, id, type, name }) => (
        <Item key={mstId} id={id} alt={name}>
          <Link
            type={type}
            id={id}
            page={1}
            context={context}
            eventCategory="Post"
            eventAction="open list"
          >
            <a dangerouslySetInnerHTML={{ __html: name }} />
          </Link>
        </Item>
      ))}
    </Container>
  ) : null;
};

TagList.propTypes = {
  categoryList: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.array]),
  tagList: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.array]),
  context: PropTypes.shape({}).isRequired,
  Link: PropTypes.func.isRequired,
};

TagList.defaultProps = {
  categoryList: [],
  tagList: [],
};

export default inject(({ connection, settings }, { id }) => {
  const { menu } = settings.theme;

  return {
    categoryList: connection.entity('post', id).taxonomy('category'),
    tagList: connection.entity('post', id).taxonomy('tag'),
    context: home(menu),
    Link: dep('connection', 'components', 'Link'),
  };
})(TagList);
