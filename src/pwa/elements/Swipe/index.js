/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fastdom from 'fastdom/';
import fdPromised from 'fastdom/extensions/fastdom-promised';

import { getScrollingElement } from '../../../shared/helpers';

const fastdomPromised = fastdom.extend(fdPromised);

class Swipe extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    onChangeIndex: PropTypes.func,
    onTransitionEnd: PropTypes.func,
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
    threshold: PropTypes.number,
  };

  static defaultProps = {
    onChangeIndex: null,
    onTransitionEnd: null,
    threshold: 0.15,
  };

  // STYLES

  static list = {
    minHeight: '100vh',
  };

  static limiter = {
    width: 'auto',
    height: 'auto',
    position: 'relative',
    overflow: 'hidden',
  };

  static container = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };

  static slide = {
    width: '100%',
    display: 'inline-block',
    left: '0px',
  };

  // HELPERS

  static isInsideScrollableX(elem) {
    if (!elem) return false;
    const hasOverflowX = ['auto', 'scroll'].includes(window.getComputedStyle(elem).overflowX);
    const isScrollableX = elem.getBoundingClientRect().width < elem.scrollWidth && hasOverflowX;
    return isScrollableX || Swipe.isInsideScrollableX(elem.parentElement);
  }

  static isHorizontallyScrollable(element) {
    return fastdomPromised.measure(() => Swipe.isInsideScrollableX(element));
  }

  static isScrollBouncing() {
    return fastdomPromised.measure(() => {
      const { scrollHeight, scrollTop } = Swipe.scrollingElement;
      const { innerHeight } = Swipe.scrollingElement;
      return scrollTop < 0 || scrollTop > scrollHeight - innerHeight;
    });
  }

  // STATES
  static IDLE = 'IDLE';
  static START = 'START';
  static SCROLLING = 'SCROLLING';
  static SWIPING = 'SWIPING';
  static MOVING = 'MOVING';
  static MOVING_FROM_PROPS = 'MOVING_FROM_PROPS';

  constructor(props) {
    super(props);
    // Array with the scroll positions of each post
    this.scrolls = Array(props.children.length).fill(0);

    this.initialTouch = {};

    this.dx = 0;
    this.vx = 0;
    this.velocityThreshold = 5; // for velocity, arbitrary value

    // this.fromProps = false;

    this.state = { active: props.index };

    // innerState
    this.innerState = Swipe.IDLE;

    this.next = props.index;

    // this.handleScroll = this.handleScroll.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);

    // new methods
    this.isMovingHorizontally = this.isMovingHorizontally.bind(this);
    this.firstOrLastSlideReached = this.firstOrLastSlideReached.bind(this);

    // this.moveToNext = this.moveToNext.bind(this);
    this.updateActiveSlide = this.updateActiveSlide.bind(this);
    this.changeActiveSlide = this.changeActiveSlide.bind(this);

    // Style methods
    this.storeCurrentScroll = this.storeCurrentScroll.bind(this);
    this.stopSlideContainer = this.stopSlideContainer.bind(this);
    this.moveToCurrentSlide = this.moveToCurrentSlide.bind(this);
    this.moveFromPropsToSlide = this.moveFromPropsToSlide.bind(this);
    // this.stopCurrentSlide = this.stopCurrentSlide.bind(this);
    this.swipeToSlide = this.swipeToSlide.bind(this);
    this.moveSlideContainer = this.moveSlideContainer.bind(this);
    this.updateSlideScrolls = this.updateSlideScrolls.bind(this);
  }

  async componentDidMount() {
    if (!window) return;

    // Initialize the scrolling element
    if (!Swipe.scrollingElement) Swipe.scrollingElement = await getScrollingElement();

    // Initialize the slides' style
    await fastdomPromised.mutate(() => this.updateSlideScrolls(this.state.active));

    // Gets the innerWidth...
    this.innerWidth = await fastdomPromised.measure(() => window.innerWidth);

    // Adds event listeners
    window.addEventListener('scroll', this.handleScroll);

    // Adds non-passive event listener for touchmove
    if (this.ref) {
      this.ref.addEventListener('touchstart', this.handleTouchStart, {
        passive: false,
        capture: true,
      });
      this.ref.addEventListener('touchmove', this.handleTouchMove, {
        passive: false,
      });
    }
  }

  componentWillReceiveProps({ index, children }) {
    // const { active } = this.state;
    const { MOVING_FROM_PROPS } = Swipe;
    const { next } = this;

    // Ignore invalid Index
    if (index < 0 || index >= children.length) return;

    // Ignore changes to same Index
    if (index === next) return;

    this.next = index;
    this.setInnerState(MOVING_FROM_PROPS);
    this.changeActiveSlide();
  }

  componentWillUnmount() {
    this.ref.removeEventListener('touchstart', this.handleTouchStart);
    this.ref.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('scroll', this.handleScroll);
  }

  setInnerState(newState) {
    console.log(`${this.innerState} => ${newState}`);
    this.innerState = newState;
  }

  storeCurrentScroll() {
    return fastdomPromised.measure(() => {
      this.scrolls[this.state.active] = Swipe.scrollingElement.scrollTop;
    });
  }

  restoreCurrentScroll() {
    return fastdomPromised.measure(() => {
      Swipe.scrollingElement.scrollTop = this.scrolls[this.state.active];
    });
  }

  isMovingHorizontally(pos) {
    const prevPos = this.initialTouch;
    return Math.abs(pos.pageX - prevPos.pageX) > Math.abs(pos.pageY - prevPos.pageY);
  }

  firstOrLastSlideReached() {
    const { active } = this.state;
    const { children } = this.props;
    return (active === 0 && this.dx >= 0) || (active === children.length - 1 && this.dx <= 0);
  }

  stopSlideContainer() {
    console.log('stopSlideContainer');
    return fastdomPromised.measure(() => {
      this.ref.style.transition = 'none';
      this.ref.style.transform = 'none';
    });
  }

  moveToCurrentSlide() {
    console.log('moveToCurrentSlide');
    return fastdomPromised.measure(() => {
      this.ref.style.transition = `transform 350ms ease-out`;
      this.ref.style.transform = `translateX(0)`;
    });
  }

  swipeToSlide(index) {
    console.log('swipeToSlide');
    return fastdomPromised.measure(() => {
      const { active } = this.state;
      // const { next } = this;
      const move = (active - index) * 100; // percentage
      this.ref.style.transition = `transform 350ms ease-out`;
      this.ref.style.transform = `translateX(${move}%)`;
    });
  }

  moveFromPropsToSlide(from, to, x) {
    return fastdomPromised.mutate(() => {
      this.ref.style.transition = 'none';
      this.ref.style.transform = `translateX(calc(${100 * (to - from)}% + ${x}px))`;
    });
  }

  moveSlideContainer() {
    return fastdomPromised.measure(() => {
      this.ref.style.transition = 'none';
      this.ref.style.transform = `translateX(${this.dx}px)`;
    });
  }

  // SLIDES

  updateSlideScrolls(index) {
    return fastdomPromised.measure(() => {
      // const { active } = this.state;
      const { scrolls, ref } = this;

      Array.from(ref.children).forEach(({ style }, i) => {
        scrolls[i] = scrolls[i] || 0; // init scrolls if required

        style.position = i !== index ? 'absolute' : 'relative';
        style.transform =
          i !== index
            ? `translate(${100 * (i - index)}%, ${scrolls[index] - scrolls[i]}px)`
            : 'none';
      });
    });
  }

  nextSlidePosition() {
    const { children, threshold } = this.props;
    const last = children.length - 1;
    let moveSlide = 0;

    // Position or velocity that triggers a slide change
    if (Math.abs(this.vx) > this.velocityThreshold)
      moveSlide = Math.sign(Math.sign(this.vx) + Math.sign(this.dx));
    else if (Math.abs(this.dx) > this.innerWidth * threshold) moveSlide = Math.sign(this.dx);

    let next = this.state.active - moveSlide;

    // Prevents going far away
    if (next < 0) next = 0;
    else if (next > last) next = last;

    return next;
  }

  handleScroll() {
    this.storeCurrentScroll();
  }

  async handleTouchStart(e) {
    const { IDLE, SCROLLING, START } = Swipe;
    const { targetTouches, target } = e;

    const [isHorizontallyScrollable, isScrollBouncing] = await Promise.all([
      Swipe.isHorizontallyScrollable(target),
      Swipe.isScrollBouncing(),
    ]);

    if (this.innerState === IDLE && !isScrollBouncing) {
      const [{ pageX, pageY }] = targetTouches;

      this.initialTouch = { pageX, pageY }; // Store initial touch
      this.storeCurrentScroll(); // Store the current scroll value

      // Change current STATE
      this.setInnerState(isHorizontallyScrollable ? SCROLLING : START);
    } else e.preventDefault(); // Ignore event if the state is not IDLE
  }

  handleTouchMove(e) {
    const { START, SWIPING, SCROLLING } = Swipe;
    const [{ pageX, pageY }] = e.targetTouches;
    const { active } = this.state;

    if (this.innerState === START && !this.isMovingHorizontally({ pageX, pageY })) {
      this.setInnerState(SCROLLING);
    } else if (this.innerState === START) {
      // START => SWIPING
      e.preventDefault(); // Avoid scroll.
      this.setInnerState(SWIPING);
      this.initialTouch = { pageX, pageY };
      // Update scrolls when starts swiping
      this.updateSlideScrolls(active);
    } else if (this.innerState === SWIPING) {
      // SWIPING
      e.preventDefault(); // Avoid scroll.

      const dxPrev = this.dx;
      this.dx = pageX - this.initialTouch.pageX; // Updates dx value
      // In case you reach the first or the last slide...
      if (this.firstOrLastSlideReached()) {
        // Stops slide container.
        this.dx = 0;
        this.vx = 0;
        this.initialTouch.pageX = pageX;
      } else {
        this.vx = this.vx * 0.5 + (this.dx - dxPrev) * 0.5; // Updates velocity value
      }

      this.moveSlideContainer();
    } else {
      console.log(`DONT MOVE 'cause ${this.innerState}`);
    }
  }

  handleTouchEnd() {
    const { IDLE, START, MOVING, SCROLLING, SWIPING } = Swipe;
    const { onChangeIndex } = this.props;
    if ([START, SCROLLING].includes(this.innerState)) {
      // START || SCROLLING => IDLE
      this.setInnerState(IDLE);
    } else if (this.innerState === SWIPING) {
      // SWIPING => MOVING
      this.setInnerState(MOVING);
      // Move to next or to current slide according to next value.
      this.next = this.nextSlidePosition();
      if (this.next !== this.state.active) {
        if (typeof onChangeIndex === 'function')
          onChangeIndex({ index: this.next, fromProps: false });
        this.swipeToSlide(this.next);
      } else if (this.dx === 0) {
        this.setInnerState(IDLE);
        this.stopSlideContainer();
      } else this.moveToCurrentSlide();
    } else {
      console.log(`TOUCH_END IGNORED 'cause ${this.innerState}`);
    }
  }

  // moveToNext() {
  //   const { onChangeIndex } = this.props;
  //   fastdom.mutate(this.swipeToSlide);
  //   if (onChangeIndex) onChangeIndex({ index: this.next, fromProps: false });
  // }

  handleTransitionEnd({ target }) {
    const { IDLE, MOVING, MOVING_FROM_PROPS } = Swipe;
    const skipFrame = () =>
      window.requestAnimationFrame(() => {
        const { onTransitionEnd } = this.props;
        const { active } = this.state;
        const { ref, fromProps, next } = this;

        // Ignores transitionEnd events from children.
        if (ref !== target) return;

        if (this.innerState === MOVING) {
          this.setInnerState(IDLE);
          if (next === active) return;
          // Executes onTransitionEnd callback if index is going to change
          if (onTransitionEnd) onTransitionEnd({ index: next, fromProps });
          // Change Index
          this.updateActiveSlide();
        } else if (this.innerState === MOVING_FROM_PROPS) {
          console.log('MOVING_FROM_PROPS');
          this.setInnerState(IDLE);
          this.stopSlideContainer();
        }
      });

    window.requestAnimationFrame(skipFrame);
  }

  changeActiveSlide() {
    console.log('changeActiveSlide');
    const { next, ref } = this;
    const { active: previousActive } = this.state;
    const { onChangeIndex } = this.props;

    if (onChangeIndex) onChangeIndex({ index: next, fromProps: true });

    this.setState({ active: next }, async () => {
      let x = 0;
      fastdom.measure(() => {
        ({ x } = ref.getBoundingClientRect());
      });

      await Promise.all([
        this.restoreCurrentScroll(),
        this.updateSlideScrolls(next),
        this.moveFromPropsToSlide(previousActive, next, x),
      ]);
      //
      // await fastdomPromised.mutate(() => {
      //   this.ref.style.transition = 'none';
      //   this.ref.style.transform = `translateX(calc(${100 * (next - previousActive)}% + ${x}px))`;
      // });

      this.moveToCurrentSlide();

      // fastdom.mutate(this.moveToCurrentSlide);
    });
  }

  updateActiveSlide() {
    this.setState({ active: this.next }, () => {
      console.log('updateActiveSlide');
      this.restoreCurrentScroll();
      this.updateSlideScrolls(this.next);
      this.stopSlideContainer();
      //
      // fastdom.mutate(() => {
      //   Swipe.scrollingElement.scrollTop = this.scrolls[this.state.active];
      //   this.updateSlideScrolls(this.next);
      // });
    });
  }

  render() {
    const { container, limiter, list } = Swipe;

    const children = React.Children.map(this.props.children, (child, i) => (
      <div key={i} style={Swipe.slide}>
        <child.type {...child.props} />
      </div>
    ));

    return (
      <div style={container}>
        <div style={limiter}>
          <div
            style={list}
            onTouchEnd={this.handleTouchEnd}
            onTransitionEnd={this.handleTransitionEnd}
            ref={ref => {
              this.ref = ref;
            }}>
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default Swipe;
