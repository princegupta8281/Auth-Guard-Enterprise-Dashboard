import React, { useEffect, useState } from 'react';
import { getAsset } from '../services/api';

const AuthenticatedImage = ({ path, alt, className }) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    if (!path) {
      setImageUrl('');
      return undefined;
    }

    getAsset(path)
      .then(({ data }) => {
        if (active) {
          objectUrl = URL.createObjectURL(data);
          setImageUrl(objectUrl);
        }
      })
      .catch(() => {
        if (active) {
          setImageUrl('');
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [path]);

  return imageUrl ? <img src={imageUrl} alt={alt} className={className} /> : null;
};

export default AuthenticatedImage;
