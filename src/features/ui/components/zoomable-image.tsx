import clsx from 'clsx';
import { PureComponent } from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type Point = { x: number; y: number };

const getMidpoint = (p1: React.Touch, p2: React.Touch): Point => ({
  x: (p1.clientX + p2.clientX) / 2,
  y: (p1.clientY + p2.clientY) / 2,
});

const getDistance = (p1: React.Touch, p2: React.Touch): number =>
  Math.sqrt(Math.pow(p1.clientX - p2.clientX, 2) + Math.pow(p1.clientY - p2.clientY, 2));

const clamp = (min: number, max: number, value: number): number => Math.min(max, Math.max(min, value));

interface IZoomableImage {
  alt?: string;
  src: string;
  onClick?: React.MouseEventHandler;
  isMobile?: boolean;
}

class ZoomableImage extends PureComponent<IZoomableImage> {

  static defaultProps = {
    alt: '',
    width: null,
    height: null,
  };

  state = {
    scale: MIN_SCALE,
    isDragging: false,
  };

  container: HTMLDivElement | null = null;
  image: HTMLImageElement | null = null;
  lastDistance = 0;
  isDragging = false;
  isMouseDown = false;
  clickStartTime = 0;
  startX = 0;
  startY = 0;
  startScrollLeft = 0;
  startScrollTop = 0;
  isMobile = this.props.isMobile;

  componentDidMount() {
    this.container?.addEventListener('touchstart', this.handleTouchStart);
    // on Chrome 56+, touch event listeners will default to passive
    // https://www.chromestatus.com/features/5093566007214080
    this.container?.addEventListener('touchmove', this.handleTouchMove, { passive: false });
  }

  componentWillUnmount() {
    this.container?.removeEventListener('touchstart', this.handleTouchStart);
    this.container?.removeEventListener('touchmove', this.handleTouchMove);
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

  handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.state.isDragging) {
      this.setState({ isDragging: false });
    }

    if (this.state.scale === 1 || !this.container) return;

    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startScrollLeft = this.container.scrollLeft;
    this.startScrollTop = this.container.scrollTop;

    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  };

  handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging || !this.container) return;

    e.preventDefault();
    e.stopPropagation();

    const deltaX = this.startX - e.clientX;
    const deltaY = this.startY - e.clientY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) this.setState({ isDragging: true });

    this.container.scrollLeft = this.startScrollLeft + deltaX;
    this.container.scrollTop = this.startScrollTop + deltaY;
  };

  handleMouseUp = (e: MouseEvent) => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  };



  zoom(nextScale: number, midpoint: Point) {
    if (!this.container || this.state.isDragging) return;

    const { scale } = this.state;
    const { scrollLeft, scrollTop,  clientWidth, clientHeight } = this.container;

    // math memo:
    // x = (scrollLeft + midpoint.x) / scrollWidth
    // x' = (nextScrollLeft + midpoint.x) / nextScrollWidth
    // scrollWidth = clientWidth * scale
    // scrollWidth' = clientWidth * nextScale
    // Solve x = x' for nextScrollLeft
    const originX = (midpoint.x / clientWidth) * 100;
    const originY = (midpoint.y / clientHeight) * 100;

    const nextScrollLeft = (scrollLeft + midpoint.x) * nextScale / scale - midpoint.x;
    const nextScrollTop = (scrollTop + midpoint.y) * nextScale / scale - midpoint.y;

    this.setState({ scale: nextScale }, () => {
      if (!this.container) return;
      this.container.scrollLeft = nextScrollLeft;
      this.container.scrollTop = nextScrollTop;
      if (!this.isMobile) this.image!.style.transformOrigin = `${originX}% ${originY}%`;
    });
  }

  handleClick: React.MouseEventHandler = e => {
    e.stopPropagation();

    if (this.isMobile) {
      const handler = this.props.onClick;
      if (handler) handler(e);
    } else {
      if (this.state.scale !== 1) {
        this.zoom(1, { x: 0, y: 0 });
      } else {
        if (!this.image) return;

        const rect = this.image.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const midpoint: Point = { x: clickX, y: clickY };
        this.zoom(2, midpoint);
      }
    }
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
        className='relative flex size-full items-center justify-center'
        ref={this.setContainerRef}
        style={{ overflow, cursor: scale > 1 ? 'grab' : 'default' }}
      >
        <img
          role='presentation'
          ref={this.setImageRef}
          alt={alt}
          className={clsx('size-auto max-h-[80%] max-w-full object-contain', scale !== 1 ? 'size-full' : 'hover:cursor-pointer')}
          title={alt}
          src={src}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: `${scale > 1 && !this.isMobile ? 'center' : '0 0'}`,
          }}
          onClick={this.handleClick}
          onMouseDown={this.handleMouseDown}
        />
      </div>
    );
  }

}

export default ZoomableImage;