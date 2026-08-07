import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import JSZip from "jszip";

// --- Configuration & Constants ---

const APP_CONFIG = {
  appName: "afwPixelAi",
  version: "1.4.5",
  msmeRegistration: "UDYAM-RJ-14-0018404",
  poweredBy: "Askforwrite Digital",
};

const PROMPT_TEMPLATES = {
  identity: "keep the same face and face direction reference image, maintain subject identity. Using the uploaded image, generate a hyper-realistic photography portrait while keeping the original face, expressions, and natural features completely unchanged.",
  lens: "keep the same face as reference image, hair style and face direction reference image, maintain subject identity. To create a portrait with a telephoto lens, use a focal length between 85mm and 200mm to compress features and achieve a pleasing background blur (bokeh). Note: I hope your generated image is genuine based on authentic realworld sources and benchmarks as per best photographers, also it should be competitive to best of 0.1% generative models research quaries.",
  restoration: `Restore and complete this old, torn, incomplete photograph with extreme realism and emotional accuracy.
Detect and reconstruct missing facial features and body parts perfectly, preserving identity, bone structure, proportions, and natural expression.
Maintain original skin tone, natural texture, wrinkles, imperfections, historical clothing, background, and emotional warmth.
Keep a vintage aesthetic with natural film grain, soft tones, and authentic era-correct lighting. Protect the emotional story and personality captured in the original.
This is a family memory restoration; treat with dignity and love. Maintain authenticity — do not modernize or beautify unnaturally.
Preserve original emotional energy, gentle warmth in the eyes, natural smile or expression, and subtle nostalgia.
Ultra-realistic face recovery, emotional preservation mode.
Old film texture, true grain, soft tonal balance.
Historical accuracy filter: ON.
Family memory preservation priority.
Respectful deceased loved-one restoration approach.
Technical Target: <0.01% error tolerance in facial identity, emotional tone, and proportions.
Goal: Restore as if the photo was never damaged — timeless, gentle, personal, and historically accurate.
Facial Structure Reconstruction
Analyze incomplete areas.
Rebuild facial structure (eyes, nose, mouth, jawline, ears, hairline) using identity logic, symmetry, bone anatomy, age-accurate realism, and emotional continuity.
Model Behavior Settings
Identity Lock: ON
Emotional Fidelity: HIGH
Historic Texture: Vintage/Film
Grain Authenticity: Natural
Memory-Respect Mode: Enabled
Photo-Integrity Guard: Maximum
Do not alter identity, expressions, age, or emotion. No AI plastic skin, filters, airbrush, uncanny features, digital glow, makeup, modern elements, incorrect anatomy, or fantasy stylization. No smoothing, beautification, cartoon texture, blur patches, or artifacts. Do not invent unrealistic features or backgrounds.`
};



const EFFECTS_LIBRARY = [
  {"id":"custom_prompt","name":"Custom Prompt","desc":"Type your own prompt to edit the image.","isPro":false,"icon":"fa-solid fa-pen-nib","color":"from-blue-500 to-indigo-500"},
  {"id":"restoration","name":"Photo Restoration","desc":"AI-powered restoration for old or damaged photos.","isPro":true,"icon":"fa-solid fa-wand-magic-sparkles","color":"from-amber-500 to-orange-500"},
  { id: "effect_1", name: "Effect 1", desc: "A tender scene captures a person in a Venetian red dress with delicate white lace kneeling beneath an ancient oak tree. Golden hour sunlight filters through the leaves, casting warm illumination on her face as she connects with a small spaniel puppy. The pastoral landscape stretches into the distance, painted in rich earth tones and touches of verdant green. The puppy's expressive eyes reflect curiosity as a butterfly flutters nearby, embodying the innocent wonder of childhood. Reminiscent of Dutch Golden Age paintings, the scene portrays timeless companionship against the backdrop of a peaceful countryside bathed in the day's final glow.", isPro: false, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_2", name: "Effect 2", desc: "Captured in the golden hour of sunset, the image exudes warmth and happiness as a person with her hair flowing freely, smiles radiantly whilst playfully running through a multicolored meadow filled with wildflowers. Her floral dress blends harmoniously with the natural tapestry of the field, symbolizing a carefree spirit and the simple joys of childhood.", isPro: false, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_3", name: "Effect 3", desc: "In the warm embrace of the late afternoon sun, a person with flowing hair stands amidst a kaleidoscope of wildflowers. Her arms are spread wide, and her face tilts upwards, basking in the golden light that seems to highlight her joy and innocence. Wildflowers in hues of orange, yellow, pink, and purple sway gently around her, creating a dreamy atmosphere that captures the essence of a carefree childhood summer day. This is a moment of pure happiness, unburdened by the complexities of life, a snapshot that celebrates the beauty of nature and the spirit of youth.", isPro: false, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_4", name: "Effect 4", desc: "A contemplative young subject in traditional brown folk attire holds a single white flower, symbolizing innocence and purity. Set against a rich Prussian blue background, the portrait employs Rembrandt's signature lighting technique, creating dramatic shadows and a luminous quality. The earthy color palette of burnt sienna, olive green, and ivory enhances the authentic period atmosphere. Meticulous attention to fabric textures and embroidered details showcases the craftsmanship typical of Dutch Golden Age portraiture. The classical composition and timeless expression create a bridge between historical artistry and universal themes of youth and reflection.", isPro: false, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_5", name: "Effect 5", desc: "Captured mid-motion, this image showcases the artistry and athleticism of a young ballet dancer. Dressed in a vivid red leotard that stands out against the dark backdrop of the chalkboard, she exhibits poise and dedication. Her pointed toes, strong legs, and extended arms all speak to the years of practice and passion for dance. The empty chalkboard becomes a canvas highlighting her form, while the wooden floor provides a solid stage for her performance.", isPro: false, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_6", name: "Effect 6", desc: "Captured in a moment of weightless beauty, this young ballerina performs a stunning leap, showcasing the grace and athleticism that ballet demands. Her poise and concentrated expression draw you into the scene, where every muscle is engaged, and yet she appears effortless. The light plays off her tutu, creating a delicate contrast against the muted background, emphasizing the movement and form that are the essence of dance.", isPro: false, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_7", name: "Effect 7", desc: "Captured in a swirl of motion, this young dancer embodies grace and passion. With her hair flowing and her flamenco-inspired dress creating a vivid cascade of red and black, she performs with pure joy. The soft lighting accentuates the gentle movement, while the audience watches on, likely mesmerized by the display of talent and the swirl of colors. This picture is more than a moment; it's a celebration of dance, culture, and youthful exuberance.", isPro: false, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_8", name: "Effect 8", desc: "Captured in a moment of pure joy, this young dancer gracefully twirls in her rainbow-hued tutu dress. Her beaming smile and outstretched arms convey a sense of freedom and elation that only dance can bring. The warm, ambient lighting of the room highlights her youthful energy and the vivid colors of her outfit, creating a captivating scene that celebrates the beauty of movement and the innocence of childhood.", isPro: false, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_9", name: "Effect 9", desc: "In the golden warmth of a setting sun, a person with an infectious smile twirls in a meadow. Her vibrant rainbow tutu flares out around her as she moves with carefree abandon. Laughter bubbles from her as she dances, surrounded by the soft glimmer of floating dandelots, creating an enchanting scene of childhood wonder and pure joy.", isPro: false, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_10", name: "Effect 10", desc: "In a burst of delightful colors, a person throws her arms up in jubilation amidst a field of blooming flowers. The warm sunlight filters through her hair as she dances, unrestrained, surrounded by nature's vivid palette. Her bright floral dress mimics the garden's hues, creating a harmonious blend of childlike happiness and the splendor of springtime. This moment captures the essence of innocence and the pure joy of living in the present.", isPro: false, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_11", name: "Effect 11", desc: "In this image, we see a person with her arms raised high, exuding pure joy and excitement as she plays in the water. She is wearing a bright red dress and stands at the heart of a water park, with splashes of water enveloping her in a moment of carefree bliss. The sunlight filters through the water droplets, creating a sparkling effect around her. The background is a blur of summer activity, made vibrant with the laughter of children and the unmistakable thrills of a day spent splashing around.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_12", name: "Effect 12", desc: "Under the golden glow of the sun, a person exudes sheer joy as she raises her arms amidst the sparkling waters of a lively pool. The splashes surround her with a vibrant energy, capturing a moment of pure childhood bliss. Her laughter seems almost audible through the image, a testament to the carefree happiness that comes with summer days spent swimming with friends and family.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_13", name: "Effect 13", desc: "Captured in the warm glow of a summer day, a person exudes pure joy while playing in the water. As sunlight filters through the droplets, each one becomes a sparkling highlight against the soft, bokeh background. Her smile and closed eyes speak to the carefree and magical moments of childhood, where time seems to stand still and the simplest pleasures can mean the world.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_14", name: "Effect 14", desc: "Capturing a moment of pure joy, the image features a person wearing an orange jacket as she plays on a vividly painted slide. Her smile radiates happiness, revealing the simple pleasures of childhood. The backdrop of the playground is blurred, focusing attention on her enchanting expression and the bright, contrasting colors of the play equipment. This playful scene is a snapshot of innocent excitement and the boundless delight found in everyday adventures.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_15", name: "Effect 15", desc: "On a beautiful sunny day, the beach becomes a playground under the vast clear sky. A child stands on the soft sand, immersed in the joy of flying a vibrant kite that dances with the gentle sea breeze. Various other kites soar in the background, creating a festive atmosphere while the distant horizon and the ocean's expanse add to the serene backdrop.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_16", name: "Effect 16", desc: "The photo captures the essence of childhood and joy as a person with exuberant energy and her hair flowing in the breeze dashes through a vibrant kite festival. The sky is a mosaic of colors with numerous kites soaring high, marking a clear blue sky, and a group of children can be seen in the background sharing in the delight of the event. The person's open-mouthed laughter, the carefree sprint, and the bright kites all combine to evoke a sense of freedom and happiness on a beautiful sunny day.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_17", name: "Effect 17", desc: "In the midst of a bustling amusement park, a person's laugh echoes with pure joy. Surrounded by a kaleidoscope of brightly painted signs pointing in all directions, her eyes sparkle with the wonder of adventure. The delightful giggles amidst these whimsical surroundings create an atmosphere of happiness that's as infectious as her grin. The picture captures the essence of childhood—unrestrained joy and the excitement of exploring a world of fun and games.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_18", name: "Effect 18", desc: "Captured in the midst of a joyful day, a person with a bright smile is perched atop an ornately decorated carousel horse. The tilt of her head and the sparkle in her eyes convey a story of innocence and delight. As the carousel spins, the colors blur into a whimsical backdrop, highlighting the child's happiness and the timeless appeal of a classic amusement park ride.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_19", name: "Effect 19", desc: "This heartwarming image captures the pure joy of childhood as we see a person with a beaming smile and wide eyes, sliding down an vibrant orange slide at a playground. Her hands are slightly raised, possibly for balance or simply an expression of excitement. The colorful playground equipment in the background suggests a day filled with laughter, play, and the simple pleasure of a slide ride.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_20", name: "Effect 20", desc: "In a tranquil meadow bathed in golden sunlight, two people are captured in a moment of pure joy and innocence as they dance together. Their movements are carefree and synchronized, with their dresses swirling around them. The wildflowers dotting the field add splashes of color, and the trees lend a sense of seclusion to this idyllic scene. It's a picturesque embodiment of childhood and the simple pleasures that come with playing in the great outdoors.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_21", name: "Effect 21", desc: "The photo captures a heartwarming moment of childhood innocence and joy, as two people, possibly twins, with golden hair, are seen holding hands and running through a sun-dappled path surrounded by lush greenery. The vibrant floral dresses flutter with their movement, creating a lively, dynamic scene that embodies the pure happiness of being young and free. The sun's rays filter through the trees, highlighting their cheerful expressions and casting a soft, warm glow that enhances the idyllic setting. This picture is a beautiful snapshot of the simple pleasures of childhood, where every moment is an adventure waiting to unfold.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_22", name: "Effect 22", desc: "Under the starlit sky, a person in a whimsical tutu stands in wonder, gazing at the lamp post's warm light that attracts a magnificent butterfly. The air is filled with the soft glow of floating petals and sparkling lights, creating an enchanting scene that blurs the lines between reality and fairytale. Her expression is one of awe and curiosity as the gentle giant of the insect world graces her presence, turning an ordinary evening into a moment of magic.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_23", name: "Effect 23", desc: "In this captivating scene, a solitary figure takes a tranquil evening walk under the soft golden glow of an old-fashioned lamppost. As the individual stands silently, a vibrant umbrella protects them from the gentle sprinkle of the night's atmosphere. The air is alive with the flutter of whimsical butterflies adding a touch of magic to the scene. All around, a dusting of sparkling particles seems to mimic the stars above, blurring the line between reality and a dream-like state.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_24", name: "Effect 24", desc: "In the heart of a mystical evening, a whimsical creature that seems straight out of a fairytale graces the silent street. With wings that rival the patterns of the monarch butterfly, she rests gently against an old-fashioned lamppost. The light casts a warm glow, highlighting the delicate features of her curious gaze and the intricate veins of her wings. It's a moment suspended in time, where the line between fantasy and reality is beautifully blurred. The picture evokes a sense of wonder and magic, inviting the observer to let the imagination wander in this scene of serene beauty.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_25", name: "Effect 25", desc: "In the quiet of the evening, a person holding a jar radiates with an ethereal glow amidst the twilight. The magical fireflies dance around her, lighting up her little world with a warm, fairy-tale luminescence. In her eyes, there's a reflection of wonder, capturing the innocent amazement at the simple yet enchanting marvels of nature. It's a moment suspended in time, evocative of childhood stories and the beauty of imagination unleashed under the stars.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_26", name: "Effect 26", desc: "In this heartwarming scene, a person with innocence and wonder in her eyes opens a magical present. The golden sparkles spilling out from the box seem to light up her expression with sheer joy and amazement. As the bokeh lights of the Christmas tree softly glow in the background, this moment captures the pure spirit of the holiday season and the excitement that comes with a special surprise. It's an enchanting snapshot of childhood enchantment, a timeless memory preserved in a single, magical moment.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_27", name: "Effect 27", desc: "In the depth of a lush, green garden, a person stands immersed in a world of imagination. Her fingertips gingerly explore the tiny figures and houses of a toy village spread out on the table before her. The warm glow of the setting sun enhances the magical atmosphere, casting a soft light on her concentrated face and the intricate details of the miniature world that she seems to hold in her thoughtful gaze. It's a moment of pure childhood wonder, a blend of nature and play, where every miniature tree and character holds a story only she can tell.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_28", name: "Effect 28", desc: "In the golden warmth of a setting sun, a person dances with delight through a sunlit park. As she moves, the colorful ribbons in her hands trail behind her, forming a radiant display of colors against the soft glow of the evening light. The joy in her smile is infectious, and the scene captures the pure essence of childhood -- a time of play, imagination, and spirited freedom. This image encapsulates a moment of carefree happiness and the simple pleasures that come with outdoor play.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_29", name: "Effect 29", desc: "In the warm glow of the setting sun, a person with a beaming smile dances freely in a grassy field. She is twirling a rainbow-colored ribbon with a grace that belies her young age. In the background, hints of other children can be seen, suggesting a playful gathering or celebration. The light filters through the trees, casting a golden hue on the scene, encapsulating an idyllic moment of childhood joy and innocence.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_30", name: "Effect 30", desc: "In a warmly lit room filled with the potential of imaginative play, a young child is deeply absorbed in constructing an elaborate sandcastle. Their intense focus and delicate hand movements suggest a level of concentration and passion typically seen in artists and creators, revealing the boundless creativity children possess. The intricacies of the castle's turrets and walls showcase not only the child's dexterity but also the magic of childhood, where a pile of sand can become a regal fortress. This image captures the essence of innocence and the power of imagination, immortalizing a moment of pure, unadulterated joy in creation.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_31", name: "Effect 31", desc: "On a bright and sunny day, the pristine beach sets the perfect stage for a scene filled with the innocence and joy of childhood. Two children, engrossed in their imaginative play, work together to build a magnificent sandcastle. The intricacy of the castle's towers and walls evokes a sense of wonder, while the children's focused expressions and the clear blue skies in the background paint a picture of a carefree day spent by the seaside.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_32", name: "Effect 32", desc: "A delightful moment captured as a person, adorned with a colorful bucket hat, graces the beach with her radiant smile. She is engrossed in the timeless childhood activity of building sandcastles, surrounded by her little friends. The intricate details of the sandcastle in the foreground, complete with tiny turrets and walls, suggest a storybook adventure brought to life under the watchful eye of the blue sky. This snapshot is a heartwarming representation of innocence and creativity, unwinding against the serene backdrop of a vibrant beach setting.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_33", name: "Effect 33", desc: "In the quiet embrace of twilight, a person finds serenity by a tranquil pool. The water is covered with lily pads and scores of glowing candles, casting a warm light that dances on the surface, illuminating the surrounding area with a magical glow. Starfish are scattered amongst the floating lights, creating a dreamscape that feels like a step into a fairytale. The person, dressed in a sequined outfit, appears contemplative and at peace, her gaze fixed on the distant wonders ahead.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_34", name: "Effect 34", desc: "As the sun dips below the horizon, casting warm hues across the sky, a person with a beaming smile leads the way through a field during a lantern festival. Clutching a glowing lantern in her hand, she is the epitome of childhood joy and wonder. Her friends follow in a playful procession, their lanterns punctuating the evening with flickers of light. This idyllic moment captures the pure essence of simple pleasures and the magic of twilight gatherings.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_35", name: "Effect 35", desc: "In the warm, golden glow of the setting sun, a person with flowing hair and a joyful smile runs towards the camera through a field of tall grass. She holds a bottle in her hand, seemingly unbothered by the weight of it as she races with abandon. Her friends can be seen in the background, slightly out of focus, adding to the sense of movement and spontaneity captured in this vibrant moment. It's an image that epitomizes the carefree spirit and pure delight of childhood.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_36", name: "Effect 36", desc: "In the golden light of a summer evening, a person with a beaming smile runs freely through a tall grassy field. Her hands gently grasp a glowing orange lantern, illuminating her path as she joins in the festivities. The blur of her movement captures her energy and joy. In the background, the soft glow of additional lanterns and the silhouettes of other children add to the magical atmosphere of this outdoor celebration.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_37", name: "Effect 37", desc: "Captured in the midst of celebration, a person radiates pure joy as she dances. Her colorful cultural attire, adorned with intricate patterns and vibrant feathers, billows around her. Her smile is infectious, and the energy of the festive crowd behind her adds to the sense of movement and excitement in the air. This image encapsulates the beauty of cultural expression and the innocence of childhood delight.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_38", name: "Effect 38", desc: "In a room filled with the vibrant colors of balloons and party decorations, a person with carefully styled hair and a celebratory dress leans forward, her face illuminated by the warm glow of numerous candles atop a festively adorned birthday cake. The concentration and anticipation in her expression hint at the cherished childhood tradition of making a silent wish before blowing out the birthday candles, a moment that encapsulates the joy and wonder of growing one year older.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_39", name: "Effect 39", desc: "In the heart of a vibrant birthday party, a person with a bright party hat is captured in a moment of pure joy as she prepares to blow out the candles on her festive, sprinkle-covered birthday cake. Around her, balloons in a rainbow of colors set the backdrop for a celebration full of excitement and laughter, with friends eagerly anticipating the traditional wish-making moment, their faces lit with happiness and rambunctious cheer.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_40", name: "Effect 40", desc: "In the midst of a lively birthday celebration, a person adorned with a festive party hat takes a quiet moment to make her wish. She closes her eyes, surrounded by eagerly watching friends wearing similar party hats, and prepares to blow out the glowing candles on a beautifully decorated, sprinkle-covered cake. The air is filled with the excitement and joy of childhood, as balloons and confetti add color to this memorable scene filled with anticipation of the wish that will set the tone for the year to come.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_41", name: "Effect 41", desc: "In the golden light of a summer evening, a person with a beaming smile runs freely through a tall grassy field. Her hands gently grasp a glowing orange lantern, illuminating her path as she joins in the festivities. The blur of her movement captures her energy and joy. In the background, the soft glow of additional lanterns and the silhouettes of other children add to the magical atmosphere of this outdoor celebration.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_42", name: "Effect 42", desc: "In the gentle embrace of nature, a person with a bright smile shares a heartfelt moment with her adorable, fluffy white dog. Both seated delicately on a patterned blanket, they bask in the serenity of the surrounding greenery. In the background stands an enchanting treehouse, a testament to childhood dreams and adventures yet to be had. This intimate scene is a picture-perfect snapshot of innocence, companionship, and the joy of youthful playfulness in a setting that seems straight out of a fairy tale.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_43", name: "Effect 43", desc: "In an enchanting garden setting under the warm glow of daylight, a person with an infectious smile shares a moment of pure happiness with her loyal companion, a fluffy dog with a friendly demeanor. They are seated together on a lush green lawn, surrounded by the pink blossoms of springtime. The pair seems to be partaking in a quaint tea party, complete with ceramic mugs and saucers, exuding an atmosphere of whimsy and childhood innocence. The wooden playhouse in the background adds to the fairy tale-like ambiance of the scene, making it a picture-perfect snapshot of a memorable day filled with joy, companionship, and imaginary play.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_44", name: "Effect 44", desc: "In the gentle embrace of nature, beneath the towering embrace of an old tree, a person clad in a soft pink tutu dress shares a serene moment with her loyal fluffy companion. Against a backdrop of verdant foliage, the whimsical charm of the wooden treehouse perched above sets the scene for childhood adventures. The person's delicate tiara and the dog’s content expression reflect a bond of friendship and a touch of enchanting calm that resonates through the tranquil backyard.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_45", name: "Effect 45", desc: "In a serene field, amidst the soft purple hues of heather, a person wearing a warm knit hat and wrapped in a scarf sits cozily beside her loyal canine companion. The dog, with its flowing golden fur and attentive eyes, gazes affectionately at the little person. She, in turn, embraces the dog with a tender smile, their bond captured in this moment of pure, unconditional friendship. The overcast skies softly light the tranquil scene, creating a mood of quiet companionship and love.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_46", name: "Effect 46", desc: "In the embrace of golden hour sunlight, a person with a bright smile leans closely behind her golden retriever, the essence of joy and companionship radiating between them. The dog's tongue lolls out in a happy pant, eyes soft and welcoming. They are surrounded by a field, the atmosphere alive with the late afternoon warmth, capturing a moment of pure, unspoken connection that speaks to the timeless friendship between a child and her dog.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_47", name: "Effect 47", desc: "In the gentle embrace of dusk, a person holds a jar brimming with golden lights that seem to dance and flicker like tiny stars captured from the night sky. Her eyes reflect the wonder of a moment torn from a fairytale, as she peers intently into the glow, her innocent curiosity illuminated by the soft, warm luminescence that spills into the surrounding darkness, creating an aura of mystery and enchantment.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_48", name: "Effect 48", desc: "In the gentle embrace of twilight, a person with a gaze of wonder holds a glass jar, brimming with a warm, golden light that dances like fireflies caught in a midsummer night's dream. Her eyes reflect the magical glow, casting a spell of pure enchantment as the world around her dims into a starlit tapestry.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_49", name: "Effect 49", desc: "In the warm embrace of nature, a person is captured in a moment of pure joy as she twirls outdoors. Her colorful, flowing dress mirrors the wildflowers that dot the meadow around her. The image encapsulates freedom, happiness, and the carefree spirit of youth, set against the backdrop of a beautiful natural landscape with soft, overcast skies that soften the light and adds a dreamy quality to the scene.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_50", name: "Effect 50", desc: "In the midst of a lush, green environment, a person takes center stage, exemplifying the beauty and grace of her culture's traditional dance. With a colorful skirt that flows as she moves, and a flower embellishing her hair, she captures the essence of the performance. Meanwhile, in the background, another participant strums the guitar, providing the melodic foundation for the dance, thus merging music and movement into a harmonious display of tradition and youth.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_51", name: "Effect 51", desc: "Capturing the essence of cultural celebration, this photograph showcases a person in mid-twirl, fully engrossed in her dance performance. Her traditional red costume, adorned with intricate floral details and embroidery, radiates against the blur of the festival surroundings. Her expression emanates pure joy and the youthful exuberance that can be found in the heart of cultural expressions. The motion of her dance and the clarity of her joy paint a picture of a world rich in tradition and the timelessness of festive celebrations.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_52", name: "Effect 52", desc: "In the warm glow of evening lights, a person is the picture of happiness as she participates in a dance celebration, arms extended and a bright smile on her face. Dressed in colorful traditional attire, her enthusiasm and energy are infectious, capturing the essence of the cultural festival that surrounds her. The blur of fellow dancers in the background suggests lively movement and a community gathered to share in the joy of their heritage.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_53", name: "Effect 53", desc: "Captured mid-twirl, this person's joy is palpable as her vibrant, multicolored dress flares out around her. Her bright smile and lively energy fill the room, creating a scene of pure childhood delight. The soft lighting and blurred background highlight her movement and the vivid colors of her dress, illustrating a moment of carefree bliss and playfulness that echoes the innocence of youth.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_54", name: "Effect 54", desc: "Captured in the moment, this vibrant image showcases a person mid-twirl, her radiant smile reflecting the joy and freedom of dance. She is wearing a striking, colorful tutu that fans out around her like a rainbow spectrum as she spins. The blurred motion of her twirling skirt contrasts with the sharp focus on her delighted expression, all set against the warm backdrop of a sunlit dance studio that seems to echo her bright energy.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_55", name: "Effect 55", desc: "Captured in a dance studio bathed in natural sunlight, a young aspiring ballerina demonstrates grace and passion. She's dressed in a pristine white tutu, her hair neatly tied back, as she strikes an elegant pose. The image encapsulates the essence of dedication as the dancer practices her craft, her shadow playing on the checkered floor, complementing the serene and focused atmosphere of the room.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_56", name: "Effect 56", desc: "Capturing the essence of dance, this photo shows a young ballerina mid-air during a ballet leap. Her flowing peach tutu and carefully positioned arms create a picture of focus and grace. The warm lighting highlights her expression of determination and joy in the art of dance, showcasing her dedication and skill at such a young age.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_57", name: "Effect 57", desc: "In the golden warmth of a well-lit dance studio, a young aspiring ballerina stands poised by the ballet barre, her arms extended elegantly. She is dressed in a delicate blue and pink ballet outfit that complements the magical ambiance created by the multitude of fairy lights suspended from the ceiling. The soft lighting casts a dreamlike glow over the scene, highlighting the dancer's concentration and the gentle determination etched in her expression.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_58", name: "Effect 58", desc: "In a beautifully illuminated dance studio, adorned with soft, glowing chandeliers, a young ballerina in a delicate pink tutu practices her dance routine. Her form is impeccable, capturing the art of ballet in a single, graceful pose. With her arms extended and one leg raised behind her, she embodies both the discipline and the freedom of expression found in this classical form of dance, while the mirror-lined walls reflect her dedication and the ambient elegance of the surroundings.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_59", name: "Effect 59", desc: "In this vibrant photograph, a person beams with delight as she strolls through a festive scene. She is the epitome of innocence and happiness, her colorful patterned dress matching the joyous atmosphere created by the myriad of balloons and confetti around her. The balloons in the background add a sense of celebration, and the confetti on the ground paints the scene with splashes of color. The blurred background focuses all attention on the child, making her the undeniable subject of this moment captured in time.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_60", name: "Effect 60", desc: "A delightful portrait of a cheerful person enjoying the essence of summer. Her radiant smile complements the vibrant sunflower adorned in her hair, as she holds a tantalizing ice cream cone, anticipating the sweet taste. The sun's soft glow emphasizes her joyful expression, making for a captivating image that exudes warmth and happiness. It's a moment that captures the innocence and simple pleasures of childhood.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_61", name: "Effect 61", desc: "Captured in a moment of youthful innocence, this person, clad in a pristine white dress adorned with delicate lace and a crown of fresh flowers, gazes upward with a look of wonderment. She gracefully clutches an ornate book, possibly a hymnal or a book of prayers, standing poised inside a place of worship. The soft, diffused light pouring through the stained glass window bathes her in a kaleidoscope of colors, accentuating the ethereal beauty of this touching scene.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_62", name: "Effect 62", desc: "Captured in the midst of a joyous cultural festival, this person stands out in her colorful traditional dress, embellished with bright patterns and intricate designs. She appears to be singing with gusto, her eyes slightly closed and her mouth wide open, indicating a powerful moment of vocal expression. In the blurred background, it's apparent that she is not alone, as other children can be seen in the festivities, which hints at a communal celebration where tradition and youthful exuberance intertwine.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_63", name: "Effect 63", desc: "In the warming glow of a sunny day, a person with a gleaming smile stands holding a wicker basket full of large, luscious strawberries. Her eyes sparkle with delight, reflecting a moment of pure joy and the satisfaction of a fruitful harvest. The deep red berries contrast beautifully with the person's crisp white shirt and patterned pink skirt, creating a picture-perfect moment of summer bliss.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_64", name: "Effect 64", desc: "A contemplative figure stands in profile by a window, dressed in a flowing dusty rose gown with billowing sleeves. Soft golden light bathes the scene, creating a luminous outline around the delicate fabric that extends from her shoulders like wings. The dress moves gently in a natural breeze, creating a dreamy, ethereal quality against the muted teal wall. Window light casts gentle shadows and highlights the semi-transparent material, emphasizing its texture and movement while the figure remains in peaceful stillness, creating a striking visual harmony between motion and calm.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_65", name: "Effect 65", desc: "In the heart of a bustling fairground, a person stands holding a massive, fluffy stick of candy floss, a smile gracing her face. Her eyes reflect the wonder of the glowing lights around her, and the excitement of the night is palpable. The candy floss, almost as big as she is, seems to promise sweetness and fun as she enjoys her time amidst the attractions. This simple yet joyful moment captures the essence of childhood delight in a fairground setting, awash with colors and lights.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_66", name: "Effect 66", desc: "As the golden hour light bathes a lively fairground, this image captures the essence of childhood wonder through the eyes of a person. Her infectious smile and sparkling eyes tell a story of joy and innocence as she clings to the bright carousel pole. The blur of lights and vivid colors in the background evoke a sense of excitement and nostalgia for those timeless moments spent at the carnival, where laughter and happiness resonate in the air.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_67", name: "Effect 67", desc: "In the warm embrace of the golden hour, a person is captured in a slice-of-life moment as she savors a fresh slice of watermelon. The sunlight filters through the lush greenery, casting dappled shadows on her face while highlighting the water droplets spraying from the fruit, creating an almost magical effect. Around her, a blur of garden colors enchants the backdrop, adding to the serenity of this simple summer pleasure. This photograph encapsulates the essence of childhood and the pure joy found in nature's simple gifts.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_68", name: "Effect 68", desc: "Captured in this moment is a person, her face illuminated with a joyful smile that resonates the happiness of the cultural celebration she is a part of. She is clothed in an array of colorful traditional attire, characterized by intricate patterns and a vivid palette that reflects the rich heritage of her community. The flower headdress she wears is a symbol of her connection to the natural beauty and the traditions woven into her culture, making her not just a participant, but a living embodiment of the festivities.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_69", name: "Effect 69", desc: "In the warm glow of a fairy-tale-like garden, a little person with an enchanting smile celebrates her fifth birthday. Adorned with a glittering crown fit for a princess, she is the center of her own magical world. Surrounded by beautifully wrapped presents, the number 5 sparkles in her hands as she eagerly anticipates the joy of unwrapping her gifts, creating memories that will surely last a lifetime.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_70", name: "Effect 70", desc: "Captured in this image is the pure essence of childhood joy, as a beaming person swings back and forth beneath a canopy of green leaves. The warmth of the sun illuminates her flowing hair and radiates from her infectious smile, encapsulating a moment of carefree happiness. The rope swing, a timeless symbol of youthful play, serves as her temporary throne in this natural playground. This snapshot is a poignant reminder of the simple pleasures that define the magic of youth.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_71", name: "Effect 71", desc: "In the photo, a youthful spirit comes to life as a joyful little person with curly blonde hair lifts her arms in delight. She is immersed in a playful dance with a cluster of balloons buoyed by the gentle breeze. Each balloon, in hues of pink, orange, and transparent with confetti, adds to the festive atmosphere. The person's eyes are radiant with excitement, and her cheerful expression is a testament to the simple pleasures that childhood holds. Sunlight filters through the scene, creating a backdrop that sparkles with mirth and merriment.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_72", name: "Effect 72", desc: "Golden hour sunlight creates a luminous outline around a person caught in mid-twirl, her genuine laughter echoing the pure joy of childhood. With arms outstretched and hair flowing freely in the breeze, she embodies carefree happiness against a soft-focus natural background. The warm amber tones contrast beautifully with subtle teal shadows, adding emotional depth to the scene. Delicate bokeh effects from scattered sunlight through leaves enhance the magical quality of this authentic moment. The cinematic composition with its shallow depth of field perfectly captures this spontaneous expression of unbridled delight.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_73", name: "Effect 73", desc: "A carefree person experiences pure joy as she twirls with complete abandon, her arms spread wide and hair flowing in dynamic motion. Her authentic laughter and crinkled eyes capture a genuine moment of childhood happiness that radiates freedom and possibility. The vibrant coral dress creates beautiful movement lines against a dreamy sky blue background, while dappled light adds playful patterns to the scene. Bright directional lighting enhances the positive mood with dimensional shadows that give depth to this fine art style illustration. Subtle mint green and magenta accents provide visual interest to this vertical composition, which balances artistic beauty with commercial appeal. The negative space above her suggests endless possibilities and the carefree nature of youth.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_74", name: "Effect 74", desc: "In the warmth of the setting sun, a person with untamed hair and a burst of laughter charges forward in a field. She is the epitome of joy and carefree bliss, her eyes sparkling with excitement. Behind her, friends and possibly family add to the dynamic scene, trailing in a jubilant chase. The golden hour light bathes the entire scene in a beautiful, almost ethereal glow, highlighting the timeless moments of childhood that are filled with uncomplicated happiness and the pure pleasure of just being alive.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_75", name: "Effect 75", desc: "In the golden hour of sunset, a person stands in the midst of a blooming field, her arms open wide as if to hug the world itself. With a soft, contented smile and her eyes gently closed, she seems to be absorbing the warmth of the sun and the beauty of the surrounding wildflowers. The light illuminates her face and floral dress, giving the scene a serene, almost magical atmosphere. This moment captures the pure essence of childhood wonder and connection with nature.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_76", name: "Effect 76", desc: "As the golden hues of the setting sun wash over the serene countryside, a person, clad in a simple dress, stands in a moment of pure connection with a majestic horse. Her gentle touch and calm demeanor suggest a deep bond with the creature, hinting at a story of friendship and trust. The horse, with its soft, intelligent eyes and dappled coat, seems to reciprocate the affection, creating a picture of harmony between human and animal against the backdrop of a tranquil evening.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_77", name: "Effect 77", desc: "As the warm glow of the sunset bathes the countryside in a soft light, a person with flowing hair, wearing a delicate white dress, shares a moment of serene connection with a majestic horse. The gentle creature, its mane shimmering in the light, leans in with trust and affection—a testament to the timeless bond between humans and horses. The tall grass whispers in the evening breeze, a harmonious backdrop to this peaceful interaction. This image encapsulates the purity and calmness of the rural landscape, along with the deep, unspoken understanding that can exist between two different beings.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_78", name: "Effect 78", desc: "This heartwarming image captures the exuberant delight of a person on a swing. Her hair flies wildly around her as she soars upward, her face lit by an ear-to-ear smile that embodies the carefree spirit of childhood. The setting sun gently bathes the scene in a warm light, highlighting the energy and motion of this timeless moment of play.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_79", name: "Effect 79", desc: "In the heart of a lush sunflower field, a person finds pure delight among the towering blooms. The gentle glow of the setting sun bathes the scene in an ethereal golden light, highlighting her curly hair and the delicate sunflowers around her. Her joyful expression and carefree stance resonate with the untamed beauty of nature during this captivating golden hour, presenting a moment of simple happiness and serenity.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_80", name: "Effect 80", desc: "As the golden sun dips towards the horizon, a young child is immersed in a tranquil meadow, her eyes alight with wonder. She stands amid a mosaic of wildflowers, their hues a vibrant tapestry against the verdant canvas. A single bubble floats from her tiny lips, catching the last warm rays of the day as it glimmers in the serene light. This is a moment of pure joy, emblematic of childhood innocence and the magic of simple pleasures.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_81", name: "Effect 81", desc: "In this serene setting, a person is immersed in the beauty of nature, her long hair gently swept by the soft breeze. She walks with a sense of wonder through the untamed meadow, surrounded by wildflowers that sway to the rhythm of the wind. Lost in her own world, her expression is one of tranquility and contemplation. The warm hues of sunset bathe the scene in a golden light, highlighting the innocence of childhood and the simple joys of exploring the great outdoors.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_82", name: "Effect 82", desc: "In the tender embrace of the golden hour, a person finds her happiness amidst a field of flowers. Her infectious laugh rings through the air, the warmth of the sun mirrors the glow in her eyes, and her arms are outstretched, welcoming the beauty of the world around her. This moment, captured in a single shot, embodies the essence of childhood wonder and the simple joys that nature provides.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_83", name: "Effect 83", desc: "In the warm, golden glow of the setting sun, a person with flowing hair and a joyful smile runs towards the camera through a field of tall grass. She holds a bottle in her hand, seemingly unbothered by the weight of it as she races with abandon. Her friends can be seen in the background, slightly out of focus, adding to the sense of movement and spontaneity captured in this vibrant moment. It's an image that epitomizes the carefree spirit and pure delight of childhood.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_84", name: "Effect 84", desc: "Captured in the golden light of sunset, this image radiates with the essence of childhood bliss. A person, donning a vibrant red dress, is caught in mid-stride as she dashes along the shore. Her hair flutters in the sea breeze, and her smile encapsulates the pure joy of the moment. The soft sand beneath her bare feet and the gentle lap of waves create a picturesque and heartwarming scene, embodying the carefree spirit of summer by the seaside.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_85", name: "Effect 85", desc: "In this captivating moment at dusk, a person, with her hair dancing in the breeze, indulges in a burst of pure joy while riding a toy car along the water's edge. The sun dips towards the horizon, casting a golden hue over the scene, as the gentle splashes of the tide add a sense of whimsy to her delightful adventure. It's a magical time where the laughter of a child blends perfectly with the tranquility of a waning day.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_86", name: "Effect 86", desc: "Captured in this heartwarming scene are four joyful children running down a historic cobblestone street. Their faces are alight with laughter and excitement, creating an infectious atmosphere of fun and freedom. The sun casts a warm glow on the scene, emphasizing the carefree and timeless moment shared between friends. It's an image that exemplifies the purest form of happiness found in the simple pleasure of playing outside with friends.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_87", name: "Effect 87", desc: "Captured in the golden glow of sunlight, an exuberant person with flowing hair is seen frolicking through a vibrant field filled with yellow blooms. Her laughter seems almost audible as she moves with unrestrained joy, her charming floral dress billowing around her. This image encapsulates the essence of carefree childhood, with the natural landscape providing a picturesque backdrop for a moment of pure bliss and freedom.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_88", name: "Effect 88", desc: "In the midst of nature's own canvas, a person becomes the embodiment of joy and freedom as she leaps high above a sea of blooming flowers. The sky above is a brilliant blue, dotted with the soft whispers of white clouds, while the sun beams down, enveloping her in a warm glow. This moment captures the very essence of childhood – carefree, spirited, and full of life.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_89", name: "Effect 89", desc: "In the warm embrace of the late afternoon sun, a person with flowing hair stands amidst a kaleidoscope of wildflowers. Her arms are spread wide, and her face tilts upwards, basking in the golden light that seems to highlight her joy and innocence. Wildflowers in hues of orange, yellow, pink, and purple sway gently around her, creating a dreamy atmosphere that captures the essence of a carefree childhood summer day. This is a moment of pure happiness, unburdened by the complexities of life, a snapshot that celebrates the beauty of nature and the spirit of youth.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" },
  { id: "effect_90", name: "Effect 90", desc: "Captured in mid-air, this image showcases the exuberance of a person as she leaps with wild abandon among a field of colorful wildflowers. Her yellow dress matches the sunny atmosphere provided by the bright blue sky and radiant sun shining down. The picture is a celebration of childhood, nature, and the carefree spirit that comes with warm summer days spent outdoors.", isPro: true, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" }
];



// --- AI Service ---

const generateAiImage = async (originalBase64: string, effectId: string, customPromptText?: string): Promise<string> => {
  const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  
  const effect = EFFECTS_LIBRARY.find(e => e.id === effectId);
  if (!effect) throw new Error("Effect not found");

  let finalPrompt = "";
  
  if (effect.id === 'restoration') {
    finalPrompt = PROMPT_TEMPLATES.restoration;
  } else if (effect.id === 'custom_prompt') {
    const customDesc = customPromptText || "Enhance the image";
    finalPrompt = `${PROMPT_TEMPLATES.identityHeader}\n\n${customDesc}\n\n${PROMPT_TEMPLATES.identityFooter}\n\n${PROMPT_TEMPLATES.lens}`;
  } else {
    finalPrompt = `${PROMPT_TEMPLATES.identityHeader}\n\n${effect.desc}\n\n${PROMPT_TEMPLATES.identityFooter}\n\n${PROMPT_TEMPLATES.lens}`;
  }

  const base64Data = originalBase64.split(',')[1];

  // 1. Try Direct Google GenAI Client-Side SDK if API Key is present
  if (apiKey) {
    const ai = new GoogleGenAI({ apiKey });

    const modelsToTry = [
      'imagen-3.0-capability-001',
      'gemini-2.5-flash-image',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'imagen-3.0-generate-001',
      'imagen-4.0-generate-001'
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting client-side generation with ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
              { text: finalPrompt }
            ]
          },
          config: {
            systemInstruction: "You are an expert photorealistic AI photo editor. CRITICAL MANDATE: You MUST preserve 100% exact facial identity, eyes, nose, mouth, skin tone, facial direction, and expression from the uploaded reference photo. Do not turn the subject's face away from the camera. The subject MUST face the exact same direction as in the reference photo while executing the requested artistic outfit and scene."
          }
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData) {
              return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
          }
        }
      } catch (error: any) {
        console.warn(`Client-side model ${modelName} failed:`, error?.message || error);
      }
    }
  }

  // 2. Try Backend Server (Port 3001) Fallback
  try {
    console.log("Attempting backend server generation (http://localhost:3001/generate)...");
    const backendRes = await fetch("http://localhost:3001/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalBase64, effectId, customDesc: effect.desc, apiKey })
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.resultImage) return data.resultImage;
    }
  } catch (backendErr) {
    console.warn("Backend server (port 3001) unreachable:", backendErr);
  }

  if (!apiKey) {
    throw new Error("API_KEY_REQUIRED");
  }

  throw new Error("All Gemini & Imagen models failed to generate an image. Please verify your API Key in settings.");
};

// --- Components ---

const Logo = ({ customSrc }: { customSrc?: string | null }) => {
    const [hasError, setHasError] = useState(false);
    // Strictly use the assets path or custom upload
    const src = customSrc || "assets/logo.png";

    useEffect(() => {
        setHasError(false);
    }, [src]);

    return (
        <div className="w-12 h-12 rounded-xl bg-blue-950 flex items-center justify-center overflow-hidden shadow-lg border border-blue-900/50">
             {!hasError ? (
                 <img 
                    src={src} 
                    alt="afw Logo" 
                    className="w-full h-full object-contain"
                    onError={() => setHasError(true)}
                 />
             ) : (
                <span className="text-2xl font-serif italic font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 pb-1">afw</span>
             )}
        </div>
    );
};

const Header = ({ customLogo, onOpenSettings, hasApiKey }: { customLogo?: string | null; onOpenSettings: () => void; hasApiKey: boolean }) => (
  <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Logo customSrc={customLogo} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight leading-none">
             {/* Tech white for Pixel, Fire gradient for Ai */}
            <span className="text-slate-100">Pixel</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500">Ai</span>
          </h1>
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
            Img Studio
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-400 border-r border-slate-800 pr-4">
          <span><i className="fa-solid fa-shield-halved mr-1 text-slate-600"></i>Identity Lock™</span>
          <span><i className="fa-solid fa-camera mr-1 text-slate-600"></i>Cinematic Lens</span>
        </div>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition shadow-sm active:scale-95"
          title="API Key Settings"
        >
          <i className="fa-solid fa-gear text-orange-400 text-sm"></i>
          <span className="hidden sm:inline">Settings</span>
          <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-pulse'}`}></span>
        </button>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-slate-950 text-slate-500 py-6 text-center text-xs mt-auto border-t border-slate-900">
    <p className="mb-2">
      <span className="font-semibold text-slate-400">Powered by {APP_CONFIG.poweredBy}</span>
    </p>
    <p className="opacity-60 font-mono">
      MSME Registered: {APP_CONFIG.msmeRegistration}
    </p>
    <div className="mt-4 flex justify-center gap-4 opacity-50">
      <i className="fa-brands fa-instagram hover:text-white cursor-pointer transition-colors"></i>
      <i className="fa-brands fa-twitter hover:text-white cursor-pointer transition-colors"></i>
      <i className="fa-solid fa-globe hover:text-white cursor-pointer transition-colors"></i>
    </div>
  </footer>
);

interface EffectCardProps {
  effect: any;
  isSelected: boolean;
  onClick: () => void;
}

const EffectCard: React.FC<EffectCardProps> = ({ effect, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 w-full min-h-[75px] h-auto text-center group relative overflow-hidden shrink-0
      ${isSelected 
        ? 'border-orange-500 bg-orange-950/50 shadow-md ring-1 ring-orange-500/50' 
        : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800'
      }
    `}
    title={`${effect.name}: ${effect.desc}`}
  >
    <div className={`
      w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-xs transition-colors shrink-0
      ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'}
    `}>
      <i className={`fa-solid ${effect.icon || 'fa-palette'}`}></i>
    </div>
    <h3 className={`font-bold text-[11px] leading-tight text-center px-0.5 truncate w-full ${isSelected ? 'text-orange-400' : 'text-slate-300 group-hover:text-slate-100'}`}>
      {effect.name}
    </h3>
  </button>
);

// --- Main Application ---

const App = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('gemini_api_key') || "");
  const [hasApiKey, setHasApiKey] = useState(() => !!(localStorage.getItem('gemini_api_key') || process.env.API_KEY || process.env.GEMINI_API_KEY));
  const [isComparing, setIsComparing] = useState(false);
  
  const [customPromptText, setCustomPromptText] = useState("");
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
      setHasApiKey(true);
      alert("Gemini API Key saved successfully!");
    } else {
      localStorage.removeItem('gemini_api_key');
      setHasApiKey(false);
      alert("API Key removed. Client-side SDK calls will now rely on backend server.");
    }
    setIsSettingsOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check for ZIP file
    if (file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
        setError(null);
        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            
            let foundLogo = false;
            let foundImage = false;
            
            // 1. Look for logo.png (insensitive)
            const fileNames = Object.keys(contents.files);
            const logoFileName = fileNames.find(name => name.toLowerCase().includes('logo.png') && !contents.files[name].dir);
            
            if (logoFileName) {
                const logoBlob = await contents.files[logoFileName].async('blob');
                const logoUrl = URL.createObjectURL(logoBlob);
                setCustomLogo(logoUrl);

                // --- DYNAMIC FAVICON UPDATE ---
                const iconLinks = document.querySelectorAll("link[rel*='icon']");
                iconLinks.forEach(link => (link as HTMLLinkElement).href = logoUrl);
                
                if (iconLinks.length === 0) {
                    const link = document.createElement('link');
                    link.rel = 'icon';
                    link.href = logoUrl;
                    document.head.appendChild(link);
                }
                
                foundLogo = true;
            }

            // 2. Look for the first valid image
            const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
            const imageFileName = fileNames.find(name => {
                const lower = name.toLowerCase();
                const isImage = validExtensions.some(ext => lower.endsWith(ext));
                const isNotLogo = !lower.includes('logo.png');
                const isNotDir = !contents.files[name].dir;
                return isImage && isNotLogo && isNotDir;
            });

            if (imageFileName) {
                const imgBlob = await contents.files[imageFileName].async('blob');
                setOriginalImage(URL.createObjectURL(imgBlob));
                setResultImage(null);
                foundImage = true;
            }
            
            if (!foundLogo && !foundImage) {
                setError("ZIP file loaded but no valid images or logo.png found.");
            } else if (foundLogo && !foundImage) {
                setError(null);
            }

        } catch (err: any) {
            console.error("Zip Error:", err);
            setError("Failed to process ZIP file.");
        }
    } else {
        // Handle Standard Image
        const reader = new FileReader();
        reader.onload = (event) => {
          setOriginalImage(event.target?.result as string);
          setResultImage(null);
          setError(null);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDemoLoad = async () => {
    setIsLoadingDemo(true);
    setError(null);
    try {
        const response = await fetch("https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
            setOriginalImage(reader.result as string);
            setResultImage(null);
            setError(null);
            setIsLoadingDemo(false);
        }
        reader.readAsDataURL(blob);
    } catch (e) {
        setError("Failed to load demo image.");
        setIsLoadingDemo(false);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !selectedEffectId) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      const generated = await generateAiImage(originalImage, selectedEffectId, customPromptText);
      setResultImage(generated);
    } catch (err: any) {
      console.error("Generation error:", err);
      if (err.message === "API_KEY_REQUIRED") {
        setError("Please enter your Gemini API Key in the Settings panel (Gear icon in top header) to generate AI images.");
      } else if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED') || err.status === 429) {
        setError("QUOTA_EXCEEDED");
      } else {
        setError(err.message || "Failed to generate image. Please verify your Gemini API key in settings.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const targetImage = resultImage || originalImage;
    if (!targetImage) return;

    const filename = `afwPixelAi_${Date.now()}.png`;

    try {
      // 1. Native Capacitor Filesystem save if running as native app
      if ((window as any).Capacitor?.isNativePlatform?.()) {
        const base64Data = targetImage.includes(',') ? targetImage.split(',')[1] : targetImage;
        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Documents
        });
        alert(`Image saved successfully to Documents folder: ${savedFile.uri}`);
        return;
      }

      // 2. Web Browser Blob Download
      const res = await fetch(targetImage);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.error("Download failed, using direct link fallback:", err);
      const link = document.createElement("a");
      link.href = targetImage;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (!resultImage) return;

    const confirmed = window.confirm("Are you sure you want to share this image?");
    if (!confirmed) return;

    try {
        const base64Response = await fetch(resultImage);
        const blob = await base64Response.blob();
        const file = new File([blob], "afw_art.png", { type: "image/png" });

        if (navigator.share) {
            await navigator.share({
                title: 'Created with afwPixelAi',
                text: 'Check out this cinematic image created with afwPixelAi!',
                files: [file],
            });
        } else {
            // Fallback for desktop browsers that don't support file sharing via navigator.share
            alert("Native sharing is not supported on this device. You can download the image instead.");
        }
    } catch (err) {
        console.error("Share failed:", err);
    }
  };

  const startCompare = () => setIsComparing(true);
  const stopCompare = () => setIsComparing(false);

  const isWorkspace = !!originalImage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-200 selection:bg-orange-500 selection:text-white">
      <Header customLogo={customLogo} onOpenSettings={() => setIsSettingsOpen(true)} hasApiKey={hasApiKey} />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-lg border border-orange-500/30">
                <i className="fa-solid fa-key"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">Gemini API Key Settings</h3>
                <p className="text-xs text-slate-400">Configure your Google Gemini API Key for image generation</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-mono"
                />
              </div>

              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-xs text-slate-400 space-y-1">
                <p><i className="fa-solid fa-circle-info text-blue-400 mr-1"></i> Your key is saved locally in your browser (`localStorage`).</p>
                <p>Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline font-semibold hover:text-orange-300">Get a free key from Google AI Studio</a>.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveApiKey}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 transition active:scale-95 text-sm"
                >
                  Save API Key
                </button>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 flex flex-col">
        
        {!isWorkspace ? (
          // --- Upload Screen ---
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                <span className="text-slate-100">Cinematic</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500">Image Effect</span>
              </h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                Transform ordinary photos into cinematic masterpieces while maintaining the true identity and expressions of your loved ones.
              </p>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="
                  group relative overflow-hidden rounded-3xl bg-slate-900 border-4 border-dashed border-slate-800 
                  p-12 cursor-pointer transition-all hover:border-orange-500 hover:shadow-xl hover:shadow-orange-900/10 hover:-translate-y-1
                "
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-800 text-blue-500 rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-slate-700 transition-all shadow-inner">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-2">Upload Photo or ZIP</h3>
                  <p className="text-slate-500">Supports images or .zip with logo.png</p>
                </div>
              </div>

              <div className="mt-6">
                  <button 
                    onClick={handleDemoLoad}
                    disabled={isLoadingDemo}
                    className="text-sm font-medium text-slate-500 hover:text-orange-400 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isLoadingDemo ? (
                         <i className="fa-solid fa-circle-notch fa-spin"></i>
                    ) : (
                        <i className="fa-solid fa-image"></i>
                    )}
                    Try with Demo Photo
                  </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,.zip,application/zip,application/x-zip-compressed"
                onChange={handleFileUpload} 
              />
              
              <div className="mt-12 grid grid-cols-3 gap-6 opacity-60">
                <div className="flex flex-col items-center">
                  <i className="fa-solid fa-wand-magic-sparkles text-2xl mb-2 text-slate-600"></i>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">90+ Effects</span>
                </div>
                <div className="flex flex-col items-center">
                  <i className="fa-solid fa-fingerprint text-2xl mb-2 text-slate-600"></i>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Identity Safe</span>
                </div>
                <div className="flex flex-col items-center">
                  <i className="fa-solid fa-download text-2xl mb-2 text-slate-600"></i>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">HD Export</span>
                </div>
              </div>
            </div>
            
            {error && (
                <div className="mt-6 p-3 bg-red-900/20 text-red-400 text-sm rounded-lg border border-red-900/50">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
                </div>
            )}
          </div>
        ) : (
          // --- Workspace Screen ---
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            
            {/* Editor Canvas Area (Left) */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden flex-1 relative min-h-[400px] flex items-center justify-center">
                
                {/* Image Container */}
                <div className="relative max-w-full max-h-full p-4 w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                   {/* If Result Exists, handle comparison */}
                   {resultImage ? (
                     <img 
                       src={isComparing ? originalImage : resultImage} 
                       alt="Workspace" 
                       className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-fade-in"
                     />
                   ) : (
                     <img 
                       src={originalImage} 
                       alt="Original" 
                       className="max-w-full max-h-full object-contain shadow-xl rounded-lg"
                     />
                   )}

                   {/* Loading Overlay */}
                   {isGenerating && (
                     <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                       <div className="w-16 h-16 border-4 border-orange-900/50 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                       <p className="text-slate-200 font-bold text-lg animate-pulse">Creating Masterpiece...</p>
                       <p className="text-slate-500 text-sm mt-1">Applying global identity lock</p>
                     </div>
                   )}
                </div>

                {/* Compare Overlay (Bottom Center of Canvas) */}
                {resultImage && !isGenerating && (
                   <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-10">
                    <button 
                      onMouseDown={startCompare}
                      onMouseUp={stopCompare}
                      onTouchStart={startCompare}
                      onTouchEnd={stopCompare}
                      className="bg-slate-950/90 text-white px-5 py-2.5 rounded-full font-medium text-sm backdrop-blur hover:bg-black transition shadow-lg active:scale-95 select-none border border-slate-800"
                    >
                      <i className="fa-solid fa-eye mr-2"></i>Hold to Compare
                    </button>
                  </div>
                )}
                 
                 {/* Reset Button (Top Right) */}
                 <button 
                    onClick={() => { setOriginalImage(null); setResultImage(null); }}
                    className="absolute top-4 right-4 bg-slate-800/80 p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-800 transition shadow-sm z-10"
                    title="Close Image"
                 >
                    <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>

              {/* Custom Prompt Input */}
              {selectedEffectId === 'custom_prompt' && (
                <div className="bg-slate-900 rounded-2xl border border-orange-500/50 p-4 shadow-lg">
                  <label className="block text-sm font-bold text-slate-200 mb-2">
                    <i className="fa-solid fa-keyboard mr-2 text-orange-400"></i>
                    Custom Prompt
                  </label>
                  <textarea
                    value={customPromptText}
                    onChange={(e) => setCustomPromptText(e.target.value)}
                    placeholder="e.g., Add a retro filter, Remove the person in the background..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none h-24"
                  />
                </div>
              )}

              {/* ACTION BAR: Generate, Download, Share (Below Image) */}
              <div className="flex items-center gap-3">
                 <button
                    onClick={handleGenerate}
                    disabled={!selectedEffectId || isGenerating}
                    className={`
                      flex-1 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center
                      ${!selectedEffectId || isGenerating
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:shadow-orange-900/50 hover:from-orange-600 hover:to-pink-700'
                      }
                    `}
                  >
                    {isGenerating ? (
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                        {resultImage ? 'Regenerate Art' : 'Generate Art'}
                      </>
                    )}
                 </button>

                 <div className="flex gap-2">
                     <button
                        onClick={handleDownload}
                        disabled={!resultImage || isGenerating}
                        className={`
                          w-12 sm:w-auto sm:px-6 py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center
                          ${!resultImage || isGenerating
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                            : 'bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-orange-500 hover:border-orange-500/50'
                          }
                        `}
                        title="Download Image"
                     >
                       <i className="fa-solid fa-download sm:mr-2"></i>
                       <span className="hidden sm:inline">Download</span>
                     </button>
                     
                     <button
                        onClick={handleShare}
                        disabled={!resultImage || isGenerating}
                        className={`
                          w-12 sm:w-auto sm:px-6 py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center
                          ${!resultImage || isGenerating
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                            : 'bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-blue-400 hover:border-blue-500/50'
                          }
                        `}
                        title="Share Image"
                     >
                       <i className="fa-solid fa-share-nodes sm:mr-2"></i>
                       <span className="hidden sm:inline">Share</span>
                     </button>
                 </div>
              </div>

              {/* Error Message */}
              {error === "QUOTA_EXCEEDED" ? (
                  <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl flex flex-col items-start gap-2 animate-shake">
                    <div className="flex items-center gap-2 font-bold">
                        <i className="fa-solid fa-triangle-exclamation text-lg"></i>
                        <span>Generation Failed: Quota Exceeded</span>
                    </div>
                    <p className="text-sm">You have exceeded your current API quota.</p>
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-red-800"
                    >
                        Renew Quota / Get API Key
                    </a>
                  </div>
              ) : error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl flex items-center animate-shake">
                   <i className="fa-solid fa-triangle-exclamation mr-3 text-lg"></i>
                   <div>
                     <p className="font-bold text-sm">Generation Failed</p>
                     <p className="text-xs mt-1">{error}</p>
                   </div>
                </div>
              )}
            </div>

            {/* Tools Sidebar (Right) */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex-1 flex flex-col shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-slate-200">Select Effect</h3>
                  <span className="text-xs bg-orange-900/50 text-orange-400 px-2 py-1 rounded-full font-medium border border-orange-900">
                    {EFFECTS_LIBRARY.length}
                  </span>
                </div>

                {/* 3-Column Grid for Effects */}
                <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1 custom-scrollbar max-h-[500px] lg:max-h-[calc(100vh-250px)] content-start">
                  {EFFECTS_LIBRARY.map((effect) => (
                    <EffectCard 
                      key={effect.id}
                      effect={effect}
                      isSelected={selectedEffectId === effect.id}
                      onClick={() => setSelectedEffectId(effect.id)}
                    />
                  ))}
                </div>
              </div>
              
              {/* MSME Badge (Small) */}
              <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center gap-3 text-slate-500 text-xs font-mono border border-slate-800">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="India" className="h-6 opacity-40 grayscale" />
                 <div>
                   <div className="font-bold text-slate-400">ASKFORWRITE DIGITAL</div>
                   <div>{APP_CONFIG.msmeRegistration}</div>
                 </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);