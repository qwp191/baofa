
export const MODEL_NAME = 'gemini-2.5-flash-image';

export const PLACEHOLDER_IMG = 'https://picsum.photos/400/600';

export const BAOBAO_SYSTEM_PROMPT = `
You are an expert fashion AI editor.
Your goal is to perform precise image editing for Issey Miyake BAOBAO bags.
`;

export const SWAP_BAG_PROMPT = (grid: string, colorDescription: string) => `
USER REQUEST: Edit the first image.

TASK:
1. Look at the FIRST image (Person wearing a bag).
2. Look at the SECOND image (Reference bag).
3. **REPLACE** the bag in the FIRST image with the style of the SECOND image.

CRITICAL COLOR RULE:
You MUST ignore the color in the reference image. 
Instead, **PAINT THE BAG WITH THIS EXACT COLOR**: ${colorDescription}

MATERIAL RULES:
- If the target is MATTE: Remove all shine and reflections. Make it look like frosted rubber.
- If the target is GLOSSY: Add sharp white reflections.
- Structure: The bag must keep the ${grid} geometric pattern.

SUMMARY:
Output the First Image, but with the bag changed to the new Color and Material. Keep the person and background exactly the same.
`;

export const CHANGE_SCENE_PROMPT = (outfit: string) => `
[INPUTS]
Image 1: A person wearing a BAOBAO bag.

[TASK]
Change the background and outfit while PRESERVING the bag and creating a friendly, modern atmosphere.

[ANCHOR OBJECT RULE (CRITICAL)]
- **THE BAG IS THE ANCHOR**. 
- Do NOT redraw, resize, warp, or change the perspective of the bag. 
- Draw the new outfit and background *AROUND* the existing bag pixels.
- The bag's size relative to the canvas must remain 100% identical.

[MODEL APPEARANCE]
- **Expression**: Friendly, approachable, warm smile, soft gaze. (NO cold/stoic model face).
- **Face Style**: Modern trendy makeup (Korean/Japanese daily style). **NO** ancient/classical/historical features.
- **Vibe**: Fresh, lively, "Girl next door" or "City Girl" daily snapshot.

[BACKGROUND & FLOORING]
- **FORCE** background: SIMPLE, SOLID-COLORED WALL (Light Beige/White/Grey).
- **FORCE** floor: FLAT & NEUTRAL. 
- **REMOVE** stairs/steps.

[STYLE EXECUTION]
Apply these specific fashion details:
${outfit}

[FOOTWEAR]
- Render stylish shoes (High Detail).

[POSE]
- Keep pose identical.
`;
