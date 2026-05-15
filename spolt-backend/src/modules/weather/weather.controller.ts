import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('forecast')
  async getForecast(@Query('lat') latStr?: string, @Query('lon') lonStr?: string) {
    // Si no nos pasan latitud y longitud, usamos las coordenadas del centro de Madrid por defecto
    const lat = latStr ? parseFloat(latStr) : 40.4168;
    const lon = lonStr ? parseFloat(lonStr) : -3.7038;

    const forecast = await this.weatherService.getSevenDayForecast(lat, lon);
    
    if (!forecast || forecast.length === 0) {
      return { 
        available: false, 
        reason: 'weather_service_unavailable', 
        forecast: [] 
      };
    }

    return { available: true, forecast };
  }
}
