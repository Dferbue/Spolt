import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class WeatherService implements OnModuleInit {
  private readonly logger = new Logger(WeatherService.name);
  private municipios: any[] = [];

  // Se ejecuta al arrancar el servidor para precargar la lista de municipios de España
  async onModuleInit() {
    this.logger.log('Cargando lista maestra de municipios desde AEMET...');
    try {
      await this.loadMunicipios();
    } catch (error) {
      this.logger.warn('No se pudo cargar la lista de municipios, se usará Madrid por defecto.', error.message);
    }
  }

  // Descarga y almacena en memoria el catálogo masivo de municipios de AEMET con sus coordenadas
  private async loadMunicipios() {
    const apiKey = process.env.AEMET_API_KEY;
    if (!apiKey) return;

    // Pedimos el maestro de municipios
    const url = `https://opendata.aemet.es/opendata/api/maestro/municipios?api_key=${apiKey}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Error al conectar con maestro de AEMET');
    
    const val = await res.json();
    if (!val.datos) throw new Error('No se encontro URL de datos de municipios');

    // Descargamos el JSON masivo
    const resData = await fetch(val.datos);
    this.municipios = await resData.json();
    this.logger.log(`Cargados ${this.municipios.length} municipios en memoria.`);
  }

  // Devuelve el código INE del municipio español más cercano a las coordenadas dadas
  async getClosestMunicipality(userLat: number, userLon: number): Promise<string> {
    // Lazy load en caso de que haya fallado durante el inicio (e.g., variables de entorno no cargadas a tiempo)
    if (!this.municipios || this.municipios.length === 0) {
      try {
        await this.loadMunicipios();
      } catch (error) {
        this.logger.warn('Fallo lazy loading municipios, usando Madrid', error.message);
      }
    }

    if (!this.municipios || this.municipios.length === 0) {
      return '28079'; // Fallback a Madrid
    }

    let closestId = '28079';
    let minDistance = Infinity;

    for (const muni of this.municipios) {
      // Formateo de AEMET suele venir en string con comas (e.g. "42.84666")
      // A veces faltan, hay que tener cuidado
      if (!muni.latitud_dec || !muni.longitud_dec) continue;

      const mLat = parseFloat(muni.latitud_dec.toString().replace(',', '.'));
      const mLon = parseFloat(muni.longitud_dec.toString().replace(',', '.'));

      const dist = this.haversineDistance(userLat, userLon, mLat, mLon);
      if (dist < minDistance) {
        minDistance = dist;
        // El formato de ID viene como "id28079", hay que quitar el "id"
        closestId = muni.id.replace('id', '');
      }
    }

    return closestId;
  }

  // Fórmula matemática para calcular la distancia en kilómetros entre dos coordenadas de la Tierra
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  }

  // Maneja la petición en 2 pasos a AEMET y devuelve la previsión a 7 días de la ubicación
  async getSevenDayForecast(lat: number, lon: number) {
    const apiKey = process.env.AEMET_API_KEY;
    if (!apiKey) {
      throw new Error('AEMET_API_KEY no configurado en el archivo .env');
    }

    const municipioCode = await this.getClosestMunicipality(lat, lon);

    try {
      // Primera petición a AEMET: Solicita el acceso a los datos
      const aemetUrl = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${municipioCode}`;
      const response1 = await fetch(`${aemetUrl}?api_key=${apiKey}`, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response1.ok) {
        throw new Error(`Error en la API de AEMET: ${response1.status}`);
      }

      const authData = await response1.json();
      
      // Si AEMET devuelve 404 o clave inválida, el 'estado' será un error
      if (authData.estado === 401 || authData.estado === 429) {
        throw new Error(`AEMET Error: ${authData.descripcion}`);
      }
      
      if (!authData.datos) {
        throw new Error('La respuesta de AEMET no contiene la URL de los datos');
      }

      // Segunda petición: Desacargar el archivo JSON real desde la URL generada
      const response2 = await fetch(authData.datos);
      const rawWeatherData = await response2.json();

      // Transformamos los datos complejos al formato simple de tu frontend
      return this.transformAemetData(rawWeatherData[0]);

    } catch (error) {
      this.logger.error('Error al obtener datos de AEMET', error);
      throw error;
    }
  }

  // Filtra el JSON denso de AEMET quedándose solo con los máximos diarios de temperatura, lluvia y viento
  private transformAemetData(rawData: any) {
    const dias = rawData.prediccion.dia; // Array de los próximos 7 días (AEMET)
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    // Mapeamos los 7 días
    return dias.map((diaInfo: any) => {
      const d = new Date(diaInfo.fecha);
      
      // AEMET devuelve la probabilidad de lluvia por franjas horarias. Cogemos la mayor.
      const maxLluviaArr = diaInfo.probPrecipitacion
        .map((p: any) => (p.value !== '' ? Number(p.value) : 0));
      const maxLluvia = Math.max(...maxLluviaArr, 0);

      // Estado de cielo (cogemos el estado representativo, normalmente el primero disponible)
      const cieloRepresentativo = diaInfo.estadoCielo.find((c: any) => c.value !== '')?.value || '11';
      const descCielo = diaInfo.estadoCielo.find((c: any) => c.descripcion !== '')?.descripcion || 'Despejado';

      // Viento (cogemos la velocidad máxima del día)
      const maxVientoArr = diaInfo.viento?.map((v: any) => (v.velocidad !== '' ? Number(v.velocidad) : 0)) || [0];
      const maxViento = Math.max(...maxVientoArr, 0);

      return {
        date: diaInfo.fecha,
        dayName: dayNames[d.getDay()],
        dayNum: String(d.getDate()),
        icon: this.getAemetIcon(cieloRepresentativo),
        description: descCielo,
        tempMax: diaInfo.temperatura.maxima,
        tempMin: diaInfo.temperatura.minima,
        precipitation: maxLluvia,
        windSpeed: maxViento,
      };
    });
  }

  // Traduce los códigos de cielo de AEMET en emojis simples para el frontend
  private getAemetIcon(codigoCielo: string): string {
    if (!codigoCielo) return '⛅'; 
    // Elimina letras (ej. noche "n") para dejar solo el número base
    const baseCode = parseInt(codigoCielo.replace(/[a-zA-Z]/g, ''), 10);

    // Códigos oficiales AEMET simplificados
    if (baseCode === 11) return '☀️'; // Despejado
    if (baseCode >= 12 && baseCode <= 13) return '⛅'; // Poco nuboso
    if (baseCode >= 14 && baseCode <= 17) return '☁️';  // Nuboso / Cubierto
    if (baseCode >= 43 && baseCode <= 46) return '🌧️'; // Lluvia fuerte
    if (baseCode >= 23 && baseCode <= 26) return '🌦️'; // Lluvia moderada / Chubascos
    if (baseCode >= 51 && baseCode <= 54) return '⛈️'; // Tormenta
    if (baseCode >= 33 && baseCode <= 36) return '❄️'; // Nieve
    if (baseCode >= 71 && baseCode <= 74) return '❄️'; // Nieve fuerte
    if (baseCode >= 81 && baseCode <= 82) return '🌫️'; // Niebla
    
    return '⛅'; // Icono por defecto fallback
  }
}
