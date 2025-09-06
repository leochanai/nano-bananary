
import type { Transformation } from './types';
import { useI18n } from './i18n';

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
}

export const TRANSFORMATION_SOURCES: TransformationSource[] = [
  { key: 'customPrompt', prompt: 'CUSTOM', icon: 'edit' },
  { key: 'cinematicLight', prompt: 'Add a dramatic, cinematic lighting effect.', icon: 'movie' },
  { key: 'watercolor', prompt: 'Turn the image into a watercolor painting.', icon: 'palette' },
  { key: 'vintage70s', prompt: "Make it look like a vintage photograph from the 1970s.", icon: 'local_movies' },
  { key: 'wildflowers', prompt: 'Add a field of vibrant wildflowers in the foreground.', icon: 'local_florist' },
  { key: 'winterScene', prompt: 'Change the season to a snowy winter landscape.', icon: 'ac_unit' },
  { key: 'cyberpunk', prompt: 'Transform the scene into a futuristic cyberpunk city.', icon: 'robot_2' },
  { key: 'spookyVibe', prompt: 'Give it a spooky, haunted atmosphere with fog and dim light.', icon: 'skull' },
  { key: 'charcoalSketch', prompt: 'Make the subject look like a hand-drawn charcoal sketch.', icon: 'draw' },
  { key: 'dragonInSky', prompt: 'Add a majestic dragon flying in the sky.', icon: 'pets' },
  { key: 'filmNoir', prompt: 'Convert the image to a black and white film noir style.', icon: 'photo_camera' },
  { key: 'marsSurface', prompt: 'Place the subject on the surface of Mars.', icon: 'public' },
  { key: 'magicalAura', prompt: 'Surround the subject with a magical, glowing aura.', icon: 'auto_awesome' },
  { key: 'vanGoghStyle', prompt: "Reimagine the photo in the style of Van Gogh's 'Starry Night'.", icon: 'nights_stay' },
  { key: 'waterReflection', prompt: 'Add a reflection in a pool of water.', icon: 'water_drop' },
  { key: 'goldenHour', prompt: 'Change the time of day to a beautiful golden hour sunset.', icon: 'wb_sunny' },
  { key: 'pixelArt16bit', prompt: 'Make it a pixel art scene from a 16-bit video game.', icon: 'grid_on' },
  { key: 'addCat', prompt: 'Add a cute, fluffy cat sitting next to the main subject.', icon: 'pets' },
  { key: 'tokyoNight', prompt: 'Turn the background into a bustling Tokyo street at night.', icon: 'nightlife' },
  { key: 'psychedelic', prompt: 'Make the colors hyper-saturated and psychedelic.', icon: 'color_lens' },
  { key: 'lowPoly', prompt: 'Render the image in a low-poly geometric style.', icon: 'category' },
  { key: 'holograms', prompt: 'Add futuristic holographic displays around the subject.', icon: 'hive' },
  { key: 'enchantedForest', prompt: 'Change the setting to an enchanted forest with glowing mushrooms.', icon: 'forest' },
  { key: 'steampunk', prompt: 'Give the subject steampunk-style goggles and gears.', icon: 'settings' },
  { key: 'doubleExposure', prompt: 'Create a double exposure effect with a forest silhouette.', icon: 'layers' },
  { key: 'classicAnime', prompt: 'Make it look like a frame from a classic anime film.', icon: 'theaters' },
  { key: 'rainbow', prompt: 'Add a rainbow arching across the sky.', icon: 'gradient' },
  { key: 'floatingLanterns', prompt: 'Surround the scene with floating lanterns.', icon: 'emoji_objects' },
  { key: 'romanMosaic', prompt: 'Transform it into an ancient Roman mosaic.', icon: 'account_balance' },
  { key: 'galaxySky', prompt: 'Make the sky filled with swirling galaxies and nebulae.', icon: 'military_tech' },
  { key: 'rainyDay', prompt: 'Add a gentle rain effect with glistening droplets.', icon: 'umbrella' },
  { key: 'ancientRuins', prompt: 'Place a mysterious, ancient ruin in the background.', icon: 'temple_buddhist' },
  { key: 'medievalArmor', prompt: 'Change the clothing of the person to medieval armor.', icon: 'shield' },
  { key: 'oldParchment', prompt: "Make the image look like it's printed on old, weathered parchment.", icon: 'menu_book' },
  { key: 'hotAirBalloon', prompt: 'Add a whimsical hot air balloon floating in the distance.', icon: 'travel_explore' },
  { key: 'underwater', prompt: 'Create an underwater version of the scene.', icon: 'scuba_diving' },
  { key: 'popArt', prompt: 'Give it a pop art style like Andy Warhol.', icon: 'image' },
  { key: 'ghostly', prompt: 'Add ghostly apparitions in the background.', icon: 'visibility_off' },
  { key: 'jungleScene', prompt: 'Turn it into a lush, overgrown jungle scene.', icon: 'park' },
  { key: 'marbleStatue', prompt: 'Make the main subject appear as a marble statue.', icon: 'stat_0' },
  { key: 'lensFlare', prompt: 'Add a dramatic lens flare effect.', icon: 'flare' },
  { key: 'zenGarden', prompt: 'Change the background to a serene Japanese zen garden.', icon: 'garden_cart' },
  { key: 'autumnLeaves', prompt: 'Cover the landscape in a blanket of colorful autumn leaves.', icon: 'eco' },
  { key: 'inkDrawing', prompt: 'Make it look like a detailed ink drawing.', icon: 'ink_pen' },
  { key: 'robotCompanion', prompt: 'Add a friendly robot companion to the scene.', icon: 'robot_2' },
  { key: 'snowGlobe', prompt: 'Place the scene inside a crystal snow globe.', icon: 'cruelty_free' },
  { key: 'documentaryPhoto', prompt: 'Give it a grainy, high-contrast B&W documentary photo look.', icon: 'camera_alt' },
  { key: 'butterflies', prompt: 'Add butterflies fluttering around the subject.', icon: 'flutter_dash' },
  { key: 'fairytale', prompt: 'Transform it into a scene from a fairytale.', icon: 'castle' },
  { key: 'chessboardGround', prompt: 'Make the ground look like a giant chessboard.', icon: 'chess' },
  { key: 'magicalParticles', prompt: 'Surround the subject with shimmering, magical particles.', icon: 'auto_awesome' },
];

export function useTransformations(): Transformation[] {
  const { t } = useI18n();
  return TRANSFORMATION_SOURCES.map(({ key, prompt, icon }) => ({
    title: t(`transformations.${key}`),
    prompt,
    icon,
  }));
}
