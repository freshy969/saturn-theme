/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import he from 'he';
import Link from '../../pwa/components/Link';
import Image from '../components/Image';
import { media } from '../contexts';

export default {
  test: element => {
    const { tagName, ignore } = element;
    // Returns false if it's already a lazy component.
    if (ignore) return false;

    // Returns true if element is an <img>.
    if (tagName === 'img') return true;

    // Filters comments out of children.
    return false;
  },
  converter: (element, { extraProps: { item } }) => {
    const { attributes } = element;
    const { alt, srcset } = attributes;

    // Return an Image component with id if image has attachedId.
    if (attributes.dataset && attributes.dataset.attachmentId) {
      const attachmentId = parseInt(attributes.dataset.attachmentId, 10);
      const contentContext = [item.entity.media.featured.id]
        .concat(item.entity.media.content)
        .reduce((final, current) => {
          if (!final.includes(current)) final.push(current);
          return final;
        }, []);

      return (
        <Link
          type="media"
          id={attachmentId}
          context={media(contentContext || [])}
          eventCategory="Post"
          eventAction="open content media"
        >
          <a>
            <Image content key={attachmentId} id={attachmentId} />
          </a>
        </Link>
      );
    }

    let src;

    // Get src attribute from different cases or assign an empty string.
    if (attributes.src && typeof attributes.src === 'string') {
      ({ src } = attributes);
    } else if (
      attributes.dataset &&
      attributes.dataset.original &&
      typeof attributes.dataset.original === 'string'
    ) {
      src = attributes.dataset.original;
    } else {
      src = '';
    }

    let height;

    // Calculate width and height.
    if (attributes.height && attributes.width) {
      height = `${(attributes.height * 100) / attributes.width}vw`; // prettier-ignore
    } else {
      height = 'auto';
    }

    return (
      <Image
        key={src}
        content
        width="100vw"
        height={height}
        alt={alt}
        src={he.decode(src)}
        srcSet={srcset ? he.decode(srcset) : null}
      />
    );
  },
};
