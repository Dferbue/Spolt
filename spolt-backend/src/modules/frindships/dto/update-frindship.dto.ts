import { PartialType } from '@nestjs/mapped-types';
import { CreateFrindshipDto } from './create-frindship.dto';

export class UpdateFrindshipDto extends PartialType(CreateFrindshipDto) {}
