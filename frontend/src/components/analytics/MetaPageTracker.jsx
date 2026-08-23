import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { captureAttribution } from '../../utils/attribution';
import { initializeMetaPixel, trackPageView } from '../../utils/metaPixel';

export default function MetaPageTracker() {
  const location = useLocation();

  useEffect(() => {
    initializeMetaPixel();
    captureAttribution(location.search);
    trackPageView();
  }, [location.pathname, location.search]);

  return null;
}
