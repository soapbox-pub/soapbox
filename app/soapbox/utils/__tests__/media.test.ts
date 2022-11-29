import { addAutoPlay } from '../media';

describe('addAutoPlay()', () => {
  describe('when the provider is Rumble', () => {
    it('adds the correct query parameters to the src', () => {
      const html = '<iframe src="https://rumble.com/embed/123456/" width="1920" height="1080" frameborder="0" title="Video upload for 1" allowfullscreen=""></iframe>';
      expect(addAutoPlay(html)).toEqual('<iframe src="https://rumble.com/embed/123456/?pub=7a20&amp;autoplay=2" width="1920" height="1080" frameborder="0" title="Video upload for 1" allowfullscreen=""></iframe>');
    });

    describe('when the iframe src already has params', () => {
      it('adds the correct query parameters to the src', () => {
        const html = '<iframe src="https://rumble.com/embed/123456/?foo=bar" width="1920" height="1080" frameborder="0" title="Video upload for 1" allowfullscreen=""></iframe>';
        expect(addAutoPlay(html)).toEqual('<iframe src="https://rumble.com/embed/123456/?foo=bar&amp;pub=7a20&amp;autoplay=2" width="1920" height="1080" frameborder="0" title="Video upload for 1" allowfullscreen=""></iframe>');
      });
    });
  });

  describe('when the provider is not Rumble', () => {
    it('adds the correct query parameters to the src', () => {
      const html = '<iframe src="https://youtube.com/embed/123456/" width="1920" height="1080" frameborder="0" title="Video upload for 1" allowfullscreen=""></iframe>';
      expect(addAutoPlay(html)).toEqual('<iframe src="https://youtube.com/embed/123456/?autoplay=1&amp;auto_play=1" width="1920" height="1080" frameborder="0" title="Video upload for 1" allowfullscreen=""></iframe>');
    });

    describe('when the iframe src already has params', () => {
      it('adds the correct query parameters to the src', () => {
        const html = '<iframe src="https://youtube.com/embed/123456?foo=bar" width="1920" height="1080" frameborder="0" title="Video upload for 1" allowfullscreen=""></iframe>';
        expect(addAutoPlay(html)).toEqual('<iframe src="https://youtube.com/embed/123456?foo=bar&amp;autoplay=1&amp;auto_play=1" width="1920" height="1080" frameborder="0" title="Video upload for 1" allowfullscreen=""></iframe>');
      });
    });
  });
});
