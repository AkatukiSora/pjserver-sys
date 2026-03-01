export interface MemberProfile {
  userID: string;
  joinedAt: number;
}

export interface MemberProfileRepository {
  findByUserID(userID: string): Promise<MemberProfile | null>;
  save(profile: MemberProfile): Promise<void>;
}

export class InMemoryMemberProfileRepository
  implements MemberProfileRepository
{
  private readonly profiles = new Map<string, MemberProfile>();

  async findByUserID(userID: string): Promise<MemberProfile | null> {
    return this.profiles.get(userID) ?? null;
  }

  async save(profile: MemberProfile): Promise<void> {
    this.profiles.set(profile.userID, profile);
  }
}
