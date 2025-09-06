
export interface Transformation {
  /**
   * 创意效果分类键，用于按类目分组与筛选
   */
  category?: TransformationCategory;
  title: string;
  prompt: string;
  icon: string; // Material Symbols icon name
}

export interface GeneratedContent {
  imageUrl: string | null;
  text: string | null;
}

export interface UploadedImage {
  id: string;
  file: File;
  dataUrl: string;
}

// 分类类型：用于首页分类管理与搜索
export type TransformationCategory =
  | 'custom'
  | 'style'
  | 'elements'
  | 'scene'
  | 'lighting'
  | 'special';
