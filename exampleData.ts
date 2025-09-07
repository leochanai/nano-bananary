// Effect example images configuration
// You can replace these with actual example images

export const effectExamples: Record<string, { before: string; after: string }> = {
  // 3D and Figurines
  '3d_figurine': {
    before: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=400&h=300&fit=crop'
  },
  'funko_pop_figure': {
    before: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=400&h=300&fit=crop'
  },
  'lego_minifigure': {
    before: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=400&h=300&fit=crop'
  },
  
  // Style transformations
  'anime_to_cosplay': {
    before: 'https://images.unsplash.com/photo-1578662996442-48f60103fc48?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400&h=300&fit=crop'
  },
  'to_photorealistic': {
    before: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop'
  },
  'fashion_magazine': {
    before: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop'
  },
  'cyberpunk': {
    before: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&h=300&fit=crop'
  },
  'van_gogh_style': {
    before: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop'
  },
  
  // Art styles
  'line_art_drawing': {
    before: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&h=300&fit=crop'
  },
  'marker_sketch': {
    before: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop'
  },
  
  // Scene changes
  'change_background': {
    before: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
    after: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop'
  },
  
  // Special effects
  'hd_enhance': {
    before: 'https://images.unsplash.com/photo-1530981785497-a62037228fe9?w=200&h=150&fit=crop&blur=20',
    after: 'https://images.unsplash.com/photo-1530981785497-a62037228fe9?w=400&h=300&fit=crop'
  },
  
  // Add more examples as needed
};

// Helper function to get example for an effect
export function getEffectExample(effectKey: string): { before: string; after: string } | undefined {
  return effectExamples[effectKey];
}
