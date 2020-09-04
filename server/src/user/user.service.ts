import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserSO } from './user.entity';
import { UserDTO } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  login = async (data: UserDTO): Promise<UserSO> => {
    const { email, password } = data;
    const user = await this.userRepository.findOne({ email });
    if (!user || !user.comparePassword(password)) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user.sanitizeObject();
  };

  register = async (data: UserDTO): Promise<UserSO> => {
    const { email } = data;
    let user = await this.userRepository.findOne({ email });
    if (user) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    } else {
      user = await this.userRepository.create(data);
      await this.userRepository.save(user);
      return user.sanitizeObject();
    }
  };

  getAllUsers = async (): Promise<UserSO[]> => {
    const users = await this.userRepository.find();
    return users.map(user => user.sanitizeObject());
  };
}