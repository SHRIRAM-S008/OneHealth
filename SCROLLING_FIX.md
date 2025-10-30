# Scrolling Issue Fix

## Issue
When scrolling up, the map was going inside the navigation bar and top header bar instead of staying behind them.

## Root Cause
The issue was caused by improper z-index management. The header and navigation bars use `sticky` positioning with `z-index: 50` and `z-index: 40` respectively, but the map container didn't have a proper z-index to ensure it stays behind these fixed elements when scrolling.

## Fix Applied

### 1. **Added Proper Z-Index Management**
Added `relative z-0` classes to ensure the map stays behind fixed navigation elements:

```typescript
// In cases-map.tsx - Added to the Card component
<Card className="relative z-0">
  // ... rest of the component
</Card>

// In map-component.tsx - Added wrapper div with proper z-index
<div className="w-full h-full relative z-0">
  <MapContainer
    // ... map configuration
  >
    // ... map layers
  </MapContainer>
</div>
```

### 2. **Understanding the Layout Structure**
The dashboard layout has the following z-index hierarchy:
- Header: `sticky top-0 z-50`
- Navigation: `sticky top-16 z-40`
- Main Content: Default z-index (0)

By setting the map container to `z-0`, it ensures it stays behind the fixed navigation elements.

## Files Modified
- **[components/dashboard/cases-map.tsx](file:///Users/shriram/Downloads/onehealth-grid/components/dashboard/cases-map.tsx)**: Added `relative z-0` to the Card component
- **[components/dashboard/map-component.tsx](file:///Users/shriram/Downloads/onehealth-grid/components/dashboard/map-component.tsx)**: Added wrapper div with `relative z-0`

## Verification
- Application starts without errors
- Map stays properly behind navigation elements when scrolling
- All map functionality remains intact:
  - Interactive markers with popups
  - Cluster visualization
  - Region filtering by drawing rectangles
  - Toggle controls for visualization options

## Testing
The fixes have been verified by:
1. Successful build process
2. Clean startup of development server
3. Proper scrolling behavior in browser
4. Map stays behind fixed navigation elements
5. All interactive features work correctly

These changes ensure proper layering of UI elements while maintaining all the enhanced map functionality.