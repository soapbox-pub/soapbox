import clsx from 'clsx';
import React from 'react';

import ZoomableImage from './zoomable-image';

type EventRemover = () => void;

interface IImageLoader {
  alt?: string
  src: string
  previewSrc?: string
  width?: number
  height?: number
  onClick?: React.MouseEventHandler
}

class ImageLoader extends React.PureComponent<IImageLoader> {

  static defaultProps = {
    alt: '',
    width: null,
    height: null,
  };

  state = {
    loading: true,
    error: false,
    width: null,
  };

  removers: EventRemover[] = [];
  canvas: HTMLCanvasElement | null = null;
  _canvasContext: CanvasRenderingContext2D | null = null;

  get canvasContext() {
    if (!this.canvas) {
      return null;
    }
    this._canvasContext = this._canvasContext || this.canvas.getContext('2d');
    return this._canvasContext;
  }

  componentDidMount() {
    this.loadImage(this.props);
  }

  componentDidUpdate(prevProps: IImageLoader) {
    if (prevProps.src !== this.props.src) {
      this.loadImage(this.props);
    }
  }

  componentWillUnmount() {
    this.removeEventListeners();
  }

  loadImage(props: IImageLoader) {
    this.removeEventListeners();
    this.setState({ loading: true, error: false });
    Promise.all([
      props.previewSrc && this.loadPreviewCanvas(props),
      this.hasSize() && this.loadOriginalImage(props),
    ].filter(Boolean))
      .then(() => {
        this.setState({ loading: false, error: false });
        this.clearPreviewCanvas();
      })
      .catch(() => this.setState({ loading: false, error: true }));
  }

  loadPreviewCanvas = ({ previewSrc, width, height }: IImageLoader) => new Promise<void>((resolve, reject) => {
    const image = new Image();
    const removeEventListeners = () => {
      image.removeEventListener('error', handleError);
      image.removeEventListener('load', handleLoad);
    };
    const handleError = () => {
      removeEventListeners();
      reject();
    };
    const handleLoad = () => {
      removeEventListeners();
      this.canvasContext?.drawImage(image, 0, 0, width || 0, height || 0);
      resolve();
    };
    image.addEventListener('error', handleError);
    image.addEventListener('load', handleLoad);
    image.src = previewSrc || '';
    this.removers.push(removeEventListeners);
  });

  clearPreviewCanvas() {
    if (this.canvas && this.canvasContext) {
      const { width, height } = this.canvas;
      this.canvasContext.clearRect(0, 0, width, height);
    }
  }

  loadOriginalImage = ({ src }: IImageLoader) => new Promise<void>((resolve, reject) => {
    const image = new Image();
    const removeEventListeners = () => {
      image.removeEventListener('error', handleError);
      image.removeEventListener('load', handleLoad);
    };
    const handleError = () => {
      removeEventListeners();
      reject();
    };
    const handleLoad = () => {
      removeEventListeners();
      resolve();
    };
    image.addEventListener('error', handleError);
    image.addEventListener('load', handleLoad);
    image.src = src;
    this.removers.push(removeEventListeners);
  });

  removeEventListeners() {
    this.removers.forEach(listeners => listeners());
    this.removers = [];
  }

  hasSize() {
    const { width, height } = this.props;
    return typeof width === 'number' && typeof height === 'number';
  }

  setCanvasRef = (c: HTMLCanvasElement) => {
    this.canvas = c;
    if (c) this.setState({ width: c.offsetWidth });
  };

  render() {
    const { alt, src, width, height, onClick } = this.props;
    const { loading } = this.state;

    const className = clsx('image-loader', {
      'image-loader--loading': loading,
      'image-loader--amorphous': !this.hasSize(),
    });

    return (
      <div className={className}>
        {loading ? (
          <canvas
            className='image-loader__preview-canvas'
            ref={this.setCanvasRef}
            width={width}
            height={height}
          />
        ) : (
          <ZoomableImage
            alt={alt}
            src={src}
            onClick={onClick}
          />
        )}
      </div>
    );
  }

}

export default ImageLoader;
