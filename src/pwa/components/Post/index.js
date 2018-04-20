import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { connect } from 'react-redux';
import { compose, pure } from 'recompose';
import styled from 'react-emotion';
import { dep } from 'worona-deps';
import Lazy from '../../elements/LazyAnimated';
import SameHeight from '../../elements/SameHeight';
import Header from '../../../shared/components/Post/Header';
import Content from '../../../shared/components/Content';
import Author from '../../../shared/components/Post/Author';
import Fecha from '../../../shared/components/Post/Fecha';
import TagList from './TagList';
import Spinner from '../../elements/Spinner';
import Comments from '../Comments';
import Carousel from '../Carousel';
import * as selectors from '../../selectors';

class Post extends Component {
  static propTypes = {
    mstId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    ready: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    lists: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    fromList: PropTypes.shape({}).isRequired,
    postAuthorPosition: PropTypes.string,
    postFechaPosition: PropTypes.string,
    featuredImageDisplay: PropTypes.bool,
  };

  static defaultProps = {
    postAuthorPosition: 'header',
    postFechaPosition: 'header',
    featuredImageDisplay: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      currentList: null,
      carouselLists: null,
    };

    this.setLists = this.setLists.bind(this);
  }

  componentWillMount() {
    this.setLists();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lists !== nextProps.lists || this.props.fromList !== nextProps.fromList) {
      this.setLists(nextProps);
    }
  }

  // shouldComponentUpdate() {
  //   return !this.props.ready;
  // }

  setLists(nextProps = this.props) {
    const { listType, listId } = nextProps.fromList;
    let index = nextProps.lists.findIndex(item => item.type === listType && item.id === listId);

    if (index < 0) index = 0;

    const extendedLists = nextProps.lists.concat(nextProps.lists.slice(0, 2));
    const carouselLists = extendedLists.slice(index, index + 3);
    const currentList = carouselLists.splice(0, 1)[0];

    this.setState({
      currentList,
      carouselLists,
    });
  }

  render() {
    const {
      mstId,
      type,
      id,
      ready,
      isSelected,
      postAuthorPosition,
      postFechaPosition,
      featuredImageDisplay,
    } = this.props;

    const { currentList, carouselLists } = this.state;

    const rootLazyProps = {
      animate: Lazy.onMount,
      offsetVertical: 2000,
      offsetHorizontal: 50,
      debounce: false,
      throttle: 100,
    };

    const contentLazyProps = {
      animate: Lazy.onMount,
      offsetVertical: 2000,
      offsetHorizontal: 50,
      debounce: true,
      throttle: 100,
    };

    const carouselCurrentList = {
      size: 'small',
      type: currentList.type,
      id: currentList.id,
      params: { excludeTo: id, limit: 5 },
    };

    const carousel = [
      {
        index: 3,
        doNotPlaceAtTheEnd: true,
        value: <Carousel title="Te puede interesar..." {...carouselCurrentList} />,
      },
    ];

    return ready ? (
      <Container featuredImageDisplay={featuredImageDisplay}>
        <SameHeight id={mstId}>
          <Lazy {...rootLazyProps}>
            <LazyContainer>
              <Header type={type} id={id} />
              <ContentContainer>
                <Lazy
                  id={mstId}
                  async={!isSelected}
                  {...contentLazyProps}
                  placeholder={
                    <ContentSpinnerContainer>
                      <Spinner />
                    </ContentSpinnerContainer>
                  }
                >
                  {/* <Content id={id} type={type} elementsToInject={carousel} /> */}
                  <Content id={id} type={type} />
                  {(postAuthorPosition === 'footer' || postFechaPosition === 'footer') && (
                    <InnerContainer>
                      {postAuthorPosition === 'footer' && <Author type={type} id={id} />}
                      {postFechaPosition === 'footer' && <Fecha type={type} id={id} />}
                    </InnerContainer>
                  )}
                  <TagList id={id} />
                  <Comments id={id} />
                  {/* <Carousel title="Siguientes artículos" {...carouselCurrentList} /> */}
                  {/* {carouselLists.map(list => (
                    <Carousel
                      key={list.id}
                      title={`Más en ${list.title}`}
                      size="medium"
                      type={list.type}
                      id={list.id}
                      params={{ exclude: id, limit: 5 }}
                    />
                  ))} */}
                </Lazy>
              </ContentContainer>
            </LazyContainer>
          </Lazy>
        </SameHeight>
      </Container>
    ) : (
      <SpinnerContainer>
        <Spinner />
      </SpinnerContainer>
    );
  }
}

const mapStateToProps = state => {
  const postAuthor =
    dep('settings', 'selectorCreators', 'getSetting')('theme', 'postAuthor')(state) || {};
  const postFecha =
    dep('settings', 'selectorCreators', 'getSetting')('theme', 'postFecha')(state) || {};
  const featuredImage =
    dep('settings', 'selectorCreators', 'getSetting')('theme', 'featuredImage')(state) || {};

  return {
    lists: selectors.list.getLists(state),
    postAuthorPosition: postAuthor.position,
    postFechaPosition: postFecha.position,
    featuredImageDisplay: featuredImage.display,
  };
};

export default compose(
  connect(mapStateToProps),
  inject(({ connection }, { type, id }) => ({
    ready: connection.entity(type, id).ready,
    fromList: connection.selectedContext.getItem({ item: { type, id } }).fromList,
    isSelected: connection.selectedContext.getItem({ item: { type, id } }).isSelected,
  })),
  pure,
)(Post);

const Container = styled.div`
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  transition: padding-top 0.5s ease;
  z-index: 0;
  position: relative;
  margin-bottom: ${({ featuredImageDisplay }) => (featuredImageDisplay ? '30px' : '')};
  border-bottom: 1px solid #eee;
  min-height: 200vh;
  height: auto;
`;

const LazyContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: top;
  color: ${({ theme }) => theme.colors.grey};
  margin-top: 20px;
`;

const ContentContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;

  & > .LazyLoad {
    width: 100%;
  }
`;

const SpinnerContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

const ContentSpinnerContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100px;
`;
