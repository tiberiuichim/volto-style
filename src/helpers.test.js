import { getFieldURL, getImageScaleParams } from './helpers';
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers';

jest.mock('@plone/volto/helpers', () => ({
  flattenToAppURL: jest.fn((url) => url),
  isInternalURL: jest.fn((url) => true),
}));

describe('getImageScaleParams', () => {
  it('returns expected image scale URL obj when image_field and image_scales properties are passed', () => {
    const image = {
      '@id': 'http://localhost:3000/image',
      image_field: 'image',
      image_scales: {
        image: [
          {
            download: '@@images/image.png',
            width: 400,
            height: 400,
            scales: {
              preview: {
                download: '@@images/image-400.png',
                width: 400,
                height: 400,
              },
            },
          },
        ],
      },
    };

    const expectedUrlObj = {
      download: 'http://localhost:3000/image/@@images/image-400.png',
      width: 400,
      height: 400,
    };
    expect(getImageScaleParams(image, 'preview')).toEqual(expectedUrlObj);
  });

  it('returns expected image scale URL obj when image_field and image_scales properties are passed but with no scales', () => {
    const image = {
      '@id': 'http://localhost:3000/image',
      image_field: 'image',
      image_scales: {
        image: [
          {
            download: '@@images/image.png',
            width: 400,
            height: 400,
          },
        ],
      },
    };

    const expectedUrlObj = {
      download: 'http://localhost:3000/image/@@images/image.png',
      width: 400,
      height: 400,
    };
    expect(getImageScaleParams(image, 'preview')).toEqual(expectedUrlObj);
  });

  it('returns expected image scale URL obj when image properties are passed', () => {
    const image = {
      '@id': 'http://localhost:3000/image',
      image: {
        download: 'http://localhost:3000/image/@@images/image.png',
        width: 400,
        height: 400,
        scales: {
          preview: {
            download: 'http://localhost:3000/image/@@images/image-400.png',
            width: 400,
            height: 400,
          },
        },
      },
    };
    const expectedUrlObj = {
      download: 'http://localhost:3000/image/@@images/image-400.png',
      width: 400,
      height: 400,
    };
    expect(getImageScaleParams(image, 'preview')).toEqual(expectedUrlObj);
  });

  it('calls flattenToAppURL when internalUrl', () => {
    const url = 'http://localhost:3000/image';
    const size = 'large';
    getImageScaleParams(url, size);
    expect(flattenToAppURL).toHaveBeenCalledWith('http://localhost:3000/image');
  });

  it('returns expected image scale URL string when image url (string) is passed', () => {
    const image = 'http://localhost:3000/image/@@images/image.png';
    expect(getImageScaleParams(image, 'preview')).toEqual({
      download: `${image}/@@images/image/preview`,
    });
  });

  it('returns image URL string when external image url (string) is passed', () => {
    isInternalURL.mockReturnValue(false);
    const image = 'http://external-url.com';
    expect(getImageScaleParams(image)).toEqual({
      download: image,
    });
  });

  it('returns image URL string when image url (object) with no scales is passed', () => {
    isInternalURL.mockReturnValue(true);
    const image = {
      '@id': 'http://localhost:3000/image',
      image: {
        download: 'http://localhost:3000/image/@@images/image.png',
        width: 400,
        height: 400,
      },
    };
    expect(getImageScaleParams(image)).toEqual({
      download: `${image['@id']}/@@images/image/preview`,
    });
  });

  it('returns image URL string when external image url (object) is passed', () => {
    isInternalURL.mockReturnValue(false);
    const image = {
      '@id': 'http://external-url.com',
      image: {
        download: 'http://external-url.com',
        width: 400,
        height: 400,
        scales: {
          preview: {
            download: 'hhttp://external-url.com',
            width: 400,
            height: 400,
          },
        },
      },
    };
    expect(getImageScaleParams(image)).toEqual({
      download: image['@id'],
    });
  });
});
describe('getFieldURL', () => {
  it('handles a URL type object with type and value', () => {
    const data = {
      '@type': 'URL',
      value: 'value_url',
      url: 'url_url',
      href: 'href_url',
    };
    expect(getFieldURL(data)).toEqual('value_url');
  });

  it('handles an object with type and url', () => {
    const data = {
      '@type': 'URL',
      url: 'url_url',
      href: 'href_url',
    };
    expect(getFieldURL(data)).toEqual('url_url');
  });

  it('handles an object with type and href', () => {
    const data = {
      '@type': 'URL',
      href: 'href_url',
    };
    expect(getFieldURL(data)).toEqual('href_url');
  });

  it('handles an object with type and no value, url and href', () => {
    const data = {
      '@type': 'URL',
    };
    expect(getFieldURL(data)).toEqual({ '@type': 'URL' });
  });

  it('handles an object without a specific type and url', () => {
    const data = {
      url: 'url_url',
      href: 'href_url',
    };
    expect(getFieldURL(data)).toEqual('url_url');
  });

  it('handles an object without a specific type and href', () => {
    const data = {
      href: 'href_url',
    };
    expect(getFieldURL(data)).toEqual('href_url');
  });

  it('handles an object without a specific type and no id, url, href', () => {
    const data = {
      test: 'test_url',
    };
    expect(getFieldURL(data)).toEqual({
      test: 'test_url',
    });
  });

  it('handles an array', () => {
    const data = [
      {
        '@type': 'URL',
        value: 'value_url',
        url: 'url_url',
        href: 'href_url',
      },
      {
        '@id': 'id_url',
        url: 'url_url',
        href: 'href_url',
      },
    ];
    expect(getFieldURL(data)).toEqual(['value_url', 'id_url']);
  });

  it('handles a string', () => {
    const data = '/some/url';
    expect(getFieldURL(data)).toEqual('/some/url');
  });

  it('returns the data unchanged for non-object/non-array/non-string inputs', () => {
    expect(getFieldURL(42)).toEqual(42);
    expect(getFieldURL(undefined)).toEqual(undefined);
    expect(getFieldURL(null)).toEqual(null);
  });
});
