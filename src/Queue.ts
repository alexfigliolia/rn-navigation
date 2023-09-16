import type { Frame } from "./types";

export class Queue extends Array<Frame> {
  constructor(frames: Frame[] = []) {
    super();
    this.push(...frames);
  }

  public enqueue(frame: Frame) {
    if (this.length === 2) {
      return new Queue([...this.slice(0, 1), frame]);
    }
    return new Queue([...this, frame]);
  }

  public dequeue() {
    if (this.length < 2) {
      return this;
    }
    this.shift();
    return new Queue(this);
  }

  public poop() {
    if (this.length > 1) {
      this.pop();
      return new Queue(this);
    }
    return this;
  }
}
