import React from 'react';
import BottomSheet, { BottomSheetView } from '@expo/ui/community/bottom-sheet';

interface BottomSheetWrapperProps {
  ref: any
  children?: React.ReactNode
  dynamicHeight?: boolean
  onClose?: () => void
}

const BottomSheetWrapper = ({ ref, children, dynamicHeight = false, onClose = () => { } }: BottomSheetWrapperProps) => {
  return (
    <BottomSheet ref={ref} index={-1} snapPoints={dynamicHeight ? undefined : ['99%']} enableDynamicSizing={dynamicHeight} handleComponent={null} enablePanDownToClose>
      {children}
    </BottomSheet>
  )
}

export default BottomSheetWrapper;