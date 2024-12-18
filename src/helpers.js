import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { isInternalURL, flattenToAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

export const getFieldURL = (data) => {
  let url = data;
  const _isObject = data && isObject(data) && !isArray(data);
  if (_isObject && data['@type'] === 'URL') {
    url = data['value'] ?? data['url'] ?? data['href'] ?? data;
  } else if (_isObject) {
    url = data['@id'] ?? data['url'] ?? data['href'] ?? data;
  }
  if (isArray(data)) {
    url = data.map((item) => getFieldURL(item));
  }
  if (isString(url) && isInternalURL(url)) return flattenToAppURL(url);
  return url;
};

export function getImageScaleParams(image, size) {
  const imageScale =
    config.blocks.blocksConfig?.['teaser']?.imageScale || size || 'preview';

  if (isString(image))
    return isInternalURL(image)
      ? { download: flattenToAppURL(`${image}/@@images/image/${imageScale}`) }
      : { download: image };

  if (image) {
    if (isInternalURL(getFieldURL(image))) {
      if (image?.image_scales?.[image?.image_field]) {
        const scale =
          image.image_scales[image.image_field]?.[0].scales?.[imageScale] ||
          image.image_scales[image.image_field]?.[0];

        const download = flattenToAppURL(
          `${getFieldURL(image)}/${scale?.download}`,
        );
        const width = scale?.width;
        const height = scale?.height;

        return {
          download,
          width,
          height,
        };
      } else if (image?.image?.scales) {
        const scale = image.image?.scales?.[imageScale] || image.image;
        const download = flattenToAppURL(scale?.download);
        const width = scale?.width;
        const height = scale?.height;

        return {
          download,
          width,
          height,
        };
      } else {
        //fallback if we do not have scales
        return {
          download: flattenToAppURL(
            `${getFieldURL(image)}/@@images/${
              image.image_field || 'image'
            }/${imageScale}`,
          ),
        };
      }
    } else {
      return { download: getFieldURL(image) };
    }
  }
}
