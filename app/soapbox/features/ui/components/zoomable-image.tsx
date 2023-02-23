import React from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type Point = { x: number, y: number };

const getMidpoint = (p1: React.Touch, p2: React.Touch): Point => ({
  x: (p1.clientX + p2.clientX) / 2,
  y: (p1.clientY + p2.clientY) / 2,
});

const getDistance = (p1: React.Touch, p2: React.Touch): number =>
  Math.sqrt(Math.pow(p1.clientX - p2.clientX, 2) + Math.pow(p1.clientY - p2.clientY, 2));

const clamp = (min: number, max: number, value: number): number => Math.min(max, Math.max(min, value));

interface IZoomableImage {
  alt?: string
  src: string
  onClick?: React.MouseEventHandler
}

class ZoomableImage extends React.PureComponent<IZoomableImage> {

  static defaultProps = {
    alt: '',
    width: null,
    height: null,
  };

  state = {
    scale: MIN_SCALE,
  };

  container: HTMLDivElement | null = null;
  image: HTMLImageElement | null = null;
  lastDistance = 0;

  componentDidMount() {
    this.container?.addEventListener('touchstart', this.handleTouchStart);
    // on Chrome 56+, touch event listeners will default to passive
    // https://www.chromestatus.com/features/5093566007214080
    this.container?.addEventListener('touchmove', this.handleTouchMove, { passive: false });
  }

  componentWillUnmount() {
    this.container?.removeEventListener('touchstart', this.handleTouchStart);
    this.container?.removeEventListener('touchend', this.handleTouchMove);
  }

  handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    const [p1, p2] = Array.from(e.touches);

    this.lastDistance = getDistance(p1, p2);
  };

  handleTouchMove = (e: TouchEvent) => {
    if (!this.container) return;

    const { scrollTop, scrollHeight, clientHeight } = this.container;
    if (e.touches.length === 1 && scrollTop !== scrollHeight - clientHeight) {
      // prevent propagating event to MediaModal
      e.stopPropagation();
      return;
    }
    if (e.touches.length !== 2) return;

    e.preventDefault();
    e.stopPropagation();

    const [p1, p2] = Array.from(e.touches);
    const distance = getDistance(p1, p2);
    const midpoint = getMidpoint(p1, p2);
    const scale = clamp(MIN_SCALE, MAX_SCALE, this.state.scale * distance / this.lastDistance);

    this.zoom(scale, midpoint);

    this.lastDistance = distance;
  };

  zoom(nextScale: number, midpoint: Point) {
    if (!this.container) return;

    const { scale } = this.state;
    const { scrollLeft, scrollTop } = this.container;

    // math memo:
    // x = (scrollLeft + midpoint.x) / scrollWidth
    // x' = (nextScrollLeft + midpoint.x) / nextScrollWidth
    // scrollWidth = clientWidth * scale
    // scrollWidth' = clientWidth * nextScale
    // Solve x = x' for nextScrollLeft
    const nextScrollLeft = (scrollLeft + midpoint.x) * nextScale / scale - midpoint.x;
    const nextScrollTop = (scrollTop + midpoint.y) * nextScale / scale - midpoint.y;

    this.setState({ scale: nextScale }, () => {
      if (!this.container) return;
      this.container.scrollLeft = nextScrollLeft;
      this.container.scrollTop = nextScrollTop;
    });
  }

  handleClick: React.MouseEventHandler = e => {
    // don't propagate event to MediaModal
    e.stopPropagation();
    const handler = this.props.onClick;
    if (handler) handler(e);
  };

  setContainerRef = (c: HTMLDivElement) => {
    this.container = c;
  };

  setImageRef = (c: HTMLImageElement) => {
    this.image = c;
  };

  render() {
    const { alt, src } = this.props;
    const { scale } = this.state;
    const overflow = scale === 1 ? 'hidden' : 'scroll';

    return (
      <div
        className='zoomable-image'
        ref={this.setContainerRef}
        style={{ overflow }}
      >
        <img
          role='presentation'
          ref={this.setImageRef}
          alt={alt}
          title={alt}
          src={src}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
          onClick={this.handleClick}
        />
      </div>
    );
  }

}

export default ZoomableImage;