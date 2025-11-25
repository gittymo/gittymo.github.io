import { Cache } from './containers.js'

class SpriteSet {
  #sprites = [];
  #animationFrameIndices = [];
  #currentFrameIndex = 0;
  #cache = new Cache();
  #loadPromise = null;
	#originX = 0;
	#originY = 0;

	static #DEG2RAD = Math.PI / 180.0;

  static async Create(spriteFilepathArray, animationFrameIndices = 1) {
    const spriteSet = new SpriteSet();
    await spriteSet.#initialize(spriteFilepathArray, animationFrameIndices);
    return spriteSet;
  }

  constructor() {
    // Private constructor - use SpriteSet.Create() instead
  }

  async #initialize(spriteFilepathArray, animationFrameIndices = 1) {
    // Make sure spriteFilepathArray is an array object, if not throw an error.
    if (!Array.isArray(spriteFilepathArray))
      throw Error("spriteFilepathArray is not an array.");
    // Make sure spriteFilepathArray has some values, if not throw an error.
    if (spriteFilepathArray.length === 0) throw Error("Empty array.");
    // Make sure all the elements in the array are strings, if they're not throw an error.
    const isString = (arrayValue) =>
      arrayValue instanceof String || typeof arrayValue === "string";
    if (!spriteFilepathArray.every(isString))
      throw Error("Not all elements are strings.");
    
    // Now we're going to attempt to load each of the sprites listed in the array.
    let loadPromises = [];
    spriteFilepathArray.forEach((filepath) => {
      let sprite = this.#cache.AddOrGet(filepath, (filepath) => {
        console.log(`Loading image from "${filepath}".`);
        let image = new Image();
        
        let loadPromise = new Promise((resolve, reject) => {
          image.onload = () => {
            console.log(`Successfully loaded: ${filepath}`);
            this.#sprites.push(image);
            resolve(image);
          };
          image.onerror = () => {
            console.error(`Failed to load sprite: ${filepath}`);
            reject(`Failed to load sprite: ${filepath}`);
          };
        });
        
        image.src = filepath;
        loadPromises.push(loadPromise);
        return image;
      });
    });
    
    // Wait for all images to load before setting animation frames
    await Promise.all(loadPromises);
    // Set the animation frames array to cover every sprite by default.
    this.AnimationFrames = [1, this.#sprites.length];
    console.log(`All ${this.#sprites.length} sprites loaded successfully`);
  }

  #getAnimationFrameIndex(value) {
    // Make sure the value is an integer.
    if (!Number.isInteger(value)) throw Error("Not an integer value.");
    // Make sure the value is greater than zero (0).
    if (value < 1)
      throw Error(
        "Animation frame must be a positive integer value greater than zero."
      );
    // Make sure the index we are going to return is within the range of the sprites array.
    if (value - 1 >= this.#sprites.length)
      throw Error(`Frame ${value} is not available.`);
    // Return the zero-offset index of the frame.
    return value - 1;
  }

  set AnimationFrames(value) {
    if (value === null || value === undefined)
      throw Error("Animation frames cannot be null or undefined.");
    if (Number.isInteger(value)) {
      this.#animationFrameIndices = [this.#getAnimationFrameIndex(value)];
    } else if (Array.isArray(value)) {
      // Make sure the array has some values.
      if (value.length === 0)
        throw Error(
          "Cannot accept an empty array as the animation frames list."
        );
      // Check all requested animation frames.
      let newAnimationFrames = [];
      value.forEach((frameIndex) => {
        newAnimationFrames.push(this.#getAnimationFrameIndex(frameIndex));
      });
      // If there are only two entries in the array, we can assume this is a range.
      if (newAnimationFrames.length == 2) {
        // Sort the existing values in ascending order.
        newAnimationFrames.sort((a, b) => a - b);
        const [a, b] = newAnimationFrames;
        // Now create a new array with an entry for every value between and inclusive of the two given.
        newAnimationFrames = Array.from(
          { length: b - a + 1 },
          (_, index) => a + index
        );
      }
			// Set the animation frames array to the new array.
    	this.#animationFrameIndices = newAnimationFrames;
    } else {
      // If the value is neither and integer or an array, throw an error.
      throw Error("Unexpected frames format.");
    }
    // Set the current frame index to the start of the array.
    this.#currentFrameIndex = 0;
  }

  set CurrentFrameIndex(value) {
    if (!Number.isInteger(value)) throw Error("Value is not an integer.");
    if (value < 1 || value > this.#sprites.length)
      throw Error("Frame is not available.");
    this.#currentFrameIndex = value - 1;
  }

  get CurrentFrameIndex() {
    return this.#currentFrameIndex + 1;
  }

  set Origin(value) {
    if (value === null || value === undefined)
      throw Error("Origin cannot be null or undefined.");
    if (!Array.isArray(value) || value.length !== 2)
      throw Error("Origin must be an array with exactly 2 elements [x, y].");
    if (typeof value[0] !== 'number' || typeof value[1] !== 'number')
      throw Error("Origin values must be numbers.");
    this.#originX = value[0];
    this.#originY = value[1];
  }

  get Origin() {
    return [this.#originX, this.#originY];
  }

	CurrentFrameImage() {
		return this.#sprites[this.#currentFrameIndex];
	}

  FrameCount() {
    return this.#sprites.length;
  }

  NextFrame() {
    this.#currentFrameIndex = (this.#currentFrameIndex + 1) % this.#sprites.length;
  }

  PreviousFrame() {
    this.#currentFrameIndex--;
    if (this.#currentFrameIndex < 0)
      this.#currentFrameIndex = this.#sprites.length - 1;
  }

	Draw(ctx, x, y, width = 0, height = 0) {
		if (ctx === null || ctx === undefined) return;
		if (!ctx instanceof CanvasRenderingContext2D) throw Error("Must render images to CanvasRenderingContext2D object.");
		const img = this.CurrentFrameImage();
		if (img === null || img === undefined) return;
		if (width <= 0) width = img.width;
		if (height <= 0) height = img.height;
		ctx.drawImage(img, x, y, width, height);
	}

	DrawRotated(ctx, x, y, degrees, width = 0, height = 0) {
		if (ctx === null || ctx === undefined) return;
		if (!ctx instanceof CanvasRenderingContext2D) throw Error("Must render images to CanvasRenderingContext2D object.");
		
		const img = this.CurrentFrameImage();
		if (img === null || img === undefined) return;
		
		// Use image dimensions if width/height not specified
		if (width <= 0) width = img.width;
		if (height <= 0) height = img.height;
		
		ctx.save();
		// Translate to the center point where we want to draw
		ctx.translate(x + this.#originX, y - this.#originY);

  }
}