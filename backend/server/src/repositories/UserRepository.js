import { BaseRepository } from "./BaseRepository.js";
import { User } from "../models/User.js";

export class UserRepository extends BaseRepository {
  constructor(model = User) {
    super(model);
  }

  findByEmailWithSecrets(email) {
    return this.model.findOne({ email }).select("+password +refreshTokens");
  }

  findByIdWithTokens(id) {
    return this.model.findById(id).select("+refreshTokens");
  }

  findByRefreshToken(token) {
    return this.model.findOne({ refreshTokens: token }).select("+refreshTokens");
  }
}

export const userRepository = new UserRepository();
