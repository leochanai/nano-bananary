
export interface Transformation {
  /**
   * 创意效果分类键，用于按类目分组与筛选
   */
  category?: TransformationCategory;
  title: string;
  prompt: string;
  icon: string; // Material Symbols icon name
  /**
   * 效果示例图片
   */
  example?: {
    before: string; // 示例原图URL
    after: string;  // 示例效果图URL
  };
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

// 页面模式类型
export type PageMode = 'quick' | 'gallery';

// 导航参数
export interface NavigationParams {
  selectedEffect?: Transformation;
  fromGallery?: boolean;
}
