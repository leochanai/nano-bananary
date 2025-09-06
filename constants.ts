
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
  emoji: string;
}

export const TRANSFORMATION_SOURCES: TransformationSource[] = [
  { key: 'customPrompt', prompt: 'CUSTOM', emoji: '✍️' },
  { key: 'cinematicLight', prompt: 'Add a dramatic, cinematic lighting effect.', emoji: '🎬' },
  { key: 'watercolor', prompt: 'Turn the image into a watercolor painting.', emoji: '🎨' },
  { key: 'vintage70s', prompt: "Make it look like a vintage photograph from the 1970s.", emoji: '🎞️' },
  { key: 'wildflowers', prompt: 'Add a field of vibrant wildflowers in the foreground.', emoji: '🌸' },
  { key: 'winterScene', prompt: 'Change the season to a snowy winter landscape.', emoji: '❄️' },
  { key: 'cyberpunk', prompt: 'Transform the scene into a futuristic cyberpunk city.', emoji: '🤖' },
  { key: 'spookyVibe', prompt: 'Give it a spooky, haunted atmosphere with fog and dim light.', emoji: '👻' },
  { key: 'charcoalSketch', prompt: 'Make the subject look like a hand-drawn charcoal sketch.', emoji: '✏️' },
  { key: 'dragonInSky', prompt: 'Add a majestic dragon flying in the sky.', emoji: '🐉' },
  { key: 'filmNoir', prompt: 'Convert the image to a black and white film noir style.', emoji: '🕵️' },
  { key: 'marsSurface', prompt: 'Place the subject on the surface of Mars.', emoji: '🪐' },
  { key: 'magicalAura', prompt: 'Surround the subject with a magical, glowing aura.', emoji: '✨' },
  { key: 'vanGoghStyle', prompt: "Reimagine the photo in the style of Van Gogh's 'Starry Night'.", emoji: '🌌' },
  { key: 'waterReflection', prompt: 'Add a reflection in a pool of water.', emoji: '💧' },
  { key: 'goldenHour', prompt: 'Change the time of day to a beautiful golden hour sunset.', emoji: '🌅' },
  { key: 'pixelArt16bit', prompt: 'Make it a pixel art scene from a 16-bit video game.', emoji: '👾' },
  { key: 'addCat', prompt: 'Add a cute, fluffy cat sitting next to the main subject.', emoji: '🐈' },
  { key: 'tokyoNight', prompt: 'Turn the background into a bustling Tokyo street at night.', emoji: '🌃' },
  { key: 'psychedelic', prompt: 'Make the colors hyper-saturated and psychedelic.', emoji: '🍄' },
  { key: 'lowPoly', prompt: 'Render the image in a low-poly geometric style.', emoji: '🔷' },
  { key: 'holograms', prompt: 'Add futuristic holographic displays around the subject.', emoji: ' hologram' },
  { key: 'enchantedForest', prompt: 'Change the setting to an enchanted forest with glowing mushrooms.', emoji: '🌳' },
  { key: 'steampunk', prompt: 'Give the subject steampunk-style goggles and gears.', emoji: '⚙️' },
  { key: 'doubleExposure', prompt: 'Create a double exposure effect with a forest silhouette.', emoji: '🌲' },
  { key: 'classicAnime', prompt: 'Make it look like a frame from a classic anime film.', emoji: '🎌' },
  { key: 'rainbow', prompt: 'Add a rainbow arching across the sky.', emoji: '🌈' },
  { key: 'floatingLanterns', prompt: 'Surround the scene with floating lanterns.', emoji: '🏮' },
  { key: 'romanMosaic', prompt: 'Transform it into an ancient Roman mosaic.', emoji: '🏛️' },
  { key: 'galaxySky', prompt: 'Make the sky filled with swirling galaxies and nebulae.', emoji: '🌠' },
  { key: 'rainyDay', prompt: 'Add a gentle rain effect with glistening droplets.', emoji: '☔' },
  { key: 'ancientRuins', prompt: 'Place a mysterious, ancient ruin in the background.', emoji: '🏺' },
  { key: 'medievalArmor', prompt: 'Change the clothing of the person to medieval armor.', emoji: '🛡️' },
  { key: 'oldParchment', prompt: "Make the image look like it's printed on old, weathered parchment.", emoji: '📜' },
  { key: 'hotAirBalloon', prompt: 'Add a whimsical hot air balloon floating in the distance.', emoji: '🎈' },
  { key: 'underwater', prompt: 'Create an underwater version of the scene.', emoji: '🐠' },
  { key: 'popArt', prompt: 'Give it a pop art style like Andy Warhol.', emoji: '🖼️' },
  { key: 'ghostly', prompt: 'Add ghostly apparitions in the background.', emoji: '👻' },
  { key: 'jungleScene', prompt: 'Turn it into a lush, overgrown jungle scene.', emoji: '🌴' },
  { key: 'marbleStatue', prompt: 'Make the main subject appear as a marble statue.', emoji: '🗿' },
  { key: 'lensFlare', prompt: 'Add a dramatic lens flare effect.', emoji: '☀️' },
  { key: 'zenGarden', prompt: 'Change the background to a serene Japanese zen garden.', emoji: '🏯' },
  { key: 'autumnLeaves', prompt: 'Cover the landscape in a blanket of colorful autumn leaves.', emoji: '🍂' },
  { key: 'inkDrawing', prompt: 'Make it look like a detailed ink drawing.', emoji: '✒️' },
  { key: 'robotCompanion', prompt: 'Add a friendly robot companion to the scene.', emoji: '🤖' },
  { key: 'snowGlobe', prompt: 'Place the scene inside a crystal snow globe.', emoji: '🔮' },
  { key: 'documentaryPhoto', prompt: 'Give it a grainy, high-contrast B&W documentary photo look.', emoji: '📷' },
  { key: 'butterflies', prompt: 'Add butterflies fluttering around the subject.', emoji: '🦋' },
  { key: 'fairytale', prompt: 'Transform it into a scene from a fairytale.', emoji: '🏰' },
  { key: 'chessboardGround', prompt: 'Make the ground look like a giant chessboard.', emoji: '♟️' },
  { key: 'magicalParticles', prompt: 'Surround the subject with shimmering, magical particles.', emoji: '✨' },
];

export function useTransformations(): Transformation[] {
  const { t } = useI18n();
  return TRANSFORMATION_SOURCES.map(({ key, prompt, emoji }) => ({
    title: t(`transformations.${key}`),
    prompt,
    emoji,
  }));
}
