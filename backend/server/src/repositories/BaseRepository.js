/**
 * Repository pattern (SOLID: SRP + DIP).
 *
 * Services depend on this abstraction instead of Mongoose models directly, so
 * the persistence technology can be swapped without touching business logic.
 */
export class BaseRepository {
  /** @param {import("mongoose").Model} model */
  constructor(model) {
    this.model = model;
  }

  findById(id) {
    return this.model.findById(id);
  }

  findOne(filter) {
    return this.model.findOne(filter);
  }

  find(filter = {}) {
    return this.model.find(filter);
  }

  count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  create(data) {
    return this.model.create(data);
  }

  exists(filter) {
    return this.model.exists(filter);
  }
}
