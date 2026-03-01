import type { AppConfig } from "./config.js";
import type { WelcomeImageGenerator } from "./features/welcome/image-generator.js";
import type { CooldownRepository } from "./repositories/cooldown-repository.js";
import type { MemberProfileRepository } from "./repositories/member-profile-repository.js";

export interface RuntimeContext {
  config: AppConfig;
  welcomeImageService: WelcomeImageGenerator;
  cooldownRepository: CooldownRepository;
  memberProfileRepository: MemberProfileRepository;
}
