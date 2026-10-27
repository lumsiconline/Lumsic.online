import React from 'react';
import { AstralStoreWhiteView } from './AstralStoreWhiteView';

interface AstralShopSectionProps {
  onNavigateSection?: (sectionId: string) => void;
  onGoBack?: () => void;
  currentCurrency?: string;
}

export const AstralShopSection: React.FC<AstralShopSectionProps> = ({ onGoBack, currentCurrency }) => {
  return (
    <section id="astral-shop" className="scroll-mt-20">
      <AstralStoreWhiteView onGoBack={onGoBack} currentCurrency={currentCurrency} />
    </section>
  );
};
