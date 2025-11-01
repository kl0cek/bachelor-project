import { AppDataSource } from '../config/database';
import { CrewMember } from '../entities/CrewMember.entity';
import { Mission } from '../entities/Mission.entity';
import { NotFoundError } from '../utils/errors';
import { auditService } from './audit.service';

export interface CreateCrewDto {
  mission_id: string;
  user_id?: string;
  name: string;
  role?: string;
  email?: string;
}

class CrewService {
  private crewRepository = AppDataSource.getRepository(CrewMember);
  private missionRepository = AppDataSource.getRepository(Mission);

  async getByMission(missionId: string): Promise<CrewMember[]> {
    return await this.crewRepository.find({
      where: { mission_id: missionId },
      relations: ['user'],
      order: { name: 'ASC' },
    });
  }

  async getById(id: string): Promise<CrewMember> {
    const crew = await this.crewRepository.findOne({
      where: { id },
      relations: ['mission', 'user'],
    });

    if (!crew) {
      throw new NotFoundError('Crew member not found');
    }

    return crew;
  }

  async create(data: CreateCrewDto, userId: string): Promise<CrewMember> {
    // Verify mission exists
    const mission = await this.missionRepository.findOne({
      where: { id: data.mission_id },
    });

    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    const crew = this.crewRepository.create(data);
    const saved = await this.crewRepository.save(crew);

    await auditService.log({
      userId,
      action: 'add_crew_member',
      resourceType: 'crew_member',
      resourceId: saved.id,
      changes: data,
    });

    return saved;
  }

  async update(
    id: string,
    data: Partial<CreateCrewDto>,
    userId: string
  ): Promise<CrewMember> {
    const crew = await this.getById(id);

    Object.assign(crew, data);
    const updated = await this.crewRepository.save(crew);

    await auditService.log({
      userId,
      action: 'update_crew_member',
      resourceType: 'crew_member',
      resourceId: id,
      changes: data,
    });

    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const crew = await this.getById(id);

    await this.crewRepository.remove(crew);

    await auditService.log({
      userId,
      action: 'remove_crew_member',
      resourceType: 'crew_member',
      resourceId: id,
      changes: crew,
    });
  }
}

export const crewService = new CrewService();
