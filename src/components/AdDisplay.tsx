import React from 'react';
import { PlacementPosition, Ad, AdPlacement, AdsSettings } from '../types';
import { AdSlot } from './AdSlot';

interface AdDisplayProps {
  position: PlacementPosition;
  slotKey?: string;
  placements?: AdPlacement[];
  ads?: Ad[];
  settings?: AdsSettings | any;
  currentArticleId?: string;
  currentCategoryId?: string;
  className?: string;
  isPreview?: boolean;
}

export const AdDisplay: React.FC<AdDisplayProps> = (props) => {
  return <AdSlot {...props} />;
};

export default AdDisplay;
