import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestEmailChangeDto {
  @IsEmail({}, { message: 'El formato del nuevo email no es válido' })
  @IsNotEmpty({ message: 'El nuevo email es obligatorio' })
  newEmail: string;
}
