
import type { Transformation, TransformationCategory } from './types';
import { useI18n } from './i18n';
import { useUserEffects } from './services/effectStore';

// NOTE: we only store emoji and prompt here; title is derived via i18n key
export type TransformationKey =
  | 'customPrompt'
  | 'cinematicLight'
  | 'watercolor'
  | 'vintage70s'
  | 'wildflowers'
  | 'winterScene'
  | 'cyberpunk'
  | 'spookyVibe'
  | 'charcoalSketch'
  | 'dragonInSky'
  | 'filmNoir'
  | 'marsSurface'
  | 'magicalAura'
  | 'vanGoghStyle'
  | 'waterReflection'
  | 'goldenHour'
  | 'pixelArt16bit'
  | 'addCat'
  | 'tokyoNight'
  | 'psychedelic'
  | 'lowPoly'
  | 'holograms'
  | 'enchantedForest'
  | 'steampunk'
  | 'doubleExposure'
  | 'classicAnime'
  | 'rainbow'
  | 'floatingLanterns'
  | 'romanMosaic'
  | 'galaxySky'
  | 'rainyDay'
  | 'ancientRuins'
  | 'medievalArmor'
  | 'oldParchment'
  | 'hotAirBalloon'
  | 'underwater'
  | 'popArt'
  | 'ghostly'
  | 'jungleScene'
  | 'marbleStatue'
  | 'lensFlare'
  | 'zenGarden'
  | 'autumnLeaves'
  | 'inkDrawing'
  | 'robotCompanion'
  | 'snowGlobe'
  | 'documentaryPhoto'
  | 'butterflies'
  | 'fairytale'
  | 'chessboardGround'
  | 'magicalParticles';

export interface TransformationSource {
  key: TransformationKey;
  prompt: string;
  icon: string; // Material Symbols icon name
  category: TransformationCategory;
}

export const TRANSFORMATION_SOURCES: TransformationSource[] = [
  { key: 'customPrompt', prompt: 'CUSTOM', icon: 'edit', category: 'custom' },
  { key: 'cinematicLight', prompt: 'Add a dramatic, cinematic lighting effect.', icon: 'movie', category: 'lighting' },
  { key: 'watercolor', prompt: 'Turn the image into a watercolor painting.', icon: 'palette', category: 'style' },
  { key: 'vintage70s', prompt: "Make it look like a vintage photograph from the 1970s.", icon: 'local_movies', category: 'style' },
  { key: 'wildflowers', prompt: 'Add a field of vibrant wildflowers in the foreground.', icon: 'local_florist', category: 'elements' },
  { key: 'winterScene', prompt: 'Change the season to a snowy winter landscape.', icon: 'ac_unit', category: 'scene' },
  { key: 'cyberpunk', prompt: 'Transform the scene into a futuristic cyberpunk city.', icon: 'robot_2', category: 'style' },
  { key: 'spookyVibe', prompt: 'Give it a spooky, haunted atmosphere with fog and dim light.', icon: 'skull', category: 'special' },
  { key: 'charcoalSketch', prompt: 'Make the subject look like a hand-drawn charcoal sketch.', icon: 'draw', category: 'style' },
  { key: 'dragonInSky', prompt: 'Add a majestic dragon flying in the sky.', icon: 'pets', category: 'elements' },
  { key: 'filmNoir', prompt: 'Convert the image to a black and white film noir style.', icon: 'photo_camera', category: 'style' },
  { key: 'marsSurface', prompt: 'Place the subject on the surface of Mars.', icon: 'public', category: 'scene' },
  { key: 'magicalAura', prompt: 'Surround the subject with a magical, glowing aura.', icon: 'auto_awesome', category: 'lighting' },
  { key: 'vanGoghStyle', prompt: "Reimagine the photo in the style of Van Gogh's 'Starry Night'.", icon: 'nights_stay', category: 'style' },
  { key: 'waterReflection', prompt: 'Add a reflection in a pool of water.', icon: 'water_drop', category: 'special' },
  { key: 'goldenHour', prompt: 'Change the time of day to a beautiful golden hour sunset.', icon: 'wb_sunny', category: 'lighting' },
  { key: 'pixelArt16bit', prompt: 'Make it a pixel art scene from a 16-bit video game.', icon: 'grid_on', category: 'style' },
  { key: 'addCat', prompt: 'Add a cute, fluffy cat sitting next to the main subject.', icon: 'pets', category: 'elements' },
  { key: 'tokyoNight', prompt: 'Turn the background into a bustling Tokyo street at night.', icon: 'nightlife', category: 'scene' },
  { key: 'psychedelic', prompt: 'Make the colors hyper-saturated and psychedelic.', icon: 'color_lens', category: 'style' },
  { key: 'lowPoly', prompt: 'Render the image in a low-poly geometric style.', icon: 'category', category: 'style' },
  { key: 'holograms', prompt: 'Add futuristic holographic displays around the subject.', icon: 'hive', category: 'elements' },
  { key: 'enchantedForest', prompt: 'Change the setting to an enchanted forest with glowing mushrooms.', icon: 'forest', category: 'scene' },
  { key: 'steampunk', prompt: 'Give the subject steampunk-style goggles and gears.', icon: 'settings', category: 'style' },
  { key: 'doubleExposure', prompt: 'Create a double exposure effect with a forest silhouette.', icon: 'layers', category: 'special' },
  { key: 'classicAnime', prompt: 'Make it look like a frame from a classic anime film.', icon: 'theaters', category: 'style' },
  { key: 'rainbow', prompt: 'Add a rainbow arching across the sky.', icon: 'gradient', category: 'elements' },
  { key: 'floatingLanterns', prompt: 'Surround the scene with floating lanterns.', icon: 'emoji_objects', category: 'elements' },
  { key: 'romanMosaic', prompt: 'Transform it into an ancient Roman mosaic.', icon: 'account_balance', category: 'style' },
  { key: 'galaxySky', prompt: 'Make the sky filled with swirling galaxies and nebulae.', icon: 'military_tech', category: 'scene' },
  { key: 'rainyDay', prompt: 'Add a gentle rain effect with glistening droplets.', icon: 'umbrella', category: 'scene' },
  { key: 'ancientRuins', prompt: 'Place a mysterious, ancient ruin in the background.', icon: 'temple_buddhist', category: 'scene' },
  { key: 'medievalArmor', prompt: 'Change the clothing of the person to medieval armor.', icon: 'shield', category: 'style' },
  { key: 'oldParchment', prompt: "Make the image look like it's printed on old, weathered parchment.", icon: 'menu_book', category: 'style' },
  { key: 'hotAirBalloon', prompt: 'Add a whimsical hot air balloon floating in the distance.', icon: 'travel_explore', category: 'elements' },
  { key: 'underwater', prompt: 'Create an underwater version of the scene.', icon: 'scuba_diving', category: 'scene' },
  { key: 'popArt', prompt: 'Give it a pop art style like Andy Warhol.', icon: 'image', category: 'style' },
  { key: 'ghostly', prompt: 'Add ghostly apparitions in the background.', icon: 'visibility_off', category: 'special' },
  { key: 'jungleScene', prompt: 'Turn it into a lush, overgrown jungle scene.', icon: 'park', category: 'scene' },
  { key: 'marbleStatue', prompt: 'Make the main subject appear as a marble statue.', icon: 'stat_0', category: 'style' },
  { key: 'lensFlare', prompt: 'Add a dramatic lens flare effect.', icon: 'flare', category: 'lighting' },
  { key: 'zenGarden', prompt: 'Change the background to a serene Japanese zen garden.', icon: 'garden_cart', category: 'scene' },
  { key: 'autumnLeaves', prompt: 'Cover the landscape in a blanket of colorful autumn leaves.', icon: 'eco', category: 'scene' },
  { key: 'inkDrawing', prompt: 'Make it look like a detailed ink drawing.', icon: 'ink_pen', category: 'style' },
  { key: 'robotCompanion', prompt: 'Add a friendly robot companion to the scene.', icon: 'robot_2', category: 'elements' },
  { key: 'snowGlobe', prompt: 'Place the scene inside a crystal snow globe.', icon: 'cruelty_free', category: 'special' },
  { key: 'documentaryPhoto', prompt: 'Give it a grainy, high-contrast B&W documentary photo look.', icon: 'camera_alt', category: 'style' },
  { key: 'butterflies', prompt: 'Add butterflies fluttering around the subject.', icon: 'flutter_dash', category: 'elements' },
  { key: 'fairytale', prompt: 'Transform it into a scene from a fairytale.', icon: 'castle', category: 'scene' },
  { key: 'chessboardGround', prompt: 'Make the ground look like a giant chessboard.', icon: 'chess', category: 'scene' },
  { key: 'magicalParticles', prompt: 'Surround the subject with shimmering, magical particles.', icon: 'auto_awesome', category: 'special' },
];

export function useTransformations(): Transformation[] {
  const { t } = useI18n();
  const { effects } = useUserEffects();

  const builtin: Transformation[] = TRANSFORMATION_SOURCES.map(({ key, prompt, icon, category }) => ({
    title: t(`transformations.${key}`),
    prompt,
    icon,
    category,
  }));

  const user: Transformation[] = effects.map(e => ({
    title: e.title,
    prompt: e.prompt,
    icon: e.icon,
    category: e.category,
  }));

  return [...user, ...builtin];
}
